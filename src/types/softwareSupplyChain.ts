/**
 * Secure Software Supply Chain (SSSC) Type Definitions
 * 
 * The DoD considers SSSC a core competency for cATO. This system provides
 * comprehensive monitoring and assessment of software supply chain security,
 * integrating with DevSecOps pipelines and providing real-time visibility
 * into software supply chain health.
 * 
 * Covers NIST SSDF (Secure Software Development Framework) and DoD guidance
 * on secure software supply chain practices.
 */

import { RiskLevel, ArtifactReference } from './executionEnablers';

// Core SSSC framework alignment
export type SSCFramework = 
  | 'NIST_SSDF'      // NIST Secure Software Development Framework
  | 'SLSA'           // Supply-chain Levels for Software Artifacts
  | 'SCVS'           // Software Component Verification Standard
  | 'BSIMM'          // Building Security In Maturity Model
  | 'OWASP_SCVS'     // OWASP Software Component Verification Standard
  | 'DoD_ESF';       // DoD Enterprise Software Framework

export type SSCMaturityLevel = 
  | 'Level_0'        // No secure development practices
  | 'Level_1'        // Basic security practices
  | 'Level_2'        // Managed security practices
  | 'Level_3'        // Defined security practices
  | 'Level_4';       // Optimized security practices

export type PipelineType = 
  | 'Azure_DevOps'
  | 'GitHub_Actions'
  | 'GitLab_CI'
  | 'Jenkins'
  | 'CircleCI'
  | 'AWS_CodePipeline'
  | 'Google_Cloud_Build'
  | 'Other';

export type ScanType = 
  | 'SAST'           // Static Application Security Testing
  | 'DAST'           // Dynamic Application Security Testing
  | 'SCA'            // Software Composition Analysis
  | 'IAST'           // Interactive Application Security Testing
  | 'Container'      // Container vulnerability scanning
  | 'IaC'            // Infrastructure as Code scanning
  | 'Secrets'        // Secret detection
  | 'License'        // License compliance
  | 'Malware';       // Malware detection

export type VulnerabilitySeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type ComponentType = 
  | 'Open_Source_Library'
  | 'Third_Party_Commercial'
  | 'Internal_Component'
  | 'Container_Image'
  | 'System_Library'
  | 'Framework'
  | 'Plugin'
  | 'Service_Dependency';

// Software supply chain pipeline integration
export interface SSCPipeline {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  
  // Pipeline configuration
  type: PipelineType;
  repositoryUrl: string;
  repositoryProvider: 'GitHub' | 'Azure_DevOps' | 'GitLab' | 'Bitbucket' | 'Other';
  
  // Authentication and access
  credentials: PipelineCredentials;
  
  // Monitoring configuration
  monitoringEnabled: boolean;
  scanConfiguration: ScanConfiguration;
  
  // Integration settings
  webhookUrl?: string;
  apiEndpoint?: string;
  integrationStatus: 'Active' | 'Inactive' | 'Error' | 'Pending_Setup';
  
  // Metadata
  applicationName: string;
  applicationOwner: string;
  businessUnit: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  
  // Framework compliance
  frameworkAlignments: FrameworkAlignment[];
  
  // Tracking
  lastScanDate?: Date;
  lastSuccessfulScan?: Date;
  nextScheduledScan?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PipelineCredentials {
  credentialType: 'Personal_Access_Token' | 'OAuth' | 'Service_Principal' | 'SSH_Key' | 'API_Key';
  credentialLocation: 'Azure_Key_Vault' | 'Environment_Variable' | 'Config_File';
  keyVaultReference?: string;
  environmentVariable?: string;
  encrypted: boolean;
  rotationRequired: boolean;
  expirationDate?: Date;
}

export interface ScanConfiguration {
  enabledScans: ScanType[];
  scanFrequency: 'On_Commit' | 'Daily' | 'Weekly' | 'Monthly' | 'Manual';
  
  // Scan-specific configurations
  sastConfig?: SASTConfiguration;
  scaConfig?: SCAConfiguration;
  containerConfig?: ContainerScanConfiguration;
  secretsConfig?: SecretsConfiguration;
  
  // Quality gates
  qualityGates: QualityGate[];
  
