import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {DText} from '../../../Componants/DText';
import {useAuth} from '../../../../screens/Provider/authProvider';
import EnergyCertificateHistory from './NFTHistory/EnergyCertificateList';
import {
  NFTTransaction,
  useNFTTransactionHistory,
} from './useNFTTransactionHistory';
import {navigateBack} from '../../../utils/navigationService';

const THEME_COLOR = '#009D94';

export default function NFTDetailHistory({route}: {route: any}) {
  const {collectionAddress, nftName, nftId} = route?.params;
  const {userDetails} = useAuth();

  const {transactions, loading, refreshTransactions} = useNFTTransactionHistory(
    {
      collectionAddress: collectionAddress,
      walletAddress: userDetails?.userWallet || '',
    },
  );

  const [mockTransactions, setMockTransactions] = useState<NFTTransaction[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);
  // const [filters, setFilters] = useState(defaultFilter);

  useEffect(() => {
    setMockTransactions(transactions ?? []);
  }, [transactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGoBack = () => {
    navigateBack();
  };

  // const formatDateRange = () => {
  //   if (!filters.startDate && !filters.endDate) {
  //     return '';
  //   }

  //   let dateRange = '';
  //   if (filters.startDate) {
  //     dateRange += format(new Date(filters.startDate), 'MMM dd, yyyy');
  //   }
  //   if (filters.endDate) {
  //     dateRange += ` - ${format(new Date(filters.endDate), 'MMM dd, yyyy')}`;
  //   }
  //   return dateRange;
  // };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Back Arrow and Title */}
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <DText style={styles.backArrow}>←</DText>
        </TouchableOpacity>
        {/* <View style={styles.headerTitleContainer}>
          <DText fontStyle="fontSemiBold" style={styles.headerTitle}>
            Transaction History
          </DText>
        </View>
        <View style={styles.placeholder} /> */}
        {(nftName || nftId) && (
          <View style={styles.headerTitleContainer}>
            <DText fontStyle="fontSemiBold" style={styles.nftTitle}>
              {nftName || `NFT #${nftId}`}
            </DText>
          </View>
        )}
      </View>

      {/* Date Filter Display */}
      {/* {formatDateRange() && (
        <View style={styles.dateFilterContainer}>
          <DText fontStyle="fontRegular" style={styles.dateFilterText}>
            {formatDateRange()}
          </DText>
        </View>
      )} */}

      {/* NFT Information */}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <DText style={styles.emptyStateIconText}>📊</DText>
      </View>
      {/* <DText fontStyle="fontSemiBold" style={styles.emptyStateTitle}>
        No Transactions Found
      </DText> */}
      <DText fontStyle="fontRegular" style={styles.emptyStateMessage}>
        {nftName || `NFT #${nftId}`} doesn't have any transaction history yet.
      </DText>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <DText style={styles.refreshButtonText}>Refresh</DText>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={THEME_COLOR} />
      <DText fontStyle="fontRegular" style={styles.loadingText}>
        Loading transaction history...
      </DText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderHeader()}

        {loading ? (
          renderLoadingState()
        ) : mockTransactions.length > 0 ? (
          <View style={styles.listContainer}>
            <EnergyCertificateHistory
              data={mockTransactions}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  backButton: {
    width: 40,
    height: 20,
    borderRadius: 20,
    // backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: THEME_COLOR,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  dateFilterContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  dateFilterText: {
    fontSize: 12,
    color: '#666',
  },
  nftInfoContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  nftTitle: {
    fontSize: 16,
    color: THEME_COLOR,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
