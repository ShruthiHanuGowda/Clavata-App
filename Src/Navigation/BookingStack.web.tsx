import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BookingPage from '../Screens/CustomerTabs/Booking/BookingPage';
import BookingPayment from '../Screens/CustomerTabs/Home/BookingPayment';
import RateReviewScreen from '../Screens/CustomerTabs/RateReviewScreen';

const Stack = createNativeStackNavigator();

export default function BookingStackWeb() {
  return (
    <Stack.Navigator
      initialRouteName="explore"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="explore"
        component={BookingPage}
      />

      {/* <Stack.Screen
        name="BookingPayment"
        component={BookingPayment}
      /> */}

      <Stack.Screen
        name="RateReview"
        component={RateReviewScreen}
      />
    </Stack.Navigator>
  );
}