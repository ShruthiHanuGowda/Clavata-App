import { useEffect, useState } from 'react';
import {
  ScrollView,
  Animated,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useNfts from '../../../hooks/useNfts';
import { getMinAsk } from '../../../hooks/marketPlace';
import { ApiCollection, ApiSingleCollectionResponse } from '../../../types/types';
import useApi from '../../../hooks/useApi';
import { API_NFT_URL } from '../../../constants';
import { Header } from '../../../components';
import { navigateBack } from '../../../Navigation/NavigationFunctions';
import NFTCard from '../../../components/MarketPlace/NFTCard';
import LoaderAnimation from '../../../components/Loading/LoaderAnimation';
import images from '../../../Theme/images';
import { parseUnits } from 'ethers';

const CollectionDetailsScreen = ({ route }: any) => {
  const { contractAddress } = route.params;
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
    { method: 'GET' },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        containerStyle={styles.headerContainer}
        hideBorder
      />
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}>
          {isLoading && (
            <View style={styles.loaderContainer}>
              {/* <Spinner /> */}
              <LoaderAnimation size="large" />
            </View>
          )}

          {!isLoading && !error && collection && (
            <View style={styles.collectionDetails}>
              <Text style={styles.collectionTitle}>Collection Details</Text>
              <View style={styles.detailsGrid}>
                <DetailCard
                  icon={collection?.country_image}
                  label="Country"
                  value={collection?.country}
                />
                <DetailCard
                  icon={collection?.energy_type_image}
                  label="Type"
                  value={collection?.type}
                />
                <DetailCard
                  icon={images.calendar}
                  label="Year"
                  value={collection?.year?.toString()}
                />
              </View>
            </View>
          )}

          {!isLoading && error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Failed to load collection data
              </Text>
            </View>
          )}

          {/* Show NFT list section */}
          <View style={styles.nftListContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.nftSectionTitle}>Available Certificates</Text>
              <Text style={styles.nftCount}>
                {nfts?.filter(nft => (nft?.activeAsks ?? []).length > 0)
                  .length || 0}{' '}
                items
              </Text>
            </View>

            {/* Show loader when NFTs are loading */}
            {nftsLoading && (
              <View style={styles.loaderContainer}>
                {/* <Spinner /> */}
                <LoaderAnimation size="large" />
              </View>
            )}

            {/* Show error if there was an issue loading NFTs */}
            {nftsError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{nftsError}</Text>
              </View>
            )}

            {/* Show NFTs if they are available */}
            {!nftsLoading && nfts.length > 0 ? (
              <View style={styles.nftGrid}>
                {nfts.map((nft: any) => {
                  const currentAsk = getMinAsk(nft.activeAsks ?? []);
                  const hasAsks = nft?.activeAsks?.length > 0;

                  if (!hasAsks) {
                    return null;
                  }

                  const nftData = {
                    ...nft,
                    name: nft?.collection?.name ?? '',
                    image: {
                      thumbnail: nft?.metadata?.image,
                    },
                  };

                  const totalQuantity = nft?.activeAsks?.reduce(
                    (total: number, ask: any) =>
                      total + Number(ask.amount || 0),
                    0,
                  );

                  return (
                    <NFTCard
                      key={nft.tokenId}
                      nft={nftData}
                      currentAskPrice={Number(parseUnits(currentAsk?.askPrice?.toString() ?? '0', 6))}
                      quantity={totalQuantity || 0}
                    />
                  );
                })}
              </View>
            ) : (
              !nftsLoading && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📜</Text>
                  <Text style={styles.emptyStateTitle}>
                    No Certificates Available
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    There are currently no certificates for sale in this
                    collection
                  </Text>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const DetailCard = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
}) => {
  return (
    <View style={styles.detailCard}>
      <Image
        source={typeof icon === 'string' ? { uri: icon } : icon}
        style={styles.detailImage}
        resizeMode="contain"
      />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  collectionDetails: {
    margin: 16,
    marginTop: 8,
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  detailImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  nftListContainer: {
    paddingBottom: 30,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  nftSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  nftCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  nftGrid: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  headerContainer: {
    backgroundColor: '#f8fafc',
  },
  mainContainer: {
    flex: 1,
  },
});

export default CollectionDetailsScreen;
