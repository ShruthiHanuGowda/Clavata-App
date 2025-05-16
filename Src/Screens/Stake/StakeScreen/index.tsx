import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {BottomSheet} from 'react-native-btr';
import Icon from 'react-native-vector-icons/Entypo';
import {Colors, fontsFamily} from '../../../Theme';
import {DTextInput} from '../../../Componants/Dinputs';
import {DButton} from '../../../Componants';
import {navigateBack, navigateTo} from '../../../utils/navigationService';
import images from '../../../Theme/images';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import styles from './styles';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useNftsForAddress} from '../../../hooks/useNftsForAddress';
import {useNFTStaking} from '../../../hooks/useNFTStaking';

// Interface for component props
interface StakeScreenProps {
  // You can add props here if needed
}

const StakeScreen: React.FC<StakeScreenProps> = () => {
  const {userDetails} = useAuth();
  const {
    nfts,
    isLoading: isNFTLoading,
    error,
    refresh,
  } = useNftsForAddress({
    account:
      userDetails?.denergyWallet ??
      '0x0000000000000000000000000000000000000000',
  });

  const {
    isLoading: isNFTStakingLoading,
    error: nftStakingError,
    delegateERC1155,
  } = useNFTStaking();

  const {setActiveNetwork} = useMagic();

  // State for dropdown visibility
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);

  // State for selected NFT
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  // console.log('🚀 ~ selectedNFT:', JSON.stringify(selectedNFT, null, 2));

  // State for amount input
  const [amount, setAmount] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('idle'); // 'idle', 'staking', 'success', 'failed'

  useEffect(() => {
    setActiveNetwork('denergy');
    refresh();
  }, []);

  // Handle NFT selection
  const handleSelectNFT = (nft: any): void => {
    setSelectedNFT(nft);
    setBottomSheetVisible(false);
  };

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

    setAmountError('');
    return true;
  };

  // Handle amount change
  const handleAmountChange = (value: string): void => {
    const isValid = validateAmount(value);

    if (isValid) {
      setAmount(value);
      setIsAmountValid(value !== '' && value !== '.');
    }
  };

  // Function to format contract address
  const formatContractAddress = address => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(
      address.length - 6,
    )}`;
  };

  const handleStakeSuccess = result => {
    console.log('Staking successful:', result);
    setTxHash(result.txHash);
    setTxStatus('success');

    // Show success alert
    Alert.alert(
      'Staking Successful',
      `Your NFT has been staked successfully!\n\nTransaction Hash: ${result.txHash.substring(
        0,
        10,
      )}...`,
      [{text: 'OK', onPress: () => console.log('OK')}],
    );
  };

  // Handle stake button press
  const handleStake = async () => {
    // Input validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to stake');
      return;
    }

    if (
      selectedNFT.marketData &&
      parseFloat(amount) > parseFloat(selectedNFT.marketData.quantity)
    ) {
      Alert.alert(
        'Insufficient Balance',
        `You can't stake more than you own (${selectedNFT.marketData.quantity})`,
      );
      return;
    }

    // Update status and start staking process
    setTxStatus('staking');

    try {
      // Call delegateERC1155 function from our hook
      // This function will handle approval checking and requesting internally
      await delegateERC1155(
        selectedNFT.contractAddress, // ERC1155 contract address
        selectedNFT.tokenId, // Token ID
        amount, // Amount to stake
        handleStakeSuccess, // Success callback
      );
    } catch (err) {
      console.error('Staking failed:', err);
      setTxStatus('failed');

      // Show error alert
      Alert.alert(
        'Staking Failed',
        `There was an error while staking: ${err.message}`,
        [{text: 'OK'}],
      );
    } finally {
      if (txStatus !== 'success') {
        setTxStatus('idle');
      }
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isNFTLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#008060" />
          <Text style={styles.loaderText}>Loading Collections...</Text>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Pressable
                onPress={() => navigateBack()}
                style={styles.iconContainer}>
                <Image source={images.back} style={{width: 20, height: 20}} />
              </Pressable>
              <Text style={styles.header}>Stake</Text>
            </View>

            {/* NFT Selection Dropdown */}
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setBottomSheetVisible(true)}>
              <Text style={styles.dropdownLabel}>
                {selectedNFT ? selectedNFT.name : 'Select NFT'}
              </Text>
              <Icon name="chevron-small-down" size={24} color="#333" />
            </TouchableOpacity>

            {/* NFT Details Display (non-interactive) */}
            <View
              style={[
                styles.dropdownContainer,
                !selectedNFT && styles.disabledDropdown,
                selectedNFT && styles.nftDetailsContainer,
              ]}>
              {selectedNFT ? (
                <View style={styles.nftDetailsContent}>
                  <Text style={styles.nftDetailTitle}>NFT Details:</Text>
                  <Text style={styles.nftDetailText}>
                    Token ID: {selectedNFT.tokenId}
                  </Text>
                  <Text style={styles.nftDetailText}>
                    Collection: {selectedNFT.collectionName}
                  </Text>
                  <Text style={styles.nftDetailText}>
                    Contract:{' '}
                    {formatContractAddress(selectedNFT.contractAddress)}
                  </Text>
                  <Text style={styles.nftDetailText}>
                    Quantity: {selectedNFT.marketData?.quantity || 'N/A'}
                  </Text>
                  <Text style={styles.nftDetailText}>
                    Location: {selectedNFT.location}
                  </Text>
                  <Text style={styles.nftDetailText}>
                    Created:{' '}
                    {new Date(selectedNFT.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ) : (
                <Text style={styles.dropdownLabel}>Please select an NFT</Text>
              )}
            </View>

            {/* Amount Input with validation */}
            <View>
              <DTextInput
                value={amount}
                setValue={handleAmountChange}
                setValid={setIsAmountValid}
                placeholder="Amount"
                keyboardType="decimal-pad"
                containerStyle={[
                  styles.dropdownContainer,
                  {padding: 4},
                  amountError ? styles.inputError : null,
                ]}
                editable={!!selectedNFT} // Disable if no NFT is selected
              />
              {amountError ? (
                <Text style={styles.errorText}>{amountError}</Text>
              ) : null}
              {!selectedNFT && !amountError && (
                <Text style={styles.errorText}>Please select an NFT </Text>
              )}
            </View>

            {/* Stake Button */}
            <DButton
              onPress={handleStake}
              loading={txStatus === 'staking' || isNFTStakingLoading}
              style={styles.stakeButton}
              disabled={
                !selectedNFT ||
                !isAmountValid ||
                txStatus === 'staking' ||
                isNFTStakingLoading
              }>
              <Text style={styles.stakeButtonText}>
                {txStatus === 'staking' ? 'Staking...' : 'Stake'}
              </Text>
            </DButton>

            {/* Bottom Sheet for NFT Selection */}
            <BottomSheet
              visible={bottomSheetVisible}
              onBackButtonPress={() => setBottomSheetVisible(false)}
              onBackdropPress={() => setBottomSheetVisible(false)}>
              <View style={styles.bottomSheetCard}>
                <View style={styles.bottomSheetHeader}>
                  <Text style={styles.bottomSheetTitle}>Select NFT</Text>
                  <TouchableOpacity
                    onPress={() => setBottomSheetVisible(false)}
                    style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.optionsContainer}>
                  {nfts && nfts.length > 0 ? (
                    nfts.map((nft: any, index: number) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.optionItem}
                        onPress={() => handleSelectNFT(nft)}>
                        <Text style={styles.optionText}>{nft.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noOptionsText}>No NFTs available</Text>
                  )}
                </ScrollView>
              </View>
            </BottomSheet>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StakeScreen;
