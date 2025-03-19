import React, {useState} from 'react';
import {View, Image, TouchableOpacity, BackHandler} from 'react-native';
import styles from './styles';
import {navigateBack} from '../../../utils/navigationService';
import {Header, Tab, TabView} from '@rneui/base';
import images from '../../../Theme/images';
import RedemptionListItem from './RedemptionListItem';
import {FlatList} from 'react-native-gesture-handler';
import MiniTransactionHistory from '../CoinWallet/MiniTransactionHistory';
import {DText} from '../../../Componants/DText';

//NOTE - This data is just for UI testing
const mockRedemptionData = [
  {
    sequenceId: '5174',
    date: '2025-03-07T12:00:00Z',
    transactionStatus: 'Completed',
    amount: 0.001,
  },
  {
    sequenceId: '5173',
    date: '2025-03-06T15:00:00Z',
    transactionStatus: 'Pending',
    amount: 0.001,
  },
  {
    sequenceId: '5132',
    date: '2025-03-05T09:30:00Z',
    transactionStatus: 'Completed',
    amount: 0.001,
  },
  {
    sequenceId: '5165',
    date: '2025-03-04T11:45:00Z',
    transactionStatus: 'Pending',
    amount: 0.001,
  },
  {
    sequenceId: '5190',
    date: '2025-03-03T13:00:00Z',
    transactionStatus: 'Completed',
    amount: 0.001,
  },
  {
    sequenceId: '5191',
    date: '2025-03-02T16:30:00Z',
    transactionStatus: 'Completed',
    amount: 0.001,
  },
  {
    sequenceId: '5192',
    date: '2025-03-02T16:30:00Z',
    transactionStatus: 'Completed',
    amount: 0.001,
  },
];

export default function TransactionHistory(props) {
  const [showFilter, setShowFilter] = useState(false);
  const [name, setUserName] = useState('');
  const [index, setIndex] = useState(0);
  const coinCode = props?.route?.params?.coinCode;
  const [page, setPage] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Header
          containerStyle={{
            borderBottomWidth: 0,
          }}
          centerComponent={
            <View style={styles.nameContainer}>
              <DText style={styles.title} fontStyle="fontBold">
                All Transactions Data
              </DText>
            </View>
          }
          rightComponent={
            index === 0 && (
              <TouchableOpacity onPress={() => ''} style={styles.dotContainer}>
                <Image source={images.filter} />
              </TouchableOpacity>
            )
          }
          backgroundColor="#FFF"
          leftComponent={
            <TouchableOpacity
              onPress={() => navigateBack()}
              style={styles.dotContainer}>
              <Image source={images.back} />
            </TouchableOpacity>
          }
        />
        <View style={[styles.cardContainer]}>
          <Tab
            value={index}
            onChange={e => {
              setPage(0);
              setIndex(e);
            }}
            indicatorStyle={styles.indicator}
            style={styles.tab}>
            <Tab.Item
              active
              title="Transaction History"
              buttonStyle={[styles.button, index === 0 && styles.buttonActive]}
              activeOpacity={1}
              titleStyle={index === 0 ? styles.tabTitleActive : styles.tabTitle}
            />
            <Tab.Item
              title="Redemption History"
              buttonStyle={[styles.button, index === 1 && styles.buttonActive]}
              activeOpacity={1}
              titleStyle={index === 1 ? styles.tabTitleActive : styles.tabTitle}
            />
          </Tab>
        </View>
        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={styles.container}>
            <View style={styles.container}>
              <View style={styles.mainContainer}>
                <MiniTransactionHistory
                  showFilter={showFilter}
                  setShowFilter={setShowFilter}
                  coinCode={coinCode}
                  name={name}
                />
              </View>
            </View>
          </TabView.Item>
          <TabView.Item style={styles.container}>
            <View style={styles.container}>
              <View style={styles.redemptionContainer}>
                {/* <FlatList
                  data={mockRedemptionData}
                  renderItem={({item}) => (
                    <RedemptionListItem
                      item={item}
                      name={name}
                      // setSelectedItems={setItems}
                    />
                  )}
                /> */}
              </View>
            </View>
          </TabView.Item>
        </TabView>
      </View>
    </View>
  );
}
