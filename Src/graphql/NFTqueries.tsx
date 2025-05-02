import {gql} from '@apollo/client';

const activeAsksFields = `
    id
    amount
    askPrice
    timestamp
    seller {
      id
    }
`;

export const baseNftFields = `
  id
  tokenId
  otherId
  metadataUrl
  updatedAt
  latestTradedPriceInUSDC
  tradeVolumeUSDC
  totalTrades
  isTradable
  totalListed
  collection {
    id
    name
    symbol
  }
  activeAsks {
    ${activeAsksFields}
  }
`;

export const baseTransactionFields = `
  id
  block
  timestamp
  askPrice
  netPrice
  amount
  tokenId
`;

export const collectionBaseFields = `
  id
  name
  symbol
  active
  totalTrades
  totalVolumeUSDC
  numberTokensListed
  creatorAddress
  tradingFee
  creatorFee
  whitelistChecker
`;

export const GET_NFTS_MARKET_DATA = gql`
      query getNftsMarketData(
        $first: Int
        $skip: Int!
        $where: NFT_filter
        $orderBy: NFT_orderBy
        $orderDirection: OrderDirection
      ) {
        nfts(
          where: $where
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
        ) {
          ${baseNftFields}
          transactionHistory {
            ${baseTransactionFields}
          }
        }
      }
    `;

export const GET_TOKEN_ACTIVITY = gql`
        query getCollectionActivity($tokenId: BigInt!, $address: ID!) {
          nfts(where:{tokenId: $tokenId, collection: $address}) {
            transactionHistory(orderBy: timestamp, orderDirection: desc) {
              ${baseTransactionFields}
                nft {
                  ${baseNftFields}
                }
            }
            askHistory(orderBy: timestamp, orderDirection: desc) {
                id
                block
                timestamp
                orderType
                askPrice
                seller {
                  id
                }
                nft {
                  ${baseNftFields}
                }
            }
          }
        }
    `;

export const GET_NFTS_COLLECTIONS = gql`
  query NftsWithCollections {
    nfts(first: 1000) {
      collection {
        id
        name
        symbol
        active
        totalTrades
        totalVolumeUSDC
        numberTokensListed
        creatorAddress
        tradingFee
        creatorFee
        whitelistChecker
      }
    }
  }
`;
