import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {RootStackParamList, CoinWalletStackParamList, HomeStackParamList, WalletStackParamList, StakeStackParamList, MarketplaceStackParamList} from '../../types';
import LoginScreen from '../../Src/Screens/AuthScreens/loginScreen';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, View} from 'react-native';
import {Root} from '../Screens/RootScreen';
import Tabs from './NavigationTab';
import {SCREEN_CONSTANT} from './constant';
import CoinWallet from '../Screens/AppScreens/CoinWallet/CoinWallet';
import Drex from '../Screens/HomeScreen';
import {VerifyAddress} from '../Screens/Send/VerifyAdress';
import SendCoin from '../Screens/Send/SendCoin';
import {navigationRef} from './NavigationFunctions';
import CollectionDetailsScreen from '../Screens/MarketPlace/CollectionDetailsPage';
import NFTDetailsScreen from '../Screens/MarketPlace/NFTDetailsPage';
import WalletNFTDetailsScreen from '../Screens/MarketPlace/WalletNFTDetailsPage';
import OffsetScreen from '../Screens/MarketPlace/OffsetScreen';
import TransactionHistory from '../Screens/AppScreens/TransactionHistory';
import Stake from '../Screens/Stake';
import ValidatorDetailsScreen from '../Screens/Stake/ValidatorDetailsScreen';
import StakeScreen from '../Screens/Stake/StakeScreen';
import QueuedDelegationsScreen from '../Screens/Stake/QueuedDelegationsScreen/index';
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
import SellNFTScreen from '../Screens/MarketPlace/SellNFT';
import UserNFTsScreen from '../Screens/MarketPlace/UserNFTsScreen';
import UnstakeScreen from '../Screens/Stake/UnstakeScreen';
import News from '../Screens/NewsScreens/News';
import NewsDetail from '../Screens/NewsScreens/NewsDetail';
import AddressBookList from '../Screens/AddressBookScreens/AddressBookList';
import CreateAddress from '../Screens/AddressBookScreens/CreateAddress';
import Swap from '../Screens/Swap';
import NFTDetailHistory from '../Screens/MarketPlace/WalletNFTDetailsPage/NFTDetailHistory';
import WalletConnectScreen from '../Screens/WalletConnect';


function RootScreenStack() {
  const RootStack = createNativeStackNavigator<RootStackParamList>();
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{headerShown: false}}>
      {/* Main navigation screens */}
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

      {/* Common NFT/Marketplace screens */}
      <RootStack.Screen
        name="walletNFTDetails"
        component={WalletNFTDetailsScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="NFTDetailHistory"
        component={NFTDetailHistory}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="SellNFT"
        component={SellNFTScreen as any}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="UserNFTs"
        component={UserNFTsScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="BuyNFT"
        component={BuyNFTScreen as any}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="NFTDetailsPage"
        component={NFTDetailsScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="collectionDetails"
        component={CollectionDetailsScreen}
        options={{headerShown: false}}
      />

      {/* Common transaction/wallet screens */}
      <RootStack.Screen
        name="transactionHistory"
        component={TransactionHistory}
        options={{headerShown: false}}
      />

      {/* Common account screens */}
      <RootStack.Screen
        name="ProfileSettings"
        component={ProfileSetting}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="AddressBook"
        component={AddressBookList}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="CreateAddress"
        component={CreateAddress}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="beneficary"
        component={AccountBeneficary}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="contactus"
        component={ContactUs}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="WalletConnect"
        component={WalletConnectScreen}
        options={{headerShown: false}}
      />

      {/* Common news screens */}
      <RootStack.Screen
        name="News"
        component={News}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="NewsDetail"
        component={NewsDetail}
        options={{headerShown: false}}
      />

      {/* Common stake screens */}
      <RootStack.Screen
        name="ValidatorDetailsScreen"
        component={ValidatorDetailsScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="StakeScreen"
        component={StakeScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="UnstakeScreen"
        component={UnstakeScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="QueuedDelegationsScreen"
        component={QueuedDelegationsScreen}
        options={{headerShown: false}}
      />
    </RootStack.Navigator>
  );
}


const CoinWalletStack = createNativeStackNavigator<CoinWalletStackParamList>();

export function CoinWalletStackFun() {
  return (
    <CoinWalletStack.Navigator
      initialRouteName="coinWallet"
      screenOptions={{headerShown: false}}>
      <CoinWalletStack.Screen name="coinWallet" component={CoinWallet} />
      <CoinWalletStack.Screen
        name="ReceiveScreen"
        component={ReceiveScreen as any}
      />
      <CoinWalletStack.Screen
        name="VerifyAddress"
        component={VerifyAddress as any}
      />
      <CoinWalletStack.Screen
        name={SCREEN_CONSTANT.TRANSFERCOIN}
        component={TransferCoin}
      />
      <CoinWalletStack.Screen
        name={SCREEN_CONSTANT.SENDCOIN}
        component={SendCoin as any}
      />

      <CoinWalletStack.Screen name="swap" component={Swap} />
    </CoinWalletStack.Navigator>
  );
}


const HomeStack = createNativeStackNavigator<HomeStackParamList>();

export function HomeScreenStack() {
  return (
    <HomeStack.Navigator
      initialRouteName="D.Energy"
      screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="D.Energy" component={Drex} />
      <HomeStack.Screen name="account" component={Account} />
      <HomeStack.Screen name="coinWalletStack" component={CoinWalletStackFun} />
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
    </MarketplaceStack.Navigator>
  );
}

export function NavigationWrapper() {
  return (
    <View style={styles.container}>
      <NavigationContainer ref={navigationRef}>
        <RootScreenStack />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NavigationWrapper;
