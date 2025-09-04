// @ts-ignore
import React, {createContext, useState, ReactNode, useContext} from 'react';
import {useMutation} from '@apollo/client';
import {CREATE_USER_WALLETS} from '../../Src/graphql/queries';
import {UserAuth} from '../../Src/utils/type';

// GraphQL result type for CREATE_USER_WALLETS
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

// Default context value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [createUserWallets] = useMutation(CREATE_USER_WALLETS);
  const [userDetails, setUserDetails] = useState<UserAuth | null>(null);

  const handleSaveWalletToDB = async (
    user: UserAuth,
  ): Promise<CreateUserWalletsResult> => {
    console.log('🚀 ~ handleSaveWalletToDB ~ user:', user);

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
