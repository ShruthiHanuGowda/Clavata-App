import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import axios from 'axios';
import images from '../../Theme/images';
import LoaderAnimation from '../../components/Loading/LoaderAnimation';
import { useKycCheck } from '../../providers';
import { SnackBarMessage } from '../../utils/snackBar';
import { VALIDATORS_API_URL } from '../../constants';

interface Validator {
  id: number;
  name: string;
  validatorId: string;
  description: string;
  publicKey: string;
  tokens: string;
  commissionRate: number;
  maxCommissionRate: number;
  maxChangeRate: number;
  minSelfDelegation: string;
  jailed: boolean;
  status: string;
  unbondingHeight: string;
  unbondingTime: string;
  country: string;
}

interface Delegator {
  id: number;
  address: string;
  shares: string;
  balance: string;
}

// Cosmos SDK response interfaces
interface CosmosValidatorResponse {
  validator: {
    operator_address: string;
    consensus_pubkey: {
      '@type': string;
      key: string;
    };
    jailed: boolean;
    status: string;
    tokens: string;
    delegator_shares: string;
    description: {
      moniker: string;
      identity: string;
      website: string;
      security_contact: string;
      details: string;
    };
    unbonding_height: string;
    unbonding_time: string;
    commission: {
      commission_rates: {
        rate: string;
        max_rate: string;
        max_change_rate: string;
      };
      update_time: string;
    };
    min_self_delegation: string;
    country?: string;
  };
}

interface CosmosDelegationsResponse {
  delegation_responses: Array<{
    delegation: {
      delegator_address: string;
      validator_address: string;
      shares: string;
    };
    balance: {
      denom: string;
      amount: string;
    };
  }>;
  pagination: {
    next_key: string | null;
    total: string;
  };
}

const ValidatorDetailsScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const [validator, setValidator] = useState<Validator | null>(null);
  const [delegators, setDelegators] = useState<Delegator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkKYC, isKycCompleted } = useKycCheck();

  const validatorId = route.params?.validatorId || 'val_001';

  // Helper function to format status
  const formatStatus = (status: string): string => {
    switch (status) {
      case 'BOND_STATUS_BONDED':
        return 'Bonded';
      case 'BOND_STATUS_UNBONDING':
        return 'Unbonding';
      case 'BOND_STATUS_UNBONDED':
        return 'Unbonded';
      case 'BOND_STATUS_UNSPECIFIED':
        return 'Unspecified';
      default:
        return status;
    }
  };

  // Helper function to convert tokens from wei
  const formatTokens = (tokens: string): string => {
    if (!tokens) return '0';
    // Handle decimal strings by removing the decimal part before BigInt conversion
    const tokensStr = tokens.split('.')[0];
    try {
      const tokensInWei = BigInt(tokensStr);
      const formatted = Number(tokensInWei / BigInt(10 ** 18));
      return formatted.toLocaleString();
    } catch {
      return '0';
    }
  };

  useEffect(() => {
    const fetchValidatorData = async () => {
      try {
        setIsLoading(true);

        // Fetch validator details from Cosmos SDK
        const validatorUrl = `${VALIDATORS_API_URL}/${validatorId}`;
        console.log("validatorUrl", validatorUrl);
        const validatorResponse = await axios.get<CosmosValidatorResponse>(validatorUrl);

        if (validatorResponse.data && validatorResponse.data.validator) {
          const v = validatorResponse.data.validator;
          const mappedValidator: Validator = {
            id: 1,
            name: v.description?.moniker || 'Unknown',
            validatorId: v.operator_address,
            description: v.description?.details || '',
            publicKey: v.consensus_pubkey?.key || '',
            tokens: v.tokens || '0',
            commissionRate: parseFloat(v.commission?.commission_rates?.rate || '0') * 100,
            maxCommissionRate: parseFloat(v.commission?.commission_rates?.max_rate || '0') * 100,
            maxChangeRate: parseFloat(v.commission?.commission_rates?.max_change_rate || '0') * 100,
            minSelfDelegation: v.min_self_delegation || '0',
            jailed: v.jailed || false,
            status: v.status || 'BOND_STATUS_UNSPECIFIED',
            unbondingHeight: v.unbonding_height || '0',
            unbondingTime: v.unbonding_time || '',
            country: v.country || '',
          };

          setValidator(mappedValidator);

          // Fetch delegations for this validator
          try {
            const delegationsUrl = `${VALIDATORS_API_URL}/${validatorId}/delegations`;
            const delegationsResponse = await axios.get<CosmosDelegationsResponse>(delegationsUrl);

            if (delegationsResponse.data?.delegation_responses) {
              const mappedDelegators: Delegator[] = delegationsResponse.data.delegation_responses.map(
                (del, index) => ({
                  id: index + 1,
                  address: del.delegation.delegator_address,
                  shares: del.delegation.shares,
                  balance: del.balance.amount,
                }),
              );
              setDelegators(mappedDelegators);
            }
          } catch (delegationErr) {
            console.log('No delegations found or error fetching delegations:', delegationErr);
            // Don't fail the whole screen if delegations fail
          }
        }
      } catch (err) {
        console.error('Error fetching validator data:', err);
        setError('Failed to load validator data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchValidatorData();
  }, [validatorId]);

  const formatBalance = (balance: string): string => {
    if (!balance) return '0';
    // Handle decimal strings by removing the decimal part before BigInt conversion
    const balanceStr = balance.split('.')[0];
    try {
      const balanceInWei = BigInt(balanceStr);
      const formatted = Number(balanceInWei / BigInt(10 ** 18));
      return formatted.toLocaleString();
    } catch {
      return '0';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '1970-01-01T00:00:00Z') return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' } as const;
    return date.toLocaleDateString('en-US', options);
  };

  const truncateAddress = (address: string, startChars = 12, endChars = 8) => {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    SnackBarMessage(`${label} copied to clipboard`, 'success');
  };

  const handleOffersClick = async () => {
    if (isKycCompleted && validator) {
      navigation.navigate('StakeScreen', {
        validatorId: validator.validatorId,
        validatorCountry: validator.country,
      });
    } else {
      await checkKYC({
        onSuccess: () => {
          if (validator) {
            navigation.navigate('StakeScreen', {
              validatorId: validator.validatorId,
              validatorCountry: validator.country,
            });
          }
        },
        onSkip: () => {
          SnackBarMessage(
            'Please complete your kyc to access this feature',
            'error',
          );
        },
        onError: () => {
          SnackBarMessage(
            'Please complete your kyc to access this feature',
            'error',
          );
        },
        showAlerts: false,
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image source={images.back} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Validator Details</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.loadingContainer}>
          {/* <ActivityIndicator size="large" color="#009D94" />
          <Text style={styles.loadingText}>Loading validator data...</Text> */}
          <LoaderAnimation
            size="large"
            color="#009D94"
            showText={true}
            text="Loading validator data..."
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !validator) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image source={images.back} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Validator Details</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Failed to load validator data'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              navigation.replace('ValidatorDetailsScreen', { validatorId })
            }>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={images.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validator Details</Text>
        <View style={styles.spacer} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {/* Validator Name Section */}
        <View style={styles.validatorNameContainer}>
          <Text style={styles.validatorName}>{validator.name}</Text>
          <TouchableOpacity
            style={styles.validatorIdContainer}
            onPress={() => handleCopy(validator.validatorId, 'Validator ID')}>
            <Text style={styles.validatorId}>ID: </Text>
            <Text style={styles.validatorIdText}>
              {`${validator.validatorId.slice(
                0,
                16,
              )}...${validator.validatorId.slice(-10)}`}
            </Text>
            <Image source={images.copyIcon} style={styles.copyIconSmall} />
          </TouchableOpacity>
          {validator.country ? (
            <Text style={styles.countryText}>Country: {validator.country}</Text>
          ) : null}
        </View>

        {/* Validator Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Validator Info</Text>

          {validator.publicKey ? (
            <View style={styles.row}>
              <Text style={styles.label}>Public Key: </Text>
              <TouchableOpacity
                style={styles.publicKeyContainer}
                onPress={() => handleCopy(validator.publicKey, 'Public Key')}>
                <Text style={styles.link}>
                  {`${validator.publicKey.slice(
                    0,
                    12,
                  )}...${validator.publicKey.slice(-8)}`}
                </Text>
                <Image source={images.copyIcon} style={styles.copyIcon} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.label}>Total Tokens: </Text>
            <Text style={styles.value}>{formatTokens(validator.tokens)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status: </Text>
            <Text style={[
              styles.value,
              validator.status === 'BOND_STATUS_BONDED' ? styles.statusActive : styles.statusInactive
            ]}>
              {formatStatus(validator.status)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Jailed: </Text>
            <Text style={[
              styles.value,
              validator.jailed ? styles.statusInactive : styles.statusActive
            ]}>
              {validator.jailed ? 'Yes' : 'No'}
            </Text>
          </View>

          {validator.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.label}>Description: </Text>
              <Text style={styles.description}>{validator.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Commission Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Commission</Text>

          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Rate:</Text>
                <Text style={styles.metricValue}>{validator.commissionRate.toFixed(2)}%</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Max Rate:</Text>
                <Text style={styles.metricValue}>{validator.maxCommissionRate.toFixed(2)}%</Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Max Change:</Text>
                <Text style={styles.metricValue}>{validator.maxChangeRate.toFixed(2)}%</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Min Self:</Text>
                <Text style={styles.metricValue}>{validator.minSelfDelegation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Unbonding Info (if applicable) */}
        {validator.unbondingHeight !== '0' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Unbonding Info</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Unbonding Height: </Text>
              <Text style={styles.value}>{validator.unbondingHeight}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Unbonding Time: </Text>
              <Text style={styles.value}>{formatDate(validator.unbondingTime)}</Text>
            </View>
          </View>
        )}

        {/* Delegators */}
        <View style={styles.delegatorsSection}>
          <Text style={styles.sectionTitle}>
            Delegators ({delegators.length}):
          </Text>

          {delegators.length === 0 ? (
            <View style={styles.noDelegatorsContainer}>
              <Text style={styles.noDelegatorsText}>No delegators found</Text>
            </View>
          ) : (
            <View style={styles.delegatorsList}>
              {delegators.map(delegator => (
                <View key={delegator.id} style={styles.delegatorCard}>
                  <View style={styles.delegatorHeader}>
                    <Text style={styles.delegatorAddress} numberOfLines={1}>
                      {truncateAddress(delegator.address)}
                    </Text>
                  </View>

                  <View style={styles.delegatorDetails}>
                    <View style={styles.delegatorRow}>
                      <Text style={styles.delegatorLabel}>Balance:</Text>
                      <Text style={styles.delegatorValue}>
                        {formatBalance(delegator.balance)}
                      </Text>
                    </View>

                    <View style={styles.delegatorRow}>
                      <Text style={styles.delegatorLabel}>Shares:</Text>
                      <Text style={styles.delegatorValue}>
                        {formatBalance(delegator.shares)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom padding for fixed button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Stake Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.stakeButton}
          onPress={() => {
            handleOffersClick();
          }}>
          <Text style={styles.stakeButtonText}>Stake</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 26,
    color: '#000',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // New styles for validator name
  validatorNameContainer: {
    marginBottom: 16,
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  validatorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#009D94',
    marginBottom: 4,
  },
  validatorIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validatorId: {
    fontSize: 14,
    color: '#666',
  },
  validatorIdText: {
    fontSize: 14,
    color: '#666',
  },
  countryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  copyIconSmall: {
    width: 16,
    height: 20,
    tintColor: '#009D94',
    marginLeft: 4,
  },
  publicKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  copyIcon: {
    width: 16,
    height: 20,
    tintColor: '#009D94',
  },
  card: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  statusActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusInactive: {
    color: '#F44336',
    fontWeight: '600',
  },
  noDelegatorsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noDelegatorsText: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  link: {
    fontSize: 14,
    color: '#009D94',
    textDecorationLine: 'underline',
  },
  metricsContainer: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#333',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  delegatorsSection: {
    marginBottom: 16,
  },
  delegatorsList: {
    maxHeight: 400,
  },
  delegatorCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  delegatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  delegatorAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  delegatorRewards: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#009D94',
  },
  delegatorDetails: {
    gap: 4,
  },
  delegatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  delegatorLabel: {
    fontSize: 12,
    color: '#666',
  },
  delegatorValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 80,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stakeButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  stakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  backIcon: {
    width: 20,
    height: 20,
  },
  viewQueuedButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  viewQueuedButtonText: {
    fontSize: 13,
    color: '#009D94',
    fontWeight: '600',
  },
});

export default ValidatorDetailsScreen;
