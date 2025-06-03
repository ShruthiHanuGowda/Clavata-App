import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Svg } from 'react-native-svg';
import { CartesianChart, Line } from 'victory-native';
import { DText } from '../../Componants/DText';
import { marketIcons } from '../../Theme/variable';
import { navigateTo } from '../../utils/navigationService';
import { ScreenWidth } from '@rneui/base';
import { useFont } from '@shopify/react-native-skia';
import { fontsFamily } from '../../Theme';

const marketIconColors: { [key: string]: string } = {
  WATT: '#045E19',
  BTC: '#F7931A30',
  USDT: '#26A17B',
  USDC: '#2775CA',
  WUSDC: '#2775CA',
  EURC: '#2775CA',
  WEURC: '#2775CA',
  ETH: '#ECEFF0',
  USD: '#D5F5F1',
};

export default function CryptoMarketCard({
  title,
  code,
  chartData,
  dollar,
  growth,
  dip,
  loading,
  balance,
  coinValue = null,
  operationsTypes,
}: any) {
  const height = 21;
  const width = 71;
  return (
    <TouchableOpacity
      style={marketStyles.container}
      onPress={() =>
        navigateTo('coinWalletStack', {
          screen: 'coinWallet',
          params: {
            coinCode: code,
            operationsTypes: operationsTypes,
          },
        })
      }
      activeOpacity={0.5}>
      <View
        style={[
          marketStyles.image,
        ]}>
        <Image
          source={marketIcons[code]}
          style={marketStyles.coinIcon}
          resizeMode="contain"
        />
      </View>
      <View style={marketStyles.info}>
        <DText
          style={marketStyles.coinTitle}
          fontStyle="fontBold"
          textProps={{ numberOfLines: 1 }}>
          {title}
        </DText>
        <DText style={marketStyles.coinCode} fontStyle="fontSemiBold">
          {code}
        </DText>
      </View>
      <View style={marketStyles.content}>
        <View
          style={{
            width,
            justifyContent: 'center',
            alignItems: 'center',
            bottom: 0,
          }}>
          {/* <View style={{ height: height, width: width, backgroundColor: '#fff' }}>
            <CartesianChart
              data={chartData}
              xKey="x"
              yKeys={['y']}
              axisOptions={{ lineColor: '#fff' }}
              frame={{ lineColor: '#fff' }}>
              {({ points }) => (
                <Line
                  points={points.y}
                  color={growth >= 0 ? '#029471' : '#F42121'}
                  strokeWidth={0}
                />
              )}
            </CartesianChart>
          </View>

          {growth >= 0 ? (
            <DText fontStyle="fontRegular" style={marketStyles.growth}>
              +{growth}%
            </DText>
          ) : (
            <DText fontStyle="fontRegular" style={marketStyles.dip}>
              -{dip}%
            </DText>
          )} */}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <DText style={marketStyles.usd} fontStyle="fontExtraBold">
            {balance ? Number(balance).toFixed(2) : '0.0'}
          </DText>
          <DText style={marketStyles.coinCode} fontStyle="fontSemiBold">
            ${dollar ? Number(dollar).toFixed(2) : '0.0'}
          </DText>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const marketStyles = StyleSheet.create({
  container: {
    height: 37,
    flex: 1,
    flexDirection: 'row',
    marginBottom: 15,
    // marginLeft: 20,
    width: ScreenWidth - 40,
  },
  image: {
    backgroundColor: 'transparent',
    height: 37,
    width: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  coinIcon: {
    width: 40, // Fixed width
    height: 40, // Fixed height
    maxWidth: 40, // Prevent expansion
    maxHeight: 40, // Prevent expansion
  },
  coinTitle: {
    color: '#515151',
    fontSize: 14,
    lineHeight: 16,
  },
  coinCode: {
    color: '#A6A6A6',
    fontSize: 12,
    marginTop: 5,
  },
  info: {
    marginRight: 40,
    width: 80,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chart: {},
  growth: {
    color: '#0FB990',
    textAlign: 'center',
    fontSize: 10,
    // lineHeight: 16,
    marginTop: -5,
  },
  dip: {
    color: '#FF4949',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  usd: {
    color: '#515151',
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 16,
  },
});
