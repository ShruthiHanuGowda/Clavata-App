import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import images from '../../../Theme/images';
import useQueuedDelegations from '../Hooks/useQueuedDelegations';
import LoaderAnimation from '../../../components/Loading/LoaderAnimation';
import {SnackBarMessage} from '../../../utils/snackBar';
import type {QueuedDelegation, QueuedEntry} from '../Hooks/useQueuedDelegations';

interface NFTQueuedTabProps {
  delegatorAddress: string;
  navigation: any;
}

const NFTQueuedTab: React.FC<NFTQueuedTabProps> = ({
  delegatorAddress,
  navigation,
}) => {
  const [queuedDelegations, setQueuedDelegations] = useState<
    QueuedDelegation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {data, loading, error: fetchError, fetch} = useQueuedDelegations();

  useEffect(() => {
    const fetchQueuedData = async () => {
      if (!delegatorAddress) {
        setError('No delegator address provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await fetch(delegatorAddress);
      } catch (err) {
        console.error('Error fetching queued delegations:', err);
        setError('Failed to load queued delegations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueuedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatorAddress]);

  useEffect(() => {
    if (data?.queued_delegations) {
      setQueuedDelegations(data.queued_delegations);
    }
  }, [data]);

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount >= 1000000) {
      return `${(numAmount / 1000000).toFixed(2)}M`;
    } else if (numAmount >= 1000) {
      return `${(numAmount / 1000).toFixed(2)}K`;
    }
    return numAmount.toLocaleString();
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    SnackBarMessage(`${label} copied to clipboard`, 'success');
  };

  const truncateAddress = (address: string, startChars = 16, endChars = 10) => {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  // Show loading state
  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoaderAnimation
          size="large"
          color="#009D94"
          showText={true}
          text="Loading queued delegations..."
        />
      </View>
    );
  }

  // Show error state
  if (error || fetchError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || fetchError?.message || 'Failed to load queued delegations'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            navigation.replace('QueuedDelegationsScreen', {delegatorAddress})
          }>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state
  if (queuedDelegations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No queued delegations found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.content}
      bounces={false}
      showsVerticalScrollIndicator={false}>
        {/* Delegator Address Section */}
        <View style={styles.delegatorAddressContainer}>
          <Text style={styles.delegatorAddressLabel}>Delegator Address:</Text>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={() =>
              handleCopy(delegatorAddress, 'Delegator Address')
            }>
            <Text style={styles.addressText}>
              {truncateAddress(delegatorAddress)}
            </Text>
            <Image source={images.copyIcon} style={styles.copyIconSmall} />
          </TouchableOpacity>
        </View>

        {/* Total Count */}
        <View style={styles.countCard}>
          <Text style={styles.countLabel}>Total Queued Delegations:</Text>
          <Text style={styles.countValue}>{data?.pagination?.total || 0}</Text>
        </View>

        {/* Queued Delegations List */}
        {queuedDelegations.map((delegation, delegationIndex) => (
          <View key={delegationIndex} style={styles.delegationCard}>
            {/* Validator Address */}
            <View style={styles.delegationHeader}>
              <Text style={styles.sectionTitle}>Validator</Text>
              <TouchableOpacity
                style={styles.validatorAddressContainer}
                onPress={() =>
                  handleCopy(delegation.validator_address, 'Validator Address')
                }>
                <Text style={styles.validatorAddress}>
                  {truncateAddress(delegation.validator_address, 12, 8)}
                </Text>
                <Image source={images.copyIcon} style={styles.copyIcon} />
              </TouchableOpacity>
            </View>

            {/* Entries */}
            <View style={styles.entriesSection}>
              <Text style={styles.entriesTitle}>
                Queued Entries ({delegation.entries.length}):
              </Text>

              {delegation.entries.map((entry: QueuedEntry, entryIndex) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryId}>Entry #{entry.id}</Text>
                    <Text style={styles.entryAmount}>
                      {formatAmount(entry.amount)} WATT
                    </Text>
                  </View>

                  <View style={styles.entryDetails}>
                    <View style={styles.entryRow}>
                      <Text style={styles.entryLabel}>Creation Epoch:</Text>
                      <Text style={styles.entryValue}>
                        {entry.creation_epoch}
                      </Text>
                    </View>

                    <View style={styles.entryRow}>
                      <Text style={styles.entryLabel}>Activation Epoch:</Text>
                      <Text style={styles.entryValue}>
                        {entry.activation_epoch}
                      </Text>
                    </View>

                    <View style={styles.entryRow}>
                      <Text style={styles.entryLabel}>Token ID:</Text>
                      <Text style={styles.entryValue}>{entry.token_id}</Text>
                    </View>

                    <View style={styles.entryRow}>
                      <Text style={styles.entryLabel}>NFT Contract:</Text>
                      <TouchableOpacity
                        style={styles.contractAddressContainer}
                        onPress={() =>
                          handleCopy(
                            entry.nft_contract_address,
                            'Contract Address',
                          )
                        }>
                        <Text style={styles.contractAddress}>
                          {truncateAddress(entry.nft_contract_address, 10, 6)}
                        </Text>
                        <Image
                          source={images.copyIcon}
                          style={styles.copyIconSmall}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  delegatorAddressContainer: {
    marginBottom: 16,
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  delegatorAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#009D94',
    fontWeight: '500',
    flex: 1,
  },
  copyIconSmall: {
    width: 16,
    height: 20,
    tintColor: '#009D94',
  },
  countCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  countLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  countValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009D94',
  },
  delegationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  delegationHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  validatorAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validatorAddress: {
    fontSize: 14,
    color: '#009D94',
    fontWeight: '500',
  },
  copyIcon: {
    width: 16,
    height: 20,
    tintColor: '#009D94',
  },
  entriesSection: {
    gap: 12,
  },
  entriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  entryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  entryId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  entryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#009D94',
  },
  entryDetails: {
    gap: 8,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLabel: {
    fontSize: 12,
    color: '#666',
  },
  entryValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  contractAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contractAddress: {
    fontSize: 12,
    color: '#009D94',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 12,
    width: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default NFTQueuedTab;
