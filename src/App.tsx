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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <Routes>
              {/* Home page */}
              <Route path="/" element={<Index />} />
              
              {/* Protected application routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/nist" element={
                <ProtectedRoute>
                  <Layout>
                    <NistControls />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/zta" element={
                <ProtectedRoute>
                  <Layout>
                    <ZeroTrust />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/execution" element={
                <ProtectedRoute>
                  <Layout>
                    <ExecutionEnablers />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/poam" element={
                <ProtectedRoute>
                  <Layout>
                    <PoamManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/monitoring" element={
                <ProtectedRoute>
                  <Layout>
                    <ContinuousMonitoring />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/framework-upgrade" element={
                <ProtectedRoute>
                  <Layout>
                    <FrameworkUpgrade />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/export" element={
                <ProtectedRoute>
                  <Layout>
                    <ExportPackage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
