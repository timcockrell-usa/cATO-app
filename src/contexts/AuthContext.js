import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/authConfig';
import { isLocalAuthMode, getLocalUserById } from '../config/localAuth';
// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);
const AuthContext = createContext(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localUser, setLocalUser] = useState(null);
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
                }
                else {
                    // Initialize MSAL
                    await msalInstance.initialize();
                    const accounts = msalInstance.getAllAccounts();
                    if (accounts.length > 0) {
                        msalInstance.setActiveAccount(accounts[0]);
                        await loadUserData(accounts[0]);
                    }
                }
            }
            catch (err) {
                console.error('Authentication initialization error:', err);
                setError('Failed to initialize authentication');
            }
            finally {
                setIsLoading(false);
            }
        };
        initializeAuth();
    }, [useLocalAuth]);
    const mapLocalUserToUser = (localUser) => ({
        id: localUser.id,
        displayName: localUser.displayName,
        email: localUser.email,
        roles: localUser.roles,
        jobTitle: localUser.roles[0], // Use first role as job title
        department: 'Local Development',
        isAdmin: localUser.roles.includes('SystemAdmin')
    });
    const loadUserData = async (account) => {
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
            const user = {
                id: account.localAccountId,
                displayName: userData.displayName || account.name || 'Unknown User',
                email: userData.mail || account.username,
                jobTitle: userData.jobTitle,
                department: userData.department,
                roles,
                isAdmin: roles.includes('SystemAdmin'),
            };
            setUser(user);
        }
        catch (err) {
            console.error('Error loading user data:', err);
            setError('Failed to load user information');
        }
        finally {
            setIsLoading(false);
        }
    };
    const extractUserRoles = (tokenResponse) => {
        const roles = [];
        // Check for roles in token claims
        const tokenClaims = tokenResponse.idTokenClaims;
        if (tokenClaims?.roles) {
            roles.push(...tokenClaims.roles);
        }
        // Default role assignment based on group membership or other criteria
        // This should be customized based on your organization's role mapping
        if (tokenClaims?.groups) {
            // Map Azure AD groups to application roles
            const groupToRoleMap = {
                // Example mappings - update with your actual group IDs
                'admin-group-id': 'SystemAdmin',
                'analyst-group-id': 'SecurityAnalyst',
                'compliance-group-id': 'ComplianceOfficer',
                'auditor-group-id': 'Auditor',
                'ao-group-id': 'AuthorizingOfficial',
            };
            tokenClaims.groups.forEach((groupId) => {
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
        }
        catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    const loginRedirect = async () => {
        try {
            setError(null);
            await msalInstance.loginRedirect(loginRequest);
        }
        catch (err) {
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
        }
        catch (err) {
            console.error('Logout error:', err);
            setError(err.message || 'Logout failed');
        }
    };
    const acquireTokenSilent = async (scopes) => {
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
        }
        catch (error) {
            // If silent acquisition fails, try popup
            const response = await msalInstance.acquireTokenPopup({
                scopes,
                account,
            });
            return response.accessToken;
        }
    };
    const hasRole = (role) => {
        return user?.roles.includes(role) || false;
    };
    const hasAnyRole = (roles) => {
        return roles.some(role => hasRole(role));
    };
    const isAuthenticated = !!user;
    const value = {
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
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
};
