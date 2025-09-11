import moment from 'moment';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import {BottomSheet} from 'react-native-btr';
import styles from './styles';
import images from '../../../Theme/images';

interface TransactionItem {
  details?: string;
  hash?: string;
  status?: string;
  change?: string;
  amount?: string;
  coinCode?: string;
  date?: string;
}

interface TransactionDetailsModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedItems?: TransactionItem;
}

interface TransactionDetailsProps {
  title: string;
  value: string;
  selectedItems?: TransactionItem;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  title,
  value,
  selectedItems,
}) => {
  const handlePress = (): void => {
    if (selectedItems?.details) {
      Linking.openURL(selectedItems.details);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.cardDetailsAlign,
        title === 'Txn Hash'
          ? componentStyles.txnHashSpacing
          : componentStyles.defaultSpacing,
      ]}>
      <View style={styles.cardDetailsTitleAlign}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardDetailsValueAlign}>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  visible,
  setVisible,
  selectedItems,
}) => {
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
          value={selectedItems?.hash ? selectedItems.hash : '---'}
          selectedItems={selectedItems}
        />
        <TransactionDetails
          title="Status"
          value={`${selectedItems?.status || ''}`.toLocaleUpperCase()}
          selectedItems={selectedItems}
        />
        <TransactionDetails
          title="Amount"
          value={`${selectedItems?.change || ''} ${
            selectedItems?.amount || ''
          } ${selectedItems?.coinCode || ''}`.trim()}
          selectedItems={selectedItems}
        />
        <TransactionDetails
          title="Date"
          value={
            selectedItems?.date
              ? moment(selectedItems.date).format('DD.MM.YYYY')
              : '---'
          }
          selectedItems={selectedItems}
        />
        <TransactionDetails
          title="Time"
          value={
            selectedItems?.date
              ? moment(selectedItems.date).format('hh:mm a')
              : '---'
          }
          selectedItems={selectedItems}
        />
      </View>
    </BottomSheet>
  );
};

const componentStyles = StyleSheet.create({
  txnHashSpacing: {
    paddingBottom: 5,
    paddingTop: 20,
  },
  defaultSpacing: {
    paddingBottom: 8,
    paddingTop: 9,
  },
});

export default TransactionDetailsModal;
