// Multi-Cloud Data Connector Types
// Supports Azure, AWS, GCP, and Oracle Cloud compliance data ingestion

import { CloudProvider, SyncStatus } from './organization';

export interface CloudConnector {
  id: string;
  organizationId: string;
  environmentId: string;
  provider: CloudProvider;
  name: string;
  description: string;
  status: ConnectorStatus;
  configuration: CloudConnectorConfiguration;
  
  // Authentication and access
  credentials: CredentialConfiguration;
  permissions: RequiredPermission[];
  
  // Data collection settings
  dataCollection: DataCollectionSettings;
  
  // Sync and monitoring
  syncSchedule: SyncSchedule;
  lastSync: SyncResult;
  healthCheck: HealthStatus;
  
  // Compliance mapping
  complianceMapping: ComplianceMapping;
  
  // Audit and logging
  auditSettings: AuditSettings;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type ConnectorStatus = 
  | 'Active'
  | 'Inactive' 
  | 'Error'
  | 'Configuring'
  | 'Testing'
  | 'Syncing'
  | 'Suspended';

export interface CloudConnectorConfiguration {
  // Common fields
  region: string;
  environment: string;
  
  // Provider-specific configurations
  azure?: AzureConfiguration;
  aws?: AWSConfiguration;
  gcp?: GCPConfiguration;
  oracle?: OracleConfiguration;
}

// Azure-specific configuration
export interface AzureConfiguration {
  subscriptionId: string;
  tenantId: string;
  managementGroups?: string[];
  resourceGroups?: string[];
  
  // Service-specific settings
  services: AzureServiceConfiguration;
  
  // Government cloud settings
  cloudEnvironment: AzureCloudEnvironment;
  
  // Compliance-specific settings
  securityCenter: SecurityCenterConfiguration;
  defender: DefenderConfiguration;
  sentinel: SentinelConfiguration;
  policyCompliance: PolicyComplianceConfiguration;
}

export type AzureCloudEnvironment = 'Commercial' | 'Government' | 'China' | 'Germany';

export interface AzureServiceConfiguration {
  resourceManager: ServiceConfig;
  securityCenter: ServiceConfig;
  defender: ServiceConfig;
  monitor: ServiceConfig;
  policyInsights: ServiceConfig;
  keyVault: ServiceConfig;
  storage: ServiceConfig;
  compute: ServiceConfig;
  networking: ServiceConfig;
  databases: ServiceConfig;
  webApps: ServiceConfig;
  containerServices: ServiceConfig;
  aiServices: ServiceConfig;
}

export interface ServiceConfig {
  enabled: boolean;
  apiVersion: string;
  customFilters?: ResourceFilter[];
  rateLimit?: RateLimitConfig;
}

export interface ResourceFilter {
  property: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'in' | 'notIn' | 'greaterThan' | 'lessThan';

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstLimit: number;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

export interface SecurityCenterConfiguration {
  subscriptions: string[];
  assessmentTypes: AssessmentType[];
  alertTypes: AlertType[];
  recommendationFilters: RecommendationFilter[];
}

export type AssessmentType = 'Security' | 'Compliance' | 'Vulnerability' | 'Configuration';

export type AlertType = 'Security' | 'Anomaly' | 'Threat' | 'Compliance';

export interface RecommendationFilter {
  category: string;
  severity: string[];
  status: string[];
}

export interface DefenderConfiguration {
  plans: DefenderPlan[];
  workspaces: string[];
  alertRules: AlertRuleConfig[];
}

export interface DefenderPlan {
  resourceType: string;
  tier: DefenderTier;
  enabled: boolean;
}

export type DefenderTier = 'Free' | 'Standard';

export interface AlertRuleConfig {
  name: string;
  enabled: boolean;
  severity: string[];
  tactics: string[];
}

export interface SentinelConfiguration {
  workspaces: SentinelWorkspace[];
  dataConnectors: DataConnectorConfig[];
  analyticsRules: AnalyticsRuleConfig[];
}

export interface SentinelWorkspace {
  id: string;
  name: string;
  resourceGroup: string;
  retentionDays: number;
}

export interface DataConnectorConfig {
  type: string;
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface AnalyticsRuleConfig {
  name: string;
  type: string;
  enabled: boolean;
  severity: string;
  tactics: string[];
}

export interface PolicyComplianceConfiguration {
  initiatives: PolicyInitiative[];
  customPolicies: CustomPolicy[];
  exemptions: PolicyExemption[];
}

export interface PolicyInitiative {
  id: string;
  name: string;
  displayName: string;
  scope: string;
  parameters?: Record<string, any>;
}

export interface CustomPolicy {
  id: string;
  name: string;
  definition: PolicyDefinition;
  assignment: PolicyAssignment;
}

export interface PolicyDefinition {
  mode: string;
  parameters?: Record<string, any>;
  policyRule: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface PolicyAssignment {
  scope: string;
  parameters?: Record<string, any>;
  enforcementMode: EnforcementMode;
}

export type EnforcementMode = 'Default' | 'DoNotEnforce';

export interface PolicyExemption {
  id: string;
  scope: string;
  policyAssignmentId: string;
  exemptionCategory: ExemptionCategory;
  expiresOn?: Date;
  displayName: string;
  description: string;
}

export type ExemptionCategory = 'Waiver' | 'Mitigated';

// AWS-specific configuration
export interface AWSConfiguration {
  accountId: string;
  regions: string[];
  organizationalUnit?: string;
  
