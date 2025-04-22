import {Contract, JsonRpcProvider} from 'ethers';
import {
  API_NFT_URL,
  CUSTOM_RPC_URL,
  ERC1155_COLLECTION_ABI,
  GRAPH_API_NFTMARKET,
} from '../constants';
import {GET_NFTS_MARKET_DATA, GET_TOKEN_ACTIVITY} from '../graphql/NFTqueries';
import {
  activeAsks,
  Activity,
  ApiCollections,
  ApiResponseSpecificToken,
  AskOrder,
  AskOrderType,
  MarketEvent,
  NftLocation,
  NftToken,
  TokenIdWithCollectionAddress,
  TokenMarketData,
  Transaction,
} from '../types/types';
import {ApolloClient, createHttpLink, gql, InMemoryCache} from '@apollo/client';
import range from 'lodash/range';
import {groupBy} from 'lodash';

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

export function getMinAsk(
  data: {askPrice: string; seller: {id: `0x${string}`}}[],
): Partial<activeAsks> {
  if (!Array.isArray(data) || data.length === 0) {
    return {};
  }

  const minItem = data.reduce((min, item) => {
    const currentPrice = parseFloat(item.askPrice);
    const minPrice = parseFloat(min.askPrice);
    return currentPrice < minPrice ? item : min;
  }, data[0]);

  if (Number.isNaN(parseFloat(minItem.askPrice))) {
    return {};
  }
  return minItem;
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

export const getCompleteAccountNftData = async (
  account: `0x${string}`,
  collections: ApiCollections,
): Promise<NftToken[]> => {
  const collectionsWithDelist = {...collections};

  const [walletNftIdsWithCollectionAddress, onChainForSaleNfts] =
    await Promise.all([
      fetchWalletTokenIdsForCollections(account, collectionsWithDelist),
      getNftsMarketData({}),
    ]);

  const walletNftsByCollection = groupBy(
    walletNftIdsWithCollectionAddress,
    walletNftId => walletNftId.collectionAddress,
  );

  const walletNftsWithMarketData: TokenIdWithCollectionAddress[] =
    await Promise.all(
      Object.keys(walletNftsByCollection).map(async collectionAddress => {
        const nftIds = walletNftsByCollection[collectionAddress];
        const marketData = await getNftsMarketData({
          collection: collectionAddress as `0x${string}`,
          id_in: nftIds.map(nft => nft.tokenId),
        });
        return {
          collectionAddress: collectionAddress as `0x${string}`,
          nftIds,
          marketData,
        };
      }),
    );

  const walletTokenIds = walletNftIdsWithCollectionAddress
    .filter(
      (walletNft): walletNft is Required<TokenIdWithCollectionAddress> => {
        return Boolean(walletNft.tokenId);
      },
    )
    .map(nft => nft.tokenId);

  const metadataForAllNfts = await getNftsFromDifferentCollectionsApi([
    ...walletNftIdsWithCollectionAddress,
  ]);

  const completeNftData = combineNftMarketAndMetadata(
    metadataForAllNfts,
    onChainForSaleNfts,
    walletNftsWithMarketData,
    walletTokenIds,
    account,
  );

  return completeNftData;
};

export const fetchWalletTokenIdsForCollections = async (
  account: string,
  collections: ApiCollections,
): Promise<TokenIdWithCollectionAddress[]> => {
  const provider = new JsonRpcProvider(CUSTOM_RPC_URL);

  const walletNfts: TokenIdWithCollectionAddress[] = [];

  for (const collection of Object.values(collections)) {
    const collectionAddress = collection.contractAddress as `0x${string}`;

    const contract = new Contract(
      collectionAddress,
      ERC1155_COLLECTION_ABI,
      provider,
    );

    try {
      const currentTokenId = await contract.currentTokenId();
      const balancePromises = [];

      for (let tokenId = 1; tokenId <= currentTokenId; tokenId++) {
        balancePromises.push(
          contract.balanceOf(account, tokenId).then(balance => ({
            tokenId,
            balance: balance.toString(),
          })),
        );
      }

      const balances = await Promise.all(balancePromises);

      balances.forEach(({tokenId, balance}) => {
        if (Number(balance) > 0) {
          walletNfts.push({
            tokenId: tokenId.toString(),
            collectionAddress,
            nftLocation: NftLocation.WALLET,
            quantity: balance,
          });
        }
      });
    } catch (error) {
      console.error(
        `Error fetching data for collection ${collectionAddress}:`,
        error,
      );
    }
  }

  return walletNfts;
};

export const getNftsFromDifferentCollectionsApi = async (
  from: Array<TokenIdWithCollectionAddress>,
): Promise<NftToken[]> => {
  const promises = from.map(nft =>
    getNftApi(nft.collectionAddress as `0x${string}`, nft.tokenId),
  );
  const responses = await Promise.all(promises);

  const filtered = responses.filter(
    Boolean,
  ) as ApiResponseSpecificToken['data'][];

  return filtered.map((res, index) => ({
    tokenId: res?.tokenId,
    name: `${res?.collectionDetails?.collectionName} #${res?.tokenId}`,
    collectionName: res?.collectionDetails?.collectionName,
    collectionAddress: from[index]?.collectionAddress as `0x${string}`,
    contractAddress: res?.contractAddress,
    description: res?.description,
    attributes: res?.attributes,
    createdAt: res?.createdAt,
    updatedAt: res?.updatedAt,
    image: res?.image,
  }));
};

export const getNftApi = async (
  collectionAddress: string,
  tokenId?: string,
): Promise<ApiResponseSpecificToken['data'] | null> => {
  if (!tokenId) return null;
  try {
    const res: any = await fetch(
      `${API_NFT_URL}/nftMarketplace_getCollectionTokens?contractAddress=${collectionAddress}&tokenId=${tokenId}`,
    );

    if (res.ok) {
      const json = await res.json();
      return json;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * Attach TokenMarketData and location to NftToken
 * @param nftsWithMetadata NftToken[] with API metadata
 * @param nftsForSale  market data for nfts that are on sale (i.e. not in a user's wallet)
 * @param walletNfts market data for nfts in a user's wallet
 * @param tokenIdsInWallet array of token ids in user's wallet
 * @param accountId account id
 * @returns NFT[]
 */
export const combineNftMarketAndMetadata = (
  nftsWithMetadata: NftToken[],
  nftsForSale: TokenMarketData[],
  walletNfts: TokenMarketData[],
  tokenIdsInWallet: string[],
  accountId: string,
): NftToken[] => {
  const completeNftData = nftsWithMetadata.map<NftToken>(nft => {
    let marketData = nftsForSale.find(
      forSaleNft =>
        forSaleNft.tokenId === nft.tokenId &&
        forSaleNft.collection &&
        forSaleNft.collection.id === nft.collectionAddress &&
        forSaleNft.activeAsks?.some(
          ask => ask.seller.id.toLowerCase() === accountId.toLowerCase(),
        ),
    );

    if (!marketData) {
      marketData = walletNfts.find(
        marketNft =>
          marketNft.collection &&
          marketNft.collection.id === nft.collectionAddress &&
          marketNft.tokenId === nft.tokenId,
      );
    }

    const walletNft = walletNfts.find(
      wnft =>
        wnft.tokenId === nft.tokenId &&
        wnft.collection.id === nft.collectionAddress,
    );
    if (marketData && walletNft) {
      marketData = {...marketData, quantity: walletNft.quantity};
    }
    const location = getNftLocationForMarketNft(
      nft.tokenId,
      tokenIdsInWallet,
      nftsForSale,
      accountId,
      nft.collectionAddress,
    );
    return {...nft, marketData, location};
  });

  return completeNftData;
};

export const getNftLocationForMarketNft = (
  tokenId: string,
  tokenIdsInWallet: string[],
  tokenIdsForSale: TokenMarketData[],
  accountId: string,
  collectionId?: string,
): NftLocation => {
  const marketDataForSale = tokenIdsForSale.find(
    sale => sale.tokenId === tokenId && sale.collection.id === collectionId,
  );

  if (marketDataForSale) {
    const isSeller = marketDataForSale.activeAsks?.some(
      ask => ask.seller.id.toLowerCase() === accountId.toLowerCase(),
    );

    if (isSeller) {
      return NftLocation.FORSALE;
    }
  }

  if (tokenIdsInWallet.includes(tokenId)) {
    return NftLocation.WALLET;
  }

  console.error(
    `Cannot determine location for tokenID ${tokenId}, defaulting to NftLocation.WALLET`,
  );
  return NftLocation.WALLET;
};
