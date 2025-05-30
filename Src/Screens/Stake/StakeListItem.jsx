import React from 'react';
import {DText} from '../../../component/DText';
import {
  Image,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import images, {technologyGroup} from '../../../../images';
import color from '../../../theme/color';
import {useNavigation} from '@react-navigation/native';
import {SCREEN_CONSTANT} from '../../../navigation/constant';
import {Path, Svg} from 'react-native-svg';

function StakeListItem(props) {
  const {
    item = {
      _id: '646ee821b260884d71289867',
      apy: 0,
      daysRemaining: 720,
      imageUrl:
        'https://userprofleimages.s3.amazonaws.com/PROFILE/1684802521386.jpg',
      isStaked: false,
      stakedNfts: 0,
      title: 'test vsk',
      totalDays: 720,
      totalDelegator: 0,
      totalNftStaked: 0,
    },
  } = props;
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(SCREEN_CONSTANT.VALIDATOR, {
          poolId: item._id,
        });
      }}
      style={[
        styles.cardContainer,
        {
          borderBottomWidth: 0.75,
        },
      ]}>
      <Image
        style={styles.image}
        source={{
          uri: item.imageUrl,
        }}
      />
      <View
        style={{
          flex: 1,
          marginLeft: 12,
        }}>
        <View style={styles.row}>
          <View style={styles.col}>
            <DText style={styles.title} fontStyle="fontBold">
              {item.title}
            </DText>
            <DText style={styles.delegatorTitle} fontStyle="fontRegular">
              Total Delegators{' '}
              {
                <DText style={styles.delegator} fontStyle="fontBold">
                  {item.totalDelegator}
                </DText>
              }
            </DText>
          </View>
          <View
            style={[
              styles.col,
              {
                width: 80,
              },
            ]}>
            <DText></DText>
            {item.isStaked && (
              <>
                <DText style={styles.stakedTitle} fontStyle="fontRegular">
                  Staked
                </DText>
                <DText style={styles.staked} fontStyle="fontBold">
                  {item.stakedNfts}
                </DText>
              </>
            )}
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <DText style={styles.lockinTitle} fontStyle="fontRegular">
              Days remaining
            </DText>
            <DText style={styles.lockin} fontStyle="fontBold">
              {item.daysRemaining} Days
            </DText>
          </View>
          <View
            style={[
              styles.col,
              {
                width: 80,
              },
            ]}>
            <DText style={styles.apyTitle} fontStyle="fontRegular">
              Apy
            </DText>
            <DText style={styles.apy} fontStyle="fontBold">
              {item.apy}%
            </DText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    paddingRight: 20,
    marginVertical: 16,
    paddingHorizontal: 20,
    borderBottomColor: '#DEDEDE',
    borderBottomWidth: 0.75,
  },
  image: {
    height: 42,
    width: 42,
    backgroundColor: '#000',
    borderRadius: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    paddingBottom: 9,
    flexDirection: 'column',
  },
  title: {
    color: '#000',
    fontSize: 13,
    lineHeight: 19,
  },
  delegatorTitle: {
    color: '#7E7E7E',
    letterSpacing: 0.12,
    fontSize: 12,
  },
  stakedTitle: {
    fontSize: 12,
    letterSpacing: 0.11,
    color: '#7E7E7E',
  },
  staked: {
    fontSize: 12,
    color: '#000',
  },
  lockinTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.11,
  },
  lockin: {
    fontSize: 14,
    color: '#000',
    letterSpacing: 0.12,
  },
  lockinMore: {
    color: '#B0B0B0',
  },
  apyTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.11,
  },
  apy: {
    fontSize: 14,
    letterSpacing: 0.15,
    color: '#000',
  },
});

export default StakeListItem;
