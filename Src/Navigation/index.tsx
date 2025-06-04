import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {RootStackParamList} from '../../types';
import LoginScreen from '../../Src/Screens/AuthScreens/loginScreen';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import LoginScreenNew from '../Screens/AuthScreens/loginScreenNew';
import {View} from 'react-native';
import {Root} from '../Screens/RootScreen';
import Tabs from './NavigationTab';
import {SCREEN_CONSTANT} from './constant';
import CoinWallet from '../Screens/AppScreens/CoinWallet/CoinWallet';
import Drex from '../Screens/HomeScreen';
import {VerifyAddress} from '../Screens/Send/VerifyAdress';
import SendCoin from '../Screens/Send/SendCoin';
import sendSuccess from '../Screens/Send/sendSuccess/sendSuccess';
import {navigationRef} from './NavigationFunctions';
import CollectionDetailsScreen from '../Screens/MarketPlace/CollectionDetailsPage';
import NFTDetailsScreen from '../Screens/MarketPlace/NFTDetailsPage';
import WalletNFTDetailsScreen from '../Screens/MarketPlace/WalletNFTDetailsPage';
import OffsetScreen from '../Screens/MarketPlace/OffsetScreen';
import TransactionHistory from '../Screens/AppScreens/TransactionHistory';
import Stake from '../Screens/Stake';
import ValidatorDetailsScreen from '../Screens/Stake/ValidatorDetailsScreen';
import StakeScreen from '../Screens/Stake/StakeScreen';
import ReceiveScreen from '../Screens/AppScreens/Receive/ReceiveScreen';
import TransferCoin from '../Screens/AppScreens/Transfer/TrasferCoin/TransferCoin';
import Account from '../Screens/AppScreens/Accountpage';
import Wallet from '../Screens/wallet';
import ProfileSetting from '../Screens/AppScreens/Account/profilesetting';
import AccountBeneficary from '../Screens/AppScreens/Beneficiaries/beneficary';
import ContactUs from '../Screens/AppScreens/ContactUs';
import Onboarding from '../Screens/Intro';
import BuyNFTScreen from '../Screens/MarketPlace/BuyNFT';
import CollectionListingPage from '../Screens/MarketPlace';
import SellScreen from '../Screens/MarketPlace/SellNFT';
import SellNFTScreen from '../Screens/MarketPlace/SellNFT';
import UserNFTsScreen from '../Screens/MarketPlace/UserNFTsScreen';
import UnstakeScreen from '../Screens/Stake/UnstakeScreen';

function RootScreenStack() {
  const RootStack = createNativeStackNavigator<RootStackParamList>();
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{headerShown: false}}>
      <RootStack.Screen name="root" component={Root} />
      <RootStack.Screen name="intro" component={Onboarding} />
      <RootStack.Screen name="appScreens" component={Tabs} />
      <RootStack.Screen
        name="authScreens"
        options={{headerShown: false}}
        component={LoginScreen}
      />
      <RootStack.Screen
        name="OffsetScreen"
        component={OffsetScreen}
        options={{headerShown: false}}
      />
    </RootStack.Navigator>
  );
}

type CoinWalletStackParamList = {
  coinWallet: undefined;
  [SCREEN_CONSTANT.RECIEVESCREEN]: undefined;
  [SCREEN_CONSTANT.VERIFYADDRESS]: undefined;
  [SCREEN_CONSTANT.TRANSFERCOIN]: undefined;
  [SCREEN_CONSTANT.SENDCOIN]: undefined;
  [SCREEN_CONSTANT.SENDSUCCESS]: undefined;
};

const CoinWalletStack = createNativeStackNavigator<CoinWalletStackParamList>();

export function CoinWalletStackFun() {
  return (
    <CoinWalletStack.Navigator
      initialRouteName="coinWallet"
      screenOptions={{headerShown: false}}>
      <CoinWalletStack.Screen name="coinWallet" component={CoinWallet} />
      {/*<HomeStack.Screen name="coinWallet" component={TransactionExample} />*/}
      <CoinWalletStack.Screen
        name="transactionHistroy"
        component={TransactionHistory}
      />
      <CoinWalletStack.Screen
        name={SCREEN_CONSTANT.RECIEVESCREEN}
        component={ReceiveScreen}
      />
      <CoinWalletStack.Screen
        name={SCREEN_CONSTANT.VERIFYADDRESS}
        component={VerifyAddress}
      />
      <CoinWalletStack.Screen
        name={SCREEN_CONSTANT.TRANSFERCOIN}
        component={TransferCoin}
      />

      <CoinWalletStack.Screen
        name={SCREEN_CONSTANT.SENDCOIN}
        component={SendCoin}
      />
      <CoinWalletStack.Screen
        name={SCREEN_CONSTANT.SENDSUCCESS}
        component={sendSuccess}
      />
    </CoinWalletStack.Navigator>
  );
}

