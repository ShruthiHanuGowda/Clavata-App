import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { useUser } from '../../../context/UserContext';
import secureStorage from '../../../utils/secureStorage';

export default function SalonProfileScreen() {
    const navigation = useNavigation();
    const { currentUser, setCurrentUser } = useUser();
    /**
     * ================================
     * LOGOUT
     * ================================
     */
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
                        await secureStorage.removeItem(
                            'isInfoDone',
                        );

                        setCurrentUser(null);

                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'root' }],
                        });
                    },
                },
            ],
        );
    };

    /**
     * ================================
     * SWITCH CUSTOMER / SALON MODE
     * ================================
     */
    const handleModeChange = (value: boolean) => {
        if (!currentUser) {
            return;
        }

        // Don't allow Salon Mode if salon is not approved
        if (
            value &&
            currentUser.providerStatus !== 'APPROVED'
        ) {
            Alert.alert(
                'Salon Not Approved',
                'Your salon must be approved before you can switch to Salon Mode.',
            );

            return;
        }

        setCurrentUser({
            ...currentUser,
            activeRole: value ? 'SALON' : 'CUSTOMER',
        });

        navigation.reset({
            index: 0,
            routes: [{ name: 'appScreens' }],
        });
    };

    /**
     * ================================
     * BUSINESS NAVIGATION
     * ================================
     */
    const handleBusinessNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'SalonInformation':
                navigation
                    .getParent()
                    ?.navigate('SalonInformation');
                break;

            case 'BusinessHours':
                navigation
                    .getParent()
                    ?.navigate('BusinessHoursScreen');
                break;

            case 'StaffManagement':
                 navigation.getParent()?.navigate('StaffManagementScreen');
                break;

            case 'ManageServices':
                navigation
                    .getParent()
                    ?.navigate('ManageServices');
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

    /**
     * ================================
     * ACCOUNT NAVIGATION
     * ================================
     */
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

    /**
     * ================================
     * SUPPORT NAVIGATION
     * ================================
     */
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {/* =================================
                    PROFILE HEADER
                ================================= */}

                <View style={styles.profileHeader}>
                    <Image
                        source={{
                            uri: 'https://i.pravatar.cc/150?img=12',
                        }}
                        style={styles.avatar}
                    />

                    <Text style={styles.profileName}>
                        {currentUser?.fullName ||
                            'User'}
                    </Text>

                    <Text style={styles.profileRole}>
                        Owner • Glow Beauty Salon
                    </Text>
                </View>

                {/* =================================
                    SWITCH MODE
                ================================= */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Switch Mode
                    </Text>

                    <View style={styles.switchRow}>
                        <Text style={styles.menuText}>
                            Salon Mode
                        </Text>

                        <Switch
                            value={
                                currentUser?.activeRole ===
                                'SALON'
                            }
                            onValueChange={
                                handleModeChange
                            }
                            trackColor={{
                                false: '#D1D5DB',
                                true: '#009D94',
                            }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    {/* Show button when user is in Customer Mode */}

                    {currentUser?.activeRole ===
                        'CUSTOMER' && (
                        <TouchableOpacity
                            style={
                                styles.switchButton
                            }
                            onPress={() =>
                                handleModeChange(true)
                            }
                        >
                            <Text
                                style={
                                    styles.switchButtonText
                                }
                            >
                                Switch to Salon Mode
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* =================================
                    BUSINESS
                ================================= */}

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
                        title="Payment Settings"
                        onPress={() =>
                            handleBusinessNavigation(
                                'PaymentSettings',
                            )
                        }
                    />
                </View>

                {/* =================================
                    ACCOUNT
                ================================= */}

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

                {/* =================================
                    SUPPORT
                ================================= */}

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

                {/* =================================
                    LOGOUT
                ================================= */}

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

/**
 * ============================================
 * MENU ITEM
 * ============================================
 */

function MenuItem({
    title,
    onPress,
}: {
    title: string;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            style={styles.menuRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.menuText}>
                {title}
            </Text>
            <Text style={styles.menuArrow}>
                ›
            </Text>
        </TouchableOpacity>
    );
}
