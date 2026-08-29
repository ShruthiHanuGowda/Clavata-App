import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SalonStack from './SalonStack';

import BecomePartnerScreen from '../Screens/Provider/BecomePartnerScreen';

import SalonPendingVerificationScreen from '../Screens/Provider/SalonPendingVerificationScreen.web';

import SalonRegistrationScreen from '../Screens/Provider/SalonRegistrationScreen';

import SalonAddressScreen from '../Screens/Provider/SalonAddressScreen';

import SalonKYCScreen from '../Screens/Provider/SalonKYCScreen';

import SalonReviewScreen from '../Screens/Provider/SalonReviewScreen';

import SalonSuccessScreen from '../Screens/Provider/SalonSuccessScreen';

import SalonRejectedScreen from '../Screens/Provider/SalonRejectedScreen';

import SalonBusinessHoursScreen from '../Screens/Provider/SalonBusinessHoursScreen';

const Stack = createNativeStackNavigator();

export default function PartnerStack() {
    return (
        <Stack.Navigator
            initialRouteName="BecomePartner"
            screenOptions={{
                headerShown: false,
            }}
        >
            {/* =====================================================
          PROVIDER REGISTRATION
      ===================================================== */}

            <Stack.Screen
                name="BecomePartner"
                component={BecomePartnerScreen}
            />

            {/* =====================================================
          WEB PENDING VERIFICATION
      ===================================================== */}

            <Stack.Screen
                name="SalonPendingVerification"
                component={SalonPendingVerificationScreen}
            />

            {/* =====================================================
          REJECTED
      ===================================================== */}

            <Stack.Screen
                name="RejectedScreen"
                component={SalonRejectedScreen}
            />

            {/* =====================================================
          REGISTRATION
      ===================================================== */}

            <Stack.Screen
                name="SalonRegistration"
                component={SalonRegistrationScreen}
            />

            <Stack.Screen
                name="SalonAddress"
                component={SalonAddressScreen}
            />

            <Stack.Screen
                name="SalonKYC"
                component={SalonKYCScreen}
            />

            <Stack.Screen
                name="SalonBusinessHours"
                component={SalonBusinessHoursScreen}
            />

            <Stack.Screen
                name="SalonReview"
                component={SalonReviewScreen}
            />

            <Stack.Screen
                name="SalonSuccess"
                component={SalonSuccessScreen}
            />

            {/* =====================================================
          SALON APPLICATION
      ===================================================== */}

            <Stack.Screen
                name="SalonApp"
                component={SalonStack}
            />
        </Stack.Navigator>
    );
}