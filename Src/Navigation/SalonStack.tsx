import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalonTabs from './SalonTabs';
import StaffManagementScreen from '../Screens/SalonTabs/Profile/StaffManagementScreen';
import AddStaffScreen from '../Screens/SalonTabs/Profile/staff/AddStaffScreen';
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
            <Stack.Screen
                name="StaffManagement"
                component={StaffManagementScreen}
            />
            <Stack.Screen
                name="AddStaff"
                component={AddStaffScreen}
            />
        </Stack.Navigator>
    );
}