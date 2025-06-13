import React, {useState, useCallback, useMemo, useEffect} from 'react';
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
import {v4 as uuidv4} from 'uuid';
import {DTextInput} from '../../../Componants/Dinputs';
import {DButton} from '../../../Componants';
import images from '../../../Theme/images';
import {navigateBack} from '../../../utils/navigationService';
import {
  useCreateAddressBook,
  useUpdateAddressBook,
} from '../Hooks/AddressBookGraphql';
import {SnackBarMessage} from '../../../utils/snackBar';
import {useAuth} from '../../../../screens/Provider/authProvider';

interface CreateAddressProps {
  onSave?: (data: CreateAddressData) => void;
  onCancel?: () => void;
  loading?: boolean;
  // Route props for React Navigation
  route?: {
    params?: {
      editMode?: boolean;
      contactToEdit?: Contact | null;
    };
  };
  // Edit mode props (fallback if not using navigation)
  editMode?: boolean;
  contactToEdit?: Contact | null;
}

interface CreateAddressData {
  beneficiaryAddress: string;
  name: string;
  chain: string;
}

interface Contact {
  id: string;
  beneficiaryAddress: string;
  name: string;
  walletAddress: string;
  chain: string;
}

interface ChainOption {
  id: string;
  name: string;
  image: any; // Changed from color to image
}

// Available chains - only Ethereum and DEnergy
const AVAILABLE_CHAINS: ChainOption[] = [
  {id: 'ETH', name: 'Ethereum', image: images.ethereum},
  {id: 'DEnergy', name: 'DEnergy', image: images.watt},
];

