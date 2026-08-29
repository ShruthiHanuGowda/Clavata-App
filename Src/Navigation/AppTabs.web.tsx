import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import HomeStackWeb from './HomeStack.web';


// ============================================================
// STACK
// ============================================================

const Stack = createNativeStackNavigator();


// ============================================================
// SIMPLE WEB PLACEHOLDER SCREENS
// ============================================================

function ClavataScreen() {

  return (
    <View style={styles.placeholderScreen}>

      <Text style={styles.placeholderTitle}>
        Clavata
      </Text>

      <Text style={styles.placeholderSubtitle}>
        Let Clavata find the perfect match for you.
      </Text>

    </View>
  );
}


function BookingsScreen() {

  return (
    <View style={styles.placeholderScreen}>

      <Text style={styles.placeholderTitle}>
        Bookings
      </Text>

      <Text style={styles.placeholderSubtitle}>
        Your bookings will appear here.
      </Text>

    </View>
  );
}


function OffersScreen() {

  return (
    <View style={styles.placeholderScreen}>

      <Text style={styles.placeholderTitle}>
        Offers
      </Text>

      <Text style={styles.placeholderSubtitle}>
        Discover exclusive salon offers.
      </Text>

    </View>
  );
}


function ProfileScreen() {

  return (
    <View style={styles.placeholderScreen}>

      <Text style={styles.placeholderTitle}>
        Profile
      </Text>

      <Text style={styles.placeholderSubtitle}>
        Manage your account and preferences.
      </Text>

    </View>
  );
}


// ============================================================
// SIDEBAR ITEM
// ============================================================

interface SidebarItemProps {
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onPress: () => void;
}


function SidebarItem({
  icon,
  label,
  active,
  collapsed,
  onPress,
}: SidebarItemProps) {

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ hovered }: any) => [
        styles.sidebarItem,

        collapsed &&
        styles.sidebarItemCollapsed,

        active &&
        styles.sidebarItemActive,

        hovered &&
        !active &&
        styles.sidebarItemHover,
      ]}
    >

      <View
        style={[
          styles.sidebarIcon,
          active &&
          styles.sidebarIconActive,
        ]}
      >

        <Text
          style={[
            styles.sidebarIconText,
            active &&
            styles.sidebarIconTextActive,
          ]}
        >
          {icon}
        </Text>

      </View>


      {!collapsed && (

        <Text
          style={[
            styles.sidebarLabel,
            active &&
            styles.sidebarLabelActive,
          ]}
        >
          {label}
        </Text>

      )}

    </Pressable>
  );
}


// ============================================================
// SIDEBAR
// ============================================================

interface WebSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}


