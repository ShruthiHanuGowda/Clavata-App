import React, {useContext, useEffect, useState} from 'react';
import {View, Text, TextInput, Image, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CustomImageButton, Header} from '../../../Componants';
import {StyleSheet} from 'react-native';
import {Colors, fontsFamily, Images} from '../../../Theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
import AppContext from '../../../../AppContext';
import {ScreenWidth} from '@rneui/base';
import {DText} from '../../../Componants/DText';
// import DConfirmBottomSheet from '../../../Componants/DConfirmBottomSheet';
import style from '../Swap/swapStyle';
import {Path, Svg} from 'react-native-svg';
import {marketIcons} from '../../../Theme/variable';
import {navigateBack} from '../../../Navigation/NavigationFunctions';

export default function TradeCoin(props) {
  const coinCode = props?.route?.params?.coinCode;
  const [buyWatt, setBuyWatt] = useState(true);

  const {getBalance, balanceData} = useContext(AppContext).portfolio;
  const coinData = balanceData[coinCode];

  const [tokenAmount, setTokenAmount] = useState('');
  const [networkFee, setNetworkfee] = useState({});
  const balance = parseFloat(coinData?.tokenBalance).toFixed(2);
  const setValue = async val => {
    const y = val.replace(/\s/g, '');
    const x = y.replace(/[^\w\s\.]/gi, '');
    var output = x.split('.');
    output = output.shift() + (output.length ? '.' + output.join('') : '');
    var t = output;
    output =
      t.indexOf('.') >= 0
        ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 6)
        : t;
    setTokenAmount(output);
  };

  const changeInWatt = parseFloat(networkFee?.amountInTokens).toFixed(2);
  const changeInFiat = parseFloat(networkFee?.amountInUSD).toFixed(2);

  const balanceComponent = (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#E0E0E0',
          marginTop: 20,
          borderRadius: 7,
          width: ScreenWidth - 42,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 15,
            marginHorizontal: 15,
          }}>
          <Text
            style={{
              fontFamily: fontsFamily.Mulish,
              fontSize: 12,
              color: '#848484',
            }}>
            Available Tokens
          </Text>
          <Text
            style={{
              fontFamily: fontsFamily.MulishBold,
              marginLeft: 10,
              color: '#000',
            }}>
            {coinCode} {isNaN(balance) ? 0 : balance}
          </Text>
        </View>
        {changeInWatt > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: 15,
              marginHorizontal: 15,
            }}>
            <Text
              style={{
                fontFamily: fontsFamily.MulishBold,
                marginLeft: 10,
                color: '#000',
              }}>
              <DText
                style={{
                  color: !buyWatt ? 'red' : 'green',
                  fontSize: 16,
                }}>
                {!buyWatt ? `-${changeInWatt}` : `+${changeInWatt}`}
              </DText>
            </Text>
          </View>
        ) : (
          <View style={{}}></View>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 15,
            marginHorizontal: 15,
          }}>
          <Text
            style={{
              fontFamily: fontsFamily.Mulish,
              fontSize: 12,
              color: '#848484',
            }}>
            Available Fiat Balance
          </Text>
          <Text
            style={{
              fontFamily: fontsFamily.MulishBold,
              marginLeft: 10,
              color: '#000',
            }}>
            $ 0.0
          </Text>
        </View>
        {changeInFiat > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: 15,
              marginHorizontal: 15,
            }}>
            <Text
              style={{
                fontFamily: fontsFamily.MulishBold,
                marginLeft: 10,
                color: '#000',
              }}>
              <DText
                style={{
                  color: buyWatt ? 'red' : 'green',
                  fontSize: 16,
                }}>
                {buyWatt ? `-${changeInFiat}` : `+${changeInFiat}`}
              </DText>
            </Text>
          </View>
        ) : (
          <View style={{marginBottom: 15}}></View>
        )}
      </View>
    </View>
  );

  const from = buyWatt ? 'WUSDC' : 'WATT';
  const to = !buyWatt ? 'WUSDC' : 'WATT';

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <Header
        headerTitle={`Trade`}
        hideBorder={true}
        backBtn={() => navigateBack()}
      />
      <ScrollView keyboardShouldPersistTaps="handled" style={style.container}>
        <View style={style.toggleContainer}>
          <TouchableOpacity
            style={style.toggleDropDown}
            activeOpacity={1}
            onPress={() => {
              setBuyWatt(!buyWatt);
            }}>
            <Image source={marketIcons[from]} />
            <Text style={style.toggleDropDownText}>{from}</Text>
            <Svg
              width="15"
              height="8"
              viewBox="0 0 15 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path
                d="M13.2599 1.24914L8.36988 6.13914C7.79238 6.71664 6.84738 6.71664 6.26988 6.13914L1.37988 1.24914"
                stroke="#292D32"
                stroke-width="1.5"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
        <View style={style.inputContainer}>
          <TextInput
            keyboardType="decimal-pad"
            value={tokenAmount}
            maxLength={10}
            numberOfLines={1}
            placeholder="0.0"
            placeholderTextColor={'#000'}
            onChangeText={setValue}
            style={style.input}
          />
        </View>
        <View style={style.swapToImageContainer}>
          <View style={style.swapToImagePadding}>
            {/* {loading ? <ActivityIndicator /> :  */}
            <Image source={Images.receiveIcon} style={style.swapToImage} />
            {/* } */}
          </View>
        </View>
        <View style={style.toggleContainer}>
          <TouchableOpacity style={style.toggleDropDown} activeOpacity={1}>
            <Image source={marketIcons[to]} />
            <Text style={style.toggleDropDownText}>{to}</Text>
            {/* {selectedToken === 'WATT' && <Svg width="15" height="8" viewBox="0 0 15 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <Path d="M13.2599 1.24914L8.36988 6.13914C7.79238 6.71664 6.84738 6.71664 6.26988 6.13914L1.37988 1.24914" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                        </Svg>} */}
          </TouchableOpacity>
        </View>
        {/* {errorMessage && (
          <View style={style.errorSec}>
            <Text style={style.errorText}>{errorMessage}</Text>
          </View>
        )} */}
        {balanceComponent}
      </ScrollView>
      {tokenAmount > 0 && (
        <CustomImageButton
          backgroundImage={Images.buttonBg}
          label="Trade"
          labelStyle={styles.textStyle}
          onPress={() => setVisible(true)}
          containerWrapper={{
            height: 51,
            borderRadius: 12,
            marginBottom: 20,
            marginHorizontal: 10,
          }}
          bgImg={{height: 51, width: '100%'}}
        />
      )}
      {/* <DConfirmBottomSheet
        showConfirm={visible}
        title="Confirm Trade"
        description="Are you sure you want to trade ?"
        onCancel={() => {
          setVisible(false);
        }}
        onConfirm={onConfirmPress}
        cancel="No, Go Back"
        confirm="Confirm Trade"
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    marginHorizontal: 21,
    marginVertical: 30,
  },
  input: {
    color: '#000000',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
    justifyContent: 'center',
    fontFamily: fontsFamily.MulishBold,
    fontSize: 36,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    height: 50,
  },
  rightStyle: {
    height: 50,
  },
  headerTitle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    marginLeft: 10,
  },
  sendHeader: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 16,
    color: '#6B6B6B',
  },
  watt: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    lineHeight: 15,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 7,
    width: 80,
  },
  textStyle: {
    fontFamily: fontsFamily.MulishBold,
  },
  content: {
    color: '#747474',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
