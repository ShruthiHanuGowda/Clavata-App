import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Colors, fontsFamily} from '../../../Theme';
import {DTextInput} from '../../../Componants/Dinputs';
import {DButton} from '../../../Componants';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
// Import your WATT staking hook here
// import {useWATTStaking} from '../Hooks/useWATTStaking';

interface WATTStakeComponentProps {
  validatorId: string;
}

const WATTStakeComponent: React.FC<WATTStakeComponentProps> = ({
  validatorId,
}) => {
  const {userDetails} = useAuth();
  const {setActiveNetwork} = useMagic();
  const {getBalance} = useWallet();

  // Uncomment when you have the WATT staking hook
  // const {
  //   isLoading: isWATTStakingLoading,
  //   error: wattStakingError,
  //   delegateWATT,
  //   getWATTBalance,
  // } = useWATTStaking(validatorId);

  // State for amount input
  const [amount, setAmount] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('idle'); // 'idle', 'staking', 'success', 'failed'
  const [wattBalance, setWattBalance] = useState<string>(
    getBalance('watt').balance,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setActiveNetwork('denergy');
    // Fetch WATT balance when component mounts
    // fetchWATTBalance();
  }, []);

  // Uncomment when you have the WATT balance fetching functionality
  // const fetchWATTBalance = async () => {
  //   try {
  //     if (userDetails?.denergyWallet) {
  //       const balance = await getWATTBalance(userDetails.denergyWallet);
  //       setWattBalance(balance);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching WATT balance:', error);
  //   }
  // };

  // Validate amount input
  const validateAmount = (value: string): boolean => {
    // Allow empty string (for clearing the input)
    if (value === '') {
      setAmountError('');
      return true;
    }

    // Regex for valid number format (including decimals)
    const regex = /^(\d*\.?\d*)$/;

    if (!regex.test(value)) {
      setAmountError('Please enter a valid number');
      return false;
    }

    // Check if the input starts with multiple zeros
    if (value.startsWith('00')) {
      setAmountError('Invalid number format');
      return false;
    }

    // Additional check for single "." input
    if (value === '.') {
      setAmountError('');
      return true; // Allow single dot as it might be the start of a decimal
    }

    // Check if amount exceeds available balance
    if (parseFloat(value) > parseFloat(wattBalance)) {
      setAmountError(`Insufficient balance. Available: ${wattBalance} WATT`);
      return false;
    }

    setAmountError('');
    return true;
  };

  // Handle amount change
  const handleAmountChange = (value: string): void => {
    const isValid = validateAmount(value);

    if (isValid) {
      setAmount(value);
      setIsAmountValid(value !== '' && value !== '.' && parseFloat(value) > 0);
    }
  };

  const handleStakeSuccess = result => {
    console.log('WATT Staking successful:', result);
    setTxHash(result.txHash);
    setTxStatus('success');

    // Show success alert
    Alert.alert(
      'WATT Staking Successful',
      `Your WATT has been staked successfully!\n\nTransaction Hash: ${result.txHash.substring(
        0,
        10,
      )}...`,
      [{text: 'OK', onPress: () => console.log('OK')}],
    );

    // Reset form
    setAmount('');
    setIsAmountValid(false);
    // fetchWATTBalance(); // Refresh balance
  };

  // Handle stake button press
  const handleStake = async () => {
    // Input validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to stake');
      return;
    }

    if (parseFloat(amount) > parseFloat(wattBalance)) {
      Alert.alert(
        'Insufficient Balance',
        `You can't stake more than you own (${wattBalance} WATT)`,
      );
      return;
    }

    // Update status and start staking process
    setTxStatus('staking');

    try {
      // Call delegateWATT function from your hook
      // Replace this with actual WATT staking logic
      // await delegateWATT(
      //   amount, // Amount to stake
      //   handleStakeSuccess, // Success callback
      // );

      // Temporary simulation - remove when implementing actual staking
      setTimeout(() => {
        handleStakeSuccess({
          txHash: '0x' + Math.random().toString(16).substring(2, 42),
        });
      }, 2000);
    } catch (err) {
      console.error('WATT Staking failed:', err);
      setTxStatus('failed');

      // Show error alert
      Alert.alert('WATT Staking Failed', `Something went wrong while staking`, [
        {text: 'OK'},
      ]);
    } finally {
      if (txStatus !== 'success') {
        setTxStatus('idle');
      }
    }
  };

  // Set max amount
  const handleMaxAmount = () => {
    setAmount(wattBalance);
    setIsAmountValid(parseFloat(wattBalance) > 0);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#008060" />
        <Text style={styles.loaderText}>Loading WATT Balance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainWrapper}>
      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={120}
        extraScrollHeight={120}
        keyboardOpeningTime={250}
        resetScrollToCoords={{x: 0, y: 0}}
        scrollEventThrottle={16}>
        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available WATT Balance</Text>
          <Text style={styles.balanceAmount}>{wattBalance} WATT</Text>
        </View>

        {/* Amount Input with validation */}
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Amount to Stake</Text>
            <Text style={styles.maxButton} onPress={handleMaxAmount}>
              MAX
            </Text>
          </View>

          <DTextInput
            value={amount}
            setValue={handleAmountChange}
            setValid={setIsAmountValid}
            placeholder="Enter WATT amount"
            keyboardType="decimal-pad"
            containerStyle={[
              styles.amountInput,
              amountError ? styles.inputError : null,
            ]}
            onFocus={() => {
              // Small delay to ensure keyboard is open before scrolling
              setTimeout(() => {
                // Additional scroll handling if needed
              }, 100);
            }}
          />

          {amountError ? (
            <Text style={styles.errorText}>{amountError}</Text>
          ) : null}
        </View>

        {/* Staking Information */}
        {/* <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Staking Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Validator ID:</Text>
            <Text style={styles.infoValue}>{validatorId || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Staking Type:</Text>
            <Text style={styles.infoValue}>WATT Token</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expected APY:</Text>
            <Text style={styles.infoValue}>~12%</Text>
          </View>
        </View> */}

        {/* Transaction Status */}
        {txStatus === 'success' && txHash && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✅ Staking Successful!</Text>
            <Text style={styles.txHashText}>
              TX: {txHash.substring(0, 10)}...
              {txHash.substring(txHash.length - 8)}
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Stake Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <DButton
          onPress={handleStake}
          loading={txStatus === 'staking'}
          style={[
            styles.stakeButton,
            (!isAmountValid || txStatus === 'staking') && styles.disabledButton,
          ]}
          disabled={!isAmountValid || txStatus === 'staking'}>
          <Text style={styles.stakeButtonText}>
            {txStatus === 'staking' ? 'Staking WATT...' : 'Stake WATT'}
          </Text>
        </DButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120, // Increased space for fixed button + keyboard
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  balanceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009D94',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  maxButton: {
    fontSize: 14,
    color: '#009D94',
    fontWeight: 'bold',
    padding: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: '#FFF',
    padding: 4,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 8,
    paddingLeft: 4,
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  stakeButton: {
    backgroundColor: '#009D94',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  stakeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  txHashText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default WATTStakeComponent;
