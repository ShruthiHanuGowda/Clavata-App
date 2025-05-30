import {ScreenWidth, Tab} from '@rneui/base';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import images from '../../Theme/images';

import {fontsFamily} from '../../Theme';

import {DSearchInput} from '../../Componants/Dinputs';
import {DText} from '../../Componants/DText';
import {normalize} from '../../utils/screenSize';

export default function CategoryTab({onSelectPress, onCancelPress}) {
  //   const {index, setFilters, reloadData, filters, lastUpdated, count} =
  // useContext(StakeContext);
  //   const [showFilter, setShowFilter] = useState(false);
  //   const [showSortBy, setShowSortBy] = useState(false);

  const onFilterPress = () => {
    // setShowFilter(true);
  };

  const onSortByPress = () => {
    // setShowSortBy(true);
  };

  const renderText = (itemIndex, title) => (
    <View style={styles.titleContainer}>
      <DText
        style={[index === itemIndex ? styles.tabTitleActive : styles.tabTitle]}>
        {title}
      </DText>
    </View>
  );

  return (
    <>
      {/* <Tab
            value={index}
            onChange={e => {
                setIndex(e);
            }}
            indicatorStyle={{
                backgroundColor: '#009D94',
                height: 2,
            }}
            style={{
                backgroundColor: 'white',
                borderBottomColor: '#E1E1E1',
                borderBottomWidth: 0.5,
            }}>
            <Tab.Item
                title={renderText(0, 'Validator Pools')}
                activeOpacity={1}
                style={index === 0 ? styles.tabTitleActive : styles.tabTitle}
            />
            <Tab.Item
                title={renderText(1, 'My Stake')}
                activeOpacity={1}
                style={index === 1 ? styles.tabTitleActive : styles.tabTitle}
                titleStyle={index === 1 ? styles.tabTitleActive : styles.tabTitle}
            />
        </Tab> */}
      <View style={styles.filter}>
        <DSearchInput
          //   value={filters.search}
          //   setValue={search => {
          //     setFilters({
          //       ...filters,
          //       search,
          //     });
          //   }}
          placeholder="Search pools"
        />
      </View>
      <View style={styles.filter}>
        {
          <TouchableOpacity onPress={onSortByPress} style={styles.btn}>
            <DText style={styles.text} fontStyle="fontRegular">
              Sort By
            </DText>
            <Image source={images.chevron} />
          </TouchableOpacity>
        }
        <TouchableOpacity onPress={onFilterPress} style={styles.btn}>
          <DText style={styles.text} fontStyle="fontRegular">
            Filter
          </DText>
          <Image source={images.chevron} />
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
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <TouchableOpacity style={styles.result}>
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
      {/* <SortByBottomSheet
        showSortBy={showSortBy}
        setShowSortBy={setShowSortBy}
      /> */}
      {/* <FilterBottomSheet
        showFilter={showFilter}
        setShowFilter={setShowFilter}
      /> */}
    </>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 21,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
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
  filter: {
    height: 50,
    paddingLeft: 21,
    paddingRight: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabTitleActive: {
    fontSize: 12,
    color: '#000',
    fontFamily: fontsFamily.MulishBold,
    backgroundColor: '#F6F6F6',
    padding: 5,
  },
  tabTitle: {
    fontSize: 12,
    color: '#989898',
    fontFamily: fontsFamily.MulishBold,
    padding: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#E1E1E1',
    padding: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 4,
    height: 17,
  },
  badgeActive: {
    backgroundColor: '#76D4CF',
  },
  badgeText: {
    fontSize: 10,
    color: '#777',
  },
  badgeTextActive: {
    color: '#115753',
    fontSize: 10,
  },
  btn: {
    flexDirection: 'row',
    columnGap: 10,
    width: (ScreenWidth - 48) / 2,
    height: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
    padding: 4,
    paddingLeft: 13,
    paddingRight: 13,
    borderColor: '#B3B3B3',
    borderWidth: 0.8,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 12,
    color: '#666666',
  },
});
