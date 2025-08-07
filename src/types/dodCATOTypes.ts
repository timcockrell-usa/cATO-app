/**
 * DoD-Specific RBAC and Workflow Types
 * Implements the complete DoD authorization hierarchy for cATO processes
 */

// DoD-specific roles aligned with authorization hierarchy
export type DoDAORole = 
  | 'Engineer'                    // Basic engineering role
  | 'SecurityEngineer'           // Information Systems Security Engineer (ISSE)
  | 'ISSO'                       // Information Systems Security Officer
  | 'ISSM'                       // Information Systems Security Manager  
  | 'RiskManagementOfficer'      // Risk Management Officer (RMO)
  | 'AuthorizingOfficer'         // Authorizing Officer (AO)
  | 'ReadOnlyUser';              // View-only access

// Permission levels for granular access control
export type PermissionLevel = 
  | 'read'
  | 'write'
  | 'approve'
  | 'admin';

// Resource types that can be protected
export type ProtectedResource =
  | 'nist_controls'
  | 'zta_activities'
  | 'poam_items'
  | 'execution_enablers'
  | 'sssc_metrics'
  | 'compliance_reports'
  | 'risk_assessments'
  | 'tenant_management'
  | 'user_management'
  | 'audit_logs';

// DoD role permissions matrix
export interface DoDAORolePermissions {
  role: DoDAORole;
  permissions: {
    [key in ProtectedResource]: PermissionLevel[];
  };
  canApproveExceptions: boolean;
  approvalLevel: number; // 0 = no approval authority, higher = more authority
  description: string;
}

// POA&M approval workflow statuses
export type POAMApprovalStatus = 
  | 'Draft'
  | 'Submitted'
  | 'ISSE_Review'
  | 'ISSO_Review'
  | 'ISSM_Review'
  | 'RMO_Review'
  | 'AO_Review'
  | 'Approved'
  | 'Rejected'
  | 'Requires_Modification'
  | 'Withdrawn';

// Exception request types
export type ExceptionType = 
  | 'Risk_Acceptance'
  | 'Deviation_Request'
  | 'Implementation_Delay'
  | 'Alternative_Implementation'
  | 'Compensating_Control'
  | 'Operational_Exception';

// Approval action types
export type ApprovalAction = 
  | 'approve'
  | 'reject'
  | 'request_modification'
  | 'escalate'
  | 'delegate';

// Enhanced POA&M with DoD approval workflow
export interface EnhancedPOAMWithApproval {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  weakness: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Very_High';
  
  // DoD-specific workflow fields
  approvalStatus: POAMApprovalStatus;
  currentApprover?: string; // User ID of current approver
  approvalLevel: number; // Current level in approval hierarchy
  
  // Exception request details
  exceptionType?: ExceptionType;
  justification?: string;
  riskAcceptanceStatement?: string;
  compensatingControls?: string[];
  
  // Approval history
  approvalHistory: ApprovalHistoryEntry[];
  
  // Assignment and ownership
  submittedBy: string; // User ID (typically ISSE)
  assignedTo: string[]; // User IDs
  sponsor?: string; // Senior official sponsor
  
  // Dates and timeline
  submittedDate: string;
  targetApprovalDate: string;
  approvedDate?: string;
  lastActionDate: string;
  
  // Risk and impact
  riskLevel: 'Very_Low' | 'Low' | 'Moderate' | 'High' | 'Very_High';
  businessImpact: string;
  technicalImpact: string;
  
  // Implementation details
  proposedSolution: string;
  implementationPlan: string;
  testingRequirements: string;
  rollbackPlan: string;
  
  // Compliance tracking
  affectedControls: string[]; // NIST control IDs
  complianceFrameworks: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Approval history entry
export interface ApprovalHistoryEntry {
  id: string;
  timestamp: string;
  actorId: string; // User ID
  actorRole: DoDAORole;
  action: ApprovalAction;
  fromStatus: POAMApprovalStatus;
  toStatus: POAMApprovalStatus;
  comments?: string;
  attachments?: string[];
}

// Exception request payload
export interface ExceptionRequest {
  poamId: string;
  exceptionType: ExceptionType;
  justification: string;
  riskAcceptanceStatement: string;
  compensatingControls: string[];
  requestedBy: string; // User ID
  requestedDate: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  businessJustification: string;
  technicalJustification: string;
  proposedDuration: string; // How long the exception is needed
  reviewCriteria: string; // What conditions trigger review
}

// Approval action request
export interface ApprovalActionRequest {
  poamId: string;
  action: ApprovalAction;
  comments?: string;
  delegateToUserId?: string; // For delegation actions
  requiredModifications?: string[]; // For request_modification actions
  riskAssessmentComments?: string;
  recommendedNextSteps?: string;
}

// Execution Enabler for DOTmLPF-P tracking
export interface ExecutionEnabler {
  id: string;
  tenantId: string;
  category: DOTmLPFPCategory;
  name: string;
  description: string;
  
  // Status and maturity
  status: ExecutionEnablerStatus;
  maturityLevel: MaturityLevel;
  targetMaturityLevel: MaturityLevel;
  
  // Progress tracking
  completionPercentage: number;
  milestones: EnablerMilestone[];
  
  // Risk and impact
  riskLevel: 'Very_Low' | 'Low' | 'Moderate' | 'High' | 'Very_High';
  impactOnCATO: string;
  dependencies: string[];
  
