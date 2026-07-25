import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import styles from './styles';

type Props = {
  customer: string;
  service: string;
  staff: string;
  amount: number;
  time: string;
  status: string;
  phone: string;
  onPress: () => void;
};

export default function AppointmentCard({
  customer,
  service,
  staff,
  amount,
  time,
  status,
  phone,
  onPress,
}: Props) {

  const badgeColor = () => {
    switch (status) {
      case 'CONFIRMED':
        return '#E8F8F6';

      case 'IN_PROGRESS':
        return '#FFF3CD';

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
      case 'CONFIRMED':
        return '#009D94';

      case 'IN_PROGRESS':
        return '#F59E0B';

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
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}>

      <View style={styles.row}>

        <View style={{ flex: 1 }}>

          <Text style={styles.customer}>
            {customer}
          </Text>

          <Text style={styles.service}>
            {service}
          </Text>

          <Text style={styles.staff}>
            Staff : {staff}
          </Text>

          <Text style={styles.phone}>
            {phone}
          </Text>

        </View>

        <View style={{ alignItems: 'flex-end' }}>

          <Text style={styles.time}>
            {time}
          </Text>

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

    </TouchableOpacity>
  );
}