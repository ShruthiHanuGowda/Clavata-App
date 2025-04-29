import React, {ReactNode} from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client';

// Environment variables or configuration
const API_KEY = 'da2-baxdpa3fcnh55ph4mgfoygz7em';
const API_URL =
  'https://rbp2j64ilzapvcxolmwmv4cuj4.appsync-api.me-central-1.amazonaws.com/graphql';

// Apollo client configuration
const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    uri: API_URL,
    cache: new InMemoryCache(),
    headers: {
      'x-api-key': API_KEY,
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

// Create and export the client as a singleton
export const apolloClient = createApolloClient();

// Main provider component that wraps the application
export const GraphQLProvider: React.FC<AppProviderProps> = ({children}) => {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