type HomeStackParamList = {
  'D.Energy': undefined;
  ProfileSettings: undefined;
  coinWalletStack: undefined;
  trade: undefined;
  account: undefined;
  contactus: undefined;
  beneficary: undefined;
};

type WalletStackParamList = {
  wallet: undefined;
  coinWalletStack: undefined;
};

type StakeStackParamList = {
  stake: undefined;
  ValidatorDetailsScreen: undefined;
};

type MarketplaceStackParamList = {
  marketplace: undefined;
  collectionDetails: undefined;
  NFTDetailsPage: undefined;
  walletNFTDetails: undefined;
  OffsetScreen: undefined;
  BuyNFT: undefined;
  UserNFTs: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

export function HomeScreenStack() {
  return (
    <HomeStack.Navigator
      initialRouteName="D.Energy"
      screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="D.Energy" component={Drex} />
      <HomeStack.Screen name="account" component={Account} />
      <HomeStack.Screen name="ProfileSettings" component={ProfileSetting} />
      <HomeStack.Screen name="coinWalletStack" component={CoinWalletStackFun} />
      <HomeStack.Screen name="beneficary" component={AccountBeneficary} />
      <HomeStack.Screen name="contactus" component={ContactUs} />
      <HomeStack.Screen
        name="transactionHistroy"
        component={TransactionHistory}
      />
      <HomeStack.Screen
        name="walletNFTDetails"
        component={WalletNFTDetailsScreen}
      />
      <HomeStack.Screen name="SellNFT" component={SellNFTScreen} />
      <MarketplaceStack.Screen name="UserNFTs" component={UserNFTsScreen} />
    </HomeStack.Navigator>
  );
}

const walletStack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStack() {
  return (
    <walletStack.Navigator
      initialRouteName="wallet"
      screenOptions={{headerShown: false}}>
      <walletStack.Screen name="wallet" component={Wallet} />
      <walletStack.Screen
        name="coinWalletStack"
        component={CoinWalletStackFun}
      />
    </walletStack.Navigator>
  );
}
const StakeStack = createNativeStackNavigator<StakeStackParamList>();

export function StakeStackFun() {
  return (
    <StakeStack.Navigator
      initialRouteName="stake"
      screenOptions={{headerShown: false}}>
      <StakeStack.Screen name="stake" component={Stake} />
      <StakeStack.Screen
        name="ValidatorDetailsScreen"
        component={ValidatorDetailsScreen}
      />
      <StakeStack.Screen name="StakeScreen" component={StakeScreen} />
      <StakeStack.Screen name="UnstakeScreen" component={UnstakeScreen} />
    </StakeStack.Navigator>
  );
}

const MarketplaceStack =
  createNativeStackNavigator<MarketplaceStackParamList>();

export function MarketplaceStackFun() {
  return (
    <MarketplaceStack.Navigator
      initialRouteName="marketplace"
      screenOptions={{headerShown: false}}>
      <MarketplaceStack.Screen
        name="marketplace"
        component={CollectionListingPage}
      />
      <MarketplaceStack.Screen
        name="collectionDetails"
        component={CollectionDetailsScreen}
      />
      <MarketplaceStack.Screen
        name="NFTDetailsPage"
        component={NFTDetailsScreen}
      />
      <MarketplaceStack.Screen name="OffsetScreen" component={OffsetScreen} />
      <MarketplaceStack.Screen name="BuyNFT" component={BuyNFTScreen} />
    </MarketplaceStack.Navigator>
  );
}

export function NavigationWrapper() {
  return (
    <View style={{flex: 1}}>
      <NavigationContainer ref={navigationRef}>
        <RootScreenStack />
      </NavigationContainer>
    </View>
  );
}

export default NavigationWrapper;
