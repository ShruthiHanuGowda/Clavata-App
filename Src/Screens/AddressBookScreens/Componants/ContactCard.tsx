import React from 'react';
import {View, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {DText} from '../../../Componants/DText';
// import Clipboard from '@react-native-clipboard/clipboard'; // You'll need to install this
// For now, I'll use a placeholder copy function

interface ContactCardProps {
  name: string;
  walletAddress: string[];
  chain: string;
  onPress?: () => void;
  mode?: 'copy' | 'select'; // New prop to determine functionality
  onAddressSelect?: (address: string) => void; // Callback for select mode
}

const ContactCard: React.FC<ContactCardProps> = ({
  name,
  walletAddress,
  chain,
  onPress,
  mode = 'copy',
  onAddressSelect,
}) => {
  const copyToClipboard = (address: string) => {
    // Clipboard.setString(address); // Uncomment when you install clipboard
    Alert.alert('Address Copied', `Address copied to clipboard!`, [
      {text: 'OK'},
    ]);
    console.log(`Copied address: ${address}`); // For demo purposes
  };

  const handleAddressAction = (address: string) => {
    if (mode === 'select') {
      onAddressSelect?.(address);
    } else {
      copyToClipboard(address);
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.substring(0, 10)}...${address.substring(
        address.length - 8,
      )}`;
    }
    return address;
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        {/* Header with name and chain */}
        <View style={styles.headerRow}>
          <View style={styles.nameSection}>
            <DText fontStyle="fontBold" style={styles.contactName}>
              {name}
            </DText>
            <View style={styles.chainBadge}>
              <DText style={styles.chainText}>{chain}</DText>
            </View>
          </View>
        </View>

        {/* Wallet addresses */}
        <View style={styles.addressesContainer}>
          {walletAddress.map((address, index) => (
            <View key={index} style={styles.addressRow}>
              <View style={styles.addressInfo}>
                <DText style={styles.addressText}>
                  {truncateAddress(address)}
                </DText>
              </View>
              <TouchableOpacity
                style={[
                  styles.copyButton,
                  mode === 'select' ? styles.selectButton : styles.copyButton,
                ]}
                onPress={() => handleAddressAction(address)}>
                <DText
                  style={[
                    styles.copyButtonText,
                    mode === 'select'
                      ? styles.selectButtonText
                      : styles.copyButtonText,
                  ]}>
                  {mode === 'select' ? 'Select' : 'Copy'}
                </DText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameSection: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  chainBadge: {
    backgroundColor: '#009D94',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  chainText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addressesContainer: {
    marginTop: 8,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ContactCard;
