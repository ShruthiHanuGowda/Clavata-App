import React, { ReactNode } from 'react';
// import {MagicProvider} from './MagicProvider';
import { GraphQLProvider } from './GraphQLProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import {AuthProvider} from './AuthProvider';
// import {WalletProvider} from './WalletProvider';
// import {WalletConnectProvider} from './WalletConnectProvider';
// import {KycProvider} from './KycProvider';
// import { NftProvider } from './NftProvider';
import { MAGIC_API_KEY_PROD } from '../constants';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    // <MagicProvider apiKey={MAGIC_API_KEY_PROD}>
    <SafeAreaProvider>
      <GraphQLProvider>
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
      </GraphQLProvider>
    </SafeAreaProvider>
    // </MagicProvider>
  );
};

export default AppProvider;
