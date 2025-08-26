/**
 * Azure Functions Integration Service
 * Handles communication with Azure Functions for automated compliance data sync
 */

interface AzureFunctionResponse {
  status: string;
  message: string;
  timestamp: string;
  duration?: string;
  results?: any;
  error?: string;
}

interface SyncStatus {
  isRunning: boolean;
  lastSync?: string;
  nextSync?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  results?: any;
}

class AzureFunctionsService {
  private baseUrl: string;
  private functionKey: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_AZURE_FUNCTIONS_ENDPOINT || '';
    this.functionKey = import.meta.env.VITE_AZURE_FUNCTIONS_KEY || '';
    this.enabled = import.meta.env.VITE_ENABLE_AZURE_FUNCTIONS === 'true';
  }

  /**
   * Check if Azure Functions integration is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled && !!this.baseUrl && !!this.functionKey;
  }

  /**
   * Get the full URL for an Azure Function endpoint
   */
  private getFunctionUrl(path: string): string {
    const url = new URL(path, this.baseUrl);
    url.searchParams.set('code', this.functionKey);
    return url.toString();
  }

  /**
   * Make a request to an Azure Function
   */
  private async makeRequest(
    path: string, 
    options: RequestInit = {}
  ): Promise<AzureFunctionResponse> {
    if (!this.isEnabled()) {
      throw new Error('Azure Functions integration is not enabled or configured');
    }

    const url = this.getFunctionUrl(path);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Azure Function request failed:', error);
      throw new Error(`Azure Function request failed: ${error.message}`);
    }
  }

  /**
   * Trigger manual data synchronization
   */
  async triggerManualSync(options?: { subscriptionId?: string }): Promise<AzureFunctionResponse> {
    const path = import.meta.env.VITE_AZURE_FUNCTIONS_MANUAL_SYNC_PATH || '/api/ManualDataSync';
    
    return this.makeRequest(path, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  /**
   * Get sync status from manual sync function
   */
  async getSyncStatus(): Promise<AzureFunctionResponse> {
    const path = import.meta.env.VITE_AZURE_FUNCTIONS_MANUAL_SYNC_PATH || '/api/ManualDataSync';
    
    return this.makeRequest(path, {
      method: 'GET',
    });
  }

  /**
   * Get timer function status (if available)
   */
  async getTimerStatus(): Promise<AzureFunctionResponse> {
    const path = import.meta.env.VITE_AZURE_FUNCTIONS_TIMER_STATUS_PATH || '/api/DataSyncTimer';
    
    return this.makeRequest(path, {
      method: 'GET',
    });
  }

  /**
   * Check Azure Functions health
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string; details?: any }> {
    try {
      const response = await this.getSyncStatus();
      return {
        healthy: true,
        message: 'Azure Functions are accessible',
        details: response
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Azure Functions health check failed: ${error.message}`
      };
    }
  }

  /**
   * Parse sync results and return summary
   */
  parseSyncResults(response: AzureFunctionResponse): {
    success: boolean;
    summary: string;
    details: any;
  } {
    if (response.status === 'success') {
      const results = response.results || {};
      const summary = `Sync completed successfully. Updated ${results.nistControlsUpdated || 0} NIST controls.`;
      
      return {
        success: true,
        summary,
        details: results
      };
    } else {
      return {
        success: false,
        summary: response.message || 'Sync failed',
        details: response.error || response
      };
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<{
    lastManualSync?: string;
    lastTimerSync?: string;
    totalSyncs: number;
    successRate: number;
  }> {
    try {
      // This would ideally come from a dedicated stats endpoint
      // For now, we'll use the status endpoint
      const status = await this.getSyncStatus();
      
      return {
        lastManualSync: status.timestamp,
        totalSyncs: 1, // Placeholder
        successRate: status.status === 'success' ? 100 : 0
      };
    } catch (error) {
      console.error('Failed to get sync statistics:', error);
      return {
        totalSyncs: 0,
        successRate: 0
      };
    }
  }

  /**
   * Test Azure Functions connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      await this.getSyncStatus();
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        message: 'Connection successful',
        latency
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export const azureFunctionsService = new AzureFunctionsService();
export default azureFunctionsService;