  // Service-specific settings
  services: AWSServiceConfiguration;
  
  // Compliance-specific settings
  securityHub: SecurityHubConfiguration;
  config: ConfigServiceConfiguration;
  cloudTrail: CloudTrailConfiguration;
  inspector: InspectorConfiguration;
  guardDuty: GuardDutyConfiguration;
}

export interface AWSServiceConfiguration {
  ec2: ServiceConfig;
  s3: ServiceConfig;
  iam: ServiceConfig;
  rds: ServiceConfig;
  lambda: ServiceConfig;
  vpc: ServiceConfig;
  cloudFormation: ServiceConfig;
  securityHub: ServiceConfig;
  config: ServiceConfig;
  cloudTrail: ServiceConfig;
  inspector: ServiceConfig;
  guardDuty: ServiceConfig;
  systems_manager: ServiceConfig;
}

export interface SecurityHubConfiguration {
  regions: string[];
  standards: SecurityStandard[];
  findingFilters: FindingFilter[];
  customInsights: CustomInsight[];
}

export interface SecurityStandard {
  arn: string;
  name: string;
  enabled: boolean;
  controls: SecurityControl[];
}

export interface SecurityControl {
  id: string;
  title: string;
  enabled: boolean;
  parameters?: Record<string, any>;
}

export interface FindingFilter {
  property: string;
  operator: string;
  value: any;
}

export interface CustomInsight {
  name: string;
  filters: FindingFilter[];
  groupBy: string;
}

export interface ConfigServiceConfiguration {
  regions: string[];
  rules: ConfigRule[];
  conformancePacks: ConformancePack[];
  aggregators: ConfigAggregator[];
}

export interface ConfigRule {
  name: string;
  source: ConfigRuleSource;
  scope?: ConfigRuleScope;
  parameters?: Record<string, any>;
}

export interface ConfigRuleSource {
  owner: string;
  sourceIdentifier: string;
  sourceDetails?: ConfigRuleSourceDetail[];
}

export interface ConfigRuleSourceDetail {
  eventSource: string;
  messageType: string;
  maximumExecutionFrequency?: string;
}

export interface ConfigRuleScope {
  complianceResourceTypes?: string[];
  complianceResourceId?: string;
  tagKey?: string;
  tagValue?: string;
}

export interface ConformancePack {
  name: string;
  templateBody: string;
  parameters?: Record<string, any>;
}

export interface ConfigAggregator {
  name: string;
  accountAggregationSources?: AccountAggregationSource[];
  organizationAggregationSource?: OrganizationAggregationSource;
}

export interface AccountAggregationSource {
  accountIds: string[];
  regions: string[];
  allAwsRegions?: boolean;
}

export interface OrganizationAggregationSource {
  roleArn: string;
  regions: string[];
  allAwsRegions?: boolean;
}

export interface CloudTrailConfiguration {
  trails: CloudTrail[];
  eventSelectors: EventSelector[];
  insightSelectors: InsightSelector[];
}

export interface CloudTrail {
  name: string;
  s3BucketName: string;
  s3KeyPrefix?: string;
  includeGlobalServiceEvents: boolean;
  isMultiRegionTrail: boolean;
  enableLogFileValidation: boolean;
}

export interface EventSelector {
  readWriteType: ReadWriteType;
  includeManagementEvents: boolean;
  dataResources?: DataResource[];
  excludeManagementEventSources?: string[];
}

export type ReadWriteType = 'ReadOnly' | 'WriteOnly' | 'All';

export interface DataResource {
  type: string;
  values: string[];
}

export interface InsightSelector {
  insightType: InsightType;
}

export type InsightType = 'ApiCallRateInsight' | 'ApiErrorRateInsight';

export interface InspectorConfiguration {
  assessmentTargets: AssessmentTarget[];
  assessmentTemplates: AssessmentTemplate[];
  rulesPackages: string[];
}

export interface AssessmentTarget {
  arn: string;
  name: string;
  resourceGroupArn?: string;
}

export interface AssessmentTemplate {
  arn: string;
  name: string;
  assessmentTargetArn: string;
  durationInSeconds: number;
  rulesPackageArns: string[];
  userAttributesForFindings?: Record<string, string>[];
}

export interface GuardDutyConfiguration {
  detectors: GuardDutyDetector[];
  threatIntelSets: ThreatIntelSet[];
  ipSets: IPSet[];
}

export interface GuardDutyDetector {
  detectorId: string;
  status: DetectorStatus;
  datasources: DataSourceConfigurations;
  findingPublishingFrequency: FindingPublishingFrequency;
}

export type DetectorStatus = 'ENABLED' | 'DISABLED';

export interface DataSourceConfigurations {
  s3Logs?: DataSourceStatus;
  kubernetes?: KubernetesConfiguration;
  malwareProtection?: MalwareProtectionConfiguration;
}

export interface DataSourceStatus {
  enable: boolean;
}

export interface KubernetesConfiguration {
  auditLogs: DataSourceStatus;
}

export interface MalwareProtectionConfiguration {
  scanEc2InstanceWithFindings: DataSourceStatus;
}

export type FindingPublishingFrequency = 'FIFTEEN_MINUTES' | 'ONE_HOUR' | 'SIX_HOURS';

export interface ThreatIntelSet {
  threatIntelSetId: string;
  name: string;
  format: ThreatIntelSetFormat;
  location: string;
  status: ThreatIntelSetStatus;
}

export type ThreatIntelSetFormat = 'TXT' | 'STIX' | 'OTX_CSV' | 'ALIEN_VAULT' | 'PROOF_POINT' | 'FIRE_EYE';

export type ThreatIntelSetStatus = 'INACTIVE' | 'ACTIVATING' | 'ACTIVE' | 'DEACTIVATING' | 'ERROR' | 'DELETE_PENDING' | 'DELETED';

export interface IPSet {
  ipSetId: string;
  name: string;
  format: IPSetFormat;
  location: string;
  status: IPSetStatus;
}

export type IPSetFormat = 'TXT' | 'STIX' | 'OTX_CSV' | 'ALIEN_VAULT' | 'PROOF_POINT' | 'FIRE_EYE';

export type IPSetStatus = 'INACTIVE' | 'ACTIVATING' | 'ACTIVE' | 'DEACTIVATING' | 'ERROR' | 'DELETE_PENDING' | 'DELETED';

// GCP-specific configuration
export interface GCPConfiguration {
  projectId: string;
  organizationId?: string;
  folderId?: string;
  
