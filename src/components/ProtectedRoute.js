import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuth } from '../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
export const ProtectedRoute = ({ children, requiredRoles = [], fallback, }) => {
    const { isLoading, isAuthenticated, user, login, error } = useAuth();
    // Show loading state
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsx(Card, { className: "w-full max-w-md", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Authenticating..." })] }) }) }) }));
    }
    // Show login page if not authenticated
    if (!isAuthenticated) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit", children: _jsx(Shield, { className: "h-6 w-6 text-red-600 dark:text-red-400" }) }), _jsx(CardTitle, { className: "text-xl", children: "Authentication Required" }), _jsx(CardDescription, { children: "You need to be logged in to access this page" })] }), _jsxs(CardContent, { className: "space-y-4", children: [error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] })), _jsx(Button, { onClick: login, className: "w-full", size: "lg", children: "Login to Continue" })] })] }) }));
    }
    // Simple role check for SimpleAuthContext (optional)
    if (requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.some(role => user.roles?.includes(role) || user.isAdmin);
        if (!hasRequiredRole) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-fit", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-yellow-600 dark:text-yellow-400" }) }), _jsx(CardTitle, { className: "text-xl", children: "Access Denied" }), _jsx(CardDescription, { children: "You don't have the required permissions to access this page" })] }), _jsx(CardContent, { children: _jsxs("p", { className: "text-sm text-muted-foreground text-center", children: ["Required roles: ", requiredRoles.join(', ')] }) })] }) }));
        }
    }
    // User is authenticated and has required roles
    return _jsx(_Fragment, { children: children });
};
// Higher-order component for role-based access (simplified for SimpleAuthContext)
export const withRoleProtection = (WrappedComponent, requiredRoles) => {
    return (props) => (_jsx(ProtectedRoute, { requiredRoles: requiredRoles, children: _jsx(WrappedComponent, { ...props }) }));
};
export default ProtectedRoute;
