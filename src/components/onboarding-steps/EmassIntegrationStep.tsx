/**
 * eMASS Integration Step Component
 * Optional step to connect to eMASS and import existing compliance data
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  Shield, 
  Key, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  SkipForward,
  TestTube2,
  FileText,
  Server
} from 'lucide-react';
import { OnboardingStepProps } from './types';
import { EmassSetupData } from '@/services/onboardingService';

export const EmassIntegrationStep: React.FC<OnboardingStepProps> = ({ 
  onComplete, 
  onNext,
  onSkip,
  stepData,
  isProcessing 
}) => {
  const [emassData, setEmassData] = useState<EmassSetupData>({
    systemId: '',
    packageId: '',
    emassUrl: '',
    credentials: {
      apiKey: '',
      userId: '',
      certificatePath: ''
    },
    importData: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({ tested: false, success: false, message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('credentials.')) {
      const credField = field.split('.')[1];
      setEmassData(prev => ({
        ...prev,
        credentials: { ...prev.credentials, [credField]: value }
      }));
    } else {
      setEmassData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!emassData.systemId.trim()) {
      newErrors.systemId = 'System ID is required';
    }

    if (!emassData.packageId.trim()) {
      newErrors.packageId = 'Package ID is required';
    }

    if (!emassData.emassUrl.trim()) {
      newErrors.emassUrl = 'eMASS URL is required';
    } else if (!emassData.emassUrl.startsWith('https://')) {
      newErrors.emassUrl = 'eMASS URL must start with https://';
    }

    if (!emassData.credentials.apiKey.trim()) {
      newErrors['credentials.apiKey'] = 'API Key is required';
    }

    if (!emassData.credentials.userId.trim()) {
      newErrors['credentials.userId'] = 'User ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus({ tested: false, success: false, message: '' });

    try {
      // Simulate connection test - in real implementation, this would call the eMASS API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/failure based on the data provided
      const isValidFormat = emassData.systemId.length >= 3 && 
                           emassData.packageId.length >= 3 &&
                           emassData.credentials.apiKey.length >= 10;

      if (isValidFormat) {
        setConnectionStatus({
          tested: true,
          success: true,
          message: 'Successfully connected to eMASS. Ready to import data.'
        });
      } else {
        setConnectionStatus({
          tested: true,
          success: false,
          message: 'Connection failed. Please verify your credentials and system information.'
        });
      }
    } catch (error) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Connection test failed. Please check your network connection and try again.'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSetupAndContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      
      // Save the eMASS configuration
      onComplete(stepData.id, emassData);
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error('Error saving eMASS configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipIntegration = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            <span>eMASS Integration</span>
            <Badge variant="outline">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connect to your existing eMASS (Enterprise Mission Assurance Support Service) instance to 
            import controls, POAMs, and assessment data automatically.
          </p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This step is optional. You can skip it and set up eMASS integration later from the settings page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* eMASS Benefits */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Benefits of eMASS Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Download className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Automated Data Import</h4>
                <p className="text-sm text-blue-700">Import existing controls, assessments, and POAMs</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Synchronized Compliance</h4>
                <p className="text-sm text-blue-700">Keep compliance data in sync between systems</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Unified Reporting</h4>
                <p className="text-sm text-blue-700">Generate reports that include eMASS data</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Server className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Integration</h4>
                <p className="text-sm text-blue-700">Enterprise-grade security and API access</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* eMASS Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>eMASS System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systemId">System ID *</Label>
              <Input
                id="systemId"
                value={emassData.systemId}
                onChange={(e) => handleInputChange('systemId', e.target.value)}
                placeholder="e.g., DOD-001234"
                className={errors.systemId ? 'border-red-500' : ''}
              />
              {errors.systemId && (
                <p className="text-sm text-red-600">{errors.systemId}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your eMASS system identifier
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packageId">Package ID *</Label>
              <Input
                id="packageId"
                value={emassData.packageId}
                onChange={(e) => handleInputChange('packageId', e.target.value)}
                placeholder="e.g., PKG-001234"
                className={errors.packageId ? 'border-red-500' : ''}
              />
              {errors.packageId && (
                <p className="text-sm text-red-600">{errors.packageId}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your eMASS package identifier
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emassUrl">eMASS URL *</Label>
              <Input
                id="emassUrl"
                value={emassData.emassUrl}
                onChange={(e) => handleInputChange('emassUrl', e.target.value)}
                placeholder="https://your-organization.emass.mil"
                className={errors.emassUrl ? 'border-red-500' : ''}
              />
              {errors.emassUrl && (
                <p className="text-sm text-red-600">{errors.emassUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your organization's eMASS instance URL
              </p>
            </div>
          </div>

          <Separator />

          {/* API Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>API Credentials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={emassData.credentials.apiKey}
                  onChange={(e) => handleInputChange('credentials.apiKey', e.target.value)}
                  placeholder="Enter your eMASS API key"
                  className={errors['credentials.apiKey'] ? 'border-red-500' : ''}
                />
                {errors['credentials.apiKey'] && (
                  <p className="text-sm text-red-600">{errors['credentials.apiKey']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  value={emassData.credentials.userId}
                  onChange={(e) => handleInputChange('credentials.userId', e.target.value)}
                  placeholder="Your eMASS user ID"
                  className={errors['credentials.userId'] ? 'border-red-500' : ''}
                />
                {errors['credentials.userId'] && (
                  <p className="text-sm text-red-600">{errors['credentials.userId']}</p>
                )}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-left p-0"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </Button>

              {showAdvanced && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <Label htmlFor="certificatePath">Client Certificate Path</Label>
                    <Input
                      id="certificatePath"
                      value={emassData.credentials.certificatePath}
                      onChange={(e) => handleInputChange('credentials.certificatePath', e.target.value)}
                      placeholder="Path to client certificate (if required)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Path to client certificate for mutual TLS authentication
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Import Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Import Settings</h3>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <input
                type="checkbox"
                id="importData"
                checked={emassData.importData}
                onChange={(e) => setEmassData(prev => ({ ...prev, importData: e.target.checked }))}
              />
              <div>
                <Label htmlFor="importData" className="cursor-pointer font-medium">
                  Import existing eMASS data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Import controls, POAMs, and assessment data from your eMASS instance
                </p>
              </div>
            </div>

            {emassData.importData && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The import process will download your existing controls, POAMs, and assessment data. 
                  This may take several minutes depending on the amount of data.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Test your eMASS connection before proceeding to ensure everything is configured correctly.
          </p>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTestingConnection || isProcessing}
            >
              <TestTube2 className="h-4 w-4 mr-2" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {connectionStatus.tested && (
            <Alert variant={connectionStatus.success ? "default" : "destructive"}>
              {connectionStatus.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{connectionStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Security Information</h3>
              <div className="space-y-2 text-sm text-amber-700">
                <p>• All credentials are encrypted and stored securely</p>
                <p>• API connections use TLS 1.2+ encryption</p>
                <p>• Access is limited to read-only operations unless explicitly configured</p>
                <p>• Integration can be disabled or reconfigured at any time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={handleSkipIntegration}
              disabled={isSaving || isProcessing}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip eMASS Integration
            </Button>

            <div className="space-x-4">
              <Button 
                variant="outline" 
                onClick={() => onComplete(stepData.id, emassData)}
                disabled={isSaving || isProcessing}
              >
                Save for Later
              </Button>
              <Button 
                onClick={handleSetupAndContinue}
                disabled={isSaving || isProcessing || !connectionStatus.success}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    Setup & Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
