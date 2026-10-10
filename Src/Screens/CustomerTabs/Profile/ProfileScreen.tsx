
import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useApolloClient, gql } from '@apollo/client';
import { useUser } from '../../../context/UserContext';
import secureStorage from '../../../utils/secureStorage';
import { navReset } from '../../../Navigation/NavigationFunctions';
import { COLORS, GRADIENTS } from '../../../constants/constants';
import AppGradient from '../../../common/AppGradient';

const GET_CUSTOMER_PROFILE_PHOTO = gql`
  query GetCustomerProfilePhoto(
    $userId: ID!
    $phoneNumber: String!
  ) {
    getCustomerProfilePhoto(
      userId: $userId
      phoneNumber: $phoneNumber
    ) {
      success
      message
      viewUrl
      expiresIn
    }
  }
`;

const menuItems = [
  { title: 'My Bookings', icon: '📅', screen: 'ProfileBookings' },
  { title: 'Favourite Salons', icon: '❤️', screen: 'FavouriteSalons' },
  { title: 'Payment History', icon: '🏦', screen: 'Payments' },
  { title: 'Payment Method', icon: '💳', screen: 'PaymentMethod' },
  { title: 'Offers & Rewards', icon: '🎁', screen: 'OffersRewards' },
];

const settingsItems = [
  { title: 'Settings', icon: '⚙️', screen: 'Settings' },
  { title: 'Help & Support', icon: '❓', screen: 'HelpSupport' },
  { title: 'Privacy Policy', icon: '📄', screen: 'PrivacyPolicy' },
];

