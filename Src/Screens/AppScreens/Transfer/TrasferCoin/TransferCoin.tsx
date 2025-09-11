import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
  Alert,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import {BottomSheet} from 'react-native-btr';
import {CustomImageButton, Header, RadioButton} from '../../../../components';
import {Animation, Colors, fontsFamily, Images} from '../../../../Theme';
import {navigateTo} from '../../../../utils/navigationService';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Path, Svg} from 'react-native-svg';
import {ScreenWidth} from '@rneui/base';
import {marketIcons} from '../../../../Theme/variable';
import {DText} from '../../../../components/DText';
import {navigateBack} from '../../../../Navigation/NavigationFunctions';
import {useWallet} from '../../../../../screens/Provider/WalletProvider';
import {ReactElement} from 'react';
import {useBridge} from '../../../../hooks/useBridge';
import LottieView from 'lottie-react-native';
import LoadingScreenWithStep from '../../../../components/Loading/LoadingScreenWIthStep';
import {getBlockExploreLink} from '../../../../utils/explorer';
import {SnackBarMessage} from '../../../../utils/snackBar';
import {useSuccessSound} from '../../../../hooks/useSuccessSound';
import {SEPOLIA_CHAIN_ID} from '../../../../constants';

// Define types
type TokenKey = 'USDC' | 'WUSDC' | 'EURC' | 'WEURC';

interface TokenInfo {
  name: string;
  wrapped?: TokenKey;
  unwrapped?: TokenKey;
  network: 'ETH' | 'DENERGY';
}

interface TokenOption {
  key: TokenKey;
  text: string;
}

interface TokenBalance {
  balance: string;
  balanceUsd: string;
}

interface ScreenParams {
  coinCode?: TokenKey;
}

interface TransferCoinProps {
  route?: {
    params?: ScreenParams;
  };
}

interface SwapApiParams {
  sourceCoin: TokenKey;
  amount: string;
  targetCoin: TokenKey;
}

interface SwapApiResponse {
  data: {
    conversionAmountInUsd: number;
    conversionAmount: number;
  };
}

interface FeeApiResponse {
  data: {
    networkFee: number;
  };
}

// Token definitions
const TOKENS: Record<TokenKey, TokenInfo> = {
  USDC: {name: 'USDC', wrapped: 'WUSDC', network: 'ETH'},
  WUSDC: {name: 'wUSDC', unwrapped: 'USDC', network: 'DENERGY'},
  EURC: {name: 'EURC', wrapped: 'WEURC', network: 'ETH'},
  WEURC: {name: 'wEURC', unwrapped: 'EURC', network: 'DENERGY'},
};

const allCoins: TokenOption[] = [
  {key: 'USDC', text: 'USDC'},
  {key: 'WUSDC', text: 'wUSDC'},
  {key: 'EURC', text: 'EURC'},
  {key: 'WEURC', text: 'wEURC'},
];

// Helper function to format amounts
const formatAmount = (amount: string | number | undefined): string => {
  if (!amount) {
    return '0';
  }
  return parseFloat(amount.toString()).toFixed(6);
};

// Helper function to sanitize input values
const sanitizeInputValue = (value: string): string => {
  if (!value) {
    return '0';
  }

  const cleaned = value.replace(/\s/g, '').replace(/[^\d.]/gi, '');
  const parts = cleaned.split('.');
  return (
    parts.shift() + (parts.length ? '.' + parts.join('').substring(0, 6) : '')
  );
};

const initiateSwapApi = async (
  params: SwapApiParams,
): Promise<[Error | null, SwapApiResponse | null]> => {
  try {
    const result: SwapApiResponse = {
      data: {
        conversionAmountInUsd: parseFloat(params.amount) * 0.98,
        conversionAmount: parseFloat(params.amount) * 0.98,
      },
    };
    return [null, result];
  } catch (error) {
    return [error as Error, null];
  }
};

const networkFeeApi = async (
  params: SwapApiParams,
): Promise<[Error | null, FeeApiResponse | null]> => {
  try {
    const result: FeeApiResponse = {
      data: {
        networkFee: parseFloat(params.amount) * 0.01,
      },
    };
    return [null, result];
  } catch (error) {
    return [error as Error, null];
  }
};

