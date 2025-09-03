import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import {useWalletBalance, TokenBalance} from '../../Src/hooks/useWalletBalance';
import {useAuth} from './authProvider';

interface WalletContextType {
  // Balance and status info
  isBalanceLoading: boolean;
  isBalanceError: string | null;

  // Portfolio totals
  portfolio: {
    total: string;
    totalUsd: string;
  };

  // Functions
  getBalance: (tokenSymbol: string) => TokenBalance;
  refreshBalance: (tokenSymbol: string) => Promise<TokenBalance>;
  refreshAllBalances: () => Promise<void>;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export const WalletProvider = ({children}: {children: ReactNode}) => {
  const {userDetails} = useAuth();
  const {
    isLoading,
    error,
    getBalance,
    fetchSingleBalance,
    fetchAllBalances,
    tokenData,
  } = useWalletBalance();

  // Calculate portfolio totals
  const portfolio = useMemo(() => {
    // Initialize totals
    let totalUsdValue = 0;

    // Sum up all token balances in USD
    Object.values(tokenData).forEach(token => {
      totalUsdValue += parseFloat(token.balanceUsd || '0');
    });

    return {
      total: Object.keys(tokenData).length.toString(), // Count of different tokens
      totalUsd: totalUsdValue.toFixed(2),
    };
  }, [tokenData]);

  // Function to refresh a single token balance
  const refreshBalance = async (tokenSymbol: string): Promise<TokenBalance> => {
    if (!userDetails?.userWallet) {
      return {balance: '0', balanceUsd: '0'};
    }
    return await fetchSingleBalance(
      userDetails.userWallet,
      userDetails.userWallet,
      tokenSymbol,
    );
  };

  // Function to refresh all wallet balances
  const refreshAllBalances = async (): Promise<void> => {
    if (userDetails?.userWallet) {
      await fetchAllBalances(userDetails.userWallet, userDetails.userWallet);
    }
  };

  // Fetch all balances whenever userDetails changes and a wallet address is available
  useEffect(() => {
    let isCancelled = false;

    const fetchBalances = async () => {
      if (userDetails?.userWallet && userDetails?.userWallet && !isCancelled) {
        await fetchAllBalances(userDetails.userWallet, userDetails.userWallet);
      }
    };

    fetchBalances();

    return () => {
      isCancelled = true;
    };
  }, [userDetails, fetchAllBalances]);

  return (
    <WalletContext.Provider
      value={{
        // Status
        isBalanceLoading: isLoading,
        isBalanceError: error,

        // Portfolio data
        portfolio,

        // Functions
        getBalance,
        refreshBalance,
        refreshAllBalances,
      }}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the WalletContext
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
