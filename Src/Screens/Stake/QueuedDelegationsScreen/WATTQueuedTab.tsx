import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import images from '../../../Theme/images';
import useWATTQueuedDelegations from '../Hooks/useWATTQueuedDelegations';
import LoaderAnimation from '../../../components/Loading/LoaderAnimation';
import { SnackBarMessage } from '../../../utils/snackBar';
import type { WATTQueuedDelegation, WATTQueuedEntry } from '../Hooks/useWATTQueuedDelegations';

interface WATTQueuedTabProps {
  delegatorAddress: string;
  navigation: any;
}

const WATTQueuedTab: React.FC<WATTQueuedTabProps> = ({ delegatorAddress, navigation }) => {
  const [queuedDelegations, setQueuedDelegations] = useState<WATTQueuedDelegation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data, loading, error: fetchError, fetch } = useWATTQueuedDelegations();

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
        console.error('Error fetching WATT queued delegations:', err);
        setError('Failed to load WATT queued delegations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueuedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatorAddress]);

  useEffect(() => {
    if (data?.unbonding_responses) {
      setQueuedDelegations(data.unbonding_responses);
    }
  }, [data]);

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    if (numAmount >= 1_000_000) return `${(numAmount / 1_000_000).toFixed(2)}M`;
    if (numAmount >= 1_000) return `${(numAmount / 1_000).toFixed(2)}K`;
    return numAmount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    SnackBarMessage(`${label} copied to clipboard`, 'success');
  };

  const truncateAddress = (address: string, startChars = 16, endChars = 10) => {
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoaderAnimation
          size="large"
          color="#009D94"
          showText={true}
          text="Loading WATT queued delegations..."
        />
      </View>
    );
  }

  if (error || fetchError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || fetchError?.message || 'Failed to load WATT queued delegations'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            navigation.replace('QueuedDelegationsScreen', { delegatorAddress })
          }>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (queuedDelegations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No WATT queued delegations found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
      <View style={styles.delegatorAddressContainer}>
        <Text style={styles.delegatorAddressLabel}>Delegator Address:</Text>
        <TouchableOpacity
          style={styles.addressContainer}
          onPress={() => handleCopy(delegatorAddress, 'Delegator Address')}>
          <Text style={styles.addressText}>{truncateAddress(delegatorAddress)}</Text>
          <Image source={images.copyIcon} style={styles.copyIconSmall} />
        </TouchableOpacity>
      </View>

      <View style={styles.countCard}>
        <Text style={styles.countLabel}>Total Queued Delegations:</Text>
        <Text style={styles.countValue}>{data?.pagination?.total || 0}</Text>
      </View>

      {queuedDelegations.map((delegation, idx) => (
        <View key={idx} style={styles.delegationCard}>
          <View style={styles.delegationHeader}>
            <Text style={styles.sectionTitle}>Validator</Text>
            <TouchableOpacity
              style={styles.validatorAddressContainer}
              onPress={() => handleCopy(delegation.validator_address, 'Validator Address')}>
              <Text style={styles.validatorAddress}>
                {truncateAddress(delegation.validator_address, 12, 8)}
              </Text>
              <Image source={images.copyIcon} style={styles.copyIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.entriesSection}>
            <Text style={styles.entriesTitle}>
              Unbonding Entries ({delegation.entries.length}):
            </Text>

            {delegation.entries.map((entry: WATTQueuedEntry, entryIdx) => (
              <View key={entryIdx} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryId}>Entry #{entryIdx + 1}</Text>
                  <Text style={styles.entryAmount}>
                    {formatAmount(entry.balance)} WATT
                  </Text>
                </View>

                <View style={styles.entryDetails}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryLabel}>Initial Balance:</Text>
                    <Text style={styles.entryValue}>
                      {formatAmount(entry.initial_balance)} WATT
                    </Text>
                  </View>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryLabel}>Creation Height:</Text>
                    <Text style={styles.entryValue}>{entry.creation_height}</Text>
                  </View>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryLabel}>Completion Time:</Text>
                    <Text style={styles.entryValue}>
                      {formatDate(entry.completion_time)}
                    </Text>
                  </View>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryLabel}>Shares:</Text>
                    <Text style={styles.entryValue}>{entry.shares}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, padding: 16 },
  delegatorAddressContainer: {
    marginBottom: 16,
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  delegatorAddressLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  addressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressText: { fontSize: 14, color: '#009D94', fontWeight: '500', flex: 1 },
  copyIconSmall: { width: 16, height: 20, tintColor: '#009D94' },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  countLabel: { fontSize: 16, fontWeight: '600', color: '#000' },
  countValue: { fontSize: 18, fontWeight: 'bold', color: '#009D94' },
  delegationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  delegationHeader: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  validatorAddressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  validatorAddress: { fontSize: 14, color: '#009D94', fontWeight: '500' },
  copyIcon: { width: 16, height: 20, tintColor: '#009D94' },
  entriesSection: { gap: 12 },
  entriesTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  entryCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  entryId: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  entryAmount: { fontSize: 14, fontWeight: 'bold', color: '#009D94' },
  entryDetails: { gap: 8 },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryLabel: { fontSize: 12, color: '#666' },
  entryValue: { fontSize: 12, color: '#333', fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#d32f2f', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#009D94', borderRadius: 8, padding: 12, width: 120, alignItems: 'center' },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  bottomPadding: { height: 20 },
});

export default WATTQueuedTab;