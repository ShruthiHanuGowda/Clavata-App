import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { fontsFamily } from '../Theme';

interface MenuListProps {
  onPress: () => void;
  img: ImageSourcePropType;
  title: string;
}

const MenuList: React.FC<MenuListProps> = ({onPress, img, title}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.rowContainer}>
        <View style={styles.leftContainer}>
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
  container: {
    paddingVertical: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
