import React from 'react';
import {View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {NftToken} from '../../types/types';
import {formatQuantityMWh} from '../../utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {DText} from '../DText';
import {NFT_DEFAULT_IMAGE_URL} from '../../constants';

interface Props {
  nft: NftToken;
  refresh: () => void;
  containerStyle?: object;
}
type NavigationProps = NavigationProp<any, any>;

const MyCertificateCard = ({nft, refresh}: Props) => {
  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    navigation.navigate('walletNFTDetails', {nft, refresh});
  };

  const handleCollectibleClick = () => {
    handlePress();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container]}
        onPress={() => handleCollectibleClick()}
        activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              // uri: nft.image?.thumbnail || NFT_DEFAULT_IMAGE_URL,
              uri: nft.energy_type_image || NFT_DEFAULT_IMAGE_URL,
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 5,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 30,
    width: 30,
    borderRadius: 8,
    backgroundColor: '#E5F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
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
