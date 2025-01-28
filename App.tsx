
import React from 'react';
import {
  SafeAreaView,
} from 'react-native';
import LoginScreen from './Src/Screens/AuthScreens/loginScreen.tsx';
import {Colors} from './Src/Theme';


function App(): React.JSX.Element {
  const backgroundStyle = {
    backgroundColor: Colors.white,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <LoginScreen />
    </SafeAreaView>
  );
}



export default App;
