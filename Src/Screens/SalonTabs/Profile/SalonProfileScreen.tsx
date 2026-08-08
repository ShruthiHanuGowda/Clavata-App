import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Switch,
} from 'react-native';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useUser } from '../../../context/UserContext';
import secureStorage from '../../../utils/secureStorage';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    // const [salonMode, setSalonMode] = React.useState(true);
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
                        setCurrentUser(null);

                        await secureStorage.removeItem('isInfoDone');
                        // or await secureStorage.setItem('isInfoDone', 'false');

                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'root' }],
                        });
                    },
                },
            ],
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.profileHeader}>
                    <Image
                        source={{
                            uri: 'https://i.pravatar.cc/150?img=12',
                        }}
                        style={styles.avatar}
                    />

                    <Text style={styles.profileName}>
                        Shruthi
                    </Text>

                    <Text style={styles.profileRole}>
                        Owner • Glow Beauty Salon
                    </Text>
                </View>

                {/* Switch Mode */}
                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Switch Mode
                    </Text>

                    <View style={styles.switchRow}>
                        <Text style={styles.menuText}>
                            Salon Mode
                        </Text>

                        {/* <Switch
                            value={salonMode}
                            onValueChange={setSalonMode}
                            trackColor={{
                                false: '#D1D5DB',
                                true: '#009D94',
                            }}
                        /> */}
                        <Switch
                            value={currentUser?.activeRole === 'SALON'}
                            onValueChange={(value) => {
                                if (!currentUser) {
                                    return;
                                }

                                setCurrentUser({
                                    ...currentUser,
                                    activeRole: value ? 'SALON' : 'CUSTOMER',
                                });

                                if (value) {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'appScreens' }],
                                    });
                                } else {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'appScreens' }],
                                    });
                                }
                            }}
                            trackColor={{
                                false: '#D1D5DB',
                                true: '#009D94',
                            }}
                        />
                    </View>

                    {currentUser?.activeRole === 'CUSTOMER' && (
                        <TouchableOpacity style={styles.switchButton}>
                            <Text style={styles.switchButtonText}>
                                Customer Mode
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Business */}
                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Business
                    </Text>

                    <MenuItem title="Salon Information" />
                    <MenuItem title="Business Hours" />
                    <MenuItem
                        title="Staff Managements"
                        onPress={() => {
                            navigation.getParent()?.navigate('StaffManagement');
                        }}
                    />
                    <MenuItem title="Manage Services" />
                    <MenuItem title="Payment Settings" />
                </View>

                {/* Account */}
                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Account
                    </Text>

                    <MenuItem title="Edit Profile" />
                    <MenuItem title="Notifications" />
                    <MenuItem title="Change Password" />
                    <MenuItem title="Language" />
                </View>

                {/* Support */}
                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Support
                    </Text>

                    <MenuItem title="Help Center" />
                    <MenuItem title="Privacy Policy" />
                    <MenuItem title="Terms & Conditions" />
                </View>

                <TouchableOpacity
                    style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

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
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Text style={styles.menuText}>
                {title}
            </Text>

            <Text style={styles.menuArrow}>
                ›
            </Text>
        </TouchableOpacity>
    );
}