import React from 'react';
import {View, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {DText} from '../../../Componants/DText';
// import Clipboard from '@react-native-clipboard/clipboard'; // You'll need to install this
// For now, I'll use a placeholder copy function

interface ContactCardProps {
  name: string;
  beneficiaryAddress: string;
  chain: string;
  onPress?: () => void;
  mode?: 'copy' | 'select'; // New prop to determine functionality
  onAddressSelect?: (address: string) => void; // Callback for select mode
}

const ContactCard: React.FC<ContactCardProps> = ({
  name,
  beneficiaryAddress,
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

  const getChainInitial = (chainName: string) => {
    return chainName.charAt(0).toUpperCase();
  };

  const getChainColor = (chainName: string) => {
    // Generate a consistent color based on chain name
    const colors = [
      '#009D94',
      '#6C63FF',
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FECA57',
      '#FF9FF3',
      '#54A0FF',
      '#5F27CD',
    ];
    const index = chainName.length % colors.length;
    return colors[index];
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* Header with name and chain */}
        <View style={styles.headerRow}>
          <View style={styles.nameSection}>
            <DText fontStyle="fontBold" style={styles.contactName}>
              {name}
            </DText>
          </View>
          <View style={styles.chainContainer}>
            <View
              style={[
                styles.chainIcon,
                {backgroundColor: getChainColor(chain)},
              ]}>
              <DText style={styles.chainInitial}>
                {getChainInitial(chain)}
              </DText>
            </View>
            <DText style={styles.chainText}>{chain}</DText>
          </View>
        </View>

        {/* Beneficiary Address */}
        <View style={styles.addressContainer}>
          <View style={styles.addressRow}>
            <View style={styles.addressInfo}>
              <DText style={styles.addressLabel}>Address</DText>
              <DText style={styles.addressText}>
                {truncateAddress(beneficiaryAddress)}
              </DText>
            </View>
            <TouchableOpacity
              style={[
                styles.actionButton,
                mode === 'select' ? styles.selectButton : styles.copyButton,
              ]}
              onPress={() => handleAddressAction(beneficiaryAddress)}>
              <DText
                style={[
                  styles.actionButtonText,
                  mode === 'select'
                    ? styles.selectButtonText
                    : styles.copyButtonText,
                ]}>
                {mode === 'select' ? 'Select' : 'Copy'}
              </DText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    marginBottom: 16,
  },
  nameSection: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  chainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chainInitial: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chainText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  addressContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: '#009D94',
  },
  copyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#6C63FF',
  },
  selectButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ContactCard;
