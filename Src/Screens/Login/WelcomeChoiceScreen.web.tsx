import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeChoiceScreen = () => {
    const navigation = useNavigation<any>();

    const handleFindService = () => {
        navigation.navigate('LoginScreen', {
            mode: 'CUSTOMER',
            selectedRole: 'CUSTOMER',
        });
    };

    const handleProvideService = () => {
        navigation.navigate('LoginScreen', {
            mode: 'PROVIDER',
            selectedRole: 'PROVIDER',
        });
    };

    const handleSignIn = () => {
        console.log('SIGN IN CLICKED');
        navigation.navigate('LoginScreen', {
            mode: 'SIGN_IN',
        });
    };

    return (
        <View style={styles.page}>
            {/* Background decoration */}
            <View style={styles.backgroundCircleOne} />
            <View style={styles.backgroundCircleTwo} />

            <View style={styles.content}>
                {/* LOGO */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo-blue.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* MAIN CARD */}
                <View style={styles.mainCard}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.welcomeText}>Welcome to Clavata</Text>

                        <Text style={styles.heading}>
                            How would you like to use Clavata?
                        </Text>

                        <Text style={styles.subtitle}>
                            Choose an option below to get started with your Clavata
                            experience.
                        </Text>
                    </View>

                    {/* OPTIONS */}
                    <View style={styles.optionsContainer}>
                        {/* CUSTOMER */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleFindService}
                            style={styles.option}>
                            <View style={styles.optionIconContainer}>
                                <PersonIcon />
                            </View>

                            <View style={styles.optionContent}>
                                <View style={styles.optionTitleRow}>
                                    <Text style={styles.optionTitle}>Royal Member</Text>

                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>CUSTOMER</Text>
                                    </View>
                                </View>

                                <Text style={styles.optionDescription}>
                                    Discover the right services, explore trusted partners,
                                    and book your appointment in minutes.
                                </Text>

                                <View style={styles.actionRow}>
                                    <Text style={styles.actionText}>Find a service</Text>
                                    <Text style={styles.arrow}>→</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* PROVIDER */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleProvideService}
                            style={styles.option}>
                            <View style={styles.optionIconContainer}>
                                <BusinessIcon />
                            </View>

                            <View style={styles.optionContent}>
                                <View style={styles.optionTitleRow}>
                                    <Text style={styles.optionTitle}>Service Partner</Text>

                                    <View style={styles.partnerBadge}>
                                        <Text style={styles.partnerBadgeText}>PARTNER</Text>
                                    </View>
                                </View>

                                <Text style={styles.optionDescription}>
                                    Grow your business, get discovered by customers, and
                                    receive new bookings through Clavata.
                                </Text>

                                <View style={styles.actionRow}>
                                    <Text style={styles.actionText}>Become a partner</Text>
                                    <Text style={styles.arrow}>→</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* DIVIDER */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* SIGN IN */}
                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>
                            Already have a Clavata account?
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleSignIn}
                            style={styles.signInButton}>
                            <Text style={styles.signInLink}>Sign in</Text>
                            <Text style={styles.signInArrow}>→</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © {new Date().getFullYear()} Clavata. All rights reserved.
                    </Text>

                    <View style={styles.footerDot} />

                    <Text style={styles.footerText}>
                        Your trusted service platform
                    </Text>
                </View>
            </View>
        </View>
    );
};

/* =========================================================
   PERSON ICON
========================================================= */

const PersonIcon = () => {
    return (
        <View style={styles.personIcon}>
            <View style={styles.personHead} />
            <View style={styles.personBody} />
        </View>
    );
};

/* =========================================================
   BUSINESS ICON
========================================================= */

