import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';

import SalonDashboardScreen from '../Screens/SalonTabs/Dashboard/SalonDashboardScreen';
import SalonAppointmentsScreen from '../Screens/SalonTabs/Appointments/SalonAppointmentsScreen';
import SalonServicesScreen from '../Screens/SalonTabs/Services/SalonServicesScreen';
import SalonProfileScreen from '../Screens/SalonTabs/Profile/SalonProfileScreen';

const Tab = createBottomTabNavigator();

const PRIMARY = '#009D94';

export default function SalonTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarActiveTintColor: PRIMARY,
                tabBarInactiveTintColor: '#9CA3AF',

                tabBarStyle: {
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                },

                tabBarIcon: ({ color, size }) => {
                    let iconName = 'ellipse';

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = 'grid';
                            break;

                        case 'Appointments':
                            iconName = 'calendar';
                            break;

                        case 'Services':
                            iconName = 'cut';
                            break;

                        case 'Profile':
                            iconName = 'person';
                            break;
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={size}
                            color={color}
                        />
                    );
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={SalonDashboardScreen}
            />

            <Tab.Screen
                name="Appointments"
                component={SalonAppointmentsScreen}
            />

            <Tab.Screen
                name="Services"
                component={SalonServicesScreen}
            />

            <Tab.Screen
                name="Profile"
                component={SalonProfileScreen}
            />
        </Tab.Navigator>
    );
}