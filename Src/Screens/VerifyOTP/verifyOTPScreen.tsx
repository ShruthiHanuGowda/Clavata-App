import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/native';

import { VERIFY_OTP } from '../../graphql/queries';
import { DButton, Header } from '../../components';

export default function VerifyOTPScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [verifyOTP, { loading }] = useMutation(VERIFY_OTP);

  const onVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const { data } = await verifyOTP({
        variables: {
          phoneNumber,
          otp,
        },
      });

      console.log('Verify OTP Response:', data);

      if (!data?.verifyOTP.success) {
        Alert.alert('Verification Failed', data.verifyOTP.message);
        return;
      }

      if (data.verifyOTP.isExistingUser) {
        // Existing user
        navigation.reset({
          index: 0,
          routes: [{ name: 'appScreens' }],
        });
      } else {
        // New user
        navigation.navigate('RegisterUser', {
          phoneNumber,
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to verify OTP.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Verify OTP" />

      <View style={styles.content}>
        <Text style={styles.title}>Verify Mobile Number</Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to
        </Text>

        <Text style={styles.phone}>{phoneNumber}</Text>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="Enter OTP"
          style={styles.input}
        />

        <DButton
          style={styles.button}
          type="primary"
          disabled={loading || otp.length !== 6}
          onPress={onVerifyOTP}>
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </DButton>
        <Text style={styles.resendText}>
          Didn't receive the code?{' '}
          <Text style={styles.resendLink}>
            Resend OTP
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    // justifyContent: 'center',
  },
  resendText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },

  resendLink: {
    color: '#000000',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  phone: {
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 16,
    fontSize: 18,
  },
  button: {
    width: 220,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'center',
  },
});