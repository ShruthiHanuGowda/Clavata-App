import React from 'react';

import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Image,
} from 'react-native';

import {
    useNavigation,
} from '@react-navigation/native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    RADIUS,
} from '../../constants/constants';

const { width, height } = Dimensions.get('window');

/* ============================================================
 * TYPES
 * ========================================================== */

type UserRole = 'CUSTOMER' | 'PROVIDER';

type LoginMode = 'CUSTOMER' | 'PROVIDER' | 'SIGN_IN';

/* ============================================================
 * SCREEN
 * ========================================================== */

const WelcomeChoiceScreen = () => {

    const navigation = useNavigation<any>();

    /* ========================================================
     * CUSTOMER
     *
     * User explicitly chooses Customer.
     * LoginScreen will handle OTP verification and determine
     * whether this number is new or already registered.
     * ====================================================== */

    const handleFindService = () => {

        console.log('========================================');
        console.log('WELCOME → CUSTOMER');
        console.log('MODE:', 'CUSTOMER');
        console.log('ROLE:', 'CUSTOMER');
        console.log('========================================');

        navigation.navigate('LoginScreen', {
            mode: 'CUSTOMER' as LoginMode,
            role: 'CUSTOMER' as UserRole,
        });
    };

    /* ========================================================
     * SERVICE PARTNER
     *
     * User explicitly chooses Service Partner.
     * LoginScreen will handle OTP verification and determine
     * whether this number is new or already registered.
     * ====================================================== */

    const handleProvideService = () => {

        console.log('========================================');
        console.log('WELCOME → SERVICE PARTNER');
        console.log('MODE:', 'PROVIDER');
        console.log('ROLE:', 'PROVIDER');
        console.log('========================================');

        navigation.navigate('LoginScreen', {
            mode: 'PROVIDER' as LoginMode,
            role: 'PROVIDER' as UserRole,
        });
    };

    /* ========================================================
     * SIGN IN
     *
     * IMPORTANT:
     * Do NOT send a role here.
     *
     * Sign-in must first verify the phone number.
     *
     * If the number exists:
     *   → LoginScreen checks stored user.role
     *
     * If the number does not exist:
     *   → LoginScreen sends the user back here
     *     to choose Customer or Service Partner.
     * ====================================================== */

    const handleSignIn = () => {

        console.log('========================================');
        console.log('WELCOME → SIGN IN');
        console.log('MODE:', 'SIGN_IN');
        console.log('ROLE:', 'NOT_SELECTED');
        console.log('========================================');

        navigation.navigate('LoginScreen', {
            mode: 'SIGN_IN',
        });
    };

    /* ========================================================
     * RENDER
     * ====================================================== */

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />

            <View style={styles.container}>

                {/* ==================================================
                 * CLAVATA BRAND
                 * ================================================== */}

                <View style={styles.brandContainer}>

                    <Text style={styles.brandText}>
                        Clavata
                    </Text>

                    {/* Optional brand accent */}
                    {/*
                    <View style={styles.brandAccent} />
                    */}

                </View>

                {/* ==================================================
                 * ROLE OPTIONS
                 * ================================================== */}

                <View style={styles.optionsContainer}>

                    {/* ==================================================
                     * CUSTOMER
                     * ================================================== */}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleFindService}
                        style={styles.option}
                    >

                        <View style={styles.customerIconWrapper}>

                            <Image
                                source={require('../../assets/Customer.png')}
                                style={styles.customerIcon}
                                resizeMode="contain"
                            />

                        </View>

                        <View style={styles.optionContent}>

                            <Text style={styles.optionTitle}>
                                Customer
                            </Text>

                            <Text style={styles.optionDescription}>
                                Find the right service. Book in minutes
                            </Text>

                        </View>

                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={26}
                            color={COLORS.textMuted}
                        />

                    </TouchableOpacity>

                    {/* ==================================================
                     * SERVICE PARTNER
                     * ================================================== */}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleProvideService}
                        style={styles.option}
                    >

                        <View style={styles.servicePartnerIconWrapper}>

                            <Image
                                source={require('../../assets/ServicePartner.png')}
                                style={styles.servicePartnerIcon}
                                resizeMode="contain"
                            />

                        </View>

                        <View style={styles.optionContent}>

                            <Text style={styles.optionTitle}>
                                Service Partner
                            </Text>

                            <Text style={styles.optionDescription}>
                                Get discovered. Receive bookings
                            </Text>

                        </View>

                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={26}
                            color={COLORS.textMuted}
                        />

                    </TouchableOpacity>

                </View>

                {/* ==================================================
                 * SIGN IN
                 * ================================================== */}

                <View style={styles.signInContainer}>

                    <Text style={styles.signInText}>
                        Already have an account?
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSignIn}
                    >

                        <Text style={styles.signInLink}>
                            Sign in
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

        </SafeAreaView>
    );
};

