import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigateBack = () => {
  navigationRef?.goBack();
};

export const navigate = (screenName: string, params?: Record<string, any>) => {
  // Check if the user is logged in, or if the screen doesn't require login

  if (navigationRef.current?.isReady()) {
    navigationRef.current?.navigate(screenName, params);
  } else {
    console.warn('Navigation not ready yet');
  }
};
