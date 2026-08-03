import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';


export default function ProfileBookings() {
    const navigation = useNavigation();
    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
                My Bookings
            </Text>
            <View style={styles.card}>
                <Text style={styles.salon}>
                    Shruthi Salon
                </Text>
                <Text>
                    Hair Cut
                </Text>
                <Text>
                    03 Aug 2026 • 09:00 AM
                </Text>
                <View style={styles.status}>
                    <Text style={styles.statusText}>
                        Confirmed
                    </Text>
                </View>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>
                        View Details
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.card}>
                <Text style={styles.salon}>
                    Glow Beauty Studio
                </Text>
                <Text>
                    Facial
                </Text>
                <Text>
                    20 July 2026 • 05:00 PM
                </Text>
                <View style={styles.completed}>
                    <Text>
                        Completed
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        padding: 20
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15
    },
    salon: {
        fontSize: 18,
        fontWeight: '700'
    },
    status: {
        backgroundColor: '#DCFCE7',
        padding: 8,
        borderRadius: 20,
        marginTop: 10,
        alignSelf: 'flex-start'
    },
    statusText: {
        color: '#16A34A'
    },
    completed: {
        backgroundColor: '#E5E7EB',
        padding: 8,
        borderRadius: 20,
        marginTop: 10,
        alignSelf: 'flex-start'
    },
    button: {
        marginTop: 15,
        backgroundColor: '#009D94',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center'
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700'
    }
});