export default WelcomeChoiceScreen;

/* ================================================================
 * STYLES
 * ================================================================ */

const styles = StyleSheet.create({

    /* ============================================================
     * ROOT
     * ========================================================== */

    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flex: 1,

        backgroundColor: COLORS.background,

        paddingHorizontal: Math.max(
            SPACING.xxl,
            width * 0.08,
        ),

        paddingTop: height * 0.06,
    },

    /* ============================================================
     * BRAND
     * ========================================================== */

    brandContainer: {
        alignItems: 'center',

        marginTop: Math.max(
            SPACING.large,
            height * 0.025,
        ),

        marginBottom: Math.max(
            SPACING.xxxl,
            height * 0.025,
        ),
    },

    brandText: {
        fontFamily: FONTS.bold,

        fontSize: 42,

        fontWeight: '700',

        letterSpacing: 1.5,

        color: COLORS.primary,

        includeFontPadding: false,
    },

    /*
     * Optional brand accent.
     */
    brandAccent: {
        width: 42,

        height: 4,

        marginTop: 6,

        borderRadius: 10,

        backgroundColor: COLORS.themeColor,
    },

    /* ============================================================
     * OPTIONS
     * ========================================================== */

    optionsContainer: {
        width: '100%',
    },

    option: {
        width: '100%',

        minHeight: Math.min(
            112,
            height * 0.145,
        ),

        flexDirection: 'row',

        alignItems: 'center',

        borderWidth: 1,

        borderColor: COLORS.border,

        borderRadius: RADIUS.medium,

        backgroundColor: COLORS.surface,

        paddingHorizontal: SPACING.large,

        marginBottom: SPACING.medium,
    },

    /* ============================================================
     * CUSTOMER ICON
     * ========================================================== */

    customerIconWrapper: {
        width: 62,

        height: 62,

        alignItems: 'center',

        justifyContent: 'center',

        marginRight: SPACING.large,
    },

    customerIcon: {
        width: 58,

        height: 58,
    },

    /* ============================================================
     * SERVICE PARTNER ICON
     * ========================================================== */

    servicePartnerIconWrapper: {
        width: 62,

        height: 62,

        alignItems: 'center',

        justifyContent: 'center',

        marginRight: SPACING.large,
    },

    servicePartnerIcon: {
        width: 68,

        height: 68,
    },

    /* ============================================================
     * OPTION CONTENT
     * ========================================================== */

    optionContent: {
        flex: 1,

        justifyContent: 'center',

        paddingRight: SPACING.small,
    },

    optionTitle: {
        fontFamily: FONTS.semiBold,

        fontSize: FONT_SIZES.medium,

        color: COLORS.primary,

        marginBottom: 4,
    },

    optionDescription: {
        fontFamily: FONTS.medium,

        fontSize: FONT_SIZES.small,

        color: COLORS.text,

        lineHeight: FONT_SIZES.small + 5,
    },

    /* ============================================================
     * SIGN IN
     * ========================================================== */

    signInContainer: {
        width: '100%',

        flexDirection: 'row',

        justifyContent: 'center',

        alignItems: 'center',

        marginTop: SPACING.medium,
    },

    signInText: {
        fontFamily: FONTS.medium,

        fontSize: FONT_SIZES.small,

        color: COLORS.text,
    },

    signInLink: {
        fontFamily: FONTS.bold,

        fontSize: FONT_SIZES.medium,

        lineHeight: FONT_SIZES.small + 10,

        fontWeight: '600',

        color: COLORS.themeColor,

        marginLeft: 5,

        includeFontPadding: false,
    },
});