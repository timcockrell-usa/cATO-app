/**
 * Enhanced Continuous Monitoring Service
 * Implements automated data ingestion, scheduling, and live status tracking
 * Uses Azure Timer Functions approach with Cosmos DB storage
 */
import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
// Cosmos DB configuration with Managed Identity
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
// Initialize Cosmos client with Managed Identity (Azure best practice)
const client = new CosmosClient({
    endpoint: cosmosConfig.endpoint,
    aadCredentials: new DefaultAzureCredential(),
    connectionPolicy: {
        enableEndpointDiscovery: false,
        requestTimeout: 30000,
        retryOptions: {
            maxRetryAttemptCount: 3,
            fixedRetryIntervalInMilliseconds: 1000,
            maxWaitTimeInSeconds: 30
        }
    },
    consistencyLevel: 'Session'
});
class EnhancedContinuousMonitoringService {
    constructor() {
        this.isInitialized = false;
        this.initializeContainers();
    }
    /**
     * Initialize Cosmos DB containers with proper error handling
     */
    async initializeContainers() {
        try {
            this.database = client.database(cosmosConfig.databaseId);
            // Create containers with appropriate partition keys and indexing
            const containerConfigs = [
                { id: 'sync-jobs', partitionKey: '/tenantId' },
                { id: 'sync-configurations', partitionKey: '/tenantId' },
                { id: 'environment-status', partitionKey: '/tenantId' },
                { id: 'monitoring-notifications', partitionKey: '/tenantId' }
            ];
            for (const config of containerConfigs) {
                const { container } = await this.database.containers.createIfNotExists({
                    id: config.id,
                    partitionKey: { paths: [config.partitionKey] },
                    defaultTtl: -1, // No TTL unless specified
                    indexingPolicy: {
                        automatic: true,
                        indexingMode: 'consistent',
                        includedPaths: [{ path: '/*' }],
                        excludedPaths: [{ path: '/large_data/*' }]
                    }
                });
            }
            this.syncJobsContainer = this.database.container('sync-jobs');
            this.syncConfigContainer = this.database.container('sync-configurations');
            this.environmentStatusContainer = this.database.container('environment-status');
            this.notificationsContainer = this.database.container('monitoring-notifications');
            this.isInitialized = true;
            console.log('Continuous monitoring service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize continuous monitoring service:', error);
            throw new Error(`Initialization failed: ${error}`);
        }
    }
    /**
     * Ensure service is initialized before operations
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initializeContainers();
        }
    }
    /**
     * Configure automated sync schedule for a tenant
     */
    async configureSyncSchedule(config) {
        await this.ensureInitialized();
        const syncConfig = {
            id: `sync-config-${config.tenantId}`,
            ...config,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        try {
            const { resource } = await this.syncConfigContainer.items.upsert(syncConfig);
            // Schedule the next sync job
            await this.scheduleNextSync(config.tenantId);
            return resource;
        }
        catch (error) {
            console.error('Failed to configure sync schedule:', error);
            throw new Error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Schedule the next sync job based on configuration
     */
    async scheduleNextSync(tenantId) {
        try {
            const config = await this.getSyncConfiguration(tenantId);
            if (!config || !config.enabled)
                return;
            const nextRun = this.calculateNextRunTime(config.schedule);
            // Update environment status with next scheduled sync
            for (const provider of config.cloudProviders) {
                await this.updateEnvironmentStatus(tenantId, provider, {
                    nextScheduledSync: nextRun
                });
            }
        }
        catch (error) {
            console.error('Failed to schedule next sync:', error);
        }
    }
    /**
     * Calculate next run time based on schedule configuration
     */
    calculateNextRunTime(schedule) {
        const now = new Date();
        const nextRun = new Date(now);
        switch (schedule.frequency) {
            case 'hourly':
                nextRun.setHours(now.getHours() + schedule.interval);
                break;
            case 'daily':
                nextRun.setDate(now.getDate() + schedule.interval);
                if (schedule.time) {
                    const [hours, minutes] = schedule.time.split(':').map(Number);
                    nextRun.setHours(hours, minutes, 0, 0);
                }
                break;
            case 'weekly':
                const daysUntilTarget = (schedule.dayOfWeek || 0) - now.getDay();
                const targetDay = daysUntilTarget <= 0 ? daysUntilTarget + 7 : daysUntilTarget;
                nextRun.setDate(now.getDate() + targetDay + (schedule.interval - 1) * 7);
                if (schedule.time) {
                    const [hours, minutes] = schedule.time.split(':').map(Number);
                    nextRun.setHours(hours, minutes, 0, 0);
                }
                break;
        }
        return nextRun;
    }
    /**
     * Execute automated data ingestion for all configured providers
     */
    async executeScheduledSync(tenantId) {
        await this.ensureInitialized();
        const config = await this.getSyncConfiguration(tenantId);
        if (!config || !config.enabled) {
            throw new Error('Sync configuration not found or disabled');
        }
        const syncJobs = [];
        for (const provider of config.cloudProviders) {
            const job = await this.executeSingleProviderSync(tenantId, provider, config);
            syncJobs.push(job);
        }
        // Schedule next sync
        await this.scheduleNextSync(tenantId);
        return syncJobs;
    }
    /**
     * Execute sync for a single cloud provider with retry logic
     */
    async executeSingleProviderSync(tenantId, provider, config) {
        const startTime = new Date();
        const jobId = `sync-${tenantId}-${provider}-${Date.now()}`;
        const syncJob = {
            id: jobId,
            tenantId,
            cloudProvider: provider,
            status: 'running',
            startTime,
            recordsProcessed: 0,
            consecutiveFailures: 0,
            nextScheduledRun: this.calculateNextRunTime(config.schedule),
            createdAt: startTime,
            updatedAt: startTime
        };
        try {
            // Save initial job status
            await this.syncJobsContainer.items.create(syncJob);
            // Execute the actual data ingestion with retry logic
            const result = await this.performDataIngestionWithRetry(tenantId, provider, config.retryConfig);
            // Update job with success status
            const endTime = new Date();
            syncJob.status = 'completed';
            syncJob.endTime = endTime;
            syncJob.duration = endTime.getTime() - startTime.getTime();
            syncJob.recordsProcessed = result.recordsProcessed;
            syncJob.lastSuccessfulSync = endTime;
            syncJob.updatedAt = endTime;
            // Update environment status
            await this.updateEnvironmentStatus(tenantId, provider, {
                connectionStatus: 'connected',
                lastSyncTime: endTime,
                lastSuccessfulSync: endTime,
                syncHealth: 'healthy',
                totalRecordsIngested: result.recordsProcessed,
                errorCount: 0
            });
            // Send success notification if configured
            if (config.notifications.onSuccess) {
                await this.sendNotification(tenantId, 'success', `Sync completed successfully for ${provider}`, {
                    provider,
                    recordsProcessed: result.recordsProcessed,
                    duration: syncJob.duration
                });
            }
        }
        catch (error) {
            // Update job with failure status
            const endTime = new Date();
            syncJob.status = 'failed';
            syncJob.endTime = endTime;
            syncJob.duration = endTime.getTime() - startTime.getTime();
            syncJob.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            syncJob.consecutiveFailures = await this.getConsecutiveFailureCount(tenantId, provider) + 1;
            syncJob.updatedAt = endTime;
            // Update environment status
            await this.updateEnvironmentStatus(tenantId, provider, {
                connectionStatus: 'error',
                lastSyncTime: endTime,
                syncHealth: syncJob.consecutiveFailures >= 3 ? 'critical' : 'warning',
                errorCount: syncJob.consecutiveFailures
            });
            // Send failure notification if configured
            if (config.notifications.onFailure) {
                await this.sendNotification(tenantId, 'error', `Sync failed for ${provider}: ${syncJob.errorMessage}`, {
                    provider,
                    error: syncJob.errorMessage,
                    consecutiveFailures: syncJob.consecutiveFailures
                });
            }
            console.error(`Sync failed for ${provider}:`, error);
        }
        // Save final job status
        await this.syncJobsContainer.items.upsert(syncJob);
        return syncJob;
    }
    /**
     * Perform data ingestion with exponential backoff retry
     */
    async performDataIngestionWithRetry(tenantId, provider, retryConfig) {
        let lastError = null;
        for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
            try {
                // Simulate actual data ingestion - in production, this would call the respective cloud APIs
                const recordsProcessed = await this.ingestDataFromProvider(tenantId, provider);
                return { recordsProcessed };
            }
            catch (error) {
                lastError = error;
                if (attempt < retryConfig.maxRetries) {
                    const delay = retryConfig.exponentialBackoff
                        ? retryConfig.retryDelayMs * Math.pow(2, attempt)
                        : retryConfig.retryDelayMs;
                    console.warn(`Attempt ${attempt + 1} failed for ${provider}, retrying in ${delay}ms:`, error);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError || new Error('Maximum retry attempts exceeded');
    }
    /**
     * Simulate data ingestion from cloud provider
     * In production, this would use the actual cloud SDK APIs
     */
    async ingestDataFromProvider(tenantId, provider) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        // Simulate occasional failures for testing
        if (Math.random() < 0.1) {
            throw new Error(`Simulated ${provider} API error`);
        }
        // Return simulated record count
        return Math.floor(50 + Math.random() * 200);
    }
    /**
     * Get consecutive failure count for a provider
     */
    async getConsecutiveFailureCount(tenantId, provider) {
        try {
            const querySpec = {
                query: `
          SELECT TOP 10 c.status, c.startTime 
          FROM c 
          WHERE c.tenantId = @tenantId AND c.cloudProvider = @provider 
          ORDER BY c.startTime DESC
        `,
                parameters: [
                    { name: '@tenantId', value: tenantId },
                    { name: '@provider', value: provider }
                ]
            };
            const { resources } = await this.syncJobsContainer.items.query(querySpec).fetchAll();
            let consecutiveFailures = 0;
            for (const job of resources) {
                if (job.status === 'failed') {
                    consecutiveFailures++;
                }
                else {
                    break;
                }
            }
            return consecutiveFailures;
        }
        catch (error) {
            console.error('Error getting consecutive failure count:', error);
            return 0;
        }
    }
    /**
     * Update environment status
     */
    async updateEnvironmentStatus(tenantId, provider, updates) {
        try {
            const statusId = `env-status-${tenantId}-${provider}`;
            const existing = await this.getEnvironmentStatus(tenantId, provider);
            const environmentStatus = {
                id: statusId,
                tenantId,
                cloudProvider: provider,
                connectionStatus: 'connected',
                lastSyncTime: new Date(),
                lastSuccessfulSync: new Date(),
                nextScheduledSync: new Date(),
                syncHealth: 'healthy',
                averageSyncDuration: 0,
                totalRecordsIngested: 0,
                errorCount: 0,
                metadata: {},
                createdAt: existing?.createdAt || new Date(),
                updatedAt: new Date(),
                ...existing,
                ...updates
            };
            await this.environmentStatusContainer.items.upsert(environmentStatus);
        }
        catch (error) {
            console.error('Failed to update environment status:', error);
        }
    }
    /**
     * Send notification
     */
    async sendNotification(tenantId, type, message, metadata) {
        try {
            const notification = {
                id: `notification-${tenantId}-${Date.now()}`,
                tenantId,
                type,
                message,
                metadata,
                isRead: false,
                createdAt: new Date()
            };
            await this.notificationsContainer.items.create(notification);
        }
        catch (error) {
            console.error('Failed to send notification:', error);
        }
    }
    /**
     * Get sync configuration for tenant
     */
    async getSyncConfiguration(tenantId) {
        await this.ensureInitialized();
        try {
            const { resource } = await this.syncConfigContainer.item(`sync-config-${tenantId}`, tenantId).read();
            return resource;
        }
        catch (error) {
            if (error.code === 404)
                return null;
            console.error('Failed to get sync configuration:', error);
            throw error;
        }
    }
    /**
     * Get environment status for all providers
     */
    async getAllEnvironmentStatus(tenantId) {
        await this.ensureInitialized();
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.cloudProvider',
                parameters: [{ name: '@tenantId', value: tenantId }]
            };
            const { resources } = await this.environmentStatusContainer.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Failed to get environment status:', error);
            return [];
        }
    }
    /**
     * Get environment status for specific provider
     */
    async getEnvironmentStatus(tenantId, provider) {
        await this.ensureInitialized();
        try {
            const { resource } = await this.environmentStatusContainer.item(`env-status-${tenantId}-${provider}`, tenantId).read();
            return resource;
        }
        catch (error) {
            if (error.code === 404)
                return null;
            console.error('Failed to get environment status:', error);
            return null;
        }
    }
    /**
     * Get recent sync jobs
     */
    async getRecentSyncJobs(tenantId, limit = 20) {
        await this.ensureInitialized();
        try {
            const querySpec = {
                query: `
          SELECT TOP @limit * FROM c 
          WHERE c.tenantId = @tenantId 
          ORDER BY c.startTime DESC
        `,
                parameters: [
                    { name: '@tenantId', value: tenantId },
                    { name: '@limit', value: limit }
                ]
            };
            const { resources } = await this.syncJobsContainer.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Failed to get recent sync jobs:', error);
            return [];
        }
    }
    /**
     * Trigger manual sync for specific providers
     */
    async triggerManualSync(tenantId, providers) {
        await this.ensureInitialized();
        const config = await this.getSyncConfiguration(tenantId);
        if (!config) {
            throw new Error('Sync configuration not found');
        }
        const targetProviders = providers || config.cloudProviders;
        const syncJobs = [];
        for (const provider of targetProviders) {
            if (config.cloudProviders.includes(provider)) {
                const job = await this.executeSingleProviderSync(tenantId, provider, config);
                syncJobs.push(job);
            }
        }
        return syncJobs;
    }
    /**
     * Get sync health summary
     */
    async getSyncHealthSummary(tenantId) {
        await this.ensureInitialized();
        const environments = await this.getAllEnvironmentStatus(tenantId);
        let healthyCount = 0;
        let warningCount = 0;
        let criticalCount = 0;
        let lastSyncTime = null;
        let totalRecordsToday = 0;
        for (const env of environments) {
            switch (env.syncHealth) {
                case 'healthy':
                    healthyCount++;
                    break;
                case 'warning':
                    warningCount++;
                    break;
                case 'critical':
                    criticalCount++;
                    break;
            }
            if (!lastSyncTime || env.lastSyncTime > lastSyncTime) {
                lastSyncTime = env.lastSyncTime;
            }
            // Calculate today's records (simplified - in production would use time range query)
            totalRecordsToday += env.totalRecordsIngested;
        }
        const overallHealth = criticalCount > 0 ? 'critical' :
            warningCount > 0 ? 'warning' : 'healthy';
        return {
            overallHealth,
            totalProviders: environments.length,
            healthyProviders: healthyCount,
            warningProviders: warningCount,
            criticalProviders: criticalCount,
            lastSyncTime,
            totalRecordsToday
        };
    }
}
// Export singleton instance
export const enhancedContinuousMonitoringService = new EnhancedContinuousMonitoringService();
// Export types
export { EnhancedContinuousMonitoringService };
