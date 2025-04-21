import {GRAPH_API_NFTMARKET} from '../constants';
import {GET_NFTS_MARKET_DATA, GET_TOKEN_ACTIVITY} from '../graphql/NFTqueries';
import {
  Activity,
  AskOrder,
  AskOrderType,
  MarketEvent,
  TokenMarketData,
  Transaction,
} from '../types/types';
import {ApolloClient, createHttpLink, gql, InMemoryCache} from '@apollo/client';

const httpLink = createHttpLink({
  uri: GRAPH_API_NFTMARKET,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const getNftsMarketData = async (
  where = {},
  first = 1000,
  orderBy = 'id',
  orderDirection: 'asc' | 'desc' = 'desc',
  skip = 0,
): Promise<TokenMarketData[]> => {
  try {
    const {data} = await client.query({
      query: GET_NFTS_MARKET_DATA,
      variables: {where, first, skip, orderBy, orderDirection},
    });

    return data.nfts || [];
  } catch (error) {
    console.error('Failed to fetch NFTs market data', error);
    return [];
  }
};

export const getTokenActivity = async (
  tokenId: string,
  collectionAddress: string,
): Promise<{askOrders: AskOrder[]; transactions: Transaction[]}> => {
  try {
    const {data} = await client.query({
      query: GET_TOKEN_ACTIVITY,
      variables: {
        tokenId,
        address: collectionAddress,
      },
      fetchPolicy: 'network-only',
    });
    if (data?.nfts?.length > 0) {
      return {
        askOrders: data.nfts[0].askHistory,
        transactions: data.nfts[0].transactionHistory,
      };
    }

    return {askOrders: [], transactions: []};
  } catch (error) {
    console.error('Failed to fetch token Activity', error);
    return {
      askOrders: [],
      transactions: [],
    };
  }
};

export function getMinAskPrice(data: {askPrice: string}[]): number {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }
  const minAskPrice = Math.min(...data.map(item => parseFloat(item.askPrice)));

  if (Number.isNaN(minAskPrice)) {
    return 0;
  }

  return minAskPrice;
}

export const sortActivity = ({
  askOrders = [],
  transactions = [],
}: {
  askOrders?: AskOrder[];
  transactions?: Transaction[];
}): Activity[] => {
  const getAskOrderEvent = (orderType: AskOrderType): MarketEvent => {
    switch (orderType) {
      case AskOrderType.CANCEL:
        return MarketEvent.CANCEL;
      case AskOrderType.MODIFY:
        return MarketEvent.MODIFY;
      case AskOrderType.NEW:
        return MarketEvent.NEW;
      default:
        return MarketEvent.MODIFY;
    }
  };

  const transformTransactions = (
    transactionsHistory: Transaction[],
  ): Activity[] => {
    const transformedTransactions = transactionsHistory.map(
      transactionHistory => {
        const marketEvent = MarketEvent.SELL;
        const {timestamp, nft} = transactionHistory;
        const price = transactionHistory.askPrice;
        const tx = transactionHistory?.id?.includes('-')
          ? transactionHistory.id.split('-')[0]
          : transactionHistory?.id;
        const buyer = transactionHistory?.buyer?.id;
        const seller = transactionHistory?.seller?.id;
        return {marketEvent, price, timestamp, nft, tx, buyer, seller};
      },
    );

    return transformedTransactions;
  };

  const transformAskOrders = (askOrdersHistory: AskOrder[]): Activity[] => {
    const transformedAskOrders = askOrdersHistory.map(askOrderHistory => {
      const marketEvent = getAskOrderEvent(askOrderHistory.orderType);
      const price = askOrderHistory.askPrice;
      const {timestamp, nft} = askOrderHistory;
      const tx = askOrderHistory?.id?.includes('-')
        ? askOrderHistory.id.split('-')[0]
        : askOrderHistory?.id;
      const seller = askOrderHistory?.seller?.id;
      return {marketEvent, price, timestamp, nft, tx, seller};
    });

    return transformedAskOrders;
  };

  const allActivity = [
    ...transformAskOrders(askOrders),
    ...transformTransactions(transactions),
  ];
  if (allActivity.length > 0) {
    const sortedByMostRecent = allActivity.sort(
      (a, b) => parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10),
    );
    return sortedByMostRecent;
  }
  return [];
};
