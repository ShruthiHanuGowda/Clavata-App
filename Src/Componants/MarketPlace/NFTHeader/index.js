import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const NFTHeader = ({ nft, onBuyPress }) => (
    <View style={styles.header}>
        <View style={styles.left}>
            <Text style={styles.title}>{nft.name}</Text>
            {nft.description && <Text style={styles.description}>{nft.description}</Text>}
            {nft.price && <Text style={styles.price}>💰 Price: {nft.price}</Text>}
            <Text style={styles.qty}>📦 Quantity: {nft.quantity}</Text>
            <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buyButtonText} onPress={onBuyPress}>Buy Now</Text>
            </TouchableOpacity>
        </View>
        <Image source={{ uri: nft.image }} style={styles.nftImage} />
    </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        elevation: 3,
    },
    left: {
        flex: 1,
        paddingRight: 10,
        justifyContent: 'center',
    },
    title: { fontSize: 24, fontWeight: '700', color: '#333' },
    description: { fontSize: 14, color: '#666', marginVertical: 5 },
    price: { fontSize: 16, color: '#2ecc71', marginVertical: 4 },
    qty: { fontSize: 14, color: '#888', marginBottom: 10 },
    buyButton: {
        backgroundColor: '#008060',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },
    buyButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    nftImage: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#eee' },
});

export default NFTHeader;