import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
export const SimpleOnboardingGuard = ({ children }) => {
    // For now, just pass through all children without any checks
    console.log('SimpleOnboardingGuard: Passing through children');
    return _jsx(_Fragment, { children: children });
};
