import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList, CoinWalletStackParamList, HomeStackParamList, WalletStackParamList, StakeStackParamList, MarketplaceStackParamList, SalonProfileStackParamList } from '../../types';
import LoginScreen from '../../Src/Screens/AuthScreens/loginScreen';
import RegisterUser from '../../Src/Screens/RegisterUser/registerUser';
import BecomePartnerScreen from '../../Src/Screens/Provider/BecomePartnerScreen';
import VerifyOTPScreen from '../../Src/Screens/VerifyOTP/verifyOTPScreen';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { Root } from '../Screens/RootScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Tabs from './CustomerTabs';
import { SCREEN_CONSTANT } from './constant';
import HomeScreenPage from '../Screens/CustomerTabs/Home/HomeScreenPage';
// import CoinWallet from '../Screens/AppScreens/CoinWallet/CoinWallet';
// import Drex from '../Screens/HomeScreen';
// import {VerifyAddress} from '../Screens/Send/VerifyAdress';
// import SendCoin from '../Screens/Send/SendCoin';
import { navigationRef } from './NavigationFunctions';
import ExplorePage from '../Screens/CustomerTabs/Explore/ExplorePage';
import BookingPage from '../Screens/CustomerTabs/Booking/BookingPage';
import ProfileScreen from '../Screens/CustomerTabs/Profile/ProfileScreen';
import PartnerStack from './PartnerStack';
import AppTabs from './AppTabs';
import SalonDetailsScreen from '../Screens/CustomerTabs/Home/SalonDetailsScreen';
import BookingDateTimeScreen from '../Screens/CustomerTabs/Home/BookingDateTimeScreen';
import BookingSummaryScreen from '../Screens/CustomerTabs/Home/BookingSummaryScreen';
import BookingSuccessScreen from '../Screens/CustomerTabs/Home/BookingSuccessScreen';
import BookingRequestSent from '../Screens/CustomerTabs/Home/BookingRequestSent';
import BookingPayment from '../Screens/CustomerTabs/Home/BookingPayment';
import Payments from '../Screens/CustomerTabs/Profile/Payments';
import ProfileBookings from '../Screens/CustomerTabs/Profile/ProfileBookings';
import FavouriteSalons from '../Screens/CustomerTabs/Profile/FavouriteSalons';
import SavedAddresses from '../Screens/CustomerTabs/Profile/SavedAddresses';
import OffersRewards from '../Screens/CustomerTabs/Profile/OffersRewards';
import Settings from '../Screens/CustomerTabs/Profile/Settings';
import Notifications from '../Screens/CustomerTabs/Profile/Notifications';
import HelpSupport from '../Screens/CustomerTabs/Profile/HelpSupport';
import PrivacyPolicy from '../Screens/CustomerTabs/Profile/PrivacyPolicy';
import RateReviewScreen from '../Screens/CustomerTabs/RateReviewScreen';
import SalonProfileScreen from '../Screens/SalonTabs/Profile/SalonProfileScreen';
import StaffManagementScreen from '../Screens/SalonTabs/Profile/StaffManagementScreen';
import AddStaff from '../Screens/SalonTabs/Profile/staff/AddStaffScreen';
import EditStaff from '../Screens/SalonTabs/Profile/staff/EditStaffScreen';
import BusinessHoursScreen from '../Screens/SalonTabs/Profile/BusinessHoursScreen';
import BookingDetails from '../Screens/CustomerTabs/Profile/BookingDetails';
import EditProfile from '../Screens/CustomerTabs/Profile/EditProfile';

function RootScreenStack() {
  const RootStack = createNativeStackNavigator<RootStackParamList>();
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{ headerShown: false }}>
      {/* Main navigation screens */}
      <RootStack.Screen name="root" component={Root} />
      {/* <RootStack.Screen name="intro" component={Onboarding} /> */}
      <RootStack.Screen name="appScreens" component={AppTabs} />
      <RootStack.Screen
        name="authScreens"
        options={{ headerShown: false }}
        component={LoginScreen}
      />
      <RootStack.Screen
        name="VerifyOTP"
        component={VerifyOTPScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="RegisterUser"
        component={RegisterUser}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="BecomePartner"
        component={PartnerStack}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

// const CoinWalletStack = createNativeStackNavigator<CoinWalletStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
export function HomeScreenStack() {
  return (
    <HomeStack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreenPage} />
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
        component={BookingRequestSent} />
    </HomeStack.Navigator>
  );
}

