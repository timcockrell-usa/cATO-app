/**
 * Enhanced Multi-Environment and Role-Based Access Control (RBAC) Types
 * 
 * This extends the basic organization types to support granular multi-environment
 * views and DoD-specific RBAC with complex approval workflows. Critical for 
 * providing customers with unified visibility across their entire cloud footprint
 * and implementing proper separation of duties for security operations.
 */

import { UserRole, SecurityClassification } from './organization';
import { RiskLevel } from './executionEnablers';

// Multi-environment management
export interface MultiEnvironmentConfiguration {
  organizationId: string;
  name: string;
  description: string;
  
  // Environment definitions
  environments: CloudEnvironmentDefinition[];
  
  // Tagging and classification
  environmentTags: EnvironmentTag[];
  dataClassification: SecurityClassification;
  
  // Access control
  accessPolicy: EnvironmentAccessPolicy;
  
  // Aggregation rules
  aggregationRules: DataAggregationRule[];
  
  // Compliance mapping
  complianceFrameworks: EnvironmentComplianceMapping[];
  
  // Monitoring and alerting
  monitoringConfig: EnvironmentMonitoringConfig;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CloudEnvironmentDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  
  // Cloud provider details
  provider: 'Azure' | 'AWS' | 'GCP' | 'Oracle' | 'On_Premises' | 'Hybrid';
  accountId: string; // Account/Subscription/Project ID
  region: string;
  
  // Environment classification
  environmentType: EnvironmentType;
  businessCriticality: 'Mission_Critical' | 'Business_Critical' | 'Important' | 'Standard';
  securityZone: SecurityZone;
  
  // Data classification
  maxDataClassification: SecurityClassification;
  dataResidencyRequirement?: string;
  
  // Compliance requirements
  complianceRequirements: ComplianceRequirement[];
  
  // Resource organization
  resourceGroups: ResourceGroupMapping[];
  
  // Connection details
  connectionDetails: EnvironmentConnectionDetails;
  
  // Status and health
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Decommissioned';
  healthStatus: 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
  lastHealthCheck: Date;
  
  // Metadata
  tags: Record<string, string>;
  customAttributes: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export type EnvironmentType = 
  | 'Production'
  | 'Staging'
  | 'Development'
  | 'Testing'
  | 'Training'
  | 'Sandbox'
  | 'Disaster_Recovery'
  | 'Backup';

export type SecurityZone = 
  | 'DMZ'
  | 'Internal'
  | 'Restricted'
  | 'Classified'
  | 'Public'
  | 'Partner'
  | 'Management';

export interface EnvironmentTag {
  key: string;
  value: string;
  category: 'Business' | 'Technical' | 'Compliance' | 'Security' | 'Operations';
  required: boolean;
  validValues?: string[];
}

export interface ComplianceRequirement {
  framework: string; // e.g., 'FedRAMP', 'FISMA', 'SOC2'
  level: string; // e.g., 'High', 'Moderate', 'Low'
  controls: string[];
  attestationRequired: boolean;
  lastAttestation?: Date;
  nextAttestation?: Date;
}

export interface ResourceGroupMapping {
  cloudResourceGroupId: string;
  cloudResourceGroupName: string;
  purpose: string;
  dataClassification: SecurityClassification;
  businessOwner: string;
  technicalOwner: string;
}

export interface EnvironmentConnectionDetails {
  connectorId: string;
  connectionType: 'Direct' | 'Gateway' | 'VPN' | 'ExpressRoute' | 'PrivateLink';
  connectionString?: string;
  credentials: CredentialReference;
  
  // Connection health
  lastConnected: Date;
  connectionLatency?: number;
  throughput?: number;
  errorRate?: number;
  
  // Security settings
  encryptionInTransit: boolean;
  encryptionAtRest: boolean;
  certificateValidation: boolean;
  
  // Monitoring
  monitoringEnabled: boolean;
  alertsEnabled: boolean;
}

export interface CredentialReference {
  credentialType: 'ManagedIdentity' | 'ServicePrincipal' | 'AccessKey' | 'Certificate';
  keyVaultReference?: string;
  rotationPolicy?: CredentialRotationPolicy;
  expirationDate?: Date;
  lastRotated?: Date;
}

export interface CredentialRotationPolicy {
  rotationFrequencyDays: number;
  advanceNotificationDays: number;
  automaticRotation: boolean;
  approvalRequired: boolean;
}

export interface EnvironmentAccessPolicy {
  id: string;
  name: string;
  description: string;
  
  // Access rules
  accessRules: EnvironmentAccessRule[];
  
  // Time-based access
  timeBasedAccess: TimeBasedAccessRule[];
  
  // Emergency access
  emergencyAccess: EmergencyAccessPolicy;
  
  // Just-in-time access
  jitAccess: JITAccessPolicy;
  
