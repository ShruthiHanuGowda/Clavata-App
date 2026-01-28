import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {formatEther} from 'ethers';

interface TransactionDetails {
  to?: string;
  from?: string;
  value?: string;
  data?: string;
  gas?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

interface SpendingCapRequestModalProps {
  visible: boolean;
  request: any;
  accountAddress: string;
  networkName: string;
  networkSymbol: string;
  dappMetadata?: {
    name?: string;
    url?: string;
    icons?: string[];
  };
  onApprove: () => Promise<void>;
  onReject: () => void;
}

const SpendingCapRequestModal: React.FC<SpendingCapRequestModalProps> = ({
  visible,
  request,
  accountAddress,
  networkName,
  networkSymbol,
  dappMetadata,
  onApprove,
  onReject,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!request) return null;

  const {params} = request;
  const method = params?.request?.method || 'Unknown';
  const txParams: TransactionDetails = params?.request?.params?.[0] || {};

  // Parse transaction details
  const getSpendingCapDetails = () => {
    // Check if this is a token approval transaction
    if (txParams.data && txParams.data.startsWith('0x095ea7b3')) {
      // This is an ERC20 approve function call
      const spenderAddress = '0x' + txParams.data.slice(34, 74);
      const amount = txParams.data.slice(74);

      // Check if it's unlimited approval (max uint256)
      const isUnlimited = amount === 'f'.repeat(64);

      return {
        isApproval: true,
        spender: spenderAddress,
        amount: isUnlimited ? 'Unlimited' : '1',
        tokenContract: txParams.to,
      };
    }

    return {
      isApproval: false,
      value: txParams.value || '0x0',
    };
  };

  const spendingDetails = getSpendingCapDetails();

  // Calculate network fee
  const getNetworkFee = () => {
    try {
      const gasLimit = txParams.gas || txParams.gasLimit || '0x5208'; // Default 21000
      const gasPrice = txParams.gasPrice || txParams.maxFeePerGas || '0x3b9aca00'; // Default 1 gwei

      const gasBigInt = BigInt(gasLimit);
      const priceBigInt = BigInt(gasPrice);
      const totalWei = gasBigInt * priceBigInt;

      const feeInEth = formatEther(totalWei);
      return parseFloat(feeInEth).toFixed(6);
    } catch (error) {
      return '0.0001';
    }
  };

  const networkFee = getNetworkFee();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove();
      setIsSuccess(true);
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setIsApproving(false);
      // Error is handled by parent
    }
  };

  const handleClose = () => {
    setIsApproving(false);
    setIsSuccess(false);
  };

  const getMethodTitle = () => {
    if (spendingDetails.isApproval) {
      return 'Spending cap request';
    }
    switch (method) {
      case 'eth_sendTransaction':
        return 'Transaction request';
      case 'personal_sign':
      case 'eth_sign':
        return 'Signature request';
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4':
        return 'Sign typed data';
      default:
        return 'Request';
    }
  };

  const getMethodDescription = () => {
    if (spendingDetails.isApproval) {
      return 'This site wants permission to spend your tokens.';
    }
    return 'This site wants to perform a transaction.';
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {!isSuccess && (
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onReject}
              disabled={isApproving}>
              <Icon name="cross" size={24} color="#666" />
            </TouchableOpacity>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {isSuccess ? (
              // Success State
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={64}
                    color="#28a745"
                  />
                </View>
                <Text style={styles.successTitle}>Transaction Approved!</Text>
                <Text style={styles.successDescription}>
                  Your transaction has been submitted successfully
                </Text>
              </View>
            ) : (
              <>
                {/* Header */}
                <Text style={styles.modalTitle}>{getMethodTitle()}</Text>
                <Text style={styles.modalDescription}>
                  {getMethodDescription()}
                </Text>

                {/* Account Section */}
                <View style={styles.section}>
                  <View style={styles.accountCard}>
                    <View style={styles.accountHeader}>
                      <View style={styles.accountIcon}>
                        <MaterialCommunityIcons
                          name="wallet"
                          size={20}
                          color="#009D94"
                        />
                      </View>
                      <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>Account 1</Text>
                        <TouchableOpacity>
                          <Feather name="chevron-right" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Estimated Changes Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Estimated changes</Text>
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={18}
                      color="#666"
                    />
                  </View>

                  {spendingDetails.isApproval ? (
                    <View style={styles.changeCard}>
                      <View style={styles.changeHeader}>
                        <Text style={styles.changeLabel}>Spending cap</Text>
                        <TouchableOpacity>
                          <Feather name="edit-2" size={16} color="#009D94" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.spendingCapRow}>
                        <View style={styles.tokenIcon}>
                          <MaterialCommunityIcons
                            name="ethereum"
                            size={24}
                            color="#009D94"
                          />
                        </View>
                        <Text style={styles.spendingCapAmount}>
                          {spendingDetails.amount}
                        </Text>
                        <Text style={styles.spendingCapToken}>
                          {formatAddress(spendingDetails.tokenContract || '')}
                        </Text>
                      </View>
                      <View style={styles.spenderRow}>
                        <Text style={styles.spenderLabel}>Spender</Text>
                        <View style={styles.spenderAddress}>
                          <MaterialCommunityIcons
                            name="account"
                            size={16}
                            color="#666"
                          />
                          <Text style={styles.spenderAddressText}>
                            {formatAddress(txParams.from || accountAddress)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.changeCard}>
                      <Text style={styles.changeLabel}>Value</Text>
                      <Text style={styles.changeAmount}>
                        {formatEther(spendingDetails.value || '0x0')} {networkSymbol}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Network & Request From Section */}
                <View style={styles.section}>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Network</Text>
                      <View style={styles.networkBadge}>
                        <MaterialCommunityIcons
                          name="checkbox-blank-circle"
                          size={10}
                          color="#009D94"
                        />
                        <Text style={styles.networkText}>{networkName}</Text>
                      </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Request from</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {dappMetadata?.url || 'Unknown dApp'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Network Fee Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Network fee</Text>
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={18}
                      color="#666"
                    />
                  </View>
                  <View style={styles.feeCard}>
                    <View style={styles.feeRow}>
                      <TouchableOpacity>
                        <Feather name="edit-2" size={16} color="#009D94" />
                      </TouchableOpacity>
                      <View style={styles.feeAmount}>
                        <Text style={styles.feeValue}>
                          {networkFee} {networkSymbol}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.speedBadge}>
                      <MaterialCommunityIcons name="speedometer" size={16} color="#ff6b35" />
                      <Text style={styles.speedText}>Market ~ 12 sec</Text>
                    </View>
                  </View>
                </View>

                {/* Advanced Details */}
                <TouchableOpacity style={styles.advancedDetails}>
                  <Text style={styles.advancedText}>Advanced details</Text>
                  <Feather name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Action Buttons */}
          {!isSuccess && (
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onReject}
                disabled={isApproving}>
                <Text
                  style={[
                    styles.cancelButtonText,
                    isApproving && styles.disabledText,
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  isApproving && styles.confirmingButton,
                ]}
                onPress={handleApprove}
                disabled={isApproving}>
                {isApproving ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.confirmButtonText}>Approving...</Text>
                  </View>
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginRight: 6,
  },
  accountCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f7f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  changeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  changeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  spendingCapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f7f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  spendingCapAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginRight: 8,
  },
  spendingCapToken: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  spenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  spenderLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  spenderAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spenderAddressText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 4,
  },
  changeAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#e0f7f6',
    borderRadius: 12,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#009D94',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  feeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeAmount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  speedText: {
    fontSize: 12,
    color: '#ff6b35',
    marginLeft: 4,
    fontWeight: '500',
  },
  advancedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  advancedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  modalButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#212529',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#adb5bd',
  },
  confirmButton: {
    backgroundColor: '#009D94',
  },
  confirmingButton: {
    backgroundColor: '#007a73',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default SpendingCapRequestModal;
