import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  ViewStyle,
  TextStyle,
  SafeAreaView,
} from 'react-native';
import {Colors, fontsFamily, Images} from '../Theme';

// Get device width for responsive layout
const deviceWidth = Dimensions.get('window').width;

// Define the props for the Header component
interface HeaderProps {
  headerTitle: string;
  hideBorder?: boolean;
  headerTextStyleProps?: TextStyle;
  containerStyle?: ViewStyle;
  backArrowStyle?: ViewStyle;
  hideBackIcon?: boolean;
  backBtn?: () => void;
  hideTitle?: boolean;
}

const Header: React.FC<HeaderProps> = props => {
  const {headerTitle, hideBorder, headerTextStyleProps} = props;

  return (
    <SafeAreaView
      style={[
        style.headerContainer,
        hideBorder
          ? {
              borderBottomWidth: 0,
              borderColor: 'rgba(255,255,255, 1)',
            }
          : {
              borderBottomWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.08)',
            },
        props.containerStyle,
      ]}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginLeft: 10}}>
        <View style={[style.headerIcons, props.backArrowStyle]}>
          {!props.hideBackIcon && (
            <TouchableOpacity
              onPress={() =>
                props.backBtn ? props.backBtn() : console.log('back')
              }>
              <Image source={Images.backHeaderArrow} />
            </TouchableOpacity>
          )}
        </View>
        {!props.hideTitle && (
          <Text style={[style.headerTitle, headerTextStyleProps]}>
            {headerTitle}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  headerContainer: {
    width: deviceWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 18,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: Colors.white,
  },
  headerIcons: {
    width: '15%',
  },
  uploadButton: {
    marginVertical: 15,
    backgroundColor: '#E7E9F0',
  },
  headerTitle: {
    width: '85%',
    fontSize: 18,
    color: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    left: -30,
    textAlign: 'center',
    fontFamily: fontsFamily.MulishBold,
  },
});

export default Header;
