import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, ScrollView, Alert, Button} from 'react-native';
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
import {WebView} from 'react-native-webview';
import {
  useSendUSDCANDEURC,
  TOKEN_ADDRESSES,
} from '../../../hooks/useSendUSDCANDEURC';
import {useSendWatt} from '../../../hooks/useSendWATT';
import {
  useSendDenergyUSDCAndEURC,
  TOKEN_ADDRESSES_DENERGY,
} from '../../../hooks/useSendDenergyUSDCAndEURC';

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
  totalCost: string | bigint | undefined;
}

const denergyNetworkConfig = {
  rpcUrl: 'https://rpc.denergytestnet.com',
  chainId: 4442,
  name: 'DEnergy Testnet',
};

export default function SendCoin(props: SendCoinProps): JSX.Element {
  const {coinCode, user} = props.route.params;
  console.log('🚀 ~ SendCoin ~ coinCode:', coinCode);
  const webviewRef = useRef(null);
  console?.log('Uset', user);
  const {getBalance, refreshBalance} = useWallet();
  const {balance, balanceUsd}: BalanceInfo = getBalance(coinCode);
  const [wattAmount, setWattAmount] = useState<string>('0');
  const {magic_sepolia, setActiveNetwork, activeNetwork, magic_denergy} =
    useMagic();
  console.log('🚀 ~ SendCoin ~ activeNetwork:', activeNetwork);
  const {userDetails} = useAuth();
  const {
    isLoading: ethIsLoading,
    error: ethError,
    sendTransaction: sendEthTransaction,
  } = useSendEth(magic_sepolia, userDetails?.ethereumWallet ?? undefined);

  const {
    isLoading: usdcIsLoading,
    error: usdcError,
    sendTransaction: sendUSDCTransaction,
  } = useSendUSDCANDEURC(
    magic_sepolia,
    userDetails?.ethereumWallet ?? undefined,
  );

  const {
    isLoading: usdcDenergyIsLoading,
    error: usdcDenergyError,
    sendTransaction: sendDenergyUSDCTransaction,
  } = useSendDenergyUSDCAndEURC(
    magic_denergy,
    userDetails?.denergyWallet ?? undefined,
  );

  const {
    isLoading: wattIsLoading,
    error: wattError,
    sendTransaction: sendWattTransaction,
    validateTransaction,
  } = useSendWatt(magic_denergy, userDetails?.denergyWallet ?? undefined);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const onChangeAmount = (val: string): void => {
    const y = val.replace(/\s/g, '');
    const x = y.replace(/[^\w\s\.]/gi, '');
    const parts = x.split('.');
    const wholePart = parts[0] || '';
    const decimalPart =
      parts.length > 1 ? '.' + parts.slice(1).join('').substring(0, 5) : '';
    const output = wholePart + decimalPart;
    setWattAmount(output);
  };

  const onVerify = async (): void => {
    console.log(coinCode);
    try {
      // Use the sendTransaction method from our hook with a success callback
      await setActiveNetwork('sepolia');
      if (coinCode === 'ETH') {
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
        };
        await sendEthTransaction(transactionDetails, transactionResult => {
          console.log('transactionResult????', transactionResult);
          setResult({
            success: true,
            ...transactionResult,
          });
          refreshBalance(coinCode);
          navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
            amount: transactionResult?.totalCost,
            coinCode: coinCode,
            name: '',
          });
        });
      }
      if (coinCode === 'USDC') {
        await setActiveNetwork('sepolia');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES.USDC,
        };
        await sendUSDCTransaction(transactionDetails, transactionResult => {
          console.log('transactionResult????', transactionResult);
          setResult({
            success: true,
            ...transactionResult,
          });
          refreshBalance(coinCode);
          navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
            amount: transactionResult?.totalCost,
            coinCode: coinCode,
            name: '',
          });
        });
      }
      if (coinCode === 'EURC') {
        await setActiveNetwork('sepolia');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES.EURC,
        };
        await sendUSDCTransaction(transactionDetails, transactionResult => {
          console.log('transactionResult????', transactionResult);
          setResult({
            success: true,
            ...transactionResult,
          });
          refreshBalance(coinCode);
          navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
            amount: transactionResult?.totalCost,
            coinCode: coinCode,
            name: '',
          });
        });
      }
      if (coinCode === 'WATT') {
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
        };
        await setActiveNetwork('denergy');
        try {
          // Validate first
          const isValid = await validateTransaction(transactionDetails?.to);
          if (!isValid) return;

          // Send transaction
          await sendWattTransaction(transactionDetails, transactionResult => {
            console.log('Transaction successful!', transactionResult);
            setResult({
              success: true,
              ...transactionResult,
            });
            refreshBalance(coinCode);
            navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
              amount: transactionResult?.totalCost,
              coinCode: coinCode,
              name: '',
            });
            // Handle success (update UI, etc)
          });
        } catch (err) {
          console.error('Failed to send WATT:', err);
          // Handle error
        }
      }
      if (coinCode === 'WUSDC') {
        await setActiveNetwork('denergy');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES_DENERGY?.USDC,
        };
        await sendDenergyUSDCTransaction(
          transactionDetails,
          transactionResult => {
            console.log('transactionResult????', transactionResult);
            setResult({
              success: true,
              ...transactionResult,
            });
            refreshBalance(coinCode);
            navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
              amount: transactionResult?.totalCost,
              coinCode: coinCode,
              name: '',
            });
          },
        );
      }
      if (coinCode === 'WEURC') {
        await setActiveNetwork('denergy');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES_DENERGY.EURC,
        };
        await sendDenergyUSDCTransaction(
          transactionDetails,
          transactionResult => {
            console.log('transactionResult????', transactionResult);
            setResult({
              success: true,
              ...transactionResult,
            });
            refreshBalance(coinCode);
            navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
              amount: transactionResult?.totalCost,
              coinCode: coinCode,
              name: '',
            });
          },
        );
      }
    } catch (err: any) {
      setResult({
        gasFee: '',
        networkName: '',
        totalCost: undefined,
        txHash: '',
        success: false,
        error: err.message || 'Transaction failed',
      });
    }
  };

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <Header
        headerTitle={`Send ${coinCode}`}
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
              }}></TextInput>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E8E8E8',
                backgroundColor: '#E8E8E8',
                padding: 10,
                borderRadius: 7,
                position: 'absolute',
                right: 10,
              }}>
              <Text style={style.watt}>
                {coinCode === 'WUSDC'
                  ? 'wUSDC'
                  : coinCode === 'WEURC'
                  ? 'wEURC'
                  : coinCode}
              </Text>
            </View>
          </View>
          {parseFloat(wattAmount) > parseFloat(balance) && (
            <View style={{padding: 10}}>
              <Text style={{color: '#F42121', fontSize: 12}}>
                Insufficent balance
              </Text>
            </View>
          )}
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E0E0E0',
                marginTop: 20,
                borderRadius: 7,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 15,
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
                  {balance}{' '}
                  {coinCode === 'WUSDC'
                    ? 'wUSDC'
                    : coinCode === 'WEURC'
                    ? 'wEURC'
                    : coinCode}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <DButton
        type="primary"
        style={styles.loginBtnStyle}
        disabled={
          wattAmount === '0' ||
          wattAmount === null ||
          wattAmount === '' ||
          parseFloat(wattAmount) > parseFloat(balance) ||
          ethIsLoading ||
          usdcIsLoading ||
          wattIsLoading ||
          usdcDenergyIsLoading
        }
        onPress={() => onVerify()}>
        <Text style={[styles.loginText]}>
          {ethIsLoading || usdcIsLoading || wattIsLoading
            ? 'Sending...'
            : 'Send'}
        </Text>
      </DButton>
    </SafeAreaView>
  );
}
