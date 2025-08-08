import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Framework Upgrade Page
 * Manages NIST 800-53 revision upgrades and gap analysis
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { ArrowUpCircle, BarChart3, AlertTriangle, Clock, Download, RefreshCw, TrendingUp, Shield, AlertCircle, Info, Settings, CheckCircle2, Upload, ExternalLink } from 'lucide-react';
import nistRevisionService from '../services/nistRevisionService';
const FrameworkUpgrade = () => {
    const { user } = useAuth();
    // Derive tenant ID from user's email domain or use default
    const getTenantId = () => {
        if (user?.email) {
            // Extract organization from email domain (e.g., user@company.mil -> company.mil)
            const domain = user.email.split('@')[1];
            return domain || 'default-tenant';
        }
        return 'default-tenant';
    };
    const [currentRevision, setCurrentRevision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gapAnalysis, setGapAnalysis] = useState(null);
    const [upgradeInProgress, setUpgradeInProgress] = useState(false);
    const [selectedTargetRevision, setSelectedTargetRevision] = useState(null);
    const [pendingUpgrade, setPendingUpgrade] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showEmassImport, setShowEmassImport] = useState(false);
    // Available revisions (future-proof for Rev 6)
    const availableRevisions = [
        { value: 'Rev4', label: 'NIST 800-53 Rev 4', status: 'Legacy', recommended: false },
        { value: 'Rev5', label: 'NIST 800-53 Rev 5', status: 'Current', recommended: true },
        { value: 'Rev6', label: 'NIST 800-53 Rev 6', status: 'Future', recommended: false, disabled: true }
    ];
    useEffect(() => {
        loadCurrentRevision();
    }, [user]);
    const loadCurrentRevision = async () => {
        try {
            const response = await nistRevisionService.getCurrentRevision(getTenantId());
            if (response.success) {
                setCurrentRevision(response.data.currentRevision);
                // Only auto-suggest if no pending upgrade
                if (!pendingUpgrade) {
                    // Auto-suggest next available revision as target
                    const currentRev = response.data.currentRevision;
                    const targetRev = currentRev === 'Rev4' ? 'Rev5' :
                        currentRev === 'Rev5' ? 'Rev6' : 'Rev4';
                    setSelectedTargetRevision(targetRev);
                }
            }
        }
        catch (error) {
            console.error('Error loading current revision:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const performGapAnalysis = async (targetRevision) => {
        try {
            setLoading(true);
            // Only perform gap analysis for available revisions
            if (targetRevision === 'Rev6') {
                // Simulate Rev6 gap analysis
                const mockGapAnalysis = {
                    success: true,
                    gapAnalysis: {
                        analysisDate: new Date().toISOString(),
                        totalCurrentControls: 450,
                        totalTargetControls: 500,
                        mappings: {
                            unchanged: Array(380).fill(null).map((_, i) => ({ sourceControlId: `AC-${i + 1}` })),
                            modified: Array(45).fill(null).map((_, i) => ({
                                sourceControlId: `SC-${i + 1}`,
                                changeSummary: 'Enhanced requirements for emerging threats',
                                implementationImpact: 'medium'
                            })),
                            newControls: Array(25).fill(null).map((_, i) => ({
                                targetControlId: `AI-${i + 1}`,
                                changeSummary: 'New AI/ML security controls',
                                implementationImpact: 'high'
                            })),
                            withdrawnControls: []
                        },
                        impactAssessment: {
                            lowImpact: 380,
                            mediumImpact: 45,
                            highImpact: 25,
                            estimatedEffortHours: 280,
                            priorityControls: ['AI-1', 'AI-2', 'SC-7']
                        },
                        compliancePrediction: {
                            likelyCompliant: 380,
                            requiresReview: 45,
                            likelyNonCompliant: 25,
                            notAssessed: 50
                        }
                    },
                    recommendedActions: {
                        immediate: ['Review AI/ML control requirements', 'Assess current AI implementations'],
                        shortTerm: ['Implement new AI security controls', 'Update supply chain controls'],
                        longTerm: ['Full AI governance framework', 'Enhanced monitoring systems']
                    },
                    estimatedMigrationTime: {
                        optimisticHours: 200,
                        realisticHours: 280,
                        pessimisticHours: 400
                    }
                };
                setGapAnalysis(mockGapAnalysis);
            }
            else {
                const analysis = await nistRevisionService.performGapAnalysis(getTenantId(), targetRevision);
                setGapAnalysis(analysis);
            }
        }
        catch (error) {
            console.error('Error performing gap analysis:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const stageUpgrade = async () => {
        if (!selectedTargetRevision)
            return;
        try {
            setUpgradeInProgress(true);
            const response = await nistRevisionService.stageUpgrade(getTenantId(), selectedTargetRevision, 'current-user' // Would be actual user ID
            );
            if (response.success) {
                setPendingUpgrade({
                    targetRevision: selectedTargetRevision,
                    upgradeId: response.data.stageId,
                    gapAnalysis: gapAnalysis
                });
                alert('Upgrade staged successfully! Review the gap analysis and click Finalize when ready.');
            }
        }
        catch (error) {
            console.error('Error staging upgrade:', error);
        }
        finally {
            setUpgradeInProgress(false);
        }
    };
    const finalizeUpgrade = async () => {
        if (!pendingUpgrade)
            return;
        try {
            setUpgradeInProgress(true);
            const response = await nistRevisionService.finalizeUpgrade(getTenantId(), pendingUpgrade.upgradeId, 'current-user');
            if (response.success) {
                alert(`Framework successfully upgraded to ${response.data.newRevision}!`);
                setPendingUpgrade(null);
                setGapAnalysis(null);
                await loadCurrentRevision();
            }
        }
        catch (error) {
            console.error('Error finalizing upgrade:', error);
        }
        finally {
            setUpgradeInProgress(false);
        }
    };
    const importFromEmass = async (systemId, apiKey) => {
        try {
            setLoading(true);
            const response = await nistRevisionService.importFromEmass(getTenantId(), systemId, apiKey);
            if (response.success) {
                alert(`Successfully imported ${response.data.controlsImported} controls from eMASS. Detected ${response.data.detectedRevision}.`);
                await loadCurrentRevision();
            }
        }
        catch (error) {
            console.error('Error importing from eMASS:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getImpactColor = (impact) => {
        switch (impact) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'likely-compliant': return 'bg-green-100 text-green-800';
            case 'requires-review': return 'bg-yellow-100 text-yellow-800';
            case 'likely-noncompliant': return 'bg-red-100 text-red-800';
            case 'not-assessed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    if (loading && !gapAnalysis) {
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-blue-600" }) }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Framework Upgrade" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage NIST 800-53 revision transitions and analyze upgrade impacts" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Badge, { variant: "outline", className: "text-sm", children: ["Current: ", currentRevision] }), pendingUpgrade && (_jsxs(Badge, { variant: "secondary", className: "text-sm", children: ["Staged: ", pendingUpgrade.targetRevision] })), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowEmassImport(true), children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Import from eMASS"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5" }), "Target Revision Selection"] }), _jsx(CardDescription, { children: "Select the NIST 800-53 revision you want to upgrade to" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "target-revision", className: "text-sm font-medium", children: "Target Revision" }), _jsxs(Select, { value: selectedTargetRevision || '', onValueChange: (value) => {
                                                    setSelectedTargetRevision(value);
                                                    if (value && value !== currentRevision) {
                                                        performGapAnalysis(value);
                                                    }
                                                }, disabled: !!pendingUpgrade, children: [_jsx(SelectTrigger, { className: "w-64", children: _jsx(SelectValue, { placeholder: "Select target revision" }) }), _jsx(SelectContent, { children: availableRevisions.map((revision) => (_jsx(SelectItem, { value: revision.value, disabled: revision.disabled || revision.value === currentRevision, children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { children: revision.label }), _jsxs("div", { className: "flex items-center gap-2 ml-4", children: [_jsx(Badge, { variant: revision.status === 'Current' ? 'default' :
                                                                                    revision.status === 'Future' ? 'secondary' : 'outline', className: "text-xs", children: revision.status }), revision.recommended && (_jsx(Badge, { variant: "outline", className: "text-xs text-green-600", children: "Recommended" }))] })] }) }, revision.value))) })] })] }), selectedTargetRevision && selectedTargetRevision !== currentRevision && !pendingUpgrade && (_jsxs(Button, { onClick: () => performGapAnalysis(selectedTargetRevision), variant: "outline", disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Analyze Gap"] }))] }), selectedTargetRevision === 'Rev6' && (_jsxs(Alert, { className: "mt-4", children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Future Revision:" }), " NIST 800-53 Rev 6 is not yet published. This analysis shows projected changes based on draft requirements."] })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Framework Status"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: currentRevision }), _jsx("div", { className: "text-sm text-gray-600", children: "Current Revision" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: gapAnalysis?.gapAnalysis.totalCurrentControls || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Current Controls" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: selectedTargetRevision }), _jsx("div", { className: "text-sm text-gray-600", children: "Target Revision" })] })] }) })] }), gapAnalysis && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Gap Analysis: ", currentRevision, " \u2192 ", selectedTargetRevision] }), _jsxs(CardDescription, { children: ["Analysis completed on ", new Date(gapAnalysis.gapAnalysis.analysisDate).toLocaleDateString()] })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "controls", children: "Control Changes" }), _jsx(TabsTrigger, { value: "impact", children: "Impact Assessment" }), _jsx(TabsTrigger, { value: "timeline", children: "Timeline" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: gapAnalysis.gapAnalysis.mappings.unchanged.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Unchanged" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: gapAnalysis.gapAnalysis.mappings.modified.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Modified" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: gapAnalysis.gapAnalysis.mappings.newControls.length }), _jsx("div", { className: "text-sm text-gray-600", children: "New Controls" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: gapAnalysis.gapAnalysis.mappings.withdrawnControls.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Withdrawn" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Compliance Prediction" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Likely Compliant" }), _jsx(Badge, { className: getStatusColor('likely-compliant'), children: gapAnalysis.gapAnalysis.compliancePrediction.likelyCompliant })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Requires Review" }), _jsx(Badge, { className: getStatusColor('requires-review'), children: gapAnalysis.gapAnalysis.compliancePrediction.requiresReview })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Likely Non-Compliant" }), _jsx(Badge, { className: getStatusColor('likely-noncompliant'), children: gapAnalysis.gapAnalysis.compliancePrediction.likelyNonCompliant })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Not Assessed" }), _jsx(Badge, { className: getStatusColor('not-assessed'), children: gapAnalysis.gapAnalysis.compliancePrediction.notAssessed })] })] }) })] })] }), _jsx(TabsContent, { value: "controls", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [gapAnalysis.gapAnalysis.mappings.modified.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Modified Controls" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: [gapAnalysis.gapAnalysis.mappings.modified.slice(0, 10).map((mapping, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: mapping.sourceControlId }), _jsx("div", { className: "text-sm text-gray-600", children: mapping.changeSummary })] }), _jsxs(Badge, { className: getImpactColor(mapping.implementationImpact), children: [mapping.implementationImpact, " impact"] })] }, index))), gapAnalysis.gapAnalysis.mappings.modified.length > 10 && (_jsxs("div", { className: "text-center text-sm text-gray-600 pt-2", children: ["... and ", gapAnalysis.gapAnalysis.mappings.modified.length - 10, " more"] }))] }) })] })), gapAnalysis.gapAnalysis.mappings.newControls.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "New Controls" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: [gapAnalysis.gapAnalysis.mappings.newControls.slice(0, 10).map((mapping, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: mapping.targetControlId }), _jsx("div", { className: "text-sm text-gray-600", children: mapping.changeSummary })] }), _jsxs(Badge, { className: getImpactColor(mapping.implementationImpact), children: [mapping.implementationImpact, " impact"] })] }, index))), gapAnalysis.gapAnalysis.mappings.newControls.length > 10 && (_jsxs("div", { className: "text-center text-sm text-gray-600 pt-2", children: ["... and ", gapAnalysis.gapAnalysis.mappings.newControls.length - 10, " more"] }))] }) })] }))] }) }), _jsx(TabsContent, { value: "impact", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Implementation Impact" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: gapAnalysis.gapAnalysis.impactAssessment.lowImpact }), _jsx("div", { className: "text-sm text-gray-600", children: "Low Impact" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: gapAnalysis.gapAnalysis.impactAssessment.mediumImpact }), _jsx("div", { className: "text-sm text-gray-600", children: "Medium Impact" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: gapAnalysis.gapAnalysis.impactAssessment.highImpact }), _jsx("div", { className: "text-sm text-gray-600", children: "High Impact" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Estimated Total Effort" }), _jsxs(Badge, { variant: "outline", className: "text-lg px-3 py-1", children: [gapAnalysis.gapAnalysis.impactAssessment.estimatedEffortHours, " hours"] })] }), gapAnalysis.gapAnalysis.impactAssessment.priorityControls.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Priority Controls (High Impact)" }), _jsx("div", { className: "flex flex-wrap gap-2", children: gapAnalysis.gapAnalysis.impactAssessment.priorityControls.map((controlId, index) => (_jsx(Badge, { variant: "destructive", className: "text-xs", children: controlId }, index))) })] }))] })] })] }) }), _jsx(TabsContent, { value: "timeline", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Estimated Migration Timeline" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-xl font-bold text-green-600", children: [gapAnalysis.estimatedMigrationTime.optimisticHours, "h"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Optimistic" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-xl font-bold text-blue-600", children: [gapAnalysis.estimatedMigrationTime.realisticHours, "h"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Realistic" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-xl font-bold text-orange-600", children: [gapAnalysis.estimatedMigrationTime.pessimisticHours, "h"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Pessimistic" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Recommended Actions" }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-red-700 mb-2", children: "Immediate Actions" }), _jsx("ul", { className: "space-y-1", children: gapAnalysis.recommendedActions.immediate.map((action, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" }), action] }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-yellow-700 mb-2", children: "Short-term Actions" }), _jsx("ul", { className: "space-y-1", children: gapAnalysis.recommendedActions.shortTerm.map((action, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(Clock, { className: "h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" }), action] }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-blue-700 mb-2", children: "Long-term Actions" }), _jsx("ul", { className: "space-y-1", children: gapAnalysis.recommendedActions.longTerm.map((action, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }), action] }, index))) })] })] })] })] }) })] }) })] })), gapAnalysis && selectedTargetRevision && selectedTargetRevision !== currentRevision && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Upgrade Actions" }), _jsx(CardDescription, { children: pendingUpgrade
                                    ? 'Review the staged upgrade and finalize when ready.'
                                    : 'Review the gap analysis above before proceeding with the framework upgrade.' })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: !pendingUpgrade ? (_jsxs(_Fragment, { children: [_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Staging Process:" }), " Framework upgrades are staged for review before finalization. The upgrade will be prepared but not applied until you click \"Finalize Upgrade\"."] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs(Button, { onClick: () => selectedTargetRevision && performGapAnalysis(selectedTargetRevision), variant: "outline", disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh Analysis"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export Report"] }), _jsxs(Button, { onClick: stageUpgrade, disabled: upgradeInProgress || !gapAnalysis, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(ArrowUpCircle, { className: "h-4 w-4 mr-2" }), upgradeInProgress ? 'Staging...' : `Stage Upgrade to ${selectedTargetRevision}`] })] })] })) : (_jsxs(_Fragment, { children: [_jsxs(Alert, { children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Upgrade Staged:" }), " The upgrade to ", pendingUpgrade.targetRevision, " has been staged. Review the gap analysis above and click \"Finalize Upgrade\" to commit the changes."] })] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-yellow-800 mb-2", children: "\u26A0\uFE0F ISSM Review Required" }), _jsxs("p", { className: "text-sm text-yellow-700 mb-3", children: ["This upgrade affects ", gapAnalysis.gapAnalysis.totalCurrentControls, " controls. Information System Security Manager (ISSM) approval is required before finalization."] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "font-medium", children: "Impact Summary:" }), _jsxs(Badge, { variant: "outline", className: "text-green-700", children: [gapAnalysis.gapAnalysis.mappings.unchanged.length, " Unchanged"] }), _jsxs(Badge, { variant: "outline", className: "text-yellow-700", children: [gapAnalysis.gapAnalysis.mappings.modified.length, " Modified"] }), _jsxs(Badge, { variant: "outline", className: "text-blue-700", children: [gapAnalysis.gapAnalysis.mappings.newControls.length, " New"] })] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs(Button, { onClick: () => {
                                                    setPendingUpgrade(null);
                                                    setGapAnalysis(null);
                                                }, variant: "outline", disabled: upgradeInProgress, children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), "Cancel Staging"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export Upgrade Report"] }), _jsxs(Dialog, { open: showConfirmDialog, onOpenChange: setShowConfirmDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { disabled: upgradeInProgress, className: "bg-green-600 hover:bg-green-700", children: [_jsx(CheckCircle2, { className: "h-4 w-4 mr-2" }), "Finalize Upgrade"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Confirm Framework Upgrade" }), _jsxs(DialogDescription, { children: ["This action will permanently upgrade your organization's NIST framework from ", currentRevision, " to ", pendingUpgrade.targetRevision, "."] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Warning:" }), " This action affects all controls and environments in your organization. Ensure you have reviewed the gap analysis and have appropriate backup procedures in place."] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "outline", onClick: () => setShowConfirmDialog(false), children: "Cancel" }), _jsx(Button, { onClick: () => {
                                                                                    setShowConfirmDialog(false);
                                                                                    finalizeUpgrade();
                                                                                }, disabled: upgradeInProgress, className: "bg-green-600 hover:bg-green-700", children: upgradeInProgress ? 'Finalizing...' : 'Confirm Upgrade' })] })] })] })] })] })] })) }) })] })), _jsx(Dialog, { open: showEmassImport, onOpenChange: setShowEmassImport, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Import from eMASS" }), _jsx(DialogDescription, { children: "Import system data and NIST revision information from your eMASS system" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "system-id", children: "eMASS System ID" }), _jsx("input", { id: "system-id", type: "text", className: "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md", placeholder: "Enter your eMASS system ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "api-key", children: "API Key" }), _jsx("input", { id: "api-key", type: "password", className: "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md", placeholder: "Enter your eMASS API key" })] }), _jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["This will import control data and automatically detect your current NIST revision.", _jsxs("a", { href: "https://mitre.github.io/emass_client/", target: "_blank", rel: "noopener noreferrer", className: "ml-1 text-blue-600 hover:underline inline-flex items-center", children: ["Learn more about eMASS API ", _jsx(ExternalLink, { className: "h-3 w-3 ml-1" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "outline", onClick: () => setShowEmassImport(false), children: "Cancel" }), _jsx(Button, { onClick: () => {
                                                const systemId = document.getElementById('system-id')?.value;
                                                const apiKey = document.getElementById('api-key')?.value;
                                                if (systemId && apiKey) {
                                                    importFromEmass(systemId, apiKey);
                                                    setShowEmassImport(false);
                                                }
                                            }, disabled: loading, children: loading ? 'Importing...' : 'Import Data' })] })] })] }) })] }));
};
export default FrameworkUpgrade;