function WebSidebar({
  collapsed,
  onToggle,
}: WebSidebarProps) {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();


  const currentRoute =
    route.name;


  const navigateTo = (
    screen: string,
  ) => {

    navigation.navigate(
      screen,
    );
  };


  return (

    <View
      style={[
        styles.sidebar,

        collapsed &&
        styles.sidebarCollapsed,
      ]}
    >

      {/* ==================================================
                BRAND HEADER
            ================================================== */}

      <View
        style={[
          styles.brandHeader,

          collapsed &&
          styles.brandHeaderCollapsed,
        ]}
      >

        <View
          style={[
            styles.brandContainer,

            collapsed &&
            styles.brandContainerCollapsed,
          ]}
        >

          <View style={styles.logoMark}>

            <Text style={styles.logoMarkText}>
              C
            </Text>

          </View>


          {!collapsed && (

            <View
              style={
                styles.brandTextContainer
              }
            >

              <Text
                style={styles.brandName}
              >
                Clavata
              </Text>

              <Text
                style={styles.brandTagline}
              >
                Beauty, simplified.
              </Text>

            </View>

          )}

        </View>


        {/* TOGGLE */}

        <Pressable
          onPress={onToggle}
          accessibilityLabel={
            collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
          style={({ hovered }: any) => [
            styles.toggleButton,

            hovered &&
            styles.toggleButtonHover,

            collapsed &&
            styles.toggleButtonCollapsed,
          ]}
        >

          <Text
            style={
              styles.toggleIcon
            }
          >
            {collapsed
              ? '›'
              : '‹'}
          </Text>

        </Pressable>

      </View>


      {/* ==================================================
                DIVIDER
            ================================================== */}

      <View
        style={styles.sidebarDivider}
      />


      {/* ==================================================
                MAIN NAVIGATION
            ================================================== */}

      <View
        style={[
          styles.navigationSection,

          collapsed &&
          styles.navigationSectionCollapsed,
        ]}
      >

        {!collapsed && (

          <Text
            style={
              styles.navigationLabel
            }
          >
            DISCOVER
          </Text>

        )}


        <SidebarItem
          icon="⌂"
          label="Home"
          active={
            currentRoute === 'Home'
          }
          collapsed={collapsed}
          onPress={() =>
            navigateTo('Home')
          }
        />


        {/* <SidebarItem
          icon="✦"
          label="Clavata"
          active={
            currentRoute === 'Clavata'
          }
          collapsed={collapsed}
          onPress={() =>
            navigateTo('Clavata')
          }
        /> */}


        <SidebarItem
          icon="□"
          label="Bookings"
          active={
            currentRoute === 'Bookings'
          }
          collapsed={collapsed}
          onPress={() =>
            navigateTo('Bookings')
          }
        />


        <SidebarItem
          icon="◇"
          label="Offers"
          active={
            currentRoute === 'Offers'
          }
          collapsed={collapsed}
          onPress={() =>
            navigateTo('Offers')
          }
        />


        <SidebarItem
          icon="○"
          label="Profile"
          active={
            currentRoute === 'Profile'
          }
          collapsed={collapsed}
          onPress={() =>
            navigateTo('Profile')
          }
        />

      </View>


      {/* ==================================================
                SPACER
            ================================================== */}

      <View
        style={styles.sidebarSpacer}
      />


      {/* ==================================================
                BECOME PARTNER
            ================================================== */}

      <Pressable
        onPress={() =>
          navigateTo(
            'BecomePartner',
          )
        }
        accessibilityLabel="Become a partner"
        style={({ hovered }: any) => [
          styles.partnerCard,

          collapsed &&
          styles.partnerCardCollapsed,

          hovered &&
          styles.partnerCardHover,
        ]}
      >

        <View style={styles.partnerIcon}>

          <Text
            style={
              styles.partnerIconText
            }
          >
            +
          </Text>

        </View>


        {!collapsed && (

          <View
            style={
              styles.partnerTextContainer
            }
          >

            <Text
              style={styles.partnerTitle}
            >
              Become a partner
            </Text>

            <Text
              style={styles.partnerSubtitle}
            >
              Grow your beauty business
            </Text>

          </View>

        )}

      </Pressable>


      {/* ==================================================
                DIVIDER
            ================================================== */}

      <View
        style={styles.divider}
      />


      {/* ==================================================
                FOOTER
            ================================================== */}

      <View
        style={[
          styles.sidebarFooter,

          collapsed &&
          styles.sidebarFooterCollapsed,
        ]}
      >

        {!collapsed && (

          <Text
            style={styles.footerText}
          >
            Clavata
          </Text>

        )}

        <Text
          style={styles.footerVersion}
        >
          © 2026
        </Text>

      </View>

    </View>
  );
}


// ============================================================
// APP SHELL
// ============================================================

function WebAppShell() {

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);


  const toggleSidebar = () => {

    setSidebarCollapsed(
      previous =>
        !previous,
    );
  };


  return (

    <View style={styles.appContainer}>

      {/* ==================================================
                SIDEBAR
            ================================================== */}

      <WebSidebar
        collapsed={
          sidebarCollapsed
        }
        onToggle={
          toggleSidebar
        }
      />


      {/* ==================================================
                CONTENT
            ================================================== */}

      <View
        style={styles.contentContainer}
      >

        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor:
                '#F7F7F5',
            },
          }}
        >

          {/* ==================================================
                        HOME
                    ================================================== */}

          <Stack.Screen
            name="Home"
            component={HomeStackWeb}
          />


          {/* ==================================================
                        CLAVATA
                    ================================================== */}

          <Stack.Screen
            name="Clavata"
            component={ClavataScreen}
          />


          {/* ==================================================
                        BOOKINGS
                    ================================================== */}

          <Stack.Screen
            name="Bookings"
            component={BookingsScreen}
          />


          {/* ==================================================
                        OFFERS
                    ================================================== */}

          <Stack.Screen
            name="Offers"
            component={OffersScreen}
          />


          {/* ==================================================
                        PROFILE
                    ================================================== */}

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
          />

        </Stack.Navigator>

      </View>

    </View>
  );
}


