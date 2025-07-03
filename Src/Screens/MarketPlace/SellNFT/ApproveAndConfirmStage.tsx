import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface ApproveAndConfirmStageProps {
  variant: 'buy' | 'sell';
  isApproved: boolean;
  isApproving: boolean;
  isConfirming: boolean;
  handleApprove: () => void;
  handleConfirm: () => void;
}

const ApproveAndConfirmStage: React.FC<ApproveAndConfirmStageProps> = ({
  variant,
  isApproved,
  isApproving,
  isConfirming,
  handleApprove,
  handleConfirm,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Transaction</Text>
        <Text style={styles.subtitle}>
          Follow these steps to {variant === 'buy' ? 'purchase' : 'list'} your
          Certificate
        </Text>
      </View>

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {/* Step 1 - Enable/Approve */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepNumber,
                isApproved ? styles.stepCompleted : styles.stepActive,
              ]}>
              {isApproved ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.stepNumberText}>1</Text>
              )}
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[styles.stepTitle, isApproved && styles.completedText]}>
                {isApproved ? 'Approved' : 'Approve Contract'}
              </Text>
              <Text style={styles.stepDescription}>
                {variant === 'buy'
                  ? 'Allow the marketplace to spend your USDC tokens'
                  : 'Allow the marketplace to manage your Certificate'}
              </Text>
            </View>
          </View>

          {!isApproved && (
            <View style={styles.stepAction}>
              {isApproving && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#81c8c3" />
                  <Text style={styles.loadingText}>Approving...</Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.approveButton,
                  isApproving && styles.buttonDisabled,
                ]}
                onPress={handleApprove}
                disabled={isApproving}>
                <Text style={styles.actionButtonText}>
                  {isApproving ? 'Approving...' : 'Approve'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isApproved && (
            <View style={styles.completedIndicator}>
              <Text style={styles.completedText}>
                ✓ Contract approved successfully
              </Text>
            </View>
          )}
        </View>

        {/* Step 2 - Confirm */}
        <View style={[styles.stepCard, !isApproved && styles.disabledCard]}>
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepNumber,
                !isApproved ? styles.stepDisabled : styles.stepActive,
              ]}>
              <Text
                style={[
                  styles.stepNumberText,
                  !isApproved && styles.disabledText,
                ]}>
                2
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[styles.stepTitle, !isApproved && styles.disabledText]}>
                Confirm Transaction
              </Text>
              <Text
                style={[
                  styles.stepDescription,
                  !isApproved && styles.disabledText,
                ]}>
                {variant === 'buy'
                  ? 'Confirm the purchase in your wallet'
                  : 'Confirm listing your Certificate on the marketplace'}
              </Text>
            </View>
          </View>

          <View style={styles.stepAction}>
            {isConfirming && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#81c8c3" />
                <Text style={styles.loadingText}>
                  Processing transaction...
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                (!isApproved || isConfirming) && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!isApproved || isConfirming}>
              <Text style={styles.actionButtonText}>
                {isConfirming ? 'Confirming...' : 'Confirm Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔐 Safe & Secure</Text>
          <Text style={styles.infoText}>
            All transactions are processed on the blockchain. You maintain full
            control and can cancel at any time before confirmation.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            Make sure you have enough ETH in your wallet to cover gas fees for
            both transactions.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledCard: {
    opacity: 0.6,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepActive: {
    backgroundColor: '#81c8c3',
  },
  stepCompleted: {
    backgroundColor: '#27ae60',
  },
  stepDisabled: {
    backgroundColor: '#e0e0e0',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledText: {
    color: '#999',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  completedText: {
    color: '#27ae60',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepAction: {
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#81c8c3',
  },
  confirmButton: {
    backgroundColor: '#2d3748',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completedIndicator: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#81c8c3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
});

export default ApproveAndConfirmStage;
