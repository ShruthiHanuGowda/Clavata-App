// @ts-ignore
import React, {createContext, useState, ReactNode, useContext, useEffect} from 'react';
import {useMutation} from '@apollo/client';
import {CREATE_USER_WALLETS} from '../../Src/graphql/queries';
import {Alert} from 'react-native';
import {useWalletBalance} from '../../Src/hooks/useWalletBalance';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  updateUserData: (userData: UserAuth, isExist: Boolean) => void;
  userDetails: UserAuth | null;
  walletBalances: {
    wattsBalance: string;
    ethBalance: string;
    denergyUsdcBalance: string;
    denergyEurcBalance: string;
    sepoliaUsdcBalance: string;
    sepoliaEurcBalance: string;
    isBalanceLoading: boolean;
    // USD
    wattsBalanceUsd: string;
    ethBalanceUsd: string;
    denergyUsdcBalanceUsd: string;
    denergyEurcBalanceUsd: string;
    sepoliaUsdcBalanceUsd: string;
    sepoliaEurcBalanceUsd: string;
    isBalanceError: string | null;
  };
  refreshBalances: () => Promise<void>;
}

interface UserAuth {
  date: string;
  denergyWallet: string;
  ethereumWallet: string;
  is_verified: boolean | string;
  userWallet: string | null;
  walletAddress: string | null;
}

// Default context value
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [createUserWallets] = useMutation(CREATE_USER_WALLETS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserAuth | null>(null);

  const {
    wattsBalance,
    ethBalance,
    denergyUsdcBalance,
    denergyEurcBalance,
    sepoliaUsdcBalance,
    sepoliaEurcBalance,
    wattsBalanceUsd,
    ethBalanceUsd,
    denergyUsdcBalanceUsd,
    denergyEurcBalanceUsd,
    sepoliaUsdcBalanceUsd,
    sepoliaEurcBalanceUsd,
    isBalanceLoading,
    isBalanceError,
    fetchBalances,
  } = useWalletBalance();

  // Function to simulate login
  const login = () => {
    setIsAuthenticated(true);
    console.log('User logged in');
  };

  // Function to simulate logout
  const logout = () => {
    setIsAuthenticated(false);
    console.log('User logged out');
  };

  const handleSaveWalletToDB = async user => {
    const walletData = {
      walletAddress: user.walletAddress,
      ethereumWallet: user.ethereumWallet,
      denergyWallet: user.denergyWallet,
      userWallet: user.userWallet,
      date: user.date,
      is_verified: user?.is_verified,
    };

    try {
      const {data} = await createUserWallets({
        variables: {
          createuserwalletaddressinput: walletData,
        },
      });
      return data;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const updateUserData = async (userData: UserAuth, isExist) => {
    try {
      setUserDetails(userData);
      if (!isExist) {
        return await handleSaveWalletToDB(userData);
      } else {
        return true;
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  // Function to refresh wallet balances
  const refreshBalances = async () => {
    if (userDetails?.userWallet) {
      await fetchBalances(userDetails.userWallet);
    }
  };

  // Fetch balances whenever userDetails changes and a wallet address is available
  useEffect(() => {
    if (userDetails?.userWallet) {
      fetchBalances(userDetails.userWallet);
    }
  }, [userDetails, fetchBalances]);

  const walletBalances = {
    wattsBalance,
    ethBalance,
    denergyUsdcBalance,
    denergyEurcBalance,
    sepoliaUsdcBalance,
    sepoliaEurcBalance,
    isBalanceLoading,
    isBalanceError,
    wattsBalanceUsd,
    ethBalanceUsd,
    denergyUsdcBalanceUsd,
    denergyEurcBalanceUsd,
    sepoliaUsdcBalanceUsd,
    sepoliaEurcBalanceUsd,
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated, login, logout, updateUserData, userDetails, walletBalances,
        refreshBalances,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