const ExploreStackNavigator =
  createNativeStackNavigator<WalletStackParamList>();
export function ExploreStack() {
  return (
    <ExploreStackNavigator.Navigator
      initialRouteName="Explore"
      screenOptions={{ headerShown: false }}
    >
      <ExploreStackNavigator.Screen
        name="Explore"
        component={ExplorePage}
      />

      <ExploreStackNavigator.Screen
        name="SalonDetails"
        component={SalonDetailsScreen}
      />
    </ExploreStackNavigator.Navigator>
  );
}

const BookingplaceStack =
  createNativeStackNavigator<WalletStackParamList>();

export function BookingStack() {
  return (
    <BookingplaceStack.Navigator
      screenOptions={{ headerShown: false }}>
      <BookingplaceStack.Screen
        name="explore"
        component={BookingPage}
      />
      <BookingplaceStack.Screen
        name="BookingPayment"
        component={BookingPayment}
      />
      <BookingplaceStack.Screen
        name="RateReview"
        component={RateReviewScreen}
      />
    </BookingplaceStack.Navigator>
  );
}

const ProfilePlaceStack = createNativeStackNavigator<StakeStackParamList>();
export function ProfileStack() {
  return (
    <ProfilePlaceStack.Navigator
      screenOptions={{ headerShown: false }}>
      <ProfilePlaceStack.Screen
        name="profile"
        component={ProfileScreen}
      />
      <ProfilePlaceStack.Screen
        name="Payments"
        component={Payments}
      />
      <ProfilePlaceStack.Screen
        name="ProfileBookings"
        component={ProfileBookings}
      />
      <ProfilePlaceStack.Screen
        name="BookingDetails"
        component={BookingDetails}
      />
      <ProfilePlaceStack.Screen
        name="EditProfile"
        component={EditProfile}
      />
      <ProfilePlaceStack.Screen
        name="FavouriteSalons"
        component={FavouriteSalons}
      />
      <ProfilePlaceStack.Screen
        name="SavedAddresses"
        component={SavedAddresses}
      />
      <ProfilePlaceStack.Screen
        name="OffersRewards"
        component={OffersRewards}
      />
      <ProfilePlaceStack.Screen
        name="Settings"
        component={Settings}
      />
      <ProfilePlaceStack.Screen
        name="Notifications"
        component={Notifications}
      />
      <ProfilePlaceStack.Screen
        name="HelpSupport"
        component={HelpSupport}
      />
      <ProfilePlaceStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
      />
    </ProfilePlaceStack.Navigator>
  );
}


const SalonProfilePlaceStack = createNativeStackNavigator<SalonProfileStackParamList>();
export function SalonProfileStack() {
  return (
    <SalonProfilePlaceStack.Navigator
      screenOptions={{ headerShown: false }}>
      <SalonProfilePlaceStack.Screen
        name="profile"
        component={SalonProfileScreen}
      />
      <SalonProfilePlaceStack.Screen
        name="StaffManagementScreen"
        component={StaffManagementScreen}
      />
      <SalonProfilePlaceStack.Screen
        name="BusinessHoursScreen"
        component={BusinessHoursScreen}
      />
      <SalonProfilePlaceStack.Screen
        name="AddStaff"
        component={AddStaff}
      />
      <SalonProfilePlaceStack.Screen
        name="EditStaff"
        component={EditStaff}
      />
    </SalonProfilePlaceStack.Navigator>
  );
}

export function NavigationWrapper() {
  return (
    <View style={styles.container}>
      {/* <GestureHandlerRootView style={{ flex: 1 }}> */}
      <NavigationContainer ref={navigationRef}>
        <RootScreenStack />
      </NavigationContainer>
      {/* </GestureHandlerRootView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NavigationWrapper;
