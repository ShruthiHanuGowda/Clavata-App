import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { Header, DButton } from '../../components';

export default function SalonSuccessScreen({ navigation }: any) {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
            <Header
                headerTitle="Success"
                hideBackIcon
            />

            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 24,
                }}>
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '700',
                        marginBottom: 20,
                    }}>
                    🎉 Success!
                </Text>

                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 16,
                        color: '#666',
                    }}>
                    Your salon registration has been submitted successfully.
                </Text>
            </View>

            <DButton
                style={{ width: 220, alignSelf: 'center', marginBottom: 30 }}
                type="primary"
                onPress={() =>
                    navigation.navigate('appScreens', {
                        screen: 'Home',
                    })
                }>
                <Text style={{ color: '#FFF', alignSelf: 'center' }}>
                    Go to Home
                </Text>
            </DButton>
        </SafeAreaView>
    );
}