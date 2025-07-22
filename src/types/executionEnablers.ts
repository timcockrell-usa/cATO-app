/**
 * DOTmLPF-P (Execution Enablers) Type Definitions
 * 
 * The DoD's cATO guidance emphasizes that successful continuous authorization
 * requires more than technical controls - it requires organizational maturity
 * across all aspects of the DOTmLPF-P framework.
 * 
 * This system tracks and measures the non-technical enablers that are critical
 * for achieving and maintaining a Continuous ATO.
 */

// Core DOTmLPF-P categories as defined by DoD
export type DOTmLPFPCategory = 
  | 'Doctrine'
  | 'Organization' 
  | 'Training'
  | 'Materiel'
  | 'Leadership'
  | 'Personnel'
  | 'Facilities'
  | 'Policy';

export type MaturityLevel = 
  | 'Initial'      // Ad hoc, chaotic processes
  | 'Developing'   // Some processes defined
  | 'Defined'      // Processes documented and standardized
  | 'Managed'      // Processes measured and controlled
  | 'Optimizing';  // Focus on continuous improvement

export type EnablerStatus = 
  | 'Not_Started'
  | 'In_Progress'
  | 'Completed'
  | 'Validated'
  | 'Needs_Attention'
  | 'Risk_Identified';

export type RiskLevel = 'Very_High' | 'High' | 'Moderate' | 'Low' | 'Very_Low';

// Individual execution enabler definition
export interface ExecutionEnabler {
  id: string;
  category: DOTmLPFPCategory;
  name: string;
  description: string;
  
  // Current state
  status: EnablerStatus;
  maturityLevel: MaturityLevel;
  targetMaturityLevel: MaturityLevel;
  
  // Risk assessment
  riskLevel: RiskLevel;
  riskDescription?: string;
  
  // NIST control mapping
  mappedNistControls: string[]; // Control IDs like 'AC-1', 'AT-2'
  
  // Implementation details
  implementationNotes?: string;
  evidenceArtifacts: ArtifactReference[];
  
  // Tracking
  lastAssessedDate: Date;
  nextAssessmentDue: Date;
  assessedBy: string;
  validatedBy?: string;
  
  // Metrics
  metrics: EnablerMetric[];
  
  // Organizational context
  organizationId: string;
  ownerRole: string; // Who is responsible for this enabler
  stakeholders: string[]; // User IDs of involved personnel
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ArtifactReference {
  id: string;
  name: string;
  type: 'Document' | 'Policy' | 'Procedure' | 'Training_Material' | 'Assessment' | 'Evidence';
  url?: string;
  uploadedDate: Date;
  uploadedBy: string;
}

export interface EnablerMetric {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  targetValue?: number;
  measurementDate: Date;
  trendDirection: 'Improving' | 'Stable' | 'Declining';
}

// Assessment and validation structures
export interface EnablerAssessment {
  id: string;
  enablerId: string;
  organizationId: string;
  
  // Assessment details
  assessmentType: 'Self_Assessment' | 'Internal_Audit' | 'External_Audit' | 'Continuous_Monitoring';
  assessmentDate: Date;
  assessor: string;
  
  // Results
  currentMaturityLevel: MaturityLevel;
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  overallScore: number; // 1-5 scale
  
  // Evidence and documentation
  evidenceCollected: ArtifactReference[];
  assessmentNotes: string;
  
  // Status
  status: 'Draft' | 'Under_Review' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentFinding {
  id: string;
  category: DOTmLPFPCategory;
  severity: RiskLevel;
  finding: string;
  impact: string;
  evidence: string;
  recommendation: string;
}

export interface AssessmentRecommendation {
  id: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
  estimatedEffort: string; // e.g., "2-4 weeks", "3-6 months"
  estimatedCost?: string;
  assignedTo?: string;
  dueDate?: Date;
  status: 'Open' | 'In_Progress' | 'Completed' | 'Deferred';
}

// Improvement planning and tracking
export interface ImprovementPlan {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  
  // Plan details
  targetState: DOTmLPFPMaturityTarget[];
  initiatives: ImprovementInitiative[];
  
  // Timeline
  startDate: Date;
  targetCompletionDate: Date;
  
  // Tracking
  status: 'Planning' | 'In_Progress' | 'Completed' | 'On_Hold' | 'Cancelled';
  overallProgress: number; // 0-100%
  
  // Approval and oversight
  approvedBy: string;
  approvedDate: Date;
  sponsor: string; // Executive sponsor
  
