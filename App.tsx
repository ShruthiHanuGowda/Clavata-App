import React, {useEffect} from 'react';
import {SafeAreaView, View} from 'react-native';
import {Colors} from './Src/Theme';
import NavigationWrapper from './Src/Navigation/index.tsx';
import {AuthProvider} from './Src/Providers/authProvider.tsx';
import BootSplash from 'react-native-bootsplash';

function App(): React.JSX.Element {
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({fade: true});
      console.log('BootSplash has been hidden successfully');
    });
  }, []);

  const backgroundStyle = {
    backgroundColor: Colors.white,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={{flex: 1, backgroundColor: Colors.white}}>
        <AuthProvider>
          <NavigationWrapper />
        </AuthProvider>
      </View>
    </SafeAreaView>
  );
}

export default App;
