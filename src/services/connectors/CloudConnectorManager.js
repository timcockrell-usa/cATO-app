/**
 * Cloud Connector Manager
 * Manages all cloud provider connectors and coordinates data collection
 */
import { AzureCloudConnector } from './AzureCloudConnector';
import { AWSCloudConnector } from './AWSCloudConnector';
import { GCPCloudConnector } from './GCPCloudConnector';
import { OCICloudConnector } from './OCICloudConnector';
export class CloudConnectorManager {
    constructor(tenantId) {
        this.connectors = new Map();
        this.tenantId = tenantId;
    }
    /**
     * Initialize a connector for a specific cloud environment
     */
    async initializeConnector(environment, credentials) {
        try {
            let connector;
            switch (environment.provider) {
                case 'azure':
                    connector = new AzureCloudConnector(this.tenantId, environment.id, credentials);
                    break;
                case 'aws':
                    connector = new AWSCloudConnector(this.tenantId, environment.id, credentials);
                    break;
                case 'gcp':
                    connector = new GCPCloudConnector(this.tenantId, environment.id, credentials);
                    break;
                case 'oracle':
                    connector = new OCICloudConnector(this.tenantId, environment.id, credentials);
                    break;
                default:
                    throw new Error(`Unsupported cloud provider: ${environment.provider}`);
            }
            // Test connection before storing
            const isConnected = await connector.testConnection();
            if (!isConnected) {
                throw new Error(`Failed to connect to ${environment.provider} environment: ${environment.name}`);
            }
            this.connectors.set(environment.id, connector);
            console.log(`Successfully initialized connector for ${environment.provider} environment: ${environment.name}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to initialize connector for ${environment.name}:`, error);
            return false;
        }
    }
    /**
     * Remove a connector
     */
    removeConnector(environmentId) {
        this.connectors.delete(environmentId);
    }
    /**
     * Get all active connectors
     */
    getActiveConnectors() {
        return Array.from(this.connectors.keys());
    }
    /**
     * Test connection for a specific environment
     */
    async testConnection(environmentId) {
        const connector = this.connectors.get(environmentId);
        if (!connector) {
            return false;
        }
        try {
            return await connector.testConnection();
        }
        catch (error) {
            console.error(`Connection test failed for environment ${environmentId}:`, error);
            return false;
        }
    }
    /**
     * Collect compliance data from a specific environment
     */
    async collectComplianceData(environmentId) {
        const connector = this.connectors.get(environmentId);
        if (!connector) {
            throw new Error(`No connector found for environment: ${environmentId}`);
        }
        try {
            return await connector.collectComplianceData();
        }
        catch (error) {
            console.error(`Failed to collect compliance data for environment ${environmentId}:`, error);
            return null;
        }
    }
    /**
     * Collect compliance data from all active environments
     */
    async collectAllComplianceData() {
        const results = [];
        const promises = [];
        // Collect data from all connectors in parallel
        for (const environmentId of this.connectors.keys()) {
            promises.push(this.collectComplianceData(environmentId));
        }
        const allResults = await Promise.allSettled(promises);
        for (const result of allResults) {
            if (result.status === 'fulfilled' && result.value) {
                results.push(result.value);
            }
            else if (result.status === 'rejected') {
                console.error('Failed to collect compliance data:', result.reason);
            }
        }
        return results;
    }
    /**
     * Sync data for specific cloud environments
     */
    async syncEnvironments(environmentIds) {
        const success = [];
        const failed = [];
        const promises = environmentIds.map(async (envId) => {
            try {
                const data = await this.collectComplianceData(envId);
                if (data) {
                    success.push(data);
                }
                else {
                    failed.push(envId);
                }
            }
            catch (error) {
                console.error(`Sync failed for environment ${envId}:`, error);
                failed.push(envId);
            }
        });
        await Promise.allSettled(promises);
        return { success, failed };
    }
    /**
     * Get connector statistics
     */
    getConnectorStats() {
        const stats = {
            totalConnectors: this.connectors.size,
            connectorsByProvider: {
                azure: 0,
                aws: 0,
                gcp: 0,
                oracle: 0
            },
            activeEnvironments: Array.from(this.connectors.keys())
        };
        // This would need to track provider types - simplified for now
        // In production, you'd store the provider type with each connector
        return stats;
    }
    /**
     * Health check for all connectors
     */
    async healthCheck() {
        const healthy = [];
        const unhealthy = [];
        const healthPromises = Array.from(this.connectors.entries()).map(async ([envId, connector]) => {
            try {
                const isHealthy = await connector.testConnection();
                if (isHealthy) {
                    healthy.push(envId);
                }
                else {
                    unhealthy.push(envId);
                }
            }
            catch (error) {
                console.error(`Health check failed for ${envId}:`, error);
                unhealthy.push(envId);
            }
        });
        await Promise.allSettled(healthPromises);
        return {
            healthy,
            unhealthy,
            total: this.connectors.size
        };
    }
    /**
     * Batch update connector configurations
     */
    async updateConnectorConfigs(configs) {
        const updated = [];
        const failed = [];
        for (const config of configs) {
            try {
                // In production, this would update connector configuration
                // For now, just track the attempt
                if (this.connectors.has(config.environmentId)) {
                    updated.push(config.environmentId);
                }
                else {
                    failed.push(config.environmentId);
                }
            }
            catch (error) {
                console.error(`Failed to update config for ${config.environmentId}:`, error);
                failed.push(config.environmentId);
            }
        }
        return { updated, failed };
    }
    /**
     * Clean up all connectors
     */
    dispose() {
        this.connectors.clear();
        console.log(`Disposed cloud connector manager for tenant: ${this.tenantId}`);
    }
}
