import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';

import styles from './styles';

type Props = {
  name: string;
  duration: string;
  price: number;
  active: boolean;
  popular: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ServiceCard({
  name,
  duration,
  price,
  active,
  popular,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.serviceName}>
            {name}
          </Text>

          <Text style={styles.duration}>
            {duration}
          </Text>
        </View>

        <Text style={styles.price}>
          ${price}
        </Text>
      </View>

      {popular && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            Popular
          </Text>
        </View>
      )}

      <View style={styles.switchRow}>
        <Text>
          {active ? 'Active' : 'Inactive'}
        </Text>

        <Switch
          value={active}
        />
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}>
          <Text style={styles.buttonText}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}>
          <Text style={styles.buttonText}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}