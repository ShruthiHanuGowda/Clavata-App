import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import style from './style';
import {CustomImageButton, DButton, Header} from '../../../Componants';
import {fontsFamily, Images} from '../../../Theme';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import ReceiverDetails from '../../../Componants/ReceiverDetails';
import {useSendEth} from '../../../hooks/useSendEth';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import styles from '../../AuthScreens/styles';
import {SCREEN_CONSTANT} from '../../../Navigation/constant';
import {navigateTo} from '../../../utils/navigationService';

// Define types for route params
interface RouteParams {
  coinCode: string;
  user: User;
}

// Define User interface (adjust according to actual user properties)
interface User {
  // Add relevant user properties here
  id: string;
  name: string;
  beneficiaryAddress: string;
  // ... other properties
}

// Define balance return type
interface BalanceInfo {
  balance: string;
  balanceUsd: string;
}

// Define props for the component
interface SendCoinProps {
  route: {
    params: RouteParams;
  };
  navigation: any; // You might want to use a more specific type from React Navigation
}

interface TransactionResult {
  success: boolean;
  txHash?: string;
  networkName?: string;
  gasFee?: string;
  error?: string;
  totalCost: string | bigint;
}

export default function SendCoin(props: SendCoinProps): JSX.Element {


  const {coinCode, user} = props.route.params;
  console?.log('Uset', user);
  const {getBalance, refreshBalance} = useWallet();
  const {balance, balanceUsd}: BalanceInfo = getBalance(coinCode);
  const [wattAmount, setWattAmount] = useState<string>('0');
  const {magic} = useMagic();
  const {userDetails} = useAuth();
  const {isLoading, error, sendTransaction} = useSendEth(magic, userDetails?.userWallet);

  const [result, setResult] = useState<TransactionResult | null>(null);


  const onChangeAmount = (val: string): void => {
    const y = val.replace(/\s/g, '');
    const x = y.replace(/[^\w\s\.]/gi, '');
    var output = x.split('.');
    output = output.shift() + (output.length ? '.' + output.join('') : '');
    var t = output;
    output = t.indexOf('.') >= 0 ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 6) : t;
    setWattAmount(output);
  };


  const onVerify = async (): void => {

    try {
      const transactionDetails = {
        to: user?.beneficiaryAddress,
        amount: wattAmount,
      };


      // Use the sendTransaction method from our hook with a success callback
      await sendTransaction(transactionDetails, (transactionResult) => {
        console.log('transactionResult????', transactionResult);
        setResult({
          success: true,
          ...transactionResult,
        });
        refreshBalance(coinCode);
        navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {amount: transactionResult?.totalCost, coinCode: coinCode, name: ''});

      });
    } catch (err: any) {
      setResult({
        gasFee: '', networkName: '', totalCost: undefined, txHash: '',
        success: false,
        error: err.message || 'Transaction failed',
      });
    }

  };

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>

      <Header
        headerTitle={`Send ${
          coinCode
        }`}
        backBtn={() => navigateBack()}
        hideBorder={true}

      />
      <ScrollView keyboardShouldPersistTaps="handled" style={style.container}>
        <View style={style.container}>
          <ReceiverDetails data={user} />
          <View style={{marginHorizontal: 20}}>
            <Text style={style.sendHeader}>SEND</Text>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TextInput
              keyboardType="decimal-pad"
              value={wattAmount}
              placeholder="0.0"
              placeholderTextColor={'#000'}
              onChangeText={(value: string) => onChangeAmount(value)}
              style={{
                color: '#000000',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#E7E7E7',
                width: '90%',
                justifyContent: 'center',
                fontFamily: fontsFamily.MulishBold,
                fontSize: 36,
              }}
            ></TextInput>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E8E8E8',
                backgroundColor: '#E8E8E8',
                padding: 10,
                borderRadius: 7,
                position: 'absolute',
                right: 10,
              }}
            >
              <Text style={style.watt}>
                {coinCode === 'WUSDC' ? 'wUSDC' : coinCode === 'WEURC' ? 'wEURC' : coinCode}
              </Text>
            </View>
          </View>
          {parseFloat(wattAmount) > parseFloat(balance) && (
            <View style={{padding: 10}}>
              <Text style={{color: '#F42121', fontSize: 12}}>Insufficent balance</Text>
            </View>
          )}
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <View
              style={{borderWidth: 1, borderColor: '#E0E0E0', marginTop: 20, borderRadius: 7}}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 15,
                  marginHorizontal: 15,
                }}
              >
                <Text style={{fontFamily: fontsFamily.Mulish, fontSize: 12, color: '#848484'}}>
                  Available Tokens
                </Text>
                <Text style={{fontFamily: fontsFamily.MulishBold, marginLeft: 10, color: '#000'}}>
                  {balance}{' '}
                  {coinCode === 'WUSDC' ? 'wUSDC' : coinCode === 'WEURC' ? 'wEURC' : coinCode}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <DButton
        type="primary"
        style={styles.loginBtnStyle}
        disabled={parseFloat(wattAmount) > parseFloat(balance) || isLoading}
        onPress={() => onVerify()}>
        <Text style={[styles.loginText]}>
          {isLoading ? 'Sending...' : 'Send'}
        </Text>
      </DButton>
    </SafeAreaView>
  );
}