// ============================================================
// EXPORT
// ============================================================

export default function AppTabs() {

  console.log(
    '🔥🔥🔥 WEB APP TABS RENDERED',
  );

  return (
    <WebAppShell />
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    // ========================================================
    // APP
    // ========================================================

    appContainer: {
      flex: 1,

      flexDirection: 'row',

      width: '100%',
      height: '100%',

      minHeight: 700,

      backgroundColor: '#F7F7F5',
    },


    // ========================================================
    // SIDEBAR
    // ========================================================

    sidebar: {
      width: 250,

      flexShrink: 0,

      height: '100%',

      backgroundColor: '#FFFFFF',

      borderRightWidth: 1,
      borderRightColor: '#E7E7E4',

      paddingTop: 20,
      paddingHorizontal: 16,
      paddingBottom: 20,

      display: 'flex',

      transitionProperty: 'width',
      transitionDuration: '220ms',
      transitionTimingFunction: 'ease',
    } as any,


    sidebarCollapsed: {
      width: 76,

      paddingHorizontal: 10,
    } as any,


    // ========================================================
    // BRAND HEADER
    // ========================================================

    brandHeader: {
      width: '100%',

      minHeight: 54,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'space-between',
    },


    brandHeaderCollapsed: {
      flexDirection: 'column',

      justifyContent: 'center',

      gap: 10,
    },


    // ========================================================
    // BRAND
    // ========================================================

    brandContainer: {
      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 4,

      flex: 1,

      minWidth: 0,
    },


    brandContainerCollapsed: {
      flex: 0,

      paddingHorizontal: 0,

      justifyContent: 'center',
    },


    logoMark: {
      width: 42,
      height: 42,

      borderRadius: 13,

      backgroundColor: '#111111',

      alignItems: 'center',
      justifyContent: 'center',

      marginRight: 11,

      flexShrink: 0,
    },


    logoMarkText: {
      color: '#FFFFFF',

      fontSize: 21,

      fontWeight: '800',
    },


    brandTextContainer: {
      flex: 1,

      minWidth: 0,
    },


    brandName: {
      fontSize: 21,

      fontWeight: '800',

      color: '#111111',

      letterSpacing: -0.7,
    },


    brandTagline: {
      marginTop: 2,

      fontSize: 10,

      color: '#999999',
    },


    // ========================================================
    // TOGGLE
    // ========================================================

    toggleButton: {
      width: 30,
      height: 30,

      borderRadius: 9,

      backgroundColor: '#F4F4F2',

      alignItems: 'center',
      justifyContent: 'center',

      flexShrink: 0,

      cursor: 'pointer',

      borderWidth: 1,
      borderColor: '#E7E7E4',
    },


    toggleButtonCollapsed: {
      width: 30,
      height: 30,
    },


    toggleButtonHover: {
      backgroundColor: '#EAEAE7',

      borderColor: '#DCDCD9',
    },


    toggleIcon: {
      fontSize: 22,

      lineHeight: 24,

      color: '#333333',

      fontWeight: '300',

      marginTop: -2,
    },


    // ========================================================
    // DIVIDER
    // ========================================================

    sidebarDivider: {
      height: 1,

      width: '100%',

      backgroundColor: '#EEEEEC',

      marginTop: 18,

      marginBottom: 20,
    },


    // ========================================================
    // NAVIGATION
    // ========================================================

    navigationSection: {
      width: '100%',
    },


    navigationSectionCollapsed: {
      alignItems: 'center',
    },


    navigationLabel: {
      marginLeft: 12,

      marginBottom: 10,

      fontSize: 9,

      fontWeight: '800',

      letterSpacing: 1.2,

      color: '#AAAAAA',
    },


    // ========================================================
    // SIDEBAR ITEM
    // ========================================================

    sidebarItem: {
      width: '100%',

      height: 50,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 10,

      borderRadius: 12,

      marginBottom: 5,

      cursor: 'pointer',
    },


    sidebarItemCollapsed: {
      width: 52,

      paddingHorizontal: 0,

      justifyContent: 'center',
    },


    sidebarItemActive: {
      backgroundColor: '#111111',
    },


    sidebarItemHover: {
      backgroundColor: '#F4F4F2',
    },


    // ========================================================
    // ICON
    // ========================================================

    sidebarIcon: {
      width: 34,
      height: 34,

      borderRadius: 10,

      alignItems: 'center',
      justifyContent: 'center',

      marginRight: 11,
    },


    sidebarIconActive: {
      backgroundColor: '#FFFFFF',
    },


    sidebarIconText: {
      fontSize: 20,

      color: '#777777',
    },


    sidebarIconTextActive: {
      color: '#111111',
    },


    // ========================================================
    // LABEL
    // ========================================================

    sidebarLabel: {
      fontSize: 13,

      fontWeight: '600',

      color: '#555555',
    },


    sidebarLabelActive: {
      color: '#FFFFFF',

      fontWeight: '700',
    },


    // ========================================================
    // SPACER
    // ========================================================

    sidebarSpacer: {
      flex: 1,
    },


    // ========================================================
    // PARTNER CARD
    // ========================================================

    partnerCard: {
      width: '100%',

      minHeight: 70,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 11,

      paddingVertical: 10,

      borderRadius: 14,

      backgroundColor: '#F6F6F4',

      cursor: 'pointer',
    },


    partnerCardCollapsed: {
      width: 52,

      minHeight: 52,

      paddingHorizontal: 0,

      paddingVertical: 0,

      justifyContent: 'center',

      alignSelf: 'center',
    },


    partnerCardHover: {
      backgroundColor: '#EEEEEB',
    },


    partnerIcon: {
      width: 34,
      height: 34,

      borderRadius: 10,

      backgroundColor: '#111111',

      alignItems: 'center',
      justifyContent: 'center',

      marginRight: 10,
    },


    partnerIconText: {
      color: '#FFFFFF',

      fontSize: 20,

      fontWeight: '400',
    },


    partnerTextContainer: {
      flex: 1,
    },


    partnerTitle: {
      fontSize: 11,

      fontWeight: '700',

      color: '#111111',
    },


    partnerSubtitle: {
      marginTop: 3,

      fontSize: 9,

      color: '#999999',

      lineHeight: 13,
    },


    // ========================================================
    // DIVIDER
    // ========================================================

    divider: {
      height: 1,

      width: '100%',

      backgroundColor: '#EEEEEC',

      marginTop: 18,

      marginBottom: 15,
    },


    // ========================================================
    // FOOTER
    // ========================================================

    sidebarFooter: {
      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'center',

      paddingHorizontal: 10,
    },


    sidebarFooterCollapsed: {
      justifyContent: 'center',

      paddingHorizontal: 0,
    },


    footerText: {
      fontSize: 10,

      fontWeight: '700',

      color: '#999999',
    },


    footerVersion: {
      fontSize: 9,

      color: '#BBBBBB',
    },


    // ========================================================
    // CONTENT
    // ========================================================

    contentContainer: {
      flex: 1,

      minWidth: 0,

      minHeight: 0,

      backgroundColor: '#F7F7F5',

      overflow: 'hidden',
    },


    // ========================================================
    // PLACEHOLDER
    // ========================================================

    placeholderScreen: {
      flex: 1,

      minHeight: 700,

      padding: 50,

      backgroundColor: '#F7F7F5',
    },


    placeholderTitle: {
      fontSize: 34,

      fontWeight: '800',

      color: '#111111',
    },


    placeholderSubtitle: {
      marginTop: 10,

      fontSize: 14,

      color: '#777777',
    },

  });