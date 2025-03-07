import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Screen1} from '../Screens/TempScreens/Screen1';
import {Screen2} from '../Screens/TempScreens/Screen2';
import {Screen3} from '../Screens/TempScreens/Screen3';
import {Screen5} from '../Screens/TempScreens/Screen5';
import {Screen4} from '../Screens/TempScreens/Screen4';
import TabBar from './TabBar';
import Drex from '../Screens/drecs';
import Wallet from '../Screens/wallet';
import ProfileSetting from '../Screens/AppScreens/Account/profilesetting';
import MarketPlace from '../Screens/MarketPlace';
import Stake from '../Screens/Stake';
import DAppsScreen from '../Screens/DApps';
import {HomeScreenStack} from '.';
// import ProfileSetting from '../Screens/AppScreens/Account/Profilesetting/profilesetting';

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
        component={Wallet}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketPlace}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Stake"
        component={Stake}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="dApps"
        component={DAppsScreen}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
}
