import React from 'react';

import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';

import {
    useNavigation,
} from '@react-navigation/native';

const {
    width,
    height,
} = Dimensions.get('window');


/*
 * =========================================================
 * CLAVATA THEME
 * =========================================================
 */

const CLAVATA_BLUE = '#6D28D9';
const ROYAL_GREEN = '#00B86B';
const PROVIDER_RED = '#E60012';

const TEXT = '#111111';
const WHITE = '#FFFFFF';


/*
 * =========================================================
 * WELCOME CHOICE SCREEN
 * =========================================================
 *
 * Account types used throughout the application:
 *
 * CUSTOMER
 * PROVIDER
 *
 * No BUSINESS_PARTNER.
 * No PROVIDER.
 *
 * ---------------------------------------------------------
 *
 * FIND A SERVICE
 *
 * New number:
 *   OTP
 *     ↓
 *   RegisterUser
 *     activeRole = CUSTOMER
 *
 * Existing customer:
 *   OTP
 *     ↓
 *   Customer account
 *
 * Existing provider:
 *   OTP
 *     ↓
 *   "Number already registered as provider"
 *     ↓
 *   Sign in
 *
 * ---------------------------------------------------------
 *
 * PROVIDE A SERVICE
 *
 * New number:
 *   OTP
 *     ↓
 *   RegisterUser
 *     activeRole = PROVIDER
 *
 * Existing provider:
 *   OTP
 *     ↓
 *   Provider account
 *
 * Existing customer:
 *   OTP
 *     ↓
 *   "Number already registered as customer"
 *     ↓
 *   Sign in
 *
 * ---------------------------------------------------------
 */

const WelcomeChoiceScreen = () => {

    const navigation =
        useNavigation<any>();


    /*
     * =====================================================
     * FIND A SERVICE
     * =====================================================
     */

    const handleFindService = () => {

        console.log(
            'WELCOME → FIND A SERVICE',
        );

        console.log(
            'MODE: CUSTOMER',
        );

        console.log(
            'SELECTED ROLE: CUSTOMER',
        );

        navigation.navigate(
            'LoginScreen',
            {
                mode: 'CUSTOMER',
                selectedRole: 'CUSTOMER',
            },
        );
    };


    /*
     * =====================================================
     * PROVIDE A SERVICE
     * =====================================================
     */

    const handleProvideService = () => {

        console.log(
            'WELCOME → PROVIDE A SERVICE',
        );

        console.log(
            'MODE: PROVIDER',
        );

        console.log(
            'SELECTED ROLE: PROVIDER',
        );

        navigation.navigate(
            'LoginScreen',
            {
                mode: 'PROVIDER',
                selectedRole: 'PROVIDER',
            },
        );
    };


    /*
     * =====================================================
     * SIGN IN
     * =====================================================
     */

    const handleSignIn = () => {

        console.log(
            'WELCOME → SIGN IN',
        );

        navigation.navigate(
            'LoginScreen',
            {
                mode: 'SIGN_IN',
            },
        );
    };


    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

    return (

        <SafeAreaView
            style={styles.safeArea}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor={WHITE}
            />

            <View
                style={styles.container}
            >


                {/* ================================================= */}
                {/* ROYAL MEMBER / CUSTOMER */}
                {/* ================================================= */}

                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handleFindService}
                    style={styles.option}
                >

                    {/* LEFT */}

                    <View
                        style={styles.memberColumn}
                    >

                        <View
                            style={styles.personIcon}
                        >

                            <View
                                style={styles.head}
                            />

                            <View
                                style={styles.shoulders}
                            />

                        </View>

                        <Text
                            style={styles.memberTitle}
                        >
                            Royal Member
                        </Text>

                    </View>


                    {/* RIGHT */}

                    <View
                        style={styles.descriptionColumn}
                    >

                        <Text
                            style={styles.description}
                        >
                            Find the right service.
                        </Text>

                        <Text
                            style={styles.description}
                        >
                            Book in minutes
                        </Text>

                    </View>

                </TouchableOpacity>


                {/* ================================================= */}
                {/* SERVICE PROVIDER */}
                {/* ================================================= */}

                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handleProvideService}
                    style={styles.option}
                >

                    {/* LEFT */}

                    <View
                        style={styles.memberColumn}
                    >

                        <View
                            style={[
                                styles.personIcon,
                                styles.providerPersonIcon,
                            ]}
                        >

                            <View
                                style={[
                                    styles.head,
                                    styles.providerHead,
                                ]}
                            />

                            <View
                                style={[
                                    styles.shoulders,
                                    styles.providerShoulders,
                                ]}
                            />

                        </View>

                        <Text
                            style={[
                                styles.memberTitle,
                                styles.providerTitle,
                            ]}
                        >
                            Service Provider
                        </Text>

                    </View>


                    {/* RIGHT */}

                    <View
                        style={styles.descriptionColumn}
                    >

                        <Text
                            style={styles.description}
                        >
                            Get discovered.
                        </Text>

                        <Text
                            style={styles.description}
                        >
                            Receive bookings
                        </Text>

                    </View>

                </TouchableOpacity>


                {/* ================================================= */}
                {/* SIGN IN */}
                {/* ================================================= */}

                <View
                    style={styles.signInContainer}
                >

                    <Text
                        style={styles.signInText}
                    >
                        Already have an account?
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSignIn}
                    >

                        <Text
                            style={styles.signInLink}
                        >
                            Sign in
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

        </SafeAreaView>
    );
};


