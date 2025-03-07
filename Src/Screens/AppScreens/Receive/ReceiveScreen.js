import React, {useEffect, useState} from 'react';
import {View, Image, TouchableOpacity, ScrollView} from 'react-native';
import {Header} from '@rneui/base';
import images from '../../../Theme/images';
import {navigateBack} from '../../../utils/navigationService';
import {StyleSheet} from 'react-native';
import ShowQr from '../QRcodeScreen/ShowQr';
import {DText} from '../../../Componants/DText';

const ReceiveScreen = ({route}) => {
  return (
    <View style={styles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
        leftComponent={
          <TouchableOpacity onPress={navigateBack} style={styles.backContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <DText fontStyle="fontBold" style={styles.headerTitle}>
              WATT Wallet
            </DText>
          </View>
        }
      />

      <ScrollView>
        <View style={styles.boxAlign}>
          <ShowQr />
        </View>
      </ScrollView>
    </View>
  );
};

export default ReceiveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backContainer: {
    position: 'relative',
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  boxAlign: {
    marginTop: 38,
    marginBottom: 24,
  },
});
