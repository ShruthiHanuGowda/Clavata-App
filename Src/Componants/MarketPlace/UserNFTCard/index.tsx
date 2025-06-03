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
import { NftLocation, NftToken } from '../../../types/types';
import SellModal from '../BuySellModal/SellModal';
import { formatQuantityMWh } from '../../../utils';
import { NFT_DEFAULT_IMAGE_URL } from '../../../constants';

interface UserNFTCardProps {
  nft: NftToken;
  refresh: () => void;
}

interface SellNftProps {
  nft?: NftToken;
  location?: NftLocation;
  variant?: 'sell' | 'adjust';
}

type NavigationProps = NavigationProp<any, any>;

const UserNFTCard: React.FC<UserNFTCardProps> = ({ nft, refresh }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [clickedSellNft, setClickedSellNft] = useState<SellNftProps>({});
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    navigation.navigate('walletNFTDetails', { nft, refresh });
  };

  const handleCollectibleClick = () => {
    handlePress();
  };

  return (
    <TouchableOpacity
      onPress={() => handleCollectibleClick()}
      style={styles.card}>
      <View style={styles.imageContainer}>
        {!imageLoaded && (
          <View style={styles.imagePlaceholder}>
            <Spinner />
          </View>
        )}
        <Image
          source={{
            uri:
              nft.image?.thumbnail ||
              NFT_DEFAULT_IMAGE_URL,
          }}
          style={styles.image}
          onLoad={() => setImageLoaded(true)}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textContent}>
          <Text style={styles.name} numberOfLines={2}>
            {nft.name}
          </Text>
          <Text style={styles.qty}>
            Qty: {formatQuantityMWh(Number(nft.marketData?.quantity ?? 0))}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.onSaleTag}>
            <Text style={styles.onSaleText}>● On Sale</Text>
          </View>
          {nft.marketData?.price && (
            <Text style={styles.priceText}>
              ${Number(nft.marketData.price).toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      <SellModal
        visible={isSellModalVisible}
        onClose={() => {
          setIsSellModalVisible(false);
        }}
        variant={'adjust'}
        nftToSell={clickedSellNft?.nft || nft}
        onSuccessSale={() => {
          refresh();
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 80,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    position: 'relative',
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
    lineHeight: 20,
  },
  qty: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    backgroundColor: '#f1f5f9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  onSaleTag: {
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#10b981',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 3,
  },
  onSaleText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '700',
    textAlign: 'right',
  },
});

export default UserNFTCard;