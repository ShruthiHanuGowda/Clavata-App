import React from 'react';
import {VictoryArea, VictoryAxis} from 'victory-native';
import {Svg} from 'react-native-svg';

const height = 120;
const width = 200;

const AreaChart = ({chartData}) => {
  return (
    <Svg width={width} height={height} translateY={-40}>
      <VictoryArea
        interpolation="natural"
        standalone
        width={width}
        height={height}
        data={chartData}
        style={{
          data: {
            fill: '#00AB4415',
            fillOpacity: 0.7,
            stroke: '#02947190',
            strokeWidth: 2,
          },
        }}
      />
      <VictoryAxis
        style={{
          axis: {stroke: 'transparent'},
          ticks: {stroke: 'transparent'},
          tickLabels: {fill: 'transparent'},
        }}
      />
    </Svg>
  );
};

export default AreaChart;
