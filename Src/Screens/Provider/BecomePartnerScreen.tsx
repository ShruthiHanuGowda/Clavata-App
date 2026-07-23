import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Header';

const BecomePartnerScreen = ({ navigation }: any) => {
  const handleContinue = () => {
    navigation.navigate('SalonRegistration');
  };

  return (
    <SafeAreaView style={styles.container}>
        <Header headerTitle="Become a Partner" />
      <View style={styles.content}>
        {/* <Text style={styles.title}>Become a Partner</Text> */}
        <Text style={styles.subtitle}>
          Register your salon on our platform and start receiving bookings from
          nearby customers.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why join us?</Text>

          <Text style={styles.item}>✓ Reach more customers</Text>
          <Text style={styles.item}>✓ Manage appointments easily</Text>
          <Text style={styles.item}>✓ Increase your business revenue</Text>
          <Text style={styles.item}>✓ Secure online payments</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default BecomePartnerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    padding: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  item: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  button: {
    margin: 24,
    height: 54,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});