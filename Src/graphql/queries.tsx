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

export const UPDATE_KYC_STATUS = gql`
  mutation updateIsVerified($walletAddress: String!, $is_verified: Boolean!) {
    updateIsVerified(
      input: {walletAddress: $walletAddress, is_verified: $is_verified}
    ) {
      walletAddress
      is_verified
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
