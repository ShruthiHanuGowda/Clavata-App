import React, {createContext, useContext, ReactNode, useState} from 'react';
import {Magic} from '@magic-sdk/react-native-bare';
import Web3 from 'web3';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Define the shape of our context
interface MagicContextType {
  magic: Magic;
  web3: Web3;
  env: string;
  setEnv: React.Dispatch<React.SetStateAction<string>>;
}

// Create the context with a default undefined value
const MagicContext = createContext<MagicContextType | undefined>(undefined);

// Provider props type
interface MagicProviderProps {
  children: ReactNode;
  apiKey: string;
  btcRpcUrl: string;
  initialEnv?: string;
}

export const MagicProvider: React.FC<MagicProviderProps> = ({
                                                              children,
                                                              apiKey,
                                                              btcRpcUrl,
                                                            }) => {
  // Initialize Magic instance
  const magic = new Magic(apiKey, {
    network: 'sepolia',

  });

  // Initialize Web3 with Magic's provider
  const web3 = new Web3(magic.rpcProvider);

  // Create the value object to be provided by the context
  const contextValue: any = {
    magic,
    web3,
  };

  return (
    <MagicContext.Provider value={contextValue}>
      <SafeAreaProvider>
        <magic.Relayer />
        {children}
      </SafeAreaProvider>
    </MagicContext.Provider>
  );
};

// Custom hook to use the Magic context
export const useMagic = (): MagicContextType => {
  const context = useContext(MagicContext);
  if (context === undefined) {
    throw new Error('useMagic must be used within a MagicProvider');
  }
  return context;
};
