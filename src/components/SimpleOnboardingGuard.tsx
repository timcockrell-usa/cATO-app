/**
 * Simplified Onboarding Guard - For Testing
 */

import React from 'react';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const SimpleOnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  // For now, just pass through all children without any checks
  console.log('SimpleOnboardingGuard: Passing through children');
  return <>{children}</>;
};
