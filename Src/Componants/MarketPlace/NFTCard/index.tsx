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
import {NftToken} from '../../../types/types';
import {formatQuantityMWh} from '../../../utils';

interface NFTCardProps {
  nft: NftToken;
  currentAskPrice?: number;
  quantity?: number;
}

type NavigationProps = NavigationProp<any, any>;

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 40) / 2;

const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  currentAskPrice,
  quantity = 0,
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    navigation.navigate('NFTDetailsPage', {nft});
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
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
      <Text style={styles.qty}>Qty: {formatQuantityMWh(quantity)}</Text>

      <View style={styles.priceWrapper}>
        <Image
          source={{
            uri: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
          }}
          style={styles.priceIcon}
        />

        <Text style={styles.priceText}>{currentAskPrice} per MWh</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardSize,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
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

export default NFTCard;
