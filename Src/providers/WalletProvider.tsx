import React, {createContext, ReactNode, useContext, useMemo} from 'react';
import {useWalletBalance, TokenBalance} from '../hooks/useWalletBalance';
import {useAuth} from './AuthProvider';

interface WalletContextType {
  isBalanceLoading: boolean;
  isBalanceError: string | null;
  portfolio: {
    total: string;
    totalUsd: string;
  };
  getBalance: (tokenSymbol: string) => TokenBalance;
  refreshBalance: (tokenSymbol: string) => Promise<TokenBalance>;
  refreshAllBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

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

  const portfolio = useMemo(() => {
    let totalUsdValue = 0;

    Object.values(tokenData).forEach(token => {
      totalUsdValue += parseFloat(token.balanceUsd || '0');
    });

    return {
      total: Object.keys(tokenData).length.toString(),
      totalUsd: totalUsdValue.toFixed(2),
    };
  }, [tokenData]);

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

  const refreshAllBalances = async (): Promise<void> => {
    if (userDetails?.userWallet) {
      await fetchAllBalances(userDetails.userWallet, userDetails.userWallet);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isBalanceLoading: isLoading,
        isBalanceError: error,
        portfolio,
        getBalance,
        refreshBalance,
        refreshAllBalances,
      }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
