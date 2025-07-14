import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, View} from 'react-native';
import {format} from 'date-fns';
import {DText} from '../../../Componants/DText';
import {useAuth} from '../../../../screens/Provider/authProvider';
import TransactionSectionList from '../../AppScreens/TransactionHistory/TransactionSectionList';
import {useNFTTransactionHistory} from './useNFTTransactionHistory';
import EnergyCertificateList from './NFTHistory/EnergyCertificateList';

const defaultFilter = {
  page: 1,
  limit: 20,
  startDate: '',
  endDate: '',
  type: '',
};

export default function NFTDetailHistory({collectionAddress, nftName, nftId}) {
  const {userDetails} = useAuth();

  const {
    transactions,
    formattedTransactions,
    loading,
    isLoadingMore,
    hasMoreData,
    loadMoreTransactions,
    refreshTransactions,
    totalCount,
  } = useNFTTransactionHistory({
    collectionAddress: collectionAddress,
  });

  const [mockTransactions, setMockTransactions] = useState([]);
  console.log(
    'apiResponse🚀 ~ NFT mockTransactions:',
    JSON.stringify(mockTransactions[0]),
    loading,
  );

  const [filters, setFilters] = useState(defaultFilter);

  useEffect(() => {
    console.log('apiResponse transactions', transactions);
    setMockTransactions(transactions ?? []);
  }, [transactions]);

  return (
    <View style={{flex: 1}}>
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
      {(nftName || nftId) && (
        <View>
          <DText
            fontStyle="fontRegular"
            style={{
              marginBottom: 22,
              fontSize: 14,
            }}>
            {totalCount > 0 && `All ${totalCount} transactions for `}
            {nftName || `NFT #${nftId}`}
          </DText>
        </View>
      )}
      {loading ? (
        <ActivityIndicator />
      ) : (
        // <TransactionSectionList
        //   data={mockTransactions.length > 0 ? mockTransactions : []}
        //   hasMoreData={hasMoreData}
        //   loadingExtraData={isLoadingMore}
        //   _onRefresh={refreshTransactions}
        //   name={userDetails?.name || 'user'}
        //   setFilters={setFilters}
        //   filters={filters}
        // />
        <EnergyCertificateList
          data={mockTransactions.length > 0 ? mockTransactions : []}
          // onItemPress={handleItemPress}
          refreshing={false}
          // onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}
