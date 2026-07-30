import React from 'react';

import {
    View,
    TextInput,
    StyleSheet,
} from 'react-native';

export default function SearchBar(props: any) {

    return (

        <View style={styles.box}>

            <TextInput

                {...props}

                placeholder="Search Hair Cut, Facial, Spa..."

            />

        </View>

    );

}

const styles = StyleSheet.create({

    box: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 55,
        justifyContent: 'center',
    }

});