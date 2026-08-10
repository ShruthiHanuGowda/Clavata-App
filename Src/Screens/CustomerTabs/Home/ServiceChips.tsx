import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const services = [
  {
    name: 'Hair',
    icon: 'content-cut',
    color: '#8B5CF6',
    background: '#F3E8FF',
  },
  {
    name: 'Face',
    icon: 'face-woman',
    color: '#F97316',
    background: '#FFF1E6',
  },
  {
    name: 'Skin',
    icon: 'face',
    color: '#3B82F6',
    background: '#EFF6FF',
  },
  {
    name: 'Nails',
    icon: 'hand-back-right',
    color: '#EC4899',
    background: '#FCE7F3',
  },
  {
    name: 'Makeup',
    icon: 'lipstick',
    color: '#EF4444',
    background: '#FEE2E2',
  },
  {
    name: 'Beard',
    icon: 'face-man',
    color: '#92400E',
    background: '#FEF3C7',
  },
  {
    name: 'Spa',
    icon: 'spa',
    color: '#10B981',
    background: '#D1FAE5',
  },
  {
    name: 'Massage',
    icon: 'hand-heart',
    color: '#F59E0B',
    background: '#FEF3C7',
  },
  {
    name: 'Waxing',
    icon: 'hair-dryer',
    color: '#06B6D4',
    background: '#CFFAFE',
  },
  {
    name: 'Threading',
    icon: 'eye-outline',
    color: '#7C3AED',
    background: '#EDE9FE',
  },
  {
    name: 'Bridal',
    icon: 'ring',
    color: '#DB2777',
    background: '#FCE7F3',
  },
  {
    name: "Men's Grooming",
    icon: 'account-tie',
    color: '#2563EB',
    background: '#DBEAFE',
  },
];

type Props = {
  onSelect: (category: string) => void;
  selectedCategory?: string;
};

export default function ServiceChips({
  onSelect,
  selectedCategory = '',
}: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {services.map((item) => {
          const isSelected =
            selectedCategory === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.75}
              style={[
                styles.chip,
                isSelected &&
                  styles.selectedChip,
              ]}
              onPress={() => {
                console.log(
                  'Category chip pressed:',
                  item.name,
                );

                onSelect(item.name);
              }}
            >
              {/* ICON */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      isSelected
                        ? '#FFFFFF'
                        : item.background,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={23}
                  color={
                    isSelected
                      ? '#009D94'
                      : item.color
                  }
                />
              </View>

              {/* CATEGORY NAME */}
              <Text
                numberOfLines={1}
                style={[
                  styles.text,
                  isSelected &&
                    styles.selectedText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },

  container: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },

  chip: {
    width: 88,
    height: 92,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#E5E5E5',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

    paddingHorizontal: 8,
  },

  selectedChip: {
    backgroundColor: '#009D94',
    borderColor: '#009D94',
  },

  iconContainer: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 7,
  },

  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },

  selectedText: {
    color: '#FFFFFF',
  },
});

