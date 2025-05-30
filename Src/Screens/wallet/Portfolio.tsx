import React from 'react';
import {View, Text, Image} from 'react-native';

import {Images} from '../../Theme';
import style from './style';

import LinearGradient from 'react-native-linear-gradient';
import AreaChart from './AreaChart';

const Portfolio = ({WATT, fiatBalance}) => {
  return (
    <LinearGradient
      colors={['#dcf2f1', '#FFFFFF']}
      start={{x: 0, y: 1}}
      end={{x: 1, y: 1}}
      useAngle={true}
      angle={30}
      locations={[0, 0.35, 0.6]}>
      <Text style={style.font}>Wallet</Text>
      <View style={style.portfolioMainView}>
        <Text style={style.content}>portfolio value</Text>
        {/*  {fiatBalance} */}
        <Text style={style.contentText}>
          ${fiatBalance ? Number(fiatBalance).toFixed(2) : '0.0'}
        </Text>
        <AreaChart
          chartData={
            WATT?.chartData || [
              {x: 1, y: 0},
              {x: 2, y: 0},
            ]
          }
        />
        <View style={style.priceContentView}>
          <Image
            source={Images.sharePriceIcon}
            style={style.sharePriceIcon}
            resizeMode="contain"
          />
          <Text style={style.pricetext}>
            USD {0} (+{WATT?.percentage || 0}%)
          </Text>
          <Text style={style.priceFont}> Today</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Portfolio;
