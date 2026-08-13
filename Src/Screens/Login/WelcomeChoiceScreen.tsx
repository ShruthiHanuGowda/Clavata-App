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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#009D94';
const DARK = '#102A2A';
const TEXT = '#172525';
const MUTED = '#718080';
const BORDER = '#E8EEEE';
const BG = '#F8FAFA';

const { width } = Dimensions.get('window');

const WelcomeChoiceScreen = () => {
    const navigation = useNavigation<any>();

    const handleFindService = () => {
        // Change this to your actual customer registration/login screen
        navigation.navigate('Login');
    };

    const handleProvideService = () => {
        // Change this to your actual provider registration screen
        navigation.navigate('SalonRegistration');
    };

    const handleSignIn = () => {
        navigation.navigate('LoginScreen');
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
                    {/* Replace this with your actual Clavata logo */}
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Heading */}
                {/* <View style={styles.headingContainer}>
                    <Text style={styles.welcome}>
                        Welcome to Clavata
                    </Text>

                    <Text style={styles.subtitle}>
                        One place to discover and provide
                        {'\n'}
                        trusted services.
                    </Text>
                </View> */}

                {/* Options */}
                <View style={styles.optionsContainer}>

                    {/* Find Service */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={styles.optionCard}
                        onPress={handleFindService}
                    >
                        <View style={styles.iconContainerPrimary}>
                            <Text style={styles.searchIcon}>⌕</Text>
                        </View>

                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionTitle}>
                                Find a Service
                            </Text>

                            <Text style={styles.optionDescription}>
                                Discover salons, beauty services
                                and professionals near you.
                            </Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <Text style={styles.arrow}>›</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Provide Service */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={styles.optionCard}
                        onPress={handleProvideService}
                    >
                        <View style={styles.iconContainerSecondary}>
                            <Text style={styles.sparkle}>✦</Text>
                        </View>

                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionTitle}>
                                Provide a Service
                            </Text>

                            <Text style={styles.optionDescription}>
                                Grow your business and connect
                                with more customers.
                            </Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <Text style={styles.arrow}>›</Text>
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

    headingContainer: {
        alignItems: 'center',
        marginBottom: 38,
    },

    welcome: {
        fontSize: 27,
        fontWeight: '700',
        color: DARK,
        letterSpacing: -0.5,
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 15,
        lineHeight: 23,
        textAlign: 'center',
        color: MUTED,
        fontWeight: '400',
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