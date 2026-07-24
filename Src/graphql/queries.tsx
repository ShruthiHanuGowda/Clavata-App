import { gql } from '@apollo/client';

export const SEND_OTP = gql`
  mutation SendOTP($phoneNumber: String!) {
  sendOTP(phoneNumber: $phoneNumber) {
    success
    message
  }
}
`;

export const VERIFY_OTP = gql`
  mutation VerifyOTP($phoneNumber: String!, $otp: String!) {
    verifyOTP(
      phoneNumber: $phoneNumber
      otp: $otp
    ) {
      success
      message
      isExistingUser

      user {
        userId
        phoneNumber
        fullName
        activeRole
        providerStatus

        roles {
          customer
          businessPartner
        }

        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      success
      message
    }
  }
`;

export const REGISTER_SALON_PARTNER = gql`
  mutation RegisterSalonPartner(
    $input: RegisterSalonPartnerInput!
  ) {
    registerSalonPartner(input: $input) {
      success
      message
    }
  }
`;

// Define the GraphQL mutation
export const CREATE_USER_WALLETS = gql`
  mutation createUserWalletAddress(
    $createuserwalletaddressinput: CreateUserWalletAddressInput!
  ) {
    createUserWalletAddress(input: $createuserwalletaddressinput) {
      emailAddress
      userWallet
      date
      applicantId
      accessToken
    }
  }
`;

export const UPDATE_KYC_STATUS = gql`
  mutation updateIsVerified(
    $emailAddress: String!
    $is_verified: Boolean!
    $applicantId: String
    $accessToken: String
    $kycDetails: String
  ) {
    updateIsVerified(
      input: {
        emailAddress: $emailAddress
        is_verified: $is_verified
        applicantId: $applicantId
        accessToken: $accessToken
        kycDetails: $kycDetails
      }
    ) {
      emailAddress
      is_verified
      applicantId
      accessToken
      kycDetails
    }
  }
`;




// export const GET_USER_WALLET_ADDRESS = gql`
//   query getUserWalletAddress($emailAddress: String!) {
//     getUserWalletAddress(emailAddress: $emailAddress) {
//       emailAddress
//       userWallet
//       is_verified
//       date
//       applicantId
//       accessToken
//       kycDetails
//     }
//   }
// `;

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

export const LIST_PLATFORM_SETTINGS = gql`
  query ListPlatformSettings(
    $filter: TablePlatformSettingsFilterInput
    $limit: Int
  ) {
    listPlatformSettings(filter: $filter, limit: $limit) {
      items {
        pId
        keyName
        value
      }
    }
  }
`;
