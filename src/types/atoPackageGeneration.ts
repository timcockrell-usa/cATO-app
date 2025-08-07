/**
 * ATO Package Generation Types
 * TypeScript interfaces for automated ATO document generation
 */

export interface SystemSecurityPlan {
  systemName: string;
  systemOwner: string;
  securityCategorization: 'Low' | 'Moderate' | 'High';
  systemType: 'Major Application' | 'General Support System' | 'Minor Application';
  operationalStatus: 'Operational' | 'Under Development' | 'Major Modification';
  authorizationBoundary: string;
  systemDescription: string;
  systemEnvironment: 'Production' | 'Development' | 'Test' | 'Staging';
  
  // Control implementation details
  controls: ControlImplementation[];
  
  // System characteristics
  systemCharacteristics: {
    users: {
      privilegedUsers: number;
      generalUsers: number;
      guestUsers: number;
    };
    dataTypes: string[];
    interconnections: SystemInterconnection[];
    cloudServices: CloudService[];
  };
  
  // Authorization details
  authorization: {
    authorizingOfficial: string;
    authorizationDate: string;
    authorizationTerminationDate: string;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  };
}

export interface ControlImplementation {
  controlId: string;
  controlName: string;
  controlFamily: string;
  implementationStatus: 'Implemented' | 'Partially Implemented' | 'Planned' | 'Alternative Implementation' | 'Not Applicable';
  inheritanceStatus: 'Inherited' | 'Hybrid' | 'System-Specific';
  implementationStatement: string;
  responsibleRole: string;
  implementationGuidance: string;
  assessmentProcedures: string;
  complianceEvidence: string[];
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  remediation?: {
    required: boolean;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    estimatedEffort: string;
    targetDate: string;
  };
}

export interface SystemInterconnection {
  connectedSystemName: string;
  connectionType: 'Internet' | 'Intranet' | 'Extranet' | 'Dedicated';
  dataDirection: 'Incoming' | 'Outgoing' | 'Bidirectional';
  informationType: string;
  securityCategorization: 'Low' | 'Moderate' | 'High';
  authorizationStatus: 'Authorized' | 'Pending' | 'Denied';
}

export interface CloudService {
  serviceName: string;
  provider: 'Azure' | 'AWS' | 'GCP' | 'Oracle' | 'Other';
  serviceType: 'IaaS' | 'PaaS' | 'SaaS';
  fedRampStatus: 'Authorized' | 'In Process' | 'Not Applicable';
  securityCategorization: 'Low' | 'Moderate' | 'High';
}

export interface POAMItem {
  poamId: string;
  weaknessId: string;
  weaknessDescription: string;
  relatedControlId: string;
  findingSource: 'Security Assessment' | 'Continuous Monitoring' | 'Self-Assessment' | 'External Audit';
  findingDetails: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  threatStatement: string;
  vulnerabilityStatement: string;
  recommendedCorrectiveAction: string;
  remediationPlan: string;
  resourcesRequired: string;
  milestones: POAMMilestone[];
  responsibleRole: string;
  scheduledCompletionDate: string;
  actualCompletionDate?: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Risk Accepted' | 'False Positive';
  vendorDependency: boolean;
  costImpact: 'Low' | 'Medium' | 'High';
  businessImpact: 'Low' | 'Medium' | 'High';
  originalDetectionDate: string;
  lastUpdated: string;
}

export interface POAMMilestone {
  milestoneId: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  responsibleParty: string;
}

export interface ATOPackage {
  packageName: string;
  generationDate: string;
  packageVersion: string;
  tenantId: string;
  organizationName: string;
  
  // Package metadata
  metadata: {
    generatedBy: string;
    totalControls: number;
    compliantControls: number;
    nonCompliantControls: number;
    totalPOAMItems: number;
    highRiskItems: number;
    packageSize: string;
    expirationDate: string;
  };
  
  // Embedded data structures
  systemSecurityPlan: SystemSecurityPlan;
  planOfActionAndMilestones: POAMItem[];
  
  // Additional compliance data
  complianceMetrics: {
    overallCompliancePercentage: number;
    controlFamilyCompliance: ControlFamilyCompliance[];
    riskProfile: RiskProfile;
    continuousMonitoringStatus: ContinuousMonitoringStatus;
  };
  
  // Zero Trust Architecture data
  zeroTrustAssessment?: {
    maturityLevel: 'Traditional' | 'Advanced' | 'Optimal';
    pillarReadiness: ZTAPillarReadiness[];
    overallScore: number;
  };
  
  // Execution enablers (DOTmLPF-P)
  executionEnablers?: {
    doctrine: ExecutionEnablerStatus;
    organization: ExecutionEnablerStatus;
    training: ExecutionEnablerStatus;
    materiel: ExecutionEnablerStatus;
    leadership: ExecutionEnablerStatus;
    personnel: ExecutionEnablerStatus;
    facilities: ExecutionEnablerStatus;
    policy: ExecutionEnablerStatus;
  };
}

export interface ControlFamilyCompliance {
  family: string;
  familyName: string;
  totalControls: number;
  compliantControls: number;
  compliancePercentage: number;
}

export interface RiskProfile {
  overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  highRiskControlsCount: number;
  mediumRiskControlsCount: number;
  lowRiskControlsCount: number;
  acceptedRisksCount: number;
}

export interface ContinuousMonitoringStatus {
  isActive: boolean;
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  monitoringFrequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  automatedToolsUsed: string[];
}

export interface ZTAPillarReadiness {
  pillar: string;
  maturityLevel: 'Traditional' | 'Advanced' | 'Optimal';
  score: number;
  capabilities: ZTACapability[];
}

export interface ZTACapability {
  name: string;
  status: 'Not Started' | 'In Progress' | 'Implemented';
  maturityLevel: number;
}

export interface ExecutionEnablerStatus {
  name: string;
  status: 'Not Addressed' | 'Partially Addressed' | 'Largely Addressed' | 'Fully Addressed';
  score: number;
  description: string;
  gaps: string[];
  recommendations: string[];
}

// eMASS-specific interfaces for CSV export
export interface eMASS_POAMExport {
  'Control Vulnerability Description': string;
  'Security Control Number (e.g., AC-1)': string;
  'Office/Org': string;
  'Security Control Name': string;
  'Raw Severity Value': 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  'Adjusted Severity Value': 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  'Relevance of Threat': 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  'Threat Description': string;
  'Likelihood': 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  'Impact': 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  'Impact Description': string;
  'Residual Risk Level': 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  'Recommendations': string;
  'Scheduled Completion Date': string;
  'Milestone with Completion Dates': string;
  'Milestone Changes': string;
  'Source Identifying Vulnerability': string;
  'Status': 'Ongoing' | 'Risk Accepted' | 'Completed' | 'Not Applicable';
  'Comments': string;
}

// Export generation requests
export interface DocumentExportRequest {
  tenantId: string;
  documentType: 'ssp' | 'poam-pdf' | 'poam-csv' | 'ato-package';
  options?: {
    includeClassified?: boolean;
    includeEvidence?: boolean;
    format?: 'pdf' | 'csv' | 'zip';
    templateVersion?: string;
  };
}

export interface DocumentExportResponse {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  expirationDate?: string;
  error?: string;
}
