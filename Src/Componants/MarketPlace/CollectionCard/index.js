import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const cardWidth = (screenWidth / 2) - (cardMargin * 3);

const CollectionCard = ({ collection, onPress }) => {
    return (
        <TouchableOpacity style={[styles.collectionCard, { width: cardWidth }]} onPress={onPress}>
            <Image source={{ uri: collection.bannerImage }} style={styles.bannerImage} />
            <View style={styles.collectionInfo}>
                <Text style={styles.collectionName}>{collection.collectionName}</Text>
                <Text style={styles.symbolText}>{collection.symbol}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    collectionCard: {
        margin: cardMargin,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerImage: {
        width: '100%',
        aspectRatio: 1,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    collectionInfo: {
        padding: 10,
        alignItems: 'center',
    },
    collectionName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    symbolText: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
    },
});

export default CollectionCard;