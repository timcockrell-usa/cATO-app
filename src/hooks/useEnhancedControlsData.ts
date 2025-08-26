import { useState, useEffect } from 'react';
import { dataSyncService } from '@/services/dataSyncService';
import { useNotificationStore } from '@/stores/notificationStore';

// Import the controls data
const { nistControlsFromCSV } = require('@/data/nistControlsEnhanced');

export function useEnhancedControlsData() {
  console.log('🛡️ useEnhancedControlsData hook is loading...');
  const [controls, setControls] = useState(nistControlsFromCSV);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  // Apply enhanced assessment on initial load
  useEffect(() => {
    console.log('🛡️ Starting enhanced controls assessment...');
    const enhancedControls = dataSyncService.enhanceControlAssessment(nistControlsFromCSV);
    setControls(enhancedControls);
    
    // Add notification about enhanced assessment
    addNotification({
      title: 'Azure Shared Responsibility Assessment Applied',
      message: `Enhanced assessment applied to ${enhancedControls.length} NIST controls based on Azure shared responsibility model`,
      type: 'success',
      actionUrl: '/nist',
      actionText: 'View Controls'
    });
  }, [addNotification]);

  const triggerSync = async () => {
    setLoading(true);
    try {
      const result = await dataSyncService.triggerManualSync('azure-shared-responsibility');
      
      if (result.success) {
        // Apply enhanced assessment to controls
        const enhancedControls = dataSyncService.enhanceControlAssessment(nistControlsFromCSV);
        setControls(enhancedControls);
        setLastSync(result.timestamp || new Date().toISOString());
        
        addNotification({
          title: 'Control Assessment Updated',
          message: `${result.controlsUpdated || enhancedControls.length} controls updated with Azure shared responsibility assessment`,
          type: 'success',
          actionUrl: '/nist',
          actionText: 'View Updated Controls'
        });
      } else {
        addNotification({
          title: 'Sync Failed',
          message: result.message || 'Failed to sync control assessments',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      addNotification({
        title: 'Sync Error',
        message: 'An error occurred while syncing control assessments',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getComplianceMetrics = () => {
    const compliant = controls.filter(c => c.status === 'compliant').length;
    const partial = controls.filter(c => c.status === 'partial').length;
    const noncompliant = controls.filter(c => c.status === 'noncompliant').length;
    const notAssessed = controls.filter(c => c.status === 'not-assessed').length;
    const total = controls.length;

    return {
      compliant,
      partial,
      noncompliant,
      notAssessed,
      total,
      compliancePercentage: Math.round((compliant / total) * 100)
    };
  };

  const getAzureManagedControls = () => {
    return controls.filter(c => 
      c.azureInherited === true || 
      c.azureInherited === 'true' || 
      c.providerCovered === 'full'
    );
  };

  const getSharedResponsibilityControls = () => {
    return controls.filter(c => 
      c.providerCovered === 'partial' && 
      c.azureSharedResponsibility
    );
  };

  return {
    controls,
    loading,
    lastSync,
    triggerSync,
    getComplianceMetrics,
    getAzureManagedControls,
    getSharedResponsibilityControls
  };
}
