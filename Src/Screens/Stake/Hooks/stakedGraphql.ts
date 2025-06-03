import {InMemoryCache} from '@apollo/client';

import {ApolloClient, createHttpLink} from '@apollo/client';
import {STAKED_API_URL} from '../../../constants';
import {GET_NFT_DELEGATIONS} from './stakeQueries';
import {GetNftDelegationsData, NftDelegation} from '../../../types/types';

const httpLink = createHttpLink({
  uri: STAKED_API_URL,
  includeExtensions: true,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const getStakedPoolData = async (
  delegatorAddress: string,
  first = 10,
  orderBy = 'id',
  orderDirection: 'asc' | 'desc' = 'desc',
  skip = 0,
): Promise<NftDelegation[]> => {
  try {
    const {data} = await client.query<GetNftDelegationsData>({
      query: GET_NFT_DELEGATIONS,
      variables: {
        where: {delegator: delegatorAddress},
        first,
        skip,
        orderBy,
        orderDirection,
      },
      fetchPolicy: 'network-only', // optional: ensures fresh data
    });

    return data.nftdelegations || [];
  } catch (error) {
    console.error('Failed to fetch NFT delegations', error);
    return [];
  }
};
