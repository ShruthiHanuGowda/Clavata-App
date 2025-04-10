import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OwnerList = ({ owners }) => (
    <View style={styles.card}>
        {owners.map((owner) => (
            <View key={owner.id} style={styles.ownerRow}>
                <View style={styles.ownerInfo}>
                    {owner?.price && <Text style={styles.ownerText}>Price: {owner.price}</Text>}
                    <Text style={styles.ownerText}>Qty: {owner.qty}</Text>
                    <Text style={styles.ownerText}>Owner: {owner.owner}</Text>
                </View>
                <TouchableOpacity
                    style={owner.isCurrentUser ? styles.sellButton : styles.buyButton}
                >
                    <Text style={styles.buttonText}>
                        {owner.isCurrentUser ? 'Sell' : 'Buy'}
                    </Text>
                </TouchableOpacity>
            </View>
        ))}
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
    ownerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    ownerInfo: { flex: 1 },
    ownerText: { fontSize: 14, color: '#34495e', marginBottom: 3 },
    buyButton: {
        backgroundColor: '#008060',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    sellButton: {
        backgroundColor: '#f39c12',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default OwnerList;
