import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface EditStageProps {
  nftToSell: {
    name: string;
    collectionName: string;
    image: {thumbnail: string};
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
  const isDelist = ['0x000...example'].includes(nftToSell?.collectionAddress);

  const imageUrl =
    nftToSell?.image?.thumbnail ||
    'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.nftInfo}>
        <Image source={{uri: imageUrl}} style={styles.nftImage} />
        <View style={{flex: 1}}>
          <Text style={styles.nftName}>{nftToSell?.name}</Text>
          <Text style={styles.collectionName}>{nftToSell?.collectionName}</Text>

          {lowestPrice ? (
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Lowest Price</Text>
              <View style={styles.priceRow}>
                <Image
                  source={{
                    uri: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
                  }}
                  style={styles.icon}
                />
                <Text style={styles.priceText}>{lowestPrice}</Text>
              </View>
            </View>
          ) : null}

          {currentPrice ? (
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Your Price</Text>
              <View style={styles.priceRow}>
                <Image
                  source={{
                    uri: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
                  }}
                  style={styles.icon}
                />
                <Text style={styles.priceText}>{currentPrice}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.tokenId}>Token ID: {nftToSell?.tokenId}</Text>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.button, isDelist && styles.disabledButton]}
          disabled={isDelist}
          onPress={continueToAdjustPriceStage}>
          <Text style={styles.buttonText}>
            {isDelist ? 'Adjust Disabled (Delisted)' : 'Adjust Sale Price'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={continueToRemoveFromMarketStage}>
          <Text style={styles.buttonText}>Remove from Market</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  nftInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nftImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    marginRight: 12,
  },
  nftName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  collectionName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  tokenId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  priceBlock: {
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  actionContainer: {
    marginTop: 16,
  },
  button: {
    backgroundColor: '#008060',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EditStage;
