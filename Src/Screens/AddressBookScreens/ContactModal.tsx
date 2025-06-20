import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {DText} from '../../Componants/DText';
import {BottomSheet} from 'react-native-btr';
import ContactCard from './Componants/ContactCard';
import {useAddressBookByWallet} from './Hooks/AddressBookGraphql';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {useAuth} from '../../../screens/Provider/authProvider';
import LoaderAnimation from '../../Componants/Loading/LoaderAnimation';

interface Contact {
  beneficiaryAddress: string;
  name: string;
  walletAddress: string;
  chain: string;
}

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: string, contact: Contact) => void;
  title?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
  visible,
  onClose,
  onSelectAddress,
  title = 'Select Contact',
  searchPlaceholder = 'Search contacts...',
  emptyMessage = 'No contacts found',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {userDetails} = useAuth();

  const {
    loading: listLoading,
    data: addressBooks,
    error: listError,
    refetch: refetchList,
  } = useAddressBookByWallet(userDetails?.denergyWallet ?? null);

  const contacts = useMemo(() => {
    return addressBooks || [];
  }, [addressBooks]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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

  const handleAddressSelect = useCallback(
    (address: string, contact: Contact) => {
      onSelectAddress(address, contact);
      onClose();
      setSearchQuery(''); // Reset search when closing
    },
    [onSelectAddress, onClose],
  );

  const handleClose = useCallback(() => {
    setSearchQuery(''); // Reset search when closing
    onClose();
  }, [onClose]);

  const renderContact = useCallback(
    ({item}: {item: Contact}) => (
      <ContactCard
        name={item.name}
        beneficiaryAddress={item.beneficiaryAddress}
        chain={item.chain}
        mode="select"
        onAddressSelect={address => handleAddressSelect(address, item)}
      />
    ),
    [handleAddressSelect],
  );

  const keyExtractor = useCallback(
    (item: Contact, index: number) =>
      item.beneficiaryAddress + index.toString(),
    [],
  );

  const renderEmptyState = useCallback(() => {
    if (listLoading) {
      return (
        <View style={styles.loadingContainer}>
          {/* <ActivityIndicator size="large" color="#009D94" />
          <DText style={styles.loadingText}>Loading contacts...</DText> */}
          <LoaderAnimation
            size="large"
            color="#009D94"
            showText={true}
            text="Loading contacts..."
          />
        </View>
      );
    }

    if (listError) {
      return (
        <View style={styles.errorContainer}>
          <DText style={styles.errorText}>Failed to load contacts</DText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchList()}>
            <DText style={styles.retryButtonText}>Retry</DText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <AntDesignIcon name="contacts" size={50} color="#009D94" />
        </View>
        <DText style={styles.emptyStateTitle}>
          {searchQuery ? emptyMessage : 'No contacts available'}
        </DText>
        <DText style={styles.emptyStateSubtitle}>
          {searchQuery
            ? 'Try adjusting your search terms'
            : 'Add contacts in your address book first'}
        </DText>
      </View>
    );
  }, [searchQuery, emptyMessage, listLoading, listError, refetchList]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Title and Close Button */}
      <View style={styles.bottomSheetHeader}>
        <DText style={styles.bottomSheetTitle}>{title}</DText>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <DText style={styles.closeText}>✕</DText>
        </TouchableOpacity>
      </View>

      {/* Search Input - Only show if we have contacts or are searching */}
      {(contacts.length > 0 || searchQuery) && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Loading indicator for header */}
      {listLoading && contacts.length === 0 && (
        <View style={styles.headerLoadingContainer}>
          {/* <ActivityIndicator size="small" color="#009D94" />
          <DText style={styles.headerLoadingText}>Loading contacts...</DText> */}
          <LoaderAnimation
            size="small"
            color="#009D94"
            showText={true}
            text="Loading contacts..."
          />
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    // Show loading in main area only if we have no contacts yet
    if (listLoading && contacts.length === 0) {
      return (
        <View style={styles.mainLoadingContainer}>
          {/* <ActivityIndicator size="large" color="#009D94" />
          <DText style={styles.loadingText}>Loading contacts...</DText> */}
          <LoaderAnimation
            size="large"
            color="#009D94"
            showText={true}
            text="Loading contacts..."
          />
        </View>
      );
    }

    return (
      <FlatList
        data={filteredData}
        renderItem={renderContact}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        style={styles.flatListStyle}
        refreshing={listLoading && contacts.length > 0}
        onRefresh={refetchList}
      />
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}>
      <View style={styles.bottomSheetCard}>
        {renderHeader()}
        {renderContent()}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    maxHeight: '95%',
    minHeight: '90%',
    width: '100%',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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
  searchContainer: {
    paddingBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  headerLoadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingBottom: 100,
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
    paddingVertical: 50,
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
  flatListStyle: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 30,
    paddingTop: 10,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ContactModal;
