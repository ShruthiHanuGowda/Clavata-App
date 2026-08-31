import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalonTabs from './SalonTabs';
const Stack = createNativeStackNavigator();
export default function SalonStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="SalonTabs"
                component={SalonTabs}
            />
        </Stack.Navigator>
    );
}