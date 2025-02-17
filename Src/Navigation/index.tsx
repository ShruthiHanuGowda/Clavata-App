import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Root} from '../Screens/RootScreen';
import {navigationRef} from './NavigationFunctions';
import LoginScreen from '../Screens/AuthScreens/loginScreen';
import Tabs from './NavigationTab';
import Onboarding from '../Screens/Intro';

type AuthStackParamList = {
  login: undefined;
  tab: undefined;
};

type RootStackParamList = {
  intro: undefined;
  root: undefined;
  authScreens: undefined;
  appScreens: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthScreenStack() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen
        name="login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
}

function RootScreenStack() {
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{headerShown: false}}>
      <RootStack.Screen name="root" component={Root} />
      <RootStack.Screen name="intro" component={Onboarding} />
      <RootStack.Screen name="authScreens" component={AuthScreenStack} />
      <RootStack.Screen name="appScreens" component={Tabs} />
    </RootStack.Navigator>
  );
}

export function NavigationWrapper() {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootScreenStack />
    </NavigationContainer>
  );
}

export default NavigationWrapper;
