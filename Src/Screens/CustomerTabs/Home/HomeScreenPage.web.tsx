import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreenPage() {
    console.log('🔥 HOME SCREEN EXECUTING');

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'red',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
            }}
        >
            <Text
                style={{
                    fontSize: 60,
                    fontWeight: 'bold',
                    color: 'white',
                }}
            >
                HOME TEST
            </Text>
        </View>
    );
}