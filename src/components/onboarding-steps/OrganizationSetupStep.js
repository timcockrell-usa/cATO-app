import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Organization Setup Step Component
 * Collects basic organization information and contact details
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, MapPin, User, Shield, AlertTriangle, Save, ArrowRight } from 'lucide-react';
export const OrganizationSetupStep = ({ onComplete, onNext, stepData, isProcessing }) => {
    const [formData, setFormData] = useState({
        // Basic Organization Info
        legalName: '',
        commonName: '',
        organizationType: '',
        cageCode: '',
        dunsNumber: '',
        // Contact Information
        primaryAddress: '',
        mailingAddress: '',
        primaryPhone: '',
        emergencyContact: '',
        // Authorizing Official
        aoName: '',
        aoTitle: '',
        aoEmail: '',
        aoPhone: '',
        aoSecurityClearance: '',
        // ISSM Information
        issmName: '',
        issmTitle: '',
        issmEmail: '',
        issmPhone: '',
        // Technical Configuration
        tier: 'Standard',
        nistRevision: 'Rev5',
        securityClassification: 'CUI',
        impactLevel: 'Moderate'
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        // Required fields
        if (!formData.legalName.trim())
            newErrors.legalName = 'Legal name is required';
        if (!formData.commonName.trim())
            newErrors.commonName = 'Common name is required';
        if (!formData.organizationType.trim())
            newErrors.organizationType = 'Organization type is required';
        if (!formData.primaryAddress.trim())
            newErrors.primaryAddress = 'Primary address is required';
        if (!formData.primaryPhone.trim())
            newErrors.primaryPhone = 'Primary phone is required';
        // AO Information
        if (!formData.aoName.trim())
            newErrors.aoName = 'Authorizing Official name is required';
        if (!formData.aoTitle.trim())
            newErrors.aoTitle = 'AO title is required';
        if (!formData.aoEmail.trim())
            newErrors.aoEmail = 'AO email is required';
        if (!formData.aoPhone.trim())
            newErrors.aoPhone = 'AO phone is required';
        // ISSM Information
        if (!formData.issmName.trim())
            newErrors.issmName = 'ISSM name is required';
        if (!formData.issmTitle.trim())
            newErrors.issmTitle = 'ISSM title is required';
        if (!formData.issmEmail.trim())
            newErrors.issmEmail = 'ISSM email is required';
        if (!formData.issmPhone.trim())
            newErrors.issmPhone = 'ISSM phone is required';
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.aoEmail && !emailRegex.test(formData.aoEmail)) {
            newErrors.aoEmail = 'Please enter a valid email address';
        }
        if (formData.issmEmail && !emailRegex.test(formData.issmEmail)) {
            newErrors.issmEmail = 'Please enter a valid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSaveAndContinue = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            setIsSaving(true);
            // Save the form data
            onComplete(stepData.id, formData);
            // Move to next step
            onNext();
        }
        catch (error) {
            console.error('Error saving organization data:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const organizationTypes = [
        'Federal Agency - Department',
        'Federal Agency - Independent',
        'Military Service',
        'Defense Agency',
        'Intelligence Community',
        'State Government',
        'Local Government',
        'Private Contractor',
        'Educational Institution',
        'Non-Profit Organization',
        'Other'
    ];
    const securityClearances = [
        'None',
        'Public Trust',
        'Confidential',
        'Secret',
        'Top Secret',
        'Top Secret/SCI'
    ];
    const organizationTiers = [
        {
            value: 'Basic',
            label: 'Basic',
            description: 'Up to 10 users, basic compliance features'
        },
        {
            value: 'Standard',
            label: 'Standard',
            description: 'Up to 50 users, advanced reporting, compliance alerts'
        },
        {
            value: 'Enterprise',
            label: 'Enterprise',
            description: 'Up to 500 users, API access, risk assessment'
        },
        {
            value: 'Government',
            label: 'Government',
            description: 'Unlimited users, full feature set, eMASS integration'
        }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Building2, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Organization Information" })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-muted-foreground", children: "Please provide your organization's official information. This will be used for compliance reporting and system identification." }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Basic Information" }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "legalName", children: "Legal Organization Name *" }), _jsx(Input, { id: "legalName", value: formData.legalName, onChange: (e) => handleInputChange('legalName', e.target.value), placeholder: "e.g., Department of Defense", className: errors.legalName ? 'border-red-500' : '' }), errors.legalName && (_jsx("p", { className: "text-sm text-red-600", children: errors.legalName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "commonName", children: "Common Name *" }), _jsx(Input, { id: "commonName", value: formData.commonName, onChange: (e) => handleInputChange('commonName', e.target.value), placeholder: "e.g., DoD", className: errors.commonName ? 'border-red-500' : '' }), errors.commonName && (_jsx("p", { className: "text-sm text-red-600", children: errors.commonName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "organizationType", children: "Organization Type *" }), _jsxs(Select, { value: formData.organizationType, onValueChange: (value) => handleInputChange('organizationType', value), children: [_jsx(SelectTrigger, { className: errors.organizationType ? 'border-red-500' : '', children: _jsx(SelectValue, { placeholder: "Select organization type" }) }), _jsx(SelectContent, { children: organizationTypes.map((type) => (_jsx(SelectItem, { value: type, children: type }, type))) })] }), errors.organizationType && (_jsx("p", { className: "text-sm text-red-600", children: errors.organizationType }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "tier", children: "Service Tier *" }), _jsxs(Select, { value: formData.tier, onValueChange: (value) => handleInputChange('tier', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select service tier" }) }), _jsx(SelectContent, { children: organizationTiers.map((tier) => (_jsx(SelectItem, { value: tier.value, children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: tier.label }), _jsx("div", { className: "text-sm text-muted-foreground", children: tier.description })] }) }, tier.value))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "cageCode", children: "CAGE Code" }), _jsx(Input, { id: "cageCode", value: formData.cageCode, onChange: (e) => handleInputChange('cageCode', e.target.value), placeholder: "e.g., 1XYZ9" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "dunsNumber", children: "DUNS Number" }), _jsx(Input, { id: "dunsNumber", value: formData.dunsNumber, onChange: (e) => handleInputChange('dunsNumber', e.target.value), placeholder: "e.g., 123456789" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(MapPin, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Contact Information" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "primaryAddress", children: "Primary Address *" }), _jsx(Textarea, { id: "primaryAddress", value: formData.primaryAddress, onChange: (e) => handleInputChange('primaryAddress', e.target.value), placeholder: "Enter full address including city, state, and ZIP code", className: errors.primaryAddress ? 'border-red-500' : '' }), errors.primaryAddress && (_jsx("p", { className: "text-sm text-red-600", children: errors.primaryAddress }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mailingAddress", children: "Mailing Address (if different)" }), _jsx(Textarea, { id: "mailingAddress", value: formData.mailingAddress, onChange: (e) => handleInputChange('mailingAddress', e.target.value), placeholder: "Enter mailing address if different from primary" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "primaryPhone", children: "Primary Phone *" }), _jsx(Input, { id: "primaryPhone", type: "tel", value: formData.primaryPhone, onChange: (e) => handleInputChange('primaryPhone', e.target.value), placeholder: "+1-555-123-4567", className: errors.primaryPhone ? 'border-red-500' : '' }), errors.primaryPhone && (_jsx("p", { className: "text-sm text-red-600", children: errors.primaryPhone }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "emergencyContact", children: "Emergency Contact" }), _jsx(Input, { id: "emergencyContact", type: "tel", value: formData.emergencyContact, onChange: (e) => handleInputChange('emergencyContact', e.target.value), placeholder: "+1-555-987-6543" })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Authorizing Official (AO)" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "The Authorizing Official has the authority to make risk-based decisions and formally accept security risks for the organization." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aoName", children: "Full Name *" }), _jsx(Input, { id: "aoName", value: formData.aoName, onChange: (e) => handleInputChange('aoName', e.target.value), placeholder: "Jane Smith", className: errors.aoName ? 'border-red-500' : '' }), errors.aoName && (_jsx("p", { className: "text-sm text-red-600", children: errors.aoName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aoTitle", children: "Title *" }), _jsx(Input, { id: "aoTitle", value: formData.aoTitle, onChange: (e) => handleInputChange('aoTitle', e.target.value), placeholder: "Chief Information Officer", className: errors.aoTitle ? 'border-red-500' : '' }), errors.aoTitle && (_jsx("p", { className: "text-sm text-red-600", children: errors.aoTitle }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aoEmail", children: "Email Address *" }), _jsx(Input, { id: "aoEmail", type: "email", value: formData.aoEmail, onChange: (e) => handleInputChange('aoEmail', e.target.value), placeholder: "jane.smith@organization.gov", className: errors.aoEmail ? 'border-red-500' : '' }), errors.aoEmail && (_jsx("p", { className: "text-sm text-red-600", children: errors.aoEmail }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "aoPhone", children: "Phone Number *" }), _jsx(Input, { id: "aoPhone", type: "tel", value: formData.aoPhone, onChange: (e) => handleInputChange('aoPhone', e.target.value), placeholder: "+1-555-123-4567", className: errors.aoPhone ? 'border-red-500' : '' }), errors.aoPhone && (_jsx("p", { className: "text-sm text-red-600", children: errors.aoPhone }))] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "aoSecurityClearance", children: "Security Clearance" }), _jsxs(Select, { value: formData.aoSecurityClearance, onValueChange: (value) => handleInputChange('aoSecurityClearance', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select security clearance level" }) }), _jsx(SelectContent, { children: securityClearances.map((clearance) => (_jsx(SelectItem, { value: clearance, children: clearance }, clearance))) })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Information System Security Manager (ISSM)" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "The ISSM is responsible for the day-to-day security operations and technical oversight of the information system." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issmName", children: "Full Name *" }), _jsx(Input, { id: "issmName", value: formData.issmName, onChange: (e) => handleInputChange('issmName', e.target.value), placeholder: "John Doe", className: errors.issmName ? 'border-red-500' : '' }), errors.issmName && (_jsx("p", { className: "text-sm text-red-600", children: errors.issmName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issmTitle", children: "Title *" }), _jsx(Input, { id: "issmTitle", value: formData.issmTitle, onChange: (e) => handleInputChange('issmTitle', e.target.value), placeholder: "Senior Security Engineer", className: errors.issmTitle ? 'border-red-500' : '' }), errors.issmTitle && (_jsx("p", { className: "text-sm text-red-600", children: errors.issmTitle }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issmEmail", children: "Email Address *" }), _jsx(Input, { id: "issmEmail", type: "email", value: formData.issmEmail, onChange: (e) => handleInputChange('issmEmail', e.target.value), placeholder: "john.doe@organization.gov", className: errors.issmEmail ? 'border-red-500' : '' }), errors.issmEmail && (_jsx("p", { className: "text-sm text-red-600", children: errors.issmEmail }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issmPhone", children: "Phone Number *" }), _jsx(Input, { id: "issmPhone", type: "tel", value: formData.issmPhone, onChange: (e) => handleInputChange('issmPhone', e.target.value), placeholder: "+1-555-987-6543", className: errors.issmPhone ? 'border-red-500' : '' }), errors.issmPhone && (_jsx("p", { className: "text-sm text-red-600", children: errors.issmPhone }))] })] })] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsxs(Button, { variant: "outline", onClick: () => onComplete(stepData.id, formData), disabled: isSaving || isProcessing, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save for Later"] }), _jsx(Button, { onClick: handleSaveAndContinue, disabled: isSaving || isProcessing, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Saving..."] })) : (_jsxs(_Fragment, { children: ["Save & Continue", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })) })] }) }) })] }));
};
