import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from 'react-native';


export default function Payments() {
    const navigation = useNavigation();
    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                Payments
            </Text>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceTitle}>
                    Wallet Balance
                </Text>
                <Text style={styles.amount}>
                    ₹0
                </Text>
            </View>
            <Text style={styles.sectionTitle}>
                Payment History
            </Text>
            <View style={styles.card}>
                <Text style={styles.name}>
                    Shruthi Salon
                </Text>
                <Text>
                    Hair Cut
                </Text>
                <Text>
                    03 Aug 2026
                </Text>
                <Text style={styles.success}>
                    ₹25 Paid Successfully
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.name}>
                    Glow Beauty
                </Text>
                <Text>
                    Facial
                </Text>
                <Text>
                    20 July 2026
                </Text>
                <Text style={styles.success}>
                    ₹100 Paid Successfully
                </Text>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        padding: 20
    },

    title: {
        fontSize: 28,
        fontWeight: '700'
    },


    balanceCard: {
        backgroundColor: '#009D94',
        padding: 25,
        borderRadius: 20,
        marginTop: 20
    },

    balanceTitle: {
        color: '#fff',
        fontSize: 16
    },

    amount: {
        color: '#fff',
        fontSize: 35,
        fontWeight: '700'
    },


    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 25
    },


    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginTop: 15
    },

    name: {
        fontSize: 18,
        fontWeight: '700'
    },

    success: {
        color: '#16A34A',
        fontWeight: '700',
        marginTop: 10
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },

});