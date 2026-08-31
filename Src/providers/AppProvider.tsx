import React, { ReactNode } from 'react';
import { GraphQLProvider } from './GraphQLProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SalonRegistrationProvider } from '../context/SalonRegistrationContext';
import { UserProvider } from '../context/UserContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <GraphQLProvider>
        <UserProvider>
          <SalonRegistrationProvider>
            {children}
          </SalonRegistrationProvider>
        </UserProvider>
      </GraphQLProvider>
    </SafeAreaProvider>
  );
};

export default AppProvider;
