/**
 * eMASS (Enterprise Mission Assurance Support Service) API Integration Service
 * Implements real-time synchronization with DoD eMASS system for POA&M management
 */
import { CosmosClient } from '@azure/cosmos';
// Cosmos DB configuration
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    key: import.meta.env.VITE_COSMOS_DB_KEY || 'your-cosmos-key',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
// eMASS API configuration
const emassConfig = {
    baseUrl: import.meta.env.VITE_EMASS_API_URL || 'https://api.emass.apps.mil',
    apiKey: import.meta.env.VITE_EMASS_API_KEY || 'your-emass-api-key',
    version: 'v1',
    timeout: 30000 // 30 seconds
};
class EMassApiService {
    constructor() {
        this.client = new CosmosClient({
            endpoint: cosmosConfig.endpoint,
            key: cosmosConfig.key,
        });
        const database = this.client.database(cosmosConfig.databaseId);
        this.poamContainer = database.container('poam-items');
        this.syncStatusContainer = database.container('emass-sync-status');
        this.systemsContainer = database.container('emass-systems');
    }
    /**
     * Get authentication headers for eMASS API
     */
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${emassConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'cATO-Dashboard/1.0'
        };
    }
    /**
     * Make authenticated request to eMASS API
     */
    async makeEMassRequest(endpoint, options = {}) {
        const url = `${emassConfig.baseUrl}/${emassConfig.version}${endpoint}`;
        const requestOptions = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        };
        try {
            const response = await fetch(url, requestOptions);
            if (!response.ok) {
                const errorData = await response.text();
                const error = {
                    status: response.status,
                    code: response.statusText,
                    message: `eMASS API Error: ${response.status} ${response.statusText}`,
                    details: errorData
                };
                throw error;
            }
            return await response.json();
        }
        catch (error) {
            console.error('eMASS API request failed:', error);
            throw error;
        }
    }
    /**
     * Get all systems accessible to the authenticated user
     */
    async getSystems() {
        try {
            const response = await this.makeEMassRequest('/systems');
            return response.data || [];
        }
        catch (error) {
            console.error('Failed to fetch eMASS systems:', error);
            throw error;
        }
    }
    /**
     * Get POA&Ms for a specific system
     */
    async getSystemPOAMs(systemId) {
        try {
            const response = await this.makeEMassRequest(`/systems/${systemId}/poams`);
            return response.data || [];
        }
        catch (error) {
            console.error(`Failed to fetch POA&Ms for system ${systemId}:`, error);
            throw error;
        }
    }
    /**
     * Get specific POA&M details
     */
    async getPOAM(systemId, poamId) {
        try {
            const response = await this.makeEMassRequest(`/systems/${systemId}/poams/${poamId}`);
            return response.data;
        }
        catch (error) {
            console.error(`Failed to fetch POA&M ${poamId}:`, error);
            throw error;
        }
    }
    /**
     * Create new POA&M in eMASS
     */
    async createPOAM(systemId, poam) {
        try {
            const response = await this.makeEMassRequest(`/systems/${systemId}/poams`, {
                method: 'POST',
                body: JSON.stringify(poam)
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to create POA&M in eMASS:', error);
            throw error;
        }
    }
    /**
     * Update existing POA&M in eMASS
     */
    async updatePOAM(systemId, poamId, updates) {
        try {
            const response = await this.makeEMassRequest(`/systems/${systemId}/poams/${poamId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            return response.data;
        }
        catch (error) {
            console.error(`Failed to update POA&M ${poamId}:`, error);
            throw error;
        }
    }
    /**
     * Synchronize POA&Ms between eMASS and local database
     */
    async syncPOAMs(tenantId, systemId) {
        const startTime = new Date();
        const syncStatus = {
            id: `emass-sync-${tenantId}-${systemId}-${Date.now()}`,
            tenantId,
            systemId,
            lastSyncTime: startTime.toISOString(),
            status: 'in_progress',
            recordsProcessed: 0,
            createdAt: startTime.toISOString(),
            updatedAt: startTime.toISOString()
        };
        try {
            // Save initial sync status
            await this.saveSyncStatus(syncStatus);
            // Fetch POA&Ms from eMASS
            const emassPoams = await this.getSystemPOAMs(systemId);
            // Get existing local POA&Ms
            const localPoams = await this.getLocalPOAMs(tenantId, systemId);
            let recordsProcessed = 0;
            // Process each eMASS POA&M
            for (const emassPoam of emassPoams) {
                await this.processEMassPOAM(tenantId, systemId, emassPoam);
                recordsProcessed++;
            }
            // Update sync status with success
            const endTime = new Date();
            syncStatus.status = 'success';
            syncStatus.recordsProcessed = recordsProcessed;
            syncStatus.syncDuration = endTime.getTime() - startTime.getTime();
            syncStatus.updatedAt = endTime.toISOString();
        }
        catch (error) {
            // Update sync status with failure
            const endTime = new Date();
            syncStatus.status = 'failed';
            syncStatus.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            syncStatus.syncDuration = endTime.getTime() - startTime.getTime();
            syncStatus.updatedAt = endTime.toISOString();
            console.error(`eMASS sync failed for system ${systemId}:`, error);
        }
        // Save final sync status
        await this.saveSyncStatus(syncStatus);
        return syncStatus;
    }
    /**
     * Process individual eMASS POA&M and sync with local database
     */
    async processEMassPOAM(tenantId, systemId, emassPoam) {
        try {
            // Convert eMASS POA&M to local POA&M format
            const localPoam = this.convertEMassPOAMToLocal(tenantId, systemId, emassPoam);
            // Check if POA&M already exists locally
            const existingPoam = await this.findLocalPOAM(tenantId, emassPoam.displayPoamId);
            if (existingPoam) {
                // Update existing POA&M
                const updatedPoam = {
                    ...existingPoam,
                    ...localPoam,
                    updatedAt: new Date()
                };
                await this.poamContainer.items.upsert(updatedPoam);
            }
            else {
                // Create new POA&M
                await this.poamContainer.items.create(localPoam);
            }
        }
        catch (error) {
            console.error(`Failed to process eMASS POA&M ${emassPoam.poamId}:`, error);
            throw error;
        }
    }
    /**
     * Convert eMASS POA&M format to local POA&M format
     */
    convertEMassPOAMToLocal(tenantId, systemId, emassPoam) {
        // For demonstration purposes, create a simplified POAM object
        // In production, this would properly map all fields according to the interface
        const now = new Date();
        return {
            id: `emass-${systemId}-${emassPoam.poamId}`,
            organizationId: tenantId,
            title: emassPoam.vulnerabilityDescription.substring(0, 100),
            description: emassPoam.vulnerabilityDescription,
            weakness: {
                type: 'Finding',
                identifier: emassPoam.sourceIdentVuln || 'unknown',
                title: emassPoam.vulnerabilityDescription,
                description: emassPoam.vulnerabilityDescription,
                source: 'eMASS'
            },
            severity: 'Medium',
            status: 'InProgress',
            owner: emassPoam.pocOrganization || 'Unknown',
            assignedTo: [emassPoam.pocOrganization || 'Unknown'],
            createdAt: now,
            updatedAt: now,
            identifiedDate: now,
            scheduledCompletionDate: new Date(emassPoam.scheduledCompletionDate),
            resourcesRequired: [],
            estimatedCost: 0,
            milestones: [],
            progress: {
                overallPercentage: 0,
                milestoneProgress: {},
                lastUpdated: now,
                updatedBy: 'system',
                blockers: [],
                risks: []
            },
            riskAssessment: {
                currentRiskLevel: 'Medium',
                residualRiskLevel: 'Low',
                riskScore: 0,
                likelihood: 'Medium',
                impact: 'Medium',
                riskFactors: [],
                mitigatingFactors: [],
                assessedBy: 'system',
                assessedDate: now,
                nextReviewDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
            },
            businessImpact: {
                operationalImpact: {
                    level: 'Medium',
                    description: emassPoam.impactDescription || '',
                    timeframe: 'Unknown'
                },
                financialImpact: {
                    level: 'Medium',
                    description: '',
                    timeframe: 'Unknown'
                },
                reputationalImpact: {
                    level: 'Medium',
                    description: '',
                    timeframe: 'Unknown'
                },
                complianceImpact: {
                    level: 'Medium',
                    description: '',
                    timeframe: 'Unknown'
                },
                overallImpact: 'Medium',
                affectedSystems: [`emass-system-${systemId}`],
                affectedUsers: 0,
                businessProcesses: []
            },
            remediationPlan: {
                approach: 'Fix',
                steps: [],
                timeline: {
                    phases: [],
                    criticalPath: [],
                    bufferTime: 0,
                    contingencyTime: 0
                },
                resources: [],
                dependencies: [],
                successCriteria: []
            },
            affectedControls: [],
            complianceFramework: [],
            emassData: {
                systemId: systemId.toString(),
                poamId: emassPoam.poamId.toString(),
                externalId: emassPoam.displayPoamId,
                status: 'Ongoing',
                lastSyncAt: now,
                syncStatus: 'Success',
                scheduledCompletionDate: new Date(emassPoam.scheduledCompletionDate),
                milestones: [],
                resources: [],
                comments: [],
                autoSync: true,
                syncFrequency: 'Daily',
                fieldMappings: []
            },
            workflow: {
                currentState: {
                    name: 'InProgress',
                    description: 'Item is currently in progress',
                    allowedTransitions: ['Review', 'Complete'],
                    requiredApprovals: [],
                    autoTransitions: []
                },
                history: [],
                approvals: [],
                notifications: []
            },
            attachments: [],
            evidenceLinks: [],
            history: [{
                    id: `history-${Date.now()}`,
                    timestamp: now,
                    userId: 'emass-sync',
                    action: 'Created',
                    description: 'Synchronized from eMASS system'
                }]
        };
    }
    /**
     * Get local POA&Ms for a system
     */
    async getLocalPOAMs(tenantId, systemId) {
        try {
            const querySpec = {
                query: `
          SELECT * FROM c 
          WHERE c.organizationId = @tenantId 
            AND c.emassIntegration.systemId = @systemId
        `,
                parameters: [
                    { name: '@tenantId', value: tenantId },
                    { name: '@systemId', value: systemId }
                ]
            };
            const { resources } = await this.poamContainer.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching local POA&Ms:', error);
            return [];
        }
    }
    /**
     * Find local POA&M by eMASS display ID
     */
    async findLocalPOAM(tenantId, emassDisplayId) {
        try {
            const querySpec = {
                query: `
          SELECT * FROM c 
          WHERE c.organizationId = @tenantId 
            AND c.emassIntegration.displayPoamId = @emassDisplayId
        `,
                parameters: [
                    { name: '@tenantId', value: tenantId },
                    { name: '@emassDisplayId', value: emassDisplayId }
                ]
            };
            const { resources } = await this.poamContainer.items.query(querySpec).fetchAll();
            return resources.length > 0 ? resources[0] : null;
        }
        catch (error) {
            console.error('Error finding local POA&M:', error);
            return null;
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
            console.error('Error saving eMASS sync status:', error);
        }
    }
    /**
     * Get eMASS sync history for a tenant
     */
    async getSyncHistory(tenantId, limit = 20) {
        try {
            const querySpec = {
                query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId 
          ORDER BY c.lastSyncTime DESC
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
            console.error('Error fetching eMASS sync history:', error);
            return [];
        }
    }
    /**
     * Get systems from local cache or fetch from eMASS
     */
    async getCachedSystems(tenantId, forceRefresh = false) {
        try {
            if (!forceRefresh) {
                // Try to get from cache first
                const querySpec = {
                    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
                    parameters: [{ name: '@tenantId', value: tenantId }]
                };
                const { resources } = await this.systemsContainer.items.query(querySpec).fetchAll();
                if (resources.length > 0) {
                    return resources.map(r => r.system);
                }
            }
            // Fetch from eMASS and cache
            const systems = await this.getSystems();
            // Cache the systems
            for (const system of systems) {
                await this.systemsContainer.items.upsert({
                    id: `system-${tenantId}-${system.systemId}`,
                    tenantId,
                    system,
                    cachedAt: new Date().toISOString()
                });
            }
            return systems;
        }
        catch (error) {
            console.error('Error getting cached systems:', error);
            return [];
        }
    }
    /**
     * Push local POA&M updates to eMASS
     */
    async pushPOAMUpdate(tenantId, poamId, updates) {
        try {
            // Get the local POA&M
            const localPoam = await this.getLocalPOAMById(poamId);
            if (!localPoam || !localPoam.emassData?.systemId || !localPoam.emassData?.poamId) {
                throw new Error('POA&M not found or not linked to eMASS');
            }
            // Convert local updates to eMASS format
            const emassUpdates = this.convertLocalPOAMToEMass(updates);
            // Push to eMASS
            await this.updatePOAM(parseInt(localPoam.emassData.systemId), parseInt(localPoam.emassData.poamId), emassUpdates);
            return true;
        }
        catch (error) {
            console.error('Failed to push POA&M update to eMASS:', error);
            return false;
        }
    }
    /**
     * Get local POA&M by ID
     */
    async getLocalPOAMById(poamId) {
        try {
            const { resource } = await this.poamContainer.item(poamId, poamId).read();
            return resource;
        }
        catch (error) {
            console.error('Error fetching local POA&M by ID:', error);
            return null;
        }
    }
    /**
     * Convert local POA&M updates to eMASS format
     */
    convertLocalPOAMToEMass(localUpdates) {
        const emassUpdates = {};
        if (localUpdates.description) {
            emassUpdates.vulnerabilityDescription = localUpdates.description;
        }
        if (localUpdates.scheduledCompletionDate) {
            emassUpdates.scheduledCompletionDate = localUpdates.scheduledCompletionDate.toISOString();
        }
        if (localUpdates.remediationPlan?.approach) {
            emassUpdates.mitigations = localUpdates.remediationPlan.approach;
        }
        if (localUpdates.businessImpact?.operationalImpact?.description) {
            emassUpdates.impactDescription = localUpdates.businessImpact.operationalImpact.description;
        }
        // Map local severity to eMASS severity
        if (localUpdates.severity) {
            const severityMapping = {
                'Critical': 'Very_High',
                'High': 'High',
                'Medium': 'Moderate',
                'Low': 'Low',
                'Informational': 'Very_Low'
            };
            emassUpdates.severity = severityMapping[localUpdates.severity];
        }
        return emassUpdates;
    }
}
// Export service instance
export const emassApiService = new EMassApiService();
// Export types and service class
export { EMassApiService };
