import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Linking} from 'react-native';
import {getBlockExploreLink} from '../../../utils/explorer';
import LottieView from 'lottie-react-native';
import {Animation} from '../../../Theme';
import {useSuccessSound} from '../../../hooks/useSuccessSound';

interface TransactionConfirmedProps {
  txHash: string;
  onDismiss: () => void;
  title?: string;
  message?: string;
  successType?: 'sale' | 'transfer' | 'removal' | 'listing';
}

const TransactionConfirmed: React.FC<TransactionConfirmedProps> = ({
  txHash,
  onDismiss,
  title,
  message,
  successType = 'listing',
}) => {
  const {
    playSuccessSound,
    isLoaded: soundLoaded,
    error: soundError,
  } = useSuccessSound();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (soundLoaded) {
        console.log('Playing success sound...');
        playSuccessSound();
      } else {
        console.log(
          'Sound not loaded yet, isLoaded:',
          soundLoaded,
          'error:',
          soundError,
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [soundLoaded, soundError]);

  const getSuccessContent = () => {
    switch (successType) {
      case 'sale':
        return {
          icon: '🎉',
          title: title || 'Sale Completed!',
          message: message || 'Your Certificate has been successfully sold.',
          buttonText: 'Continue',
        };
      case 'transfer':
        return {
          icon: '📤',
          title: title || 'Transfer Completed!',
          message:
            message || 'Your Certificate has been successfully transferred.',
          buttonText: 'Done',
        };
      case 'removal':
        return {
          icon: '✅',
          title: title || 'Listing Removed!',
          message:
            message || 'Your Certificate has been returned to your wallet.',
          buttonText: 'Done',
        };
      default:
        return {
          icon: '🎊',
          title: title || 'Listed Successfully!',
          message:
            message || 'Your Certificate is now available on the marketplace.',
          buttonText: 'Done',
        };
    }
  };

  const content = getSuccessContent();

  const openExplorer = () => {
    const url = getBlockExploreLink(txHash, 'transaction');
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Success Animation Section */}
      <View style={styles.successSection}>
        {/* <View style={styles.iconContainer}>
                    <Text style={styles.successIcon}>{content.icon}</Text>
                </View> */}
        <View>
          <LottieView
            source={Animation.transferSuccessAnimation}
            autoPlay
            duration={1000}
            loop={false}
            style={styles.successAnimation}
            speed={2}
          />
        </View>
        <Text style={styles.successTitle}>{content.title}</Text>
        <Text style={styles.successMessage}>{content.message}</Text>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Transaction Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Hash:</Text>
            <TouchableOpacity
              onPress={openExplorer}
              style={styles.hashContainer}>
              <Text style={styles.hashText}>
                {`${txHash.slice(0, 6)}...${txHash.slice(-4)}`}
              </Text>
              <Text style={styles.viewIcon}>🔗</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network:</Text>
            <Text style={styles.detailValue}>D.Energy</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.etherscanButton} onPress={openExplorer}>
          <Text style={styles.etherscanButtonText}>View on Explorer →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneButton} onPress={onDismiss}>
          <Text style={styles.doneButtonText}>{content.buttonText}</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>✨ What's Next?</Text>
          {successType === 'listing' && (
            <>
              <Text style={styles.infoText}>
                • Your Certificate is now live on the marketplace
              </Text>
              <Text style={styles.infoText}>
                • Buyers can discover and purchase it
              </Text>
              <Text style={styles.infoText}>
                • You'll be notified when it sells
              </Text>
              <Text style={styles.infoText}>
                • You can adjust the price anytime
              </Text>
            </>
          )}
          {successType === 'transfer' && (
            <>
              <Text style={styles.infoText}>
                • The NFT has been sent to the destination wallet
              </Text>
              <Text style={styles.infoText}>
                • This action cannot be reversed
              </Text>
              <Text style={styles.infoText}>
                • The new owner has full control
              </Text>
            </>
          )}
          {successType === 'removal' && (
            <>
              <Text style={styles.infoText}>
                • Your Certificate is back in your wallet
              </Text>
              <Text style={styles.infoText}>• You can re-list it anytime</Text>
              <Text style={styles.infoText}>
                • No marketplace fees were charged
              </Text>
            </>
          )}
          {successType === 'sale' && (
            <>
              <Text style={styles.infoText}>• Payment has been processed</Text>
              <Text style={styles.infoText}>
                • USDC has been sent to your wallet
              </Text>
              <Text style={styles.infoText}>
                • The NFT has been transferred to the buyer
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successAnimation: {
    width: 80,
    height: 80,
  },
  //   iconContainer: {
  //     width: 100,
  //     height: 100,
  //     borderRadius: 50,
  //     backgroundColor: '#f0f8ff',
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     marginBottom: 20,
  //     borderWidth: 3,
  //     borderColor: '#81c8c3',
  //   },
  //   successIcon: {
  //     fontSize: 48,
  //   },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hashText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#1a1a1a',
    marginRight: 4,
  },
  viewIcon: {
    fontSize: 12,
  },
  actionSection: {
    gap: 12,
    marginBottom: 24,
  },
  etherscanButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#81c8c3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  etherscanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#81c8c3',
  },
  doneButton: {
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
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoSection: {
    marginBottom: 20,
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default TransactionConfirmed;
