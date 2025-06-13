import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import {DText} from '../../../Componants/DText';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import images from '../../../Theme/images';
import {SnackBarMessage} from '../../../utils/snackBar';

interface ContactCardProps {
  name: string;
  beneficiaryAddress: string;
  chain: string;
  onPress?: () => void;
  mode?: 'copy' | 'select';
  onAddressSelect?: (address: string) => void;
  onEdit?: (contactId: string) => void;
  onDelete?: (contactId: string, contactName: string) => void;
  contactId?: string;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
  isDeleting?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({
  name,
  beneficiaryAddress,
  chain,
  onPress,
  mode = 'copy',
  onAddressSelect,
  onEdit,
  onDelete,
  contactId,
  showDeleteButton = true,
  showEditButton = true,
  isDeleting,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = (address: string) => {
    SnackBarMessage('Address copied to clipboard!', 'success');
  };

  const handleAddressAction = (address: string) => {
    if (mode === 'select') {
      onAddressSelect?.(address);
    } else {
      copyToClipboard(address);
    }
  };

  const handleEditPress = (e: any) => {
    e.stopPropagation();
    if (contactId) {
      onEdit?.(contactId);
    }
  };

  const handleDeletePress = (e: any) => {
    e.stopPropagation();
    onDelete?.(contactId ?? '', name);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    onPress?.();
  };

  const getChainImage = (chainName: string) => {
    switch (chainName.toLowerCase()) {
      case 'ethereum':
      case 'eth':
        return images.ethereum;
      case 'denergy':
        return images.watt;
      default:
        return images.ethereum;
    }
  };

  const getChainColor = (chainName: string) => {
    switch (chainName.toLowerCase()) {
      case 'ethereum':
      case 'eth':
        return '#627EEA';
      case 'denergy':
        return '#009D94';
      default:
        return '#627EEA';
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Main Card Header - Always Visible */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={toggleExpanded}
        activeOpacity={0.7}>
        <View style={styles.leftSection}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <DText style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </DText>
          </View>

          {/* Name and Chain */}
          <View style={styles.nameContainer}>
            <DText fontStyle="fontBold" style={styles.contactName}>
              {name}
            </DText>
            <View style={styles.chainRow}>
              <Image
                source={getChainImage(chain)}
                style={styles.chainIcon}
                resizeMode="contain"
              />
              <DText style={[styles.chainText, {color: getChainColor(chain)}]}>
                {chain.toUpperCase()}
              </DText>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {showEditButton && onEdit && contactId && (
              <TouchableOpacity
                style={[styles.iconButton, styles.editButton]}
                onPress={handleEditPress}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <AntDesignIcon name="edit" size={14} color="#4A90E2" />
              </TouchableOpacity>
            )}
            {showDeleteButton && onDelete && contactId && (
              <TouchableOpacity
                style={[styles.iconButton, styles.deleteButton]}
                onPress={handleDeletePress}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <AntDesignIcon name="delete" size={14} color="#FF4757" />
              </TouchableOpacity>
            )}
          </View>

          {/* Expand/Collapse Arrow */}
          <View style={styles.expandButton}>
            <AntDesignIcon
              name={isExpanded ? 'up' : 'down'}
              size={16}
              color="#9CA3AF"
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Expandable Address Section */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <DText style={styles.addressLabel}>Wallet Address</DText>
              <TouchableOpacity
                style={[
                  styles.actionChip,
                  mode === 'select' ? styles.selectChip : styles.copyChip,
                ]}
                onPress={() => handleAddressAction(beneficiaryAddress)}>
                <AntDesignIcon
                  name={mode === 'select' ? 'check' : 'copy1'}
                  size={12}
                  color="#FFFFFF"
                  style={styles.chipIcon}
                />
                <DText style={styles.chipText}>
                  {mode === 'select' ? 'Select' : 'Copy'}
                </DText>
              </TouchableOpacity>
            </View>

            <View style={styles.addressContainer}>
              <DText style={styles.addressText} selectable={true}>
                {beneficiaryAddress}
              </DText>
            </View>
          </View>
        </View>
      )}

      {/* Loading Overlay */}
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <AntDesignIcon name="loading1" size={20} color="#009D94" />
            <DText style={styles.loadingText}>Deleting contact...</DText>
          </View>
        </View>
      )}
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nameContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    color: '#1A1D29',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  chainText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  expandedContent: {
    backgroundColor: '#FAFBFC',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginHorizontal: 16,
  },
  addressSection: {
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#5F6368',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  copyChip: {
    backgroundColor: '#009D94',
  },
  selectChip: {
    backgroundColor: '#009D94',
  },
  chipIcon: {
    marginRight: 3,
  },
  chipText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  addressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  addressText: {
    fontSize: 12,
    color: '#202124',
    fontFamily: 'monospace',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    fontSize: 13,
    color: '#5F6368',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default ContactCard;
