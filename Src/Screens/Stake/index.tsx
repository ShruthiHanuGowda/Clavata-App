import React, {useEffect, useState, JSX} from 'react';
import {Header} from '@rneui/base';
import {StyleSheet, View, Text, Button} from 'react-native';
import {DText} from '../../Componants/DText';
import {Tab} from '@rneui/base';
import {fontsFamily} from '../../Theme';
import StakeListingScreen from './StakeListingScreen';
import ValidatorsScreen from './ValidatorsScreen';
import StakeScreen from './StakeScreen';
import useValidators from './Hooks/useValidators';
// Define props interface for Stake component
interface StakeProps {
  // Add any props if needed
}

// Define type for fontsFamily
interface FontFamily {
  MulishExtraBold: string;
  MulishBold: string;
  // Add other font properties as needed
}

function Stake(props: StakeProps): JSX.Element {
  const [index, setIndex] = useState<number>(0);
  const TAB_ITEMS: readonly string[] = [
    'Total Pools',
    'Staked Pools',
    'Stoked EACs',
  ];

  const TotalPoolsContent = (): JSX.Element => (
    <View style={styles.simpleContent}>
      <ValidatorsScreen />
    </View>
  );

  const StakedPoolsContent = (): JSX.Element => (
    <View style={styles.simpleContent}>
      <StakeListingScreen />
    </View>
  );

  const StokedPoolsContent = (): JSX.Element => (
    <View style={styles.simpleContent}>
      <StakeListingScreen />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <Loader isShow={(loading)} /> */}
      <Header
        containerStyle={{
          borderBottomWidth: 0,
        }}
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

        <View style={styles.contentContainer}>
          {index === 0 && <TotalPoolsContent />}
          {index === 1 && <StakedPoolsContent />}
          {index === 2 && <StokedPoolsContent />}
        </View>
      </View>
      {/* <Portfolio />
        <CategoryTab />
        <Result /> */}
    </View>
  );
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
    height: '100%',
    backgroundColor: '#fff',
  },
  tabContentText: {
    // Add appropriate styles if needed
  },
  contentContainer: {
    // Add appropriate styles if needed
  },
});

export default Stake;
