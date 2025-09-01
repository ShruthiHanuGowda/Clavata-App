// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Pressable,
//   Image,
//   SafeAreaView,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {BottomSheet} from 'react-native-btr';
// import Icon from 'react-native-vector-icons/Entypo';
// import {Colors, fontsFamily} from '../../../Theme';
// import {DTextInput} from '../../../Componants/Dinputs';
// import {DButton} from '../../../Componants';
// import {navigateBack, navigateTo} from '../../../utils/navigationService';
// import images from '../../../Theme/images';
// import {useMagic} from '../../../../screens/Provider/MagicProvider';
// import styles from './styles';
// import {useAuth} from '../../../../screens/Provider/authProvider';
// import {useNftsForAddress} from '../../../hooks/useNftsForAddress';
// import {useNFTStaking} from '../Hooks/useNFTStaking';
// import {formatQuantityMWh} from '../../../utils';
// // Interface for component props
// interface StakeScreenProps {
//   // You can add props here if needed
// }

// const StakeScreen: React.FC<StakeScreenProps> = props => {
//   const validatorId = props?.route?.params?.validatorId;
//   const {userDetails} = useAuth();
//   const {
//     nfts,
//     isLoading: isNFTLoading,
//     error,
//     refresh,
//   } = useNftsForAddress({
//     account:
//       userDetails?.denergyWallet ??
//       '0x0000000000000000000000000000000000000000',
//   });

//   const {
//     isLoading: isNFTStakingLoading,
//     error: nftStakingError,
//     delegateERC1155,
//   } = useNFTStaking(validatorId);

//   const {setActiveNetwork} = useMagic();

//   // State for dropdown visibility
//   const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);

//   // State for selected NFT
//   const [selectedNFT, setSelectedNFT] = useState<any>(null);
//   console.log('🚀 ~ selectedNFT:', JSON.stringify(selectedNFT, null, 2));

//   // State for amount input
//   const [amount, setAmount] = useState<string>('');
//   const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
//   const [amountError, setAmountError] = useState<string>('');
//   const [txHash, setTxHash] = useState<string>('');
//   const [txStatus, setTxStatus] = useState<string>('idle'); // 'idle', 'staking', 'success', 'failed'

//   useEffect(() => {
//     setActiveNetwork('denergy');
//     refresh();
//   }, []);

//   // Handle NFT selection
//   const handleSelectNFT = (nft: any): void => {
//     setSelectedNFT(nft);
//     setBottomSheetVisible(false);
//   };

//   // Validate amount input
//   const validateAmount = (value: string): boolean => {
//     // Allow empty string (for clearing the input)
//     if (value === '') {
//       setAmountError('');
//       return true;
//     }

//     // Regex for valid number format (including decimals)
//     const regex = /^(\d*\.?\d*)$/;

//     if (!regex.test(value)) {
//       setAmountError('Please enter a valid number');
//       return false;
//     }

//     // Check if the input starts with multiple zeros
//     if (value.startsWith('00')) {
//       setAmountError('Invalid number format');
//       return false;
//     }

//     // Additional check for single "." input
//     if (value === '.') {
//       setAmountError('');
//       return true; // Allow single dot as it might be the start of a decimal
//     }

//     setAmountError('');
//     return true;
//   };

//   // Handle amount change
//   const handleAmountChange = (value: string): void => {
//     const isValid = validateAmount(value);

//     if (isValid) {
//       setAmount(value);
//       setIsAmountValid(value !== '' && value !== '.');
//     }
//   };

//   // Function to format contract address
//   const formatContractAddress = address => {
//     if (!address) return '';
//     return `${address.substring(0, 8)}...${address.substring(
//       address.length - 6,
//     )}`;
//   };

//   const handleStakeSuccess = result => {
//     console.log('Staking successful:', result);
//     setTxHash(result.txHash);
//     setTxStatus('success');

//     // Show success alert
//     Alert.alert(
//       'Staking Successful',
//       `Your NFT has been staked successfully!\n\nTransaction Hash: ${result.txHash.substring(
//         0,
//         10,
//       )}...`,
//       [{text: 'OK', onPress: () => console.log('OK')}],
//     );
//   };

//   // Handle stake button press
//   const handleStake = async () => {
//     // Input validation
//     if (!amount || parseFloat(amount) <= 0) {
//       Alert.alert('Invalid Amount', 'Please enter a valid amount to stake');
//       return;
//     }

//     if (
//       selectedNFT.marketData &&
//       parseFloat(amount) > parseFloat(selectedNFT.marketData.quantity)
//     ) {
//       Alert.alert(
//         'Insufficient Balance',
//         `You can't stake more than you own (${selectedNFT.marketData.quantity})`,
//       );
//       return;
//     }

