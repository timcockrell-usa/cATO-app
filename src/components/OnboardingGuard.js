import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Onboarding Route Guard - Fixed Version
 * Redirects users to onboarding if they haven't completed setup
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
export const OnboardingGuard = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const [onboardingComplete, setOnboardingComplete] = useState(null);
    const [isChecking, setIsChecking] = useState(true);
    useEffect(() => {
        const checkStatus = async () => {
            console.log('OnboardingGuard: Checking status', { user, isLoading });
            if (isLoading) {
                return; // Still loading auth, wait
            }
            if (!user) {
                console.log('OnboardingGuard: No user, allowing access');
                setOnboardingComplete(true); // Allow access when no user (let auth handle it)
                setIsChecking(false);
                return;
            }
            try {
                // Simple check - look for onboarding completion in user object or localStorage
                const hasCompletedOnboarding = user.onboardingCompleted ||
                    localStorage.getItem(`onboarding_${user.id}`) === 'completed';
                console.log('OnboardingGuard: Onboarding status', hasCompletedOnboarding);
                setOnboardingComplete(hasCompletedOnboarding);
            }
            catch (error) {
                console.error('OnboardingGuard: Error checking status', error);
                // If there's an error, assume onboarding is needed
                setOnboardingComplete(false);
            }
            finally {
                setIsChecking(false);
            }
        };
        checkStatus();
    }, [user, isLoading]);
    // Show loading while checking authentication and onboarding status
    if (isLoading || isChecking) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1a1a1a',
                color: 'white'
            }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { marginBottom: '16px' }, children: "Loading..." }), _jsx("p", { children: "Checking authentication..." })] }) }));
    }
    // If not authenticated, let the auth system handle it
    if (!user) {
        console.log('OnboardingGuard: No user, passing through children');
        return _jsx(_Fragment, { children: children });
    }
    // Routes that don't require onboarding completion
    const allowedRoutes = ['/onboarding', '/logout', '/unauthorized'];
    const isAllowedRoute = allowedRoutes.some(route => location.pathname.startsWith(route));
    console.log('OnboardingGuard: Route check', {
        pathname: location.pathname,
        isAllowedRoute,
        onboardingComplete
    });
    // If onboarding is not complete and user is trying to access a protected route
    if (onboardingComplete === false && !isAllowedRoute) {
        console.log('OnboardingGuard: Redirecting to onboarding');
        return _jsx(Navigate, { to: "/onboarding", replace: true });
    }
    // If onboarding is complete and user is trying to access onboarding page
    if (onboardingComplete === true && location.pathname === '/onboarding') {
        console.log('OnboardingGuard: Redirecting to dashboard');
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    // Allow access to the requested route
    console.log('OnboardingGuard: Allowing access to route');
    return _jsx(_Fragment, { children: children });
};
