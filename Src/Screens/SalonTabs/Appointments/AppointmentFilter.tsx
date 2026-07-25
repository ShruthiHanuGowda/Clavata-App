import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
} from 'react-native';

import styles from './styles';

const filters = [
  'Today',
  'Upcoming',
  'Completed',
  'Cancelled',
];

type Props = {
  selected: string;
  onSelect: (filter: string) => void;
};

export default function AppointmentFilter({
  selected,
  onSelect,
}: Props) {
  return (
    <View style={styles.filterContainer}>
      {filters.map(item => (
        <TouchableOpacity
          key={item}
          style={[
            styles.filterButton,
            selected === item &&
              styles.filterButtonActive,
          ]}
          onPress={() => onSelect(item)}>
          <Text
            style={[
              styles.filterText,
              selected === item &&
                styles.filterTextActive,
            ]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}