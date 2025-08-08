import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Lock, Shield } from 'lucide-react';
import { authenticateLocalUser } from '@/config/localAuth';
export const LocalLogin = ({ onLogin, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError(null);
        try {
            const user = authenticateLocalUser(username, password);
            if (user) {
                onLogin({
                    account: {
                        homeAccountId: user.id,
                        environment: 'local',
                        tenantId: 'local',
                        username: user.email,
                        name: user.displayName,
                    },
                    roles: user.roles
                });
            }
            else {
                setLoginError('Invalid username or password');
            }
        }
        catch (err) {
            setLoginError('Login failed. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs("div", { className: "w-full max-w-md space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "bg-blue-600 p-3 rounded-full", children: _jsx(Shield, { className: "w-8 h-8 text-white" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "cATO Dashboard" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Local Development Mode" })] }), _jsxs(Card, { className: "shadow-lg", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-center", children: "Sign In" }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(error || loginError) && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error || loginError }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "username", type: "text", placeholder: "Enter username", value: username, onChange: (e) => setUsername(e.target.value), className: "pl-9", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "password", type: showPassword ? 'text' : 'password', placeholder: "Enter password", value: password, onChange: (e) => setPassword(e.target.value), className: "pl-9 pr-9", required: true }), _jsx("button", { type: "button", className: "absolute right-3 top-3 text-gray-400 hover:text-gray-600", onClick: () => setShowPassword(!showPassword), children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Signing in...' : 'Sign In' })] }) })] }), _jsxs(Card, { className: "shadow-lg", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Test Accounts" }) }), _jsx(CardContent, { className: "text-xs space-y-2", children: _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "admin / admin123" }), _jsx("p", { className: "text-gray-600", children: "System Administrator" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "security / security123" }), _jsx("p", { className: "text-gray-600", children: "Security Analyst" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "compliance / compliance123" }), _jsx("p", { className: "text-gray-600", children: "Compliance Officer" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "ao / ao123" }), _jsx("p", { className: "text-gray-600", children: "Authorizing Official" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "auditor / auditor123" }), _jsx("p", { className: "text-gray-600", children: "Security Auditor" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "viewer / viewer123" }), _jsx("p", { className: "text-gray-600", children: "Viewer User" })] })] }) })] }), _jsxs("div", { className: "text-center text-xs text-gray-500", children: [_jsx("p", { children: "Local development mode - no Azure Entra ID required" }), _jsx("p", { children: "Switch to production mode by setting VITE_USE_LOCAL_AUTH=false" })] })] }) }));
};
