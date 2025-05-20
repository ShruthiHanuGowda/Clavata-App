import React from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {fontsFamily} from '../../../Theme';

export const OffsetModal = ({
  visible,
  onClose,
  isLoadingOffset,
  redemptionUrl,
  value,
  setValue,
  handleViewCertificate,
  handleDownloadCertificate,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Title */}
          <Text style={styles.modalTitle}>
            {redemptionUrl ? 'Certificate Actions' : 'Enter Volume to Offset'}
          </Text>

          {!redemptionUrl && (
            <>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={value}
                onChangeText={setValue}
                placeholder="Enter volume"
                placeholderTextColor="#aaa"
              />

              {isLoadingOffset ? (
                <ActivityIndicator
                  size="large"
                  color="#009D94"
                  style={styles.loadingSpinner}
                />
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => onSubmit(value)}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {redemptionUrl && (
            <View style={styles.certificateContainer}>
              <TouchableOpacity
                onPress={handleViewCertificate}
                style={styles.certificateButton}>
                <Text style={styles.certificateButtonText}>
                  View Certificate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownloadCertificate}
                style={styles.certificateButton}>
                <Text style={styles.certificateButtonText}>
                  Download Certificate
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    fontFamily: fontsFamily.MulishExtraBold,
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 30,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    color: '#333',
  },
  loadingSpinner: {
    marginTop: 20,
  },
  submitButton: {
    width: '48%',
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: '#009D94',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  certificateContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  certificateButton: {
    paddingVertical: 18,
    borderRadius: 25,
    backgroundColor: '#009D94',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  certificateButtonText: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 18,
    color: '#fff',
  },
  closeButton: {
    marginTop: 25,
    paddingVertical: 12,
    backgroundColor: '#f44336',
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
