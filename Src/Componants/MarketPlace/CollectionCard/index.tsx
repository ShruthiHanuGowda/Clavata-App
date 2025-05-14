import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {ApiCollection, Collection} from '../../../types/types';

const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const cardWidth = screenWidth / 2 - cardMargin * 3;

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onPress,
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity
      style={[styles.collectionCard, {width: cardWidth}]}
      onPress={onPress}>
      <View style={styles.imageWrapper}>
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#81c8c3" />
          </View>
        )}
        <Image
          source={{
            uri:
              collection?.banner?.large ||
              'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
          }}
          style={styles.bannerImage}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName}>{collection?.name}</Text>
        <Text style={styles.symbolText}>{collection?.symbol}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    margin: cardMargin,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  collectionInfo: {
    padding: 10,
    alignItems: 'center',
  },
  collectionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  symbolText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default CollectionCard;
