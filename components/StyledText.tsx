import {Text, TextProps} from './Themed';
import {StyleSheet} from 'react-native';

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, styles.monoText]} />;
}

const styles = StyleSheet.create({
  monoText: {
    fontFamily: 'space-mono',
  },
});
