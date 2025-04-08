import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const NFTCard = ({ nft }) => {
    return (
        <View style={styles.nftCard}>
            <Image source={{ uri: nft.image }} style={styles.nftImage} />
            <Text style={styles.nftName}>{nft.name}</Text>
            <Text style={styles.nftId}>ID: {nft.id}</Text>
            {nft.onSale && nft.price ? (
                <Text style={styles.nftPrice}>Asking Price: {nft.price}</Text>
            ) : (
                <Text style={styles.nftPrice}>Not for sale</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    nftCard: {
        width: '90%',
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 5,
    },
    nftImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    nftName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 10,
    },
    nftId: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 8,
    },
    nftPrice: {
        fontSize: 16,
        color: '#4CAF50',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default NFTCard;
