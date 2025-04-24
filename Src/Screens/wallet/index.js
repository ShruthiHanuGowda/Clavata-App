import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  StatusBar,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import style from './style';
import Portfolio from './Portfolio';
import ListItem from './ListItem';
import { SCREEN_CONSTANT } from '../../Navigation/constant';
import MyCryptoCard from './MyCryptoCard';
import AppContext from '../../../AppContext';
import { useAuth } from '../../../screens/Provider/authProvider';

const ITEMS = [
  {
    code: 'DRECS',
    name: 'My EACs',
    navigation: SCREEN_CONSTANT.MYDRECS,
    value: '132,456',
  },
  // {
  //   code: 'COLLECTIBLES',
  //   name: 'My Collectibles',
  //   navigation: SCREEN_CONSTANT.MYCOLLECTABLES,
  //   value: '0',
  // },
  // { name: 'Staking Activities', navigation: SCREEN_CONSTANT.STAKE, value: null }
];

export default function Wallet(props) {
  const { getDrecs, getBalance, balanceData, data } =
    useContext(AppContext).portfolio;
  const [items, setItems] = useState([]);
  const { walletBalances, refreshBalances } = useAuth();
  const [pullToRefreshLoading, setPullToRefreshLoading] = useState(false);
  const scrollViewRef = useRef();

  const ethereumCoins = [
    {
      title: 'ETH Coin',
      code: 'ETH',
      coinValue: 'ETH',
      chartData: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      growth: 0,
      dollar: walletBalances?.ethBalanceUsd, //props?.ETH?.fiatBalance
      balance: walletBalances?.ethBalance, //props?.ETH?.tokenBalance
    },
    {
      title: 'USDC Coin',
      code: 'USDC',
      chartData: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      growth: 0,
      dollar: walletBalances?.sepoliaUsdcBalanceUsd, //props?.USDC?.fiatBalance
      balance: walletBalances?.sepoliaUsdcBalance, //props?.USDC?.tokenBalance
    },
    {
      title: 'EURC Coin',
      code: 'EURC',
      chartData: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      growth: 0,
      dollar: walletBalances?.sepoliaEurcBalanceUsd, //props?.EURC?.fiatBalance
      balance: walletBalances?.sepoliaEurcBalance, //props?.EURC?.tokenBalance
    },
  ];

  const dEnergyCoins = [
    {
      title: 'Watt Coin',
      code: 'WATT',
      chartData: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      growth: 0,
      dollar: walletBalances?.wattsBalanceUsd, //props?.WATT?.fiatBalance
      balance: walletBalances?.wattsBalance, //props?.WATT?.tokenBalance
    },
    {
      title: 'wUSDC Coin',
      code: 'WUSDC',
      chartData: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      growth: 0,
      dollar: walletBalances?.denergyUsdcBalanceUsd, //props?.WUSDC?.fiatBalance
      balance: walletBalances?.denergyUsdcBalance, //props?.WUSDC?.tokenBalance
    },
    {
      title: 'wEURC Coin',
      code: 'WEURC',
      chartData: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      growth: 0,
      dollar: walletBalances?.denergyEurcBalanceUsd, //props?.WEURC?.fiatBalance
      balance: walletBalances?.denergyEurcBalance, //props?.WEURC?.tokenBalance
    },
  ];

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  };
  const init = () => {
    scrollToTop();
    getBalance();
    const updated = ITEMS.map(async item => {
      if (item.code === 'DRECS') {
        const [error, result] = await getDrecs();
        setPullToRefreshLoading(false);
        return {
          ...item,
          value: result?.data?.drecsOwned,
        };
      }
      return {
        ...item,
      };
    });

    Promise.all(updated).then(setItems);
  };

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      init();
    });
    return unsubscribe;
  }, [props.navigation]);

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 50 }}
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
        <Portfolio {...balanceData} fiatBalance={data?.fiatBalance} />
        <View>
          <View style={style.myCryptosContainer}>
            <Text style={style.HeaderFont}>My Assets</Text>
            {dEnergyCoins.map(crypto => (
              <MyCryptoCard {...crypto} key={crypto.code} />
            ))}
          </View>
          <View style={style.dividerCoins} />
          <View style={style.myCryptosContainer}>
            <Text style={style.HeaderFont}>Other Assets</Text>

            {ethereumCoins.map(crypto => (
              <MyCryptoCard {...crypto} key={crypto.code} />
            ))}
          </View>

          {/* <FlatList
            style={{
              paddingHorizontal: 20,
            }}
            data={items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={item => <ListItem item={item.item} />}
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
