import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client';
import {useMagic} from './MagicProvider';
import {MERGED_API_URL} from '../../Src/constants';


const createApolloClient = (
  magicAccessToken: string = '',
): ApolloClient<NormalizedCacheObject> => {
  console.log(
    'Creating Apollo client with token:',
    magicAccessToken ? 'Token present' : 'No token',
  );

  return new ApolloClient({
    uri: MERGED_API_URL,
    cache: new InMemoryCache(),
    headers: {
      Authorization: magicAccessToken ? `Bearer ${magicAccessToken}` : '',
    },
  });
};

// Provider props interface
interface AppProviderProps {
  children: ReactNode;
}

// Context interface
interface ApolloClientContextType {
  client: ApolloClient<NormalizedCacheObject>;
  updateClientWithToken: () => Promise<void>;
  resetClient: () => void;
  isUpdatingToken: boolean;
}

export interface WithApolloClientProps {
  client: ApolloClient<NormalizedCacheObject>;
}

const ApolloClientContext = createContext<ApolloClientContextType | null>(null);

export const useApolloClientContext = (): ApolloClientContextType => {
  const context = useContext(ApolloClientContext);
  if (!context) {
    throw new Error(
      'useApolloClientContext must be used within GraphQLProvider',
    );
  }
  return context;
};

export const GraphQLProvider: React.FC<AppProviderProps> = ({children}) => {
  const [apolloClient, setApolloClient] = useState<
    ApolloClient<NormalizedCacheObject>
  >(() => createApolloClient());

  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const {magic} = useMagic();

  const updateClientWithToken = useCallback(async () => {
    if (!magic) {
      console.log('Magic not available yet');
      return;
    }

    setIsUpdatingToken(true);
    try {
      console.log('Updating Apollo client with token');

      const isLoggedIn = await magic.user.isLoggedIn();
      console.log('User is logged in:', isLoggedIn);

      if (isLoggedIn) {
        const idToken = await magic.user.getIdToken({lifespan: 86400});
        console.log(
          'Retrieved idToken:',
          idToken ? 'Token obtained' : 'No token',
        );

        const clientWithToken = createApolloClient(idToken);
        setApolloClient(clientWithToken);
        console.log('Apollo client updated with auth token');
      } else {
        const clientWithoutToken = createApolloClient();
        setApolloClient(clientWithoutToken);
        console.log('Apollo client updated without token (user not logged in)');
      }
    } catch (error) {
      console.error('Error updating Apollo client with token:', error);
      const clientWithoutToken = createApolloClient();
      setApolloClient(clientWithoutToken);
    } finally {
      setIsUpdatingToken(false);
    }
  }, [magic]);

  const resetClient = useCallback(() => {
    console.log('Resetting Apollo client');
    const clientWithoutToken = createApolloClient();
    setApolloClient(clientWithoutToken);
  }, []);

  // Initialize client when magic becomes available
  useEffect(() => {
    if (magic) {
      console.log('Magic available, initializing Apollo client');
      updateClientWithToken();
    }
  }, [magic, updateClientWithToken]);

  // Optional: Listen for Magic auth state changes
  useEffect(() => {
    if (!magic) return;

    // You might want to listen for auth state changes
    // This depends on your Magic implementation
    const handleAuthChange = () => {
      console.log('Auth state changed, updating client');
      updateClientWithToken();
    };

    // If Magic provides auth state change listeners, use them here
    // magic.onAuthStateChanged?.(handleAuthChange);

    // Cleanup function
    return () => {
      // magic.offAuthStateChanged?.(handleAuthChange);
    };
  }, [magic, updateClientWithToken]);

  const contextValue: ApolloClientContextType = {
    client: apolloClient,
    updateClientWithToken,
    resetClient,
    isUpdatingToken,
  };

  return (
    <ApolloClientContext.Provider value={contextValue}>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </ApolloClientContext.Provider>
  );
};
