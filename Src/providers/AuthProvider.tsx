import React, {createContext, useState, ReactNode, useContext} from 'react';
import {useMutation} from '@apollo/client';
import {CREATE_USER_WALLETS} from '../graphql/queries';
import {UserAuth} from '../utils/type';

interface CreateUserWalletsResult {
  createUserWalletAddress: {
    emailAddress: string;
    userWallet: string;
    date: string;
    applicantId: string;
    accessToken: string;
  };
}

interface AuthContextType {
  updateUserData: (
    userData: UserAuth,
    isExist: boolean,
  ) => Promise<boolean | CreateUserWalletsResult>;
  updateUserDetails: (partialUserData: Partial<UserAuth>) => void;
  userDetails: UserAuth | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [createUserWallets] = useMutation(CREATE_USER_WALLETS);
  const [userDetails, setUserDetails] = useState<UserAuth | null>(null);

  const handleSaveWalletToDB = async (
    user: UserAuth,
  ): Promise<CreateUserWalletsResult> => {
    const walletData = {
      emailAddress: user.emailAddress,
      userWallet: user.userWallet,
      date: user.date,
      accessToken: '',
      applicantId: '',
    };

    try {
      const {data} = await createUserWallets({
        variables: {
          createuserwalletaddressinput: walletData,
        },
      });
      return data as CreateUserWalletsResult;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };

  const updateUserData = async (
    userData: UserAuth,
    isExist: boolean,
  ): Promise<boolean | CreateUserWalletsResult> => {
    try {
      updateUserDetails(userData);
      if (!isExist) {
        return await handleSaveWalletToDB(userData);
      } else {
        return true;
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };

  const updateUserDetails = (partialUserData: Partial<UserAuth>) => {
    try {
      setUserDetails(prevUserDetails => {
        if (!prevUserDetails) {
          return partialUserData as UserAuth;
        }
        return {
          ...prevUserDetails,
          ...partialUserData,
        };
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        updateUserData,
        updateUserDetails,
        userDetails,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};