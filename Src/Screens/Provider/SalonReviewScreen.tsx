import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { Header, DButton } from '../../components';

export default function SalonReviewScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <Header headerTitle="Review Details" />

      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '600' }}>
          Review
        </Text>

        <Text style={{ marginTop: 15 }}>
          Review all entered information before submitting.
        </Text>
      </View>

      <DButton
        style={{ width: 220, alignSelf: 'center', marginBottom: 30 }}
        type="primary"
        onPress={() => navigation.navigate('SalonSuccess')}>
        <Text style={{ color: '#FFF', alignSelf: 'center' }}>Submit</Text>
      </DButton>
    </SafeAreaView>
  );
}