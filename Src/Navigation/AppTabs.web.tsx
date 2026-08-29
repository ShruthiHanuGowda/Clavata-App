// import React from 'react';

// import { useUser } from '../context/UserContext';

// import CustomerTabs from './CustomerTabs.web';
// import SalonTabs from './SalonTabs.web';

// export default function AppTabs() {
//   const { currentUser } = useUser();

//   console.log(
//     'WEB APP TABS CURRENT USER:',
//     JSON.stringify(currentUser, null, 2),
//   );

//   console.log(
//     'WEB ACTIVE ROLE:',
//     currentUser?.activeRole,
//   );

//   if (currentUser?.activeRole === 'PROVIDER') {
//     return <SalonTabs />;
//   }

//   return <CustomerTabs />;
// }

import React from 'react';

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
    onPress: () => void;
}


function SidebarItem({
    icon,
    label,
    active,
    onPress,
}: SidebarItemProps) {

    return (
        <Pressable
            onPress={onPress}
            style={({ hovered }: any) => [
                styles.sidebarItem,

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


            <Text
                style={[
                    styles.sidebarLabel,
                    active &&
                    styles.sidebarLabelActive,
                ]}
            >
                {label}
            </Text>

        </Pressable>
    );
}


// ============================================================
// SIDEBAR
// ============================================================

function WebSidebar() {

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
        <View style={styles.sidebar}>

            {/* ==================================================
                BRAND
            ================================================== */}

            <View style={styles.brandContainer}>

                <View style={styles.logoMark}>

                    <Text style={styles.logoMarkText}>
                        C
                    </Text>

                </View>


                <View style={styles.brandTextContainer}>

                    <Text style={styles.brandName}>
                        Clavata
                    </Text>

                    <Text style={styles.brandTagline}>
                        Beauty, simplified.
                    </Text>

                </View>

            </View>


            {/* ==================================================
                MAIN NAVIGATION
            ================================================== */}

            <View style={styles.navigationSection}>

                <Text style={styles.navigationLabel}>
                    DISCOVER
                </Text>


                <SidebarItem
                    icon="⌂"
                    label="Home"
                    active={
                        currentRoute === 'Home'
                    }
                    onPress={() =>
                        navigateTo('Home')
                    }
                />


                <SidebarItem
                    icon="✦"
                    label="Clavata"
                    active={
                        currentRoute === 'Clavata'
                    }
                    onPress={() =>
                        navigateTo('Clavata')
                    }
                />


                <SidebarItem
                    icon="□"
                    label="Bookings"
                    active={
                        currentRoute === 'Bookings'
                    }
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
                    onPress={() =>
                        navigateTo('Profile')
                    }
                />

            </View>


            {/* ==================================================
                SPACER
            ================================================== */}

            <View style={styles.sidebarSpacer} />


            {/* ==================================================
                BECOME PARTNER
            ================================================== */}

            <Pressable
                onPress={() =>
                    navigateTo(
                        'BecomePartner',
                    )
                }
                style={({ hovered }: any) => [
                    styles.partnerCard,

                    hovered &&
                    styles.partnerCardHover,
                ]}
            >

                <View style={styles.partnerIcon}>

                    <Text style={styles.partnerIconText}>
                        +
                    </Text>

                </View>


                <View style={styles.partnerTextContainer}>

                    <Text style={styles.partnerTitle}>
                        Become a partner
                    </Text>

                    <Text style={styles.partnerSubtitle}>
                        Grow your beauty business
                    </Text>

                </View>

            </Pressable>


            {/* ==================================================
                DIVIDER
            ================================================== */}

            <View style={styles.divider} />


            {/* ==================================================
                FOOTER
            ================================================== */}

            <View style={styles.sidebarFooter}>

                <Text style={styles.footerText}>
                    Clavata
                </Text>

                <Text style={styles.footerVersion}>
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

    return (
        <View style={styles.appContainer}>

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <WebSidebar />


            {/* ==================================================
                CONTENT
            ================================================== */}

            <View style={styles.contentContainer}>

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

            paddingTop: 28,
            paddingHorizontal: 16,
            paddingBottom: 20,

            display: 'flex',
        },


        // ========================================================
        // BRAND
        // ========================================================

        brandContainer: {
            flexDirection: 'row',
            alignItems: 'center',

            paddingHorizontal: 10,
            marginBottom: 40,
        },

        logoMark: {
            width: 42,
            height: 42,

            borderRadius: 13,

            backgroundColor: '#111111',

            alignItems: 'center',
            justifyContent: 'center',

            marginRight: 11,
        },

        logoMarkText: {
            color: '#FFFFFF',
            fontSize: 21,
            fontWeight: '800',
        },

        brandTextContainer: {
            flex: 1,
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
        // NAVIGATION
        // ========================================================

        navigationSection: {
            width: '100%',
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