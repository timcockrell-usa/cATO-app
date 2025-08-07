/**
 * NIST Revision Management Types
 * Supports NIST 800-53 Rev 4 to Rev 5 transition management
 */

export interface NISTRevisionMapping {
  id: string;
  mappingId: string;
  tenantId: string;
  rev4ControlId: string | null;
  rev5ControlId: string | null;
  changeType: 'New Control' | 'Modified' | 'Merged' | 'Withdrawn' | 'Split' | 'No Change';
  changeSummary: string;
  implementationImpact: 'low' | 'medium' | 'high';
  automatedMapping: boolean;
  migrationGuidance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NISTRevisionUpgradeHistory {
  id: string;
  upgradeId: string;
  tenantId: string;
  fromRevision: 'Rev4' | 'Rev5';
  toRevision: 'Rev4' | 'Rev5';
  initiatedBy: string;
  initiatedAt: string;
  completedAt: string | null;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  controlsAffected: number;
  controlsMigrated: number;
  controlsRequiringReview: number;
  upgradeSummary: string;
  rollbackData?: string; // JSON backup of pre-upgrade state
}

export interface NISTRevisionGapAnalysis {
  tenantId: string;
  currentRevision: 'Rev4' | 'Rev5';
  targetRevision: 'Rev4' | 'Rev5';
  analysisDate: string;
  totalCurrentControls: number;
  totalTargetControls: number;
  
  // Control categorization for gap analysis
  mappings: {
    unchanged: NISTControlMapping[];
    modified: NISTControlMapping[];
    newControls: NISTControlMapping[];
    withdrawnControls: NISTControlMapping[];
    mergedControls: NISTControlMapping[];
    splitControls: NISTControlMapping[];
  };
  
  // Impact assessment
  impactAssessment: {
    lowImpact: number;
    mediumImpact: number;
    highImpact: number;
    estimatedEffortHours: number;
    priorityControls: string[];
  };
  
  // Compliance prediction
  compliancePrediction: {
    likelyCompliant: number;
    requiresReview: number;
    likelyNonCompliant: number;
    notAssessed: number;
  };
}

export interface NISTControlMapping {
  mappingId: string;
  sourceControlId: string;
  targetControlId: string | null;
  sourceControlName: string;
  targetControlName: string | null;
  changeType: NISTRevisionMapping['changeType'];
  changeSummary: string;
  implementationImpact: NISTRevisionMapping['implementationImpact'];
  currentStatus: 'compliant' | 'partial' | 'noncompliant' | 'not-assessed';
  predictedStatus: 'likely-compliant' | 'requires-review' | 'likely-noncompliant' | 'not-assessed' | 'deprecated';
  migrationPriority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedEffortHours: number;
  migrationGuidance: string;
}

export interface RevisionMigrationPlan {
  tenantId: string;
  planId: string;
  fromRevision: 'Rev4' | 'Rev5';
  toRevision: 'Rev4' | 'Rev5';
  createdBy: string;
  createdAt: string;
  
  // Migration phases
  phases: {
    phase: number;
    name: string;
    description: string;
    controls: string[];
    estimatedHours: number;
    dependencies: number[];
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  }[];
  
  // Overall plan status
  totalEstimatedHours: number;
  plannedStartDate: string;
  plannedCompletionDate: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  overallStatus: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
}

export interface NISTRevisionSettings {
  tenantId: string;
  currentRevision: 'Rev4' | 'Rev5';
  allowRevisionUpgrade: boolean;
  allowRevisionDowngrade: boolean;
  requireApprovalForUpgrade: boolean;
  approvalWorkflow?: {
    requireSignoff: boolean;
    approvers: string[];
    notificationEmails: string[];
  };
  migrationSettings: {
    preserveCustomizations: boolean;
    backupBeforeMigration: boolean;
    rollbackTimeLimit: number; // hours
    autoMigrateUnchangedControls: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}

// API Response types for revision management
export interface RevisionGapAnalysisResponse {
  success: boolean;
  gapAnalysis: NISTRevisionGapAnalysis;
  recommendedActions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  estimatedMigrationTime: {
    optimisticHours: number;
    realisticHours: number;
    pessimisticHours: number;
  };
}

export interface RevisionUpgradeResponse {
  success: boolean;
  upgradeId: string;
  message: string;
  status: NISTRevisionUpgradeHistory['status'];
  nextSteps: string[];
  rollbackAvailable: boolean;
  estimatedCompletionTime?: string;
}

export interface NISTControlRevisionComparison {
  controlId: string;
  rev4Data?: {
    controlName: string;
    description: string;
    supplementalGuidance: string;
    currentStatus: string;
    implementationNotes: string;
  };
  rev5Data?: {
    controlName: string;
    description: string;
    supplementalGuidance: string;
    predictedStatus: string;
    migrationNotes: string;
  };
  changeAnalysis: {
    changeType: NISTRevisionMapping['changeType'];
    changeSummary: string;
    implementationImpact: NISTRevisionMapping['implementationImpact'];
    keyChanges: string[];
    migrationRequired: boolean;
    estimatedEffort: number;
  };
}
