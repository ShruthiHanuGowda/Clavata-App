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

  const displayData = [
    {label: 'Issuer', value: userDetails?.issuer},
    {label: 'Public Address', value: userDetails?.publicAddress},
    {label: 'Email', value: userDetails?.email},
    {label: 'Phone Number', value: userDetails?.phoneNumber || 'Not provided'},
    {
      label: 'MFA Status',
      value: userDetails?.isMfaEnabled ? 'Enabled' : 'Disabled',
    },
    {
      label: 'Recovery Factors',
      value: userDetails?.recoveryFactors.length
        ? userDetails?.recoveryFactors.join(', ')
        : 'None',
    },
  ];

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
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
            <View style={{marginTop: 16, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: fontsFamily.MulishSemiBold,
                    fontSize: 12,
                    lineHeight: 15,
                    color: '#A1A1A1',
                  }}>
                  Full Name
                </Text>
              </View>
              <View style={{justifyContent: 'space-evenly'}}>
                <Text
                  style={{
                    fontFamily: fontsFamily.MulishSemiBold,
                    fontSize: 12,
                    lineHeight: 15,
                    color: '#616161',
                  }}>
                  test
                </Text>
              </View>
            </View>
            <View style={{marginTop: 14, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: fontsFamily.MulishSemiBold,
                    fontSize: 12,
                    lineHeight: 15,
                    color: '#A1A1A1',
                  }}>
                  Email
                </Text>
              </View>
              <View style={{justifyContent: 'space-evenly'}}>
                <Text
                  style={{
                    fontFamily: fontsFamily.MulishSemiBold,
                    fontSize: 12,
                    lineHeight: 15,
                    color: '#616161',
                  }}>
                  test1@gmail.com
                </Text>
              </View>
            </View>
            {displayData &&
              displayData.map((item, index) => (
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
                      {item.label}
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
                      {item.value}
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