  // Resources
  budgetAllocated?: number;
  budgetSpent?: number;
  resourcesAssigned: ResourceAssignment[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DOTmLPFPMaturityTarget {
  category: DOTmLPFPCategory;
  currentLevel: MaturityLevel;
  targetLevel: MaturityLevel;
  targetDate: Date;
  justification: string;
}

export interface ImprovementInitiative {
  id: string;
  name: string;
  description: string;
  category: DOTmLPFPCategory;
  
  // Project management
  status: 'Not_Started' | 'In_Progress' | 'Completed' | 'Blocked' | 'Cancelled';
  progress: number; // 0-100%
  
  // Timeline
  startDate: Date;
  endDate: Date;
  milestones: ProjectMilestone[];
  
  // Resources
  assignedTo: string;
  team: string[];
  estimatedHours: number;
  actualHours?: number;
  
  // Dependencies and risks
  dependencies: string[]; // IDs of other initiatives
  risks: InitiativeRisk[];
  
  // Outcomes
  successCriteria: string;
  expectedBenefits: string;
  actualBenefits?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'Pending' | 'In_Progress' | 'Completed' | 'Overdue';
  deliverables: string[];
}

export interface InitiativeRisk {
  id: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
  status: 'Open' | 'Mitigating' | 'Closed';
}

export interface ResourceAssignment {
  userId: string;
  role: string;
  allocatedHours: number;
  startDate: Date;
  endDate: Date;
}

// Reporting and analytics
export interface DOTmLPFPDashboardData {
  organizationId: string;
  generatedAt: Date;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overall maturity summary
  overallMaturityScore: number; // Weighted average across categories
  maturityByCategory: CategoryMaturitySummary[];
  maturityTrend: MaturityTrendData[];
  
  // Risk summary
  totalRisks: number;
  risksByLevel: Record<RiskLevel, number>;
  risksByCategory: CategoryRiskSummary[];
  
  // Implementation progress
  enablersByStatus: Record<EnablerStatus, number>;
  upcomingAssessments: EnablerAssessment[];
  overdueAssessments: EnablerAssessment[];
  
  // Improvement tracking
  activeInitiatives: number;
  completedInitiatives: number;
  initiativeProgress: InitiativeProgressSummary[];
  
  // Performance indicators
  kpis: DOTmLPFPKPI[];
  
  // NIST control coverage
  nistControlCoverage: NistControlCoverage[];
}

export interface CategoryMaturitySummary {
  category: DOTmLPFPCategory;
  currentLevel: MaturityLevel;
  targetLevel: MaturityLevel;
  enablerCount: number;
  averageScore: number;
  trendDirection: 'Improving' | 'Stable' | 'Declining';
  lastAssessmentDate: Date;
  nextAssessmentDue: Date;
}

export interface MaturityTrendData {
  date: Date;
  overallScore: number;
  categoryScores: Record<DOTmLPFPCategory, number>;
}

export interface CategoryRiskSummary {
  category: DOTmLPFPCategory;
  totalRisks: number;
  highRisks: number;
  averageRiskScore: number;
  trendDirection: 'Improving' | 'Stable' | 'Worsening';
}

export interface InitiativeProgressSummary {
  initiativeId: string;
  name: string;
  category: DOTmLPFPCategory;
  progress: number;
  status: string;
  dueDate: Date;
  isOnTrack: boolean;
}

export interface DOTmLPFPKPI {
  name: string;
  description: string;
  value: number;
  unit: string;
  target?: number;
  status: 'On_Target' | 'At_Risk' | 'Off_Target';
  trendDirection: 'Improving' | 'Stable' | 'Declining';
  lastUpdated: Date;
}

export interface NistControlCoverage {
  controlId: string;
  controlName: string;
  category: DOTmLPFPCategory;
  coverageLevel: 'Full' | 'Partial' | 'Minimal' | 'None';
  mappedEnablers: string[]; // Enabler IDs
  gaps: string[];
  recommendations: string[];
}

// Configuration and templates
export interface DOTmLPFPConfiguration {
  organizationId: string;
  
  // Maturity model customization
  maturityModel: MaturityModelConfiguration;
  
  // Assessment configuration
  assessmentFrequency: Record<DOTmLPFPCategory, number>; // Days between assessments
  mandatoryAssessors: Record<DOTmLPFPCategory, string[]>; // Required roles
  
  // Notification settings
  notificationSettings: NotificationConfiguration;
  
  // Integration settings
  nistFrameworkVersion: string;
  customControlMappings: ControlMapping[];
  
  // Workflow settings
  approvalWorkflow: ApprovalWorkflowConfiguration;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface MaturityModelConfiguration {
  levels: MaturityLevelDefinition[];
  scoringWeights: Record<DOTmLPFPCategory, number>;
  customCriteria: CustomMaturityCriteria[];
}

export interface MaturityLevelDefinition {
  level: MaturityLevel;
  name: string;
  description: string;
  criteria: string[];
  scoreRange: {
    min: number;
    max: number;
  };
}

export interface CustomMaturityCriteria {
  category: DOTmLPFPCategory;
  criteria: string;
  weight: number;
  measurementMethod: string;
}

export interface ControlMapping {
  nistControlId: string;
  dotmlfpCategories: DOTmLPFPCategory[];
  weight: number;
  customNotes?: string;
}

export interface NotificationConfiguration {
  assessmentReminders: {
    enabled: boolean;
    daysBefore: number[];
    recipients: string[];
  };
  riskAlerts: {
    enabled: boolean;
    riskThreshold: RiskLevel;
    recipients: string[];
  };
  improvementUpdates: {
    enabled: boolean;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    recipients: string[];
  };
}

export interface ApprovalWorkflowConfiguration {
  assessmentApproval: WorkflowStep[];
  improvementPlanApproval: WorkflowStep[];
  riskAcceptanceApproval: WorkflowStep[];
}

export interface WorkflowStep {
  stepOrder: number;
  stepName: string;
  requiredRoles: string[];
  requiredApprovals: number;
  timeoutDays: number;
  escalationRoles?: string[];
}

// API and service interfaces
export interface DOTmLPFPServiceInterface {
  // Enabler management
  getEnablers(organizationId: string, category?: DOTmLPFPCategory): Promise<ExecutionEnabler[]>;
  getEnabler(enablerId: string): Promise<ExecutionEnabler>;
  createEnabler(enabler: Omit<ExecutionEnabler, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExecutionEnabler>;
  updateEnabler(enablerId: string, updates: Partial<ExecutionEnabler>): Promise<ExecutionEnabler>;
  deleteEnabler(enablerId: string): Promise<void>;
  
  // Assessment management
  createAssessment(assessment: Omit<EnablerAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnablerAssessment>;
  getAssessments(organizationId: string, enablerId?: string): Promise<EnablerAssessment[]>;
  updateAssessment(assessmentId: string, updates: Partial<EnablerAssessment>): Promise<EnablerAssessment>;
  approveAssessment(assessmentId: string, approver: string): Promise<EnablerAssessment>;
  
  // Improvement planning
  createImprovementPlan(plan: Omit<ImprovementPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImprovementPlan>;
  getImprovementPlans(organizationId: string): Promise<ImprovementPlan[]>;
  updateImprovementPlan(planId: string, updates: Partial<ImprovementPlan>): Promise<ImprovementPlan>;
  
  // Dashboard and reporting
  getDashboardData(organizationId: string, timeframe?: { start: Date; end: Date }): Promise<DOTmLPFPDashboardData>;
  generateMaturityReport(organizationId: string, category?: DOTmLPFPCategory): Promise<MaturityReport>;
  
  // NIST control integration
  getNistControlCoverage(organizationId: string): Promise<NistControlCoverage[]>;
  updateControlMappings(organizationId: string, mappings: ControlMapping[]): Promise<void>;
  
  // Configuration
  getConfiguration(organizationId: string): Promise<DOTmLPFPConfiguration>;
  updateConfiguration(organizationId: string, config: Partial<DOTmLPFPConfiguration>): Promise<DOTmLPFPConfiguration>;
}

export interface MaturityReport {
  reportId: string;
  organizationId: string;
  generatedAt: Date;
  reportType: 'Summary' | 'Detailed' | 'Gap_Analysis' | 'Trend_Analysis';
  
  // Report content
  executiveSummary: string;
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  
  // Data
  maturityScores: CategoryMaturitySummary[];
  riskSummary: CategoryRiskSummary[];
  improvementProgress: InitiativeProgressSummary[];
  
  // Artifacts
  charts: ChartData[];
  attachments: ArtifactReference[];
  
  // Distribution
  generatedBy: string;
  distributionList: string[];
  classification: 'Unclassified' | 'CUI' | 'Confidential';
}

export interface ReportFinding {
  category: DOTmLPFPCategory;
  finding: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  evidence: string[];
}

export interface ReportRecommendation {
  category: DOTmLPFPCategory;
  recommendation: string;
  priority: 'Immediate' | 'Short_Term' | 'Long_Term';
  estimatedEffort: string;
  expectedBenefits: string;
}

export interface ChartData {
  chartType: 'Bar' | 'Line' | 'Pie' | 'Radar' | 'Heatmap';
  title: string;
  data: any; // Chart-specific data structure
  metadata: {
    xAxisLabel?: string;
    yAxisLabel?: string;
    dateRange?: { start: Date; end: Date };
  };
}

// Event and notification types
export interface DOTmLPFPEvent {
  eventId: string;
  organizationId: string;
  eventType: 'Assessment_Due' | 'Assessment_Completed' | 'Risk_Identified' | 'Initiative_Completed' | 'Maturity_Changed';
  entityId: string; // ID of the enabler, assessment, etc.
  entityType: 'Enabler' | 'Assessment' | 'Initiative' | 'Plan';
  
  // Event details
  title: string;
  description: string;
  severity: 'Info' | 'Warning' | 'Error';
  
  // Timing
  occurredAt: Date;
  scheduledFor?: Date;
  
  // Recipients and handling
  recipients: string[];
  handledBy?: string;
  handledAt?: Date;
  
  // Related data
  metadata: Record<string, any>;
}

export interface DOTmLPFPNotification {
  notificationId: string;
  eventId: string;
  recipientId: string;
  
  // Notification content
  subject: string;
  message: string;
  actionRequired?: boolean;
  actionUrl?: string;
  
  // Delivery
  deliveryMethod: 'Email' | 'In_App' | 'SMS';
  sentAt: Date;
  readAt?: Date;
  acknowledged?: boolean;
  
  // Tracking
  retryCount: number;
  lastRetry?: Date;
  deliveryStatus: 'Pending' | 'Sent' | 'Delivered' | 'Failed';
}
