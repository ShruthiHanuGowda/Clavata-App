import Snackbar from 'react-native-snackbar';
import {Colors, fontsFamily} from '../Theme';

export const SnackBarMessage = (message, slug = '') => {
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
        : Colors.purple,
  });
};
