import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

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
      activeOpacity={0.78}
      onPress={onPress}
      disabled={!onPress}
      style={styles.summaryCard}
    >
      <View style={styles.summaryIconContainer}>
        <Ionicons
          name={icon}
          size={22}
          color="#009D94"
        />
      </View>

      <Text
        style={styles.summaryTitle}
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text
        style={styles.summaryValue}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </TouchableOpacity>
  );
}