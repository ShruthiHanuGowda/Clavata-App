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
import {useAuth} from '../../../../screens/Provider/authProvider';

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
  const {userDetails} = useAuth();

  const coinCodesForDenergyWallet = ['watt', 'weurc', 'wusdc'];

  const wallet = coinCodesForDenergyWallet.includes(
    coinCode.toLocaleLowerCase(),
  )
    ? userDetails?.userWallet
    : userDetails?.userWallet;
  const {
    transactions,
    formattedTransactions,
    loading,
    isLoadingMore,
    hasMoreData,
    loadMoreTransactions,
    refreshTransactions,
  } = useTransactionHistory(20, coinCode, wallet);
  // console.log('🚀 ~ formattedTransactions:', formattedTransactions);

  const [mockTransactions, setMockTransactions] = useState();
  console.log('🚀 ~ mockTransactions:', JSON.stringify(mockTransactions));

  // const {getAll, data, loading, count} = useTransaction();
  // console.log('🚀 ~ data :', JSON.stringify(data), coinCode);
  // const [open, setOpen] = useState(false);
  // console.log('🚀 ~ transactions :', JSON.stringify(transactions), loading);
  const [filters, setFilters] = useState(defaultFilter);

  useEffect(() => {
    setMockTransactions(formattedTransactions);
  }, [formattedTransactions]);

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
        <DText
          fontStyle="fontRegular"
          style={{
            marginBottom: 22,
            fontSize: 12,
          }}>
          {filters.startDate && format(filters.startDate, 'P')}
          {filters.endDate && ' - ' + format(filters.endDate, 'P')}
        </DText>
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
            {coinCode === 'WUSDC'
              ? 'wUSDC'
              : coinCode === 'WEURC'
              ? 'wEURC'
              : coinCode}
          </DText>
        </View>
      )}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <TransactionSectionList
          data={mockTransactions}
          hasMoreData={hasMoreData}
        />
      )}
    </View>
  );
}
