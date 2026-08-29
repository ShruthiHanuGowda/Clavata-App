import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreenPage from '../Screens/CustomerTabs/Home/HomeScreenPage';
import SalonDetailsScreen from '../Screens/CustomerTabs/Home/SalonDetailsScreen';
import BookingDateTimeScreen from '../Screens/CustomerTabs/Home/BookingDateTimeScreen';
import BookingSummaryScreen from '../Screens/CustomerTabs/Home/BookingSummaryScreen';
import BookingSuccessScreen from '../Screens/CustomerTabs/Home/BookingSuccessScreen';
import BookingRequestSent from '../Screens/CustomerTabs/Home/BookingRequestSent';

const Stack = createNativeStackNavigator();

export default function HomeStackWeb() {
    return (
        <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreenPage}
            />

            <Stack.Screen
                name="SalonDetails"
                component={SalonDetailsScreen}
            />

            <Stack.Screen
                name="BookingDateTime"
                component={BookingDateTimeScreen}
            />

            <Stack.Screen
                name="BookingSummary"
                component={BookingSummaryScreen}
            />

            <Stack.Screen
                name="BookingSuccess"
                component={BookingSuccessScreen}
            />

            <Stack.Screen
                name="BookingRequestSent"
                component={BookingRequestSent}
            />
        </Stack.Navigator>
    );
}