  // Notification settings
  notificationConfig: ScanNotificationConfig;
}

export interface SASTConfiguration {
  enabled: boolean;
  scanners: string[]; // Tool names like 'SonarQube', 'Checkmarx', 'Veracode'
  rulesets: string[];
  excludedPaths: string[];
  failOnSeverity: VulnerabilitySeverity;
  customRules?: CustomRule[];
}

export interface SCAConfiguration {
  enabled: boolean;
  scanners: string[]; // Tool names like 'Snyk', 'WhiteSource', 'Black Duck'
  includeDevDependencies: boolean;
  includeDirect: boolean;
  includeTransitive: boolean;
  licensePolicy: LicensePolicy;
  vulnerabilityPolicy: VulnerabilityPolicy;
}

export interface ContainerScanConfiguration {
  enabled: boolean;
  scanners: string[]; // Tool names like 'Trivy', 'Clair', 'Anchore'
  baseImageScanning: boolean;
  layerAnalysis: boolean;
  secretScanning: boolean;
  malwareScanning: boolean;
  registryScanning: boolean;
}

export interface SecretsConfiguration {
  enabled: boolean;
  scanners: string[]; // Tool names like 'GitLeaks', 'TruffleHog'
  customPatterns: string[];
  excludedFiles: string[];
  historicalScanning: boolean;
}

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  scanType: ScanType;
  criteria: GateCriterion[];
  action: 'Block' | 'Warn' | 'Inform';
  enabled: boolean;
}

export interface GateCriterion {
  metric: string; // e.g., 'critical_vulnerabilities', 'high_risk_components'
  operator: 'Greater_Than' | 'Less_Than' | 'Equal' | 'Not_Equal' | 'Contains';
  threshold: number | string;
  description: string;
}

export interface ScanNotificationConfig {
  onSuccess: NotificationRule[];
  onFailure: NotificationRule[];
  onQualityGateFailure: NotificationRule[];
  onNewVulnerabilities: NotificationRule[];
}

export interface NotificationRule {
  enabled: boolean;
  recipients: string[];
  channels: ('Email' | 'Slack' | 'Teams' | 'Webhook')[];
  severity?: VulnerabilitySeverity;
  includeDetails: boolean;
}

export interface FrameworkAlignment {
  framework: SSCFramework;
  targetLevel: SSCMaturityLevel;
  currentLevel: SSCMaturityLevel;
  compliance: FrameworkCompliance[];
  lastAssessment: Date;
  nextAssessment: Date;
}

export interface FrameworkCompliance {
  practiceId: string;
  practiceName: string;
  description: string;
  status: 'Compliant' | 'Partially_Compliant' | 'Non_Compliant' | 'Not_Assessed';
  evidence: ArtifactReference[];
  notes?: string;
}

// Scan results and vulnerability tracking
export interface ScanResult {
  id: string;
  pipelineId: string;
  organizationId: string;
  
  // Scan metadata
  scanType: ScanType;
  scanTool: string;
  scanVersion: string;
  scanDate: Date;
  
  // Source information
  repositoryUrl: string;
  branch: string;
  commit: string;
  pullRequestId?: string;
  
  // Build context
  buildId?: string;
  buildNumber?: string;
  triggeredBy: string;
  
  // Results summary
  status: 'Success' | 'Failed' | 'Warning' | 'Cancelled';
  overallRiskScore: number; // 0-100
  
  // Vulnerability counts
  vulnerabilityCounts: Record<VulnerabilitySeverity, number>;
  newVulnerabilities: number;
  fixedVulnerabilities: number;
  
  // Detailed findings
  vulnerabilities: Vulnerability[];
  components: SoftwareComponent[];
  licenses: LicenseUsage[];
  
  // Quality gate results
  qualityGateResults: QualityGateResult[];
  qualityGatePassed: boolean;
  
  // Performance metrics
  scanDuration: number; // seconds
  linesOfCode?: number;
  filesScanned?: number;
  
