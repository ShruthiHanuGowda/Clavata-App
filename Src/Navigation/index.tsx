import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Root} from '../../Src/Screens/RootScreen/';
import {navigationRef} from './NavigationFunctions';
import Tabs from './NavigationTab';
import Onboarding from '../../Src/Screens/Intro';
import linking from './LinkingConfiguration';
import LoginScreen from '../../Src/Screens/AuthScreens/loginScreen';
import Drex from '../Screens/drecs';
import ProfileSetting from '../Screens/AppScreens/Account/profilesetting';
import CoinWallet from '../Screens/AppScreens/CoinWallet/CoinWallet';
import TransactionExample from '../../Src/TestingFolder/TransactionExample';
import TransactionHistory from '../Screens/AppScreens/TransactionHistory';
import ReceiveScreen from '../Screens/AppScreens/Receive/ReceiveScreen';
import TransferCoin from '../Screens/AppScreens/Transfer/TrasferCoin/TransferCoin';
import {VerifyAddress} from '../Screens/Send/VerifyAdress';
import SendCoin from '../Screens/Send/SendCoin';
import sendSuccess from '../Screens/Send/sendSuccess/sendSuccess';

import TradeCoin from '../Screens/AppScreens/TradeCoin';
import Account from '../Screens/AppScreens/Accountpage';
import ContactUs from '../Screens/AppScreens/ContactUs';
import Wallet from '../Screens/wallet';
import AccountBeneficary from '../Screens/AppScreens/Beneficiaries/beneficary';
import CollectionDetailsScreen from '../Screens/MarketPlaceNew/CollectionDetailsPage';
import NFTDetailsScreen from '../Screens/MarketPlaceNew/NFTDetailsPage';
import {SCREEN_CONSTANT} from './constant';
import ProfileNFTsScreen from '../Screens/MarketPlaceNew/ProfileNFTsScreen';

type AuthStackParamList = {
  login: {magicProps: any};
};

type RootStackParamList = {
  intro: undefined;
  root: undefined;
  authScreens: {magicProps: any};
  appScreens: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Properly typed props for screen components
interface AuthStackProps {
  magicProps: any;
}

function AuthScreenStack({magicProps}: AuthStackProps) {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="login" options={{headerShown: false}}>
        {props => <LoginScreen {...props} magicProps={magicProps} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function RootScreenStack() {
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{headerShown: false}}>
      <RootStack.Screen name="root" component={Root} />
      <RootStack.Screen name="intro" component={Onboarding} />
      <RootStack.Screen
        name="authScreens"
        options={{headerShown: false}}
        component={LoginScreen}
      />
      <RootStack.Screen
        name="collectionDetails"
        options={{headerShown: false}}
        component={CollectionDetailsScreen}
      />
      <RootStack.Screen
        name="NFTDetailsPage"
        options={{headerShown: false}}
        component={NFTDetailsScreen}
      />
      <RootStack.Screen
        name="ProfileNFTs"
        component={ProfileNFTsScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen name="appScreens" component={Tabs} />
    </RootStack.Navigator>
  );
}

const HomeStack = createNativeStackNavigator<RootStackParamList>();

export function HomeScreenStack() {
  return (
    <HomeStack.Navigator
      initialRouteName="D.Energy"
      screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="D.Energy" component={Drex} />
      <HomeStack.Screen name="ProfileSettings" component={ProfileSetting} />
      <HomeStack.Screen name="coinWallet" component={CoinWallet} />
      {/*<HomeStack.Screen name="coinWallet" component={TransactionExample} />*/}
      <HomeStack.Screen
        name="transactionHistroy"
        component={TransactionHistory}
      />
      <HomeStack.Screen name="receive" component={ReceiveScreen} />
      <HomeStack.Screen name="bridge" component={TransferCoin} />
      <HomeStack.Screen
        name={SCREEN_CONSTANT.VERIFYADDRESS}
        component={VerifyAddress}
      />
      <HomeStack.Screen
        name={SCREEN_CONSTANT.TRANSFERCOIN}
        component={TransferCoin}
      />
      <HomeStack.Screen name={SCREEN_CONSTANT.SENDCOIN} component={SendCoin} />
      <HomeStack.Screen
        name={SCREEN_CONSTANT.SENDSUCCESS}
        component={sendSuccess}
      />

      <HomeStack.Screen name="trade" component={TradeCoin} />
      <HomeStack.Screen name="account" component={Account} />
      <HomeStack.Screen name="contactus" component={ContactUs} />
      <HomeStack.Screen name="beneficary" component={AccountBeneficary} />
    </HomeStack.Navigator>
  );
}

const walletStack = createNativeStackNavigator<RootStackParamList>();

export function WalletStack() {
  return (
    <walletStack.Navigator
      initialRouteName="wallet"
      screenOptions={{headerShown: false}}>
      <walletStack.Screen name="wallet" component={Wallet} />
      <walletStack.Screen name="coinWallet" component={CoinWallet} />
    </walletStack.Navigator>
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
