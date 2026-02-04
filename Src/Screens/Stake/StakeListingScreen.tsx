import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Clipboard,
  RefreshControl,
} from 'react-native';
import {fontsFamily} from '../../Theme';
import {BottomSheet} from 'react-native-btr';
import {DButton} from '../../components';
import {navigateTo} from '../../utils/navigationService';
import {formatQuantityMWh} from '../../utils';

interface NFTDelegation {
  id: string;
  amount: string;
  createdAt: string;
  delegator: string;
  erc1155Contract: string;
  shares: string;
  tokenId: string;
  updatedAt: string;
  __typename?: string;
}

interface StakedAsset {
  id: string;
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
  originalData?: any; // Can be NFT or WATT data
  stakeType: 'nft' | 'watt';
}

interface StakeListingScreenProps {
  stakedAssets: StakedAsset[];
  loading: boolean;
  error: any;
  refreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
}

const StakeListingScreen: React.FC<StakeListingScreenProps> = ({
  stakedAssets,
  loading,
  error,
  refreshing,
  onRefresh,
  onRetry,
}) => {
  // State for bottom sheet
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [detailsSheetVisible, setDetailsSheetVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StakedAsset | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  // const [expandedAddresses, setExpandedAddresses] = useState<{
  //   [key: string]: boolean;
  // }>({});

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
    return `${nft}`;
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
    } else if (action === 'Details') {
      setSelectedAsset(asset);
      setDetailsSheetVisible(true);
    } else {
      Alert.alert(
        action,
        `${action} ${asset.stakeNumber} with ${asset.validator.name}`,
      );
    }
  };

  const handleAddressPress = (address: string, type: string) => {
    Alert.alert(`${type} Address`, address, [
      {
        text: 'Copy',
        onPress: () => {
          Clipboard.setString(address);
          Alert.alert('Copied!', `${type} address copied to clipboard`);
        },
      },
      {
        text: 'Close',
        style: 'cancel',
      },
    ]);
  };

  const executeAction = () => {
    if (selectedAsset && selectedAction) {
      // Alert.alert(
      //   selectedAction,
      //   `${selectedAction} ${selectedAsset.stakeNumber} with ${selectedAsset.validator.name}`,
      // );
      setBottomSheetVisible(false);
      navigateTo('UnstakeScreen', {
        stakingData: selectedAsset,
      });
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
              {asset.stakeType === 'nft'
                ? formatQuantityMWh(asset.stake.nft)
                : `${asset.stake.watt.toFixed(4)} WATT`}
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
              {/* <TouchableOpacity
                style={[styles.actionButton, styles.restakeButton]}
                onPress={() => handleAction(asset, 'Restake')}>
                <Text style={styles.restakeButtonText}>Restake</Text>
              </TouchableOpacity> */}

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Staked Assets</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any staked assets yet. Start staking to see them here.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error Loading Data</Text>
      <Text style={styles.errorSubtitle}>
        Failed to load staked assets. Please try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#009D94" />
      <Text style={styles.loadingText}>Loading staked assets...</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (stakedAssets.length === 0) {
      return renderEmptyState();
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            colors={['#009D94']} // Android
            tintColor="#009D94" // iOS
            titleColor="#666"
          />
        }>
        {stakedAssets.map(renderStakeCard)}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}

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
                  {selectedAsset.stakeNumber}
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

      {/* Details Bottom Sheet */}
      <BottomSheet
        visible={detailsSheetVisible}
        onBackButtonPress={() => setDetailsSheetVisible(false)}
        onBackdropPress={() => setDetailsSheetVisible(false)}>
        <View style={styles.bottomSheetCard}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Delegation Details</Text>
            <TouchableOpacity
              onPress={() => setDetailsSheetVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedAsset && selectedAsset.originalData && (
            <ScrollView
              style={styles.detailsScrollView}
              showsVerticalScrollIndicator={false}>
              <View style={styles.detailsContent}>
                {/* Token Information - NFT Stakes */}
                {selectedAsset.stakeType === 'nft' && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      NFT Stake Information
                    </Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Token ID:</Text>
                      <View style={styles.tokenIdBadge}>
                        <Text style={styles.tokenIdText}>
                          {selectedAsset.originalData.tokenId}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Balance:</Text>
                      <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>
                          {selectedAsset.originalData.balance} NFT
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Shares:</Text>
                      <View style={styles.sharesBadge}>
                        <Text style={styles.sharesText}>
                          {(
                            parseFloat(selectedAsset.originalData.shares) / 1e18
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 4,
                            minimumFractionDigits: 0,
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* WATT Stake Information */}
                {selectedAsset.stakeType === 'watt' && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      WATT Stake Information
                    </Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount (WATT):</Text>
                      <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>
                          {selectedAsset.originalData.balanceInWATT.toFixed(4)} WATT
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount (awatt):</Text>
                      <View style={styles.sharesBadge}>
                        <Text style={styles.sharesText}>
                          {selectedAsset.originalData.balanceInAwatt}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Shares:</Text>
                      <View style={styles.sharesBadge}>
                        <Text style={styles.sharesText}>
                          {parseFloat(selectedAsset.originalData.shares).toFixed(4)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Address Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Address Information
                  </Text>
                  <View style={styles.addressDetailRow}>
                    <Text style={styles.detailLabel}>Delegator Address:</Text>
                    <TouchableOpacity
                      style={styles.addressContainer}
                      onPress={() =>
                        handleAddressPress(
                          selectedAsset.originalData!.delegatorAddress,
                          'Delegator',
                        )
                      }>
                      <Text style={styles.addressText}>
                        {`${selectedAsset.originalData.delegatorAddress.slice(
                          0,
                          16,
                        )}...${selectedAsset.originalData.delegatorAddress.slice(
                          -10,
                        )}`}
                      </Text>
                      <Text style={styles.copyIcon}>📋</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.addressDetailRow}>
                    <Text style={styles.detailLabel}>Validator Address:</Text>
                    <TouchableOpacity
                      style={styles.addressContainer}
                      onPress={() =>
                        handleAddressPress(
                          selectedAsset.originalData!.validatorAddress,
                          'Validator',
                        )
                      }>
                      <Text style={styles.addressText}>
                        {`${selectedAsset.originalData.validatorAddress.slice(
                          0,
                          16,
                        )}...${selectedAsset.originalData.validatorAddress.slice(
                          -10,
                        )}`}
                      </Text>
                      <Text style={styles.copyIcon}>📋</Text>
                    </TouchableOpacity>
                  </View>
                  {selectedAsset.stakeType === 'nft' && (
                    <View style={styles.addressDetailRow}>
                      <Text style={styles.detailLabel}>Contract Address:</Text>
                      <TouchableOpacity
                        style={styles.addressContainer}
                        onPress={() =>
                          handleAddressPress(
                            selectedAsset.originalData!.nftContractAddress,
                            'Contract',
                          )
                        }>
                        <Text style={styles.addressText}>
                          {`${selectedAsset.originalData.nftContractAddress.slice(
                            0,
                            16,
                          )}...${selectedAsset.originalData.nftContractAddress.slice(
                            -10,
                          )}`}
                        </Text>
                        <Text style={styles.copyIcon}>📋</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

              </View>
            </ScrollView>
          )}
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
    paddingTop: 10,
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
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 32,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
    textAlign: 'center',
  },
  // Empty state and error handling styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  retryButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  // Details Bottom Sheet Styles
  detailsScrollView: {
    maxHeight: 500,
  },
  detailsContent: {
    paddingBottom: 20,
  },
  detailSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    marginBottom: 12,
  },
  addressDetailRow: {
    marginBottom: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
    flex: 1,
    textAlign: 'right',
  },
  // Address styling
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 4,
    minHeight: 44,
  },
  addressText: {
    fontSize: 14,
    color: '#007bff',
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 20,
  },
  copyIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
  // Badge styles
  amountBadge: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b3d7ff',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0056b3',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  sharesBadge: {
    backgroundColor: '#f0f9f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b3e6b3',
  },
  sharesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  tokenIdBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  tokenIdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
});

export default StakeListingScreen;
