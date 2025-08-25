/**
 * Navigation Service
 * 
 * Provides centralized navigation and filtering functionality
 * for executive dashboard chart interactions and cross-page navigation
 */

import { NavigateFunction } from 'react-router-dom';

export interface NavigationFilter {
  filterType: 'status' | 'risk' | 'family' | 'pillar' | 'category';
  filterValue: string;
  sourceChart?: string;
}

export interface DashboardNavigationService {
  navigateToNistControls: (navigate: NavigateFunction, filter?: NavigationFilter) => void;
  navigateToZeroTrust: (navigate: NavigateFunction, filter?: NavigationFilter) => void;
  navigateToPOAM: (navigate: NavigateFunction, filter?: NavigationFilter) => void;
  navigateToExecutionEnablers: (navigate: NavigateFunction, filter?: NavigationFilter) => void;
  storeNavigationContext: (context: NavigationFilter) => void;
  getNavigationContext: () => NavigationFilter | null;
  clearNavigationContext: () => void;
}

class NavigationService implements DashboardNavigationService {
  private readonly NAVIGATION_CONTEXT_KEY = 'cato_navigation_context';

  /**
   * Navigate to NIST Controls page with optional filtering
   */
  navigateToNistControls(navigate: NavigateFunction, filter?: NavigationFilter): void {
    if (filter) {
      this.storeNavigationContext(filter);
    }
    navigate('/nist-controls');
  }

  /**
   * Navigate to Zero Trust page with optional filtering
   */
  navigateToZeroTrust(navigate: NavigateFunction, filter?: NavigationFilter): void {
    if (filter) {
      this.storeNavigationContext(filter);
    }
    navigate('/zero-trust');
  }

  /**
   * Navigate to POA&M page with optional filtering
   */
  navigateToPOAM(navigate: NavigateFunction, filter?: NavigationFilter): void {
    if (filter) {
      this.storeNavigationContext(filter);
    }
    navigate('/poam');
  }

  /**
   * Navigate to Execution Enablers page with optional filtering
   */
  navigateToExecutionEnablers(navigate: NavigateFunction, filter?: NavigationFilter): void {
    if (filter) {
      this.storeNavigationContext(filter);
    }
    navigate('/execution-enablers');
  }

  /**
   * Store navigation context in sessionStorage
   */
  storeNavigationContext(context: NavigationFilter): void {
    try {
      sessionStorage.setItem(this.NAVIGATION_CONTEXT_KEY, JSON.stringify(context));
    } catch (error) {
      console.warn('Failed to store navigation context:', error);
    }
  }

