import React, { useEffect, useState, useCallback, JSX } from 'react';
import { Header } from '@rneui/base';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { DText } from '../../components/DText';
import { Tab } from '@rneui/base';
import { fontsFamily } from '../../Theme';
import StakeListingScreen from './StakeListingScreen';
import ValidatorsScreen from './ValidatorsScreen';
import useNFTStakedAssets from './Hooks/useNFTStakedAssets';
import useWATTStakedAssets from './Hooks/useWATTStakedAssets';
import { useAuth } from '../../providers';
import { WATT_STAKED_ASSETS_API_URL } from '../../constants';
import NFTQueuedTab from './QueuedDelegationsScreen/NFTQueuedTab';
import WATTQueuedTab from './QueuedDelegationsScreen/WATTQueuedTab';

// Define interfaces

interface FontFamily {
  MulishExtraBold: string;
  MulishBold: string;
  // Add other font properties as needed
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
  originalData?: any; // Stores original LCD API data (NFT or WATT)
  stakeType: 'nft' | 'watt'; // Identifies the type of stake
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

function Stake({ navigation }: StakeProps): JSX.Element {
  const [index, setIndex] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processedNFTAssets, setProcessedNFTAssets] = useState<StakedAsset[]>([]);
  const [processedWATTAssets, setProcessedWATTAssets] = useState<StakedAsset[]>([]);

  const { userDetails } = useAuth();

  // NFT Staked Assets hook
  const nftStakedAssets = useNFTStakedAssets();
  const {
    data: nftStakedData,
    loading: nftStakedLoading,
    error: nftStakedError,
    fetch: fetchNFTStaked,
  } = nftStakedAssets;

  // WATT Staked Assets hook
  const wattStakedAssets = useWATTStakedAssets();
  const {
    data: wattStakedData,
    loading: wattStakedLoading,
    error: wattStakedError,
    fetch: fetchWATTStaked,
  } = wattStakedAssets;

  const TAB_ITEMS: readonly string[] = [
    'Total Pools',
    'Staked Pools',
    'Stoked EACs',
  ];

  // Fetch staked pool data from LCD APIs
  const fetchStakedPoolData = useCallback(() => {
    if (userDetails?.userWallet) {
      console.log("Calling LCD APIs for wallet:", userDetails.userWallet);

      // Fetch NFT staked assets from LCD API
      fetchNFTStaked(userDetails.userWallet, 50);

      // Fetch WATT staked assets from LCD API
      fetchWATTStaked(WATT_STAKED_ASSETS_API_URL, userDetails.userWallet, 200);
    }
  }, [userDetails?.userWallet, fetchNFTStaked, fetchWATTStaked]);

  // Initial data fetch
  useEffect(() => {
    if (isInitialLoad && userDetails?.userWallet) {
      console.log("Initial load - fetching staked pool data");
      fetchStakedPoolData();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, userDetails?.userWallet, fetchStakedPoolData]);

  // Process NFT staked assets from LCD API
  useEffect(() => {
    if (nftStakedData && Array.isArray(nftStakedData)) {
      const nftAssets = nftStakedData.map((nftStake, index) => ({
        id: `nft-${nftStake.validatorAddress}-${nftStake.tokenId}-${index}`,
        stakeNumber: `NFT Token #${nftStake.tokenId}`,
        validator: {
          name: nftStake.validatorAddress.slice(0, 20) + '...',
          description: nftStake.nftContractAddress.slice(0, 10) + '...',
        },
        stake: {
          nft: nftStake.balance,
          watt: 0,
        },
        startDate: new Date().toISOString().split('T')[0],
        rewards: 0,
        status: 'active' as const,
        stakeType: 'nft' as const,
        originalData: nftStake, // Store the full LCD API response
      })) as StakedAsset[];
      setProcessedNFTAssets(nftAssets);
    } else {
      setProcessedNFTAssets([]);
    }
  }, [nftStakedData]);

  // Process WATT staked assets from LCD API
  useEffect(() => {
    if (wattStakedData && Array.isArray(wattStakedData)) {
      const wattAssets = wattStakedData.map((wattStake, index) => ({
        id: `watt-${wattStake.validatorAddress}-${index}`,
        stakeNumber: `WATT Stake ${index + 1}`,
        validator: {
          name: wattStake.validatorAddress.slice(0, 20) + '...',
          description: `Staked: ${wattStake.balanceInWATT.toFixed(2)} WATT`,
        },
        stake: {
          nft: 0,
          watt: wattStake.balanceInWATT,
        },
        startDate: new Date().toISOString().split('T')[0],
        rewards: 0,
        status: 'active' as const,
        stakeType: 'watt' as const,
        originalData: wattStake, // Store the full LCD API response
      })) as StakedAsset[];
      setProcessedWATTAssets(wattAssets);
    } else {
      setProcessedWATTAssets([]);
    }
  }, [wattStakedData]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStakedPoolData();

    // Reset refreshing state after fetch completes or after timeout
    const timeoutId = setTimeout(() => {
      setRefreshing(false);
    }, 2000);

    // Also listen for when loading stops
    const isLoading = nftStakedLoading || wattStakedLoading;
    if (!isLoading) {
      clearTimeout(timeoutId);
      setRefreshing(false);
    }

    return () => clearTimeout(timeoutId);
  }, [fetchStakedPoolData, nftStakedLoading, wattStakedLoading]);

  // Handle retry for errors
  const handleRetry = useCallback(() => {
    setIsInitialLoad(true);
    fetchStakedPoolData();
  }, [fetchStakedPoolData]);

  // Reset refreshing state when loading completes
  useEffect(() => {
    const isLoading = nftStakedLoading || wattStakedLoading;
    if (!isLoading && refreshing) {
      const timer = setTimeout(() => {
        setRefreshing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [nftStakedLoading, wattStakedLoading, refreshing]);

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
              stakedAssets={processedNFTAssets}
              loading={nftStakedLoading && !refreshing}
              error={nftStakedError}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onRetry={handleRetry}
              delegatorAddress={userDetails?.userWallet || ''}
              navigation={navigation}
            />
          )}
          {index === 2 && (
            <StokedPoolsContent
              stakedAssets={processedWATTAssets}
              loading={wattStakedLoading && !refreshing}
              error={wattStakedError}
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
