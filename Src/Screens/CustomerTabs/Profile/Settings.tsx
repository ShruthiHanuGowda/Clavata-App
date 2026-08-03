import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity
} from 'react-native';


export default function Settings() {
    const navigation = useNavigation();
    return (

        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>


            <Text style={styles.title}>
                Settings
            </Text>



            <View style={styles.row}>

                <Text style={styles.text}>
                    Dark Mode
                </Text>

                <Switch />

            </View>



            <View style={styles.row}>

                <Text style={styles.text}>
                    Language
                </Text>

                <Text>
                    English
                </Text>

            </View>



            <View style={styles.row}>

                <Text style={styles.text}>
                    Location Permission
                </Text>

                <Text>
                    Allowed
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

    row: {
        backgroundColor: '#fff',
        height: 60,
        paddingHorizontal: 20,
        marginTop: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    text: {
        fontSize: 16
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },

});