const BusinessIcon = () => {
    return (
        <View style={styles.businessIcon}>
            <View style={styles.businessRoof} />

            <View style={styles.businessBuilding}>
                <View style={styles.businessWindowLeft} />
                <View style={styles.businessWindowRight} />
                <View style={styles.businessDoor} />
            </View>
        </View>
    );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
    page: {
        flex: 1,
        minHeight: '100vh' as any,
        backgroundColor: '#F5F8FA',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        overflow: 'hidden',
        position: 'relative',
    },

    /* -------------------------------------------------------
       BACKGROUND
    ------------------------------------------------------- */

    backgroundCircleOne: {
        position: 'absolute',
        width: 520,
        height: 520,
        borderRadius: 260,
        backgroundColor: 'rgba(0, 128, 96, 0.045)',
        top: -240,
        right: -160,
    },

    backgroundCircleTwo: {
        position: 'absolute',
        width: 420,
        height: 420,
        borderRadius: 210,
        backgroundColor: 'rgba(0, 128, 96, 0.035)',
        bottom: -220,
        left: -160,
    },

    /* -------------------------------------------------------
       CONTENT
    ------------------------------------------------------- */

    content: {
        width: '100%',
        maxWidth: 720,
        alignItems: 'center',
        zIndex: 2,
    },

    /* -------------------------------------------------------
       LOGO
    ------------------------------------------------------- */

    logoContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 28,
    },

    logo: {
        width: 190,
        height: 70,
    },

    /* -------------------------------------------------------
       MAIN CARD
    ------------------------------------------------------- */

    mainCard: {
        width: '100%',
        maxWidth: 680,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 42,
        paddingVertical: 42,

        borderWidth: 1,
        borderColor: '#E8EEEE',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.08,
        shadowRadius: 30,

        elevation: 8,
    },

    headingContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },

    welcomeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#008060',
        letterSpacing: 0.8,
        marginBottom: 9,
        textTransform: 'uppercase',
    },

    heading: {
        fontSize: 28,
        lineHeight: 36,
        fontWeight: '700',
        color: '#17201E',
        textAlign: 'center',
    },

    subtitle: {
        maxWidth: 510,
        marginTop: 10,
        fontSize: 15,
        lineHeight: 23,
        fontWeight: '400',
        color: '#687572',
        textAlign: 'center',
    },

    /* -------------------------------------------------------
       OPTIONS
    ------------------------------------------------------- */

    optionsContainer: {
        width: '100%',
    },

    option: {
        width: '100%',
        minHeight: 145,
        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#E1E9E7',

        borderRadius: 18,

        paddingHorizontal: 20,
        paddingVertical: 20,

        marginBottom: 14,

        ...(Platform.OS === 'web'
            ? ({
                cursor: 'pointer',
                transition: 'all 180ms ease',
            } as any)
            : {}),
    },

    optionIconContainer: {
        width: 64,
        height: 64,

        borderRadius: 32,

        backgroundColor: '#F0F8F6',

        borderWidth: 1,
        borderColor: '#D7EAE5',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 18,

        flexShrink: 0,
    },

    optionContent: {
        flex: 1,
        minWidth: 0,
    },

    optionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 7,
    },

    optionTitle: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
        color: '#18211F',
        marginRight: 9,
    },

    optionDescription: {
        fontSize: 14,
        lineHeight: 21,
        color: '#687572',
        maxWidth: 500,
    },

    /* -------------------------------------------------------
       BADGES
    ------------------------------------------------------- */

    badge: {
        backgroundColor: '#EAF7F3',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    badgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#008060',
        letterSpacing: 0.6,
    },

    partnerBadge: {
        backgroundColor: '#F1F5FF',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    partnerBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#4665A8',
        letterSpacing: 0.6,
    },

    /* -------------------------------------------------------
       ACTION
    ------------------------------------------------------- */

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },

    actionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#008060',
    },

    arrow: {
        fontSize: 19,
        fontWeight: '600',
        color: '#008060',
        marginLeft: 7,
    },

    /* -------------------------------------------------------
       DIVIDER
    ------------------------------------------------------- */

    divider: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 22,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E9EEED',
    },

    dividerText: {
        marginHorizontal: 14,
        fontSize: 11,
        fontWeight: '700',
        color: '#A0AAA7',
        letterSpacing: 1,
    },

    /* -------------------------------------------------------
       SIGN IN
    ------------------------------------------------------- */

    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    signInText: {
        fontSize: 14,
        color: '#687572',
    },

    signInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6,
        paddingVertical: 4,
        paddingHorizontal: 3,

        ...(Platform.OS === 'web'
            ? ({
                cursor: 'pointer',
            } as any)
            : {}),
    },

    signInLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#008060',
    },

    signInArrow: {
        fontSize: 16,
        fontWeight: '700',
        color: '#008060',
        marginLeft: 4,
    },

    /* -------------------------------------------------------
       FOOTER
    ------------------------------------------------------- */

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 22,
    },

    footerText: {
        fontSize: 11,
        color: '#98A29F',
    },

    footerDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#B7C0BE',
        marginHorizontal: 8,
    },

    /* -------------------------------------------------------
       PERSON ICON
    ------------------------------------------------------- */

    personIcon: {
        width: 32,
        height: 35,
        alignItems: 'center',
    },

    personHead: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#008060',
        marginBottom: 5,
    },

    personBody: {
        width: 27,
        height: 16,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: '#008060',
    },

    /* -------------------------------------------------------
       BUSINESS ICON
    ------------------------------------------------------- */

    businessIcon: {
        width: 32,
        height: 34,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },

    businessRoof: {
        width: 25,
        height: 7,
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: '#008060',
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
        top: 1,
    },

    businessBuilding: {
        width: 27,
        height: 22,
        borderWidth: 2,
        borderColor: '#008060',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 2,
    },

    businessDoor: {
        width: 7,
        height: 10,
        borderWidth: 1.5,
        borderColor: '#008060',
    },

    businessWindowLeft: {
        width: 5,
        height: 5,
        borderWidth: 1.5,
        borderColor: '#008060',
        position: 'absolute',
        top: 5,
        left: 4,
    },

    businessWindowRight: {
        width: 5,
        height: 5,
        borderWidth: 1.5,
        borderColor: '#008060',
        position: 'absolute',
        top: 5,
        right: 4,
    },
});

export default WelcomeChoiceScreen;