// Multi-Tenant Organization Management Types
// Supports FedRAMP High compliance and secure data segregation

import { UserRole } from '../config/authConfig';

// Re-export UserRole for other modules
export type { UserRole };

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  domain: string;
  tier: OrganizationTier;
  status: OrganizationStatus;
  nistRevision: NistRevision;
  classification: SecurityClassification;
  createdAt: Date;
  updatedAt: Date;
  configuration: OrganizationConfiguration;
  compliance: ComplianceSettings;
  emassConfig?: EmassConfiguration;
}

export type OrganizationTier = 'Basic' | 'Standard' | 'Enterprise' | 'Government';

export type OrganizationStatus = 'Active' | 'Suspended' | 'PendingActivation' | 'Deprovisioning';

export type NistRevision = 'Rev4' | 'Rev5' | 'Rev6';

export type SecurityClassification = 'Unclassified' | 'CUI' | 'Confidential' | 'Secret';

export interface OrganizationConfiguration {
  maxUsers: number;
  maxEnvironments: number;
  retentionDays: number;
  allowedCloudProviders: CloudProvider[];
  features: OrganizationFeature[];
  customBranding: CustomBranding;
  networkRestrictions?: NetworkRestriction[];
}

export type CloudProvider = 'Azure' | 'AWS' | 'GCP' | 'OracleCloud';

export type OrganizationFeature = 
  | 'MultiCloudSupport'
  | 'EmassIntegration' 
  | 'CustomReporting'
  | 'ApiAccess'
  | 'AuditTrail'
  | 'RiskAssessment'
  | 'AutomatedRemediation'
  | 'ComplianceAlerts'
  | 'CustomControls';

export interface CustomBranding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  organizationName: string;
}

export interface NetworkRestriction {
  type: 'IPWhitelist' | 'VPNRequired' | 'GeoRestriction';
  value: string;
  description: string;
}

export interface ComplianceSettings {
  nistRevision: NistRevision;
  previousRevision?: NistRevision;
  upgradeInProgress: boolean;
  upgradeRequestedAt?: Date;
  upgradeRequestedBy?: string;
  customControlMappings: Record<string, string[]>;
  complianceThresholds: ComplianceThresholds;
}

export interface ComplianceThresholds {
  highRiskScore: number;
  mediumRiskScore: number;
  complianceTargetPercentage: number;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  criticalFindingsCount: number;
  highRiskControlsCount: number;
  overduePoamCount: number;
  complianceDropPercentage: number;
}

export interface EmassConfiguration {
  enabled: boolean;
  endpoint: string;
  systemId: string;
  certificatePath?: string;
  lastSyncAt?: Date;
  syncStatus: 'Connected' | 'Disconnected' | 'Error' | 'Syncing';
  syncFrequency: 'Manual' | 'Daily' | 'Weekly' | 'Monthly';
  lastError?: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  roles: UserRole[];
  status: MemberStatus;
  joinedAt: Date;
  lastActiveAt: Date;
  invitedBy: string;
  invitationStatus: InvitationStatus;
}

export type MemberStatus = 'Active' | 'Inactive' | 'Suspended' | 'PendingInvitation';

export type InvitationStatus = 'Pending' | 'Accepted' | 'Declined' | 'Expired';

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  roles: UserRole[];
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: InvitationStatus;
  token: string;
}

