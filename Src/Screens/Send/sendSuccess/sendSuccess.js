import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {fontsFamily, Images} from '../../../Theme';
import {CustomImageButton} from '../../../Componants';
import {SCREEN_CONSTANT} from '../../../Navigation/constant';
import {navigateTo} from '../../../utils/navigationService';

const deviceHight = Dimensions.get('window').height;

export default function SendSucess(props) {
  const coinCode = props?.route?.params?.coinCode;
  const tokenAmount = props?.route?.params?.amount;
  const name = props?.route?.params?.name;
  return (
    <View style={{backgroundColor: '#009D94', flex: 1}}>
      <SafeAreaView style={{backgroundColor: '#009D94', flex: 1}}>
        {/* <Header hideBorder={true} hideBackIcon={true} /> */}
        <View style={{backgroundColor: '#009D94', flex: 1}}>
          <View style={{marginHorizontal: 30, marginTop: 100}}>
            <View style={styles.imgContainer}>
              <View style={styles.imgContainer1}>
                <Image source={Images.timer} style={{width: 24, height: 24}} />
              </View>
            </View>
          </View>
          <View>
            <Text style={styles.header}>Transaction Initiated</Text>
          </View>
          <View>
            <Text style={styles.content}>
              You transaction of sending {tokenAmount}{' '}
              {coinCode === 'WUSDC' ? 'wUSDC' : coinCode === 'WEURC' ? 'wEURC' : coinCode} to {name}{' '}
              has been initiated. You can check the status of the transaction in the transaction
              history
            </Text>
          </View>
          <View
            style={{
              marginTop: 60,
            }}
          >
            <Image source={Images.coin} style={{position: 'absolute'}} />
          </View>
          <View
            style={{
              marginTop: 5,
            }}
          >
            <Image source={Images.WalletPurse} />
          </View>
        </View>
        <CustomImageButton
          backgroundImage={Images.buttonBg}
          label="Go to Transactions"
          labelStyle={styles.textStyle}
          onPress={() =>
            navigateTo('D.Energy')
          }
          containerWrapper={{
            height: 51,
            borderRadius: 12,
            marginBottom: 20,
            marginHorizontal: 10,
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    width: '70%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontSize: 17, fontWeight: 'bold'},
  biometryText: {
    color: '#000',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 30,
  },
  textStyle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    lineHeight: 17.57,
  },

  header: {
    color: '#fff',
    fontFamily: fontsFamily.MulishBold,
    fontSize: 24,
    marginHorizontal: 30,
    marginTop: 20,
    // textAlign: 'center',
  },
  content: {
    color: '#fff',
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    marginHorizontal: 30,
    marginTop: 20,
    letterSpacing: 0.8,
    lineHeight: 22,
  },
  shadowLine: {
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, .1)',
    width: '100%',
    marginVertical: 20,
  },
  font: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 14,
    color: '#747474',
    textAlign: 'center',
  },
  fontContainer: {
    marginVertical: 10,
    marginHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgContainer: {
    backgroundColor: '#2eaba4',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    shadowColor: '#e8e6e6',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  imgContainer1: {
    backgroundColor: '#FFFFFF',
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
});
