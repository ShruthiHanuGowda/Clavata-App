import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';


export default function SavedAddresses() {
    const navigation = useNavigation();
    return (

        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                Saved Addresses
            </Text>



            <View style={styles.card}>

                <Text style={styles.home}>
                    🏠 Home
                </Text>

                <Text>
                    Bangalore, Karnataka
                </Text>


            </View>



            <TouchableOpacity style={styles.button}>

                <Text style={styles.buttonText}>
                    + Add New Address
                </Text>

            </TouchableOpacity>



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
        marginTop: 20
    },

    home: {
        fontSize: 18,
        fontWeight: '700'
    },

    button: {
        marginTop: 20,
        backgroundColor: '#009D94',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center'
    },

    buttonText: {
        color: '#fff',
        fontWeight: '700'
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },

});