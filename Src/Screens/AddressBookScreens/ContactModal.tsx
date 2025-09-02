import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {DText} from '../../Componants/DText';
import {BottomSheet} from 'react-native-btr';
import {useAddressBookByWallet} from './Hooks/AddressBookGraphql';
import {useAuth} from '../../../screens/Provider/authProvider';
import LoaderAnimation from '../../Componants/Loading/LoaderAnimation';
import {navigateTo} from '../../utils/navigationService';

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
  // emptyMessage = 'No contacts found',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {userDetails} = useAuth();

  const {
    loading: listLoading,
    data: addressBooks,
    error: listError,
    refetch: refetchList,
  } = useAddressBookByWallet(userDetails?.userWallet ?? null);

  // Helper functions
  const getAvatarColor = (name: string) => {
    const colors = [
      '#009D94',
      '#4CAF50',
      '#2196F3',
      '#FF9800',
      '#9C27B0',
      '#F44336',
      '#607D8B',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) {
      return address;
    }
    return `${address.slice(0, 12)}...${address.slice(-12)}`;
  };

  const onAddContact = () => {
    onClose();
    navigateTo('AddressBook');
  };

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
      setSearchQuery('');
    },
    [onSelectAddress, onClose],
  );

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  const renderContact = useCallback(
    ({item, index}: {item: Contact; index: number}) => (
      <TouchableOpacity
        key={index}
        style={styles.contactItem}
        onPress={() => handleAddressSelect(item.beneficiaryAddress, item)}
        activeOpacity={0.8}>
        {/* Avatar */}
        <View
          style={[styles.avatar, {backgroundColor: getAvatarColor(item.name)}]}>
          <DText style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </DText>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <DText style={styles.contactName}>{item.name}</DText>
          <DText style={styles.contactAddress}>
            {truncateAddress(item.beneficiaryAddress)}
          </DText>
        </View>

        {/* Select Button */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => handleAddressSelect(item.beneficiaryAddress, item)}>
          <DText style={styles.selectText}>Select</DText>
        </TouchableOpacity>
      </TouchableOpacity>
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
          <DText style={styles.errorIcon}>⚠️</DText>
          <DText style={styles.errorText}>Failed to load contacts</DText>
          <DText style={styles.errorSubtext}>
            Please check your connection and try again
          </DText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchList()}>
            <DText style={styles.retryIcon}>🔄</DText>
            <DText style={styles.retryButtonText}>Retry</DText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <DText style={styles.emptyIcon}>👥</DText>
        <DText style={styles.emptyStateTitle}>
          {searchQuery ? 'No matching contacts' : 'No contacts available'}
        </DText>
        <DText style={styles.emptyStateSubtitle}>
          {searchQuery
            ? 'Try adjusting your search terms'
            : 'Add contacts to your address book to see them here'}
        </DText>
        {!searchQuery && (
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={onAddContact}>
            <DText style={styles.addIcon}>➕</DText>
            <DText style={styles.addContactText}>Add Contact</DText>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [searchQuery, listLoading, listError, refetchList]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Drag Handle */}
      <View style={styles.dragHandle} />

      {/* Title and Close Button */}
      <View style={styles.bottomSheetHeader}>
        <View style={styles.titleContainer}>
          <DText style={styles.bottomSheetTitle}>{title}</DText>
          {contacts.length > 0 && (
            <DText style={styles.contactCount}>
              {filteredData.length} contact
              {filteredData.length !== 1 ? 's' : ''}
            </DText>
          )}
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <DText style={styles.closeIcon}>✕</DText>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {(contacts.length > 0 || searchQuery) && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <DText style={styles.searchIcon}>🔍</DText>
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}>
                <DText style={styles.clearIcon}>✕</DText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    if (listLoading && contacts.length === 0) {
      return (
        <View style={styles.mainLoadingContainer}>
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={10}
        initialNumToRender={15}
        getItemLayout={(data, index) => ({
          length: 60,
          offset: 60 * index,
          index,
        })}
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
    maxHeight: '95%',
    minHeight: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  titleContainer: {
    flex: 1,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  contactCount: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeIcon: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingBottom: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    height: '100%',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  clearIcon: {
    fontSize: 12,
    color: '#999',
  },
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#009D94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  flatListStyle: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 52,
  },

  // Contact Item Styles - Clean and minimal
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 60,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#009D94',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  contactAddress: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  selectButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  selectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#009D94',
  },
  addIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  addContactText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#009D94',
  },
});

export default ContactModal;
