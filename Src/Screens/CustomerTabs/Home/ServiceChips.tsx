import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

const services = [
  'Hair',
  'Face',
  'Skin',
  'Nails',
  'Makeup',
  'Beard',
  'Spa',
  'Massage',
  'Waxing',
  'Threading',
  'Bridal',
  "Men's Grooming",
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
    <View style={styles.container}>
      {services.map((item) => {
        const isSelected =
          selectedCategory === item;

        return (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              isSelected &&
                styles.selectedChip,
            ]}
            onPress={() => {
              console.log(
                'Category chip pressed:',
                item,
              );

              onSelect(item);
            }}
          >
            <Text
              style={[
                styles.text,
                isSelected &&
                  styles.selectedText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  chip: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,

    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  selectedChip: {
    backgroundColor: '#009D94',
    borderColor: '#009D94',
  },

  text: {
    fontWeight: '600',
    color: '#333',
  },

  selectedText: {
    color: '#FFF',
  },
});