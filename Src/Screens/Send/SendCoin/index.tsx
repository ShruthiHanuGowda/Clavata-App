import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  Linking,
  TouchableOpacity,
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
import {SnackBarMessage} from '../../../utils/snackBar';

// Define types for route params
interface RouteParams {
  coinCode: string;
  user: User;
}

// Define User interface (adjust according to actual user properties)
interface User {
  id: string;
  name: string;
  beneficiaryAddress: string;
}

// Define balance return type
interface BalanceInfo {
  balance: string;
  balanceUsd: string;
}

interface SendCoinProps {
  route: {
    params: RouteParams;
  };
  navigation: any;
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
  const {getBalance, refreshBalance} = useWallet();
  const {balance}: BalanceInfo = getBalance(coinCode);
  const [wattAmount, setWattAmount] = useState<string>('0');
  const {magic} = useMagic();
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

  const {isLoading: ethIsLoading, sendTransaction: sendEthTransaction} =
    useSendEth(magic, userDetails?.userWallet ?? undefined);

  const {isLoading: usdcIsLoading, sendTransaction: sendUSDCTransaction} =
    useSendUSDCANDEURC(magic, userDetails?.userWallet ?? undefined);

  const {
    isLoading: usdcDenergyIsLoading,
    sendTransaction: sendDenergyUSDCTransaction,
  } = useSendDenergyUSDCAndEURC(magic, userDetails?.userWallet ?? undefined);

