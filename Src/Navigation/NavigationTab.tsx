import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import TabBar from './TabBar';
// import MarketPlace from '../Screens/MarketPlace';
import MarketPlace from '../Screens/MarketPlaceNew';
import {HomeScreenStack, StakeStackFun, WalletStack} from '.';

type RootTabParamList = {
  'D.Energy': undefined;
  Wallet: undefined;
  Marketplace: undefined;
  dApps: undefined;
  Stake: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="D.Energy"
      tabBar={props => <TabBar {...props} />}>
      <Tab.Screen
        name="D.Energy"
        component={HomeScreenStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletStack}
        options={{headerShown: false}}
      />
      {/* <Tab.Screen
        name="Marketplace"
        component={MarketPlace}
        options={{headerShown: false}}
      /> */}
      <Tab.Screen
        name="Marketplace"
        component={MarketPlace}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Stake"
        component={StakeStackFun}
        options={{headerShown: false}}
      />
      {/* <Tab.Screen
        name="dApps"
        component={DAppsScreen}
        options={{headerShown: false}}
      /> */}
    </Tab.Navigator>
  );
}
