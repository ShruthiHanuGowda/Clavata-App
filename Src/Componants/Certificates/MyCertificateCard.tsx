import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {NftLocation, NftToken} from '../../types/types';
import {formatQuantityMWh} from '../../utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import SellModal from '../MarketPlace/BuySellModal/SellModal';

interface Props {
  nft: NftToken;
}
type NavigationProps = NavigationProp<any, any>;

const MyCertificateCard = ({nft}: Props) => {
  const [clickedSellNft, setClickedSellNft] = useState<any>({});
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProps>();
  const handlePress = () => {
    navigation.navigate('NFTDetailsPage', {nft});
  };

  const handleCollectibleClick = (location?: NftLocation) => {
    switch (location) {
      case NftLocation.WALLET:
        setClickedSellNft({nft, location, variant: 'sell'});
        setIsSellModalVisible(true);
        break;
      case NftLocation.FORSALE:
        setClickedSellNft({nft, location, variant: 'adjust'});
        setIsSellModalVisible(true);
        break;
      default:
        handlePress();
        break;
    }
  };
  return (
    <>
      <TouchableOpacity
        onPress={() => handleCollectibleClick(nft.location)}
        style={styles.card}>
        <Image
          source={{
            uri:
              nft.image?.thumbnail ||
              'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
          }}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.name}>
            {nft.name}
          </Text>
          <Text style={styles.qty}>
            {formatQuantityMWh(Number(nft.marketData?.quantity ?? 0))}
          </Text>
        </View>
      </TouchableOpacity>
      <SellModal
        visible={isSellModalVisible}
        onClose={() => {
          setIsSellModalVisible(false);
        }}
        variant={'adjust'}
        nftToSell={clickedSellNft?.nft || nft}
        onSuccessSale={() => {
          setIsSellModalVisible(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    marginBottom: 12,
  },
  image: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  qty: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default MyCertificateCard;
