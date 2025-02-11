import {StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../../Theme';

interface Styles {
  container: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});

export default styles;
