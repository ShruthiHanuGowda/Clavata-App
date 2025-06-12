import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  Pressable,
} from 'react-native';
import {BottomSheet} from 'react-native-btr';
import Icon from 'react-native-vector-icons/Entypo';
import {DTextInput} from '../../../Componants/Dinputs';
import {DButton} from '../../../Componants';
import images from '../../../Theme/images';
import {navigateBack} from '../../../utils/navigationService';
import {useCreateAddressBook} from '../Hooks/AddressBookGraphql'; // Import the hook
import {SnackBarMessage} from '../../../utils/snackBar';
import {useAuth} from '../../../../screens/Provider/authProvider';

interface CreateAddressProps {
  onSave?: (data: CreateAddressData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

interface CreateAddressData {
  beneficiaryAddress: string;
  name: string;
  chain: string;
}

interface ChainOption {
  id: string;
  name: string;
  color: string;
}

// Available chains - you can modify this based on your supported chains
const AVAILABLE_CHAINS: ChainOption[] = [
  {id: 'ETH', name: 'Ethereum', color: '#627EEA'},
  {id: 'DEnergy', name: 'DEnergy', color: '#009D94'},
  {id: 'BTC', name: 'Bitcoin', color: '#F7931A'},
  {id: 'BNB', name: 'BNB Chain', color: '#F3BA2F'},
  {id: 'MATIC', name: 'Polygon', color: '#8247E5'},
  {id: 'SOL', name: 'Solana', color: '#9945FF'},
];

// Static wallet address for dEnergy

const CreateAddress: React.FC<CreateAddressProps> = ({
  onSave,
  onCancel,
  loading: externalLoading = false,
}) => {
  const {userDetails} = useAuth();
  const [formData, setFormData] = useState<CreateAddressData>({
    beneficiaryAddress: '',
    name: '',
    chain: '',
  });
  const [errors, setErrors] = useState<Partial<CreateAddressData>>({});
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Use the GraphQL mutation hook
  const {
    createAddressBook,
    loading: mutationLoading,
    error: mutationError,
  } = useCreateAddressBook();

  const selectedChain = useMemo(() => {
    return AVAILABLE_CHAINS.find(chain => chain.id === formData.chain);
  }, [formData.chain]);

  const handleInputChange = useCallback(
    (field: keyof CreateAddressData, value: string) => {
      setFormData(prev => ({...prev, [field]: value}));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({...prev, [field]: ''}));
      }
    },
    [errors],
  );

  const handleChainSelect = useCallback(
    (chain: ChainOption) => {
      setFormData(prev => ({...prev, chain: chain.id}));
      setBottomSheetVisible(false);
      if (errors.chain) {
        setErrors(prev => ({...prev, chain: ''}));
      }
    },
    [errors.chain],
  );

