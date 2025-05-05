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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CustomImageButton, Header, RadioButton} from '../../../../Componants';
import {BottomSheet} from 'react-native-btr';
import {Colors, fontsFamily, Images} from '../../../../Theme';
import {SCREEN_CONSTANT} from '../../../../Navigation/constant';
import {navigateTo} from '../../../../utils/navigationService';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Path, Svg} from 'react-native-svg';
import {ScreenWidth} from '@rneui/base';
import {marketIcons} from '../../../../Theme/variable';
import {DText} from '../../../../Componants/DText';
import {navigateBack} from '../../../../Navigation/NavigationFunctions';
import {useWallet} from '../../../../../screens/Provider/WalletProvider';
import {ReactElement} from 'react';
import {useUSDCApprove} from '../../../../hooks/useUSDCApprove';
import {useMagic} from '../../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../../screens/Provider/authProvider';
import {useBridge} from '../../../../hooks/useBridge';
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
  if (!amount) return '0';
  return parseFloat(amount.toString()).toFixed(6);
};

// Helper function to sanitize input values
const sanitizeInputValue = (value: string): string => {
  if (!value) return '0';

  const cleaned = value.replace(/\s/g, '').replace(/[^\d.]/gi, '');
  const parts = cleaned.split('.');
  return (
    parts.shift() + (parts.length ? '.' + parts.join('').substring(0, 6) : '')
  );
};

