import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomSheet} from 'react-native-btr';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Path, Svg} from 'react-native-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import LottieView from 'lottie-react-native';

import {Images, Animation} from '../../Theme';
import {DText} from '../../Componants/DText';
import {CustomImageButton, Header, RadioButton} from '../../Componants';
import {marketIcons} from '../../Theme/variable';
import images from '../../Theme/images';
import {navigateBack} from '../../Navigation/NavigationFunctions';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import useSwap from '../../hooks/useSwap';
import {SwapConfirmationModal} from './SwapConfirmationModal';
import LoaderAnimation from '../../Componants/Loading/LoaderAnimation';
import LoadingScreenWithStep from '../../Componants/Loading/LoadingScreenWIthStep';
import {getBlockExploreLink} from '../../utils/explorer';
import {useSuccessSound} from '../../hooks/useSuccessSound';
import {navigateTo} from '../../utils/navigationService';
import {CUSTOM_NETWORK_CHAIN_ID} from '../../constants';
import {styles, successStyles} from './styles';

type CoinOption = {
  key: string;
  text: string;
};

interface SwapProps {
  route?: {
    params?: {
      coinCode: string;
    };
  };
}

interface SlippageSettingsProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  slippage: number;
  setSlippage: (value: number) => void;
}

interface TransactionStatusProps {
  txStatus?: string;
  isLoading: boolean;
  txHash?: string;
}

interface SettingsButtonProps {
  onPress: () => void;
}

