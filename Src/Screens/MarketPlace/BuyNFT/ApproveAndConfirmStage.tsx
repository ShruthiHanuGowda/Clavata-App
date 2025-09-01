import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { NFT_DEFAULT_IMAGE_URL } from '../../../constants';

interface ApproveAndConfirmStageProps {
    isApproved: boolean;
    isApproving: boolean;
    isConfirming: boolean;
    handleApprove: () => void;
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

const ApproveAndConfirmStage: React.FC<ApproveAndConfirmStageProps> = ({
    isApproved,
    isApproving,
    isConfirming,
    handleApprove,
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
            {/* Purchase Summary */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Purchase Summary</Text>
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
                        <Text style={styles.purchaseDetails}>
                            {quantity} × {nftPrice} {paymentCurrency}
                        </Text>
                    </View>
                </View>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Payment</Text>
                    <Text style={styles.totalAmount}>
                        {totalPayment.toFixed(2)} {paymentCurrency}
                    </Text>
                </View>
            </View>

            {/* Steps */}
            <View style={styles.stepsContainer}>
                {/* Step 1: Approval */}
                <View style={styles.step}>
                    <View style={[
                        styles.stepIndicator,
                        isApproved ? styles.stepCompleted : styles.stepActive,
                    ]}>
                        {isApproved ? (
                            <Text style={styles.stepIndicatorText}>✓</Text>
                        ) : (
                            <Text style={styles.stepNumber}>1</Text>
                        )}
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>
                            {isApproved ? 'Token Approved' : 'Approve Token'}
                        </Text>
                        <Text style={styles.stepDescription}>
                            {isApproved
                                ? `${paymentCurrency} spending has been approved`
                                : `Allow the marketplace to spend your ${paymentCurrency}`}
                        </Text>
                        {!isApproved && (
                            <TouchableOpacity
                                style={[styles.stepButton, isApproving && styles.disabledButton]}
                                onPress={handleApprove}
                                disabled={isApproving}>
                                {isApproving ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={styles.buttonText}>Approving...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.buttonText}>Approve {paymentCurrency}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Step 2: Confirmation */}
                <View style={styles.step}>
                    <View style={[
                        styles.stepIndicator,
                        !isApproved
                            ? styles.stepInactive
                            : isConfirming
                                ? styles.stepActive
                                : styles.stepReady,
                    ]}>
                        <Text style={styles.stepNumber}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={[
                            styles.stepTitle,
                            !isApproved && styles.inactiveText,
                        ]}>
                            Confirm Purchase
                        </Text>
                        <Text style={[
                            styles.stepDescription,
                            !isApproved && styles.inactiveText,
                        ]}>
                            Complete the NFT purchase transaction
                        </Text>
                        {isApproved && (
                            <TouchableOpacity
                                style={[styles.stepButton, isConfirming && styles.disabledButton]}
                                onPress={handleConfirm}
                                disabled={isConfirming}>
                                {isConfirming ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={styles.buttonText}>Confirming...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.buttonText}>Confirm Purchase</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Information Box */}
            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>📝 Transaction Process</Text>
                <Text style={styles.infoText}>
                    This purchase requires two transactions:{'\n'}
                    1. Approve the marketplace to spend your {paymentCurrency}{'\n'}
                    2. Complete the NFT purchase
                </Text>
                {/* <Text style={styles.infoNote}>
                    Each step will require confirmation in your wallet.
                </Text> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
    },
    summaryCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },
    nftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    nftImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    nftDetails: {
        flex: 1,
    },
    nftName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    collectionName: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    purchaseDetails: {
        fontSize: 12,
        color: '#81c8c3',
        fontWeight: '500',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#81c8c3',
    },
    stepsContainer: {
        marginBottom: 24,
    },
    step: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    stepIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    stepActive: {
        backgroundColor: '#81c8c3',
    },
    stepCompleted: {
        backgroundColor: '#28a745',
    },
    stepReady: {
        backgroundColor: '#81c8c3',
    },
    stepInactive: {
        backgroundColor: '#e9ecef',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    stepIndicatorText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 12,
    },
    inactiveText: {
        color: '#adb5bd',
    },
    stepButton: {
        backgroundColor: '#81c8c3',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    disabledButton: {
        backgroundColor: '#adb5bd',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoBox: {
        backgroundColor: '#e7f3ff',
        borderRadius: 8,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#007bff',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0056b3',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#0056b3',
        lineHeight: 18,
        marginBottom: 8,
    },
    infoNote: {
        fontSize: 12,
        color: '#6c757d',
        fontStyle: 'italic',
    },
});

export default ApproveAndConfirmStage;
