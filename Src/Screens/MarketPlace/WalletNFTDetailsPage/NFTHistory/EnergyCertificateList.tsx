import {formatUnits} from 'ethers';
import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Linking,
  ListRenderItem,
} from 'react-native';
import {BottomSheet} from 'react-native-btr';
import {getBlockExploreLink} from '../../../../utils/explorer';

const THEME_COLOR = '#009D94';

// Type definitions
interface Address {
  hash?: string;
  address?: string;
  ens_domain_name?: string;
  name?: string;
}

interface Fee {
  value: string;
}

interface TransactionItem {
  name: string;
  hash: string;
  status: string;
  timestamp: string | number;
  country_image?: string;
  energy_type_image?: string;
  from: string | Address;
  to: string | Address;
  value: string;
  fee?: Fee;
  gas_price: string;
  gas_limit: string;
  tokenId?: number | string;
}

interface DateSeparatorItem {
  type: 'date';
  date: string;
  id: string;
}

interface HistoryItemData extends TransactionItem {
  type: 'item';
}

type FlatListItem = DateSeparatorItem | HistoryItemData;

interface HistoryItemProps {
  item: TransactionItem;
  onPress?: (item: TransactionItem) => void;
}

interface DateSeparatorProps {
  date: string;
}

interface BottomSheetContentProps {
  item: TransactionItem | null;
}

interface EnergyCertificateHistoryProps {
  data: TransactionItem[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({item, onPress}) => {
  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string | number): string => {
    if (!timestamp) {
      return 'N/A';
    }
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  // Helper function to get transaction hash (shortened)
  const getShortHash = (hash: string): string => {
    if (!hash) {
      return 'N/A';
    }
    return `${hash.substring(0, 15)}...${hash.substring(hash.length - 15)}`;
  };

  // Helper function to get status color
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return THEME_COLOR;
    }
  };

  return (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => onPress?.(item)}>
      <View style={styles.historyHeader}>
        <View style={styles.imageSection}>
          {item.country_image && (
            <Image
              source={{uri: item.country_image}}
              style={styles.countryFlag}
            />
          )}
          {item.energy_type_image && (
            <Image
              source={{uri: item.energy_type_image}}
              style={styles.energyIcon}
            />
          )}
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.historyDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hash:</Text>
              <Text style={styles.detailValue}>{getShortHash(item.hash)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text
                style={[
                  styles.detailValue,
                  {color: getStatusColor(item.status)},
                ]}>
                {item.status === 'ok' ? 'Success' : item?.status || 'Completed'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DateSeparator: React.FC<DateSeparatorProps> = ({date}) => {
  const formatDate = (dateString: string): string => {
    const today = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    }
    if (diffDays === 2) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.dateSeparator}>
      <Text style={styles.dateText}>{formatDate(date)}</Text>
    </View>
  );
};

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({item}) => {
  if (!item) {
    return null;
  }

  // Helper function to format timestamp
  const formatFullTimestamp = (timestamp: string | number): string => {
    if (!timestamp) {
      return 'N/A';
    }
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Helper function to format transaction hash
  const formatFullHash = (hash: string): string => {
    return hash || 'N/A';
  };

  // Helper function to format address
  const formatAddress = (address: string | Address): string => {
    if (!address) {
      return 'N/A';
    }

    // If address is an object, extract the actual address
    if (typeof address === 'object') {
      // Try to get the address from common properties
      return (
        address.hash ||
        address.address ||
        address.ens_domain_name ||
        address.name ||
        'N/A'
      );
    }

    // If it's already a string, return as is
    return address;
  };

  // Helper function to get status style
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return styles.statusSuccess;
      case 'pending':
        return styles.statusPending;
      case 'failed':
        return styles.statusFailed;
      default:
        return styles.statusDefault;
    }
  };

  const openExplorer = (hash: string): void => {
    const url = getBlockExploreLink(hash, 'transaction');
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.bottomSheetContent}>
      {/* Transaction Details */}
      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>

