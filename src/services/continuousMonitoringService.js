/**
 * Enhanced Contiinterface SyncJob {
  id: string;
  tenantId: string;
  cloudProvider: 'azure' | 'aws' | 'gcp' | 'oracle';
  startTime: string;
  endTime?: string;
  status: 'running' | 'success' | 'failed';
  recordsIngested?: number;
  syncDuration?: number;
  lastSuccessfulSync?: string;
  errorMessage?: string;
  jobId?: string;
  metadata?: Record<string, any>;ing Service
 * Implements Azure Functions Timer Trigger pattern for automated data ingestion
 * and comprehensive sync status tracking for multi-cloud environments
 */
import { CosmosClient } from '@azure/cosmos';
import { MultiEnvironmentService } from './multiEnvironmentService';
// Create an instance of the service - will be properly initialized with cosmos client
const multiEnvironmentService = new MultiEnvironmentService(null);
// Cosmos DB configuration with secure authentication
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    key: import.meta.env.VITE_COSMOS_DB_KEY || '',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
class ContinuousMonitoringService {
    constructor() {
        this.isRunning = false;
        this.client = new CosmosClient({
            endpoint: cosmosConfig.endpoint,
            key: cosmosConfig.key,
        });
        const database = this.client.database(cosmosConfig.databaseId);
        this.syncStatusContainer = database.container('sync-status');
        this.schedulerContainer = database.container('scheduler-config');
        // Initialize the automated scheduling
        this.initializeScheduler();
    }
    /**
     * Initialize the automated scheduler for continuous monitoring
     */
    async initializeScheduler() {
        // In a production environment, this would integrate with Azure Functions Timer Trigger
        // or another cloud-native scheduler. For now, we'll implement a local scheduler.
        if (typeof window === 'undefined') {
            // Only run in server environment
            setInterval(async () => {
                await this.checkAndExecuteScheduledSyncs();
            }, 60000); // Check every minute
        }
    }
    /**
     * Check for and execute scheduled syncs
     */
    async checkAndExecuteScheduledSyncs() {
        if (this.isRunning)
            return;
        try {
            this.isRunning = true;
            const configs = await this.getActiveSchedulerConfigs();
            for (const config of configs) {
                if (this.shouldExecuteSync(config)) {
                    await this.executeTenantSync(config.tenantId, config.cloudProviders);
                    await this.updateSchedulerNextRun(config.id);
                }
            }
        }
        catch (error) {
            console.error('Error in scheduled sync execution:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Get all active scheduler configurations
     */
    async getActiveSchedulerConfigs() {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.enabled = true',
                parameters: []
            };
            const { resources } = await this.schedulerContainer.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching scheduler configs:', error);
            return [];
        }
    }
    /**
     * Determine if a sync should be executed based on cron expression
     */
    shouldExecuteSync(config) {
        if (!config.nextRun)
            return true;
        const nextRunTime = new Date(config.nextRun);
        const now = new Date();
        return now >= nextRunTime;
    }
    /**
     * Execute synchronization for a specific tenant and cloud providers
     */
    async executeTenantSync(tenantId, cloudProviders) {
        const syncResults = [];
        for (const provider of cloudProviders) {
            const syncStatus = await this.executeSingleProviderSync(tenantId, provider);
            syncResults.push(syncStatus);
        }
        return syncResults;
    }
    /**
     * Execute sync for a single cloud provider
     */
    async executeSingleProviderSync(tenantId, provider) {
        const startTime = new Date().toISOString();
        const syncStatus = {
            id: `sync-${tenantId}-${provider}-${Date.now()}`,
            tenantId,
            cloudProvider: provider,
            startTime,
            status: 'running',
            createdAt: startTime,
            updatedAt: startTime
        };
        // Save initial status
        await this.saveSyncStatus(syncStatus);
        try {
            // Execute the actual data ingestion using the existing multiEnvironmentService
            let recordsIngested = 0;
            switch (provider) {
                case 'azure':
                    recordsIngested = await this.syncAzureData(tenantId);
                    break;
                case 'aws':
                    recordsIngested = await this.syncAWSData(tenantId);
                    break;
                case 'gcp':
                    recordsIngested = await this.syncGCPData(tenantId);
                    break;
                case 'oracle':
                    recordsIngested = await this.syncOracleData(tenantId);
                    break;
            }
            const endTime = new Date().toISOString();
            const syncDuration = new Date(endTime).getTime() - new Date(startTime).getTime();
            // Update status with success
            syncStatus.endTime = endTime;
            syncStatus.status = 'success';
            syncStatus.recordsIngested = recordsIngested;
            syncStatus.lastSuccessfulSync = endTime;
            syncStatus.syncDuration = syncDuration;
            syncStatus.updatedAt = endTime;
        }
        catch (error) {
            const endTime = new Date().toISOString();
            const syncDuration = new Date(endTime).getTime() - new Date(startTime).getTime();
            // Update status with failure
            syncStatus.endTime = endTime;
            syncStatus.status = 'failed';
            syncStatus.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            syncStatus.syncDuration = syncDuration;
            syncStatus.updatedAt = endTime;
            console.error(`Sync failed for ${provider} in tenant ${tenantId}:`, error);
        }
        // Save final status
        await this.saveSyncStatus(syncStatus);
        return syncStatus;
    }
    /**
     * Sync Azure environment data
     */
    async syncAzureData(tenantId) {
        try {
            // Use existing dummyMultiEnvironmentService to sync Azure data
            const azureData = await multiEnvironmentService.getConsolidatedDashboard(tenantId);
            // Process and store the data
            return azureData ? 1 : 0;
        }
        catch (error) {
            console.error('Azure sync error:', error);
            throw error;
        }
    }
    /**
     * Sync AWS environment data
     */
    async syncAWSData(tenantId) {
        try {
            // Use existing dummyMultiEnvironmentService to sync AWS data
            const awsData = await multiEnvironmentService.getConsolidatedDashboard(tenantId);
            // Process and store the data
            return awsData ? 1 : 0;
        }
        catch (error) {
            console.error('AWS sync error:', error);
            throw error;
        }
    }
    /**
     * Sync GCP environment data
     */
    async syncGCPData(tenantId) {
        try {
            // Use existing dummyMultiEnvironmentService to sync GCP data
            const gcpData = await multiEnvironmentService.getConsolidatedDashboard(tenantId);
            // Process and store the data
            return gcpData ? 1 : 0;
        }
        catch (error) {
            console.error('GCP sync error:', error);
            throw error;
        }
    }
    /**
     * Sync Oracle environment data
     */
    async syncOracleData(tenantId) {
        try {
            // Use existing dummyMultiEnvironmentService to sync Oracle data
            const oracleData = await multiEnvironmentService.getConsolidatedDashboard(tenantId);
            // Process and store the data
            return oracleData ? 1 : 0;
        }
        catch (error) {
            console.error('Oracle sync error:', error);
            throw error;
        }
    }
    /**
     * Save sync status to database
     */
    async saveSyncStatus(syncStatus) {
        try {
            await this.syncStatusContainer.items.upsert(syncStatus);
        }
        catch (error) {
            console.error('Error saving sync status:', error);
        }
    }
    /**
     * Get sync status summary for all cloud providers for a tenant
     */
    async getCloudSyncSummary(tenantId) {
        try {
            const cloudProviders = ['azure', 'aws', 'gcp', 'oracle'];
            const summaries = [];
            for (const provider of cloudProviders) {
                const summary = await this.getProviderSyncSummary(tenantId, provider);
                if (summary) {
                    summaries.push(summary);
                }
            }
            return summaries;
        }
        catch (error) {
            console.error('Error fetching sync summaries:', error);
            return [];
        }
    }
    /**
     * Get sync summary for a specific cloud provider
     */
    async getProviderSyncSummary(tenantId, provider) {
        try {
            // Get recent sync statuses for this provider
            const querySpec = {
                query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId 
            AND c.cloudProvider = @provider 
          ORDER BY c.startTime DESC
        `,
                parameters: [
                    { name: '@tenantId', value: tenantId },
                    { name: '@provider', value: provider }
                ]
            };
            const { resources } = await this.syncStatusContainer.items.query(querySpec).fetchAll();
            const recentSyncs = resources;
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
                }
                else {
                    break;
                }
            }
            // Calculate average sync duration for successful syncs
            const successfulSyncs = recentSyncs.filter(sync => sync.status === 'success' && sync.syncDuration);
            const averageSyncDuration = successfulSyncs.length > 0
                ? successfulSyncs.reduce((sum, sync) => sum + (sync.syncDuration || 0), 0) / successfulSyncs.length
                : 0;
            // Determine overall health status
            let status = 'healthy';
            if (consecutiveFailures >= 3) {
                status = 'error';
            }
            else if (consecutiveFailures > 0 || !lastSuccessfulSync) {
                status = 'warning';
            }
            return {
                tenantId,
                cloudProvider: provider,
                lastSyncTime: lastSync.startTime,
                lastSuccessfulSync: lastSuccessfulSync?.lastSuccessfulSync || 'Never',
                status,
                consecutiveFailures,
                recordsIngested: lastSuccessfulSync?.recordsIngested || 0,
                averageSyncDuration
            };
        }
        catch (error) {
            console.error(`Error fetching sync summary for ${provider}:`, error);
            return null;
        }
    }
    /**
     * Update scheduler configuration
     */
    async updateSchedulerConfig(tenantId, config) {
        try {
            const existingConfig = await this.getSchedulerConfig(tenantId);
            const updatedConfig = {
                ...existingConfig,
                ...config,
                tenantId,
                updatedAt: new Date().toISOString()
            };
            if (!existingConfig) {
                updatedConfig.id = `scheduler-${tenantId}`;
                updatedConfig.createdAt = updatedConfig.updatedAt;
            }
            await this.schedulerContainer.items.upsert(updatedConfig);
        }
        catch (error) {
            console.error('Error updating scheduler config:', error);
            throw error;
        }
    }
    /**
     * Get scheduler configuration for a tenant
     */
    async getSchedulerConfig(tenantId) {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
                parameters: [{ name: '@tenantId', value: tenantId }]
            };
            const { resources } = await this.schedulerContainer.items.query(querySpec).fetchAll();
            return resources.length > 0 ? resources[0] : null;
        }
        catch (error) {
            console.error('Error fetching scheduler config:', error);
            return null;
        }
    }
    /**
     * Update next run time for scheduler
     */
    async updateSchedulerNextRun(schedulerId) {
        try {
            const { resource: config } = await this.schedulerContainer.item(schedulerId, schedulerId).read();
            if (config) {
                // Calculate next run time based on cron expression
                // For simplicity, adding 24 hours for daily schedule
                const nextRun = new Date();
                nextRun.setDate(nextRun.getDate() + 1);
                config.lastRun = new Date().toISOString();
                config.nextRun = nextRun.toISOString();
                config.updatedAt = new Date().toISOString();
                await this.schedulerContainer.items.upsert(config);
            }
        }
        catch (error) {
            console.error('Error updating scheduler next run:', error);
        }
    }
    /**
     * Manually trigger sync for a tenant
     */
    async triggerManualSync(tenantId, cloudProviders) {
        const providers = cloudProviders || ['azure', 'aws', 'gcp', 'oracle'];
        return this.executeTenantSync(tenantId, providers);
    }
    /**
     * Get recent sync history for a tenant
     */
    async getSyncHistory(tenantId, limit = 20) {
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
            return resources;
        }
        catch (error) {
            console.error('Error fetching sync history:', error);
            return [];
        }
    }
}
// Export service instance
export const continuousMonitoringService = new ContinuousMonitoringService();
// Export types
export { ContinuousMonitoringService };