//     // Update status and start staking process
//     setTxStatus('staking');

//     try {
//       // Call delegateERC1155 function from our hook
//       // This function will handle approval checking and requesting internally
//       await delegateERC1155(
//         selectedNFT.contractAddress, // ERC1155 contract address
//         selectedNFT.tokenId, // Token ID
//         amount, // Amount to stake
//         handleStakeSuccess, // Success callback
//       );
//     } catch (err) {
//       console.error('Staking failed:', err);
//       setTxStatus('failed');

//       // Show error alert
//       Alert.alert('Staking Failed', `Something went wrong while staking`, [
//         {text: 'OK'},
//       ]);
//     } finally {
//       if (txStatus !== 'success') {
//         setTxStatus('idle');
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={styles.mainContainer}>
//       {isNFTLoading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#008060" />
//           <Text style={styles.loaderText}>Loading Collections...</Text>
//         </View>
//       ) : (
//         <ScrollView style={styles.mainContainer}>
//           <View style={styles.container}>
//             <View style={styles.headerContainer}>
//               <Pressable
//                 onPress={() => navigateBack()}
//                 style={styles.iconContainer}>
//                 <Image source={images.back} style={{width: 20, height: 20}} />
//               </Pressable>
//               <Text style={styles.header}>Stake</Text>
//             </View>

//             {/* NFT Selection Dropdown */}
//             <TouchableOpacity
//               style={styles.dropdownContainer}
//               onPress={() => setBottomSheetVisible(true)}>
//               <Text style={styles.dropdownLabel}>
//                 {selectedNFT ? selectedNFT.name : 'Select NFT'}
//               </Text>
//               <Icon name="chevron-small-down" size={24} color="#333" />
//             </TouchableOpacity>

//             {/* NFT Details Display (non-interactive) */}
//             <View
//               style={[
//                 styles.dropdownContainer,
//                 !selectedNFT && styles.disabledDropdown,
//                 selectedNFT && styles.nftDetailsContainer,
//               ]}>
//               {selectedNFT ? (
//                 <View style={styles.nftDetailsContent}>
//                   <Text style={styles.nftDetailTitle}>NFT Details:</Text>
//                   <Text style={styles.nftDetailText}>
//                     Token ID: {selectedNFT.tokenId}
//                   </Text>
//                   <Text style={styles.nftDetailText}>
//                     Collection: {selectedNFT.collectionName}
//                   </Text>
//                   <Text style={styles.nftDetailText}>
//                     Contract:{' '}
//                     {formatContractAddress(selectedNFT.contractAddress)}
//                   </Text>
//                   <Text style={styles.nftDetailText}>
//                     Quantity:{' '}
//                     {formatQuantityMWh(selectedNFT.marketData?.quantity) ||
//                       'N/A'}
//                   </Text>
//                   <Text style={styles.nftDetailText}>
//                     Location: {selectedNFT.location}
//                   </Text>
//                   <Text style={styles.nftDetailText}>
//                     Created:{' '}
//                     {new Date(selectedNFT.createdAt).toLocaleDateString()}
//                   </Text>
//                 </View>
//               ) : (
//                 <Text style={styles.dropdownLabel}>Please select an NFT</Text>
//               )}
//             </View>

//             {/* Amount Input with validation */}
//             <View>
//               <DTextInput
//                 value={amount}
//                 setValue={handleAmountChange}
//                 setValid={setIsAmountValid}
//                 placeholder="Amount"
//                 keyboardType="decimal-pad"
//                 containerStyle={[
//                   styles.dropdownContainer,
//                   {padding: 4},
//                   amountError ? styles.inputError : null,
//                 ]}
//                 editable={!!selectedNFT} // Disable if no NFT is selected
//               />
//               {amountError ? (
//                 <Text style={styles.errorText}>{amountError}</Text>
//               ) : null}
//               {!selectedNFT && !amountError && (
//                 <Text style={styles.errorText}>Please select an NFT </Text>
//               )}
//             </View>

//             {/* Stake Button */}
//             <DButton
//               onPress={handleStake}
//               loading={txStatus === 'staking' || isNFTStakingLoading}
//               style={styles.stakeButton}
//               disabled={
//                 !selectedNFT ||
//                 !isAmountValid ||
//                 txStatus === 'staking' ||
//                 isNFTStakingLoading
//               }>
//               <Text style={styles.stakeButtonText}>
//                 {txStatus === 'staking' ? 'Staking...' : 'Stake'}
//               </Text>
//             </DButton>

