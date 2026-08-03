import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';


export default function Notifications() {
    const navigation = useNavigation();
    return (

        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                Notifications
            </Text>



            <View style={styles.card}>

                <Text style={styles.heading}>
                    Booking Confirmed 🎉
                </Text>

                <Text>
                    Shruthi Salon accepted your appointment.
                </Text>


            </View>



            <View style={styles.card}>

                <Text style={styles.heading}>
                    Offer Available 🎁
                </Text>

                <Text>
                    20% discount available.
                </Text>


            </View>



        </View>

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

    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginTop: 15
    },

    heading: {
        fontWeight: '700',
        fontSize: 17
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },


});