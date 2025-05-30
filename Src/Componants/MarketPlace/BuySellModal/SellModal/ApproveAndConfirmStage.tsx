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
      {/* Step 1 - Enable */}
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepCircle, isApproved && styles.stepSuccess]}>
            <Text style={[styles.stepText, isApproved && styles.invertedText]}>
              1
            </Text>
          </View>
          <Text
            style={[
              styles.stepTitle,
              isApproved ? styles.successText : styles.secondaryText,
            ]}>
            {isApproved ? 'Enabled' : 'Enable'}
          </Text>
        </View>
        {!isApproved && (
          <Text style={styles.description}>
            {variant === 'buy'
              ? 'Please enable USDC spending in your wallet'
              : 'Please enable your NFT to be sent to the market'}
          </Text>
        )}
      </View>

      {isApproving && (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#81c8c3" />
        </View>
      )}

      {!isApproved && (
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            isApproving && styles.disabledButton,
          ]}
          onPress={handleApprove}
          disabled={isApproving}>
          <Text style={styles.buttonText}>
            {isApproving ? `${'Enabling'}...` : 'Enable'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Step 2 - Confirm */}
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View
            style={[
              styles.stepCircle,
              isApproved ? styles.stepActive : styles.stepDisabled,
            ]}>
            <Text
              style={[
                styles.stepText,
                !isApproved ? styles.disabledText : styles.invertedText,
              ]}>
              2
            </Text>
          </View>
          <Text
            style={[
              styles.stepTitle,
              isApproved ? styles.secondaryText : styles.disabledText,
            ]}>
            Confirm
          </Text>
        </View>
        <Text style={[styles.description, !isApproved && styles.disabledText]}>
          Please confirm the transaction in your wallet
        </Text>
      </View>

      {isConfirming && (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#81c8c3" />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          styles.primaryButton,
          (!isApproved || isConfirming) && styles.disabledButton,
        ]}
        onPress={handleConfirm}
        disabled={!isApproved || isConfirming}>
        <Text style={styles.buttonText}>
          {isConfirming ? 'Confirming' : 'Confirm'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'column',
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#81c8c3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepSuccess: {
    backgroundColor: '#81c8c3',
  },
  stepActive: {
    backgroundColor: '#81c8c3',
  },
  stepDisabled: {
    backgroundColor: '#e0e0e0',
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  invertedText: {
    color: '#fff',
  },
  disabledText: {
    color: '#a0a0a0',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    color: '#81c8c3',
  },
  secondaryText: {
    color: '#6c757d',
  },
  description: {
    marginTop: 8,
    color: '#777',
    maxWidth: 275,
    fontSize: 14,
  },
  spinnerContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#81c8c3',
  },
  primaryButton: {
    backgroundColor: '#81c8c3',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ApproveAndConfirmStage;
