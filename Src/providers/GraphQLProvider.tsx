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
const APPSYNC_API_KEY = 'da2-u4e6ychzkrbsfmfqpc33ujdbvy';

// const httpLink = new HttpLink({
//   uri: 'https://3ncgvnrobfe33fepo7cyia3kte.appsync-api.ap-south-2.amazonaws.com/graphql',
//   headers: {
//     'x-api-key': APPSYNC_API_KEY,
//   },
//   fetch: async (uri, options) => {
//     console.log('🌐 GraphQL request:', uri);

//     try {
//       const response = await fetch(uri, options);

//       console.log(
//         '🌐 GraphQL response:',
//         response.status,
//         response.statusText,
//       );

//       return response;
//     } catch (error) {
//       console.log('❌ GraphQL fetch failed:', error);
//       throw error;
//     }
//   },
// });
const httpLink = new HttpLink({
  uri: 'https://3ncgvnrobfe33fepo7cyia3kte.appsync-api.ap-south-2.amazonaws.com/graphql',
  headers: {
    'x-api-key': APPSYNC_API_KEY,
  },
  fetch: async (uri, options) => {
    console.log('==========================================');
    console.log('🌐 GRAPHQL REQUEST');
    console.log('🌐 URI:', uri);
    console.log('🌐 METHOD:', options?.method);
    console.log('🌐 HEADERS:', options?.headers);

    try {
      const response = await fetch(uri, options);

      console.log('==========================================');
      console.log('🌐 GRAPHQL RESPONSE');
      console.log('🌐 STATUS:', response.status);
      console.log('🌐 STATUS TEXT:', response.statusText);

      const responseText = await response.clone().text();

      console.log('🌐 RESPONSE BODY:', responseText);

      return response;
    } catch (error: any) {
      console.log('==========================================');
      console.log('❌ GRAPHQL NATIVE FETCH FAILED');
      console.log('❌ ERROR NAME:', error?.name);
      console.log('❌ ERROR MESSAGE:', error?.message);
      console.log('❌ ERROR:', error);
      console.log('==========================================');

      throw error;
    }
  },
});
const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  console.log('🔑 Using API Key Authentication');

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