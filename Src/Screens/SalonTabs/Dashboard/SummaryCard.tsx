import React from 'react';
import {
  TouchableOpacity,
  Text,
} from 'react-native';

import styles from './styles';

type Props = {
  title: string;
  value: string;
  icon: string;
  onPress?: () => void;
};

export default function SummaryCard({
  title,
  value,
  icon,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
      style={styles.summaryCard}
    >
      <Text style={{ fontSize: 28 }}>
        {icon}
      </Text>

      <Text style={styles.summaryTitle}>
        {title}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}