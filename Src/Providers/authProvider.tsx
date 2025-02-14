import React, {createContext, useState, ReactNode, useContext} from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  updateUserData: (userData: UserAuth) => void;
  userDetails: UserAuth | null;
}

interface UserAuth {
  issuer: string;
  publicAddress: string;
  email: string | null;
  phoneNumber: null | string;
  isMfaEnabled: boolean;
  recoveryFactors: string[];
}

// Default context value
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({children}: {children: ReactNode}) => {
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

  const updateUserData = (userData: UserAuth) => {
    setUserDetails(userData);
  };

  return (
    <AuthContext.Provider
      value={{isAuthenticated, login, logout, updateUserData, userDetails}}>
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
