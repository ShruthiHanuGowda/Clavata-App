import React, {createContext, useContext, ReactNode, useState} from 'react';
import {Magic} from '@magic-sdk/react-native-bare';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  CUSTOM_NETWORK_CHAIN_ID,
  CUSTOM_RPC_URL,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_RPC_URL,
} from '../../Src/constants.ts';

// Network configuration constants - only Sepolia and Denergy
export const NETWORKS = {
  denergy: {
    rpcUrl: CUSTOM_RPC_URL,
    chainId: CUSTOM_NETWORK_CHAIN_ID, // Denergy chain ID
  },
};

// Define the network type
export type NetworkType = 'sepolia' | 'denergy' | 'default';

// Define the shape of our context
interface MagicContextType {
  magic: Magic; // Current active Magic instance
  magic_default: Magic; // Default instance with only API key
  magic_sepolia: Magic; // Sepolia instance
  magic_denergy: Magic; // Denergy instance
  activeNetwork: NetworkType;
  setActiveNetwork: (network: NetworkType) => void;
}

// Create the context with a default undefined value
const MagicContext = createContext<MagicContextType | undefined>(undefined);

// Provider props type
interface MagicProviderProps {
  children: ReactNode;
  apiKey: string;
  initialNetwork?: NetworkType;
}

export const MagicProvider: React.FC<MagicProviderProps> = ({
  children,
  apiKey,
  initialNetwork = 'default',
}) => {
  const [activeNetwork, setActiveNetworkState] =
    useState<NetworkType>(initialNetwork);

  const magic_default = new Magic(apiKey);

  const magic_sepolia = new Magic(apiKey, {
    network: {
      rpcUrl: SEPOLIA_RPC_URL,
      chainId: SEPOLIA_CHAIN_ID,
    },
  });

  const magic_denergy = new Magic(apiKey, {
    network: {
      rpcUrl: CUSTOM_RPC_URL,
      chainId: CUSTOM_NETWORK_CHAIN_ID,
    },
  });

  const getMagicInstance = () => {
    switch (activeNetwork) {
      case 'sepolia':
        return magic_sepolia;
      case 'denergy':
        return magic_denergy;
      case 'default':
      default:
        return magic_default;
    }
  };

  // Get current active Magic instance
  const magic = getMagicInstance();

  // Function to set active network
  const setActiveNetwork = (network: NetworkType) => {
    setActiveNetworkState(network);
  };

  // Create the value object to be provided by the context
  const contextValue: MagicContextType = {
    magic,
    magic_default,
    magic_sepolia,
    magic_denergy,
    activeNetwork,
    setActiveNetwork,
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
