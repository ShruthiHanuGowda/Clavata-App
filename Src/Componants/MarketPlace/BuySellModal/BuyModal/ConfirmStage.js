import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'

const ConfirmStage = ({ isConfirming, handleConfirm }) => {
    return (
        <View>
            <Text style={styles.title}>Confirm Transaction</Text>
            <Text style={styles.subtitle}>Please confirm the transaction in your wallet</Text>

            {isConfirming ? (
                <ActivityIndicator size="large" color="#008060" style={{ marginVertical: 20 }} />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                    <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#008060',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
    },
})

export default ConfirmStage
