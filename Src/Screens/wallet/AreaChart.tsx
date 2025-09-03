import React from 'react';
import {CartesianChart, Line} from 'victory-native';
import {View, StyleSheet} from 'react-native';

type PointData = {x: number; y: number};

const AreaChart = ({chartData}: {chartData: PointData[]}) => {
  return (
    <View style={styles.container}>
      <CartesianChart
        data={chartData as any}
        xKey={'x' as any}
        yKeys={['y'] as any}
        axisOptions={{lineColor: '#fff'}}
        frame={{lineColor: '#fff'}}>
        {({points}: any) => (
          <Line points={points.y} color={'#02947190'} strokeWidth={1} />
        )}
      </CartesianChart>
    </View>
  );
};

export default AreaChart;

const styles = StyleSheet.create({
  container: {width: 100, height: 120},
});
