import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ImageBackground,
  View,
  TouchableOpacityProps,
} from 'react-native';
import {fontsFamily} from '../Theme';

interface CustomImageButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  backgroundImage: any;
  leftImage?: {name: any; style?: any};
  rightImage?: {name: any; style?: any};
  labelStyle?: object;
  containerWrapper?: object;
  disable?: boolean;
  bgImg?: object;
}

const CustomImageButton: React.FC<CustomImageButtonProps> = props => {
  return (
    <TouchableOpacity
      style={[styles.buttonWrap, props.containerWrapper]}
      onPress={() => props.onPress()}
      disabled={props.disable}
      activeOpacity={props.disable ? 0.2 : 0.8}>
      {props?.disable ? (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <View
            style={[
              styles.disabledButton,
              {
                borderWidth: 1,
                borderColor: '#BCBFBF',
                backgroundColor: '#BCBFBF',
                marginHorizontal: 10,
              },
            ]}>
            <Text style={[styles.buttonText, {color: '#fff'}]}>
              {props.label}
            </Text>
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
                fontFamily: fontsFamily.MulishBold,
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
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    paddingBottom: 3,
  },
  buttonWrap: {
    height: 55,
    borderRadius: 5,
  },
  disabledButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    height: '100%',
    width: '98%',
  },
  rightImg: {
    transform: [{rotateY: '180deg'}],
    height: 10,
    width: 17,
    left: 10,
    tintColor: '#fff',
  },
  leftImg: {
    width: 17,
    right: 5,
    tintColor: '#fff',
  },
});

export default CustomImageButton;
