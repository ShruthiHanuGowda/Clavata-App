import React, {useState, useEffect, useContext} from 'react';
import {
  Text,
  View,
  Image,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Button,
  Pressable,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import style from './style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView} from 'react-native-gesture-handler';
// import {navigateTo} from '../../../../utils/navigationService';
import {SCREEN_CONSTANT} from '../../../../navigation/constant';
import LinearGradient from 'react-native-linear-gradient';
import {BottomSheet} from 'react-native-btr';
// import {AirbnbRating} from 'react-native-ratings';
// import {BottomSheetModal} from '@gorhom/bottom-sheet';
// import useBottomSheet from '../../../../hooks/bottomsheet';
import {color, Header, ScreenWidth} from '@rneui/base';
import {TouchableOpacity} from 'react-native';
// import DKYC from '../../../../component/DKYC';
import {isDev} from '../../../../config/mode';
import {DText} from '../../../Componants/DText';
import MenuList from '../../../Componants/rc_menuList';
import images from '../../../Theme/images';
import {navigateTo} from '../../../utils/navigationService';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {navReset} from '../../../Navigation/NavigationFunctions';
import {UPDATE_KYC_STATUS} from '../../../graphql/queries';
import {useMutation} from '@apollo/client';
import {useAuth} from '../../../../screens/Provider/authProvider';
const STAR_IMG = require('../../../../images/star.png');

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    lineHeight: 23,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
  },
});

