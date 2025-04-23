import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import TabButton from '../../../Componants/MarketPlace/TabButton';
import {useNftsForAddress} from '../../../hooks/useNftsForAddress';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {NftLocation} from '../../../types/types';
import UserNFTCard from '../../../Componants/MarketPlace/UserNFTCard';

const ProfileNFTsScreen = ({route}) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [walletConnected, setWalletConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {userDetails} = useAuth();
  const account = route?.params?.accountAddress || userDetails?.userWallet;

  const {nfts, isLoading, error, refresh} = useNftsForAddress({
    account: account,
  });

  const filteredNFTs = nfts.filter(nft => {
    if (selectedTab === 'wallet') return nft?.location === NftLocation.WALLET;
    if (selectedTab === 'sale') return nft?.location === NftLocation.FORSALE;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#008060" />
        <Text style={styles.loaderText}>Loading your NFTs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Your NFT Collection</Text>

        <View style={styles.tabs}>
          {['all', 'wallet', 'sale'].map(type => (
            <TabButton
              key={type}
              label={
                type === 'all'
                  ? 'All'
                  : type === 'wallet'
                  ? 'In Wallet'
                  : 'On Sale'
              }
              isSelected={selectedTab === type}
              onPress={() => setSelectedTab(type)}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.nftGrid,
            filteredNFTs.length === 0 && styles.emptyContainer,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {filteredNFTs.length > 0 ? (
            filteredNFTs.map(nft => (
              <UserNFTCard
                key={`${nft.collectionAddress}-${nft.tokenId}`}
                nft={nft}
                refresh={refresh}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No NFTs found.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 20,
    textAlign: 'center',
    color: '#222',
  },
  connectButton: {
    marginTop: 40,
    backgroundColor: '#0066ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 30,
    textAlign: 'center',
    width: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#444',
  },
});

export default ProfileNFTsScreen;