  const {
    isLoading: wattIsLoading,
    sendTransaction: sendWattTransaction,
    validateTransaction,
  } = useSendWatt(magic, userDetails?.userWallet ?? undefined);

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
  }, [currentStep, soundLoaded, soundError]);

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
    if (!steps) {
      return;
    }

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

  // Enhanced amount change handler with better precision
  const onChangeAmount = (val: string): void => {
    const cleaned = val.replace(/\s/g, '');
    const sanitized = cleaned.replace(/[^\d.]/g, '');

    // Handle multiple decimal points
    const parts = sanitized.split('.');
    const wholePart = parts[0] || '';
    const decimalPart =
      parts.length > 1 ? '.' + parts.slice(1).join('').substring(0, 18) : '';

    const output = wholePart + decimalPart;
    setWattAmount(output);
  };

  // New function to handle max amount
  const handleMaxAmount = (): void => {
    if (balance && parseFloat(balance) > 0) {
      if (coinCode === 'ETH') {
        const maxAmount = Math.max(0, parseFloat(balance) - 0.001);
        if (maxAmount > 0) {
          setWattAmount(maxAmount.toString());
        } else {
          setWattAmount('0');
          SnackBarMessage('Insufficient balance to send ETH', 'error');
        }
      } else {
        setWattAmount(balance);
      }
    }
  };

  // Enhanced balance comparison with better precision handling
  const isInsufficientBalance = (): boolean => {
    if (!wattAmount || wattAmount === '0' || wattAmount === '') {
      return false;
    }

    const amountNum = parseFloat(wattAmount);
    const balanceNum = parseFloat(balance);

    // Handle very small numbers with precision
    return amountNum > balanceNum;
  };

  // Enhanced validation for send button
  const isSendDisabled = (): boolean => {
    return (
      wattAmount === '0' ||
      wattAmount === null ||
      wattAmount === '' ||
      isInsufficientBalance() ||
      ethIsLoading ||
      usdcIsLoading ||
      wattIsLoading ||
      usdcDenergyIsLoading ||
      parseFloat(wattAmount) <= 0
    );
  };

  const onVerify = async (): Promise<void> => {
    console.log(coinCode);
    setCurrentStep('processing');
    resetSendState();

    // Start the enhanced processing simulation
    const processingPromise = simulateProcessingSteps();

    try {
      // Use the sendTransaction method from our hook with a success callback
      // await setActiveNetwork('sepolia');
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
          updateProcessingStep('COMPLETED');
          setCurrentStep('success');
          refreshBalance(coinCode);
        });
      }
      if (coinCode === 'USDC') {
        // await setActiveNetwork('sepolia');
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
          updateProcessingStep('COMPLETED');
          setCurrentStep('success');
          refreshBalance(coinCode);
        });
      }
      if (coinCode === 'EURC') {
        // await setActiveNetwork('sepolia');
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
          updateProcessingStep('COMPLETED');
          setCurrentStep('success');
          refreshBalance(coinCode);
        });
      }
      if (coinCode === 'WATT') {
        updateProcessingStep('SWITCHING_NETWORK');
        const transactionDetails = {
          to: user?.beneficiaryAddress,
          amount: wattAmount,
        };
        // await setActiveNetwork('denergy');
        try {
          // updateProcessingStep('VALIDATING_ADDRESS');
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
            updateProcessingStep('COMPLETED');
            setCurrentStep('success');
            refreshBalance(coinCode);
          });
        } catch (err) {
          console.error('Failed to send WATT:', err);
          setCurrentStep('form');
          throw err;
        }
      }
      if (coinCode === 'WUSDC') {
        // await setActiveNetwork('denergy');
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
            updateProcessingStep('COMPLETED');
            setCurrentStep('success');
            refreshBalance(coinCode);
          },
        );
      }
      if (coinCode === 'WEURC') {
        // await setActiveNetwork('denergy');
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
            updateProcessingStep('COMPLETED');
            setCurrentStep('success');
            refreshBalance(coinCode);
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
      SnackBarMessage(err.message || 'Transaction failed', 'error');
      setCurrentStep('form');
    }
  };

  const formatTxHash = (hash: string): string => {
    if (!hash) {
      return '';
    }
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
        stepIndicatorCount={10}
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
      <ScrollView style={style.successContainer}>
        {/* Success Icon and Title */}
        <View style={style.headerSection}>
          <View style={style.successIconContainer}>
            <LottieView
              source={Animation.transferSuccessAnimation}
              autoPlay
              duration={1000}
              loop={false}
              style={style.successAnimation}
              speed={2}
            />
          </View>
          <DText fontStyle="fontBold" style={style.title}>
            Transaction Successful!
          </DText>
          <DText style={style.subtitle}>
            Your {coinCode} has been sent successfully
          </DText>
        </View>

        {/* Main Info Card */}
        <View style={style.infoCard}>
          {/* Amount Section */}
          <View style={style.amountSection}>
            <DText style={style.amountLabel}>Amount Sent</DText>
            <DText fontStyle="fontBold" style={style.amountValue}>
              {wattAmount}{' '}
              {coinCode === 'WUSDC'
                ? 'wUSDC'
                : coinCode === 'WEURC'
                ? 'wEURC'
                : coinCode}
            </DText>
            <View style={style.networkFlow}>
              <View style={style.networkBadge}>
                <DText style={style.networkText}>{networkName}</DText>
              </View>
              <View style={style.arrowContainer}>
                <Text style={style.arrow}>→</Text>
              </View>
              <View style={style.networkBadge}>
                <DText style={style.networkText}>Recipient</DText>
              </View>
            </View>
          </View>

          {/* Transaction Hash Section */}
          {transactionHash && (
            <View style={style.hashSection}>
              <DText style={style.hashLabel}>Transaction Hash</DText>
              <View style={style.hashContainer}>
                <Pressable style={style.hashDisplay} onPress={handleCopyHash}>
                  <Text style={style.hashText}>
                    {formatTxHash(transactionHash)}
                  </Text>
                  <Text style={style.copyIcon}>📋</Text>
                </Pressable>
                <Pressable
                  style={style.explorerButton}
                  onPress={handleViewExplorer}>
                  <Text style={style.explorerIcon}>🔍</Text>
                </Pressable>
              </View>
              <DText style={style.hashHint}>
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
          containerWrapper={style.submitButtonContainer}
          bgImg={style.submitButtonImage}
        />
      </ScrollView>
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
          <View style={style.sendHeaderContainer}>
            <Text style={style.sendHeader}>SEND</Text>
          </View>
          <View style={style.inputWrapper}>
            <View style={style.inputContainer}>
              <TextInput
                keyboardType="decimal-pad"
                value={wattAmount}
                placeholder="0.0"
                placeholderTextColor={'#000'}
                onChangeText={(value: string) => onChangeAmount(value)}
                style={style.amountInput}
              />
              <View style={style.tokenBadge}>
                <Text style={style.watt}>
                  {coinCode === 'WUSDC'
                    ? 'wUSDC'
                    : coinCode === 'WEURC'
                    ? 'wEURC'
                    : coinCode}
                </Text>
              </View>
            </View>
          </View>
          {isInsufficientBalance() && (
            <View style={style.errorContainer}>
              <Text style={style.errorText}>Insufficient balance</Text>
            </View>
          )}
          <View style={style.inputWrapper}>
            <View style={style.balanceContainer}>
              <View style={style.balanceRow}>
                <Text style={style.balanceLabel}>Available Tokens</Text>
                <Text style={style.balanceValue}>
                  {balance}{' '}
                  {coinCode === 'WUSDC'
                    ? 'wUSDC'
                    : coinCode === 'WEURC'
                    ? 'wEURC'
                    : coinCode}
                </Text>
              </View>
              <TouchableOpacity
                style={style.maxButton}
                onPress={handleMaxAmount}
                disabled={!balance || parseFloat(balance) <= 0}>
                <Text style={style.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <DButton
        type="primary"
        style={styles.loginBtnStyle}
        disabled={isSendDisabled()}
        onPress={() => onVerify()}>
        <Text style={[styles.loginText]}>
          {ethIsLoading ||
          usdcIsLoading ||
          wattIsLoading ||
          usdcDenergyIsLoading
            ? 'Sending...'
            : 'Send'}
        </Text>
      </DButton>
    </>
  );

  return (
    <SafeAreaView style={style.safeAreaContainer}>
      <Header
        headerTitle={`Send ${coinCode}`}
        backBtn={() => navigateBack()}
        hideBorder={true}
      />
      {renderCurrentStep()}
    </SafeAreaView>
  );
}
