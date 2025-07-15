import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Dimensions,
  Image,
  StyleSheet,
  ImageBackground,
  Button,
  ActivityIndicator,
} from 'react-native';
import {fontsFamily, Images} from '../../../Theme';
import style from './styles';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import OperationButton, {renderOperationButtons} from './operationButton';
import LinearGradient from 'react-native-linear-gradient';
import {Header, Tab} from '@rneui/base';
import images from '../../../Theme/images';
import PriceHistoryGraph from './PriceHistoryGraph';
import MiniTransactionHistory from './MiniTransactionHistory';
import {DText} from '../../../Componants/DText';
import {navigateTo} from '../../../utils/navigationService';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {useWalletBalance} from '../../../hooks/useWalletBalance';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import {SCREEN_CONSTANT} from '../../../Navigation/constant';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import {CREATE_TRANSACTION_HISTORY_MOBILE} from '../../../graphql/queries';
import {marketIcons} from '../../../Theme/variable';
import { PRICE_HISTORY_API_URL } from '../../../constants';

const width = Dimensions.get('window').width;


const formatCoinCodeForAPI = (coinCode) => {
  if (!coinCode) return 'usd-coin';
  
  const coinMapping = {
    "WATT": 'usd-coin',
    'USDC': 'usd-coin',
    'ETH': 'ethereum',
    "WUSDC": 'usd-coin',
    "EURC": 'stasis-eurs',
    "WEURC": 'stasis-eurs',
    'USD': 'usd-coin', 
  };
  
  return coinMapping[coinCode.toUpperCase()] || coinCode.toLowerCase().replace(/\s+/g, '-');
};

const getCoinIcon = (coinCode) => {
  return marketIcons[coinCode] || images.usdc;
};

