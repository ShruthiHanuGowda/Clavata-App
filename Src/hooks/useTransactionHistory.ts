import {useState, useEffect, useCallback} from 'react';
import moment from 'moment';

/**
 * Custom hook for managing transaction history with pagination
 * @param {number} initialLimit - Number of transactions to fetch per page
 * @param {string} contractAddress - Contract address for token transactions (optional)
 * @param {string} walletAddress - User's wallet address
 * @param {string} baseUrl - API base URL
 * @returns {Object} Transaction data and control functions
 */
export const useTransactionHistory = (
  initialLimit = 10,
  contractAddress = '',
  walletAddress = '',
  baseUrl = 'https://explorernew.denergytestnet.com/api',
) => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Format raw transaction data for UI consumption
   * @param {Object} transaction - Raw transaction data from API
   * @returns {Object} Formatted transaction object
   */
  const formatTransaction = (transaction: any) => {
    try {
      let tokenDecimal = transaction.tokenDecimal || 18;
      const amount =
        parseFloat(transaction.value) / Math.pow(10, parseInt(tokenDecimal));
      const date = new Date(parseInt(transaction.timeStamp) * 1000);
      // Determine transaction type based on from/to addresses
      let type = 'Transfer';
      if (transaction.from?.toLowerCase() === walletAddress?.toLowerCase()) {
        type = 'Withdrawal';
      } else if (
        transaction.to?.toLowerCase() === walletAddress?.toLowerCase()
      ) {
        type = 'Deposit';
      }

      // Determine status (API doesn't provide status, so we infer)
      const currentTime = Math.floor(Date.now() / 1000);
      const transactionTime = parseInt(transaction.timeStamp);
      const timeDiff = currentTime - transactionTime;

      // If transaction is very recent (< 5 minutes), mark as pending
      let status = 'Completed';
      // if (timeDiff < 10) {
      //   status = 'Pending';
      // }

      return {
        id: transaction.hash,
        date: moment(date).format('YYYY-MM-DD'),
        type: type,
        amount: amount,
        status: status,
        coinCode: transaction.tokenSymbol,
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        blockNumber: transaction.blockNumber,
        gasUsed: transaction.gasUsed,
        gasPrice: transaction.gasPrice,
        timestamp: transaction.timeStamp,
        tokenName: transaction.tokenName,
        tokenDecimal: transaction?.tokenDecimal
          ? transaction.tokenDecimal
          : contractAddress
          ? 6
          : 18,
        confirmations: transaction.confirmations,
        contractAddress: transaction.contractAddress,
        originalData: transaction,
      };
    } catch (err) {
      console.error('Error formatting transaction:', err);
      return null;
    }
  };

  /**
   * Group transactions by date sections for SectionList compatibility
   * @param {Array} transactionList - Array of formatted transactions
   * @returns {Array} Array of sections with title and data
   */
  const formatTransactionsForSectionList = (transactionList: any) => {
    const REFERENCE = moment();
    const TODAY = REFERENCE.clone().startOf('day');
    const YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
    const A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');

    const checkDate = (momentDate: any) => {
      const isToday = momentDate.isSame(TODAY, 'd');
      const isYesterday = momentDate.isSame(YESTERDAY, 'd');
      const isWithinAWeek = momentDate.isAfter(A_WEEK_OLD);
      const checkWithin30Days = moment().diff(momentDate, 'days');

      if (isToday) return 'TODAY';
      if (isYesterday) return 'YESTERDAY';
      if (isWithinAWeek) return 'LAST WEEK';
      if (checkWithin30Days <= 30) return 'LAST 30 DAYS';
      return 'OLDER';
    };

    return Object.values(
      transactionList.reduce((acc: any, item: any) => {
        const formattedDate = moment(item.date).format('YYYY-MM-DD');
        const title = checkDate(moment(formattedDate));

        if (!acc[title]) {
          acc[title] = {
            title,
            data: [],
          };
        }
        acc[title].data.push(item);
        return acc;
      }, {}),
    );
  };

  /**
   * Fetch transactions from the API
   * @param {number} page - Page number to fetch
   * @param {boolean} isRefresh - Whether this is a refresh operation
   */
  const fetchTransactions = async (page = 1, isRefresh = false) => {
    try {
      // Set appropriate loading state
      if (page === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let url;

      if (contractAddress && contractAddress.trim() !== '') {
        url = `${baseUrl}?module=account&action=tokentx&address=${walletAddress}&sort=desc&page=${page}&offset=${initialLimit}&contractaddress=${contractAddress}`;
      } else {
        url = `${baseUrl}?module=account&action=txlist&address=${walletAddress}&sort=desc&page=${page}&offset=${initialLimit}`;
      }

      console.log(`Fetching transactions: Page ${page}, URL: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.message === 'OK' && Array.isArray(data.result)) {
        const formattedData = data.result
          .map(formatTransaction)
          .filter(Boolean);
        console.log(formattedData);

        if (page === 1) {
          // First page - replace all data
          setTransactions(formattedData);
          setTotalCount(formattedData.length);
        } else {
          // Subsequent pages - append data
          setTransactions((prev: any) => {
            const newTransactions = [...prev, ...formattedData];
            setTotalCount(newTransactions.length);
            return newTransactions;
          });
        }

        // Check if we have more data to load
        // If we received fewer items than requested, we've reached the end
        setHasMoreData(data.result.length === initialLimit);
        setError(null);

        console.log(
          `Loaded ${formattedData.length} transactions for page ${page}`,
        );
      } else {
        // No data or error response
        console.log('No more data available or API error:', data);
        setHasMoreData(false);

        if (page === 1) {
          setTransactions([]);
          setTotalCount(0);
        }

        if (data.message !== 'OK') {
          setError(data.message || 'Failed to fetch transactions');
        }
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Network error occurred');
      setHasMoreData(false);

      if (page === 1) {
        setTransactions([]);
        setTotalCount(0);
      }
    } finally {
      // Clear all loading states
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  /**
   * Load more transactions (pagination)
   */
  const loadMoreTransactions = useCallback(() => {
    if (!isLoadingMore && hasMoreData && !loading && !refreshing) {
      const nextPage = currentPage + 1;
      console.log(`Loading more transactions: Page ${nextPage}`);
      setCurrentPage(nextPage);
      fetchTransactions(nextPage, false);
    }
  }, [currentPage, hasMoreData, isLoadingMore, loading, refreshing]);

  /**
   * Refresh transactions (pull to refresh)
   */
  const refreshTransactions = useCallback(() => {
    console.log('Refreshing transactions...');
    setCurrentPage(1);
    setHasMoreData(true);
    setError(null);
    fetchTransactions(1, true);
  }, []);

  /**
   * Filter transactions by date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Array} Filtered transactions
   */
  const filterTransactionsByDate = useCallback(
    (startDate: string, endDate: string) => {
      if (!startDate && !endDate) return transactions;

      return transactions.filter((transaction: any) => {
        const transactionDate = moment(transaction.date);

        if (startDate && transactionDate.isBefore(moment(startDate), 'day')) {
          return false;
        }

        if (endDate && transactionDate.isAfter(moment(endDate), 'day')) {
          return false;
        }

        return true;
      });
    },
    [transactions],
  );

  /**
   * Filter transactions by type
   * @param {string} type - Transaction type ('Deposit', 'Withdrawal', 'Transfer')
   * @returns {Array} Filtered transactions
   */
  const filterTransactionsByType = useCallback(
    (type: any) => {
      if (!type) return transactions;
      return transactions.filter(
        (transaction: any) => transaction.type === type,
      );
    },
    [transactions],
  );

  // Initial load effect - Modified to work with or without contractAddress
  useEffect(() => {
    if (walletAddress) {
      console.log('Initializing transaction history...', {
        walletAddress,
        contractAddress: contractAddress || 'Not provided',
      });
      setCurrentPage(1);
      setHasMoreData(true);
      setError(null);
      fetchTransactions(1, false);
    } else {
      console.log('Missing required wallet address');
      setTransactions([]);
      setTotalCount(0);
    }
  }, [walletAddress, contractAddress]);

  // Format transactions for SectionList
  const formattedTransactions = formatTransactionsForSectionList(transactions);

  // Return hook interface
  return {
    // Data
    transactions,
    formattedTransactions,
    totalCount,

    // Loading states
    loading,
    refreshing,
    isLoadingMore,
    hasMoreData,
    error,

    // Actions
    loadMoreTransactions,
    refreshTransactions,

    // Utility functions
    filterTransactionsByDate,
    filterTransactionsByType,

    // Additional actions
    refetch: refreshTransactions,
    reset: () => {
      setTransactions([]);
      setCurrentPage(1);
      setHasMoreData(true);
      setError(null);
      setTotalCount(0);
    },

    // Debug info
    currentPage,
  };
};

export default useTransactionHistory;
