import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Svg} from 'react-native-svg';
import {VictoryLine} from 'victory-native';
import {DText} from '../../Componants/DText';
import {marketIcons} from '../../Theme/variable';
import {navigateTo} from '../../utils/navigationService';
import {ScreenWidth} from '@rneui/base';

const marketIconColors = {
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
}) {
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
          {
            backgroundColor: marketIconColors[code],
          },
        ]}>
        <Image source={marketIcons[code]} />
      </View>
      <View style={marketStyles.info}>
        <DText
          style={marketStyles.coinTitle}
          fontStyle="fontBold"
          textProps={{numberOfLines: 1}}>
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
            bottom: 10,
          }}>
          <Svg width={width} height={height}>
            <VictoryLine
              interpolation="natural"
              standalone={false}
              width={width}
              height={height}
              style={{
                data: {
                  stroke: growth >= 0 ? '#029471' : '#F42121',
                  strokeWidth: 1,
                },
              }}
              padding={0}
              data={chartData}
            />
          </Svg>
          {growth >= 0 ? (
            <DText fontStyle="fontRegular" style={marketStyles.growth}>
              +{growth}%
            </DText>
          ) : (
            <DText fontStyle="fontRegular" style={marketStyles.dip}>
              -{dip}%
            </DText>
          )}
        </View>
        <View style={{alignItems: 'flex-end'}}>
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
    backgroundColor: '#D5F5F1',
    height: 37,
    width: 37,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    lineHeight: 16,
    marginTop: 5,
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
