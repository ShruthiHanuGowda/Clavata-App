import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { Header, DButton } from '../../components';

export default function SalonAddressScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <Header headerTitle="Salon Address" />

      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '600' }}>
          Salon Address
        </Text>

        <Text style={{ marginTop: 15 }}>
          Address form goes here.
        </Text>
      </View>

      <DButton
        style={{ width: 220, alignSelf: 'center', marginBottom: 30 }}
        type="primary"
        onPress={() => navigation.navigate('SalonKYC')}>
        <Text style={{ color: '#FFF', alignSelf: 'center' }}>Next</Text>
      </DButton>
    </SafeAreaView>
  );
}