import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import {Magic} from '@magic-sdk/react-native-bare';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  CUSTOM_NETWORK_CHAIN_ID,
  CUSTOM_RPC_URL,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_RPC_URL,
} from '../constants';

export type NetworkType = 'sepolia' | 'denergy';

interface MagicContextType {
  magic: Magic;
  magic_default: Magic;
  magic_sepolia: Magic;
  magic_denergy: Magic;
  activeNetwork: NetworkType;
  setActiveNetwork: (network: NetworkType) => Magic;
}

const MagicContext = createContext<MagicContextType | undefined>(undefined);

interface MagicProviderProps {
  children: ReactNode;
  apiKey: string;
  initialNetwork?: NetworkType;
}

export const MagicProvider: React.FC<MagicProviderProps> = ({
  children,
  apiKey,
  initialNetwork = 'sepolia',
}) => {
  const [newActiveNetwork, setNewActiveNetwork] =
    useState<NetworkType>(initialNetwork);
  const [magic, setMagic] = useState<Magic>(new Magic(apiKey));

  useEffect(() => {
    let config: any;
    if (newActiveNetwork === 'denergy') {
      config = {
        network: {
          rpcUrl: CUSTOM_RPC_URL,
          chainId: CUSTOM_NETWORK_CHAIN_ID,
        },
      };
    } else {
      config = {
        network: {
          rpcUrl: SEPOLIA_RPC_URL,
          chainId: SEPOLIA_CHAIN_ID,
        },
      };
    }
    const newMagicInstance = new Magic(apiKey, config);
    setMagic(newMagicInstance);
  }, [newActiveNetwork, apiKey]);

  const changeActiveNetwork = (activeNetwork: NetworkType): Magic => {
    let config: any;
    if (activeNetwork === 'denergy') {
      config = {
        network: {
          rpcUrl: CUSTOM_RPC_URL,
          chainId: CUSTOM_NETWORK_CHAIN_ID,
        },
      };
    } else {
      config = {
        network: {
          rpcUrl: SEPOLIA_RPC_URL,
          chainId: SEPOLIA_CHAIN_ID,
        },
      };
    }
    const newMagicInstance = new Magic(apiKey, config);
    setNewActiveNetwork(activeNetwork);
    setMagic(newMagicInstance);
    return newMagicInstance;
  };

  const contextValue: MagicContextType = {
    magic,
    magic_default: magic,
    magic_sepolia: magic,
    magic_denergy: magic,
    activeNetwork: newActiveNetwork,
    setActiveNetwork: changeActiveNetwork,
  };

  return (
    <MagicContext.Provider value={contextValue}>
      <SafeAreaProvider>
        {magic && <magic.Relayer />}
        {children}
      </SafeAreaProvider>
    </MagicContext.Provider>
  );
};

export const useMagic = (): MagicContextType => {
  const context = useContext(MagicContext);
  if (!context) {
    throw new Error('useMagic must be used within a MagicProvider');
  }
  return context;
};
