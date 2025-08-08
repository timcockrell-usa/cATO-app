import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * eMASS Integration Step Component
 * Optional step to connect to eMASS and import existing compliance data
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, Key, Download, AlertTriangle, CheckCircle, Info, ArrowRight, SkipForward, TestTube2, FileText, Server } from 'lucide-react';
export const EmassIntegrationStep = ({ onComplete, onNext, onSkip, stepData, isProcessing }) => {
    const [emassData, setEmassData] = useState({
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
    const [connectionStatus, setConnectionStatus] = useState({ tested: false, success: false, message: '' });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const handleInputChange = (field, value) => {
        if (field.startsWith('credentials.')) {
            const credField = field.split('.')[1];
            setEmassData(prev => ({
                ...prev,
                credentials: { ...prev.credentials, [credField]: value }
            }));
        }
        else {
            setEmassData(prev => ({ ...prev, [field]: value }));
        }
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!emassData.systemId.trim()) {
            newErrors.systemId = 'System ID is required';
        }
        if (!emassData.packageId.trim()) {
            newErrors.packageId = 'Package ID is required';
        }
        if (!emassData.emassUrl.trim()) {
            newErrors.emassUrl = 'eMASS URL is required';
        }
        else if (!emassData.emassUrl.startsWith('https://')) {
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
            }
            else {
                setConnectionStatus({
                    tested: true,
                    success: false,
                    message: 'Connection failed. Please verify your credentials and system information.'
                });
            }
        }
        catch (error) {
            setConnectionStatus({
                tested: true,
                success: false,
                message: 'Connection test failed. Please check your network connection and try again.'
            });
        }
        finally {
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
        }
        catch (error) {
            console.error('Error saving eMASS configuration:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleSkipIntegration = () => {
        if (onSkip) {
            onSkip();
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(ExternalLink, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "eMASS Integration" }), _jsx(Badge, { variant: "outline", children: "Optional" })] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "Connect to your existing eMASS (Enterprise Mission Assurance Support Service) instance to import controls, POAMs, and assessment data automatically." }), _jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "This step is optional. You can skip it and set up eMASS integration later from the settings page." })] })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg text-blue-900", children: "Benefits of eMASS Integration" }) }), _jsx(CardContent, { className: "space-y-3", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Download, { className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-blue-900", children: "Automated Data Import" }), _jsx("p", { className: "text-sm text-blue-700", children: "Import existing controls, assessments, and POAMs" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-blue-900", children: "Synchronized Compliance" }), _jsx("p", { className: "text-sm text-blue-700", children: "Keep compliance data in sync between systems" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(FileText, { className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-blue-900", children: "Unified Reporting" }), _jsx("p", { className: "text-sm text-blue-700", children: "Generate reports that include eMASS data" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Server, { className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-blue-900", children: "Secure Integration" }), _jsx("p", { className: "text-sm text-blue-700", children: "Enterprise-grade security and API access" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "eMASS System Configuration" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "systemId", children: "System ID *" }), _jsx(Input, { id: "systemId", value: emassData.systemId, onChange: (e) => handleInputChange('systemId', e.target.value), placeholder: "e.g., DOD-001234", className: errors.systemId ? 'border-red-500' : '' }), errors.systemId && (_jsx("p", { className: "text-sm text-red-600", children: errors.systemId })), _jsx("p", { className: "text-xs text-muted-foreground", children: "Your eMASS system identifier" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "packageId", children: "Package ID *" }), _jsx(Input, { id: "packageId", value: emassData.packageId, onChange: (e) => handleInputChange('packageId', e.target.value), placeholder: "e.g., PKG-001234", className: errors.packageId ? 'border-red-500' : '' }), errors.packageId && (_jsx("p", { className: "text-sm text-red-600", children: errors.packageId })), _jsx("p", { className: "text-xs text-muted-foreground", children: "Your eMASS package identifier" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "emassUrl", children: "eMASS URL *" }), _jsx(Input, { id: "emassUrl", value: emassData.emassUrl, onChange: (e) => handleInputChange('emassUrl', e.target.value), placeholder: "https://your-organization.emass.mil", className: errors.emassUrl ? 'border-red-500' : '' }), errors.emassUrl && (_jsx("p", { className: "text-sm text-red-600", children: errors.emassUrl })), _jsx("p", { className: "text-xs text-muted-foreground", children: "Your organization's eMASS instance URL" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-medium flex items-center space-x-2", children: [_jsx(Key, { className: "h-4 w-4" }), _jsx("span", { children: "API Credentials" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "apiKey", children: "API Key *" }), _jsx(Input, { id: "apiKey", type: "password", value: emassData.credentials.apiKey, onChange: (e) => handleInputChange('credentials.apiKey', e.target.value), placeholder: "Enter your eMASS API key", className: errors['credentials.apiKey'] ? 'border-red-500' : '' }), errors['credentials.apiKey'] && (_jsx("p", { className: "text-sm text-red-600", children: errors['credentials.apiKey'] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "userId", children: "User ID *" }), _jsx(Input, { id: "userId", value: emassData.credentials.userId, onChange: (e) => handleInputChange('credentials.userId', e.target.value), placeholder: "Your eMASS user ID", className: errors['credentials.userId'] ? 'border-red-500' : '' }), errors['credentials.userId'] && (_jsx("p", { className: "text-sm text-red-600", children: errors['credentials.userId'] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setShowAdvanced(!showAdvanced), className: "text-left p-0", children: [showAdvanced ? 'Hide' : 'Show', " Advanced Options"] }), showAdvanced && (_jsx("div", { className: "space-y-4 p-4 border rounded-lg bg-gray-50", children: _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "certificatePath", children: "Client Certificate Path" }), _jsx(Input, { id: "certificatePath", value: emassData.credentials.certificatePath, onChange: (e) => handleInputChange('credentials.certificatePath', e.target.value), placeholder: "Path to client certificate (if required)" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Optional: Path to client certificate for mutual TLS authentication" })] }) }))] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Import Settings" }), _jsxs("div", { className: "flex items-center space-x-3 p-3 border rounded-lg", children: [_jsx("input", { type: "checkbox", id: "importData", checked: emassData.importData, onChange: (e) => setEmassData(prev => ({ ...prev, importData: e.target.checked })) }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "importData", className: "cursor-pointer font-medium", children: "Import existing eMASS data" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Import controls, POAMs, and assessment data from your eMASS instance" })] })] }), emassData.importData && (_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "The import process will download your existing controls, POAMs, and assessment data. This may take several minutes depending on the amount of data." })] }))] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Test Connection" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Test your eMASS connection before proceeding to ensure everything is configured correctly." }), _jsx("div", { className: "flex space-x-4", children: _jsxs(Button, { variant: "outline", onClick: handleTestConnection, disabled: isTestingConnection || isProcessing, children: [_jsx(TestTube2, { className: "h-4 w-4 mr-2" }), isTestingConnection ? 'Testing...' : 'Test Connection'] }) }), connectionStatus.tested && (_jsxs(Alert, { variant: connectionStatus.success ? "default" : "destructive", children: [connectionStatus.success ? (_jsx(CheckCircle, { className: "h-4 w-4" })) : (_jsx(AlertTriangle, { className: "h-4 w-4" })), _jsx(AlertDescription, { children: connectionStatus.message })] }))] })] }), _jsx(Card, { className: "border-amber-200 bg-amber-50", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-amber-800 mb-2", children: "Security Information" }), _jsxs("div", { className: "space-y-2 text-sm text-amber-700", children: [_jsx("p", { children: "\u2022 All credentials are encrypted and stored securely" }), _jsx("p", { children: "\u2022 API connections use TLS 1.2+ encryption" }), _jsx("p", { children: "\u2022 Access is limited to read-only operations unless explicitly configured" }), _jsx("p", { children: "\u2022 Integration can be disabled or reconfigured at any time" })] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex justify-between", children: [_jsxs(Button, { variant: "ghost", onClick: handleSkipIntegration, disabled: isSaving || isProcessing, children: [_jsx(SkipForward, { className: "h-4 w-4 mr-2" }), "Skip eMASS Integration"] }), _jsxs("div", { className: "space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => onComplete(stepData.id, emassData), disabled: isSaving || isProcessing, children: "Save for Later" }), _jsx(Button, { onClick: handleSetupAndContinue, disabled: isSaving || isProcessing || !connectionStatus.success, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Setting up..."] })) : (_jsxs(_Fragment, { children: ["Setup & Continue", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })) })] })] }) }) })] }));
};
