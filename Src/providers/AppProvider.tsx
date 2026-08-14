import React, { ReactNode } from 'react';
// import {MagicProvider} from './MagicProvider';
import { GraphQLProvider } from './GraphQLProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SalonRegistrationProvider } from '../context/SalonRegistrationContext';
// import {AuthProvider} from './AuthProvider';
// import {WalletProvider} from './WalletProvider';
// import {WalletConnectProvider} from './WalletConnectProvider';
// import {KycProvider} from './KycProvider';
// import { NftProvider } from './NftProvider';
import { MAGIC_API_KEY_PROD } from '../constants/constants';
import { UserProvider } from '../context/UserContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    // <MagicProvider apiKey={MAGIC_API_KEY_PROD}>
    <SafeAreaProvider>
      <GraphQLProvider>
        <UserProvider>
          <SalonRegistrationProvider>
            {/* <AuthProvider> */}
            {/* <WalletConnectProvider> */}
            {/* <KycProvider> */}
            {/* <WalletProvider> */}
            {/* <NftProvider> */}
            {children}
            {/* </NftProvider> */}
            {/* </WalletProvider> */}
            {/* </KycProvider> */}
            {/* </WalletConnectProvider> */}
            {/* </AuthProvider> */}
          </SalonRegistrationProvider>
        </UserProvider>
      </GraphQLProvider>
    </SafeAreaProvider>
    // </MagicProvider>
  );
};

export default AppProvider;
