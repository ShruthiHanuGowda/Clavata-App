import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import images from '../Theme/images';

const Dropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedValue, setSelectedValue] = useState('USD');

  const options = ['USD'];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        style={{...styles.dropdown, borderBottomWidth: showDropdown ? 0.5 : 0}}
        activeOpacity={0.7}>
        <Text style={styles.itemStyle}>{selectedValue}</Text>
        <Image
          source={images.arrowDown}
          style={{
            height: 16,
            width: 16,
            transform: [{rotate: showDropdown ? '180deg' : '0deg'}],
          }}
        />
      </TouchableOpacity>
      {showDropdown && (
        <View style={styles.dropDownItems}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedValue(option);
                setShowDropdown(false);
              }}>
              <Text style={styles.itemStyle}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: '#B5B5B5',
    borderWidth: 0.5,
    borderRadius: 5,
  },
  dropdown: {
    borderBottomColor: '#B5B5B5',
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropDownItems: {
    padding: 6,
  },
  itemStyle: {
    fontSize: 14,
    color: '#000000',
  },
});
