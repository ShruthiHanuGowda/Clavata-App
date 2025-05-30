import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const ApproveAndConfirmStage = ({
  isApproved,
  isApproving,
  isConfirming,
  handleApprove,
  handleConfirm,
}) => {
  return (
    <View>
      {!isApproved && (
        <>
          <Text style={styles.status}>Approval Required</Text>
          <TouchableOpacity style={styles.button} onPress={handleApprove}>
            <Text style={styles.buttonText}>
              {isApproving ? 'Approving...' : 'Approve'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {isApproved && (
        <>
          <Text style={styles.status}>Ready to Confirm</Text>
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>
              {isConfirming ? 'Confirming...' : 'Confirm Purchase'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  status: {
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#81c8c3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default ApproveAndConfirmStage;
