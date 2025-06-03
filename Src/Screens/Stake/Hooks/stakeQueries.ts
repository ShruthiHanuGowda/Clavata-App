import {gql} from '@apollo/client';

export const GET_NFT_DELEGATIONS = gql`
  query getNftDelegations(
    $first: Int
    $skip: Int
    $where: NFTDelegation_filter
    $orderBy: NFTDelegation_orderBy
    $orderDirection: OrderDirection
  ) {
    nftdelegations(
      where: $where
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      delegator
      erc1155Contract
      tokenId
      amount
      shares
      createdAt
      updatedAt
    }
  }
`;