type ProfileMenuItem = {
  title: string;
  icon: string;
  screen: string;
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const client = useApolloClient();
  const { currentUser, setCurrentUser } = useUser();

  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  // =========================================================
  // LOAD / REFRESH PROFILE PHOTO WHEN SCREEN GETS FOCUS
  // =========================================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadProfilePhoto = async () => {
        const userId = currentUser?.userId;
        const phoneNumber = currentUser?.phoneNumber;

        if (
          !userId ||
          !phoneNumber ||
          currentUser?.role === 'PROVIDER'
        ) {
          return;
        }

        setPhotoLoading(true);
        setPhotoFailed(false);

        try {
          const response = await client.query({
            query: GET_CUSTOMER_PROFILE_PHOTO,
            variables: {
              userId,
              phoneNumber,
            },
            fetchPolicy: 'network-only',
          });

          if (!active) {
            return;
          }

          const photoData =
            response.data?.getCustomerProfilePhoto;

          if (!photoData?.success) {
            console.warn(
              '[ProfileScreen] Profile photo unavailable:',
              photoData?.message,
            );
            setPhotoFailed(true);
            return;
          }

          const viewUrl = photoData.viewUrl || null;

          setCurrentUser({
            ...currentUser!,
            profileImageUrl: viewUrl,
          });

          console.log(
            '[ProfileScreen] Profile photo URL retrieved:',
            Boolean(viewUrl),
          );
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            '[ProfileScreen] Load profile photo error:',
            error,
          );

          setPhotoFailed(true);
        } finally {
          if (active) {
            setPhotoLoading(false);
          }
        }
      };

      loadProfilePhoto();

      return () => {
        active = false;
      };
    }, [
      client,
      currentUser?.userId,
      currentUser?.phoneNumber,
      currentUser?.role,
      setCurrentUser,
    ]),
  );

  // =========================================================
  // LOGOUT
  // =========================================================

  const onLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await secureStorage.removeItem('isAuthenticated');

              setCurrentUser(null);

              navReset('LoginScreen', {
                mode: 'SIGN_IN',
                hideBackButton: true,
              });
            } catch (error) {
              console.error(
                '[ProfileScreen] Logout error:',
                error,
              );

              Alert.alert(
                'Logout failed',
                'Unable to logout. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  // =========================================================
  // MENU NAVIGATION
  // =========================================================

  const handleProfileNavigation = (
    item: ProfileMenuItem,
  ) => {
    switch (item.screen) {
      case 'ProfileBookings':
        navigation.navigate('ProfileBookings');
        break;

      case 'FavouriteSalons':
        navigation.navigate('FavouriteSalons');
        break;

      case 'SavedAddresses':
        navigation.navigate('SavedAddresses');
        break;

      case 'Payments':
        navigation.navigate('Payments');
        break;

      case 'PaymentMethod':
        navigation.navigate('PaymentMethod', {
          userId: currentUser?.userId,
        });
        break;

      case 'OffersRewards':
        navigation.navigate('OffersRewards');
        break;

      case 'Settings':
        navigation.navigate('Settings');
        break;

      case 'Notifications':
        navigation.navigate('Notifications');
        break;

      case 'HelpSupport':
        navigation.navigate('HelpSupport');
        break;

      case 'PrivacyPolicy':
        navigation.navigate('PrivacyPolicy');
        break;

      default:
        break;
    }
  };

  // =========================================================
  // PROFILE DATA
  // =========================================================

  const userName = currentUser?.fullName || 'User';
  const phoneNumber = currentUser?.phoneNumber || '';

  const firstLetter =
    userName.trim().charAt(0).toUpperCase() || 'U';

  const isSalon = currentUser?.role === 'PROVIDER';
  const roleText = isSalon ? 'Salon' : 'Customer';

  const profileImageUrl = currentUser?.profileImageUrl;

  // =========================================================
  // MENU ITEM
  // =========================================================

  const renderMenuItem = (item: ProfileMenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.row}
      activeOpacity={0.72}
      onPress={() => handleProfileNavigation(item)}
    >
      <View style={styles.menuIconContainer}>
        <Text style={styles.leftIcon}>{item.icon}</Text>
      </View>

      <Text style={styles.rowTitle}>{item.title}</Text>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppGradient
          colors={[...GRADIENTS.SOFT_PURPLE]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.avatarOuter}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
          >
            <View style={styles.avatar}>
              {profileImageUrl && !photoFailed ? (
                <Image
                  key={profileImageUrl}
                  source={{ uri: profileImageUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onLoad={() => {
                    console.log(
                      '[ProfileScreen] Profile image displayed.',
                    );
                  }}
                  onError={(event) => {
                    console.warn(
                      '[ProfileScreen] Image failed:',
                      event.nativeEvent.error,
                    );
                    setPhotoFailed(true);
                  }}
                />
              ) : photoLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#8B5CF6"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {firstLetter}
                </Text>
              )}
            </View>

            <View style={styles.photoEditBadge}>
              <Text style={styles.photoEditIcon}>✎</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{userName}</Text>

          {phoneNumber ? (
            <Text style={styles.phone}>{phoneNumber}</Text>
          ) : null}

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleText}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButtonWrapper}
            activeOpacity={0.82}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.editButton}>
              <Text style={styles.editButtonText}>
                Edit Profile
              </Text>
            </View>
          </TouchableOpacity>
        </AppGradient>

        <View style={styles.section}>
          {menuItems.map(renderMenuItem)}
        </View>

        <View style={styles.section}>
          {settingsItems.map(renderMenuItem)}
        </View>

        <TouchableOpacity
          style={styles.logoutButtonWrapper}
          activeOpacity={0.8}
          onPress={onLogout}
        >
          <AppGradient
            colors={[...GRADIENTS.SOFT_PURPLE]}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </AppGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
  },
  avatarOuter: {
    width: 98,
    height: 98,
    borderRadius: 49,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#8B5CF6',
    fontSize: 36,
    fontWeight: '800',
  },
  photoEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDF8',
  },
  photoEditIcon: {
    color: '#7650C8',
    fontSize: 19,
    fontWeight: '700',
    marginTop: -2,
  },
  name: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  phone: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  roleText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 13,
  },
  editButtonWrapper: {
    marginTop: 18,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButton: {
    minWidth: 150,
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginBottom: 14,
    marginHorizontal: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(167,139,250,0.13)',
  },
  leftIcon: {
    fontSize: 19,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  arrow: {
    fontSize: 25,
    color: COLORS.textMuted,
    marginLeft: 10,
  },
  logoutButtonWrapper: {
    marginHorizontal: 14,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
  },
  logoutGradient: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  bottomSpace: {
    height: 30,
  },
});