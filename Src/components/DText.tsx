import React from 'react';
import {Text, TextProps, TextStyle, StyleSheet} from 'react-native';

const fonts = {
  fontRegular: 'Mulish-Regular',
  fontBold: 'Mulish-Bold',
  fontSemiBold: 'Mulish-SemiBold',
  fontExtraBold: 'Mulish-ExtraBold',
} as const;

type FontStyle = keyof typeof fonts;

interface DTextProps {
  children: React.ReactNode;
  fontStyle?: FontStyle;
  style?: TextStyle | TextStyle[];
  textProps?: Omit<TextProps, 'style' | 'children'>;
}

export function DText({
  children,
  fontStyle = 'fontRegular',
  style,
  textProps = {},
}: DTextProps) {
  let textStyle: TextStyle = {};

  if (Array.isArray(style)) {
    for (const sty of style) {
      textStyle = {
        ...textStyle,
        ...sty,
      };
    }
  } else if (style) {
    textStyle = {
      ...style,
    };
  }
  return (
    <Text
      {...textProps}
      style={[styles.baseText, {fontFamily: fonts[fontStyle]}, textStyle]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  baseText: {
    color: '#000',
  },
});
