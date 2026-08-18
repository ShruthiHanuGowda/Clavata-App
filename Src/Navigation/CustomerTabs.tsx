import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import TabBar from './TabBar';
import { RootTabParamList } from '../../types';
import {
  HomeScreenStack,
  BookingStack,
  ProfileStack,
  ExploreStack,
} from '.';

const Tab = createBottomTabNavigator<RootTabParamList>();
const renderTabBar = (props: any) => <TabBar {...props} />;

export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderTabBar}
      screenOptions={{
        unmountOnBlur: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreenStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Offers"
        component={ExploreStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
      {/* <Tab.Screen
        name="dApps"
        component={DAppsScreen}
        options={{headerShown: false}}
      /> */}
    </Tab.Navigator>
  );
}
