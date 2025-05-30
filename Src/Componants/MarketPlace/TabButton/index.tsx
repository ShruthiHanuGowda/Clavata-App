import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const TabButton = ({label, isSelected, onPress}) => {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isSelected && styles.selectedTab]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text style={[styles.tabButtonText, isSelected && styles.selectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTab: {
    backgroundColor: '#81c8c3',
    borderColor: '#006a52',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
  },
});

export default TabButton;
