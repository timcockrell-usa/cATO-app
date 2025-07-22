// POA&M Management and eMASS Integration Types
// Supports the full lifecycle of Plans of Action & Milestones with eMASS synchronization

import { UserRole } from '../config/authConfig';
import { ComplianceStatus, ImpactLevel } from './organization';

export interface POAM {
  id: string;
  organizationId: string;
  environmentId?: string; // Optional - can be organization-wide
  title: string;
  description: string;
  weakness: WeaknessReference;
  severity: RiskLevel;
  status: POAMStatus;
  
  // Assignment and ownership
  owner: string; // User ID
  assignedTo: string[]; // User IDs
  sponsor?: string; // Senior official sponsor
  
  // Dates and timeline
  createdAt: Date;
  updatedAt: Date;
  identifiedDate: Date;
  scheduledCompletionDate: Date;
  actualCompletionDate?: Date;
  
  // Resources and cost
  resourcesRequired: ResourceRequirement[];
  estimatedCost: number;
  actualCost?: number;
  
  // Milestones and progress
  milestones: POAMMilestone[];
  progress: ProgressTracking;
  
  // Risk and impact
  riskAssessment: RiskAssessment;
  businessImpact: BusinessImpact;
  
  // Remediation details
  remediationPlan: RemediationPlan;
  testingPlan?: TestingPlan;
  
  // Compliance and controls
  affectedControls: ControlReference[];
  complianceFramework: ComplianceFramework[];
  
  // eMASS integration
  emassData: EmassPoamData;
  
  // Workflow and approvals
  workflow: POAMWorkflow;
  
  // Attachments and evidence
  attachments: POAMAttachment[];
  evidenceLinks: EvidenceLink[];
  
  // Audit trail
  history: POAMHistoryEntry[];
  
  // Risk exception handling
  exceptionRequest?: RiskExceptionRequest;
}

export type POAMStatus = 
  | 'Draft'
  | 'Submitted' 
  | 'UnderReview'
  | 'Approved'
  | 'InProgress'
  | 'Completed'
  | 'OnHold'
  | 'Cancelled'
  | 'Overdue'
  | 'RequiresReview';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface WeaknessReference {
  type: WeaknessType;
  identifier: string;
  title: string;
  description: string;
  source: string; // Scanner, manual assessment, etc.
}

export type WeaknessType = 
  | 'Control'
  | 'Finding'
  | 'Vulnerability'
  | 'ConfigurationGap'
  | 'PolicyGap'
  | 'ProcessGap';

export interface ResourceRequirement {
  type: ResourceType;
  description: string;
  quantity: number;
  unitCost?: number;
  vendor?: string;
  justification: string;
}

export type ResourceType = 
  | 'Personnel'
  | 'Software'
  | 'Hardware'
  | 'Service'
  | 'Training'
  | 'Consulting';

export interface POAMMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  owner: string;
  dependencies: string[]; // Other milestone IDs
  deliverables: Deliverable[];
  acceptanceCriteria: string[];
}

export type MilestoneStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Delayed' | 'Blocked';

export interface Deliverable {
  name: string;
  type: DeliverableType;
  description: string;
  dueDate: Date;
  status: DeliverableStatus;
  owner: string;
  location?: string; // File path, URL, etc.
}

export type DeliverableType = 
  | 'Document'
  | 'Configuration'
  | 'Code'
  | 'Report'
  | 'Training'
  | 'Process'
  | 'System';

export type DeliverableStatus = 'Pending' | 'InProgress' | 'UnderReview' | 'Approved' | 'Rejected';

export interface ProgressTracking {
  overallPercentage: number;
  milestoneProgress: Record<string, number>;
  lastUpdated: Date;
  updatedBy: string;
  blockers: Blocker[];
  risks: ProjectRisk[];
}

export interface Blocker {
  id: string;
  description: string;
  impact: ImpactLevel;
  identifiedDate: Date;
  owner: string;
  status: BlockerStatus;
  resolution?: string;
  resolvedDate?: Date;
}

export type BlockerStatus = 'Active' | 'InProgress' | 'Resolved' | 'Escalated';

