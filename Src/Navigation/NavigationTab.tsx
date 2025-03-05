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
        component={Drex}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Marketplace"
        component={Screen3}
        options={{headerShown: false}}
      />
      <Tab.Screen name="dApps" component={Screen4} />
      <Tab.Screen
        name="Stake"
        component={ProfileSetting}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
}
