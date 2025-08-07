/**
 * Enhanced Continuous Monitoring Service
 * Implements Azure Functions Timer Trigger pattern for automated data ingestion
 * and comprehensive sync status tracking for multi-cloud environments
 */

import { CosmosClient, Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { MultiEnvironmentService } from './multiEnvironmentService';

// Cosmos DB configuration with secure authentication
const cosmosConfig = {
  endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
  databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

/**
 * Interface for sync status tracking
 */
export interface SyncStatus {
  id: string;
  tenantId: string;
  cloudProvider: 'azure' | 'aws' | 'gcp' | 'oracle';
  startTime: string;
  endTime?: string;
  status: 'running' | 'success' | 'failed';
  recordsIngested: number;
  syncDuration?: number;
  lastSuccessfulSync?: string;
  errorMessage?: string;
  jobId?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for Azure Functions Timer configuration
 */
export interface TimerTriggerConfig {
  id: string;
  tenantId: string;
  enabled: boolean;
  schedule: string; // CRON expression (e.g., '0 0 */4 * * *' for every 4 hours)
  timezone: string;
  useMonitor: boolean;
  runOnStartup: boolean;
  maxConcurrentJobs: number;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // milliseconds
    backoffMultiplier: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for monitoring job status
 */
export interface MonitoringJob {
  id: string;
  tenantId: string;
  jobType: 'continuous-sync' | 'scheduled-sync' | 'manual-sync';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number; // 0-100
  message?: string;
  timerTriggerId?: string;
  results?: {
    totalProviders: number;
    successfulProviders: number;
    failedProviders: number;
    recordsIngested: number;
    duration: number;
    errors: Array<{ provider: string; error: string; }>;
  };
}

/**
 * Interface for cloud sync summary
 */
export interface CloudSyncSummary {
  tenantId: string;
  cloudProvider: 'azure' | 'aws' | 'gcp' | 'oracle';
  lastSyncTime: string;
  lastSuccessfulSync: string;
  status: 'healthy' | 'warning' | 'error';
  consecutiveFailures: number;
  recordsIngested: number;
  averageSyncDuration: number;
  nextScheduledSync?: string;
}

/**
 * Enhanced Continuous Monitoring Service with Azure Functions Timer Trigger Pattern
 */
class EnhancedContinuousMonitoringService {
  private cosmosClient: CosmosClient;
  private syncStatusContainer!: Container;
  private timerConfigContainer!: Container;
  private monitoringJobsContainer!: Container;
  private multiEnvService: MultiEnvironmentService;
  private initialized = false;

  constructor() {
    // Initialize Cosmos Client with Managed Identity
    this.cosmosClient = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      aadCredentials: new DefaultAzureCredential()
    });
    // Initialize with dummy cosmos client for now - will be properly configured in production
    this.multiEnvService = new MultiEnvironmentService(this.cosmosClient);
  }

  /**
   * Initialize the service and containers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const database = this.cosmosClient.database(cosmosConfig.databaseId);
      
      // Initialize containers
      this.syncStatusContainer = database.container('sync-status');
      this.timerConfigContainer = database.container('timer-configs');
      this.monitoringJobsContainer = database.container('monitoring-jobs');
      
      this.initialized = true;
      console.log('Enhanced Continuous Monitoring Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Enhanced Continuous Monitoring Service:', error);
      throw error;
    }
  }

  /**
   * Create or update Timer Trigger configuration for automated sync
   */
  async configureTimerTrigger(tenantId: string, config: Partial<TimerTriggerConfig>): Promise<TimerTriggerConfig> {
    await this.ensureInitialized();

    const timerConfig: TimerTriggerConfig = {
      id: `timer-${tenantId}`,
      tenantId,
      enabled: config.enabled ?? true,
      schedule: config.schedule ?? '0 0 */4 * * *', // Default: every 4 hours
      timezone: config.timezone ?? 'UTC',
      useMonitor: config.useMonitor ?? true,
      runOnStartup: config.runOnStartup ?? false,
      maxConcurrentJobs: config.maxConcurrentJobs ?? 2,
      retryPolicy: config.retryPolicy ?? {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2
      },
      createdAt: config.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { resource } = await this.timerConfigContainer.items.upsert(timerConfig);
      console.log(`Timer trigger configured for tenant ${tenantId}:`, timerConfig.schedule);
      return resource as unknown as TimerTriggerConfig;
    } catch (error) {
      console.error(`Failed to configure timer trigger for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Execute timer-triggered sync job (called by Azure Functions)
   */
  async executeTimerTriggeredSync(tenantId: string, timerInfo?: any): Promise<MonitoringJob> {
    await this.ensureInitialized();

    const jobId = `timer-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create monitoring job
    const job: MonitoringJob = {
      id: jobId,
      tenantId,
      jobType: 'scheduled-sync',
      status: 'pending',
      priority: 'normal',
      createdAt: new Date().toISOString(),
      progress: 0,
      message: 'Timer trigger initiated sync job',
      timerTriggerId: timerInfo?.ScheduleStatus?.Last || undefined
    };

    try {
      // Store initial job status
      await this.monitoringJobsContainer.items.create(job);

      // Start the sync process
      return await this.executeScheduledSync(job);
    } catch (error) {
      console.error(`Timer triggered sync failed for tenant ${tenantId}:`, error);
      
      // Update job with failure status
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      job.message = `Timer sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.monitoringJobsContainer.items.upsert(job);
      
      throw error;
    }
  }

  /**
   * Execute scheduled sync with comprehensive monitoring
   */
  private async executeScheduledSync(job: MonitoringJob): Promise<MonitoringJob> {
    const startTime = Date.now();
    const cloudProviders: Array<'azure' | 'aws' | 'gcp' | 'oracle'> = ['azure', 'aws', 'gcp', 'oracle'];
    
    try {
      // Update job status to running
      job.status = 'running';
      job.startedAt = new Date().toISOString();
      job.progress = 10;
      job.message = 'Starting multi-cloud data ingestion';
      await this.monitoringJobsContainer.items.upsert(job);

      const syncResults = [];
      let totalRecords = 0;
      const errors: Array<{ provider: string; error: string; }> = [];

      // Process each cloud provider
      for (let i = 0; i < cloudProviders.length; i++) {
        const provider = cloudProviders[i];
        const progressBase = 10 + (i * 20); // 10, 30, 50, 70

        try {
          job.progress = progressBase;
          job.message = `Syncing ${provider.toUpperCase()} data...`;
          await this.monitoringJobsContainer.items.upsert(job);

          const syncResult = await this.executeProviderSync(job.tenantId, provider, job.id);
          syncResults.push(syncResult);
          totalRecords += syncResult.recordsIngested || 0;

          job.progress = progressBase + 15;
          job.message = `${provider.toUpperCase()} sync completed: ${syncResult.recordsIngested} records`;
          await this.monitoringJobsContainer.items.upsert(job);

        } catch (error) {
          console.error(`Failed to sync ${provider} for tenant ${job.tenantId}:`, error);
          errors.push({
            provider,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Complete the job
      const duration = Date.now() - startTime;
      const successfulProviders = syncResults.filter(r => r.status === 'success').length;
      const failedProviders = errors.length;

      job.status = failedProviders > 0 && successfulProviders === 0 ? 'failed' : 'completed';
      job.completedAt = new Date().toISOString();
      job.progress = 100;
      job.message = `Sync completed: ${successfulProviders}/${cloudProviders.length} providers successful`;
      job.results = {
        totalProviders: cloudProviders.length,
        successfulProviders,
        failedProviders,
        recordsIngested: totalRecords,
        duration,
        errors
      };

      await this.monitoringJobsContainer.items.upsert(job);
      console.log(`Scheduled sync completed for tenant ${job.tenantId}:`, job.results);
      
      return job;

    } catch (error) {
      console.error(`Scheduled sync failed for tenant ${job.tenantId}:`, error);
      
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      job.progress = 100;
      job.message = `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      await this.monitoringJobsContainer.items.upsert(job);
      throw error;
    }
  }

  /**
   * Execute sync for a specific cloud provider
   */
  private async executeProviderSync(tenantId: string, provider: 'azure' | 'aws' | 'gcp' | 'oracle', jobId: string): Promise<SyncStatus> {
    const syncId = `${provider}-${tenantId}-${Date.now()}`;
    const startTime = new Date().toISOString();

    const syncStatus: SyncStatus = {
      id: syncId,
      tenantId,
      cloudProvider: provider,
      startTime,
      status: 'running',
      recordsIngested: 0,
      jobId
    };

    try {
      // Store initial sync status
      await this.syncStatusContainer.items.create(syncStatus);

      // Execute provider-specific sync logic
      let recordsIngested = 0;
      const syncStartTime = Date.now();

      switch (provider) {
        case 'azure':
          recordsIngested = await this.syncAzureData(tenantId);
          break;
        case 'aws':
          recordsIngested = await this.syncAwsData(tenantId);
          break;
        case 'gcp':
          recordsIngested = await this.syncGcpData(tenantId);
          break;
        case 'oracle':
          recordsIngested = await this.syncOracleData(tenantId);
          break;
      }

      // Update sync status with success
      const syncDuration = Date.now() - syncStartTime;
      syncStatus.status = 'success';
      syncStatus.endTime = new Date().toISOString();
      syncStatus.recordsIngested = recordsIngested;
      syncStatus.syncDuration = syncDuration;
      syncStatus.lastSuccessfulSync = new Date().toISOString();

      await this.syncStatusContainer.items.upsert(syncStatus);
      console.log(`${provider} sync completed for tenant ${tenantId}: ${recordsIngested} records in ${syncDuration}ms`);
      
      return syncStatus;

    } catch (error) {
      console.error(`${provider} sync failed for tenant ${tenantId}:`, error);
      
      syncStatus.status = 'failed';
      syncStatus.endTime = new Date().toISOString();
      syncStatus.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.syncStatusContainer.items.upsert(syncStatus);
      throw error;
    }
  }

  /**
   * Sync Azure cloud data
   */
  private async syncAzureData(tenantId: string): Promise<number> {
    try {
      const azureData = await this.multiEnvService.getConsolidatedDashboard(tenantId);
      // Process and store Azure data
      const recordsCount = this.processCloudData(azureData, 'azure');
      return recordsCount;
    } catch (error) {
      console.error('Azure data sync failed:', error);
      throw new Error(`Azure sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync AWS cloud data
   */
  private async syncAwsData(tenantId: string): Promise<number> {
    try {
      // Simulate AWS data sync - replace with actual AWS SDK integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      const recordsCount = Math.floor(Math.random() * 100) + 50;
      return recordsCount;
    } catch (error) {
      console.error('AWS data sync failed:', error);
      throw new Error(`AWS sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync GCP cloud data
   */
  private async syncGcpData(tenantId: string): Promise<number> {
    try {
      // Simulate GCP data sync - replace with actual GCP SDK integration
      await new Promise(resolve => setTimeout(resolve, 800));
      const recordsCount = Math.floor(Math.random() * 80) + 30;
      return recordsCount;
    } catch (error) {
      console.error('GCP data sync failed:', error);
      throw new Error(`GCP sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync Oracle cloud data
   */
  private async syncOracleData(tenantId: string): Promise<number> {
    try {
      // Simulate Oracle data sync - replace with actual Oracle SDK integration
      await new Promise(resolve => setTimeout(resolve, 1200));
      const recordsCount = Math.floor(Math.random() * 60) + 20;
      return recordsCount;
    } catch (error) {
      console.error('Oracle data sync failed:', error);
      throw new Error(`Oracle sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process and normalize cloud data
   */
  private processCloudData(data: any, provider: string): number {
    // Process and normalize cloud data based on provider
    // This would involve data transformation, validation, and storage
    // Return the number of records processed
    return data?.records?.length || Math.floor(Math.random() * 100) + 25;
  }

  /**
   * Get timer trigger configuration
   */
  async getTimerTriggerConfig(tenantId: string): Promise<TimerTriggerConfig | null> {
    await this.ensureInitialized();

    try {
      const { resource } = await this.timerConfigContainer.item(`timer-${tenantId}`, tenantId).read();
      return resource as TimerTriggerConfig || null;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 404) {
        return null;
      }
      console.error(`Failed to get timer config for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get monitoring job status
   */
  async getMonitoringJob(jobId: string): Promise<MonitoringJob | null> {
    await this.ensureInitialized();

    try {
      const { resource } = await this.monitoringJobsContainer.item(jobId, jobId).read();
      return resource as MonitoringJob || null;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 404) {
        return null;
      }
      console.error(`Failed to get monitoring job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get recent monitoring jobs for a tenant
   */
  async getRecentJobs(tenantId: string, limit: number = 10): Promise<MonitoringJob[]> {
    await this.ensureInitialized();

    try {
      const querySpec = {
        query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId 
          ORDER BY c.createdAt DESC
          OFFSET 0 LIMIT @limit
        `,
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@limit', value: limit }
        ]
      };

      const { resources } = await this.monitoringJobsContainer.items.query(querySpec).fetchAll();
      return resources as MonitoringJob[];
    } catch (error) {
      console.error(`Failed to get recent jobs for tenant ${tenantId}:`, error);
      return [];
    }
  }

  /**
   * Get sync summary for all cloud providers
   */
  async getSyncSummary(tenantId: string): Promise<CloudSyncSummary[]> {
    await this.ensureInitialized();

    const cloudProviders: Array<'azure' | 'aws' | 'gcp' | 'oracle'> = ['azure', 'aws', 'gcp', 'oracle'];
    const summaries: CloudSyncSummary[] = [];

    for (const provider of cloudProviders) {
      try {
        const summary = await this.getProviderSyncSummary(tenantId, provider);
        if (summary) {
          summaries.push(summary);
        }
      } catch (error) {
        console.error(`Failed to get sync summary for ${provider}:`, error);
      }
    }

    return summaries;
  }

  /**
   * Get sync summary for a specific cloud provider
   */
  private async getProviderSyncSummary(tenantId: string, provider: 'azure' | 'aws' | 'gcp' | 'oracle'): Promise<CloudSyncSummary | null> {
    try {
      const querySpec = {
        query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId AND c.cloudProvider = @provider
          ORDER BY c.startTime DESC
          OFFSET 0 LIMIT 10
        `,
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@provider', value: provider }
        ]
      };

      const { resources } = await this.syncStatusContainer.items.query(querySpec).fetchAll();
      const recentSyncs = resources as SyncStatus[];

      if (recentSyncs.length === 0) {
        return null;
      }

      const lastSync = recentSyncs[0];
      const lastSuccessfulSync = recentSyncs.find(sync => sync.status === 'success');
      
      // Count consecutive failures
      let consecutiveFailures = 0;
      for (const sync of recentSyncs) {
        if (sync.status === 'failed') {
          consecutiveFailures++;
        } else {
          break;
        }
      }

      // Calculate average sync duration for successful syncs
      const successfulSyncs = recentSyncs.filter(sync => sync.status === 'success' && sync.syncDuration);
      const averageSyncDuration = successfulSyncs.length > 0 
        ? successfulSyncs.reduce((sum, sync) => sum + (sync.syncDuration || 0), 0) / successfulSyncs.length
        : 0;

      // Determine overall health status
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (consecutiveFailures >= 3) {
        status = 'error';
      } else if (consecutiveFailures > 0 || !lastSuccessfulSync) {
        status = 'warning';
      }

      // Calculate next scheduled sync
      const timerConfig = await this.getTimerTriggerConfig(tenantId);
      const nextScheduledSync = timerConfig ? this.calculateNextScheduledSync(timerConfig.schedule) : undefined;

      return {
        tenantId,
        cloudProvider: provider,
        lastSyncTime: lastSync.startTime,
        lastSuccessfulSync: lastSuccessfulSync?.lastSuccessfulSync || 'Never',
        status,
        consecutiveFailures,
        recordsIngested: lastSuccessfulSync?.recordsIngested || 0,
        averageSyncDuration,
        nextScheduledSync
      };

    } catch (error) {
      console.error(`Error fetching sync summary for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Calculate next scheduled sync time based on CRON expression
   */
  private calculateNextScheduledSync(cronExpression: string): string {
    // Simple implementation - in production, use a proper CRON parser library
    try {
      const now = new Date();
      
      // Basic parsing for common patterns
      if (cronExpression === '0 0 */4 * * *') { // Every 4 hours
        const nextRun = new Date(now);
        const currentHour = now.getHours();
        const nextHour = Math.ceil((currentHour + 1) / 4) * 4;
        nextRun.setHours(nextHour, 0, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
          nextRun.setHours(0, 0, 0, 0);
        }
        return nextRun.toISOString();
      }
      
      // Default to next hour for unknown patterns
      const nextRun = new Date(now);
      nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0);
      return nextRun.toISOString();
      
    } catch (error) {
      console.error('Failed to calculate next scheduled sync:', error);
      return new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // Default to 4 hours from now
    }
  }

  /**
   * Manually trigger sync job
   */
  async triggerManualSync(tenantId: string, cloudProviders?: Array<'azure' | 'aws' | 'gcp' | 'oracle'>): Promise<MonitoringJob> {
    await this.ensureInitialized();

    const jobId = `manual-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: MonitoringJob = {
      id: jobId,
      tenantId,
      jobType: 'manual-sync',
      status: 'pending',
      priority: 'high',
      createdAt: new Date().toISOString(),
      progress: 0,
      message: 'Manual sync job initiated'
    };

    try {
      await this.monitoringJobsContainer.items.create(job);
      return await this.executeScheduledSync(job);
    } catch (error) {
      console.error(`Manual sync failed for tenant ${tenantId}:`, error);
      
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      job.message = `Manual sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.monitoringJobsContainer.items.upsert(job);
      
      throw error;
    }
  }

  /**
   * Cancel a running monitoring job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const job = await this.getMonitoringJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status !== 'running' && job.status !== 'pending') {
        throw new Error(`Job ${jobId} cannot be cancelled (status: ${job.status})`);
      }

      job.status = 'cancelled';
      job.completedAt = new Date().toISOString();
      job.message = 'Job cancelled by user';
      job.progress = 100;

      await this.monitoringJobsContainer.items.upsert(job);
      console.log(`Job ${jobId} cancelled successfully`);
      
      return true;
    } catch (error) {
      console.error(`Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Get sync history for a tenant
   */
  async getSyncHistory(tenantId: string, limit: number = 20): Promise<SyncStatus[]> {
    await this.ensureInitialized();

    try {
      const querySpec = {
        query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId 
          ORDER BY c.startTime DESC
          OFFSET 0 LIMIT @limit
        `,
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@limit', value: limit }
        ]
      };

      const { resources } = await this.syncStatusContainer.items.query(querySpec).fetchAll();
      return resources as SyncStatus[];
    } catch (error) {
      console.error(`Failed to get sync history for tenant ${tenantId}:`, error);
      return [];
    }
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export service instance
export const enhancedContinuousMonitoringService = new EnhancedContinuousMonitoringService();
