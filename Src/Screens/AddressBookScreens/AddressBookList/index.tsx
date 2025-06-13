import React, {JSX, useState, useCallback, useMemo, useEffect} from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {DText} from '../../../Componants/DText';
import {Header} from '@rneui/base';
import images from '../../../Theme/images';
import {navigateBack, navigateTo} from '../../../utils/navigationService';
import ContactCard from '../Componants/ContactCard';
import {
  useAddressBookByWallet,
  useDeleteAddressBook,
} from '../Hooks/AddressBookGraphql';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {Colors} from '../../../Theme';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {SnackBarMessage} from '../../../utils/snackBar';

interface Contact {
  id: string;
  beneficiaryAddress: string;
  name: string;
  walletAddress: string;
  chain: string;
}

interface AddressBookProps {
  // Add any props if needed
}

function AddressBook(props: AddressBookProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null,
  ); // Track which contact is being deleted
  const {userDetails} = useAuth();

  // Using the updated hook with wallet address
  const {
    loading: listLoading,
    data: addressBooks,
    error: listError,
    refetch: refetchList,
  } = useAddressBookByWallet(userDetails?.denergyWallet ?? null);

  // Using the delete hook
  const {
    loading: deleteLoading,
    error: deleteError,
    deleteAddressBook,
  } = useDeleteAddressBook();

  console.log(
    'addressBooks',
    JSON.stringify(addressBooks),
    listLoading,
    listError,
  );

  useFocusEffect(
    useCallback(() => {
      if (userDetails?.denergyWallet) {
        refetchList();
      }
    }, [userDetails?.denergyWallet, refetchList]),
  );

  const contacts = useMemo(() => {
    return addressBooks || [];
  }, [addressBooks]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCreateBeneficiary = useCallback(() => {
    // Navigate to create beneficiary screen
    console.log('Navigate to create beneficiary');
    navigateTo('CreateAddress');
  }, []);

  const handleEditContact = useCallback(
    (contactId: string) => {
      // Find the contact to edit
      const contactToEdit = contacts.find(contact => contact.id === contactId);

      if (contactToEdit) {
        console.log('Editing contact:', contactToEdit.name, 'ID:', contactId);
        console.log('Contact data being passed:', contactToEdit);

        // Navigate to CreateAddress screen in edit mode
        navigateTo('CreateAddress', {
          editMode: true,
          contactToEdit: contactToEdit,
        });
      } else {
        console.error('Contact not found for editing:', contactId);
        Alert.alert('Error', 'Contact not found. Please try again.');
      }
    },
    [contacts],
  );

  const handleDeleteContact = useCallback(
    async (contactId: string, contactName: string) => {
      // Show single confirmation dialog before deleting
      Alert.alert(
        'Delete Contact',
        `Are you sure you want to delete "${contactName}" from your address book?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeletingContactId(contactId);

                // Get wallet address for refetch
                const walletAddress = userDetails?.denergyWallet;
                if (!walletAddress) {
                  throw new Error('Wallet address not found');
                }

                // Call the actual delete API
                await deleteAddressBook(contactId, walletAddress);

                console.log(
                  `Contact deleted: ${contactName} (ID: ${contactId})`,
                );

                SnackBarMessage('Contact deleted successfully', 'success');

                // Refresh the list after successful deletion
                await refetchList();
              } catch (error) {
                console.error('Error deleting contact:', error);

                // Show error message
                Alert.alert(
                  'Delete Failed',
                  'Unable to delete contact. Please try again.',
                  [{text: 'OK'}],
                );
              } finally {
                setDeletingContactId(null);
              }
            },
          },
        ],
      );
    },
    [deleteAddressBook, userDetails?.denergyWallet, refetchList],
  );

  const filteredData = useMemo(() => {
    if (searchQuery.trim() === '') {
      return contacts;
    } else {
      return contacts.filter(
        (contact: Contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.chain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.beneficiaryAddress
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }
  }, [contacts, searchQuery]);

  const renderContact = useCallback(
    ({item}: {item: Contact}) => (
      <ContactCard
        name={item.name}
        beneficiaryAddress={item.beneficiaryAddress}
        chain={item.chain}
        contactId={item.id}
        onPress={() => {
          // Disable press when deleting
          if (deletingContactId === item.id) return;
          console.log('Contact pressed:', item.name, 'ID:', item.id);
        }}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
        showEditButton={deletingContactId !== item.id} // Hide edit button when deleting
        showDeleteButton={deletingContactId !== item.id} // Hide menu when deleting
        isDeleting={deletingContactId === item.id} // Pass deleting state to card
      />
    ),
    [handleEditContact, handleDeleteContact, deletingContactId],
  );

  const keyExtractor = useCallback(
    (item: Contact, index: number) =>
      item.id || `${item.beneficiaryAddress}-${index}`,
    [],
  );

  const renderEmptyState = useCallback(() => {
    if (listLoading && contacts.length === 0) {
      return (
        <View style={localStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#009D94" />
          <DText style={localStyles.loadingText}>Loading contacts...</DText>
        </View>
      );
    }

    if (listError) {
      return (
        <View style={localStyles.errorContainer}>
          <DText style={localStyles.errorText}>Failed to load contacts</DText>
          <TouchableOpacity
            style={localStyles.retryButton}
            onPress={() => refetchList()}>
            <DText style={localStyles.retryButtonText}>Retry</DText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={localStyles.emptyState}>
        <View style={localStyles.emptyIconContainer}>
          <AntDesignIcon name="contacts" size={50} color="#009D94" />
        </View>
        <DText style={localStyles.emptyStateTitle}>
          {searchQuery ? 'No contacts found' : 'No contacts yet'}
        </DText>
        <DText style={localStyles.emptyStateSubtitle}>
          {searchQuery
            ? 'Try adjusting your search terms'
            : 'Add your first contact to get started'}
        </DText>
        {!searchQuery && (
          <TouchableOpacity
            style={localStyles.createButton}
            onPress={() => {
              navigateTo('CreateAddress');
            }}>
            <DText style={localStyles.createButtonText}>+ Add Contact</DText>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [
    searchQuery,
    listLoading,
    listError,
    refetchList,
    handleCreateBeneficiary,
    contacts.length,
  ]);

  return (
    <View style={localStyles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={localStyles.headerContainer}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={localStyles.iconContainer}>
            <Image source={images.back} tintColor="#000" />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={localStyles.nameContainer}>
            <DText fontStyle="fontBold" style={localStyles.title}>
              Address Book
            </DText>
          </View>
        }
        rightComponent={
          contacts.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                navigateTo('CreateAddress');
              }}
              style={[localStyles.iconContainer, {bottom: 5}]}>
              <View style={localStyles.addButton}>
                <AntDesignIcon
                  name="pluscircleo"
                  size={24}
                  color={Colors.success}
                />
              </View>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Search Input */}
      {(contacts.length > 0 || searchQuery) && (
        <View style={localStyles.searchContainer}>
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      )}

      <FlatList
        data={filteredData}
        renderItem={renderContact}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.listContainer}
        refreshing={listLoading && contacts.length > 0}
        onRefresh={refetchList}
        extraData={deletingContactId} // Force re-render when delete state changes
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    paddingHorizontal: 8,
  },
  nameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#1a1a1a',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: -50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 0,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressBook;
