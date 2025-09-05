import {navigationRef} from '../Navigation/NavigationFunctions';

type ExtendedRootStackParamList = {
  // Common NFT/Marketplace screens
  walletNFTDetails: {nftId?: string; contractAddress?: string};
  SellNFT: undefined;
  UserNFTs: undefined;
  BuyNFT: undefined;
  NFTDetailsPage: undefined;
  collectionDetails: {contractAddress: string};

  // Common transaction/wallet screens
  transactionHistory: undefined;

  // Common account screens
  ProfileSettings: undefined;
  AddressBook: undefined;
  CreateAddress: undefined;
  beneficary: undefined;
  contactus: undefined;

  // Common news screens
  News: undefined;
  NewsDetail: undefined;

  // Common stake screens
  ValidatorDetailsScreen: undefined;
  StakeScreen: undefined;
  UnstakeScreen: undefined;
} & Record<string, any>;

export const navigateTo = <T extends keyof ExtendedRootStackParamList>(
  routeName: T,
  params?: ExtendedRootStackParamList[T]
): void => {
  navigationRef.current?.navigate(routeName as any, params);
};

export const navigateFromDrawer = <T extends keyof ExtendedRootStackParamList>(
  routeName: T,
  params?: ExtendedRootStackParamList[T]
): void => {
  navigationRef.current?.navigate(routeName as any, params);
};

export const navigateBack = (): void => {
  navigationRef.current?.goBack();
};
