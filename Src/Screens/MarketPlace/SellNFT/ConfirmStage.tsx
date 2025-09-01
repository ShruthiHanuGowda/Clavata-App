import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';

interface ConfirmStageProps {
    isConfirming: boolean;
    handleConfirm: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

const ConfirmStage: React.FC<ConfirmStageProps> = ({
    isConfirming,
    handleConfirm,
    title = 'Confirm Transaction',
    description = 'Please review and confirm your transaction',
    buttonText = 'Confirm',
}) => {
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{description}</Text>
            </View>

            {/* Status Section */}
            <View style={styles.statusSection}>
                {isConfirming ? (
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingIcon}>
                            <ActivityIndicator size="large" color="#81c8c3" />
                        </View>
                        <Text style={styles.loadingTitle}>Processing Transaction</Text>
                        <Text style={styles.loadingText}>
                            Please wait while your transaction is being processed on the blockchain.
                            This may take a few moments.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.readyContainer}>
                        <View style={styles.readyIcon}>
                            <Text style={styles.readyIconText}>✓</Text>
                        </View>
                        <Text style={styles.readyTitle}>Ready to Confirm</Text>
                        <Text style={styles.readyText}>
                            Everything looks good! Tap the button below to confirm your transaction.
                        </Text>
                    </View>
                )}
            </View>


            {/* Warning Section */}
            {!isConfirming && (
                <View style={styles.warningSection}>
                    <View style={styles.warningCard}>
                        <Text style={styles.warningTitle}>⚠️ Important</Text>
                        <Text style={styles.warningText}>
                            • Make sure you have enough ETH for gas fees
                        </Text>
                        <Text style={styles.warningText}>
                            • This transaction cannot be reversed once confirmed
                        </Text>
                        <Text style={styles.warningText}>
                            • Keep your wallet app open during the process
                        </Text>
                    </View>
                </View>
            )}

            {/* Action Button */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        isConfirming && styles.buttonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={isConfirming}>
                    {isConfirming ? (
                        <View style={styles.buttonContent}>
                            <ActivityIndicator size="small" color="#fff" style={styles.buttonSpinner} />
                            <Text style={styles.confirmButtonText}>Processing...</Text>
                        </View>
                    ) : (
                        <Text style={styles.confirmButtonText}>{buttonText}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Progress Indicator */}
            {isConfirming && (
                <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                        <View style={styles.progressFill} />
                    </View>
                    <Text style={styles.progressText}>
                        Step 2 of 2: Confirming transaction...
                    </Text>
                </View>
            )}

            {/* Help Section */}
            <View style={styles.helpSection}>
                <Text style={styles.helpText}>
                    {isConfirming
                        ? 'If this is taking longer than expected, check your wallet app for any pending approvals.'
                        : 'Need help? Make sure your wallet is connected and you have sufficient balance for gas fees.'
                    }
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
    statusSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    loadingText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    readyContainer: {
        alignItems: 'center',
    },
    readyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#81c8c3',
    },
    readyIconText: {
        fontSize: 32,
        color: '#81c8c3',
        fontWeight: 'bold',
    },
    readyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    readyText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    detailsSection: {
        marginBottom: 24,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
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
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 4,
    },
    actionContainer: {
        marginBottom: 20,
    },
    confirmButton: {
        backgroundColor: '#81c8c3',
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
    buttonDisabled: {
        backgroundColor: '#ccc',
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonSpinner: {
        marginRight: 8,
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    progressSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        width: '100%',
        height: '100%',
        backgroundColor: '#81c8c3',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    helpSection: {
        paddingHorizontal: 4,
    },
    helpText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default ConfirmStage;
