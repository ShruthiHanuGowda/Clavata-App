import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CustomImageButton, Header, RadioButton} from '../../../../Componants';
import {BottomSheet} from 'react-native-btr';
import {Colors, fontsFamily, Images} from '../../../../Theme';
import {SCREEN_CONSTANT} from '../../../../Navigation/constant';
import {navigateTo} from '../../../../utils/navigationService';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Path, Svg} from 'react-native-svg';
import AppContext from '../../../../../AppContext';
import {ScreenWidth} from '@rneui/base';
import {marketIcons} from '../../../../Theme/variable';
import {DText} from '../../../../Componants/DText';
import {navigateBack} from '../../../../Navigation/NavigationFunctions';

const allCoins = [
  {
    key: 'USDC',
    text: 'USDC',
  },
  {
    key: 'WUSDC',
    text: 'wUSDC',
  },
  {
    key: 'EURC',
    text: 'EURC',
  },
  {
    key: 'WEURC',
    text: 'eEURC',
  },
];

export default function TransferCoin(props) {
  // const {fiatBalance} = props?.route?.params?.coinData;

  const [transactionType, setTransactionType] = useState(0);

  const {getBalance, balanceData, loading} = useContext(AppContext).portfolio;

  // const coinCode = props?.route?.params?.coinCode;
  const [coinCode, setCoinCode] = useState(props?.route?.params?.coinCode);

  const [usdvalue, setusdvalue] = useState(0);
  const [networkfee, setnetworkfee] = useState(0);
  const [amount, setAmount] = useState('0');
  const [amountInTokens, setAmountInTokens] = useState('');

  //NOTE - just for e.g
  const [usdcValue, setUsdcValue] = useState(0);
  const [busdcValue, setBusdcValue] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [options, setOptions] = useState(allCoins);
  const [selectedToken, setToken] = useState(coinCode);
  const [selectedTargetToken, setTargetToken] = useState(
    options?.find(val => val?.key !== coinCode)?.key,
  );
  const [selectedOption, setSelectedOption] = useState(coinCode);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setBusdcValue(usdcValue);
  }, [usdcValue]);

  useEffect(() => {
    selectedValue(coinCode);
    getBalance();
  }, [coinCode]);

  useEffect(() => {
    setTransactionType(coinCode === 'USDC' || coinCode === 'EURC' ? 0 : 1);
  }, []);

  useEffect(() => {
    togglebottomView();
    setUsdcValue(0);
    setAmount('0');
  }, [transactionType]);

  useEffect(() => {
    if (selectedToken === 'USDC') {
      setTargetToken('WUSDC');
    }
    if (selectedToken === 'EURC') {
      setTargetToken('WEURC');
    }
    if (selectedToken === 'WUSDC') {
      setTargetToken('USDC');
    }
    if (selectedToken === 'WEURC') {
      setTargetToken('EURC');
    }
    setUsdcValue(0);
    changeAmount(0);
    setAmount('0');
  }, [selectedToken]);

  const selectedCoinData = balanceData[coinCode];

  const onNextAction = async () => {
    setToken(selectedOption);
    setVisible(!visible);
    setCoinCode(selectedOption);
  };

  const onSubmit = () => {
    console.log(`[swapcoin] navigate`, {
      swapusdvalue: usdvalue,
      networkFee: networkfee,
      coinType: selectedToken,
      coinCode: coinCode,
      coinData: selectedCoinData,
      amountInTokens: amountInTokens,
      fromTokenAmount: amount,
      totalAmount: amount,
      fromCoin: selectedToken,
      toCoin: selectedTargetToken,
      toTokenAmount: amountInTokens,
    });

    let totalAmount = parseFloat(amount) + parseFloat(networkfee);
    navigateTo(SCREEN_CONSTANT.TRANSFERPIN, {
      swapusdvalue: usdvalue,
      networkFee: networkfee,
      coinType: selectedToken,
      coinCode: coinCode,
      coinData: selectedCoinData,
      amountInTokens: amountInTokens,
      fromTokenAmount: amount,
      totalAmount,
      fromCoin: selectedToken,
      toCoin: selectedTargetToken,
      toTokenAmount: amountInTokens,
      transactionType: transactionType === 0 ? 'deposit' : 'withdraw',
    });
    // navigateTo(SCREEN_CONSTANT.TRANSACTIONHISTORY, {
    //   coinCode: 'ETH',
    //   fromSuccess: true,
    // });
  };

  useEffect(() => {
    const y = amount.replace(/\s/g, '');
    const x = y.replace(/[^\w\s\.]/gi, '');
    var output = x.split('.');
    output = output.shift() + (output.length ? '.' + output.join('') : '');
    var t = output;
    output =
      t.indexOf('.') >= 0
        ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 6)
        : t;
    const last = output.toString().charAt(output.length - 1);
    console.log('🚀 ~ useEffect ~ last:', last);
    console.log('🚀 ~ useEffect ~ selectedCoinData:', selectedCoinData);
    if (output <= parseFloat(selectedCoinData?.tokenBalance)) {
      setErrorMessage(null);
      if (output > 0 && output != 0 && last != '.') {
        initiateSwap(output);
      } else {
        setusdvalue(0);
        setAmountInTokens(0);
        setnetworkfee(0);
      }
    } else {
      setErrorMessage('Insufficient balance');
      setusdvalue(0);
      setnetworkfee(0);
      setAmountInTokens(0);
    }
    console.log('🚀 ~ useEffect ~ output:', output);
  }, [amount]);

  const initiateSwap = async val => {
    try {
      setIsLoading(true);
      let params = {
        sourceCoin: selectedToken,
        amount: val,
        targetCoin: selectedTargetToken,
      };
      // const [error, result] = await initateSwapApi(params);
      // const [_, feeResult] = await networkFeeApi(params);
      setIsLoading(false);
      setusdvalue(result?.data?.conversionAmountInUsd);
      setAmountInTokens(result?.data?.conversionAmount);
      console.log(feeResult);
      setnetworkfee(feeResult?.data?.networkFee);
    } catch (e) {}
  };

  const togglebottomView = event => {
    if (event === 'press') {
      setVisible(!visible);
    }
    if (transactionType === 0) {
      setOptions(
        allCoins.filter(coin => coin.key === 'USDC' || coin.key === 'EURC'),
      );
      setSelectedOption(selectedToken);
    } else {
      setOptions(
        allCoins.filter(coin => coin.key === 'WUSDC' || coin.key === 'WEURC'),
      );
      setSelectedOption(selectedToken);
    }
  };

  const selectedValue = value => {
    setSelectedOption(value);
  };

  const checkDisable = () => {
    if (
      usdcValue !== 0 &&
      (usdcValue !== 0.0) & (usdcValue !== '0.00') &&
      !errorMessage
    ) {
      return false;
    } else {
      return true;
    }
  };
  const changeAmount = async val => {
    const y = val.replace(/\s/g, '');
    const x = y.replace(/[^\w\s\.]/gi, '');
    var output = x.split('.');
    output = output.shift() + (output.length ? '.' + output.join('') : '');
    var t = output;
    output =
      t.indexOf('.') >= 0
        ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 6)
        : t;
    setAmount(output);
  };

  const balanceComponent = (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      {/* <Text style={style.balanceText}>Balance: {parseFloat(fiatBalance)}</Text> */}
      <View style={style.balanceBorderView}>
        <View style={style.balanceInnerView}>
          <Text
            style={{
              fontFamily: fontsFamily.Mulish,
              fontSize: 12,
              color: '#848484',
            }}>
            {transactionType == 0 ? 'From ETH Network' : 'From DENERGY Network'}
          </Text>
          <Text
            style={{
              fontFamily: fontsFamily.MulishBold,
              marginLeft: 10,
              color: '#000',
            }}>
            {`${
              selectedToken === 'WUSDC'
                ? 'wUSDC'
                : selectedToken === 'WEURC'
                ? 'wEURC'
                : selectedToken
            } ${usdcValue ? usdcValue : '0.0'}`}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 15,
          }}>
          {networkfee !== NaN && parseFloat(networkfee) > 0 && (
            <DText
              style={{
                color: 'red',
                fontSize: 12,
                alignSelf: 'flex-end',
              }}>
              {`+ Network Fee ${parseFloat(networkfee)}`}
            </DText>
          )}
        </View>
        <View style={[style.balanceInnerView, {marginBottom: 15}]}>
          <Text
            style={{
              fontFamily: fontsFamily.Mulish,
              fontSize: 12,
              color: '#848484',
            }}>
            {transactionType === 0 ? 'To DENERGY Network' : 'To ETH Network'}
          </Text>
          <Text
            style={{
              fontFamily: fontsFamily.MulishBold,
              marginLeft: 10,
              color: '#000',
            }}>
            {`${selectedTargetToken} ${busdcValue ? busdcValue : '0.0'}`}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTab = () => {
    return (
      <View style={style.sectionView}>
        <Pressable
          onPress={() => {
            setTransactionType(0);
            setCoinCode('USDC');
            setToken('USDC');
          }}
          style={[
            style.transactionType,
            {backgroundColor: transactionType == 0 ? '#000' : '#fff'},
          ]}>
          <Text
            style={[
              style.transactionTypeText,
              {color: transactionType == 1 ? '#000' : '#fff'},
            ]}>
            Deposit
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setTransactionType(1);
            setCoinCode('WUSDC');
            setToken('WUSDC');
          }}
          style={[
            style.transactionType,
            {backgroundColor: transactionType == 1 ? '#000' : '#fff'},
          ]}>
          <Text
            style={[
              style.transactionTypeText,
              {color: transactionType == 0 ? '#000' : '#fff'},
            ]}>
            Withdraw
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={style.screen}>
      <Header
        headerTitle={`Bridge`}
        hideBorder={true}
        backBtn={() => navigateBack()}
      />
      {renderTab()}
      <ScrollView keyboardShouldPersistTaps="handled" style={style.container}>
        <View style={style.toggleContainer}>
          <TouchableOpacity
            style={style.toggleDropDown}
            activeOpacity={1}
            onPress={() => togglebottomView('press')}>
            <Image source={marketIcons[selectedToken]} />
            <Text style={style.toggleDropDownText}>
              {selectedToken === 'WUSDC'
                ? 'wUSDC'
                : selectedToken === 'WEURC'
                ? 'wEURC'
                : selectedToken}
            </Text>
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
            value={usdcValue}
            maxLength={10}
            placeholder="0.0"
            placeholderTextColor={'#000'}
            onChangeText={value => {
              setUsdcValue(value);
              changeAmount(value);
            }}
            style={style.input}
            textAlign="center"
          />
        </View>

        <View style={style.swapToImageContainer}>
          <View style={style.swapToImagePadding}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <View gap={10} style={{flexDirection: 'row'}}>
                <Image source={Images.receiveIcon} style={style.swapToImage} />
                <Image source={Images.sendIcon} style={style.swapToImage} />
              </View>
            )}
          </View>
        </View>
        <View style={style.toggleContainer}>
          <TouchableOpacity style={style.toggleDropDown} activeOpacity={1}>
            <Image source={marketIcons[selectedTargetToken]} />
            <Text style={style.toggleDropDownText}>
              {selectedTargetToken === 'WUSDC'
                ? 'wUSDC'
                : selectedTargetToken === 'WEURC'
                ? 'wEURC'
                : selectedTargetToken}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={style.inputContainer}>
          <Text style={style.input}>{parseFloat(busdcValue) || 0}</Text>
        </View>
        {errorMessage && (
          <View style={style.errorSec}>
            <Text style={style.errorText}>{errorMessage}</Text>
          </View>
        )}

        {balanceComponent}
      </ScrollView>
      <CustomImageButton
        backgroundImage={Images.buttonBg}
        label="Next"
        labelStyle={style.textStyle}
        onPress={() => onSubmit()}
        containerWrapper={{
          height: 51,
          borderRadius: 12,
          marginBottom: 20,
          marginHorizontal: 10,
        }}
        bgImg={{height: 51, width: '100%'}}
        disable={checkDisable()}
      />
      <BottomSheet
        visible={visible}
        onBackButtonPress={togglebottomView}
        onBackdropPress={togglebottomView}>
        <View
          style={{
            backgroundColor: '#ffffff',
            width: 375,
            alignContent: 'center',
            marginHorizontal: 10,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
          }}>
          <Image
            style={{marginHorizontal: 165.5, marginTop: 7}}
            source={Images.bottomsheetTab}></Image>
          <View style={{marginLeft: 150}}>
            <Text
              style={{
                fontFamily: fontsFamily.MulishBold,
                marginTop: 20,
                fontSize: 18,
                color: '#333333',
                lineHeight: 21,
              }}>
              Select Coin
            </Text>
          </View>
          <View
            style={{
              borderColor: '#DEDEDE',
              borderWidth: 0.75,
              marginTop: 21,
            }}></View>
          <View style={{borderColor: '#ffffff'}}>
            <RadioButton
              PROP={options}
              selectedOption={selectedOption}
              selectedValue={value => selectedValue(value)}
            />
            <CustomImageButton
              backgroundImage={Images.buttonBg}
              label="Apply"
              labelStyle={style.textStyle}
              onPress={() => onNextAction() & togglebottomView}
              containerWrapper={{
                height: 51,
                borderRadius: 12,
                marginVertical: 10,
                marginHorizontal: 10,
              }}
              bgImg={{height: 51, width: '100%'}}
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  screen: {backgroundColor: '#fff', flex: 1},
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  toggleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
  },
  toggleDropDown: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleDropDownText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    lineHeight: 15,
    marginHorizontal: 10,
  },
  input: {
    color: '#000000',
    fontFamily: fontsFamily.MulishBold,
    padding: 5,
    fontSize: 36,
  },
  inputContainer: {
    marginHorizontal: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
  },
  sectionView: {
    height: 40,
    width: '80%',
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#fff',
    borderColor: '#000',
    overflow: 'hidden',
  },
  transactionType: {
    height: '100%',
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderColor: '#000',
  },
  swapToImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
    marginVertical: 20,
    marginHorizontal: 21,
  },
  swapToImagePadding: {
    backgroundColor: '#FFF',
    position: 'absolute',
    padding: 10,
  },
  swapToImage: {
    height: 20,
    width: 20,
  },
  textStyle: {
    fontFamily: fontsFamily.MulishBold,
  },
  errorSec: {
    marginTop: 10,
    padding: 5,
    borderWidth: 1,
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: '#FFFFFF',
    width: ScreenWidth - 42,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: 'red',
    letterSpacing: 1,
  },

  transactionTypeText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    lineHeight: 15,
  },
  balanceText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#848484',
    alignSelf: 'flex-end',
    marginRight: 25,
  },
  balanceBorderView: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 20,
    borderRadius: 7,
    width: ScreenWidth - 42,
  },
  balanceInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginHorizontal: 15,
  },
});
