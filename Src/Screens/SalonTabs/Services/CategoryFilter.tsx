import React from 'react';

import {
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

import styles from './styles';

export type CategoryOption = {
  id: string;
  name: string;
};

type Props = {
  categories: CategoryOption[];
  selected: string;
  onSelect: (
    categoryId: string,
  ) => void;
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
      contentContainerStyle={
        styles.categoryContainer
      }
    >
      {/* ALL */}

      <TouchableOpacity
        key="ALL"
        activeOpacity={0.8}
        onPress={() =>
          onSelect('ALL')
        }
        style={[
          styles.categoryButton,
          selected === 'ALL' &&
            styles.categoryActive,
        ]}
      >
        <Text
          style={[
            styles.categoryText,
            selected === 'ALL' &&
              styles.categoryTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {/* CATEGORIES */}

      {categories.map(
        category => {
          const active =
            selected ===
            category.id;

          return (
            <TouchableOpacity
              key={
                category.id
              }
              activeOpacity={0.8}
              onPress={() =>
                onSelect(
                  category.id,
                )
              }
              style={[
                styles.categoryButton,
                active &&
                  styles.categoryActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  active &&
                    styles.categoryTextActive,
                ]}
              >
                {
                  category.name
                }
              </Text>
            </TouchableOpacity>
          );
        },
      )}
    </ScrollView>
  );
}