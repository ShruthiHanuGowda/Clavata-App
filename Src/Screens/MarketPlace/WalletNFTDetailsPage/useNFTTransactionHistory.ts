import {useState, useEffect, useMemo} from 'react';
import moment from 'moment';
import useApi from '../../../hooks/useApi';

// Types for NFT transaction data
export interface NFTTransaction {
  id: string;
  date: string;
  type: 'Mint' | 'Transfer' | 'Sale' | 'Burn';
  nftId: string;
  nftName: string;
  price?: number;
  currency?: string;
  from?: string;
  to?: string;
  hash?: string;
  status: 'Success' | 'Pending' | 'Failed';
  blockNumber?: number;
  gasUsed?: number;
}

interface NFTTransactionResponse {
  transactions: NFTTransaction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  items: object[];
}

interface UseNFTTransactionHistoryParams {
  limit?: number;
  nftId?: string;
  collectionAddress?: string;
  walletAddress?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export const useNFTTransactionHistory = (
  params: UseNFTTransactionHistoryParams = {},
) => {
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<NFTTransaction[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const {
    limit = 20,
    nftId,
    collectionAddress,
    walletAddress,
    type,
    startDate,
    endDate,
  } = params;

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (nftId) params.append('nftId', nftId);
    if (collectionAddress) params.append('collectionId', collectionAddress);
    if (walletAddress) params.append('walletAddress', walletAddress);
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return params.toString();
  }, [
    page,
    limit,
    nftId,
    collectionAddress,
    walletAddress,
    type,
    startDate,
    endDate,
  ]);

  // API call using useApi hook
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useApi<NFTTransactionResponse>(
    `https://explorernew.denergytestnet.com/api/v2/addresses/${walletAddress}/transactions?filter=${collectionAddress}`,
    {
      method: 'GET',
    },
  );

  // Update transactions when API response changes
  useEffect(() => {
    console?.log('apiResponse', JSON.stringify(apiResponse));
    if (apiResponse?.items) {
      setAllTransactions(apiResponse.items as NFTTransaction[]);
    }
  }, [apiResponse, page]);

  // Format transactions for display (similar to useTransactionHistory)
  const formattedTransactions = useMemo(() => {
    console?.log('apiResponse????', allTransactions);
    if (allTransactions?.length) {
      return allTransactions?.map(transaction => ({
        id: transaction.id,
        date: transaction.date,
        type: transaction.type,
        amount: transaction.price || 0,
        status: transaction.status,
        coinCode: transaction.currency || 'ETH',
        nftName: transaction.nftName,
        nftId: transaction.nftId,
        from: transaction.from,
        to: transaction.to,
        txHash: transaction.hash,
        blockNumber: transaction.blockNumber,
        gasUsed: transaction.gasUsed,
      }));
    }
  }, [allTransactions]);

  // Load more transactions
  const loadMoreTransactions = () => {
    if (hasMoreData && !isLoadingMore && !isLoading) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  // Refresh transactions
  const refreshTransactions = () => {
    setPage(1);
    setAllTransactions([]);
    setHasMoreData(true);
    refetch();
  };

  return {
    transactions: allTransactions,
    formattedTransactions,
    loading: isLoading && page === 1,
    isLoadingMore,
    hasMoreData,
    error,
    loadMoreTransactions,
    refreshTransactions,
    totalCount: apiResponse?.total || 0,
  };
};
