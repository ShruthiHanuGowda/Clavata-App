import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppProvider } from './Src/providers';
import NavigationWrapper from './Src/Navigation';

export default function App() {
    return (
        <View style={styles.container}>
            <AppProvider>
                <NavigationWrapper />
            </AppProvider>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});