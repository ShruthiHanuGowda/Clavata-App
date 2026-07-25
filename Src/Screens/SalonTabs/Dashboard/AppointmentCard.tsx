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
  time: string;
  amount: string;
  status: string;
  onPress?: () => void;
};

export default function AppointmentCard({
  customer,
  service,
  staff,
  time,
  amount,
  status,
  onPress,
}: Props) {
  const getStatusColor = () => {
    switch (status) {
      case 'Confirmed':
        return '#009D94';

      case 'In Progress':
        return '#F59E0B';

      case 'Completed':
        return '#22C55E';

      case 'Cancelled':
        return '#EF4444';

      default:
        return '#6B7280';
    }
  };

  const getStatusBackground = () => {
    switch (status) {
      case 'Confirmed':
        return '#E8F8F6';

      case 'In Progress':
        return '#FEF3C7';

      case 'Completed':
        return '#DCFCE7';

      case 'Cancelled':
        return '#FEE2E2';

      default:
        return '#F3F4F6';
    }
  };

  return (
    <TouchableOpacity
      style={styles.appointmentCard}
      activeOpacity={0.8}
      onPress={onPress}>

      <View style={styles.appointmentRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.customerName}>
            {customer}
          </Text>

          <Text style={styles.service}>
            ✂️ {service}
          </Text>

          <Text
            style={{
              color: '#6B7280',
              marginTop: 4,
            }}>
            👤 {staff}
          </Text>
        </View>

        <View
          style={{
            alignItems: 'flex-end',
          }}>
          <Text style={styles.appointmentTime}>
            {time}
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontWeight: '700',
              color: '#111827',
            }}>
            {amount}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              getStatusBackground(),
          },
        ]}>
        <Text
          style={[
            styles.statusText,
            {
              color: getStatusColor(),
            },
          ]}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}