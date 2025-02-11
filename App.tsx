import React from 'react';
import {SafeAreaView} from 'react-native';
import {Colors} from './Src/Theme';
import NavigationWrapper from './Src/Navigation/index.tsx';
import {AuthProvider} from './Src/Providers/authProvider.tsx';

function App(): React.JSX.Element {
  const backgroundStyle = {
    backgroundColor: Colors.white,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <AuthProvider>
        <NavigationWrapper />
      </AuthProvider>
    </SafeAreaView>
  );
}

export default App;
