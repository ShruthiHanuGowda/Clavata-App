import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';

import NFTHeader from '../../../Componants/MarketPlace/NFTHeader';
import OwnerList from '../../../Componants/MarketPlace/OwnerList';
import ContractInfo from '../../../Componants/MarketPlace/ContractInfo';
import ActivityList from '../../../Componants/MarketPlace/ActivityList';
import BuyModal from '../../../Componants/MarketPlace/BuySellModal/BuyModal';
import SellModal from '../../../Componants/MarketPlace/BuySellModal/SellModal';
import {NftToken} from '../../../types/types';
import {useCompleteNft} from '../../../hooks/useCompleteNft';
import useNftActivity from '../../../hooks/useNftActivity';
import {Header} from '../../../Componants';
import {navigateBack} from '../../../Navigation/NavigationFunctions';

const NFTDetailsScreen = ({route}: any) => {
  const {nft} = route.params;
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  }, [nft]);

  useEffect(() => {
    if (hasTokenData) {
      refetchActivity();
    }
  }, [hasTokenData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    refetch();
    await refetchActivity();
    setIsRefreshing(false);
  };

  const owners = combinedNft?.marketData?.activeAsks || [];

  if (isLoading || !combinedNft) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#81c8c3" />
        <Text style={styles.loadingText}>Fetching NFT Details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        headerTitle={combinedNft.name}
        backBtn={() => navigateBack()}
        containerStyle={{backgroundColor: '#f9fafa'}}
        hideBorder
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        <NFTHeader
          nft={combinedNft}
          onBuyPress={() => setIsBuyModalVisible(true)}
          onSellPress={() => setIsSellModalVisible(true)}
        />

        <Text style={styles.sectionTitle}>👑 Owners</Text>
        <OwnerList
          owners={owners}
          onBuyPress={() => setIsBuyModalVisible(true)}
          onSellPress={() => setIsSellModalVisible(true)}
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

      <BuyModal
        visible={isBuyModalVisible}
        onClose={() => {
          setIsBuyModalVisible(false);
          refetch();
          refetchActivity();
        }}
        nftToBuy={combinedNft}
      />

      <SellModal
        visible={isSellModalVisible}
        onClose={() => {
          setIsSellModalVisible(false);
          refetch();
        }}
        variant="adjust"
        nftToSell={combinedNft}
        onSuccessSale={() => {
          refetch();
          refetchActivity();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafa',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
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
