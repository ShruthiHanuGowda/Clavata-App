import React from 'react';
import {CartesianChart, Line} from 'victory-native';
import {View} from 'react-native';

const AreaChart = ({chartData}: any) => {
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
