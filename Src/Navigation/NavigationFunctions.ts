import {
  createNavigationContainerRef,
} from '@react-navigation/native';

import {
  RootStackParamList,
} from '../../types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

// ============================================================
// GO BACK
// ============================================================

export const navigateBack = () => {
  if (!navigationRef.isReady()) {
    console.warn('[Navigation] Navigation is not ready');
    return;
  }

  navigationRef.goBack();
};

// ============================================================
// NAVIGATE
// ============================================================

export const navigate = (
  screenName: keyof RootStackParamList,
  params?: any,
) => {
  try {
    if (!navigationRef.isReady()) {
      console.warn('[Navigation] Navigation is not ready');
      return;
    }

    if (params !== undefined) {
      (navigationRef as any).navigate(
        screenName,
        params,
      );
    } else {
      (navigationRef as any).navigate(
        screenName,
      );
    }
  } catch (error) {
    console.error(
      '[Navigation] Navigate error:',
      error,
    );
  }
};

// ============================================================
// RESET ROOT NAVIGATION
// ============================================================

export const navReset = (
  screenName: keyof RootStackParamList,
  params?: any,
) => {
  try {
    if (!navigationRef.isReady()) {
      console.warn(
        '[Navigation] Navigation is not ready',
      );
      return;
    }

    const route: any = {
      name: screenName,
    };

    if (params !== undefined) {
      route.params = params;
    }

    console.log(
      '[Navigation] RESET TO:',
      screenName,
      params,
    );

    navigationRef.reset({
      index: 0,
      routes: [route],
    });

  } catch (error) {
    console.error(
      '[Navigation] Reset error:',
      error,
    );
  }
};