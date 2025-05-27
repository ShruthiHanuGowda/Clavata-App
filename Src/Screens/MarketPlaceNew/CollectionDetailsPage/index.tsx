import {useEffect, useState} from 'react';
import {
  ScrollView,
  Animated,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import Spinner from '../../../Componants/MarketPlace/Spinner';
import useNfts from '../../../hooks/useNfts';
import {getMinAsk} from '../../../hooks/marketPlace';
import {ApiCollection, ApiSingleCollectionResponse} from '../../../types/types';
import useApi from '../../../hooks/useApi';
import {API_NFT_URL} from '../../../constants';
import {Header} from '../../../Componants';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import NFTCard from '../../../Componants/MarketPlace/NFTCard';

const CollectionDetailsScreen = ({route}) => {
  const {contractAddress} = route.params;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [collection, setCollection] = useState<ApiCollection | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    refetch: nftsRefetch,
  } = useNfts(contractAddress);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (collectionRes?.data) {
      setCollection(collectionRes.data);
    }
  }, [collectionRes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await nftsRefetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        headerTitle={'Available Certificates'}
        backBtn={() => navigateBack()}
        containerStyle={{backgroundColor: '#f9f9f9'}}
        hideBorder
      />
      <View style={{flex: 1}}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.collectionDetails}>
            {collection ? (
              <>
                <DetailRow label="Country" value={collection?.country} />
                <DetailRow label="Type" value={collection?.type} />
                <DetailRow label="Year" value={collection?.year} />
              </>
            ) : isLoading ? (
              <Spinner />
            ) : (
              <Text style={styles.errorText}>
                Failed to load collection data
              </Text>
            )}
          </View>

          <View style={styles.nftListContainer}>
            <Text style={styles.nftSectionTitle}>Certificates</Text>
            {nftsLoading ? (
              <Spinner />
            ) : nftsError ? (
              <Text style={styles.errorText}>{nftsError}</Text>
            ) : nfts.length > 0 ? (
              <View style={styles.nftList}>
                {nfts.map((nft: any) => {
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
                })}
              </View>
            ) : (
              <Text style={styles.noNftsText}>No NFTs in this collection</Text>
            )}
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
  <View style={styles.bulletRow}>
    <Text style={styles.bulletPoint}>{'\u2022'}</Text>
    <Text style={styles.bulletText}>
      <Text style={styles.detailsLabel}>{label}: </Text>
      <Text style={styles.detailsValue}>{value || '-'}</Text>
    </Text>
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
  collectionDetails: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1C1C1C',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletPoint: {
    fontSize: 18,
    color: '#6B6B6B',
    marginRight: 6,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#2D2D2D',
    lineHeight: 22,
  },
  detailsLabel: {
    fontWeight: '600',
    color: '#555',
  },
  detailsValue: {
    color: '#2D2D2D',
  },
  nftListContainer: {
    paddingBottom: 30,
    marginTop: 24,
  },
  nftSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginHorizontal: 12,
  },
  nftList: {
    paddingHorizontal: 10,
  },
  noNftsText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 15,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CollectionDetailsScreen;
