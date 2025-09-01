import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  Text,
  View,
  Dimensions,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {fontsFamily} from '../../../Theme';
import style from './styles';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {renderOperationButtons} from './operationButton';
import LinearGradient from 'react-native-linear-gradient';
import {Header, Tab} from '@rneui/base';
import images from '../../../Theme/images';
import PriceHistoryGraph from './PriceHistoryGraph';
import MiniTransactionHistory from './MiniTransactionHistory';
import {DText} from '../../../Componants/DText';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import {useMutation} from '@apollo/client';
import {CREATE_TRANSACTION_HISTORY_MOBILE} from '../../../graphql/queries';
import {marketIcons} from '../../../Theme/variable';
import {PRICE_HISTORY_API_URL} from '../../../constants';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {DENERGY_USDC_ADDRESS, DENERGY_EURC_ADDRESS} from '../../../constants';

const width = Dimensions.get('window').width;

// TypeScript Interfaces
interface RouteParams {
  coinCode?: string;
  operationsTypes?: string[];
}

interface CoinWalletProps {
  route?: {
    params?: RouteParams;
  };
}

interface ChartData {
  labels: string[];
  values: number[];
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

interface PriceData {
  timestamp: number;
  price: number;
}

interface ApiResponse {
  success: boolean;
  data?: {
    prices?: PriceData[];
  };
}

interface PortfolioHeaderProps {
  coinCode: string;
  balance: string;
  balanceUsd: string;
}

interface PriceDisplayProps {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  loading: boolean;
  error: string | null;
}

interface ChartDataHook {
  chartData: ChartData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type ToggleValue = 'day' | 'week';
type CoinCode =
  | 'WATT'
  | 'USDC'
  | 'ETH'
  | 'WUSDC'
  | 'EURC'
  | 'WEURC'
  | 'USD'
  | string;

// Utility Functions
const formatCoinCodeForAPI = (coinCode: string): string => {
  if (!coinCode) {
    return 'usd-coin';
  }

  const coinMapping: Record<string, string> = {
    WATT: 'usd-coin',
    USDC: 'usd-coin',
    ETH: 'ethereum',
    WUSDC: 'usd-coin',
    EURC: 'stasis-eurs',
    WEURC: 'stasis-eurs',
    USD: 'usd-coin',
  };

  return (
    coinMapping[coinCode.toUpperCase()] ||
    coinCode.toLowerCase().replace(/\s+/g, '-')
  );
};

const getCoinIcon = (coinCode: string) => {
  return marketIcons[coinCode] || images.usdc;
};

// Custom Hook for Chart Data
const useChartData = (
  coinCode: string,
  toggleValue: ToggleValue,
): ChartDataHook => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    values: [],
    currentPrice: 0,
    priceChange: 0,
    priceChangePercent: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async (): Promise<void> => {
    if (!coinCode || coinCode === 'USD') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiCoinCode = formatCoinCodeForAPI(coinCode);
      const response = await fetch(`${PRICE_HISTORY_API_URL}/${apiCoinCode}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success || !data.data || !data.data.prices) {
        throw new Error('Invalid API response format');
      }

      const prices = data.data.prices;

      if (prices.length === 0) {
        throw new Error('No price data available');
      }

      const processedData = processChartData(prices, toggleValue);
      setChartData(processedData);
    } catch (err) {
      console.error('Chart data fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      setChartData({
        labels: [],
        values: [],
        currentPrice: 0,
        priceChange: 0,
        priceChangePercent: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [coinCode, toggleValue]);

  useEffect(() => {
    fetchChartData();
  }, []);

  return {chartData, loading, error, refetch: fetchChartData};
};

// Process chart data based on time period
const processChartData = (
  prices: PriceData[],
  toggleValue: ToggleValue,
): ChartData => {
  if (!prices || prices.length === 0) {
    return {
      labels: [],
      values: [],
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
    };
  }

  const sortedPrices = [...prices].sort((a, b) => a.timestamp - b.timestamp);
  let labels: string[] = [];
  let values: number[] = [];

  if (toggleValue === 'day') {
    const last24Hours = sortedPrices.slice(-24);
    labels = last24Hours.map(item => {
      const date = new Date(item.timestamp);
      return date.getHours().toString().padStart(2, '0') + ':00';
    });
    values = last24Hours.map(item => item.price);
  } else {
    const lastWeek = sortedPrices.slice(-7);
    labels = lastWeek.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleDateString('en-US', {weekday: 'short'});
    });
    values = lastWeek.map(item => item.price);
  }

  const currentPrice = sortedPrices[sortedPrices.length - 1]?.price || 0;
  const previousPrice =
    sortedPrices[sortedPrices.length - 2]?.price || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent =
    previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  return {
    labels,
    values,
    currentPrice,
    priceChange,
    priceChangePercent,
  };
};

// Portfolio Header Component
const PortfolioHeader: React.FC<PortfolioHeaderProps> = React.memo(
  ({coinCode, balance, balanceUsd}) => (
    <View style={localStyles.portfolioHeaderContainer}>
      <View style={localStyles.portfolioCard}>
        <View style={localStyles.portfolioCardHeader}>
          <Text style={localStyles.portfolioLabel}>Portfolio</Text>
        </View>
        <View style={localStyles.coinHeaderContainer}>
          <Image
            source={getCoinIcon(coinCode)}
            style={localStyles.coinIcon}
            resizeMode="contain"
          />
          <Text
            style={localStyles.coinCodeTitle}
            numberOfLines={2}
            ellipsizeMode="tail">
            {coinCode || 'Unknown Coin'}
          </Text>
        </View>
        <View style={localStyles.balanceContainer}>
          <Text style={localStyles.balanceLabel}>Balance</Text>
          <Text
            style={localStyles.balanceValue}
            numberOfLines={2}
            ellipsizeMode="tail">
            {balance || '0'} (${balanceUsd || '0.00'})
          </Text>
        </View>
      </View>
    </View>
  ),
);

// Price Display Component
const PriceDisplay: React.FC<PriceDisplayProps> = React.memo(
  ({currentPrice, priceChange, priceChangePercent, loading, error}) => {
    if (loading) {
      return (
        <View style={localStyles.priceDisplayContainer}>
          <ActivityIndicator size="small" color="#009D94" />
          <Text style={localStyles.loadingText}>Loading price data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={localStyles.priceDisplayContainer}>
          <Text style={localStyles.noDataText}>No price data available</Text>
        </View>
      );
    }

    const isPositive = priceChange >= 0;
    const changeColor = isPositive ? '#00C851' : '#FF4444';
    const changeIcon = isPositive
      ? images.sharePriceIcon
      : images.sharePriceDownIcon;

    return (
      <View style={localStyles.priceDisplayContainer}>
        <Text style={style.usdvalue}>${currentPrice.toFixed(4)}</Text>
        <Image
          source={changeIcon}
          style={localStyles.changeIcon}
          resizeMode="contain"
        />
        <Text style={[style.Today, {color: changeColor}]}>
          ({isPositive ? '+' : ''}
          {priceChangePercent.toFixed(2)}%)
        </Text>
      </View>
    );
  },
);

// Main Component
const CoinWallet: React.FC<CoinWalletProps> = ({route}) => {
  const {setActiveNetwork} = useMagic();
  const [hasError, setHasError] = useState<boolean>(false);
  const [toggleValue, setToggleValue] = useState<ToggleValue>('week');
  const [index, setIndex] = useState<number>(0);

  // Extract props with fallbacks
  const coinCode: string = route?.params?.coinCode || 'Unknown';
  const operationsTypes: string[] = route?.params?.operationsTypes || [];

  console.log('coinCode', coinCode);

  useEffect(() => {
    if (coinCode === 'ETH' || coinCode === 'USDC' || coinCode === 'EURC') {
      setActiveNetwork('sepolia');
    } else {
      setActiveNetwork('denergy');
    }
  }, [coinCode]);

  const [createTransactionHistoryMobile] = useMutation(
    CREATE_TRANSACTION_HISTORY_MOBILE,
    {
      onError: error => {
        console.error('Transaction history mutation error:', error);
      },
    },
  );

  const getContractAddress = useCallback((coinCode: string): string | null => {
    switch (coinCode) {
      case 'WUSDC':
        return DENERGY_USDC_ADDRESS;
      case 'WEURC':
        return DENERGY_EURC_ADDRESS;
      default:
        return null;
    }
  }, []);

  // Safe hook calls with error handling
  let getBalance: ((coinCode: string) => any) | undefined;
  let userDetails: any;
  let balance = '0';
  let balanceUsd = '0.00';

  try {
    const walletHook = useWallet();
    const authHook = useAuth();

    getBalance = walletHook?.getBalance;
    userDetails = authHook?.userDetails;

    if (getBalance && coinCode && coinCode !== 'Unknown') {
      const balanceData = getBalance(coinCode);
      balance = balanceData?.balance || '0';
      balanceUsd = balanceData?.balanceUsd || '0.00';
    }
  } catch (error) {
    console.error('Hook error:', error);
    setHasError(true);
  }

  const {chartData, loading, error, refetch} = useChartData(
    coinCode,
    toggleValue,
  );

  const TAB_ITEMS = useMemo(() => ['Price History', 'Transaction History'], []);
  const toggleOptions: ToggleValue[] = useMemo(() => ['week', 'day'], []);

  const handleBackNavigation = useCallback((): void => {
    try {
      navigateBack();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  const handleToggleChange = useCallback((item: ToggleValue): void => {
    setToggleValue(item);
  }, []);

  // Error boundary rendering
  if (hasError) {
    return (
      <View style={localStyles.container}>
        <View style={localStyles.errorContainer}>
          <Text style={localStyles.errorText}>Something went wrong</Text>
          <TouchableOpacity
            style={localStyles.retryButton}
            onPress={() => setHasError(false)}>
            <Text style={localStyles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={localStyles.headerContainer}
        leftComponent={
          <TouchableOpacity
            onPress={handleBackNavigation}
            style={localStyles.iconContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={localStyles.nameContainer}>
            <Image
              source={getCoinIcon(coinCode)}
              style={localStyles.headerCoinIcon}
              resizeMode="contain"
            />
            <DText fontStyle="fontBold" style={localStyles.headerTitle}>
              {coinCode}
            </DText>
          </View>
        }
      />

      <View style={localStyles.contentContainer}>
        {/* Fixed Header Section */}
        <View style={localStyles.headerSection}>
          <LinearGradient
            colors={['#F8FFFE', '#E8F8F7', '#F8FFFE']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={localStyles.gradientContent}>
              <PortfolioHeader
                coinCode={coinCode}
                balance={balance}
                balanceUsd={balanceUsd}
              />

              <View style={localStyles.btnAlign}>
                {operationsTypes.length > 0 &&
                  renderOperationButtons(operationsTypes, coinCode)}
              </View>
            </View>
          </LinearGradient>

          <Tab
            value={index}
            onChange={setIndex}
            variant="primary"
            indicatorStyle={localStyles.tabIndicator}
            style={localStyles.tabStyle}>
            {(coinCode === 'USD' ? [] : TAB_ITEMS).map((tab, i) => (
              <Tab.Item
                key={i}
                containerStyle={(active: boolean) => ({
                  borderBottomColor: active ? '#009D94' : '#E1E1E1',
                  borderBottomWidth: active ? 2 : 1.4,
                  backgroundColor: 'transparent',
                })}
                title={tab}
                titleStyle={(active: boolean) => ({
                  color: active ? '#000' : '#989898',
                  fontFamily: active
                    ? fontsFamily.MulishExtraBold
                    : fontsFamily.MulishBold,
                  fontSize: 14,
                })}
              />
            ))}
          </Tab>
        </View>

        {/* Scrollable Content Section */}
        <View style={localStyles.scrollableContent}>
          {index === 0 && coinCode !== 'USD' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={localStyles.toggleContainer}>
                <Text style={style.HeaderFont}>
                  {toggleValue === 'day' ? 'Today' : 'This Week'} Average
                </Text>
                <View style={style.toggleView}>
                  {toggleOptions.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={localStyles.toggleButton}
                      onPress={() => handleToggleChange(item)}>
                      <Text
                        style={[
                          style.toggleItemStyle,
                          toggleValue === item
                            ? localStyles.activeButton
                            : localStyles.inActiveButton,
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <PriceDisplay
                currentPrice={chartData.currentPrice}
                priceChange={chartData.priceChange}
                priceChangePercent={chartData.priceChangePercent}
                loading={loading}
                error={error}
              />

              {error && (
                <View style={localStyles.errorBanner}>
                  <Text style={localStyles.errorBannerText}>
                    Failed to load chart data
                  </Text>
                  <TouchableOpacity
                    onPress={refetch}
                    style={localStyles.retryLink}>
                    <Text style={localStyles.retryLinkText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={localStyles.chartContainer}>
                {!loading && !error && chartData.labels.length > 0 ? (
                  <PriceHistoryGraph
                    labels={chartData.labels}
                    toggleValue={toggleValue}
                    data={chartData.values}
                  />
                ) : !loading && (error || chartData.labels.length === 0) ? (
                  <View style={localStyles.noDataContainer}>
                    <Text style={localStyles.noDataText}>
                      No chart data available
                    </Text>
                    <TouchableOpacity
                      onPress={refetch}
                      style={localStyles.retryButton}>
                      <Text style={localStyles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          ) : (
            <MiniTransactionHistory
              coinCode={coinCode}
              contractAddress={getContractAddress(coinCode)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCoinIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  contentContainer: {
    flex: 1,
  },
  headerSection: {
    marginTop: 5,
  },
  gradientContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  tabIndicator: {
    backgroundColor: 'transparent',
  },
  tabStyle: {
    backgroundColor: 'transparent',
  },
  scrollableContent: {
    flex: 1,
    marginHorizontal: 25,
    marginTop: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 3,
  },
  activeButton: {
    backgroundColor: '#FFFFFF',
    marginRight: 4,
    padding: 3,
  },
  inActiveButton: {
    backgroundColor: '#EEEEEE',
  },
  chartContainer: {
    left: -20,
  },
  changeIcon: {
    height: 10,
    width: 15,
    marginLeft: 2,
  },
  // Portfolio styles
  portfolioHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  portfolioCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  portfolioCardHeader: {
    marginBottom: 12,
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  coinHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  coinCodeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    lineHeight: 32,
    flex: 1,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    maxWidth: '70%',
  },
  btnAlign: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: width - 60,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  // Price display styles
  priceDisplayContainer: {
    marginRight: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
  },
  loadingText: {
    color: '#009D94',
    fontSize: 14,
    marginLeft: 8,
  },
  noDataText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  // Error handling styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    color: '#856404',
    fontSize: 12,
    flex: 1,
  },
  retryLink: {
    marginLeft: 10,
  },
  retryLinkText: {
    color: '#009D94',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CoinWallet;