  // Service-specific settings
  services: GCPServiceConfiguration;
  
  // Compliance-specific settings
  securityCenter: GCPSecurityCenterConfiguration;
  cloudAsset: CloudAssetConfiguration;
  logging: CloudLoggingConfiguration;
  monitoring: CloudMonitoringConfiguration;
}

export interface GCPServiceConfiguration {
  compute: ServiceConfig;
  storage: ServiceConfig;
  iam: ServiceConfig;
  bigquery: ServiceConfig;
  cloudSql: ServiceConfig;
  kubernetes: ServiceConfig;
  appEngine: ServiceConfig;
  cloudFunctions: ServiceConfig;
  securityCenter: ServiceConfig;
  cloudAsset: ServiceConfig;
  logging: ServiceConfig;
  monitoring: ServiceConfig;
}

export interface GCPSecurityCenterConfiguration {
  organization: string;
  sources: SecuritySource[];
  findings: FindingConfiguration;
  assets: AssetConfiguration;
}

export interface SecuritySource {
  name: string;
  displayName: string;
  description: string;
}

export interface FindingConfiguration {
  categories: string[];
  states: FindingState[];
  filters: SecurityFindingFilter[];
}

export type FindingState = 'ACTIVE' | 'INACTIVE';

export interface SecurityFindingFilter {
  property: string;
  operator: string;
  value: any;
}

export interface AssetConfiguration {
  types: string[];
  filters: AssetFilter[];
}

export interface AssetFilter {
  property: string;
  operator: string;
  value: any;
}

export interface CloudAssetConfiguration {
  parent: string;
  assetTypes: string[];
  contentType: ContentType;
  readTime?: Date;
}

export type ContentType = 'CONTENT_TYPE_UNSPECIFIED' | 'RESOURCE' | 'IAM_POLICY' | 'ORG_POLICY' | 'ACCESS_POLICY';

export interface CloudLoggingConfiguration {
  parent: string;
  logTypes: LogType[];
  sinks: LogSink[];
  metrics: LogMetric[];
}

export type LogType = 'AUDIT_LOG' | 'DATA_ACCESS' | 'SYSTEM_EVENT' | 'POLICY';

export interface LogSink {
  name: string;
  destination: string;
  filter: string;
  description?: string;
}

export interface LogMetric {
  name: string;
  description: string;
  filter: string;
  metricDescriptor: MetricDescriptor;
}

export interface MetricDescriptor {
  metricKind: MetricKind;
  valueType: ValueType;
  labels?: LabelDescriptor[];
}

export type MetricKind = 'METRIC_KIND_UNSPECIFIED' | 'GAUGE' | 'DELTA' | 'CUMULATIVE';

export type ValueType = 'VALUE_TYPE_UNSPECIFIED' | 'BOOL' | 'INT64' | 'DOUBLE' | 'STRING' | 'DISTRIBUTION' | 'MONEY';

export interface LabelDescriptor {
  key: string;
  valueType: ValueType;
  description?: string;
}

export interface CloudMonitoringConfiguration {
  project: string;
  alertPolicies: AlertPolicy[];
  uptimeChecks: UptimeCheck[];
}

export interface AlertPolicy {
  name: string;
  displayName: string;
  conditions: AlertCondition[];
  notificationChannels: string[];
  enabled: boolean;
}

export interface AlertCondition {
  displayName: string;
  conditionThreshold: MetricThreshold;
}

export interface MetricThreshold {
  filter: string;
  comparison: ComparisonType;
  thresholdValue: number;
  duration: string;
}

export type ComparisonType = 
  | 'COMPARISON_UNSPECIFIED'
  | 'COMPARISON_GT'
  | 'COMPARISON_GE'
  | 'COMPARISON_LT'
  | 'COMPARISON_LE'
  | 'COMPARISON_EQ'
  | 'COMPARISON_NE';

export interface UptimeCheck {
  name: string;
  displayName: string;
  monitoredResource: MonitoredResource;
  httpCheck?: HttpCheck;
  tcpCheck?: TcpCheck;
  period: string;
  timeout: string;
}

export interface MonitoredResource {
  type: string;
  labels: Record<string, string>;
}

export interface HttpCheck {
  requestMethod: HttpMethod;
  useSsl: boolean;
  path: string;
  port: number;
  authInfo?: BasicAuthentication;
  headers: Record<string, string>;
}

export type HttpMethod = 'METHOD_UNSPECIFIED' | 'GET' | 'POST';

export interface BasicAuthentication {
  username: string;
  password: string;
}

export interface TcpCheck {
  port: number;
}

// Oracle Cloud-specific configuration
export interface OracleConfiguration {
  tenancyId: string;
  compartmentId: string;
  region: string;
  
