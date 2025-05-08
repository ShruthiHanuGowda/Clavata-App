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

const width = Dimensions.get('window').width;
export default function CoinWallet(props) {
  const [createTransactionHistoryMobile] = useMutation(
    CREATE_TRANSACTION_HISTORY_MOBILE,
  );
  const coinCode = props?.route?.params?.coinCode;
  const operationsTypes = props?.route?.params?.operationsTypes;
  const {getBalance} = useWallet();
  const {userDetails} = useAuth();

  const {balance, balanceUsd} = getBalance(coinCode);

  const [toggleValue, setToggleValue] = useState('day');
  const [index, setIndex] = useState(0);
  //NOTE - Use for Graph UI
  const graphData = {
    label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [12, 15, 18, 22, 28, 25, 30],
  };

  const TAB_ITEMS = ['Price History', 'Transaction History'];
  const toggleOptions = ['week', 'day'];

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={styles.iconContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <DText fontStyle="fontBold" style={styles.headerTitle}>
              {coinCode}
            </DText>
          </View>
        }
      />
      <ScrollView
      // refreshControl={
      //   <RefreshControl
      //     refreshing={pullToRefreshLoading}
      //     onRefresh={() => {
      //       setPullToRefreshLoading(true);
      //       init();
      //     }}
      //   />
      // }
      >
        <View style={{marginTop: 5}}>
          <LinearGradient
            colors={['#FFFFFF', '#dcf2f1', '#FFFFFF']}
            start={{x: 0, y: 1}}
            end={{x: 0, y: 0}}
            useAngle={true}
            angle={330}
            locations={[0, 0, 0.25]}>
            <View style={{paddingTop: 10, paddingBottom: 30}}>
              <View
                style={{
                  flex: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: 20,
                }}>
                <ImageBackground
                  source={images.rectangle}
                  resizeMode="cover"
                  imageStyle={{borderRadius: 7}}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 180,
                    width: '100%',
                  }}>
                  <Image
                    source={images.rectangleDot}
                    style={{
                      alignSelf: 'flex-end',
                      height: '100%',
                      width: '38%',
                    }}
                  />
                  <DText fontStyle="fontBold" style={styles.portfolio}>
                    PORTFOLIO
                  </DText>
                  <DText fontStyle="fontBold" style={styles.totalAmount}>
                    {/* {coinData?.tokenBalance || 0} */}
                    {balance}
                  </DText>
                  <DText
                    fontStyle="fontBold"
                    style={{
                      color: '#FFFF',
                      fontSize: 20,
                      position: 'absolute',
                      bottom: 50,
                    }}>
                    {coinCode}
                    {/* {coinCode == 'DREXS' ? 'DRECs' : coinCode} */}
                  </DText>
                  {coinCode !== 'USD' && (
                    <DText fontStyle="fontBold" style={styles.usd}>
                      $ {balanceUsd}
                      {/* {coinData?.fiatBalance
                        ? parseFloat(coinData?.fiatBalance)
                        : 0} */}
                    </DText>
                  )}
                </ImageBackground>
              </View>
              {/* <Button
                title="Send ETH"
                onPress={async () => {
                  try {
                    const {data} = await createTransactionHistoryMobile({
                      variables: {
                        input: {
                          transactionHash: 'weqwdsa',
                          method: 'asd',
                          createdAt: 'sdd',
                          from: 'sda',
                          to: 'asd',
                          amount: 1.1,
                          txnFee: 1.2,
                          coinCode: 'USDC',
                          transactionStatus: 'asdd',
                        },
                      },
                    });
                    console.log('data', data);
                  } catch (error) {
                    console.log('error', error);
                    throw new Error(error);
                  }
                }}
              /> */}
              <View style={styles.btnAlign}>
                {renderOperationButtons(operationsTypes, coinCode)}
                {/* <>
                  <OperationButton
                    name={'Send'}
                    image={images.sendIcon}
                    onPress={() =>
                      navigateTo(SCREEN_CONSTANT?.VERIFYADDRESS, {
                        coinCode: coinCode,
                      })
                    }
                  />
                  <OperationButton
                    name={'Receive'}
                    image={images.receiveIcon}
                    onPress={() =>
                      navigateTo(SCREEN_CONSTANT.RECIEVESCREEN, {
                        coinCode: coinCode,
                      })
                    }
                  />
                </> */}
                {/*{coinCode === 'ETH' && (*/}
                {/*  <>*/}
                {/*    <OperationButton*/}
                {/*      name={'Send'}*/}
                {/*      image={images.sendIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.VERIFYADDRESS, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Receive'}*/}
                {/*      image={images.receiveIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.RECIEVESCREEN, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*  </>*/}
                {/*)}*/}

                {/*<>*/}
                {/*  <OperationButton*/}
                {/*    name={'Trade'}*/}
                {/*    image={images.buyIcon}*/}
                {/*    onPress={() => navigateTo('trade')}*/}
                {/*  />*/}
                {/*  <OperationButton*/}
                {/*    name={'Send'}*/}
                {/*    image={images.sendIcon}*/}
                {/*    onPress={() => navigateTo('send')}*/}
                {/*  />*/}
                {/*  <OperationButton*/}
                {/*    name={'Receive'}*/}
                {/*    image={images.receiveIcon}*/}
                {/*    onPress={() => navigateTo('receive')}*/}
                {/*  />*/}
                {/*  <OperationButton*/}
                {/*    name={'Swap'}*/}
                {/*    image={images.swapcoin}*/}
                {/*    onPress={() => navigateTo('bridge')} //FIXME - This should be used in bridge navigation*/}
                {/*  />*/}
                {/*</>*/}

                {/*{coinCode === 'USDC' && (*/}
                {/*  <>*/}
                {/*    <OperationButton*/}
                {/*      name={'Send'}*/}
                {/*      image={images.sendIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.VERIFYADDRESS, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Receive'}*/}
                {/*      image={images.receiveIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.RECIEVESCREEN, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Bridge'}*/}
                {/*      image={images.swapcoin}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.TRANSFERCOIN, {*/}
                {/*      //       coinData: coinData,*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*  </>*/}
                {/*)}*/}
                {/*{coinCode === 'WUSDC' && (*/}
                {/*  <>*/}
                {/*    <OperationButton*/}
                {/*      name={'Trade'}*/}
                {/*      image={images.buyIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.BUYCOIN, {*/}
                {/*      //       coinData: coinData,*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Send'}*/}
                {/*      image={images.sendIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.VERIFYADDRESS, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Receive'}*/}
                {/*      image={images.receiveIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.RECIEVESCREEN, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Bridge'}*/}
                {/*      image={images.swapcoin}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.TRANSFERCOIN, {*/}
                {/*      //       coinData: coinData,*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*  </>*/}
                {/*)}*/}

                {/*{coinCode === 'EURC' && (*/}
                {/*  <>*/}
                {/*    <OperationButton*/}
                {/*      name={'Send'}*/}
                {/*      image={images.sendIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.VERIFYADDRESS, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Receive'}*/}
                {/*      image={images.receiveIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.RECIEVESCREEN, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Bridge'}*/}
                {/*      image={images.swapcoin}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.TRANSFERCOIN, {*/}
                {/*      //       coinData: coinData,*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*  </>*/}
                {/*)}*/}
                {/*{coinCode === 'WEURC' && (*/}
                {/*  <>*/}
                {/*    <OperationButton*/}
                {/*      name={'Send'}*/}
                {/*      image={images.sendIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.VERIFYADDRESS, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Receive'}*/}
                {/*      image={images.receiveIcon}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.RECIEVESCREEN, {*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*    <OperationButton*/}
                {/*      name={'Bridge'}*/}
                {/*      image={images.swapcoin}*/}
                {/*      //   onPress={() =>*/}
                {/*      //     navigateTo(SCREEN_CONSTANT.TRANSFERCOIN, {*/}
                {/*      //       coinData: coinData,*/}
                {/*      //       coinCode: coinCode,*/}
                {/*      //     })*/}
                {/*      //   }*/}
                {/*    />*/}
                {/*  </>*/}
                {/*)}*/}

                {/* <>
                {(coinCode == 'WATT' || coinCode == 'DREXS') &&
                  <OperationButton
                    name={'Trade'}
                    image={images.buyIcon}
                    onPress={() =>
                      navigateTo(SCREEN_CONSTANT.BUYCOIN,
                        { coinData: coinData, coinCode: coinCode })
                    }
                  />
                }
                {(coinCode == 'DREXS') &&
                  <OperationButton
                    name={'Stake'}
                    image={images.stakeIcon}
                    onPress={() =>
                      navigateTo(SCREEN_CONSTANT.STAKEDREXS)
                    }
                  />
                }
                {(coinCode !== 'USD') ?
                  <>
                    <OperationButton
                      name={'Send'}
                      image={images.sendIcon}
                      onPress={() =>
                        navigateTo(SCREEN_CONSTANT.LISTBENEFICIARIES,
                          { coinCode: coinCode })
                      }
                    />
                    <OperationButton
                      name={'Receive'}
                      image={images.receiveIcon}
                      onPress={() =>
                        navigateTo(SCREEN_CONSTANT.RECIEVESCREEN,
                          { coinCode: coinCode })
                      }
                    />
                    <OperationButton
                    name={'Swap'}
                    image={images.swapcoin}
                    onPress={() =>
                      navigateTo(SCREEN_CONSTANT.SWAPCOIN,
                        { coinData: coinData, coinCode: coinCode })
                    }
                  />

                  </> :
                  <>
                    <OperationButton
                      name={'Deposit'}
                      image={images.sendIcon}
                      onPress={() =>
                        navigateTo(SCREEN_CONSTANT.DEPOSIT,
                          { coinCode: coinCode })
                      }
                    />
                    <OperationButton
                      name={'Withdraw'}
                      image={images.receiveIcon}
                      onPress={() =>
                        navigateTo(SCREEN_CONSTANT.WITHDRAW,
                          { coinCode: coinCode })
                      }
                    />
                  </>
                }
                {coinCode === 'USDC' &&  <OperationButton
                    name={'Bridge'}
                    image={images.swapcoin}
                    onPress={() =>
                      navigateTo(SCREEN_CONSTANT.TRANSFERCOIN,
                        { coinData: coinData, coinCode: coinCode })
                    }
                  />}
                  {coinCode === 'WUSDC' &&  <OperationButton
                    name={'Bridge'}
                    image={images.swapcoin}
                    onPress={() =>
                      navigateTo(SCREEN_CONSTANT.TRANSFERCOIN,
                        { coinData: coinData, coinCode: coinCode })
                    }
                  />}
                  </> */}
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
          <View style={{marginHorizontal: 25, marginTop: 20}}>
            {index === 0 && coinCode !== 'USD' ? (
              <>
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
                    $0.05{/* ${coinData?.fiatValue || 0}{' '} */}
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
              </>
            ) : (
              <MiniTransactionHistory
                coinCode={coinCode}
                // name={profile?.name}
              />
            )}
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  headerCoincodeTitle: {
    color: '#989898',
    fontSize: 18,
    marginLeft: 8,
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
});
