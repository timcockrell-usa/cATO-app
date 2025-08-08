import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ATO Package Generation Frontend Component
 * Provides UI for generating and downloading ATO documentation packages
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Package, CheckCircle, Clock, AlertTriangle, Info, Settings, BarChart3 } from 'lucide-react';
import { ATOPackageGenerationService } from '@/services/atoPackageGenerationService';
export const ATOPackageExport = ({ tenantId, systemName = "Demo System" }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [packageData, setPackageData] = useState(null);
    const [error, setError] = useState('');
    const atoService = new ATOPackageGenerationService();
    // Simulate progress updates for demo
    const simulateProgress = (targetProgress, message) => {
        setGenerationStatus(message);
        const step = (targetProgress - generationProgress) / 10;
        const interval = setInterval(() => {
            setGenerationProgress(prev => {
                const next = prev + step;
                if (next >= targetProgress) {
                    clearInterval(interval);
                    return targetProgress;
                }
                return next;
            });
        }, 100);
    };
    const generateATOPackage = async () => {
        try {
            setIsGenerating(true);
            setError('');
            setGenerationProgress(0);
            simulateProgress(20, 'Collecting NIST control implementations...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            simulateProgress(40, 'Analyzing Zero Trust Architecture maturity...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            simulateProgress(60, 'Generating POA&M items...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            simulateProgress(80, 'Compiling compliance metrics...');
            const atoPackage = await atoService.generateATOPackage(tenantId);
            simulateProgress(100, 'ATO package generated successfully!');
            setPackageData(atoPackage);
        }
        catch (err) {
            console.error('Error generating ATO package:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate ATO package');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const downloadSSP = () => {
        if (!packageData)
            return;
        try {
            // Generate SSP content as JSON for demo (in production, this would be PDF)
            const sspContent = {
                title: `System Security Plan - ${systemName}`,
                generated: new Date().toISOString(),
                systemInformation: packageData.systemInformation,
                controlImplementations: packageData.controlImplementations,
                complianceMetrics: packageData.complianceMetrics,
                zeroTrustAssessment: packageData.zeroTrustAssessment
            };
            const blob = new Blob([JSON.stringify(sspContent, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SSP_${systemName.replace(/\s+/g, '_')}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (err) {
            setError('Failed to download SSP');
        }
    };
    const downloadPOAM = async () => {
        if (!packageData)
            return;
        try {
            const poamData = await atoService.generatePOAMData(tenantId);
            const blob = new Blob([JSON.stringify(poamData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `POAM_${systemName.replace(/\s+/g, '_')}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (err) {
            setError('Failed to download POA&M');
        }
    };
    const downloadeMASS_CSV = async () => {
        if (!packageData)
            return;
        try {
            const poamData = await atoService.generatePOAMData(tenantId);
            // Convert to eMASS-compatible CSV format
            const csvHeaders = [
                'POA&M Item ID',
                'Controls',
                'Weakness Description',
                'Status',
                'Risk',
                'Scheduled Completion Date',
                'Resources Required'
            ];
            const csvRows = [csvHeaders.join(',')];
            poamData.forEach((item) => {
                const row = [
                    `"${item.poamId}"`,
                    `"${item.relatedControlId}"`,
                    `"${item.weaknessDescription.replace(/"/g, '""')}"`,
                    `"${item.status}"`,
                    `"${item.riskLevel}"`,
                    `"${item.scheduledCompletionDate}"`,
                    `"${item.resourcesRequired.replace(/"/g, '""')}"`
                ];
                csvRows.push(row.join(','));
            });
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `POAM_eMASS_${systemName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (err) {
            setError('Failed to download eMASS CSV');
        }
    };
    const downloadCompletePackage = () => {
        if (!packageData)
            return;
        try {
            const blob = new Blob([JSON.stringify(packageData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ATO_Package_${systemName.replace(/\s+/g, '_')}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (err) {
            setError('Failed to download complete package');
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-foreground", children: "ATO Package Generation" }), _jsx("p", { className: "text-muted-foreground", children: "Generate comprehensive Authority to Operate documentation packages" })] }), _jsxs(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200", children: [_jsx(Package, { className: "w-3 h-3 mr-1" }), "NIST 800-53 Rev 5"] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Settings, { className: "w-5 h-5 mr-2" }), "Generate ATO Package"] }), _jsxs(CardDescription, { children: ["Create complete ATO documentation package for ", systemName] })] }), _jsxs(CardContent, { className: "space-y-4", children: [!packageData && (_jsx(Button, { onClick: generateATOPackage, disabled: isGenerating, className: "w-full", size: "lg", children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "w-4 h-4 mr-2 animate-spin" }), "Generating Package..."] })) : (_jsxs(_Fragment, { children: [_jsx(Package, { className: "w-4 h-4 mr-2" }), "Generate Complete ATO Package"] })) })), isGenerating && (_jsxs("div", { className: "space-y-2", children: [_jsx(Progress, { value: generationProgress, className: "w-full" }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: generationStatus })] })), error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] })), packageData && (_jsxs(Alert, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "ATO package generated successfully! You can now download individual components or the complete package." })] }))] })] }), packageData && (_jsxs(Tabs, { defaultValue: "summary", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "summary", children: "Summary" }), _jsx(TabsTrigger, { value: "documents", children: "Documents" }), _jsx(TabsTrigger, { value: "metrics", children: "Metrics" }), _jsx(TabsTrigger, { value: "download", children: "Download" })] }), _jsx(TabsContent, { value: "summary", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(BarChart3, { className: "w-5 h-5 mr-2" }), "Package Summary"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [packageData.complianceMetrics?.overallCompliancePercentage || 0, "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Overall Compliance" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: packageData.complianceMetrics?.totalControlsAssessed || 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Controls Assessed" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [packageData.zeroTrustAssessment?.overallScore || 0, "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "ZTA Maturity" })] })] }) })] }) }), _jsx(TabsContent, { value: "documents", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "System Security Plan" }), _jsx(CardDescription, { children: "Complete NIST 800-53 control implementation documentation" })] }), _jsx(CardContent, { children: _jsxs(Button, { onClick: downloadSSP, className: "w-full", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Download SSP"] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Plan of Action & Milestones" }), _jsx(CardDescription, { children: "Security findings and remediation tracking" })] }), _jsx(CardContent, { children: _jsxs(Button, { onClick: downloadPOAM, className: "w-full", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Download POA&M"] }) })] })] }) }), _jsx(TabsContent, { value: "metrics", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Metrics" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: packageData.complianceMetrics?.controlFamilyCompliance?.map((family) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-medium", children: family.familyName }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: [family.compliantControls, "/", family.totalControls] }), _jsxs(Badge, { variant: family.compliancePercentage >= 80 ? "default" : "secondary", children: [family.compliancePercentage, "%"] })] })] }, family.family))) }) })] }) }), _jsx(TabsContent, { value: "download", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Download Options" }), _jsx(CardDescription, { children: "Choose the format and components you need for your ATO submission" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Button, { onClick: downloadSSP, variant: "outline", className: "justify-start", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "System Security Plan (JSON)"] }), _jsxs(Button, { onClick: downloadPOAM, variant: "outline", className: "justify-start", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "POA&M Document (JSON)"] }), _jsxs(Button, { onClick: downloadeMASS_CSV, variant: "outline", className: "justify-start", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "POA&M eMASS CSV"] }), _jsxs(Button, { onClick: downloadCompletePackage, className: "justify-start", children: [_jsx(Package, { className: "w-4 h-4 mr-2" }), "Complete Package (JSON)"] })] }), _jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Note:" }), " In production, documents would be generated as PDF files. This demo exports JSON format for easy review of the data structure."] })] })] })] }) })] }))] }));
};
export default ATOPackageExport;
