import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomSheet} from 'react-native-btr';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Path, Svg} from 'react-native-svg';
import {ScreenWidth} from '@rneui/base';
import Clipboard from '@react-native-clipboard/clipboard';
import LottieView from 'lottie-react-native';

import {fontsFamily, Images, Animation} from '../../Theme';
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

export default function Swap(props: SwapProps) {
  const coinCode = props?.route?.params?.coinCode || 'WATT';
  const {magic, activeNetwork, setActiveNetwork} = useMagic();

  // Use our enhanced custom hook for all swap functionality
  const {
    // Wallet state
    account,
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

  // Set network to Denergy
  useEffect(() => {
    if (activeNetwork !== 'denergy') {
      setActiveNetwork('denergy');
    }
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

  // Handle slippage settings
  const SlippageSettings = () => (
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

  // Transaction status component
  const TransactionStatus = () => {
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
      {showSettings && <SlippageSettings />}

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
        <TransactionStatus />

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
                  {color: quote.priceImpact > 3 ? '#FF3B30' : '#34C759'},
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
        rightComponent={() => (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(!showSettings)}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        )}
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
    shadowOffset: {width: 0, height: 4},
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
    shadowOffset: {width: 0, height: 2},
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
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  networkFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenBadge: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  tokenText: {
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  explorerIcon: {
    fontSize: 20,
  },
});

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 18,
  },
  settingsContainer: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingsTitle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 16,
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  slippageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  slippageButton: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  slippageButtonActive: {
    backgroundColor: '#007AFF',
  },
  slippageButtonText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 14,
    color: '#000',
  },
  slippageButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  currentSlippage: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  connectionWarning: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  connectionWarningText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
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
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  toggleDropDownText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 16,
    color: '#000',
    flex: 1,
    marginLeft: 12,
  },
  input: {
    color: '#000000',
    fontFamily: fontsFamily.MulishBold,
    padding: 10,
    fontSize: 32,
    textAlign: 'center',
    minHeight: 60,
  },
  outputText: {
    color: '#666',
    fontFamily: fontsFamily.MulishBold,
    padding: 10,
    fontSize: 32,
    textAlign: 'center',
    minHeight: 60,
  },
  inputContainer: {
    marginHorizontal: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  availableBalance: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 14,
    color: '#666',
  },
  maxButton: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  maxButtonText: {
    color: '#fff',
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
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
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  swapToImage: {
    height: 20,
    width: 20,
  },
  textStyle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 16,
  },
  errorSec: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
    width: ScreenWidth - 42,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#FF3B30',
  },
  statusContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  txHashText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 10,
    color: '#81c8c3',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  balanceComponentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  balanceCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    width: ScreenWidth - 42,
    padding: 15,
    backgroundColor: '#FAFAFA',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  balanceLabel: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#848484',
  },
  balanceValue: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    color: '#000',
  },
  balanceDebit: {
    color: '#FF3B30',
    fontSize: 14,
  },
  balanceCredit: {
    color: '#34C759',
    fontSize: 14,
  },
  networkFeeRow: {
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  networkFeeText: {
    color: '#FF9500',
    fontSize: 12,
  },
  quoteInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quoteLabel: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 10,
    color: '#666',
    marginVertical: 1,
  },
  quoteDetails: {
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  quoteTitle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  quoteRowLabel: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#666',
  },
  quoteRowValue: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
  },
  buttonContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
  approveButton: {
    height: 51,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FF9500',
  },
  swapButton: {
    height: 51,
    borderRadius: 12,
    marginBottom: 10,
  },
  submitButtonContainer: {
    height: 51,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  buttonBg: {
    height: 51,
    width: '100%',
    borderRadius: 12,
  },
  bottomSheetContainer: {
    backgroundColor: '#ffffff',
    width: ScreenWidth - 20,
    alignSelf: 'center',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    paddingBottom: 20,
  },
  bottomSheetTab: {
    marginHorizontal: 165.5,
    marginTop: 7,
    width: 40,
    height: 4,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  bottomSheetTitle: {
    fontFamily: fontsFamily.MulishBold,
    marginTop: 20,
    fontSize: 18,
    color: '#333333',
    lineHeight: 21,
    textAlign: 'center',
  },
  bottomSheetDivider: {
    borderColor: '#DEDEDE',
    borderWidth: 0.75,
    marginHorizontal: 15,
  },
  bottomSheetContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  applyButton: {
    height: 51,
    borderRadius: 12,
    marginVertical: 10,
  },
});
