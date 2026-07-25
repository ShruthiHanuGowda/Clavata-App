import React from 'react';
import {
  View,
  Text,
} from 'react-native';

import styles from './styles';

type Props = {
  title: string;
  value: string;
  icon: string;
};

export default function SummaryCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <View style={styles.summaryCard}>
      <Text style={{ fontSize: 28 }}>
        {icon}
      </Text>

      <Text style={styles.summaryTitle}>
        {title}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}