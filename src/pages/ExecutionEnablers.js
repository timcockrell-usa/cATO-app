import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Execution Enablers Dashboard Component
 * Implements DOTmLPF-P (Doctrine, Organization, Training, Materiel, Leadership, Personnel, Facilities, Policy) tracking
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Plus, Settings } from 'lucide-react';
import { executionEnablersService } from '@/services/executionEnablersService';
import { useAuth } from '@/contexts/SimpleAuthContext';
// Category descriptions and icons
const CATEGORY_INFO = {
    Doctrine: {
        description: 'Fundamental principles, policies, and procedures that guide cATO implementation',
        icon: '📋',
        color: 'bg-blue-100 text-blue-800'
    },
    Organization: {
        description: 'Organizational structure, roles, and responsibilities for cATO operations',
        icon: '🏢',
        color: 'bg-green-100 text-green-800'
    },
    Training: {
        description: 'Education and skill development programs for cATO personnel',
        icon: '🎓',
        color: 'bg-purple-100 text-purple-800'
    },
    Materiel: {
        description: 'Technology, tools, and equipment required for cATO implementation',
        icon: '⚙️',
        color: 'bg-orange-100 text-orange-800'
    },
    Leadership: {
        description: 'Executive support and change management for cATO transformation',
        icon: '👑',
        color: 'bg-red-100 text-red-800'
    },
    Personnel: {
        description: 'Staffing, recruitment, and human resource management for cATO',
        icon: '👥',
        color: 'bg-cyan-100 text-cyan-800'
    },
    Facilities: {
        description: 'Physical and virtual infrastructure supporting cATO operations',
        icon: '🏭',
        color: 'bg-pink-100 text-pink-800'
    },
    Policy: {
        description: 'Regulatory framework and governance policies for cATO compliance',
        icon: '📜',
        color: 'bg-yellow-100 text-yellow-800'
    }
};
// Status styling
const getStatusBadgeProps = (status) => {
    switch (status) {
        case 'Completed':
            return { variant: 'default', className: 'bg-green-100 text-green-800' };
        case 'Validated':
            return { variant: 'default', className: 'bg-green-200 text-green-900' };
        case 'In_Progress':
            return { variant: 'default', className: 'bg-blue-100 text-blue-800' };
        case 'Testing':
            return { variant: 'default', className: 'bg-purple-100 text-purple-800' };
        case 'Planning':
            return { variant: 'default', className: 'bg-gray-100 text-gray-800' };
        case 'Needs_Attention':
            return { variant: 'destructive' };
        case 'On_Hold':
            return { variant: 'secondary' };
        case 'Cancelled':
            return { variant: 'outline' };
        default:
            return { variant: 'outline' };
    }
};
// Maturity level colors
const getMaturityColor = (level) => {
    switch (level) {
        case 'Initial':
            return 'bg-red-500';
        case 'Developing':
            return 'bg-orange-500';
        case 'Defined':
            return 'bg-yellow-500';
        case 'Managed':
            return 'bg-blue-500';
        case 'Optimizing':
            return 'bg-green-500';
        default:
            return 'bg-gray-500';
    }
};
export default function ExecutionEnablers() {
    const { user } = useAuth();
    const [enablers, setEnablers] = useState({});
    const [statistics, setStatistics] = useState(null);
    const [maturityAssessment, setMaturityAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedEnabler, setSelectedEnabler] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showOnlyAtRisk, setShowOnlyAtRisk] = useState(false);
    // Derive tenant ID from user's email domain or use default
    const getTenantId = () => {
        if (user?.email) {
            // Extract organization from email domain (e.g., user@company.mil -> company.mil)
            const domain = user.email.split('@')[1];
            return domain || 'default-tenant';
        }
        return 'default-tenant';
    };
    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);
    const loadData = async () => {
        try {
            setLoading(true);
            const tenantId = getTenantId();
            const [enablersData, statsData, maturityData] = await Promise.all([
                executionEnablersService.getEnablersGroupedByCategory(tenantId),
                executionEnablersService.getEnablerStatistics(tenantId),
                executionEnablersService.getMaturityAssessment(tenantId)
            ]);
            setEnablers(enablersData);
            setStatistics(statsData);
            setMaturityAssessment(maturityData);
        }
        catch (error) {
            console.error('Error loading execution enablers data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const initializeDefaultEnablers = async () => {
        try {
            setLoading(true);
            const tenantId = getTenantId();
            await executionEnablersService.initializeDefaultEnablers(tenantId, user.id);
            await loadData();
        }
        catch (error) {
            console.error('Error initializing default enablers:', error);
        }
    };
    const updateEnablerStatus = async (enabler, status, progress) => {
        try {
            await executionEnablersService.updateEnablerStatus(enabler.id, enabler.tenantId, status, progress, user.id);
            await loadData();
        }
        catch (error) {
            console.error('Error updating enabler status:', error);
        }
    };
    const filterEnablers = (categoryEnablers) => {
        let filtered = categoryEnablers;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(e => e.status === statusFilter);
        }
        if (showOnlyAtRisk) {
            filtered = filtered.filter(e => ['Needs_Attention', 'On_Hold'].includes(e.status) ||
                e.riskLevel === 'High' ||
                e.riskLevel === 'Very_High' ||
                (e.targetCompletionDate && new Date(e.targetCompletionDate) < new Date() && e.status !== 'Completed'));
        }
        return filtered;
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "text-lg", children: "Loading execution enablers..." }) }));
    }
    if (!statistics || statistics.total === 0) {
        return (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4", children: _jsx(FileText, { className: "w-12 h-12 text-gray-400" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Execution Enablers Found" }), _jsx("p", { className: "text-gray-600 mb-6 max-w-md mx-auto", children: "Get started by initializing the default DOTmLPF-P execution enablers for your organization." }), _jsxs(Button, { onClick: initializeDefaultEnablers, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Initialize Default Enablers"] })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Execution Enablers (DOTmLPF-P)" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Track organizational readiness across Doctrine, Organization, Training, Materiel, Leadership, Personnel, Facilities, and Policy" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: loadData, children: "Refresh" }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Settings"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Execution Enablers Settings" }), _jsx(DialogDescription, { children: "Configure filters and display options for execution enablers." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Status Filter" }), _jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "Not_Started", children: "Not Started" }), _jsx(SelectItem, { value: "Planning", children: "Planning" }), _jsx(SelectItem, { value: "In_Progress", children: "In Progress" }), _jsx(SelectItem, { value: "Testing", children: "Testing" }), _jsx(SelectItem, { value: "Completed", children: "Completed" }), _jsx(SelectItem, { value: "Validated", children: "Validated" }), _jsx(SelectItem, { value: "Needs_Attention", children: "Needs Attention" }), _jsx(SelectItem, { value: "On_Hold", children: "On Hold" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "atRisk", checked: showOnlyAtRisk, onChange: (e) => setShowOnlyAtRisk(e.target.checked), className: "rounded" }), _jsx("label", { htmlFor: "atRisk", className: "text-sm font-medium", children: "Show only at-risk enablers" })] })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overall Progress" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [statistics.overallCompletion, "%"] }), _jsx(Progress, { value: statistics.overallCompletion, className: "mt-2" }), _jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [statistics.total, " total enablers"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Maturity Level" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: maturityAssessment?.overallMaturity || 'N/A' }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Average across all categories" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "At Risk" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: statistics.atRisk }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Enablers needing attention" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overdue" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: statistics.overdue }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Past target completion date" })] })] })] }), _jsx(Accordion, { type: "multiple", className: "space-y-4", children: Object.entries(CATEGORY_INFO).map(([category, info]) => {
                    const categoryEnablers = enablers[category] || [];
                    const filteredEnablers = filterEnablers(categoryEnablers);
                    const categoryStats = statistics.byCategory[category] || 0;
                    const categoryMaturity = maturityAssessment?.categoryMaturity[category];
                    const avgCompletion = categoryEnablers.length > 0
                        ? Math.round(categoryEnablers.reduce((sum, e) => sum + e.completionPercentage, 0) / categoryEnablers.length)
                        : 0;
                    return (_jsxs(AccordionItem, { value: category, className: "border rounded-lg", children: [_jsx(AccordionTrigger, { className: "px-6 py-4 hover:no-underline", children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: `flex items-center justify-center w-12 h-12 rounded-lg ${info.color}`, children: _jsx("span", { className: "text-2xl", children: info.icon }) }), _jsxs("div", { className: "text-left", children: [_jsx("h3", { className: "text-lg font-semibold", children: category }), _jsx("p", { className: "text-sm text-gray-600", children: info.description })] })] }), _jsxs("div", { className: "flex items-center space-x-6 mr-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-sm font-medium", children: [categoryStats, " Enablers"] }), _jsx("div", { className: "text-xs text-gray-500", children: "Total" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-sm font-medium", children: [avgCompletion, "%"] }), _jsx("div", { className: "text-xs text-gray-500", children: "Complete" })] }), categoryMaturity && (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm font-medium", children: categoryMaturity.currentLevel.toFixed(1) }), _jsx("div", { className: "text-xs text-gray-500", children: "Maturity" })] }))] })] }) }), _jsx(AccordionContent, { className: "px-6 pb-4", children: _jsx("div", { className: "space-y-3", children: filteredEnablers.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No enablers match the current filters" })) : (filteredEnablers.map((enabler) => (_jsx(Card, { className: "border-l-4 border-l-blue-500", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h4", { className: "font-semibold", children: enabler.name }), _jsx(Badge, { ...getStatusBadgeProps(enabler.status), children: enabler.status.replace('_', ' ') }), _jsx("div", { className: `w-3 h-3 rounded-full ${getMaturityColor(enabler.maturityLevel)}`, title: `Maturity: ${enabler.maturityLevel}` })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: enabler.description }), _jsxs("div", { className: "flex items-center space-x-4 mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("span", { className: "text-xs font-medium", children: "Progress" }), _jsxs("span", { className: "text-xs text-gray-500", children: [enabler.completionPercentage, "%"] })] }), _jsx(Progress, { value: enabler.completionPercentage, className: "h-2" })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Due: ", new Date(enabler.targetCompletionDate).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center space-x-2 text-xs text-gray-500", children: [_jsxs("span", { children: ["Owner: ", enabler.owner] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Impact: ", enabler.impactOnCATO.split(' - ')[0]] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Risk: ", enabler.riskLevel.replace('_', ' ')] })] })] }), _jsxs("div", { className: "flex space-x-2 ml-4", children: [_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedEnabler(enabler), children: "Details" }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: enabler.name }), _jsx(DialogDescription, { children: enabler.description })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Status" }), _jsx("p", { className: "text-sm", children: enabler.status.replace('_', ' ') })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Maturity Level" }), _jsx("p", { className: "text-sm", children: enabler.maturityLevel })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Progress" }), _jsxs("p", { className: "text-sm", children: [enabler.completionPercentage, "%"] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Risk Level" }), _jsx("p", { className: "text-sm", children: enabler.riskLevel.replace('_', ' ') })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Impact on cATO" }), _jsx("p", { className: "text-sm", children: enabler.impactOnCATO })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Evidence Required" }), _jsx("ul", { className: "text-sm list-disc list-inside space-y-1", children: enabler.evidenceRequired.map((evidence, idx) => (_jsx("li", { children: evidence }, idx))) })] })] })] })] }), _jsxs(Select, { value: enabler.status, onValueChange: (value) => updateEnablerStatus(enabler, value, enabler.completionPercentage), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Not_Started", children: "Not Started" }), _jsx(SelectItem, { value: "Planning", children: "Planning" }), _jsx(SelectItem, { value: "In_Progress", children: "In Progress" }), _jsx(SelectItem, { value: "Testing", children: "Testing" }), _jsx(SelectItem, { value: "Completed", children: "Completed" }), _jsx(SelectItem, { value: "Validated", children: "Validated" }), _jsx(SelectItem, { value: "Needs_Attention", children: "Needs Attention" }), _jsx(SelectItem, { value: "On_Hold", children: "On Hold" })] })] })] })] }) }) }, enabler.id)))) }) })] }, category));
                }) })] }));
}