  // Service-specific settings
  services: OracleServiceConfiguration;
  
  // Compliance-specific settings
  cloudGuard: CloudGuardConfiguration;
  securityZones: SecurityZonesConfiguration;
  logging: OracleLoggingConfiguration;
  monitoring: OracleMonitoringConfiguration;
}

export interface OracleServiceConfiguration {
  compute: ServiceConfig;
  storage: ServiceConfig;
  networking: ServiceConfig;
  database: ServiceConfig;
  identity: ServiceConfig;
  security: ServiceConfig;
  cloudGuard: ServiceConfig;
  logging: ServiceConfig;
  monitoring: ServiceConfig;
}

export interface CloudGuardConfiguration {
  reportingRegion: string;
  targets: CloudGuardTarget[];
  detectorRules: DetectorRule[];
  responderRules: ResponderRule[];
}

export interface CloudGuardTarget {
  id: string;
  displayName: string;
  compartmentId: string;
  targetResourceType: TargetResourceType;
  targetResourceId: string;
}

export type TargetResourceType = 'COMPARTMENT' | 'ERPCLOUD' | 'HCMCLOUD' | 'SECURITY_ZONE';

export interface DetectorRule {
  id: string;
  displayName: string;
  description: string;
  recommendation: string;
  detector: DetectorType;
  serviceType: string;
  resourceType: string;
}

export type DetectorType = 
  | 'IAAS_ACTIVITY_DETECTOR'
  | 'IAAS_CONFIGURATION_DETECTOR'
  | 'IAAS_THREAT_DETECTOR'
  | 'IAAS_LOG_INSIGHT_DETECTOR';

export interface ResponderRule {
  id: string;
  displayName: string;
  description: string;
  type: ResponderType;
  details: ResponderRuleDetails;
}

export type ResponderType = 'REMEDIATION' | 'NOTIFICATION';

export interface ResponderRuleDetails {
  condition: string;
  configurations: ResponderConfiguration[];
}

export interface ResponderConfiguration {
  configKey: string;
  name: string;
  value: string;
}

export interface SecurityZonesConfiguration {
  zones: SecurityZone[];
  recipes: SecurityRecipe[];
}

export interface SecurityZone {
  id: string;
  displayName: string;
  compartmentId: string;
  securityZoneRecipeId: string;
}

export interface SecurityRecipe {
  id: string;
  displayName: string;
  description: string;
  securityPolicies: string[];
}

export interface OracleLoggingConfiguration {
  logGroups: LogGroup[];
  logs: Log[];
  unifiedAgentConfigurations: UnifiedAgentConfiguration[];
}

export interface LogGroup {
  id: string;
  displayName: string;
  compartmentId: string;
  description: string;
}

export interface Log {
  id: string;
  displayName: string;
  logGroupId: string;
  logType: OracleLogType;
  configuration: LogConfiguration;
}

export type OracleLogType = 'SERVICE' | 'CUSTOM';

export interface LogConfiguration {
  source: LogSource;
  archiving: LogArchiving;
}

export interface LogSource {
  category: string;
  resource: string;
  service: string;
  sourceType: SourceType;
}

export type SourceType = 'OCISERVICE' | 'CUSTOM';

export interface LogArchiving {
  isEnabled: boolean;
}

export interface UnifiedAgentConfiguration {
  id: string;
  displayName: string;
  compartmentId: string;
  isEnabled: boolean;
  serviceConfiguration: ServiceConfiguration;
}

export interface ServiceConfiguration {
  configurationType: ConfigurationType;
  sources: UnifiedAgentConfigurationSource[];
  destination: UnifiedAgentConfigurationDestination;
}

export type ConfigurationType = 'LOGGING';

export interface UnifiedAgentConfigurationSource {
  sourceType: UnifiedAgentSourceType;
  paths: string[];
  parser: UnifiedAgentParser;
}

export type UnifiedAgentSourceType = 'LOG_TAIL' | 'WINDOWS_EVENT_LOG';

export interface UnifiedAgentParser {
  parserType: ParserType;
}

export type ParserType = 'AUDITD' | 'JSON' | 'TSV' | 'CSV' | 'NONE' | 'SYSLOG' | 'APACHE2' | 'APACHE_ERROR' | 'MSGPACK' | 'REGEXP' | 'MULTILINE' | 'GROK' | 'MULTILINE_GROK';

export interface UnifiedAgentConfigurationDestination {
  logObjectId: string;
}

export interface OracleMonitoringConfiguration {
  alarms: MonitoringAlarm[];
  metrics: MonitoringMetric[];
}

export interface MonitoringAlarm {
  id: string;
  displayName: string;
  compartmentId: string;
  metricCompartmentId: string;
  namespace: string;
  query: string;
  severity: AlarmSeverity;
  destinations: string[];
  isEnabled: boolean;
}

export type AlarmSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';

export interface MonitoringMetric {
  namespace: string;
  name: string;
  compartmentId: string;
  dimensions: Record<string, string>;
}

// Common configuration interfaces
export interface CredentialConfiguration {
  type: CredentialType;
  
