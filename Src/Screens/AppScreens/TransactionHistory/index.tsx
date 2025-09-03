import React, {useState} from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import styles from './styles';
import {navigateBack} from '../../../utils/navigationService';
import {Header, Tab, TabView} from '@rneui/base';
import images from '../../../Theme/images';
import MiniTransactionHistory from '../CoinWallet/MiniTransactionHistory';
import {DText} from '../../../Componants/DText';

interface RouteParams {
  coinCode?: string;
}

interface TransactionHistoryProps {
  route?: {
    params?: RouteParams;
  };
}

const TransactionHistory: React.FC<TransactionHistoryProps> = props => {
  const [showFilter, setShowFilter] = useState<boolean>(false);
  // const [name, setUserName] = useState<string>('');
  const [index, setIndex] = useState<number>(0);
  const coinCode = props?.route?.params?.coinCode;
  // const [page, setPage] = useState<number>(0);

  const handleTabChange = (e: number): void => {
    // setPage(0);
    setIndex(e);
  };

  const handleFilterPress = (): void => {
    // Filter functionality to be implemented
  };

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Header
          containerStyle={componentStyles.headerContainer}
          centerComponent={
            <View style={styles.nameContainer}>
              <DText style={styles.title} fontStyle="fontBold">
                All Transactions Data
              </DText>
            </View>
          }
          rightComponent={
            index === 0 && (
              <TouchableOpacity
                onPress={handleFilterPress}
                style={styles.dotContainer}>
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
            onChange={handleTabChange}
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
                  // name={name}
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
};

const componentStyles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 0,
  },
});

export default TransactionHistory;
