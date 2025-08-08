import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/SimpleAuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NistControls from "./pages/NistControls";
import ZeroTrust from "./pages/ZeroTrust";
import ExecutionEnablers from "./pages/ExecutionEnablers";
import PoamManagement from "./pages/PoamManagement";
import ExportPackage from "./pages/ExportPackage";
import ContinuousMonitoring from "./pages/ContinuousMonitoring";
import FrameworkUpgrade from "./pages/FrameworkUpgrade";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
});
const App = () => (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsx(Sonner, {}), _jsx(BrowserRouter, { children: _jsx(ErrorBoundary, { children: _jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Index, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(Dashboard, {}) }) }) }), _jsx(Route, { path: "/nist", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(NistControls, {}) }) }) }), _jsx(Route, { path: "/zta", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ZeroTrust, {}) }) }) }), _jsx(Route, { path: "/execution", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ExecutionEnablers, {}) }) }) }), _jsx(Route, { path: "/poam", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(PoamManagement, {}) }) }) }), _jsx(Route, { path: "/monitoring", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ContinuousMonitoring, {}) }) }) }), _jsx(Route, { path: "/framework-upgrade", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(FrameworkUpgrade, {}) }) }) }), _jsx(Route, { path: "/export", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ExportPackage, {}) }) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }) }) })] }) }));
export default App;
