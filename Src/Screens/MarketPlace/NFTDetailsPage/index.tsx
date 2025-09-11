import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';

import NFTHeader from '../../../components/MarketPlace/NFTHeader';
import OwnerList from '../../../components/MarketPlace/OwnerList';
import ContractInfo from '../../../components/MarketPlace/ContractInfo';
import ActivityList from '../../../components/MarketPlace/ActivityList';
import {useCompleteNft} from '../../../hooks/useCompleteNft';
import useNftActivity from '../../../hooks/useNftActivity';
import {Header} from '../../../components';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {useNavigation} from '@react-navigation/native';
import LoaderAnimation from '../../../components/Loading/LoaderAnimation';

const NFTDetailsScreen = ({route}: any) => {
  const {nft} = route.params;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const {
    nft: combinedNft,
    loading: isLoading,
    refetch,
  } = useCompleteNft(nft?.id);

  const hasTokenData = combinedNft?.tokenId && combinedNft?.collectionAddress;

  const {
    activity,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useNftActivity(
    hasTokenData ? combinedNft.tokenId : '',
    hasTokenData ? combinedNft.collectionAddress : '',
  );

  useEffect(() => {
    if (nft?.collectionAddress && nft?.tokenId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft]);

  useEffect(() => {
    if (hasTokenData) {
      refetchActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTokenData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    refetch();
    await refetchActivity();
    setIsRefreshing(false);
  };

  const navigateToBuyNFT = (sellerAddress: string) => {
    navigation.navigate('BuyNFT', {
      nftToBuy: combinedNft,
      currentSeller: sellerAddress,
    });
  };

  const navigateToSellNFT = () => {
    navigation.navigate('SellNFT', {
      variant: 'adjust',
      nftToSell: nft,
      refresh: () => {
        refetch();
        refetchActivity();
      },
    });
  };

  const owners = combinedNft?.marketData?.activeAsks || [];

  if (isLoading || !combinedNft) {
    return (
      <View style={styles.loadingContainer}>
        {/* <ActivityIndicator size="large" color="#81c8c3" />
        <Text style={styles.loadingText}>Fetching NFT Details...</Text> */}
        <LoaderAnimation
          size="large"
          showText={true}
          text="Fetching Certificate Details..."
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        headerTitle={combinedNft.name}
        backBtn={() => navigateBack()}
        containerStyle={styles.headerContainer}
        hideBorder
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        <NFTHeader
          nft={combinedNft}
          onBuyPress={seller => navigateToBuyNFT(seller)}
          onSellPress={() => navigateToSellNFT()}
        />

        <Text style={styles.sectionTitle}>👑 Owners</Text>
        <OwnerList
          owners={owners}
          onBuyPress={seller => navigateToBuyNFT(seller?.seller?.id)}
          onSellPress={() => navigateToSellNFT()}
        />

        <Text style={styles.sectionTitle}>📄 Contract Info</Text>
        <ContractInfo nft={combinedNft} />

        <Text style={styles.sectionTitle}>📊 Activity</Text>
        {activityError ? (
          <Text style={styles.errorText}>Failed to load activity.</Text>
        ) : (
          <ActivityList activity={activity} loading={activityLoading} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafa',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContainer: {
    backgroundColor: '#f9fafa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafa',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 15,
    color: '#34495e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NFTDetailsScreen;
