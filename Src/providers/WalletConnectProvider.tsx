import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {Alert} from 'react-native';
import {Core} from '@walletconnect/core';
import {Web3Wallet, IWeb3Wallet} from '@walletconnect/web3wallet';
import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {BrowserProvider} from 'ethers';
import {useMagic} from './MagicProvider';
import {useAuth} from './AuthProvider';
import {
  WALLETCONNECT_PROJECT_ID,
  WALLETCONNECT_CHAINS,
  CUSTOM_NETWORK_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
} from '../constants';

// Types
export interface WalletConnectContextType {
  // State
  web3wallet: IWeb3Wallet | null;
  isInitialized: boolean;
  isConnecting: boolean;
  initError: string | null;
  activeSessions: SessionTypes.Struct[];
  pendingProposal: SignClientTypes.EventArguments['session_proposal'] | null;
  pendingRequest: SignClientTypes.EventArguments['session_request'] | null;

  // Actions
  initialize: () => Promise<void>;
  pair: (uri: string) => Promise<void>;
  approveSession: (chainId?: number) => Promise<void>;
  rejectSession: () => Promise<void>;
  approveRequest: () => Promise<void>;
  rejectRequest: () => Promise<void>;
  disconnect: (topic: string) => Promise<void>;
  disconnectAll: () => Promise<void>;

  // UI State
  clearPendingProposal: () => void;
  clearPendingRequest: () => void;
}

interface WalletConnectProviderProps {
  children: ReactNode;
}

const WalletConnectContext = createContext<WalletConnectContextType | undefined>(undefined);

// App metadata for WalletConnect
const APP_METADATA = {
  name: 'D-Wallet',
  description: 'D-Energy Wallet for managing crypto and NFT assets',
  url: 'https://d-energy.com',
  icons: ['https://d-energy.com/icon.png'],
  redirect: {
    native: 'dwallet://',
    universal: 'https://d-energy.com',
  },
};

