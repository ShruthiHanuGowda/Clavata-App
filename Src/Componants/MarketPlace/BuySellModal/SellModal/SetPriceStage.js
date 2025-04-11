import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';

const MIN_PRICE = 0.01;
const MAX_PRICE = 10000;

const SetPriceStage = ({
    nftToSell,
    variant,
    currentPrice,
    price,
    setPrice,
    quantity,
    setQuantity,
    continueToNextStage,
}) => {
    const inputRef = useRef(null);
    const adjustedPriceIsTheSame = variant === 'adjust' && currentPrice && currentPrice === parseFloat(price);
    const priceIsValid = !price || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0;
    const qtyIsValid = !quantity || Number.isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0;
    const priceAsFloat = parseFloat(price);
    const priceIsOutOfRange = priceAsFloat > MAX_PRICE || priceAsFloat < MIN_PRICE;

    const enforcer = (nextUserInput) => {
        if (nextUserInput === '' || /^[0-9]*(?:[.])?[0-9]*$/.test(nextUserInput)) {
            setPrice(nextUserInput);
        }
    };

    const enforcerQty = (nextUserInput) => {
        if (nextUserInput === '' || /^[0-9]*(?:[.])?[0-9]*$/.test(nextUserInput)) {
            setQuantity(nextUserInput);
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    const getButtonText = () => {
        if (variant === 'adjust') {
            if (adjustedPriceIsTheSame || priceIsValid) {
                return 'Input New Sale Price';
            }
            return 'Confirm';
        }
        return 'Enable Listing';
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* NFT Header */}
            <View style={styles.nftInfo}>
                <Image
                    source={{
                        uri: nftToSell?.image?.thumbnail || 'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
                    }}
                    style={styles.nftImage}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.nftName}>{nftToSell?.name}</Text>
                    <Text style={styles.collectionName}>{nftToSell?.collectionName}</Text>
                </View>
            </View>

            {/* Price Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Set Price (USDC)</Text>
                <TextInput
                    style={[styles.input, priceIsOutOfRange && styles.inputError]}
                    ref={inputRef}
                    value={price}
                    onChangeText={enforcer}
                    keyboardType="numeric"
                    placeholder="Enter price"
                />
                {priceIsOutOfRange && (
                    <Text style={styles.errorText}>
                        Allowed price range is between {MIN_PRICE} and {MAX_PRICE} USDC
                    </Text>
                )}
            </View>

            {/* Quantity Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantity to sell</Text>
                <TextInput
                    style={[styles.input, qtyIsValid && styles.inputError]}
                    value={quantity}
                    onChangeText={enforcerQty}
                    keyboardType="numeric"
                    placeholder="Enter quantity"
                />
                {qtyIsValid && (
                    <Text style={styles.errorText}>Quantity must be greater than 0</Text>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.button, (priceIsValid || adjustedPriceIsTheSame || priceIsOutOfRange || qtyIsValid) && styles.buttonDisabled]}
                    onPress={continueToNextStage}
                    disabled={priceIsValid || adjustedPriceIsTheSame || priceIsOutOfRange || qtyIsValid}
                >
                    <Text style={styles.buttonText}>{getButtonText()}</Text>
                </TouchableOpacity>
            </View>

            {/* Additional Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    The NFT will be removed from your wallet and put on sale at this price.
                </Text>
                <Text style={styles.infoText}>
                    Sales are in USDC. You can swap USDC to BNB 1:1 for free with PancakeSwap.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    nftInfo: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    nftImage: {
        width: 68,
        height: 68,
        borderRadius: 10,
        marginRight: 12,
    },
    nftName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    collectionName: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        fontSize: 12,
        color: 'red',
        marginTop: 4,
    },
    actionContainer: {
        marginTop: 16,
    },
    button: {
        backgroundColor: '#008060',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    infoContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    infoText: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 8,
    },
});

export default SetPriceStage;
