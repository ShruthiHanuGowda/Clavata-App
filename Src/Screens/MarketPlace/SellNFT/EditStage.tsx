import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NFT_DEFAULT_IMAGE_URL } from '../../../constants';
import images from '../../../Theme/images';
import { parseUnits } from 'ethers';

interface EditStageProps {
  nftToSell: {
    name: string;
    collectionName: string;
    image: { thumbnail: string };
    collectionAddress: string;
    tokenId: string;
  };
  currentPrice: number | null;
  lowestPrice: number | null;
  continueToAdjustPriceStage: () => void;
  continueToRemoveFromMarketStage: () => void;
}

const EditStage: React.FC<EditStageProps> = ({
  nftToSell,
  currentPrice,
  lowestPrice,
  continueToAdjustPriceStage,
  continueToRemoveFromMarketStage,
}) => {
  const imageUrl = nftToSell?.image?.thumbnail || NFT_DEFAULT_IMAGE_URL;
  const displayCurrentPrice = parseUnits(currentPrice?.toString() || '0', 6);
  const displayLowestPrice = parseUnits(lowestPrice?.toString() || '0', 6);

  return (
    <View style={styles.container}>
      {/* NFT Card */}
      <View style={styles.nftCard}>
        <Image source={{ uri: imageUrl }} style={styles.nftImage} />
        <View style={styles.nftDetails}>
          <Text style={styles.nftName}>{nftToSell?.name}</Text>
          <Text style={styles.collectionName}>{nftToSell?.collectionName}</Text>
          <Text style={styles.tokenId}>Token ID: #{nftToSell?.tokenId}</Text>
        </View>
      </View>

      {/* Current Listing Info */}
      <View style={styles.listingCard}>
        <Text style={styles.cardTitle}>Current Listing Details</Text>

        {currentPrice?.toString() && (
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Your Listing Price</Text>
            <View style={styles.priceRow}>
              <Image source={images.usdc} style={styles.currencyIcon} />
              <Text style={styles.currentPrice}>{displayCurrentPrice} USDC</Text>
            </View>
          </View>
        )}

        {lowestPrice?.toString() && (
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Current Floor Price</Text>
            <View style={styles.priceRow}>
              <Image source={images.usdc} style={styles.currencyIcon} />
              <Text style={styles.floorPrice}>{displayLowestPrice} USDC</Text>
            </View>
          </View>
        )}

        {currentPrice?.toString() && lowestPrice?.toString() && (
          <View style={styles.comparisonSection}>
            <Text
              style={[
                styles.comparisonText,
                currentPrice > lowestPrice
                  ? styles.aboveFloor
                  : styles.belowFloor,
              ]}>
              {currentPrice > lowestPrice
                ? `${(
                  ((currentPrice - lowestPrice) / lowestPrice) *
                  100
                ).toFixed(1)}% above floor`
                : currentPrice < lowestPrice
                  ? `${(
                    ((lowestPrice - currentPrice) / lowestPrice) *
                    100
                  ).toFixed(1)}% below floor`
                  : 'At floor price'}
            </Text>
          </View>
        )}
      </View>

      {/* Action Options */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        <TouchableOpacity
          style={[styles.actionCard, styles.adjustCard]}
          onPress={continueToAdjustPriceStage}>
          <View style={styles.actionContent}>
            <View style={styles.actionIcon}>
              <Text style={styles.iconText}>💰</Text>
            </View>
            <View style={styles.actionDetails}>
              <Text style={[styles.actionTitle]}>{'Adjust Sale Price'}</Text>
              <Text style={[styles.actionDescription]}>
                Change your listing price to be more competitive
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.removeCard]}
          onPress={continueToRemoveFromMarketStage}>
          <View style={styles.actionContent}>
            <View style={styles.actionIcon}>
              <Text style={styles.iconText}>🗑️</Text>
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.removeTitle}>Remove from Market</Text>
              <Text style={styles.actionDescription}>
                Cancel your listing and return the NFT to your wallet
              </Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Listing Tips</Text>
          <Text style={styles.infoText}>
            • Price competitively to increase chances of sale
          </Text>
          <Text style={styles.infoText}>
            • Check floor price regularly for market trends
          </Text>
          <Text style={styles.infoText}>
            • You can adjust or cancel your listing anytime
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
  nftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  nftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  nftDetails: {
    flex: 1,
  },
  nftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  collectionName: {
    fontSize: 14,
    color: '#666',
  },
  tokenId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  listingCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  floorPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  comparisonSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboveFloor: {
    color: '#27ae60',
  },
  belowFloor: {
    color: '#e74c3c',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  adjustCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#81c8c3',
  },
  removeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  disabledCard: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  actionDetails: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  removeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  disabledText: {
    color: '#999',
  },
  actionArrow: {
    fontSize: 18,
    color: '#999',
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 'auto',
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

export default EditStage;
