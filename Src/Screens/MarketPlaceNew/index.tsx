import React, {useEffect, useState} from 'react';
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
import {useMagic} from '../../../screens/Provider/MagicProvider';
import useCollections from '../../hooks/useCollections';

const CollectionListingPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {setActiveNetwork} = useMagic();

  const {collections, loading: isLoading, refetch} = useCollections();

  useEffect(() => {
    setActiveNetwork('denergy');
  }, []);

  const onRefresh = () => {
    refetch();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <ListingHeader title="Explore Collections" /> */}

      {/* <TouchableOpacity
        style={styles.myNftsButton}
        onPress={() => navigate('ProfileNFTs')}>
        <Text style={styles.myNftsButtonText}>View My NFTs</Text>
      </TouchableOpacity> */}

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#008060" />
            <Text style={styles.loaderText}>Loading Collections...</Text>
          </View>
        ) : (
          <>
            {!isLoading &&
              collections?.map((collection, index) => {
                if (index % 2 === 0) {
                  return (
                    <View key={collection.id} style={styles.row}>
                      <CollectionCard
                        collection={collection}
                        onPress={() =>
                          navigate('collectionDetails', {
                            contractAddress: collection.id,
                          })
                        }
                      />
                      {collections[index + 1] && (
                        <CollectionCard
                          collection={collections[index + 1]}
                          onPress={() =>
                            navigate('collectionDetails', {
                              contractAddress: collections[index + 1].id,
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
