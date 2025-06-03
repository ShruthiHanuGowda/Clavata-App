// Collections -> Nfts -> Transactions
// Users -> Nft tokens IDs
type Address = `0x${string}`;

export interface Transaction {
  id: string;
  block: string;
  timestamp: string;
  askPrice: string;
  netPrice: string;
  buyer: { id: string };
  seller: { id: string };
  withBNB: boolean;
  nft?: TokenMarketData;
}

export enum AskOrderType {
  NEW = 'New',
  MODIFY = 'Modify',
  CANCEL = 'Cancel',
}

export interface AskOrder {
  id: string;
  block: string;
  timestamp: string;
  askPrice: string;
  orderType: AskOrderType;
  nft?: TokenMarketData;
  seller?: { id: string };
}

export interface Image {
  original: string;
  thumbnail: string;
  mp4?: string;
  webm?: string;
  gif?: string;
}

export enum NftLocation {
  FORSALE = 'For Sale',
  WALLET = 'In Wallet',
}

export interface activeAsks {
  id: string;
  amount: string;
  askPrice: string;
  seller: {
    id: `0x${string}`;
  };
}

// Market data regarding specific token ID, acquired via subgraph
export interface TokenMarketData {
  id: string;
  tokenId: string;
  collection: {
    id: `0x${string}`;
    name: string;
  };
  // currentAskPrice: string
  currentSeller: string;
  isTradable: boolean;
  metadataUrl?: string;
  latestTradedPriceInUSDC?: string;
  tradeVolumeBNB?: string;
  totalTrades?: string;
  tradeVolumeUSDC?: string;
  totalListed?: string;
  otherId?: string;
  quantity?: number;
  updatedAt?: string;
  transactionHistory?: Transaction[];
  activeAsks?: activeAsks[];
}

// Represents single NFT token, either Squad-like NFT or single PancakeBunny.
export interface NftToken {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  collectionName: string;
  collectionAddress: Address;
  totalListed: string;
  image: Image;
  attributes?: NftAttribute[];
  createdAt?: string;
  updatedAt?: string;
  marketData?: TokenMarketData;
  location?: NftLocation;
  country?: string;
  year?: string;
  type?: string;
  meta?: Record<string, string | number>;
}

export interface NftFilter {
  activeFilters: Record<string, NftAttribute>;
  showOnlyOnSale: boolean;
  ordering: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface NftActivityFilter {
  typeFilters: MarketEvent[];
  collectionFilters: string[];
}

export interface TokenIdWithCollectionAddress {
  collectionAddress: Address;
  tokenId?: string;
  nftLocation?: NftLocation;
  quantity?: number;
  metadataUrl?: string;
}

export interface NftAttribute {
  traitType: string;
  value: string | number | undefined;
  displayType: string | null;
}

export interface Collection {
  id: Address;
  address: Address;
  contractAddress?: Address;
  name: string;
  collectionName: string;
  createdAt?: string;
  description?: string;
  year?: string;
  country?: string;
  type?: string;
  symbol: string;
  active: boolean;
  totalVolumeUSDC: string;
  numberTokensListed: string;
  tradingFee: string;
  creatorFee: string;
  owner: string;
  totalSupply: string;
  verified: boolean;
  avatar: string;
  banner: {
    large: string;
    small: string;
  };
  attributes?: NftAttribute[];
}

export interface ApiCollections {
  [key: string]: Collection;
}

export interface User {
  address: string;
  numberTokensListed: any;
  numberTokensPurchased: any;
  numberTokensSold: any;
  nfts: Record<string, any>; // String is an address, BigNumberish is a tokenID
}

/**
 * API RESPONSES
 */

export interface ApiCollection {
  contractAddress: Address;
  owner: string;
  name: string;
  collectionName: string;
  description: string;
  symbol: string;
  year: string;
  country: string;
  type: string;
  totalSupply: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  avatar: string;
  banner: {
    large: string;
    small: string;
  };
  attributes?: NftAttribute[]; // returned for specific collection but not for all collections
}

// Get all collections
// ${API_NFT}/collections/
export interface ApiCollectionsResponse {
  total: number;
  data: ApiCollection[];
}

// Get single collection
// ${API_NFT}/collections/${collectionAddress}
export interface ApiSingleCollectionResponse {
  data: ApiCollection;
}

// Get single collection
// ${API_NFT}/collections/${collectionAddress}
export interface ApiTokenFilterResponse {
  total: number;
  data: Record<string, ApiSingleTokenData>;
}

export interface ApiSingleTokenData {
  name: string;
  description: string;
  image: Image;
  collection: {
    name: string;
  };
  attributes?: NftAttribute[];
  tokenId?: string;
}

// Get tokens within collection
// ${API_NFT}/collections/${collectionAddress}/tokens
export interface ApiResponseCollectionTokens {
  total: number;
  attributesDistribution: Record<string, number>;
  data: Record<string, ApiSingleTokenData>;
}

// Get specific token data
// ${API_NFT}/collections/${collectionAddress}/tokens/${tokenId}
export interface ApiResponseSpecificToken {
  data: {
    tokenId: string;
    name: string;
    contractAddress: `0x${string}`;
    description: string;
    image: Image;
    createdAt: string;
    updatedAt: string;
    attributes: NftAttribute[];
    mintedVolume: string;
    collectionDetails: {
      collectionName: string;
      symbol?: string;
      year?: string;
      country?: string;
      type?: string;
      ownerAddress?: string;
    };
  };
}

// ${API_NFT}/collections/${collectionAddress}/distribution
export interface ApiCollectionDistribution {
  total: number;
  data: Record<string, Record<string, number>>;
}

export interface ApiCollectionDistributionPB {
  total: number;
  data: Record<string, number>;
}

export interface Activity {
  marketEvent: MarketEvent;
  timestamp: string;
  tx: string;
  nft?: TokenMarketData;
  price?: string;
  otherParty?: string;
  buyer?: string;
  seller?: string;
}

export enum MarketEvent {
  NEW = 'NEW',
  CANCEL = 'CANCEL',
  MODIFY = 'MODIFY',
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * SUBGRAPH RESPONSES
 */

export interface CollectionMarketDataBaseFields {
  id: Address;
  name: string;
  symbol: string;
  active: boolean;
  totalTrades: string;
  totalVolumeBNB: string;
  numberTokensListed: string;
  creatorAddress: string;
  tradingFee: string;
  creatorFee: string;
  whitelistChecked: string;
}

export interface UserActivity {
  askOrderHistory: AskOrder[];
  buyTradeHistory: Transaction[];
  sellTradeHistory: Transaction[];
}
