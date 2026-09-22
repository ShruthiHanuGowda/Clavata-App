import React from 'react';

import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

import Colors from '../Theme/Colors';

interface DButtonProps {
  type?: 'primary' | 'secondary' | 'transparent';
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onPress: any;
}

const DButton: React.FC<DButtonProps> = ({
  type = 'primary',
  style,
  loading = false,
  disabled = false,
  children,
  onPress,
}) => {
  /*
   * If children is a plain string or number,
   * automatically wrap it in <Text>.
   *
   * This prevents:
   * "Text strings must be rendered within a <Text> component"
   */
  const buttonContent =
    typeof children === 'string' ||
    typeof children === 'number' ? (
      <Text style={styles.buttonText}>
        {children}
      </Text>
    ) : (
      children
    );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        styles[type],
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        buttonContent
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 154,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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

  transparent: {},

  disabled: {
    opacity: 0.3,
  },

  buttonText: {
    color: Colors.white,
    textAlign: 'center',
  },
});

export default DButton;