import React from 'react';
import {ActivityIndicator, StyleProp, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import {Colors} from '../Theme';

interface DButtonProps {
  type?: 'primary' | 'secondary' | 'transparent'; // button type
  style?: StyleProp<ViewStyle>; // custom styles
  loading?: boolean; // loading state
  disabled?: boolean; // disabled state
  children: React.ReactNode; // content of the button
  onPress: any;
}

const DButton: React.FC<DButtonProps> = (props) => {
  return (
    <TouchableOpacity
      {...props}
      onPress={props.onPress}
      style={[
        styles.button,
        styles[props.type || 'primary'], // default to 'primary' if type is not provided
        props.disabled && styles.disabled,
        props.style,
      ]}
      disabled={props.disabled}
    >
      {props.loading ? <ActivityIndicator /> : props.children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 154,
    padding: 15,
    borderRadius: 5,
  },
  primary: {
    backgroundColor: Colors.black,
  },
  secondary: {
    padding: 13,
    borderWidth: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.black,
  },
  disabled: {
    opacity: 0.3,
  },
  transparent: {},
});

export default DButton;
