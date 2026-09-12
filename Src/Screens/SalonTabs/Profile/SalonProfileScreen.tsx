import React, {
    useCallback,
} from 'react';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
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
} from '../../../graphql/queries';

export default function SalonProfileScreen() {
    const navigation = useNavigation<any>();

    const {
        currentUser,
        setCurrentUser,
    } = useUser();

    // ============================================================
    // DYNAMIC USER / SALON DATA
    // ============================================================

    const ownerName =
        currentUser?.fullName?.trim() || 'User';

    const salonName =
        currentUser?.salonName?.trim() || 'Salon';

    const profileImageUrl =
        currentUser?.profileImageUrl?.trim() || null;

    const salonId =
        currentUser?.salonId ?? '';

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
    React.useEffect(() => {
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
        pendingChangeData
            ?.getPendingSalonProfileChange;

    const isProfileChangePending =
        pendingChange?.status === 'PENDING';

    // ============================================================
    // REFRESH PENDING STATUS WHEN PROFILE SCREEN GETS FOCUS
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
                                '========== PROVIDER LOGOUT =========='
                            );

                            // ------------------------------------------------
                            // 1. Remove authenticated session flag
                            // ------------------------------------------------

                            await secureStorage.removeItem(
                                'isAuthenticated',
                            );

                            console.log(
                                'isAuthenticated removed',
                            );

                            // ------------------------------------------------
                            // 2. RESET ROOT NAVIGATION FIRST
                            // ------------------------------------------------

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

                            // ------------------------------------------------
                            // 3. Clear current user AFTER navigation reset
                            // ------------------------------------------------

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
                '========================================',
            );

            console.log(
                '[SalonProfile] Checking pending salon profile change',
            );

            console.log(
                '[SalonProfile] salonId:',
                salonId,
            );

            console.log(
                '[SalonProfile] Calling refetchPendingChange...',
            );

            try {
                const result =
                    await refetchPendingChange();

                console.log(
                    '[SalonProfile] refetch completed',
                );

                console.log(
                    '[SalonProfile] Full query result:',
                    result,
                );

                console.log(
                    '[SalonProfile] Query data:',
                    result?.data,
                );

                console.log(
                    '[SalonProfile] Pending change:',
                    result?.data
                        ?.getPendingSalonProfileChange,
                );

                const latestPendingChange =
                    result?.data
                        ?.getPendingSalonProfileChange;

                const latestIsPending =
                    latestPendingChange?.status ===
                    'PENDING';

                console.log(
                    '[SalonProfile] Pending status:',
                    latestPendingChange?.status,
                );

                console.log(
                    '[SalonProfile] Is pending:',
                    latestIsPending,
                );

                if (latestIsPending) {
                    console.log(
                        '[SalonProfile] BLOCKING navigation - request is PENDING',
                    );

                    Alert.alert(
                        'Changes under review',
                        'Your salon profile changes are currently under review by the administrator. You cannot make or submit another change while this request is under review. You can edit your salon information again after the administrator approves or rejects it.',
                    );

                    return;
                }

                console.log(
                    '[SalonProfile] No pending request found.',
                );

                console.log(
                    '[SalonProfile] Navigating to SalonInformation',
                );

                navigation
                    .getParent()
                    ?.navigate('SalonInformation');
            } catch (error: any) {
                console.error(
                    '========================================',
                );

                console.error(
                    '[SalonProfile] FAILED TO CHECK PENDING CHANGE',
                );

                console.error(
                    '[SalonProfile] Error:',
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

                console.error(
                    '[SalonProfile] Error result:',
                    error?.result,
                );

                console.error(
                    '========================================',
                );

                Alert.alert(
                    'Unable to check status',
                    error?.message ||
                    'We could not verify whether your previous salon profile change is still under review. Please try again.',
                );

                return;
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
    // PROFILE IMAGE FALLBACK
    // ============================================================

    const renderProfileImage = () => {
        if (profileImageUrl) {
            return (
                <Image
                    source={{
                        uri: profileImageUrl,
                    }}
                    style={styles.avatar}
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
                    },
                ]}
            >
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: '600',
                    }}
                >
                    {ownerName
                        .charAt(0)
                        .toUpperCase()}
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
                    PROFILE HEADER
                ================================================== */}

                <View style={styles.profileHeader}>
                    {renderProfileImage()}

                    <Text style={styles.profileName}>
                        {ownerName}
                    </Text>

                    <Text style={styles.profileRole}>
                        Owner • {salonName}
                    </Text>
                </View>

                {/* ==================================================
                    BUSINESS
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Business
                    </Text>

                    <MenuItem
                        title="Salon Information"
                        onPress={() =>
                            handleBusinessNavigation(
                                'SalonInformation',
                            )
                        }
                        loading={
                            loadingPendingChange
                        }
                    />

                    <MenuItem
                        title="Business Hours"
                        onPress={() =>
                            handleBusinessNavigation(
                                'BusinessHours',
                            )
                        }
                    />

                    <MenuItem
                        title="Staff Management"
                        onPress={() =>
                            handleBusinessNavigation(
                                'StaffManagement',
                            )
                        }
                    />

                    <MenuItem
                        title="Manage Services"
                        onPress={() =>
                            handleBusinessNavigation(
                                'ManageServices',
                            )
                        }
                    />

                    <MenuItem
                        title="Offers"
                        onPress={() =>
                            handleBusinessNavigation(
                                'Offers',
                            )
                        }
                    />

                    <MenuItem
                        title="Payment Settings"
                        onPress={() =>
                            handleBusinessNavigation(
                                'PaymentSettings',
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
                        onPress={() =>
                            handleAccountNavigation(
                                'EditProfile',
                            )
                        }
                    />

                    <MenuItem
                        title="Notifications"
                        onPress={() =>
                            handleAccountNavigation(
                                'Notifications',
                            )
                        }
                    />

                    <MenuItem
                        title="Change Password"
                        onPress={() =>
                            handleAccountNavigation(
                                'ChangePassword',
                            )
                        }
                    />

                    <MenuItem
                        title="Language"
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
                        onPress={() =>
                            handleSupportNavigation(
                                'HelpCenter',
                            )
                        }
                    />

                    <MenuItem
                        title="Privacy Policy"
                        onPress={() =>
                            handleSupportNavigation(
                                'PrivacyPolicy',
                            )
                        }
                    />

                    <MenuItem
                        title="Terms & Conditions"
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
// MENU ITEM
// ================================================================

function MenuItem({
    title,
    onPress,
    loading = false,
}: {
    title: string;
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
            <Text style={styles.menuText}>
                {title}
            </Text>

            {loading ? (
                <ActivityIndicator
                    size="small"
                    color="#999"
                />
            ) : (
                <Text style={styles.menuArrow}>
                    ›
                </Text>
            )}
        </TouchableOpacity>
    );
}