export interface ProjectRisk {
  id: string;
  description: string;
  probability: RiskProbability;
  impact: ImpactLevel;
  mitigation: string;
  contingency?: string;
  owner: string;
  status: RiskStatus;
}

export type RiskProbability = 'VeryHigh' | 'High' | 'Medium' | 'Low' | 'VeryLow';

export type RiskStatus = 'Identified' | 'Analyzing' | 'Mitigating' | 'Monitoring' | 'Closed';

export interface RiskAssessment {
  currentRiskLevel: RiskLevel;
  residualRiskLevel: RiskLevel;
  riskScore: number; // Calculated risk score
  likelihood: RiskProbability;
  impact: ImpactLevel;
  riskFactors: RiskFactor[];
  mitigatingFactors: MitigatingFactor[];
  assessedBy: string;
  assessedDate: Date;
  nextReviewDate: Date;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface MitigatingFactor {
  factor: string;
  effectiveness: EffectivenessRating;
  description: string;
}

export type EffectivenessRating = 'VeryHigh' | 'High' | 'Medium' | 'Low' | 'Minimal';

export interface BusinessImpact {
  operationalImpact: ImpactAssessment;
  financialImpact: ImpactAssessment;
  reputationalImpact: ImpactAssessment;
  complianceImpact: ImpactAssessment;
  overallImpact: ImpactLevel;
  affectedSystems: string[];
  affectedUsers: number;
  businessProcesses: string[];
}

export interface ImpactAssessment {
  level: ImpactLevel;
  description: string;
  quantifiedImpact?: string;
  timeframe: string;
}

export interface RemediationPlan {
  approach: RemediationApproach;
  steps: RemediationStep[];
  timeline: RemediationTimeline;
  resources: ResourceAllocation[];
  dependencies: Dependency[];
  successCriteria: string[];
  rollbackPlan?: RollbackPlan;
}

export type RemediationApproach = 'Fix' | 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';

export interface RemediationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  owner: string;
  estimatedEffort: number; // hours
  dependencies: string[];
  deliverables: string[];
  verificationMethod: string;
  status: StepStatus;
}

export type StepStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Verified' | 'Failed';

export interface RemediationTimeline {
  phases: TimelinePhase[];
  criticalPath: string[];
  bufferTime: number; // days
  contingencyTime: number; // days
}

export interface TimelinePhase {
  name: string;
  startDate: Date;
  endDate: Date;
  activities: string[];
  dependencies: string[];
}

export interface ResourceAllocation {
  resource: string;
  allocation: number; // percentage or hours
  startDate: Date;
  endDate: Date;
  role: string;
}

export interface Dependency {
  id: string;
  type: DependencyType;
  description: string;
  dependsOn: string;
  impact: ImpactLevel;
  status: DependencyStatus;
}

export type DependencyType = 'Internal' | 'External' | 'Technical' | 'Resource' | 'Process';

export type DependencyStatus = 'NotStarted' | 'InProgress' | 'Satisfied' | 'Blocked';

export interface RollbackPlan {
  triggers: string[];
  steps: RollbackStep[];
  timeframe: number; // minutes
  approvalRequired: boolean;
  dataBackup: BackupStrategy;
}

export interface RollbackStep {
  order: number;
  action: string;
  responsibility: string;
  estimatedTime: number; // minutes
  verificationStep: string;
}

export interface BackupStrategy {
  type: BackupType;
  location: string;
  retention: number; // days
  verificationRequired: boolean;
}

export type BackupType = 'Full' | 'Incremental' | 'Differential' | 'Configuration' | 'Database';

export interface TestingPlan {
  phases: TestPhase[];
  environment: TestEnvironment;
  criteria: TestCriteria;
  schedule: TestSchedule;
}

export interface TestPhase {
  name: string;
  type: TestType;
  objectives: string[];
  scope: string[];
  methods: TestMethod[];
  duration: number; // hours
  resources: string[];
}

export type TestType = 'Unit' | 'Integration' | 'System' | 'Acceptance' | 'Performance' | 'Security' | 'Regression';

