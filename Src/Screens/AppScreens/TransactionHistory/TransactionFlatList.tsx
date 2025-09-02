import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import ListItem from './ListItem';
import styles from './styles';
import {DText} from '../../../Componants/DText';
import TransactionDetailsModal from './TransactionDetailsModal';

interface FlatListTransactionItem {
  id?: string;
  hash?: string;
  type: string;
  status: string;
  change?: string;
  amount: number;
  tokenAmount: number;
  coinCode: string;
  timestamp: string;
  userName?: string;
  date: string;
  [key: string]: any;
}

// Modal expects amount as string
interface ModalTransactionItem {
  details?: string;
  hash?: string;
  status?: string;
  change?: string;
  amount?: string;
  coinCode?: string;
  date?: string;
  [key: string]: any;
}

interface TransactionFlatListProps {
  data?: FlatListTransactionItem[];
  name?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  hasMoreData?: boolean;
  onLoadMore?: () => void;
  error?: string | null;
}

const TransactionFlatList: React.FC<TransactionFlatListProps> = ({
  data = [],
  name = 'user',
  refreshing = false,
  onRefresh = () => {},
  isLoadingMore = false,
  hasMoreData = false,
  onLoadMore = () => {},
  error = null,
}) => {
  const [transactionDetailsVisible, setTransactionDetailsVisible] =
    useState(false);
  const [selectedItems, setSelectedItems] = useState<ModalTransactionItem>(
    {} as ModalTransactionItem,
  );

  // Helper function to determine if we should show date header
  const shouldShowDateHeader = (
    item: FlatListTransactionItem,
    index: number,
  ): boolean => {
    if (index === 0) {
      return true;
    }

    const currentDate = moment(item.date).format('YYYY-MM-DD');
    const previousDate = moment(data[index - 1]?.date).format('YYYY-MM-DD');

    return currentDate !== previousDate;
  };

  // Format date for section headers
  const formatDateHeader = (date: string): string => {
    const REFERENCE = moment();
    const TODAY = REFERENCE.clone().startOf('day');
    const YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
    const A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');

    const momentDate = moment(date);
    const isToday = momentDate.isSame(TODAY, 'd');
    const isYesterday = momentDate.isSame(YESTERDAY, 'd');
    const isWithinAWeek = momentDate.isAfter(A_WEEK_OLD);
    const checkWithin30Days = moment().diff(momentDate, 'days');

    if (isToday) {
      return 'TODAY';
    }
    if (isYesterday) {
      return 'YESTERDAY';
    }
    if (isWithinAWeek) {
      return 'LAST WEEK';
    }
    if (checkWithin30Days <= 30) {
      return 'LAST 30 DAYS';
    }
    return 'OLDER';
  };

  // Render date header
  const renderDateHeader = (date: string): React.ReactElement => (
    <View style={styles.headerAlign}>
      <Text style={styles.header}>{formatDateHeader(date)}</Text>
      <View style={styles.borderLine} />
    </View>
  );

  // Set selected transaction for modal
  const setItems = (items: FlatListTransactionItem): void => {
    // Convert the transaction item to match TransactionDetailsModal interface
    const modalItem: ModalTransactionItem = {
      details: `${items.type} transaction`,
      hash: items.hash,
      status: items.status,
      change: items.change,
      amount: items.amount?.toString() || '0',
      coinCode: items.coinCode,
      date: items.date,
    };
    setSelectedItems(modalItem);
    setTransactionDetailsVisible(true);
  };

  // Render individual transaction item
  const renderItem = ({
    item,
    index,
  }: {
    item: FlatListTransactionItem;
    index: number;
  }): React.ReactElement => (
    <View>
      {shouldShowDateHeader(item, index) && renderDateHeader(item.date)}
      <ListItem item={item} name={name} setSelectedItems={setItems} />
    </View>
  );

  // Render loading footer
  const renderFooter = (): React.ReactElement | null => {
    if (isLoadingMore) {
      return (
        <View style={componentStyles.loadingFooter}>
          <ActivityIndicator size="small" color="#009D94" />
        </View>
      );
    }

    if (hasMoreData && data.length > 0) {
      return (
        <TouchableOpacity
          onPress={onLoadMore}
          style={componentStyles.loadMoreButton}>
          <DText style={componentStyles.loadMoreText}>Load More</DText>
        </TouchableOpacity>
      );
    }

    return null;
  };

  // Render empty state
  const renderEmpty = (): React.ReactElement | null => {
    if (refreshing) {
      return null;
    }

    return (
      <View style={componentStyles.emptyContainer}>
        <Text style={componentStyles.emptyText}>
          {/* {error ? `Error: ${error}` : 'No transactions found'} */}
        </Text>
        {error && (
          <TouchableOpacity
            onPress={onRefresh}
            style={componentStyles.retryButton}>
            <Text style={componentStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Handle end reached for pagination
  const handleEndReached = (): void => {
    if (hasMoreData && !isLoadingMore && !refreshing) {
      onLoadMore();
    }
  };

  return (
    <>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id || item.hash}-${index}`}
        contentContainerStyle={componentStyles.flatListContainer}
        refreshControl={
          <RefreshControl
            colors={['#9Bd35A', '#689F38']}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />

      <TransactionDetailsModal
        visible={transactionDetailsVisible}
        setVisible={setTransactionDetailsVisible}
        selectedItems={selectedItems}
      />
    </>
  );
};

const componentStyles = StyleSheet.create({
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    alignItems: 'center',
    padding: 20,
  },
  loadMoreText: {
    color: '#009D94',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#009D94',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
  },
  flatListContainer: {
    paddingBottom: 100,
    flexGrow: 1,
  },
});

export default TransactionFlatList;
