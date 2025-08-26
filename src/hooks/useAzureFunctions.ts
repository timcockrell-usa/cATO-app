/**
 * Custom React hook for Azure Functions integration
 * Provides status monitoring and sync capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { azureFunctionsService } from '../services/azureFunctionsService';

interface UseAzureFunctionsResult {
  // Status
  isEnabled: boolean;
  isHealthy: boolean;
  isConnected: boolean;
  
  // Sync state
  isSyncing: boolean;
  lastSync: string | null;
  nextScheduledSync: string | null;
  
  // Functions
  triggerSync: (options?: { subscriptionId?: string }) => Promise<void>;
  checkStatus: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  
  // Data
  syncStats: {
    totalSyncs: number;
    successRate: number;
    lastError?: string;
  };
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useAzureFunctions(): UseAzureFunctionsResult {
  const [isEnabled] = useState(() => azureFunctionsService.isEnabled());
  const [isHealthy, setIsHealthy] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [nextScheduledSync, setNextScheduledSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState({
    totalSyncs: 0,
    successRate: 0,
    lastError: undefined
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkStatus = useCallback(async () => {
    if (!isEnabled) return;

    try {
      setError(null);
      
      // Check health
      const healthCheck = await azureFunctionsService.healthCheck();
      setIsHealthy(healthCheck.healthy);
      setIsConnected(healthCheck.healthy);

      if (!healthCheck.healthy) {
        setError(healthCheck.message);
        return;
      }

      // Get sync status
      const status = await azureFunctionsService.getSyncStatus();
      setLastSync(status.timestamp);

      // Get statistics
      const stats = await azureFunctionsService.getSyncStatistics();
      setSyncStats(prev => ({
        ...prev,
        totalSyncs: stats.totalSyncs,
        successRate: stats.successRate
      }));

      // Calculate next scheduled sync (every 6 hours from last sync)
      if (status.timestamp) {
        const lastSyncTime = new Date(status.timestamp);
        const nextSync = new Date(lastSyncTime.getTime() + (6 * 60 * 60 * 1000));
        setNextScheduledSync(nextSync.toISOString());
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsHealthy(false);
      setIsConnected(false);
      setSyncStats(prev => ({ ...prev, lastError: errorMessage }));
    }
  }, [isEnabled]);

  const triggerSync = useCallback(async (options?: { subscriptionId?: string }) => {
    if (!isEnabled) {
      throw new Error('Azure Functions integration is not enabled');
    }

    setIsSyncing(true);
    setError(null);

    try {
      const response = await azureFunctionsService.triggerManualSync(options);
      const result = azureFunctionsService.parseSyncResults(response);

      if (!result.success) {
        throw new Error(result.summary);
      }

      // Update status after successful sync
      setLastSync(new Date().toISOString());
      setSyncStats(prev => ({
        totalSyncs: prev.totalSyncs + 1,
        successRate: ((prev.totalSyncs * prev.successRate / 100) + 1) / (prev.totalSyncs + 1) * 100,
        lastError: undefined
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      setSyncStats(prev => ({ ...prev, lastError: errorMessage }));
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [isEnabled]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!isEnabled) return false;

    try {
      setError(null);
      const result = await azureFunctionsService.testConnection();
      setIsConnected(result.success);
      
      if (!result.success) {
        setError(result.message);
      }
      
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      setIsConnected(false);
      return false;
    }
  }, [isEnabled]);

  // Check status on mount and periodically
  useEffect(() => {
    if (isEnabled) {
      checkStatus();
      
      // Check status every 5 minutes
      const interval = setInterval(checkStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isEnabled, checkStatus]);

  return {
    // Status
    isEnabled,
    isHealthy,
    isConnected,
    
    // Sync state
    isSyncing,
    lastSync,
    nextScheduledSync,
    
    // Functions
    triggerSync,
    checkStatus,
    testConnection,
    
    // Data
    syncStats,
    
    // Error handling
    error,
    clearError
  };
}

export default useAzureFunctions;
