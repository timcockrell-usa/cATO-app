import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Clock, Users, Cloud, FileText, ArrowRight, BookOpen, Target } from 'lucide-react';
export const WelcomeStep = ({ onComplete, onNext, stepData, isProcessing }) => {
    const handleGetStarted = () => {
        onComplete(stepData.id);
        onNext();
    };
    const features = [
        {
            icon: Shield,
            title: 'NIST 800-53 Compliance',
            description: 'Automated compliance monitoring and reporting for NIST frameworks'
        },
        {
            icon: Cloud,
            title: 'Multi-Cloud Support',
            description: 'Connect and monitor Azure, AWS, and other cloud environments'
        },
        {
            icon: FileText,
            title: 'eMASS Integration',
            description: 'Seamless integration with existing eMASS compliance workflows'
        },
        {
            icon: Users,
            title: 'Role-Based Access',
            description: 'Granular permissions for different organizational roles'
        }
    ];
    const timelineItems = [
        {
            step: '1',
            title: 'Organization Setup',
            description: 'Configure your organization profile and contact information',
            time: '5 min',
            required: true
        },
        {
            step: '2',
            title: 'Security Configuration',
            description: 'Set NIST revision and security classification',
            time: '3 min',
            required: true
        },
        {
            step: '3',
            title: 'eMASS Integration',
            description: 'Connect to eMASS and import existing data',
            time: '10 min',
            required: false
        },
        {
            step: '4',
            title: 'Cloud Environments',
            description: 'Connect your cloud infrastructure',
            time: '15 min',
            required: true
        },
        {
            step: '5',
            title: 'User Management',
            description: 'Invite team members and assign roles',
            time: '5 min',
            required: false
        }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50", children: _jsx(CardContent, { className: "p-8", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4", children: _jsx(Shield, { className: "h-8 w-8 text-primary-foreground" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Welcome to cATO Dashboard" }), _jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "Your comprehensive platform for continuous Authority to Operate (ATO) management. Let's get your organization set up for automated compliance monitoring and reporting." }), _jsxs("div", { className: "flex items-center justify-center space-x-4 pt-4", children: [_jsxs(Badge, { variant: "secondary", className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsx("span", { children: "~30 minutes setup" })] }), _jsxs(Badge, { variant: "outline", className: "flex items-center space-x-1", children: [_jsx(Target, { className: "h-3 w-3" }), _jsx("span", { children: "FedRAMP Ready" })] })] })] }) }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(BookOpen, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Platform Features" })] }) }), _jsx(CardContent, { className: "space-y-4", children: features.map((feature, index) => (_jsxs("div", { className: "flex items-start space-x-3 p-3 rounded-lg bg-gray-50", children: [_jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center", children: _jsx(feature.icon, { className: "h-4 w-4 text-primary" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: feature.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: feature.description })] })] }, index))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: "Setup Process" })] }) }), _jsx(CardContent, { className: "space-y-4", children: timelineItems.map((item, index) => (_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium", children: item.step }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: item.title }), _jsx(Badge, { variant: item.required ? "default" : "outline", className: "text-xs", children: item.required ? 'Required' : 'Optional' })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: item.description }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Estimated time: ", item.time] })] })] }, index))) })] })] }), _jsx(Card, { className: "border-amber-200 bg-amber-50", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h3", { className: "font-semibold text-amber-800 mb-3", children: "Before You Begin" }), _jsxs("div", { className: "space-y-2 text-sm text-amber-700", children: [_jsx("p", { children: "\u2022 Have your organization's official information ready (legal name, CAGE code, etc.)" }), _jsx("p", { children: "\u2022 Ensure you have Authorizing Official (AO) and ISSM contact information" }), _jsx("p", { children: "\u2022 For eMASS integration, have your system ID and API credentials available" }), _jsx("p", { children: "\u2022 For cloud setup, ensure you have administrative access to your cloud environments" })] })] }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Ready to Get Started?" }), _jsx("p", { className: "text-muted-foreground", children: "This setup wizard will guide you through configuring your organization for continuous compliance monitoring." }), _jsxs(Button, { onClick: handleGetStarted, size: "lg", className: "px-8", disabled: isProcessing, children: ["Start Organization Setup", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })] }) }) })] }));
};
