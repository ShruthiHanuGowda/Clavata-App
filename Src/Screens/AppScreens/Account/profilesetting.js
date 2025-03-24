import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import style from './styles';
import {Header} from '../../../Componants';
import {fontsFamily} from '../../../Theme';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import ToggleSwitch from 'toggle-switch-react-native';
import {navigateTo} from '../../../utils/navigationService';

export default function ProfileSetting(props) {
  const {userDetails} = useAuth();
  const [isEnabled, setIsEnabled] = useState(true);

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
  };

  const formatKey = key => {
    // Replace camelCase with spaces
    const spacedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
    // Capitalize first letter
    return spacedKey.charAt(0).toUpperCase() + spacedKey.slice(1);
  };

  // Function to format date values to be more readable
  const formatValue = (key, value) => {
    if (key === 'date' && value.includes('T')) {
      const date = new Date(value);
      return date.toLocaleString();
    }
    return value;
  };

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      {/* <Loader isShow={loading} /> */}
      <Header
        headerTitle="My Account"
        hideBorder={true}
        backBtn={() => navigateBack()}
      />
      {/* <Text style={style.font}>My Profile</Text> */}
      <ScrollView contentContainerStyle={style.container}>
        <View style={styles.subSec}>
          <View>
            <Text
              style={{
                fontFamily: fontsFamily.MulishBold,
                fontSize: 12,
                lineHeight: 20,
                color: '#00201B',
                letterSpacing: 1,
              }}>
              PERSONAL
            </Text>

            {Object.entries(userDetails).map(([key, value]) => (
              <View
                style={{
                  marginTop: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    width: '30%',
                  }}>
                  <Text
                    style={{
                      fontFamily: fontsFamily.MulishSemiBold,
                      fontSize: 12,
                      lineHeight: 15,
                      color: '#A1A1A1',
                      // width: '50%',
                    }}>
                    {formatKey(key)}
                  </Text>
                </View>
                <View style={{justifyContent: 'space-evenly', width: '70%'}}>
                  <Text
                    style={{
                      fontFamily: fontsFamily.MulishSemiBold,
                      fontSize: 12,
                      lineHeight: 15,
                      color: '#616161',
                      // width: '50%',
                      textAlign: 'right',
                    }}>
                    {formatValue(key, value)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.subSec}>
          <View>
            <Text
              style={{
                fontFamily: fontsFamily.MulishBold,
                fontSize: 12,
                lineHeight: 20,
                color: '#00201B',
                letterSpacing: 1,
              }}>
              SECURITY
            </Text>
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: fontsFamily.MulishSemiBold,
                  fontSize: 12,
                  lineHeight: 15,
                  color: '#A1A1A1',
                }}>
                Password
              </Text>
              <TouchableOpacity onPress={() => navigateTo('changePassword11')}>
                <Text
                  style={{
                    justifyContent: 'flex-end',
                    color: '#616161',
                    fontSize: 12,
                    fontFamily: fontsFamily.MulishBold,
                    textDecorationLine: 'underline',
                  }}>
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: fontsFamily.MulishSemiBold,
                  fontSize: 12,
                  lineHeight: 15,
                  color: '#A1A1A1',
                }}>
                Security Pin
              </Text>
              <TouchableOpacity onPress={() => ''}>
                <Text
                  style={{
                    justifyContent: 'flex-end',
                    color: '#616161',
                    fontSize: 12,
                    fontFamily: fontsFamily.MulishBold,
                    textDecorationLine: 'underline',
                  }}>
                  Change Pin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* <View style={styles.divider}></View> */}
          {/* <View
            style={{
              flexDirection: 'row',
              marginTop: 19.8,
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: fontsFamily.MulishBold,
                fontSize: 12,
                lineHeight: 20,
                color: '#00201B',
                letterSpacing: 1,
              }}>
              BIOMETRICS
            </Text>
            <ToggleSwitch
              isOn={isEnabled}
              onColor="#34C759"
              offColor="rgba(120, 120, 128, 0.16)"
              size="medium"
              onToggle={toggleSwitch}
              thumbOnStyle={{padding: 10}}
              thumbOffStyle={{padding: 10}}
            />
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  divider: {
    marginTop: 25,
    borderColor: '#edebeb',
    borderWidth: 0.5,
    width: '100%',
  },
  listSeparete: {
    marginVertical: 15,
    borderColor: '#edebeb',
    borderWidth: 0.5,
    width: '100%',
  },
  subSec: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 0.5,
    borderColor: '#DEDEDE',
    shadowColor: '#b6baba',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.3,
    elevation: 5,
  },
});
