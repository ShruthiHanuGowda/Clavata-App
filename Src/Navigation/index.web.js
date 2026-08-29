import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { Root } from '../Screens/RootScreen';

import WelcomeChoiceScreen from '../Screens/Login/WelcomeChoiceScreen';
import LoginScreen from '../Screens/Login/loginScreen';
import RegisterUser from '../Screens/RegisterUser/registerUser';

import PartnerStack from './PartnerStack.web';
import AppTabs from './AppTabs.web';

import { navigationRef } from './NavigationFunctions';


// ============================================================
// ROOT STACK
// ============================================================

const RootStack = createNativeStackNavigator();


// ============================================================
// WEB LINKING
// ============================================================

const linking = {
  prefixes: [
    'http://localhost:3000',
  ],

  config: {
    screens: {

      // ======================================================
      // ROOT
      // ======================================================

      root: '',


      // ======================================================
      // WELCOME
      // ======================================================

      authScreens: 'welcome',


      // ======================================================
      // LOGIN
      // ======================================================

      LoginScreen: 'login',


      // ======================================================
      // REGISTER
      // ======================================================

      RegisterUser: 'register',


      // ======================================================
      // PROVIDER
      // ======================================================

      BecomePartner: {
        path: 'partner',

        screens: {
          BecomePartner: 'register',
          SalonPendingVerification: 'pending',
          RejectedScreen: 'rejected',
          SalonRegistration: 'salon-registration',
          SalonAddress: 'salon-address',
          SalonKYC: 'salon-kyc',
          SalonBusinessHours: 'business-hours',
          SalonReview: 'review',
          SalonSuccess: 'success',
          SalonApp: 'dashboard',
        },
      },


      // ======================================================
      // CUSTOMER / SALON APP
      // ======================================================

      appScreens: {
        path: 'app',
      },
    },
  },
};


// ============================================================
// ROOT SCREEN STACK
// ============================================================

function RootScreenStack() {
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{
        headerShown: false,
      }}
    >

      {/* ====================================================
          ROOT
      ==================================================== */}

      <RootStack.Screen
        name="root"
        component={Root}
      />


      {/* ====================================================
          WELCOME
      ==================================================== */}

      <RootStack.Screen
        name="authScreens"
        component={WelcomeChoiceScreen}
      />


      {/* ====================================================
          LOGIN
      ==================================================== */}

      <RootStack.Screen
        name="LoginScreen"
        component={LoginScreen}
      />


      {/* ====================================================
          REGISTER
      ==================================================== */}

      <RootStack.Screen
        name="RegisterUser"
        component={RegisterUser}
      />


      {/* ====================================================
          PROVIDER
      ==================================================== */}

      <RootStack.Screen
        name="BecomePartner"
        component={PartnerStack}
      />


      {/* ====================================================
          CUSTOMER / SALON APP
      ==================================================== */}

      <RootStack.Screen
        name="appScreens"
        component={AppTabs}
      />

    </RootStack.Navigator>
  );
}


// ============================================================
// WEB NAVIGATION
// ============================================================

function Navigation() {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
    >
      <RootScreenStack />
    </NavigationContainer>
  );
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default Navigation;