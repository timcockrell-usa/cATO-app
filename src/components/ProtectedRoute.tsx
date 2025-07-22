import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LocalLogin } from './LocalLogin';
import { isLocalAuthMode } from '../config/localAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback,
}) => {
  const { isLoading, isAuthenticated, user, login, error, hasAnyRole } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Authenticating...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    // Check if we're in local auth mode
    const useLocalAuth = isLocalAuthMode();
    
    if (useLocalAuth) {
      // Show local login form
      return (
        <LocalLogin 
          onLogin={async (loginResult) => {
            // Store the local user ID for persistence
            localStorage.setItem('localUserId', loginResult.account.homeAccountId);
            // The AuthContext will handle the state update
            window.location.reload();
          }}
          error={error || undefined}
        />
      );
    }

    // Show Azure AD login form
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">USAFRICOM cATO Dashboard</CardTitle>
            <CardDescription>
              Continuous Authority to Operate Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Sign in with your DoD credentials to access the cATO Dashboard
              </p>
            </div>
            
            <Button onClick={login} className="w-full h-12" size="lg">
              <Shield className="mr-2 h-4 w-4" />
              Sign In with Azure AD
            </Button>
            
            <div className="text-xs text-muted-foreground text-center space-y-2">
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

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles as any)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
              <CardDescription>
                You don't have the required permissions to access this resource.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Current User:</strong> {user?.displayName}</p>
                <p><strong>Current Roles:</strong> {user?.roles.join(', ')}</p>
                <p><strong>Required Roles:</strong> {requiredRoles.join(' or ')}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                If you believe you should have access to this resource, please contact
                your system administrator or security team.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

// Higher-order component for role-based access
export const withRoleProtection = (
  WrappedComponent: React.ComponentType<any>,
  requiredRoles: string[] = []
) => {
  return (props: any) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};
