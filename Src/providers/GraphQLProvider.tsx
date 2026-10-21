import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from 'react';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject,
  HttpLink,
} from '@apollo/client';

import { configureLocationClient } from '../services/locationService';

const APPSYNC_API_KEY = 'da2-u4e6ychzkrbsfmfqpc33ujdbvy';

const APPSYNC_ENDPOINT =
  'https://3ncgvnrobfe33fepo7cyia3kte.appsync-api.ap-south-2.amazonaws.com/graphql';

interface ApolloClientContextType {
  client: ApolloClient<NormalizedCacheObject>;
  resetClient: () => void;
}

interface GraphQLProviderProps {
  children: ReactNode;
}

const ApolloClientContext =
  createContext<ApolloClientContextType | null>(null);

const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  const httpLink = new HttpLink({
    uri: APPSYNC_ENDPOINT,
    headers: {
      'x-api-key': APPSYNC_API_KEY,
    },
  });

  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  // Register the same client used by ApolloProvider.
  configureLocationClient(client);
console.log(
  '[GraphQLProvider] Configured location client',
);
  return client;
};

export const useApolloClientContext = (): ApolloClientContextType => {
  const context = useContext(ApolloClientContext);

  if (!context) {
    throw new Error(
      'useApolloClientContext must be used inside GraphQLProvider',
    );
  }

  return context;
};

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({
  children,
}) => {
  const [apolloClient, setApolloClient] =
    useState<ApolloClient<NormalizedCacheObject>>(
      () => createApolloClient(),
    );

  const resetClient = useCallback(() => {
    setApolloClient(createApolloClient());
  }, []);

  return (
    <ApolloClientContext.Provider
      value={{
        client: apolloClient,
        resetClient,
      }}
    >
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </ApolloClientContext.Provider>
  );
};

