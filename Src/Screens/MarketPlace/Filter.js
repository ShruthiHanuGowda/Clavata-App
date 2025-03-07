import {ScreenWidth} from '@rneui/base';
import React, {useContext, useState} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import images from '../../Theme/images';
import {DText} from '../../Componants/DText';
import {normalize} from '../../utils/screenSize';
import MarketPlaceContext from './MarketPlaceContext';

export default function Filter() {
  // const {myListingChecked, filters} = useContext(MarketPlaceContext);
  const [showFilter, setShowFilter] = useState(false);
  const [showSortBy, setShowSortBy] = useState(false);
  const [showSweep, setShowSweep] = useState(false);

  const onFilterPress = () => {
    setShowFilter(true);
  };

  const onSortByPress = () => {
    setShowSortBy(true);
  };

  const onSweepPress = () => {
    setShowSweep(true);
  };

  return (
    <View style={filterStyles.container}>
      <TouchableOpacity onPress={onSortByPress} style={filterStyles.btn}>
        <DText style={filterStyles.text} fontStyle="fontRegular">
          Sort By
        </DText>
        <Image
          style={{
            marginRight: 9,
          }}
          source={images.chevron}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onFilterPress}
        style={[filterStyles.btn, {marginLeft: 10}]}>
        <DText style={filterStyles.text} fontStyle="fontRegular">
          Filter
        </DText>
        <Image
          style={{
            marginRight: 9,
          }}
          source={images.chevron}
        />
        {/* {(filters.issueToDate ||
          filters.selectedCountry ||
          filters.priceStart ||
          filters.priceEnd ||
          filters.issueFromDate ||
          filters.issueToDate ||
          filters.expiryFromDate ||
          filters.expiryToDate) && ( */}
        <View
          style={{
            backgroundColor: '#009D94',
            height: 7,
            width: 7,
            position: 'absolute',
            borderRadius: 7,
            top: -3,
            right: 1,
          }}
        />
        {/* )} */}
      </TouchableOpacity>
      <TouchableOpacity
        // disabled={myListingChecked}
        onPress={onSweepPress}
        style={[
          filterStyles.btn,
          // myListingChecked && filterStyles.btnDisabled,
          {marginLeft: 10},
        ]}>
        <DText style={filterStyles.text} fontStyle="fontRegular">
          Sweep Mode
        </DText>
      </TouchableOpacity>
      {/* <FilterBottomSheet
        showFilter={showFilter}
        setShowFilter={setShowFilter}
      /> */}
      {/* <SortByBottomSheet
        showSortBy={showSortBy}
        setShowSortBy={setShowSortBy}
      /> */}
      {/* <SweepModeBottomSheet visible={showSweep} setShowSweep={setShowSweep} /> */}
    </View>
  );
}

const filterStyles = StyleSheet.create({
  container: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 20,
  },
  btn: {
    flexDirection: 'row',
    columnGap: 10,
    height: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#B3B3B3',
    borderWidth: 0.8,
    borderRadius: 8,
    width: ScreenWidth / 3 - 20,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 12,
    color: '#666666',
    marginLeft: normalize(9),
  },
});