// Mock API functions (replace with actual implementations)
const initiateSwapApi = async (
  params: SwapApiParams,
): Promise<[Error | null, SwapApiResponse | null]> => {
  try {
    // Simulated API response
    const result: SwapApiResponse = {
      data: {
        conversionAmountInUsd: parseFloat(params.amount) * 0.98, // 2% conversion rate loss
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
    // Simulated API response
    const result: FeeApiResponse = {
      data: {
        networkFee: parseFloat(params.amount) * 0.01, // 1% network fee
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
    error: bridgeError,
    bridgeUSDC,
    bridgeEURC,
    bridgeWUSDC,
    bridgeWEURC,
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
  const [usdValue, setUsdValue] = useState<number>(0);
  const [networkFee, setNetworkFee] = useState<number>(0);

  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [options, setOptions] = useState<TokenOption[]>([]);

  // Get balance for the selected token
  const {balance: tokenBalance, balanceUsd: tokenBalanceUsd}: TokenBalance =
    getBalance(selectedToken);

  // Update target token whenever source token changes
  useEffect(() => {
    const token = TOKENS[selectedToken];
    if (token) {
      if (transactionType === 0) {
        // Deposit
        setTargetToken(token.wrapped || 'WUSDC');
      } else {
        // Withdraw
        setTargetToken(token.unwrapped || 'USDC');
      }
    }

    // Reset amount when token changes
    setAmount('');
    setAmountInTokens('0');
    setUsdValue(0);
    setNetworkFee(0);
    setErrorMessage(null);
  }, [selectedToken, transactionType]);

  // Update available options when transaction type changes
  useEffect(() => {
    if (transactionType === 0) {
      // Deposit options - non-wrapped tokens
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
      // Withdraw options - wrapped tokens
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
  }, [transactionType]);

  // Validate amount and initiate swap if valid
  useEffect(() => {
    const validateAndInitiateSwap = async (): Promise<void> => {
      const cleanAmount = sanitizeInputValue(amount);

      // Reset errors and values first
      setErrorMessage(null);

      // Skip processing for empty or zero amounts
      if (
        !cleanAmount ||
        parseFloat(cleanAmount) === 0 ||
        cleanAmount.endsWith('.')
      ) {
        setUsdValue(0);
        setAmountInTokens('0');
        setNetworkFee(0);
        return;
      }

      // Check if amount exceeds balance
      if (parseFloat(cleanAmount) > parseFloat(tokenBalance)) {
        setErrorMessage('Insufficient balance');
        setUsdValue(0);
        setNetworkFee(0);
        setAmountInTokens('0');
        return;
      }

      // Amount is valid, initiate swap
      await initiateSwap(cleanAmount);
    };

    validateAndInitiateSwap();
  }, [amount, tokenBalance]);

  // API call to get swap details
  const initiateSwap = async (val: string): Promise<void> => {
    try {
      setIsLoading(true);

      // Prepare API params
      const params: SwapApiParams = {
        sourceCoin: selectedToken,
        amount: val,
        targetCoin: selectedTargetToken,
      };
      console.log(
        '🚀 ~ initiateSwap ~ params: SwapApiParams.selectedTargetToken:',
        selectedToken,
      );
      console.log('🚀 ~ initiateSwap ~ params: SwapApiParams.val:', val);
      console.log(
        '🚀 ~ initiateSwap ~ params: SwapApiParams.selectedToken:',
        selectedToken,
      );

      // Call APIs
      const [error, result] = await initiateSwapApi(params);
      const [feeError, feeResult] = await networkFeeApi(params);

      if (error || !result || feeError || !feeResult) {
        throw new Error(error?.message || feeError?.message || 'API error');
      }

      setIsLoading(false);
      // setUsdValue(result.data.conversionAmountInUsd);
      setAmountInTokens(val);
      setNetworkFee('0');
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
    if (selectedToken === 'USDC') {
      try {
        await bridgeUSDC(amount, result => {
          console.log('Bridge successful:');

          navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
            amount: result?.amount,
            coinCode: 'USDC',
            name: 'WUSDC',
          });
        });
      } catch (error) {
        console.error('Bridge failed:', error);
      }
    }
    if (selectedToken === 'EURC') {
      try {
        await bridgeEURC(amount, result => {
          console.log('Bridge successful:');

          navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
            amount: result?.amount,
            coinCode: 'EURC',
            name: 'WEURC',
          });
        });
      } catch (error) {
        console.error('Bridge failed:', error);
      }
    }
    if (selectedToken === 'WUSDC') {
      try {
        await bridgeWUSDC(amount, result => {
          console.log('Bridge successful:');

          navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
            amount: result?.amount,
            coinCode: 'WUSdC',
            name: 'USDC',
          });
        });
      } catch (error) {
        console.error('Bridge failed:', error);
      }
    }

    if (selectedToken === 'WEURC') {
      try {
        await bridgeWEURC(amount, result => {
          console.log('Bridge successful:');

          navigateTo(SCREEN_CONSTANT.SENDSUCCESS, {
            amount: result?.amount,
            coinCode: 'WEURC',
            name: 'EURC',
          });
        });
      } catch (error) {
        console.error('Bridge failed:', error);
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

        <View style={[styles.balanceInnerView, {marginBottom: 15}]}>
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
          {backgroundColor: transactionType === 0 ? '#000' : '#fff'},
        ]}>
        <Text
          style={[
            styles.tabButtonText,
            {color: transactionType === 0 ? '#fff' : '#000'},
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
          {backgroundColor: transactionType === 1 ? '#000' : '#fff'},
        ]}>
        <Text
          style={[
            styles.tabButtonText,
            {color: transactionType === 1 ? '#fff' : '#000'},
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
        <Image source={marketIcons[tokenKey] as ImageSourcePropType} />
        <Text style={styles.tokenDropdownText}>
          {getDisplayTokenName(tokenKey)}
        </Text>
        {isSelectable && (
          <Svg
            width="15"
            height="8"
            viewBox="0 0 15 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
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
          selectedValue={value => selectedValue(value as TokenKey)}
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

  // MAIN RENDER
  return (
    <SafeAreaView style={styles.screen}>
      <Header
        headerTitle="Bridge"
        hideBorder={true}
        backBtn={() => navigateBack()}
      />

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
        label={bridgeLoading ? 'Sending...' : 'Next'}
        labelStyle={styles.buttonLabelStyle}
        onPress={onSubmit}
        containerWrapper={styles.submitButtonContainer}
        bgImg={styles.submitButtonImage}
        disable={isSubmitDisabled()}
      />

      {/* Token selection modal */}
      {renderTokenSelectionModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  // Tabs styles
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
  // Token dropdown styles
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
});
