import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import images from '../../../Theme/images';
import NFTQueuedTab from './NFTQueuedTab';
import WATTQueuedTab from './WATTQueuedTab';

interface QueuedDelegationsScreenProps {
  navigation: any;
  route: any;
}

type TabType = 'nft' | 'watt';

const QueuedDelegationsScreen: React.FC<QueuedDelegationsScreenProps> = ({
  navigation,
  route,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('nft');
  const delegatorAddress = route?.params?.delegatorAddress || '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={images.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queued Delegations</Text>
        <View style={styles.spacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nft' && styles.activeTab]}
          onPress={() => setActiveTab('nft')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'nft' && styles.activeTabText,
            ]}>
            NFT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'watt' && styles.activeTab]}
          onPress={() => setActiveTab('watt')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'watt' && styles.activeTabText,
            ]}>
            WATT
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'nft' ? (
        <NFTQueuedTab
          delegatorAddress={delegatorAddress}
          navigation={navigation}
        />
      ) : (
        <WATTQueuedTab
          delegatorAddress={delegatorAddress}
          navigation={navigation}
        />
      )}
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
  backIcon: {
    width: 20,
    height: 20,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#009D94',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#009D94',
  },
});

export default QueuedDelegationsScreen;