export default function TransferCoin(props: TransferCoinProps): ReactElement {
  const {getBalance} = useWallet();
  const {
    isLoading: bridgeLoading,
    currentProcessingStep,
    stepProgress,
    bridgeSuccess,
    transactionHash,
    bridgeUSDC,
    bridgeEURC,
    bridgeWUSDC,
    bridgeWEURC,
    resetBridgeState,
  } = useBridge();

  const initialCoinCode = props?.route?.params?.coinCode || 'USDC';

  // State management
  const [transactionType, setTransactionType] = useState<0 | 1>(
    initialCoinCode === 'USDC' || initialCoinCode === 'EURC' ? 0 : 1,
  );
  const [coinCode, setCoinCode] = useState<TokenKey>(initialCoinCode);
  const [selectedToken, setToken] = useState<TokenKey>(initialCoinCode);

  const [selectedTargetToken, setTargetToken] = useState<TokenKey>('WUSDC');
  const [selectedOption, setSelectedOption] =
    useState<TokenKey>(initialCoinCode);

  // Amount states
  const [amount, setAmount] = useState<string>('');
  const [amountInTokens, setAmountInTokens] = useState<string>('0');
  // const [usdValue, setUsdValue] = useState<number>(0);
  const [networkFee, setNetworkFee] = useState<number>(0);

  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [options, setOptions] = useState<TokenOption[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'form' | 'processing' | 'success'
  >('form');

  const {balance: tokenBalance}: TokenBalance = getBalance(selectedToken);

  const {
    playSuccessSound,
    isLoaded: soundLoaded,
    error: soundError,
  } = useSuccessSound();

  useEffect(() => {
    if (bridgeSuccess) {
      setCurrentStep('success');
    }
  }, [bridgeSuccess]);

  useEffect(() => {
    const token = TOKENS[selectedToken];
    if (token) {
      if (transactionType === 0) {
        setTargetToken(token.wrapped || 'WUSDC');
      } else {
        setTargetToken(token.unwrapped || 'USDC');
      }
    }

    setAmount('');
    setAmountInTokens('0');
    // setUsdValue(0);
    setNetworkFee(0);
    setErrorMessage(null);
  }, [selectedToken, transactionType]);

  // Update available options when transaction type changes
  useEffect(() => {
    if (transactionType === 0) {
      setOptions(
        allCoins.filter(coin => coin.key === 'USDC' || coin.key === 'EURC'),
      );
      setToken(
        coinCode === 'WUSDC'
          ? 'USDC'
          : coinCode === 'WEURC'
          ? 'EURC'
          : coinCode,
      );
    } else {
      setOptions(
        allCoins.filter(coin => coin.key === 'WUSDC' || coin.key === 'WEURC'),
      );
      setToken(
        coinCode === 'USDC'
          ? 'WUSDC'
          : coinCode === 'EURC'
          ? 'WEURC'
          : coinCode,
      );
    }
  }, [transactionType, coinCode]);

  // Validate amount and initiate swap if valid
  useEffect(() => {
    const validateAndInitiateSwap = async (): Promise<void> => {
      const cleanAmount = sanitizeInputValue(amount);

      setErrorMessage(null);

      if (
        !cleanAmount ||
        parseFloat(cleanAmount) === 0 ||
        cleanAmount.endsWith('.')
      ) {
        // setUsdValue(0);
        setAmountInTokens('0');
        setNetworkFee(0);
        return;
      }

      if (parseFloat(cleanAmount) > parseFloat(tokenBalance)) {
        setErrorMessage('Insufficient balance');
        // setUsdValue(0);
        setNetworkFee(0);
        setAmountInTokens('0');
        return;
      }

      await initiateSwap(cleanAmount);
    };

    validateAndInitiateSwap();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, tokenBalance]);

  useEffect(() => {
    if (currentStep === 'success') {
      const timer = setTimeout(() => {
        if (soundLoaded) {
          playSuccessSound();
        } else {
          console.info(
            'Sound not loaded yet, isLoaded:',
            soundLoaded,
            'error:',
            soundError,
          );
        }
      }, 500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, soundLoaded, soundError]);

  // API call to get swap details
  const initiateSwap = async (val: string): Promise<void> => {
    try {
      setIsLoading(true);

      const params: SwapApiParams = {
        sourceCoin: selectedToken,
        amount: val,
        targetCoin: selectedTargetToken,
      };

      const [error, result] = await initiateSwapApi(params);
      const [feeError, feeResult] = await networkFeeApi(params);

      if (error || !result || feeError || !feeResult) {
        throw new Error(error?.message || feeError?.message || 'API error');
      }

      setIsLoading(false);
      setAmountInTokens(val);
      setNetworkFee(0);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Error fetching conversion data');
      console.error('Swap error:', error);
    }
  };

  // Toggle token selection modal
  const toggleBottomView = (event?: string): void => {
    if (event === 'press') {
      setSelectedOption(selectedToken);
      setVisible(!visible);
    }
  };

  // Select token from modal
  const selectedValue = (value: TokenKey): void => {
    setSelectedOption(value);
  };

  // Apply selected token and close modal
  const onNextAction = (): void => {
    setToken(selectedOption);
    setCoinCode(selectedOption);
    setVisible(false);
  };

  // Handle transaction submission
  const onSubmit = async (): Promise<void> => {
    setCurrentStep('processing');
    resetBridgeState();

    if (selectedToken === 'USDC') {
      try {
        await bridgeUSDC(amount);
      } catch (error) {
        console.error('Bridge failed:', error);
        SnackBarMessage('Bridge failed', 'error');
        setCurrentStep('form');
      }
    }
    if (selectedToken === 'EURC') {
      try {
        await bridgeEURC(amount);
      } catch (error) {
        console.error('Bridge failed:', error);
        SnackBarMessage('Bridge failed', 'error');
        setCurrentStep('form');
      }
    }
    if (selectedToken === 'WUSDC') {
      try {
        await bridgeWUSDC(amount);
      } catch (error) {
        console.error('Bridge failed:', error);
        SnackBarMessage('Bridge failed', 'error');
        setCurrentStep('form');
      }
    }

    if (selectedToken === 'WEURC') {
      try {
        await bridgeWEURC(amount);
      } catch (error) {
        console.error('Bridge failed:', error);
        SnackBarMessage('Bridge failed', 'error');
        setCurrentStep('form');
      }
    }
  };

  // Check if submit button should be disabled
  const isSubmitDisabled = (): boolean => {
    return (
      parseFloat(amount) <= 0 ||
      isNaN(parseFloat(amount)) ||
      errorMessage !== null ||
      isLoading ||
      bridgeLoading
    );
  };

  // Handle amount input change
  const handleAmountChange = (value: string): void => {
    const sanitizedValue = sanitizeInputValue(value);
    setAmount(sanitizedValue);
  };

  // Format token display name
  const getDisplayTokenName = (tokenKey: TokenKey): string => {
    const token = TOKENS[tokenKey];
    return token ? token.name : tokenKey;
  };

  // Handle success navigation
  const handleSuccessNavigation = (): void => {
    navigateTo('D.Energy');
    // navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
    //   amount: amount,
    //   coinCode: targetCoinCode,
    //   name: targetName,
    // });
  };

  const formatTxHash = (hash: string): string => {
    if (!hash) {
      return '';
    }
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const renderProcessing = (): ReactElement => {
    const operationType = transactionType === 0 ? 'Deposit' : 'Withdrawal';
    const networkFrom = transactionType === 0 ? 'Ethereum' : 'DENERGY';
    const networkTo = transactionType === 0 ? 'DENERGY' : 'Ethereum';

    return (
      <LoadingScreenWithStep
        title={`Processing ${operationType}...`}
        subtitle={
          currentProcessingStep ||
          `Bridging ${selectedToken} from ${networkFrom} to ${networkTo}`
        }
        icon={transactionType === 0 ? '📥' : '📤'}
        progress={stepProgress}
        showProgressBar={true}
        showStepIndicators={true}
        animationSource={Animation.bridgeAnimation}
        stepIndicatorCount={9}
        feeInfo={
          networkFee > 0
            ? `Network Fee: ${formatAmount(
                networkFee.toString(),
              )} ${selectedToken}`
            : undefined
        }
        progressBarColor="#81c8c3"
        backgroundColor="#FFF"
        iconBackgroundColor="#E8F8F7"
      />
    );
  };

  const renderSuccess = (): ReactElement => {
    const operationType = transactionType === 0 ? 'Deposit' : 'Withdrawal';
    const sourceNetwork = transactionType === 0 ? 'ETH' : 'DENERGY';
    const targetNetwork = transactionType === 0 ? 'DENERGY' : 'ETH';

    const handleViewExplorer = () => {
      if (!transactionHash) {
        Alert.alert('Error', 'Transaction hash not available');
        return;
      }

      const explorerUrl = getBlockExploreLink(
        transactionHash,
        'transaction',
        sourceNetwork === 'ETH' ? SEPOLIA_CHAIN_ID : '',
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
            Your bridge transaction completed successfully
          </DText>
        </View>

        {/* Main Info Card */}
        <View style={successStyles.infoCard}>
          {/* Amount Section */}
          <View style={successStyles.amountSection}>
            <DText style={successStyles.amountLabel}>Amount Bridged</DText>
            <DText fontStyle="fontBold" style={successStyles.amountValue}>
              {amount} {selectedToken}
            </DText>
            <View style={successStyles.networkFlow}>
              <View style={successStyles.networkBadge}>
                <DText style={successStyles.networkText}>{sourceNetwork}</DText>
              </View>
              <View style={successStyles.arrowContainer}>
                <Text style={successStyles.arrow}>→</Text>
              </View>
              <View style={successStyles.networkBadge}>
                <DText style={successStyles.networkText}>{targetNetwork}</DText>
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
      </View>
    );
  };

  // Render current step
  const renderCurrentStep = (): ReactElement => {
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
              labelStyle={styles.buttonLabelStyle}
              onPress={handleSuccessNavigation}
              containerWrapper={styles.submitButtonContainer}
              bgImg={styles.submitButtonImage}
            />
          </ScrollView>
        );
      default:
        return renderForm();
    }
  };

  // RENDER COMPONENTS
  const renderBalanceInfo = (): ReactElement => (
    <View style={styles.balanceInfoContainer}>
      <View style={styles.balanceBorderView}>
        <View style={styles.balanceInnerView}>
          <Text style={styles.networkLabel}>
            {transactionType === 0
              ? 'From ETH Network'
              : 'From DENERGY Network'}
          </Text>
          <Text style={styles.tokenAmount}>
            {`${getDisplayTokenName(selectedToken)} ${formatAmount(amount)}`}
          </Text>
        </View>

        {networkFee > 0 && (
          <View style={styles.feeContainer}>
            <DText style={styles.feeText}>
              {`+ Network Fee ${formatAmount(networkFee.toString())}`}
            </DText>
          </View>
        )}

        <View style={styles.balanceInnerViewWithMargin}>
          <Text style={styles.networkLabel}>
            {transactionType === 0 ? 'To DENERGY Network' : 'To ETH Network'}
          </Text>
          <Text style={styles.tokenAmount}>
            {`${getDisplayTokenName(selectedTargetToken)} ${formatAmount(
              amountInTokens,
            )}`}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTransactionTypeTabs = (): ReactElement => (
    <View style={styles.tabsContainer}>
      <Pressable
        onPress={() => {
          setTransactionType(0);
          setCoinCode('USDC');
          setSelectedOption('USDC');
          setToken('USDC');
        }}
        style={[
          styles.tabButton,
          transactionType === 0
            ? styles.tabButtonActive
            : styles.tabButtonInactive,
        ]}>
        <Text
          style={[
            styles.tabButtonText,
            transactionType === 0
              ? styles.tabButtonTextActive
              : styles.tabButtonTextInactive,
          ]}>
          Deposit
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          setTransactionType(1);
          setCoinCode('WUSDC');
          setSelectedOption('WUSDC');
          setToken('WUSDC');
        }}
        style={[
          styles.tabButton,
          transactionType === 1
            ? styles.tabButtonActive
            : styles.tabButtonInactive,
        ]}>
        <Text
          style={[
            styles.tabButtonText,
            transactionType === 1
              ? styles.tabButtonTextActive
              : styles.tabButtonTextInactive,
          ]}>
          Withdraw
        </Text>
      </Pressable>
    </View>
  );

  const renderTokenDropdown = (
    tokenKey: TokenKey,
    isSelectable: boolean = true,
  ): ReactElement => (
    <View style={styles.tokenDropdownContainer}>
      <TouchableOpacity
        style={styles.tokenDropdown}
        activeOpacity={1}
        onPress={isSelectable ? () => toggleBottomView('press') : undefined}>
        <Image
          source={marketIcons[tokenKey] as ImageSourcePropType}
          style={styles.tokenIcon}
        />
        <Text style={styles.tokenDropdownText}>
          {getDisplayTokenName(tokenKey)}
        </Text>
        {isSelectable && (
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
        )}
      </TouchableOpacity>
    </View>
  );

  const renderTokenSelectionModal = (): ReactElement => (
    <BottomSheet
      visible={visible}
      onBackButtonPress={() => setVisible(false)}
      onBackdropPress={() => setVisible(false)}>
      <View style={styles.modalContainer}>
        <Image style={styles.modalTab} source={Images.bottomsheetTab} />
        <Text style={styles.modalTitle}>Select Coin</Text>

        <View style={styles.modalDivider} />

        <RadioButton
          PROP={options}
          selectedOption={selectedOption}
          selectedValue={(key: string) => selectedValue(key as TokenKey)}
        />

        <CustomImageButton
          backgroundImage={Images.buttonBg}
          label="Apply"
          labelStyle={styles.buttonLabelStyle}
          onPress={onNextAction}
          containerWrapper={styles.modalButtonContainer}
          bgImg={styles.modalButtonImage}
        />
      </View>
    </BottomSheet>
  );

  // Main form component
  const renderForm = (): ReactElement => (
    <>
      {renderTransactionTypeTabs()}

      <ScrollView keyboardShouldPersistTaps="handled" style={styles.container}>
        {/* Source Token */}
        {renderTokenDropdown(selectedToken, true)}

        <View style={styles.inputContainer}>
          <TextInput
            keyboardType="decimal-pad"
            value={amount}
            maxLength={10}
            placeholder="0.0"
            placeholderTextColor="#000"
            onChangeText={handleAmountChange}
            style={styles.input}
            textAlign="center"
          />
        </View>

        {/* Arrow between tokens */}
        <View style={styles.arrowContainer}>
          <View style={styles.arrowWrapper}>
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={styles.arrowIconsContainer}>
                <Image source={Images.receiveIcon} style={styles.arrowIcon} />
                <Image source={Images.sendIcon} style={styles.arrowIcon} />
              </View>
            )}
          </View>
        </View>

        {/* Target Token */}
        {renderTokenDropdown(selectedTargetToken, false)}

        <View style={styles.inputContainer}>
          <Text style={styles.input}>{formatAmount(amountInTokens)}</Text>
        </View>

        {/* Error message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Balance information */}
        {renderBalanceInfo()}
      </ScrollView>

      {/* Submit button */}
      <CustomImageButton
        backgroundImage={Images.buttonBg}
        label={bridgeLoading ? 'Processing...' : 'Bridge'}
        labelStyle={styles.buttonLabelStyle}
        onPress={onSubmit}
        containerWrapper={styles.submitButtonContainer}
        bgImg={styles.submitButtonImage}
        disable={isSubmitDisabled()}
      />

      {/* Token selection modal */}
      {renderTokenSelectionModal()}
    </>
  );

  // MAIN RENDER
  return (
    <SafeAreaView style={styles.screen}>
      <Header
        headerTitle="Bridge"
        hideBorder={true}
        backBtn={() => navigateBack()}
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
  successIcon: {
    fontSize: 50,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  tabsContainer: {
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
  tabButton: {
    height: '100%',
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabButtonText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    lineHeight: 15,
  },
  tokenDropdownContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
  },
  tokenDropdown: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenDropdownText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    lineHeight: 15,
    marginHorizontal: 10,
  },
  // Input styles
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
  // Arrow styles
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
    marginVertical: 20,
    marginHorizontal: 21,
  },
  arrowWrapper: {
    backgroundColor: '#FFF',
    position: 'absolute',
    padding: 10,
  },
  arrowIconsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  arrowIcon: {
    height: 20,
    width: 20,
  },
  // Error styles
  errorContainer: {
    marginTop: 10,
    padding: 5,
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
  // Balance info styles
  balanceInfoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  networkLabel: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#848484',
  },
  tokenAmount: {
    fontFamily: fontsFamily.MulishBold,
    marginLeft: 10,
    color: '#000',
  },
  feeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  feeText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  // Button styles
  buttonLabelStyle: {
    fontFamily: fontsFamily.MulishBold,
  },
  submitButtonContainer: {
    height: 51,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  submitButtonImage: {
    height: 51,
    width: '100%',
  },
  // Modal styles
  modalContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    alignContent: 'center',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    paddingBottom: 40,
  },
  modalTab: {
    alignSelf: 'center',
    marginTop: 15,
  },
  modalTitle: {
    fontFamily: fontsFamily.MulishBold,
    marginTop: 20,
    fontSize: 18,
    color: '#333333',
    lineHeight: 21,
    textAlign: 'center',
  },
  modalDivider: {
    borderColor: '#DEDEDE',
    borderWidth: 0.75,
    marginTop: 21,
  },
  modalButtonContainer: {
    height: 51,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  modalButtonImage: {
    height: 51,
    width: '100%',
  },
  balanceInnerViewWithMargin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  tabButtonActive: {
    backgroundColor: '#000',
  },
  tabButtonInactive: {
    backgroundColor: '#fff',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabButtonTextInactive: {
    color: '#000',
  },
  tokenIcon: {
    width: 24,
    height: 24,
  },
});
