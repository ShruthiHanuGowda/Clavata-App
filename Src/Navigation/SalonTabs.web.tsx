
import React from 'react';

import {
  Text,
  StyleSheet,
} from 'react-native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import SalonDashboardScreen
  from '../Screens/SalonTabs/Dashboard/SalonDashboardScreen';

import SalonAppointmentsScreen
  from '../Screens/SalonTabs/Appointments/SalonAppointmentsScreen';

import SalonServicesScreen
  from '../Screens/SalonTabs/Services/SalonServicesScreen';

import SalonProfileScreen
  from '../Screens/SalonTabs/Profile/SalonProfileScreen';

import { SalonProfileStack } from '.';


// ============================================================
// TAB
// ============================================================

const Tab =
  createBottomTabNavigator();


// ============================================================
// COLORS
// ============================================================

const PRIMARY = '#009D94';


// ============================================================
// WEB TAB ICON
// ============================================================

type TabIconProps = {
  routeName: string;
  color: string;
  size: number;
};

function WebTabIcon({
  routeName,
  color,
  size,
}: TabIconProps) {

  let icon = '●';

  switch (routeName) {

    case 'Dashboard':
      icon = '▦';
      break;

    case 'Appointments':
      icon = '□';
      break;

    case 'Services':
      icon = '✂';
      break;

    case 'Profile':
      icon = '●';
      break;

    default:
      icon = '●';
      break;
  }

  return (
    <Text
      style={[
        styles.icon,
        {
          color,
          fontSize: size,
        },
      ]}
    >
      {icon}
    </Text>
  );
}


// ============================================================
// COMPONENT
// ============================================================

export default function SalonTabs() {

  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor:
          PRIMARY,

        tabBarInactiveTintColor:
          '#9CA3AF',

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },

        tabBarIcon: ({
          color,
          size,
        }) => (

          <WebTabIcon
            routeName={route.name}
            color={color}
            size={size}
          />

        ),

      })}
    >

      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <Tab.Screen
        name="Dashboard"
        component={
          SalonDashboardScreen
        }
      />


      {/* ======================================================
          APPOINTMENTS
      ====================================================== */}

      <Tab.Screen
        name="Appointments"
        component={
          SalonAppointmentsScreen
        }
      />


      {/* ======================================================
          SERVICES
      ====================================================== */}

      <Tab.Screen
        name="Services"
        component={
          SalonServicesScreen
        }
      />


      {/* ======================================================
          PROFILE
      ====================================================== */}

      <Tab.Screen
        name="Profile"
        component={
          SalonProfileStack
        }
      />

    </Tab.Navigator>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    icon: {
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 24,
    },

  });

