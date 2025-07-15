import React from 'react';
import {Dimensions, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const PriceHistoryGraph = ({data, labels, toggleValue}) => {
  let showDotIndex = data.indexOf(Math.max(...data));

  // Format labels based on toggle value and data type
  const formatXLabel = (xValue) => {
    if (!xValue) return '';
    
    // If it's already a formatted short label (like "Mon", "Tue", "08:00"), return as is
    if (xValue.length <= 5) {
      return xValue;
    }
    
    // Handle date string format (YYYY-MM-DD or other date formats)
    if (xValue.includes('-') && xValue.split('-').length === 3) {
      const parts = xValue.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
    }
    
    // Handle timestamp or other formats
    if (toggleValue === 'week') {
      // Try to parse as date and get day name
      const date = new Date(xValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }
    } else if (toggleValue === 'day') {
      // Try to parse as date and get hour
      const date = new Date(xValue);
      if (!isNaN(date.getTime())) {
        return date.getHours().toString().padStart(2, '0') + ':00';
      }
    }
    
    // Fallback: return first few characters
    return xValue.substring(0, 5);
  };

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
        formatXLabel={formatXLabel}
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
          backgroundColor: '#ffffff',
        }}
      />
    </View>
  );
};

export default PriceHistoryGraph;