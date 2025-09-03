import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNftsForAddress} from '../../../hooks/useNftsForAddress';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {NftLocation} from '../../../types/types';
import UserNFTCard from '../../../Componants/MarketPlace/UserNFTCard';
import {Header} from '../../../Componants';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {FullScreenLoader} from '../../../Componants/Loading/LoaderAnimation';

const UserNFTsScreen = ({route}: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const {userDetails} = useAuth();
  const account = route?.params?.accountAddress || userDetails?.userWallet;

  const {nfts, isLoading, refresh} = useNftsForAddress({
    account: account,
  });

  // Filter to show only NFTs that are for sale
  const onSaleNFTs = nfts.filter(nft => nft?.location === NftLocation.FORSALE);

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <>
        <FullScreenLoader color="#81c8c3" text="Loading your Certificates..." />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        headerTitle={'Certificates On Sale'}
        backBtn={() => navigateBack()}
        containerStyle={styles.headerContainer}
        hideBorder
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.nftList,
            onSaleNFTs.length === 0 && styles.emptyContainer,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {onSaleNFTs.length > 0 ? (
            onSaleNFTs.map(nft => (
              <UserNFTCard
                key={`${nft.collectionAddress}-${nft.tokenId}`}
                nft={nft}
                refresh={refresh}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              No Certificates currently on sale.
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    flex: 1,
    marginTop: 10,
  },
  nftList: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    width: '100%',
    fontWeight: '500',
    lineHeight: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: '#f9fafa',
  },
});

export default UserNFTsScreen;
