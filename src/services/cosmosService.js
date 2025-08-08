import { CosmosClient } from '@azure/cosmos';
// Cosmos DB configuration
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    key: import.meta.env.VITE_COSMOS_DB_KEY || 'your-cosmos-key',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
// Initialize Cosmos client with best practices
const client = new CosmosClient({
    endpoint: cosmosConfig.endpoint,
    key: cosmosConfig.key,
    connectionPolicy: {
        enableEndpointDiscovery: false,
        preferredLocations: ['East US', 'West US 2'], // Update based on your deployment regions
    },
    consistencyLevel: 'Session', // Optimal balance of consistency and performance
});
class CosmosDBService {
    constructor() {
        this.database = client.database(cosmosConfig.databaseId);
        this.containers = {
            nistControls: this.database.container('nist-controls'),
            ztaActivities: this.database.container('zta-activities'),
            poamItems: this.database.container('poam-items'),
            controlHistory: this.database.container('control-history'),
            vulnerabilities: this.database.container('vulnerabilities'),
        };
    }
    // Initialize database and containers
    async initialize() {
        try {
            // Create database if it doesn't exist
            await client.databases.createIfNotExists({ id: cosmosConfig.databaseId });
            // Create containers with appropriate partition keys and indexing policies
            await this.createContainerIfNotExists('nist-controls', '/controlFamily', {
                indexingMode: 'consistent',
                automatic: true,
                includedPaths: [
                    { path: '/controlFamily/?' },
                    { path: '/status/?' },
                    { path: '/riskLevel/?' },
                    { path: '/lastAssessed/?' },
                ],
            });
            await this.createContainerIfNotExists('zta-activities', '/pillar', {
                indexingMode: 'consistent',
                automatic: true,
                includedPaths: [
                    { path: '/pillar/?' },
                    { path: '/status/?' },
                    { path: '/phaseLevel/?' },
                    { path: '/maturity/?' },
                ],
            });
            await this.createContainerIfNotExists('poam-items', '/riskLevel', {
                indexingMode: 'consistent',
                automatic: true,
                includedPaths: [
                    { path: '/status/?' },
                    { path: '/riskLevel/?' },
                    { path: '/assignee/?' },
                    { path: '/dueDate/?' },
                ],
            });
            await this.createContainerIfNotExists('control-history', '/controlId', {
                indexingMode: 'consistent',
                automatic: true,
                includedPaths: [
                    { path: '/controlId/?' },
                    { path: '/changeDate/?' },
                    { path: '/eventSource/?' },
                ],
            });
            await this.createContainerIfNotExists('vulnerabilities', '/severity', {
                indexingMode: 'consistent',
                automatic: true,
                includedPaths: [
                    { path: '/severity/?' },
                    { path: '/status/?' },
                    { path: '/discoveryDate/?' },
                ],
            });
            console.log('CosmosDB initialization completed successfully');
        }
        catch (error) {
            console.error('CosmosDB initialization failed:', error);
            throw error;
        }
    }
    async createContainerIfNotExists(id, partitionKey, indexingPolicy) {
        await this.database.containers.createIfNotExists({
            id,
            partitionKey,
            indexingPolicy,
            throughput: 400, // Minimum throughput - can be scaled up as needed
        });
    }
    // NIST Controls operations
    async getNISTControls() {
        try {
            const { resources } = await this.containers.nistControls.items.readAll().fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching NIST controls:', error);
            throw error;
        }
    }
    async getNISTControlsByFamily(family) {
        try {
            const { resources } = await this.containers.nistControls.items
                .query({
                query: 'SELECT * FROM c WHERE c.controlFamily = @family',
                parameters: [{ name: '@family', value: family }],
            })
                .fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching NIST controls by family:', error);
            throw error;
        }
    }
    async updateNISTControl(control) {
        try {
            await this.containers.nistControls.item(control.id, control.controlFamily).replace(control);
            // Log the status change
            await this.logControlStatusChange(control.id, control.status, 'Manual Update', control.assessedBy);
        }
        catch (error) {
            console.error('Error updating NIST control:', error);
            throw error;
        }
    }
    // ZTA Activities operations
    async getZTAActivities() {
        try {
            const { resources } = await this.containers.ztaActivities.items.readAll().fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching ZTA activities:', error);
            throw error;
        }
    }
    async getZTAActivitiesByPillar(pillar) {
        try {
            const { resources } = await this.containers.ztaActivities.items
                .query({
                query: 'SELECT * FROM c WHERE c.pillar = @pillar',
                parameters: [{ name: '@pillar', value: pillar }],
            })
                .fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching ZTA activities by pillar:', error);
            throw error;
        }
    }
    async updateZTAActivity(activity) {
        try {
            await this.containers.ztaActivities.item(activity.id, activity.pillar).replace(activity);
        }
        catch (error) {
            console.error('Error updating ZTA activity:', error);
            throw error;
        }
    }
    // POAM operations
    async getPOAMItems() {
        try {
            const { resources } = await this.containers.poamItems.items.readAll().fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching POAM items:', error);
            throw error;
        }
    }
    async createPOAMItem(item) {
        try {
            await this.containers.poamItems.items.create(item);
        }
        catch (error) {
            console.error('Error creating POAM item:', error);
            throw error;
        }
    }
    async updatePOAMItem(item) {
        try {
            await this.containers.poamItems.item(item.id, item.riskLevel).replace(item);
        }
        catch (error) {
            console.error('Error updating POAM item:', error);
            throw error;
        }
    }
    // Control history operations
    async logControlStatusChange(controlId, newStatus, eventSource, changedBy, oldStatus, comments) {
        try {
            const historyEntry = {
                id: `${controlId}-${Date.now()}`,
                controlId,
                oldStatus: oldStatus || '',
                newStatus,
                changeDate: new Date().toISOString(),
                changedBy,
                eventSource,
                comments,
            };
            await this.containers.controlHistory.items.create(historyEntry);
        }
        catch (error) {
            console.error('Error logging control status change:', error);
            throw error;
        }
    }
    async getControlHistory(controlId) {
        try {
            const { resources } = await this.containers.controlHistory.items
                .query({
                query: 'SELECT * FROM c WHERE c.controlId = @controlId ORDER BY c.changeDate DESC',
                parameters: [{ name: '@controlId', value: controlId }],
            })
                .fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching control history:', error);
            throw error;
        }
    }
    // Vulnerability operations
    async getVulnerabilities() {
        try {
            const { resources } = await this.containers.vulnerabilities.items.readAll().fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error fetching vulnerabilities:', error);
            throw error;
        }
    }
    async createVulnerability(vulnerability) {
        try {
            await this.containers.vulnerabilities.items.create(vulnerability);
        }
        catch (error) {
            console.error('Error creating vulnerability:', error);
            throw error;
        }
    }
    // Analytics and reporting
    async getDashboardSummary() {
        try {
            const [nistControls, ztaActivities, poamItems, vulnerabilities] = await Promise.all([
                this.getNISTControls(),
                this.getZTAActivities(),
                this.getPOAMItems(),
                this.getVulnerabilities(),
            ]);
            // Calculate NIST compliance metrics
            const nistMetrics = {
                total: nistControls.length,
                compliant: nistControls.filter(c => c.status === 'compliant').length,
                partial: nistControls.filter(c => c.status === 'partial').length,
                noncompliant: nistControls.filter(c => c.status === 'noncompliant').length,
            };
            // Calculate ZTA maturity metrics
            const ztaMetrics = {
                overall: Math.round(ztaActivities.reduce((sum, a) => sum + a.maturity, 0) / ztaActivities.length),
                byPillar: ztaActivities.reduce((acc, activity) => {
                    if (!acc[activity.pillar]) {
                        acc[activity.pillar] = { total: 0, sum: 0 };
                    }
                    acc[activity.pillar].total += 1;
                    acc[activity.pillar].sum += activity.maturity;
                    return acc;
                }, {}),
            };
            // Calculate POAM metrics
            const poamMetrics = {
                total: poamItems.length,
                open: poamItems.filter(p => p.status === 'open').length,
                inProgress: poamItems.filter(p => p.status === 'in-progress').length,
                overdue: poamItems.filter(p => new Date(p.dueDate) < new Date() && p.status !== 'closed').length,
                critical: poamItems.filter(p => p.riskLevel === 'critical').length,
            };
            // Calculate vulnerability metrics
            const vulnMetrics = {
                total: vulnerabilities.length,
                open: vulnerabilities.filter(v => v.status === 'open').length,
                critical: vulnerabilities.filter(v => v.severity === 'critical').length,
                high: vulnerabilities.filter(v => v.severity === 'high').length,
            };
            return {
                nist: nistMetrics,
                zta: ztaMetrics,
                poam: poamMetrics,
                vulnerabilities: vulnMetrics,
            };
        }
        catch (error) {
            console.error('Error generating dashboard summary:', error);
            throw error;
        }
    }
}
// Export singleton instance
export const cosmosService = new CosmosDBService();
// Initialize the service when the module is loaded
cosmosService.initialize().catch(console.error);
