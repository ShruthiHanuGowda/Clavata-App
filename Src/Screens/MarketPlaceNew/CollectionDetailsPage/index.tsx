import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  Animated,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import Spinner from '../../../Componants/MarketPlace/Spinner';
import NFTCard from '../../../Componants/MarketPlace/NFTCard';
import useNfts from '../../../hooks/useNfts';
import {getMinAsk} from '../../../hooks/marketPlace';
import {ApiCollection, ApiSingleCollectionResponse} from '../../../types/types';
import useApi from '../../../hooks/useApi';
import {API_NFT_URL} from '../../../constants';
import {Header} from '../../../Componants';
import {navigateBack} from '../../../Navigation/NavigationFunctions';

const CollectionDetailsScreen = ({route}) => {
  const {contractAddress} = route.params;
  const navigation = useNavigation();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [collection, setCollection] = useState<ApiCollection | null>(null);

  const {
    data: collectionRes,
    isLoading,
    error,
    refetch,
  } = useApi<ApiSingleCollectionResponse>(
    `${API_NFT_URL}/nftMarketplace_getCollections/?contractAddress=${contractAddress}`,
    {method: 'GET'},
  );

  const {
    nfts,
    loading: nftsLoading,
    error: nftsError,
  } = useNfts(contractAddress);

  // Fade-in effect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Set collection on data fetch
  useEffect(() => {
    if (collectionRes?.data) {
      setCollection(collectionRes.data);
    }
  }, [collectionRes]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        headerTitle={'Collection Details'}
        backBtn={() => navigateBack()}
        containerStyle={{backgroundColor: '#f9f9f9'}}
        hideBorder
      />
      <View style={{flex: 1}}>
        <ScrollView style={styles.container}>
          {/* Banner Image */}
          <View style={styles.imageWrapper}>
            {!imageLoaded && (
              <View style={styles.imagePlaceholder}>
                <Spinner />
              </View>
            )}
            <Animated.Image
              source={{
                uri: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
              }}
              style={[styles.bannerImage, {opacity: fadeAnim}]}
              onLoad={() => setImageLoaded(true)}
            />
          </View>

          {/* Collection Name */}
          <Animated.Text style={[styles.collectionName, {opacity: fadeAnim}]}>
            {collection?.collectionName || 'Collection Name'}
          </Animated.Text>

          {/* Collection Details */}
          <View style={styles.collectionDetails}>
            <Text style={styles.detailsHeader}>Collection Details</Text>
            {collection ? (
              <>
                <DetailRow label="Symbol" value={collection.symbol} />
                <DetailRow label="Year" value={collection.year} />
                <DetailRow label="Country" value={collection.country} />
                <DetailRow label="Type" value={collection.type} />
              </>
            ) : isLoading ? (
              <Spinner />
            ) : (
              <Text style={styles.errorText}>
                Failed to load collection data
              </Text>
            )}
          </View>

          {/* NFT List */}
          <View style={styles.nftListContainer}>
            <Text style={styles.nftSectionTitle}>NFTs</Text>
            <View style={styles.nftGrid}>
              {nftsLoading ? (
                <Spinner />
              ) : nftsError ? (
                <Text style={styles.errorText}>{nftsError}</Text>
              ) : nfts.length > 0 ? (
                nfts.map((nft: any) => {
                  const currentAsk = getMinAsk(nft.activeAsks ?? []);
                  const hasAsks = nft?.activeAsks?.length > 0;

                  if (!hasAsks) return null;

                  const nftData = {
                    ...nft,
                    name: `${collection?.collectionName} #${nft.tokenId}`,
                  };

                  return (
                    <NFTCard
                      key={nft.tokenId}
                      nft={nftData}
                      currentAskPrice={Number(currentAsk?.askPrice) || 0}
                      quantity={Number(currentAsk?.amount) || 0}
                    />
                  );
                })
              ) : (
                <Text style={styles.noNftsText}>
                  No NFTs in this collection
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <View style={styles.detailsRow}>
    <Text style={styles.detailsLabel}>{label}:</Text>
    <Text style={styles.detailsValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 20,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  collectionName: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 15,
  },
  collectionDetails: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 10,
    marginTop: 20,
    elevation: 5,
  },
  detailsHeader: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  detailsValue: {
    fontSize: 16,
    color: '#333',
  },
  nftListContainer: {
    paddingBottom: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  nftSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  noNftsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default CollectionDetailsScreen;
