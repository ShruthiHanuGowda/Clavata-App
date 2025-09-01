import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Clipboard,
} from 'react-native';
import {ScreenWidth} from '@rneui/base';
import {SnackBarMessage} from '../utils/snackBar';
import images from '../Theme/images';
import {fontsFamily} from '../Theme';

const ReceiverDetails = ({data}: any) => {
  const capitalize = (str: string) => {
    return str?.charAt(0)?.toUpperCase();
  };
  const copy = async (address: string) => {
    Clipboard.setString(address);
    SnackBarMessage('Address Copied');
  };
  return (
    <View style={styles.container}>
      <View style={{...styles.avatar, backgroundColor: data?.colorCode}}>
        <Text style={styles.avatarTextStyle} fontStyle="fontBold">
          {capitalize(data?.name)}
        </Text>
      </View>
      <Text style={styles.nameStyle} fontStyle="fontBold">
        {data?.name}
      </Text>
      <View style={styles.wrapper}>
        <View style={styles.walletIdBox}>
          <Text style={styles.titleStyle} fontStyle="fontRegular">
            Wallet ID
          </Text>
          <View>
            <Text ellipsizeMode="tail" numberOfLines={2} style={styles.address}>
              {data?.beneficiaryAddress}
            </Text>
          </View>
        </View>
        <View style={styles.copyBox}>
          <TouchableOpacity onPress={() => copy(data?.beneficiaryAddress)}>
            <Image
              source={images.collectCopy}
              style={styles.copyImg}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ReceiverDetails;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  titleStyle: {
    fontSize: 12,
    lineHeight: 15,
    color: '#9F9F9F',
    marginHorizontal: 5,
  },
  avatar: {
    borderWidth: 1,
    borderRadius: 30,
    width: 56,
    height: 56,
    borderColor: '#fff',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextStyle: {
    fontSize: 24,
    color: '#fff',
  },
  wrapper: {
    flexDirection: 'row',
    marginLeft: 21,
    marginRight: 21,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameStyle: {
    fontSize: 20,
    color: '#000',
    margin: 9,
  },
  walletIdBox: {
    borderColor: '#FAFAFA',
    backgroundColor: '#FAFAFA',
    minHeight: 35,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  copyBox: {
    borderColor: '#FAFAFA',
    backgroundColor: '#FAFAFA',
    borderRadius: 48,
    borderWidth: 1,
    marginLeft: 6,
    width: 37,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyImg: {
    width: 20,
    height: 20,
  },
  address: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    maxWidth: ScreenWidth - 180,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
});
