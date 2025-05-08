import {Tab, TabView} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {DText} from '../../Componants/DText';
import {fontsFamily} from '../../Theme';
import {useWallet} from '../../../screens/Provider/WalletProvider';
import {number} from 'bitcoinjs-lib/types/script';
export default function BalanceCarousal(props) {
  const {getBalance} = useWallet();
  const wattBalance = getBalance('WATT')?.balance;
  const wusdcBalance = getBalance('WUSDC')?.balanceUsd;
  const usdcBalance = getBalance('USDC')?.balanceUsd;

  const [index, setIndex] = useState(1);
  const loading = props.loading && <ActivityIndicator color={'#FFF'} />;
  return (
    <View style={[carousalStyles.container]}>
      <DText style={carousalStyles.title} fontStyle="fontSemiBold">
        BALANCE
      </DText>
      <LinearGradient
        colors={['#008D85', '#23CEC4']}
        locations={[0, 0.5, 1]}
        style={[carousalStyles.cardContainer]}>
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
        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={carousalStyles.tabItem}>
            <DText fontStyle="fontBold" style={carousalStyles.value}>
              {/* {`$${props?.drecsData?.drecsOwned}`} {loading} //NOTE  - for dynamic data */}
              MWh
            </DText>
          </TabView.Item>
          <TabView.Item style={carousalStyles.tabItem}>
            <DText fontStyle="fontBold" style={carousalStyles.value}>
              {/* {`${
                props?.WATT?.tokenBalance
                  ? Number(props?.WATT?.tokenBalance).toFixed(5)
                  : 0
              }`}{' '}
              {loading} //NOTE  - for dynamic data*/}
              {Number(wattBalance).toFixed(2)} WATT
            </DText>
          </TabView.Item>
          <TabView.Item style={carousalStyles.tabItem}>
            <DText fontStyle="fontBold" style={carousalStyles.value}>
              {/* {`$${
                props?.WUSDC?.tokenBalance
                  ? Number(props?.WUSDC?.tokenBalance).toFixed(5)
                  : 0
              }`}{' '}
              {loading} //NOTE  - for dynamic data*/}
              $ {Number(Number(wusdcBalance) + Number(usdcBalance)).toFixed(2)}
            </DText>
          </TabView.Item>
        </TabView>
      </LinearGradient>
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
  },
  indicator: {
    backgroundColor: 'transparent',
  },
  cardContainer: {
    backgroundColor: '#009D94',
    height: 110,
    padding: 10,
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
