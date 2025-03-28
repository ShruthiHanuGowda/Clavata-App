import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {DText} from '../../Componants/DText';
import CryptoMarketCard from './CryptoMarketCard';
import {fontsFamily} from '../../Theme';
import {useAuth} from '../../../screens/Provider/authProvider';


export default function CryptoMarketPlace(props) {
  const {walletBalances, refreshBalances} = useAuth();
  console.log('walletBalances>>>>>>>>', walletBalances);
  const ethereumCoins = [
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
      growth: 0,
      dollar: walletBalances?.ethBalanceUsd, //props?.ETH?.fiatBalance
      balance: walletBalances?.ethBalance, //props?.ETH?.tokenBalance
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
      growth: 0,
      dollar: walletBalances?.sepoliaUsdcBalanceUsd, //props?.USDC?.fiatBalance
      balance: walletBalances?.sepoliaUsdcBalance, //props?.USDC?.tokenBalance
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
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
      ],
      growth: 0,
      dollar: walletBalances?.wattsBalanceUsd, //props?.WATT?.fiatBalance
      balance: walletBalances?.wattsBalance, //props?.WATT?.tokenBalance
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
      growth: 0,
      dollar: walletBalances?.denergyUsdcBalanceUsd, //props?.WUSDC?.fiatBalance
      balance: walletBalances?.denergyUsdcBalance, //props?.WUSDC?.tokenBalance
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
      growth: 0,
      dollar: walletBalances?.denergyEurcBalanceUsd, //props?.WEURC?.fiatBalance
      balance: walletBalances?.denergyEurcBalance, //props?.WEURC?.tokenBalance
    },
  ];
  return (
    <View style={[marketPlaceStyles.container]}>
      <View style={marketPlaceStyles.header}>
        <DText style={marketPlaceStyles.title} fontStyle="fontSemiBold">
          Live Markets
        </DText>
      </View>
      <View style={marketPlaceStyles.myCryptosContainer}>
        <Text style={marketPlaceStyles.HeaderFont}>My Assets</Text>
        {dEnergyCoins.map(crypto => (
          <CryptoMarketCard
            loading={props.loading}
            {...crypto}
            key={crypto.code}
          />
        ))}
      </View>
      <View style={marketPlaceStyles.divider} />
      <View style={marketPlaceStyles.myCryptosContainer}>
        <Text style={marketPlaceStyles.HeaderFont}>Other Assets</Text>

        {ethereumCoins.map(crypto => (
          <CryptoMarketCard
            loading={props.loading}
            {...crypto}
            key={crypto.code}
          />
        ))}
      </View>
    </View>
  );
}

const marketPlaceStyles = StyleSheet.create({
  container: {
    marginLeft: 21,
    marginRight: 21,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 12,
    letterSpacing: 2.24,
    textTransform: 'uppercase',
  },
  HeaderFont: {
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 1.5,
    marginBottom: 15,
    // marginLeft: 20,
  },
  myCryptosContainer: {
    marginTop: 20,
    // marginBottom: 30,
  },
  divider: {
    borderTopColor: '#E8E8E8',
    borderTopWidth: 1,
    alignSelf: 'center',
    width: '100%',
  },
});
