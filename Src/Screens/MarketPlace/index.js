import React, {useContext, useEffect, useState} from 'react';
import {Header, Switch} from '@rneui/base';
import {Image, SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import MarketPlaceContext from './MarketPlaceContext';
import {moderateScale} from 'react-native-size-matters';
import MarketPlaceResult from './MarketPlaceResult';
import Filter from './Filter';
import images from '../../Theme/images';
import {DText} from '../../Componants/DText';
import {DSearchInput} from '../../Componants/Dinputs';

function MarketPlaceHeader({handleCartPress}) {
  const selected = undefined;
  return (
    <Header
      backgroundColor={'#FFF'}
      containerStyle={{
        borderBottomWidth: 0,
      }}
      leftComponent={
        <View style={styles.nameContainer}>
          <DText style={styles.title} fontStyle="fontBold">
            Marketplace
          </DText>
        </View>
      }
      rightComponent={
        <TouchableOpacity onPress={handleCartPress} style={styles.dotContainer}>
          <Image source={images.cart} />
          {selected?.length > 0 && (
            <View style={styles.dot}>
              <DText fontStyle="fontBold" style={styles.count}>
                0
              </DText>
            </View>
          )}
        </TouchableOpacity>
      }
    />
  );
}

function MarketPlaceMoreInfoHeader({handleBackPress, handleCartPress}) {
  const {selectedOrg, selected} = useContext(MarketPlaceContext);
  return (
    <Header
      backgroundColor={'#FFF'}
      leftComponent={
        <TouchableOpacity onPress={handleBackPress} style={styles.dotContainer}>
          <Image source={images.back} />
        </TouchableOpacity>
      }
      centerComponent={
        <View style={styles.nameContainer}>
          <DText style={styles.title} fontStyle="fontBold">
            1234
          </DText>
        </View>
      }
      rightComponent={
        <TouchableOpacity onPress={handleCartPress} style={styles.dotContainer}>
          <Image source={images.cart} />
          {selected?.length > 0 && (
            <View style={styles.dot}>
              <DText fontStyle="fontBold" style={styles.count}>
                0
              </DText>
            </View>
          )}
        </TouchableOpacity>
      }
    />
  );
}

function MyListingToggle() {
  return (
    <View style={styles.myListing}>
      <DText style={styles.myListingText} fontStyle="fontMedium">
        My listings
      </DText>
      <Switch color="#009D94" style={styles.switch} value={false} />
    </View>
  );
}

function DCount() {
  const {count} = useContext(MarketPlaceContext);
  return (
    <View style={styles.myListing}>
      <DText fontStyle="fontRegular" style={styles.myListingCount}>
        2 Drecs
      </DText>
    </View>
  );
}

function Search() {
  return (
    <View style={searchStyles.container}>
      <DSearchInput placeholder="Search Drecs" />
    </View>
  );
}

const searchStyles = StyleSheet.create({
  container: {
    marginRight: 20,
    marginLeft: 20,
  },
});

const defaultFilter = {
  query: undefined,
  issueFromDate: undefined,
  issueToDate: undefined,
  expiryFromDate: undefined,
  expiryToDate: undefined,
  selectedCountry: undefined,
  selectedTechnology: undefined,
  priceStart: undefined,
  priceEnd: undefined,

  sortBy: 'new',
  ownerId: undefined,
  page: 1,
  limit: 5,
};

export default function MarketPlace() {
  const [selectedOrg, setSelectedOrg] = useState(null);

  const handleBackPress = () => {};

  const handleCartPress = () => {};

  return (
    <MarketPlaceContext.Provider>
      <SafeAreaView style={styles.container}>
        {selectedOrg ? (
          <MarketPlaceMoreInfoHeader
            handleBackPress={handleBackPress}
            handleCartPress={handleCartPress}
          />
        ) : (
          <MarketPlaceHeader handleCartPress={handleCartPress} />
        )}
        {selectedOrg ? <DCount /> : <MyListingToggle />}
        <Search />
        <Filter />
        <MarketPlaceResult />
      </SafeAreaView>
    </MarketPlaceContext.Provider>
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
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
    minWidth: 150,
    marginLeft: 10,
  },
  dotContainer: {
    position: 'relative',
    marginRight: 10,
  },
  dot: {
    backgroundColor: '#FF3E49',
    height: 18,
    width: 18,
    borderRadius: 9,
    position: 'absolute',
    top: -7,
    right: -7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 10,
    color: '#FFF',
    textAlign: 'center',
  },
  myListing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 10,
  },
  myListingCount: {
    fontSize: 11,
  },
  myListingText: {
    color: '#5E5E5E',
    fontSize: 14,
  },
  switch: {
    transform: [
      {scaleX: moderateScale(0.7, 1)},
      {scaleY: moderateScale(0.7, 1)},
    ],
  },
});
