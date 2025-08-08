/**
 * eMASS Integration Service
 * Implements automated eMASS and POA&M workflow integration
 * with push/pull endpoints and bi-directional synchronization
 */
import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
// Cosmos DB configuration
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
/**
 * eMASS Integration Service
 */
class EMassIntegrationService {
    constructor() {
        this.initialized = false;
        this.cosmosClient = new CosmosClient({
            endpoint: cosmosConfig.endpoint,
            aadCredentials: new DefaultAzureCredential()
        });
    }
    /**
     * Initialize the service and containers
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            const database = this.cosmosClient.database(cosmosConfig.databaseId);
            this.emassConfigContainer = database.container('emass-configs');
            this.poamSyncContainer = database.container('poam-sync-configs');
            this.syncStatusContainer = database.container('emass-sync-status');
            this.workflowContainer = database.container('poam-workflows');
            this.initialized = true;
            console.log('eMASS Integration Service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize eMASS Integration Service:', error);
            throw error;
        }
    }
    /**
     * Configure eMASS API connection
     */
    async configureEmassApi(tenantId, config) {
        await this.ensureInitialized();
        const emassConfig = {
            id: `emass-config-${tenantId}`,
            tenantId,
            baseUrl: config.baseUrl || 'https://api.emass.mil',
            apiKey: config.apiKey || '',
            certificatePath: config.certificatePath,
            timeout: config.timeout || 30000,
            retryPolicy: config.retryPolicy || {
                maxRetries: 3,
                retryDelay: 5000,
                backoffMultiplier: 2
            },
            enabled: config.enabled ?? true,
            lastSync: config.lastSync,
            createdAt: config.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.emassConfigContainer.items.upsert(emassConfig);
            console.log(`eMASS API configured for tenant ${tenantId}`);
            return resource;
        }
        catch (error) {
            console.error(`Failed to configure eMASS API for tenant ${tenantId}:`, error);
            throw error;
        }
    }
    /**
     * Configure POA&M synchronization settings
     */
    async configurePoamSync(tenantId, config) {
        await this.ensureInitialized();
        const poamConfig = {
            id: `poam-sync-${tenantId}`,
            tenantId,
            autoSync: config.autoSync ?? true,
            syncInterval: config.syncInterval || 60, // 1 hour default
            pushToEmass: config.pushToEmass ?? true,
            pullFromEmass: config.pullFromEmass ?? true,
            conflictResolution: config.conflictResolution || 'manual',
            syncFields: config.syncFields || [
                'title',
                'description',
                'severity',
                'status',
                'dueDate',
                'assignedTo',
                'mitigationPlan',
                'resources',
                'milestones'
            ],
            lastPushSync: config.lastPushSync,
            lastPullSync: config.lastPullSync,
            createdAt: config.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.poamSyncContainer.items.upsert(poamConfig);
            console.log(`POA&M sync configured for tenant ${tenantId}`);
            return resource;
        }
        catch (error) {
            console.error(`Failed to configure POA&M sync for tenant ${tenantId}:`, error);
            throw error;
        }
    }
    /**
     * Push POA&Ms to eMASS
     */
    async pushPoamsToEmass(tenantId, poamIds) {
        await this.ensureInitialized();
        const syncId = `push-${tenantId}-${Date.now()}`;
        const startTime = new Date().toISOString();
        const syncStatus = {
            id: syncId,
            tenantId,
            syncType: 'push-poams',
            status: 'pending',
            startTime,
            recordsProcessed: 0,
            recordsPushed: 0,
            recordsPulled: 0,
            conflicts: 0,
            errors: []
        };
        try {
            // Store initial sync status
            await this.syncStatusContainer.items.create(syncStatus);
            // Get eMASS configuration
            const emassConfig = await this.getEmassConfig(tenantId);
            if (!emassConfig || !emassConfig.enabled) {
                throw new Error('eMASS API not configured or disabled');
            }
            // Get POA&M sync configuration
            const poamConfig = await this.getPoamSyncConfig(tenantId);
            if (!poamConfig || !poamConfig.pushToEmass) {
                throw new Error('POA&M push to eMASS is not enabled');
            }
            // Update status to running
            syncStatus.status = 'running';
            await this.syncStatusContainer.items.upsert(syncStatus);
            // Get POA&Ms to push
            const poamsToProcess = await this.getPoamsForPush(tenantId, poamIds);
            syncStatus.recordsProcessed = poamsToProcess.length;
            let pushedCount = 0;
            const errors = [];
            // Process each POA&M
            for (const poam of poamsToProcess) {
                try {
                    await this.pushSinglePoamToEmass(poam, emassConfig);
                    pushedCount++;
                    // Update workflow status
                    await this.updateWorkflowStatus(poam.id, 'emass-sync-completed');
                }
                catch (error) {
                    console.error(`Failed to push POA&M ${poam.id} to eMASS:`, error);
                    errors.push({
                        poamId: poam.id,
                        errorCode: 'PUSH_FAILED',
                        errorMessage: error instanceof Error ? error.message : 'Unknown error',
                        severity: 'medium'
                    });
                }
            }
            // Complete the sync
            syncStatus.status = pushedCount > 0 ? 'completed' : 'failed';
            syncStatus.endTime = new Date().toISOString();
            syncStatus.recordsPushed = pushedCount;
            syncStatus.errors = errors;
            // Update POA&M sync config
            poamConfig.lastPushSync = new Date().toISOString();
            await this.poamSyncContainer.items.upsert(poamConfig);
            await this.syncStatusContainer.items.upsert(syncStatus);
            console.log(`Push to eMASS completed: ${pushedCount}/${poamsToProcess.length} POA&Ms pushed`);
            return syncStatus;
        }
        catch (error) {
            console.error(`Push to eMASS failed for tenant ${tenantId}:`, error);
            syncStatus.status = 'failed';
            syncStatus.endTime = new Date().toISOString();
            syncStatus.errors.push({
                errorCode: 'SYNC_FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                severity: 'critical'
            });
            await this.syncStatusContainer.items.upsert(syncStatus);
            throw error;
        }
    }
    /**
     * Pull updates from eMASS
     */
    async pullUpdatesFromEmass(tenantId) {
        await this.ensureInitialized();
        const syncId = `pull-${tenantId}-${Date.now()}`;
        const startTime = new Date().toISOString();
        const syncStatus = {
            id: syncId,
            tenantId,
            syncType: 'pull-updates',
            status: 'pending',
            startTime,
            recordsProcessed: 0,
            recordsPushed: 0,
            recordsPulled: 0,
            conflicts: 0,
            errors: []
        };
        try {
            // Store initial sync status
            await this.syncStatusContainer.items.create(syncStatus);
            // Get eMASS configuration
            const emassConfig = await this.getEmassConfig(tenantId);
            if (!emassConfig || !emassConfig.enabled) {
                throw new Error('eMASS API not configured or disabled');
            }
            // Get POA&M sync configuration
            const poamConfig = await this.getPoamSyncConfig(tenantId);
            if (!poamConfig || !poamConfig.pullFromEmass) {
                throw new Error('POA&M pull from eMASS is not enabled');
            }
            // Update status to running
            syncStatus.status = 'running';
            await this.syncStatusContainer.items.upsert(syncStatus);
            // Fetch updates from eMASS
            const emassUpdates = await this.fetchUpdatesFromEmass(emassConfig, poamConfig.lastPullSync);
            syncStatus.recordsProcessed = emassUpdates.length;
            let pulledCount = 0;
            let conflictsCount = 0;
            const errors = [];
            // Process each update
            for (const update of emassUpdates) {
                try {
                    const result = await this.processEmassUpdate(update, poamConfig);
                    if (result.status === 'updated') {
                        pulledCount++;
                    }
                    else if (result.status === 'conflict') {
                        conflictsCount++;
                    }
                }
                catch (error) {
                    console.error(`Failed to process eMASS update for POA&M ${update.poamId}:`, error);
                    errors.push({
                        poamId: update.poamId,
                        errorCode: 'UPDATE_FAILED',
                        errorMessage: error instanceof Error ? error.message : 'Unknown error',
                        severity: 'medium'
                    });
                }
            }
            // Complete the sync
            syncStatus.status = pulledCount > 0 || conflictsCount > 0 ? 'completed' : 'failed';
            syncStatus.endTime = new Date().toISOString();
            syncStatus.recordsPulled = pulledCount;
            syncStatus.conflicts = conflictsCount;
            syncStatus.errors = errors;
            // Update POA&M sync config
            poamConfig.lastPullSync = new Date().toISOString();
            await this.poamSyncContainer.items.upsert(poamConfig);
            await this.syncStatusContainer.items.upsert(syncStatus);
            console.log(`Pull from eMASS completed: ${pulledCount} updates, ${conflictsCount} conflicts`);
            return syncStatus;
        }
        catch (error) {
            console.error(`Pull from eMASS failed for tenant ${tenantId}:`, error);
            syncStatus.status = 'failed';
            syncStatus.endTime = new Date().toISOString();
            syncStatus.errors.push({
                errorCode: 'SYNC_FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                severity: 'critical'
            });
            await this.syncStatusContainer.items.upsert(syncStatus);
            throw error;
        }
    }
    /**
     * Execute full bidirectional sync
     */
    async executeFullSync(tenantId) {
        await this.ensureInitialized();
        const syncId = `full-sync-${tenantId}-${Date.now()}`;
        const startTime = new Date().toISOString();
        const syncStatus = {
            id: syncId,
            tenantId,
            syncType: 'full-sync',
            status: 'pending',
            startTime,
            recordsProcessed: 0,
            recordsPushed: 0,
            recordsPulled: 0,
            conflicts: 0,
            errors: []
        };
        try {
            await this.syncStatusContainer.items.create(syncStatus);
            syncStatus.status = 'running';
            await this.syncStatusContainer.items.upsert(syncStatus);
            // Execute pull first to get latest updates
            const pullResult = await this.pullUpdatesFromEmass(tenantId);
            // Then execute push to sync local changes
            const pushResult = await this.pushPoamsToEmass(tenantId);
            // Combine results
            syncStatus.status = 'completed';
            syncStatus.endTime = new Date().toISOString();
            syncStatus.recordsProcessed = pullResult.recordsProcessed + pushResult.recordsProcessed;
            syncStatus.recordsPushed = pushResult.recordsPushed;
            syncStatus.recordsPulled = pullResult.recordsPulled;
            syncStatus.conflicts = pullResult.conflicts;
            syncStatus.errors = [...pullResult.errors, ...pushResult.errors];
            await this.syncStatusContainer.items.upsert(syncStatus);
            console.log(`Full sync completed for tenant ${tenantId}`);
            return syncStatus;
        }
        catch (error) {
            console.error(`Full sync failed for tenant ${tenantId}:`, error);
            syncStatus.status = 'failed';
            syncStatus.endTime = new Date().toISOString();
            syncStatus.errors.push({
                errorCode: 'FULL_SYNC_FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                severity: 'critical'
            });
            await this.syncStatusContainer.items.upsert(syncStatus);
            throw error;
        }
    }
    /**
     * Create POA&M workflow
     */
    async createPoamWorkflow(poamId, tenantId, assignedTo) {
        await this.ensureInitialized();
        const workflow = {
            id: `workflow-${poamId}`,
            poamId,
            tenantId,
            currentStage: 'draft',
            assignedTo,
            automationEnabled: true,
            notifications: {
                email: true,
                inApp: true,
                escalation: true
            },
            history: [{
                    stage: 'draft',
                    timestamp: new Date().toISOString(),
                    user: 'system',
                    action: 'workflow_created',
                    notes: 'POA&M workflow automatically created'
                }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.workflowContainer.items.create(workflow);
            console.log(`Workflow created for POA&M ${poamId}`);
            return resource;
        }
        catch (error) {
            console.error(`Failed to create workflow for POA&M ${poamId}:`, error);
            throw error;
        }
    }
    /**
     * Update workflow status
     */
    async updateWorkflowStatus(poamId, action, user, notes) {
        await this.ensureInitialized();
        try {
            const workflowId = `workflow-${poamId}`;
            const { resource: workflow } = await this.workflowContainer.item(workflowId, workflowId).read();
            if (workflow) {
                workflow.history.push({
                    stage: workflow.currentStage,
                    timestamp: new Date().toISOString(),
                    user: user || 'system',
                    action,
                    notes
                });
                workflow.updatedAt = new Date().toISOString();
                await this.workflowContainer.items.upsert(workflow);
            }
        }
        catch (error) {
            console.error(`Failed to update workflow for POA&M ${poamId}:`, error);
        }
    }
    /**
     * Get eMASS configuration
     */
    async getEmassConfig(tenantId) {
        try {
            const { resource } = await this.emassConfigContainer.item(`emass-config-${tenantId}`, tenantId).read();
            return resource || null;
        }
        catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 404) {
                return null;
            }
            throw error;
        }
    }
    /**
     * Get POA&M sync configuration
     */
    async getPoamSyncConfig(tenantId) {
        try {
            const { resource } = await this.poamSyncContainer.item(`poam-sync-${tenantId}`, tenantId).read();
            return resource || null;
        }
        catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 404) {
                return null;
            }
            throw error;
        }
    }
    /**
     * Get POA&Ms for push to eMASS
     */
    async getPoamsForPush(tenantId, poamIds) {
        // Simulate getting POA&Ms from database
        // In production, this would query the actual POA&M container
        const mockPoams = [
            { id: 'poam-001', title: 'Sample POA&M 1', status: 'open' },
            { id: 'poam-002', title: 'Sample POA&M 2', status: 'in-progress' }
        ];
        if (poamIds) {
            return mockPoams.filter(poam => poamIds.includes(poam.id));
        }
        return mockPoams;
    }
    /**
     * Push single POA&M to eMASS
     */
    async pushSinglePoamToEmass(poam, config) {
        // Simulate eMASS API call
        console.log(`Pushing POA&M ${poam.id} to eMASS API: ${config.baseUrl}`);
        // In production, this would make actual HTTP requests to eMASS API
        await new Promise(resolve => setTimeout(resolve, 500));
        if (Math.random() < 0.1) { // 10% failure rate for testing
            throw new Error('eMASS API temporarily unavailable');
        }
    }
    /**
     * Fetch updates from eMASS
     */
    async fetchUpdatesFromEmass(config, lastSync) {
        // Simulate eMASS API call to fetch updates
        console.log(`Fetching updates from eMASS API: ${config.baseUrl} since ${lastSync}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        // Return mock updates
        return [
            { poamId: 'poam-001', field: 'status', value: 'completed', timestamp: new Date().toISOString() },
            { poamId: 'poam-002', field: 'assignedTo', value: 'john.doe@mil', timestamp: new Date().toISOString() }
        ];
    }
    /**
     * Process eMASS update
     */
    async processEmassUpdate(update, config) {
        // Simulate processing update and conflict detection
        console.log(`Processing eMASS update for POA&M ${update.poamId}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        // Simulate conflict detection (5% chance)
        if (Math.random() < 0.05) {
            return { status: 'conflict' };
        }
        return { status: 'updated' };
    }
    /**
     * Get sync history
     */
    async getSyncHistory(tenantId, limit = 20) {
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
            return resources;
        }
        catch (error) {
            console.error(`Failed to get sync history for tenant ${tenantId}:`, error);
            return [];
        }
    }
    /**
     * Get workflow status
     */
    async getWorkflowStatus(poamId) {
        await this.ensureInitialized();
        try {
            const workflowId = `workflow-${poamId}`;
            const { resource } = await this.workflowContainer.item(workflowId, workflowId).read();
            return resource || null;
        }
        catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 404) {
                return null;
            }
            console.error(`Failed to get workflow status for POA&M ${poamId}:`, error);
            throw error;
        }
    }
    /**
     * Ensure service is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}
// Export service instance
export const emassIntegrationService = new EMassIntegrationService();
