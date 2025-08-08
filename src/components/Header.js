import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bell, Settings, User, Shield, Sun, Moon, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
export function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user, logout } = useAuth();
    useEffect(() => {
        setMounted(true);
    }, []);
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    const getRoleColor = (roles) => {
        if (roles.includes('SystemAdmin'))
            return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (roles.includes('AO'))
            return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        if (roles.includes('ComplianceOfficer'))
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        if (roles.includes('SecurityAnalyst'))
            return 'bg-green-500/10 text-green-500 border-green-500/20';
        if (roles.includes('Auditor'))
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };
    const getHighestRole = (roles) => {
        const roleHierarchy = ['SystemAdmin', 'AO', 'ComplianceOfficer', 'SecurityAnalyst', 'Auditor', 'Viewer'];
        for (const role of roleHierarchy) {
            if (roles.includes(role))
                return role;
        }
        return 'Viewer';
    };
    const handleLogout = async () => {
        try {
            await logout();
        }
        catch (error) {
            console.error('Logout failed:', error);
        }
    };
    if (!mounted)
        return null;
    return (_jsx("header", { className: "h-16 border-b border-border bg-card shadow-card", children: _jsxs("div", { className: "flex items-center justify-between h-full px-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-8 w-8 text-primary" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "cATO Dashboard" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Continuous Authority to Operate" })] })] }), _jsx(Badge, { variant: "outline", className: "bg-status-compliant/10 text-status-compliant border-status-compliant/20", children: "IL5 ACTIVE" })] }), _jsx("div", { className: "flex-1 max-w-md mx-8", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" }), _jsx(Input, { placeholder: "Search controls, activities, or POA&Ms...", className: "pl-10 bg-background/50" })] }) }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Badge, { variant: "outline", className: "bg-status-partial/10 text-status-partial border-status-partial/20", children: "CUI" }), _jsxs(Button, { variant: "ghost", size: "sm", className: "relative", children: [_jsx(Bell, { className: "h-5 w-5" }), _jsx(Badge, { className: "absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-destructive", children: "3" })] }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Settings, { className: "h-5 w-5" }) }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Settings" }), _jsx(DialogDescription, { children: "Customize your dashboard preferences" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "theme-toggle", children: "Theme" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Switch between light and dark mode" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Sun, { className: "h-4 w-4" }), _jsx(Switch, { id: "theme-toggle", checked: theme === "dark", onCheckedChange: (checked) => setTheme(checked ? "dark" : "light") }), _jsx(Moon, { className: "h-4 w-4" })] })] }), _jsx("div", { className: "pt-4 border-t", children: _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Current theme: ", _jsx("span", { className: "font-medium", children: theme })] }) })] })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-8 w-8 rounded-full", children: _jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: "", alt: user?.displayName || '' }), _jsx(AvatarFallback, { className: "bg-primary text-primary-foreground", children: user ? getInitials(user.displayName) : 'U' })] }) }) }), _jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: user?.displayName }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user?.email }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user?.organizationId })] }) }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuLabel, { children: _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Current Role:" }), _jsx(Badge, { variant: "outline", className: `text-xs w-fit ${getRoleColor(user?.roles || [])}`, children: getHighestRole(user?.roles || []) })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { children: [_jsx(User, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Profile" })] }), _jsxs(DropdownMenuItem, { children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Settings" })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleLogout, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Log out" })] })] })] })] })] }) }));
}
