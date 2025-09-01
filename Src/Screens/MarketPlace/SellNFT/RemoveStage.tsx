import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RemoveStageProps {
    continueToNextStage: () => void;
}

const RemoveStage: React.FC<RemoveStageProps> = ({ continueToNextStage }) => {
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.title}>Remove from Marketplace</Text>
                <Text style={styles.subtitle}>
                    Cancel your listing and return the NFT to your wallet
                </Text>
            </View>

            {/* Icon Section */}
            <View style={styles.iconSection}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🗑️</Text>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
                <Text style={styles.contentTitle}>What happens when you remove?</Text>

                <View style={styles.bulletPoints}>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletIcon}>•</Text>
                        <Text style={styles.bulletText}>
                            Your Certificate will be removed from the marketplace immediately
                        </Text>
                    </View>

                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletIcon}>•</Text>
                        <Text style={styles.bulletText}>
                            The Certificate will be returned to your wallet
                        </Text>
                    </View>

                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletIcon}>•</Text>
                        <Text style={styles.bulletText}>
                            You can re-list it anytime later
                        </Text>
                    </View>

                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletIcon}>•</Text>
                        <Text style={styles.bulletText}>
                            No fees are charged for removing a listing
                        </Text>
                    </View>
                </View>
            </View>

            {/* Warning Section */}
            <View style={styles.warningSection}>
                <View style={styles.warningCard}>
                    <Text style={styles.warningTitle}>⚠️ Please Note</Text>
                    <Text style={styles.warningText}>
                        This action will require a blockchain transaction to remove your listing.
                        Make sure you have enough ETH to cover gas fees.
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={continueToNextStage}>
                    <Text style={styles.confirmButtonText}>Continue to Remove</Text>
                </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                    Need help? Contact our support team if you're experiencing any issues
                    with your listing.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    iconSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffebee',
    },
    icon: {
        fontSize: 36,
    },
    contentSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    bulletPoints: {
        gap: 12,
    },
    bulletPoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletIcon: {
        fontSize: 16,
        color: '#81c8c3',
        marginRight: 12,
        marginTop: 2,
        fontWeight: 'bold',
    },
    bulletText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        flex: 1,
    },
    warningSection: {
        marginBottom: 24,
    },
    warningCard: {
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    warningText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    actionContainer: {
        gap: 12,
        marginBottom: 20,
    },
    confirmButton: {
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    infoSection: {
        paddingHorizontal: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default RemoveStage;
