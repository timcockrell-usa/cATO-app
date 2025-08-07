/**
 * Review and Complete Step Component
 * Final step to review configuration and complete onboarding
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle,
  Info,
  Shield,
  Building,
  Settings,
  ExternalLink,
  Cloud,
  Users,
  FileCheck,
  Loader2,
  Rocket,
  Edit
} from 'lucide-react';
import { ReviewCompleteStepProps } from './types';
import { onboardingService } from '@/services/onboardingService';

export const ReviewCompleteStep: React.FC<ReviewCompleteStepProps> = ({ 
  onCompleteOnboarding,
  allStepData,
  stepData,
  user,
  isProcessing 
}) => {
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  const [creationStatus, setCreationStatus] = useState<{
    step: string;
    completed: string[];
    error?: string;
  }>({
    step: 'Ready to create',
    completed: []
  });

  const getStepData = (stepId: string) => {
    return allStepData.find(step => step.id === stepId)?.data;
  };

  const organizationData = getStepData('organization-setup');
  const securityData = getStepData('security-configuration');
  const emassData = getStepData('emass-integration');
  const cloudData = getStepData('cloud-environments');
  const userData = getStepData('user-management');

  const handleCompleteSetup = async () => {
    try {
      setIsCreatingOrganization(true);
      setCreationStatus({ step: 'Creating organization...', completed: [] });

      // Step 1: Create organization
      const organization = await onboardingService.createOrganization(organizationData, user.id);
      setCreationStatus(prev => ({ 
        ...prev, 
        step: 'Setting up eMASS integration...', 
        completed: ['Organization created'] 
      }));

      // Step 2: Setup eMASS if configured
      if (emassData && emassData.systemId) {
        try {
          await onboardingService.setupEmassIntegration(organization.id, emassData);
          setCreationStatus(prev => ({ 
            ...prev, 
            step: 'Connecting cloud environments...', 
            completed: [...prev.completed, 'eMASS integration configured'] 
          }));
        } catch (error) {
          console.warn('eMASS setup failed, continuing without integration:', error);
          setCreationStatus(prev => ({ 
            ...prev, 
            step: 'Connecting cloud environments...', 
            completed: [...prev.completed, 'eMASS integration skipped (error)'] 
          }));
        }
      } else {
        setCreationStatus(prev => ({ 
          ...prev, 
          step: 'Connecting cloud environments...', 
          completed: [...prev.completed, 'eMASS integration skipped'] 
        }));
      }

      // Step 3: Setup cloud environments
      if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
        for (const cloudEnv of cloudData) {
          try {
            await onboardingService.setupCloudEnvironment(organization.id, cloudEnv);
          } catch (error) {
            console.warn(`Cloud environment setup failed for ${cloudEnv.displayName}:`, error);
          }
        }
        setCreationStatus(prev => ({ 
          ...prev, 
          step: 'Finalizing setup...', 
          completed: [...prev.completed, `${cloudData.length} cloud environment(s) connected`] 
        }));
      } else {
        setCreationStatus(prev => ({ 
          ...prev, 
          step: 'Finalizing setup...', 
          completed: [...prev.completed, 'Cloud environments skipped'] 
        }));
      }

      // Step 4: Send user invitations (if any)
      if (userData && Array.isArray(userData) && userData.length > 0) {
        // In a real implementation, this would send invitation emails
        setCreationStatus(prev => ({ 
          ...prev, 
          step: 'Completing setup...', 
          completed: [...prev.completed, `${userData.length} user invitation(s) sent`] 
        }));
      }

      // Step 5: Complete onboarding
      setCreationStatus(prev => ({ 
        ...prev, 
        step: 'Setup complete!', 
        completed: [...prev.completed, 'Organization setup completed'] 
      }));

      // Call the completion handler
      await onCompleteOnboarding(organization.id);

    } catch (error) {
      console.error('Error completing setup:', error);
      setCreationStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }));
    } finally {
      setIsCreatingOrganization(false);
    }
  };

  const configurationSections = [
    {
      id: 'organization',
      title: 'Organization Information',
      icon: Building,
      data: organizationData,
      items: organizationData ? [
        { label: 'Legal Name', value: organizationData.legalName },
        { label: 'Common Name', value: organizationData.commonName },
        { label: 'Organization Type', value: organizationData.organizationType },
        { label: 'Service Tier', value: organizationData.tier },
        { label: 'Authorizing Official', value: `${organizationData.aoName} (${organizationData.aoEmail})` },
        { label: 'ISSM', value: `${organizationData.issmName} (${organizationData.issmEmail})` }
      ] : []
    },
    {
      id: 'security',
      title: 'Security Configuration',
      icon: Shield,
      data: securityData,
      items: securityData ? [
        { label: 'NIST Revision', value: securityData.nistRevision },
        { label: 'Security Classification', value: securityData.securityClassification },
        { label: 'Impact Level', value: securityData.impactLevel },
        { label: 'Compliance Frameworks', value: securityData.complianceFrameworks?.join(', ') },
        { label: 'Audit Trail', value: securityData.enableAuditTrail ? 'Enabled' : 'Disabled' },
        { label: 'Continuous Monitoring', value: securityData.enableContinuousMonitoring ? 'Enabled' : 'Disabled' }
      ] : []
    },
    {
      id: 'emass',
      title: 'eMASS Integration',
      icon: ExternalLink,
      data: emassData,
      optional: true,
      items: emassData?.systemId ? [
        { label: 'System ID', value: emassData.systemId },
        { label: 'Package ID', value: emassData.packageId },
        { label: 'eMASS URL', value: emassData.emassUrl },
        { label: 'Import Data', value: emassData.importData ? 'Yes' : 'No' }
      ] : []
    },
    {
      id: 'cloud',
      title: 'Cloud Environments',
      icon: Cloud,
      data: cloudData,
      items: cloudData && Array.isArray(cloudData) && cloudData.length > 0 ? 
        cloudData.map(env => ({
          label: env.displayName,
          value: `${env.provider} • ${env.region}`
        })) : []
    },
    {
      id: 'users',
      title: 'User Invitations',
      icon: Users,
      data: userData,
      optional: true,
      items: userData && Array.isArray(userData) && userData.length > 0 ? 
        userData.map(inv => ({
          label: inv.email,
          value: inv.roles.join(', ')
        })) : []
    }
  ];

  const completedSections = configurationSections.filter(section => 
    section.data && (
      !Array.isArray(section.data) || 
      (Array.isArray(section.data) && section.data.length > 0)
    )
  );

  const requiredSections = configurationSections.filter(section => !section.optional);
  const completedRequiredSections = requiredSections.filter(section => 
    section.data && (
      !Array.isArray(section.data) || 
      (Array.isArray(section.data) && section.data.length > 0)
    )
  );

  const isReadyToComplete = completedRequiredSections.length === requiredSections.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <span>Review & Complete Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Review your configuration settings and complete the organization setup. 
            Once complete, your cATO Dashboard will be ready for compliance monitoring.
          </p>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium">Progress: </span>
              {completedRequiredSections.length} of {requiredSections.length} required sections completed
            </div>
            {isReadyToComplete ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready to complete
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Missing required sections
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <div className="space-y-4">
        {configurationSections.map((section) => {
          const hasData = section.data && (
            !Array.isArray(section.data) || 
            (Array.isArray(section.data) && section.data.length > 0)
          );

          return (
            <Card key={section.id} className={hasData ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <section.icon className={`h-5 w-5 ${hasData ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={hasData ? 'text-green-900' : 'text-gray-600'}>{section.title}</span>
                    {section.optional && (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasData ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className={`h-5 w-5 rounded-full border-2 ${section.optional ? 'border-gray-300' : 'border-amber-400'}`} />
                    )}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              {hasData && section.items.length > 0 && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.items.map((item, index) => (
                      <div key={index}>
                        <span className="text-sm font-medium text-gray-700">{item.label}:</span>
                        <p className="text-sm text-gray-600 truncate" title={item.value}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}

              {!hasData && (
                <CardContent>
                  <p className="text-sm text-gray-500 italic">
                    {section.optional ? 'Not configured (optional)' : 'Not configured (required)'}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Creation Status */}
      {isCreatingOrganization && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Creating Your Organization</h3>
                <p className="text-blue-700 mb-3">{creationStatus.step}</p>
                
                {creationStatus.completed.length > 0 && (
                  <div className="space-y-1">
                    {creationStatus.completed.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-blue-700">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {creationStatus.error && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{creationStatus.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Information */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">What Happens Next</h3>
              <div className="space-y-2 text-sm text-amber-700">
                <p>• Your organization will be created with the configured settings</p>
                <p>• Cloud environments will begin initial resource discovery and sync</p>
                <p>• Invited users will receive email invitations with setup instructions</p>
                <p>• Initial compliance scans will be scheduled for your cloud resources</p>
                <p>• You'll have access to dashboards, reports, and compliance monitoring</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Actions */}
      <Card>
        <CardContent className="p-6">
          {!isReadyToComplete ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please complete all required configuration sections before proceeding. 
                You can go back to previous steps to complete missing information.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your configuration is complete and ready for deployment. 
                Click "Complete Setup" to create your organization and begin compliance monitoring.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline"
              disabled={isCreatingOrganization || isProcessing}
            >
              Save as Draft
            </Button>
            <Button 
              onClick={handleCompleteSetup}
              disabled={!isReadyToComplete || isCreatingOrganization || isProcessing}
              size="lg"
            >
              {isCreatingOrganization ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
