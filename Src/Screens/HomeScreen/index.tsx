import React, {useCallback, useRef} from 'react';
import {Header} from '@rneui/base';
import {
  Button,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {View} from 'react-native';

import StakingActivities from './StakingActivities';
import CryptoMarketPlace from './CryptoMarketPlace';
import BalanceCarousal from './BalanceCarousal';
import {Path, Svg} from 'react-native-svg';
import {useFocusEffect, useScrollToTop} from '@react-navigation/native';
import {navigateTo} from '../../utils/navigationService';
import {useWallet} from '../../../screens/Provider/WalletProvider';
import {useAuth} from '../../../screens/Provider/authProvider';
import {useNftsForAddress} from '../../hooks/useNftsForAddress';
import {useMutation} from '@apollo/client';
import {UPDATE_KYC_STATUS} from '../../graphql/queries';
import {DText} from '../../Componants/DText';
import {fontsFamily, Images} from '../../Theme';
import {useSuccessSound} from '../../hooks/useSuccessSound';
import { useNft } from '../../../screens/Provider/NftProvider';

function HomeHeader(props: any) {
  const {userDetails} = useAuth();
  function getUsernameFromEmail(email: string) {
    if (!email) {return '';}
    return email.split('@')[0];
  }

  const username: any =
    userDetails && userDetails?.kycDetails?.firstName
      ? userDetails?.kycDetails?.firstName
      : getUsernameFromEmail(userDetails?.emailAddress);
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

export default function HomeScreen({navigation}: any) {
  const {refreshAllBalances} = useWallet();
  const {playSuccessSound} = useSuccessSound();
  const {userDetails} = useAuth();
  const account = userDetails?.userWallet;
  const {
    nfts,
    isLoading,
    totalQuantity,
    refresh: refreshNfts,
  } = useNft();

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

  // const { get, getDrecs, data, drecsData, balanceData, loading, getBalance, getProfile, profile } =
  //   useContext(AppContext).portfolio;
  // const { newCount, getNewCount } = useNotification();
  const scrollViewRef = useRef(null);
  // const init = () => {
  //   get();
  //   getDrecs();
  //   getBalance();
  //   getProfile();
  //   getNewCount();
  //   scrollToTop();
  // };
  //   const scrollToTop = () => {
  //     scrollViewRef.current?.scrollTo({
  //       y: 0,
  //       animated: false,
  //     });
  //   };
  //   const ref = React.useRef(null);

  const onRefresh = () => {
    refreshAllBalances();
    refreshNfts();
  };

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
    <View style={styles.container}>
      <HomeHeader
      //  loading={loading} {...profile} newCount={newCount}
      />
      {/* <DKYC loading={loading} {...profile} /> */}
      <ScrollView
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => onRefresh()} />
        }>
        <BalanceCarousal
          loading={isLoading}
          // drecsData={drecsData}
          drecsOwned={totalQuantity}
          // {...balanceData}
        />
        <StakingActivities
          drecsStaked={0}
          drecsOwned={totalQuantity}
          loading={isLoading}
          // {...drecsData}
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
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            alignItems: 'center',
            margin: 10,
            paddingBottom: 40,
          }}
          onPress={() => navigateTo('News')}>
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
    </View>
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
