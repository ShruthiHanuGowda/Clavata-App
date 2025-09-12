import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import TabBar from './TabBar';
import {RootTabParamList} from '../../types';
import {
  HomeScreenStack,
  MarketplaceStackFun,
  StakeStackFun,
  WalletStack,
} from '.';

const Tab = createBottomTabNavigator<RootTabParamList>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderTabBar = (props: any) => <TabBar {...props} />;

export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="D.Energy"
      tabBar={renderTabBar}
      screenOptions={{
        unmountOnBlur: true,
      }}>
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
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceStackFun}
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
