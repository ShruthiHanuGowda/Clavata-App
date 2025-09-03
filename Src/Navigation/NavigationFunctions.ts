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
      navigationRef.current?.navigate(screenName, params[0]);
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
  console.log('reset to screen:', screenName);
  if (navigationRef.current?.isReady()) {
    navigationRef.current?.reset({
      index: 0,
      routes: [{name: screenName, params: params[0]}],
    });
  } else {
    console.warn('Navigation not ready yet');
  }
};