// Cloud Environment Configuration
export interface CloudEnvironment {
  id: string;
  organizationId: string;
  name: string;
  displayName: string;
  provider: CloudProvider;
  environment: EnvironmentType;
  status: EnvironmentStatus;
  configuration: CloudConfiguration;
  lastSyncAt?: Date;
  syncStatus: SyncStatus;
  complianceScore?: number;
  resourceCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EnvironmentType = 'Production' | 'Staging' | 'Development' | 'Testing' | 'Sandbox';

export type EnvironmentStatus = 'Connected' | 'Disconnected' | 'Error' | 'Syncing' | 'ConfigurationRequired';

export type SyncStatus = 'Success' | 'Failed' | 'InProgress' | 'Pending' | 'Paused';

export interface CloudConfiguration {
  subscriptionId?: string; // Azure
  accountId?: string; // AWS
  projectId?: string; // GCP
  tenancyId?: string; // Oracle Cloud
  region: string;
  credentials: CredentialConfiguration;
  syncSettings: SyncSettings;
}

export interface CredentialConfiguration {
  type: CredentialType;
  clientId?: string;
  tenantId?: string;
  keyVaultReference?: string;
  roleArn?: string; // AWS
  serviceAccountEmail?: string; // GCP
  compartmentId?: string; // Oracle Cloud
}

export type CredentialType = 'ServicePrincipal' | 'ManagedIdentity' | 'AssumeRole' | 'ServiceAccount';

export interface SyncSettings {
  frequency: SyncFrequency;
  resources: ResourceSyncConfiguration[];
  filters: SyncFilter[];
  lastSyncAt?: Date;
  nextSyncAt?: Date;
}

export type SyncFrequency = 'Manual' | 'Hourly' | 'Daily' | 'Weekly';

export interface ResourceSyncConfiguration {
  resourceType: string;
  enabled: boolean;
  priority: SyncPriority;
  customFilters?: Record<string, any>;
}

export type SyncPriority = 'High' | 'Medium' | 'Low';

export interface SyncFilter {
  type: FilterType;
  property: string;
  operator: FilterOperator;
  value: any;
}

export type FilterType = 'Include' | 'Exclude';

export type FilterOperator = 'Equals' | 'NotEquals' | 'Contains' | 'StartsWith' | 'In' | 'NotIn';

// NIST Revision Upgrade Management
export interface RevisionUpgrade {
  id: string;
  organizationId: string;
  fromRevision: NistRevision;
  toRevision: NistRevision;
  status: UpgradeStatus;
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  gapAnalysis?: GapAnalysisReport;
  migrationPlan?: MigrationPlan;
  approvals: UpgradeApproval[];
}

export type UpgradeStatus = 'Requested' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';

export interface GapAnalysisReport {
  id: string;
  generatedAt: Date;
  summary: GapAnalysisSummary;
  controlChanges: ControlChange[];
  recommendedActions: RecommendedAction[];
  estimatedEffort: EffortEstimate;
}

export interface GapAnalysisSummary {
  totalControls: number;
  newControls: number;
  modifiedControls: number;
  removedControls: number;
  impactedControls: number;
  complianceImpact: ComplianceImpact;
}

export interface ComplianceImpact {
  currentCompliantControls: number;
  projectedCompliantControls: number;
  complianceChangePercentage: number;
  highRiskImpacts: number;
}

export interface ControlChange {
  controlId: string;
  changeType: ChangeType;
  currentStatus?: ComplianceStatus;
  projectedStatus: ComplianceStatus;
  impact: ImpactLevel;
  description: string;
  requiredActions: string[];
  estimatedEffort: number; // hours
}

export type ChangeType = 'New' | 'Modified' | 'Removed' | 'Merged' | 'Split';

export type ComplianceStatus = 'Compliant' | 'PartiallyCompliant' | 'NonCompliant' | 'NotApplicable' | 'InProgress';

export type ImpactLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface RecommendedAction {
  id: string;
  priority: ActionPriority;
  category: ActionCategory;
  title: string;
  description: string;
  affectedControls: string[];
  estimatedEffort: number;
  dependencies: string[];
  timeline: string;
}

export type ActionPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ActionCategory = 'Technical' | 'Process' | 'Documentation' | 'Training' | 'Governance';

export interface EffortEstimate {
  totalHours: number;
  breakdown: EffortBreakdown;
  timeline: TimelineEstimate;
  resources: ResourceRequirement[];
}

export interface EffortBreakdown {
  technical: number;
  documentation: number;
  testing: number;
  training: number;
  governance: number;
}

export interface TimelineEstimate {
  estimatedStartDate: Date;
  estimatedCompletionDate: Date;
  criticalPath: string[];
  milestones: MilestoneEstimate[];
}

export interface MilestoneEstimate {
  name: string;
  estimatedDate: Date;
  dependencies: string[];
  deliverables: string[];
}

export interface ResourceRequirement {
  role: string;
  hoursRequired: number;
  skillLevel: SkillLevel;
  description: string;
}

export type SkillLevel = 'Expert' | 'Advanced' | 'Intermediate' | 'Basic';

export interface MigrationPlan {
  id: string;
  phases: MigrationPhase[];
  rollbackPlan: RollbackPlan;
  testingPlan: TestingPlan;
  communicationPlan: CommunicationPlan;
}

export interface MigrationPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDuration: number;
  prerequisites: string[];
  tasks: MigrationTask[];
  successCriteria: string[];
  rollbackTriggers: string[];
}

export interface MigrationTask {
  id: string;
  name: string;
  description: string;
  assignedTo?: string;
  estimatedHours: number;
  dependencies: string[];
  status: TaskStatus;
  startDate?: Date;
  completedDate?: Date;
}

export type TaskStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Blocked' | 'Cancelled';

export interface RollbackPlan {
  triggers: string[];
  steps: RollbackStep[];
  dataBackupStrategy: string;
  recoveryTimeObjective: number; // minutes
  recoveryPointObjective: number; // minutes
}

export interface RollbackStep {
  order: number;
  action: string;
  responsibility: string;
  estimatedTime: number;
  dependencies: string[];
}

export interface TestingPlan {
  phases: TestingPhase[];
  acceptanceCriteria: string[];
  rollbackCriteria: string[];
}

export interface TestingPhase {
  name: string;
  type: TestingType;
  scope: string[];
  duration: number;
  resources: string[];
}

export type TestingType = 'Unit' | 'Integration' | 'SystemTesting' | 'UserAcceptance' | 'Performance' | 'Security';

export interface CommunicationPlan {
  stakeholders: Stakeholder[];
  notifications: NotificationSchedule[];
  escalationPaths: EscalationPath[];
}

export interface Stakeholder {
  name: string;
  role: string;
  email: string;
  notificationPreferences: NotificationPreference[];
}

export interface NotificationPreference {
  type: NotificationType;
  frequency: NotificationFrequency;
  method: NotificationMethod;
}

export type NotificationType = 'StatusUpdate' | 'Issue' | 'Milestone' | 'Approval' | 'Emergency';

export type NotificationFrequency = 'Immediate' | 'Daily' | 'Weekly' | 'OnChange';

export type NotificationMethod = 'Email' | 'SMS' | 'Teams' | 'Dashboard';

export interface NotificationSchedule {
  event: string;
  timing: string;
  recipients: string[];
  template: string;
}

export interface EscalationPath {
  level: number;
  criteria: string[];
  contacts: string[];
  timeline: number; // minutes
}

export interface UpgradeApproval {
  level: ApprovalLevel;
  approver: string;
  status: ApprovalStatus;
  approvedAt?: Date;
  comments?: string;
  conditions?: string[];
}

export type ApprovalLevel = 'ISSO' | 'ISSM' | 'RMO' | 'AO';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'ConditionallyApproved';
