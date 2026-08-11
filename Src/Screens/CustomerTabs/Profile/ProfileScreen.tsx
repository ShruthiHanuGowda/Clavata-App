import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../context/UserContext';
import { Alert } from 'react-native';
import secureStorage from '../../../utils/secureStorage';
const menuItems = [
  { title: 'My Bookings', icon: '📅', screen: 'ProfileBookings' },
  { title: 'Favourite Salons', icon: '❤️', screen: 'FavouriteSalons' },
  { title: 'Saved Addresses', icon: '📍', screen: 'SavedAddresses' },
  { title: 'Payments', icon: '💳', screen: 'Payments' },
  { title: 'Offers & Rewards', icon: '🎁', screen: 'OffersRewards' },
];
const settingsItems = [
  { title: 'Settings', icon: '⚙️', screen: 'Settings' },
  { title: 'Notifications', icon: '🔔', screen: 'Notifications' },
  { title: 'Help & Support', icon: '❓', screen: 'HelpSupport' },
  { title: 'Privacy Policy', icon: '📄', screen: 'PrivacyPolicy' },
];
export default function ProfileScreen() {
  // Replace with actual value from API
  // const isSalonOwner = true;
  const navigation = useNavigation<any>();
  const isBusinessPartner = false;
  const { currentUser, setCurrentUser } = useUser();
  console.log('currentUser?.providerStatus', currentUser?.providerStatus);
  const partnerTitle = (() => {
    switch (currentUser?.providerStatus) {
      case 'NOT_REGISTERED':
        return 'Become a Salon Partner';
      case 'PENDING':
        return 'Salon Verification Pending';
      case 'APPROVED':
        return 'Switch to Salon Mode';
      case 'REJECTED':
        return 'Resubmit Salon Registration';
      default:
        return 'Become a Salon Partner';
    }
  })();
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
            await secureStorage.removeItem('isInfoDone');
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
  const onPartnerPress = () => {
    switch (currentUser?.providerStatus) {
      case 'NOT_REGISTERED':
        navigation.navigate('BecomePartner', {
          screen: 'BecomePartner',
        });
        break;
      case 'PENDING':
        navigation.navigate('BecomePartner', {
          screen: 'SalonPendingVerification',
        });
        break;
      case 'APPROVED':
        setCurrentUser({
          ...currentUser,
          activeRole: 'SALON',
        });
        console.log('Switching to SALON');
        break;
      case 'REJECTED':
        navigation.navigate('BecomePartner', {
          screen: 'RejectedScreen',
        });
        break;
      default:
        navigation.navigate('BecomePartner', {
          screen: 'BecomePartner',
        });
        break;
    }
  };

  const handleProfileNavigation = (item: any) => {
    switch (item.screen) {
      case 'ProfileBookings':
        navigation.navigate('ProfileBookings');
        break;
      case 'FavouriteSalons':
        navigation.navigate('FavouriteSalons');
        break;
      case 'SavedAddresses':
        navigation.navigate('SavedAddresses');
        break;
      case 'Payments':
        navigation.navigate('Payments');
        break;
      case 'OffersRewards':
        navigation.navigate('OffersRewards');
        break;
      case 'Settings':
        navigation.navigate('Settings');
        break;
      case 'Notifications':
        navigation.navigate('Notifications');
        break;
      case 'HelpSupport':
        navigation.navigate('HelpSupport');
        break;
      case 'PrivacyPolicy':
        navigation.navigate('PrivacyPolicy');
        break;
      default:
        break;
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <Text style={styles.name}>Shruthi</Text>
          <Text style={styles.phone}>+91 9876543210</Text>
          <View style={styles.roleBadge}>
            <Text>{currentUser?.activeRole === 'SALON' ? 'Salon' : 'Customer'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        {/* Customer Features */}
        <View style={styles.section}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.title} style={styles.row} onPress={() => handleProfileNavigation(item)}>
              <Text style={styles.leftIcon}>{item.icon}</Text>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Salon */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={onPartnerPress}>
            <Text style={styles.leftIcon}>🏪</Text>
            <Text style={styles.rowTitle}>
              {/* {isBusinessPartner
                ? 'Manage My Salon'
                : 'Become a Salon Partner'} */}
              {partnerTitle}
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
        {/* Settings */}
        <View style={styles.section}>
          {settingsItems.map(item => (
            <TouchableOpacity key={item.title} style={styles.row} onPress={() => handleProfileNavigation(item)}>
              <Text style={styles.leftIcon}>{item.icon}</Text>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#009D94';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  name: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  phone: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 15,
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: '#E8F8F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: PRIMARY,
    fontWeight: '600',
  },
  editButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  editButtonText: {
    color: PRIMARY,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leftIcon: {
    fontSize: 20,
    width: 34,
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  arrow: {
    fontSize: 22,
    color: '#BDBDBD',
  },
  logoutButton: {
    backgroundColor: '#fff',
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#E53935',
    fontWeight: '700',
    fontSize: 16,
  },
});