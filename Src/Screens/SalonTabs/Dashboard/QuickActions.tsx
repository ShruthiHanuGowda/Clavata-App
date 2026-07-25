import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import styles from './styles';
import { quickActions } from './dummyData';

type Props = {
  onPress?: (action: string) => void;
};

export default function QuickActions({
  onPress,
}: Props) {
  return (
    <View style={styles.quickActionsContainer}>
      {quickActions.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => onPress?.(item.title)}>

          <Text style={styles.actionIcon}>
            {item.icon}
          </Text>

          <Text style={styles.actionText}>
            {item.title}
          </Text>

        </TouchableOpacity>
      ))}
    </View>
  );
}