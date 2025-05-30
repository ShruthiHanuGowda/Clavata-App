import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {fontsFamily, Images} from '../Theme';

const MenuList = ({onPress, img, title}) => {
  return (
    <TouchableOpacity style={{paddingVertical: 10}} onPress={onPress}>
      <View style={styles.rowContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={styles.imgContainer}>
            <Image source={img} style={styles.imgStyle} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        {/* <Image source={Images.nextarrow} style={styles.nextArrow} /> */}
      </View>
    </TouchableOpacity>
  );
};

export default MenuList;

const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    marginTop: 1,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imgContainer: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    width: 36,
  },
  imgStyle: {
    width: 14,
    height: 14,
    resizeMode: 'cover',
  },
  title: {
    marginLeft: 12,
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 14,
    color: '#414141',
  },
  nextArrow: {
    height: 16,
    width: 16,
  },
});