  // Artifacts and reports
  reportArtifacts: ArtifactReference[];
  rawResults?: string; // JSON string of raw tool output
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Vulnerability {
  id: string;
  scanResultId: string;
  
  // Vulnerability details
  cveId?: string;
  cweId?: string[];
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  cvssScore?: number;
  cvssVector?: string;
  
  // Location information
  fileName: string;
  lineNumber?: number;
  functionName?: string;
  component?: string;
  
  // Classification
  category: string;
  tags: string[];
  
  // Remediation
  recommendation: string;
  remediation?: RemediationInfo;
  
  // Tracking
  status: 'Open' | 'Fixed' | 'Accepted_Risk' | 'False_Positive' | 'Duplicate';
  assignedTo?: string;
  dueDate?: Date;
  
  // Timeline
  firstDetected: Date;
  lastDetected: Date;
  fixedDate?: Date;
  
  // Risk assessment
  exploitability: 'High' | 'Medium' | 'Low' | 'Unknown';
  businessImpact: 'High' | 'Medium' | 'Low' | 'Unknown';
  
  // Related information
  references: ExternalReference[];
  relatedVulnerabilities: string[];
  
  // Compliance impact
  complianceImpact: ComplianceImpact[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RemediationInfo {
  type: 'Update' | 'Patch' | 'Configuration' | 'Replacement' | 'Code_Change';
  description: string;
  effort: 'Low' | 'Medium' | 'High';
  steps: string[];
  automatable: boolean;
  testingRequired: boolean;
  estimatedTime?: string;
}

export interface ExternalReference {
  type: 'CVE' | 'CWE' | 'Advisory' | 'Blog' | 'Documentation';
  url: string;
  title?: string;
  source?: string;
}

export interface ComplianceImpact {
  framework: string;
  control: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface SoftwareComponent {
  id: string;
  scanResultId: string;
  
  // Component identification
  name: string;
  version: string;
  type: ComponentType;
  
  // Source information
  supplier?: string;
  source: 'Direct' | 'Transitive';
  downloadUrl?: string;
  homepageUrl?: string;
  
  // Licensing
  licenses: ComponentLicense[];
  licenseRisk: RiskLevel;
  
  // Security information
  vulnerabilityCount: number;
  highestVulnerabilitySeverity?: VulnerabilitySeverity;
  knownVulnerabilities: string[]; // Vulnerability IDs
  
  // Supply chain information
  maintainerInfo: MaintainerInfo;
  popularity: ComponentPopularity;
  
  // Risk assessment
  overallRisk: RiskLevel;
  riskFactors: string[];
  
  // Dependencies
  dependencies: ComponentDependency[];
  dependents: ComponentDependency[];
  
  // Metadata
  lastUpdated?: Date;
  deprecated: boolean;
  endOfLife?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentLicense {
  spdxId: string;
  name: string;
  url?: string;
  riskLevel: 'Approved' | 'Review_Required' | 'Restricted' | 'Prohibited';
  obligations: string[];
  restrictions: string[];
}

export interface MaintainerInfo {
  name?: string;
  email?: string;
  organization?: string;
  verified: boolean;
  contributorCount?: number;
  lastCommitDate?: Date;
}

export interface ComponentPopularity {
  downloads?: number;
  stars?: number;
  forks?: number;
  dependentProjects?: number;
  communityScore?: number;
}

export interface ComponentDependency {
  name: string;
  version: string;
  type: 'Direct' | 'Transitive';
  scope: 'Runtime' | 'Development' | 'Test' | 'Optional';
}

export interface LicenseUsage {
  id: string;
  scanResultId: string;
  
  // License details
  spdxId: string;
  name: string;
  category: 'Permissive' | 'Copyleft' | 'Commercial' | 'Proprietary' | 'Unknown';
  
  // Usage information
  componentCount: number;
  components: string[]; // Component IDs
  
  // Risk assessment
  riskLevel: 'Approved' | 'Review_Required' | 'Restricted' | 'Prohibited';
  obligations: LicenseObligation[];
  restrictions: string[];
  
  // Compliance
  complianceStatus: 'Compliant' | 'Needs_Review' | 'Non_Compliant';
  complianceNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseObligation {
  obligation: string;
  description: string;
  fulfilled: boolean;
  evidence?: string;
}

export interface LicensePolicy {
  approvedLicenses: string[]; // SPDX IDs
  prohibitedLicenses: string[]; // SPDX IDs
  reviewRequiredLicenses: string[]; // SPDX IDs
  defaultAction: 'Approve' | 'Review' | 'Reject';
  customRules: LicensePolicyRule[];
}

export interface LicensePolicyRule {
  id: string;
  name: string;
  condition: string;
  action: 'Approve' | 'Review' | 'Reject' | 'Warn';
  justification: string;
}

export interface VulnerabilityPolicy {
  maxCritical: number;
  maxHigh: number;
  maxMedium: number;
  ageThreshold: number; // days
  allowKnownVulnerabilities: boolean;
  exemptions: VulnerabilityExemption[];
}

export interface VulnerabilityExemption {
  cveId: string;
  reason: string;
  expirationDate?: Date;
  approvedBy: string;
  approvedDate: Date;
}

export interface QualityGateResult {
  gateId: string;
  gateName: string;
  passed: boolean;
  criteria: GateCriterionResult[];
  message: string;
  blocksDeployment: boolean;
}

export interface GateCriterionResult {
  criterion: GateCriterion;
  actualValue: number | string;
  passed: boolean;
  message: string;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: VulnerabilitySeverity;
  category: string;
  enabled: boolean;
}

// Dashboard and reporting interfaces
export interface SSCDashboardData {
  organizationId: string;
  generatedAt: Date;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  
  // Pipeline overview
  totalPipelines: number;
  activePipelines: number;
  pipelineHealth: PipelineHealthSummary[];
  
  // Vulnerability summary
  overallRiskScore: number;
  vulnerabilitySummary: VulnerabilitySummary;
  vulnerabilityTrends: VulnerabilityTrendData[];
  
  // Component analysis
  totalComponents: number;
  riskComponentCount: Record<RiskLevel, number>;
  componentAging: ComponentAgingSummary[];
  licenseCompliance: LicenseComplianceSummary;
  
  // Framework compliance
  frameworkCompliance: FrameworkComplianceStatus[];
  
  // Quality metrics
  qualityMetrics: SSCQualityMetric[];
  scanPerformance: ScanPerformanceSummary;
  
  // Alerts and actions
  activeAlerts: SSCAlert[];
  pendingActions: PendingAction[];
  
  // Top risks
  topVulnerabilities: Vulnerability[];
  topRiskyComponents: SoftwareComponent[];
}

export interface PipelineHealthSummary {
  pipelineId: string;
  pipelineName: string;
  status: 'Healthy' | 'Warning' | 'Error' | 'Inactive';
  lastScanDate: Date;
  overallRiskScore: number;
  criticalIssues: number;
  trendDirection: 'Improving' | 'Stable' | 'Worsening';
}

export interface VulnerabilitySummary {
  total: number;
  bySeverity: Record<VulnerabilitySeverity, number>;
  byAge: {
    new: number; // < 7 days
    recent: number; // 7-30 days
    old: number; // 30+ days
  };
  byStatus: {
    open: number;
    fixed: number;
    accepted: number;
  };
}

export interface VulnerabilityTrendData {
  date: Date;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  fixed: number;
}

export interface ComponentAgingSummary {
  ageRange: string; // e.g., "0-30 days", "31-90 days"
  componentCount: number;
  averageVulnerabilities: number;
  riskScore: number;
}

export interface LicenseComplianceSummary {
  totalLicenses: number;
  approved: number;
  needsReview: number;
  nonCompliant: number;
  prohibited: number;
  complianceScore: number; // 0-100
  topLicenses: LicenseUsageStats[];
}

export interface LicenseUsageStats {
  spdxId: string;
  name: string;
  componentCount: number;
  riskLevel: string;
}

export interface FrameworkComplianceStatus {
  framework: SSCFramework;
  currentLevel: SSCMaturityLevel;
  targetLevel: SSCMaturityLevel;
  complianceScore: number; // 0-100
  practicesCompliant: number;
  totalPractices: number;
  lastAssessment: Date;
  trendDirection: 'Improving' | 'Stable' | 'Declining';
}

export interface SSCQualityMetric {
  name: string;
  description: string;
  value: number;
  unit: string;
  target?: number;
  status: 'On_Target' | 'At_Risk' | 'Off_Target';
  trendDirection: 'Improving' | 'Stable' | 'Declining';
  lastUpdated: Date;
}

export interface ScanPerformanceSummary {
  averageScanDuration: number; // minutes
  scanFrequency: number; // scans per day
  successRate: number; // percentage
  failureReasons: FailureReason[];
  performanceTrend: PerformanceTrendData[];
}

export interface FailureReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface PerformanceTrendData {
  date: Date;
  averageDuration: number;
  successRate: number;
  scanCount: number;
}

export interface SSCAlert {
  id: string;
  type: 'Vulnerability' | 'Compliance' | 'Performance' | 'License' | 'Component';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  pipelineId?: string;
  componentId?: string;
  vulnerabilityId?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  actionRequired: boolean;
  dueDate?: Date;
}

export interface PendingAction {
  id: string;
  type: 'Vulnerability_Fix' | 'Component_Update' | 'License_Review' | 'Policy_Update' | 'Assessment';
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedTo?: string;
  dueDate?: Date;
  estimatedEffort?: string;
  relatedId: string; // ID of related vulnerability, component, etc.
  createdAt: Date;
}

// Service interfaces
export interface SSCServiceInterface {
  // Pipeline management
  registerPipeline(pipeline: Omit<SSCPipeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<SSCPipeline>;
  getPipelines(organizationId: string): Promise<SSCPipeline[]>;
  getPipeline(pipelineId: string): Promise<SSCPipeline>;
  updatePipeline(pipelineId: string, updates: Partial<SSCPipeline>): Promise<SSCPipeline>;
  deletePipeline(pipelineId: string): Promise<void>;
  
  // Scan management
  triggerScan(pipelineId: string, scanTypes: ScanType[]): Promise<ScanResult>;
  getScanResults(pipelineId: string, limit?: number): Promise<ScanResult[]>;
  getScanResult(scanResultId: string): Promise<ScanResult>;
  
  // Vulnerability management
  getVulnerabilities(organizationId: string, filters?: VulnerabilityFilter): Promise<Vulnerability[]>;
  updateVulnerabilityStatus(vulnerabilityId: string, status: string, assignedTo?: string): Promise<Vulnerability>;
  createVulnerabilityException(vulnerabilityId: string, reason: string, expirationDate?: Date): Promise<VulnerabilityExemption>;
  
  // Component management
  getComponents(organizationId: string, riskLevel?: RiskLevel): Promise<SoftwareComponent[]>;
  getComponentDetails(componentId: string): Promise<SoftwareComponent>;
  updateComponentRisk(componentId: string, riskLevel: RiskLevel, reason: string): Promise<SoftwareComponent>;
  
  // License management
  getLicenseUsage(organizationId: string): Promise<LicenseUsage[]>;
  updateLicensePolicy(organizationId: string, policy: LicensePolicy): Promise<void>;
  reviewLicense(licenseId: string, status: string, notes?: string): Promise<LicenseUsage>;
  
  // Framework compliance
  assessFrameworkCompliance(organizationId: string, framework: SSCFramework): Promise<FrameworkAlignment>;
  updateFrameworkAlignment(organizationId: string, alignment: FrameworkAlignment): Promise<FrameworkAlignment>;
  
  // Dashboard and reporting
  getDashboardData(organizationId: string, timeframe?: { start: Date; end: Date }): Promise<SSCDashboardData>;
  generateSSCReport(organizationId: string, reportType: SSCReportType): Promise<SSCReport>;
  
  // Configuration
  updateScanConfiguration(pipelineId: string, config: ScanConfiguration): Promise<SSCPipeline>;
  getQualityGates(organizationId: string): Promise<QualityGate[]>;
  createQualityGate(gate: Omit<QualityGate, 'id'>): Promise<QualityGate>;
}

export interface VulnerabilityFilter {
  severity?: VulnerabilitySeverity[];
  status?: string[];
  component?: string;
  ageInDays?: number;
  assignedTo?: string;
  hasExploit?: boolean;
}

export type SSCReportType = 
  | 'Executive_Summary'
  | 'Vulnerability_Report'
  | 'Component_Inventory'
  | 'License_Compliance'
  | 'Framework_Assessment'
  | 'Risk_Assessment';

export interface SSCReport {
  reportId: string;
  organizationId: string;
  reportType: SSCReportType;
  generatedAt: Date;
  generatedBy: string;
  
  // Report metadata
  title: string;
  description: string;
  executiveSummary: string;
  
  // Report content
  findings: SSCFinding[];
  recommendations: SSCRecommendation[];
  riskAssessment: RiskAssessmentSummary;
  
  // Data sections
  vulnerabilityAnalysis?: VulnerabilityAnalysis;
  componentAnalysis?: ComponentAnalysis;
  licenseAnalysis?: LicenseAnalysis;
  complianceAssessment?: ComplianceAssessment;
  
  // Artifacts
  charts: ChartData[];
  attachments: ArtifactReference[];
  
  // Distribution
  distributionList: string[];
  classification: 'Unclassified' | 'CUI' | 'Confidential';
}

export interface SSCFinding {
  category: 'Vulnerability' | 'Component' | 'License' | 'Compliance' | 'Process';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  finding: string;
  impact: string;
  evidence: ArtifactReference[];
  affectedAssets: string[];
}

export interface SSCRecommendation {
  category: 'Immediate' | 'Short_Term' | 'Long_Term';
  recommendation: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedEffort: string;
  expectedBenefits: string;
  implementationSteps: string[];
}

export interface RiskAssessmentSummary {
  overallRiskScore: number;
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  residualRisk: RiskLevel;
}

export interface RiskFactor {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  riskScore: number;
  mitigation?: string;
}

export interface VulnerabilityAnalysis {
  totalVulnerabilities: number;
  severityDistribution: Record<VulnerabilitySeverity, number>;
  topVulnerabilityTypes: VulnerabilityTypeStats[];
  exploitableVulnerabilities: number;
  remediationMetrics: RemediationMetrics;
  trendAnalysis: VulnerabilityTrendAnalysis;
}

export interface VulnerabilityTypeStats {
  type: string;
  count: number;
  averageSeverity: string;
  percentageOfTotal: number;
}

export interface RemediationMetrics {
  averageTimeToFix: number; // days
  fixRate: number; // percentage
  backlogSize: number;
  overdueCount: number;
}

export interface VulnerabilityTrendAnalysis {
  trendDirection: 'Improving' | 'Stable' | 'Worsening';
  monthlyData: MonthlyVulnerabilityData[];
  projectedRisk: string;
}

export interface MonthlyVulnerabilityData {
  month: string;
  discovered: number;
  fixed: number;
  netChange: number;
}

export interface ComponentAnalysis {
  totalComponents: number;
  riskDistribution: Record<RiskLevel, number>;
  licenseDistribution: LicenseDistributionData[];
  outdatedComponents: ComponentOutdatedStats[];
  supplyChainRisks: SupplyChainRisk[];
}

export interface LicenseDistributionData {
  license: string;
  componentCount: number;
  riskLevel: string;
  complianceStatus: string;
}

export interface ComponentOutdatedStats {
  component: string;
  currentVersion: string;
  latestVersion: string;
  daysOutdated: number;
  vulnerabilityCount: number;
  riskIncrease: string;
}

export interface SupplyChainRisk {
  riskType: string;
  description: string;
  affectedComponents: number;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface LicenseAnalysis {
  totalLicenses: number;
  complianceScore: number;
  licenseRisks: LicenseRiskAssessment[];
  obligationsFulfillment: ObligationFulfillment[];
  recommendations: string[];
}

export interface LicenseRiskAssessment {
  license: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskFactors: string[];
  affectedComponents: number;
  recommendedAction: string;
}

export interface ObligationFulfillment {
  obligation: string;
  fulfilled: boolean;
  evidence?: string;
  actionRequired?: string;
}

export interface ComplianceAssessment {
  frameworks: FrameworkComplianceAssessment[];
  overallScore: number;
  gapAnalysis: ComplianceGap[];
  improvementPlan: ComplianceImprovementItem[];
}

export interface FrameworkComplianceAssessment {
  framework: SSCFramework;
  currentLevel: SSCMaturityLevel;
  targetLevel: SSCMaturityLevel;
  score: number;
  practicesAssessed: number;
  practicesCompliant: number;
  majorGaps: string[];
}

export interface ComplianceGap {
  practice: string;
  currentState: string;
  requiredState: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
}

export interface ComplianceImprovementItem {
  item: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedTime: string;
  expectedBenefit: string;
}
