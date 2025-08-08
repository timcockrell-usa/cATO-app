import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Simplified Auth Context for Testing
 * This removes MSAL initialization to isolate white screen issues
 */
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('demoUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            }
            catch (e) {
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
    const checkOnboardingStatus = async () => {
        return user?.onboardingCompleted ?? false;
    };
    const markOnboardingComplete = async (organizationId) => {
        if (user) {
            const updatedUser = { ...user, onboardingCompleted: true };
            setUser(updatedUser);
            localStorage.setItem('demoUser', JSON.stringify(updatedUser));
        }
    };
    const isFirstUserInOrganization = async () => {
        return true;
    };
    const value = {
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
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
};
