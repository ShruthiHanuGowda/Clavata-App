import React, {useEffect, useState} from 'react';
// import useTransaction from '../../../hooks/transaction';
import {Image, View} from 'react-native';
// import TransactionSectionList from '../TrasactionHistory/TransactionSectionList';
import images from '../../../Theme/images';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {DatePickerModal} from 'react-native-paper-dates';
// import FilterBottomSheet from '../transactionHistory/FilterBottomSheet';
import {format} from 'date-fns';
import {DText} from '../../../Componants/DText';
import TransactionSectionList from '../TransactionHistory/TransactionSectionList';

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
  // const {getAll, data, loading, count} = useTransaction();
  // console.log('🚀 ~ data :', JSON.stringify(data), coinCode);
  // const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilter);
  const mockTransactions = [
    {
      id: '1',
      type: 'Deposit',
      amount: 150,
      date: '2025-03-01',
      status: 'Completed',
    },
    {
      id: '2',
      type: 'Withdrawal',
      amount: 50,
      date: '2025-03-02',
      status: 'Pending',
    },
    {
      id: '3',
      type: 'Deposit',
      amount: 200,
      date: '2025-03-03',
      status: 'Completed',
    },
    {
      id: '4',
      type: 'Transfer',
      amount: 75,
      date: '2025-03-04',
      status: 'Completed',
    },
    {
      id: '5',
      type: 'Deposit',
      amount: 100,
      date: '2025-03-05',
      status: 'Failed',
    },
  ];
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
        <TouchableOpacity
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
        </TouchableOpacity>
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
      <TransactionSectionList />
    </View>
  );
}
