import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { Animation } from '../Theme';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: 'authScreens' | 'intro' | 'root';
  fallback?: React.ComponentType;
}

const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <LottieView
      source={Animation.loaderAnimation}
      autoPlay
      loop
      style={{ width: 150, height: 150 }}
    />
  </View>
);

/**
 * Authentication Guard Component
 * Protects child components based on authentication status
 * 
 * @param children - Components to protect
 * @param requireAuth - Whether authentication is required (default: true)
 * @param redirectTo - Where to redirect unauthenticated users
 * @param fallback - Custom loading component
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = 'authScreens',
  fallback: CustomFallback,
}) => {
  const { canAccess, shouldShowLoader } = useAuthGuard({
    requireAuth,
    redirectTo,
    showLoader: true,
  });

  // Show loading fallback while checking authentication
  if (shouldShowLoader) {
    return CustomFallback ? <CustomFallback /> : <LoadingFallback />;
  }

  // Only render children if user has access
  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;