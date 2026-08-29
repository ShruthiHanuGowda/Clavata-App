import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/native';

import OTPModal from '../../components/OTPModal/OTPModal';
import { SEND_OTP } from '../../graphql/queries';
import { useUser } from '../../context/UserContext';

type LoginMode = 'CUSTOMER' | 'PROVIDER' | 'SIGN_IN';

export default function LoginScreenWeb() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { setCurrentUser } = useUser();

    const mode: LoginMode = route.params?.mode || 'SIGN_IN';
    const hideBackButton = route.params?.hideBackButton === true;

    const [showOTP, setShowOTP] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(
        route.params?.phoneNumber || '',
    );
    const [loading, setLoading] = useState(false);

    const [sendOTP, { error: queryError }] = useMutation(SEND_OTP);

    useEffect(() => {
        if (!queryError) {
            return;
        }

        console.error('Send OTP error:', queryError);
        setLoading(false);

        Alert.alert(
            'Unable to continue',
            'We could not send the verification code. Please try again.',
        );
    }, [queryError]);

    const getExistingRole = (user: any) => {
        if (user?.roles?.customer === true) {
            return 'CUSTOMER';
        }

        if (user?.roles?.businessPartner === true) {
            return 'PROVIDER';
        }

        if (user?.activeRole === 'CUSTOMER') {
            return 'CUSTOMER';
        }

        if (user?.activeRole === 'PROVIDER') {
            return 'PROVIDER';
        }

        return null;
    };

    const openExistingAccount = async (user: any) => {
        setCurrentUser(user);

        const existingRole = getExistingRole(user);

        console.log('========== EXISTING ACCOUNT ==========');
        console.log('ROLE:', existingRole);
        console.log('PROVIDER STATUS:', user?.providerStatus);
        console.log('USER:', JSON.stringify(user, null, 2));
        console.log('======================================');

        if (existingRole === 'PROVIDER') {
            const providerStatus = String(
                user?.providerStatus || 'NOT_REGISTERED',
            )
                .trim()
                .toUpperCase();

            if (providerStatus === 'NOT_REGISTERED') {
                navigation.navigate('BecomePartner');
                return;
            }

            if (providerStatus === 'PENDING') {
                navigation.replace('BecomePartner', {
                    screen: 'SalonPendingVerification',
                });
                return;
            }

            if (providerStatus === 'APPROVED') {
                navigation.navigate('appScreens');
                return;
            }

            if (providerStatus === 'REJECTED') {
                navigation.navigate('BecomePartner');
                return;
            }

            navigation.navigate('BecomePartner');
            return;
        }

        if (existingRole === 'CUSTOMER') {
            navigation.replace('appScreens', {
                screen: 'HomeScreen',
            });

            return;
        }

        Alert.alert(
            'Account error',
            'We could not determine your account type. Please contact support.',
        );
    };

    const handleOTPVerified = (result: any) => {
        console.log('========== OTP LOGIN RESULT ==========');
        console.log('SUCCESS:', result?.success);
        console.log('EXISTING:', result?.isExistingUser);
        console.log('USER:', JSON.stringify(result?.user, null, 2));
        console.log('MODE:', mode);
        console.log('======================================');

        setShowOTP(false);

        if (result?.success !== true) {
            Alert.alert(
                'Verification failed',
                result?.message ||
                'OTP verification failed. Please try again.',
            );
            return;
        }

        if (result?.isExistingUser === true && result?.user) {
            const user = result.user;
            const existingRole = getExistingRole(user);

            if (mode === 'SIGN_IN') {
                openExistingAccount(user);
                return;
            }

            if (mode === 'CUSTOMER') {
                if (existingRole === 'CUSTOMER') {
                    openExistingAccount(user);
                    return;
                }

                Alert.alert(
                    'Number already registered',
                    'This mobile number is already registered as a Service Provider. Please sign in.',
                    [
                        {
                            text: 'Sign in',
                            onPress: () => {
                                navigation.replace('LoginScreen', {
                                    mode: 'SIGN_IN',
                                    phoneNumber,
                                });
                            },
                        },
                    ],
                );

                return;
            }

            if (mode === 'PROVIDER') {
                if (existingRole === 'PROVIDER') {
                    openExistingAccount(user);
                    return;
                }

                Alert.alert(
                    'Number already registered',
                    'This mobile number is already registered as a customer. Please sign in.',
                    [
                        {
                            text: 'Sign in',
                            onPress: () => {
                                navigation.replace('LoginScreen', {
                                    mode: 'SIGN_IN',
                                    phoneNumber,
                                });
                            },
                        },
                    ],
                );

                return;
            }

            return;
        }

        if (result?.isExistingUser === false) {
            if (mode === 'SIGN_IN') {
                Alert.alert(
                    'Account not found',
                    'No Clavata account exists for this mobile number.',
                    [
                        {
                            text: 'Choose account type',
                            onPress: () => {
                                navigation.replace('authScreens');
                            },
                        },
                    ],
                );

                return;
            }

            if (mode === 'CUSTOMER') {
                navigation.replace('RegisterUser', {
                    phoneNumber,
                    activeRole: 'CUSTOMER',
                });

                return;
            }

            if (mode === 'PROVIDER') {
                navigation.replace('RegisterUser', {
                    phoneNumber,
                    activeRole: 'PROVIDER',
                });

                return;
            }
        }

        Alert.alert(
            'Unable to continue',
            'We could not determine your account status. Please try again.',
        );
    };

    const loginWithPhone = useCallback(async () => {
        const cleanedPhone = phoneNumber.trim();

        if (!cleanedPhone || loading) {
            return;
        }

        try {
            setLoading(true);

            const { data } = await sendOTP({
                variables: {
                    phoneNumber: cleanedPhone,
                },
            });

            if (data?.sendOTP?.success) {
                setShowOTP(true);
            } else {
                Alert.alert(
                    'Unable to continue',
                    data?.sendOTP?.message ||
                    'We could not send the verification code.',
                );
            }
        } catch (error) {
            console.error('OTP error:', error);

            Alert.alert(
                'Something went wrong',
                'Please check your internet connection and try again.',
            );
        } finally {
            setLoading(false);
        }
    }, [phoneNumber, loading, sendOTP]);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('authScreens');
    }, [navigation]);

    const getHeading = () => {
        if (mode === 'CUSTOMER') {
            return 'Welcome, Royal Member';
        }

        if (mode === 'PROVIDER') {
            return 'Welcome, Service Partner';
        }

        return 'Welcome back';
    };

    const getDescription = () => {
        if (mode === 'CUSTOMER') {
            return 'Sign up with your mobile number to discover and book trusted services.';
        }

        if (mode === 'PROVIDER') {
            return 'Create your account and start growing your service business with Clavata.';
        }

        return 'Sign in securely using your registered mobile number.';
    };

    return (
        <View style={styles.page}>
            <View style={styles.backgroundGlow} />

            <View style={styles.header}>
                {!hideBackButton && (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        activeOpacity={0.8}>
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                )}

                <Image
                    source={require('../../assets/logo-blue.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.centerArea}>
                <View style={styles.card}>
                    <View style={styles.badge}>
                        <View style={styles.badgeDot} />
                        <Text style={styles.badgeText}>
                            {mode === 'SIGN_IN'
                                ? 'SECURE SIGN IN'
                                : 'WELCOME TO CLAVATA'}
                        </Text>
                    </View>

                    <Text style={styles.title}>{getHeading()}</Text>

                    <Text style={styles.description}>
                        {getDescription()}
                    </Text>

                    <View style={styles.form}>
                        <Text style={styles.label}>Mobile number</Text>

                        <View style={styles.phoneInputContainer}>
                            <View style={styles.countryCode}>
                                <Text style={styles.flag}>🇮🇳</Text>
                                <Text style={styles.countryText}>+91</Text>
                            </View>

                            <View style={styles.divider} />

                            <TextInput
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter mobile number"
                                placeholderTextColor="#A1A7B3"
                                keyboardType="phone-pad"
                                maxLength={10}
                                style={styles.phoneInput}
                                editable={!loading}
                                returnKeyType="done"
                                onSubmitEditing={loginWithPhone}
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={loginWithPhone}
                            disabled={!phoneNumber || phoneNumber.length < 10 || loading}
                            style={[
                                styles.continueButton,
                                (!phoneNumber ||
                                    phoneNumber.length < 10 ||
                                    loading) &&
                                styles.continueButtonDisabled,
                            ]}>
                            <Text style={styles.continueText}>
                                {loading ? 'Sending code...' : 'Continue'}
                            </Text>

                            {!loading && (
                                <Text style={styles.continueArrow}>→</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.securityRow}>
                        <Text style={styles.lockIcon}>⌕</Text>

                        <Text style={styles.securityText}>
                            We'll send a one-time verification code to your
                            mobile number.
                        </Text>
                    </View>

                    <View style={styles.legalContainer}>
                        <Text style={styles.legalText}>
                            By continuing, you agree to Clavata's
                        </Text>

                        <View style={styles.legalLinks}>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={styles.legalLink}>
                                    Terms of Service
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.legalSeparator}>·</Text>

                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={styles.legalLink}>
                                    Privacy Policy
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    © {new Date().getFullYear()} Clavata. All rights reserved.
                </Text>
            </View>

            <OTPModal
                visible={showOTP}
                phoneNumber={phoneNumber}
                onClose={() => setShowOTP(false)}
                onVerified={handleOTPVerified}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        minHeight: '100vh' as any,
        backgroundColor: '#F7F9FC',
        position: 'relative',
        overflow: 'hidden',
    },

    backgroundGlow: {
        position: 'absolute',
        width: 620,
        height: 620,
        borderRadius: 310,
        backgroundColor: '#EAF2FF',
        opacity: 0.7,
        top: -300,
        right: -180,
    },

    header: {
        width: '100%',
        height: 90,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
    },

    backButton: {
        position: 'absolute',
        left: 32,
        top: 25,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
    },

    backIcon: {
        fontSize: 30,
        lineHeight: 32,
        color: '#1E3A8A',
        marginTop: -3,
    },

    logo: {
        width: 170,
        height: 62,
    },

    centerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },

    card: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 44,
        paddingVertical: 42,
        shadowColor: '#172554',
        shadowOpacity: 0.1,
        shadowRadius: 35,
        shadowOffset: {
            width: 0,
            height: 15,
        },
        elevation: 8,
    },

    badge: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 30,
        paddingHorizontal: 13,
        paddingVertical: 7,
        marginBottom: 20,
    },

    badgeDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#2563EB',
        marginRight: 7,
    },

    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#2563EB',
    },

    title: {
        fontSize: 30,
        lineHeight: 38,
        fontWeight: '700',
        color: '#172554',
        textAlign: 'center',
        marginBottom: 12,
    },

    description: {
        fontSize: 15,
        lineHeight: 23,
        color: '#667085',
        textAlign: 'center',
        maxWidth: 410,
        alignSelf: 'center',
        marginBottom: 32,
    },

    form: {
        width: '100%',
    },

    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#344054',
        marginBottom: 8,
    },

    phoneInputContainer: {
        height: 58,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },

    countryCode: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },

    flag: {
        fontSize: 18,
        marginRight: 6,
    },

    countryText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#344054',
    },

    divider: {
        width: 1,
        height: 28,
        backgroundColor: '#E4E7EC',
    },

    phoneInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 14,
        fontSize: 16,
        color: '#101828',
        outlineStyle: 'none' as any,
    },

    continueButton: {
        height: 58,
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: '#2563EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        elevation: 4,
    },

    continueButtonDisabled: {
        backgroundColor: '#AFC5F5',
        shadowOpacity: 0,
    },

    continueText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    continueArrow: {
        fontSize: 20,
        color: '#FFFFFF',
        marginLeft: 10,
        marginTop: -1,
    },

    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
    },

    lockIcon: {
        fontSize: 18,
        color: '#667085',
        marginRight: 7,
    },

    securityText: {
        fontSize: 12,
        lineHeight: 18,
        color: '#667085',
        textAlign: 'center',
        flexShrink: 1,
    },

    legalContainer: {
        alignItems: 'center',
        marginTop: 28,
        paddingTop: 22,
        borderTopWidth: 1,
        borderTopColor: '#F0F2F5',
    },

    legalText: {
        fontSize: 12,
        color: '#98A2B3',
        marginBottom: 6,
    },

    legalLinks: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    legalLink: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563EB',
    },

    legalSeparator: {
        fontSize: 14,
        color: '#98A2B3',
        marginHorizontal: 8,
    },

    footer: {
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },

    footerText: {
        fontSize: 11,
        color: '#98A2B3',
    },
});

