import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Button,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import style from './style';
import {CustomImageButton, DButton, Header} from '../../../Componants';
import {fontsFamily, Images, Animation} from '../../../Theme';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import ReceiverDetails from '../../../Componants/ReceiverDetails';
import {useSendEth} from '../../../hooks/useSendEth';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import styles from '../../AuthScreens/styles';
import {SCREEN_CONSTANT} from '../../../Navigation/constant';
import {navigateTo} from '../../../utils/navigationService';
import LoadingScreenWithStep from '../../../Componants/Loading/LoadingScreenWIthStep';
import {getBlockExploreLink} from '../../../utils/explorer';
import Clipboard from '@react-native-clipboard/clipboard';
import {DText} from '../../../Componants/DText';
import LottieView from 'lottie-react-native';

import {
  useSendUSDCANDEURC,
  TOKEN_ADDRESSES,
} from '../../../hooks/useSendUSDCANDEURC';
import {useSendWatt} from '../../../hooks/useSendWATT';
import {
  useSendDenergyUSDCAndEURC,
  TOKEN_ADDRESSES_DENERGY,
} from '../../../hooks/useSendDenergyUSDCAndEURC';
import {useSuccessSound} from '../../../hooks/useSuccessSound';

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

export default function SendCoin(props: SendCoinProps): any {
  const {coinCode, user} = props.route.params;
  const webviewRef = useRef(null);
  const {getBalance, refreshBalance} = useWallet();
  const {balance, balanceUsd}: BalanceInfo = getBalance(coinCode);
  const [wattAmount, setWattAmount] = useState<string>('0');
  const {magic_sepolia, setActiveNetwork, activeNetwork, magic_denergy} =
    useMagic();
  const {userDetails} = useAuth();
  const {
    playSuccessSound,
    isLoaded: soundLoaded,
    error: soundError,
  } = useSuccessSound();

  // Enhanced loading and transaction state
  const [currentStep, setCurrentStep] = useState<
    'form' | 'processing' | 'success'
  >('form');
  const [currentProcessingStep, setCurrentProcessingStep] =
    useState<string>('');
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string>('');

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

  useEffect(() => {
    if (currentStep === 'success') {
      const timer = setTimeout(() => {
        if (soundLoaded) {
          console.log('Playing success sound...');
          playSuccessSound();
        } else {
          console.log(
            'Sound not loaded yet, isLoaded:',
            soundLoaded,
            'error:',
            soundError,
          );
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentStep, soundLoaded, playSuccessSound, soundError]);

  // Processing steps configuration similar to Bridge
  const SEND_PROCESSING_STEPS: any = {
    ETH: {
      INITIALIZING: {text: 'Initializing ETH transfer...', progress: 8},
      SWITCHING_NETWORK: {
        text: 'Switching to Ethereum network...',
        progress: 16,
      },
      CHECKING_BALANCE: {text: 'Checking ETH balance...', progress: 24},
      ESTIMATING_GAS: {text: 'Estimating gas fees...', progress: 32},
      PREPARING_TX: {text: 'Preparing transaction...', progress: 40},
      SIGNING_TX: {text: 'Signing transaction...', progress: 56},
      BROADCASTING: {text: 'Broadcasting to network...', progress: 72},
      CONFIRMING: {text: 'Waiting for confirmation...', progress: 88},
      UPDATING_RECORDS: {text: 'Updating transaction records...', progress: 96},
      COMPLETED: {text: 'ETH transfer completed successfully!', progress: 100},
    },
    USDC: {
      INITIALIZING: {text: 'Initializing USDC transfer...', progress: 8},
      SWITCHING_NETWORK: {
        text: 'Switching to Ethereum network...',
        progress: 16,
      },
      CHECKING_BALANCE: {text: 'Checking USDC balance...', progress: 24},
      CHECKING_ALLOWANCE: {text: 'Checking token allowance...', progress: 32},
      ESTIMATING_GAS: {text: 'Estimating gas fees...', progress: 40},
      PREPARING_TX: {text: 'Preparing token transfer...', progress: 48},
      SIGNING_TX: {text: 'Signing transaction...', progress: 64},
      BROADCASTING: {text: 'Broadcasting to network...', progress: 80},
      CONFIRMING: {text: 'Waiting for confirmation...', progress: 92},
      UPDATING_RECORDS: {text: 'Updating transaction records...', progress: 96},
      COMPLETED: {text: 'USDC transfer completed successfully!', progress: 100},
    },
    EURC: {
      INITIALIZING: {text: 'Initializing EURC transfer...', progress: 8},
      SWITCHING_NETWORK: {
        text: 'Switching to Ethereum network...',
        progress: 16,
      },
      CHECKING_BALANCE: {text: 'Checking EURC balance...', progress: 24},
      CHECKING_ALLOWANCE: {text: 'Checking token allowance...', progress: 32},
      ESTIMATING_GAS: {text: 'Estimating gas fees...', progress: 40},
      PREPARING_TX: {text: 'Preparing token transfer...', progress: 48},
      SIGNING_TX: {text: 'Signing transaction...', progress: 64},
      BROADCASTING: {text: 'Broadcasting to network...', progress: 80},
      CONFIRMING: {text: 'Waiting for confirmation...', progress: 92},
      UPDATING_RECORDS: {text: 'Updating transaction records...', progress: 96},
      COMPLETED: {text: 'EURC transfer completed successfully!', progress: 100},
    },
    WATT: {
      INITIALIZING: {text: 'Initializing WATT transfer...', progress: 8},
      SWITCHING_NETWORK: {
        text: 'Switching to DENERGY network...',
        progress: 16,
      },
      VALIDATING_ADDRESS: {
        text: 'Validating recipient address...',
        progress: 24,
      },
      CHECKING_BALANCE: {text: 'Checking WATT balance...', progress: 32},
      ESTIMATING_GAS: {text: 'Estimating transaction fees...', progress: 40},
      PREPARING_TX: {text: 'Preparing WATT transfer...', progress: 48},
      SIGNING_TX: {text: 'Signing transaction...', progress: 64},
      BROADCASTING: {text: 'Broadcasting to DENERGY network...', progress: 80},
      CONFIRMING: {text: 'Waiting for confirmation...', progress: 92},
      UPDATING_RECORDS: {text: 'Updating transaction records...', progress: 96},
      COMPLETED: {text: 'WATT transfer completed successfully!', progress: 100},
    },
    WUSDC: {
      INITIALIZING: {text: 'Initializing wUSDC transfer...', progress: 8},
      SWITCHING_NETWORK: {
        text: 'Switching to DENERGY network...',
        progress: 16,
      },
      CHECKING_BALANCE: {text: 'Checking wUSDC balance...', progress: 24},
      CHECKING_ALLOWANCE: {text: 'Checking token allowance...', progress: 32},
      ESTIMATING_GAS: {text: 'Estimating transaction fees...', progress: 40},
      PREPARING_TX: {text: 'Preparing wrapped token transfer...', progress: 48},
      SIGNING_TX: {text: 'Signing transaction...', progress: 64},
      BROADCASTING: {text: 'Broadcasting to DENERGY network...', progress: 80},
      CONFIRMING: {text: 'Waiting for confirmation...', progress: 92},
      UPDATING_RECORDS: {text: 'Updating transaction records...', progress: 96},
      COMPLETED: {
        text: 'wUSDC transfer completed successfully!',
        progress: 100,
      },
    },
    WEURC: {
      INITIALIZING: {text: 'Initializing wEURC transfer...', progress: 8},
      SWITCHING_NETWORK: {
        text: 'Switching to DENERGY network...',
        progress: 16,
      },
      CHECKING_BALANCE: {text: 'Checking wEURC balance...', progress: 24},
      CHECKING_ALLOWANCE: {text: 'Checking token allowance...', progress: 32},
      ESTIMATING_GAS: {text: 'Estimating transaction fees...', progress: 40},
      PREPARING_TX: {text: 'Preparing wrapped token transfer...', progress: 48},
      SIGNING_TX: {text: 'Signing transaction...', progress: 64},
      BROADCASTING: {text: 'Broadcasting to DENERGY network...', progress: 80},
      CONFIRMING: {text: 'Waiting for confirmation...', progress: 92},
      UPDATING_RECORDS: {text: 'Updating transaction records...', progress: 96},
      COMPLETED: {
        text: 'wEURC transfer completed successfully!',
        progress: 100,
      },
    },
  };

  const updateProcessingStep = (stepKey: string) => {
    const steps = SEND_PROCESSING_STEPS[coinCode];
    const step = steps?.[stepKey];
    if (step) {
      setCurrentProcessingStep(step.text);
      setStepProgress(step.progress);
    }
  };

  const resetSendState = () => {
    setCurrentProcessingStep('');
    setStepProgress(0);
    setTransactionHash('');
    setResult(null);
  };

  // Enhanced processing simulation with proper steps
  const simulateProcessingSteps = async () => {
    const steps = SEND_PROCESSING_STEPS[coinCode];
    if (!steps) return;

    const stepKeys = Object.keys(steps).filter(key => key !== 'COMPLETED');

    for (const stepKey of stepKeys) {
      updateProcessingStep(stepKey);
      // Add realistic delays between steps
      const delay =
        stepKey === 'CONFIRMING'
          ? 2000
          : stepKey === 'BROADCASTING'
          ? 1500
          : stepKey === 'SIGNING_TX'
          ? 1200
          : 800;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

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

  const onVerify = async (): Promise<void> => {
    console.log(coinCode);
    setCurrentStep('processing');
    resetSendState();

    // Start the enhanced processing simulation
    const processingPromise = simulateProcessingSteps();

    try {
      // Use the sendTransaction method from our hook with a success callback
      await setActiveNetwork('sepolia');
      if (coinCode === 'ETH') {
        updateProcessingStep('SWITCHING_NETWORK');
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
          setTransactionHash(transactionResult.txHash || '');
          refreshBalance(coinCode);
          updateProcessingStep('COMPLETED');
          setCurrentStep('success');
        });
      }
      if (coinCode === 'USDC') {
        await setActiveNetwork('sepolia');
        updateProcessingStep('SWITCHING_NETWORK');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES.USDC,
          coinCode: 'USDC',
        };
        await sendUSDCTransaction(transactionDetails, transactionResult => {
          console.log('transactionResult????', transactionResult);
          setResult({
            success: true,
            ...transactionResult,
          });
          setTransactionHash(transactionResult.txHash || '');
          refreshBalance(coinCode);
          updateProcessingStep('COMPLETED');
          setCurrentStep('success');
        });
      }
      if (coinCode === 'EURC') {
        await setActiveNetwork('sepolia');
        updateProcessingStep('SWITCHING_NETWORK');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES.EURC,
          coinCode: 'EURC',
        };
        await sendUSDCTransaction(transactionDetails, transactionResult => {
          console.log('transactionResult????', transactionResult);
          setResult({
            success: true,
            ...transactionResult,
          });
          setTransactionHash(transactionResult.txHash || '');
          refreshBalance(coinCode);
          updateProcessingStep('COMPLETED');
          setCurrentStep('success');
        });
      }
      if (coinCode === 'WATT') {
        updateProcessingStep('SWITCHING_NETWORK');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
        };
        await setActiveNetwork('denergy');
        try {
          updateProcessingStep('VALIDATING_ADDRESS');
          // Validate first
          const isValid = await validateTransaction(transactionDetails?.to);
          if (!isValid) {
            setCurrentStep('form');
            return;
          }

          // Send transaction
          await sendWattTransaction(transactionDetails, transactionResult => {
            console.log('Transaction successful!', transactionResult);
            setResult({
              success: true,
              ...transactionResult,
            });
            setTransactionHash(transactionResult.txHash || '');
            refreshBalance(coinCode);
            updateProcessingStep('COMPLETED');
            setCurrentStep('success');
          });
        } catch (err) {
          console.error('Failed to send WATT:', err);
          setCurrentStep('form');
          throw err;
        }
      }
      if (coinCode === 'WUSDC') {
        await setActiveNetwork('denergy');
        updateProcessingStep('SWITCHING_NETWORK');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES_DENERGY?.USDC,
          coinCode: 'WUSDC',
        };
        await sendDenergyUSDCTransaction(
          transactionDetails,
          transactionResult => {
            console.log('transactionResult????', transactionResult);
            setResult({
              success: true,
              ...transactionResult,
            });
            setTransactionHash(transactionResult.txHash || '');
            refreshBalance(coinCode);
            updateProcessingStep('COMPLETED');
            setCurrentStep('success');
          },
        );
      }
      if (coinCode === 'WEURC') {
        await setActiveNetwork('denergy');
        updateProcessingStep('SWITCHING_NETWORK');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
          tokenAddress: TOKEN_ADDRESSES_DENERGY.EURC,
          coinCode: 'WEURC',
        };
        await sendDenergyUSDCTransaction(
          transactionDetails,
          transactionResult => {
            console.log('transactionResult????', transactionResult);
            setResult({
              success: true,
              ...transactionResult,
            });
            setTransactionHash(transactionResult.txHash || '');
            refreshBalance(coinCode);
            updateProcessingStep('COMPLETED');
            setCurrentStep('success');
          },
        );
      }

      // Wait for processing simulation to complete
      await processingPromise;
    } catch (err: any) {
      setResult({
        gasFee: '',
        networkName: '',
        totalCost: undefined,
        txHash: '',
        success: false,
        error: err.message || 'Transaction failed',
      });
      setCurrentStep('form');
    }
  };

  const formatTxHash = (hash: string): string => {
    if (!hash) return '';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const renderProcessing = (): any => {
    const networkName = ['ETH', 'USDC', 'EURC'].includes(coinCode)
      ? 'Ethereum'
      : 'DENERGY';

    return (
      <LoadingScreenWithStep
        title={`Sending ${coinCode}...`}
        subtitle={
          currentProcessingStep ||
          `Processing your ${coinCode} transaction on ${networkName}`
        }
        icon="📤"
        progress={stepProgress}
        showProgressBar={true}
        showStepIndicators={true}
        animationSource={Animation.transferStartAnimation}
        stepIndicatorCount={10} // Increased to match number of steps
        feeInfo={result?.gasFee ? `Gas Fee: ${result.gasFee} ETH` : undefined}
        progressBarColor="#81c8c3"
        backgroundColor="#FFF"
        iconBackgroundColor="#E8F8F7"
      />
    );
  };

  const renderSuccess = (): any => {
    const networkName = ['ETH', 'USDC', 'EURC'].includes(coinCode)
      ? 'Ethereum'
      : 'DENERGY';

    const handleViewExplorer = () => {
      if (!transactionHash) {
        Alert.alert('Error', 'Transaction hash not available');
        return;
      }

      const explorerUrl = getBlockExploreLink(
        transactionHash,
        'transaction',
        networkName === 'Ethereum' ? 11155111 : '',
      );

      Linking.openURL(explorerUrl).catch(err => {
        console.error('Failed to open explorer:', err);
        Alert.alert('Error', 'Could not open explorer');
      });
    };

    const handleCopyHash = () => {
      if (!transactionHash) {
        Alert.alert('Error', 'Transaction hash not available');
        return;
      }

      Clipboard.setString(transactionHash);
      Alert.alert('Copied!', 'Transaction hash copied to clipboard');
    };

    const handleSuccessNavigation = (): void => {
      navigateTo('D.Energy');
    };

    return (
      <View style={successStyles.container}>
        {/* Success Icon and Title */}
        <View style={successStyles.headerSection}>
          <View style={successStyles.successIconContainer}>
            <LottieView
              source={Animation.transferSuccessAnimation}
              autoPlay
              duration={1000}
              loop={false}
              style={successStyles.successAnimation}
              speed={2}
            />
          </View>
          <DText fontStyle="fontBold" style={successStyles.title}>
            Transaction Successful!
          </DText>
          <DText style={successStyles.subtitle}>
            Your {coinCode} has been sent successfully
          </DText>
        </View>

        {/* Main Info Card */}
        <View style={successStyles.infoCard}>
          {/* Amount Section */}
          <View style={successStyles.amountSection}>
            <DText style={successStyles.amountLabel}>Amount Sent</DText>
            <DText fontStyle="fontBold" style={successStyles.amountValue}>
              {wattAmount}{' '}
              {coinCode === 'WUSDC'
                ? 'wUSDC'
                : coinCode === 'WEURC'
                ? 'wEURC'
                : coinCode}
            </DText>
            <View style={successStyles.networkFlow}>
              <View style={successStyles.networkBadge}>
                <DText style={successStyles.networkText}>{networkName}</DText>
              </View>
              <View style={successStyles.arrowContainer}>
                <Text style={successStyles.arrow}>→</Text>
              </View>
              <View style={successStyles.networkBadge}>
                <DText style={successStyles.networkText}>Recipient</DText>
              </View>
            </View>
          </View>

          {/* Transaction Hash Section */}
          {transactionHash && (
            <View style={successStyles.hashSection}>
              <DText style={successStyles.hashLabel}>Transaction Hash</DText>
              <View style={successStyles.hashContainer}>
                <Pressable
                  style={successStyles.hashDisplay}
                  onPress={handleCopyHash}>
                  <Text style={successStyles.hashText}>
                    {formatTxHash(transactionHash)}
                  </Text>
                  <Text style={successStyles.copyIcon}>📋</Text>
                </Pressable>
                <Pressable
                  style={successStyles.explorerButton}
                  onPress={handleViewExplorer}>
                  <Text style={successStyles.explorerIcon}>🔍</Text>
                </Pressable>
              </View>
              <DText style={successStyles.hashHint}>
                Tap hash to copy • Tap 🔍 to view on explorer
              </DText>
            </View>
          )}
        </View>

        {/* Continue Button */}
        <CustomImageButton
          backgroundImage={Images.buttonBg}
          label="Continue"
          labelStyle={{fontFamily: fontsFamily.MulishBold}}
          onPress={handleSuccessNavigation}
          containerWrapper={successStyles.submitButtonContainer}
          bgImg={successStyles.submitButtonImage}
        />
      </View>
    );
  };

  // Render current step
  const renderCurrentStep = (): any => {
    switch (currentStep) {
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      default:
        return renderForm();
    }
  };

  const renderForm = (): any => (
    <>
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
    </>
  );

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <Header
        headerTitle={`Send ${coinCode}`}
        backBtn={() => navigateBack()}
        hideBorder={true}
      />
      {renderCurrentStep()}
    </SafeAreaView>
  );
}

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successAnimation: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  networkFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  networkBadge: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  networkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  arrow: {
    fontSize: 16,
    color: '#81c8c3',
    fontWeight: 'bold',
  },
  hashSection: {
    marginBottom: 24,
  },
  hashLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  hashDisplay: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hashText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'monospace',
    fontWeight: '600',
    flex: 1,
  },
  copyIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  hashHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  explorerButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#81c8c3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#81c8c3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  explorerIcon: {
    fontSize: 20,
  },
  submitButtonContainer: {
    height: 51,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 0,
  },
  submitButtonImage: {
    height: 51,
    width: '100%',
  },
});
