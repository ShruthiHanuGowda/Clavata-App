import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import styles from './styles';

type Props = {
  bookingId: string;
  customer: string;
  service: string;
  amount: number;
  time: string;
  status: string;
  phone: string;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
};

export default function AppointmentCard({
  customer,
  service,
  amount,
  time,
  status,
  phone,
  onPress,
  onAccept,
  onReject,
}: Props) {

  const badgeColor = () => {
    switch (status) {
      case 'PENDING':
        return '#FFF3CD';

      case 'CONFIRMED':
        return '#E8F8F6';

      case 'COMPLETED':
        return '#D4EDDA';

      case 'CANCELLED':
        return '#F8D7DA';

      default:
        return '#EEEEEE';
    }
  };

  const textColor = () => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';

      case 'CONFIRMED':
        return '#009D94';

      case 'COMPLETED':
        return '#28A745';

      case 'CANCELLED':
        return '#DC3545';

      default:
        return '#666';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}>

      <View style={styles.row}>

        <View style={{ flex: 1 }}>

          <Text style={styles.customer}>
            {customer}
          </Text>

          <Text style={styles.service}>
            {service}
          </Text>

          <Text style={styles.phone}>
            {phone}
          </Text>

          <Text style={styles.time}>
            {time}
          </Text>

        </View>

        <View
          style={{
            alignItems: 'flex-end',
          }}>

          <Text style={styles.amount}>
            ₹{amount}
          </Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: badgeColor(),
              },
            ]}>
            <Text
              style={[
                styles.badgeText,
                {
                  color: textColor(),
                },
              ]}>
              {status}
            </Text>
          </View>

        </View>

      </View>

      {status === 'PENDING' && (
        <View
          style={{
            flexDirection: 'row',
            marginTop: 16,
          }}>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={onReject}>

            <Text
              style={styles.rejectButtonText}>
              Reject
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}>

            <Text
              style={styles.acceptButtonText}>
              Accept
            </Text>

          </TouchableOpacity>

        </View>
      )}

    </TouchableOpacity>
  );
}