import {Contract, JsonRpcProvider} from 'ethers';
import {API_NFT_URL, CUSTOM_RPC_URL, GRAPH_API_NFTMARKET} from '../constants';
import {
  GET_NFTS_COLLECTIONS_WITH_ASKS,
  GET_NFTS_MARKET_DATA,
  GET_TOKEN_ACTIVITY,
} from '../graphql/NFTqueries';
import {ERC1155_ABI} from '../utils/Contracts';

import {
  activeAsks,
  Activity,
  ApiCollections,
  ApiResponseSpecificToken,
  AskOrder,
  AskOrderType,
  Collection,
  MarketEvent,
  NftLocation,
  NftToken,
  TokenIdWithCollectionAddress,
  TokenMarketData,
  Transaction,
} from '../types/types';
import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client';

const httpLink = createHttpLink({
  uri: GRAPH_API_NFTMARKET,
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

export const getCollectionsMarketData = async (): Promise<Collection[]> => {
  try {
    const {data} = await client.query({
      query: GET_NFTS_COLLECTIONS_WITH_ASKS,
    });

    const collectionsMap = new Map<
      string,
      Collection & {totalAskAmount?: string}
    >();

    data.nfts.forEach((nft: any) => {
      const collection = nft.collection;
      const collectionActiveAsks = nft?.activeAsks || [];

      if (collection && collectionActiveAsks.length > 0) {
        const existing = collectionsMap.get(collection.id);
        const askTotal = collectionActiveAsks.reduce(
          (sum: bigint, ask: any) => {
            return sum + BigInt(ask.amount || 0);
          },
          BigInt(0),
        );

        if (existing) {
          const currentTotal = BigInt(existing.totalAskAmount || '0');

          existing.totalAskAmount = (currentTotal + askTotal).toString();
        } else {
          collectionsMap.set(collection.id, {
            ...collection,
            totalAskAmount: askTotal.toString(),
          });
        }
      }
    });

    return Array.from(collectionsMap.values());
  } catch (error) {
    console.error('Failed to fetch collections from nfts', error);
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

export function getAskBySellerId(
  activeAsks: {
    id: string;
    amount: string;
    askPrice: string;
    seller: {
      id: string;
    };
  }[],
  sellerId: string,
):
  | {
      id: string;
      amount: string;
      askPrice: string;
      seller: {
        id: string;
      };
    }
  | undefined {
  if (!Array.isArray(activeAsks) || activeAsks.length === 0) {
    return undefined;
  }

  return activeAsks.find(item => item.seller.id === sellerId);
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

  if (!account || !collections || Object.keys(collections).length === 0) {
    console.warn('Missing account or collections, skipping fetch');
    return [];
  }

  const walletNftIdsWithCollectionAddress =
    await fetchWalletTokenIdsForCollections(account, collectionsWithDelist);

  const metadataForAllNfts = await getNftsFromDifferentCollectionsApi(
    walletNftIdsWithCollectionAddress,
  );

  const onChainForSaleNfts = await getNftsMarketData({});

  const walletTokenIds = walletNftIdsWithCollectionAddress
    .filter(
      (walletNft): walletNft is Required<TokenIdWithCollectionAddress> => {
        return Boolean(walletNft.tokenId);
      },
    )
    .map(nft => nft.tokenId);

  const walletNftsWithMarketLikeData: TokenMarketData[] =
    walletNftIdsWithCollectionAddress.map(nft => ({
      tokenId: nft.tokenId,
      quantity: nft.quantity,
      collection: {
        id: nft.collectionAddress,
      },
      metadataUrl: nft.metadataUrl || null,
    })) as TokenMarketData[];

  const completeNftData = combineNftMarketAndMetadata(
    metadataForAllNfts,
    onChainForSaleNfts,
    walletNftsWithMarketLikeData,
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

  const allCollectionPromises = Object.values(collections).map(
    async collection => {
      const collectionAddress = collection.contractAddress as `0x${string}`;
      const contract = new Contract(collectionAddress, ERC1155_ABI, provider);

      try {
        const currentTokenIdRaw = await contract.totalTokenTypes();

        const currentTokenId = Number(currentTokenIdRaw) + 1 || 1;

        const tokenIds = Array.from({length: currentTokenId}, (_, i) => i + 1);

        const balances = await Promise.all(
          tokenIds.map(async tokenId => {
            const balance = await contract.balanceOf(account, tokenId);
            const metadataUrl = await contract.uri(tokenId);
            return {
              tokenId: tokenId.toString(),
              balance: balance.toString(),
              metadataUrl,
            };
          }),
        );

        return balances
          .filter(({balance}) => Number(balance) > 0)
          .map(({tokenId, balance, metadataUrl}) => ({
            tokenId,
            collectionAddress,
            nftLocation: NftLocation.WALLET,
            quantity: balance,
            metadataUrl,
          }));
      } catch (error) {
        console.error(
          `Error fetching for collection ${collectionAddress}:`,
          error,
        );
        return [];
      }
    },
  );

  const results = await Promise.all(allCollectionPromises);

  return results.flat();
};

export const getNftsFromDifferentCollectionsApi = async (
  from: Array<TokenIdWithCollectionAddress>,
): Promise<NftToken[]> => {
  const promises = from.map(async nft => {
    const res = await getNftApi(
      nft.collectionAddress as `0x${string}`,
      nft.tokenId,
    );

    let image = {original: '', thumbnail: ''};
    let nftMetadata: any = {};
    const metadataUrl = nft.metadataUrl;
    if (metadataUrl) {
      const metadataResponse = await fetch(metadataUrl);
      nftMetadata = await metadataResponse.json();
      image = {
        original: nftMetadata.image || '',
        thumbnail: nftMetadata.image || '',
      };
    }

    return {
      id: res?.tokenId ?? '',
      tokenId: res?.tokenId ?? nft.tokenId ?? '',
      name: `${res?.collectionDetails?.collectionName ?? ''} #${
        res?.tokenId ?? ''
      }`,
      collectionName: res?.collectionDetails?.collectionName ?? '',
      collectionAddress: nft.collectionAddress as `0x${string}`,
      contractAddress: res?.contractAddress ?? '',
      totalListed: '0',
      country_image: res?.collectionDetails?.country_image ?? '',
      energy_type_image: res?.collectionDetails?.energy_type_image ?? '',
      collection_image: res?.collectionDetails?.collection_image ?? '',
      description: res?.description ?? '',
      attributes: res?.attributes ?? [],
      symbol: res?.collectionDetails?.symbol ?? '',
      year: res?.collectionDetails?.year ?? '',
      country: res?.collectionDetails?.country ?? '',
      ownerAddress: res?.collectionDetails?.ownerAddress ?? '',
      type: res?.collectionDetails?.type ?? '',
      mintedVolume: res?.mintedVolume ?? '',
      createdAt: res?.createdAt ?? '',
      updatedAt: res?.updatedAt ?? '',
      ...nftMetadata,
      image,
    };
  });

  const nfts = await Promise.all(promises);

  return nfts;
};

export const getNftApi = async (
  collectionAddress: string,
  tokenId?: string,
): Promise<ApiResponseSpecificToken['data'] | null> => {
  if (!tokenId) {
    return null;
  }
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

  console.info(
    `Cannot determine location for tokenID ${tokenId}, defaulting to NftLocation.WALLET`,
  );
  return NftLocation.WALLET;
};

export const attachMarketDataToWalletNfts = (
  walletNfts: TokenIdWithCollectionAddress[],
  marketDataForWalletNfts: TokenMarketData[],
): TokenMarketData[] => {
  const walletNftsWithMarketData = walletNfts.map(walletNft => {
    const marketData = marketDataForWalletNfts.find(
      marketNft =>
        marketNft.tokenId === walletNft.tokenId &&
        marketNft.collection.id.toLowerCase() ===
          walletNft.collectionAddress.toLowerCase(),
    );

    return marketData
      ? {...marketData, quantity: walletNft?.quantity ?? 0}
      : {
          tokenId: walletNft.tokenId,
          collection: {
            id: walletNft.collectionAddress.toLowerCase(),
          },
          quantity: walletNft?.quantity,
          nftLocation: walletNft.nftLocation,
          metadataUrl: null,
          transactionHistory: null,
          currentSeller: null,
          isTradable: null,
          currentAskPrice: null,
          latestTradedPriceInUSDC: null,
          tradeVolumeBNB: null,
          totalTrades: null,
          otherId: null,
        };
  });
  return walletNftsWithMarketData as TokenMarketData[];
};

export function isOwnNft(
  accountAddress: `0x${string}` | undefined,
  data: {askPrice: string; seller: {id: string}}[],
): boolean {
  if (!accountAddress) {
    return false;
  }
  return data.some(
    ask => ask.seller.id.toLowerCase() === accountAddress.toLowerCase(),
  );
}
