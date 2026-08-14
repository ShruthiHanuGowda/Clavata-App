import React from 'react';

import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useUser } from '../../../context/UserContext';

import secureStorage from '../../../utils/secureStorage';

import { navReset } from '../../../Navigation/NavigationFunctions';

// ============================================================
// COLORS
// ============================================================

import { COLORS } from '../../../constants/constants';


// ============================================================
// MENU ITEMS
// ============================================================

const menuItems = [
  {
    title: 'My Bookings',
    icon: '📅',
    screen: 'ProfileBookings',
  },
  {
    title: 'Favourite Salons',
    icon: '❤️',
    screen: 'FavouriteSalons',
  },
  {
    title: 'Payments',
    icon: '💳',
    screen: 'Payments',
  },
  {
    title: 'Offers & Rewards',
    icon: '🎁',
    screen: 'OffersRewards',
  },
];


// ============================================================
// SETTINGS ITEMS
// ============================================================

const settingsItems = [
  {
    title: 'Settings',
    icon: '⚙️',
    screen: 'Settings',
  },
  {
    title: 'Help & Support',
    icon: '❓',
    screen: 'HelpSupport',
  },
  {
    title: 'Privacy Policy',
    icon: '📄',
    screen: 'PrivacyPolicy',
  },
];


// ============================================================
// PROFILE SCREEN
// ============================================================

