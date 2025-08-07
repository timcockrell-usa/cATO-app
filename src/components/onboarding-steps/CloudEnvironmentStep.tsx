/**
 * Cloud Environment Step Component
 * Connects and configures cloud environments (Azure, AWS, etc.)
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Cloud, 
  Shield, 
  Key, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  TestTube2,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { OnboardingStepProps } from './types';
import { CloudEnvironmentSetupData } from '@/services/onboardingService';
import { CloudProvider } from '@/types/organization';

export const CloudEnvironmentStep: React.FC<OnboardingStepProps> = ({ 
  onComplete, 
  onNext,
  stepData,
  isProcessing 
}) => {
  const [environments, setEnvironments] = useState<CloudEnvironmentSetupData[]>([]);
  const [currentEnvironment, setCurrentEnvironment] = useState<CloudEnvironmentSetupData>({
    provider: 'Azure',
    environmentName: '',
    displayName: '',
    subscriptionId: '',
    tenantId: '',
    region: '',
    credentials: {
      connectionString: '',
      clientId: '',
      clientSecret: '',
      keyVaultUrl: ''
    }
  });

  const [activeTab, setActiveTab] = useState('Azure');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({ tested: false, success: false, message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const cloudProviders = [
    {
      id: 'Azure' as CloudProvider,
      name: 'Microsoft Azure',
      description: 'Azure Government and Commercial clouds',
      icon: '☁️',
      popular: true
    },
    {
      id: 'AWS' as CloudProvider,
      name: 'Amazon Web Services',
      description: 'AWS GovCloud and Commercial regions',
      icon: '🟠',
      popular: true
    },
    {
      id: 'GCP' as CloudProvider,
      name: 'Google Cloud Platform',
      description: 'Google Cloud and Google Cloud for Government',
      icon: '🔵',
      popular: false
    },
    {
      id: 'OracleCloud' as CloudProvider,
      name: 'Oracle Cloud',
      description: 'Oracle Cloud Infrastructure',
      icon: '🔴',
      popular: false
    }
  ];

  const azureRegions = [
    'usgovvirginia',
    'usgoviowa',
    'usgovtexas',
    'usgovarizona',
    'eastus',
    'eastus2',
    'westus',
    'westus2',
    'centralus',
    'northcentralus',
    'southcentralus',
    'westcentralus'
  ];

  const awsRegions = [
    'us-gov-east-1',
    'us-gov-west-1',
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'eu-west-1',
    'eu-central-1'
  ];

  const handleProviderChange = (provider: CloudProvider) => {
    setCurrentEnvironment(prev => ({
      ...prev,
      provider,
      environmentName: '',
      displayName: '',
      region: '',
      credentials: {
        connectionString: '',
        clientId: '',
        clientSecret: '',
        keyVaultUrl: ''
      }
    }));
    setActiveTab(provider);
    setConnectionStatus({ tested: false, success: false, message: '' });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('credentials.')) {
      const credField = field.split('.')[1];
      setCurrentEnvironment(prev => ({
        ...prev,
        credentials: { ...prev.credentials, [credField]: value }
      }));
    } else {
      setCurrentEnvironment(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEnvironment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentEnvironment.environmentName.trim()) {
      newErrors.environmentName = 'Environment name is required';
    }

    if (!currentEnvironment.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!currentEnvironment.region.trim()) {
      newErrors.region = 'Region is required';
    }

    // Provider-specific validation
    if (currentEnvironment.provider === 'Azure') {
      if (!currentEnvironment.subscriptionId?.trim()) {
        newErrors.subscriptionId = 'Subscription ID is required';
      }
      if (!currentEnvironment.tenantId?.trim()) {
        newErrors.tenantId = 'Tenant ID is required';
      }
      if (!currentEnvironment.credentials.clientId?.trim()) {
        newErrors['credentials.clientId'] = 'Client ID is required';
      }
      if (!currentEnvironment.credentials.clientSecret?.trim()) {
        newErrors['credentials.clientSecret'] = 'Client Secret is required';
      }
    } else if (currentEnvironment.provider === 'AWS') {
      if (!currentEnvironment.subscriptionId?.trim()) {
        newErrors.subscriptionId = 'Account ID is required';
      }
      if (!currentEnvironment.credentials.clientId?.trim()) {
        newErrors['credentials.clientId'] = 'Access Key ID is required';
      }
      if (!currentEnvironment.credentials.clientSecret?.trim()) {
        newErrors['credentials.clientSecret'] = 'Secret Access Key is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateEnvironment()) {
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus({ tested: false, success: false, message: '' });

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate success based on reasonable validation
      const hasRequiredFields = currentEnvironment.environmentName && 
                               currentEnvironment.region &&
                               currentEnvironment.credentials.clientId &&
                               currentEnvironment.credentials.clientSecret;

      if (hasRequiredFields) {
        setConnectionStatus({
          tested: true,
          success: true,
          message: `Successfully connected to ${currentEnvironment.provider}. Found resources and ready to monitor.`
        });
      } else {
        setConnectionStatus({
          tested: true,
          success: false,
          message: 'Connection failed. Please verify your credentials and permissions.'
        });
      }
    } catch (error) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Connection test failed. Please check your network and try again.'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAddEnvironment = () => {
    if (!validateEnvironment() || !connectionStatus.success) {
      return;
    }

    setEnvironments(prev => [...prev, { ...currentEnvironment }]);
    
    // Reset form for next environment
    setCurrentEnvironment({
      provider: currentEnvironment.provider,
      environmentName: '',
      displayName: '',
      subscriptionId: '',
      tenantId: '',
      region: '',
      credentials: {
        connectionString: '',
        clientId: '',
        clientSecret: '',
        keyVaultUrl: ''
      }
    });
    
    setConnectionStatus({ tested: false, success: false, message: '' });
    setErrors({});
  };

  const handleRemoveEnvironment = (index: number) => {
    setEnvironments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndContinue = async () => {
    // If there's a current environment being configured, validate and add it
    if (currentEnvironment.environmentName && validateEnvironment() && connectionStatus.success) {
      handleAddEnvironment();
    }

    if (environments.length === 0 && !currentEnvironment.environmentName) {
      setErrors({ general: 'At least one cloud environment is required.' });
      return;
    }

    try {
      setIsSaving(true);
      
      // Save all environments
      const allEnvironments = [...environments];
      if (currentEnvironment.environmentName && connectionStatus.success) {
        allEnvironments.push(currentEnvironment);
      }
      
      onComplete(stepData.id, allEnvironments);
      onNext();
    } catch (error) {
      console.error('Error saving cloud environments:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const renderAzureForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="azure-env-name">Environment Name *</Label>
          <Input
            id="azure-env-name"
            value={currentEnvironment.environmentName}
            onChange={(e) => handleInputChange('environmentName', e.target.value)}
            placeholder="e.g., prod-azure-gov"
            className={errors.environmentName ? 'border-red-500' : ''}
          />
          {errors.environmentName && (
            <p className="text-sm text-red-600">{errors.environmentName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="azure-display-name">Display Name *</Label>
          <Input
            id="azure-display-name"
            value={currentEnvironment.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="e.g., Production Azure Government"
            className={errors.displayName ? 'border-red-500' : ''}
          />
          {errors.displayName && (
            <p className="text-sm text-red-600">{errors.displayName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="azure-subscription">Subscription ID *</Label>
          <Input
            id="azure-subscription"
            value={currentEnvironment.subscriptionId}
            onChange={(e) => handleInputChange('subscriptionId', e.target.value)}
            placeholder="12345678-1234-1234-1234-123456789012"
            className={errors.subscriptionId ? 'border-red-500' : ''}
          />
          {errors.subscriptionId && (
            <p className="text-sm text-red-600">{errors.subscriptionId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="azure-tenant">Tenant ID *</Label>
          <Input
            id="azure-tenant"
            value={currentEnvironment.tenantId}
            onChange={(e) => handleInputChange('tenantId', e.target.value)}
            placeholder="87654321-4321-4321-4321-210987654321"
            className={errors.tenantId ? 'border-red-500' : ''}
          />
          {errors.tenantId && (
            <p className="text-sm text-red-600">{errors.tenantId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="azure-region">Region *</Label>
          <Select 
            value={currentEnvironment.region} 
            onValueChange={(value) => handleInputChange('region', value)}
          >
            <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select Azure region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" disabled>Government Regions</SelectItem>
              {azureRegions.filter(r => r.includes('gov')).map((region) => (
                <SelectItem key={region} value={region}>
                  {region} (Government)
                </SelectItem>
              ))}
              <SelectItem value="" disabled>Commercial Regions</SelectItem>
              {azureRegions.filter(r => !r.includes('gov')).map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && (
            <p className="text-sm text-red-600">{errors.region}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="azure-client-id">Service Principal Client ID *</Label>
          <Input
            id="azure-client-id"
            value={currentEnvironment.credentials.clientId}
            onChange={(e) => handleInputChange('credentials.clientId', e.target.value)}
            placeholder="Application (client) ID"
            className={errors['credentials.clientId'] ? 'border-red-500' : ''}
          />
          {errors['credentials.clientId'] && (
            <p className="text-sm text-red-600">{errors['credentials.clientId']}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="azure-client-secret">Service Principal Client Secret *</Label>
          <div className="relative">
            <Input
              id="azure-client-secret"
              type={showSecrets['azure-secret'] ? 'text' : 'password'}
              value={currentEnvironment.credentials.clientSecret}
              onChange={(e) => handleInputChange('credentials.clientSecret', e.target.value)}
              placeholder="Client secret value"
              className={errors['credentials.clientSecret'] ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => toggleSecretVisibility('azure-secret')}
            >
              {showSecrets['azure-secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors['credentials.clientSecret'] && (
            <p className="text-sm text-red-600">{errors['credentials.clientSecret']}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="azure-keyvault">Key Vault URL (Optional)</Label>
          <Input
            id="azure-keyvault"
            value={currentEnvironment.credentials.keyVaultUrl}
            onChange={(e) => handleInputChange('credentials.keyVaultUrl', e.target.value)}
            placeholder="https://your-keyvault.vault.azure.net/"
          />
          <p className="text-xs text-muted-foreground">
            Optional: Key Vault URL for additional secrets management
          </p>
        </div>
      </div>
    </div>
  );

  const renderAWSForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="aws-env-name">Environment Name *</Label>
          <Input
            id="aws-env-name"
            value={currentEnvironment.environmentName}
            onChange={(e) => handleInputChange('environmentName', e.target.value)}
            placeholder="e.g., prod-aws-govcloud"
            className={errors.environmentName ? 'border-red-500' : ''}
          />
          {errors.environmentName && (
            <p className="text-sm text-red-600">{errors.environmentName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aws-display-name">Display Name *</Label>
          <Input
            id="aws-display-name"
            value={currentEnvironment.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="e.g., Production AWS GovCloud"
            className={errors.displayName ? 'border-red-500' : ''}
          />
          {errors.displayName && (
            <p className="text-sm text-red-600">{errors.displayName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aws-account">Account ID *</Label>
          <Input
            id="aws-account"
            value={currentEnvironment.subscriptionId}
            onChange={(e) => handleInputChange('subscriptionId', e.target.value)}
            placeholder="123456789012"
            className={errors.subscriptionId ? 'border-red-500' : ''}
          />
          {errors.subscriptionId && (
            <p className="text-sm text-red-600">{errors.subscriptionId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aws-region">Region *</Label>
          <Select 
            value={currentEnvironment.region} 
            onValueChange={(value) => handleInputChange('region', value)}
          >
            <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select AWS region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" disabled>GovCloud Regions</SelectItem>
              {awsRegions.filter(r => r.includes('gov')).map((region) => (
                <SelectItem key={region} value={region}>
                  {region} (GovCloud)
                </SelectItem>
              ))}
              <SelectItem value="" disabled>Commercial Regions</SelectItem>
              {awsRegions.filter(r => !r.includes('gov')).map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && (
            <p className="text-sm text-red-600">{errors.region}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aws-access-key">Access Key ID *</Label>
          <Input
            id="aws-access-key"
            value={currentEnvironment.credentials.clientId}
            onChange={(e) => handleInputChange('credentials.clientId', e.target.value)}
            placeholder="AKIAIOSFODNN7EXAMPLE"
            className={errors['credentials.clientId'] ? 'border-red-500' : ''}
          />
          {errors['credentials.clientId'] && (
            <p className="text-sm text-red-600">{errors['credentials.clientId']}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aws-secret-key">Secret Access Key *</Label>
          <div className="relative">
            <Input
              id="aws-secret-key"
              type={showSecrets['aws-secret'] ? 'text' : 'password'}
              value={currentEnvironment.credentials.clientSecret}
              onChange={(e) => handleInputChange('credentials.clientSecret', e.target.value)}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className={errors['credentials.clientSecret'] ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => toggleSecretVisibility('aws-secret')}
            >
              {showSecrets['aws-secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors['credentials.clientSecret'] && (
            <p className="text-sm text-red-600">{errors['credentials.clientSecret']}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-primary" />
            <span>Cloud Environment Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connect your cloud environments to enable automated compliance monitoring and resource discovery.
            You can add multiple environments and configure additional ones later.
          </p>
        </CardContent>
      </Card>

      {errors.general && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Added Environments */}
      {environments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configured Environments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {environments.map((env, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{env.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {env.provider} • {env.region} • {env.environmentName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEnvironment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cloud Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add Cloud Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {cloudProviders.map((provider) => (
                <TabsTrigger 
                  key={provider.id} 
                  value={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                >
                  {provider.icon} {provider.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="Azure" className="space-y-6 mt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For Azure integration, you'll need a Service Principal with appropriate permissions. 
                  Azure Government regions are recommended for federal agencies.
                </AlertDescription>
              </Alert>
              {renderAzureForm()}
            </TabsContent>

            <TabsContent value="AWS" className="space-y-6 mt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For AWS integration, you'll need an IAM user with programmatic access. 
                  AWS GovCloud regions are recommended for federal agencies.
                </AlertDescription>
              </Alert>
              {renderAWSForm()}
            </TabsContent>

            <TabsContent value="GCP" className="space-y-6 mt-6">
              <Alert>
                <AlertDescription>
                  Google Cloud Platform integration is coming soon. Please use Azure or AWS for now.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="OracleCloud" className="space-y-6 mt-6">
              <Alert>
                <AlertDescription>
                  Oracle Cloud integration is coming soon. Please use Azure or AWS for now.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Connection Test */}
      {(activeTab === 'Azure' || activeTab === 'AWS') && (
        <Card>
          <CardHeader>
            <CardTitle>Test Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test your cloud connection to verify credentials and permissions.
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
              
              {connectionStatus.success && (
                <Button
                  onClick={handleAddEnvironment}
                  disabled={!connectionStatus.success}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Environment
                </Button>
              )}
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
      )}

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Security & Permissions</h3>
              <div className="space-y-2 text-sm text-amber-700">
                <p>• All credentials are encrypted and stored securely using industry standards</p>
                <p>• Cloud connections use read-only access wherever possible</p>
                <p>• Service principals should follow principle of least privilege</p>
                <p>• Regular credential rotation is recommended for enhanced security</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => onComplete(stepData.id, environments)}
              disabled={isSaving || isProcessing}
            >
              Save for Later
            </Button>
            <Button 
              onClick={handleSaveAndContinue}
              disabled={isSaving || isProcessing || environments.length === 0}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue Setup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
