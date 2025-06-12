import React, {JSX, useState, useCallback, useMemo} from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import {DText} from '../../../Componants/DText';
import {Header} from '@rneui/base';
import images from '../../../Theme/images';
import {navigateBack} from '../../../utils/navigationService';
import ContactCard from '../Componants/ContactCard'; // Adjust the import path as needed

interface Contact {
  id: string;
  name: string;
  walletAddress: string[];
  chain: string;
}

interface AddressBookProps {
  // Add any props if needed
}

// Dummy data
const dummyContacts: Contact[] = [
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
  {
    id: '6',
    name: 'Eva Davis',
    walletAddress: ['dw1qr9st8uv7wx6yz5ab4cd3ef2gh1ij0kl9mn8op7qr6st5uv'],
    chain: 'Arbitrum',
  },
  {
    id: '7',
    name: 'Frank Miller',
    walletAddress: [
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      'dw1ef4gh7ij0kl3mn6op9qr2st5uv8wx1yz4ab7cd0ef3gh6ij',
    ],
    chain: 'Optimism',
  },
];

function AddressBook(props: AddressBookProps): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>(dummyContacts);
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

  const renderContact = useCallback(
    ({item}: {item: Contact}) => (
      <ContactCard
        name={item.name}
        walletAddress={item.walletAddress}
        chain={item.chain}
        onPress={() => {
          // Handle contact press if needed
          console.log('Contact pressed:', item.name);
        }}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  const renderEmptyState = useCallback(
    () => (
      <View style={localStyles.emptyState}>
        <DText style={localStyles.emptyStateText}>
          {searchQuery
            ? 'No contacts found'
            : 'No contacts in your address book'}
        </DText>
      </View>
    ),
    [searchQuery],
  );

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
      />

      {/* Search Input - Outside FlatList to prevent re-render issues */}
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

      <FlatList
        data={filteredData}
        renderItem={renderContact}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.listContainer}
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
  },
  iconContainer: {
    padding: 8,
  },
  nameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#1a1a1a',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default AddressBook;
