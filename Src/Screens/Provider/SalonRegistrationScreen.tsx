import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Header, DButton } from '../../components';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';

export default function SalonRegistrationScreen({ navigation }: any) {
  const { updateData } = useSalonRegistration();

  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('');

  const onNext = () => {
    if (
      !salonName.trim() ||
      !ownerName.trim() ||
      !email.trim() ||
      !businessType.trim()
    ) {
      Alert.alert('Validation', 'Please fill all fields.');
      return;
    }

    updateData({
      // Replace these with logged in user values
      userId: 'e8a3b5f6-d501-48ff-9164-fea8e17317b4',
      phoneNumber: '7349140867',
      salonName,
      ownerName,
      email,
      businessType,
    });

    navigation.navigate('SalonAddress');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Salon Registration" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>Basic Salon Details</Text>

        <Text style={styles.label}>Salon Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter salon name"
          value={salonName}
          onChangeText={setSalonName}
        />

        <Text style={styles.label}>Owner Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter owner name"
          value={ownerName}
          onChangeText={setOwnerName}
        />

        <Text style={styles.label}>Business Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Business Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Salon / Spa / Barber"
          value={businessType}
          onChangeText={setBusinessType}
        />

        <DButton
          type="primary"
          style={styles.button}
          onPress={onNext}>
          <Text style={styles.buttonText}>Next</Text>
        </DButton>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 20,
  },

  button: {
    marginTop: 20,
    width: '100%',
    alignSelf: 'center',
  },

  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});