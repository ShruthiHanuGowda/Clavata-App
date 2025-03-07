import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ImageBackground,
  View,
} from 'react-native';
import {fontsFamily} from '../Theme';

export default function CustomImageButton(props) {
  return (
    <TouchableOpacity
      style={[styles.buttonWrap, props.containerWrapper]}
      onPress={() => props.onPress()}
      disabled={props.disable}
      activeOpacity={props.disable ? 0.2 : 0.8}>
      {props?.disable ? (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#BCBFBF',
              backgroundColor: '#BCBFBF',
              width: '98%',
              height: '100%',
              marginHorizontal: 10,
              borderRadius: 7,
            }}>
            <View>
              <Text
                style={{
                  fontFamily: fontsFamily.MulishBold,
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 14,
                }}>
                {props.label}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <ImageBackground
          style={[styles.row, props.bgImg]}
          source={props.backgroundImage}
          resizeMode="stretch">
          {props.leftImage && (
            <Image
              source={props.leftImage.name}
              style={[styles.leftImg, props.leftImage.style]}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.buttonText,
              props.labelStyle,
              {
                fontFamily: props?.disable
                  ? fontsFamily.MulishBold
                  : fontsFamily.MulishBold,
              },
            ]}>
            {props.label}
          </Text>
          {props.rightImage && (
            <Image
              source={props.rightImage.name}
              style={[styles.rightImg, props.rightImage.style]}
              resizeMode="contain"
            />
          )}
        </ImageBackground>
      )}
    </TouchableOpacity>
  );
}

var styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    width: '100%',

    // margin:5
  },
  buttonText: {
    // fontFamily: FontFamily.MontserratSemiBold,
    // lineHeight: 13.63,
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    paddingBottom: 3,
  },
  buttonWrap: {
    height: 55,
    // width: "100%",
    borderRadius: 5,
    // overflow: "hidden",
  },
  disable: {
    opacity: 0.7,
  },
  rightImg: {
    transform: [{rotateY: '180deg'}],
    height: 10,
    width: 17,
    left: 10,
    tintColor: '#fff',
  },
  leftImg: {
    // transform: [{ rotateY: "180deg" }],
    width: 17,
    right: 5,
    tintColor: '#fff',
  },
});