export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({children}) => {
  const {magic, activeNetwork} = useMagic();
  const {userDetails} = useAuth();

  // State
  const [web3wallet, setWeb3Wallet] = useState<IWeb3Wallet | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<SessionTypes.Struct[]>([]);
  const [pendingProposal, setPendingProposal] = useState<
    SignClientTypes.EventArguments['session_proposal'] | null
  >(null);
  const [pendingRequest, setPendingRequest] = useState<
    SignClientTypes.EventArguments['session_request'] | null
  >(null);

  const initializingRef = useRef(false);

  // Get current chain ID based on active network
  const getCurrentChainId = useCallback(() => {
    return activeNetwork === 'denergy'
      ? parseInt(CUSTOM_NETWORK_CHAIN_ID, 10)
      : parseInt(SEPOLIA_CHAIN_ID, 10);
  }, [activeNetwork]);

  // Get supported namespaces for session approval
  const getSupportedNamespaces = useCallback((chainId?: number) => {
    const selectedChainId = chainId || getCurrentChainId();
    const address = userDetails?.userWallet || '';
    const caipChain = `eip155:${selectedChainId}`;
    const caipAccount = `eip155:${selectedChainId}:${address}`;

    return {
      eip155: {
        chains: [caipChain],
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'eth_signTypedData_v4',
        ],
        events: ['chainChanged', 'accountsChanged'],
        accounts: [caipAccount],
      },
    };
  }, [getCurrentChainId, userDetails?.userWallet]);

  // Initialize WalletConnect
  const initialize = useCallback(async () => {
    if (initializingRef.current || isInitialized) {
      return;
    }

    // Check for project ID
    if (!WALLETCONNECT_PROJECT_ID || WALLETCONNECT_PROJECT_ID === 'your-walletconnect-project-id') {
      setInitError('WalletConnect Project ID is missing. Please add WALLETCONNECT_PROJECT_ID to your .env file.');
      return;
    }

    initializingRef.current = true;
    setInitError(null);

    try {
      console.log('[WalletConnect] Initializing with project ID...');
      
      const core = new Core({
        projectId: WALLETCONNECT_PROJECT_ID,
      });

      const wallet = await Web3Wallet.init({
        core,
        metadata: APP_METADATA,
      });

      // Set up event listeners
      wallet.on('session_proposal', (proposal) => {
        console.log('[WalletConnect] Session proposal received:', proposal);
        setPendingProposal(proposal);
      });

      wallet.on('session_request', (request) => {
        console.log('[WalletConnect] Session request received:', request);
        setPendingRequest(request);
      });

      wallet.on('session_delete', ({topic}) => {
        console.log('[WalletConnect] Session deleted:', topic);
        updateActiveSessions(wallet);
      });

      setWeb3Wallet(wallet);
      setIsInitialized(true);
      updateActiveSessions(wallet);

      console.log('[WalletConnect] Initialized successfully');
    } catch (error: any) {
      console.error('[WalletConnect] Initialization error:', error);
      setInitError(error.message || 'Failed to initialize WalletConnect');
    } finally {
      initializingRef.current = false;
    }
  }, [isInitialized]);

  // Update active sessions list
  const updateActiveSessions = (wallet: IWeb3Wallet) => {
    const sessions = wallet.getActiveSessions();
    setActiveSessions(Object.values(sessions));
  };

  // Pair with a dApp using WalletConnect URI
  const pair = useCallback(
    async (uri: string) => {
      if (!web3wallet) {
        throw new Error('WalletConnect not initialized. Please try again.');
      }

      setIsConnecting(true);
      try {
        // Validate URI format
        if (!uri.startsWith('wc:')) {
          throw new Error('Invalid WalletConnect URI format');
        }

        console.log('[WalletConnect] Attempting to pair...');
        await web3wallet.pair({uri});
        console.log('[WalletConnect] Paired successfully');
      } catch (error: any) {
        console.error('[WalletConnect] Pairing error:', error);
        
        // Provide user-friendly error messages
        let userMessage = error.message || 'Failed to connect';
        
        if (error.message?.includes('Subscribing') && error.message?.includes('failed')) {
          userMessage = 'Connection failed. The QR code may have expired. Please scan a fresh QR code from the dApp.';
        } else if (error.message?.includes('Pairing already exists')) {
          userMessage = 'This connection already exists. Check your connected apps.';
        } else if (error.message?.includes('expired')) {
          userMessage = 'The QR code has expired. Please scan a new QR code.';
        } else if (error.message?.includes('network') || error.message?.includes('Network')) {
          userMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        throw new Error(userMessage);
      } finally {
        setIsConnecting(false);
      }
    },
    [web3wallet],
  );

  // Approve session proposal
  const approveSession = useCallback(async (chainId?: number) => {
    if (!web3wallet || !pendingProposal) {
      return;
    }

    try {
      const namespaces = getSupportedNamespaces(chainId);

      await web3wallet.approveSession({
        id: pendingProposal.id,
        namespaces,
      });

      updateActiveSessions(web3wallet);
      setPendingProposal(null);
      console.log('[WalletConnect] Session approved');
    } catch (error: any) {
      console.error('[WalletConnect] Session approval error:', error);
      Alert.alert('Error', 'Failed to approve session. Please try again.');
    }
  }, [web3wallet, pendingProposal, getSupportedNamespaces]);

  // Reject session proposal
  const rejectSession = useCallback(async () => {
    if (!web3wallet || !pendingProposal) {
      return;
    }

    try {
      await web3wallet.rejectSession({
        id: pendingProposal.id,
        reason: {
          code: 4001,
          message: 'User rejected the session',
        },
      });

      setPendingProposal(null);
      console.log('[WalletConnect] Session rejected');
    } catch (error: any) {
      console.error('[WalletConnect] Session rejection error:', error);
    }
  }, [web3wallet, pendingProposal]);

  // Approve and execute request
  const approveRequest = useCallback(async () => {
    if (!web3wallet || !pendingRequest || !magic) {
      return;
    }

    const {topic, params, id} = pendingRequest;
    const {request} = params;

    try {
      const magicProvider = new BrowserProvider(magic.rpcProvider as any);
      const signer = await magicProvider.getSigner();

      let result: string;

      switch (request.method) {
        case 'personal_sign': {
          const message = request.params[0];
          result = await signer.signMessage(
            typeof message === 'string' && message.startsWith('0x')
              ? Buffer.from(message.slice(2), 'hex').toString()
              : message,
          );
          break;
        }

        case 'eth_sign': {
          const message = request.params[1];
          result = await signer.signMessage(message);
          break;
        }

        case 'eth_signTypedData':
        case 'eth_signTypedData_v4': {
          const typedData = JSON.parse(request.params[1]);
          const {domain, types, message} = typedData;
          // Remove EIP712Domain from types if present
          delete types.EIP712Domain;
          result = await signer.signTypedData(domain, types, message);
          break;
        }

        case 'eth_sendTransaction': {
          const tx = request.params[0];
          const txResponse = await signer.sendTransaction({
            to: tx.to,
            value: tx.value || '0x0',
            data: tx.data || '0x',
            gasLimit: tx.gas || tx.gasLimit,
          });
          result = txResponse.hash;
          break;
        }

        case 'eth_signTransaction': {
          const txParams = request.params[0];
          result = await signer.signTransaction({
            to: txParams.to,
            value: txParams.value || '0x0',
            data: txParams.data || '0x',
            gasLimit: txParams.gas || txParams.gasLimit,
          });
          break;
        }

        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }

      await web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result,
        },
      });

      setPendingRequest(null);
      console.log('[WalletConnect] Request approved:', result);
    } catch (error: any) {
      console.error('[WalletConnect] Request approval error:', error);

      // Send error response to dApp
      await web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: {
            code: 4001,
            message: error.message || 'User rejected the request',
          },
        },
      });

      setPendingRequest(null);
      Alert.alert('Error', error.message || 'Failed to process request');
    }
  }, [web3wallet, pendingRequest, magic]);

  // Reject request
  const rejectRequest = useCallback(async () => {
    if (!web3wallet || !pendingRequest) {
      return;
    }

    const {topic, id} = pendingRequest;

    try {
      await web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: {
            code: 4001,
            message: 'User rejected the request',
          },
        },
      });

      setPendingRequest(null);
      console.log('[WalletConnect] Request rejected');
    } catch (error: any) {
      console.error('[WalletConnect] Request rejection error:', error);
    }
  }, [web3wallet, pendingRequest]);

  // Disconnect a session
  const disconnect = useCallback(
    async (topic: string) => {
      if (!web3wallet) {
        return;
      }

      try {
        await web3wallet.disconnectSession({
          topic,
          reason: {
            code: 6000,
            message: 'User disconnected',
          },
        });

        updateActiveSessions(web3wallet);
        console.log('[WalletConnect] Session disconnected:', topic);
      } catch (error: any) {
        console.error('[WalletConnect] Disconnect error:', error);
      }
    },
    [web3wallet],
  );

  // Disconnect all sessions
  const disconnectAll = useCallback(async () => {
    if (!web3wallet) {
      return;
    }

    const sessions = web3wallet.getActiveSessions();
    for (const topic of Object.keys(sessions)) {
      await disconnect(topic);
    }
  }, [web3wallet, disconnect]);

  // Clear pending states
  const clearPendingProposal = useCallback(() => {
    setPendingProposal(null);
  }, []);

  const clearPendingRequest = useCallback(() => {
    setPendingRequest(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (userDetails?.userWallet && !isInitialized) {
      initialize();
    }
  }, [userDetails?.userWallet, isInitialized, initialize]);

  const contextValue: WalletConnectContextType = {
    web3wallet,
    isInitialized,
    isConnecting,
    initError,
    activeSessions,
    pendingProposal,
    pendingRequest,
    initialize,
    pair,
    approveSession,
    rejectSession,
    approveRequest,
    rejectRequest,
    disconnect,
    disconnectAll,
    clearPendingProposal,
    clearPendingRequest,
  };

  return (
    <WalletConnectContext.Provider value={contextValue}>
      {children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnect = (): WalletConnectContextType => {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error('useWalletConnect must be used within a WalletConnectProvider');
  }
  return context;
};
