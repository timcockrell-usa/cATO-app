import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Onboarding Wizard Component
 * Multi-step wizard for first-time organization setup
 */
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Home, Loader2, Rocket } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
// Import all step components
import { WelcomeStep, OrganizationSetupStep, SecurityConfigurationStep, EmassIntegrationStep, CloudEnvironmentStep, UserManagementStep, ReviewCompleteStep } from '@/components/onboarding-steps';
const ONBOARDING_STEPS = [
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
export const OnboardingWizard = ({ onComplete, onCancel }) => {
    const { user } = useAuth();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [stepData, setStepData] = useState([]);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    const totalSteps = ONBOARDING_STEPS.length;
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    // Initialize step data
    useEffect(() => {
        const initialData = ONBOARDING_STEPS.map(step => ({
            id: step.id,
            data: getInitialStepData(step.id)
        }));
        setStepData(initialData);
    }, []);
    const getInitialStepData = (stepId) => {
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
                };
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
                };
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
                };
            case 'cloud-environments':
                return [];
            case 'user-management':
                return [];
            case 'review-complete':
                return {};
            default:
                return {};
        }
    };
    const getStepData = (stepId) => {
        const step = stepData.find(s => s.id === stepId);
        return step?.data || getInitialStepData(stepId);
    };
    const updateStepData = (stepId, data) => {
        setStepData(prev => prev.map(step => step.id === stepId ? { ...step, data } : step));
    };
    const handleStepComplete = (stepId, data) => {
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
    const handleCompleteOnboarding = async (organizationId) => {
        try {
            setIsProcessing(true);
            await onComplete(organizationId);
        }
        catch (error) {
            console.error('Error completing onboarding:', error);
            setError(error instanceof Error ? error.message : 'An error occurred during setup');
        }
        finally {
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
            user: user,
            isProcessing
        };
        // Special handling for review step
        if (currentStep.id === 'review-complete') {
            return (_jsx(StepComponent, { ...baseProps, stepData: currentStepData, allStepData: stepData, onCompleteOnboarding: handleCompleteOnboarding }));
        }
        return (_jsx(StepComponent, { ...baseProps, stepData: currentStepData, onUpdateStepData: (data) => updateStepData(currentStep.id, data) }));
    };
    const canProceed = () => {
        if (currentStep.required) {
            return completedSteps.has(currentStep.id);
        }
        return true; // Optional steps can always be skipped
    };
    if (!user) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin" }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-6", children: [_jsx(Card, { children: _jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Rocket, { className: "h-6 w-6 text-primary" }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Organization Setup" }), _jsx("p", { className: "text-sm text-muted-foreground font-normal", children: "Let's get your cATO Dashboard configured for compliance monitoring" })] })] }), onCancel && (_jsxs(Button, { variant: "ghost", onClick: onCancel, children: [_jsx(Home, { className: "h-4 w-4 mr-2" }), "Exit Setup"] }))] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold", children: ["Step ", currentStepIndex + 1, " of ", totalSteps] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [currentStep.title, ": ", currentStep.description] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [currentStep.required ? (_jsx(Badge, { children: "Required" })) : (_jsx(Badge, { variant: "outline", children: "Optional" })), completedSteps.has(currentStep.id) && (_jsxs(Badge, { className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Complete"] }))] })] }), _jsx(Progress, { value: progress, className: "w-full" }), _jsx("div", { className: "flex justify-between text-xs text-muted-foreground", children: ONBOARDING_STEPS.map((step, index) => {
                                    const isCompleted = completedSteps.has(step.id);
                                    const isCurrent = index === currentStepIndex;
                                    return (_jsxs("div", { className: `flex items-center space-x-1 ${isCurrent ? 'text-primary font-medium' :
                                            isCompleted ? 'text-green-600' : 'text-muted-foreground'}`, children: [isCompleted ? (_jsx(CheckCircle, { className: "h-3 w-3" })) : isCurrent ? (_jsx("div", { className: "h-3 w-3 rounded-full bg-primary" })) : (_jsx("div", { className: "h-3 w-3 rounded-full border border-muted-foreground" })), _jsx("span", { children: step.title })] }, step.id));
                                }) })] }) }) }), error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] })), _jsx("div", { className: "min-h-[500px]", children: renderStep() }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex justify-between", children: [_jsxs(Button, { variant: "outline", onClick: handlePrevious, disabled: currentStepIndex === 0 || isProcessing, children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Previous"] }), _jsxs("div", { className: "flex space-x-3", children: [!currentStep.required && currentStepIndex < totalSteps - 1 && (_jsx(Button, { variant: "ghost", onClick: handleSkip, disabled: isProcessing, children: "Skip This Step" })), currentStepIndex < totalSteps - 1 ? (_jsxs(Button, { onClick: handleNext, disabled: currentStep.required && !completedSteps.has(currentStep.id) || isProcessing, children: ["Next", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })) : (_jsx(Button, { onClick: () => handleNext(), disabled: !canProceed() || isProcessing, size: "lg", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Setting up..."] })) : ('Complete Setup') }))] })] }) }) })] }));
};
