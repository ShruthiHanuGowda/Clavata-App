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
import TransactionHistory from '../Screens/AppScreens/TransactionHistory';
import ReceiveScreen from '../Screens/AppScreens/Receive/ReceiveScreen';
import TransferCoin from '../Screens/AppScreens/Transfer/TrasferCoin/TransferCoin';
import {VerifyAddress} from '../Screens/Send/VerifyAdress';
import TradeCoin from '../Screens/AppScreens/TradeCoin';

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
      <HomeStack.Screen
        name="D.Energy"
        component={Drex}
        screenOptions={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ProfileSettings"
        component={ProfileSetting}
        screenOptions={{headerShown: false}}
      />
      <HomeStack.Screen
        name="coinWallet"
        component={CoinWallet}
        screenOptions={{headerShown: false}}
      />
      {/* //NOTE - hasn't used anywhere */}
      <HomeStack.Screen
        name="transactionHistroy"
        component={TransactionHistory}
        screenOptions={{headerShown: false}}
      />
      <HomeStack.Screen
        name="receive"
        component={ReceiveScreen}
        screenOptions={{headerShown: false}}
      />
      <HomeStack.Screen
        name="bridge"
        component={TransferCoin}
        screenOptions={{headerShown: false}}
      />
      <HomeStack.Screen
        name="send"
        component={VerifyAddress}
        screenOptions={{headerShown: false}}
      />
      <HomeStack.Screen
        name="trade"
        component={TradeCoin}
        screenOptions={{headerShown: false}}
      />
    </HomeStack.Navigator>
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
