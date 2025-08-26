import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import images from '../../Theme/images';
import useValidators from './Hooks/useValidators';
import LoaderAnimation from '../../Componants/Loading/LoaderAnimation';
import {useKycCheck} from '../../CustomHooks/GlobalKycProvider';
import {SnackBarMessage} from '../../utils/snackBar';

// Define interfaces for our data types
interface Validator {
  id: number;
  name: string;
  validatorId: string;
  description: string;
  publicKey: string;
  powerConsumption: number;
  uptime: number;
  slashes: number;
  missedBlocks: number;
  jailed: string;
}

interface Delegator {
  id: number;
  address: string;
  stake: {
    nft: number;
    watt: number;
  };
  rewards: number;
  stakeDate: string;
  lastReward: string;
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
  const {checkKYC, isKycCompleted, isKycSkipped} = useKycCheck();

  // Get the validatorId from route params (assuming it's passed when navigating)
  const validatorId = route.params?.validatorId || 'val_001';
  console.log('validatorId', validatorId);
  // Use our custom hook
  const {singleValidator} = useValidators();

  useEffect(() => {
    const fetchValidatorData = async () => {
      try {
        setIsLoading(true);
        // Adjust the API endpoint as needed
        //FIXME -Move to ENV
        const apiUrl = `https://2f6h4d0go8.execute-api.me-central-1.amazonaws.com/default/staking_getValidators?validatorId=${validatorId}`;
        const response = await singleValidator.fetch(apiUrl);
        console.log(
          '🚀 ~ fetchValidatorData ~ response:',
          JSON.stringify(response, null, 2),
        );

        if (response && response.validator) {
          // Map API response to our component interfaces
          const mappedValidator: Validator = {
            id: 1, // Generate an id if needed
            name: response.validator.validatorName,
            validatorId: response.validator.validatorId,
            description: response.validator.description,
            publicKey: response.validator.publicKey,
            powerConsumption: response.validator.powerConsumption,
            uptime: response.validator.uptime,
            slashes: response.validator.slashes,
            missedBlocks: response.validator.missedBlocks,
            jailed: response.validator.status === 'ACTIVE' ? 'Never' : 'Yes',
          };

          setValidator(mappedValidator);

          // Map delegators if available
          if (response.delegators && response.delegators.length > 0) {
            const mappedDelegators: Delegator[] = response.delegators.map(
              (del, index) => ({
                id: index + 1,
                address: del.delegatorAddress,
                stake: {
                  nft: del.stakedNFT,
                  watt: del.stakedWatt,
                },
                rewards: del.rewardsEarned,
                stakeDate: new Date().toISOString().split('T')[0], // Placeholder, replace if API provides
                lastReward: new Date().toISOString().split('T')[0], // Placeholder, replace if API provides
              }),
            );

            setDelegators(mappedDelegators);
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

  const formatStake = (nft: number, watt: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
      }
      return num.toString();
    };
    return `${nft} NFT + ${formatNumber(watt)} Watt`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: 'short', day: 'numeric'} as const;
    return date.toLocaleDateString('en-US', options);
  };

  const handleOffersClick = async () => {
    if (isKycCompleted) {
      navigation.navigate('StakeScreen', {
        validatorId: validator.validatorId,
      });
    } else {
      await checkKYC({
        onSuccess: () => {
          navigation.navigate('StakeScreen', {
            validatorId: validator.validatorId,
          });
        },
        onSkip: () => {
          SnackBarMessage(
            'Please complete your kyc to access this feature',
            'error',
          );
        },
        onError: error => {
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
            <Image source={images.back} style={{width: 20, height: 20}} />
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
            <Image source={images.back} style={{width: 20, height: 20}} />
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
              navigation.replace('ValidatorDetailsScreen', {validatorId})
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
          <Image source={images.back} style={{width: 20, height: 20}} />
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
          <View style={styles.validatorIdContainer}>
            <Text style={styles.validatorId}>ID: </Text>
            <Text>
              {`${validator.validatorId.slice(
                0,
                16,
              )}...${validator.validatorId.slice(-10)}`}
            </Text>
            {/* <Text style={styles.validatorId}>ID: {validator.validatorId}</Text> */}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.card}>
          {/* <Text style={styles.sectionTitle}>Description:</Text>
          <Text style={styles.description}>"{validator.description}"</Text> */}

          <View style={styles.row}>
            <Text style={styles.label}>Public Key: </Text>
            <TouchableOpacity>
              <Text style={styles.link}>
                {`${validator.publicKey.slice(
                  0,
                  16,
                )}...${validator.publicKey.slice(-10)} (Click to copy)`}
                {/* {validator.publicKey} (Click to copy) */}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Power Consumption: </Text>
            <Text style={styles.value}>{validator.powerConsumption} Watt</Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance Metrics:</Text>

          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Uptime:</Text>
                <Text style={styles.metricValue}>{validator.uptime}%</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Slashes:</Text>
                <Text style={styles.metricValue}>{validator.slashes}</Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Missed Blocks:</Text>
                <Text style={styles.metricValue}>{validator.missedBlocks}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Jailed:</Text>
                <Text style={styles.metricValue}>{validator.jailed}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delegators */}
        <View style={styles.delegatorsSection}>
          <Text style={styles.sectionTitle}>
            Delegators ({delegators.length}):
          </Text>

          <View style={styles.delegatorsList}>
            {delegators.map((delegator, index) => (
              <View key={delegator.id} style={[styles.delegatorCard]}>
                <View style={styles.delegatorHeader}>
                  <Text style={styles.delegatorAddress}>
                    {delegator.address}
                  </Text>
                  <Text style={styles.delegatorRewards}>
                    {delegator.rewards} Rewards
                  </Text>
                </View>

                <View style={styles.delegatorDetails}>
                  <View style={styles.delegatorRow}>
                    <Text style={styles.delegatorLabel}>Stake:</Text>
                    <Text style={styles.delegatorValue}>
                      {formatStake(delegator.stake.nft, delegator.stake.watt)}
                    </Text>
                  </View>

                  <View style={styles.delegatorRow}>
                    <Text style={styles.delegatorLabel}>Stake Date:</Text>
                    <Text style={styles.delegatorValue}>
                      {formatDate(delegator.stakeDate)}
                    </Text>
                  </View>

                  <View style={styles.delegatorRow}>
                    <Text style={styles.delegatorLabel}>Last Reward:</Text>
                    <Text style={styles.delegatorValue}>
                      {formatDate(delegator.lastReward)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
    shadowOffset: {width: 0, height: 1},
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
  },
  validatorId: {
    fontSize: 14,
    color: '#666',
  },
  card: {
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
    shadowOffset: {width: 0, height: 1},
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
    shadowOffset: {width: 0, height: -2},
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
});

export default ValidatorDetailsScreen;
