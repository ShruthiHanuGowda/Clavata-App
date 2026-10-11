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
    ScrollView,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaskedView from '@react-native-masked-view/masked-view';

import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    RADIUS,
    GRADIENTS,
} from '../../constants/constants';

import AppGradient from '../../common/AppGradient';

const { width, height } = Dimensions.get('window');

type UserRole = 'CUSTOMER' | 'PROVIDER';
type LoginMode = 'CUSTOMER' | 'PROVIDER' | 'SIGN_IN';

const WelcomeChoiceScreen = () => {
    const navigation = useNavigation<any>();

    const handleFindService = () => {
        navigation.navigate('LoginScreen', {
            mode: 'CUSTOMER' as LoginMode,
            role: 'CUSTOMER' as UserRole,
        });
    };

    const handleProvideService = () => {
        navigation.navigate('LoginScreen', {
            mode: 'PROVIDER' as LoginMode,
            role: 'PROVIDER' as UserRole,
        });
    };

    const handleSignIn = () => {
        navigation.navigate('LoginScreen', {
            mode: 'SIGN_IN' as LoginMode,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={styles.container}>
                    {/* BRAND */}
                    <View style={styles.brandContainer}>
                        <Text style={styles.brandText}>
                            Clavata
                        </Text>
                    </View>

                    {/* ROLE OPTIONS */}
                    <View style={styles.optionsContainer}>
                        {/* CUSTOMER */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleFindService}
                            style={styles.option}
                            accessibilityRole="button"
                            accessibilityLabel="Continue as Customer"
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
                                    Find the right service. Book in minutes.
                                </Text>
                            </View>

                            <View style={styles.arrowWrapper}>
                                <MaskedView
                                    style={styles.arrowMask}
                                    maskElement={
                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={29}
                                            color="#FFFFFF"
                                        />
                                    }
                                >
                                    <AppGradient
                                        colors={[...GRADIENTS.SOFT_PURPLE]}
                                        style={styles.arrowGradient}
                                    >
                                        <View />
                                    </AppGradient>
                                </MaskedView>
                            </View>
                        </TouchableOpacity>

                        {/* SERVICE PARTNER */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleProvideService}
                            style={styles.option}
                            accessibilityRole="button"
                            accessibilityLabel="Continue as Service Partner"
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
                                    Get discovered. Receive bookings.
                                </Text>
                            </View>

                            <View style={styles.arrowWrapper}>
                                <MaskedView
                                    style={styles.arrowMask}
                                    maskElement={
                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={29}
                                            color="#FFFFFF"
                                        />
                                    }
                                >
                                    <AppGradient
                                        colors={[...GRADIENTS.SOFT_PURPLE]}
                                        style={styles.arrowGradient}
                                    >
                                        <View />
                                    </AppGradient>
                                </MaskedView>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* SIGN IN */}
                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>
                            Already have an account?
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleSignIn}
                            accessibilityRole="button"
                            accessibilityLabel="Sign in"
                        >
                            <AppGradient
                                colors={[...GRADIENTS.SOFT_PURPLE]}
                                style={styles.signInGradient}
                            >
                                <Text style={styles.signInLink}>
                                    Sign in
                                </Text>

                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={16}
                                    color="#FFFFFF"
                                />
                            </AppGradient>
                        </TouchableOpacity>
                    </View>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Clavata Connects Private Limited 2026
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default WelcomeChoiceScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    scrollContent: {
        flexGrow: 1,
    },

    container: {
        flexGrow: 1,
        paddingHorizontal: Math.max(SPACING.xxl, width * 0.075),
        paddingTop: Math.min(height * 0.055, 44),
        paddingBottom: SPACING.large,
    },

    /* BRAND */

    brandContainer: {
        alignItems: 'center',
        marginBottom: Math.min(height * 0.055, 42),
    },

    brandText: {
        fontFamily: FONTS.bold,
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: COLORS.primary,
        includeFontPadding: false,
    },

    brandAccent: {
        width: 42,
        height: 4,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 28,
    },

    welcomeTitle: {
        fontFamily: FONTS.bold,
        fontSize: Math.min(width * 0.083, 32),
        fontWeight: '800',
        lineHeight: Math.min(width * 0.105, 39),
        textAlign: 'center',
        color: COLORS.primary,
        letterSpacing: -0.5,
        includeFontPadding: false,
    },

    welcomeTitleAccent: {
        color: '#8B5CF6',
    },

    welcomeDescription: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.small,
        lineHeight: FONT_SIZES.small + 7,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 12,
        maxWidth: 290,
    },

    /* OPTIONS */

    optionsContainer: {
        width: '100%',
    },

    sectionTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.medium,
        color: COLORS.primary,
        marginBottom: SPACING.medium,
        letterSpacing: 0.1,
    },

    option: {
        width: '100%',
        minHeight: Math.max(100, Math.min(112, height * 0.14)),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAE4F2',
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 15,

        elevation: 2,
        shadowColor: '#6D28D9',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.055,
        shadowRadius: 8,
    },

    /* CUSTOMER ICON */

    customerIconWrapper: {
        width: 62,
        height: 62,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
        borderRadius: 16,
        backgroundColor: '#F7F1FF',
    },

    customerIcon: {
        width: 56,
        height: 56,
    },

    /* SERVICE PARTNER ICON */

    servicePartnerIconWrapper: {
        width: 62,
        height: 62,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
        borderRadius: 16,
        backgroundColor: '#F7F1FF',
    },

    servicePartnerIcon: {
        width: 64,
        height: 64,
    },

    /* OPTION TEXT */

    optionContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 8,
    },

    optionTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.medium,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 6,
        includeFontPadding: false,
    },

    optionDescription: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.small,
        lineHeight: FONT_SIZES.small + 5,
        color: COLORS.textMuted,
    },

    /* GRADIENT ARROW */

    arrowWrapper: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },

    arrowMask: {
        width: 29,
        height: 29,
    },

    arrowGradient: {
        width: 29,
        height: 29,
    },

    /* SIGN IN */

    signInContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 18,
    },

    signInText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.small,
        color: COLORS.textMuted,
    },

    signInGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginLeft: 7,
    },

    signInLink: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.small,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 5,
        includeFontPadding: false,
    },

    /* FOOTER */

    footer: {
        marginTop: 'auto',
        paddingTop: 34,
        alignItems: 'center',
    },

    footerText: {
        fontFamily: FONTS.medium,
        fontSize: 10,
        color: COLORS.textMuted,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});
