import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Header } from '../../components';

export default function SalonDashboardScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Header headerTitle="Salon Dashboard" />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.welcome}>
                    Welcome 👋
                </Text>

                <Text style={styles.subtitle}>
                    Manage your salon from one place.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.number}>12</Text>
                    <Text style={styles.label}>Today's Bookings</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.number}>5</Text>
                    <Text style={styles.label}>Staff Members</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.number}>₹8,450</Text>
                    <Text style={styles.label}>Today's Earnings</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.number}>4.9 ⭐</Text>
                    <Text style={styles.label}>Average Rating</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA'
    },

    content: {
        padding: 20
    },

    welcome: {
        fontSize: 26,
        fontWeight: '700'
    },

    subtitle: {
        marginTop: 6,
        color: '#666',
        marginBottom: 25
    },

    card: {
        backgroundColor: '#FFF',
        padding: 22,
        borderRadius: 12,
        marginBottom: 16
    },

    number: {
        fontSize: 30,
        color: '#009D94',
        fontWeight: '700'
    },

    label: {
        marginTop: 8,
        color: '#666'
    }
});