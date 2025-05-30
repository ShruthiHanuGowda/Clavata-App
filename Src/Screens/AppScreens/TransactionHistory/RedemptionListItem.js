import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import styles from './styles';
import moment from 'moment';

class RedemptionListItem extends React.PureComponent {
  render() {
    const {item = mockRedemptionData, setSelectedItems} = this.props;

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        // onPress={() => {
        //   setSelectedItems(item);
        // }}
        style={styles.itemContainer}>
        <View
          style={{flexDirection: 'row', alignItems: 'center', width: '60%'}}>
          <View
            style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
            <View style={{width: '80%', paddingRight: 10}}>
              <Text
                style={{
                  ...styles.transationType,
                  color:
                    item.transactionStatus === 'Pending'
                      ? '#F7931A'
                      : '#515151',
                }}>
                ID: {item.sequenceId}
              </Text>
              <Text style={styles.username}>
                {moment(item.date).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: '40%',
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
            paddingLeft: 10,
          }}>
          <Text
            style={{
              ...styles.amount,
              color: '#007E32',
            }}>
            QTY : {item.amount}
          </Text>
          <Text style={styles.time}>{item.amount} mWh</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default RedemptionListItem;
