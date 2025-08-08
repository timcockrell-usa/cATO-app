import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Shield, Target, Workflow, AlertTriangle, Download, Activity, ArrowUpCircle } from "lucide-react";
const navigation = [
    { name: "Executive Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "NIST 800-53 Controls", href: "/nist", icon: Shield },
    { name: "Zero Trust Architecture", href: "/zta", icon: Target },
    { name: "Execution Enablers", href: "/execution", icon: Workflow },
    { name: "POA&M Management", href: "/poam", icon: AlertTriangle },
    { name: "Continuous Monitoring", href: "/monitoring", icon: Activity },
    { name: "Framework Upgrade", href: "/framework-upgrade", icon: ArrowUpCircle },
    { name: "Export Package", href: "/export", icon: Download },
];
export function Sidebar() {
    const location = useLocation();
    return (_jsx("div", { className: "w-64 bg-card border-r border-border shadow-card", children: _jsxs("div", { className: "flex flex-col h-screen", children: [_jsx("div", { className: "p-6 border-b border-border", children: _jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "Navigation" }) }), _jsx("nav", { className: "flex-1 px-4 py-6 space-y-2", children: navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (_jsxs(NavLink, { to: item.href, className: cn("flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200", isActive
                                ? "bg-primary text-primary-foreground shadow-glow"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"), children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name));
                    }) }), _jsx("div", { className: "p-4 border-t border-border", children: _jsxs("div", { className: "text-xs text-muted-foreground", children: [_jsxs("p", { children: ["Last Updated: ", new Date().toLocaleTimeString()] }), _jsx("p", { className: "mt-1", children: "Classification: IL5" })] }) })] }) }));
}
