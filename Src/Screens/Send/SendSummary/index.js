import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Images from '../../../theme/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, CustomImageButton, Loader } from '../../../component';
import style from './style';
import { navigateTo } from '../../../utils/navigationService';
import { SCREEN_CONSTANT } from '../../../navigation/constant';
import { showErrorToast } from '../../../appRedux/actions/commonMethods';
import { networkFeeApi } from '../../../appRedux/services/swapService';
export default function SendSummary(props) {
  const coinCode = props?.route?.params?.coinCode;
  const tokenBalance = props?.route?.params?.tokenBalance;
  const name = props?.route?.params?.name;
  const amount = props?.route?.params?.amount;
  console.log('🚀 ~ SendSummary ~ amount:', amount);
  const toAddress = props?.route?.params?.toAddress;
  const [networkFee, setNetworkFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isloading, setLoading] = useState(false);
  const [errorTransaction, setErrorTransaction] = useState('');
  useEffect(() => {
    getNetworkFee();
  }, []);
  const onProceed = () => {
    navigateTo(SCREEN_CONSTANT.SENDPIN, {
      totalAmount,
      amount: amount,
      toAddress: toAddress,
      coinCode: coinCode,
      name: name,
      networkFee: networkFee,
    });
  };
  const getNetworkFee = async () => {
    try {
      setLoading(true);
      let params = {
        sourceCoin: coinCode,
        amount: amount,
        targetCoin: coinCode,
      };
      const [_, feeResult] = await networkFeeApi(params);
      setNetworkFee(parseFloat(feeResult?.data.networkFee));
      let totalAmount = amount;
      if (coinCode === 'WATT' || coinCode === 'ETH') {
        // totalAmount = parseFloat(amount) + parseFloat(feeResult?.data.networkFee);
        totalAmount = amount;
      }
      console.log('🚀 ~ getNetworkFee ~ feeResult?.data.networkFee:', feeResult?.data.networkFee);
      setNetworkFee(feeResult?.data.networkFee);
      setTotalAmount(totalAmount);
      setLoading(false);
      validateTransaction(totalAmount);
    } catch (error) {
      setLoading(false);
      showErrorToast(error);
    }
  };
  const validateTransaction = totalFee => {
    if (parseFloat(totalFee) <= parseFloat(tokenBalance)) {
      setErrorTransaction(null);
    } else {
      setErrorTransaction('Insufficient balance to proceed this transaction');
    }
  };
  const checkDisable = () => {
    if (parseFloat(totalAmount) <= parseFloat(tokenBalance)) {
      return false;
    } else {
      return true;
    }
  };

  const networkFeeCoinCode = coinCode === 'USDT' || coinCode === 'USDC' ? 'ETH' : coinCode;

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <Loader isShow={isloading} />

      <Header headerTitle="Send Summary" hideBorder={true} />
      <View style={style.container}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#F9F9F9',
              backgroundColor: '#F9F9F9',
              width: '95%',
              borderRadius: 10,
              marginTop: 25,
            }}
          >
            <View style={{ marginHorizontal: 10, marginVertical: 10 }}>
              <View style={{ marginVertical: 10 }}>
                <Text style={style.header}>Review</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 10,
                }}
              >
                <View>
                  <Text style={style.payText}>Paying amount</Text>
                </View>
                <View>
                  <Text style={style.payValue}>
                    {amount}{' '}
                    {coinCode === 'WUSDC' ? 'wUSDC' : coinCode === 'WEURC' ? 'wEURC' : coinCode}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 10,
                }}
              >
                <View>
                  <Text style={style.payText}>Network fee</Text>
                </View>
                <View>
                  <Text style={style.payValue}>
                    {networkFee} {networkFeeCoinCode}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  marginTop: '35%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 10,
                  borderTopColor: '#CFCFCF',
                  borderTopWidth: 1,
                  width: '100%',
                  paddingTop: 18,
                }}
              >
                <View>
                  <Text style={style.payText}>Amount payable</Text>
                </View>
                <View>
                  <Text style={style.payValue}>
                    {parseFloat(totalAmount)}{' '}
                    {coinCode === 'WUSDC' ? 'wUSDC' : coinCode === 'WEURC' ? 'wEURC' : coinCode}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {errorTransaction != null && errorTransaction != '' && (
            <View style={style.errorSec}>
              <Text style={style.errorText}>{errorTransaction}</Text>
            </View>
          )}
        </View>
      </View>
      <CustomImageButton
        backgroundImage={Images.buttonBg}
        label="Proceed"
        labelStyle={style.textStyle}
        onPress={() => onProceed()}
        containerWrapper={{
          height: 51,
          borderRadius: 12,
          marginBottom: 20,
          marginHorizontal: 10,
        }}
        bgImg={{ height: 51, width: '100%' }}
        disable={checkDisable()}
      />
    </SafeAreaView>
  );
}
