import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import {NftToken} from '../../../types/types';
import useNftActivity from '../../../hooks/useNftActivity';
import ActivityEventText from './ActivityEventText';
import {getBlockExploreLink} from '../../../utils/explorer';

const MAX_PER_PAGE = 5;

interface ActivityCardProps {
  nft: NftToken;
}

const shortenAddress = (address: string = '') =>
  address.length > 10
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

const ActivityCard: React.FC<ActivityCardProps> = ({nft}) => {
  const [page, setPage] = useState(1);

  const {activity, loading, error} = useNftActivity(
    nft.tokenId,
    nft.collectionAddress,
  );

  const paginated = activity.slice(0, page * MAX_PER_PAGE);

  const handleLoadMore = () => {
    if (page * MAX_PER_PAGE < activity.length) {
      setPage(prev => prev + 1);
    }
  };

  const openExplorer = (url: string) => Linking.openURL(url);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#3498db" />
        <Text style={{marginTop: 8}}>Loading activity...</Text>
      </View>
    );
  }

  if (!activity.length) {
    return (
      <View style={styles.empty}>
        <Text>No activity found for this NFT.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {paginated.map((activity, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.activityCardHeader}>
            <Text style={styles.activityEvent}>{activity?.marketEvent}</Text>
            <TouchableOpacity
              onPress={() =>
                openExplorer(getBlockExploreLink(activity.tx, 'transaction'))
              }>
              <Text style={styles.activityExplorer}>🌐 Explorer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Event:</Text>
            <ActivityEventText marketEvent={activity?.marketEvent} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Price:</Text>
            <Text>{activity?.price}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>From:</Text>
            <Text style={styles.address}>
              {shortenAddress(activity?.seller)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To:</Text>
            <Text style={styles.address}>
              {shortenAddress(activity?.buyer ?? '-')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text>
              {new Date(parseInt(activity.timestamp) * 1000).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}

      {page * MAX_PER_PAGE < activity.length && (
        <TouchableOpacity onPress={handleLoadMore} style={styles.loadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  activityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityEvent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  activityExplorer: {
    fontSize: 12,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '600',
    color: '#555',
    marginRight: 8,
  },
  address: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#2c3e50',
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  empty: {
    alignItems: 'center',
    padding: 30,
  },
  loadMore: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ActivityCard;
