/**
 * Multi-Cloud cATO Platform Types
 * Defines interfaces for multi-tenant, multi-cloud continuous ATO support
 */

// Cloud Provider Types
export type CloudProvider = 'azure' | 'aws' | 'gcp' | 'oracle';

export interface CloudEnvironment {
  id: string;
  tenantId: string;
  name: string; // e.g., "Azure Prod", "AWS Dev"
  provider: CloudProvider;
  credentials: {
    keyVaultSecretId: string; // Reference to tenant's Key Vault secret
  };
  region: string;
  isActive: boolean;
  lastSync: string;
  syncStatus: 'connected' | 'error' | 'syncing' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

// Multi-Cloud Remediation Guidance
export interface MultiCloudRemediation {
  azure?: string;
  aws?: string;
  gcp?: string;
  oracle?: string;
}

// Enhanced NIST Control with Multi-Cloud Support
export interface EnhancedNISTControl {
  id: string;
  tenantId: string; // Multi-tenant isolation
  controlFamily: string;
  controlIdentifier: string;
  controlName: string;
  description: string;
  nistRevision: '4' | '5'; // NIST 800-53 revision
  
  // Multi-cloud remediation guidance
  remediation: MultiCloudRemediation;
  
  // Status per cloud environment
  environmentStatus: {
    [environmentId: string]: {
      status: 'compliant' | 'partial' | 'noncompliant' | 'not-assessed';
      lastAssessed: string;
      assessedBy: string;
      evidence?: string[];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  
  // Consolidated status (worst case across all environments)
  overallStatus: 'compliant' | 'partial' | 'noncompliant' | 'not-assessed';
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  poamItems?: string[];
  implementation: string;
  _ts?: number;
}

// Enhanced ZTA Activity with Multi-Cloud Support
export interface EnhancedZTAActivity {
  id: string;
  tenantId: string;
  pillar: string;
  capabilityId: string;
  capabilityName: string;
  activityId: string;
  activityName: string;
  phaseLevel: 'Target' | 'Advanced';
  description: string;
  
  // Multi-cloud implementation guidance
  implementation: MultiCloudRemediation;
  
  // Status per cloud environment
  environmentStatus: {
    [environmentId: string]: {
      status: 'complete' | 'in-progress' | 'planned' | 'not-started';
      maturity: number;
      lastUpdated: string;
      updatedBy: string;
    };
  };
  
  // Consolidated status
  overallStatus: 'complete' | 'in-progress' | 'planned' | 'not-started';
  overallMaturity: number;
  
  dependencies?: string[];
  mappedControls?: string[];
  _ts?: number;
}

// Tenant Management
export interface Tenant {
  id: string;
  organizationName: string;
  organizationType: 'government' | 'contractor' | 'commercial';
  nistRevision: '4' | '5';
  
  // FedRAMP Requirements
  fedRampLevel?: 'low' | 'moderate' | 'high';
  
  // Database isolation
  databaseEndpoint: string;
  keyVaultUri: string;
  
  // RBAC Configuration
  roles: TenantRole[];
  
  // Connected cloud environments
  cloudEnvironments: string[]; // Array of CloudEnvironment IDs
  
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// RBAC Types
export type DoDAORole = 
  | 'basic-viewer'
  | 'engineer' 
  | 'security-engineer-isse'
  | 'isso'
  | 'issm'
  | 'risk-management-officer'
  | 'authorizing-officer';

export interface TenantRole {
  userId: string;
  email: string;
  role: DoDAORole;
  permissions: string[];
  assignedAt: string;
  assignedBy: string;
}

// Cloud Connector Types
export interface CloudConnectorConfig {
  provider: CloudProvider;
  tenantId: string;
  environmentId: string;
  credentials: {
    keyVaultSecretId: string;
  };
  syncInterval: number; // in minutes
  isEnabled: boolean;
}

export interface ComplianceData {
  id: string;
  tenantId: string;
  environmentId: string;
  provider: CloudProvider;
  collectedAt: string;
  
  // Raw compliance data (provider-specific)
  rawData: any;
  
  // Normalized findings
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  id: string;
  provider: CloudProvider;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pass' | 'fail' | 'manual' | 'not-applicable';
  
  // Mapping to NIST controls
  mappedControls: string[];
  
  // Provider-specific details
  resourceId?: string;
  ruleName?: string;
  description: string;
  remediation?: string;
  
  discoveredAt: string;
  lastChecked: string;
}

// POA&M Enhanced for Multi-Cloud
export interface EnhancedPOAMItem {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  
  // Multi-environment impact
  affectedEnvironments: string[]; // CloudEnvironment IDs
  relatedControls: string[];
  
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'closed' | 'rejected';
  
  // RBAC Workflow
  assignee: string;
  approvalChain: POAMApproval[];
  
  // eMASS Integration
  emassId?: string;
  lastSyncedWithEmass?: string;
  
  dueDate: string;
  createdDate: string;
  lastUpdated: string;
  
  mitigationSteps: string[];
  evidence?: string[];
  _ts?: number;
}

export interface POAMApproval {
  approverRole: DoDAORole;
  approverUserId: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp?: string;
}

// SSSC Dashboard Types
export interface SSCMetrics {
  id: string;
  tenantId: string;
  environmentId: string;
  
  // DevSecOps Pipeline Metrics
  sastResults: {
    totalScans: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    lastScanDate: string;
  };
  
  scaResults: {
    totalComponents: number;
    vulnerableComponents: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    lastScanDate: string;
  };
  
  containerSecurity: {
    totalImages: number;
    vulnerableImages: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    lastScanDate: string;
  };
  
  collectedAt: string;
}

// DOTmLPF-P Execution Enablers
export interface ExecutionEnabler {
  id: string;
  tenantId: string;
  category: 'doctrine' | 'organization' | 'training' | 'materiel' | 'leadership' | 'personnel' | 'facilities' | 'policy';
  name: string;
  description: string;
  status: 'complete' | 'in-progress' | 'planned' | 'not-started';
  assignee?: string;
  dueDate?: string;
  lastUpdated: string;
  updatedBy: string;
  evidence?: string[];
  _ts?: number;
}