  /**
   * Retrieve navigation context from sessionStorage
   */
  getNavigationContext(): NavigationFilter | null {
    try {
      const stored = sessionStorage.getItem(this.NAVIGATION_CONTEXT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve navigation context:', error);
      return null;
    }
  }

  /**
   * Clear navigation context from sessionStorage
   */
  clearNavigationContext(): void {
    try {
      sessionStorage.removeItem(this.NAVIGATION_CONTEXT_KEY);
    } catch (error) {
      console.warn('Failed to clear navigation context:', error);
    }
  }
}

// Export singleton instance
export const navigationService = new NavigationService();

/**
 * Hook for components to handle navigation context
 */
export const useNavigationContext = () => {
  const getContext = () => navigationService.getNavigationContext();
  const clearContext = () => navigationService.clearNavigationContext();
  
  return { getContext, clearContext };
};

/**
 * Chart click handlers for different chart types
 */
export const chartClickHandlers = {
  
  /**
   * Handle clicks on NIST Compliance pie chart
   */
  handleNistComplianceClick: (data: any, navigate: NavigateFunction) => {
    const statusMap: Record<string, string> = {
      'Compliant': 'compliant',
      'Partial': 'partial', 
      'Non-Compliant': 'noncompliant',
      'Unknown': 'unknown'
    };

    const filter: NavigationFilter = {
      filterType: 'status',
      filterValue: statusMap[data.name] || data.name.toLowerCase(),
      sourceChart: 'nist-compliance-pie'
    };

    navigationService.navigateToNistControls(navigate, filter);
  },

  /**
   * Handle clicks on status charts from dashboard
   */
  handleStatusChartClick: (status: string, navigate: NavigateFunction) => {
    const filter: NavigationFilter = {
      filterType: 'status',
      filterValue: status,
      sourceChart: 'dashboard-status-chart'
    };

    navigationService.navigateToNistControls(navigate, filter);
  },

  /**
   * Handle clicks on ZTA charts from dashboard
   */
  handleZTAChartClick: (pillar: string, navigate: NavigateFunction) => {
    const filter: NavigationFilter = {
      filterType: 'pillar',
      filterValue: pillar,
      sourceChart: 'dashboard-zta-chart'
    };

    navigationService.navigateToZeroTrust(navigate, filter);
  },

  /**
   * Handle clicks on Risk Trend bar chart
   */
  handleRiskTrendClick: (data: any, navigate: NavigateFunction) => {
    const riskLevelMap: Record<string, string> = {
      'high': 'High',
      'medium': 'Medium', 
      'low': 'Low'
    };

    // Get the clicked risk level from the bar chart data
    const clickedRiskLevel = Object.keys(riskLevelMap).find(key => 
      data.payload && data.payload[key] !== undefined
    );

    if (clickedRiskLevel) {
      const filter: NavigationFilter = {
        filterType: 'risk',
        filterValue: riskLevelMap[clickedRiskLevel],
        sourceChart: 'risk-trend-bar'
      };

      navigationService.navigateToPOAM(navigate, filter);
    }
  },

  /**
   * Handle clicks on ZTA Maturity radar chart
   */
  handleZTAMaturityClick: (data: any, navigate: NavigateFunction) => {
    const filter: NavigationFilter = {
      filterType: 'pillar',
      filterValue: data.pillar,
      sourceChart: 'zta-maturity-radar'
    };

    navigationService.navigateToZeroTrust(navigate, filter);
  },

  /**
   * Handle clicks on dashboard cards/tabs
   */
  handleDashboardTabClick: (tabName: string, navigate: NavigateFunction) => {
    const tabRoutes: Record<string, string> = {
      'nist': '/nist-controls',
      'nist-controls': '/nist-controls',
      'zero-trust': '/zero-trust',
      'zta': '/zero-trust',
      'poam': '/poam',
      'poa-m': '/poam',
      'execution-enablers': '/execution-enablers',
      'enablers': '/execution-enablers',
      'continuous-monitoring': '/continuous-monitoring',
      'monitoring': '/continuous-monitoring'
    };

    const route = tabRoutes[tabName.toLowerCase().replace(/\s+/g, '-')];
    if (route) {
      navigate(route);
    }
  }
};

/**
 * Filter utilities for different page types
 */
export const filterUtils = {
  
  /**
   * Apply NIST control filtering based on navigation context
   */
  applyNistControlFilter: (controls: any[], filter: NavigationFilter) => {
    if (filter.filterType === 'status') {
      return controls.filter(control => control.status === filter.filterValue);
    }
    if (filter.filterType === 'family') {
      return controls.filter(control => control.family === filter.filterValue);
    }
    return controls;
  },

  /**
   * Apply POA&M filtering based on navigation context  
   */
  applyPOAMFilter: (poamItems: any[], filter: NavigationFilter) => {
    if (filter.filterType === 'risk') {
      return poamItems.filter(item => item.riskLevel === filter.filterValue);
    }
    if (filter.filterType === 'status') {
      return poamItems.filter(item => item.status === filter.filterValue);
    }
    return poamItems;
  },

  /**
   * Apply Zero Trust filtering based on navigation context
   */
  applyZTAFilter: (activities: any[], filter: NavigationFilter) => {
    if (filter.filterType === 'pillar') {
      return activities.filter(activity => activity.pillar === filter.filterValue);
    }
    if (filter.filterType === 'status') {
      return activities.filter(activity => activity.status === filter.filterValue);
    }
    return activities;
  },

  /**
   * Apply Execution Enablers filtering based on navigation context
   */
  applyExecutionEnablersFilter: (enablers: any[], filter: NavigationFilter) => {
    if (filter.filterType === 'category') {
      return enablers.filter(enabler => enabler.category === filter.filterValue);
    }
    if (filter.filterType === 'status') {
      return enablers.filter(enabler => enabler.status === filter.filterValue);
    }
    return enablers;
  }
};
