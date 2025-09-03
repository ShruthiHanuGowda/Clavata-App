import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView, Alert} from 'react-native';
import {Tab} from '@rneui/base';
import {fontsFamily} from '../../../Theme';
// import {navigateBack} from '../../../utils/navigationService';
// import images from '../../../Theme/images';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
// import styles from './styles';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useNftsForAddress} from '../../../hooks/useNftsForAddress';
import {useNFTStaking} from '../Hooks/useNFTStaking';
import LoaderAnimation from '../../../Componants/Loading/LoaderAnimation';
import NFTStakeComponent from './NFTStakeComponent';
import WATTStakeComponent from './WATTStakeComponent';
// Interface for component props
interface StakeScreenProps {
  route?: {
    params?: {
      validatorId?: string;
    };
  };
}

interface FontFamily {
  MulishExtraBold: string;
  MulishBold: string;
  // Add other font properties as needed
}

const StakeScreen: React.FC<StakeScreenProps> = props => {
  const validatorId = props?.route?.params?.validatorId;

  const {delegateERC1155} = useNFTStaking(validatorId);

  // State for tab management
  const [index, setIndex] = useState<number>(0);

  const TAB_ITEMS: readonly string[] = ['NFT Staking', 'WATT Staking'];

  // useEffect(() => {
  //   setActiveNetwork('denergy');
  // }, []);

  // Tab content components
  const NFTStakingContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      <NFTStakeComponent validatorId={validatorId} />
    </View>
  );

  const WATTStakingContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      <WATTStakeComponent validatorId={validatorId} />
    </View>
  );

  const handleStakeSuccess = result => {
    console.log('Staking successful:', result);
    setTxHash(result.txHash);
    setTxStatus('success');

    // Show success alert
    Alert.alert(
      'Staking Successful',
      `Your NFT has been staked successfully!\n\nTransaction Hash: ${result.txHash.substring(
        0,
        10,
      )}...`,
      [{text: 'OK', onPress: () => console.log('OK')}],
    );
  };

  // Handle stake button press
  const handleStake = async () => {
    // Input validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to stake');
      return;
    }

    if (
      selectedNFT.marketData &&
      parseFloat(amount) > parseFloat(selectedNFT.marketData.quantity)
    ) {
      Alert.alert(
        'Insufficient Balance',
        `You can't stake more than you own (${selectedNFT.marketData.quantity})`,
      );
      return;
    }

    // Update status and start staking process
    setTxStatus('staking');

    try {
      // Call delegateERC1155 function from our hook
      // This function will handle approval checking and requesting internally
      await delegateERC1155(
        selectedNFT.contractAddress, // ERC1155 contract address
        selectedNFT.tokenId, // Token ID
        amount, // Amount to stake
        handleStakeSuccess, // Success callback
      );
    } catch (err) {
      console.error('Staking failed:', err);
      setTxStatus('failed');

      // Show error alert
      Alert.alert('Staking Failed', 'Something went wrong while staking', [
        {text: 'OK'},
      ]);
    } finally {
      if (txStatus !== 'success') {
        setTxStatus('idle');
      }
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {false ? (
        <View style={styles.loaderContainer}>
          {/* <ActivityIndicator size="large" color="#008060" />
          <Text style={styles.loaderText}>Loading Collections...</Text> */}
          <LoaderAnimation
            size="large"
            color="#008060"
            showText={true}
            text="Loading Collections..."
          />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            <Tab
              value={index}
              onChange={setIndex}
              variant="primary"
              indicatorStyle={{
                backgroundColor: 'transparent',
              }}
              style={{backgroundColor: 'transparent'}}>
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
          </View>

          <View style={styles.contentContainer}>
            {index === 0 && <NFTStakingContent />}
            {index === 1 && <WATTStakingContent />}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  iconContainer: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  tabContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default StakeScreen;
