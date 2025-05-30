import {Tab, TabView} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {DText} from '../../Componants/DText';
import {fontsFamily} from '../../Theme';
import {useWallet} from '../../../screens/Provider/WalletProvider';
import {formatQuantityMWh} from '../../utils';

interface Props {
  loading?: boolean;
  drecsOwned?: number;
}

export default function BalanceCarousal(props: Props) {
  const {getBalance} = useWallet();
  const wattBalance = getBalance('WATT')?.balance;
  const wusdcBalance = getBalance('WUSDC')?.balanceUsd;
  const usdcBalance = getBalance('USDC')?.balanceUsd;

  const [index, setIndex] = useState(1);
  const loading = props.loading && <></>;
  return (
    <View style={[carousalStyles.container]}>
      <DText style={carousalStyles.title} fontStyle="fontSemiBold">
        BALANCE
      </DText>
      <View style={carousalStyles.cardContainerWrapper}>
        <LinearGradient
          colors={['#008D85', '#23CEC4']}
          locations={[0, 0.5, 1]}
          style={[carousalStyles.cardContainer]}>
          <View style={{margin: 10}}>
            <Tab
              value={index}
              onChange={e => {
                setIndex(e);
              }}
              indicatorStyle={carousalStyles.indicator}
              style={carousalStyles.tab}>
              <Tab.Item
                active
                title="ENERGY"
                buttonStyle={[
                  carousalStyles.button,
                  index === 0 && carousalStyles.buttonActive,
                ]}
                activeOpacity={1}
                titleStyle={
                  index === 0
                    ? carousalStyles.tabTitleActive
                    : carousalStyles.tabTitle
                }
              />
              <Tab.Item
                title="WATT"
                buttonStyle={[
                  carousalStyles.button,
                  index === 1 && carousalStyles.buttonActive,
                ]}
                activeOpacity={1}
                titleStyle={
                  index === 1
                    ? carousalStyles.tabTitleActive
                    : carousalStyles.tabTitle
                }
              />
              <Tab.Item
                title="USD"
                buttonStyle={[
                  carousalStyles.button,
                  index === 2 && carousalStyles.buttonActive,
                ]}
                activeOpacity={1}
                titleStyle={
                  index === 2
                    ? carousalStyles.tabTitleActive
                    : carousalStyles.tabTitle
                }
              />
            </Tab>
          </View>
          <TabView value={index} onChange={setIndex} animationType="spring">
            <TabView.Item style={carousalStyles.tabItem}>
              <DText fontStyle="fontBold" style={carousalStyles.value}>
                {loading}
                {!props.loading &&
                  formatQuantityMWh(Number(props?.drecsOwned ?? 0))}
              </DText>
            </TabView.Item>
            <TabView.Item style={carousalStyles.tabItem}>
              <DText fontStyle="fontBold" style={carousalStyles.value}>
                {/* {loading} */}
                {Number(wattBalance).toFixed(2)} WATT
              </DText>
            </TabView.Item>
            <TabView.Item style={carousalStyles.tabItem}>
              <DText fontStyle="fontBold" style={carousalStyles.value}>
                ${' '}
                {Number(Number(wusdcBalance) + Number(usdcBalance)).toFixed(2)}
              </DText>
            </TabView.Item>
          </TabView>
        </LinearGradient>
      </View>
    </View>
  );
}

const carousalStyles = StyleSheet.create({
  title: {
    alignSelf: 'flex-start',
    letterSpacing: 2.24,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  container: {
    margin: 21,
    marginBottom: 30,
  },
  indicator: {
    backgroundColor: 'transparent',
  },
  cardContainerWrapper: {
    height: 110,
    width: '100%',
    borderRadius: 15,
    // backgroundColor: '#000',
  },
  cardContainer: {
    backgroundColor: '#009D94',
    // padding: 10,
    height: '100%',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 7,
  },
  tab: {
    borderBottomWidth: 0,
    backgroundColor: '#0000004d',
    borderRadius: 5,
    padding: 4,
  },
  tabTitleActive: {
    opacity: 1,
    color: '#000',
    fontSize: 12,
    height: 30,
    fontFamily: fontsFamily.Mulish,
  },
  tabTitle: {
    color: '#FFF',
    fontSize: 12,
    height: 30,
    opacity: 0.8,
    fontFamily: fontsFamily.Mulish,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  value: {
    fontSize: 28,
    alignSelf: 'center',
    color: '#FFF',
    marginBottom: 10,
  },
  button: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: 'white',
    borderRadius: 5,
  },
});
