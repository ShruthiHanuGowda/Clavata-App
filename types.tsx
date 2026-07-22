/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  // Main navigation screens
  root: undefined;
  intro: undefined;
  appScreens: undefined;
  authScreens: undefined;
  RegisterUser: {
    phoneNumber: string;
  };
  OffsetScreen: undefined;
  VerifyOTP: {
    phoneNumber: string;
  };
  // Common NFT/Marketplace screens
  walletNFTDetails: { nftId?: string; contractAddress?: string };
  NFTDetailHistory: undefined;
  SellNFT: {
    variant?: string;
    nftToSell?: any;
    refresh?: () => void;
  };
  UserNFTs: undefined;
  BuyNFT: {
    nftToBuy?: any;
    currentSeller?: string;
  };
  NFTDetailsPage: undefined;
  collectionDetails: { contractAddress: string };

  // Common transaction/wallet screens
  transactionHistory: undefined;

  // Common account screens
  ProfileSettings: undefined;
  AddressBook: undefined;
  CreateAddress: undefined;
  beneficary: undefined;
  contactus: undefined;
  WalletConnect: undefined;

  // Common news screens
  News: undefined;
  NewsDetail: {
    blogID: string;
  };

  // Common stake screens
  ValidatorDetailsScreen: undefined;
  StakeScreen: undefined;
  UnstakeScreen: undefined;
  QueuedDelegationsScreen: { delegatorAddress: string };

  // Deprecated types (kept for backwards compatibility)
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  'Nex': undefined;
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Profile: undefined;
  dApps: undefined;
  Stake: undefined;
  // Deprecated types (kept for backwards compatibility)
  Login: undefined;
  Web3: undefined;
};

export type HomeStackParamList = {
  'Nex': undefined;
  HomeScreen: undefined;
  coinWalletStack: undefined;
  account: undefined;
};

export type WalletStackParamList = {
  explore: undefined;
  wallet: undefined;
  coinWalletStack: undefined;
  Booking: undefined;
};

export type CoinWalletStackParamList = {
  coinWallet: undefined;
  ReceiveScreen: undefined;
  VerifyAddress: undefined;
  TRANSFERCOIN: undefined;
  SENDCOIN: undefined;
  swap: undefined;
};

export type StakeStackParamList = {
  stake: undefined;
  profile: undefined;
};

export type MarketplaceStackParamList = {
  marketplace: undefined;
  Booking: undefined;
};

export type TabOneParamList = {
  LoginScreen: undefined;
};

export type TabTwoParamList = {
  Web3Screen: undefined;
};
