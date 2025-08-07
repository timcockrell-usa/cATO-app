/**
 * Onboarding Wizard Component
 * Multi-step wizard for first-time organization setup
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight,
  Home,
  Loader2,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';

// Import all step components
import {
  WelcomeStep,
  OrganizationSetupStep,
  SecurityConfigurationStep,
  EmassIntegrationStep,
  CloudEnvironmentStep,
  UserManagementStep,
  ReviewCompleteStep,
  type StepData,
  type OrganizationData,
  type SecurityConfigurationData,
  type EmassIntegrationData,
  type CloudEnvironment,
  type UserInvitation
} from '@/components/onboarding-steps';

interface OnboardingWizardProps {
  onComplete: (organizationId: string) => void;
  onCancel?: () => void;
}

interface OnboardingStepConfig {
  id: string;
  title: string;
  description: string;
  required: boolean;
  component: React.ComponentType<any>;
}

const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Getting started with cATO',
    required: true,
    component: WelcomeStep
  },
  {
    id: 'organization-setup',
    title: 'Organization',
    description: 'Basic organization information',
    required: true,
    component: OrganizationSetupStep
  },
  {
    id: 'security-configuration',
    title: 'Security',
    description: 'Security and compliance settings',
    required: true,
    component: SecurityConfigurationStep
  },
  {
    id: 'emass-integration',
    title: 'eMASS',
    description: 'Enterprise Mission Assurance integration',
    required: false,
    component: EmassIntegrationStep
  },
  {
    id: 'cloud-environments',
    title: 'Cloud',
    description: 'Cloud environment connections',
    required: false,
    component: CloudEnvironmentStep
  },
  {
    id: 'user-management',
    title: 'Users',
    description: 'Invite team members',
    required: false,
    component: UserManagementStep
  },
  {
    id: 'review-complete',
    title: 'Complete',
    description: 'Review and finalize setup',
    required: true,
    component: ReviewCompleteStep
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  // Initialize step data
  useEffect(() => {
    const initialData: StepData[] = ONBOARDING_STEPS.map(step => ({
      id: step.id,
      data: getInitialStepData(step.id)
    }));
    setStepData(initialData);
  }, []);

  const getInitialStepData = (stepId: string): any => {
    switch (stepId) {
      case 'welcome':
        return {};
      case 'organization-setup':
        return {
          legalName: '',
          commonName: '',
          organizationType: '',
          einTin: '',
          duns: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          website: '',
          primaryContactName: '',
          primaryContactEmail: '',
          primaryContactPhone: '',
          aoName: '',
          aoEmail: '',
          aoPhone: '',
          issmName: '',
          issmEmail: '',
          issmPhone: '',
          tier: 'standard'
        } as OrganizationData;
      case 'security-configuration':
        return {
          nistRevision: 'rev5',
          securityClassification: 'cui',
          impactLevel: 'moderate',
          complianceFrameworks: [],
          enableAuditTrail: true,
          enableContinuousMonitoring: true,
          dataRetentionMonths: 36,
          encryptionStandard: 'fips-140-2'
        } as SecurityConfigurationData;
      case 'emass-integration':
        return {
          systemId: '',
          packageId: '',
          emassUrl: '',
          apiUsername: '',
          apiKey: '',
          importData: false,
          syncPoams: false,
          syncMilestones: false,
          syncControls: false
        } as EmassIntegrationData;
      case 'cloud-environments':
        return [] as CloudEnvironment[];
      case 'user-management':
        return [] as UserInvitation[];
      case 'review-complete':
        return {};
      default:
        return {};
    }
  };

  const getStepData = (stepId: string): any => {
    const step = stepData.find(s => s.id === stepId);
    return step?.data || getInitialStepData(stepId);
  };

  const updateStepData = (stepId: string, data: any) => {
    setStepData(prev => prev.map(step => 
      step.id === stepId ? { ...step, data } : step
    ));
  };

  const handleStepComplete = (stepId: string, data?: any) => {
    if (data !== undefined) {
      updateStepData(stepId, data);
    }
    setCompletedSteps(prev => new Set([...prev, stepId]));
    setError(null);
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (!currentStep.required) {
      handleNext();
    }
  };

  const handleCompleteOnboarding = async (organizationId: string) => {
    try {
      setIsProcessing(true);
      await onComplete(organizationId);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during setup');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    const StepComponent = currentStep.component;
    const currentStepData = getStepData(currentStep.id);

    const baseProps = {
      onComplete: handleStepComplete,
      onNext: handleNext,
      onPrevious: handlePrevious,
      onSkip: currentStep.required ? undefined : handleSkip,
      user: user!,
      isProcessing
    };

    // Special handling for review step
    if (currentStep.id === 'review-complete') {
      return (
        <StepComponent
          {...baseProps}
          stepData={currentStepData}
          allStepData={stepData}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      );
    }

    return (
      <StepComponent
        {...baseProps}
        stepData={currentStepData}
        onUpdateStepData={(data: any) => updateStepData(currentStep.id, data)}
      />
    );
  };

  const canProceed = () => {
    if (currentStep.required) {
      return completedSteps.has(currentStep.id);
    }
    return true; // Optional steps can always be skipped
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Rocket className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Organization Setup</h1>
                <p className="text-sm text-muted-foreground font-normal">
                  Let's get your cATO Dashboard configured for compliance monitoring
                </p>
              </div>
            </div>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                <Home className="h-4 w-4 mr-2" />
                Exit Setup
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Step {currentStepIndex + 1} of {totalSteps}</h3>
                <p className="text-sm text-muted-foreground">{currentStep.title}: {currentStep.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {currentStep.required ? (
                  <Badge>Required</Badge>
                ) : (
                  <Badge variant="outline">Optional</Badge>
                )}
                {completedSteps.has(currentStep.id) && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
            
            <Progress value={progress} className="w-full" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              {ONBOARDING_STEPS.map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-1 ${
                      isCurrent ? 'text-primary font-medium' : 
                      isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : isCurrent ? (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                    )}
                    <span>{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0 || isProcessing}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-3">
              {!currentStep.required && currentStepIndex < totalSteps - 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isProcessing}
                >
                  Skip This Step
                </Button>
              )}
              
              {currentStepIndex < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={currentStep.required && !completedSteps.has(currentStep.id) || isProcessing}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleNext()}
                  disabled={!canProceed() || isProcessing}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
