import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const CollectionCard = ({ collection, onPress }) => {
    return (
        <TouchableOpacity style={styles.collectionCard} onPress={onPress}>
            <Image source={{ uri: collection.bannerImage }} style={styles.bannerImage} />
            <View style={styles.collectionInfo}>
                <Text style={styles.collectionName}>{collection.collectionName}</Text>
                <Text style={styles.symbolText}>Symbol: {collection.symbol}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    collectionCard: {
        width: '90%',
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        backgroundColor: '#fff',
    },
    bannerImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
        borderRadius: 15,
    },
    collectionInfo: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
        elevation: 3,
    },
    collectionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    symbolText: {
        fontSize: 14,
        color: '#777',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default CollectionCard;
