import React, {useEffect} from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Svg, Text} from 'react-native-svg';
import {Slice, VictoryPie} from 'victory-native';
import images from '../../Theme/images';
import {DText} from '../../Componants/DText';
import {SCREEN_CONSTANT} from '../../Navigation/constant';
import {fontsFamily} from '../../Theme';
import {navigateTo} from '../../utils/navigationService';

function CustomSlice(props) {
  const {datum} = props;

  const sliceOverride = {
    ...props.slice,
    endAngle: (props.slice?.endAngle ?? 0) + 0.3,
  };
  return (
    <Slice
      {...props} //NOTE - for dynamic data
      slice={sliceOverride}
      cornerRadius={50}
      sliceStartAngle={datum.background ? 0 : props.sliceStartAngle}
      sliceEndAngle={datum.background ? 360 : props.sliceStartAngle}
    />
  );
}

const colors = {
  available: '#3F71BB',
  staked: '#6EC898',
  owned: '#009D94',
};

export default function StakingActivities(props) {
  const {showTitle = true, drecsAvailable, drecsOwned, drecsStaked} = props;
  const width = 220;
  const height = 200;

  const total = drecsAvailable + drecsStaked;

  const available = (total / 100) * drecsAvailable;
  const staked = (total / 100) * drecsStaked;
  const loading = props.loading && <ActivityIndicator color={'#000'} />;

  return (
    <TouchableOpacity onPress={() => ''} style={[stakingStyles.container]}>
      {showTitle && (
        <View style={stakingStyles.header} activeOpacity={0.5}>
          <DText style={stakingStyles.title} fontStyle="fontSemiBold">
            Staking Activities
          </DText>
          <Image
            source={images.next}
            style={{
              width: 18,
              height: 18,
            }}
          />
        </View>
      )}
      <View style={stakingStyles.chart}>
        <Svg width={width} height={height}>
          <VictoryPie
            // dataComponent={<CustomSlice />}
            standalone={false}
            width={width}
            height={height}
            colorScale={[colors.available, colors.staked]}
            labels={[]}
            radius={75}
            // startAngle={-30}
            innerRadius={45}
            data={
              total > 0
                ? [
                    {x: 1, y: available},
                    {x: 2, y: staked},
                  ]
                : [{x: 1, y: 1}]
            }
          />
          <Text
            stroke={'#2F2F2F'}
            fontSize="15"
            fill={'#2F2F2F'}
            x={width / 2}
            y={height / 2}
            fontFamily={fontsFamily.MulishBold}
            textAnchor="middle">
            {/* {total || 0} */}0
          </Text>
        </Svg>
        <View style={stakingStyles.info}>
          {/* <View>
            <DText style={stakingStyles.ownedCount}>{drecsOwned || 0} {loading}</DText>
            <DText style={stakingStyles.label} fontStyle="fontRegular">
              DRECs Owned
            </DText>
          </View> */}
          <View style={stakingStyles.staked}>
            <DText style={stakingStyles.stakedCount}>
              {/* {drecsStaked || 0} {loading} */}0
            </DText>
            <DText style={stakingStyles.label} fontStyle="fontRegular">
              EACs Staked
            </DText>
          </View>
          <View style={stakingStyles.staked}>
            <DText style={stakingStyles.availableCount}>
              {/* {drecsAvailable || 0} {loading} */}0
            </DText>
            <DText style={stakingStyles.label} fontStyle="fontRegular">
              EACs Available
            </DText>
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
  },
  container: {
    marginLeft: 21,
    marginRight: 21,
  },

  chart: {
    marginBottom: 44,
    alignItems: 'center',
  },
  info: {
    flexDirection: 'row',
  },
  staked: {
    paddingLeft: 16,
    marginLeft: 16,
    borderLeftWidth: 1 / 3,
    borderLeftColor: '#E7E8F2',
  },
  availableCount: {
    color: colors.available,
    fontSize: 14,
  },
  ownedCount: {
    color: colors.owned,
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
