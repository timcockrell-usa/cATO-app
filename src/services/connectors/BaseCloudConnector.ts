/**
 * Cloud Connector Base Interface
 * Abstract base class for all cloud provider connectors
 */

import { CloudProvider, ComplianceData, ComplianceFinding } from '../../types/multiCloud';

export interface CloudConnectorCredentials {
  [key: string]: string;
}

export abstract class BaseCloudConnector {
  protected provider: CloudProvider;
  protected tenantId: string;
  protected environmentId: string;
  protected credentials: CloudConnectorCredentials;

  constructor(
    provider: CloudProvider,
    tenantId: string,
    environmentId: string,
    credentials: CloudConnectorCredentials
  ) {
    this.provider = provider;
    this.tenantId = tenantId;
    this.environmentId = environmentId;
    this.credentials = credentials;
  }

  /**
   * Test connectivity to the cloud provider
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Collect compliance data from the cloud provider
   */
  abstract collectComplianceData(): Promise<ComplianceData>;

  /**
   * Get specific security findings
   */
  abstract getSecurityFindings(): Promise<ComplianceFinding[]>;

  /**
   * Get configuration compliance status
   */
  abstract getConfigurationCompliance(): Promise<ComplianceFinding[]>;

  /**
   * Normalize provider-specific data to common format
   */
  protected abstract normalizeFindings(rawData: any): ComplianceFinding[];

  /**
   * Map provider-specific findings to NIST controls
   */
  protected abstract mapToNISTControls(finding: any): string[];

  /**
   * Common error handling and logging
   */
  protected handleError(error: Error, operation: string): void {
    console.error(`[${this.provider.toUpperCase()} Connector] Error in ${operation}:`, error);
    // TODO: Implement proper logging service
  }

  /**
   * Common retry logic with exponential backoff
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}
