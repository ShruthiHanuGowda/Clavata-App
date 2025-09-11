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
import {Activity} from '../../../types/types';
import ActivityEventText from './ActivityEventText';
import {getBlockExploreLink} from '../../../utils/explorer';

const MAX_PER_PAGE = 5;

interface ActivityCardProps {
  activity: Activity[];
  loading: boolean;
}

const shortenAddress = (address: string = '') =>
  address.length > 10
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

const ActivityCard: React.FC<ActivityCardProps> = ({activity, loading}) => {
  const [page, setPage] = useState(1);

  const paginated = activity.slice(0, page * MAX_PER_PAGE);

  const handleLoadMore = () => {
    if (page * MAX_PER_PAGE < activity.length) {
      setPage(prev => prev + 1);
    }
  };

  const openExplorer = (url: string) => Linking.openURL(url);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.loadingText}>Loading activity...</Text>
        </View>
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
      {paginated.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.activityCardHeader}>
            <Text style={styles.activityEvent}>{item?.marketEvent}</Text>
            <TouchableOpacity
              onPress={() =>
                openExplorer(getBlockExploreLink(item.tx, 'transaction'))
              }>
              <Text style={styles.activityExplorer}>🌐 Explorer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Event:</Text>
            <ActivityEventText marketEvent={item?.marketEvent} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Price:</Text>
            <Text>{item?.price}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>From:</Text>
            <Text style={styles.address}>{shortenAddress(item?.seller)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To:</Text>
            <Text style={styles.address}>
              {shortenAddress(item?.buyer ?? '-')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text>
              {new Date(parseInt(item.timestamp, 10) * 1000).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}

      {page * MAX_PER_PAGE < activity.length && (
        <View style={styles.loadMoreWrapper}>
          <TouchableOpacity onPress={handleLoadMore} style={styles.loadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
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
  loadingText: {
    marginTop: 8,
  },
  empty: {
    alignItems: 'center',
    padding: 30,
  },
  loadMoreWrapper: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMore: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ActivityCard;
