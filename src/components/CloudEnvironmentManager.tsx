import React, { useState, useEffect } from 'react';
import { Plus, Cloud, Settings, Edit, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { classificationService, CloudEnvironment, SystemClassification } from "@/services/classificationService";
import { useAuth } from "@/contexts/SimpleAuthContext";

interface CloudProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: CredentialField[];
}

interface CredentialField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
}

const cloudProviders: CloudProvider[] = [
  {
    id: 'azure',
    name: 'Microsoft Azure',
    icon: '☁️',
    description: 'Microsoft Azure cloud platform',
    fields: [
      { name: 'tenantId', label: 'Tenant ID', type: 'text', required: true, placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
      { name: 'subscriptionId', label: 'Subscription ID', type: 'text', required: true, placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
      { name: 'clientId', label: 'Application (Client) ID', type: 'text', required: true, placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true, placeholder: 'Enter client secret' },
      { name: 'environment', label: 'Azure Environment', type: 'select', required: true, options: [
        { value: 'AzurePublicCloud', label: 'Azure Public Cloud' },
        { value: 'AzureUSGovernment', label: 'Azure US Government' },
        { value: 'AzureChina', label: 'Azure China' },
        { value: 'AzureGermany', label: 'Azure Germany' }
      ]}
    ]
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    icon: '🟧',
    description: 'Amazon Web Services cloud platform',
    fields: [
      { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true, placeholder: 'AKIAIOSFODNN7EXAMPLE' },
      { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true, placeholder: 'Enter secret access key' },
      { name: 'region', label: 'Default Region', type: 'select', required: true, options: [
        { value: 'us-east-1', label: 'US East (N. Virginia)' },
        { value: 'us-west-2', label: 'US West (Oregon)' },
        { value: 'us-gov-west-1', label: 'AWS GovCloud (US-West)' },
        { value: 'us-gov-east-1', label: 'AWS GovCloud (US-East)' }
      ]},
      { name: 'sessionToken', label: 'Session Token (Optional)', type: 'password', required: false, placeholder: 'Enter session token if using temporary credentials' }
    ]
  },
  {
    id: 'google',
    name: 'Google Cloud Platform',
    icon: '🔵',
    description: 'Google Cloud Platform',
    fields: [
      { name: 'projectId', label: 'Project ID', type: 'text', required: true, placeholder: 'my-project-id' },
      { name: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'textarea', required: true, placeholder: 'Paste the entire JSON key file content here' },
      { name: 'region', label: 'Default Region', type: 'select', required: true, options: [
        { value: 'us-central1', label: 'us-central1 (Iowa)' },
        { value: 'us-east1', label: 'us-east1 (South Carolina)' },
        { value: 'us-west1', label: 'us-west1 (Oregon)' },
        { value: 'europe-west1', label: 'europe-west1 (Belgium)' }
      ]}
    ]
  },
  {
    id: 'oracle',
    name: 'Oracle Cloud Infrastructure',
    icon: '🔴',
    description: 'Oracle Cloud Infrastructure',
    fields: [
      { name: 'tenancyId', label: 'Tenancy OCID', type: 'text', required: true, placeholder: 'ocid1.tenancy.oc1...' },
      { name: 'userId', label: 'User OCID', type: 'text', required: true, placeholder: 'ocid1.user.oc1...' },
      { name: 'fingerprint', label: 'API Key Fingerprint', type: 'text', required: true, placeholder: 'xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx' },
      { name: 'privateKey', label: 'Private Key', type: 'textarea', required: true, placeholder: 'Paste the private key content here' },
      { name: 'region', label: 'Default Region', type: 'select', required: true, options: [
        { value: 'us-ashburn-1', label: 'US East (Ashburn)' },
        { value: 'us-phoenix-1', label: 'US West (Phoenix)' },
        { value: 'eu-frankfurt-1', label: 'EU (Frankfurt)' },
        { value: 'ap-tokyo-1', label: 'Asia Pacific (Tokyo)' }
      ]}
    ]
  }
];

export function CloudEnvironmentManager() {
  const [environments, setEnvironments] = useState<CloudEnvironment[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<CloudEnvironment | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<{ tested: boolean; success: boolean; message: string }>({
    tested: false,
    success: false,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadEnvironments();
  }, [user]);

  const loadEnvironments = async () => {
    if (!user?.organizationId) return;
    
    try {
      const envs = await classificationService.getCloudEnvironments(user.organizationId);
      setEnvironments(envs);
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  };

  const handleAddEnvironment = () => {
    setEditingEnvironment(null);
    setSelectedProvider(null);
    setFormData({});
    setConnectionStatus({ tested: false, success: false, message: '' });
    setIsAddDialogOpen(true);
  };

  const handleProviderSelect = (providerId: string) => {
    const provider = cloudProviders.find(p => p.id === providerId);
    setSelectedProvider(provider || null);
    setFormData({});
    setConnectionStatus({ tested: false, success: false, message: '' });
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const testConnection = async () => {
    if (!selectedProvider) return;
    
    setLoading(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate required fields
      const missingFields = selectedProvider.fields
        .filter(field => field.required && !formData[field.name])
        .map(field => field.label);
      
      if (missingFields.length > 0) {
        setConnectionStatus({
          tested: true,
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      } else {
        setConnectionStatus({
          tested: true,
          success: true,
          message: `Successfully connected to ${selectedProvider.name}`
        });
      }
    } catch (error) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Connection test failed. Please check your credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEnvironment = async () => {
    if (!selectedProvider || !user?.organizationId) return;
    
    try {
      const newEnvironment: Omit<CloudEnvironment, 'id'> = {
        name: formData.name || `${selectedProvider.name} Environment`,
        provider: selectedProvider.id as CloudEnvironment['provider'],
        impactLevel: (formData.impactLevel as SystemClassification['impactLevel']) || 'IL2',
        dataClassification: (formData.dataClassification as SystemClassification['dataClassification']) || 'CUI',
        isActive: true
      };

      await classificationService.addCloudEnvironment(user.organizationId, newEnvironment);
      await loadEnvironments();
      setIsAddDialogOpen(false);
      setSelectedProvider(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to save environment:', error);
    }
  };

  const deleteEnvironment = async (environmentId: string) => {
    // This would be implemented in the service
    console.log('Delete environment:', environmentId);
    // For now, just reload
    await loadEnvironments();
  };

  const getProviderIcon = (provider: CloudEnvironment['provider']) => {
    const providerData = cloudProviders.find(p => p.id === provider);
    return providerData?.icon || '☁️';
  };

  const getImpactLevelColor = (level: SystemClassification['impactLevel']) => {
    switch (level) {
      case 'IL1': return 'bg-green-100 text-green-800 border-green-200';
      case 'IL2': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IL3': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IL4': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'IL5': return 'bg-red-100 text-red-800 border-red-200';
      case 'IL6': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cloud Environments</h2>
          <p className="text-muted-foreground">Manage multiple cloud environments and their security classifications</p>
        </div>
        <Button onClick={handleAddEnvironment}>
          <Plus className="w-4 h-4 mr-2" />
          Add Environment
        </Button>
      </div>

      {/* Current Environments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {environments.map((env) => (
          <Card key={env.id} className={`hover:shadow-md transition-shadow ${env.isActive ? 'ring-2 ring-blue-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getProviderIcon(env.provider)}</span>
                  <CardTitle className="text-base">{env.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingEnvironment(env)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteEnvironment(env.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Provider</span>
                <Badge variant="outline">{env.provider.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Impact Level</span>
                <Badge variant="outline" className={getImpactLevelColor(env.impactLevel)}>
                  {env.impactLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Classification</span>
                <Badge variant="outline">{env.dataClassification}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={env.isActive ? "default" : "secondary"}>
                  {env.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Environment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Cloud Environment</DialogTitle>
            <DialogDescription>
              Connect a new cloud environment to monitor compliance and security posture
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {!selectedProvider ? (
              // Provider Selection
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Cloud Provider</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cloudProviders.map((provider) => (
                    <Card 
                      key={provider.id} 
                      className="cursor-pointer hover:shadow-md hover:ring-2 hover:ring-blue-200 transition-all"
                      onClick={() => handleProviderSelect(provider.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{provider.icon}</span>
                          <div>
                            <h4 className="font-semibold">{provider.name}</h4>
                            <p className="text-sm text-muted-foreground">{provider.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              // Configuration Form
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" onClick={() => setSelectedProvider(null)}>
                    ← Back
                  </Button>
                  <span className="text-2xl">{selectedProvider.icon}</span>
                  <h3 className="text-lg font-semibold">{selectedProvider.name} Configuration</h3>
                </div>

                {/* Basic Environment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Environment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Environment Name</Label>
                        <Input
                          id="name"
                          placeholder={`${selectedProvider.name} Production`}
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="impactLevel">Impact Level</Label>
                        <Select value={formData.impactLevel || 'IL2'} onValueChange={(value) => handleInputChange('impactLevel', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IL1">IL1 - Low Impact</SelectItem>
                            <SelectItem value="IL2">IL2 - Low Impact</SelectItem>
                            <SelectItem value="IL3">IL3 - Moderate Impact</SelectItem>
                            <SelectItem value="IL4">IL4 - Moderate Impact</SelectItem>
                            <SelectItem value="IL5">IL5 - High Impact</SelectItem>
                            <SelectItem value="IL6">IL6 - High Impact</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dataClassification">Data Classification</Label>
                        <Select value={formData.dataClassification || 'CUI'} onValueChange={(value) => handleInputChange('dataClassification', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unclassified">Unclassified</SelectItem>
                            <SelectItem value="CUI">CUI</SelectItem>
                            <SelectItem value="Confidential">Confidential</SelectItem>
                            <SelectItem value="Secret">Secret</SelectItem>
                            <SelectItem value="Top Secret">Top Secret</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider-specific Credentials */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Authentication Credentials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProvider.fields.map((field) => (
                        <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          
                          {field.type === 'select' ? (
                            <Select value={formData[field.name] || ''} onValueChange={(value) => handleInputChange(field.name, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              id={field.name}
                              placeholder={field.placeholder}
                              value={formData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              rows={4}
                            />
                          ) : (
                            <Input
                              id={field.name}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                            />
                          )}
                          
                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={testConnection} disabled={loading}>
                        {loading ? 'Testing...' : 'Test Connection'}
                      </Button>
                      
                      {connectionStatus.tested && (
                        <Alert className={connectionStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                          {connectionStatus.success ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <AlertDescription className={connectionStatus.success ? "text-green-800" : "text-red-800"}>
                            {connectionStatus.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveEnvironment}
                    disabled={!connectionStatus.success}
                  >
                    Add Environment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
