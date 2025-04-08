import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TabButton = ({ label, isSelected, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.tabButton, isSelected && styles.selectedTab]}
            onPress={onPress}
        >
            <Text style={styles.tabButtonText}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tabButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: '#f9f9f9',
        borderRadius: 30,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedTab: {
        backgroundColor: '#4CAF50',
    },
    tabButtonText: {
        fontSize: 18,
        color: '#333',
    },
});

export default TabButton;
