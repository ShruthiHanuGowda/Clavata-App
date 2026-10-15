import React, {
    useCallback,
    useEffect,
} from 'react';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    ImageBackground,
    Alert,
    ActivityIndicator,
} from 'react-native';

import {
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native';

import {
    useQuery,
} from '@apollo/client';

import styles from './styles';

import {
    useUser,
} from '../../../context/UserContext';

import secureStorage from '../../../utils/secureStorage';

import {
    navReset,
} from '../../../Navigation/NavigationFunctions';

import {
    GET_PENDING_SALON_PROFILE_CHANGE,
    GET_SALON,
} from '../../../graphql/queries';

export default function SalonProfileScreen() {
    const navigation = useNavigation<any>();

    const {
        currentUser,
        setCurrentUser,
    } = useUser();

    // ============================================================
    // SALON ID
    // ============================================================

    const salonId =
        currentUser?.salonId ?? '';

    // ============================================================
    // GET SALON DATA
    // ============================================================

    const {
        data: salonData,
        loading: loadingSalon,
        error: salonError,
        refetch: refetchSalon,
    } = useQuery(
        GET_SALON,
        {
            variables: {
                salonId,
            },
            skip: !salonId,
            fetchPolicy: 'network-only',
        },
    );

    // ============================================================
    // DYNAMIC SALON DATA
    // ============================================================

    const salon = salonData?.getSalon;

    const ownerName =
        salon?.ownerName?.trim() ||
        currentUser?.fullName?.trim() ||
        'User';

    const salonName =
        salon?.salonName?.trim() ||
        currentUser?.salonName?.trim() ||
        'Salon';

    const salonLogoUrl =
        salon?.logoUrl?.trim() ||
        salon?.logoMedia?.objectUrl?.trim() ||
        null;

    const salonCoverImageUrl =
        salon?.coverImageUrl?.trim() ||
        salon?.coverMedia?.objectUrl?.trim() ||
        null;

    // ============================================================
    // SALON DEBUG LOGGING
    // ============================================================

    useEffect(() => {
        console.log(
            '========================================',
        );

        console.log(
            '[SalonProfile] GET_SALON state',
        );

        console.log(
            '[SalonProfile] salonId:',
            salonId,
        );

        console.log(
            '[SalonProfile] loadingSalon:',
            loadingSalon,
        );

        console.log(
            '[SalonProfile] salonError:',
            salonError,
        );

        console.log(
            '[SalonProfile] salon data:',
            salon,
        );

        console.log(
            '[SalonProfile] salonName:',
            salon?.salonName,
        );

        console.log(
            '[SalonProfile] ownerName:',
            salon?.ownerName,
        );

        console.log(
            '[SalonProfile] logoUrl:',
            salon?.logoUrl,
        );

        console.log(
            '[SalonProfile] coverImageUrl:',
            salon?.coverImageUrl,
        );

        console.log(
            '[SalonProfile] logoMedia.objectUrl:',
            salon?.logoMedia?.objectUrl,
        );

        console.log(
            '[SalonProfile] coverMedia.objectUrl:',
            salon?.coverMedia?.objectUrl,
        );

        console.log(
            '========================================',
        );
    }, [
        salonId,
        loadingSalon,
        salonError,
        salon,
    ]);

    // ============================================================
    // REFRESH SALON DATA WHEN PROFILE GETS FOCUS
    // ============================================================

    useFocusEffect(
        useCallback(() => {
            if (!salonId) {
                return;
            }

            refetchSalon().catch(error => {
                console.error(
                    '[SalonProfile] Failed to refresh salon data:',
                    error,
                );
            });
        }, [
            salonId,
            refetchSalon,
        ]),
    );

    // ============================================================
    // PENDING SALON PROFILE CHANGE
    // ============================================================

    const {
        data: pendingChangeData,
        loading: loadingPendingChange,
        error: pendingChangeError,
        refetch: refetchPendingChange,
    } = useQuery(
        GET_PENDING_SALON_PROFILE_CHANGE,
        {
            variables: {
                salonId,
            },
            skip: !salonId,
            fetchPolicy: 'network-only',
        },
    );

    useEffect(() => {
        console.log(
            '[SalonProfile] Pending query state:',
            {
                salonId,
                loading: loadingPendingChange,
                data: pendingChangeData,
                error: pendingChangeError,
            },
        );

        if (pendingChangeError) {
            console.error(
                '[SalonProfile] Pending query GraphQL errors:',
                pendingChangeError.graphQLErrors,
            );

            console.error(
                '[SalonProfile] Pending query network error:',
                pendingChangeError.networkError,
            );
        }
    }, [
        salonId,
        loadingPendingChange,
        pendingChangeData,
        pendingChangeError,
    ]);

    const pendingChange =
        pendingChangeData?.getPendingSalonProfileChange;

    const isProfileChangePending =
        pendingChange?.status === 'PENDING';

    // ============================================================
    // REFRESH PENDING STATUS WHEN PROFILE GETS FOCUS
    // ============================================================

    useFocusEffect(
        useCallback(() => {
            if (!salonId) {
                return;
            }

            refetchPendingChange().catch(error => {
                console.error(
                    'Failed to refresh salon profile change status:',
                    error,
                );
            });
        }, [
            salonId,
            refetchPendingChange,
        ]),
    );

    // ============================================================
    // LOGOUT
    // ============================================================

    const onLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log(
                                '========== PROVIDER LOGOUT ==========',
                            );

                            await secureStorage.removeItem(
                                'isAuthenticated',
                            );

                            console.log(
                                'isAuthenticated removed',
                            );

                            navReset(
                                'LoginScreen',
                                {
                                    mode: 'SIGN_IN',
                                    hideBackButton: true,
                                },
                            );

                            console.log(
                                'Navigation reset to LoginScreen',
                            );

                            setCurrentUser(null);

                            console.log(
                                'Provider user context cleared',
                            );
                        } catch (error) {
                            console.error(
                                'Provider logout error:',
                                error,
                            );

                            Alert.alert(
                                'Logout failed',
                                'Unable to logout. Please try again.',
                            );
                        }
                    },
                },
            ],
        );
    };

    // ============================================================
    // SALON INFORMATION NAVIGATION
    // ============================================================

    const handleSalonInformationNavigation =
        useCallback(async () => {
            if (!salonId) {
                console.log(
                    '[SalonProfile] No salonId found:',
                    salonId,
                );

                Alert.alert(
                    'Salon not found',
                    'Your salon information could not be identified.',
                );

                return;
            }

            console.log(
                '[SalonProfile] Checking pending salon profile change',
                { salonId },
            );

            try {
                const result =
                    await refetchPendingChange();

                const latestPendingChange =
                    result?.data?.getPendingSalonProfileChange;

                const latestIsPending =
                    latestPendingChange?.status === 'PENDING';

                console.log(
                    '[SalonProfile] Latest pending status:',
                    latestPendingChange?.status,
                );

                if (latestIsPending) {
                    Alert.alert(
                        'Changes under review',
                        'Your salon profile changes are currently under review by the administrator. You cannot make or submit another change while this request is under review. You can edit your salon information again after the administrator approves or rejects it.',
                    );

                    return;
                }

                navigation
                    .getParent()
                    ?.navigate('SalonInformation');
            } catch (error: any) {
                console.error(
                    '[SalonProfile] Failed to check pending change:',
                    error,
                );

                console.error(
                    '[SalonProfile] Error message:',
                    error?.message,
                );

                console.error(
                    '[SalonProfile] GraphQL errors:',
                    error?.graphQLErrors,
                );

                console.error(
                    '[SalonProfile] Network error:',
                    error?.networkError,
                );

                Alert.alert(
                    'Unable to check status',
                    error?.message ||
                    'We could not verify whether your previous salon profile change is still under review. Please try again.',
                );
            }
        }, [
            salonId,
            refetchPendingChange,
            navigation,
        ]);

    // ============================================================
    // BUSINESS NAVIGATION
    // ============================================================

    const handleBusinessNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'SalonInformation':
                handleSalonInformationNavigation();
                break;

            case 'BusinessHours':
                navigation
                    .getParent()
                    ?.navigate('BusinessHoursScreen');
                break;

            case 'StaffManagement':
                navigation
                    .getParent()
                    ?.navigate('StaffManagementScreen');
                break;

            case 'ManageServices':
                navigation
                    .getParent()
                    ?.navigate('ManageServices');
                break;

            case 'Offers':
                navigation
                    .getParent()
                    ?.navigate('Offers');
                break;

            case 'PaymentSettings':
                navigation
                    .getParent()
                    ?.navigate('PaymentSettings');
                break;

            default:
                console.log(
                    'Unknown business screen:',
                    screen,
                );
                break;
        }
    };

    // ============================================================
    // GROW YOUR BUSINESS NAVIGATION
    // ============================================================

    const handleGrowthNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'ClavataBoost':
                navigation
                    .getParent()
                    ?.navigate('ClavataBoost');
                break;

            case 'ClavataAdvertise':
                navigation
                    .getParent()
                    ?.navigate('ClavataAdvertise');
                break;

            default:
                console.log(
                    'Unknown growth screen:',
                    screen,
                );
                break;
        }
    };

    // ============================================================
    // ACCOUNT NAVIGATION
    // ============================================================

    const handleAccountNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'EditProfile':
                navigation
                    .getParent()
                    ?.navigate('EditProfile');
                break;

            case 'Notifications':
                navigation
                    .getParent()
                    ?.navigate('Notifications');
                break;

            case 'ChangePassword':
                navigation
                    .getParent()
                    ?.navigate('ChangePassword');
                break;

            case 'Language':
                navigation
                    .getParent()
                    ?.navigate('Language');
                break;

            default:
                console.log(
                    'Unknown account screen:',
                    screen,
                );
                break;
        }
    };

    // ============================================================
    // SUPPORT NAVIGATION
    // ============================================================

    const handleSupportNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'HelpCenter':
                navigation
                    .getParent()
                    ?.navigate('HelpCenter');
                break;

            case 'PrivacyPolicy':
                navigation
                    .getParent()
                    ?.navigate('PrivacyPolicy');
                break;

            case 'TermsConditions':
                navigation
                    .getParent()
                    ?.navigate('TermsConditions');
                break;

            default:
                console.log(
                    'Unknown support screen:',
                    screen,
                );
                break;
        }
    };

    // ============================================================
    // SALON LOGO FALLBACK
    // ============================================================

    const renderSalonLogo = () => {
        if (salonLogoUrl) {
            return (
                <Image
                    source={{
                        uri: salonLogoUrl,
                    }}
                    style={styles.avatar}
                    resizeMode="cover"
                    onLoad={() => {
                        console.log(
                            '[SalonProfile] Salon logo loaded:',
                            salonLogoUrl,
                        );
                    }}
                    onError={error => {
                        console.error(
                            '[SalonProfile] Salon logo failed:',
                            error?.nativeEvent,
                        );
                    }}
                />
            );
        }

        return (
            <View
                style={[
                    styles.avatar,
                    {
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#E5E7EB',
                    },
                ]}
            >
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: '600',
                        color: '#6B5DD3',
                    }}
                >
                    {salonName.charAt(0).toUpperCase()}
                </Text>
            </View>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {/* ==================================================
                    SALON PROFILE HEADER
                ================================================== */}

                <ImageBackground
                    source={
                        salonCoverImageUrl
                            ? { uri: salonCoverImageUrl }
                            : undefined
                    }
                    style={[
                        styles.profileHeader,
                        {
                            overflow: 'hidden',
                            minHeight: 180,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        },
                    ]}
                    imageStyle={{
                        resizeMode: 'cover',
                    }}
                    onLoad={() => {
                        if (salonCoverImageUrl) {
                            console.log(
                                '[SalonProfile] Cover image loaded:',
                                salonCoverImageUrl,
                            );
                        }
                    }}
                    onError={error => {
                        console.error(
                            '[SalonProfile] Cover image failed:',
                            error?.nativeEvent,
                        );
                    }}
                >
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor:
                                'rgba(0,0,0,0.25)',
                        }}
                    />

                    <View
                        style={{
                            marginBottom: 12,
                            borderRadius: 60,
                            borderWidth: 3,
                            borderColor: '#FFFFFF',
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                        }}
                    >
                        {renderSalonLogo()}
                    </View>

                    <Text
                        style={[
                            styles.profileName,
                            {
                                color: '#FFFFFF',
                                textAlign: 'center',
                                textShadowColor:
                                    'rgba(0,0,0,0.5)',
                                textShadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                textShadowRadius: 3,
                            },
                        ]}
                    >
                        {salonName}
                    </Text>
                </ImageBackground>

                {/* ==================================================
                    BUSINESS ACCOUNT
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Business Account
                    </Text>

                    <MenuItem
                        title="Salon Information"
                        subtitle="Manage your salon details, address and profile"
                        onPress={() =>
                            handleBusinessNavigation(
                                'SalonInformation',
                            )
                        }
                        loading={loadingPendingChange}
                    />

                    <MenuItem
                        title="Business Hours"
                        subtitle="Set your regular opening and closing hours"
                        onPress={() =>
                            handleBusinessNavigation(
                                'BusinessHours',
                            )
                        }
                    />

                    <MenuItem
                        title="Offers & Discounts"
                        subtitle="Create promotions and manage discount offers"
                        onPress={() =>
                            handleBusinessNavigation(
                                'Offers',
                            )
                        }
                    />

                    <MenuItem
                        title="Payment Settings"
                        subtitle="Manage your available payment settings"
                        onPress={() =>
                            handleBusinessNavigation(
                                'PaymentSettings',
                            )
                        }
                    />
                </View>

                {/* ==================================================
                    GROW YOUR BUSINESS
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Grow Your Business
                    </Text>

                    <Text
                        style={{
                            fontSize: 12,
                            color: '#77738A',
                            lineHeight: 18,
                            marginTop: -4,
                            marginBottom: 10,
                        }}
                    >
                        Discover tools to promote your salon
                        and grow your presence on Clavata.
                    </Text>

                    <MenuItem
                        title="Clavata Boost"
                        subtitle="View subscription plans and manage your membership"
                        onPress={() =>
                            handleGrowthNavigation(
                                'ClavataBoost',
                            )
                        }
                    />

                    <MenuItem
                        title="Advertise on Clavata"
                        subtitle="Promote your salon and selected services"
                        onPress={() =>
                            handleGrowthNavigation(
                                'ClavataAdvertise',
                            )
                        }
                    />
                </View>

                {/* ==================================================
                    ACCOUNT
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Account
                    </Text>

                    <MenuItem
                        title="Edit Profile"
                        subtitle="Update your personal account details"
                        onPress={() =>
                            handleAccountNavigation(
                                'EditProfile',
                            )
                        }
                    />

                    <MenuItem
                        title="Notifications"
                        subtitle="Manage your notification preferences"
                        onPress={() =>
                            handleAccountNavigation(
                                'Notifications',
                            )
                        }
                    />

                    <MenuItem
                        title="Change Password"
                        subtitle="Update your account password"
                        onPress={() =>
                            handleAccountNavigation(
                                'ChangePassword',
                            )
                        }
                    />

                    <MenuItem
                        title="Language"
                        subtitle="Choose your preferred app language"
                        onPress={() =>
                            handleAccountNavigation(
                                'Language',
                            )
                        }
                    />
                </View>

                {/* ==================================================
                    SUPPORT
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Support
                    </Text>

                    <MenuItem
                        title="Help Center"
                        subtitle="Get help with Clavata and your account"
                        onPress={() =>
                            handleSupportNavigation(
                                'HelpCenter',
                            )
                        }
                    />

                    <MenuItem
                        title="Privacy Policy"
                        subtitle="Learn how your information is handled"
                        onPress={() =>
                            handleSupportNavigation(
                                'PrivacyPolicy',
                            )
                        }
                    />

                    <MenuItem
                        title="Terms & Conditions"
                        subtitle="Review the terms for using Clavata"
                        onPress={() =>
                            handleSupportNavigation(
                                'TermsConditions',
                            )
                        }
                    />
                </View>

                {/* ==================================================
                    LOGOUT
                ================================================== */}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ================================================================
// REUSABLE MENU ITEM WITH SUBTITLE
// ================================================================

function MenuItem({
    title,
    subtitle,
    onPress,
    loading = false,
}: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    loading?: boolean;
}) {
    return (
        <TouchableOpacity
            style={styles.menuRow}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={loading}
        >
            <View
                style={{
                    flex: 1,
                    paddingRight: 12,
                }}
            >
                <Text style={styles.menuText}>
                    {title}
                </Text>

                {subtitle ? (
                    <Text
                        style={{
                            fontSize: 12,
                            lineHeight: 17,
                            color: '#858196',
                            marginTop: 3,
                            marginBottom: 2,
                        }}
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            {loading ? (
                <ActivityIndicator
                    size="small"
                    color="#8B5CF6"
                />
            ) : (
                <Text style={styles.menuArrow}>
                    ›
                </Text>
            )}
        </TouchableOpacity>
    );
}
