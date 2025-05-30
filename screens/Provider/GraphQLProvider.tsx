import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client';
import {useMagic} from './MagicProvider';

const API_KEY = 'da2-baxdpa3fcnh55ph4mgfoygz7em';
const API_URL =
  'https://rbp2j64ilzapvcxolmwmv4cuj4.appsync-api.me-central-1.amazonaws.com/graphql';

const createApolloClient = (
  magicAccessToken: string = '',
): ApolloClient<NormalizedCacheObject> => {
  console.log('Creating Apollo client with token:', magicAccessToken);

  return new ApolloClient({
    uri: API_URL,
    cache: new InMemoryCache(),
    headers: {
      'x-api-key': API_KEY,
      Authorization: magicAccessToken ? `Bearer ${magicAccessToken}` : '',
    },
  });
};

// Provider props interface
interface AppProviderProps {
  children: ReactNode;
}

// Optional client prop interface for components that need direct client access
export interface WithApolloClientProps {
  client: ApolloClient<NormalizedCacheObject>;
}

export const apolloClient = createApolloClient();

const ApolloClientContext =
  createContext<ApolloClient<NormalizedCacheObject> | null>(null);

export const useApolloClientContext = (): any => {
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

  const {magic} = useMagic();

  const updateClientWithToken = async () => {
    try {
      console.log('Updating Apollo client with token');

      const isLoggedIn = await magic.user.isLoggedIn();
      console.log('User is logged in:', isLoggedIn);
      if (isLoggedIn) {
        const idToken = await magic.user.getIdToken({lifespan: 86400});
        const clientWithToken = createApolloClient(idToken);
        setApolloClient(clientWithToken);
      } else {
        const clientWithoutToken = createApolloClient();
        setApolloClient(clientWithoutToken);
      }
    } catch (error) {
      console.error('Error updating Apollo client with token:', error);
      const clientWithoutToken = createApolloClient();
      setApolloClient(clientWithoutToken);
    }
  };

  const resetClient = () => {
    console.log('Resetting Apollo client');
    const clientWithoutToken = createApolloClient();
    setApolloClient(clientWithoutToken);
  };

  useEffect(() => {
    const initializeClient = async () => {
      try {
        console.log('Initializing Apollo client');
        await updateClientWithToken();
      } catch (error) {
        console.error('Error initializing Apollo client:', error);
      }
    };

    if (magic) {
      initializeClient();
    }
  }, [magic]);

  const contextValue: any = {
    client: apolloClient,
    updateClientWithToken,
    resetClient,
  };

  return (
    <ApolloClientContext.Provider value={contextValue}>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </ApolloClientContext.Provider>
  );
};
