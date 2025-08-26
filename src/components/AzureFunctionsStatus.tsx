/**
 * Azure Functions Status Component
 * Displays current status and sync information for Azure Functions integration
 */

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useAzureFunctions } from '../hooks/useAzureFunctions';

interface AzureFunctionsStatusProps {
  showControls?: boolean;
  compact?: boolean;
}

export function AzureFunctionsStatus({ 
  showControls = true, 
  compact = false 
}: AzureFunctionsStatusProps) {
  const {
    isEnabled,
    isHealthy,
    isConnected,
    isSyncing,
    lastSync,
    nextScheduledSync,
    triggerSync,
    checkStatus,
    syncStats,
    error,
    clearError
  } = useAzureFunctions();

  const handleManualSync = async () => {
    try {
      await triggerSync();
    } catch (error) {
      // Error is already handled by the hook
      console.error('Manual sync failed:', error);
    }
  };

  const getStatusBadge = () => {
    if (!isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (isSyncing) {
      return <Badge variant="default" className="animate-pulse">Syncing</Badge>;
    }
    if (isHealthy && isConnected) {
      return <Badge variant="default">Connected</Badge>;
    }
    if (error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getStatusIcon = () => {
    if (!isEnabled) {
      return <Database className="w-4 h-4 text-muted-foreground" />;
    }
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (isHealthy && isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const formatTimeAgo = (timestamp: string | null): string => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    }
    return `${diffMinutes}m ago`;
  };

  const getNextSyncTime = (): string => {
    if (!nextScheduledSync) return 'Unknown';
    
    const now = new Date();
    const next = new Date(nextScheduledSync);
    const diffMs = next.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Overdue';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm">Azure Functions</span>
        {getStatusBadge()}
        {showControls && isEnabled && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleManualSync}
            disabled={isSyncing || !isConnected}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Azure Functions Integration
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEnabled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Azure Functions integration is not configured. Check your environment variables.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button size="sm" variant="ghost" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isEnabled && (
          <>
            {/* Sync Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Last Sync</span>
                </div>
                <p className="text-sm font-medium">{formatTimeAgo(lastSync)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Next Sync</span>
                </div>
                <p className="text-sm font-medium">{getNextSyncTime()}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Success Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={syncStats.successRate} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{syncStats.successRate.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total syncs: {syncStats.totalSyncs}</span>
              {syncStats.lastError && (
                <span className="text-red-500">Last error: {syncStats.lastError}</span>
              )}
            </div>

            {/* Controls */}
            {showControls && (
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleManualSync}
                  disabled={isSyncing || !isConnected}
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Manual Sync'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={checkStatus}
                  disabled={isSyncing}
                  size="sm"
                >
                  Check Status
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AzureFunctionsStatus;
