import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';
import {DTextInput} from '../../../Componants/Dinputs';
import {DButton} from '../../../Componants';
import {navigateBack, navigateTo} from '../../../utils/navigationService';
import images from '../../../Theme/images';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import styles from './styles';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useNFTStaking} from '../Hooks/useNFTStaking';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// Interface for component props
interface UnstakeScreenProps {
  route?: {
    params?: {
      stakingData?: any;
    };
  };
}

const UnstakeScreen: React.FC<UnstakeScreenProps> = ({route}) => {
  console.log('🚀 ~ route:', route?.params?.stakingData);
  const {userDetails} = useAuth();
  const {
    isLoading: isNFTStakingLoading,
    error: nftStakingError,
    undelegateERC1155,
  } = useNFTStaking();

  const {setActiveNetwork} = useMagic();

  // Get staking data from route params or use mock data
  const stakingData = route?.params?.stakingData || {
    id: '0xb74fdeef8fabf7364569aacff92305efda21470e-0x0d3ed95282c5fe5abdba32e79fbf7d50791b8699-2',
    stakeNumber: 'Token ID 2',
    validator: {
      name: 'Validator 2',
      description: '0xb18c23b0...',
    },
    stake: {
      nft: 1000,
      watt: 0,
    },
    startDate: '2025-05-18',
    rewards: 53,
    status: 'active',
    originalData: {
      tokenId: '2',
      amount: '1000',
      erc1155Contract: '0xb18c23b04e82ce8ba14597966e25f63343e346b7',
    },
  };

  // State for amount input
  const [amount, setAmount] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('idle'); // 'idle', 'unstaking', 'success', 'failed'

  useEffect(() => {
    setActiveNetwork('denergy');
  }, []);

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
      return true;
    }

    // Check if amount exceeds staked amount
    if (parseFloat(value) > stakingData.stake.nft) {
      setAmountError(
        `Cannot unstake more than staked amount (${stakingData.stake.nft})`,
      );
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
      setIsAmountValid(value !== '' && value !== '.' && !amountError);
    }
  };

  // Function to format contract address
  const formatContractAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(
      address.length - 6,
    )}`;
  };

  const handleUnstakeSuccess = (result: any) => {
    console.log('Unstaking successful:', result);
    setTxHash(result.txHash);
    setTxStatus('success');

    Alert.alert(
      'Unstaking Successful',
      `Your NFT has been unstaked successfully!\n\nTransaction Hash: ${result.txHash.substring(
        0,
        10,
      )}...`,
      [{text: 'OK', onPress: () => navigateBack()}],
    );
  };

  // Handle unstake button press
  const handleUnstake = async () => {
    // Input validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to unstake');
      return;
    }

    if (parseFloat(amount) > stakingData.stake.nft) {
      Alert.alert(
        'Invalid Amount',
        `You can't unstake more than you have staked (${stakingData.stake.nft})`,
      );
      return;
    }

    // Update status and start unstaking process
    setTxStatus('unstaking');

    try {
      await undelegateERC1155(
        stakingData.originalData.erc1155Contract,
        stakingData.originalData.tokenId,
        amount,
        handleUnstakeSuccess,
      );
    } catch (err) {
      console.error('Unstaking failed:', err);
      setTxStatus('failed');

      Alert.alert('Unstaking Failed', `Something went wrong while unstaking`, [
        {text: 'OK'},
      ]);
    } finally {
      if (txStatus !== 'success') {
        setTxStatus('idle');
      }
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Pressable
              onPress={() => navigateBack()}
              style={styles.iconContainer}>
              <Image source={images.back} style={{width: 20, height: 20}} />
            </Pressable>
            <Text style={styles.header}>Unstake NFT</Text>
          </View>

          <KeyboardAwareScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}>
            {/* Staking Information Display */}
            <View style={styles.stakingInfoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.stakingInfoTitle}>
                  Current Staking Details
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        stakingData.status === 'active' ? '#D4F5E9' : '#F5F5F5',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          stakingData.status === 'active' ? '#28A745' : '#666',
                      },
                    ]}>
                    {stakingData.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Highlighted Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stakingData.stake.nft}</Text>
                  <Text style={styles.statLabel}>Staked Amount</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.rewardsValue]}>
                    {stakingData.rewards}
                  </Text>
                  <Text style={styles.statLabel}>Rewards Earned</Text>
                </View>
              </View>

              {/* Details Section */}
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Details</Text>

                <View style={styles.detailItem}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>🏷️</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Token ID</Text>
                    <Text style={styles.detailValue}>
                      {stakingData.originalData.tokenId}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>⚡</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Validator</Text>
                    <Text style={styles.detailValue}>
                      {stakingData.validator.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📄</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Contract</Text>
                    <Text style={styles.detailValue}>
                      {formatContractAddress(
                        stakingData.originalData.erc1155Contract,
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📅</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Start Date</Text>
                    <Text style={styles.detailValue}>
                      {new Date(stakingData.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Amount to Unstake</Text>
              <DTextInput
                value={amount}
                setValue={handleAmountChange}
                setValid={setIsAmountValid}
                placeholder="Enter amount"
                keyboardType="decimal-pad"
                containerStyle={[
                  styles.amountInput,
                  amountError ? styles.inputError : null,
                ]}
              />
              {amountError ? (
                <Text style={styles.errorText}>{amountError}</Text>
              ) : (
                <Text style={styles.availableAmountText}>
                  Available to unstake: {stakingData.stake.nft}
                </Text>
              )}
            </View>

            {/* Unstake Button */}
            <DButton
              onPress={handleUnstake}
              loading={txStatus === 'unstaking' || isNFTStakingLoading}
              style={styles.unstakeButton}
              disabled={
                !isAmountValid ||
                txStatus === 'unstaking' ||
                isNFTStakingLoading ||
                !!amountError
              }>
              <Text style={styles.unstakeButtonText}>
                {txStatus === 'unstaking' ? 'Unstaking...' : 'Unstake'}
              </Text>
            </DButton>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UnstakeScreen;
