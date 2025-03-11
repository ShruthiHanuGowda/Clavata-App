import {ScreenWidth} from '@rneui/base';
import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Svg} from 'react-native-svg';
import {VictoryLine} from 'victory-native';
import {marketIcons} from '../../Theme/variable';
import {DText} from '../../Componants/DText';
import {SCREEN_CONSTANT} from '../../Navigation/constant';
import {fontsFamily} from '../../Theme';
import {navigateTo} from '../../utils/navigationService';

const marketIconColors = {
  WATT: '#045E19',
  BTC: '#F7931A30',
  USDT: '#26A17B',
  USDC: '#2775CA',
  WUSDC: '#2775CA',
  EURC: '#2775CA',
  WEURC: '#2775CA',
  ETH: '#ECEFF0',
};

const MyCryptoCard = ({
  title,
  code,
  chartData,
  dollar,
  growth,
  dip,
  balance,
}) => {
  const height = 21;
  const width = 71;
  return (
    <TouchableOpacity
      style={marketStyles.container}
      onPress={() => navigateTo('coinWallet')}
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
          style={[
            marketStyles.chart,
            {
              width,
            },
          ]}>
          <Svg width={width} height={height}>
            <VictoryLine
              interpolation="natural"
              standalone={false}
              width={width}
              height={height}
              style={{
                data: {
                  stroke: growth > 0 ? '#029471' : '#F42121',
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
            {balance}
          </DText>
          <DText style={marketStyles.coinCode} fontStyle="fontSemiBold">
            ${dollar || 0}
          </DText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyCryptoCard;

const marketStyles = StyleSheet.create({
  container: {
    height: 37,
    flex: 1,
    flexDirection: 'row',
    marginBottom: 15,
    marginLeft: 20,
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