export default function ProfileScreen() {

  const navigation =
    useNavigation<any>();


  const {
    currentUser,
    setCurrentUser,
  } = useUser();


  console.log(
    'currentUser?.providerStatus',
    currentUser?.providerStatus,
  );


  // ==========================================================
  // LOGOUT
  // ==========================================================

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

              console.log(
                '========== CUSTOMER LOGOUT ==========',
              );


              // ==================================================
              // REMOVE LOGIN SESSION
              // ==================================================

              await secureStorage.removeItem(
                'isAuthenticated',
              );


              // ==================================================
              // RESET ROOT NAVIGATION
              // ==================================================

              navReset(
                'LoginScreen',
                {
                  mode: 'SIGN_IN',
                  hideBackButton: true,
                },
              );


              // ==================================================
              // CLEAR USER CONTEXT
              // ==================================================

              setCurrentUser(
                null,
              );


              console.log(
                'Customer logout completed',
              );

            } catch (error) {

              console.error(
                'Customer logout error:',
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


  // ==========================================================
  // PROFILE NAVIGATION
  // ==========================================================

  const handleProfileNavigation =
    (item: any) => {

      switch (item.screen) {

        case 'ProfileBookings':

          navigation.navigate(
            'ProfileBookings',
          );

          break;


        case 'FavouriteSalons':

          navigation.navigate(
            'FavouriteSalons',
          );

          break;


        case 'SavedAddresses':

          navigation.navigate(
            'SavedAddresses',
          );

          break;


        case 'Payments':

          navigation.navigate(
            'Payments',
          );

          break;


        case 'OffersRewards':

          navigation.navigate(
            'OffersRewards',
          );

          break;


        case 'Settings':

          navigation.navigate(
            'Settings',
          );

          break;


        case 'Notifications':

          navigation.navigate(
            'Notifications',
          );

          break;


        case 'HelpSupport':

          navigation.navigate(
            'HelpSupport',
          );

          break;


        case 'PrivacyPolicy':

          navigation.navigate(
            'PrivacyPolicy',
          );

          break;


        default:

          break;
      }
    };


  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  const userName =
    currentUser?.fullName ||
    currentUser?.fullName ||
    'User';


  const phoneNumber =
    currentUser?.phoneNumber || '';


  const firstLetter =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() ||
    'U';


  const isSalon =
    currentUser?.activeRole ===
    'SALON';


  const roleText =
    isSalon
      ? 'Salon'
      : 'Customer';


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >


        {/* ================================================== */}
        {/* PROFILE HEADER */}
        {/* ================================================== */}

        <View
          style={
            styles.header
          }
        >

          {/* AVATAR */}

          <View
            style={
              styles.avatar
            }
          >

            <Text
              style={
                styles.avatarText
              }
            >
              {firstLetter}
            </Text>

          </View>


          {/* NAME */}

          <Text
            style={
              styles.name
            }
          >
            {userName}
          </Text>


          {/* PHONE */}

          {phoneNumber ? (

            <Text
              style={
                styles.phone
              }
            >
              {phoneNumber}
            </Text>

          ) : null}


          {/* ROLE */}

          <View
            style={
              styles.roleBadge
            }
          >

            <Text
              style={
                styles.roleText
              }
            >
              {roleText}
            </Text>

          </View>


          {/* EDIT PROFILE */}

          <TouchableOpacity
            style={
              styles.editButton
            }

            activeOpacity={
              0.8
            }

            onPress={() =>
              navigation.navigate(
                'EditProfile',
              )
            }
          >

            <Text
              style={
                styles.editButtonText
              }
            >
              Edit Profile
            </Text>

          </TouchableOpacity>

        </View>


        {/* ================================================== */}
        {/* MAIN MENU */}
        {/* ================================================== */}

        <View
          style={
            styles.section
          }
        >

          {menuItems.map(
            item => (

              <TouchableOpacity
                key={
                  item.title
                }

                style={
                  styles.row
                }

                activeOpacity={
                  0.7
                }

                onPress={() =>
                  handleProfileNavigation(
                    item,
                  )
                }
              >

                <Text
                  style={
                    styles.leftIcon
                  }
                >
                  {item.icon}
                </Text>


                <Text
                  style={
                    styles.rowTitle
                  }
                >
                  {item.title}
                </Text>


                <Text
                  style={
                    styles.arrow
                  }
                >
                  ›
                </Text>

              </TouchableOpacity>

            ),
          )}

        </View>


        {/* ================================================== */}
        {/* SETTINGS */}
        {/* ================================================== */}

        <View
          style={
            styles.section
          }
        >

          {settingsItems.map(
            item => (

              <TouchableOpacity
                key={
                  item.title
                }

                style={
                  styles.row
                }

                activeOpacity={
                  0.7
                }

                onPress={() =>
                  handleProfileNavigation(
                    item,
                  )
                }
              >

                <Text
                  style={
                    styles.leftIcon
                  }
                >
                  {item.icon}
                </Text>


                <Text
                  style={
                    styles.rowTitle
                  }
                >
                  {item.title}
                </Text>


                <Text
                  style={
                    styles.arrow
                  }
                >
                  ›
                </Text>

              </TouchableOpacity>

            ),
          )}

        </View>


        {/* ================================================== */}
        {/* LOGOUT */}
        {/* ================================================== */}

        <TouchableOpacity
          style={
            styles.logoutButton
          }

          activeOpacity={
            0.7
          }

          onPress={
            onLogout
          }
        >

          <Text
            style={
              styles.logoutText
            }
          >
            Logout
          </Text>

        </TouchableOpacity>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    // ========================================================
    // CONTAINER
    // ========================================================

    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      backgroundColor:
        COLORS.surface,

      alignItems:
        'center',

      paddingVertical:
        32,

      marginBottom:
        14,
    },


    // ========================================================
    // AVATAR
    // ========================================================

    avatar: {
      width: 90,

      height: 90,

      borderRadius: 45,

      backgroundColor:
        COLORS.primary,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    avatarText: {
      color:
        COLORS.white,

      fontSize: 36,

      fontWeight: '700',
    },


    // ========================================================
    // NAME
    // ========================================================

    name: {
      marginTop: 16,

      fontSize: 24,

      fontWeight: '700',

      color:
        COLORS.text,
    },


    // ========================================================
    // PHONE
    // ========================================================

    phone: {
      marginTop: 6,

      color:
        COLORS.textSecondary,

      fontSize: 15,
    },


    // ========================================================
    // ROLE BADGE
    // ========================================================

    roleBadge: {
      marginTop: 12,

      backgroundColor:
        COLORS.badgeColor,

      paddingHorizontal: 14,

      paddingVertical: 6,

      borderRadius: 20,
    },


    roleText: {
      color:
        COLORS.primary,

      fontWeight: '600',
    },


    // ========================================================
    // EDIT BUTTON
    // ========================================================

    editButton: {
      marginTop: 20,

      borderWidth: 1,

      borderColor:
        COLORS.borderStrong,

      borderRadius: 10,

      paddingHorizontal: 28,

      paddingVertical: 10,

      backgroundColor:
        COLORS.surface,
    },


    editButtonText: {
      color:
        COLORS.primary,

      fontWeight: '600',
    },


    // ========================================================
    // SECTION
    // ========================================================

    section: {
      backgroundColor:
        COLORS.surface,

      marginBottom: 14,
    },


    // ========================================================
    // ROW
    // ========================================================

    row: {
      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        20,

      height: 58,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },


    // ========================================================
    // ICON
    // ========================================================

    leftIcon: {
      fontSize: 20,

      width: 34,
    },


    // ========================================================
    // TITLE
    // ========================================================

    rowTitle: {
      flex: 1,

      fontSize: 16,

      color:
        COLORS.text,
    },


    // ========================================================
    // ARROW
    // ========================================================

    arrow: {
      fontSize: 22,

      color:
        COLORS.textMuted,
    },


    // ========================================================
    // LOGOUT
    // ========================================================

    logoutButton: {
      backgroundColor:
        COLORS.surface,

      height: 58,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    logoutText: {
      color:
        '#DC2626',

      fontWeight:
        '700',

      fontSize:
        16,
    },


    // ========================================================
    // BOTTOM SPACE
    // ========================================================

    bottomSpace: {
      height: 30,
    },

  });