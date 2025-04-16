import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {navigate} from '../../Navigation/NavigationFunctions';
import ListingHeader from '../../Componants/MarketPlace/ListingHeader';
import CollectionCard from '../../Componants/MarketPlace/CollectionCard';
import {TouchableOpacity} from 'react-native-gesture-handler';
import useApi from '../../hooks/useApi';
import {API_NFT_URL} from '../../constants';

const CollectionListingPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const walletConnected = true;

  const {
    data: collections,
    isLoading,
    error,
    refetch,
  } = useApi(`${API_NFT_URL}/nftMarketplace_getCollections`, {method: 'GET'});

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ListingHeader title="Explore Collections" />

      {walletConnected && (
        <TouchableOpacity
          style={styles.myNftsButton}
          onPress={() => navigate('YourNFTs')}>
          <Text style={styles.myNftsButtonText}>View My NFTs</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Show Loader when data is still being fetched */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#008060" />
            <Text style={styles.loaderText}>Loading Collections...</Text>
          </View>
        ) : (
          // Show collections when data is fetched
          <>
            {!isLoading &&
              collections?.data.map((collection, index) => {
                if (index % 2 === 0) {
                  return (
                    <View key={collection.id} style={styles.row}>
                      <CollectionCard
                        collection={collection}
                        onPress={() =>
                          navigate('collectionDetails', {
                            collectionId: collection.id,
                            collectionName: collection.collectionName,
                          })
                        }
                      />
                      {collections?.data[index + 1] && (
                        <CollectionCard
                          collection={collections?.data[index + 1]}
                          onPress={() =>
                            navigate('collectionDetails', {
                              collectionId: collections?.data[index + 1].id,
                              collectionName:
                                collections?.data[index + 1].collectionName,
                            })
                          }
                        />
                      )}
                    </View>
                  );
                }
                return null;
              })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  myNftsButton: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    padding: 12,
    backgroundColor: '#008060',
    borderRadius: 10,
    alignItems: 'center',
  },
  myNftsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 18,
    color: '#008060',
  },
});

export default CollectionListingPage;
