import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

import styles from './styles';

type Props = {
  categories: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}>

      {categories.map(item => (
        <TouchableOpacity
          key={item}
          onPress={() => onSelect(item)}
          style={[
            styles.categoryButton,
            selected === item && styles.categoryActive,
          ]}>

          <Text
            style={[
              styles.categoryText,
              selected === item &&
                styles.categoryTextActive,
            ]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}