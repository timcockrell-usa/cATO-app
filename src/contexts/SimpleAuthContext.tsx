/**
 * Simplified Auth Context for Testing
 * This removes MSAL initialization to isolate white screen issues
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
  organizationId?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  checkOnboardingStatus: () => Promise<boolean>;
  markOnboardingComplete: (organizationId: string) => Promise<void>;
  isFirstUserInOrganization: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('demoUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async () => {
    const demoUser = {
      id: 'test-user-123',
      displayName: 'Demo User',
      email: 'demo@usafricom.mil',
      roles: ['User', 'Admin'],
      isAdmin: true,
      organizationId: 'usafricom',
      onboardingCompleted: true
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    localStorage.removeItem('demoUser');
    setUser(null);
  };

  const checkOnboardingStatus = async (): Promise<boolean> => {
    return user?.onboardingCompleted ?? false;
  };

  const markOnboardingComplete = async (organizationId: string) => {
    if (user) {
      const updatedUser = { ...user, onboardingCompleted: true };
      setUser(updatedUser);
      localStorage.setItem('demoUser', JSON.stringify(updatedUser));
    }
  };

  const isFirstUserInOrganization = async (): Promise<boolean> => {
    return true;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
    checkOnboardingStatus,
    markOnboardingComplete,
    isFirstUserInOrganization,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
