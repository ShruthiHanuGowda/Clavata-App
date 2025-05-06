import React, {useEffect, useState} from 'react';
// import useTransaction from '../../../hooks/transaction';
import {ActivityIndicator, Image, View} from 'react-native';
// import TransactionSectionList from '../TrasactionHistory/TransactionSectionList';
import images from '../../../Theme/images';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {DatePickerModal} from 'react-native-paper-dates';
// import FilterBottomSheet from '../transactionHistory/FilterBottomSheet';
import {format} from 'date-fns';
import {DText} from '../../../Componants/DText';
import TransactionSectionList from '../TransactionHistory/TransactionSectionList';
import {useTransactionHistory} from '../../../hooks/useTransactionHistory';

const defaultFilter = {
  page: 1,
  limit: 20,
  mode: 'wallet',
  startDate: '',
  endDate: '',
  type: '',
};

export default function MiniTransactionHistory({
  coinCode,
  name,
  showFilter,
  setShowFilter,
}) {
  const {
    transactions,
    formattedTransactions,
    loading,
    isLoadingMore,
    hasMoreData,
    loadMoreTransactions,
    refreshTransactions,
  } = useTransactionHistory(20, coinCode);
  // console.log('🚀 ~ formattedTransactions:', formattedTransactions);

  const [mockTransactions, setMockTransactions] = useState();

  // const {getAll, data, loading, count} = useTransaction();
  // console.log('🚀 ~ data :', JSON.stringify(data), coinCode);
  // const [open, setOpen] = useState(false);
  // console.log('🚀 ~ transactions :', JSON.stringify(transactions), loading);
  const [filters, setFilters] = useState(defaultFilter);

  useEffect(() => {
    setMockTransactions(formattedTransactions);
  }, [formattedTransactions]);
  // const mockTransactions = [
  //   {
  //     _id: '1',
  //     amount: 1,
  //     coinCode: 'WEURC',
  //     date: '2025-04-29T14:21:56.803Z',
  //     status: 'success',
  //     type: 'send',
  //     change: '-',
  //     userName: 'Alex Williams',
  //   },
  //   {
  //     _id: '2',
  //     amount: 0.05,
  //     coinCode: 'ETH',
  //     date: '2025-04-28T13:06:02.181Z',
  //     status: 'success',
  //     type: 'Received',
  //     change: '+',
  //     userName: 'Sarah Johnson',
  //   },
  //   {
  //     _id: '3',
  //     amount: 0.1,
  //     coinCode: 'WATT',
  //     date: '2025-04-29T14:29:13.545Z',
  //     status: 'success',
  //     type: 'send',
  //     change: '-',
  //     userName: 'Michael Chen',
  //   },
  //   {
  //     _id: '4',
  //     amount: 0.00001,
  //     coinCode: 'ETH',
  //     date: '2025-04-28T13:07:38.797Z',
  //     status: 'pending',
  //     type: 'send',
  //     change: '-',
  //     userName: 'James Wilson',
  //   },
  //   {
  //     _id: '5',
  //     amount: 0.1,
  //     coinCode: 'WATT',
  //     date: '2025-04-29T14:30:53.255Z',
  //     status: 'success',
  //     type: 'Swap',
  //     change: '-',
  //     userName: 'Emma Brown',
  //   },
  //   {
  //     _id: '6',
  //     amount: 1,
  //     coinCode: 'WUSDC',
  //     date: '2025-04-29T14:21:09.103Z',
  //     status: 'failed',
  //     type: 'Bridge Deposit',
  //     change: '-',
  //     userName: 'David Miller',
  //   },
  //   {
  //     _id: '7',
  //     amount: 0.1,
  //     coinCode: 'EURC',
  //     date: '2025-04-29T14:08:06.715Z',
  //     status: 'success',
  //     type: 'Received',
  //     change: '+',
  //     userName: 'Jennifer Taylor',
  //   },
  //   {
  //     _id: '8',
  //     amount: 0.1,
  //     coinCode: 'USDC',
  //     date: '2025-04-29T14:07:02.100Z',
  //     status: 'success',
  //     type: 'Buy',
  //     change: '+',
  //     userName: 'Robert Garcia',
  //   },
  //   {
  //     _id: '9',
  //     amount: 0.00001,
  //     coinCode: 'ETH',
  //     date: '2025-04-28T13:08:52.381Z',
  //     status: 'success',
  //     type: 'Sell',
  //     change: '-',
  //     userName: 'Lisa Martinez',
  //   },
  // ];
  // const load = () => {
  //   getAll({...filters, coinCode});
  // };

  // useEffect(load, [
  //   filters.startDate,
  //   filters.endDate,
  //   filters.page,
  //   filters.type,
  // ]);

  const onOpen = () => {
    // setOpen(true);
  };

  const onDismiss = () => {
    // setOpen(false);
  };

  const onConfirm = data => {
    // onDismiss();
    // setFilters({
    //   ...filters,
    //   ...data,
    // });
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {/* <FilterBottomSheet
          filters={filters}
          setFilters={setFilters}
          showFilter={showFilter}
          setShowFilter={setShowFilter}
        /> */}
        {/* <DatePickerModal
          locale="en"
          mode="range"
          visible={true}
          onDismiss={onDismiss}
          startDate={filters?.startDate}
          endDate={filters?.endDate}
          onConfirm={onConfirm}
          closeIcon={images.back}
          editIcon={images.edit}
          calendarIcon={images.date}
        /> */}
        <DText
          fontStyle="fontRegular"
          style={{
            marginBottom: 22,
            fontSize: 12,
          }}>
          {filters.startDate && format(filters.startDate, 'P')}
          {filters.endDate && ' - ' + format(filters.endDate, 'P')}
        </DText>
        {/* <TouchableOpacity
          onPress={() => ''}
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginBottom: 22,
            backgroundColor: '#99DDB420',
            height: 32,
            paddingHorizontal: 12,
            borderColor: '#009D94',
            borderWidth: 1,
            borderRadius: 4,
          }}>
          <DText
            fontStyle="fontSemiBold"
            style={{
              fontSize: 14,
              marginRight: 4,
              color: '#6F727A',
            }}>
            Custom Period
          </DText>
          <Image source={images.date}></Image>
        </TouchableOpacity> */}
      </View>
      {coinCode && (
        <View>
          <DText
            fontStyle="fontRegular"
            style={{
              marginBottom: 22,
              fontSize: 14,
            }}>
            {/* All {data?.count} transaction in{' '} */}
            {/* {coinCode === 'WUSDC'
              ? 'wUSDC'
              : coinCode === 'WEURC'
              ? 'wEURC'
              : coinCode} */}
            WATT
          </DText>
        </View>
      )}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <TransactionSectionList data={mockTransactions} />
      )}
    </View>
  );
}
