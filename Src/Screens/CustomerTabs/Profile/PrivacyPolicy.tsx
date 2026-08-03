import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';


export default function PrivacyPolicy() {
    const navigation = useNavigation();
    return (

        <ScrollView style={styles.container}>

            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                Privacy Policy
            </Text>


            <Text style={styles.text}>

                Your privacy is important to us.

                We collect only the information required
                to provide salon booking services.

                Your personal information is protected
                and will not be shared without permission.

                Payment information is securely processed
                through trusted payment providers.

            </Text>


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
        fontWeight: '700',
        marginBottom: 20
    },

    text: {
        fontSize: 16,
        lineHeight: 25,
        color: '#444'
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },

});