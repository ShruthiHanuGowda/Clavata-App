import React from 'react';
import {CartesianChart, Line} from 'victory-native';
import {Svg} from 'react-native-svg';
import {Text, View} from 'react-native';

const height = 120;
const width = 200;

const AreaChart = ({chartData}) => {
  return (
    <View style={{width: 100, height: 120}}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['y']}
        axisOptions={{lineColor: '#fff'}}
        frame={{lineColor: '#fff'}}>
        {({points}) => (
          <Line points={points.y} color={'#02947190'} strokeWidth={1} />
        )}
      </CartesianChart>
    </View>
  );
};

export default AreaChart;
