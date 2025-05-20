import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {fontsFamily} from '../../Theme';
import {BottomSheet} from 'react-native-btr';
import {DButton} from '../../Componants';

// Define interfaces for our data types
interface StakedAsset {
  id: number;
  stakeNumber: string;
  validator: {
    name: string;
    description: string;
  };
  stake: {
    nft: number;
    watt: number;
  };
  startDate: string;
  rewards: number;
  status: 'active' | 'unbonding';
  unbondingTime?: string;
  finalRewards?: number;
}

// Props interface
interface StakedAssetsScreenProps {
  // You can add props here if needed
}

const StakedAssetsScreen: React.FC<StakedAssetsScreenProps> = () => {
  // Sample data
  const stakedAssets: StakedAsset[] = [
    {
      id: 1,
      stakeNumber: 'Stake #1',
      validator: {
        name: 'Validator A',
        description: 'GreenEnergy',
      },
      stake: {
        nft: 50,
        watt: 2000,
      },
      startDate: '2025-01-15',
      rewards: 125,
      status: 'active',
    },
    {
      id: 2,
      stakeNumber: 'Stake #2',
      validator: {
        name: 'Validator B',
        description: '',
      },
      stake: {
        nft: 25,
        watt: 0,
      },
      startDate: '2025-01-10',
      rewards: 0,
      status: 'unbonding',
      unbondingTime: '12 days remaining',
      finalRewards: 45,
    },
  ];

  // State for bottom sheet
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StakedAsset | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const formatStake = (nft: number, watt: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
      }
      return num.toString();
    };

    if (watt > 0) {
      return `${nft} NFT + ${formatNumber(watt)} Watt`;
    }
    return `${nft} NFT`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleAction = (asset: StakedAsset, action: string) => {
    if (action === 'Unstake') {
      setSelectedAsset(asset);
      setSelectedAction(action);
      setBottomSheetVisible(true);
    } else {
      // Handle other actions directly without bottom sheet
      Alert.alert(
        action,
        `${action} ${asset.stakeNumber} with ${asset.validator.name}`,
      );
    }
  };

  const executeAction = () => {
    if (selectedAsset && selectedAction) {
      Alert.alert(
        selectedAction,
        `${selectedAction} ${selectedAsset.stakeNumber} with ${selectedAsset.validator.name}`,
      );
      setBottomSheetVisible(false);
    }
  };

  const renderStakeCard = (asset: StakedAsset) => {
    return (
      <View key={asset.id} style={styles.stakeCard}>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.stakeNumber}>{asset.stakeNumber}</Text>
            {asset.status === 'unbonding' && (
              <View style={styles.unbondingBadge}>
                <Text style={styles.unbondingIcon}>⏱</Text>
                <Text style={styles.unbondingText}>Unbonding</Text>
              </View>
            )}
          </View>
          <View style={styles.stakeAmountContainer}>
            <Text style={styles.stakeAmount}>
              {formatStake(asset.stake.nft, asset.stake.watt)}
            </Text>
          </View>
        </View>

        {/* Validator Info */}
        <View style={styles.validatorInfo}>
          <Text style={styles.validatorLabel}>Validator: </Text>
          <Text style={styles.validatorName}>
            {asset.validator.name}
            {asset.validator.description && ` (${asset.validator.description})`}
          </Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {asset.status === 'active' ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Start Date: {formatDate(asset.startDate)}
                </Text>
                <Text style={styles.detailLabel}>
                  Rewards: {asset.rewards} tokens
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Unbonding Time: {asset.unbondingTime}
                </Text>
                <Text style={styles.detailLabel}>
                  Final Rewards: {asset.finalRewards} tokens
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionButtons}>
          {asset.status === 'active' ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.restakeButton]}
                onPress={() => handleAction(asset, 'Restake')}>
                <Text style={styles.restakeButtonText}>Restake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.unstakeButton]}
                onPress={() => handleAction(asset, 'Unstake')}>
                <Text style={styles.unstakeButtonText}>Unstake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => handleAction(asset, 'Details')}>
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.unbondingInfo}>
              <Text style={styles.unbondingInfoText}>
                Asset is currently unbonding. No actions available.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stakes List */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {stakedAssets.map(renderStakeCard)}
      </ScrollView>

      {/* Bottom Sheet for Actions */}
      <BottomSheet
        visible={bottomSheetVisible}
        onBackButtonPress={() => setBottomSheetVisible(false)}
        onBackdropPress={() => setBottomSheetVisible(false)}>
        <View style={styles.bottomSheetCard}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              Unstake {selectedAsset?.stakeNumber}
            </Text>
            <TouchableOpacity
              onPress={() => setBottomSheetVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedAsset && (
            <View style={styles.bottomSheetContent}>
              <Text style={styles.confirmationText}>
                Are you sure you want to unstake this asset?
              </Text>

              <View style={styles.assetInfo}>
                <Text style={styles.assetInfoText}>
                  {selectedAsset.stakeNumber} - {selectedAsset.validator.name}
                </Text>
                <Text style={styles.assetInfoText}>
                  Amount:{' '}
                  {formatStake(
                    selectedAsset.stake.nft,
                    selectedAsset.stake.watt,
                  )}
                </Text>

                {/* Highlighted Note */}
                <View style={styles.warningContainer}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>
                    Note: Unstaking will start a 21-day unbonding period.
                  </Text>
                </View>
              </View>
            </View>
          )}

          <DButton onPress={executeAction} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm Unstake</Text>
          </DButton>
        </View>
      </BottomSheet>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stakeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  stakeNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  unbondingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  unbondingIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  unbondingText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  stakeAmountContainer: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  stakeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  validatorInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  validatorLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  validatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restakeButton: {
    backgroundColor: '#6C63FF',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  unstakeButton: {
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  detailsButton: {
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  restakeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  unstakeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  unbondingInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  unbondingInfoText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  // Bottom Sheet Styles
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    marginBottom: 15,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#009D94',
  },
  bottomSheetContent: {
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    marginBottom: 2,
  },
  infoSectionValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
    marginBottom: 10,
  },
  warningSection: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  warningList: {
    gap: 6,
  },
  warningItem: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  receiveTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    marginBottom: 5,
    marginTop: 5,
  },
  receiveItem: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  // New styles for highlighted warning
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE39C',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#856404',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  assetInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  assetInfo: {
    marginBottom: 20,
  },
});

export default StakedAssetsScreen;
