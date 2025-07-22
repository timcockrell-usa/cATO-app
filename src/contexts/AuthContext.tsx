import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  PublicClientApplication, 
  AccountInfo, 
  AuthenticationResult,
  SilentRequest,
  PopupRequest 
} from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/authConfig';
import { isLocalAuthMode, getLocalUserById, type LocalUser } from '../config/localAuth';
import type { UserRole } from '../config/authConfig';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

export interface User {
  id: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  jobTitle?: string;
  department?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  loginRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  acquireTokenSilent: (scopes: string[]) => Promise<string>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);

  // Check if we're in local auth mode
  const useLocalAuth = isLocalAuthMode();

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (useLocalAuth) {
          // Check for stored local session
          const storedUserId = localStorage.getItem('localUserId');
          if (storedUserId) {
            const user = getLocalUserById(storedUserId);
            if (user) {
              setLocalUser(user);
              setUser(mapLocalUserToUser(user));
            }
          }
        } else {
          // Initialize MSAL
          await msalInstance.initialize();
          const accounts = msalInstance.getAllAccounts();
          
          if (accounts.length > 0) {
            msalInstance.setActiveAccount(accounts[0]);
            await loadUserData(accounts[0]);
          }
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [useLocalAuth]);

  const mapLocalUserToUser = (localUser: LocalUser): User => ({
    id: localUser.id,
    displayName: localUser.displayName,
    email: localUser.email,
    roles: localUser.roles as UserRole[],
    jobTitle: localUser.roles[0], // Use first role as job title
    department: 'Local Development',
    isAdmin: localUser.roles.includes('SystemAdmin')
  });

  const loadUserData = async (account: AccountInfo) => {
    try {
      setIsLoading(true);
      
      // Get access token for Microsoft Graph
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      // Fetch user data from Microsoft Graph
      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (!graphResponse.ok) {
        throw new Error('Failed to fetch user data from Microsoft Graph');
      }

      const userData = await graphResponse.json();
      
      // Extract roles from token claims or group memberships
      const roles = extractUserRoles(tokenResponse);

      const user: User = {
        id: account.localAccountId,
        displayName: userData.displayName || account.name || 'Unknown User',
        email: userData.mail || account.username,
        jobTitle: userData.jobTitle,
        department: userData.department,
        roles,
        isAdmin: roles.includes('SystemAdmin'),
      };

      setUser(user);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user information');
    } finally {
      setIsLoading(false);
    }
  };

  const extractUserRoles = (tokenResponse: AuthenticationResult): UserRole[] => {
    const roles: UserRole[] = [];
    
    // Check for roles in token claims
    const tokenClaims = tokenResponse.idTokenClaims as any;
    
    if (tokenClaims?.roles) {
      roles.push(...tokenClaims.roles);
    }

    // Default role assignment based on group membership or other criteria
    // This should be customized based on your organization's role mapping
    if (tokenClaims?.groups) {
      // Map Azure AD groups to application roles
      const groupToRoleMap: Record<string, UserRole> = {
        // Example mappings - update with your actual group IDs
        'admin-group-id': 'SystemAdmin',
        'analyst-group-id': 'SecurityAnalyst',
        'compliance-group-id': 'ComplianceOfficer',
        'auditor-group-id': 'Auditor',
        'ao-group-id': 'AuthorizingOfficial',
      };

      tokenClaims.groups.forEach((groupId: string) => {
        const role = groupToRoleMap[groupId];
        if (role && !roles.includes(role)) {
          roles.push(role);
        }
      });
    }

    // Ensure every user has at least the Viewer role
    if (roles.length === 0) {
      roles.push('Viewer');
    }

    return roles;
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await msalInstance.loginPopup(loginRequest);
      msalInstance.setActiveAccount(response.account);
      await loadUserData(response.account);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginRedirect = async () => {
    try {
      setError(null);
      await msalInstance.loginRedirect(loginRequest);
    } catch (err: any) {
      console.error('Login redirect error:', err);
      setError(err.message || 'Login redirect failed');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const account = msalInstance.getActiveAccount();
      
      if (account) {
        await msalInstance.logoutPopup({
          account,
          mainWindowRedirectUri: msalConfig.auth.postLogoutRedirectUri,
        });
      }
      
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
    }
  };

  const acquireTokenSilent = async (scopes: string[]): Promise<string> => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
      throw new Error('No active account found');
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes,
        account,
      });
      return response.accessToken;
    } catch (error) {
      // If silent acquisition fails, try popup
      const response = await msalInstance.acquireTokenPopup({
        scopes,
        account,
      });
      return response.accessToken;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginRedirect,
    logout,
    acquireTokenSilent,
    hasRole,
    hasAnyRole,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