export default function Account(props) {
  const {magic} = useMagic();
  const {userDetails} = useAuth();
  function getUsernameFromEmail(email) {
    return email.split('@')[0];
  }
  const username = userDetails?.kycDetails?.firstName
    ? userDetails?.kycDetails?.firstName
    : getUsernameFromEmail(userDetails.walletAddress);

  // const {getProfile, profile, loading} = useContext(AppContext).portfolio;

  // useEffect(() => {
  //   getProfile();
  // }, []);

  const [updateKycStatus, {loading, error, data}] = useMutation(
    UPDATE_KYC_STATUS,
    {
      onCompleted: data => {
        console.log('KYC status updated successfully:');
      },
      onError: error => {
        console.error('Error updating KYC status:', error);
      },
    },
  );

  const [visible, setVisible] = useState(false);
  // const bottomSheetProps = useBottomSheet(visible, [10, 400]);
  const togglebottomView = () => {
    setVisible(!visible);
    setrating(0);
  };
  const [rating, setrating] = useState(0);
  var ratingicon = rating => {
    if (rating == 1) {
      return <Image style={style.rateImgStyle} source={images.poor} />;
    }
    if (rating == 2) {
      return <Image style={style.rateImgStyle} source={Images.dissatify} />;
    }
    if (rating == 3) {
      return <Image style={style.rateImgStyle} source={Images.satified} />;
    }
    if (rating == 4) {
      return <Image style={style.rateImgStyle} source={Images.good} />;
    }
    if (rating == 5) {
      return <Image style={style.rateImgStyle} source={Images.verygood} />;
    }
    if (rating == '') {
      return <Text style={style.rateTextStyle}>How was your experience?</Text>;
    }
  };

  const handleBackPress = () => {
    // setData(initialValue)
    props.navigation.goBack();
  };

  const handleLogout = async () => {
    try {
      // Confirm logout with user
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: async () => {
              try {
                // Logout from Magic
                await magic.user.logout();

                // Clear the auth context
                // Navigate to login screen
                navReset('authScreens');

                console.log('User logged out successfully');
              } catch (error) {
                console.error('Error during logout:', error);
                Alert.alert(
                  'Logout Failed',
                  'There was a problem logging out. Please try again.',
                );
              }
            },
          },
        ],
        {cancelable: true},
      );
    } catch (error) {
      console.error('Error during logout flow:', error);
      setLoading(false);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={{backgroundColor: '#fff', flex: 1}}>
      {/* {isDev ? (
        <Text
          style={[
            style.content,
            {
              fontSize: 10,
              position: 'absolute',
              bottom: 100,
              left: 10,
              color: 'red',
            },
          ]}>
          Development Build 09-08-2023
        </Text>
      ) : ( */}
      {/* <Text
        style={[
          style.content,
          {
            fontSize: 10,
            position: 'absolute',
            bottom: 100,
            left: 10,
            color: 'green',
          },
        ]}>
        Stable Build 20-07-2023
      </Text> */}

      {/* )} */}
      <Header
        centerComponent={
          <View style={styles.nameContainer}>
            <DText style={styles.title} fontStyle="fontBold">
              Account
            </DText>
          </View>
        }
        backgroundColor="#FFF"
        leftComponent={
          <TouchableOpacity onPress={handleBackPress}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
      />
      <ScrollView>
        <LinearGradient
          colors={['#d8fffd', '#dcf2f1', '#FFFFFF']}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          useAngle={true}
          angle={30}
          locations={[0, 0.3, 0.6]}>
          {/* {loading ? (
            <View
              style={{
                height: 150,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator />
            </View>
          ) : ( */}
          <View style={{marginHorizontal: 20, marginBottom: 25, height: 150}}>
            <View
              style={{
                borderBottomColor: 'black',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 54,
              }}>
              <Text style={style.contentText}>{username}</Text>
              <Text style={style.content}>{username}</Text>
              {/* <DKYC loading={loading} {...profile} /> */}
            </View>
          </View>
          {/* )} */}
        </LinearGradient>
        <View style={{height: 15}}></View>
        <MenuList
          onPress={() => navigateTo('ProfileSettings')}
          img={images.user}
          title="My Account"
          index={1}
        />
        <MenuList
          onPress={() => navigateTo('beneficary')}
          img={images.addbenificiaries}
          title="Saved Beneficiaries"
        />
        {/* <MenuList
          onPress={() => navigateTo(SCREEN_CONSTANT.FAQ)}
          img={images.faq}
          title="FAQs"
        /> */}
        {/* <MenuList onPress={() => ''} img={Images.help} title="Contact Us" /> */}
        <MenuList
          onPress={() => navigateTo('contactus')}
          img={images.help}
          title="Contact Us"
        />
        <MenuList
          onPress={() => navigateTo('transactionHistroy')}
          img={images.history}
          title="All Transactions Data"
        />
        <MenuList
          onPress={() => handleLogout()}
          img={images.logout}
          title="Logout"
        />

        {/* <Pressable
          style={{bottom: -10, left: 20}}
          onPress={() => handleLogout()}>
          <Text
            style={[
              style.content,
              {
                fontSize: 10,

                color: 'green',
              },
            ]}>
            Logout
          </Text>
        </Pressable> */}

        {/* <Pressable
          style={{ bottom: -10, left: 20 }}
          onPress={async () => {
            try {
              const userEmail = userDetails?.walletAddress;
              const result = await updateKycStatus({
                variables: {
                  walletAddress: userEmail.toLowerCase(),
                  is_verified: false,
                  applicantId: 'test',
                  accessToken: 'test',
                },
              });

            } catch (error) {
              console.error('Error updating KYC status:', error);
            }
          }}>
          <Text
            style={[
              style.content,
              {
                fontSize: 10,

                color: 'green',
              },
            ]}>
            KYC Status
          </Text>
        </Pressable> */}
        {/* <BottomSheetModal
          {...bottomSheetProps}
          onDismiss={() => {
            if (visible) {
              togglebottomView();
            }
          }}>
          <View style={style.card}>
            <Text style={style.cardTitle}>Enjoying DREXS app?</Text>
            <Text style={style.cardSubText}>
              Open up your thoughts about us. We would love you to rate
              experience
            </Text>
            <View style={style.starContainer}>
              {ratingicon(rating)}
              <View style={{marginBottom: 15}}>
                <AirbnbRating
                  ratingContainerStyle={{fontFamily: fontsFamily.Mulish}}
                  count={5}
                  reviews={[
                    'Poor',
                    'Dissatisfied',
                    'Satisfied',
                    'Good',
                    'Excellent',
                  ]}
                  onFinishRating={value => setrating(value)}
                  reviewColor="#000000"
                  reviewSize={18}
                  starImage={STAR_IMG}
                  defaultRating="0"
                  starContainerStyle={{
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                />
              </View>
              <CustomImageButton
                backgroundImage={Images.buttonBg}
                label="Done"
                labelStyle={style.textStyle}
                onPress={togglebottomView}
                containerWrapper={{
                  height: 51,
                  borderRadius: 12,
                  marginTop: '10%',
                }}
                bgImg={{height: 51, width: '100%'}}
                //disable={checkdisable(wattAmount)}
              />
            </View>
          </View>
        </BottomSheetModal> */}
      </ScrollView>
    </View>
  );
}