export interface TestMethod {
  name: string;
  description: string;
  automatedTools: string[];
  manualSteps: string[];
  expectedResults: string[];
}

export interface TestEnvironment {
  name: string;
  description: string;
  configuration: string[];
  dataRequirements: string[];
  constraints: string[];
}

export interface TestCriteria {
  passCriteria: string[];
  failCriteria: string[];
  acceptanceThreshold: number; // percentage
  performanceBaseline: PerformanceBaseline[];
}

export interface PerformanceBaseline {
  metric: string;
  baseline: number;
  threshold: number;
  unit: string;
}

export interface TestSchedule {
  phases: SchedulePhase[];
  dependencies: string[];
  resources: ScheduleResource[];
}

export interface SchedulePhase {
  name: string;
  startDate: Date;
  endDate: Date;
  prerequisites: string[];
}

export interface ScheduleResource {
  name: string;
  type: string;
  availability: ResourceAvailability[];
}

export interface ResourceAvailability {
  startDate: Date;
  endDate: Date;
  capacity: number; // percentage
}

export interface ControlReference {
  framework: string; // NIST, ISO, etc.
  controlId: string;
  controlName: string;
  implementationStatus: ComplianceStatus;
  responsibilityMatrix: ResponsibilityMatrix;
}

export interface ResponsibilityMatrix {
  responsible: string[];
  accountable: string[];
  consulted: string[];
  informed: string[];
}

export type ComplianceFramework = 
  | 'NIST-800-53'
  | 'ISO-27001'
  | 'FedRAMP'
  | 'FISMA'
  | 'SOC2'
  | 'PCI-DSS'
  | 'HIPAA'
  | 'GDPR'
  | 'Custom';

export interface EmassPoamData {
  systemId?: string;
  poamId?: string;
  externalId?: string;
  status: EmassStatus;
  lastSyncAt?: Date;
  syncStatus: SyncStatus;
  syncErrors?: string[];
  
  // eMASS specific fields
  scheduledCompletionDate: Date;
  milestones: EmassMillestone[];
  resources: EmassResource[];
  comments: EmassComment[];
  
  // Sync configuration
  autoSync: boolean;
  syncFrequency: SyncFrequency;
  fieldMappings: EmassFieldMapping[];
}

export type EmassStatus = 
  | 'Ongoing'
  | 'Risk Accepted'
  | 'Completed'
  | 'Not Applicable';

export type SyncStatus = 'Success' | 'Failed' | 'Pending' | 'InProgress' | 'Disabled';

export interface EmassMillestone {
  milestoneId?: string;
  description: string;
  scheduledCompletion: Date;
  actualCompletion?: Date;
}

export interface EmassResource {
  resourceType: string;
  cost: number;
  description: string;
}

export interface EmassComment {
  date: Date;
  author: string;
  comment: string;
  commentType: EmassCommentType;
}

export type EmassCommentType = 'Status Update' | 'Risk Assessment' | 'Mitigation' | 'General';

export type SyncFrequency = 'Manual' | 'Daily' | 'Weekly' | 'BiWeekly' | 'Monthly';

export interface EmassFieldMapping {
  localField: string;
  emassField: string;
  transformation?: string;
  required: boolean;
}

export interface POAMWorkflow {
  currentState: WorkflowState;
  history: WorkflowTransition[];
  approvals: WorkflowApproval[];
  notifications: WorkflowNotification[];
}

export interface WorkflowState {
  name: string;
  description: string;
  allowedTransitions: string[];
  requiredApprovals: ApprovalLevel[];
  timeLimit?: number; // days
  autoTransitions: AutoTransition[];
}

export interface WorkflowTransition {
  id: string;
  fromState: string;
  toState: string;
  triggeredBy: string;
  triggeredAt: Date;
  reason?: string;
  data?: Record<string, any>;
}

export interface WorkflowApproval {
  level: ApprovalLevel;
  approver: string;
  status: ApprovalStatus;
  requestedAt: Date;
  respondedAt?: Date;
  comments?: string;
  conditions?: ApprovalCondition[];
}

