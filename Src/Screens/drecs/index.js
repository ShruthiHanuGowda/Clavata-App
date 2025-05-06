import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Header, ScreenWidth} from '@rneui/base';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {View} from 'react-native';
import {fontsFamily, Images} from '../../Theme';

import StakingActivities from './StakingActivities';
import CryptoMarketPlace from './CryptoMarketPlace';
import BalanceCarousal from './BalanceCarousal';
import {DText} from '../../Componants/DText';
import {Path, Svg} from 'react-native-svg';
// import {navigate} from '../../Navigation/NavigationFunctions';
import {SCREEN_CONSTANT} from '../../Navigation/constant';
// import images from '../../../../images';
import {useFocusEffect, useScrollToTop} from '@react-navigation/native';
import {navigateTo} from '../../utils/navigationService';
import {useWallet} from '../../../screens/Provider/WalletProvider';
import {useAuth} from '../../../screens/Provider/authProvider';

function HomeHeader(props) {
  const {userDetails} = useAuth();
  function getUsernameFromEmail(email) {
    return email.split('@')[0];
  }
  const username = getUsernameFromEmail(userDetails.walletAddress);
  return (
    <Header
      containerStyle={{
        borderBottomWidth: 0,
      }}
      backgroundColor={'#FFF'}
      leftComponent={
        <View style={styles.nameContainer}>
          <DText style={styles.hello} fontStyle="fontSemiBold">
            {`Hello, ${username}`}
            {!props?.loading && (
              <DText fontStyle="fontBold">{props?.name?.split(' ')[0]}</DText>
            )}
          </DText>
          {props?.kycVerified && !props?.loading && (
            <Image
              source={Images.verified}
              style={{
                height: 20,
                width: 20,
              }}
            />
          )}
        </View>
      }
      rightComponent={
        <View
          style={{
            flexDirection: 'row',
          }}>
          {/* <TouchableOpacity
            style={styles.dotContainer}
            // onPress={() => navigateTo(SCREEN_CONSTANT.NOTIFICATIONS)}
          >
            <Image source={Images.notification} />
            {props?.newCount > 0 && <View style={styles.dot} />}
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.dotContainer}
            onPress={() => navigateTo('account')}>
            <Image source={Images.profile} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}

export default function HomeScreen({navigation}) {
  const {refreshAllBalances} = useWallet();
  // const { get, getDrecs, data, drecsData, balanceData, loading, getBalance, getProfile, profile } =
  //   useContext(AppContext).portfolio;
  // const { newCount, getNewCount } = useNotification();
  const scrollViewRef = useRef();
  // const init = () => {
  //   get();
  //   getDrecs();
  //   getBalance();
  //   getProfile();
  //   getNewCount();
  //   scrollToTop();
  // };
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  };
  const ref = React.useRef(null);

  useScrollToTop(scrollViewRef);

  useFocusEffect(
    useCallback(() => {
      refreshAllBalances();

      return () => {
        console.log('Screen is unfocused!');
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader
      //  loading={loading} {...profile} newCount={newCount}
      />
      {/* <DKYC loading={loading} {...profile} /> */}
      <ScrollView
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refreshAllBalances()}
          />
        }>
        <BalanceCarousal
        // loading={loading}
        // drecsData={drecsData}
        // {...balanceData}
        />
        <StakingActivities
        // loading={loading} {...drecsData}
        />
        <CryptoMarketPlace
        // loading={loading} {...balanceData}
        />
        <View style={{marginTop: 30, marginHorizontal: 20}}>
          <Text
            style={{
              fontFamily: fontsFamily.MulishBold,
              color: '#000000',
              fontSize: 12,
              lineHeight: 22,
              letterSpacing: 2,
            }}>
            NEWS & ANNOUNCEMENTS
          </Text>
          {/* <FlatList
            data={[
              {
                headlines:
                  'Major Global Energy Company Integrates Energy Attribute Certificates (EACs) Using Blockchain Technology',
                date: '20th October 2024',
                // readtimeETA: '2 min read',
                image: Images.newstemp1,
              },
              {
                headlines:
                  'EU Passes New Regulations to Boost Investment in Clean Energy Projects',
                date: '29th October 2024',
                // readtimeETA: '1 min read',
                image: Images.newstemp2,
              },
              {
                headlines:
                  'Renewable Energy Blockchain Consortium Expands, Welcoming Industry Giants',
                date: '4th November 2024',
                // readtimeETA: '3 min read',
                image: Images.newstemp3,
              },
            ]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => (
              <>
                {index !== 0 && (
                  <View
                    style={{
                      height: 0.6,
                      marginLeft: 72,
                      backgroundColor: '#E0E0E0',
                      marginTop: 15,
                    }}
                  />
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    width: '80%',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      marginTop: 18,
                      height: 67,
                    }}>
                    <Image
                      source={item.image}
                      style={{
                        justifyContent: 'space-evenly',
                        height: 67,
                        width: 67,
                        borderRadius: 10,
                      }}
                    />
                    <View
                      style={{
                        height: 38,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: fontsFamily.MulishBold,
                          color: '#212121',
                          lineHeight: 19,
                          fontSize: 12,
                          letterSpacing: 0.2,
                        }}>
                        {item.headlines}
                      </Text>
                      <Text
                        style={{
                          fontFamily: fontsFamily.Mulish,
                          fontSize: 10,
                          color: '#7C7C7C',
                          lineHeight: 16,
                          width: 241,
                          height: 16,
                          marginTop: 6,
                        }}>
                        {item.date}
                        {'  '}
                        {item.readtimeETA}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          /> */}
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            alignItems: 'center',
            margin: 10,
            paddingBottom: 40,
          }}>
          <DText
            style={{
              color: '#009D94',
              lineHeight: 22,
              fontSize: 14,
              marginRight: 11,
            }}
            fontStyle="fontBold">
            See more
          </DText>
          <Svg
            width="10"
            height="16"
            viewBox="0 0 10 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <Path
              d="M1.66602 1.33203L8.33268 7.9987L1.66602 14.6654"
              stroke="#009D94"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  hello: {
    fontSize: 18,
    marginRight: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    width: 150,
    marginLeft: 10,
    alignItems: 'center',
  },
  dotContainer: {
    position: 'relative',
    marginRight: 10,
  },
  dot: {
    backgroundColor: '#FF3E49',
    height: 9,
    width: 9,
    borderRadius: 5,
    position: 'absolute',
    top: 0,
    right: 1,
  },
});
