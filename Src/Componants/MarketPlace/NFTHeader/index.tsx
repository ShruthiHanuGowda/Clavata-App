import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {NftToken, TokenMarketData} from '../../../types/types';
import {getMinAsk, getMinAskPrice, isOwnNft} from '../../../hooks/marketPlace';
import {useAuth} from '../../../../screens/Provider/authProvider';

interface NFTHeaderProps {
  nft: NftToken | null;
  onBuyPress: () => void;
  onSellPress: () => void;
}

const NFTHeader: React.FC<NFTHeaderProps> = ({
  nft,
  onBuyPress,
  onSellPress,
}) => {
  const {userDetails} = useAuth();
  const price = getMinAskPrice(nft?.marketData?.activeAsks ?? []);
  const minAsk = getMinAsk(nft?.marketData?.activeAsks ?? []);

  const isOwn = isOwnNft(
    userDetails?.userWallet as `0x${string}`,
    nft?.marketData?.activeAsks ?? [],
  );

  const ownerButtons = (
    <TouchableOpacity
      style={styles.buyButton}
      onPress={onSellPress}
      disabled={!nft?.marketData?.isTradable}>
      <Text style={styles.buyButtonText}>
        {nft?.marketData?.isTradable ? 'Adjust price' : 'List for sale'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Text style={styles.title}>{nft?.name}</Text>
        {/* {nft.description && (
        <Text style={styles.description}>{nft.description}</Text>
      )} */}
        <Text style={styles.price}>
          💰 Price: {price > 0 ? price : 'Not for sale'}
        </Text>
        <Text style={styles.qty}>📦 Quantity: {minAsk?.amount ?? 0}</Text>
        {isOwn && ownerButtons}
        {!isOwn && (
          <TouchableOpacity
            style={styles.buyButton}
            onPress={onBuyPress}
            disabled={!nft?.marketData?.isTradable}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        )}
      </View>
      <Image
        source={{
          uri:
            nft?.image?.thumbnail ||
            'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
        }}
        style={styles.nftImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  left: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  title: {fontSize: 24, fontWeight: '700', color: '#333'},
  description: {fontSize: 14, color: '#666', marginVertical: 5},
  price: {fontSize: 16, color: '#2ecc71', marginVertical: 4},
  qty: {fontSize: 14, color: '#888', marginBottom: 10},
  buyButton: {
    backgroundColor: '#008060',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  buyButtonText: {color: '#fff', fontWeight: '600', fontSize: 14},
  nftImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
});

export default NFTHeader;
