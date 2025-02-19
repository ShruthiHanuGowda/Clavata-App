import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Root} from '../Screens/RootScreen';
import {navigationRef} from './NavigationFunctions';
import LoginScreen from '../Screens/AuthScreens/loginScreen';
import Tabs from './NavigationTab';
import Onboarding from '../Screens/Intro';

type AuthStackParamList = {
  login: { magicProps: any };
};

type RootStackParamList = {
  intro: undefined;
  root: undefined;
  authScreens: { magicProps: any };
  appScreens: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Properly typed props for screen components
interface AuthStackProps {
  magicProps: any;
}

function AuthScreenStack({ magicProps }: AuthStackProps) {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen
        name="login"
        options={{headerShown: false}}
      >
        {(props) => <LoginScreen {...props} magicProps={magicProps} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function RootScreenStack({ magicProps }: AuthStackProps) {
  return (
    <RootStack.Navigator
      initialRouteName="root"
      screenOptions={{headerShown: false}}>
      <RootStack.Screen name="root" component={Root} />
      <RootStack.Screen 
        name="authScreens" 
        options={{headerShown: false}}
      >
        {(props) => <AuthScreenStack {...props} magicProps={magicProps} />}
      </RootStack.Screen>
      <RootStack.Screen name="appScreens" component={Tabs} />
    </RootStack.Navigator>
  );
}

interface NavigationWrapperProps {
  magicProps: any;
}

export function NavigationWrapper({magicProps}: NavigationWrapperProps) {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootScreenStack magicProps={magicProps} />
    </NavigationContainer>
  );
}

export default NavigationWrapper;
