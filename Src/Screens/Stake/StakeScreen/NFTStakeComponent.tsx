import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {BottomSheet} from 'react-native-btr';
import Icon from 'react-native-vector-icons/Entypo';
import {DTextInput} from '../../../Componants/Dinputs';
import {DButton} from '../../../Componants';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useNFTStaking} from '../Hooks/useNFTStaking';
import {formatQuantityMWh} from '../../../utils';
import {useNft} from '../../../../screens/Provider/NftProvider';
import LoaderAnimation from '../../../Componants/Loading/LoaderAnimation';

interface NFTStakeComponentProps {
  validatorId: string;
}

const NFTStakeComponent: React.FC<NFTStakeComponentProps> = ({validatorId}) => {
  const {nfts, isLoading, refresh} = useNft();

  const {isLoading: isNFTStakingLoading, delegateERC1155} =
    useNFTStaking(validatorId);

  const {setActiveNetwork, activeNetwork} = useMagic();

  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);

  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  const [amount, setAmount] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('idle');
  useEffect(() => {
    if (activeNetwork !== 'denergy') {
      setActiveNetwork('denergy');
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNetwork]);

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
  const formatContractAddress = (address: string) => {
    if (!address) {
      return '';
    }
    return `${address.substring(0, 8)}...${address.substring(
      address.length - 6,
    )}`;
  };

  const handleStakeSuccess = (result: any) => {
    console.log('NFT Staking successful:', result);

    setTxStatus('success');

    // Show success alert
    Alert.alert(
      'NFT Staking Successful',
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
      await delegateERC1155(
        selectedNFT.contractAddress || selectedNFT.collectionAddress,
        selectedNFT.tokenId, // Token ID
        amount, // Amount to stake
        handleStakeSuccess, // Success callback
      );
    } catch (err) {
      console.error('NFT Staking failed:', err);
      setTxStatus('failed');

      // Show error alert
      Alert.alert('NFT Staking Failed', 'Something went wrong while staking', [
        {text: 'OK'},
      ]);
    } finally {
      if (txStatus !== 'success') {
        setTxStatus('idle');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        {/* <ActivityIndicator size="large" color="#008060" />
        <Text style={styles.loaderText}>Loading NFT Collections...</Text> */}
        <LoaderAnimation
          color="#009D94"
          size={'large'}
          speed={1.5}
          showText
          text="Loading Certificates..."
        />
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
                Contract: {formatContractAddress(selectedNFT.contractAddress)}
              </Text>
              <Text style={styles.nftDetailText}>
                Quantity:{' '}
                {formatQuantityMWh(selectedNFT.marketData?.quantity) || 'N/A'}
              </Text>
              <Text style={styles.nftDetailText}>
                Location: {selectedNFT.location}
              </Text>
              <Text style={styles.nftDetailText}>
                Created: {new Date(selectedNFT.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.dropdownLabel}>Please select an NFT</Text>
          )}
        </View>

        {/* Amount Input with validation */}
        <View style={styles.inputWrapper}>
          <DTextInput
            value={amount}
            setValue={handleAmountChange}
            setValid={setIsAmountValid}
            placeholder="Amount"
            keyboardType="decimal-pad"
            containerStyle={[
              styles.dropdownContainer,
              styles.inputContainerPadding,
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
      </KeyboardAwareScrollView>

      {/* Stake Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <DButton
          onPress={handleStake}
          loading={txStatus === 'staking' || isNFTStakingLoading}
          style={[
            styles.stakeButton,
            (!selectedNFT ||
              !isAmountValid ||
              txStatus === 'staking' ||
              isNFTStakingLoading) &&
              styles.disabledButton,
          ]}
          disabled={
            !selectedNFT ||
            !isAmountValid ||
            txStatus === 'staking' ||
            isNFTStakingLoading
          }>
          <Text style={styles.stakeButtonText}>
            {txStatus === 'staking' ? 'Staking NFT...' : 'Stake NFT'}
          </Text>
        </DButton>
      </View>

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
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  disabledDropdown: {
    backgroundColor: '#F5F5F5',
  },
  nftDetailsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  nftDetailsContent: {
    width: '100%',
  },
  nftDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  nftDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputContainerPadding: {
    padding: 4,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    paddingLeft: 4,
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
  bottomSheetCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 400,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  noOptionsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
});

export default NFTStakeComponent;
