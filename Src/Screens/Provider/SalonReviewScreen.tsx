import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Alert,
} from 'react-native';
import { useMutation } from '@apollo/client';

import { Header, DButton } from '../../components';
import { REGISTER_SALON_PARTNER } from '../../graphql/queries';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';
import { useUser } from '../../context/UserContext';

export default function SalonReviewScreen({ navigation }: any) {
  const { data, reset } = useSalonRegistration();
  const { currentUser, setCurrentUser } = useUser();
  console.log("Salon Registration Datas");
  console.log(data);
  const [registerSalonPartner, { loading }] =
    useMutation(REGISTER_SALON_PARTNER);

  const onSubmit = async () => {
    try {
      // const address = `${data.addressLine}, ${data.city}, ${data.state} - ${data.pincode}`;
      const response = await registerSalonPartner({
        variables: {
          input: {
            userId: data.userId,
            phoneNumber: data.phoneNumber,
            salonName: data.salonName,
            ownerName: data.ownerName,
            email: data.email,
            businessType: data.businessType,
            address: {
              addressLine: data.addressLine,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
            },
            businessHours: data.businessHours,
            gstNumber: data.gstNumber,
            panNumber: data.panNumber,
            aadhaarNumber: data.aadhaarNumber,
            bankAccount: data.bankAccount,
            ifsc: data.ifsc,
          },
        },
      });
      if (response.data?.registerSalonPartner?.success) {

        const salonId =
          response.data.registerSalonPartner.salonId;

        if (!currentUser) {
          Alert.alert(
            'Error',
            'User session expired. Please login again.'
          );
          return;
        }

        setCurrentUser({
          ...currentUser,
          roles: {
            ...currentUser.roles,
            businessPartner: true,
          },
          providerStatus: "PENDING",
          salonId,
        });
        reset();

        navigation.replace('SalonSuccess');
      } else {
        Alert.alert(
          'Error',
          response.data?.registerSalonPartner?.message ??
          'Unable to register salon.'
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ?? 'Something went wrong.'
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <Header headerTitle="Review Details" />

      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>
          Review Details
        </Text>

        <Text style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: '600' }}>Salon:</Text> {data.salonName}
        </Text>

        <Text style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: '600' }}>Address:</Text>{' '}
          {data.addressLine}, {data.city}, {data.state} - {data.pincode}
        </Text>

        <Text style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: '600' }}>GST:</Text> {data.gstNumber || '-'}
        </Text>

        <Text style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: '600' }}>PAN:</Text> {data.panNumber}
        </Text>

        <Text style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: '600' }}>Aadhaar:</Text> {data.aadhaarNumber}
        </Text>

        <Text style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: '600' }}>Bank:</Text> {data.bankAccount}
        </Text>

        <Text style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: '600' }}>IFSC:</Text> {data.ifsc}
        </Text>
      </View>

      <DButton
        style={{
          width: 220,
          alignSelf: 'center',
          marginBottom: 30,
        }}
        type="primary"
        onPress={onSubmit}
        disabled={loading}
      >
        <Text
          style={{
            color: '#FFF',
            alignSelf: 'center',
          }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Text>
      </DButton>
    </SafeAreaView>
  );
}