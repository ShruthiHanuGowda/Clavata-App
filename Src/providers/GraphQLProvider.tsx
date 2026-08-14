// 

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

import { MERGED_API_URL } from '../constants/constants';

const APPSYNC_API_KEY = 'da2-u4e6ychzkrbsfmfqpc33ujdbvy';

const httpLink = new HttpLink({
  uri: "https://3ncgvnrobfe33fepo7cyia3kte.appsync-api.ap-south-2.amazonaws.com/graphql",
  headers: {
    'x-api-key': APPSYNC_API_KEY,
  },
});

const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  // console.log('🔗 Apollo URL:', MERGED_API_URL);
  console.log('🔑 Using API Key Authentication', APPSYNC_API_KEY);

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
};


interface GraphQLProviderProps {
  children: ReactNode;
}


interface ApolloClientContextType {
  client: ApolloClient<NormalizedCacheObject>;
  resetClient: () => void;
}


const ApolloClientContext =
  createContext<ApolloClientContextType | null>(null);


export const useApolloClientContext = () => {
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

  console.log('🚀 GraphQLProvider rendered');
  const [apolloClient, setApolloClient] =
    useState<ApolloClient<NormalizedCacheObject>>(
      () => createApolloClient(),
    );


  const resetClient = useCallback(() => {
    const client = createApolloClient();
    setApolloClient(client);
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