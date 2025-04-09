import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Spinner from '../../../Componants/MarketPlace/Spinner';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 40) / 2;

const NFTCard = ({ nft }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('NFTDetailsPage', { nft });
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.card}>
            <View style={styles.imageContainer}>
                {!imageLoaded && (
                    <View style={styles.imagePlaceholder}>
                        <Spinner />
                    </View>
                )}
                <Image
                    source={{ uri: nft.image }}
                    style={styles.image}
                    onLoad={() => setImageLoaded(true)}
                />
            </View>

            <Text style={styles.name} numberOfLines={1}>{nft.name}</Text>
            <Text style={styles.qty}>Qty: {nft.quantity || 1}</Text>

            {nft.onSale && nft.price ? (
                <View style={styles.priceWrapper}>
                    {nft.icon && (
                        <Image source={{ uri: nft.icon }} style={styles.priceIcon} />
                    )}
                    <Text style={styles.priceText}>{nft.price}</Text>
                </View>
            ) : (
                <Text style={styles.notForSale}>Not for Sale</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: cardSize,
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 10,
        margin: 5,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f1f1f1',
        position: 'relative',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    qty: {
        fontSize: 12,
        color: '#555',
        marginBottom: 6,
    },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6f4ea',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    priceText: {
        fontSize: 13,
        color: '#2e7d32',
        fontWeight: '500',
    },
    priceIcon: {
        width: 14,
        height: 14,
        marginRight: 5,
    },
    notForSale: {
        fontSize: 12,
        color: '#b71c1c',
        backgroundColor: '#fdecea',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
});

export default NFTCard;
