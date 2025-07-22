import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NistControls from "./pages/NistControls";
import ZeroTrust from "./pages/ZeroTrust";
import ExecutionEnablers from "./pages/ExecutionEnablers";
import PoamManagement from "./pages/PoamManagement";
import ExportPackage from "./pages/ExportPackage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route 
                  path="/nist" 
                  element={
                    <ProtectedRoute requiredRoles={['SecurityAnalyst', 'ComplianceOfficer', 'SystemAdmin', 'AO']}>
                      <NistControls />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/zta" 
                  element={
                    <ProtectedRoute requiredRoles={['SecurityAnalyst', 'ComplianceOfficer', 'SystemAdmin', 'AO']}>
                      <ZeroTrust />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/execution" 
                  element={
                    <ProtectedRoute requiredRoles={['SecurityAnalyst', 'ComplianceOfficer', 'SystemAdmin', 'AO']}>
                      <ExecutionEnablers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/poam" 
                  element={
                    <ProtectedRoute requiredRoles={['SecurityAnalyst', 'ComplianceOfficer', 'SystemAdmin']}>
                      <PoamManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/export" 
                  element={
                    <ProtectedRoute requiredRoles={['ComplianceOfficer', 'SystemAdmin', 'AO']}>
                      <ExportPackage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
