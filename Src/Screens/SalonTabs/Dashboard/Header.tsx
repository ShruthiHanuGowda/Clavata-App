import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import styles from './styles';
import { useUser } from '../../../context/UserContext';

type Props = {
  salonName: string;
};

export default function Header({
  salonName,
}: Props) {
  const { currentUser, setCurrentUser } = useUser();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.notificationButton}
        activeOpacity={0.8}>
        <Text style={{ fontSize: 20 }}>🔔</Text>
      </TouchableOpacity>

      {/* <Text style={styles.greeting}>
        Hi {currentUser?.fullName || 'there'}
      </Text> */}

      <Text style={styles.salonName}>
        {salonName}
      </Text>

      <Text
        style={{
          color: '#E5E7EB',
          marginTop: 8,
          fontSize: 15,
        }}>
        {formattedDate}
      </Text>
    </View>
  );
}