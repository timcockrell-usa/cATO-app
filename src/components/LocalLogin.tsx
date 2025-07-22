import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Lock, Shield } from 'lucide-react';
import { authenticateLocalUser } from '@/config/localAuth';

interface LocalLoginProps {
  onLogin: (user: any) => void;
  error?: string;
}

export const LocalLogin: React.FC<LocalLoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">cATO Dashboard</h1>
          <p className="text-gray-600 mt-2">Local Development Mode</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || loginError) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error || loginError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Test Accounts */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Test Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-semibold">admin / admin123</p>
                <p className="text-gray-600">System Administrator</p>
              </div>
              <div>
                <p className="font-semibold">security / security123</p>
                <p className="text-gray-600">Security Analyst</p>
              </div>
              <div>
                <p className="font-semibold">compliance / compliance123</p>
                <p className="text-gray-600">Compliance Officer</p>
              </div>
              <div>
                <p className="font-semibold">ao / ao123</p>
                <p className="text-gray-600">Authorizing Official</p>
              </div>
              <div>
                <p className="font-semibold">auditor / auditor123</p>
                <p className="text-gray-600">Security Auditor</p>
              </div>
              <div>
                <p className="font-semibold">viewer / viewer123</p>
                <p className="text-gray-600">Viewer User</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Local development mode - no Azure Entra ID required</p>
          <p>Switch to production mode by setting VITE_USE_LOCAL_AUTH=false</p>
        </div>
      </div>
    </div>
  );
};
