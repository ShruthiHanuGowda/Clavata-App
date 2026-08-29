import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBar from './TabBar';

import HomeStackWeb from './HomeStack.web';
import ExploreStackWeb from './ExploreStack.web';
import BookingStackWeb from './BookingStack.web';
import ProfileStackWeb from './ProfileStack.web';

import { RootTabParamList } from '../../types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const renderTabBar = (props: any) => (
  <TabBar {...props} />
);

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackWeb}
        options={{
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Offers"
        component={ExploreStackWeb}
        options={{
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Bookings"
        component={BookingStackWeb}
        options={{
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStackWeb}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}