  // Cross-environment access
  crossEnvironmentPolicy: CrossEnvironmentPolicy;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentAccessRule {
  id: string;
  environmentId: string;
  
  // Subject (who)
  subjectType: 'User' | 'Group' | 'Role' | 'Service';
  subjectId: string;
  
  // Access level
  accessLevel: EnvironmentAccessLevel;
  permissions: EnvironmentPermission[];
  
  // Conditions
  conditions: AccessCondition[];
  
  // Time restrictions
  timeRestrictions?: TimeRestriction[];
  
  // Approval requirements
  approvalRequired: boolean;
  approvers?: string[];
  
  // Monitoring
  auditRequired: boolean;
  sessionRecording: boolean;
  
  // Validity
  effectiveDate: Date;
  expirationDate?: Date;
  suspended: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type EnvironmentAccessLevel = 
  | 'No_Access'
  | 'Read_Only'
  | 'Read_Write'
  | 'Admin'
  | 'Full_Control';

export type EnvironmentPermission = 
  | 'View_Resources'
  | 'View_Configurations'
  | 'View_Logs'
  | 'View_Metrics'
  | 'Modify_Resources'
  | 'Modify_Configurations'
  | 'Deploy_Resources'
  | 'Delete_Resources'
  | 'Manage_Access'
  | 'Export_Data';

export interface AccessCondition {
  type: 'IPAddress' | 'Location' | 'Device' | 'MFA' | 'Certificate' | 'NetworkSegment';
  operator: 'Equals' | 'NotEquals' | 'Contains' | 'In' | 'NotIn' | 'Matches';
  value: string | string[];
  description: string;
}

export interface TimeRestriction {
  daysOfWeek: number[]; // 0-6, Sunday=0
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
}

export interface TimeBasedAccessRule {
  id: string;
  name: string;
  description: string;
  
  // Schedule
  schedule: AccessSchedule;
  
  // Access modifications during time periods
  accessModifications: AccessModification[];
  
  // Emergency overrides
  emergencyOverride: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessSchedule {
  type: 'BusinessHours' | 'NonBusinessHours' | 'Weekends' | 'Holidays' | 'Custom';
  customSchedule?: CustomSchedule[];
  timezone: string;
  holidayCalendar?: string;
}

export interface CustomSchedule {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  effectiveDates?: {
    start: Date;
    end: Date;
  };
}

export interface AccessModification {
  environmentId: string;
  accessLevel: EnvironmentAccessLevel;
  additionalPermissions?: EnvironmentPermission[];
  removedPermissions?: EnvironmentPermission[];
  additionalApprovals?: boolean;
}

export interface EmergencyAccessPolicy {
  enabled: boolean;
  
  // Emergency access grants
  emergencyRoles: EmergencyRole[];
  
  // Activation procedures
  activationProcedure: ActivationProcedure;
  
  // Monitoring and controls
  maximumDuration: number; // hours
  reviewRequired: boolean;
  automaticRevocation: boolean;
  
  // Notification
  notificationList: string[];
  escalationList: string[];
  
  // Audit requirements
  auditTrail: boolean;
  sessionRecording: boolean;
  justificationRequired: boolean;
}

export interface EmergencyRole {
  roleId: string;
  roleName: string;
  permissions: EnvironmentPermission[];
  environments: string[];
  activationCriteria: string[];
  approvalRequired: boolean;
  approvers?: string[];
}

export interface ActivationProcedure {
  steps: ActivationStep[];
  requiredJustification: boolean;
  witnessRequired: boolean;
  managerApproval: boolean;
  securityTeamNotification: boolean;
}

export interface ActivationStep {
  stepNumber: number;
  description: string;
  requiredRole?: string;
  timeoutMinutes?: number;
  verification?: VerificationMethod;
}

export interface VerificationMethod {
  type: 'PIN' | 'SMS' | 'Email' | 'Phone' | 'MFA' | 'Certificate';
  details?: string;
}

export interface JITAccessPolicy {
  enabled: boolean;
  
  // Default settings
  defaultDuration: number; // hours
  maximumDuration: number; // hours
  advanceNotice: number; // hours
  
  // Approval workflow
  approvalRequired: boolean;
  approvers: JITApprover[];
  approvalTimeout: number; // hours
  
  // Access conditions
  businessJustificationRequired: boolean;
  witnessRequired: boolean;
  sessionMonitoring: boolean;
  
  // Environments
  enabledEnvironments: string[];
  restrictedEnvironments: string[];
}

export interface JITApprover {
  userId: string;
  role: string;
  environments: string[];
  permissions: EnvironmentPermission[];
  order: number;
  required: boolean;
}

export interface CrossEnvironmentPolicy {
  enabled: boolean;
  
  // Cross-environment access rules
  allowedTransitions: EnvironmentTransition[];
  
  // Data movement rules
  dataMovementRules: DataMovementRule[];
  
  // Approval requirements
  crossEnvironmentApproval: boolean;
  dataMovementApproval: boolean;
  
  // Monitoring
  crossEnvironmentAudit: boolean;
  dataMovementTracking: boolean;
}

export interface EnvironmentTransition {
  sourceEnvironment: string;
  targetEnvironment: string;
  allowedRoles: string[];
  additionalApprovals?: string[];
  conditions?: AccessCondition[];
  restrictions?: string[];
}

export interface DataMovementRule {
  sourceEnvironment: string;
  targetEnvironment: string;
  dataTypes: string[];
  approvalRequired: boolean;
  approvers?: string[];
  restrictions?: string[];
  auditRequired: boolean;
}

// Data aggregation and reporting
export interface DataAggregationRule {
  id: string;
  name: string;
  description: string;
  
  // Scope
  sourceEnvironments: string[];
  dataTypes: DataType[];
  
  // Aggregation logic
  aggregationType: AggregationType;
  aggregationCriteria: AggregationCriterion[];
  
  // Scheduling
  schedule: AggregationSchedule;
  
  // Output
  outputFormat: 'Dashboard' | 'Report' | 'API' | 'Export';
  outputDestination?: string;
  
  // Access control
  accessRoles: string[];
  dataClassification: SecurityClassification;
  
  // Status
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type DataType = 
  | 'Resources'
  | 'Security_Assessments'
  | 'Compliance_Status'
  | 'Vulnerabilities'
  | 'Configurations'
  | 'Costs'
  | 'Performance_Metrics'
  | 'Audit_Logs'
  | 'POAMs'
  | 'Risk_Assessments';

export type AggregationType = 
  | 'Sum'
  | 'Count'
  | 'Average'
  | 'Maximum'
  | 'Minimum'
  | 'Trend'
  | 'Distribution'
  | 'Consolidation';

export interface AggregationCriterion {
  field: string;
  operation: AggregationType;
  groupBy?: string[];
  filters?: AggregationFilter[];
  weightings?: Record<string, number>;
}

export interface AggregationFilter {
  field: string;
  operator: 'Equals' | 'NotEquals' | 'GreaterThan' | 'LessThan' | 'Contains' | 'In' | 'Between';
  value: any;
}

export interface AggregationSchedule {
  frequency: 'Continuous' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'OnDemand';
  time?: string; // For scheduled runs
  daysOfWeek?: number[]; // For weekly
  dayOfMonth?: number; // For monthly
  timezone: string;
}

// Compliance mapping across environments
export interface EnvironmentComplianceMapping {
  id: string;
  framework: string;
  
  // Environment-specific requirements
  environmentRequirements: EnvironmentComplianceRequirement[];
  
  // Cross-environment requirements
  crossEnvironmentRequirements: CrossEnvironmentComplianceRequirement[];
  
  // Inheritance rules
  inheritanceRules: ComplianceInheritanceRule[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentComplianceRequirement {
  environmentId: string;
  controls: EnvironmentControl[];
  exemptions?: ComplianceExemption[];
  customRequirements?: CustomRequirement[];
}

export interface EnvironmentControl {
  controlId: string;
  controlName: string;
  requirementLevel: 'Required' | 'Recommended' | 'Optional' | 'Not_Applicable';
  implementationStatus: 'Implemented' | 'Partially_Implemented' | 'Not_Implemented' | 'Not_Applicable';
  
  // Environment-specific implementation
  implementationDetails: ControlImplementation;
  
  // Testing and validation
  testingRequired: boolean;
  lastTested?: Date;
  testResults?: TestResult[];
  
  // Evidence
  evidence: EvidenceArtifact[];
  
  // Responsible parties
  implementationOwner: string;
  testingOwner: string;
  
  // Risk assessment
  riskLevel: RiskLevel;
  compensatingControls?: string[];
}

export interface ControlImplementation {
  implementationType: 'Automated' | 'Manual' | 'Hybrid';
  implementation: string;
  configurationDetails?: Record<string, any>;
  automationTools?: string[];
  validationMethods: ValidationMethod[];
}

export interface ValidationMethod {
  method: 'Automated_Scan' | 'Manual_Review' | 'Audit' | 'Monitoring' | 'Testing';
  frequency: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  validator: string;
  criteria: string[];
}

export interface TestResult {
  testDate: Date;
  testType: 'Compliance_Scan' | 'Penetration_Test' | 'Audit' | 'Manual_Test';
  result: 'Pass' | 'Fail' | 'Partial' | 'Not_Tested';
  findings: TestFinding[];
  tester: string;
  evidence: EvidenceArtifact[];
}

export interface TestFinding {
  finding: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
  status: 'Open' | 'In_Progress' | 'Resolved' | 'Accepted';
}

export interface EvidenceArtifact {
  id: string;
  name: string;
  type: 'Document' | 'Screenshot' | 'Configuration' | 'Log' | 'Report' | 'Certificate';
  url?: string;
  hash?: string;
  collectedDate: Date;
  collectedBy: string;
  classification: SecurityClassification;
}

export interface CrossEnvironmentComplianceRequirement {
  requirementId: string;
  description: string;
  environments: string[];
  requirementType: 'Data_Flow' | 'Access_Control' | 'Monitoring' | 'Segregation' | 'Integration';
  implementation: string;
  validationMethod: ValidationMethod;
  responsible: string;
}

export interface ComplianceExemption {
  exemptionId: string;
  controlId: string;
  reason: string;
  justification: string;
  riskAssessment: string;
  compensatingControls: string[];
  approvedBy: string;
  approvalDate: Date;
  expirationDate?: Date;
  reviewRequired: boolean;
  lastReview?: Date;
}

export interface CustomRequirement {
  requirementId: string;
  name: string;
  description: string;
  category: string;
  mandatory: boolean;
  implementation: string;
  validationCriteria: string[];
}

export interface ComplianceInheritanceRule {
  ruleId: string;
  name: string;
  description: string;
  
  // Source and target
  sourceEnvironmentType: EnvironmentType;
  targetEnvironmentTypes: EnvironmentType[];
  
  // Inheritance scope
  inheritableControls: string[];
  conditionalInheritance: InheritanceCondition[];
  
  // Modifications
  modifications: ControlModification[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface InheritanceCondition {
  condition: string;
  controls: string[];
  modifications?: ControlModification[];
}

export interface ControlModification {
  controlId: string;
  modificationType: 'Strengthen' | 'Weaken' | 'Modify' | 'Exempt';
  modification: string;
  justification: string;
}

// Monitoring configuration
export interface EnvironmentMonitoringConfig {
  id: string;
  organizationId: string;
  
  // Monitoring scope
  monitoredEnvironments: string[];
  monitoringLevel: 'Basic' | 'Standard' | 'Comprehensive' | 'Custom';
  
  // Health monitoring
  healthChecks: HealthCheck[];
  
  // Security monitoring
  securityMonitoring: SecurityMonitoringConfig;
  
  // Compliance monitoring
  complianceMonitoring: ComplianceMonitoringConfig;
  
  // Performance monitoring
  performanceMonitoring: PerformanceMonitoringConfig;
  
  // Alerting
  alertingConfig: AlertingConfiguration;
  
  // Reporting
  reportingConfig: MonitoringReportingConfig;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthCheck {
  id: string;
  name: string;
  description: string;
  environmentId: string;
  checkType: 'Connectivity' | 'Authentication' | 'Data_Quality' | 'Performance' | 'Availability';
  frequency: 'Continuous' | 'Minutely' | 'Hourly' | 'Daily';
  timeout: number; // seconds
  retryCount: number;
  successCriteria: SuccessCriterion[];
  enabled: boolean;
}

export interface SuccessCriterion {
  metric: string;
  operator: 'GreaterThan' | 'LessThan' | 'Equals' | 'NotEquals' | 'Contains';
  threshold: number | string;
  unit?: string;
}

export interface SecurityMonitoringConfig {
  enabled: boolean;
  
  // Access monitoring
  accessMonitoring: AccessMonitoringConfig;
  
  // Threat detection
  threatDetection: ThreatDetectionConfig;
  
  // Data protection monitoring
  dataProtectionMonitoring: DataProtectionMonitoringConfig;
  
  // Incident response
  incidentResponse: IncidentResponseConfig;
}

export interface AccessMonitoringConfig {
  monitorFailedLogins: boolean;
  monitorPrivilegedAccess: boolean;
  monitorCrossEnvironmentAccess: boolean;
  monitorAfterHoursAccess: boolean;
  monitorDataAccess: boolean;
  
  // Thresholds
  failedLoginThreshold: number;
  privilegedAccessAlerts: boolean;
  anomalyDetection: boolean;
}

export interface ThreatDetectionConfig {
  enabled: boolean;
  threatIntelligence: boolean;
  behavioralAnalysis: boolean;
  networkMonitoring: boolean;
  endpointMonitoring: boolean;
  
  // Detection rules
  customRules: ThreatDetectionRule[];
  rulesets: string[];
}

export interface ThreatDetectionRule {
  ruleId: string;
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  actionType: 'Alert' | 'Block' | 'Log' | 'Quarantine' | 'Notify';
  parameters?: Record<string, any>;
}

export interface DataProtectionMonitoringConfig {
  monitorDataMovement: boolean;
  monitorDataAccess: boolean;
  monitorDataClassification: boolean;
  monitorEncryption: boolean;
  
  // DLP integration
  dlpEnabled: boolean;
  dlpRules: DataLossPreventionRule[];
}

export interface DataLossPreventionRule {
  ruleId: string;
  name: string;
  description: string;
  dataTypes: string[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

export interface IncidentResponseConfig {
  enabled: boolean;
  automaticIncidentCreation: boolean;
  escalationRules: EscalationRule[];
  responsePlaybooks: ResponsePlaybook[];
  notificationLists: IncidentNotificationList[];
}

export interface EscalationRule {
  ruleId: string;
  trigger: EscalationTrigger;
  escalationLevels: EscalationLevel[];
  timeouts: number[]; // minutes for each level
}

export interface EscalationTrigger {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  incidentType: string;
  conditions?: RuleCondition[];
}

export interface EscalationLevel {
  level: number;
  recipients: string[];
  actions: string[];
  automaticActions?: string[];
}

export interface ResponsePlaybook {
  playbookId: string;
  name: string;
  description: string;
  triggerConditions: RuleCondition[];
  steps: PlaybookStep[];
  automatedSteps: AutomatedStep[];
}

export interface PlaybookStep {
  stepNumber: number;
  description: string;
  assignedRole: string;
  timeoutMinutes?: number;
  dependencies?: number[];
}

export interface AutomatedStep {
  stepNumber: number;
  action: string;
  parameters: Record<string, any>;
  conditions?: RuleCondition[];
}

export interface IncidentNotificationList {
  listId: string;
  name: string;
  description: string;
  recipients: NotificationRecipient[];
  notificationMethods: ('Email' | 'SMS' | 'Slack' | 'Teams' | 'Webhook')[];
  conditions?: RuleCondition[];
}

export interface NotificationRecipient {
  recipientId: string;
  recipientType: 'User' | 'Group' | 'Role' | 'External';
  contactInfo: ContactInfo;
  escalationLevel: number;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  slackUserId?: string;
  teamsUserId?: string;
  webhookUrl?: string;
}

export interface ComplianceMonitoringConfig {
  enabled: boolean;
  frameworks: string[];
  continuousMonitoring: boolean;
  
  // Assessment scheduling
  assessmentSchedule: ComplianceAssessmentSchedule;
  
  // Control monitoring
  controlMonitoring: ControlMonitoringConfig;
  
  // Evidence collection
  evidenceCollection: EvidenceCollectionConfig;
}

export interface ComplianceAssessmentSchedule {
  frequency: 'Monthly' | 'Quarterly' | 'Semi_Annual' | 'Annual';
  scheduledDate?: Date;
  automaticScheduling: boolean;
  preAssessmentNotice: number; // days
}

export interface ControlMonitoringConfig {
  continuousControlMonitoring: boolean;
  controlTestingFrequency: Record<string, string>; // controlId -> frequency
  automatedTesting: boolean;
  manualValidation: boolean;
}

export interface EvidenceCollectionConfig {
  automaticCollection: boolean;
  collectionFrequency: 'Daily' | 'Weekly' | 'Monthly';
  evidenceTypes: string[];
  retentionPeriod: number; // days
  encryptEvidence: boolean;
}

export interface PerformanceMonitoringConfig {
  enabled: boolean;
  
  // Resource monitoring
  resourceUtilization: boolean;
  performanceMetrics: string[];
  capacityPlanning: boolean;
  
  // Cost monitoring
  costMonitoring: boolean;
  budgetAlerts: boolean;
  costOptimization: boolean;
  
  // Service monitoring
  serviceAvailability: boolean;
  responseTimeMonitoring: boolean;
  throughputMonitoring: boolean;
}

export interface AlertingConfiguration {
  enabled: boolean;
  
  // Alert rules
  alertRules: AlertRule[];
  
  // Notification channels
  notificationChannels: NotificationChannel[];
  
  // Alert routing
  alertRouting: AlertRoutingRule[];
  
  // Suppression rules
  suppressionRules: AlertSuppressionRule[];
}

export interface AlertRule {
  ruleId: string;
  name: string;
  description: string;
  category: 'Security' | 'Compliance' | 'Performance' | 'Health' | 'Cost';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  
  // Conditions
  conditions: AlertCondition[];
  
  // Actions
  actions: AlertAction[];
  
  // Timing
  evaluationFrequency: string;
  suppressionPeriod?: number; // minutes
  
  // Status
  enabled: boolean;
  lastTriggered?: Date;
}

export interface AlertCondition {
  metric: string;
  operator: 'GreaterThan' | 'LessThan' | 'Equals' | 'NotEquals' | 'Contains' | 'Matches';
  threshold: number | string;
  duration?: number; // minutes
  aggregation?: 'Sum' | 'Count' | 'Average' | 'Maximum' | 'Minimum';
}

export interface AlertAction {
  actionType: 'Notify' | 'CreateTicket' | 'RunScript' | 'WebhookCall' | 'EscalateAlert';
  parameters: Record<string, any>;
  delay?: number; // minutes
}

export interface NotificationChannel {
  channelId: string;
  name: string;
  type: 'Email' | 'SMS' | 'Slack' | 'Teams' | 'PagerDuty' | 'Webhook' | 'SNMP';
  configuration: NotificationChannelConfig;
  enabled: boolean;
}

export interface NotificationChannelConfig {
  endpoint?: string;
  apiKey?: string;
  credentials?: CredentialReference;
  template?: string;
  customFields?: Record<string, string>;
}

export interface AlertRoutingRule {
  ruleId: string;
  conditions: AlertCondition[];
  destinations: AlertDestination[];
  priority: number;
  enabled: boolean;
}

export interface AlertDestination {
  channelId: string;
  recipientList: string[];
  template?: string;
  escalation?: boolean;
}

export interface AlertSuppressionRule {
  ruleId: string;
  name: string;
  conditions: AlertCondition[];
  suppressionPeriod: number; // minutes
  reason: string;
  enabled: boolean;
}

export interface MonitoringReportingConfig {
  enabled: boolean;
  
  // Report types
  healthReports: ReportSchedule;
  securityReports: ReportSchedule;
  complianceReports: ReportSchedule;
  performanceReports: ReportSchedule;
  executiveReports: ReportSchedule;
  
  // Distribution
  reportDistribution: ReportDistribution;
  
  // Customization
  customReports: CustomReport[];
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  format: 'PDF' | 'Excel' | 'JSON' | 'HTML';
}

export interface ReportDistribution {
  defaultRecipients: string[];
  executiveRecipients: string[];
  technicalRecipients: string[];
  auditRecipients: string[];
  customLists: Record<string, string[]>;
}

export interface CustomReport {
  reportId: string;
  name: string;
  description: string;
  dataSource: string;
  query?: string;
  template: string;
  schedule: ReportSchedule;
  parameters: Record<string, any>;
}

// Consolidated dashboard types
export interface ConsolidatedDashboardData {
  organizationId: string;
  generatedAt: Date;
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  
  // Environment overview
  environmentSummary: EnvironmentSummary;
  
  // Security posture
  securityPosture: ConsolidatedSecurityPosture;
  
  // Compliance status
  complianceStatus: ConsolidatedComplianceStatus;
  
  // Risk assessment
  riskAssessment: ConsolidatedRiskAssessment;
  
  // Performance metrics
  performanceMetrics: ConsolidatedPerformanceMetrics;
  
  // Cost summary
  costSummary: ConsolidatedCostSummary;
  
  // Alerts and incidents
  alertsSummary: ConsolidatedAlertsSummary;
  
  // Trends and analytics
  trendsAnalytics: ConsolidatedTrendsAnalytics;
}

export interface EnvironmentSummary {
  totalEnvironments: number;
  environmentsByType: Record<EnvironmentType, number>;
  environmentsByProvider: Record<string, number>;
  environmentsByStatus: Record<string, number>;
  
  // Health status
  healthyEnvironments: number;
  warningEnvironments: number;
  criticalEnvironments: number;
  unknownEnvironments: number;
  
  // Connectivity status
  connectedEnvironments: number;
  disconnectedEnvironments: number;
  lastSyncTimes: Record<string, Date>;
}

export interface ConsolidatedSecurityPosture {
  overallScore: number; // 0-100
  
  // By environment
  securityScoresByEnvironment: Record<string, number>;
  
  // Vulnerability summary
  totalVulnerabilities: number;
  vulnerabilitiesByEnvironment: Record<string, VulnerabilityEnvironmentSummary>;
  vulnerabilitiesBySeverity: Record<VulnerabilitySeverity, number>;
  
  // Security controls
  implementedControls: number;
  totalRequiredControls: number;
  controlComplianceRate: number;
  
  // Threats and incidents
  activeThreats: number;
  incidentsThisPeriod: number;
  criticalIncidents: number;
  
  // Access management
  privilegedAccounts: number;
  inactiveAccounts: number;
  mfaCompliance: number; // percentage
}

export interface VulnerabilityEnvironmentSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  lastScanDate: Date;
}

type VulnerabilitySeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ConsolidatedComplianceStatus {
  overallComplianceScore: number; // 0-100
  
  // By framework
  complianceByFramework: Record<string, FrameworkComplianceStatus>;
  
  // By environment
  complianceByEnvironment: Record<string, EnvironmentComplianceStatus>;
  
  // Control status
  totalControls: number;
  compliantControls: number;
  partiallyCompliantControls: number;
  nonCompliantControls: number;
  
  // Assessments
  lastAssessmentDate: Date;
  overdueAssessments: number;
  upcomingAssessments: AssessmentScheduleItem[];
  
  // Findings and remediation
  openFindings: number;
  criticalFindings: number;
  remediationProgress: number; // percentage
}

export interface FrameworkComplianceStatus {
  framework: string;
  complianceScore: number;
  requiredControls: number;
  implementedControls: number;
  exemptControls: number;
  lastAssessment: Date;
}

export interface EnvironmentComplianceStatus {
  environmentId: string;
  environmentName: string;
  complianceScore: number;
  frameworks: string[];
  criticalFindings: number;
  lastAssessment: Date;
}

export interface AssessmentScheduleItem {
  assessmentId: string;
  framework: string;
  environment: string;
  scheduledDate: Date;
  assessor: string;
  type: string;
}

export interface ConsolidatedRiskAssessment {
  overallRiskScore: number; // 0-100
  riskLevel: RiskLevel;
  
  // Risk distribution
  risksByLevel: Record<RiskLevel, number>;
  risksByCategory: Record<string, number>;
  risksByEnvironment: Record<string, EnvironmentRiskSummary>;
  
  // Top risks
  topRisks: TopRisk[];
  
  // Risk trends
  riskTrend: 'Improving' | 'Stable' | 'Worsening';
  riskTrendData: RiskTrendDataPoint[];
  
  // Mitigation status
  risksWithMitigation: number;
  mitigationEffectiveness: number; // percentage
  overdueRiskReviews: number;
}

export interface EnvironmentRiskSummary {
  environmentId: string;
  environmentName: string;
  riskScore: number;
  criticalRisks: number;
  highRisks: number;
  lastAssessment: Date;
}

export interface TopRisk {
  riskId: string;
  title: string;
  category: string;
  severity: RiskLevel;
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  environment: string;
  owner: string;
  dueDate?: Date;
}

export interface RiskTrendDataPoint {
  date: Date;
  overallScore: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
}

export interface ConsolidatedPerformanceMetrics {
  // Availability
  overallAvailability: number; // percentage
  availabilityByEnvironment: Record<string, number>;
  
  // Response times
  averageResponseTime: number; // milliseconds
  responseTimeByEnvironment: Record<string, number>;
  
  // Throughput
  totalTransactions: number;
  transactionsByEnvironment: Record<string, number>;
  
  // Resource utilization
  averageCpuUtilization: number;
  averageMemoryUtilization: number;
  averageStorageUtilization: number;
  
  // Capacity metrics
  capacityUtilization: CapacityUtilization[];
  capacityAlerts: number;
  
  // Performance trends
  performanceTrend: 'Improving' | 'Stable' | 'Degrading';
}

export interface CapacityUtilization {
  resource: string;
  environment: string;
  currentUtilization: number;
  predictedUtilization: number;
  capacityThreshold: number;
  timeToThreshold?: number; // days
}

export interface ConsolidatedCostSummary {
  // Total costs
  totalCostThisPeriod: number;
  totalCostLastPeriod: number;
  costChange: number; // percentage
  
  // Cost by environment
  costsByEnvironment: Record<string, EnvironmentCostSummary>;
  
  // Cost by service category
  costsByCategory: Record<string, number>;
  
  // Budget tracking
  budgetUtilization: BudgetUtilization[];
  budgetAlerts: number;
  
  // Cost optimization
  optimizationOpportunities: CostOptimizationOpportunity[];
  potentialSavings: number;
  
  // Forecasting
  projectedMonthlySpend: number;
  projectedAnnualSpend: number;
}

export interface EnvironmentCostSummary {
  environmentId: string;
  environmentName: string;
  currentCost: number;
  previousCost: number;
  costTrend: 'Increasing' | 'Stable' | 'Decreasing';
  topServices: CostByService[];
}

export interface CostByService {
  serviceName: string;
  cost: number;
  percentage: number;
}

export interface BudgetUtilization {
  budgetName: string;
  environment: string;
  budgetAmount: number;
  spentAmount: number;
  utilizationPercentage: number;
  projectedOverrun: number;
  alertThreshold: number;
}

export interface CostOptimizationOpportunity {
  opportunityId: string;
  type: 'Right_Size' | 'Reserved_Instance' | 'Unused_Resource' | 'Storage_Tier' | 'Schedule_Optimization';
  description: string;
  environment: string;
  potentialSavings: number;
  effort: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  implementationSteps: string[];
}

export interface ConsolidatedAlertsSummary {
  totalActiveAlerts: number;
  
  // Alerts by severity
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  
  // Alerts by category
  securityAlerts: number;
  complianceAlerts: number;
  performanceAlerts: number;
  healthAlerts: number;
  costAlerts: number;
  
  // Alerts by environment
  alertsByEnvironment: Record<string, number>;
  
  // Alert trends
  newAlertsThisPeriod: number;
  resolvedAlertsThisPeriod: number;
  averageResolutionTime: number; // hours
  
  // Top alerts
  topAlerts: TopAlert[];
}

export interface TopAlert {
  alertId: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  environment: string;
  createdAt: Date;
  status: 'Open' | 'Acknowledged' | 'In_Progress' | 'Resolved';
  assignedTo?: string;
}

export interface ConsolidatedTrendsAnalytics {
  // Security trends
  securityTrends: SecurityTrendAnalytics;
  
  // Compliance trends
  complianceTrends: ComplianceTrendAnalytics;
  
  // Performance trends
  performanceTrends: PerformanceTrendAnalytics;
  
  // Cost trends
  costTrends: CostTrendAnalytics;
  
  // Predictive analytics
  predictiveInsights: PredictiveInsight[];
  
  // Anomaly detection
  detectedAnomalies: DetectedAnomaly[];
}

export interface SecurityTrendAnalytics {
  vulnerabilityTrend: TrendDirection;
  threatLevelTrend: TrendDirection;
  incidentTrend: TrendDirection;
  complianceTrend: TrendDirection;
  
  // Time series data
  monthlySecurityScores: MonthlyDataPoint[];
  monthlyVulnerabilities: MonthlyDataPoint[];
  monthlyIncidents: MonthlyDataPoint[];
}

type TrendDirection = 'Improving' | 'Stable' | 'Worsening';

export interface MonthlyDataPoint {
  month: string;
  value: number;
  change: number; // percentage change from previous month
}

export interface ComplianceTrendAnalytics {
  overallComplianceTrend: TrendDirection;
  frameworkTrends: Record<string, TrendDirection>;
  
  // Time series data
  monthlyComplianceScores: MonthlyDataPoint[];
  monthlyFindings: MonthlyDataPoint[];
  monthlyRemediations: MonthlyDataPoint[];
}

export interface PerformanceTrendAnalytics {
  availabilityTrend: TrendDirection;
  responseTimeTrend: TrendDirection;
  throughputTrend: TrendDirection;
  resourceUtilizationTrend: TrendDirection;
  
  // Time series data
  monthlyAvailability: MonthlyDataPoint[];
  monthlyResponseTime: MonthlyDataPoint[];
  monthlyThroughput: MonthlyDataPoint[];
}

export interface CostTrendAnalytics {
  costTrend: TrendDirection;
  budgetVarianceTrend: TrendDirection;
  optimizationTrend: TrendDirection;
  
  // Time series data
  monthlyCosts: MonthlyDataPoint[];
  monthlyBudgetVariance: MonthlyDataPoint[];
  monthlySavings: MonthlyDataPoint[];
}

export interface PredictiveInsight {
  insightId: string;
  category: 'Security' | 'Compliance' | 'Performance' | 'Cost' | 'Capacity';
  title: string;
  description: string;
  prediction: string;
  confidence: number; // 0-100
  timeframe: string; // e.g., "next 30 days"
  impact: 'High' | 'Medium' | 'Low';
  recommendedActions: string[];
  environment?: string;
}

export interface DetectedAnomaly {
  anomalyId: string;
  type: 'Statistical' | 'Behavioral' | 'Seasonal' | 'Trend';
  category: 'Security' | 'Performance' | 'Cost' | 'Usage';
  description: string;
  detectedAt: Date;
  severity: 'High' | 'Medium' | 'Low';
  environment: string;
  metric: string;
  normalValue: number;
  anomalousValue: number;
  deviation: number; // percentage
  possibleCauses: string[];
  recommendedInvestigation: string[];
}

// Service interfaces for multi-environment management
export interface MultiEnvironmentServiceInterface {
  // Environment management
  createEnvironment(environment: Omit<CloudEnvironmentDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudEnvironmentDefinition>;
  getEnvironments(organizationId: string): Promise<CloudEnvironmentDefinition[]>;
  getEnvironment(environmentId: string): Promise<CloudEnvironmentDefinition>;
  updateEnvironment(environmentId: string, updates: Partial<CloudEnvironmentDefinition>): Promise<CloudEnvironmentDefinition>;
  deleteEnvironment(environmentId: string): Promise<void>;
  
  // Configuration management
  updateMultiEnvironmentConfig(organizationId: string, config: Partial<MultiEnvironmentConfiguration>): Promise<MultiEnvironmentConfiguration>;
  getMultiEnvironmentConfig(organizationId: string): Promise<MultiEnvironmentConfiguration>;
  
  // Access control
  updateEnvironmentAccessPolicy(environmentId: string, policy: EnvironmentAccessPolicy): Promise<EnvironmentAccessPolicy>;
  requestJITAccess(environmentId: string, userId: string, duration: number, justification: string): Promise<JITAccessRequest>;
  approveJITAccess(requestId: string, approverId: string, approved: boolean, comments?: string): Promise<JITAccessRequest>;
  
  // Monitoring and health
  updateMonitoringConfig(organizationId: string, config: EnvironmentMonitoringConfig): Promise<EnvironmentMonitoringConfig>;
  getEnvironmentHealth(environmentId: string): Promise<EnvironmentHealthStatus>;
  triggerHealthCheck(environmentId: string): Promise<HealthCheckResult>;
  
  // Data aggregation
  createAggregationRule(rule: Omit<DataAggregationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataAggregationRule>;
  runAggregation(ruleId: string): Promise<AggregationResult>;
  getConsolidatedDashboard(organizationId: string, timeframe?: { start: Date; end: Date }): Promise<ConsolidatedDashboardData>;
  
  // Compliance management
  updateComplianceMapping(organizationId: string, mapping: EnvironmentComplianceMapping): Promise<EnvironmentComplianceMapping>;
  assessEnvironmentCompliance(environmentId: string, framework: string): Promise<EnvironmentComplianceAssessment>;
  
  // Alerting and notifications
  updateAlertConfiguration(organizationId: string, config: AlertingConfiguration): Promise<AlertingConfiguration>;
  createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert>;
  acknowledgeAlert(alertId: string, userId: string): Promise<Alert>;
}

export interface JITAccessRequest {
  requestId: string;
  environmentId: string;
  userId: string;
  requestedDuration: number;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired' | 'Active' | 'Completed';
  
  // Approval workflow
  requiredApprovals: string[];
  receivedApprovals: JITApproval[];
  
  // Timing
  requestedAt: Date;
  approvedAt?: Date;
  startsAt?: Date;
  expiresAt?: Date;
  completedAt?: Date;
  
  // Access details
  grantedPermissions?: EnvironmentPermission[];
  accessLevel?: EnvironmentAccessLevel;
  
  // Audit trail
  auditTrail: JITAuditEntry[];
}

export interface JITApproval {
  approverId: string;
  approved: boolean;
  approvedAt: Date;
  comments?: string;
}

export interface JITAuditEntry {
  timestamp: Date;
  action: string;
  userId: string;
  details: Record<string, any>;
}

export interface EnvironmentHealthStatus {
  environmentId: string;
  overallHealth: 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
  lastChecked: Date;
  
  // Individual health checks
  healthChecks: HealthCheckStatus[];
  
  // Connectivity
  connectivity: ConnectivityStatus;
  
  // Performance
  performance: PerformanceStatus;
  
  // Security
  security: SecurityStatus;
  
  // Compliance
  compliance: ComplianceHealthStatus;
}

export interface HealthCheckStatus {
  checkId: string;
  checkName: string;
  status: 'Pass' | 'Fail' | 'Warning' | 'Unknown';
  lastRun: Date;
  nextRun: Date;
  message?: string;
  metrics?: Record<string, number>;
}

export interface ConnectivityStatus {
  connected: boolean;
  lastConnected: Date;
  latency?: number;
  throughput?: number;
  errorRate?: number;
  issues?: string[];
}

export interface PerformanceStatus {
  responseTime: number;
  availability: number;
  throughput: number;
  resourceUtilization: ResourceUtilizationStatus;
  issues?: string[];
}

export interface ResourceUtilizationStatus {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

export interface SecurityStatus {
  securityScore: number;
  vulnerabilities: number;
  criticalVulnerabilities: number;
  lastScan: Date;
  threats: number;
  issues?: string[];
}

export interface ComplianceHealthStatus {
  complianceScore: number;
  frameworks: string[];
  controlsImplemented: number;
  controlsTotal: number;
  findings: number;
  criticalFindings: number;
  lastAssessment: Date;
  issues?: string[];
}

export interface HealthCheckResult {
  checkId: string;
  status: 'Pass' | 'Fail' | 'Warning';
  timestamp: Date;
  duration: number;
  results: CheckResultDetail[];
  summary: string;
}

export interface CheckResultDetail {
  component: string;
  status: 'Pass' | 'Fail' | 'Warning';
  message: string;
  metrics?: Record<string, number>;
}

export interface AggregationResult {
  ruleId: string;
  executionId: string;
  startTime: Date;
  endTime: Date;
  status: 'Success' | 'Failed' | 'Partial';
  recordsProcessed: number;
  recordsAggregated: number;
  errors?: AggregationError[];
  results: AggregatedData[];
}

export interface AggregationError {
  environmentId: string;
  error: string;
  details?: string;
}

export interface AggregatedData {
  dataType: DataType;
  aggregationType: AggregationType;
  value: number | string | object;
  metadata: Record<string, any>;
}

export interface EnvironmentComplianceAssessment {
  assessmentId: string;
  environmentId: string;
  framework: string;
  assessmentDate: Date;
  assessor: string;
  
  // Results
  overallScore: number;
  controlsAssessed: number;
  controlsCompliant: number;
  controlsPartiallyCompliant: number;
  controlsNonCompliant: number;
  
  // Findings
  findings: ComplianceAssessmentFinding[];
  
  // Recommendations
  recommendations: ComplianceRecommendation[];
  
  // Evidence
  evidence: EvidenceArtifact[];
  
  // Status
  status: 'Draft' | 'Under_Review' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedDate?: Date;
}

export interface ComplianceAssessmentFinding {
  controlId: string;
  controlName: string;
  finding: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  evidence: string[];
  recommendation: string;
}

export interface ComplianceRecommendation {
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
  estimatedEffort: string;
  expectedBenefits: string;
  implementationSteps: string[];
}

export interface Alert {
  id: string;
  organizationId: string;
  
  // Alert details
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  category: 'Security' | 'Compliance' | 'Performance' | 'Health' | 'Cost';
  
  // Source
  sourceEnvironment?: string;
  sourceSystem?: string;
  sourceComponent?: string;
  
  // Status
  status: 'Open' | 'Acknowledged' | 'In_Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  
  // Timing
  triggeredAt: Date;
  resolvedAt?: Date;
  escalatedAt?: Date;
  
  // Additional data
  metadata: Record<string, any>;
  relatedAlerts?: string[];
  
  // Actions taken
  actions: AlertActionTaken[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertActionTaken {
  actionId: string;
  action: string;
  takenBy: string;
  takenAt: Date;
  result: string;
  details?: Record<string, any>;
}
