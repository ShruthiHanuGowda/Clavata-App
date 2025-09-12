import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../../types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigateBack = () => {
  navigationRef?.goBack();
};

export const navigate = <T extends keyof RootStackParamList>(
  screenName: T,
  ...params: undefined extends RootStackParamList[T]
    ? [RootStackParamList[T]?]
    : [RootStackParamList[T]]
) => {
  try {
    if (navigationRef.current?.isReady()) {
      if (params.length > 0 && params[0] !== undefined) {
        navigationRef.current.navigate(screenName, params[0]);
      } else {
        navigationRef.current.navigate(screenName);
      }
    } else {
      console.warn('[Navigation] Navigation is not ready yet');
    }
  } catch (error) {
    console.error('[Navigation] Error during navigation:', error);
  }
};

export const navReset = <T extends keyof RootStackParamList>(
  screenName: T,
  ...params: undefined extends RootStackParamList[T]
    ? [RootStackParamList[T]?]
    : [RootStackParamList[T]]
) => {
  if (navigationRef.current?.isReady()) {
    const routeConfig =
      params.length > 0 && params[0] !== undefined
        ? {name: screenName, params: params[0]}
        : {name: screenName};
    navigationRef.current.reset({
      index: 0,
      routes: [routeConfig],
    });
  } else {
    console.warn('Navigation not ready yet');
  }
};
