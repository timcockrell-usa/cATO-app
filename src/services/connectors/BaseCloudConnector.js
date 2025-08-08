/**
 * Cloud Connector Base Interface
 * Abstract base class for all cloud provider connectors
 */
export class BaseCloudConnector {
    constructor(provider, tenantId, environmentId, credentials) {
        this.provider = provider;
        this.tenantId = tenantId;
        this.environmentId = environmentId;
        this.credentials = credentials;
    }
    /**
     * Common error handling and logging
     */
    handleError(error, operation) {
        console.error(`[${this.provider.toUpperCase()} Connector] Error in ${operation}:`, error);
        // TODO: Implement proper logging service
    }
    /**
     * Common retry logic with exponential backoff
     */
    async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxRetries) {
                    throw lastError;
                }
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
}
