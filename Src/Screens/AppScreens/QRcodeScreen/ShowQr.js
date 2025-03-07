import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {DText} from '../../../Componants/DText';
import {fontsFamily, Images} from '../../../Theme';
import images from '../../../Theme/images';

const ShowQr = ({coinCode, address, name}) => {
  const saveQrToDisk = async () => {};

  const onShare = async () => {};

  const copy = () => {};

  return (
    <View style={styles.boxContainer}>
      <View style={styles.outerBox}>
        <View style={styles.qrCodeAlign}>
          <Image source={images.tempqrcode} style={{height: 350, width: 350}} />
        </View>
        <View style={styles.qrUsernameAlign}>
          <Text style={styles.username} numberOfLines={1}>
            test
          </Text>
        </View>
        <View style={styles.qrBtnAlign}>
          <TouchableOpacity style={styles.downloadBtn} onPress={saveQrToDisk}>
            <DText fontStyle="fontBold" style={styles.downloadText}>
              Download
            </DText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContainer} onPress={onShare}>
            <DText fontStyle="fontBold" style={styles.shareText}>
              Share
            </DText>
          </TouchableOpacity>
        </View>
        <View style={styles.addressBox}>
          <View style={styles.addressAlign}>
            <View style={{width: '85%'}}>
              <Text style={styles.content} numberOfLines={2}>
                <Text style={styles.address}>{address}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={copy} style={styles.copyIconAlign}>
              <Image
                source={Images.copy}
                style={styles.copyIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ShowQr;

const styles = StyleSheet.create({
  boxContainer: {
    marginHorizontal: 20,
  },

  outerBox: {
    borderWidth: 1,
    borderColor: '#F9F9F9',
    backgroundColor: '#F9F9F9',
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  qrCodeAlign: {
    marginTop: 32,
    alignContent: 'center',
    justifyContent: 'center',
  },
  qrUsernameAlign: {
    marginTop: 26,
    alignSelf: 'center',
    marginBottom: 20,
  },
  qrBtnAlign: {
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignContent: 'space-between',
  },
  downloadBtn: {
    width: '45%',
    borderColor: '#000',
    borderWidth: 1,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 7,
  },
  addressBox: {
    width: '100%',
    borderColor: '#E8E8E850',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    marginTop: 20,
  },
  addressAlign: {
    padding: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 28,
    color: '#000',
  },
  buttonContainer: {
    width: '45%',
    borderColor: '#000',
    borderWidth: 1.2,
    padding: 12,
    borderRadius: 7,
  },

  shareText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
  },
  downloadText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ffff',
  },
  content: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#00201B',
    letterSpacing: 1,
    marginBottom: 5,
  },
  address: {
    fontSize: 12,
    color: '#333333',
    fontFamily: fontsFamily.MulishBold,
  },
  copyIconAlign: {
    width: '15%',
    alignItems: 'center',
  },
  copyIcon: {
    width: 30,
    height: 30,
  },
});
