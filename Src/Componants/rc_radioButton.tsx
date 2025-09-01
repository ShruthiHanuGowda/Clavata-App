import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {fontsFamily} from '../Theme';

interface RadioButtonItem {
  key: string;
  text: string;
}

interface RadioButtonProps {
  PROP: RadioButtonItem[];
  selectedOption: string | null;
  selectedValue: (key: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  PROP,
  selectedOption,
  selectedValue,
}) => {
  const [value, setValue] = useState<string | null>(null);

  const handlePress = (key: string) => {
    setValue(key);
    selectedValue(key);
  };

  return (
    <View>
      {PROP.map(res => (
        <TouchableOpacity
          key={res.key}
          onPress={() => handlePress(res.key)}
          style={styles.container}>
          <View style={styles.radioCircle}>
            {selectedOption === res.key && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.radioText}>{res.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 21,
    marginBottom: 21,
    alignItems: 'center',
    flexDirection: 'row',
  },
  radioText: {
    marginLeft: 17,
    color: '#6D6D6D',
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    lineHeight: 18,
  },
  radioCircle: {
    marginLeft: 21,
    height: 18,
    width: 18,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: '#000000',
  },
  result: {
    marginBottom: 20,
    color: 'white',
    fontWeight: '600',
    backgroundColor: '#F3FBFE',
  },
});

export default RadioButton;