export type ApprovalLevel = 'Engineer' | 'ISSE' | 'ISSO' | 'ISSM' | 'RMO' | 'AO';

export type ApprovalStatus = 
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'ConditionallyApproved'
  | 'Delegated'
  | 'Escalated';

export interface ApprovalCondition {
  condition: string;
  dueDate?: Date;
  status: ConditionStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export type ConditionStatus = 'Pending' | 'Satisfied' | 'Failed' | 'Waived';

export interface AutoTransition {
  condition: TransitionCondition;
  targetState: string;
  delay?: number; // days
}

export interface TransitionCondition {
  type: ConditionType;
  field: string;
  operator: string;
  value: any;
}

export type ConditionType = 'FieldValue' | 'DateExpired' | 'ApprovalReceived' | 'MilestoneCompleted';

export interface WorkflowNotification {
  id: string;
  type: NotificationType;
  recipients: NotificationRecipient[];
  template: string;
  data: Record<string, any>;
  scheduledAt: Date;
  sentAt?: Date;
  status: NotificationStatus;
}

export type NotificationType = 
  | 'StateChange'
  | 'ApprovalRequest'
  | 'Deadline'
  | 'Escalation'
  | 'Completion'
  | 'Reminder';

export interface NotificationRecipient {
  type: RecipientType;
  address: string;
  role?: UserRole;
  organization?: string;
}

export type RecipientType = 'User' | 'Role' | 'Email' | 'Group';

export type NotificationStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed' | 'Cancelled';

export interface POAMAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  category: AttachmentCategory;
  accessLevel: AccessLevel;
  retentionPolicy?: RetentionPolicy;
}

export type AttachmentCategory = 
  | 'Evidence'
  | 'Documentation'
  | 'Screenshot'
  | 'Report'
  | 'Configuration'
  | 'Other';

export type AccessLevel = 'Public' | 'Internal' | 'Restricted' | 'Confidential';

export interface RetentionPolicy {
  retainUntil: Date;
  reason: string;
  autoDelete: boolean;
}

export interface EvidenceLink {
  id: string;
  title: string;
  description: string;
  url: string;
  type: EvidenceLinkType;
  verifiedAt?: Date;
  verifiedBy?: string;
  status: LinkStatus;
}

export type EvidenceLinkType = 
  | 'Dashboard'
  | 'Report'
  | 'Configuration'
  | 'Log'
  | 'Scan'
  | 'Documentation'
  | 'External';

export type LinkStatus = 'Active' | 'Broken' | 'Restricted' | 'Archived';

export interface POAMHistoryEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: HistoryAction;
  field?: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  ipAddress?: string;
  userAgent?: string;
}

export type HistoryAction = 
  | 'Created'
  | 'Updated'
  | 'StatusChanged'
  | 'Approved'
  | 'Rejected'
  | 'Assigned'
  | 'CommentAdded'
  | 'AttachmentAdded'
  | 'AttachmentRemoved'
  | 'MilestoneUpdated'
  | 'RiskReassessed'
  | 'Synchronized';

// Risk Exception Request (for non-compliant controls)
export interface RiskExceptionRequest {
  id: string;
  poamId: string;
  requestedBy: string;
  requestedAt: Date;
  
  // Exception details
  justification: string;
  operationalImpact: string;
  compensatingControls: CompensatingControl[];
  businessRationale: string;
  alternativeApproaches: string[];
  
  // Risk information
  riskLevel: RiskLevel;
  riskDuration: RiskDuration;
  acceptanceCriteria: string[];
  monitoringPlan: MonitoringPlan;
  
  // Approval workflow
  approvalWorkflow: ExceptionApprovalWorkflow;
  
  // Review and renewal
  reviewSchedule: ReviewSchedule;
  renewalHistory: ExceptionRenewal[];
  
  status: ExceptionStatus;
  finalDecision?: FinalDecision;
}

export interface CompensatingControl {
  id: string;
  name: string;
  description: string;
  implementation: string;
  effectiveness: EffectivenessRating;
  verificationMethod: string;
  responsible: string;
  status: ControlStatus;
}

