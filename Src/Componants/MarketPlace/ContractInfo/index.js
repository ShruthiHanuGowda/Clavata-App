import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ContractInfo = () => (
    <View style={styles.card}>
        <Text style={styles.contractText}>Contract Address: 0xABC123...XYZ</Text>
        <Text style={styles.contractText}>IPFS JSON: https://ipfs.io/ipfs/yourjsonhash</Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    contractText: {
        fontSize: 13,
        color: '#555',
        marginBottom: 5,
    },
});

export default ContractInfo;
