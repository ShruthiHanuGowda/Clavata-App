import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native';
import { NFT_DEFAULT_IMAGE_URL } from '../../../constants';

interface ConfirmStageProps {
    isConfirming: boolean;
    handleConfirm: () => void;
    nftToBuy: {
        image?: {
            thumbnail: string;
        };
        collectionName?: string;
        name?: string;
        tokenId?: string;
    };
    quantity: number;
    nftPrice: number;
    paymentCurrency: string;
}

const ConfirmStage: React.FC<ConfirmStageProps> = ({
    isConfirming,
    handleConfirm,
    nftToBuy,
    quantity,
    nftPrice,
    paymentCurrency,
}) => {
    const feePercentage = 0.025;
    const totalPayment = nftPrice * (1 + feePercentage) * quantity;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Final Confirmation</Text>
                <Text style={styles.subtitle}>
                    Please review your purchase details one last time
                </Text>
            </View>

            {/* Purchase Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.nftInfo}>
                    <Image
                        source={{
                            uri:
                                nftToBuy?.image?.thumbnail ||
                                NFT_DEFAULT_IMAGE_URL,
                        }}
                        style={styles.nftImage}
                    />
                    <View style={styles.nftDetails}>
                        <Text style={styles.nftName}>{nftToBuy?.name || 'NFT Name'}</Text>
                        <Text style={styles.collectionName}>
                            {nftToBuy?.collectionName || 'Collection Name'}
                        </Text>
                        <Text style={styles.tokenId}>
                            Token ID: {nftToBuy?.tokenId || 'Token ID'}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.priceDetails}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Quantity</Text>
                        <Text style={styles.priceValue}>{quantity}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Price per item</Text>
                        <Text style={styles.priceValue}>
                            {nftPrice} {paymentCurrency}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Platform fee (2.5%)</Text>
                        <Text style={styles.priceValue}>
                            {(nftPrice * quantity * feePercentage).toFixed(2)} {paymentCurrency}
                        </Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>
                            {totalPayment.toFixed(2)} {paymentCurrency}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Status Section */}
            <View style={styles.statusSection}>
                {isConfirming ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#81c8c3" />
                        <Text style={styles.loadingTitle}>Processing Transaction</Text>
                        <Text style={styles.loadingText}>
                            Please confirm the transaction in your wallet...
                        </Text>
                        <Text style={styles.loadingNote}>
                            This may take a few moments. Do not close this screen.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.readyContainer}>
                        <Text style={styles.readyIcon}>🚀</Text>
                        <Text style={styles.readyTitle}>Ready to Purchase</Text>
                        <Text style={styles.readyText}>
                            Click the button below to complete your NFT purchase
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Button */}
            {!isConfirming && (
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
                </TouchableOpacity>
            )}

            {/* Security Notice */}
            <View style={styles.securityNotice}>
                <Text style={styles.securityTitle}>🔒 Secure Transaction</Text>
                <Text style={styles.securityText}>
                    Your transaction is secured by blockchain technology. Once confirmed,
                    the NFT will be transferred directly to your wallet.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    nftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    nftImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginRight: 16,
    },
    nftDetails: {
        flex: 1,
    },
    nftName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    collectionName: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 4,
    },
    tokenId: {
        fontSize: 12,
        color: '#adb5bd',
    },
    divider: {
        height: 1,
        backgroundColor: '#e9ecef',
        marginBottom: 16,
    },
    priceDetails: {
        marginBottom: 8,
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
        fontWeight: '700',
        color: '#212529',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#81c8c3',
    },
    statusSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    loadingTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginTop: 16,
        marginBottom: 8,
    },
    loadingText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 8,
    },
    loadingNote: {
        fontSize: 12,
        color: '#adb5bd',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    readyContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    readyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    readyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 8,
    },
    readyText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
    },
    confirmButton: {
        backgroundColor: '#81c8c3',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#81c8c3',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    securityNotice: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#28a745',
    },
    securityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#155724',
        marginBottom: 8,
    },
    securityText: {
        fontSize: 12,
        color: '#155724',
        lineHeight: 16,
    },
});

export default ConfirmStage;