
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types';

import HomeScreenPage from '../Screens/CustomerTabs/Home/HomeScreenPage';
import SalonDetailsScreen from '../Screens/CustomerTabs/Home/SalonDetailsScreen';
import BookingDateTimeScreen from '../Screens/CustomerTabs/Home/BookingDateTimeScreen';
import BookingSummaryScreen from '../Screens/CustomerTabs/Home/BookingSummaryScreen';
import BookingSuccessScreen from '../Screens/CustomerTabs/Home/BookingSuccessScreen';
import BookingRequestSent from '../Screens/CustomerTabs/Home/BookingRequestSent';

import OfferPage from '../Screens/CustomerTabs/Offer/OfferPage';

import BookingPage from '../Screens/CustomerTabs/Booking/BookingPage';
import BookingPayment from '../Screens/CustomerTabs/Home/BookingPayment';
import RateReviewScreen from '../Screens/CustomerTabs/RateReviewScreen';

import ProfileScreen from '../Screens/CustomerTabs/Profile/ProfileScreen';
import Payments from '../Screens/CustomerTabs/Profile/Payments';
import ProfileBookings from '../Screens/CustomerTabs/Profile/ProfileBookings';
import BookingDetails from '../Screens/CustomerTabs/Profile/BookingDetails';
import EditProfile from '../Screens/CustomerTabs/Profile/EditProfile';
import FavouriteSalons from '../Screens/CustomerTabs/Profile/FavouriteSalons';
import SavedAddresses from '../Screens/CustomerTabs/Profile/SavedAddresses';
import OffersRewards from '../Screens/CustomerTabs/Profile/OffersRewards';
import Settings from '../Screens/CustomerTabs/Profile/Settings';
import Notifications from '../Screens/CustomerTabs/Profile/Notifications';
import HelpSupport from '../Screens/CustomerTabs/Profile/HelpSupport';
import PrivacyPolicy from '../Screens/CustomerTabs/Profile/PrivacyPolicy';


// ============================================================
// HOME
// ============================================================

const HomeStack = createNativeStackNavigator();

export function HomeScreenStackWeb() {
  return (
    <HomeStack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreenPage}
      />

      <HomeStack.Screen
        name="SalonDetails"
        component={SalonDetailsScreen}
      />

      <HomeStack.Screen
        name="BookingDateTime"
        component={BookingDateTimeScreen}
      />

      <HomeStack.Screen
        name="BookingSummary"
        component={BookingSummaryScreen}
      />

      <HomeStack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
      />

      <HomeStack.Screen
        name="BookingRequestSent"
        component={BookingRequestSent}
      />
    </HomeStack.Navigator>
  );
}


// ============================================================
// OFFERS / EXPLORE
// ============================================================

const ExploreStack = createNativeStackNavigator();

export function ExploreStackWeb() {
  return (
    <ExploreStack.Navigator
      initialRouteName="Offers"
      screenOptions={{
        headerShown: false,
      }}
    >
      <ExploreStack.Screen
        name="Offers"
        component={OfferPage}
      />

      <ExploreStack.Screen
        name="SalonDetails"
        component={SalonDetailsScreen}
      />
    </ExploreStack.Navigator>
  );
}


// ============================================================
// BOOKINGS
// ============================================================

const BookingStackNavigator = createNativeStackNavigator();

export function BookingStackWeb() {
  return (
    <BookingStackNavigator.Navigator
      initialRouteName="explore"
      screenOptions={{
        headerShown: false,
      }}
    >
      <BookingStackNavigator.Screen
        name="explore"
        component={BookingPage}
      />

      <BookingStackNavigator.Screen
        name="BookingPayment"
        component={BookingPayment}
      />

      <BookingStackNavigator.Screen
        name="RateReview"
        component={RateReviewScreen}
      />
    </BookingStackNavigator.Navigator>
  );
}


// ============================================================
// PROFILE
// ============================================================

const ProfileStackNavigator = createNativeStackNavigator();

export function ProfileStackWeb() {
  return (
    <ProfileStackNavigator.Navigator
      initialRouteName="profile"
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStackNavigator.Screen
        name="profile"
        component={ProfileScreen}
      />

      <ProfileStackNavigator.Screen
        name="Payments"
        component={Payments}
      />

      <ProfileStackNavigator.Screen
        name="ProfileBookings"
        component={ProfileBookings}
      />

      <ProfileStackNavigator.Screen
        name="BookingDetails"
        component={BookingDetails}
      />

      <ProfileStackNavigator.Screen
        name="EditProfile"
        component={EditProfile}
      />

      <ProfileStackNavigator.Screen
        name="FavouriteSalons"
        component={FavouriteSalons}
      />

      <ProfileStackNavigator.Screen
        name="SalonDetails"
        component={SalonDetailsScreen}
      />

      <ProfileStackNavigator.Screen
        name="SavedAddresses"
        component={SavedAddresses}
      />

      <ProfileStackNavigator.Screen
        name="OffersRewards"
        component={OffersRewards}
      />

      <ProfileStackNavigator.Screen
        name="Settings"
        component={Settings}
      />

      <ProfileStackNavigator.Screen
        name="Notifications"
        component={Notifications}
      />

      <ProfileStackNavigator.Screen
        name="HelpSupport"
        component={HelpSupport}
      />

      <ProfileStackNavigator.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
      />
    </ProfileStackNavigator.Navigator>
  );
}

