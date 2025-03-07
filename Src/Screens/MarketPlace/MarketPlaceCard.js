import React, {useContext, useEffect, useState} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import images from '../../Theme/images';
import {DText} from '../../Componants/DText';
import MarketPlaceContext from './MarketPlaceContext';
import countriesData from './countries-data';
import {Images} from '../../Theme';

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    marginRight: 20,
    marginTop: 14,
  },
  radioSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#009D94',
    position: 'absolute',
  },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderColor: '#B8B8B8',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 8,
  },
  country: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryImage: {
    width: 18,
    height: 13,
    borderRadius: 4,
    marginLeft: 6,
  },
  countryText: {
    fontSize: 14,
  },
  image: {
    height: 85,
    width: 60,
    backgroundColor: '#000',
  },
  countryLabel: {
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#2E2E2E',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 13,
    marginTop: 8,
  },
  title: {
    fontSize: 13,
    lineHeight: 21,
  },
  address: {
    color: '#7E7E7E',
    fontSize: 12,
  },
  infoLineOne: {
    marginLeft: 13,
  },
  infoItemsContainer: {
    flex: 1,
  },
});

function MarketPlaceCard(props) {
  const handleOrgPress = () => {};

  return (
    <View style={styles.cardContainer}>
      <Image
        style={styles.image}
        source={{
          uri: Images.profile,
        }}
      />
      <View style={styles.infoItemsContainer}>
        <View style={styles.info}>
          <TouchableOpacity onPress={handleOrgPress} style={styles.infoLineOne}>
            <DText fontStyle="fontBold" style={styles.title}>
              EAC #0000 Wind
            </DText>
            <DText fontStyle="fontRegular" style={styles.address}>
              Rahul AR
              <Image source={images.arrowUp} />
            </DText>
          </TouchableOpacity>
        </View>
        <View style={styles.moreInfo}>
          <View>
            <DText fontStyle="fontMedium" style={styles.countryLabel}>
              Your Price
            </DText>
            <DText style={styles.countryText} fontStyle="fontBold">
              $00 USD
            </DText>
          </View>
          <View>
            <DText fontStyle="fontMedium" style={styles.countryLabel}>
              Country
            </DText>
            <View style={styles.country}>
              <DText style={styles.countryText} fontStyle="fontBold">
                US
              </DText>
              <Image style={styles.countryImage} source={images.flag} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default MarketPlaceCard;
