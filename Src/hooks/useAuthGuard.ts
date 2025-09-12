import { useEffect, useCallback } from 'react';
import { useAuth, AuthState } from '../providers/AuthProvider';
import { navReset } from '../Navigation/NavigationFunctions';

export interface AuthGuardOptions {
  redirectTo?: 'authScreens' | 'intro' | 'root';
  requireAuth?: boolean;
  showLoader?: boolean;
}

/**
 * Hook for protecting routes with authentication
 * 
 * @param options - Configuration options for the auth guard
 * @returns Object with authentication status and utilities
 */
export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const {
    redirectTo = 'authScreens',
    requireAuth = true,
    showLoader = true,
  } = options;

  const {
    authState,
    isAuthenticated,
    isLoading,
    checkAuthStatus,
    error,
    clearError,
  } = useAuth();

  /**
   * Redirect user based on authentication status
   */
  const handleRedirect = useCallback((destination: string) => {
    setTimeout(() => {
      navReset(destination as any);
    }, 100);
  }, []);

  /**
   * Check if user should be redirected
   */
  const shouldRedirect = useCallback(() => {
    if (requireAuth && authState === AuthState.UNAUTHENTICATED) {
      return redirectTo;
    }
    
    if (!requireAuth && authState === AuthState.AUTHENTICATED) {
      return 'appScreens';
    }

    return null;
  }, [requireAuth, authState, redirectTo]);

  /**
   * Perform authentication check and redirect if necessary
   */
  const performAuthCheck = useCallback(async () => {
    try {
      // If we're still loading initial auth state, wait
      if (isLoading) return;

      // Clear any existing errors
      if (error) {
        clearError();
      }

      // Verify current authentication status
      const authenticated = await checkAuthStatus();

      // Determine if redirect is needed
      const redirectDestination = shouldRedirect();
      
      if (redirectDestination) {
        handleRedirect(redirectDestination);
      }

      return authenticated;
    } catch (error) {
      console.error('Auth guard check failed:', error);
      if (requireAuth) {
        handleRedirect(redirectTo);
      }
      return false;
    }
  }, [isLoading, error, clearError, checkAuthStatus, shouldRedirect, handleRedirect, requireAuth, redirectTo]);

  /**
   * Initialize auth guard on mount and when auth state changes
   */
  useEffect(() => {
    performAuthCheck();
  }, [performAuthCheck]);

  /**
   * Manual refresh of auth status
   */
  const refreshAuthStatus = useCallback(async () => {
    return await performAuthCheck();
  }, [performAuthCheck]);

  return {
    // Authentication status
    isAuthenticated,
    isLoading,
    authState,
    error,

    // Auth guard utilities
    refreshAuthStatus,
    shouldShowLoader: showLoader && isLoading,
    canAccess: requireAuth ? isAuthenticated : true,

    // Error handling
    clearError,
  };
};

/**
 * Higher-order component for protecting screens with authentication
 * 
 * @param WrappedComponent - Component to protect
 * @param options - Auth guard options
 * @returns Protected component
 */
export const withAuthGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: AuthGuardOptions = {}
) => {
  return (props: P) => {
    const { canAccess, shouldShowLoader, isLoading } = useAuthGuard(options);

    // Show loader while checking authentication
    if (shouldShowLoader || isLoading) {
      // You can replace this with your app's loading component
      return null;
    }

    // Only render component if user has access
    if (!canAccess) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default useAuthGuard;