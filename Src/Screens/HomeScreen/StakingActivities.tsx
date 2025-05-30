import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import images from '../../Theme/images';
import {DText} from '../../Componants/DText';
import {navigateTo} from '../../utils/navigationService';
import {useWallet} from '../../../screens/Provider/WalletProvider';
import {formatQuantityMWh} from '../../utils';
import PieChart from './PieChart';

const colors = {
  available: '#3F71BB',
  staked: '#6EC898',
};

interface Props {
  showTitle?: boolean;
  drecsAvailable: number;
  drecsOwned: number;
  drecsStaked: number;
  loading?: boolean;
}

export default function StakingActivities(props: Props) {
  const height = 150;
  const {getBalance} = useWallet();
  const {showTitle = true, drecsAvailable, drecsOwned, drecsStaked} = props;

  const total = drecsAvailable + drecsStaked;

  const available = (total / 100) * drecsAvailable;
  const staked = (total / 100) * drecsStaked;
  const loading = props.loading && <ActivityIndicator color={'#000'} />;

  return (
    <TouchableOpacity
      onPress={() => navigateTo('Stake')}
      style={[stakingStyles.container]}>
      {showTitle && (
        <View style={stakingStyles.header}>
          <DText style={stakingStyles.title} fontStyle="fontSemiBold">
            Staking Activities
          </DText>
          <Image
            source={images.next}
            style={{
              width: 18,
              height: 18,
              marginRight: 21,
            }}
          />
        </View>
      )}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        <View style={[stakingStyles.chart]}>
          <View
            style={{
              width: '100%',
              height: 150,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 15,
            }}>
            <PieChart
              data={
                total > 0
                  ? [
                      {x: 1, y: available},
                      {x: 2, y: staked},
                    ]
                  : [{x: 1, y: 1}]
              }
              centerText={Number(getBalance('WATT')?.balance).toFixed(2)}
              chartWidth={250}
            />
          </View>
          <View style={stakingStyles.info}>
            <View style={stakingStyles.staked}>
              <DText style={stakingStyles.stakedCount}>0 WATT</DText>
              <DText style={stakingStyles.label} fontStyle="fontRegular">
                Staked
              </DText>
            </View>
            <View style={[stakingStyles.staked, {marginTop: 10}]}>
              <DText style={stakingStyles.availableCount}>
                {Number(getBalance('WATT')?.balance).toFixed(2)} WATT
              </DText>
              <DText style={stakingStyles.label} fontStyle="fontRegular">
                Available
              </DText>
            </View>
          </View>
        </View>
        <View style={stakingStyles.chart}>
          <View
            style={{
              width: '100%',
              height: height,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 15,
            }}>
            <PieChart
              data={
                total > 0
                  ? [
                      {x: 1, y: available},
                      {x: 2, y: staked},
                    ]
                  : [{x: 1, y: 1}]
              }
              centerText={formatQuantityMWh(Number(drecsOwned ?? 0))}
              chartWidth={250}
            />
          </View>
          <View style={stakingStyles.info}>
            {/* <View>
            <DText style={stakingStyles.ownedCount}>{drecsOwned || 0} {loading}</DText>
            <DText style={stakingStyles.label} fontStyle="fontRegular">
              DRECs Owned
            </DText>
          </View> */}
            <View style={stakingStyles.staked}>
              <DText style={stakingStyles.stakedCount}>
                {loading} {drecsStaked || 0}
              </DText>
              <DText style={stakingStyles.label} fontStyle="fontRegular">
                Staked
              </DText>
            </View>
            <View style={[stakingStyles.staked, {marginTop: 10}]}>
              <DText style={stakingStyles.availableCount}>
                {loading}
                {!props.loading && formatQuantityMWh(Number(drecsOwned ?? 0))}
              </DText>
              <DText style={stakingStyles.label} fontStyle="fontRegular">
                Available
              </DText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const stakingStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 12,
    letterSpacing: 2.24,
    textTransform: 'uppercase',
    marginLeft: 21,
  },
  container: {
    marginLeft: 0,
    marginRight: 0,
  },
  chart: {
    marginBottom: 44,
    alignItems: 'center',
    width: '50%',
    justifyContent: 'center',
  },
  info: {
    alignSelf: 'center',
  },
  staked: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableCount: {
    color: colors.available,
    fontSize: 14,
  },
  stakedCount: {
    color: colors.staked,
    fontSize: 14,
  },
  label: {
    color: '#25233A',
    opacity: 0.4,
    fontSize: 12,
  },
});
