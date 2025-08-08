import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../contexts/SimpleAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function Index() {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    // Auto-redirect to dashboard if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md bg-slate-800/50 border-slate-700", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "p-3 bg-blue-600/20 rounded-full", children: _jsx(Shield, { className: "h-8 w-8 text-blue-400" }) }) }), _jsx(CardTitle, { className: "text-2xl text-white", children: "USAFRICOM cATO Dashboard" }), _jsx(CardDescription, { className: "text-slate-400", children: "Continuous Authority to Operate Management System" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "text-center", children: _jsx("p", { className: "text-sm text-slate-300 mb-6", children: "Sign in to access the cATO Dashboard and manage your organization's security compliance and continuous monitoring." }) }), _jsxs(Button, { onClick: login, className: "w-full h-12", size: "lg", children: [_jsx(Shield, { className: "mr-2 h-4 w-4" }), "Sign In to Continue"] }), _jsxs("div", { className: "text-xs text-slate-500 text-center space-y-2 pt-4 border-t border-slate-700", children: [_jsx("p", { children: "This system is restricted to authorized DoD personnel only. Unauthorized access is prohibited." }), _jsx("p", { children: "By accessing this system, you consent to monitoring and auditing of your activities." })] })] })] }) }));
}
