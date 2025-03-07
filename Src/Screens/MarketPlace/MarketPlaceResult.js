import {ScreenHeight} from '@rneui/base';
import {formatDistance, intervalToDuration} from 'date-fns';
import React, {useContext, useEffect} from 'react';
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import images from '../../Theme/images';
import {DText} from '../../Componants/DText';
import {normalize} from '../../utils/screenSize';
import MarketPlaceCard from './MarketPlaceCard';
import MarketPlaceContext from './MarketPlaceContext';

export default function MarketPlaceResult() {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.live}>
          <Image source={images.live} style={styles.liveImage} />
          <DText fontStyle="fontRegular" style={styles.liveText}>
            Live Feed
          </DText>
        </View>
        <TouchableOpacity style={styles.result}>
          <View style={styles.dot} />
          <DText fontStyle="fontRegular" style={styles.resultText}>
            0 results
          </DText>
          <View style={styles.dot} />
          <Image source={images.refresh} style={styles.refresh} />
          <DText fontStyle="fontRegular" style={styles.updateText}>
            Updated less than 5 ago
          </DText>
        </TouchableOpacity>
      </View>
      {/* <FlatList
        contentContainerStyle={styles.list}
        // data={data}
        // ListHeaderComponent={loading && <ActivityIndicator />}
        // ListFooterComponent={
        // data?.length > 0 && loading ? (
        // <ActivityIndicator />
        // ) : (
        // count > data?.length && (
        // <TouchableOpacity
        //   // onPress={onEndReached}
        //   style={{
        //     alignItems: 'center',
        //   }}>
        //   <DText
        //     style={{
        //       color: '#009D94',
        //     }}>
        //     Load More
        //   </DText>
        // </TouchableOpacity>
        // )
        // )
        // }
        // ListEmptyComponent={
        //   // !loading && (
        //   <View style={styles.noResults}>
        //     <DText style={styles.noResultsText}>No Results Found</DText>
        //   </View>
        //   // )
        // }
        // onEndReached={onEndReached}
        renderItem={props => <MarketPlaceCard {...props} />}
      /> */}
      <ScrollView style={{height: '63%'}}>
        <MarketPlaceCard />
        <MarketPlaceCard />
        <MarketPlaceCard />
        <MarketPlaceCard />
        <MarketPlaceCard />
        <MarketPlaceCard />
        <MarketPlaceCard />
        <MarketPlaceCard />
        <MarketPlaceCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
  },
  listContainer: {},
  cardContainer: {
    flexDirection: 'row',
    marginRight: 20,
    marginTop: 14,
  },
  noResultsText: {
    color: '#9A9A9A',
    fontSize: normalize(16),
  },
  noResults: {
    flex: 1,
    height: ScreenHeight / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveImage: {
    marginTop: 5,
  },
  liveText: {
    fontSize: normalize(11),
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#939393',
    margin: 5,
    alignSelf: 'center',
    top: 1,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: normalize(11),
  },
  updateText: {
    fontSize: normalize(11),
    color: '#9A9A9A',
  },
  refresh: {
    marginLeft: 5,
    marginRight: 5,
  },
  list: {
    paddingBottom: 280,
  },
});
