import React from 'react';
import {StyleProp, Text} from 'react-native';
import {normalize} from '../utils/screenSize';

const fonts = {
  fontRegular: 'Mulish-Regular',
  fontBold: 'Mulish-Bold',
  fontSemiBold: 'Mulish-SemiBold',
  fontExtraBold: 'Mulish-ExtraBold',
};

export function DText({
  children,
  fontStyle = 'fontBlack',
  style,
  textProps = {},
}) {
  let textStyle = {};

  if (style?.length) {
    for (const sty of style) {
      textStyle = {
        ...textStyle,
        ...sty,
      };
    }
  } else {
    textStyle = {
      ...style,
    };
  }
  return (
    <Text
      {...textProps}
      style={[
        {
          fontFamily: fonts[fontStyle],
          color: '#000',
        },
        textStyle,
      ]}>
      {children}
    </Text>
  );
}
