import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {DText} from '../../Componants/DText';
import {BottomSheet} from 'react-native-btr';
import ContactCard from './Componants/ContactCard'; // Adjust the import path as needed

interface WalletAddress {
  type: string;
  address: string;
}

interface Contact {
  id: string;
  name: string;
  walletAddress: string[];
  chain: string;
}

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: string, contact: Contact) => void;
  contacts?: Contact[];
  title?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

// Default contacts - you can replace this with your actual data
const defaultContacts: Contact[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    walletAddress: ['0x742d35Cc6454C532535E4Ed3F8b6c5C7F3a8b3F1'],
    chain: 'Ethereum',
  },
  {
    id: '2',
    name: 'Alice Johnson',
    walletAddress: ['0x742d35Cc6454C532535E4Ed3F8b6c5C7F3a8b3F1'],
    chain: 'Denergy',
  },
  {
    id: '3',
    name: 'Bob Smith',
    walletAddress: [
      '0x8ba1f109551bD432803012645Hac136c22416cc8',
      'dw1xy9z8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t8u',
    ],
    chain: 'Polygon',
  },
  {
    id: '4',
    name: 'Carol Williams',
    walletAddress: ['0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db'],
    chain: 'BSC',
  },
  {
    id: '5',
    name: 'David Brown',
    walletAddress: [
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      'dw1ab2cd3ef4gh5ij6kl7mn8op9qr0st1uv2wx3yz4ab5cd6ef',
    ],
    chain: 'Ethereum',
  },
];

const ContactModal: React.FC<ContactModalProps> = ({
  visible,
  onClose,
  onSelectAddress,
  contacts = defaultContacts,
  title = 'Select Contact',
  searchPlaceholder = 'Search contacts...',
  emptyMessage = 'No contacts found',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredData = useMemo(() => {
    if (searchQuery.trim() === '') {
      return contacts;
    } else {
      return contacts.filter(
        contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.chain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.walletAddress.some(address =>
            address.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
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
        walletAddress={item.walletAddress}
        chain={item.chain}
        mode="select"
        onAddressSelect={address => handleAddressSelect(address, item)}
      />
    ),
    [handleAddressSelect],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <DText style={styles.emptyStateText}>
          {searchQuery ? emptyMessage : 'No contacts available'}
        </DText>
      </View>
    ),
    [searchQuery, emptyMessage],
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Title and Close Button */}
      <View style={styles.bottomSheetHeader}>
        <DText style={styles.bottomSheetTitle}>{title}</DText>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <DText style={styles.closeText}>✕</DText>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
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
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}>
      <View style={styles.bottomSheetCard}>
        {renderHeader()}

        <FlatList
          data={filteredData}
          renderItem={renderContact}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          style={styles.flatListStyle}
        />
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
    maxHeight: '95%', // Changed from 80% to 95% to cover almost entire screen
    minHeight: '90%', // Added minimum height for consistency
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
  flatListStyle: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ContactModal;
