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
}
type NavigationProps = NavigationProp<any, any>;

const MyCertificateCard = ({nft, refresh}: Props) => {
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
  const height = 21;
  const width = 71;
  return (
    <>
      <TouchableOpacity
        style={marketStyles.container}
        onPress={() => handleCollectibleClick(nft.location)}
        activeOpacity={0.5}>
        <View style={marketStyles.image}>
          <Image
            source={{
              uri:
                nft.image?.thumbnail ||
                'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
            }}
            style={{height: '80%', width: '80%', borderRadius: 20}}
            resizeMode="cover" // or 'contain', depending on how you want the image to scale
          />
        </View>
        <View style={marketStyles.info}>
          <DText
            style={marketStyles.coinTitle}
            fontStyle="fontBold"
            textProps={{numberOfLines: 1}}>
            {nft.name}
          </DText>
          {/* <DText style={marketStyles.coinCode} fontStyle="fontSemiBold">
            {formatQuantityMWh(Number(nft.marketData?.quantity ?? 0))}
          </DText> */}
        </View>
        <View style={marketStyles.content}>
          <View
            style={{
              width,
              justifyContent: 'center',
              alignItems: 'center',
              bottom: 10,
            }}></View>
          <View style={{alignItems: 'flex-end'}}>
            <DText style={marketStyles.usd} fontStyle="fontExtraBold">
              {formatQuantityMWh(Number(nft.marketData?.quantity ?? 0))}
            </DText>
            <DText style={marketStyles.coinCode} fontStyle="fontSemiBold">
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

const marketStyles = StyleSheet.create({
  container: {
    height: 37,
    flex: 1,
    flexDirection: 'row',
    marginBottom: 15,
    // marginLeft: 20,
    width: ScreenWidth - 40,
  },
  image: {
    backgroundColor: '#D5F5F1',
    height: 37,
    width: 37,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  coinTitle: {
    color: '#515151',
    fontSize: 14,
    lineHeight: 16,
  },
  coinCode: {
    color: '#A6A6A6',
    fontSize: 12,
    marginTop: 5,
  },
  info: {
    marginRight: 40,
    width: 120,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chart: {},
  growth: {
    color: '#0FB990',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  dip: {
    color: '#FF4949',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  usd: {
    color: '#515151',
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 16,
  },
});

export default MyCertificateCard;
