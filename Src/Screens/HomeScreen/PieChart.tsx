import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PolarChart, Pie} from 'victory-native';
import colors from '../../Theme/Colors';
import {fontsFamily} from '../../Theme';

// Types
interface ChartDataPoint {
  x: number;
  y: number;
}

interface PieChartProps {
  data: ChartDataPoint[];
  chartWidth?: number;
  chartHeight?: number;
  centerText?: string;
  centerCircleColor?: string;
}

// Transform data to include colors
const transformData = (data: ChartDataPoint[]) => {
  return data.map((item, index) => ({
    ...item,
    color: index === 0 ? colors.available : colors.staked,
  }));
};

const PieChart: React.FC<PieChartProps> = ({
  data,
  chartWidth = '100%',
  chartHeight = '100%',
  centerText = 'Total',
  centerCircleColor = '#FFFFFF',
}) => {
  // Calculate center circle dimensions (45% of chart size)
  const getCircleSize = () => {
    if (typeof chartWidth === 'number' && typeof chartHeight === 'number') {
      const minSize = Math.min(chartWidth, chartHeight);
      return minSize * 0.45;
    }
    // Default size for percentage-based dimensions
    return 90;
  };

  const circleSize = getCircleSize();
  const transformedData = transformData(data);

  return (
    <View
      style={[styles.chartContainer, {height: chartHeight as any, width: chartWidth as any}]}>
      {/* Pie Chart */}
      <PolarChart
        data={transformedData}
        labelKey={'x'}
        valueKey={'y'}
        colorKey={'color'}>
        <Pie.Chart>
          {({slice}: {slice: any}) => {
            return <Pie.Slice />;
          }}
        </Pie.Chart>
      </PolarChart>

      {/* Center Circle with Text */}
      <View
        style={[
          styles.centerCircle,
          {
            width: circleSize,
            height: circleSize,
            backgroundColor: centerCircleColor,
            borderRadius: circleSize / 2,
            transform: [
              {translateX: -circleSize / 2},
              {translateY: -circleSize / 2},
            ],
          },
        ]}>
        <Text style={[styles.centerText, {color: '#000000'}]}>
          {centerText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    position: 'relative',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerText: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: fontsFamily.MulishBold,
  },
});

export default PieChart;
