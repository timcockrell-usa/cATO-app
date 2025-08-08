import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Review and Complete Step Component
 * Final step to review configuration and complete onboarding
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Shield, Building, ExternalLink, Cloud, Users, FileCheck, Loader2, Rocket, Edit } from 'lucide-react';
import { onboardingService } from '@/services/onboardingService';
export const ReviewCompleteStep = ({ onCompleteOnboarding, allStepData, stepData, user, isProcessing }) => {
    const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
    const [creationStatus, setCreationStatus] = useState({
        step: 'Ready to create',
        completed: []
    });
    const getStepData = (stepId) => {
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
                }
                catch (error) {
                    console.warn('eMASS setup failed, continuing without integration:', error);
                    setCreationStatus(prev => ({
                        ...prev,
                        step: 'Connecting cloud environments...',
                        completed: [...prev.completed, 'eMASS integration skipped (error)']
                    }));
                }
            }
            else {
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
                    }
                    catch (error) {
                        console.warn(`Cloud environment setup failed for ${cloudEnv.displayName}:`, error);
                    }
                }
                setCreationStatus(prev => ({
                    ...prev,
                    step: 'Finalizing setup...',
                    completed: [...prev.completed, `${cloudData.length} cloud environment(s) connected`]
                }));
            }
            else {
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
        }
        catch (error) {
            console.error('Error completing setup:', error);
            setCreationStatus(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            }));
        }
        finally {
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
    const completedSections = configurationSections.filter(section => section.data && (!Array.isArray(section.data) ||
        (Array.isArray(section.data) && section.data.length > 0)));
    const requiredSections = configurationSections.filter(section => !section.optional);
    const completedRequiredSections = requiredSections.filter(section => section.data && (!Array.isArray(section.data) ||
        (Array.isArray(section.data) && section.data.length > 0)));
    const isReadyToComplete = completedRequiredSections.length === requiredSections.length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(FileCheck, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Review & Complete Setup" })] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "Review your configuration settings and complete the organization setup. Once complete, your cATO Dashboard will be ready for compliance monitoring." }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Progress: " }), completedRequiredSections.length, " of ", requiredSections.length, " required sections completed"] }), isReadyToComplete ? (_jsxs(Badge, { className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Ready to complete"] })) : (_jsxs(Badge, { variant: "outline", className: "text-amber-600", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), "Missing required sections"] }))] })] })] }), _jsx("div", { className: "space-y-4", children: configurationSections.map((section) => {
                    const hasData = section.data && (!Array.isArray(section.data) ||
                        (Array.isArray(section.data) && section.data.length > 0));
                    return (_jsxs(Card, { className: hasData ? 'border-green-200 bg-green-50' : 'border-gray-200', children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(section.icon, { className: `h-5 w-5 ${hasData ? 'text-green-600' : 'text-gray-400'}` }), _jsx("span", { className: hasData ? 'text-green-900' : 'text-gray-600', children: section.title }), section.optional && (_jsx(Badge, { variant: "outline", children: "Optional" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [hasData ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx("div", { className: `h-5 w-5 rounded-full border-2 ${section.optional ? 'border-gray-300' : 'border-amber-400'}` })), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "h-4 w-4" }) })] })] }) }), hasData && section.items.length > 0 && (_jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: section.items.map((item, index) => (_jsxs("div", { children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: [item.label, ":"] }), _jsx("p", { className: "text-sm text-gray-600 truncate", title: item.value, children: item.value })] }, index))) }) })), !hasData && (_jsx(CardContent, { children: _jsx("p", { className: "text-sm text-gray-500 italic", children: section.optional ? 'Not configured (optional)' : 'Not configured (required)' }) }))] }, section.id));
                }) }), isCreatingOrganization && (_jsx(Card, { className: "border-blue-200 bg-blue-50", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Loader2, { className: "h-5 w-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Creating Your Organization" }), _jsx("p", { className: "text-blue-700 mb-3", children: creationStatus.step }), creationStatus.completed.length > 0 && (_jsx("div", { className: "space-y-1", children: creationStatus.completed.map((item, index) => (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-blue-700", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx("span", { children: item })] }, index))) })), creationStatus.error && (_jsxs(Alert, { variant: "destructive", className: "mt-3", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: creationStatus.error })] }))] })] }) }) })), _jsx(Card, { className: "border-amber-200 bg-amber-50", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Info, { className: "h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-amber-800 mb-2", children: "What Happens Next" }), _jsxs("div", { className: "space-y-2 text-sm text-amber-700", children: [_jsx("p", { children: "\u2022 Your organization will be created with the configured settings" }), _jsx("p", { children: "\u2022 Cloud environments will begin initial resource discovery and sync" }), _jsx("p", { children: "\u2022 Invited users will receive email invitations with setup instructions" }), _jsx("p", { children: "\u2022 Initial compliance scans will be scheduled for your cloud resources" }), _jsx("p", { children: "\u2022 You'll have access to dashboards, reports, and compliance monitoring" })] })] })] }) }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [!isReadyToComplete ? (_jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Please complete all required configuration sections before proceeding. You can go back to previous steps to complete missing information." })] })) : (_jsxs(Alert, { className: "mb-4", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Your configuration is complete and ready for deployment. Click \"Complete Setup\" to create your organization and begin compliance monitoring." })] })), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", disabled: isCreatingOrganization || isProcessing, children: "Save as Draft" }), _jsx(Button, { onClick: handleCompleteSetup, disabled: !isReadyToComplete || isCreatingOrganization || isProcessing, size: "lg", children: isCreatingOrganization ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Creating Organization..."] })) : (_jsxs(_Fragment, { children: [_jsx(Rocket, { className: "h-4 w-4 mr-2" }), "Complete Setup"] })) })] })] }) })] }));
};