export type ControlStatus = 'Planned' | 'Implementing' | 'Operational' | 'Failed' | 'Decommissioned';

export interface RiskDuration {
  startDate: Date;
  endDate: Date;
  renewable: boolean;
  maxRenewals?: number;
  renewalPeriod?: number; // days
}

export interface MonitoringPlan {
  metrics: MonitoringMetric[];
  frequency: MonitoringFrequency;
  reportingSchedule: ReportingSchedule;
  escalationTriggers: EscalationTrigger[];
  responsible: string;
}

export interface MonitoringMetric {
  name: string;
  description: string;
  target: string;
  threshold: string;
  measurement: MeasurementMethod;
  frequency: MeasurementFrequency;
}

export type MeasurementMethod = 'Automated' | 'Manual' | 'Sampling' | 'Continuous';

export type MeasurementFrequency = 'RealTime' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';

export type MonitoringFrequency = 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';

export interface ReportingSchedule {
  frequency: ReportingFrequency;
  recipients: string[];
  format: ReportFormat;
  deliveryMethod: DeliveryMethod;
}

export type ReportingFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Annually';

export type ReportFormat = 'Dashboard' | 'PDF' | 'Excel' | 'Email' | 'Presentation';

export type DeliveryMethod = 'Email' | 'Portal' | 'API' | 'FileShare';

export interface EscalationTrigger {
  condition: string;
  threshold: string;
  action: EscalationAction;
  recipients: string[];
  timeframe: number; // minutes
}

export type EscalationAction = 'Notify' | 'AutoReject' | 'RequireReview' | 'Suspend';

export interface ExceptionApprovalWorkflow {
  levels: ExceptionApprovalLevel[];
  currentLevel: number;
  parallelApproval: boolean;
  timeouts: ApprovalTimeout[];
}

export interface ExceptionApprovalLevel {
  level: ApprovalLevel;
  required: boolean;
  approvers: string[];
  approvalCount: number; // How many approvers needed
  conditions?: ApprovalCondition[];
  timeLimit?: number; // days
}

export interface ApprovalTimeout {
  level: ApprovalLevel;
  timeoutDays: number;
  action: TimeoutAction;
}

export type TimeoutAction = 'Escalate' | 'AutoApprove' | 'AutoReject' | 'Extend';

export interface ReviewSchedule {
  frequency: ReviewFrequency;
  nextReview: Date;
  responsible: string[];
  criteria: ReviewCriteria;
  process: ReviewProcess;
}

export type ReviewFrequency = 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Annually';

export interface ReviewCriteria {
  mandatory: string[];
  optional: string[];
  triggers: ReviewTrigger[];
}

export interface ReviewTrigger {
  event: string;
  condition: string;
  action: ReviewAction;
}

export type ReviewAction = 'Schedule' | 'Immediate' | 'Expedite' | 'Flag';

export interface ReviewProcess {
  steps: ReviewStep[];
  documentation: string[];
  approvals: string[];
  outcomes: PossibleOutcome[];
}

export interface ReviewStep {
  order: number;
  name: string;
  description: string;
  responsible: string;
  inputs: string[];
  outputs: string[];
  duration: number; // days
}

export type PossibleOutcome = 'Continue' | 'Modify' | 'Revoke' | 'Extend';

export interface ExceptionRenewal {
  id: string;
  requestDate: Date;
  requestedBy: string;
  justification: string;
  changedConditions: string[];
  newEndDate: Date;
  status: RenewalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  conditions?: string[];
}

export type RenewalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired';

export type ExceptionStatus = 
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'ConditionallyApproved'
  | 'Active'
  | 'Suspended'
  | 'Expired'
  | 'Revoked';

export interface FinalDecision {
  decision: DecisionType;
  decisionBy: string;
  decisionAt: Date;
  reasoning: string;
  conditions?: string[];
  effectiveDate: Date;
  expirationDate?: Date;
  appealDeadline?: Date;
}

export type DecisionType = 'Approved' | 'Rejected' | 'ConditionallyApproved' | 'Deferred';
