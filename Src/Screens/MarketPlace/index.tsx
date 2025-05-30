import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {navigate} from '../../Navigation/NavigationFunctions';
import CollectionCard from '../../Componants/MarketPlace/CollectionCard';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import useCollections from '../../hooks/useCollections';
import {Header} from '@rneui/base';
import {DText} from '../../Componants/DText';

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
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#81c8c3" />
          <Text style={styles.loaderText}>Loading Collections...</Text>
        </View>
      ) : (
        <View>
          <Header
            containerStyle={{
              borderBottomWidth: 0,
            }}
            backgroundColor={'#FFF'}
            leftComponent={
              <View style={styles.nameContainer}>
                <DText style={styles.title} fontStyle="fontBold">
                  Marketplace
                </DText>
              </View>
            }
          />
          <ScrollView
            contentContainerStyle={styles.gridContainer}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }>
            <>
              {collections?.map(collection => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onPress={() =>
                    navigate('collectionDetails', {
                      contractAddress: collection.id,
                    })
                  }
                />
              ))}
            </>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  gridContainer: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    width: 200,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 18,
    color: '#81c8c3',
  },
});

export default CollectionListingPage;
