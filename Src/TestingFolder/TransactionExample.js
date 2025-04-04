import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Linking} from 'react-native';
import {useMagic} from '../../screens/Provider/MagicProvider';
import {BrowserProvider, formatUnits, parseUnits, JsonRpcProvider} from 'ethers';

const INFURA_URL = 'https://sepolia.infura.io/v3/60c88b9a394a48e8b459bcfa38dfaede';
const infuraProvider = new JsonRpcProvider(INFURA_URL);

const TransactionExample = () => {
  const {magic} = useMagic();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMetadata, setUserMetadata] = useState(null);
  const [balance, setBalance] = useState('0');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    to: '0x43971Ed032222246aB5D5E3c11bdB40c89e83959',
    amount: '0.000001', // Default amount in ETH
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  console.log('balance', balance);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        setIsLoggedIn(isLoggedIn);

        if (isLoggedIn) {
          // Get user info
          const userData = await magic.user.getInfo();
          setUserMetadata(userData);

          console.log('userData', JSON.stringify(userData));

          // Get user's balance
          await getBalance(userData.publicAddress);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUser();
  }, []);

  const getBalance = async (address) => {
    console.log('address', address);
    try {
      // Use Infura provider to get balance on Sepolia
      const balanceInWei = await infuraProvider.getBalance(address);
      const balanceInEth = formatUnits(balanceInWei, 18); // equivalent to formatEther in v6
      setBalance(balanceInEth);
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const initiateTransaction = (to, amount) => {
    setTransactionDetails({
      to,
      amount,
    });
    setShowConfirmation(true);
  };


  const sendTransaction = async () => {
    try {
      setIsLoading(true);
      setShowConfirmation(false);

      // Get Magic provider for signing transactions
      const magicProvider = new BrowserProvider(magic.rpcProvider);

      // Get signer from Magic
      const signer = await magicProvider.getSigner();
      const userAddress = userMetadata.publicAddress;

      // Convert amount to wei
      const amountInWei = parseUnits(transactionDetails.amount, 18);

      // Estimate gas price
      const gasPrice = await infuraProvider.getFeeData();

      // Estimate gas limit for the transaction
      const gasEstimate = await infuraProvider.estimateGas({
        from: userAddress,
        to: transactionDetails.to,
        value: amountInWei,
      });

      // Calculate total transaction cost (amount + gas fee)
      const gasCost = gasEstimate * gasPrice.gasPrice;
      const totalCost = amountInWei + gasCost;

      // Check if user has enough balance
      const balanceInWei = await infuraProvider.getBalance(userAddress);

      if (balanceInWei < totalCost) {
        throw new Error('Insufficient funds for gas and transaction amount');
      }

      console.log('Gas estimate:', formatUnits(gasEstimate, 0));
      console.log('Gas price:', formatUnits(gasPrice.gasPrice, 9), 'Gwei');
      console.log('Gas cost:', formatUnits(gasCost, 18), 'ETH');
      console.log('Total cost:', formatUnits(totalCost, 18), 'ETH');

      // Create transaction with explicit gas parameters
      const tx = await signer.sendTransaction({
        to: transactionDetails.to,
        value: amountInWei,
        gasLimit: gasEstimate,
        gasPrice: gasPrice.gasPrice,
        // Explicitly set parameters for Sepolia
        chainId: 11155111, // Sepolia chain ID
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Update UI with result
      setResult({
        success: true,
        txHash: receipt.hash,
        networkName: 'Sepolia Testnet',
        gasFee: formatUnits(gasCost, 18),
      });

      // Refresh balance
      await getBalance(userMetadata.publicAddress);
    } catch (error) {
      console.error('Transaction error:', error);
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <View>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.text}>Address: {userMetadata?.publicAddress}</Text>
          <Text style={styles.text}>Balance: {balance} ETH</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => initiateTransaction('0x43971Ed032222246aB5D5E3c11bdB40c89e83959', '0.0001')}
          >
            <Text style={styles.buttonText}>Send 0.0001 ETH</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                {result.success ? 'Transaction Successful!' : 'Transaction Failed'}
              </Text>
              {result.success ? (
                <>
                  <Text style={styles.text}>Transaction Hash: {result.txHash}</Text>
                  <Text style={styles.text}>Network: {result.networkName}</Text>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => Linking.openURL(`https://sepolia.etherscan.io/tx/${result.txHash}`)}
                  >
                    <Text style={styles.linkText}>View on Etherscan</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.errorText}>Error: {result.error}</Text>
              )}
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login with Magic</Text>
        </TouchableOpacity>
      )}

      {/* Transaction Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Transaction</Text>
            <Text style={styles.modalText}>
              You are about to send {transactionDetails.amount} ETH to:
            </Text>
            <Text style={styles.addressText}>{transactionDetails.to}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={sendTransaction}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0055FF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0055FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: 250,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: 250,
    alignItems: 'center',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: '#FF3B30',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 20,
    color: '#555',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: '100%',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#999',
    width: '48%',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    width: '48%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default TransactionExample;
