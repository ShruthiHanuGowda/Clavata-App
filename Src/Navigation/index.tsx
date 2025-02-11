import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../Screens/AuthScreens/loginScreen';
import {Root} from '../Screens/RootScreen';
import {navigationRef} from './NavigationFunctions.ts';

// Assuming `navigationRef` is declared elsewhere, for example:

type AuthStackParamList = {
  login: undefined; // Define your params type if necessary
};
type RootStackParamList = {
  root: undefined; // Define your params type if necessary
  authScreens: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthScreenStack() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function RootScreenStack() {
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{headerShown: false}}>
      <RootStack.Screen name="root" component={Root} />
      <RootStack.Screen name="authScreens" component={AuthScreenStack} />
    </RootStack.Navigator>
  );
}

export function NavigationWrapper() {
  return (
    <NavigationContainer ref={navigationRef}>
      {RootScreenStack()}
    </NavigationContainer>
  );
}

export default NavigationWrapper;
