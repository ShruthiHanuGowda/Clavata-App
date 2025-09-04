import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../../types';

// Extended RootStackParamList to include common screens
type ExtendedRootStackParamList = RootStackParamList & {
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
};

export const navigationRef = createNavigationContainerRef<ExtendedRootStackParamList>();

export const navigateBack = () => {
  navigationRef?.goBack();
};

export const navigate = <T extends keyof ExtendedRootStackParamList>(
  screenName: T,
  ...params: undefined extends ExtendedRootStackParamList[T]
    ? [ExtendedRootStackParamList[T]?]
    : [ExtendedRootStackParamList[T]]
) => {
  try {
    if (navigationRef.current?.isReady()) {
      if (params.length > 0 && params[0] !== undefined) {
        (navigationRef.current as any).navigate(screenName, params[0]);
      } else {
        (navigationRef.current as any).navigate(screenName);
      }
    } else {
      console.warn('[Navigation] Navigation is not ready yet');
    }
  } catch (error) {
    console.error('[Navigation] Error during navigation:', error);
  }
};

export const navReset = <T extends keyof ExtendedRootStackParamList>(
  screenName: T,
  ...params: undefined extends ExtendedRootStackParamList[T]
    ? [ExtendedRootStackParamList[T]?]
    : [ExtendedRootStackParamList[T]]
) => {
  console.log('reset to screen:', screenName);
  if (navigationRef.current?.isReady()) {
    const routeConfig = params.length > 0 && params[0] !== undefined 
      ? {name: screenName, params: params[0]}
      : {name: screenName};
    (navigationRef.current as any).reset({
      index: 0,
      routes: [routeConfig],
    });
  } else {
    console.warn('Navigation not ready yet');
  }
};
