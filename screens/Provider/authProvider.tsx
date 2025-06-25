// @ts-ignore
import React, {createContext, useState, ReactNode, useContext} from 'react';
import {useMutation} from '@apollo/client';
import {CREATE_USER_WALLETS} from '../../Src/graphql/queries';
import {Alert} from 'react-native';
import {UserAuth} from '../../Src/utils/type';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  updateUserData: (userData: UserAuth, isExist: boolean) => Promise<any>;
  updateUserDetails: (partialUserData: Partial<UserAuth>) => void;
  userDetails: UserAuth | null;
}

// Default context value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [createUserWallets] = useMutation(CREATE_USER_WALLETS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserAuth | null>(null);

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

  const handleSaveWalletToDB = async (user: UserAuth) => {
    console.log('🚀 ~ handleSaveWalletToDB ~ user:', user);

    const walletData = {
      emailAddress: user.emailAddress,
      userWallet: user.userWallet,
      date: user.date,
      is_verified: user?.is_verified,
      accessToken: '',
      applicantId: '',
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

  const updateUserData = async (userData: UserAuth, isExist: boolean) => {
    try {
      console.log('🚀 ~ updateUserData ~ userData:', userData);

      updateUserDetails(userData);
      if (!isExist) {
        return await handleSaveWalletToDB(userData);
      } else {
        return true;
      }
    } catch (error) {
      console.log('🚀 ~ updateUserData ~ error:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };

  // New function to update specific fields of userDetails
  const updateUserDetails = (partialUserData: Partial<UserAuth>) => {
    try {
      console.log('🚀 ~ updateUserDetails ~ partialUserData:', partialUserData);

      setUserDetails(prevUserDetails => {
        // If no existing user details, create new object with partial data
        if (!prevUserDetails) {
          console.log(
            'No existing user details found, creating new user details',
          );
          return partialUserData as UserAuth;
        }

        console.log('Existing user details found, merging with partial data');
        // Merge existing userDetails with new partial data
        return {
          ...prevUserDetails,
          ...partialUserData,
        };
      });
    } catch (error) {
      console.log('🚀 ~ updateUserData ~ error:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        updateUserData,
        updateUserDetails,
        userDetails,
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