//             {/* Bottom Sheet for NFT Selection */}
//             <BottomSheet
//               visible={bottomSheetVisible}
//               onBackButtonPress={() => setBottomSheetVisible(false)}
//               onBackdropPress={() => setBottomSheetVisible(false)}>
//               <View style={styles.bottomSheetCard}>
//                 <View style={styles.bottomSheetHeader}>
//                   <Text style={styles.bottomSheetTitle}>Select NFT</Text>
//                   <TouchableOpacity
//                     onPress={() => setBottomSheetVisible(false)}
//                     style={styles.closeButton}>
//                     <Text style={styles.closeText}>✕</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <ScrollView style={styles.optionsContainer}>
//                   {nfts && nfts.length > 0 ? (
//                     nfts.map((nft: any, index: number) => (
//                       <TouchableOpacity
//                         key={index}
//                         style={styles.optionItem}
//                         onPress={() => handleSelectNFT(nft)}>
//                         <Text style={styles.optionText}>{nft.name}</Text>
//                       </TouchableOpacity>
//                     ))
//                   ) : (
//                     <Text style={styles.noOptionsText}>No NFTs available</Text>
//                   )}
//                 </ScrollView>
//               </View>
//             </BottomSheet>
//           </View>
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// };

// export default StakeScreen;

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  SafeAreaView,
} from 'react-native';
import {Tab} from '@rneui/base';
import {Colors, fontsFamily} from '../../../Theme';
// import {navigateBack} from '../../../utils/navigationService';
// import images from '../../../Theme/images';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
// import styles from './styles';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useNftsForAddress} from '../../../hooks/useNftsForAddress';
import {useNFTStaking} from '../Hooks/useNFTStaking';
import {formatQuantityMWh} from '../../../utils';
import LoaderAnimation from '../../../Componants/Loading/LoaderAnimation';
import NFTStakeComponent from './NFTStakeComponent';
import WATTStakeComponent from './WATTStakeComponent';
// Interface for component props
interface StakeScreenProps {
  route?: {
    params?: {
      validatorId?: string;
    };
  };
}

interface FontFamily {
  MulishExtraBold: string;
  MulishBold: string;
  // Add other font properties as needed
}

const StakeScreen: React.FC<StakeScreenProps> = props => {
  const validatorId = props?.route?.params?.validatorId;
  const {userDetails} = useAuth();
  const {
    nfts,
    isLoading: isNFTLoading,
    error,
    refresh,
  } = useNftsForAddress({
    account:
      (userDetails?.userWallet as `0x${string}` | undefined | `0x${string}`) ??
      '0x0000000000000000000000000000000000000000',
  });

  const {
    isLoading: isNFTStakingLoading,
    error: nftStakingError,
    delegateERC1155,
  } = useNFTStaking(validatorId);

  const {setActiveNetwork} = useMagic();

  // State for tab management
  const [index, setIndex] = useState<number>(0);

  const TAB_ITEMS: readonly string[] = ['NFT Staking', 'WATT Staking'];

  // useEffect(() => {
  //   setActiveNetwork('denergy');
  // }, []);

  // Tab content components
  const NFTStakingContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      <NFTStakeComponent validatorId={validatorId} />
    </View>
  );

  const WATTStakingContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      <WATTStakeComponent validatorId={validatorId} />
    </View>
  );

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
      Alert.alert('Staking Failed', 'Something went wrong while staking', [
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
      {false ? (
        <View style={styles.loaderContainer}>
          {/* <ActivityIndicator size="large" color="#008060" />
          <Text style={styles.loaderText}>Loading Collections...</Text> */}
          <LoaderAnimation
            size="large"
            color="#008060"
            showText={true}
            text="Loading Collections..."
          />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            <Tab
              value={index}
              onChange={setIndex}
              variant="primary"
              indicatorStyle={{
                backgroundColor: 'transparent',
              }}
              style={{backgroundColor: 'transparent'}}>
              {TAB_ITEMS.map((tab, i) => (
                <Tab.Item
                  key={i}
                  containerStyle={(active: boolean) => ({
                    borderBottomColor: active ? '#009D94' : '#E1E1E1',
                    borderBottomWidth: active ? 2 : 1.4,
                    backgroundColor: 'transparent',
                  })}
                  title={tab}
                  titleStyle={(active: boolean) => ({
                    color: active ? '#000' : '#989898',
                    fontFamily: active
                      ? (fontsFamily as FontFamily).MulishExtraBold
                      : (fontsFamily as FontFamily).MulishBold,
                    fontSize: 14,
                  })}
                />
              ))}
            </Tab>
          </View>

          <View style={styles.contentContainer}>
            {index === 0 && <NFTStakingContent />}
            {index === 1 && <WATTStakingContent />}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  iconContainer: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  tabContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default StakeScreen;
