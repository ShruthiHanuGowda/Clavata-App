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
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    RADIUS,
} from '../../constants/constants';
const { width, height } = Dimensions.get('window');

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
        navigation.navigate('LoginScreen', {
            mode: 'SIGN_IN',
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />

            <View style={styles.container}>
                {/* Logo */}
                <Image
                    source={require('../../assets/logo-blue.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {/* Customer */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleFindService}
                        style={styles.option}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name="account-search-outline"
                                size={28}
                                color={COLORS.primary}
                            />
                        </View>

                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>
                                Royal Member
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

                    {/* Provider */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleProvideService}
                        style={styles.option}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name="storefront-outline"
                                size={28}
                                color={COLORS.primary}
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

                {/* Sign In */}
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

const styles = StyleSheet.create({
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

    logo: {
        width: 190,
        height: 70,
        alignSelf: 'center',
        marginTop: Math.max(
            SPACING.large,
            height * 0.025,
        ),
        marginBottom: Math.max(
            SPACING.xxxl,
            height * 0.025,
        ),
    },

    optionsContainer: {
        width: '100%',
    },

    option: {
        width: '100%',
        minHeight: Math.min(
            104,
            height * 0.135,
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

    iconContainer: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderStrong,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.background,
        marginRight: SPACING.large,
    },

    optionContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: SPACING.small,
    },

    optionTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.medium,
        color: COLORS.primary,
        marginBottom: 3,
    },

    optionDescription: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.small,
        color: COLORS.text,
        lineHeight: FONT_SIZES.small + 5,
    },

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