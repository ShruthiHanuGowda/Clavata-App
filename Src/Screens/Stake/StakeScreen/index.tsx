import React, {useState} from 'react';
import {View, SafeAreaView} from 'react-native';
import {Tab} from '@rneui/base';
import {fontsFamily} from '../../../Theme';
// import {navigateBack} from '../../../utils/navigationService';
// import images from '../../../Theme/images';
import styles from './styles';
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

// Tab content components
const NFTStakingContent = ({ validatorId }: { validatorId: string | undefined }): React.ReactElement => (
  <View style={styles.tabContent}>
    <NFTStakeComponent validatorId={validatorId} />
  </View>
);

const WATTStakingContent = ({ validatorId }: { validatorId: string | undefined }): React.ReactElement => (
  <View style={styles.tabContent}>
    <WATTStakeComponent validatorId={validatorId} />
  </View>
);

const StakeScreen: React.FC<StakeScreenProps> = props => {
  const validatorId = props?.route?.params?.validatorId;

  const {} = useNFTStaking(validatorId);

  // State for tab management
  const [index, setIndex] = useState<number>(0);

  const TAB_ITEMS: readonly string[] = ['NFT Staking', 'WATT Staking'];



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
              indicatorStyle={styles.transparentBackground}
              style={styles.transparentBackground}>
              {TAB_ITEMS.map((tab, i) => (
                <Tab.Item
                  key={i}
                  containerStyle={(active: boolean) => active ? styles.activeTabContainer : styles.inactiveTabContainer}
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
            {index === 0 && <NFTStakingContent validatorId={validatorId} />}
            {index === 1 && <WATTStakingContent validatorId={validatorId} />}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};


export default StakeScreen;
