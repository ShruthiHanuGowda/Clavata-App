import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    StyleSheet,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { CREATE_REVIEW } from '../../graphql/queries';

export default function RateReviewScreen({
    route,
    navigation,
}: any) {

    const { booking } = route.params;

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const [createReview, { loading }] =
        useMutation(CREATE_REVIEW);

    const submitReview = async () => {

        if (rating === 0) {
            Alert.alert(
                'Rating Required',
                'Please select a rating.',
            );
            return;
        }

        try {
            const response =
                await createReview({
                    variables: {
                        input: {
                            bookingId: booking.bookingId,
                            salonId: booking.salonId,
                            customerUserId: booking.customerUserId,
                            customerName: booking.customerName,
                            rating,
                            review,
                        },
                    },
                });

            if (
                response.data.createReview.success
            ) {

                Alert.alert(
                    'Thank You',
                    'Your review has been submitted.',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                                navigation.goBack(),
                        },
                    ],
                );

            } else {

                Alert.alert(
                    'Error',
                    response.data.createReview.message,
                );

            }

        } catch (error: any) {

            Alert.alert(
                'Error',
                error.message,
            );

        }

    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.card}>

                <Text style={styles.title}>
                    Rate Your Experience
                </Text>

                <Text style={styles.salon}>
                    {booking.salonName}
                </Text>

                <Text style={styles.subtitle}>
                    How was your appointment?
                </Text>

                <View style={styles.starContainer}>

                    {[1, 2, 3, 4, 5].map((item) => (

                        <TouchableOpacity
                            key={item}
                            onPress={() =>
                                setRating(item)
                            }>

                            <Text
                                style={{
                                    fontSize: 42,
                                    marginHorizontal: 6,
                                    color:
                                        item <= rating
                                            ? '#FBBF24'
                                            : '#D1D5DB',
                                }}>
                                ★
                            </Text>

                        </TouchableOpacity>

                    ))}

                </View>

                <TextInput
                    placeholder="Write your review (optional)"
                    value={review}
                    onChangeText={setReview}
                    multiline
                    style={styles.input}
                />

                <TouchableOpacity
                    style={styles.submitButton}
                    disabled={loading}
                    onPress={submitReview}>

                    <Text style={styles.submitButtonText}>
                        {
                            loading
                                ? 'Submitting...'
                                : 'Submit Review'
                        }
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }>

                    <Text style={styles.later}>
                        Maybe Later
                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        justifyContent: 'center',
        padding: 20,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 24,
        elevation: 3,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },

    salon: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: '600',
        color: '#009D94',
        textAlign: 'center',
    },

    subtitle: {
        marginTop: 20,
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 15,
    },

    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 24,
    },

    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        minHeight: 120,
        padding: 14,
        textAlignVertical: 'top',
        fontSize: 15,
        color: '#111827',
    },

    submitButton: {
        marginTop: 24,
        backgroundColor: '#009D94',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },

    later: {
        marginTop: 18,
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 15,
    },

});