import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../Screens/CustomerTabs/Profile/ProfileScreen';
import Payments from '../Screens/CustomerTabs/Profile/Payments';
import PaymentMethod from '../Screens/CustomerTabs/Profile/PaymentMethod';
import ProfileBookings from '../Screens/CustomerTabs/Profile/ProfileBookings';
import BookingDetails from '../Screens/CustomerTabs/Profile/BookingDetails';
import EditProfile from '../Screens/CustomerTabs/Profile/EditProfile';
import FavouriteSalons from '../Screens/CustomerTabs/Profile/FavouriteSalons';
import SalonDetailsScreen from '../Screens/CustomerTabs/Home/SalonDetailsScreen';
import SavedAddresses from '../Screens/CustomerTabs/Profile/SavedAddresses';
import OffersRewards from '../Screens/CustomerTabs/Profile/OffersRewards';
import Settings from '../Screens/CustomerTabs/Profile/Settings';
import Notifications from '../Screens/CustomerTabs/Profile/Notifications';
import HelpSupport from '../Screens/CustomerTabs/Profile/HelpSupport';
import PrivacyPolicy from '../Screens/CustomerTabs/Profile/PrivacyPolicy';

const Stack = createNativeStackNavigator();

export default function ProfileStackWeb() {
  return (
    <Stack.Navigator
      initialRouteName="profile"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
      />

      <Stack.Screen
        name="Payments"
        component={Payments}
      />

      {/* <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethod}
      /> */}

      <Stack.Screen
        name="BookingDetails"
        component={BookingDetails}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
      />

      <Stack.Screen
        name="FavouriteSalons"
        component={FavouriteSalons}
      />

      <Stack.Screen
        name="SalonDetails"
        component={SalonDetailsScreen}
      />

      <Stack.Screen
        name="SavedAddresses"
        component={SavedAddresses}
      />

      <Stack.Screen
        name="OffersRewards"
        component={OffersRewards}
      />

      <Stack.Screen
        name="Settings"
        component={Settings}
      />

      <Stack.Screen
        name="Notifications"
        component={Notifications}
      />

      <Stack.Screen
        name="HelpSupport"
        component={HelpSupport}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
      />
    </Stack.Navigator>
  );
}