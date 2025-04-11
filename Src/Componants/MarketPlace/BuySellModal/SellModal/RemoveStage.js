import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

const RemoveStage = ({ continueToNextStage }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Remove from Market</Text>
            <Text style={styles.description}>
                Removing this NFT from the marketplace will return it to your wallet.
            </Text>
            <Text style={styles.subText}>Continue?</Text>

            <TouchableOpacity style={styles.button} onPress={continueToNextStage}>
                <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        maxWidth: 360,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    description: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
    },
    subText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#e74c3c',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
})

export default RemoveStage
