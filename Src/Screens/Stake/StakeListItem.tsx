import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SCREEN_CONSTANT} from '../../../navigation/constant';
import {DText} from '../../Componants/DText';

interface StakeItem {
  _id: string;
  apy: number;
  daysRemaining: number;
  imageUrl: string;
  isStaked: boolean;
  stakedNfts: number;
  title: string;
  totalDays: number;
  totalDelegator: number;
  totalNftStaked: number;
}

interface StakeListItemProps {
  item?: StakeItem;
}

const StakeListItem: React.FC<StakeListItemProps> = props => {
  const {item} = props;

  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(SCREEN_CONSTANT.VALIDATOR, {
          poolId: item._id,
        });
      }}
      style={[styles.cardContainer, styles.cardBorder]}>
      <Image
        style={styles.image}
        source={{
          uri: item.imageUrl,
        }}
      />
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <View style={styles.col}>
            <DText style={styles.title} fontStyle="fontBold">
              {item?.title}
            </DText>
            <DText style={styles.delegatorTitle} fontStyle="fontRegular">
              Total Delegators{' '}
              {
                <DText style={styles.delegator} fontStyle="fontBold">
                  {item?.totalDelegator}
                </DText>
              }
            </DText>
          </View>
          <View style={[styles.col, styles.stakedSection]}>
            {item?.isStaked && (
              <>
                <DText style={styles.stakedTitle} fontStyle="fontRegular">
                  Staked
                </DText>
                <DText style={styles.staked} fontStyle="fontBold">
                  {item?.stakedNfts}
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
              {item?.daysRemaining} Days
            </DText>
          </View>
          <View style={[styles.col, styles.apySection]}>
            <DText style={styles.apyTitle} fontStyle="fontRegular">
              Apy
            </DText>
            <DText style={styles.apy} fontStyle="fontBold">
              {item?.apy}%
            </DText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    paddingRight: 20,
    marginVertical: 16,
    paddingHorizontal: 20,
    borderBottomColor: '#DEDEDE',
    borderBottomWidth: 0.75,
  },
  cardBorder: {
    borderBottomWidth: 0.75,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  stakedSection: {
    width: 80,
  },
  apySection: {
    width: 80,
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
  delegator: {
    fontSize: 12,
    color: '#000',
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
