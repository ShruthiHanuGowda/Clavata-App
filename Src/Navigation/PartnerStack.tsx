import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BecomePartnerScreen from '../Screens/Provider/BecomePartnerScreen';
import SalonRegistrationScreen from '../Screens/Provider/SalonRegistrationScreen';
import SalonAddressScreen from '../Screens/Provider/SalonAddressScreen';
import SalonKYCScreen from '../Screens/Provider/SalonKYCScreen';
import SalonReviewScreen from '../Screens/Provider/SalonReviewScreen';
import SalonSuccessScreen from '../Screens/Provider/SalonSuccessScreen';

const Stack = createNativeStackNavigator();

export default function PartnerStack() {
  return (
    <Stack.Navigator
      initialRouteName="BecomePartner"
      screenOptions={{ headerShown: false }}>

      <Stack.Screen
        name="BecomePartner"
        component={BecomePartnerScreen}
      />

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
        name="SalonReview"
        component={SalonReviewScreen}
      />

      <Stack.Screen
        name="SalonSuccess"
        component={SalonSuccessScreen}
      />

    </Stack.Navigator>
  );
}