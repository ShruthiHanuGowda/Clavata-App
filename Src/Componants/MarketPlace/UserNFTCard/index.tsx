import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import Spinner from '../Spinner';
import {NftLocation, NftToken} from '../../../types/types';
import SellModal from '../BuySellModal/SellModal';

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

const UserNFTCard: React.FC<UserNFTCardProps> = ({nft, refresh}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [clickedSellNft, setClickedSellNft] = useState<SellNftProps>({});
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    navigation.navigate('NFTDetailsPage', {nft});
  };

  const handleCollectibleClick = (location?: NftLocation) => {
    switch (location) {
      case NftLocation.WALLET:
        setClickedSellNft({location, variant: 'sell'});
        setIsSellModalVisible(true);
        break;
      case NftLocation.FORSALE:
        setClickedSellNft({location, variant: 'adjust'});
        setIsSellModalVisible(true);
        break;
      default:
        handlePress();
        break;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handleCollectibleClick(nft.location)}
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
              'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
          }}
          style={styles.image}
          onLoad={() => setImageLoaded(true)}
        />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {nft.name}
      </Text>
      <Text style={styles.qty}>Qty: {nft.marketData?.quantity || 0}</Text>

      <SellModal
        visible={isSellModalVisible}
        onClose={() => {
          setIsSellModalVisible(false);
        }}
        variant={clickedSellNft?.variant}
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
    width: '46%',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 12,
    marginRight: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f1f1f1',
    position: 'relative',
    marginBottom: 8,
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
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  qty: {
    fontSize: 12,
    color: '#555',
    marginBottom: 6,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '500',
  },
  priceIcon: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  notForSale: {
    fontSize: 12,
    color: '#b71c1c',
    backgroundColor: '#fdecea',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
});

export default UserNFTCard;
