import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { Header, DButton } from '../../components';

export default function SalonPendingVerificationScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Verification Pending" />

      <View style={styles.content}>
        <Text style={styles.icon}>⏳</Text>

        <Text style={styles.title}>
          Your application is under review
        </Text>

        <Text style={styles.description}>
          We've received your salon registration successfully.
        </Text>

        <Text style={styles.description}>
          Our team is verifying your business information and KYC documents.
        </Text>

        <Text style={styles.note}>
          You'll receive a notification once your salon is approved.
        </Text>
      </View>

      <DButton
        type="primary"
        style={styles.button}
        onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </DButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  icon: {
    fontSize: 70,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },

  description: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  note: {
    marginTop: 25,
    color: '#009D94',
    fontWeight: '600',
    textAlign: 'center',
  },

  button: {
    width: 220,
    alignSelf: 'center',
    marginBottom: 30,
  },

  buttonText: {
    color: '#FFF',
    alignSelf: 'center',
    fontWeight: '600',
  },
});