  // Resources and timeline
  owner: string; // User ID
  stakeholders: string[]; // User IDs
  estimatedEffort: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  
  // Evidence and validation
  evidenceRequired: string[];
  evidenceProvided: EvidenceItem[];
  validationCriteria: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastAssessedDate: string;
  assessedBy: string; // User ID
}

// DOTmLPF-P categories
export type DOTmLPFPCategory = 
  | 'Doctrine'
  | 'Organization'
  | 'Training'
  | 'Materiel'
  | 'Leadership'
  | 'Personnel'
  | 'Facilities'
  | 'Policy';

// Execution enabler status
export type ExecutionEnablerStatus = 
  | 'Not_Started'
  | 'Planning'
  | 'In_Progress'
  | 'Testing'
  | 'Completed'
  | 'Validated'
  | 'Needs_Attention'
  | 'On_Hold'
  | 'Cancelled';

// Maturity levels for enablers
export type MaturityLevel = 
  | 'Initial'      // Ad hoc, chaotic processes
  | 'Developing'   // Some processes defined
  | 'Defined'      // Processes documented and standardized
  | 'Managed'      // Processes measured and controlled
  | 'Optimizing';  // Focus on continuous improvement

// Enabler milestone
export interface EnablerMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: 'Not_Started' | 'In_Progress' | 'Completed' | 'Overdue';
  deliverables: string[];
  dependencies: string[];
  owner: string; // User ID
}

// Evidence item
export interface EvidenceItem {
  id: string;
  type: 'Document' | 'Policy' | 'Procedure' | 'Training_Record' | 'Assessment' | 'Other';
  title: string;
  description: string;
  url?: string;
  uploadedBy: string; // User ID
  uploadedDate: string;
  verified: boolean;
  verifiedBy?: string; // User ID
  verifiedDate?: string;
}

// SSSC (Secure Software Supply Chain) metrics
export interface SSSCMetrics {
  id: string;
  tenantId: string;
  repositoryName: string;
  scanType: 'SAST' | 'SCA' | 'DAST' | 'Container' | 'IAST' | 'Secrets';
  
  // Vulnerability metrics
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  totalVulnerabilities: number;
  
  // Scan details
  lastScanDate: string;
  scanDuration: number; // in seconds
  scanStatus: 'Completed' | 'Failed' | 'In_Progress' | 'Queued';
  scanTool: string;
  scanVersion: string;
  
  // Compliance metrics
  passingPolicies: number;
  failingPolicies: number;
  totalPolicies: number;
  complianceScore: number; // 0-100
  
  // Remediation tracking
  remediatedVulnerabilities: number;
  openVulnerabilities: number;
  falsePositives: number;
  suppressedFindings: number;
  
  // SBOM and supply chain
  componentCount: number;
  licenseIssues: number;
  outdatedComponents: number;
  vulnerableComponents: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  reportUrl?: string;
  buildId?: string;
  commitHash?: string;
}

// DevSecOps ingestion payload
export interface DevSecOpsIngestionPayload {
  repositoryName: string;
  scanType: 'SAST' | 'SCA' | 'DAST' | 'Container' | 'IAST' | 'Secrets';
  scanResults: {
    vulnerabilities: VulnerabilityFinding[];
    policies: PolicyResult[];
    components: ComponentAnalysis[];
    metrics: ScanMetrics;
  };
  metadata: {
    scanTool: string;
    scanVersion: string;
    scanDate: string;
    buildId?: string;
    commitHash?: string;
    branch?: string;
  };
}

// Vulnerability finding
export interface VulnerabilityFinding {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  title: string;
  description: string;
  cve?: string;
  cwe?: string;
  cvssScore?: number;
  location: {
    file: string;
    line?: number;
    function?: string;
  };
  remediation?: string;
  riskRating: number; // 1-10 scale
}

// Policy result
export interface PolicyResult {
  policyId: string;
  policyName: string;
  status: 'Pass' | 'Fail' | 'Warning';
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  violations: number;
  details?: string;
}

// Component analysis
export interface ComponentAnalysis {
  name: string;
  version: string;
  license: string;
  vulnerabilities: number;
  isOutdated: boolean;
  latestVersion?: string;
  riskScore: number; // 1-10 scale
}

// Scan metrics
export interface ScanMetrics {
  duration: number; // seconds
  filesScanned: number;
  linesOfCode: number;
  testCoverage?: number;
  codeQualityScore?: number;
}

// User with DoD role
export interface DoDAOUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: DoDAORole;
  permissions: DoDAORolePermissions;
  
  // DoD-specific fields
  clearanceLevel?: 'Public_Trust' | 'Secret' | 'Top_Secret';
  organization: string;
  position: string;
  supervisor?: string; // User ID
  
  // Access tracking
  lastLogin: string;
  failedLoginAttempts: number;
  accountLocked: boolean;
  mustChangePassword: boolean;
  
  // Audit trail
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
}

// Dashboard summary for executive reporting
export interface DashboardSummary {
  tenantId: string;
  generatedAt: string;
  generatedBy: string; // User ID
  
  // Overall cATO health
  overallRiskScore: number; // 1-10 scale
  compliancePercentage: number;
  cATOReadiness: 'Not_Ready' | 'In_Progress' | 'Ready' | 'Authorized' | 'Continuous';
  
  // NIST controls summary
  nistControls: {
    total: number;
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    notAssessed: number;
  };
  
  // POA&M summary
  poamSummary: {
    total: number;
    pendingApproval: number;
    approved: number;
    overdue: number;
    highRisk: number;
  };
  
  // Execution enablers summary
  executionEnablers: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    atRisk: number;
  };
  
  // SSSC summary
  sssmetrics: {
    repositoriesScanned: number;
    criticalVulnerabilities: number;
    complianceScore: number;
    lastScanDate: string;
  };
  
  // Trends
  trends: {
    riskTrend: 'Improving' | 'Stable' | 'Degrading';
    complianceTrend: 'Improving' | 'Stable' | 'Degrading';
    vulnTrend: 'Improving' | 'Stable' | 'Degrading';
  };
}
