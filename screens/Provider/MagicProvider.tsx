import React, {createContext, useContext, ReactNode, useState} from 'react';
import {Magic} from '@magic-sdk/react-native-bare';
import {SafeAreaProvider} from 'react-native-safe-area-context';
// Network configuration constants - only Sepolia and Denergy
export const NETWORKS = {
  denergy: {
    rpcUrl: 'https://rpc.denergytestnet.com',
    chainId: 4442,
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
  initialNetwork = 'default', // Default to default network
}) => {
  // State for tracking which network is currently active
  const [activeNetwork, setActiveNetworkState] =
    useState<NetworkType>(initialNetwork);
  // Initialize default Magic instance with only API key
  const magic_default = new Magic(apiKey);
  // Initialize Magic instances for both networks
  const magic_sepolia = new Magic(apiKey, {
    network: 'sepolia',
  });
  const magic_denergy = new Magic(apiKey, {
    network: {
      rpcUrl: NETWORKS.denergy.rpcUrl,
      chainId: NETWORKS.denergy.chainId,
    },
  });
  // Get the active Magic instance based on the current network
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
