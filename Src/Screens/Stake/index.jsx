import React, {useEffect, useState} from 'react';
import {Loader} from '../../../component';
import {Header} from '@rneui/base';
import {Image, SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
// import CategoryTab from './CategoryTab';
import StakeContext from './StakeContext';
import {DText} from '../../Componants/DText';
import Portfolio from './Portfolio';
import CategoryTab from './CategoryTab';
import Result from './Result';
// import useMarketPlace from '../../../hooks/marketPlace';
// import Result from './Result';
// import Portfolio from './Portfolio';
// import useStake from '../../../hooks/stake';

function Stake(props) {
  return (
    <StakeContext.Provider>
      <SafeAreaView style={styles.container}>
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
        <Portfolio />
        <CategoryTab />
        <Result />
      </SafeAreaView>
    </StakeContext.Provider>
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
});

export default Stake;
