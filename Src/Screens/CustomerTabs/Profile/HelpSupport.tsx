import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';


export default function HelpSupport() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                Help & Support
            </Text>
            <TouchableOpacity style={styles.card}>
                <Text>
                    ❓ Frequently Asked Questions
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
                <Text>
                    💬 Chat with Support
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>

                <Text>
                    📞 Contact Us
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
        marginTop: 15
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },

});