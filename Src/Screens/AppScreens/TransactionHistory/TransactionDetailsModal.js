import moment from 'moment';
import React from 'react';
import {View, Text, TouchableOpacity, Image, Linking} from 'react-native';
import {BottomSheet} from 'react-native-btr';
import styles from './styles';
import images from '../../../Theme/images';

const TransactionDetailsModal = ({visible, setVisible, selectedItems}) => {
  const TransactionDetails = ({title, value}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (selectedItems?.details) {
            Linking.openURL(selectedItems?.details);
          }
        }}
        style={{
          ...styles.cardDetailsAlign,
          paddingBottom: title == 'Txn Hash' ? 5 : 8,
          paddingTop: title == 'Txn Hash' ? 20 : 9,
        }}>
        <View style={styles.cardDetailsTitleAlign}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.cardDetailsValueAlign}>
          <Text style={styles.cardValue}>{value}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <BottomSheet
      visible={visible}
      onBackButtonPress={() => setVisible(false)}
      onBackdropPress={() => setVisible(false)}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>Details</Text>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={styles.cardCloseAlign}>
            <Image source={images.closeCircle} style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
        <TransactionDetails
          title="Txn Hash"
          value={selectedItems?._id ? selectedItems?._id : '---'}
        />
        <TransactionDetails
          title="Status"
          value={`${selectedItems?.status}`.toLocaleUpperCase()}
        />
        <TransactionDetails
          title="Amount"
          value={
            selectedItems?.change +
            ' ' +
            selectedItems?.amount +
            ' ' +
            selectedItems?.coinCode
          }
        />
        <TransactionDetails
          title="Date"
          value={moment(selectedItems?.date).format('DD.MM.YYYY')}
        />
        <TransactionDetails
          title="Time"
          value={moment(selectedItems?.date).format('hh:mm a')}
        />
      </View>
    </BottomSheet>
  );
};

export default TransactionDetailsModal;
