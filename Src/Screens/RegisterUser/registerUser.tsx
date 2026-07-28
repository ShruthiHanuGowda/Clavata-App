import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@apollo/client';

import { Header, DButton } from '../../components';
import { REGISTER_USER } from '../../graphql/queries';
import { useUser } from '../../context/UserContext';

export default function RegisterUser() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setCurrentUser } = useUser();

  const { phoneNumber } = route.params;

  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const onRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Please enter your full name.');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        'Terms & Conditions',
        'Please accept the Terms & Conditions to continue.',
      );
      return;
    }

    try {
      console.log('========== REGISTER USER ==========');
      console.log('Request:', {
        phoneNumber,
        fullName: fullName.trim(),
        acceptedTerms,
      });

      const { data } = await registerUser({
        variables: {
          input: {
            phoneNumber,
            fullName: fullName.trim(),
            acceptedTerms,
          },
        },
      });

      console.log('Response:', JSON.stringify(data, null, 2));

      if (!data?.registerUser?.success) {
        console.log('Registration Failed:', data?.registerUser);

        Alert.alert(
          'Registration Failed',
          data?.registerUser?.message || 'Something went wrong.',
        );
        return;
      }

      console.log('Registration Successful');

      setCurrentUser(data.registerUser.user);

      navigation.reset({
        index: 0,
        routes: [{ name: 'appScreens' }],
      });
    } catch (error: any) {
      console.log('========== REGISTER ERROR ==========');
      console.log('Message:', error?.message);
      console.log('GraphQL Errors:', error?.graphQLErrors);
      console.log('Network Error:', error?.networkError);
      console.log('Full Error:', JSON.stringify(error, null, 2));

      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Complete Registration" />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome 👋</Text>

        <Text style={styles.subtitle}>
          Let's create your account.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <Text style={styles.phone}>
          Verified Mobile: {phoneNumber}
        </Text>

        <Pressable
          style={styles.termsContainer}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View
            style={[
              styles.checkbox,
              acceptedTerms && styles.checkboxSelected,
            ]}
          >
            {acceptedTerms && <Text style={styles.tick}>✓</Text>}
          </View>

          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.link}>
              Terms & Conditions
            </Text>{' '}
            and{' '}
            <Text style={styles.link}>
              Privacy Policy
            </Text>
          </Text>
        </Pressable>

        <DButton
          type="primary"
          style={styles.button}
          disabled={loading}
          onPress={onRegister}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Continue'}
          </Text>
        </DButton>
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
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  phone: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#888',
    borderRadius: 5,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  tick: {
    color: '#fff',
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    color: '#444',
    lineHeight: 22,
  },
  link: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  button: {
    width: 220,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    alignSelf: 'center',
  },
});