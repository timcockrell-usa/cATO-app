/**
 * Onboarding Page Component
 * Main page that handles first-user onboarding flow
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Home,
  ArrowRight
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, isLoading, checkOnboardingStatus, markOnboardingComplete, isFirstUserInOrganization } = useAuth();
  const navigate = useNavigate();
  const [onboardingStatus, setOnboardingStatus] = useState<{
    isFirstUser: boolean;
    needsOnboarding: boolean;
    isChecking: boolean;
    error: string | null;
  }>({
    isFirstUser: false,
    needsOnboarding: false,
    isChecking: true,
    error: null
  });

  // Check onboarding status when component mounts
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;

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
      } catch (error) {
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

  const handleOnboardingComplete = async (organizationId: string) => {
    try {
      await markOnboardingComplete(organizationId);
      
      // Show success message and redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
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
      const confirmed = window.confirm(
        'As the first user, you need to complete the organization setup. Are you sure you want to exit?'
      );
      if (confirmed) {
        navigate('/');
      }
    } else {
      navigate('/dashboard');
    }
  };

  // Loading state
  if (isLoading || onboardingStatus.isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Checking Setup Status</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your organization setup...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (onboardingStatus.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h3 className="font-semibold mb-2">Setup Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {onboardingStatus.error}
            </p>
            <div className="flex space-x-3 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already completed onboarding
  if (!onboardingStatus.needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold mb-2">Setup Complete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your organization setup is already complete. You can access the dashboard.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // First user welcome message
  if (onboardingStatus.isFirstUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Banner */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-blue-900 mb-2">
                    Welcome to cATO Dashboard!
                  </h2>
                  <p className="text-blue-700 mb-3">
                    You're the first user setting up this organization. Let's get your compliance 
                    monitoring system configured with a guided setup process.
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>This will take approximately 10-15 minutes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Wizard */}
          <OnboardingWizard 
            onComplete={handleOnboardingComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Regular user onboarding
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Complete your organization setup to access all features of the cATO Dashboard.
          </AlertDescription>
        </Alert>

        {/* Onboarding Wizard */}
        <OnboardingWizard 
          onComplete={handleOnboardingComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};
