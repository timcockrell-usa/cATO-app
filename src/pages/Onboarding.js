import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Onboarding Page Component
 * Main page that handles first-user onboarding flow
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, Home, ArrowRight } from 'lucide-react';
export const OnboardingPage = () => {
    const { user, isLoading, checkOnboardingStatus, markOnboardingComplete, isFirstUserInOrganization } = useAuth();
    const navigate = useNavigate();
    const [onboardingStatus, setOnboardingStatus] = useState({
        isFirstUser: false,
        needsOnboarding: false,
        isChecking: true,
        error: null
    });
    // Check onboarding status when component mounts
    useEffect(() => {
        const checkStatus = async () => {
            if (!user)
                return;
            try {
                setOnboardingStatus(prev => ({ ...prev, isChecking: true, error: null }));
                const [isCompleted, isFirst] = await Promise.all([
                    checkOnboardingStatus(),
                    isFirstUserInOrganization()
                ]);
                setOnboardingStatus({
                    isFirstUser: isFirst,
                    needsOnboarding: !isCompleted,
                    isChecking: false,
                    error: null
                });
                // If onboarding is already complete, redirect to dashboard
                if (isCompleted && !isFirst) {
                    navigate('/dashboard');
                }
            }
            catch (error) {
                console.error('Error checking onboarding status:', error);
                setOnboardingStatus(prev => ({
                    ...prev,
                    isChecking: false,
                    error: 'Failed to check onboarding status'
                }));
            }
        };
        checkStatus();
    }, [user, checkOnboardingStatus, isFirstUserInOrganization, navigate]);
    const handleOnboardingComplete = async (organizationId) => {
        try {
            await markOnboardingComplete(organizationId);
            // Show success message and redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        }
        catch (error) {
            console.error('Error completing onboarding:', error);
            setOnboardingStatus(prev => ({
                ...prev,
                error: 'Failed to complete onboarding. Please try again.'
            }));
        }
    };
    const handleCancel = () => {
        // For first user, they can't really cancel, but show warning
        if (onboardingStatus.isFirstUser) {
            const confirmed = window.confirm('As the first user, you need to complete the organization setup. Are you sure you want to exit?');
            if (confirmed) {
                navigate('/');
            }
        }
        else {
            navigate('/dashboard');
        }
    };
    // Loading state
    if (isLoading || onboardingStatus.isChecking) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx(Card, { className: "w-96", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin mx-auto mb-4 text-primary" }), _jsx("h3", { className: "font-semibold mb-2", children: "Checking Setup Status" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Please wait while we verify your organization setup..." })] }) }) }));
    }
    // Error state
    if (onboardingStatus.error) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx(Card, { className: "w-96", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(AlertTriangle, { className: "h-8 w-8 mx-auto mb-4 text-red-500" }), _jsx("h3", { className: "font-semibold mb-2", children: "Setup Error" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: onboardingStatus.error }), _jsxs("div", { className: "flex space-x-3 justify-center", children: [_jsx(Button, { variant: "outline", onClick: () => window.location.reload(), children: "Try Again" }), _jsx(Button, { onClick: () => navigate('/dashboard'), children: "Go to Dashboard" })] })] }) }) }));
    }
    // Already completed onboarding
    if (!onboardingStatus.needsOnboarding) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx(Card, { className: "w-96", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(CheckCircle, { className: "h-8 w-8 mx-auto mb-4 text-green-500" }), _jsx("h3", { className: "font-semibold mb-2", children: "Setup Complete" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Your organization setup is already complete. You can access the dashboard." }), _jsxs(Button, { onClick: () => navigate('/dashboard'), className: "w-full", children: [_jsx(Home, { className: "h-4 w-4 mr-2" }), "Go to Dashboard"] })] }) }) }));
    }
    // First user welcome message
    if (onboardingStatus.isFirstUser) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx(Card, { className: "mb-6 border-blue-200 bg-blue-50", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(CheckCircle, { className: "h-6 w-6 text-blue-600" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-xl font-bold text-blue-900 mb-2", children: "Welcome to cATO Dashboard!" }), _jsx("p", { className: "text-blue-700 mb-3", children: "You're the first user setting up this organization. Let's get your compliance monitoring system configured with a guided setup process." }), _jsxs("div", { className: "flex items-center text-sm text-blue-600", children: [_jsx(ArrowRight, { className: "h-4 w-4 mr-2" }), _jsx("span", { children: "This will take approximately 10-15 minutes" })] })] })] }) }) }), _jsx(OnboardingWizard, { onComplete: handleOnboardingComplete, onCancel: handleCancel })] }) }));
    }
    // Regular user onboarding
    return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs(Alert, { className: "mb-6", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Complete your organization setup to access all features of the cATO Dashboard." })] }), _jsx(OnboardingWizard, { onComplete: handleOnboardingComplete, onCancel: handleCancel })] }) }));
};
