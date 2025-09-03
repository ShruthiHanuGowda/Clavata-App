import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import styles from './styles';
import moment from 'moment';

interface RedemptionItem {
  sequenceId: string;
  date: string;
  amount: number;
  transactionStatus: string;
}

interface RedemptionListItemProps {
  item?: RedemptionItem;
  setSelectedItems?: (item: RedemptionItem) => void;
}

const mockRedemptionData: RedemptionItem = {
  sequenceId: 'mock-id',
  date: new Date().toISOString(),
  amount: 0,
  transactionStatus: 'Pending',
};

const RedemptionListItem: React.FC<RedemptionListItemProps> = ({
  item = mockRedemptionData,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      // onPress={() => {
      //   setSelectedItems(item);
      // }}
      style={styles.itemContainer}>
      <View style={componentStyles.leftSection}>
        <View style={componentStyles.infoContainer}>
          <View style={componentStyles.textContainer}>
            <Text
              style={[
                styles.transationType,
                item.transactionStatus === 'Pending'
                  ? componentStyles.pendingColor
                  : componentStyles.defaultColor,
              ]}>
              ID: {item.sequenceId}
            </Text>
            <Text style={styles.username}>
              {moment(item.date).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
      </View>
      <View style={componentStyles.rightSection}>
        <Text style={componentStyles.amountText}>QTY : {item.amount}</Text>
        <Text style={styles.time}>{item.amount} mWh</Text>
      </View>
    </TouchableOpacity>
  );
};

const componentStyles = StyleSheet.create({
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  infoContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    width: '80%',
    paddingRight: 10,
  },
  rightSection: {
    width: '40%',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  amountText: {
    ...styles.amount,
    color: '#007E32',
  },
  pendingColor: {
    color: '#F7931A',
  },
  defaultColor: {
    color: '#515151',
  },
});

export default RedemptionListItem;
