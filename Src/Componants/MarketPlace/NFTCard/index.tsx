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
  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    navigation.navigate('NFTDetailsPage', {nft});
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.nftItemContainer}>
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              nft.image?.thumbnail ||
              'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
          }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.nftTextWrapper}>
        <Text style={styles.nftTitle} numberOfLines={1}>
          {nft.name}
        </Text>
        <Text style={styles.nftQuantity}>
          Available : {formatQuantityMWh(quantity)}
        </Text>
      </View>
      <View style={styles.priceWrapper}>
        <Text style={styles.price}>${currentAskPrice} per MWh</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nftItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
  },
  imageWrapper: {
    backgroundColor: '#D5F5F1',
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  image: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  nftTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  nftTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nftQuantity: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  priceWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
});

export default NFTCard;
