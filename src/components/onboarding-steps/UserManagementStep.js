import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * User Management Step Component
 * Optional step to invite additional users and configure roles
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Shield, Plus, Trash2, Info, ArrowRight, SkipForward, UserPlus } from 'lucide-react';
export const UserManagementStep = ({ onComplete, onNext, onSkip, stepData, isProcessing }) => {
    const [invitations, setInvitations] = useState([]);
    const [currentInvitation, setCurrentInvitation] = useState({
        email: '',
        roles: [],
        department: '',
        title: ''
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const availableRoles = [
        {
            value: 'SystemAdmin',
            label: 'System Administrator',
            description: 'Full system access and configuration management',
            level: 'admin'
        },
        {
            value: 'SecurityAnalyst',
            label: 'Security Analyst',
            description: 'Security monitoring, analysis, and incident response',
            level: 'operational'
        },
        {
            value: 'ComplianceOfficer',
            label: 'Compliance Officer',
            description: 'Compliance monitoring, reporting, and audit coordination',
            level: 'operational'
        },
        {
            value: 'AuthorizingOfficial',
            label: 'Authorizing Official (AO)',
            description: 'Authority to make risk-based security decisions',
            level: 'admin'
        },
        {
            value: 'Auditor',
            label: 'Security Auditor',
            description: 'Read-only audit access and compliance verification',
            level: 'analytical'
        },
        {
            value: 'Viewer',
            label: 'Report Viewer',
            description: 'Basic read-only access to dashboards and reports',
            level: 'analytical'
        }
    ];
    const commonDepartments = [
        'Information Technology',
        'Information Security',
        'Compliance',
        'Risk Management',
        'Operations',
        'Audit',
        'Legal',
        'Executive',
        'Other'
    ];
    const handleInputChange = (field, value) => {
        setCurrentInvitation(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const handleRoleToggle = (role, checked) => {
        if (checked) {
            setCurrentInvitation(prev => ({
                ...prev,
                roles: [...prev.roles, role]
            }));
        }
        else {
            setCurrentInvitation(prev => ({
                ...prev,
                roles: prev.roles.filter(r => r !== role)
            }));
        }
    };
    const validateInvitation = () => {
        const newErrors = {};
        if (!currentInvitation.email.trim()) {
            newErrors.email = 'Email address is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentInvitation.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        else if (invitations.some(inv => inv.email.toLowerCase() === currentInvitation.email.toLowerCase())) {
            newErrors.email = 'This email address has already been invited';
        }
        if (currentInvitation.roles.length === 0) {
            newErrors.roles = 'At least one role must be selected';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleAddInvitation = () => {
        if (!validateInvitation()) {
            return;
        }
        setInvitations(prev => [...prev, { ...currentInvitation }]);
        // Reset form
        setCurrentInvitation({
            email: '',
            roles: [],
            department: '',
            title: ''
        });
        setErrors({});
    };
    const handleRemoveInvitation = (index) => {
        setInvitations(prev => prev.filter((_, i) => i !== index));
    };
    const handleSaveAndContinue = async () => {
        // Add current invitation if valid
        if (currentInvitation.email && validateInvitation()) {
            handleAddInvitation();
        }
        try {
            setIsSaving(true);
            // Save user invitations data
            const allInvitations = [...invitations];
            if (currentInvitation.email && currentInvitation.roles.length > 0) {
                allInvitations.push(currentInvitation);
            }
            onComplete(stepData.id, allInvitations);
            onNext();
        }
        catch (error) {
            console.error('Error saving user invitations:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleSkipStep = () => {
        if (onSkip) {
            onSkip();
        }
    };
    const getRoleBadgeColor = (level) => {
        switch (level) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'operational': return 'bg-blue-100 text-blue-800';
            case 'analytical': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Users, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "User Management & Invitations" }), _jsx(Badge, { variant: "outline", children: "Optional" })] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "Invite team members to your organization and assign appropriate roles. You can invite users now or skip this step and add them later from the settings page." }), _jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "As the first user, you automatically have System Administrator privileges. You can invite additional administrators and assign specific roles based on job functions." })] })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg text-blue-900", children: "Available Roles" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: availableRoles.map((role) => (_jsxs("div", { className: "flex items-start space-x-3 p-3 bg-white rounded-lg border", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "font-medium text-blue-900", children: role.label }), _jsx(Badge, { className: getRoleBadgeColor(role.level), children: role.level })] }), _jsx("p", { className: "text-sm text-blue-700", children: role.description })] })] }, role.value))) }) })] }), invitations.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg", children: ["Pending Invitations (", invitations.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: invitations.map((invitation, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg bg-green-50", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Mail, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: invitation.email }), _jsx("div", { className: "flex items-center space-x-2 mt-1", children: invitation.roles.map((role) => {
                                                            const roleInfo = availableRoles.find(r => r.value === role);
                                                            return (_jsx(Badge, { variant: "secondary", className: "text-xs", children: roleInfo?.label || role }, role));
                                                        }) }), invitation.department && (_jsxs("p", { className: "text-sm text-muted-foreground", children: [invitation.title && `${invitation.title}, `, invitation.department] }))] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemoveInvitation(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))) }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(UserPlus, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Invite New User" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email Address *" }), _jsx(Input, { id: "email", type: "email", value: currentInvitation.email, onChange: (e) => handleInputChange('email', e.target.value), placeholder: "user@organization.gov", className: errors.email ? 'border-red-500' : '' }), errors.email && (_jsx("p", { className: "text-sm text-red-600", children: errors.email }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "title", children: "Job Title" }), _jsx(Input, { id: "title", value: currentInvitation.title, onChange: (e) => handleInputChange('title', e.target.value), placeholder: "e.g., Senior Security Analyst" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsxs(Select, { value: currentInvitation.department, onValueChange: (value) => handleInputChange('department', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select department" }) }), _jsx(SelectContent, { children: commonDepartments.map((dept) => (_jsx(SelectItem, { value: dept, children: dept }, dept))) })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Assign Roles *" }), errors.roles && (_jsx("p", { className: "text-sm text-red-600", children: errors.roles }))] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: availableRoles.map((role) => (_jsxs("div", { className: "flex items-start space-x-3 p-3 border rounded-lg", children: [_jsx("input", { type: "checkbox", id: `role-${role.value}`, checked: currentInvitation.roles.includes(role.value), onChange: (e) => handleRoleToggle(role.value, e.target.checked), className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Label, { htmlFor: `role-${role.value}`, className: "font-medium cursor-pointer", children: role.label }), _jsx(Badge, { className: getRoleBadgeColor(role.level), children: role.level })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: role.description })] })] }, role.value))) })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleAddInvitation, disabled: !currentInvitation.email || currentInvitation.roles.length === 0, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Invitation"] }) })] })] }), _jsx(Card, { className: "border-amber-200 bg-amber-50", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-amber-800 mb-2", children: "User Management Best Practices" }), _jsxs("div", { className: "space-y-2 text-sm text-amber-700", children: [_jsx("p", { children: "\u2022 Follow the principle of least privilege - assign only necessary roles" }), _jsx("p", { children: "\u2022 Regularly review user access and remove inactive users" }), _jsx("p", { children: "\u2022 Use department-specific roles when possible for better organization" }), _jsx("p", { children: "\u2022 Consider role inheritance for users with multiple responsibilities" }), _jsx("p", { children: "\u2022 Maintain an audit trail of role assignments and changes" })] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex justify-between", children: [_jsxs(Button, { variant: "ghost", onClick: handleSkipStep, disabled: isSaving || isProcessing, children: [_jsx(SkipForward, { className: "h-4 w-4 mr-2" }), "Skip User Setup"] }), _jsxs("div", { className: "space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => onComplete(stepData.id, invitations), disabled: isSaving || isProcessing, children: "Save for Later" }), _jsx(Button, { onClick: handleSaveAndContinue, disabled: isSaving || isProcessing, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Saving..."] })) : (_jsxs(_Fragment, { children: ["Continue", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })) })] })] }) }) })] }));
};
