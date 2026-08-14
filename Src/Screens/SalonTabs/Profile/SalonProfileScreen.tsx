import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { useUser } from '../../../context/UserContext';
import secureStorage from '../../../utils/secureStorage';
import { navReset } from '../../../Navigation/NavigationFunctions';

export default function SalonProfileScreen() {
    const navigation = useNavigation();
    const { currentUser, setCurrentUser } = useUser();
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