  const handleCloseBottomSheet = useCallback(() => {
    setBottomSheetVisible(false);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<CreateAddressData> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate chain
    if (!formData.chain) {
      newErrors.chain = 'Please select a chain';
    }

    // Validate beneficiary address
    if (!formData.beneficiaryAddress.trim()) {
      newErrors.beneficiaryAddress = 'Address is required';
    } else if (formData.beneficiaryAddress.trim().length < 10) {
      newErrors.beneficiaryAddress = 'Please enter a valid address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare the input for the GraphQL mutation
      const createAddressBookInput = {
        name: formData.name.trim(),
        beneficiaryAddress: formData.beneficiaryAddress.trim(),
        chain: formData.chain,
        walletAddress: userDetails?.denergyWallet, // Static dEnergy wallet address
        // Add any other required fields based on your CreateAddressBookInput type
      };

      // Call the GraphQL mutation
      const result = await createAddressBook(createAddressBookInput);

      if (result) {
        SnackBarMessage('Contact added successfully!');

        // Call the onSave prop if provided (for any additional handling)
        if (onSave) {
          onSave(formData);
        }

        // Reset form after successful save
        setFormData({beneficiaryAddress: '', name: '', chain: ''});
        navigateBack();
      }
    } catch (error) {
      console.error('Error creating address book:', error);
      Alert.alert(
        'Error',
        mutationError
          ? `Failed to add contact: ${mutationError.message}`
          : 'Failed to add contact. Please try again.',
      );
    }
  }, [formData, validateForm, createAddressBook, onSave, mutationError]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      navigateBack();
    }
  }, [onCancel]);

  const getChainInitial = (chainName: string) => {
    return chainName.charAt(0).toUpperCase();
  };

  const isFormValid = useMemo(() => {
    return (
      isNameValid &&
      isAddressValid &&
      formData.chain &&
      formData.name.trim().length >= 2 &&
      formData.beneficiaryAddress.trim().length >= 10
    );
  }, [isNameValid, isAddressValid, formData]);

  // Combine loading states
  const isLoading = mutationLoading || externalLoading;

  const renderChainItem = useCallback(
    ({item}: {item: ChainOption}) => (
      <TouchableOpacity
        style={localStyles.optionItem}
        onPress={() => handleChainSelect(item)}>
        <View style={localStyles.chainOptionContent}>
          <View style={[localStyles.chainIcon, {backgroundColor: item.color}]}>
            <Text style={localStyles.chainInitial}>
              {getChainInitial(item.name)}
            </Text>
          </View>
          <View style={localStyles.chainInfo}>
            <Text style={localStyles.chainName}>{item.name}</Text>
            <Text style={localStyles.chainId}>{item.id}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleChainSelect],
  );

  const keyExtractorChain = useCallback((item: ChainOption) => item.id, []);

  return (
    <SafeAreaView style={localStyles.mainContainer}>
      <View style={localStyles.mainContainer}>
        <View style={localStyles.container}>
          {/* Header */}
          <View style={localStyles.headerContainer}>
            <Pressable onPress={handleCancel} style={localStyles.iconContainer}>
              <Image source={images.back} style={{width: 20, height: 20}} />
            </Pressable>
            <Text style={localStyles.header}>Add Contact</Text>
          </View>

          {/* Contact Name Input */}
          <View>
            <DTextInput
              value={formData.name}
              setValue={(value: string) => {
                handleInputChange('name', value);
                setIsNameValid(value.trim().length >= 2);
              }}
              setValid={setIsNameValid}
              placeholder="Contact Name"
              containerStyle={[
                localStyles.uniformContainer,
                {paddingHorizontal: 5},
                errors.name ? localStyles.inputError : null,
              ]}
            />
            {errors.name && (
              <Text style={localStyles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Chain Selection Dropdown */}
          <TouchableOpacity
            style={[
              localStyles.uniformContainer,
              localStyles.dropdownStyle,
              errors.chain ? localStyles.inputError : null,
              {paddingHorizontal: 16},
            ]}
            onPress={() => setBottomSheetVisible(true)}>
            {selectedChain ? (
              <View style={localStyles.selectedChainContent}>
                <View
                  style={[
                    localStyles.chainIcon,
                    {backgroundColor: selectedChain.color},
                  ]}>
                  <Text style={localStyles.chainInitial}>
                    {getChainInitial(selectedChain.name)}
                  </Text>
                </View>
                <Text style={localStyles.dropdownLabel}>
                  {selectedChain.name}
                </Text>
              </View>
            ) : (
              <Text style={[localStyles.dropdownLabel, {marginLeft: 0}]}>
                Select Chain
              </Text>
            )}
            <Icon name="chevron-small-down" size={24} color="#333" />
          </TouchableOpacity>
          {errors.chain && (
            <Text style={localStyles.errorText}>{errors.chain}</Text>
          )}

          {/* Beneficiary Address Input */}
          <View>
            <DTextInput
              value={formData.beneficiaryAddress}
              setValue={(value: string) => {
                handleInputChange('beneficiaryAddress', value);
                setIsAddressValid(value.trim().length >= 10);
              }}
              setValid={setIsAddressValid}
              placeholder="Wallet Address"
              multiline
              numberOfLines={3}
              containerStyle={[
                localStyles.uniformContainer,
                {paddingHorizontal: 5, paddingVertical: 5},
                errors.beneficiaryAddress ? localStyles.inputError : null,
              ]}
              editable={!!selectedChain} // Disable if no chain is selected
            />
            {errors.beneficiaryAddress && (
              <Text style={localStyles.errorText}>
                {errors.beneficiaryAddress}
              </Text>
            )}
            {!selectedChain && !errors.beneficiaryAddress && (
              <Text style={localStyles.errorText}>
                Please select a chain first
              </Text>
            )}
          </View>

          {/* Show mutation error if any */}
          {mutationError && (
            <Text style={localStyles.errorText}>
              Error: {mutationError.message}
            </Text>
          )}

          {/* Add Contact Button */}
          <DButton
            onPress={handleSave}
            loading={isLoading}
            style={localStyles.saveButton}
            disabled={!isFormValid || isLoading}>
            <Text style={localStyles.saveButtonText}>
              {isLoading ? 'Adding...' : 'Add Contact'}
            </Text>
          </DButton>

          {/* Bottom Sheet for Chain Selection */}
          <BottomSheet
            visible={bottomSheetVisible}
            onBackButtonPress={handleCloseBottomSheet}
            onBackdropPress={handleCloseBottomSheet}>
            <View style={localStyles.bottomSheetCard}>
              <View style={localStyles.bottomSheetHeader}>
                <Text style={localStyles.bottomSheetTitle}>Select Chain</Text>
                <TouchableOpacity
                  onPress={handleCloseBottomSheet}
                  style={localStyles.closeButton}>
                  <Text style={localStyles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={localStyles.optionsContainer}>
                {AVAILABLE_CHAINS && AVAILABLE_CHAINS.length > 0 ? (
                  AVAILABLE_CHAINS.map((chain: ChainOption, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={localStyles.optionItem}
                      onPress={() => handleChainSelect(chain)}>
                      <View style={localStyles.chainOptionContent}>
                        <View
                          style={[
                            localStyles.bottomSheetChainIcon,
                            {backgroundColor: chain.color},
                          ]}>
                          <Text style={localStyles.bottomSheetChainInitial}>
                            {getChainInitial(chain.name)}
                          </Text>
                        </View>
                        <View style={localStyles.chainInfo}>
                          <Text style={localStyles.optionText}>
                            {chain.name}
                          </Text>
                          <Text style={localStyles.chainId}>{chain.id}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={localStyles.noOptionsText}>
                    No chains available
                  </Text>
                )}
              </ScrollView>
            </View>
          </BottomSheet>
        </View>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  iconContainer: {
    marginRight: 15,
    padding: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },

  uniformContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedChainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  chainIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chainInitial: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomSheetChainIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bottomSheetChainInitial: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chainInfo: {
    flex: 1,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    maxHeight: '80%',
    minHeight: '50%',
    width: '100%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  closeText: {
    fontSize: 16,
    color: '#009D94',
    fontWeight: 'bold',
  },
  optionsContainer: {
    flex: 1,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFFFFF',
  },
  chainOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  chainName: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  chainId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noOptionsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default CreateAddress;