        <View style={styles.transactionGrid}>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>Transaction Hash</Text>
            <Pressable onPress={() => openExplorer(item.hash)}>
              <Text style={styles.transactionValue} numberOfLines={2}>
                {formatFullHash(item.hash)}
              </Text>
            </Pressable>
          </View>

          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>Status</Text>
            <Text
              style={[
                styles.transactionValue,
                getStatusStyle(item.status || 'Completed'),
              ]}>
              {item.status === 'ok' ? 'Success' : item?.status || 'Completed'}
            </Text>
          </View>

          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>Timestamp</Text>
            <Text style={styles.transactionValue}>
              {formatFullTimestamp(item.timestamp)}
            </Text>
          </View>

          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>From</Text>
            <Text style={styles.transactionValue} numberOfLines={2}>
              {formatAddress(item.from)}
            </Text>
          </View>

          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>To</Text>
            <Text style={styles.transactionValue} numberOfLines={2}>
              {formatAddress(item.to)}
            </Text>
          </View>

          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>Value</Text>
            <Text style={styles.transactionValue}>
              {formatUnits(item.value, 18) || '0'} WATT
            </Text>
          </View>

          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>Transaction Fee</Text>
            <Text style={styles.transactionValue}>
              {formatUnits(item.fee?.value || '0', 18) || 'N/A'} WATT
            </Text>
          </View>

          <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>Gas Price</Text>
            <Text style={styles.transactionValue}>
              {formatUnits(item.gas_price, 18) || 'N/A'} WATT
            </Text>
          </View>

          <View style={[styles.transactionItem, {marginBottom: 20}]}>
            <Text style={styles.transactionLabel}>Gas Usage & Limit</Text>
            <Text style={styles.transactionValue}>
              {item.gas_limit || 'N/A'}
            </Text>
          </View>

          {/* <View style={styles.transactionItem}>
            <Text style={styles.transactionLabel}>Gas Fees (Gwei)</Text>
            <Text style={styles.transactionValue}>
              {item.gasFees || 'N/A'} Gwei
            </Text>
          </View> */}
        </View>
      </View>
    </ScrollView>
  );
};

const EnergyCertificateHistory: React.FC<EnergyCertificateHistoryProps> = ({
  data,
  refreshing,
  onRefresh,
}) => {
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(
    null,
  );

  // Group data by date
  const groupDataByDate = (
    data: TransactionItem[],
  ): Record<string, TransactionItem[]> => {
    const grouped: Record<string, TransactionItem[]> = {};
    data.forEach(item => {
      // Use timestamp or fallback to current date
      const date = item.timestamp
        ? new Date(item.timestamp).toDateString()
        : new Date().toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const handleItemPress = (item: TransactionItem): void => {
    setSelectedItem(item);
    setBottomSheetVisible(true);
  };

  const groupedData = groupDataByDate(data || []);
  const sortedDates = Object.keys(groupedData).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const renderItem: ListRenderItem<FlatListItem> = ({item}) => {
    if (item.type === 'date') {
      return <DateSeparator date={item.date} />;
    }
    return <HistoryItem item={item} onPress={handleItemPress} />;
  };

  // Flatten data with date separators
  const flattenedData: FlatListItem[] = [];
  sortedDates.forEach(date => {
    flattenedData.push({type: 'date', date, id: `date-${date}`});
    groupedData[date].forEach(item => {
      flattenedData.push({...item, type: 'item'});
    });
  });

  const keyExtractor = (item: FlatListItem): string =>
    item.type === 'date'
      ? item.id
      : (item as HistoryItemData).tokenId?.toString() ||
        Math.random().toString();

  return (
    <View style={styles.container}>
      <FlatList
        data={flattenedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
      />

      <BottomSheet
        visible={bottomSheetVisible}
        onBackButtonPress={() => setBottomSheetVisible(false)}
        onBackdropPress={() => setBottomSheetVisible(false)}>
        <View style={styles.bottomSheetCard}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Transaction Details</Text>
            <TouchableOpacity
              onPress={() => setBottomSheetVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <BottomSheetContent item={selectedItem} />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  // Date Separator Styles
  dateSeparator: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLOR,
    textAlign: 'center',
  },
  // History Item Styles
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageSection: {
    flexDirection: 'row',
    marginRight: 12,
  },
  countryFlag: {
    width: 24,
    height: 18,
    borderRadius: 2,
    marginRight: 6,
  },
  energyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  historyDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    // justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    width: '15%',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    width: '80%',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  // Bottom Sheet Styles
  bottomSheetCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
  },
  bottomSheetContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLOR,
    marginBottom: 16,
  },
  transactionSection: {
    marginBottom: 20,
  },
  transactionGrid: {
    gap: 16,
  },
  transactionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLOR,
  },
  transactionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  statusPending: {
    color: '#FF9800',
  },
  statusFailed: {
    color: '#F44336',
  },
  statusDefault: {
    color: THEME_COLOR,
  },
});

export default EnergyCertificateHistory;
