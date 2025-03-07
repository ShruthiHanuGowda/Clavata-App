import React from 'react';
import {Dimensions, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const PriceHistoryGraph = ({data, labels, toggleValue}) => {
  let showDotIndex = data.indexOf(Math.max(...data));

  return (
    <View>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: data,
              color: () => '#00AB44',
              strokeWidth: 2,
            },
          ],
        }}
        width={Dimensions.get('window').width}
        height={220}
        formatXLabel={xValue =>
          toggleValue === 'week'
            ? `${xValue.split('-')[2]}/${xValue.split('-')[1]}`
            : xValue
        }
        chartConfig={{
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: '#FFFFFF',
          backgroundGradientFromOpacity: 0,
          fillShadowGradient: '#00AB4415',
          fillShadowGradientFromOpacity: '0.2',
          fillShadowGradientTo: '#FFFFFF',
          fillShadowGradientToOpacity: '0.2',
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(61, 61, 61, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(61, 61, 61, ${opacity})`,
          propsForHorizontalLabels: {
            display: 'none',
          },
          propsForBackgroundLines: {
            strokeWidth: '1',
            stroke: '#F6F6F6',
            strokeDasharray: '',
          },
        }}
        withDots={true}
        withHorizontalLines={false}
        strokeWidth={5}
        getDotProps={(value, index) => {
          return {
            r: '1',
            strokeWidth: '10',
            stroke: index == showDotIndex ? '#00AB44' : 'transparent',
            fill: 'transparent',
          };
        }}
        style={{
          marginVertical: 20,
          marginLeft: -20,
          backgroundColor: '#fffff',
        }}
      />
    </View>
  );
};
export default PriceHistoryGraph;
