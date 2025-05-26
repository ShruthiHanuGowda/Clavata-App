import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Root } from '../../Src/Screens/RootScreen/';
import { navigationRef } from './NavigationFunctions';
import Tabs from './NavigationTab';
import Onboarding from '../../Src/Screens/Intro';
import linking from './LinkingConfiguration';
import LoginScreen from '../../Src/Screens/AuthScreens/loginScreen';
import Drex from '../Screens/drecs';
import ProfileSetting from '../Screens/AppScreens/Account/profilesetting';
import CoinWallet from '../Screens/AppScreens/CoinWallet/CoinWallet';

import TransactionHistory from '../Screens/AppScreens/TransactionHistory';
import ReceiveScreen from '../Screens/AppScreens/Receive/ReceiveScreen';
import TransferCoin from '../Screens/AppScreens/Transfer/TrasferCoin/TransferCoin';
import { VerifyAddress } from '../Screens/Send/VerifyAdress';
import SendCoin from '../Screens/Send/SendCoin';
import sendSuccess from '../Screens/Send/sendSuccess/sendSuccess';

import TradeCoin from '../Screens/AppScreens/TradeCoin';
import Account from '../Screens/AppScreens/Accountpage';
import ContactUs from '../Screens/AppScreens/ContactUs';
import Wallet from '../Screens/wallet';
import AccountBeneficary from '../Screens/AppScreens/Beneficiaries/beneficary';
import CollectionDetailsScreen from '../Screens/MarketPlaceNew/CollectionDetailsPage';
import NFTDetailsScreen from '../Screens/MarketPlaceNew/NFTDetailsPage';
import { SCREEN_CONSTANT } from './constant';
import ProfileNFTsScreen from '../Screens/MarketPlaceNew/ProfileNFTsScreen';
import Stake from '../Screens/Stake';
import ValidatorDetailsScreen from '../Screens/Stake/ValidatorDetailsScreen';
import StakeScreen from '../Screens/Stake/StakeScreen';
import WalletNFTDetailsScreen from '../Screens/MarketPlaceNew/WalletNFTDetailsPage';
import OffsetScreen from '../Screens/MarketPlaceNew/OffsetScreen';

type AuthStackParamList = {
  login: { magicProps: any };
};

type RootStackParamList = {
  intro: undefined;
  root: undefined;
  authScreens: { magicProps: any };
  appScreens: undefined;
  collectionDetails: undefined;
  NFTDetailsPage: undefined;
  ProfileNFTs: undefined;
};

type HomeStackParamList = {
  'D.Energy': undefined;
  ProfileSettings: undefined;
  coinWalletStack: undefined;
  trade: undefined;
  account: undefined;
  contactus: undefined;
  beneficary: undefined;
};

type CoinWalletStackParamList = {
  coinWallet: undefined;
  [SCREEN_CONSTANT.RECIEVESCREEN]: undefined;
  [SCREEN_CONSTANT.VERIFYADDRESS]: undefined;
  [SCREEN_CONSTANT.TRANSFERCOIN]: undefined;
  [SCREEN_CONSTANT.SENDCOIN]: undefined;
  [SCREEN_CONSTANT.SENDSUCCESS]: undefined;
};

type WalletStackParamList = {
  wallet: undefined;
  coinWalletStack: undefined;
};

type StakeStackParamList = {
  stake: undefined;
  ValidatorDetailsScreen: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function RootScreenStack() {
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="root" component={Root} />
      <RootStack.Screen name="intro" component={Onboarding} />
      <RootStack.Screen
        name="authScreens"
        options={{ headerShown: false }}
        component={LoginScreen}
      />
      <RootStack.Screen
        name="collectionDetails"
        options={{ headerShown: false }}
        component={CollectionDetailsScreen}
      />
      <RootStack.Screen
        name="NFTDetailsPage"
        options={{ headerShown: false }}
        component={NFTDetailsScreen}
      />
      <RootStack.Screen
        name="ProfileNFTs"
        component={ProfileNFTsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="walletNFTDetails"
        component={WalletNFTDetailsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="OffsetScreen"
        component={OffsetScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen name="appScreens" component={Tabs} />
    </RootStack.Navigator>
  );
}

const CoinWalletStack = createNativeStackNavigator<CoinWalletStackParamList>();

export function CoinWalletStackFun() {
  return (
    <CoinWalletStack.Navigator
      initialRouteName="coinWallet"
      screenOptions={{ headerShown: false }}>
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
      <CoinWalletStack.Screen name="bridge" component={TransferCoin} />
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

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

export function HomeScreenStack() {
  return (
    <HomeStack.Navigator
      initialRouteName="D.Energy"
      screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="D.Energy" component={Drex} />
      <HomeStack.Screen name="ProfileSettings" component={ProfileSetting} />
      <HomeStack.Screen name="coinWalletStack" component={CoinWalletStackFun} />

      <HomeStack.Screen name="trade" component={TradeCoin} />
      <HomeStack.Screen name="account" component={Account} />
      <HomeStack.Screen name="contactus" component={ContactUs} />
      <HomeStack.Screen name="beneficary" component={AccountBeneficary} />
    </HomeStack.Navigator>
  );
}

const walletStack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStack() {
  return (
    <walletStack.Navigator
      initialRouteName="wallet"
      screenOptions={{ headerShown: false }}>
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
      screenOptions={{ headerShown: false }}>
      <StakeStack.Screen name="stake" component={Stake} />
      <StakeStack.Screen
        name="ValidatorDetailsScreen"
        component={ValidatorDetailsScreen}
      />
      <StakeStack.Screen name="StakeScreen" component={StakeScreen} />
    </StakeStack.Navigator>
  );
}

interface NavigationWrapperProps {
  magicProps: any;
}

export function NavigationWrapper() {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <RootScreenStack />
    </NavigationContainer>
  );
}

export default NavigationWrapper;
