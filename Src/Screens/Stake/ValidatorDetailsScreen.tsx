import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import images from '../../Theme/images';

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

const ValidatorDetailsScreen = ({navigation}: {navigation: any}) => {
  // Static validator data
  const validator: Validator = {
    id: 1,
    name: 'Validator A',
    validatorId: 'val_001',
    description:
      'GreenEnergy - Sustainable validator focused on renewable energy',
    publicKey: '0x1a2b3c...7f8g',
    powerConsumption: 150,
    uptime: 99.8,
    slashes: 0,
    missedBlocks: 12,
    jailed: 'Never',
  };

  // Static delegators data
  const delegators: Delegator[] = [
    {
      id: 1,
      address: '0x1234...5678',
      stake: {nft: 50, watt: 2000},
      rewards: 125,
      stakeDate: '2024-01-15',
      lastReward: '2024-05-18',
    },
    {
      id: 2,
      address: '0x9abc...def0',
      stake: {nft: 25, watt: 1000},
      rewards: 62,
      stakeDate: '2024-02-20',
      lastReward: '2024-05-17',
    },
    {
      id: 3,
      address: '0xfedc...ba98',
      stake: {nft: 75, watt: 3000},
      rewards: 188,
      stakeDate: '2024-01-08',
      lastReward: '2024-05-19',
    },
    {
      id: 4,
      address: '0x5f6e...d9c8',
      stake: {nft: 30, watt: 1500},
      rewards: 87,
      stakeDate: '2024-03-10',
      lastReward: '2024-05-16',
    },
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={images.back} style={{width: 20, height: 20}} />
          {/* <Text style={styles.backText}>←</Text> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validator Details</Text>
        <View style={styles.spacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Description Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description:</Text>
          <Text style={styles.description}>"{validator.description}"</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Public Key: </Text>
            <TouchableOpacity>
              <Text style={styles.link}>
                {validator.publicKey} (Click to copy)
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

          <ScrollView
            style={styles.delegatorsList}
            bounces={false}
            showsVerticalScrollIndicator={false}>
            {delegators.map((delegator, index) => (
              <View
                key={delegator.id}
                style={[
                  styles.delegatorCard,
                  index === delegators.length - 1 && {
                    marginBottom: 100,
                  },
                ]}>
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
          </ScrollView>
        </View>

        {/* Bottom padding for fixed button */}
        <View style={styles.bottomPadding} />
      </View>

      {/* Fixed Stake Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.stakeButton}
          onPress={() => {
            navigation.navigate('StakeScreen');
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
});

export default ValidatorDetailsScreen;
