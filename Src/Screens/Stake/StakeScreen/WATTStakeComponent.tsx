import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Colors, fontsFamily} from '../../../Theme';
import {DTextInput} from '../../../Componants/Dinputs';
import {DButton} from '../../../Componants';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import {useWATTStaking} from '../Hooks/useWATTStaking';
import {navigateTo} from '../../../utils/navigationService';

interface WATTStakeComponentProps {
  validatorId: string;
}

const WATTStakeComponent: React.FC<WATTStakeComponentProps> = ({
  validatorId,
}) => {
  const {userDetails} = useAuth();
  const {setActiveNetwork, activeNetwork} = useMagic();
  const {getBalance} = useWallet();

  const {
    isLoading: isWATTStakingLoading,
    error: wattStakingError,
    wattBalance,
    delegateWATT,
    getWATTBalance,
  } = useWATTStaking(validatorId);

  // State for amount input
  const [amount, setAmount] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('idle'); // 'idle', 'staking', 'success', 'failed'
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const initializeComponent = async () => {
      if (activeNetwork !== 'denergy') {
        await setActiveNetwork('denergy');
      }

      // Fetch latest WATT balance
      await getWATTBalance();
    };

    initializeComponent();
  }, [activeNetwork, setActiveNetwork, getWATTBalance]);

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
    console.log('Amount input changed:', value);

    const isValid = validateAmount(value);

    if (isValid) {
      setAmount(value);
      setIsAmountValid(value !== '' && value !== '.' && parseFloat(value) > 0);
    }
  };

  const handleStakeSuccess = (result: any) => {
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
      [{text: 'OK', onPress: () => navigateTo('Stake')}],
    );

    // Reset form
    setAmount('');
    setIsAmountValid(false);

    // Refresh balance after successful staking
    setTimeout(() => {
      getWATTBalance();
    }, 2000);
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
      await delegateWATT(amount, handleStakeSuccess);
    } catch (err: any) {
      console.error('WATT Staking failed:', err);
      setTxStatus('failed');

      // Show error alert
      Alert.alert(
        'WATT Staking Failed',
        `Something went wrong while staking: ${
          err?.message || 'Unknown error'
        }`,
        [{text: 'OK'}],
      );
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

  if (isLoading || isWATTStakingLoading) {
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
        {/* Error Display */}
        {wattStakingError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {wattStakingError}</Text>
          </View>
        )}

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
          />

          {amountError ? (
            <Text style={styles.errorText}>{amountError}</Text>
          ) : null}
        </View>

        {/* Staking Information */}
        <View style={styles.infoContainer}>
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
            <Text style={styles.infoLabel}>Network:</Text>
            <Text style={styles.infoValue}>Denergy</Text>
          </View>
        </View>

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

        {txStatus === 'failed' && (
          <View style={styles.failureContainer}>
            <Text style={styles.failureText}>❌ Staking Failed</Text>
            <Text style={styles.failureSubText}>Please try again</Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Stake Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <DButton
          onPress={handleStake}
          loading={txStatus === 'staking' || isWATTStakingLoading}
          style={[
            styles.stakeButton,
            (!isAmountValid ||
              txStatus === 'staking' ||
              isWATTStakingLoading ||
              parseFloat(wattBalance) <= 0) &&
              styles.disabledButton,
          ]}
          disabled={
            !isAmountValid ||
            txStatus === 'staking' ||
            isWATTStakingLoading ||
            parseFloat(wattBalance) <= 0
          }>
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
  errorContainer: {
    backgroundColor: '#FFE8E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
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
  failureContainer: {
    backgroundColor: '#FFE8E8',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  failureText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  failureSubText: {
    fontSize: 12,
    color: '#666',
  },
});

export default WATTStakeComponent;
