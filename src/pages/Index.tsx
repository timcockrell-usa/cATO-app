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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600/20 rounded-full">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">USAFRICOM cATO Dashboard</CardTitle>
          <CardDescription className="text-slate-400">
            Continuous Authority to Operate Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-300 mb-6">
              Sign in to access the cATO Dashboard and manage your organization's 
              security compliance and continuous monitoring.
            </p>
          </div>
          
          <Button onClick={login} className="w-full h-12" size="lg">
            <Shield className="mr-2 h-4 w-4" />
            Sign In to Continue
          </Button>
          
          <div className="text-xs text-slate-500 text-center space-y-2 pt-4 border-t border-slate-700">
            <p>
              This system is restricted to authorized DoD personnel only.
              Unauthorized access is prohibited.
            </p>
            <p>
              By accessing this system, you consent to monitoring and auditing
              of your activities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
