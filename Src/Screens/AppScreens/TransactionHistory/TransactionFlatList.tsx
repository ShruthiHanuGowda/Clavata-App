import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import ListItem from './ListItem';
import styles from '../CoinWallet/styles';
import {DText} from '../../../Componants/DText';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionFlatList = ({
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
  const [selectedItems, setSelectedItems] = useState({});

  // Helper function to determine if we should show date header
  const shouldShowDateHeader = (item, index) => {
    if (index === 0) return true;

    const currentDate = moment(item.date).format('YYYY-MM-DD');
    const previousDate = moment(data[index - 1]?.date).format('YYYY-MM-DD');

    return currentDate !== previousDate;
  };

  // Format date for section headers
  const formatDateHeader = date => {
    const REFERENCE = moment();
    const TODAY = REFERENCE.clone().startOf('day');
    const YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
    const A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');

    const momentDate = moment(date);
    const isToday = momentDate.isSame(TODAY, 'd');
    const isYesterday = momentDate.isSame(YESTERDAY, 'd');
    const isWithinAWeek = momentDate.isAfter(A_WEEK_OLD);
    const checkWithin30Days = moment().diff(momentDate, 'days');

    if (isToday) return 'TODAY';
    if (isYesterday) return 'YESTERDAY';
    if (isWithinAWeek) return 'LAST WEEK';
    if (checkWithin30Days <= 30) return 'LAST 30 DAYS';
    return 'OLDER';
  };

  // Render date header
  const renderDateHeader = date => (
    <View style={styles.headerAlign}>
      <Text style={styles.header}>{formatDateHeader(date)}</Text>
      <View style={styles.borderLine} />
    </View>
  );

  // Set selected transaction for modal
  const setItems = items => {
    setSelectedItems(items);
    setTransactionDetailsVisible(true);
  };

  // Render individual transaction item
  const renderItem = ({item, index}) => (
    <View>
      {shouldShowDateHeader(item, index) && renderDateHeader(item.date)}
      <ListItem item={item} name={name} setSelectedItems={setItems} />
    </View>
  );

  // Render loading footer
  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={{padding: 20, alignItems: 'center'}}>
          <ActivityIndicator size="small" color="#009D94" />
        </View>
      );
    }

    if (hasMoreData && data.length > 0) {
      return (
        <TouchableOpacity
          onPress={onLoadMore}
          style={{
            alignItems: 'center',
            padding: 20,
          }}>
          <DText style={{color: '#009D94'}}>Load More</DText>
        </TouchableOpacity>
      );
    }

    return null;
  };

  // Render empty state
  const renderEmpty = () => {
    if (refreshing) return null;

    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 100,
        }}>
        <Text style={{fontSize: 16, color: '#666'}}>
          {/* {error ? `Error: ${error}` : 'No transactions found'} */}
        </Text>
        {error && (
          <TouchableOpacity
            onPress={onRefresh}
            style={{
              marginTop: 10,
              padding: 10,
              backgroundColor: '#009D94',
              borderRadius: 5,
            }}>
            <Text style={{color: 'white'}}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Handle end reached for pagination
  const handleEndReached = () => {
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
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
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
        getItemLayout={(data, index) => ({
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

export default TransactionFlatList;
