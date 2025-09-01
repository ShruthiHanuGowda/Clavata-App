import {ScreenHeight} from '@rneui/base';
import React, {useContext} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import StakeContext from './StakeContext';
import {DText} from '../../Componants/DText';
import {normalize} from '../../utils/screenSize';

interface ResultProps {
  // Add any props if needed in the future
}

const Result: React.FC<ResultProps> = () => {
  // const {data, loading} = useContext(StakeContext);

  return (
    <View style={styles.container}>
      {/* <FlatList
        contentContainerStyle={styles.list}
        // data={data}
        // ListHeaderComponent={loading && <ActivityIndicator />}
        // ListFooterComponent={
        //   data?.length > 0 && loading && <ActivityIndicator />
        // }
        ListEmptyComponent={
          // !loading && (
          <View style={styles.noResults}>
            <DText style={styles.noResultsText}>No Results Found</DText>
          </View>
          // )
        }
        // renderItem={props => <StakeListItem {...props} />}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
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
    paddingBottom: 400,
  },
});

export default Result;
