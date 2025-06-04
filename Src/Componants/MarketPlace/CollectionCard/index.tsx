import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Collection } from '../../../types/types';
import { formatQuantityMWh } from '../../../utils';

interface CollectionCardProps {
  collection: Collection & {
    totalAskAmount?: string;
  };
  onPress: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onPress,
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity style={styles.collectionCard} onPress={onPress}>
      <View style={styles.collectionContent}>
        <View style={styles.imageWrapper}>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color="#81c8c3" />
            </View>
          )}
          <Image
            source={{
              uri:
                collection?.collection_image ||
                'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
            }}
            style={styles.bannerImage}
            onLoadEnd={() => setLoading(false)}
          />
        </View>

        <View style={styles.collectionInfo}>
          <Text style={styles.collectionName}>{collection?.name}</Text>
          <Text style={styles.collectionText}>
            Country: {collection?.country ?? '-'}
          </Text>
          <Text style={styles.collectionText}>
            Type: {collection?.type ?? '-'}
          </Text>
          <Text style={styles.collectionText}>
            Year: {collection?.year ?? '-'}
          </Text>
          <Text style={styles.collectionText}>
            Total Available Quantity:{' '}
            {formatQuantityMWh(Number(collection?.totalAskAmount ?? 0))}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loader: {
    position: 'absolute',
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  collectionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
});

export default CollectionCard;
