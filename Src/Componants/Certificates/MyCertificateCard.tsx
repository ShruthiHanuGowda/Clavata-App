import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {NftLocation, NftToken} from '../../types/types';
import {formatQuantityMWh} from '../../utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import SellModal from '../MarketPlace/BuySellModal/SellModal';
import {DText} from '../DText';
import {ScreenWidth} from '@rneui/base';

interface Props {
  nft: NftToken;
  refresh: () => void;
  containerStyle?: object;
}
type NavigationProps = NavigationProp<any, any>;

const MyCertificateCard = ({nft, refresh, containerStyle}: Props) => {
  const [clickedSellNft, setClickedSellNft] = useState<any>({});
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProps>();
  const handlePress = () => {
    navigation.navigate('walletNFTDetails', {nft});
  };

  const handleCollectibleClick = (location?: NftLocation) => {
    // switch (location) {
    //   case NftLocation.WALLET:
    //     setClickedSellNft({nft, location, variant: 'sell'});
    //     setIsSellModalVisible(true);
    //     break;
    //   case NftLocation.FORSALE:
    //     setClickedSellNft({nft, location, variant: 'adjust'});
    //     setIsSellModalVisible(true);
    //     break;
    //   default:
    handlePress();
    // break;
    // }
  };
  return (
    <>
      <TouchableOpacity
        style={[styles.container]}
        onPress={() => handleCollectibleClick(nft.location)}
        activeOpacity={0.8}>
        <View style={styles.image}>
          <Image
            source={{
              uri:
                nft.image?.thumbnail ||
                'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>

        <View style={styles.rowContent}>
          <DText
            style={styles.name}
            fontStyle="fontBold"
            textProps={{numberOfLines: 1, ellipsizeMode: 'tail'}}>
            {nft.name}
          </DText>

          <View style={styles.right}>
            <DText style={styles.quantity} fontStyle="fontExtraBold">
              {formatQuantityMWh(Number(nft.marketData?.quantity ?? 0))}
            </DText>
            <DText style={styles.price} fontStyle="fontSemiBold">
              $ TBC
            </DText>
          </View>
        </View>
      </TouchableOpacity>

      <SellModal
        visible={isSellModalVisible}
        onClose={() => {
          setIsSellModalVisible(false);
          setClickedSellNft(null);
        }}
        variant={clickedSellNft?.variant}
        nftToSell={clickedSellNft?.nft || nft}
        onSuccessSale={() => {
          refresh();
          setIsSellModalVisible(false);
          setClickedSellNft(null);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#E5F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnail: {
    height: '80%',
    width: '80%',
    borderRadius: 20,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: '#2C2C2C',
  },
  right: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 15,
    color: '#00796B',
  },
  price: {
    fontSize: 13,
    color: '#999999',
    marginTop: 4,
  },
});

export default MyCertificateCard;
