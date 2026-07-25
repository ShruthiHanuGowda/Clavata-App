import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import styles from './styles';

type Props = {
  customer: string;
  rating: number;
  review: string;
  onReply?: () => void;
};

export default function ReviewCard({
  customer,
  rating,
  review,
  onReply,
}: Props) {

  const renderStars = () => {
    return '⭐'.repeat(rating);
  };

  return (
    <View style={styles.reviewCard}>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>

        <Text style={styles.reviewName}>
          {customer}
        </Text>

        <Text style={styles.reviewStars}>
          {renderStars()}
        </Text>

      </View>

      <Text style={styles.reviewText}>
        {review}
      </Text>

      <TouchableOpacity
        style={styles.replyButton}
        activeOpacity={0.8}
        onPress={onReply}>

        <Text style={styles.replyButtonText}>
          Reply
        </Text>

      </TouchableOpacity>

    </View>
  );
}