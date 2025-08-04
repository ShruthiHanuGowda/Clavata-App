import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {format} from 'date-fns';
import {DText} from '../../../Componants/DText';
import TransactionFlatList from '../TransactionHistory/TransactionFlatList';
import {useTransactionHistory} from '../../../hooks/useTransactionHistory';
import {useAuth} from '../../../../screens/Provider/authProvider';

const MiniTransactionHistory = ({
  coinCode,
  name,
  showFilter,
  setShowFilter,
  contractAddress,
  limit = 20,
}) => {
  const {userDetails} = useAuth();

  // Get wallet address
  const coinCodesForDenergyWallet = ['watt', 'weurc', 'wusdc'];
  const wallet = coinCodesForDenergyWallet.includes(coinCode?.toLowerCase())
    ? userDetails?.userWallet
    : userDetails?.userWallet;

  // Use the transaction history hook
  const {
    transactions,
    loading,
    refreshing,
    isLoadingMore,
    hasMoreData,
    error,
    loadMoreTransactions,
    refreshTransactions,
  } = useTransactionHistory(limit, contractAddress, wallet);

  // Filter state for date ranges
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
  });

  // Display coin code formatting
  const getDisplayCoinCode = code => {
    switch (code?.toUpperCase()) {
      case 'WUSDC':
        return 'wUSDC';
      case 'WEURC':
        return 'wEURC';
      default:
        return code;
    }
  };

  return (
    <View style={{flex: 1}}>
      {/* Date Filter Display */}
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

      {/* Coin Code Display */}
      {coinCode && (
        <View>
          <DText
            fontStyle="fontRegular"
            style={{
              marginBottom: 22,
              fontSize: 14,
            }}>
            {transactions.length > 0 &&
              `${transactions.length} transactions in `}
            {getDisplayCoinCode(coinCode)}
          </DText>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={{marginBottom: 16}}>
          <DText style={{color: 'red', fontSize: 12, textAlign: 'center'}}>
            {error}
          </DText>
        </View>
      )}

      {/* Loading Indicator for Initial Load */}
      {loading && transactions.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50,
          }}>
          <ActivityIndicator size="large" color="#009D94" />
          <DText style={{marginTop: 10, color: '#666'}}>
            Loading transactions...
          </DText>
        </View>
      ) : (
        /* Transaction List */
        <TransactionFlatList
          data={transactions}
          name={name}
          refreshing={refreshing}
          onRefresh={refreshTransactions}
          isLoadingMore={isLoadingMore}
          hasMoreData={hasMoreData}
          onLoadMore={loadMoreTransactions}
          error={error}
        />
      )}
    </View>
  );
};

export default MiniTransactionHistory;
