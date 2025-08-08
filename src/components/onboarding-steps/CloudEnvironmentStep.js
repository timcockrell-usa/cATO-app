import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Cloud Environment Step Component
 * Connects and configures cloud environments (Azure, AWS, etc.)
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, Shield, AlertTriangle, CheckCircle, Info, ArrowRight, TestTube2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
export const CloudEnvironmentStep = ({ onComplete, onNext, stepData, isProcessing }) => {
    const [environments, setEnvironments] = useState([]);
    const [currentEnvironment, setCurrentEnvironment] = useState({
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
    const [showSecrets, setShowSecrets] = useState({});
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState({ tested: false, success: false, message: '' });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const cloudProviders = [
        {
            id: 'Azure',
            name: 'Microsoft Azure',
            description: 'Azure Government and Commercial clouds',
            icon: '☁️',
            popular: true
        },
        {
            id: 'AWS',
            name: 'Amazon Web Services',
            description: 'AWS GovCloud and Commercial regions',
            icon: '🟠',
            popular: true
        },
        {
            id: 'GCP',
            name: 'Google Cloud Platform',
            description: 'Google Cloud and Google Cloud for Government',
            icon: '🔵',
            popular: false
        },
        {
            id: 'OracleCloud',
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
    const handleProviderChange = (provider) => {
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
    const handleInputChange = (field, value) => {
        if (field.startsWith('credentials.')) {
            const credField = field.split('.')[1];
            setCurrentEnvironment(prev => ({
                ...prev,
                credentials: { ...prev.credentials, [credField]: value }
            }));
        }
        else {
            setCurrentEnvironment(prev => ({ ...prev, [field]: value }));
        }
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const validateEnvironment = () => {
        const newErrors = {};
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
        }
        else if (currentEnvironment.provider === 'AWS') {
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
            }
            else {
                setConnectionStatus({
                    tested: true,
                    success: false,
                    message: 'Connection failed. Please verify your credentials and permissions.'
                });
            }
        }
        catch (error) {
            setConnectionStatus({
                tested: true,
                success: false,
                message: 'Connection test failed. Please check your network and try again.'
            });
        }
        finally {
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
    const handleRemoveEnvironment = (index) => {
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
        }
        catch (error) {
            console.error('Error saving cloud environments:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const toggleSecretVisibility = (field) => {
        setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
    };
    const renderAzureForm = () => (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "azure-env-name", children: "Environment Name *" }), _jsx(Input, { id: "azure-env-name", value: currentEnvironment.environmentName, onChange: (e) => handleInputChange('environmentName', e.target.value), placeholder: "e.g., prod-azure-gov", className: errors.environmentName ? 'border-red-500' : '' }), errors.environmentName && (_jsx("p", { className: "text-sm text-red-600", children: errors.environmentName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "azure-display-name", children: "Display Name *" }), _jsx(Input, { id: "azure-display-name", value: currentEnvironment.displayName, onChange: (e) => handleInputChange('displayName', e.target.value), placeholder: "e.g., Production Azure Government", className: errors.displayName ? 'border-red-500' : '' }), errors.displayName && (_jsx("p", { className: "text-sm text-red-600", children: errors.displayName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "azure-subscription", children: "Subscription ID *" }), _jsx(Input, { id: "azure-subscription", value: currentEnvironment.subscriptionId, onChange: (e) => handleInputChange('subscriptionId', e.target.value), placeholder: "12345678-1234-1234-1234-123456789012", className: errors.subscriptionId ? 'border-red-500' : '' }), errors.subscriptionId && (_jsx("p", { className: "text-sm text-red-600", children: errors.subscriptionId }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "azure-tenant", children: "Tenant ID *" }), _jsx(Input, { id: "azure-tenant", value: currentEnvironment.tenantId, onChange: (e) => handleInputChange('tenantId', e.target.value), placeholder: "87654321-4321-4321-4321-210987654321", className: errors.tenantId ? 'border-red-500' : '' }), errors.tenantId && (_jsx("p", { className: "text-sm text-red-600", children: errors.tenantId }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "azure-region", children: "Region *" }), _jsxs(Select, { value: currentEnvironment.region, onValueChange: (value) => handleInputChange('region', value), children: [_jsx(SelectTrigger, { className: errors.region ? 'border-red-500' : '', children: _jsx(SelectValue, { placeholder: "Select Azure region" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", disabled: true, children: "Government Regions" }), azureRegions.filter(r => r.includes('gov')).map((region) => (_jsxs(SelectItem, { value: region, children: [region, " (Government)"] }, region))), _jsx(SelectItem, { value: "", disabled: true, children: "Commercial Regions" }), azureRegions.filter(r => !r.includes('gov')).map((region) => (_jsx(SelectItem, { value: region, children: region }, region)))] })] }), errors.region && (_jsx("p", { className: "text-sm text-red-600", children: errors.region }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "azure-client-id", children: "Service Principal Client ID *" }), _jsx(Input, { id: "azure-client-id", value: currentEnvironment.credentials.clientId, onChange: (e) => handleInputChange('credentials.clientId', e.target.value), placeholder: "Application (client) ID", className: errors['credentials.clientId'] ? 'border-red-500' : '' }), errors['credentials.clientId'] && (_jsx("p", { className: "text-sm text-red-600", children: errors['credentials.clientId'] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "azure-client-secret", children: "Service Principal Client Secret *" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "azure-client-secret", type: showSecrets['azure-secret'] ? 'text' : 'password', value: currentEnvironment.credentials.clientSecret, onChange: (e) => handleInputChange('credentials.clientSecret', e.target.value), placeholder: "Client secret value", className: errors['credentials.clientSecret'] ? 'border-red-500' : '' }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-1 top-1 h-8 w-8 p-0", onClick: () => toggleSecretVisibility('azure-secret'), children: showSecrets['azure-secret'] ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), errors['credentials.clientSecret'] && (_jsx("p", { className: "text-sm text-red-600", children: errors['credentials.clientSecret'] }))] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "azure-keyvault", children: "Key Vault URL (Optional)" }), _jsx(Input, { id: "azure-keyvault", value: currentEnvironment.credentials.keyVaultUrl, onChange: (e) => handleInputChange('credentials.keyVaultUrl', e.target.value), placeholder: "https://your-keyvault.vault.azure.net/" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Optional: Key Vault URL for additional secrets management" })] })] }) }));
    const renderAWSForm = () => (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aws-env-name", children: "Environment Name *" }), _jsx(Input, { id: "aws-env-name", value: currentEnvironment.environmentName, onChange: (e) => handleInputChange('environmentName', e.target.value), placeholder: "e.g., prod-aws-govcloud", className: errors.environmentName ? 'border-red-500' : '' }), errors.environmentName && (_jsx("p", { className: "text-sm text-red-600", children: errors.environmentName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aws-display-name", children: "Display Name *" }), _jsx(Input, { id: "aws-display-name", value: currentEnvironment.displayName, onChange: (e) => handleInputChange('displayName', e.target.value), placeholder: "e.g., Production AWS GovCloud", className: errors.displayName ? 'border-red-500' : '' }), errors.displayName && (_jsx("p", { className: "text-sm text-red-600", children: errors.displayName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aws-account", children: "Account ID *" }), _jsx(Input, { id: "aws-account", value: currentEnvironment.subscriptionId, onChange: (e) => handleInputChange('subscriptionId', e.target.value), placeholder: "123456789012", className: errors.subscriptionId ? 'border-red-500' : '' }), errors.subscriptionId && (_jsx("p", { className: "text-sm text-red-600", children: errors.subscriptionId }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aws-region", children: "Region *" }), _jsxs(Select, { value: currentEnvironment.region, onValueChange: (value) => handleInputChange('region', value), children: [_jsx(SelectTrigger, { className: errors.region ? 'border-red-500' : '', children: _jsx(SelectValue, { placeholder: "Select AWS region" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", disabled: true, children: "GovCloud Regions" }), awsRegions.filter(r => r.includes('gov')).map((region) => (_jsxs(SelectItem, { value: region, children: [region, " (GovCloud)"] }, region))), _jsx(SelectItem, { value: "", disabled: true, children: "Commercial Regions" }), awsRegions.filter(r => !r.includes('gov')).map((region) => (_jsx(SelectItem, { value: region, children: region }, region)))] })] }), errors.region && (_jsx("p", { className: "text-sm text-red-600", children: errors.region }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aws-access-key", children: "Access Key ID *" }), _jsx(Input, { id: "aws-access-key", value: currentEnvironment.credentials.clientId, onChange: (e) => handleInputChange('credentials.clientId', e.target.value), placeholder: "AKIAIOSFODNN7EXAMPLE", className: errors['credentials.clientId'] ? 'border-red-500' : '' }), errors['credentials.clientId'] && (_jsx("p", { className: "text-sm text-red-600", children: errors['credentials.clientId'] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aws-secret-key", children: "Secret Access Key *" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "aws-secret-key", type: showSecrets['aws-secret'] ? 'text' : 'password', value: currentEnvironment.credentials.clientSecret, onChange: (e) => handleInputChange('credentials.clientSecret', e.target.value), placeholder: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", className: errors['credentials.clientSecret'] ? 'border-red-500' : '' }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-1 top-1 h-8 w-8 p-0", onClick: () => toggleSecretVisibility('aws-secret'), children: showSecrets['aws-secret'] ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), errors['credentials.clientSecret'] && (_jsx("p", { className: "text-sm text-red-600", children: errors['credentials.clientSecret'] }))] })] }) }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Cloud, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Cloud Environment Setup" })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-muted-foreground", children: "Connect your cloud environments to enable automated compliance monitoring and resource discovery. You can add multiple environments and configure additional ones later." }) })] }), errors.general && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: errors.general })] })), environments.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Configured Environments" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: environments.map((env, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg bg-green-50", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: env.displayName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [env.provider, " \u2022 ", env.region, " \u2022 ", env.environmentName] })] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemoveEnvironment(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))) }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Add Cloud Environment" }) }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsx(TabsList, { className: "grid w-full grid-cols-4", children: cloudProviders.map((provider) => (_jsxs(TabsTrigger, { value: provider.id, onClick: () => handleProviderChange(provider.id), children: [provider.icon, " ", provider.name] }, provider.id))) }), _jsxs(TabsContent, { value: "Azure", className: "space-y-6 mt-6", children: [_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "For Azure integration, you'll need a Service Principal with appropriate permissions. Azure Government regions are recommended for federal agencies." })] }), renderAzureForm()] }), _jsxs(TabsContent, { value: "AWS", className: "space-y-6 mt-6", children: [_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "For AWS integration, you'll need an IAM user with programmatic access. AWS GovCloud regions are recommended for federal agencies." })] }), renderAWSForm()] }), _jsx(TabsContent, { value: "GCP", className: "space-y-6 mt-6", children: _jsx(Alert, { children: _jsx(AlertDescription, { children: "Google Cloud Platform integration is coming soon. Please use Azure or AWS for now." }) }) }), _jsx(TabsContent, { value: "OracleCloud", className: "space-y-6 mt-6", children: _jsx(Alert, { children: _jsx(AlertDescription, { children: "Oracle Cloud integration is coming soon. Please use Azure or AWS for now." }) }) })] }) })] }), (activeTab === 'Azure' || activeTab === 'AWS') && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Test Connection" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Test your cloud connection to verify credentials and permissions." }), _jsxs("div", { className: "flex space-x-4", children: [_jsxs(Button, { variant: "outline", onClick: handleTestConnection, disabled: isTestingConnection || isProcessing, children: [_jsx(TestTube2, { className: "h-4 w-4 mr-2" }), isTestingConnection ? 'Testing...' : 'Test Connection'] }), connectionStatus.success && (_jsxs(Button, { onClick: handleAddEnvironment, disabled: !connectionStatus.success, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Environment"] }))] }), connectionStatus.tested && (_jsxs(Alert, { variant: connectionStatus.success ? "default" : "destructive", children: [connectionStatus.success ? (_jsx(CheckCircle, { className: "h-4 w-4" })) : (_jsx(AlertTriangle, { className: "h-4 w-4" })), _jsx(AlertDescription, { children: connectionStatus.message })] }))] })] })), _jsx(Card, { className: "border-amber-200 bg-amber-50", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-amber-800 mb-2", children: "Security & Permissions" }), _jsxs("div", { className: "space-y-2 text-sm text-amber-700", children: [_jsx("p", { children: "\u2022 All credentials are encrypted and stored securely using industry standards" }), _jsx("p", { children: "\u2022 Cloud connections use read-only access wherever possible" }), _jsx("p", { children: "\u2022 Service principals should follow principle of least privilege" }), _jsx("p", { children: "\u2022 Regular credential rotation is recommended for enhanced security" })] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => onComplete(stepData.id, environments), disabled: isSaving || isProcessing, children: "Save for Later" }), _jsx(Button, { onClick: handleSaveAndContinue, disabled: isSaving || isProcessing || environments.length === 0, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Saving..."] })) : (_jsxs(_Fragment, { children: ["Continue Setup", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })) })] }) }) })] }));
};
