import React, {useEffect, useState, useCallback, JSX} from 'react';
import {Header} from '@rneui/base';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {DText} from '../../components/DText';
import {Tab} from '@rneui/base';
import {fontsFamily} from '../../Theme';
import StakeListingScreen from './StakeListingScreen';
import ValidatorsScreen from './ValidatorsScreen';
import useValidators from './Hooks/useValidators';
import {useAuth} from '../../providers';
import NFTQueuedTab from './QueuedDelegationsScreen/NFTQueuedTab';
import WATTQueuedTab from './QueuedDelegationsScreen/WATTQueuedTab';

// Define interfaces

interface FontFamily {
  MulishExtraBold: string;
  MulishBold: string;
  // Add other font properties as needed
}

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
  originalData?: NFTDelegation;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    width: 200,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  simpleContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContentText: {
    // Add appropriate styles if needed
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  tabIndicator: {
    backgroundColor: 'transparent',
  },
  tabStyle: {
    backgroundColor: 'transparent',
  },
  subTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  subTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeSubTab: {
    borderBottomColor: '#009D94',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeSubTabText: {
    color: '#009D94',
  },
});

// Tab content components
const TotalPoolsContent: React.FC = () => (
  <View style={styles.simpleContent}>
    <ValidatorsScreen />
  </View>
);

interface StakedPoolsContentProps {
  stakedAssets: StakedAsset[];
  loading: boolean;
  error: any;
  refreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  delegatorAddress: string;
  navigation: any;
}

type SubTabType = 'staked' | 'queued';

const StakedPoolsContent: React.FC<StakedPoolsContentProps> = ({
  stakedAssets,
  loading,
  error,
  refreshing,
  onRefresh,
  onRetry,
  delegatorAddress,
  navigation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('staked');

  return (
    <View style={styles.simpleContent}>
      {/* Sub Tab Navigation */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'staked' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('staked')}>
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'staked' && styles.activeSubTabText,
            ]}>
            Staked
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'queued' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('queued')}>
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'queued' && styles.activeSubTabText,
            ]}>
            Queued
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tab Content */}
      {activeSubTab === 'staked' ? (
        <StakeListingScreen
          stakedAssets={stakedAssets}
          loading={loading}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onRetry={onRetry}
        />
      ) : (
        <NFTQueuedTab
          delegatorAddress={delegatorAddress}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const StokedPoolsContent: React.FC<StakedPoolsContentProps> = ({
  stakedAssets,
  loading,
  error,
  refreshing,
  onRefresh,
  onRetry,
  delegatorAddress,
  navigation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('staked');

  return (
    <View style={styles.simpleContent}>
      {/* Sub Tab Navigation */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'staked' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('staked')}>
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'staked' && styles.activeSubTabText,
            ]}>
            Staked
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'queued' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('queued')}>
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'queued' && styles.activeSubTabText,
            ]}>
            Queued
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tab Content */}
      {activeSubTab === 'staked' ? (
        <StakeListingScreen
          stakedAssets={stakedAssets}
          loading={loading}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onRetry={onRetry}
        />
      ) : (
        <WATTQueuedTab
          delegatorAddress={delegatorAddress}
          navigation={navigation}
        />
      )}
    </View>
  );
};

interface StakeProps {
  navigation?: any;
}

