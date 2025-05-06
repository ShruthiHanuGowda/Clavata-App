import {gql} from '@apollo/client';

// Define the GraphQL mutation
export const CREATE_USER_WALLETS = gql`
  mutation createUserWalletAddress(
    $createuserwalletaddressinput: CreateUserWalletAddressInput!
  ) {
    createUserWalletAddress(input: $createuserwalletaddressinput) {
      walletAddress
      denergyWallet
      ethereumWallet
      userWallet

      date
      applicantId
      accessToken
    }
  }
`;

export const UPDATE_KYC_STATUS = gql`
  mutation updateIsVerified(
    $walletAddress: String!
    $is_verified: Boolean!
    $applicantId: String
    $accessToken: String
  ) {
    updateIsVerified(
      input: {
        walletAddress: $walletAddress
        is_verified: $is_verified
        applicantId: $applicantId
        accessToken: $accessToken
      }
    ) {
      walletAddress
      is_verified
      applicantId
      accessToken
    }
  }
`;

export const GET_USER_WALLET_ADDRESS = gql`
  query getUserWalletAddress($walletAddress: String!) {
    getUserWalletAddress(walletAddress: $walletAddress) {
      walletAddress
      denergyWallet
      ethereumWallet
      userWallet
      is_verified
      date
    }
  }
`;

export const CREATE_KYC_VERIFICATION = gql`
  mutation createKYCVerification($email: String!, $levelName: String!) {
    createKYCVerification(input: {email: $email, levelName: $levelName}) {
      response
    }
  }
`;

export const CREATE_TRANSACTION_HISTORY_MOBILE = gql`
  mutation createTransactionHistoryMobile(
    $input: CreateTransactionHistoryMobileInput!
  ) {
    createTransactionHistoryMobile(input: $input) {
      transactionHash
      method
      createdAt
      from
      to
      amount
      txnFee
      coinCode
      transactionStatus
    }
  }
`;

export const LIST_TRANSACTION_HISTORY = gql`
  query listTransactionHistoryMobiles(
    $filter: TableTransactionHistoryMobileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTransactionHistoryMobiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      nextToken
      items {
        amount
        coinCode
        createdAt
        from
        method
        to
        transactionHash
        transactionStatus
        txnFee
      }
    }
  }
`;
