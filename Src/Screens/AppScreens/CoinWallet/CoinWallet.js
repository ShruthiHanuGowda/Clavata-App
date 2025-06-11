import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Dimensions,
  Image,
  StyleSheet,
  ImageBackground,
  Button,
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
import { marketIcons } from '../../../Theme/variable';

const width = Dimensions.get('window').width;

// Function to get coin icon
const getCoinIcon = (coinCode: string) => {
  return marketIcons[coinCode] || images.usdc;
};

// Move PortfolioHeader outside the component to prevent recreation on each render
const PortfolioHeader = ({ coinCode, balance, balanceUsd }) => (
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
        <Text style={styles.coinCodeTitle} numberOfLines={2} ellipsizeMode="tail">
          {coinCode || 'Unknown Coin'}
        </Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceValue} numberOfLines={2} ellipsizeMode="tail">
          {balance || '0'} (${balanceUsd || '0.00'})
        </Text>
      </View>
    </View>
  </View>
);

export default function CoinWallet(props) {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  
  // Safely extract props with fallbacks
  const coinCode = props?.route?.params?.coinCode || 'Unknown';
  const operationsTypes = props?.route?.params?.operationsTypes || [];
  
  const [createTransactionHistoryMobile] = useMutation(
    CREATE_TRANSACTION_HISTORY_MOBILE,
    {
      // Add error handling for GraphQL mutations
      onError: (error) => {
        console.error('Transaction history mutation error:', error);
      }
    }
  );
  
  // Add safe hook calls with error handling
  let getBalance, userDetails, balance = '0', balanceUsd = '0.00';
  
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

  const [toggleValue, setToggleValue] = useState('day');
  const [index, setIndex] = useState(0);
  
  // Use static data for graph to prevent crashes
  const graphData = {
    label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [12, 15, 18, 22, 28, 25, 30],
  };

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
              // You might want to reload or navigate back
            }}
          >
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
      // Fallback navigation or error handling
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
                {operationsTypes && operationsTypes.length > 0 && 
                  renderOperationButtons(operationsTypes, coinCode)
                }
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
                }}>
                <Text style={style.HeaderFont}>This Week Average</Text>
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
              <View
                style={{
                  marginRight: 1,
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Text style={style.usdvalue}>
                  $0.05
                </Text>
                <Image
                  source={images.sharePriceIcon}
                  style={{height: 10, width: 15, marginLeft: 2}}
                  resizeMode="contain"
                />
                <Text style={style.Today}>(+0.00%)</Text>
              </View>
              <View style={{left: -20}}>
                {graphData && (
                  <PriceHistoryGraph
                    labels={graphData?.label}
                    toggleValue={toggleValue}
                    data={graphData?.values}
                  />
                )}
              </View>
            </ScrollView>
          ) : (
            <MiniTransactionHistory
              coinCode={coinCode}
            />
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
    shadowOffset: { width: 0, height: 4 },
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
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});