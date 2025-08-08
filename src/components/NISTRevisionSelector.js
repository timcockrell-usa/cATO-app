import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * NIST Revision Selection Component
 * Allows customers to select NIST 800-53 revision during onboarding
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
const NISTRevisionSelector = ({ selectedRevision, onRevisionChange, organizationType = 'commercial', disabled = false, showDetails = true }) => {
    const [showComparison, setShowComparison] = useState(false);
    const revisionInfo = {
        Rev4: {
            title: 'NIST 800-53 Revision 4',
            status: 'Legacy',
            controlCount: '421 controls',
            description: 'Established framework with proven track record',
            pros: [
                'Mature and well-documented',
                'Extensive implementation guidance available',
                'Widely adopted across federal agencies',
                'Lower migration complexity for existing systems'
            ],
            cons: [
                'No longer updated with new security requirements',
                'Missing modern privacy and supply chain controls',
                'Limited coverage of emerging threats',
                'May not meet future compliance requirements'
            ],
            recommended: false,
            badgeColor: 'yellow'
        },
        Rev5: {
            title: 'NIST 800-53 Revision 5',
            status: 'Current',
            controlCount: '450+ controls',
            description: 'Latest framework with enhanced security and privacy controls',
            pros: [
                'Current standard with latest security requirements',
                'Enhanced privacy controls (PT family)',
                'Supply chain security controls (SR family)',
                'Future-proof for emerging compliance requirements'
            ],
            cons: [
                'Newer framework with evolving guidance',
                'Higher initial implementation complexity',
                'May require more extensive documentation',
                'Some control mappings still being refined'
            ],
            recommended: true,
            badgeColor: 'green'
        },
        Rev6: {
            title: 'NIST 800-53 Revision 6',
            status: 'Future',
            controlCount: '500+ controls (projected)',
            description: 'Next-generation framework with AI/ML and emerging technology controls',
            pros: [
                'Addresses AI/ML security requirements',
                'Enhanced cloud-native controls',
                'Zero-trust architecture integration',
                'Emerging technology security guidance'
            ],
            cons: [
                'Not yet published or finalized',
                'Implementation guidance not available',
                'Subject to change during development',
                'Higher complexity and resource requirements'
            ],
            recommended: false,
            badgeColor: 'blue'
        }
    };
    const getRecommendation = () => {
        if (organizationType === 'government') {
            return {
                revision: 'Rev5',
                reason: 'Federal agencies are required to transition to NIST 800-53 Rev 5 for new systems and during major updates.'
            };
        }
        else if (organizationType === 'contractor') {
            return {
                revision: 'Rev5',
                reason: 'Government contractors should align with federal requirements and adopt Rev 5 for future contract compliance.'
            };
        }
        else {
            return {
                revision: 'Rev5',
                reason: 'Rev 5 provides the most comprehensive and up-to-date security framework for commercial organizations.'
            };
        }
    };
    const recommendation = getRecommendation();
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }), "Select NIST 800-53 Revision"] }), _jsx(CardDescription, { children: "Choose the NIST framework revision that best fits your organization's compliance requirements. This selection affects which security controls are available in your cATO dashboard." })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsxs("strong", { children: ["Recommended for ", organizationType, " organizations:"] }), " ", recommendation.revision, _jsx("br", {}), recommendation.reason] })] }), _jsx(RadioGroup, { value: selectedRevision || '', onValueChange: (value) => onRevisionChange(value), disabled: disabled, className: "space-y-4", children: Object.keys(revisionInfo).map((revision) => {
                                const info = revisionInfo[revision];
                                const isRecommended = revision === recommendation.revision;
                                return (_jsx("div", { className: "relative", children: _jsx("div", { className: `border rounded-lg p-4 transition-colors ${selectedRevision === revision
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: revision, id: revision, className: "mt-1" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs(Label, { htmlFor: revision, className: "flex items-center gap-2 text-base font-medium cursor-pointer", children: [info.title, _jsx(Badge, { variant: info.badgeColor === 'green' ? 'default' : 'secondary', children: info.status }), isRecommended && (_jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: "Recommended" }))] }), _jsxs("p", { className: "text-sm text-gray-600", children: [info.description, " \u2022 ", info.controlCount] }), showDetails && (_jsx("div", { className: "mt-3 space-y-2", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-green-700 mb-1", children: "Benefits" }), _jsx("ul", { className: "space-y-1", children: info.pros.slice(0, 2).map((pro, index) => (_jsxs("li", { className: "flex items-start gap-1", children: [_jsx(CheckCircle, { className: "h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" }), pro] }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-orange-700 mb-1", children: "Considerations" }), _jsx("ul", { className: "space-y-1", children: info.cons.slice(0, 2).map((con, index) => (_jsxs("li", { className: "flex items-start gap-1", children: [_jsx(AlertCircle, { className: "h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" }), con] }, index))) })] })] }) }))] })] }) }) }, revision));
                            }) }), showDetails && (_jsx("div", { className: "text-center", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowComparison(!showComparison), className: "text-sm", children: [showComparison ? 'Hide' : 'Show', " Detailed Comparison", _jsx(ExternalLink, { className: "h-3 w-3 ml-1" })] }) })), showComparison && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Detailed Comparison" }) }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left py-2 font-medium", children: "Feature" }), _jsx("th", { className: "text-left py-2 font-medium", children: "Rev 4" }), _jsx("th", { className: "text-left py-2 font-medium", children: "Rev 5" })] }) }), _jsxs("tbody", { className: "space-y-2", children: [_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2 font-medium", children: "Control Count" }), _jsx("td", { className: "py-2", children: "421 controls" }), _jsx("td", { className: "py-2", children: "450+ controls" })] }), _jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2 font-medium", children: "Privacy Controls" }), _jsx("td", { className: "py-2", children: "Limited (AR family)" }), _jsx("td", { className: "py-2", children: "Comprehensive (PT family)" })] }), _jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2 font-medium", children: "Supply Chain" }), _jsx("td", { className: "py-2", children: "Basic (SA controls)" }), _jsx("td", { className: "py-2", children: "Enhanced (SR family)" })] }), _jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2 font-medium", children: "Federal Requirement" }), _jsx("td", { className: "py-2", children: "Legacy systems only" }), _jsx("td", { className: "py-2", children: "Required for new systems" })] }), _jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2 font-medium", children: "Implementation Status" }), _jsx("td", { className: "py-2", children: "Mature, stable" }), _jsx("td", { className: "py-2", children: "Current, evolving" })] }), _jsxs("tr", { children: [_jsx("td", { className: "py-2 font-medium", children: "Future Support" }), _jsx("td", { className: "py-2", children: "Maintenance mode" }), _jsx("td", { className: "py-2", children: "Active development" })] })] })] }) }) })] })), selectedRevision && (_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Note:" }), " You can change your NIST revision selection later through the Framework Upgrade feature in your dashboard. A gap analysis will be provided to help with the transition."] })] }))] })] }) }));
};
export default NISTRevisionSelector;
