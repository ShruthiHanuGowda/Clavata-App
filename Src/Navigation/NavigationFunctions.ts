import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigateBack = () => {
  navigationRef?.goBack();
};

export const navigate = (screenName: string, params?: Record<string, any>) => {
  try {
    if (navigationRef.current?.isReady()) {
      // Type check for the screen name
      navigationRef.current?.navigate(screenName as never, params as never);
    } else {
      console.warn('[Navigation] Navigation is not ready yet');
    }
  } catch (error) {
    console.error('[Navigation] Error during navigation:', error);
  }
};

export const navReset = (screenName: string, params?: Record<string, any>) => {
  console.log('reset to screen:', screenName);
  if (navigationRef.current?.isReady()) {
    navigationRef.current?.reset({
      index: 0,
      routes: [{name: screenName, params}],
    });
  } else {
    console.warn('Navigation not ready yet');
  }
};
