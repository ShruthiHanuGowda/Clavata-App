import React, {useState} from 'react';
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
} from 'react-native';
import {BottomSheet} from 'react-native-btr';
import Icon from 'react-native-vector-icons/Entypo';
import {Colors, fontsFamily} from '../../Theme';
import {DTextInput} from '../../Componants/Dinputs';
import {DButton} from '../../Componants';
import {navigateBack, navigateTo} from '../../utils/navigationService';
import images from '../../Theme/images';

// Define option type
type OptionType = 'nft' | 'token';

// Interface for component props
interface StakeScreenProps {
  // You can add props here if needed
}

const StakeScreen: React.FC<StakeScreenProps> = () => {
  // State for dropdown visibility
  const [nftCollectionOpen, setNftCollectionOpen] = useState<boolean>(false);
  const [tokenIdOpen, setTokenIdOpen] = useState<boolean>(false);

  // State for selected values
  const [selectedNftCollection, setSelectedNftCollection] =
    useState<string>('');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  // State for bottom sheet visibility
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [optionType, setOptionType] = useState<OptionType>('nft');

  // Options for dropdowns
  const nftOptions: string[] = [
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Option 5',
  ];

  const tokenOptions: string[] = [
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Option 5',
  ];

  // Handle dropdown selection
  const handleSelectOption = (option: string): void => {
    if (optionType === 'nft') {
      setSelectedNftCollection(option);
    } else {
      setSelectedTokenId(option);
    }
    setBottomSheetVisible(false);
  };

  // Handle dropdown opening
  const openDropdown = (type: OptionType): void => {
    setOptionType(type);
    setBottomSheetVisible(true);
  };

  // Handle stake button press
  const handleStake = (): void => {
    console.log('Staking:', {
      nftCollection: selectedNftCollection,
      tokenId: selectedTokenId,
      amount: amount,
    });
    // Implement staking logic here
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable
            onPress={() => navigateBack()}
            style={styles.iconContainer}>
            <Image source={images.back} style={{width: 20, height: 20}} />
          </Pressable>
          <Text style={styles.header}>Stake</Text>
        </View>

        {/* NFT Collection Dropdown */}
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => openDropdown('nft')}>
          <Text style={styles.dropdownLabel}>
            {selectedNftCollection || 'NFT Collection Listing'}
          </Text>
          <Icon name="chevron-small-down" size={24} color="#333" />
        </TouchableOpacity>

        {/* Token ID Dropdown */}
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => openDropdown('token')}>
          <Text style={styles.dropdownLabel}>
            {selectedTokenId || 'Token ID'}
          </Text>
          <Icon name="chevron-small-down" size={24} color="#333" />
        </TouchableOpacity>

        {/* Amount Input */}
        {/* <View style={styles.inputContainer}> */}
        <DTextInput
          value={amount}
          setValue={setAmount}
          setValid={setIsAmountValid}
          placeholder="Amount"
          keyboardType="numeric"
          containerStyle={[styles.dropdownContainer, {padding: 4}]}
        />
        {/* </View> */}

        {/* Stake Button */}
        {/* <TouchableOpacity style={styles.stakeButton} onPress={handleStake}>
        <Text style={styles.stakeButtonText}>Stake</Text>
      </TouchableOpacity> */}

        <DButton onPress={() => navigateTo('stake')} style={styles.stakeButton}>
          <Text style={styles.stakeButtonText}>Stake</Text>
        </DButton>

        {/* Bottom Sheet for Options */}
        <BottomSheet
          visible={bottomSheetVisible}
          onBackButtonPress={() => setBottomSheetVisible(false)}
          onBackdropPress={() => setBottomSheetVisible(false)}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>
                {optionType === 'nft'
                  ? 'NFT Collection Options'
                  : 'Token ID Options'}
              </Text>
              <TouchableOpacity
                onPress={() => setBottomSheetVisible(false)}
                style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
              {(optionType === 'nft' ? nftOptions : tokenOptions).map(
                (option: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => handleSelectOption(option)}>
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff', // Light blue background
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    color: '#000',
  },
  headerText: {
    fontSize: 28,
    fontFamily: fontsFamily.MulishBold,
    marginBottom: 40,
    color: '#000',
    // textAlign: 'center',
    marginTop: 20,
  },
  dropdownContainer: {
    backgroundColor: '#fff', // Light yellow
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontsFamily.Mulish,
  },
  inputContainer: {
    backgroundColor: '#fff', // Light yellow
    borderRadius: 8,
    // paddingHorizontal: 16,
    marginBottom: 40,
    // borderWidth: 1,
    borderColor: '#DDDDBB',
  },
  input: {
    height: 50,
    fontSize: 16,
    color: '#333',
    fontFamily: fontsFamily.Mulish,
  },

  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '60%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: fontsFamily.MulishBold,
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    fontFamily: fontsFamily.MulishBold,
    color: '#009D94',
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  optionText: {
    fontSize: 16,
    fontFamily: fontsFamily.Mulish,
    color: '#333',
  },
  stakeButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    height: 50,
  },
  stakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
  },
});

export default StakeScreen;
