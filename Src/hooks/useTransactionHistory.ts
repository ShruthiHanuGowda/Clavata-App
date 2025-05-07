import {useState} from 'react';
import {useQuery, ApolloError} from '@apollo/client';
import {LIST_TRANSACTION_HISTORY} from '../graphql/queries';
import {useAuth} from '../../screens/Provider/authProvider';

// Define the types for our transaction history data
interface TransactionItem {
  amount: string;
  coinCode: string;
  createdAt: string;
  from: string;
  method: string;
  to: string;
  transactionHash: string;
  transactionStatus: string;
  txnFee: string;
}

// Type for formatted data compatible with ListItem component
interface FormattedTransactionItem {
  _id: string;
  amount: number;
  coinCode: string;
  date: string;
  status: string;
  type: string;
  change: string;
  userName: string;
}

interface TransactionHistoryData {
  listTransactionHistoryMobiles: {
    nextToken: string | null;
    items: TransactionItem[];
  };
}

interface TransactionHistoryVars {
  limit?: number;
  nextToken?: string;
}

export const useTransactionHistory = (
  defaultLimit: number = 3,
  coinCode: string,
  wallet: string,
) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [formattedTransactions, setFormattedTransactions] = useState<
    FormattedTransactionItem[]
  >([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<ApolloError | null>(null);

  const {userDetails} = useAuth();

  const coinCodesForDenergyWallet = ['watt', 'weurc', 'wusdc'];

  const walletAddress = coinCodesForDenergyWallet.includes(
    coinCode.toLocaleLowerCase(),
  )
    ? userDetails?.denergyWallet
    : userDetails?.ethereumWallet;

  // Transform transactions to format needed by ListItem component
  const transformTransactions = (
    rawData: TransactionItem[],
  ): FormattedTransactionItem[] => {
    return rawData.map((item, index) => {
      console.log('🚀 ~ returnrawData.map ~ item:', item);
      let fromAddress = item.from;
      let type = fromAddress === walletAddress ? 'send' : 'Received';

      const isSending =
        type === 'send' || type === 'Sell' || type === 'Bridge Deposit';
      const change = isSending ? '-' : '+';

      const addressToUse = isSending ? item.to : item.from;
      const userName = generateUserName(addressToUse);

      return {
        _id: item.transactionHash || index.toString(),
        amount: parseFloat(item.amount),
        coinCode: item.coinCode,
        date: item.createdAt,
        status: item.transactionStatus,
        type: type,
        change: change,
        userName: userName,
      };
    });
  };

  // Helper function to generate a username from address
  const generateUserName = (address: string): string => {
    // Simple implementation to generate consistent names
    const names = [
      'John Doe',
      'Jane Smith',
      'Robert Johnson',
      'Mary Williams',
      'Michael Brown',
      'Jennifer Davis',
      'William Miller',
      'Patricia Wilson',
      'Richard Moore',
      'Linda Taylor',
    ];

    // Use the last characters of the address to select a name
    const lastChars = address.slice(-2);
    const index = parseInt(lastChars, 16) % names.length;
    return names[index];
  };

  const {loading, error, refetch} = useQuery<
    TransactionHistoryData,
    TransactionHistoryVars
  >(LIST_TRANSACTION_HISTORY, {
    variables: {
      filter: {
        or: [{from: {contains: wallet}}, {to: {contains: wallet}}],
        coinCode: {eq: coinCode},
      },
      limit: defaultLimit,
      nextToken: null,
    },
    onCompleted: data => {
      if (data?.listTransactionHistoryMobiles) {
        const rawData = data.listTransactionHistoryMobiles.items;
        console.log('🚀 ~ rawData:', JSON.stringify(rawData));
        setTransactions(rawData);
        setFormattedTransactions(transformTransactions(rawData));
        setNextToken(data.listTransactionHistoryMobiles.nextToken);
        setQueryError(null);
      }
    },
    onError: error => {
      console.error('Error fetching transaction history:', error);
      setQueryError(error);
      setTransactions([]);
      setFormattedTransactions([]);
      setNextToken(null);
    },
    fetchPolicy: 'network-only',
  });

  // Load more data using the nextToken from previous response
  const loadMoreTransactions = async (customLimit?: number) => {
    if (!nextToken || isLoadingMore) return;

    setIsLoadingMore(true);
    setQueryError(null);

    try {
      const {data} = await refetch({
        limit: customLimit || defaultLimit,
        nextToken: nextToken,
      });

      if (data?.listTransactionHistoryMobiles) {
        const newRawData = data.listTransactionHistoryMobiles.items;
        const newFormattedData = transformTransactions(newRawData);

        setTransactions(prev => [...prev, ...newRawData]);
        setFormattedTransactions(prev => [...prev, ...newFormattedData]);
        setNextToken(data.listTransactionHistoryMobiles.nextToken);
      }
    } catch (err) {
      console.error('Error loading more transactions:', err);
      if (err instanceof ApolloError) {
        setQueryError(err);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Refresh the list from the beginning
  const refreshTransactions = async (customLimit?: number) => {
    setQueryError(null);

    try {
      const {data} = await refetch({
        limit: customLimit || defaultLimit,
        nextToken: null,
      });

      if (data?.listTransactionHistoryMobiles) {
        const rawData = data.listTransactionHistoryMobiles.items;
        setTransactions(rawData);
        setFormattedTransactions(transformTransactions(rawData));
        setNextToken(data.listTransactionHistoryMobiles.nextToken);
      }
    } catch (err) {
      console.error('Error refreshing transactions:', err);
      if (err instanceof ApolloError) {
        setQueryError(err);
      }
      setTransactions([]);
      setFormattedTransactions([]);
      setNextToken(null);
    }
  };

  return {
    transactions, // Original data from API
    formattedTransactions, // Transformed data for ListItem
    loading,
    isLoadingMore,
    error: queryError || error,
    hasMoreData: !!nextToken,
    loadMoreTransactions,
    refreshTransactions,
  };
};
