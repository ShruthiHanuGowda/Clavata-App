import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  StatusBar,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationProp, RouteProp} from '@react-navigation/native';

import style from './style';
import Portfolio from './Portfolio';
import ListItem from './ListItem';
import {SCREEN_CONSTANT} from '../../Navigation/constant';
import MyCryptoCard from './MyCryptoCard';
import {useAuth} from '../../../screens/Provider/authProvider';
import {useWallet} from '../../../screens/Provider/WalletProvider';
import MyCertificatesList from '../../Componants/Certificates/MyCertificatesList';
import {useNftsForAddress} from '../../hooks/useNftsForAddress';
import CryptoMarketCard from '../HomeScreen/CryptoMarketCard';

// Type definitions
interface ChartDataPoint {
  x: number;
  y: number;
}

interface CoinData {
  title: string;
  code: string;
  coinValue?: string;
  chartData: ChartDataPoint[];
  operationsTypes: string[];
  growth: number;
  balance: string;
  dollar: string;
}

interface WalletItem {
  code: string;
  name: string;
  navigation: string;
  value: string | number;
}

interface WalletProps {
  navigation: NavigationProp<any>;
  route?: RouteProp<any>;
  loading?: boolean;
}

interface Balance {
  balance: number;
  balanceUsd: number;
}

const ITEMS: WalletItem[] = [
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

export default function Wallet(props: WalletProps) {
  const {getBalance, refreshAllBalances, isBalanceLoading, portfolio} =
    useWallet();
  const [items, setItems] = useState<WalletItem[]>([]);
  const {userDetails} = useAuth();
  const [pullToRefreshLoading, setPullToRefreshLoading] =
    useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const account: `0x${string}` = userDetails?.userWallet;

  const formatValue = (
    value: number | string | undefined | null,
    fixed?: number,
  ): string => {
    if (value === undefined || value === null) {
      return '0.00';
    }
    return parseFloat(value.toString()).toFixed(fixed ?? 2);
  };

  const ethereumCoins: CoinData[] = [
    {
      title: 'ETH Coin',
      code: 'ETH',
      coinValue: 'ETH',
      chartData: [
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
      ],
      operationsTypes: ['Send', 'Receive'],
      growth: 0,
      balance: formatValue(getBalance('ETH')?.balance, 4),
      dollar: formatValue(getBalance('ETH')?.balanceUsd),
    },
    {
      title: 'USDC Coin',
      code: 'USDC',
      chartData: [
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
      ],
      operationsTypes: ['Send', 'Receive', 'Bridge'],
      growth: 0,
      balance: formatValue(getBalance('USDC')?.balance, 4),
      dollar: formatValue(getBalance('USDC')?.balanceUsd),
    },
    {
      title: 'EURC Coin',
      code: 'EURC',
      chartData: [
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
      ],
      operationsTypes: ['Send', 'Receive', 'Bridge'],
      growth: 0,
      balance: formatValue(getBalance('EURC')?.balance),
      dollar: formatValue(getBalance('EURC')?.balanceUsd),
    },
  ];

  const dEnergyCoins: CoinData[] = [
    {
      title: 'Watt Coin',
      code: 'WATT',
      chartData: [
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
      ],
      operationsTypes: ['Send', 'Receive', 'Swap'],
      growth: 0,
      balance: formatValue(getBalance('WATT')?.balance),
      dollar: formatValue(getBalance('WATT')?.balanceUsd),
    },
    {
      title: 'wUSDC Coin',
      code: 'WUSDC',
      chartData: [
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
      ],
      operationsTypes: ['Send', 'Receive', 'Bridge'],
      growth: 0,
      balance: formatValue(getBalance('WUSDC')?.balance),
      dollar: formatValue(getBalance('WUSDC')?.balanceUsd),
    },
    {
      title: 'wEURC Coin',
      code: 'WEURC',
      chartData: [
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
      ],
      operationsTypes: ['Send', 'Receive', 'Bridge'],
      growth: 0,
      balance: formatValue(getBalance('WEURC')?.balance),
      dollar: formatValue(getBalance('WEURC')?.balanceUsd),
    },
  ];

  const scrollToTop = (): void => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  };

  const init = async (): Promise<void> => {
    scrollToTop();

    const updated = ITEMS.map(async (item: WalletItem) => {
      if (item.code === 'DRECS') {
        try {
          // Note: getDrecs function is not defined in the original code
          // You'll need to implement this function or replace with appropriate logic
          // const [error, result] = await getDrecs();
          setPullToRefreshLoading(false);
          return {
            ...item,
            // value: result?.data?.drecsOwned,
          };
        } catch (error) {
          setPullToRefreshLoading(false);
          return {...item};
        }
      }
      return {...item};
    });

    const resolvedItems = await Promise.all(updated);
    setItems(resolvedItems);
  };

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      init();
    });
    return unsubscribe;
  }, [props.navigation]);

  const balanceData = {};

  return (
    <View style={{backgroundColor: '#fff', flex: 1}}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{paddingBottom: 50}}
        refreshControl={
          <RefreshControl
            refreshing={isBalanceLoading || pullToRefreshLoading}
            onRefresh={async () => {
              setPullToRefreshLoading(true);
              try {
                await refreshAllBalances();

                await refresh();
                await init();
              } catch (error) {
                console.error('Error during refresh:', error);
              } finally {
                setPullToRefreshLoading(false);
              }
            }}
          />
        }>
        <Portfolio {...balanceData} fiatBalance={portfolio?.totalUsd} />
        <View style={style.container}>
          <View style={style.myCryptosContainer}>
            <Text style={style.HeaderFont}>My Assets</Text>

            {dEnergyCoins.map(crypto => (
              <CryptoMarketCard
                loading={props.loading}
                {...crypto}
                key={crypto.code}
              />
            ))}
          </View>
          <View style={style.dividerCoins} />
          <View style={style.myCryptosContainer}>
            <Text style={style.HeaderFont}>Other Assets</Text>
            {ethereumCoins.map(crypto => (
              <CryptoMarketCard
                loading={props.loading}
                {...crypto}
                key={crypto.code}
              />
            ))}
          </View>
          <View style={style.dividerCoins} />
          <View style={style.myCryptosContainer}>
            <Text style={style.HeaderFont}>My Certificates</Text>
            <MyCertificatesList />
          </View>

          {/* <FlatList
            style={{
              paddingHorizontal: 20,
            }}
            data={items}
            keyExtractor={(item: WalletItem, index: number) => index.toString()}
            renderItem={({ item }: { item: WalletItem }) => <ListItem item={item} />}
          /> */}
        </View>
      </ScrollView>
    </View>
  );
}