const CreateAddress: React.FC<CreateAddressProps> = ({
  onSave,
  onCancel,
  loading: externalLoading = false,
  route,
  editMode: propEditMode = false,
  contactToEdit: propContactToEdit = null,
}) => {
  const {userDetails} = useAuth();

  // Extract route parameters if using React Navigation
  const routeParams = route?.params || {};
  const editMode = routeParams.editMode || propEditMode;
  const contactToEdit = routeParams.contactToEdit || propContactToEdit;

  const [formData, setFormData] = useState<CreateAddressData>({
    beneficiaryAddress: '',
    name: '',
    chain: '',
  });
  const [errors, setErrors] = useState<Partial<CreateAddressData>>({});
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Use the GraphQL mutation hooks
  const {
    createAddressBook,
    loading: createLoading,
    error: createError,
  } = useCreateAddressBook();

  const {
    updateAddressBook,
    loading: updateLoading,
    error: updateError,
  } = useUpdateAddressBook();

  // Initialize form data when in edit mode
  useEffect(() => {
    console.log('CreateAddress useEffect triggered:', {
      editMode,
      contactToEdit,
      routeParams: route?.params,
    });

    if (editMode && contactToEdit) {
      console.log('Pre-filling form with contact data:', contactToEdit);
      setFormData({
        beneficiaryAddress: contactToEdit.beneficiaryAddress,
        name: contactToEdit.name,
        chain: contactToEdit.chain,
      });
      setIsNameValid(contactToEdit.name.trim().length >= 2);
      setIsAddressValid(contactToEdit.beneficiaryAddress.trim().length >= 10);
    } else {
      console.log('Not in edit mode or no contact to edit');
      // Reset form when not in edit mode
      setFormData({
        beneficiaryAddress: '',
        name: '',
        chain: '',
      });
      setIsNameValid(false);
      setIsAddressValid(false);
    }
  }, [editMode, contactToEdit, route?.params]);

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

    if (!userDetails?.denergyWallet) {
      Alert.alert('Error', 'User wallet address not found. Please try again.');
      return;
    }

    try {
      if (editMode && contactToEdit) {
        // Update existing contact
        const updateInput = {
          id: contactToEdit.id,
          name: formData.name.trim(),
          beneficiaryAddress: formData.beneficiaryAddress.trim(),
          chain: formData.chain,
          walletAddress: userDetails.denergyWallet,
        };

        console.log('Updating address book with input:', updateInput);

        const result = await updateAddressBook(updateInput);

        if (result) {
          console.log('Address book updated successfully:', result);
          SnackBarMessage('Contact updated successfully!');
        }
      } else {
        // Create new contact
        const uniqueId = uuidv4();

        const createInput = {
          id: uniqueId,
          name: formData.name.trim(),
          beneficiaryAddress: formData.beneficiaryAddress.trim(),
          chain: formData.chain,
          walletAddress: userDetails.denergyWallet,
        };

        console.log('Creating address book with input:', createInput);

        const result = await createAddressBook(createInput);

        if (result) {
          console.log('Address book created successfully:', result);
          SnackBarMessage('Contact added successfully!');
        }
      }

      // Call the onSave prop if provided (for any additional handling)
      if (onSave) {
        onSave(formData);
      }

      // Reset form after successful save
      setFormData({beneficiaryAddress: '', name: '', chain: ''});
      setIsNameValid(false);
      setIsAddressValid(false);
      navigateBack();
    } catch (error) {
      console.error(
        `Error ${editMode ? 'updating' : 'creating'} address book:`,
        error,
      );

      // More detailed error handling
      let errorMessage = `Failed to ${
        editMode ? 'update' : 'add'
      } contact. Please try again.`;
      const currentError = editMode ? updateError : createError;

      if (currentError) {
        errorMessage = `Failed to ${editMode ? 'update' : 'add'} contact: ${
          currentError.message
        }`;
      } else if (error instanceof Error) {
        errorMessage = `Failed to ${editMode ? 'update' : 'add'} contact: ${
          error.message
        }`;
      }

      Alert.alert('Error', errorMessage);
    }
  }, [
    formData,
    validateForm,
    createAddressBook,
    updateAddressBook,
    onSave,
    createError,
    updateError,
    userDetails,
    editMode,
    contactToEdit,
  ]);

  const handleCancel = useCallback(() => {
    // Reset form state
    setFormData({beneficiaryAddress: '', name: '', chain: ''});
    setErrors({});
    setIsNameValid(false);
    setIsAddressValid(false);

    if (onCancel) {
      onCancel();
    } else {
      navigateBack();
    }
  }, [onCancel]);

  const isFormValid = useMemo(() => {
    return (
      isNameValid &&
      isAddressValid &&
      formData.chain &&
      formData.name.trim().length >= 2 &&
      formData.beneficiaryAddress.trim().length >= 10 &&
      userDetails?.denergyWallet // Ensure wallet address is available
    );
  }, [isNameValid, isAddressValid, formData, userDetails]);

  // Combine loading states
  const isLoading = createLoading || updateLoading || externalLoading;

  return (
    <SafeAreaView style={localStyles.mainContainer}>
      <View style={localStyles.mainContainer}>
        <View style={localStyles.container}>
          {/* Header */}
          <View style={localStyles.headerContainer}>
            <Pressable onPress={handleCancel} style={localStyles.iconContainer}>
              <Image source={images.back} style={{width: 20, height: 20}} />
            </Pressable>
            <Text style={localStyles.header}>
              {editMode ? 'Edit Contact' : 'Add Contact'}
            </Text>
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
                <Image
                  source={selectedChain.image}
                  style={localStyles.chainImage}
                  resizeMode="contain"
                />
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
          {(createError || updateError) && (
            <Text style={localStyles.errorText}>
              Error: {(createError || updateError)?.message}
            </Text>
          )}

          {/* Wallet address validation */}
          {!userDetails?.denergyWallet && (
            <Text style={localStyles.errorText}>
              Wallet address not found. Please check your account setup.
            </Text>
          )}

          {/* Save Button */}
          <DButton
            onPress={handleSave}
            loading={isLoading}
            style={[
              localStyles.saveButton,
              (!isFormValid || isLoading) && localStyles.saveButtonDisabled,
            ]}
            disabled={!isFormValid || isLoading}>
            <Text
              style={[
                localStyles.saveButtonText,
                (!isFormValid || isLoading) &&
                  localStyles.saveButtonTextDisabled,
              ]}>
              {isLoading
                ? editMode
                  ? 'Updating...'
                  : 'Adding...'
                : editMode
                ? 'Update Contact'
                : 'Add Contact'}
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
                      style={[
                        localStyles.optionItem,
                        // Remove border from last item
                        index === AVAILABLE_CHAINS.length - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                      onPress={() => handleChainSelect(chain)}>
                      <View style={localStyles.chainOptionContent}>
                        <Image
                          source={chain.image}
                          style={localStyles.bottomSheetChainImage}
                          resizeMode="contain"
                        />
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
  chainImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  bottomSheetChainImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
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
  infoContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#009D94',
  },
  infoLabel: {
    fontSize: 12,
    color: '#009D94',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#999999',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20, // Add bottom padding
    width: '100%',
    // Remove fixed heights to auto-size based on content
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 16 to make more compact
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
    // Remove flex: 1 to auto-size based on content
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 16 to make more compact
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
