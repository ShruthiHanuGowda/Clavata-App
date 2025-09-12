import React, {useCallback, useRef} from 'react';
import {Header} from '@rneui/base';
import {
  Image,
  RefreshControl,
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
import {useWallet} from '../../providers';
import {useAuth} from '../../providers';
import {DText} from '../../components/DText';
import {fontsFamily, Images} from '../../Theme';
import {useNft} from '../../providers';

function HomeHeader(props: any) {
  const {userDetails} = useAuth();
  function getUsernameFromEmail(email: string) {
    if (!email) {
      return '';
    }
    return email.split('@')[0];
  }

  const username: string =
    userDetails &&
    typeof userDetails?.kycDetails === 'object' &&
    userDetails?.kycDetails?.firstName
      ? userDetails?.kycDetails?.firstName
      : getUsernameFromEmail(userDetails?.emailAddress || '');
  return (
    <Header
      containerStyle={styles.headerContainer}
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
            <Image source={Images.verified} style={styles.verifiedIcon} />
          )}
        </View>
      }
      rightComponent={
        <View style={styles.rightComponentContainer}>
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

export default function HomeScreen() {
  const {refreshAllBalances} = useWallet();
  const {isLoading, totalQuantity, refresh: refreshNfts} = useNft();

  // const [updateKycStatus, {loading, error, data}] = useMutation(
  //   UPDATE_KYC_STATUS,
  //   {
  //     onCompleted: data => {
  //
  //     },
  //     onError: error => {
  //       console.error('Error updating KYC status:', error);
  //     },
  //   },
  // );

  // const { get, getDrecs, data, drecsData, balanceData, loading, getBalance, getProfile, profile } =
  //   useContext(AppContext).portfolio;
  // const { newCount, getNewCount } = useNotification();
  const scrollViewRef = useRef<ScrollView>(null);
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

  useScrollToTop(scrollViewRef as any);

  useFocusEffect(
    useCallback(() => {
      refreshAllBalances();

      return () => {
        console.info('Screen is unfocused!');
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
          drecsAvailable={totalQuantity}
          loading={isLoading}
          // {...drecsData}
        />
        <CryptoMarketPlace
        // loading={loading} {...balanceData}
        />
        <View style={styles.newsContainer}>
          <Text style={styles.newsTitle}>NEWS & ANNOUNCEMENTS</Text>
        </View>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => navigateTo('News')}>
          <DText style={styles.seeMoreText} fontStyle="fontBold">
            See more
          </DText>
          <Svg width="10" height="16" viewBox="0 0 10 16" fill="none">
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
  headerContainer: {
    borderBottomWidth: 0,
  },
  verifiedIcon: {
    height: 20,
    width: 20,
  },
  rightComponentContainer: {
    flexDirection: 'row',
  },
  newsContainer: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  newsTitle: {
    fontFamily: fontsFamily.MulishBold,
    color: '#000000',
    fontSize: 12,
    lineHeight: 22,
    letterSpacing: 2,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    margin: 10,
    paddingBottom: 40,
  },
  seeMoreText: {
    color: '#009D94',
    lineHeight: 22,
    fontSize: 14,
    marginRight: 11,
  },
});
