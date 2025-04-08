import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CollectionDetailsHeader = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: 40,
        paddingLeft: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 30,
        elevation: 5,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default CollectionDetailsHeader;
