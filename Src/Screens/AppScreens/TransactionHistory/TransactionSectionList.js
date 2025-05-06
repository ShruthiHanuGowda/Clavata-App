import moment from 'moment';
import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import ListItem from './ListItem';
import styles from './styles';
import { DText } from '../../../Componants/DText';
import TransactionDetailsModal from './TransactionDetailsModal';

//NOTE - This data is for testing UI
// const mockData = [
//   {
//     id: '1',
//     date: '2025-03-07',
//     type: 'Deposit',
//     amount: 0.001,
//     status: 'Success',
//     coinCode: 'WATT',
//   },
//   {
//     id: '2',
//     date: '2025-03-06',
//     type: 'Withdrawal',
//     amount: 50,
//     status: 'Pending',
//     coinCode: 'WATT',
//   },
//   {
//     id: '3',
//     date: '2025-03-05',
//     type: 'Transfer',
//     amount: 200,
//     status: 'Completed',
//     coinCode: 'WATT',
//   },
//   {
//     id: '4',
//     date: '2025-02-28',
//     type: 'Deposit',
//     amount: 300,
//     status: 'Completed',
//     coinCode: 'WATT',
//   },
//   {
//     id: '5',
//     date: '2025-01-20',
//     type: 'Withdrawal',
//     amount: 100,
//     status: 'Completed',
//     coinCode: 'WATT',
//   },
//   {
//     id: '6',
//     date: '2025-03-01',
//     type: 'Transfer',
//     amount: 500,
//     status: 'Failed',
//     coinCode: 'WATT',
//   },
//   {
//     id: '7',
//     date: '2025-02-15',
//     type: 'Deposit',
//     amount: 150,
//     status: 'Completed',
//     coinCode: 'WATT',
//   },
//   {
//     id: '8',
//     date: '2024-12-25',
//     type: 'Deposit',
//     amount: 350,
//     status: 'Completed',
//     coinCode: 'WATT',
//   },
// ];

const defaultFilters = {
  page: 1,
  limit: 20,
  startDate: '',
  endDate: '',
  type: '',
};

const TransactionSectionList = ({
  data,
  name = 'user',
  loadData = () => { },
  totalLength = 8,
  totalDataLength = 8,
  refreshing = false,
  _onRefresh = () => { },
  loadingExtraData = false,
  filters = defaultFilters,
  setFilters = () => { },
}) => {
  const [transactionDetailsVisible, setTransactionDetailsVisible] =
    useState(false);
  const [selectedItems, setSelectedItems] = useState({});

  // section title
  const REFERENCE = moment();
  const TODAY = REFERENCE.clone().startOf('day');
  const YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  const A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
  const isToday = momentDate => {
    return momentDate.isSame(TODAY, 'd');
  };
  const isYesterday = momentDate => {
    return momentDate.isSame(YESTERDAY, 'd');
  };
  const isWithinAWeek = momentDate => {
    return momentDate.isAfter(A_WEEK_OLD);
  };

  const checkDate = momentDate => {
    if (filters?.startDate) {
      return moment(momentDate).format('MMM YYYY');
    }
    const checktoday = isToday(moment(momentDate));
    const checkYesterday = isYesterday(moment(momentDate));
    const checkLastWeek = isWithinAWeek(moment(momentDate));
    const checkWithing30Days = moment().diff(moment(momentDate), 'days');
    const title = checktoday
      ? 'TODAY'
      : checkYesterday
        ? 'YESTERDAY'
        : checkLastWeek
          ? 'LAST WEEK'
          : checkWithing30Days <= 30
            ? 'LAST 30 DAYS'
            : 'OLDER';
    return title;
  };

  const SECTION_DATA = Object.values(
    data.reduce((acc, item) => {
      const formatedDate = moment(item.date).format('YYYY-MM-DD');
      const title = checkDate(formatedDate);
      if (!acc[title])
        acc[title] = {
          title,
          data: [],
        };
      acc[title].data.push(item);
      return acc;
    }, {}),
  );

  // console.log('SECTION_DATA????>>>>', JSON.stringify(SECTION_DATA));

  const renderEmpty = () => {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 100,
        }}>
        <Text>No transactions found</Text>
      </View>
    );
  };

  const setItems = items => {
    setSelectedItems(items);
    setTransactionDetailsVisible(true);
  };

  const onEndReached = () => {
    if (totalLength > data?.length && !refreshing) {
      setFilters({
        ...filters,
        page: filters.page + 1,
      });
    }
  };

  const renderFooter = () => {
    return data?.length > 0 && loadingExtraData && !refreshing ? (
      <ActivityIndicator />
    ) : (
      totalLength > data?.length && (
        <TouchableOpacity
          onPress={onEndReached}
          style={{
            alignItems: 'center',
          }}>
          <DText
            style={{
              color: '#009D94',
            }}>
            Load More
          </DText>
        </TouchableOpacity>
      )
    );
  };

  return (
    <>
      <SectionList
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <ListItem item={item} name={name} setSelectedItems={setItems} />
        )}
        refreshControl={
          <RefreshControl
            colors={['#9Bd35A', '#689F38']}
            refreshing={refreshing}
            onRefresh={_onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.headerAlign}>
            <Text style={styles.header}>{title}</Text>
            <View style={styles.borderLine} />
          </View>
        )}
        sections={SECTION_DATA}
        onEndReachedThreshold={50}
        keyExtractor={(item, index) => item + index}
        onEndReached={onEndReached}
        ListEmptyComponent={renderEmpty}
      />
      {renderFooter()}
      <TransactionDetailsModal
        visible={transactionDetailsVisible}
        setVisible={setTransactionDetailsVisible}
        selectedItems={selectedItems}
      />
    </>
  );
};

export default TransactionSectionList;
