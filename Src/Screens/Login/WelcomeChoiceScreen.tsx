import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PRIMARY = '#009D94';
const DARK = '#102A2A';
const TEXT = '#172525';
const MUTED = '#718080';
const BORDER = '#E8EEEE';
const BG = '#F8FAFA';

const { width } = Dimensions.get('window');

const WelcomeChoiceScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const registrationIncomplete =
        route.params?.registrationIncomplete === true;

    const phoneNumber =
        route.params?.phoneNumber || '';

    /*
     * FIND A SERVICE
     *
     * This starts the customer authentication flow.
     */
    const handleFindService = () => {
        navigation.navigate('LoginScreen', {
            mode: 'CUSTOMER',
            phoneNumber,
        });
    };

    /*
     * PROVIDE A SERVICE
     *
     * This starts the salon/provider flow.
     *
     * IMPORTANT:
     * Replace SalonRegistration with your actual
     * provider onboarding screen if the route name differs.
     */
    const handleProvideService = () => {
        navigation.navigate('SalonRegistration');
    };

    /*
     * SIGN IN
     */
    const handleSignIn = () => {
        navigation.navigate('LoginScreen', {
            mode: 'SIGN_IN',
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={BG}
            />

            <View style={styles.container}>

                {/* Logo */}

                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Registration incomplete message */}

                {registrationIncomplete && (
                    <View style={styles.incompleteContainer}>
                        <View style={styles.incompleteIcon}>
                            <Text style={styles.incompleteIconText}>
                                !
                            </Text>
                        </View>

                        <View style={styles.incompleteContent}>
                            <Text style={styles.incompleteTitle}>
                                Registration not complete
                            </Text>

                            <Text style={styles.incompleteText}>
                                Your mobile number is verified, but your
                                Clavata account is not complete yet.
                                Choose how you'd like to continue.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Options */}

                <View style={styles.optionsContainer}>

                    {/* Find Service */}

                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={styles.optionCard}
                        onPress={handleFindService}
                    >
                        <View style={styles.iconContainerPrimary}>
                            <Text style={styles.searchIcon}>
                                ⌕
                            </Text>
                        </View>

                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionTitle}>
                                Find a Services
                            </Text>

                            <Text style={styles.optionDescription}>
                                Discover salons, beauty services and
                                professionals near you.
                            </Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <Text style={styles.arrow}>
                                ›
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Provide Service */}

                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={styles.optionCard}
                        onPress={handleProvideService}
                    >
                        <View style={styles.iconContainerSecondary}>
                            <Text style={styles.sparkle}>
                                ✦
                            </Text>
                        </View>

                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionTitle}>
                                Provide a Service
                            </Text>

                            <Text style={styles.optionDescription}>
                                Grow your business and connect with
                                more customers.
                            </Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <Text style={styles.arrow}>
                                ›
                            </Text>
                        </View>
                    </TouchableOpacity>

                </View>

                {/* Bottom */}

                <View style={styles.bottomContainer}>
                    <Text style={styles.bottomText}>
                        Already have an account?
                    </Text>

                    <TouchableOpacity
                        onPress={handleSignIn}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.signIn}>
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
        backgroundColor: BG,
    },

    container: {
        flex: 1,
        paddingHorizontal: 24,
    },

    logoContainer: {
        alignItems: 'center',
        marginTop: 35,
        marginBottom: 25,
    },

    logo: {
        width: width * 0.52,
        height: 110,
    },

    incompleteContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF8E8',
        borderWidth: 1,
        borderColor: '#F2D48A',
        borderRadius: 16,
        padding: 14,
        marginBottom: 18,
    },

    incompleteIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F4B942',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    incompleteIconText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },

    incompleteContent: {
        flex: 1,
    },

    incompleteTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B4F00',
        marginBottom: 3,
    },

    incompleteText: {
        fontSize: 12,
        lineHeight: 18,
        color: '#806A28',
    },

    optionsContainer: {
        gap: 16,
    },

    optionCard: {
        backgroundColor: '#FFFFFF',
        minHeight: 126,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: BORDER,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 18,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.045,
        shadowRadius: 14,

        elevation: 2,
    },

    iconContainerPrimary: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#E7F7F5',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 15,
    },

    iconContainerSecondary: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#EEF7F6',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 15,
    },

    searchIcon: {
        fontSize: 38,
        lineHeight: 40,
        color: PRIMARY,
        fontWeight: '300',
        transform: [{ rotate: '-20deg' }],
    },

    sparkle: {
        fontSize: 27,
        color: PRIMARY,
    },

    optionTextContainer: {
        flex: 1,
        paddingRight: 8,
    },

    optionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: TEXT,
        marginBottom: 6,
    },

    optionDescription: {
        fontSize: 13,
        lineHeight: 19,
        color: MUTED,
    },

    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F6F6',

        alignItems: 'center',
        justifyContent: 'center',
    },

    arrow: {
        fontSize: 25,
        lineHeight: 27,
        color: PRIMARY,
        fontWeight: '400',
        marginTop: -2,
    },

    bottomContainer: {
        marginTop: 32,
        marginBottom: 20,

        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottomText: {
        fontSize: 13,
        color: MUTED,
    },

    signIn: {
        fontSize: 13,
        color: PRIMARY,
        fontWeight: '700',
        marginLeft: 5,
    },
});