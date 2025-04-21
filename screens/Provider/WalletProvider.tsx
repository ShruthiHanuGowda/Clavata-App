import React, {createContext, ReactNode, useContext, useEffect} from 'react';
import {useWalletBalance, TokenBalance} from '../../Src/hooks/useWalletBalance';
import {useAuth} from './authProvider';

interface WalletContextType {
  // Balance and status info
  isBalanceLoading: boolean;
  isBalanceError: string | null;

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
  console.log(
    '🚀 ~ WalletProvider ~ userDetails:',
    JSON?.stringify(userDetails),
  );
  const {isLoading, error, getBalance, fetchSingleBalance, fetchAllBalances} =
    useWalletBalance();

  // Function to refresh a single token balance
  const refreshBalance = async (tokenSymbol: string): Promise<TokenBalance> => {
    if (!userDetails?.ethereumWallet) {
      return {balance: '0', balanceUsd: '0'};
    }
    return await fetchSingleBalance(
      userDetails.ethereumWallet,
      userDetails.denergyWallet,
      tokenSymbol,
    );
  };

  // Function to refresh all wallet balances
  const refreshAllBalances = async (): Promise<void> => {
    if (userDetails?.ethereumWallet) {
      await fetchAllBalances(
        userDetails.ethereumWallet,
        userDetails.denergyWallet,
      );
    }
  };

  // Fetch all balances whenever userDetails changes and a wallet address is available
  useEffect(() => {
    if (userDetails?.ethereumWallet && userDetails?.denergyWallet) {
      fetchAllBalances(userDetails.ethereumWallet, userDetails.denergyWallet);
    }
  }, [userDetails, fetchAllBalances]);

  return (
    <WalletContext.Provider
      value={{
        // Status
        isBalanceLoading: isLoading,
        isBalanceError: error,

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
