import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {DText} from '../../../Componants/DText';
import TransactionFlatList from '../TransactionHistory/TransactionFlatList';
import {useTransactionHistory} from '../../../hooks/useTransactionHistory';
import {useAuth} from '../../../../screens/Provider/authProvider';

interface MiniTransactionHistoryProps {
  coinCode?: string;
  name?: string;
  contractAddress?: string | null;
  limit?: number;
}

const MiniTransactionHistory: React.FC<MiniTransactionHistoryProps> = ({
  coinCode,
  name,
  contractAddress,
  limit = 20,
}) => {
  const {userDetails} = useAuth();

  // Get wallet address
  const coinCodesForDenergyWallet: string[] = ['watt', 'weurc', 'wusdc'];
  const wallet = coinCodesForDenergyWallet.includes(
    coinCode?.toLowerCase() || '',
  )
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
  } = useTransactionHistory(limit, contractAddress || undefined, wallet || undefined);

  // Filter state for date ranges
  // const [filters, setFilters] = useState<FilterState>({
  //   startDate: '',
  //   endDate: '',
  //   type: '',
  // });

  // Display coin code formatting
  const getDisplayCoinCode = (code?: string): string => {
    if (!code) {
      return '';
    }

    switch (code.toUpperCase()) {
      case 'WUSDC':
        return 'wUSDC';
      case 'WEURC':
        return 'wEURC';
      default:
        return code;
    }
  };

  // const formatDateRange = (): string => {
  //   let dateRange = '';
  //   if (filters.startDate) {
  //     dateRange = format(new Date(filters.startDate), 'P');
  //   }
  //   if (filters.endDate) {
  //     dateRange += ' - ' + format(new Date(filters.endDate), 'P');
  //   }
  //   return dateRange;
  // };

  return (
    <View style={styles.container}>
      {/* Date Filter Display */}
      <View style={styles.filterContainer}>
        {/* <DText fontStyle="fontRegular" style={styles.filterText}>
          {formatDateRange()}
        </DText> */}
      </View>

      {/* Coin Code Display */}
      {coinCode && (
        <View>
          <DText fontStyle="fontRegular" style={styles.coinCodeText}>
            {transactions.length > 0 &&
              `${transactions.length} transactions in `}
            {getDisplayCoinCode(coinCode)}
          </DText>
        </View>
      )}

      {/* Error Display */}
      {error && transactions.length === 0 && (
        <View style={styles.errorContainer}>
          <DText style={styles.errorText}>{error}</DText>
        </View>
      )}

      {/* Loading Indicator for Initial Load */}
      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009D94" />
          <DText style={styles.loadingText}>Loading transactions...</DText>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterText: {
    marginBottom: 22,
    fontSize: 12,
  },
  coinCodeText: {
    marginBottom: 22,
    fontSize: 14,
  },
  errorContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

export default MiniTransactionHistory;
