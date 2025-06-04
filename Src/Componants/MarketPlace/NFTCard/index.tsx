import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Spinner from '../Spinner';
import { NftToken } from '../../../types/types';
import { formatQuantityMWh } from '../../../utils';
import { NFT_DEFAULT_IMAGE_URL } from '../../../constants';

interface NFTCardProps {
  nft: NftToken & {
    collection?: {
      name?: string;
      contractAddress?: string;
    };
  };
  currentAskPrice?: number;
  quantity?: number;
}

type NavigationProps = NavigationProp<any, any>;

const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  currentAskPrice,
  quantity = 0,
}) => {
  const navigation = useNavigation<NavigationProps>();
  const [imageLoading, setImageLoading] = useState(true);

  const handlePress = () => {
    navigation.navigate('NFTDetailsPage', { nft });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.nftCard}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              nft.image?.thumbnail ||
              NFT_DEFAULT_IMAGE_URL
          }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={styles.imageLoader}>
            <Spinner />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.nftTitle} numberOfLines={1}>
          {nft.collection?.name || 'Unknown Collection'} #{nft?.tokenId}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.quantityText}>
            {formatQuantityMWh(quantity)}
          </Text>
          <Text style={styles.priceText}>
            from ${currentAskPrice} per MWh
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nftCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nftTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
});

export default NFTCard;