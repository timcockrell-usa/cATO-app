import React from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
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
  const { isLoading, isAuthenticated, user, login, error } = useAuth();

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={login} 
              className="w-full"
              size="lg"
            >
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simple role check for SimpleAuthContext (optional)
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles?.includes(role) || user.isAdmin
    );
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-fit">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
              <CardDescription>
                You don't have the required permissions to access this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Required roles: {requiredRoles.join(', ')}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

// Higher-order component for role-based access (simplified for SimpleAuthContext)
export const withRoleProtection = (
  WrappedComponent: React.ComponentType<any>,
  requiredRoles: string[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
