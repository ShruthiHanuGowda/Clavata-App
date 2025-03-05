import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import style from './styles';
import {Header} from '../../../Componants';
import {fontsFamily} from '../../../Theme';
import {useAuth} from '../../../../screens/Provider/authProvider';

export default function ProfileSetting(props) {
  const {userDetails} = useAuth();

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

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      {/* <Loader isShow={loading} /> */}
      <Text style={style.font}>My Profile</Text>
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