export default WelcomeChoiceScreen;


/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles = StyleSheet.create({

    /*
     * -------------------------------------------------------
     * SCREEN
     * -------------------------------------------------------
     */

    safeArea: {
        flex: 1,
        backgroundColor: WHITE,
    },

    container: {
        flex: 1,
        backgroundColor: WHITE,
        paddingHorizontal:
            width * 0.08,
    },


    /*
     * -------------------------------------------------------
     * OPTION
     * -------------------------------------------------------
     */

    option: {
        flexDirection: 'row',

        alignItems: 'center',

        width: '100%',

        minHeight:
            height * 0.24,

        paddingVertical: 10,
    },


    /*
     * -------------------------------------------------------
     * LEFT PERSON
     * -------------------------------------------------------
     */

    memberColumn: {
        width:
            width * 0.36,

        alignItems: 'center',

        justifyContent: 'center',
    },

    personIcon: {
        width: 70,
        height: 72,

        alignItems: 'center',

        marginBottom: 9,
    },

    head: {
        width: 25,
        height: 25,

        borderRadius: 14,

        borderWidth: 2,

        borderColor:
            ROYAL_GREEN,

        marginBottom: 7,
    },

    shoulders: {
        width: 50,
        height: 30,

        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,

        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,

        borderColor:
            ROYAL_GREEN,
    },


    /*
     * -------------------------------------------------------
     * PROVIDER ICON
     * -------------------------------------------------------
     */

    providerPersonIcon: {
        marginBottom: 9,
    },

    providerHead: {
        borderColor:
            PROVIDER_RED,
    },

    providerShoulders: {
        borderColor:
            PROVIDER_RED,
    },


    /*
     * -------------------------------------------------------
     * TITLES
     * -------------------------------------------------------
     */

    memberTitle: {
        fontSize: 16,

        lineHeight: 21,

        color: TEXT,

        fontWeight: '400',

        textAlign: 'center',

        includeFontPadding: false,
    },

    providerTitle: {
        color: TEXT,
    },


    /*
     * -------------------------------------------------------
     * DESCRIPTION
     * -------------------------------------------------------
     */

    descriptionColumn: {
        flex: 1,

        justifyContent: 'center',

        paddingLeft: 12,
    },

    description: {
        fontSize: 17,

        lineHeight: 23,

        color: TEXT,

        fontWeight: '400',

        includeFontPadding: false,

        marginVertical: 1,
    },


    /*
     * -------------------------------------------------------
     * SIGN IN
     * -------------------------------------------------------
     */

    signInContainer: {
        position: 'absolute',

        left: 0,
        right: 0,

        bottom:
            height * 0.105,

        flexDirection: 'row',

        justifyContent: 'center',

        alignItems: 'center',
    },

    signInText: {
        fontSize: 16,

        lineHeight: 22,

        color: TEXT,

        fontWeight: '400',

        includeFontPadding: false,
    },

    signInLink: {
        fontSize: 16,

        lineHeight: 22,

        color: CLAVATA_BLUE,

        fontWeight: '400',

        marginLeft: 4,

        includeFontPadding: false,
    },

});