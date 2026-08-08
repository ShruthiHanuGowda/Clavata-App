import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalonStack from './SalonStack';
import BecomePartnerScreen from '../Screens/Provider/BecomePartnerScreen';
import SalonPendingVerificationScreen from '../Screens/Provider/SalonPendingVerificationScreen';
import SalonRegistrationScreen from '../Screens/Provider/SalonRegistrationScreen';
import SalonAddressScreen from '../Screens/Provider/SalonAddressScreen';
import SalonKYCScreen from '../Screens/Provider/SalonKYCScreen';
import SalonReviewScreen from '../Screens/Provider/SalonReviewScreen';
import SalonSuccessScreen from '../Screens/Provider/SalonSuccessScreen';
import SalonRejectedScreen from '../Screens/Provider/SalonRejectedScreen';

// import SalonTabs from './SalonTabs';

// import StaffManagementScreen from '../Screens/SalonTabs/Profile/StaffManagementScreen';
// import AddStaffScreen from '../Screens/SalonTabs/Profile/staff/AddStaffScreen';

const Stack = createNativeStackNavigator();

export default function PartnerStack() {
  return (
    <Stack.Navigator
      initialRouteName="BecomePartner"
      screenOptions={{
        headerShown: false,
      }}>

      {/* Provider registration */}

      <Stack.Screen
        name="BecomePartner"
        component={BecomePartnerScreen}
      />

      <Stack.Screen
        name="SalonPendingVerification"
        component={SalonPendingVerificationScreen}
      />

      <Stack.Screen
        name="RejectedScreen"
        component={SalonRejectedScreen}
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

      {/* Main salon application */}

      {/* <Stack.Screen
        name="SalonTabs"
        component={SalonTabs}
      /> */}

      {/* Salon management screens */}

      {/* <Stack.Screen
        name="StaffManagement"
        component={StaffManagementScreen}
      />

      <Stack.Screen
        name="AddStaff"
        component={AddStaffScreen}
      /> */}
      <Stack.Screen
        name="SalonApp"
        component={SalonStack}
      />
    </Stack.Navigator>
  );
}