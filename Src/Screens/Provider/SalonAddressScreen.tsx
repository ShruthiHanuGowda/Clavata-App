import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Header, DButton } from '../../components';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';

export default function SalonAddressScreen({ navigation }: any) {
  const { updateData } = useSalonRegistration();

  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const onNext = () => {
    if (
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      Alert.alert('Validation', 'Please fill all address details.');
      return;
    }

    updateData({
      addressLine,
      city,
      state,
      pincode,
    });

    navigation.navigate('SalonBusinessHours');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Salon Address" />

      <View style={styles.content}>
        <Text style={styles.title}>Address</Text>

        <Text style={styles.label}>Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={addressLine}
          onChangeText={setAddressLine}
        />

        <Text style={styles.label}>City</Text>

        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>State</Text>

        <TextInput
          style={styles.input}
          placeholder="State"
          value={state}
          onChangeText={setState}
        />

        <Text style={styles.label}>Pincode</Text>

        <TextInput
          style={styles.input}
          placeholder="Pincode"
          keyboardType="number-pad"
          value={pincode}
          onChangeText={setPincode}
        />
      </View>

      <DButton
        type="primary"
        style={styles.button}
        onPress={onNext}>
        <Text style={styles.buttonText}>Next</Text>
      </DButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  content: {
    flex: 1,
    padding: 24,
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
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
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
    fontSize: 16,
  },
});