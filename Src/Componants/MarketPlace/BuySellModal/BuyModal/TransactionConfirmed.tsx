import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';

const TransactionConfirmed = ({txHash, onDismiss}) => {
  const openExplorer = () => {
    const url = `https://explorernew.denergytestnet.com/tx/${txHash}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Transaction Confirmed</Text>

      <TouchableOpacity onPress={openExplorer}>
        <Text style={styles.link}>View on Explorer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => onDismiss()}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  link: {
    color: '#1FC7D4',
    textDecorationLine: 'underline',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#008060',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default TransactionConfirmed;
