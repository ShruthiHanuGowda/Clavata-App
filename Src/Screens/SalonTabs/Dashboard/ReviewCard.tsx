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
  review?: string;
  onReply?: () => void;
};

export default function ReviewCard({
  customer,
  rating,
  review,
  onReply,
}: Props) {

  const renderStars = () => {

    return (
      <>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={{
              fontSize: 18,
              color: star <= rating ? '#FBBF24' : '#D1D5DB',
            }}>
            ★
          </Text>
        ))}
      </>
    );

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

        <View
          style={{
            flexDirection: 'row',
          }}>
          {renderStars()}
        </View>

      </View>

      {!!review && (
        <Text style={styles.reviewText}>
          {review}
        </Text>
      )}

      {onReply && (
        <TouchableOpacity
          style={styles.replyButton}
          activeOpacity={0.8}
          onPress={onReply}>

          <Text style={styles.replyButtonText}>
            Reply
          </Text>

        </TouchableOpacity>
      )}

    </View>
  );
}