// Extracted components
const SlippageSettings: React.FC<SlippageSettingsProps> = ({
  showSettings,
  setShowSettings,
  slippage,
  setSlippage,
}) => {
  if (!showSettings) {
    return null;
  }
  return (
    <View style={styles.settingsContainer}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>Slippage Tolerance</Text>
        <TouchableOpacity onPress={() => setShowSettings(false)}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.slippageOptions}>
        {[0.1, 0.5, 1.0, 3.0].map(value => (
          <TouchableOpacity
            key={value}
            style={[
              styles.slippageButton,
              slippage === value && styles.slippageButtonActive,
            ]}
            onPress={() => setSlippage(value)}>
            <Text
              style={[
                styles.slippageButtonText,
                slippage === value && styles.slippageButtonTextActive,
              ]}>
              {value}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.currentSlippage}>Current: {slippage}%</Text>
    </View>
  );
};

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  txStatus,
  isLoading,
  txHash,
}) => {
  if (!txStatus) {
    return null;
  }

  return (
    <View style={styles.statusContainer}>
      <View style={styles.statusHeader}>
        {isLoading && <LoaderAnimation size="small" />}
        <Text style={styles.statusText}>{txStatus}</Text>
      </View>
      {txHash && (
        <TouchableOpacity
          onPress={() => {
            console.log('View transaction:', txHash);
          }}>
          <Text style={styles.txHashText}>
            Transaction: {txHash.substring(0, 10)}...
            {txHash.substring(txHash.length - 8)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const SettingsButton: React.FC<SettingsButtonProps> = ({onPress}) => (
  <TouchableOpacity style={styles.settingsButton} onPress={onPress}>
    <Text style={styles.settingsIcon}>⚙️</Text>
  </TouchableOpacity>
);

export default function Swap(props: SwapProps) {
  const coinCode = props?.route?.params?.coinCode || 'WATT';
  const {magic, activeNetwork, setActiveNetwork} = useMagic();

  // Use our enhanced custom hook for all swap functionality
  const {
    // Wallet state
    isConnected,

    // Token state
    selectedToken,
    selectedTargetToken,
    setSelectedToken,
    setSelectedTargetToken,
    TOKENS,

    // Amount state
    amount,
    amountInTokens,
    // usdvalue,
    networkfee,
    changeAmount,

    // Loading and error state
    isLoading,
    errorMessage,
    txStatus,
    txHash,

    // Balance and allowance
    balance,

    // Quote data
    quote,
    slippage,
    setSlippage,

    // Functions
    getBalance,
    needsApproval,
    approveToken,
    executeSwap,
    switchTokens,
    checkDisable,

    // Helper functions
    getInputToken,
    // getOutputToken,

    // New step processing states
    currentProcessingStep,
    stepProgress,
    swapSuccess,
    transactionHash,
    resetSwapState,
  } = useSwap(magic);

  // Local state for UI
  const [selectionTarget, setSelectionTarget] = useState<'from' | 'to'>('from');
  const [currentStep, setCurrentStep] = useState<
    'form' | 'confirmation' | 'processing' | 'success'
  >('form');
  const [options, setOptions] = useState<CoinOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Track if we're currently processing to prevent race conditions
  const isProcessingRef = useRef(false);

  const {
    playSuccessSound,
    isLoaded: soundLoaded,
    error: soundError,
  } = useSuccessSound();

  useEffect(() => {
    if (activeNetwork !== 'denergy') {
      setActiveNetwork('denergy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNetwork]);

  // Convert TOKENS object to array for dropdown - only WATT and USDC
  const allCoins: CoinOption[] = Object.values(TOKENS).map(token => ({
    key: token.symbol,
    text: token.symbol,
  }));

  // Mock balance data for display
  const selectedCoinData = {
    tokenBalance: balance || '0',
  };

  // Initialize with coinCode from route params
  useEffect(() => {
    if (coinCode && TOKENS[coinCode]) {
      setSelectedToken(coinCode);
      // Set target token to the other available token
      const targetOptions = Object.keys(TOKENS).filter(key => key !== coinCode);
      if (targetOptions.length > 0) {
        setSelectedTargetToken(targetOptions[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinCode, setSelectedToken, setSelectedTargetToken]);

  // Get balance when component mounts or token changes
  useEffect(() => {
    if (isConnected) {
      getBalance(selectedToken);
    }
  }, [isConnected, selectedToken, getBalance]);

  useEffect(() => {
    if (
      swapSuccess &&
      isProcessingRef.current &&
      (currentStep === 'processing' || currentStep === 'form')
    ) {
      setCurrentStep('success');
      isProcessingRef.current = false;
    }
  }, [swapSuccess, currentStep]);

  useEffect(() => {
    if (currentStep === 'success') {
      const timer = setTimeout(() => {
        if (soundLoaded) {
          playSuccessSound();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, soundLoaded, soundError]);

  const onNextAction = () => {
    if (selectionTarget === 'from') {
      setSelectedToken(selectedOption);
    } else {
      setSelectedTargetToken(selectedOption);
    }
    togglebottomView(false);
  };

  const onSubmit = async () => {
    if (!isConnected) {
      Alert.alert('Wallet Error', 'Magic wallet not connected properly');
      return;
    }

    if (checkDisable()) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to swap');
      return;
    }

    if (needsApproval()) {
      resetSwapState();
      setCurrentStep('processing');
      try {
        await approveToken();
        setCurrentStep('confirmation');
      } catch (error: any) {
        Alert.alert(
          'Approval Failed',
          error.message || 'Unknown error occurred',
        );
        setCurrentStep('form');
      }
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSwap = async () => {
    setShowConfirmModal(false);

    resetSwapState();
    isProcessingRef.current = true;

    setCurrentStep('processing');

    try {
      await executeSwap();
    } catch (error: any) {
      Alert.alert('Swap Failed', error.message || 'Unknown error occurred');
      setCurrentStep('form');
      isProcessingRef.current = false;
    }
  };

  const togglebottomView = (type: boolean | 'from' | 'to') => {
    if (typeof type === 'boolean') {
      setVisible(type);
    } else {
      setVisible(!visible);
      setSelectionTarget(type);
      if (type === 'from') {
        setOptions(allCoins);
        setSelectedOption(selectedToken);
      } else {
        setOptions(allCoins.filter(val => val.key !== selectedToken));
        setSelectedOption(selectedTargetToken);
      }
    }
  };

  const selectedValue = (value: string) => {
    setSelectedOption(value);
  };

  const formatTxHash = (hash: string): string => {
    if (!hash) {
      return '';
    }
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  // Handle success navigation
  const handleSuccessNavigation = (): void => {
    setCurrentStep('form');
    isProcessingRef.current = false;
    resetSwapState();
    navigateTo('D.Energy');
  };

  // Render processing screen
  const renderProcessing = () => {
    const operationType = currentProcessingStep.includes('approval')
      ? 'Token Approval'
      : 'Swap';
    const operationIcon = currentProcessingStep.includes('approval')
      ? '🔓'
      : '🔄';

    return (
      <LoadingScreenWithStep
        title={`Processing ${operationType}...`}
        subtitle={
          currentProcessingStep ||
          `Processing ${selectedToken} to ${selectedTargetToken} swap`
        }
        icon={operationIcon}
        progress={stepProgress}
        showProgressBar={true}
        showStepIndicators={true}
        animationSource={
          Animation.swapAnimation || Animation.bridgeAnimation || null
        }
        stepIndicatorCount={currentProcessingStep.includes('approval') ? 5 : 8}
        feeInfo={
          networkfee > 0 ? `Network Fee: ~${networkfee} WATT` : undefined
        }
        progressBarColor="#81c8c3"
        backgroundColor="#FFF"
        iconBackgroundColor="#E8F8F7"
      />
    );
  };

  // Render success screen
  const renderSuccess = () => {
    const operationType = currentProcessingStep.includes('approval')
      ? 'Approval'
      : 'Swap';

    const handleViewExplorer = () => {
      if (!transactionHash) {
        Alert.alert('Error', 'Transaction hash not available');
        return;
      }

      const explorerUrl = getBlockExploreLink(
        transactionHash,
        'transaction',
        CUSTOM_NETWORK_CHAIN_ID,
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
            {operationType} Successful!
          </DText>
          <DText style={successStyles.subtitle}>
            Your {operationType.toLowerCase()} transaction completed
            successfully
          </DText>
        </View>

        {/* Main Info Card */}
        <View style={successStyles.infoCard}>
          {/* Amount Section - Only show for swaps, not approvals */}
          {!currentProcessingStep.includes('approval') && (
            <>
              <View style={successStyles.amountSection}>
                <DText style={successStyles.amountLabel}>Amount Swapped</DText>
                <DText fontStyle="fontBold" style={successStyles.amountValue}>
                  {amount} {selectedToken} → {amountInTokens.toFixed(6)}{' '}
                  {selectedTargetToken}
                </DText>
                <View style={successStyles.networkFlow}>
                  <View style={successStyles.tokenBadge}>
                    <Image
                      source={marketIcons[selectedToken]}
                      style={successStyles.tokenIcon}
                    />
                    <DText style={successStyles.tokenText}>
                      {selectedToken}
                    </DText>
                  </View>
                  <View style={successStyles.arrowContainer}>
                    <Text style={successStyles.arrow}>→</Text>
                  </View>
                  <View style={successStyles.tokenBadge}>
                    <Image
                      source={marketIcons[selectedTargetToken]}
                      style={successStyles.tokenIcon}
                    />
                    <DText style={successStyles.tokenText}>
                      {selectedTargetToken}
                    </DText>
                  </View>
                </View>
              </View>
            </>
          )}

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
      </View>
    );
  };



  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'processing':
        return renderProcessing();
      case 'success':
        return (
          <ScrollView style={styles.screen}>
            {renderSuccess()}
            <CustomImageButton
              backgroundImage={Images.buttonBg}
              label="Continue"
              labelStyle={styles.textStyle}
              onPress={handleSuccessNavigation}
              containerWrapper={styles.submitButtonContainer}
              bgImg={styles.buttonBg}
            />
          </ScrollView>
        );
      default:
        return renderForm();
    }
  };

  // Balance component with better formatting
  const balanceComponent = (
    <View style={styles.balanceComponentContainer}>
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Swap From</Text>
          <Text style={styles.balanceValue}>
            {selectedToken}{' '}
            {parseFloat(selectedCoinData?.tokenBalance || '0').toFixed(6)}
            {Number(amount) > 0 && (
              <DText style={styles.balanceDebit}>{` -${parseFloat(
                amount,
              )}`}</DText>
            )}
          </Text>
        </View>

        {networkfee > 0 && (
          <View style={styles.networkFeeRow}>
            <DText
              style={
                styles.networkFeeText
              }>{`+ Network Fee ${networkfee} WATT`}</DText>
          </View>
        )}

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Swap To</Text>
          <Text style={styles.balanceValue}>
            {selectedTargetToken}
            {Number(amountInTokens) > 0 && (
              <DText style={styles.balanceCredit}>{` +${Number(
                amountInTokens,
              ).toFixed(6)}`}</DText>
            )}
          </Text>
        </View>

        {quote && amount && parseFloat(amount) > 0 && (
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteLabel}>
              Rate: 1 {selectedToken} ={' '}
              {(amountInTokens / parseFloat(amount)).toFixed(6)}{' '}
              {selectedTargetToken}
            </Text>
            <Text style={styles.quoteLabel}>
              Price Impact: {quote.priceImpact.toFixed(2)}%
            </Text>
            <Text style={styles.quoteLabel}>
              Fee Tier: {quote.feeKey} ({quote.fee.toFixed(2)}%)
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Main form component
  const renderForm = () => (
    <>
      <SlippageSettings
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        slippage={slippage}
        setSlippage={setSlippage}
      />

      <ScrollView keyboardShouldPersistTaps="handled" style={styles.container}>
        {/* Connection Status */}
        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Text style={styles.connectionWarningText}>
              Magic wallet not connected
            </Text>
          </View>
        )}

        {/* From Token Selection */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={styles.toggleDropDown}
            activeOpacity={0.8}
            onPress={() => togglebottomView('from')}>
            <Image
              source={marketIcons[selectedToken]}
              style={styles.tokenIcon}
            />
            <Text style={styles.toggleDropDownText}>{selectedToken}</Text>
            <Svg width="15" height="8" viewBox="0 0 15 8" fill="none">
              <Path
                d="M13.2599 1.24914L8.36988 6.13914C7.79238 6.71664 6.84738 6.71664 6.26988 6.13914L1.37988 1.24914"
                stroke="#292D32"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <TextInput
            keyboardType="decimal-pad"
            value={amount}
            maxLength={10}
            placeholder="0.0"
            placeholderTextColor="#999"
            onChangeText={changeAmount}
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        {/* Available Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.availableBalance}>
            Available {parseFloat(balance || '0').toFixed(6)} {selectedToken}
          </Text>
          {parseFloat(balance || '0') > 0 && (
            <TouchableOpacity
              onPress={() => changeAmount(balance)}
              style={styles.maxButton}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Swap Direction Indicator */}
        <View style={styles.swapToImageContainer}>
          <View style={styles.swapToImagePadding}>
            {isLoading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <TouchableOpacity onPress={switchTokens}>
                <Image source={images.receiveIcon} style={styles.swapToImage} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* To Token Selection */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={styles.toggleDropDown}
            activeOpacity={0.8}
            onPress={() => togglebottomView('to')}>
            <Image
              source={marketIcons[selectedTargetToken]}
              style={styles.tokenIcon}
            />
            <Text style={styles.toggleDropDownText}>{selectedTargetToken}</Text>
            <Svg width="15" height="8" viewBox="0 0 15 8" fill="none">
              <Path
                d="M13.2599 1.24914L8.36988 6.13914C7.79238 6.71664 6.84738 6.71664 6.26988 6.13914L1.37988 1.24914"
                stroke="#292D32"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Output Amount Display */}
        <View style={styles.inputContainer}>
          <Text style={styles.outputText}>
            {isLoading ? 'Getting quote...' : (amountInTokens || 0).toFixed(6)}
          </Text>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorSec}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Transaction Status */}
        <TransactionStatus
          txStatus={txStatus}
          isLoading={isLoading}
          txHash={txHash}
        />

        {/* Balance Summary */}
        {balanceComponent}

        {/* Quote Details */}
        {quote && amount && parseFloat(amount) > 0 && (
          <View style={styles.quoteDetails}>
            <Text style={styles.quoteTitle}>Quote Details</Text>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteRowLabel}>Rate</Text>
              <Text style={styles.quoteRowValue}>
                1 {selectedToken} ={' '}
                {(amountInTokens / parseFloat(amount)).toFixed(6)}{' '}
                {selectedTargetToken}
              </Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteRowLabel}>Price Impact</Text>
              <Text
                style={[
                  styles.quoteRowValue,
                  quote.priceImpact > 3 ? styles.priceImpactHigh : styles.priceImpactLow,
                ]}>
                {quote.priceImpact.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteRowLabel}>Fee</Text>
              <Text style={styles.quoteRowValue}>
                {quote.fee.toFixed(2)}% ({quote.feeKey})
              </Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteRowLabel}>Slippage</Text>
              <Text style={styles.quoteRowValue}>{slippage}%</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {needsApproval() && (
          <CustomImageButton
            backgroundImage={Images.buttonBg}
            label={`Approve ${getInputToken().symbol}`}
            labelStyle={styles.textStyle}
            onPress={onSubmit}
            containerWrapper={[
              styles.approveButton,
              {opacity: isLoading ? 0.6 : 1},
            ]}
            bgImg={styles.buttonBg}
            disable={isLoading || !amount}
          />
        )}

        <CustomImageButton
          backgroundImage={Images.buttonBg}
          label={
            !isConnected
              ? 'Wallet Not Connected'
              : checkDisable()
              ? 'Enter Amount'
              : needsApproval()
              ? 'Approve First'
              : 'Swap'
          }
          labelStyle={styles.textStyle}
          onPress={onSubmit}
          containerWrapper={[
            styles.swapButton,
            {opacity: checkDisable() || !isConnected ? 0.6 : 1},
          ]}
          bgImg={styles.buttonBg}
          disable={
            checkDisable() ||
            !isConnected ||
            (needsApproval() && !txStatus.includes('approved'))
          }
        />
      </View>

      <SwapConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSwap}
        fromToken={selectedToken}
        toToken={selectedTargetToken}
        fromAmount={amount}
        toAmount={amountInTokens.toFixed(6)}
        slippage={slippage}
        networkFee={networkfee}
        priceImpact={quote?.priceImpact || 0}
        exchangeRate={`1 ${selectedToken} = ${
          amount && parseFloat(amount) > 0
            ? (amountInTokens / parseFloat(amount)).toFixed(6)
            : '0'
        } ${selectedTargetToken}`}
        isLoading={isLoading}
      />

      {/* Token Selection Bottom Sheet */}
      <BottomSheet
        visible={visible}
        onBackButtonPress={() => togglebottomView(false)}
        onBackdropPress={() => togglebottomView(false)}>
        <View style={styles.bottomSheetContainer}>
          <Image style={styles.bottomSheetTab} source={Images.bottomsheetTab} />
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Select Token</Text>
          </View>
          <View style={styles.bottomSheetDivider} />
          <View style={styles.bottomSheetContent}>
            <RadioButton
              PROP={options}
              selectedOption={selectedOption}
              selectedValue={selectedValue}
            />
            <CustomImageButton
              backgroundImage={Images.buttonBg}
              label="Apply"
              labelStyle={styles.textStyle}
              onPress={onNextAction}
              containerWrapper={styles.applyButton}
              bgImg={styles.buttonBg}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );

  // MAIN RENDER
  return (
    <SafeAreaView style={styles.screen}>
      <Header
        headerTitle="Swap"
        hideBorder={true}
        backBtn={() => navigateBack()}
        rightComponent={<SettingsButton onPress={() => setShowSettings(!showSettings)} />}
      />
      {renderCurrentStep()}
    </SafeAreaView>
  );
}


