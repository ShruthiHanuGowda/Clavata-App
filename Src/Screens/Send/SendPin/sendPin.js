import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { Header, OtpComponent, Loader } from '../../../component';
import styles from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import style from './style';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { navigateTo } from '../../../utils/navigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { Common } from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import { Buffer } from 'buffer';
import { SCREEN_CONSTANT } from '../../../navigation/constant';
import bitcore from 'bitcore-lib';
import { get_btc_info } from '../../../appRedux/actions/btcAction';
import {
  ETH_CHAINID,
  ETH_PROVIDER,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  WATT_CHAINID,
  WATT_PROVIDER,
} from '../../../config/axios/constant';
import { SnackBarMessage } from '../../../utils';
import { transferWattAmountApi } from '../../../appRedux/services/wattService';

const ERC20Abi = require('../../../utils/ecc20Abi.json');
export default function SendPin({ route }) {
  const { amount, coinCode, toAddress, name, networkFee, totalAmount } = route?.params;

  const [enteredPin, setEnteredPin] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [disableDeviceBackBtn, setDisableDeviceBackBtn] = useState(false);

  console.log(
    {
      amount,
      networkFee,
    },
    route.params,
    'send pin'
  );
  //device back btn navigation handling
  useEffect(() => {
    const backAction = () => {
      if (!disableDeviceBackBtn) {
        return null;
      } else {
        return true;
      }
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [disableDeviceBackBtn]);
  0x4423cf2abb62f73c1b316ff1e740ac4161f14227;

  const getContractAddress = coin => {
    switch (coin) {
      case 'USDT':
        return USDT_CONTRACT_ADDRESS;
      case 'USDC':
        return USDC_CONTRACT_ADDRESS;
      case 'WUSDC':
        return '0x4423cf2abb62f73c1b316ff1e740ac4161f14227';
      case 'EURC':
        return '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4';
      case 'WEURC':
        return '0x20a18bc67fBa28D8ffd286760d7adeEC8838A3ff';
      default:
        return null;
    }
  };

  const getCoinData = async coinCode => {
    let obj;
    switch (coinCode) {
      case 'WATT':
        obj = await AsyncStorage.getItem('wattObj');
        break;
      case 'BTC':
        obj = await AsyncStorage.getItem('btcObj');
        break;
      default:
        obj = await AsyncStorage.getItem('ethObj');
        break;
    }
    return JSON.parse(obj);
  };

  const onApproved = async () => {
    if (isLoading) {
      return;
    }
    try {
      setDisableDeviceBackBtn(true);
      setIsLoading(true);
      let txParams;
      setIsLoading(true);
      const coinData = await getCoinData(coinCode);
      const fromAddress = coinData.address;
      let toAddress = route?.params?.toAddress;
      console.log('🚀 ~ onApproved ~ toAddress:', toAddress);
      let common;
      let provider;
      let hash;
      let nonce;
      let contractAddress;
      if (coinCode == 'BTC') {
        const data = await get_btc_info(fromAddress);
        const value = amount * 100000000; // 8 zeros for satoshi
        const netFee = networkFee * 100000000;
        const privateKey = new bitcore.PrivateKey(coinData.privateKey);
        console.log('datatex', data);
        if (!data.txrefs || data.txrefs.length === 0) {
          setIsLoading(false);
          setDisableDeviceBackBtn(false);
          SnackBarMessage(
            'No confirmed balance available to complete this transaction. Please wait until your balance get confirmed',
            'error'
          );
          return;
        } else {
          const transaction = new bitcore.Transaction()
            .from(data.txrefs)
            .to([
              {
                address: toAddress,
                satoshis: parseInt(value),
              },
            ])
            .change(fromAddress)
            .fee(parseInt(netFee))
            .sign(privateKey);
          hash = transaction.toString();
        }
      } else {
        try {
          if (coinCode === 'WATT' || coinCode === 'WEURC' || coinCode === 'WUSDC') {
            common = Common.custom({ chainId: WATT_CHAINID });
            provider = new ethers.providers.JsonRpcProvider(WATT_PROVIDER);
          } else {
            common = Common.custom({ chainId: ETH_CHAINID });
            provider = new ethers.providers.JsonRpcProvider(ETH_PROVIDER);
          }
          await provider.ready;
          let wallet = new ethers.Wallet(coinData.privateKey, provider);

          let feeData = await provider.getFeeData();

          let gas = await provider.getGasPrice();

          const gasPrice = ethers.utils.hexlify(gas);

          const txCount = await wallet.getTransactionCount('pending');
          console.log('🚀 ~ onApproved ~ txCount:', txCount);

          let gasLimit = ethers.utils.hexlify(21000);
          console.log('🚀 ~ onApproved ~ gasLimit:', gasLimit);

          if (coinCode === 'ETH') {
            nonce = await provider.getTransactionCount(wallet.address);
          } else {
            nonce = ethers.utils.hexlify(txCount);
            console.log('🚀 ~ onApproved ~ nonce:', nonce);
          }

          console.log('🚀 ~ onApproved ~ totalAmount:', totalAmount);
          const hexValue = ethers.utils.parseUnits(`${totalAmount}`, 18);
          let value = ethers.utils.hexlify(hexValue);
          console.log('🚀 ~ onApproved ~ value:', value);
          console.log('🚀 ~ onApproved ~ hexValue:', hexValue);
          let data = '0x';
          if (
            coinCode === 'USDT' ||
            coinCode === 'USDC' ||
            coinCode === 'WUSDC' ||
            coinCode === 'EURC' ||
            coinCode === 'WEURC'
          ) {
            const amountInWei = ethers.utils.parseUnits(`${totalAmount}`, 6);
            contractAddress = getContractAddress(coinCode);

            const contract = new ethers.utils.Interface(ERC20Abi);
            // Transfer to address of the admin wallet
            data = contract.encodeFunctionData('transfer', [toAddress, amountInWei]);

            value = 0;
            // Change the assignment to contract address so tx gets sent there
            // toAddress = contractAddress;
            // gasLimit = ethers.utils.hexlify(42000);
            gasLimit = await provider.estimateGas({
              from: wallet.address,
              to: contractAddress,
              data: data,
            });
          }

          if (coinCode === 'ETH' || coinCode === 'USDC' || coinCode === 'EURC') {
            txParams = {
              type: 2,
              nonce: nonce,
              to: coinCode === 'ETH' ? toAddress : contractAddress, // Address you want to send to
              maxPriorityFeePerGas: feeData['maxPriorityFeePerGas'], // Increase by 100% for faster inclusion
              maxFeePerGas: feeData['maxFeePerGas'], // Increase maxFeePerGas by 100% as well
              value: value, // .0001 ETH
              gasLimit: gasLimit, // Gas limit for a basic transfer
              chainId: 11155111, // Sepolia chain ID
              data: data,
            };
            console.log('🚀 ~ onApproved ~ txParams:', txParams);
          } else {
            txParams = {
              from: fromAddress,
              nonce: nonce,
              gasPrice: gasPrice,
              gasLimit: gasLimit,
              to: coinCode === 'WATT' ? toAddress : contractAddress,
              value,
              data,
              chainId: 2222,
            };
            console.log('🚀 ~ onApproved ~ txParams:', txParams);
          }

          if (coinCode === 'ETH') {
            hash = await wallet.signTransaction(txParams);
          } else {
            const finalHash = await wallet.signTransaction(txParams);
            console.log('🚀 ~ onApproved ~ finalHash:', finalHash);
            hash = finalHash;
          }
        } catch (error) {
          console.log('🚀 ~ onApproved ~ error:', error);
          SnackBarMessage('Transaction Failed', 'error');
          throw error;
        }
      }

      let params = {
        hash: hash,
        coinCode: coinCode,
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: amount,
        transactionType: 'Send',
      };
      console.log('🚀 ~ onApproved ~ params:', params);

      let [error, result] = await transferWattAmountApi(params);
      console.log(`[transfer]`, error, result);
      setIsLoading(false);
      setDisableDeviceBackBtn(false);
      if (!error) {
        navigateTo(SCREEN_CONSTANT.SENDSUCCESS, { amount: amount, coinCode: coinCode, name: name });
      }
    } catch (error) {
      console.log('errr', error);
      // SnackBarMessage(error, "error")
      setIsLoading(false);
    }
  };
  const convertToNumber = value => {
    return Number(value.replace(/[^0-9]/g, ''));
  };
  const checkPin = async code => {
    let number = convertToNumber(code);
    let pin = await AsyncStorage.getItem('pin');
    let pinNumber = convertToNumber(pin);
    if (number == pinNumber) {
      onApproved();
    } else {
      SnackBarMessage('Wrong pin', 'error');
    }
  };
  let routeParams = {
    fromScreen: 'forgotPin',
    toScreen: SCREEN_CONSTANT.SENDPIN,
    coinCode: coinCode,
    amount: amount,
    toAddress: toAddress,
  };
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Loader isShow={isLoading} />

        <Header headerTitle="Transaction PIN" hideBorder={true} />
        <KeyboardAwareScrollView bounces={false} style={[styles.mainContainer]}>
          <View style={styles.container}>
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
              <Text style={style.page2Content}>
                Please enter your MPIN to complete this transaction
              </Text>
            </View>
            <View style={{ alignSelf: 'center', width: '90%' }}>
              <OtpComponent
                code={enteredPin}
                onCodeChanged={enteredPin => setEnteredPin(enteredPin)}
                onCodeFilled={code => {
                  checkPin(code);
                }}
              />
            </View>
            <TouchableOpacity onPress={() => navigateTo(SCREEN_CONSTANT.CHANGEPIN2, routeParams)}>
              <Text style={style.forgot}>Forgot PIN?</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}
