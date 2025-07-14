import moment from 'moment';
import React, {useState} from 'react';
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import BottomSheet from 'react-native-btr';
import {DText} from '../../../Componants/DText';
import styles from './styles';

const BlockchainTransactionSectionList = ({
  data,
  refreshing = false,
  _onRefresh = () => {},
  loadingExtraData = false,
  filters = {},
  hasMoreData = false,
  setFilters = () => {},
}) => {
  const [transactionDetailsVisible, setTransactionDetailsVisible] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Format functions
  const formatValue = (value: string) => {
    const ethValue = parseFloat(value) / Math.pow(10, 18);
    return ethValue.toFixed(6);
  };

  const formatGwei = (value: string) => {
    const gweiValue = parseFloat(value) / Math.pow(10, 9);
    return gweiValue.toFixed(2);
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok':
        return 'Success';
      case 'pending':
        return 'Pending';
      case 'error':
        return 'Failed';
      default:
        return status;
    }
  };

  const openInExplorer = (hash: string) => {
    const explorerUrl = `https://explorernew.denergytestnet.com/tx/${hash}`;
    Linking.openURL(explorerUrl);
  };

  // Section title logic
  const REFERENCE = moment();
  const TODAY = REFERENCE.clone().startOf('day');
  const YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  const A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');

  const isToday = momentDate => momentDate.isSame(TODAY, 'd');
  const isYesterday = momentDate => momentDate.isSame(YESTERDAY, 'd');
  const isWithinAWeek = momentDate => momentDate.isAfter(A_WEEK_OLD);

  const checkDate = momentDate => {
    if (filters?.startDate) {
      return moment(momentDate).format('MMM YYYY');
    }
    const checktoday = isToday(moment(momentDate));
    const checkYesterday = isYesterday(moment(momentDate));
    const checkLastWeek = isWithinAWeek(moment(momentDate));
    const checkWithing30Days = moment().diff(moment(momentDate), 'days');
    const title = checktoday
      ? 'TODAY'
      : checkYesterday
      ? 'YESTERDAY'
      : checkLastWeek
      ? 'LAST WEEK'
      : checkWithing30Days <= 30
      ? 'LAST 30 DAYS'
      : 'OLDER';
    return title;
  };

  const SECTION_DATA = Object.values(
    data.reduce((acc, item) => {
      const formatedDate = moment(item.timestamp).format('YYYY-MM-DD');
      const title = checkDate(formatedDate);
      if (!acc[title])
        acc[title] = {
          title,
          data: [],
        };
      acc[title].data.push(item);
      return acc;
    }, {}),
  );

  const renderEmpty = () => {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 100,
        }}>
        <Text>No transactions found</Text>
      </View>
    );
  };

  const setSelectedItems = transaction => {
    setSelectedTransaction(transaction);
    setTransactionDetailsVisible(true);
  };

  const onEndReached = () => {
    if (hasMoreData && !refreshing) {
      setFilters({
        ...filters,
        page: filters.page + 1,
      });
    }
  };

  const renderFooter = () => {
    return data?.length > 0 && loadingExtraData && !refreshing ? (
      <ActivityIndicator />
    ) : (
      hasMoreData && (
        <TouchableOpacity
          onPress={onEndReached}
          style={{
            alignItems: 'center',
          }}>
          <DText
            style={{
              color: '#009D94',
            }}>
            Load More
          </DText>
        </TouchableOpacity>
      )
    );
  };

  // Transaction List Item Component
  const TransactionItem = ({item}) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={() => setSelectedItems(item)}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
        <View style={{flex: 1, marginRight: 12}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}>
            <View
              style={{
                backgroundColor: getStatusColor(item.status),
                width: 8,
                height: 8,
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <DText
              fontStyle="fontMedium"
              style={{
                fontSize: 12,
                color: getStatusColor(item.status),
              }}>
              {getStatusText(item.status)}
            </DText>
          </View>

          <DText
            fontStyle="fontMedium"
            style={{
              fontSize: 14,
              color: '#333333',
              marginBottom: 4,
            }}>
            {formatHash(item.hash)}
          </DText>

          <DText
            fontStyle="fontRegular"
            style={{
              fontSize: 12,
              color: '#666666',
            }}>
            {moment(item.timestamp).format('MMM DD, YYYY HH:mm')}
          </DText>
        </View>

        <View style={{alignItems: 'flex-end'}}>
          <DText
            fontStyle="fontSemiBold"
            style={{
              fontSize: 16,
              color: '#333333',
              marginBottom: 2,
            }}>
            {formatValue(item.value)} ETH
          </DText>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Detail Row Component for Bottom Sheet
  const DetailRow = ({label, value, onPress = null}) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      }}>
      <DText
        fontStyle="fontRegular"
        style={{
          fontSize: 14,
          color: '#666666',
          flex: 1,
        }}>
        {label}
      </DText>
      <TouchableOpacity onPress={onPress} disabled={!onPress} style={{flex: 2}}>
        <DText
          fontStyle="fontMedium"
          style={{
            fontSize: 14,
            color: onPress ? '#009D94' : '#333333',
            textAlign: 'right',
          }}>
          {value}
        </DText>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <SectionList
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        renderItem={({item}) => <TransactionItem item={item} />}
        refreshControl={
          <RefreshControl
            colors={['#9Bd35A', '#689F38']}
            refreshing={refreshing}
            onRefresh={_onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({section: {title}}) => (
          <View style={styles.headerAlign}>
            <Text style={styles.header}>{title}</Text>
            <View style={styles.borderLine} />
          </View>
        )}
        sections={SECTION_DATA}
        onEndReachedThreshold={50}
        keyExtractor={(item, index) => item.hash + index}
        onEndReached={onEndReached}
        ListEmptyComponent={renderEmpty}
      />
      {renderFooter()}

      {/* Bottom Sheet for Transaction Details */}
      <BottomSheet
        visible={transactionDetailsVisible}
        onBackButtonPress={() => setTransactionDetailsVisible(false)}
        onBackdropPress={() => setTransactionDetailsVisible(false)}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
            paddingTop: 8,
          }}>
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#E0E0E0',
              alignSelf: 'center',
              borderRadius: 2,
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 20,
            }}>
            <DText
              fontStyle="fontSemiBold"
              style={{
                fontSize: 18,
                color: '#333333',
              }}>
              Transaction Details
            </DText>
            <TouchableOpacity
              onPress={() => setTransactionDetailsVisible(false)}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#666666',
                  fontWeight: 'bold',
                }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{paddingHorizontal: 20}}>
            {selectedTransaction && (
              <>
                <DetailRow
                  label="Transaction Hash"
                  value={selectedTransaction.hash}
                  onPress={() => openInExplorer(selectedTransaction.hash)}
                />

                <DetailRow
                  label="Status"
                  value={getStatusText(selectedTransaction.status)}
                />

                <DetailRow
                  label="Timestamp"
                  value={moment(selectedTransaction.timestamp).format(
                    'MMM DD, YYYY HH:mm:ss',
                  )}
                />

                <DetailRow
                  label="From"
                  value={formatAddress(selectedTransaction.from?.hash || '')}
                />

                <DetailRow
                  label="To"
                  value={formatAddress(selectedTransaction.to?.hash || '')}
                />

                <DetailRow
                  label="Value"
                  value={`${formatValue(selectedTransaction.value)} ETH`}
                />

                <DetailRow
                  label="Transaction Fee"
                  value={`${formatValue(
                    selectedTransaction.fee?.value || '0',
                  )} ETH`}
                />

                <DetailRow
                  label="Gas Price"
                  value={`${formatGwei(
                    selectedTransaction.gas_price || '0',
                  )} Gwei`}
                />

                <DetailRow
                  label="Gas Used"
                  value={selectedTransaction.gas_used?.toLocaleString() || '0'}
                />

                <DetailRow
                  label="Gas Limit"
                  value={selectedTransaction.gas_limit?.toLocaleString() || '0'}
                />

                <DetailRow
                  label="Gas Usage Ratio"
                  value={`${(
                    (parseInt(selectedTransaction.gas_used || '0') /
                      parseInt(selectedTransaction.gas_limit || '1')) *
                    100
                  ).toFixed(2)}%`}
                />

                <DetailRow
                  label="Gas Fees (Gwei)"
                  value={`${formatGwei(
                    selectedTransaction.fee?.value || '0',
                  )} Gwei`}
                />

                <DetailRow
                  label="Block Number"
                  value={
                    selectedTransaction.block_number?.toLocaleString() || '0'
                  }
                />

                <DetailRow
                  label="Nonce"
                  value={selectedTransaction.nonce?.toString() || '0'}
                />

                {selectedTransaction.confirmations && (
                  <DetailRow
                    label="Confirmations"
                    value={selectedTransaction.confirmations.toString()}
                  />
                )}
              </>
            )}

            <View style={{height: 40}} />
          </ScrollView>
        </View>
      </BottomSheet>
    </>
  );
};

export default BlockchainTransactionSectionList;
