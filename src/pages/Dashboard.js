import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Shield, Target, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
// Mock data for dashboard
const complianceData = [
    { name: "Compliant", value: 142, color: "#16a34a" },
    { name: "Partial", value: 38, color: "#f59e0b" },
    { name: "Non-Compliant", value: 12, color: "#dc2626" },
    { name: "Unknown", value: 8, color: "#6b7280" }
];
const ztaMaturityData = [
    { pillar: "Identity", traditional: 65, advanced: 45, optimal: 25 },
    { pillar: "Device", traditional: 70, advanced: 55, optimal: 30 },
    { pillar: "Network", traditional: 80, advanced: 40, optimal: 20 },
    { pillar: "App/Workload", traditional: 75, advanced: 50, optimal: 35 },
    { pillar: "Data", traditional: 60, advanced: 45, optimal: 40 },
    { pillar: "Visibility", traditional: 85, advanced: 60, optimal: 45 },
    { pillar: "Analytics", traditional: 55, advanced: 35, optimal: 25 }
];
const riskTrendData = [
    { month: "Jan", high: 15, medium: 32, low: 8 },
    { month: "Feb", high: 12, medium: 28, low: 6 },
    { month: "Mar", high: 8, medium: 25, low: 4 },
    { month: "Apr", high: 6, medium: 22, low: 3 },
    { month: "May", high: 4, medium: 18, low: 2 },
    { month: "Jun", high: 3, medium: 15, low: 1 }
];
const Dashboard = () => {
    const overallCompliance = 85.2;
    const ztaMaturity = 72.5;
    const activePoams = 23;
    const criticalRisks = 3;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-foreground", children: "Executive Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Real-time compliance and security posture overview" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Badge, { variant: "outline", className: "bg-green-100 text-green-800 border-green-200", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "cATO Active"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs(Card, { className: "bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "NIST Compliance" }), _jsx(Shield, { className: "h-4 w-4 text-green-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-foreground", children: [overallCompliance, "%"] }), _jsxs("div", { className: "flex items-center text-xs text-green-600", children: [_jsx(TrendingUp, { className: "w-3 h-3 mr-1" }), "+2.3% from last month"] }), _jsx(Progress, { value: overallCompliance, className: "mt-3" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "ZTA Maturity" }), _jsx(Target, { className: "h-4 w-4 text-blue-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-foreground", children: [ztaMaturity, "%"] }), _jsxs("div", { className: "flex items-center text-xs text-blue-600", children: [_jsx(TrendingUp, { className: "w-3 h-3 mr-1" }), "+5.1% from last month"] }), _jsx(Progress, { value: ztaMaturity, className: "mt-3" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active POA&Ms" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: activePoams }), _jsxs("div", { className: "flex items-center text-xs text-green-600", children: [_jsx(TrendingDown, { className: "w-3 h-3 mr-1" }), "-8 from last month"] }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "3 overdue \u2022 8 due this month" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Critical Risks" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: criticalRisks }), _jsxs("div", { className: "flex items-center text-xs text-green-600", children: [_jsx(TrendingDown, { className: "w-3 h-3 mr-1" }), "-2 from last month"] }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "1 requires immediate action" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "NIST 800-53 Compliance Status" }), _jsx(CardDescription, { children: "Control implementation status across all families" })] }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: complianceData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: complianceData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) }) })] }), _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Risk Trend Analysis" }), _jsx(CardDescription, { children: "POA&M risk levels over time" })] }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: riskTrendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "month", className: "text-muted-foreground" }), _jsx(YAxis, { className: "text-muted-foreground" }), _jsx(Tooltip, { contentStyle: {
                                                    backgroundColor: "white",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px"
                                                } }), _jsx(Bar, { dataKey: "high", stackId: "a", fill: "#dc2626" }), _jsx(Bar, { dataKey: "medium", stackId: "a", fill: "#f59e0b" }), _jsx(Bar, { dataKey: "low", stackId: "a", fill: "#16a34a" })] }) }) })] })] }), _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Zero Trust Architecture Maturity" }), _jsx(CardDescription, { children: "Maturity assessment across all seven pillars" })] }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(RadarChart, { data: ztaMaturityData, children: [_jsx(PolarGrid, { className: "stroke-muted" }), _jsx(PolarAngleAxis, { dataKey: "pillar", tick: { fill: "black", fontSize: 12 } }), _jsx(PolarRadiusAxis, { angle: 90, domain: [0, 100], tick: { fill: "#6b7280", fontSize: 10 } }), _jsx(Radar, { name: "Traditional", dataKey: "traditional", stroke: "#ef4444", fill: "#ef4444", fillOpacity: 0.2 }), _jsx(Radar, { name: "Advanced", dataKey: "advanced", stroke: "#3b82f6", fill: "#3b82f6", fillOpacity: 0.2 }), _jsx(Radar, { name: "Optimal", dataKey: "optimal", stroke: "#10b981", fill: "#10b981", fillOpacity: 0.2 }), _jsx(Tooltip, { contentStyle: {
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px"
                                        } })] }) }) })] })] }));
};
export default Dashboard;