function Stake({navigation}: StakeProps): JSX.Element {
  const [index, setIndex] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processedAssets, setProcessedAssets] = useState<StakedAsset[]>([]);

  const {userDetails} = useAuth();
  const {stakedPool} = useValidators();
  const {
    data: stakedPoolData,
    loading: stakedPoolLoading,
    error: stakedPoolError,
    fetch: fetchStakedPool,
  } = stakedPool;

  const TAB_ITEMS: readonly string[] = [
    'Total Pools',
    'Staked Pools',
    'Stoked EACs',
  ];

  // Fetch staked pool data
  const fetchStakedPoolData = useCallback(() => {
    if (userDetails?.userWallet) {
      fetchStakedPool({
        delegatorAddress: userDetails.userWallet,
        first: 20,
        orderBy: 'createdAt',
        orderDirection: 'desc',
        skip: 0,
      });
    }
  }, [userDetails?.userWallet, fetchStakedPool]);

  // Initial data fetch
  useEffect(() => {
    if (isInitialLoad && userDetails?.userWallet) {
      fetchStakedPoolData();
      setIsInitialLoad(false);
    }
  }, [userDetails?.userWallet, fetchStakedPoolData, isInitialLoad]);

  // Process API data into UI format
  useEffect(() => {
    if (stakedPoolData && Array.isArray(stakedPoolData)) {
      const processed = stakedPoolData.map(
        (item: NFTDelegation, _index: number) => {
          const startDate = new Date(parseInt(item.createdAt, 10) * 1000)
            .toISOString()
            .split('T')[0];

          const stakeAmount = parseInt(item.amount, 10);
          const tokenId = parseInt(item.tokenId, 10);

          return {
            id: item.id,
            stakeNumber: `Token ID ${tokenId}`,
            validator: {
              name: `Validator ${tokenId}`,
              description: item.erc1155Contract.slice(0, 10) + '...',
            },
            stake: {
              nft: stakeAmount,
              watt: 0,
            },
            startDate: startDate,
            rewards: Math.floor(Math.random() * 100),
            status: 'active' as const,
            originalData: item,
          };
        },
      ) as StakedAsset[];

      setProcessedAssets(processed);
    }
  }, [stakedPoolData]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStakedPoolData();

    // Reset refreshing state after fetch completes or after timeout
    const timeoutId = setTimeout(() => {
      setRefreshing(false);
    }, 2000);

    // Also listen for when loading stops
    if (!stakedPoolLoading) {
      clearTimeout(timeoutId);
      setRefreshing(false);
    }

    return () => clearTimeout(timeoutId);
  }, [fetchStakedPoolData, stakedPoolLoading]);

  // Handle retry for errors
  const handleRetry = useCallback(() => {
    setIsInitialLoad(true);
    fetchStakedPoolData();
  }, [fetchStakedPoolData]);

  // Reset refreshing state when loading completes
  useEffect(() => {
    if (!stakedPoolLoading && refreshing) {
      const timer = setTimeout(() => {
        setRefreshing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stakedPoolLoading, refreshing]);

  return (
    <View style={styles.container}>
      <Header
        containerStyle={styles.headerContainer}
        backgroundColor={'#FFF'}
        leftComponent={
          <View style={styles.nameContainer}>
            <DText style={styles.title} fontStyle="fontBold">
              Stake EACs
            </DText>
          </View>
        }
      />
      <View style={styles.container}>
        <Tab
          value={index}
          onChange={setIndex}
          variant="primary"
          indicatorStyle={styles.tabIndicator}
          style={styles.tabStyle}>
          {TAB_ITEMS.map((tab, i) => (
            <Tab.Item
              key={i}
              containerStyle={(active: boolean) => ({
                borderBottomColor: active ? '#009D94' : '#E1E1E1',
                borderBottomWidth: active ? 2 : 1.4,
                backgroundColor: 'transparent',
              })}
              title={tab}
              titleStyle={(active: boolean) => ({
                color: active ? '#000' : '#989898',
                fontFamily: active
                  ? (fontsFamily as FontFamily).MulishExtraBold
                  : (fontsFamily as FontFamily).MulishBold,
                fontSize: 14,
              })}
            />
          ))}
        </Tab>

        <View style={styles.contentContainer}>
          {index === 0 && <TotalPoolsContent />}
          {index === 1 && (
            <StakedPoolsContent
              stakedAssets={processedAssets}
              loading={stakedPoolLoading && !refreshing}
              error={stakedPoolError}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onRetry={handleRetry}
              delegatorAddress={userDetails?.userWallet || ''}
              navigation={navigation}
            />
          )}
          {index === 2 && (
            <StokedPoolsContent
              stakedAssets={processedAssets}
              loading={stakedPoolLoading && !refreshing}
              error={stakedPoolError}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onRetry={handleRetry}
              delegatorAddress={userDetails?.userWallet || ''}
              navigation={navigation}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default Stake;
