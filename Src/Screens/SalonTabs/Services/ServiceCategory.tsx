import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Props = {
  value: string;
  categories: string[];
  onChange: (value: string) => void;
};

export default function ServiceCategory({
  value,
  categories,
  onChange,
}: Props) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
      }}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}>
        {categories
          .filter(item => item !== 'All')
          .map(item => (
            <Picker.Item
              key={item}
              label={item}
              value={item}
            />
          ))}
      </Picker>
    </View>
  );
}