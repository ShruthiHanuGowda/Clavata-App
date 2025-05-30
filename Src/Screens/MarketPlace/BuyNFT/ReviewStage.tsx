import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { formatQuantityMWh } from '../../../utils';

interface ReviewStageProps {
    nftToBuy: {
        image?: {
            thumbnail: string;
        };
        collectionName?: string;
        name?: string;
        tokenId?: string;
    };
    paymentCurrency: string;
    setPaymentCurrency: (currency: 'USDC' | 'EURC') => void;
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    nftPrice: number;
    walletBalance: number;
    walletFetchStatus: 'loading' | 'success' | 'error';
    continueToNextStage: () => void;
    availableQuantity: number;
}

const ReviewStage: React.FC<ReviewStageProps> = ({
    nftToBuy,
    paymentCurrency,
    setPaymentCurrency,
    quantity,
    setQuantity,
    nftPrice,
    walletBalance,
    walletFetchStatus,
    continueToNextStage,
    availableQuantity,
}) => {
    const feePercentage = 0.025;
    const nftPriceWithFee = nftPrice * (1 + feePercentage);
    const totalPayment = nftPriceWithFee * quantity;
    const quantityExceeds = quantity * 1_000_000 > availableQuantity;
    const notEnoughBalance = totalPayment > walletBalance;

    const handleQuantityChange = (val: string) => {
        const number = parseInt(val.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(number) && number <= availableQuantity) {
            setQuantity(number);
        } else if (val === '') {
            setQuantity(0);
        }
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <View style={styles.nftCard}>
                <Image
                    source={{
                        uri:
                            nftToBuy?.image?.thumbnail ||
                            'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
                    }}
                    style={styles.nftImage}
                />
                <View style={styles.nftDetails}>
                    <Text style={styles.collectionName}>
                        {nftToBuy?.collectionName || 'Collection Name'}
                    </Text>
                    <Text style={styles.nftName}> {nftToBuy?.name || 'NFT Name'}</Text>
                    <Text style={styles.tokenId}>
                        Token ID: {nftToBuy?.tokenId || 'Token ID'}
                    </Text>
                    <Text style={styles.nftPrice}>
                        {nftPrice} {paymentCurrency} each
                    </Text>
                </View>
            </View>


            <View style={styles.section}>
                <Text style={styles.sectionTitle}> Payment Currency </Text>
                <View style={styles.currencySelector}>
                    <TouchableOpacity
                        style={[
                            styles.currencyOption,
                            paymentCurrency === 'USDC' && styles.currencyOptionSelected,
                        ]}
                        onPress={() => setPaymentCurrency('USDC')}>
                        <Text
                            style={[
                                styles.currencyText,
                                paymentCurrency === 'USDC' && styles.currencyTextSelected,
                            ]}>
                            USDC
                        </Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={[
                            styles.currencyOption,
                            paymentCurrency === 'EURC' && styles.currencyOptionSelected,
                        ]}
                        onPress={() => setPaymentCurrency('EURC')}>
                        <Text
                            style={[
                                styles.currencyText,
                                paymentCurrency === 'EURC' && styles.currencyTextSelected,
                            ]}>
                            EURC
                        </Text>
                    </TouchableOpacity> */}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}> Quantity </Text>
                <View style={styles.quantityContainer}>
                    <TextInput
                        style={[styles.quantityInput, quantityExceeds && styles.errorInput]}
                        keyboardType="numeric"
                        value={quantity.toString()}
                        onChangeText={handleQuantityChange}
                        placeholder="Enter quantity"
                        placeholderTextColor="#999"
                    />
                    <View style={styles.quantityInfo}>
                        <Text style={styles.availableText}>
                            Available: {formatQuantityMWh(availableQuantity)}
                        </Text>
                        {quantityExceeds && (
                            <Text style={styles.errorText}> Exceeds available quantity </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}> Price Breakdown </Text>
                <View style={styles.priceBreakdown}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}> Item Price </Text>
                        <Text style={styles.priceValue}>
                            {nftPrice} {paymentCurrency}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}> Quantity </Text>
                        <Text style={styles.priceValue}>× {quantity} </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}> Subtotal </Text>
                        <Text style={styles.priceValue}>
                            {(nftPrice * quantity).toFixed(2)} {paymentCurrency}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>
                            Platform Fee({(feePercentage * 100).toFixed(2)}%)
                        </Text>
                        <Text style={styles.priceValue}>
                            {(nftPrice * quantity * feePercentage).toFixed(2)}{' '}
                            {paymentCurrency}
                        </Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}> Total </Text>
                        <Text style={styles.totalValue}>
                            {totalPayment.toFixed(2)} {paymentCurrency}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Wallet Balance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}> Wallet Balance </Text>
                <View style={styles.balanceContainer}>
                    {walletFetchStatus !== 'success' ? (
                        <ActivityIndicator size="small" color="#81c8c3" />
                    ) : (
                        <Text
                            style={[
                                styles.balanceText,
                                notEnoughBalance && styles.errorText,
                            ]}>
                            {walletBalance.toFixed(2)} {paymentCurrency}
                        </Text>
                    )}
                    {notEnoughBalance && (
                        <Text style={styles.errorText}>
                            Insufficient balance.You need{' '}
                            {(totalPayment - walletBalance).toFixed(2)} more {paymentCurrency}
                        </Text>
                    )}
                </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                style={[
                    styles.continueButton,
                    (notEnoughBalance || !quantity || quantityExceeds) &&
                    styles.disabledButton,
                ]}
                disabled={notEnoughBalance || !quantity || quantityExceeds}
                onPress={continueToNextStage}>
                <Text style={styles.continueButtonText}> Continue to Checkout </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    nftCard: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    nftImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
    },
    nftDetails: {
        flex: 1,
    },
    collectionName: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    nftName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    tokenId: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 8,
    },
    nftPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#81c8c3',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },
    currencySelector: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 4,
    },
    currencyOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    currencyOptionSelected: {
        backgroundColor: '#81c8c3',
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
    },
    currencyTextSelected: {
        color: '#fff',
    },
    quantityContainer: {
        marginBottom: 8,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#212529',
        backgroundColor: '#fff',
    },
    errorInput: {
        borderColor: '#dc3545',
    },
    quantityInfo: {
        marginTop: 8,
    },
    availableText: {
        fontSize: 12,
        color: '#6c757d',
    },
    errorText: {
        fontSize: 12,
        color: '#dc3545',
        marginTop: 4,
    },
    priceBreakdown: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    priceValue: {
        fontSize: 14,
        color: '#212529',
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingTop: 12,
        marginTop: 8,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#81c8c3',
    },
    balanceContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    continueButton: {
        backgroundColor: '#81c8c3',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    disabledButton: {
        backgroundColor: '#e9ecef',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ReviewStage;
