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
      is_verified
      date
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
