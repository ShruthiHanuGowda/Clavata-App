import Snackbar from 'react-native-snackbar';
import { Colors, fontsFamily } from '../Theme';

type SnackBarSlug = 'error' | 'success' | '';

export const SnackBarMessage = (message: string, slug: SnackBarSlug = ''): void => {
  Snackbar.show({
    fontsFamily: fontsFamily.Mulish,
    text: message,
    duration: Snackbar.LENGTH_SHORT,
    numberOfLines: 5,
    backgroundColor:
      slug === 'error'
        ? Colors.error
        : slug === 'success'
        ? Colors.success
        : Colors.success,
  });
};

export const SnackBarWithAction = (
  message: string,
  slug: SnackBarSlug = '',
  actionLabel: string = 'UNDO',
  onPress: () => void = () => {}
): void => {
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_LONG,
    numberOfLines: 5,
    backgroundColor:
      slug === 'error'
        ? Colors.error
        : slug === 'success'
        ? Colors.success
        : Colors.success,
    action: {
      text: actionLabel,
      textColor: Colors.white,
      onPress: onPress,
    },
  });
};