  // Azure
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  certificateThumbprint?: string;
  
  // AWS
  accessKeyId?: string;
  secretAccessKey?: string;
  roleArn?: string;
  externalId?: string;
  
  // GCP
  serviceAccountEmail?: string;
  privateKeyId?: string;
  privateKey?: string;
  
  // Oracle
  userId?: string;
  fingerprint?: string;
  passphrase?: string;
  
  // Key Vault/Secrets Manager references
  keyVaultUrl?: string;
  secretName?: string;
  
  // Encryption settings
  encryptionSettings: EncryptionSettings;
}

export type CredentialType = 
  | 'ServicePrincipal'
  | 'ManagedIdentity'
  | 'AssumeRole'
  | 'ServiceAccount'
  | 'UserPrincipal'
  | 'Certificate';

export interface EncryptionSettings {
  encryptAtRest: boolean;
  encryptInTransit: boolean;
  keyRotationEnabled: boolean;
  keyRotationIntervalDays: number;
  algorithm: EncryptionAlgorithm;
}

export type EncryptionAlgorithm = 'AES-256' | 'RSA-2048' | 'RSA-4096';

export interface RequiredPermission {
  service: string;
  scope: string;
  permission: string;
  reason: string;
  required: boolean;
}

export interface DataCollectionSettings {
  resources: ResourceCollectionConfig[];
  compliance: ComplianceDataConfig;
  security: SecurityDataConfig;
  inventory: InventoryDataConfig;
  performance: PerformanceDataConfig;
}

export interface ResourceCollectionConfig {
  type: string;
  enabled: boolean;
  filters: ResourceFilter[];
  fields: string[];
  schedule: CollectionSchedule;
}

export interface CollectionSchedule {
  frequency: CollectionFrequency;
  time?: string; // HH:mm format
  timezone: string;
  enabled: boolean;
}

export type CollectionFrequency = 'RealTime' | 'Hourly' | 'Daily' | 'Weekly';

export interface ComplianceDataConfig {
  frameworks: ComplianceFramework[];
  assessments: AssessmentConfig[];
  policies: PolicyConfig[];
  findings: FindingConfig[];
}

export interface ComplianceFramework {
  name: string;
  version: string;
  enabled: boolean;
  controls: ControlConfig[];
}

export interface ControlConfig {
  id: string;
  enabled: boolean;
  customMapping?: string;
  parameters?: Record<string, any>;
}

export interface AssessmentConfig {
  type: string;
  enabled: boolean;
  schedule: CollectionSchedule;
  scope: string[];
}

export interface PolicyConfig {
  type: string;
  enabled: boolean;
  customRules?: PolicyRule[];
}

export interface PolicyRule {
  name: string;
  description: string;
  rule: string;
  severity: string;
}

export interface FindingConfig {
  severity: string[];
  categories: string[];
  statuses: string[];
  maxAge: number; // days
}

export interface SecurityDataConfig {
  threats: ThreatDataConfig;
  vulnerabilities: VulnerabilityDataConfig;
  incidents: IncidentDataConfig;
  logs: SecurityLogConfig;
}

export interface ThreatDataConfig {
  sources: string[];
  severity: string[];
  categories: string[];
  realTimeAlerts: boolean;
}

export interface VulnerabilityDataConfig {
  sources: string[];
  severity: string[];
  cvssScore: CVSSScoreRange;
  includePatched: boolean;
}

export interface CVSSScoreRange {
  min: number;
  max: number;
}

export interface IncidentDataConfig {
  sources: string[];
  severity: string[];
  status: string[];
  assignedOnly: boolean;
}

export interface SecurityLogConfig {
  sources: string[];
  logTypes: string[];
  retentionDays: number;
  realTimeStreaming: boolean;
}

export interface InventoryDataConfig {
  resources: InventoryResourceConfig[];
  metadata: MetadataConfig;
  relationships: RelationshipConfig;
  changes: ChangeTrackingConfig;
}

export interface InventoryResourceConfig {
  type: string;
  enabled: boolean;
  includeDeleted: boolean;
  properties: string[];
}

export interface MetadataConfig {
  includeTags: boolean;
  includeLabels: boolean;
  includeAnnotations: boolean;
  customFields: CustomFieldConfig[];
}

export interface CustomFieldConfig {
  name: string;
  type: FieldType;
  source: string;
  required: boolean;
}

export type FieldType = 'String' | 'Number' | 'Boolean' | 'Date' | 'Array' | 'Object';

export interface RelationshipConfig {
  includeParentChild: boolean;
  includeDependencies: boolean;
  includeNetworking: boolean;
  customRelationships: CustomRelationshipConfig[];
}

export interface CustomRelationshipConfig {
  name: string;
  sourceType: string;
  targetType: string;
  relationshipType: string;
}

export interface ChangeTrackingConfig {
  enabled: boolean;
  trackDeletes: boolean;
  trackMetadata: boolean;
  retentionDays: number;
}

export interface PerformanceDataConfig {
  metrics: MetricConfig[];
  aggregation: AggregationConfig;
  alerting: AlertingConfig;
}

export interface MetricConfig {
  name: string;
  enabled: boolean;
  dimensions: string[];
  aggregationType: AggregationType;
  retentionDays: number;
}

export type AggregationType = 'Sum' | 'Average' | 'Min' | 'Max' | 'Count';

export interface AggregationConfig {
  intervals: AggregationInterval[];
  functions: AggregationFunction[];
}

export type AggregationInterval = '1m' | '5m' | '15m' | '1h' | '1d';

export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile';

export interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  notifications: NotificationConfig[];
}

export interface AlertThreshold {
  metric: string;
  operator: ThresholdOperator;
  value: number;
  duration: string;
  severity: string;
}

export type ThresholdOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';

export interface NotificationConfig {
  type: NotificationType;
  destination: string;
  template?: string;
}

export type NotificationType = 'Email' | 'SMS' | 'Webhook' | 'Teams' | 'Slack';

export interface SyncSchedule {
  enabled: boolean;
  frequency: SyncFrequency;
  time?: string; // HH:mm format
  timezone: string;
  maxDuration: number; // minutes
  retryPolicy: SyncRetryPolicy;
}

export type SyncFrequency = 'Manual' | 'RealTime' | 'Hourly' | 'Daily' | 'Weekly';

export interface SyncRetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffInterval: number; // seconds
  errorThreshold: number; // percentage
}

export interface SyncResult {
  id: string;
  startTime: Date;
  endTime: Date;
  status: SyncStatus;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors: SyncError[];
  warnings: SyncWarning[];
  summary: SyncSummary;
}

export interface SyncError {
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  resourceId?: string;
  retryable: boolean;
}

export type ErrorCategory = 
  | 'Authentication'
  | 'Authorization'
  | 'Network'
  | 'RateLimit'
  | 'Validation'
  | 'Processing'
  | 'Configuration';

export type ErrorSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface SyncWarning {
  timestamp: Date;
  category: string;
  message: string;
  resourceId?: string;
}

export interface SyncSummary {
  resourceTypes: ResourceTypeSummary[];
  complianceChanges: ComplianceChangeSummary[];
  newFindings: number;
  resolvedFindings: number;
  dataSize: number; // bytes
}

export interface ResourceTypeSummary {
  type: string;
  total: number;
  added: number;
  updated: number;
  deleted: number;
  unchanged: number;
}

export interface ComplianceChangeSummary {
  framework: string;
  improved: number;
  degraded: number;
  unchanged: number;
}

export interface HealthStatus {
  status: HealthStatusType;
  lastCheck: Date;
  checks: HealthCheck[];
  metrics: HealthMetric[];
}

export type HealthStatusType = 'Healthy' | 'Warning' | 'Critical' | 'Unknown';

export interface HealthCheck {
  name: string;
  status: HealthStatusType;
  message: string;
  lastCheck: Date;
  duration: number; // milliseconds
}

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: HealthThreshold;
  timestamp: Date;
}

export interface HealthThreshold {
  warning: number;
  critical: number;
}

export interface ComplianceMapping {
  frameworks: FrameworkMapping[];
  customMappings: CustomControlMapping[];
  exclusions: ComplianceExclusion[];
}

export interface FrameworkMapping {
  framework: string;
  version: string;
  controls: ControlMapping[];
  enabled: boolean;
}

export interface ControlMapping {
  controlId: string;
  resourceTypes: string[];
  properties: PropertyMapping[];
  rules: MappingRule[];
}

export interface PropertyMapping {
  source: string;
  target: string;
  transformation?: string;
}

export interface MappingRule {
  condition: string;
  action: MappingAction;
  parameters?: Record<string, any>;
}

export type MappingAction = 'Include' | 'Exclude' | 'Transform' | 'Alert';

export interface CustomControlMapping {
  id: string;
  name: string;
  description: string;
  framework: string;
  controlId: string;
  implementation: string;
  automated: boolean;
}

export interface ComplianceExclusion {
  resourceType: string;
  resourceId?: string;
  controls: string[];
  reason: string;
  approvedBy: string;
  expiresAt?: Date;
}

export interface AuditSettings {
  enabled: boolean;
  logLevel: LogLevel;
  retention: AuditRetention;
  destinations: AuditDestination[];
  filters: AuditFilter[];
}

export type LogLevel = 'Debug' | 'Info' | 'Warning' | 'Error' | 'Critical';

export interface AuditRetention {
  days: number;
  archiveAfterDays?: number;
  archiveDestination?: string;
  compressionEnabled: boolean;
}

export interface AuditDestination {
  type: AuditDestinationType;
  configuration: AuditDestinationConfig;
  enabled: boolean;
}

export type AuditDestinationType = 'LocalStorage' | 'CloudStorage' | 'SIEM' | 'LogAnalytics' | 'Webhook';

export interface AuditDestinationConfig {
  endpoint?: string;
  credentials?: CredentialConfiguration;
  format: AuditFormat;
  bufferSize?: number;
  flushInterval?: number; // seconds
}

export type AuditFormat = 'JSON' | 'CEF' | 'LEEF' | 'Syslog';

export interface AuditFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  action: FilterAction;
}

export type FilterAction = 'Include' | 'Exclude' | 'Mask' | 'Hash';
