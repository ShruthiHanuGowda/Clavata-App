import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  ScrollView,
} from 'react-native';
import {getBlockExploreLink} from '../../../utils/explorer';
import {NFT_DEFAULT_IMAGE_URL} from '../../../constants';
import LottieView from 'lottie-react-native';
import {Animation} from '../../../Theme';
import {useSuccessSound} from '../../../hooks/useSuccessSound';

interface TransactionConfirmedProps {
  txHash: string;
  onComplete: () => void;
  nftToBuy: {
    image?: {
      thumbnail: string;
    };
    collectionName?: string;
    name?: string;
    tokenId?: string;
  };
}

const TransactionConfirmed: React.FC<TransactionConfirmedProps> = ({
  txHash,
  onComplete,
  nftToBuy,
}) => {
  const openExplorer = () => {
    const url = getBlockExploreLink(txHash, 'transaction');
    Linking.openURL(url);
  };

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Success Animation/Icon */}
      <View style={styles.successContainer}>
        <View>
          {/* <Text style={styles.checkmark}>✓</Text> */}
          <LottieView
            source={Animation.transferSuccessAnimation}
            autoPlay
            duration={1000}
            loop={false}
            style={styles.successAnimation}
            speed={2}
          />
        </View>

        <Text style={styles.successTitle}>Purchase Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your Certificate has been successfully transferred to your wallet
        </Text>
      </View>

      {/* NFT Details Card */}
      <View style={styles.nftCard}>
        <Text style={styles.cardTitle}>You now own</Text>
        <View style={styles.nftInfo}>
          <Image
            source={{
              uri: nftToBuy?.image?.thumbnail || NFT_DEFAULT_IMAGE_URL,
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
      </View>

      {/* Transaction Details */}
      <View style={styles.transactionCard}>
        <Text style={styles.cardTitle}>Transaction Details</Text>
        <View style={styles.txInfo}>
          <Text style={styles.txLabel}>Transaction Hash</Text>
          <TouchableOpacity
            onPress={openExplorer}
            style={styles.txHashContainer}>
            <Text style={styles.txHash} numberOfLines={1}>
              {txHash}
            </Text>
            <Text style={styles.viewText}>View on Explorer →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.nextStepsCard}>
        <Text style={styles.cardTitle}>What's Next?</Text>
        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>👛</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Check Your Wallet</Text>
              <Text style={styles.stepDescription}>
                Your Certificate is now available in your wallet
              </Text>
            </View>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>🎨</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>View in Collection</Text>
              <Text style={styles.stepDescription}>
                Browse your Certificate collection and discover more
              </Text>
            </View>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>🔄</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Trade or Transfer</Text>
              <Text style={styles.stepDescription}>
                List for sale or transfer to another wallet
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={openExplorer}>
          <Text style={styles.secondaryButtonText}>View Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={onComplete}>
          <Text style={styles.primaryButtonText}>Continue Exploring</Text>
        </TouchableOpacity>
      </View>

      {/* Celebration Message */}
      <View style={styles.celebrationCard}>
        <Text style={styles.celebrationIcon}>🎉</Text>
        <Text style={styles.celebrationText}>
          Congratulations on your new NFT! Welcome to the world of digital
          ownership.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successAnimation: {
    width: 80,
    height: 80,
  },
  checkmark: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  nftCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  nftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  txInfo: {
    marginTop: 8,
  },
  txLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  txHashContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  txHash: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#495057',
    marginBottom: 4,
  },
  viewText: {
    fontSize: 12,
    color: '#81c8c3',
    fontWeight: '600',
  },
  nextStepsCard: {
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
  stepsList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#81c8c3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#81c8c3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  secondaryButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
  celebrationCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  celebrationIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TransactionConfirmed;
