import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OfferPage from '../Screens/CustomerTabs/Offer/OfferPage';
import SalonDetailsScreen from '../Screens/CustomerTabs/Home/SalonDetailsScreen';

const Stack = createNativeStackNavigator();

export default function ExploreStackWeb() {
    return (
        <Stack.Navigator
            initialRouteName="Offers"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Offers"
                component={OfferPage}
            />

            <Stack.Screen
                name="SalonDetails"
                component={SalonDetailsScreen}
            />
        </Stack.Navigator>
    );
}