const useChartData = (coinCode, toggleValue) => {
  const [chartData, setChartData] = useState({
    labels: [],
    values: [],
    currentPrice: 0,
    priceChange: 0,
    priceChangePercent: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChartData = async () => {
    if (!coinCode || coinCode === 'USD') return;
    
    setLoading(true);
    setError(null);

    try {
      const apiCoinCode = formatCoinCodeForAPI(coinCode);
      const response = await fetch(`${PRICE_HISTORY_API_URL}/${apiCoinCode}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data || !data.data.prices) {
        throw new Error('Invalid API response format');
      }

      const prices = data.data.prices;
      
      if (prices.length === 0) {
        throw new Error('No price data available');
      }

      // Process data based on toggle value
      const processedData = processChartData(prices, toggleValue);
      setChartData(processedData);
      
    } catch (err) {
      console.error('Chart data fetch error:', err);
      setError(err.message);
      
      // Reset to empty state on error instead of showing mock data
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
  };

  useEffect(() => {
    fetchChartData();
  }, [coinCode, toggleValue]);

  return { chartData, loading, error, refetch: fetchChartData };
};

// Process chart data based on time period
const processChartData = (prices, toggleValue) => {
  if (!prices || prices.length === 0) {
    return {
      labels: [],
      values: [],
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
    };
  }

  // Sort prices by timestamp
  const sortedPrices = [...prices].sort((a, b) => a.timestamp - b.timestamp);
  
  let labels = [];
  let values = [];
  
  if (toggleValue === 'day') {
    // For daily view, show last 24 hours with hourly intervals
    const last24Hours = sortedPrices.slice(-24);
    labels = last24Hours.map(item => {
      const date = new Date(item.timestamp);
      return date.getHours().toString().padStart(2, '0') + ':00';
    });
    values = last24Hours.map(item => item.price);
  } else {
    // For weekly view, show last 7 days
    const lastWeek = sortedPrices.slice(-7);
    labels = lastWeek.map(item => {
      const date = new Date(item.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return dayName;
    });
    values = lastWeek.map(item => item.price);
  }

  // Calculate price change
  const currentPrice = sortedPrices[sortedPrices.length - 1]?.price || 0;
  const previousPrice = sortedPrices[sortedPrices.length - 2]?.price || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  return {
    labels,
    values,
    currentPrice,
    priceChange,
    priceChangePercent,
  };
};

// Move PortfolioHeader outside the component to prevent recreation on each render
const PortfolioHeader = ({coinCode, balance, balanceUsd}) => (
  <View style={styles.portfolioHeaderContainer}>
    <View style={styles.portfolioCard}>
      <View style={styles.portfolioCardHeader}>
        <Text style={styles.portfolioLabel}>Portfolio</Text>
      </View>
      <View style={styles.coinHeaderContainer}>
        <Image
          source={getCoinIcon(coinCode)}
          style={styles.coinIcon}
          resizeMode="contain"
        />
        <Text
          style={styles.coinCodeTitle}
          numberOfLines={2}
          ellipsizeMode="tail">
          {coinCode || 'Unknown Coin'}
        </Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text
          style={styles.balanceValue}
          numberOfLines={2}
          ellipsizeMode="tail">
          {balance || '0'} (${balanceUsd || '0.00'})
        </Text>
      </View>
    </View>
  </View>
);

// Price display component
const PriceDisplay = ({currentPrice, priceChange, priceChangePercent, loading, error}) => {
  if (loading) {
    return (
      <View style={styles.priceDisplayContainer}>
        <ActivityIndicator size="small" color="#009D94" />
        <Text style={styles.loadingText}>Loading price data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.priceDisplayContainer}>
        <Text style={styles.noDataText}>No price data available</Text>
      </View>
    );
  }

  const isPositive = priceChange >= 0;
  const changeColor = isPositive ? '#00C851' : '#FF4444';
  const changeIcon = isPositive ? images.sharePriceIcon : images.sharePriceDownIcon;

  return (
    <View style={styles.priceDisplayContainer}>
      <Text style={style.usdvalue}>
        ${currentPrice.toFixed(4)}
      </Text>
      <Image
        source={changeIcon}
        style={{height: 10, width: 15, marginLeft: 2}}
        resizeMode="contain"
      />
      <Text style={[style.Today, {color: changeColor}]}>
        ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
      </Text>
    </View>
  );
};

export default function CoinWallet(props) {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);

  // Safely extract props with fallbacks
  const coinCode = props?.route?.params?.coinCode || 'Unknown';
  console.log('coinCode', coinCode);
  
  const operationsTypes = props?.route?.params?.operationsTypes || [];

  const [createTransactionHistoryMobile] = useMutation(
    CREATE_TRANSACTION_HISTORY_MOBILE,
    {
      // Add error handling for GraphQL mutations
      onError: error => {
        console.error('Transaction history mutation error:', error);
      },
    },
  );

  // Add safe hook calls with error handling
  let getBalance,
    userDetails,
    balance = '0',
    balanceUsd = '0.00';

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

  const [toggleValue, setToggleValue] = useState('week');
  const [index, setIndex] = useState(0);

  // Use the custom hook for chart data
  const { chartData, loading, error, refetch } = useChartData(coinCode, toggleValue);

  const TAB_ITEMS = ['Price History', 'Transaction History'];
  const toggleOptions = ['week', 'day'];

  // Add error boundary rendering
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
            }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Safe navigation function
  const handleBackNavigation = () => {
    try {
      navigateBack();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
        leftComponent={
          <TouchableOpacity
            onPress={handleBackNavigation}
            style={styles.iconContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <Image
              source={getCoinIcon(coinCode)}
              style={styles.headerCoinIcon}
              resizeMode="contain"
            />
            <DText fontStyle="fontBold" style={styles.headerTitle}>
              {coinCode}
            </DText>
          </View>
        }
      />
      <View style={{flex: 1}}>
        {/* Fixed Header Section */}
        <View style={{marginTop: 5}}>
          <LinearGradient
            colors={['#F8FFFE', '#E8F8F7', '#F8FFFE']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={{paddingTop: 10, paddingBottom: 30}}>
              <PortfolioHeader
                coinCode={coinCode}
                balance={balance}
                balanceUsd={balanceUsd}
              />

              <View style={styles.btnAlign}>
                {operationsTypes &&
                  operationsTypes.length > 0 &&
                  renderOperationButtons(operationsTypes, coinCode)}
              </View>
            </View>
          </LinearGradient>

          <Tab
            value={index}
            onChange={setIndex}
            variant="primary"
            indicatorStyle={{
              backgroundColor: 'transparent',
            }}
            style={{backgroundColor: 'transparent'}}>
            {(coinCode === 'USD' ? [] : TAB_ITEMS).map((tab, i) => {
              return (
                <Tab.Item
                  key={i}
                  containerStyle={active => ({
                    borderBottomColor: active ? '#009D94' : '#E1E1E1',
                    borderBottomWidth: active ? 2 : 1.4,
                    backgroundColor: 'transparent',
                  })}
                  title={tab}
                  titleStyle={active => ({
                    color: active ? '#000' : '#989898',
                    fontFamily: active
                      ? fontsFamily.MulishExtraBold
                      : fontsFamily.MulishBold,
                    fontSize: 14,
                  })}
                />
              );
            })}
          </Tab>
        </View>

        {/* Scrollable Content Section */}
        <View style={{flex: 1, marginHorizontal: 25, marginTop: 20}}>
          {index === 0 && coinCode !== 'USD' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={style.HeaderFont}>
                  {toggleValue === 'day' ? 'Today' : 'This Week'} Average
                </Text>
                <View style={style.toggleView}>
                  {toggleOptions.map((item, i) => {
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.toggleButton]}
                        onPress={() => {
                          setToggleValue(item);
                        }}>
                        <Text
                          style={[
                            style.toggleItemStyle,
                            toggleValue == item
                              ? styles.activeButton
                              : styles.inActiveButtn,
                          ]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>
                    Failed to load chart data
                  </Text>
                  <TouchableOpacity onPress={refetch} style={styles.retryLink}>
                    <Text style={styles.retryLinkText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{left: -20}}>
                {!loading && !error && chartData.labels.length > 0 ? (
                  <PriceHistoryGraph
                    labels={chartData.labels}
                    toggleValue={toggleValue}
                    data={chartData.values}
                  />
                ) : !loading && (error || chartData.labels.length === 0) ? (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No chart data available</Text>
                    <TouchableOpacity onPress={refetch} style={styles.retryButton}>
                      <Text style={styles.retryText}>Retry</Text> 
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          ) : (
            <MiniTransactionHistory coinCode={coinCode} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  headerCoincodeTitle: {
    color: '#989898',
    fontSize: 18,
    marginLeft: 8,
  },
  headerSection: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  portfolio: {
    top: 10,
    color: '#FFFF',
    fontSize: 12,
    lineHeight: 20,
    position: 'absolute',
    marginTop: 10,
  },
  totalAmount: {
    color: '#FFFF',
    fontSize: 30,
    position: 'absolute',
  },
  usd: {
    bottom: 25,
    color: '#FFFF',
    fontSize: 12,
    position: 'absolute',
  },
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
  portfolioLabel: {
    fontSize: 14,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  inActiveButtn: {
    backgroundColor: '#EEEEEE',
  },
  transactionCountText: {
    color: '#747474',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
    marginBottom: 20,
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
    marginTop:4
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Error banner styles
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