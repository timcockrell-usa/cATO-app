import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, Plus, Edit, Calendar, User } from "lucide-react";
// Sample POAM data for demonstration
const poamData = [
    {
        id: "POAM-001",
        title: "Multi-Factor Authentication Implementation",
        description: "Implement MFA for all user accounts to enhance authentication security",
        weakness: "IA-2: Identification and Authentication",
        severity: "High",
        status: "In Progress",
        owner: "Sarah Johnson",
        scheduledCompletion: "2024-04-15",
        resourcesRequired: "$25,000",
        milestones: ["Planning", "Procurement", "Implementation", "Testing"],
        isOverdue: false
    },
    {
        id: "POAM-002",
        title: "Network Segmentation Enhancement",
        description: "Critical systems are not properly isolated from general network traffic",
        weakness: "SC-7: Boundary Protection",
        severity: "High",
        status: "In Progress",
        owner: "Mike Chen",
        scheduledCompletion: "2024-05-30",
        resourcesRequired: "$50,000",
        milestones: ["Network design", "Hardware procurement", "Implementation", "Testing"],
        isOverdue: false
    },
    {
        id: "POAM-003",
        title: "Automated Vulnerability Scanning",
        description: "Lack of automated vulnerability scanning for cloud infrastructure",
        weakness: "RA-5: Vulnerability Scanning",
        severity: "Medium",
        status: "Open",
        owner: "David Kumar",
        scheduledCompletion: "2024-03-20",
        resourcesRequired: "$15,000",
        milestones: ["Tool selection", "Configuration", "Testing", "Deployment"],
        isOverdue: true
    },
    {
        id: "POAM-004",
        title: "Incident Response Plan Update",
        description: "Current incident response plan needs updates for cloud environment",
        weakness: "IR-8: Incident Response Plan",
        severity: "Medium",
        status: "In Progress",
        owner: "Lisa Park",
        scheduledCompletion: "2024-04-01",
        resourcesRequired: "$10,000",
        milestones: ["Plan review", "Updates", "Training", "Testing"],
        isOverdue: false
    },
    {
        id: "POAM-005",
        title: "Data Encryption at Rest",
        description: "Sensitive data storage lacks encryption at rest implementation",
        weakness: "SC-28: Protection of Information at Rest",
        severity: "High",
        status: "Open",
        owner: "Jennifer Lee",
        scheduledCompletion: "2024-06-15",
        resourcesRequired: "$30,000",
        milestones: ["Encryption key management", "Implementation", "Testing", "Validation"],
        isOverdue: false
    },
    {
        id: "POAM-006",
        title: "Security Awareness Training",
        description: "Annual security awareness training program needs enhancement",
        weakness: "AT-2: Security Awareness Training",
        severity: "Low",
        status: "Completed",
        owner: "Amy Rodriguez",
        scheduledCompletion: "2024-02-28",
        resourcesRequired: "$8,000",
        milestones: ["Content development", "Delivery", "Assessment", "Reporting"],
        isOverdue: false
    },
    {
        id: "POAM-007",
        title: "Privileged Access Review",
        description: "Quarterly privileged access review process needs automation",
        weakness: "AC-2: Account Management",
        severity: "Medium",
        status: "Open",
        owner: "Robert Kim",
        scheduledCompletion: "2024-01-30",
        resourcesRequired: "$12,000",
        milestones: ["Process design", "Automation", "Testing", "Implementation"],
        isOverdue: true
    }
];
function getSeverityColor(severity) {
    switch (severity) {
        case "High": return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" };
        case "Medium": return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" };
        case "Low": return { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" };
        default: return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
    }
}
function getStatusColor(status) {
    switch (status) {
        case "Completed": return { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" };
        case "In Progress": return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
        case "Open": return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" };
        default: return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
    }
}
export default function PoamManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPoam, setSelectedPoam] = useState(null);
    const filteredPoams = poamData.filter(poam => {
        const matchesSearch = poam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poam.weakness.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = selectedSeverity === "all" || poam.severity === selectedSeverity;
        const matchesStatus = selectedStatus === "all" || poam.status === selectedStatus;
        return matchesSearch && matchesSeverity && matchesStatus;
    });
    const totalPoams = poamData.length;
    const openPoams = poamData.filter(p => p.status === "Open").length;
    const inProgressPoams = poamData.filter(p => p.status === "In Progress").length;
    const completedPoams = poamData.filter(p => p.status === "Completed").length;
    const overduePoams = poamData.filter(p => p.isOverdue).length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-foreground", children: "POA&M Management" }), _jsx("p", { className: "text-muted-foreground", children: "Plan of Action and Milestones tracking and management" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New POA&M"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("div", { className: "text-2xl font-bold", children: totalPoams }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Total POA&Ms" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: openPoams }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Open" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: inProgressPoams }), _jsx("p", { className: "text-sm text-muted-foreground", children: "In Progress" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: completedPoams }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Completed" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: overduePoams }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Overdue" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Search & Filter" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" }), _jsx(Input, { placeholder: "Search POA&Ms...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsxs(Select, { value: selectedSeverity, onValueChange: setSelectedSeverity, children: [_jsx(SelectTrigger, { className: "w-full md:w-48", children: _jsx(SelectValue, { placeholder: "Filter by severity" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Severities" }), _jsx(SelectItem, { value: "High", children: "High" }), _jsx(SelectItem, { value: "Medium", children: "Medium" }), _jsx(SelectItem, { value: "Low", children: "Low" })] })] }), _jsxs(Select, { value: selectedStatus, onValueChange: setSelectedStatus, children: [_jsx(SelectTrigger, { className: "w-full md:w-48", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "Open", children: "Open" }), _jsx(SelectItem, { value: "In Progress", children: "In Progress" }), _jsx(SelectItem, { value: "Completed", children: "Completed" })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "POA&M List" }), _jsxs(CardDescription, { children: [filteredPoams.length, " of ", totalPoams, " POA&Ms shown"] })] }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "POA&M ID" }), _jsx(TableHead, { children: "Title" }), _jsx(TableHead, { children: "Weakness" }), _jsx(TableHead, { children: "Severity" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Owner" }), _jsx(TableHead, { children: "Due Date" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredPoams.map((poam) => {
                                        const severityStyle = getSeverityColor(poam.severity);
                                        const statusStyle = getStatusColor(poam.status);
                                        return (_jsxs(TableRow, { className: poam.isOverdue ? "bg-red-50 hover:bg-red-100" : "", children: [_jsx(TableCell, { className: "font-mono text-sm", children: poam.id }), _jsxs(TableCell, { className: "font-medium", children: [poam.title, poam.isOverdue && (_jsx(AlertTriangle, { className: "inline ml-2 h-4 w-4 text-red-500" }))] }), _jsx(TableCell, { className: "text-sm", children: poam.weakness }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: `${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`, children: poam.severity }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: `${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`, children: poam.status }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: poam.owner })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: `text-sm ${poam.isOverdue ? "text-red-500 font-medium" : ""}`, children: poam.scheduledCompletion })] }) }), _jsx(TableCell, { children: _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedPoam(poam), children: _jsx(Edit, { className: "h-4 w-4" }) }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 mr-2 text-primary" }), poam.id, " - ", poam.title] }), _jsx(DialogDescription, { children: "POA&M Details and Milestone Tracking" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Severity" }), _jsx(Badge, { variant: "outline", className: `${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`, children: poam.severity })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Status" }), _jsx(Badge, { variant: "outline", className: `${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`, children: poam.status })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-muted-foreground", children: poam.description })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Control Weakness" }), _jsx(Badge, { variant: "secondary", children: poam.weakness })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Owner" }), _jsx("p", { className: "text-sm text-muted-foreground", children: poam.owner })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Due Date" }), _jsx("p", { className: "text-sm text-muted-foreground", children: poam.scheduledCompletion })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Resources" }), _jsx("p", { className: "text-sm text-muted-foreground", children: poam.resourcesRequired })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Milestones" }), _jsx("div", { className: "space-y-2", children: poam.milestones.map((milestone, index) => (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-primary" }), _jsx("span", { className: "text-sm", children: milestone })] }, index))) })] })] })] })] }) })] }, poam.id));
                                    }) })] }) })] })] }));
}
