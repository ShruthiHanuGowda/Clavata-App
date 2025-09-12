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
import {MERGED_API_URL} from '../constants';

const createApolloClient = (
  magicAccessToken: string = '',
): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    uri: MERGED_API_URL,
    cache: new InMemoryCache(),
    headers: {
      Authorization: magicAccessToken ? `Bearer ${magicAccessToken}` : '',
    },
  });
};

interface GraphQLProviderProps {
  children: ReactNode;
}

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

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({children}) => {
  const [apolloClient, setApolloClient] = useState<
    ApolloClient<NormalizedCacheObject>
  >(() => createApolloClient());

  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const {magic} = useMagic();

  const updateClientWithToken = useCallback(async () => {
    if (!magic) {
      return;
    }

    setIsUpdatingToken(true);
    try {
      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        const idToken = await magic.user.getIdToken({lifespan: 86400});
        const clientWithToken = createApolloClient(idToken);
        setApolloClient(clientWithToken);
      } else {
        const clientWithoutToken = createApolloClient();
        setApolloClient(clientWithoutToken);
      }
    } catch (error) {
      const clientWithoutToken = createApolloClient();
      setApolloClient(clientWithoutToken);
    } finally {
      setIsUpdatingToken(false);
    }
  }, [magic]);

  const resetClient = useCallback(() => {
    const clientWithoutToken = createApolloClient();
    setApolloClient(clientWithoutToken);
  }, []);

  useEffect(() => {
    if (magic) {
      updateClientWithToken();
    }
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