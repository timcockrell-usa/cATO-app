/**
 * Onboarding Step Types
 * Shared interfaces for onboarding step components
 */

import { User } from '@/contexts/SimpleAuthContext';
import { OnboardingStep } from '@/services/onboardingService';

// Base props for all onboarding steps
export interface BaseStepProps {
  onComplete: (stepId: string, data?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  user: User;
  isProcessing: boolean;
}

// Generic onboarding step props
export interface OnboardingStepProps extends BaseStepProps {
  stepData: any;
  onUpdateStepData?: (data: any) => void;
}

// Step data interface
export interface StepData {
  id: string;
  data: any;
}

// Welcome Step
export interface WelcomeStepProps extends BaseStepProps {
  stepData: any;
  onUpdateStepData: (data: any) => void;
}

// Organization Setup Step
export interface OrganizationData {
  legalName: string;
  commonName: string;
  organizationType: string;
  einTin: string;
  duns: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  aoName: string;
  aoEmail: string;
  aoPhone: string;
  issmName: string;
  issmEmail: string;
  issmPhone: string;
  tier: string;
}

export interface OrganizationSetupStepProps extends BaseStepProps {
  stepData: OrganizationData;
  onUpdateStepData: (data: OrganizationData) => void;
}

// Security Configuration Step
export interface SecurityConfigurationData {
  nistRevision: string;
  securityClassification: string;
  impactLevel: string;
  complianceFrameworks: string[];
  enableAuditTrail: boolean;
  enableContinuousMonitoring: boolean;
  dataRetentionMonths: number;
  encryptionStandard: string;
}

export interface SecurityConfigurationStepProps extends BaseStepProps {
  stepData: SecurityConfigurationData;
  onUpdateStepData: (data: SecurityConfigurationData) => void;
}

// eMASS Integration Step
export interface EmassIntegrationData {
  systemId: string;
  packageId: string;
  emassUrl: string;
  apiUsername: string;
  apiKey: string;
  importData: boolean;
  syncPoams: boolean;
  syncMilestones: boolean;
  syncControls: boolean;
}

export interface EmassIntegrationStepProps extends BaseStepProps {
  stepData: EmassIntegrationData;
  onUpdateStepData: (data: EmassIntegrationData) => void;
}

// Cloud Environment Step
export type CloudProvider = 'azure' | 'aws' | 'gcp' | 'oracle';

export interface CloudEnvironment {
  id: string;
  provider: CloudProvider;
  displayName: string;
  description: string;
  region: string;
  subscriptionId?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  projectId?: string;
  serviceAccountKey?: string;
  compartmentId?: string;
  fingerprint?: string;
  keyFile?: string;
  passphrase?: string;
  isDefault: boolean;
}

export interface CloudEnvironmentStepProps extends BaseStepProps {
  stepData: CloudEnvironment[];
  onUpdateStepData: (data: CloudEnvironment[]) => void;
}

// User Management Step
export interface UserInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  department: string;
  title: string;
}

export interface UserManagementStepProps extends BaseStepProps {
  stepData: UserInvitation[];
  onUpdateStepData: (data: UserInvitation[]) => void;
}

// Review and Complete Step
export interface ReviewCompleteStepProps extends BaseStepProps {
  onCompleteOnboarding: (organizationId: string) => Promise<void>;
  allStepData: StepData[];
  stepData: any; // Not used for this step
}
