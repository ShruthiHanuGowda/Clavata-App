import React, {ReactNode} from 'react';
import {MagicProvider} from './MagicProvider';
import {GraphQLProvider} from './GraphQLProvider';
import {AuthProvider} from './AuthProvider';
import {WalletProvider} from './WalletProvider';
import {KycProvider} from './KycProvider';
import {NftProvider} from './NftProvider';
import {MAGIC_API_KEY_PROD} from '../constants';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  return (
    <MagicProvider apiKey={MAGIC_API_KEY_PROD}>
      <GraphQLProvider>
        <AuthProvider>
          <KycProvider>
            <WalletProvider>
              <NftProvider>
                {children}
              </NftProvider>
            </WalletProvider>
          </KycProvider>
        </AuthProvider>
      </GraphQLProvider>
    </MagicProvider>
  );
};

export default AppProvider;
