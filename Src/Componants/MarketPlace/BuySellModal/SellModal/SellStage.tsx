import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

interface NFT {
  tokenId: string;
  name: string;
  collectionName: string;
  image: {
    thumbnail: string;
  };
}

interface SellStageProps {
  nftToSell: NFT;
  lowestPrice: number;
  continueToNextStage: () => void;
  continueToTransferStage: () => void;
}

const SellStage: React.FC<SellStageProps> = ({
  nftToSell,
  lowestPrice,
  continueToNextStage,
  continueToTransferStage,
}) => {
  const handleSell = () => {
    continueToNextStage();
  };

  const handleConfirmSell = () => {
    // Logic for confirming sell (if any additional confirmation needed)
    continueToNextStage();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.nftInfo}>
        <Image
          source={{
            uri:
              nftToSell?.image?.thumbnail ||
              'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
          }}
          style={styles.nftImage}
        />
        <View>
          <Text style={styles.collectionName}>
            {nftToSell?.collectionName || 'Collection Name'}
          </Text>
          <Text style={styles.nftName}>{nftToSell?.name || 'NFT Name'}</Text>
          {lowestPrice > 0 && (
            <>
              <Text style={styles.label}>Lowest Price</Text>
              <View style={styles.priceRow}>
                <Image
                  source={{
                    uri: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
                  }}
                  style={styles.icon}
                />
                <Text style={styles.price}>{lowestPrice}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.tokenId}>{`Token ID: ${nftToSell.tokenId}`}</Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSell}>
          <Text style={styles.buttonText}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={continueToTransferStage}>
          <Text style={styles.buttonText}>Transfer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  nftInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  nftImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  collectionName: {
    fontSize: 12,
    color: '#888',
  },
  nftName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  price: {
    fontSize: 16,
  },
  detailsRow: {
    marginBottom: 20,
  },
  tokenId: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    flexDirection: 'column',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#008060',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmationModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default SellStage;
