import React from 'react';
import {
  StyleProp,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface AppGradientProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors: [string, ...string[]];
}

const AppGradient: React.FC<AppGradientProps> = ({
  children,
  style,
  colors,
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

export default AppGradient;

