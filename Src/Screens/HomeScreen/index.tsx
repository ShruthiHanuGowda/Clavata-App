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
import {useWalletConnect} from '../../providers';
import {DText} from '../../components/DText';
import {fontsFamily, Images} from '../../Theme';
import {useNft} from '../../providers';

function HomeHeader(props: any) {
  const {userDetails} = useAuth();
  const {activeSessions} = useWalletConnect();
  const hasConnections = activeSessions.length > 0;

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
          <TouchableOpacity
            style={styles.walletConnectButton}
            onPress={() => navigateTo('WalletConnect')}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M4.91 7.52C8.63 3.8 14.7 3.46 18.82 6.5L19.4 5.68C14.84 2.3 8.21 2.68 4.09 6.8C-0.69 11.58 -0.69 19.42 4.09 24.2L4.8 23.49C0.38 19.07 0.38 11.93 4.8 7.52L4.91 7.52Z"
                fill={hasConnections ? '#009D94' : '#999'}
              />
              <Path
                d="M19.09 16.48C15.37 20.2 9.3 20.54 5.18 17.5L4.6 18.32C9.16 21.7 15.79 21.32 19.91 17.2C24.69 12.42 24.69 4.58 19.91 -0.2L19.2 0.51C23.62 4.93 23.62 12.07 19.2 16.48L19.09 16.48Z"
                fill={hasConnections ? '#009D94' : '#999'}
              />
              <Path
                d="M7.52 10.12C9.98 7.66 14.02 7.66 16.48 10.12L17.19 9.41C14.37 6.59 9.63 6.59 6.81 9.41L7.52 10.12Z"
                fill={hasConnections ? '#009D94' : '#999'}
              />
              <Path
                d="M16.48 13.88C14.02 16.34 9.98 16.34 7.52 13.88L6.81 14.59C9.63 17.41 14.37 17.41 17.19 14.59L16.48 13.88Z"
                fill={hasConnections ? '#009D94' : '#999'}
              />
              <Path
                d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                fill={hasConnections ? '#009D94' : '#999'}
              />
            </Svg>
            {hasConnections && <View style={styles.connectionBadge} />}
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  walletConnectButton: {
    position: 'relative',
    marginRight: 16,
    padding: 4,
  },
  connectionBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#009D94',
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
