import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Security Configuration Step Component
 * Configures NIST revision, security classification, and compliance settings
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileText, CheckCircle, Info, ArrowRight, Save } from 'lucide-react';
export const SecurityConfigurationStep = ({ onComplete, onNext, stepData, isProcessing }) => {
    const [configData, setConfigData] = useState({
        nistRevision: 'Rev5',
        securityClassification: 'CUI',
        impactLevel: 'Moderate',
        complianceFrameworks: ['NIST-800-53'],
        dataRetentionPeriod: 2555, // 7 years in days
        enableAuditTrail: true,
        enableContinuousMonitoring: true,
        enableAutomatedReporting: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const handleConfigChange = (field, value) => {
        setConfigData(prev => ({ ...prev, [field]: value }));
    };
    const handleFrameworkToggle = (framework, enabled) => {
        if (enabled) {
            setConfigData(prev => ({
                ...prev,
                complianceFrameworks: [...prev.complianceFrameworks, framework]
            }));
        }
        else {
            setConfigData(prev => ({
                ...prev,
                complianceFrameworks: prev.complianceFrameworks.filter(f => f !== framework)
            }));
        }
    };
    const handleSaveAndContinue = async () => {
        try {
            setIsSaving(true);
            // Save the configuration data
            onComplete(stepData.id, configData);
            // Move to next step
            onNext();
        }
        catch (error) {
            console.error('Error saving security configuration:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const nistRevisions = [
        {
            value: 'Rev4',
            label: 'NIST 800-53 Revision 4',
            description: 'Legacy revision, maintenance mode',
            status: 'legacy'
        },
        {
            value: 'Rev5',
            label: 'NIST 800-53 Revision 5',
            description: 'Current standard, recommended for most organizations',
            status: 'current'
        },
        {
            value: 'Rev6',
            label: 'NIST 800-53 Revision 6',
            description: 'Latest revision with enhanced controls',
            status: 'latest'
        }
    ];
    const securityClassifications = [
        {
            value: 'Unclassified',
            label: 'Unclassified',
            description: 'Information that does not require protection',
            color: 'bg-green-100 text-green-800'
        },
        {
            value: 'CUI',
            label: 'Controlled Unclassified Information (CUI)',
            description: 'Sensitive but unclassified information requiring protection',
            color: 'bg-yellow-100 text-yellow-800'
        },
        {
            value: 'Confidential',
            label: 'Confidential',
            description: 'Information that could cause damage to national security',
            color: 'bg-orange-100 text-orange-800'
        },
        {
            value: 'Secret',
            label: 'Secret',
            description: 'Information that could cause serious damage to national security',
            color: 'bg-red-100 text-red-800'
        }
    ];
    const impactLevels = [
        {
            value: 'Low',
            label: 'Low Impact',
            description: 'Limited adverse effect on operations, assets, or individuals',
            cia: { confidentiality: 'Low', integrity: 'Low', availability: 'Low' }
        },
        {
            value: 'Moderate',
            label: 'Moderate Impact',
            description: 'Serious adverse effect on operations, assets, or individuals',
            cia: { confidentiality: 'Moderate', integrity: 'Moderate', availability: 'Moderate' }
        },
        {
            value: 'High',
            label: 'High Impact',
            description: 'Severe or catastrophic adverse effect',
            cia: { confidentiality: 'High', integrity: 'High', availability: 'High' }
        }
    ];
    const complianceFrameworks = [
        {
            id: 'NIST-800-53',
            name: 'NIST 800-53',
            description: 'Security and Privacy Controls for Federal Information Systems',
            required: true
        },
        {
            id: 'FedRAMP',
            name: 'FedRAMP',
            description: 'Federal Risk and Authorization Management Program',
            required: false
        },
        {
            id: 'DISA-STIG',
            name: 'DISA STIGs',
            description: 'Defense Information Systems Agency Security Technical Implementation Guides',
            required: false
        },
        {
            id: 'SOC2',
            name: 'SOC 2',
            description: 'Service Organization Control 2',
            required: false
        },
        {
            id: 'ISO-27001',
            name: 'ISO 27001',
            description: 'Information Security Management Systems',
            required: false
        }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Security & Compliance Configuration" })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-muted-foreground", children: "Configure your organization's security classification, compliance frameworks, and monitoring settings." }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "NIST 800-53 Revision" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Select the NIST 800-53 revision your organization will follow for security controls." }), _jsx(RadioGroup, { value: configData.nistRevision, onValueChange: (value) => handleConfigChange('nistRevision', value), className: "space-y-4", children: nistRevisions.map((revision) => (_jsxs("div", { className: "flex items-start space-x-3 p-4 border rounded-lg", children: [_jsx(RadioGroupItem, { value: revision.value, id: revision.value, className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Label, { htmlFor: revision.value, className: "font-medium cursor-pointer", children: revision.label }), _jsx(Badge, { variant: revision.status === 'current' ? 'default' :
                                                                revision.status === 'latest' ? 'secondary' : 'outline', children: revision.status === 'current' ? 'Recommended' :
                                                                revision.status === 'latest' ? 'Latest' : 'Legacy' })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: revision.description })] })] }, revision.value))) }), configData.nistRevision === 'Rev6' && (_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "NIST 800-53 Rev 6 includes enhanced privacy controls and updated security controls. Consider Rev 5 if your organization requires more mature tooling support." })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Lock, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Security Classification" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Select the highest level of information classification your organization will handle." }), _jsx(RadioGroup, { value: configData.securityClassification, onValueChange: (value) => handleConfigChange('securityClassification', value), className: "space-y-4", children: securityClassifications.map((classification) => (_jsxs("div", { className: "flex items-start space-x-3 p-4 border rounded-lg", children: [_jsx(RadioGroupItem, { value: classification.value, id: classification.value, className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Label, { htmlFor: classification.value, className: "font-medium cursor-pointer", children: classification.label }), _jsx(Badge, { className: classification.color, children: classification.value })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: classification.description })] })] }, classification.value))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "FISMA Impact Level" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Determine the potential impact of a security breach on your organization's operations." }), _jsx(RadioGroup, { value: configData.impactLevel, onValueChange: (value) => handleConfigChange('impactLevel', value), className: "space-y-4", children: impactLevels.map((level) => (_jsxs("div", { className: "flex items-start space-x-3 p-4 border rounded-lg", children: [_jsx(RadioGroupItem, { value: level.value, id: level.value, className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "flex items-center space-x-2", children: _jsx(Label, { htmlFor: level.value, className: "font-medium cursor-pointer", children: level.label }) }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: level.description }), _jsxs("div", { className: "flex space-x-4 text-xs", children: [_jsxs("span", { children: ["Confidentiality: ", _jsx("strong", { children: level.cia.confidentiality })] }), _jsxs("span", { children: ["Integrity: ", _jsx("strong", { children: level.cia.integrity })] }), _jsxs("span", { children: ["Availability: ", _jsx("strong", { children: level.cia.availability })] })] })] })] }, level.value))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Frameworks" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Select additional compliance frameworks your organization must adhere to." }), _jsx("div", { className: "space-y-3", children: complianceFrameworks.map((framework) => (_jsxs("div", { className: "flex items-start space-x-3 p-3 border rounded-lg", children: [_jsx("input", { type: "checkbox", id: framework.id, checked: configData.complianceFrameworks.includes(framework.id), onChange: (e) => handleFrameworkToggle(framework.id, e.target.checked), disabled: framework.required, className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Label, { htmlFor: framework.id, className: "font-medium cursor-pointer", children: framework.name }), framework.required && (_jsx(Badge, { variant: "secondary", children: "Required" }))] }), _jsx("p", { className: "text-sm text-muted-foreground", children: framework.description })] })] }, framework.id))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Monitoring & Reporting Settings" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Audit Trail" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Track all user actions and system changes" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: configData.enableAuditTrail, onChange: (e) => handleConfigChange('enableAuditTrail', e.target.checked) }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Continuous Monitoring" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Real-time security control monitoring" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: configData.enableContinuousMonitoring, onChange: (e) => handleConfigChange('enableContinuousMonitoring', e.target.checked) }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Automated Reporting" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Generate compliance reports automatically" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: configData.enableAutomatedReporting, onChange: (e) => handleConfigChange('enableAutomatedReporting', e.target.checked) }), _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "dataRetention", children: "Data Retention Period" }), _jsxs(Select, { value: configData.dataRetentionPeriod.toString(), onValueChange: (value) => handleConfigChange('dataRetentionPeriod', parseInt(value)), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select data retention period" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1095", children: "3 years (1,095 days)" }), _jsx(SelectItem, { value: "1826", children: "5 years (1,826 days)" }), _jsx(SelectItem, { value: "2555", children: "7 years (2,555 days) - Recommended" }), _jsx(SelectItem, { value: "3653", children: "10 years (3,653 days)" })] })] })] })] })] }), _jsxs(Card, { className: "border-primary/20 bg-primary/5", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Configuration Summary" }) }), _jsx(CardContent, { className: "space-y-3", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "NIST Revision:" }), _jsx("p", { className: "text-sm text-muted-foreground", children: configData.nistRevision })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Security Classification:" }), _jsx("p", { className: "text-sm text-muted-foreground", children: configData.securityClassification })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Impact Level:" }), _jsx("p", { className: "text-sm text-muted-foreground", children: configData.impactLevel })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Frameworks:" }), _jsx("p", { className: "text-sm text-muted-foreground", children: configData.complianceFrameworks.join(', ') })] })] }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsxs(Button, { variant: "outline", onClick: () => onComplete(stepData.id, configData), disabled: isSaving || isProcessing, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save for Later"] }), _jsx(Button, { onClick: handleSaveAndContinue, disabled: isSaving || isProcessing, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Saving..."] })) : (_jsxs(_Fragment, { children: ["Save & Continue", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })) })] }) }) })] }));
};
