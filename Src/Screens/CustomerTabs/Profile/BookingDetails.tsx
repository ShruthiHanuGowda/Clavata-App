import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@apollo/client';

import { GET_BOOKING } from '../../../graphql/queries';

type BookingDetailsRouteParams = {
    bookingId: string;
};

export default function BookingDetails() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { bookingId } =
        route.params as BookingDetailsRouteParams;

    const {
        data,
        loading,
        error,
    } = useQuery(GET_BOOKING, {
        variables: {
            bookingId,
        },
        skip: !bookingId,
        fetchPolicy: 'network-only',
    });

    const booking = data?.GetBooking;

    console.log('BookingDetails data:', data);

    const formatDate = (dateString: string) => {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        if (!time) {
            return '';
        }

        const [hoursString, minutesString] =
            time.split(':');

        let hours = Number(hoursString);
        const minutes = minutesString || '00';

        if (Number.isNaN(hours)) {
            return time;
        }

        const period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;

        if (hours === 0) {
            hours = 12;
        }

        return `${String(hours).padStart(
            2,
            '0'
        )
            }:${minutes} ${period} `;
    };

    const formatCurrency = (amount: number) => {
        return `₹${Number(amount || 0).toLocaleString(
            'en-IN',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )
            } `;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return {
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                };

            case 'PENDING':
                return {
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                };

            case 'COMPLETED':
                return {
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                };

            case 'CANCELLED':
                return {
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                };

            case 'NO_SHOW':
                return {
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                };

            default:
                return {
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                };
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingScreen}>
                <ActivityIndicator
                    size="large"
                    color="#009D94"
                />

                <Text style={styles.loadingText}>
                    Loading booking...
                </Text>
            </SafeAreaView>
        );
    }

    if (error || !booking) {
        return (
            <SafeAreaView style={styles.loadingScreen}>
                <Text style={styles.errorTitle}>
                    Unable to load booking
                </Text>

                <Text style={styles.errorText}>
                    {error?.message ||
                        'Booking details could not be found.'}
                </Text>

                <TouchableOpacity
                    style={styles.backButtonLarge}
                    onPress={() => navigation.goBack()}
                >
                    <Text
                        style={
                            styles.backButtonLargeText
                        }
                    >
                        Go Back
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const statusStyle = getStatusStyle(
        booking.bookingStatus
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.content
                }
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.goBack()
                        }
                        style={styles.backButton}
                    >
                        <Text style={styles.back}>
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        Booking Details
                    </Text>

                    <View style={styles.headerSpacer} />
                </View>

                {/* BOOKING STATUS */}

                <View style={styles.statusCard}>
                    <View>
                        <Text style={styles.statusLabel}>
                            Booking Status
                        </Text>

                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor:
                                        statusStyle.backgroundColor,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    {
                                        color:
                                            statusStyle.color,
                                    },
                                ]}
                            >
                                {booking.bookingStatus}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bookingIdContainer}>
                        <Text
                            style={
                                styles.bookingIdLabel
                            }
                        >
                            Booking ID
                        </Text>

                        <Text
                            style={
                                styles.bookingId
                            }
                            numberOfLines={1}
                        >
                            #{booking.bookingId.slice(
                                0,
                                8
                            )}
                        </Text>
                    </View>
                </View>

                {/* SALON */}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Salon
                    </Text>

                    <View style={styles.salonRow}>
                        <View style={styles.salonIcon}>
                            <Text style={styles.salonIconText}>
                                ✂
                            </Text>
                        </View>

                        <View style={styles.salonInfo}>
                            <Text
                                style={
                                    styles.salonName
                                }
                            >
                                {booking.salonName}
                            </Text>

                            <Text
                                style={
                                    styles.salonPhone
                                }
                            >
                                {booking.customerPhone
                                    ? 'Your booking'
                                    : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* DATE & TIME */}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Appointment
                    </Text>

                    <View style={styles.appointmentRow}>
                        <View
                            style={
                                styles.appointmentItem
                            }
                        >
                            <Text
                                style={
                                    styles.appointmentIcon
                                }
                            >
                                📅
                            </Text>

                            <View>
                                <Text
                                    style={
                                        styles.smallLabel
                                    }
                                >
                                    Date
                                </Text>

                                <Text
                                    style={
                                        styles.appointmentValue
                                    }
                                >
                                    {formatDate(
                                        booking.bookingDate
                                    )}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={
                                styles.appointmentItem
                            }
                        >
                            <Text
                                style={
                                    styles.appointmentIcon
                                }
                            >
                                🕐
                            </Text>

                            <View>
                                <Text
                                    style={
                                        styles.smallLabel
                                    }
                                >
                                    Time
                                </Text>

                                <Text
                                    style={
                                        styles.appointmentValue
                                    }
                                >
                                    {formatTime(
                                        booking.startTime
                                    )}
                                </Text>

                                <Text
                                    style={
                                        styles.endTime
                                    }
                                >
                                    Until{' '}
                                    {formatTime(
                                        booking.endTime
                                    )}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* SERVICES */}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Services
                    </Text>

                    {booking.services?.map(
                        (
                            service: any,
                            index: number
                        ) => (
                            <View
                                key={
                                    service.serviceId ||
                                    index
                                }
                                style={[
                                    styles.serviceRow,
                                    index !==
                                    booking.services
                                        .length -
                                    1 &&
                                    styles.serviceBorder,
                                ]}
                            >
                                <View
                                    style={
                                        styles.serviceInfo
                                    }
                                >
                                    <Text
                                        style={
                                            styles.serviceName
                                        }
                                    >
                                        {service.name}
                                    </Text>

                                    <Text
                                        style={
                                            styles.serviceMeta
                                        }
                                    >
                                        {
                                            service.category
                                        }{' '}
                                        •{' '}
                                        {
                                            service.duration
                                        }{' '}
                                        min
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.servicePrice
                                    }
                                >
                                    {formatCurrency(
                                        service.price
                                    )}
                                </Text>
                            </View>
                        )
                    )}

                    <View
                        style={
                            styles.totalDurationRow
                        }
                    >
                        <Text
                            style={
                                styles.totalDurationLabel
                            }
                        >
                            Total duration
                        </Text>

                        <Text
                            style={
                                styles.totalDurationValue
                            }
                        >
                            {booking.totalDuration} min
                        </Text>
                    </View>
                </View>

                {/* STAFF */}

                {booking.staffName ? (
                    <View style={styles.card}>
                        <Text
                            style={styles.sectionTitle}
                        >
                            Staff
                        </Text>

                        <View style={styles.staffRow}>
                            <View
                                style={
                                    styles.staffAvatar
                                }
                            >
                                <Text
                                    style={
                                        styles.staffAvatarText
                                    }
                                >
                                    {booking.staffName
                                        .charAt(0)
                                        .toUpperCase()}
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.staffName
                                }
                            >
                                {booking.staffName}
                            </Text>
                        </View>
                    </View>
                ) : null}

                {/* PRICE DETAILS */}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Payment Details
                    </Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>
                            Subtotal
                        </Text>

                        <Text style={styles.priceValue}>
                            {formatCurrency(
                                booking.subtotal
                            )}
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>
                            Discount
                        </Text>

                        <Text
                            style={[
                                styles.priceValue,
                                styles.discountText,
                            ]}
                        >
                            -
                            {formatCurrency(
                                booking.discount
                            )}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                        <Text
                            style={
                                styles.grandTotalLabel
                            }
                        >
                            Total Amount
                        </Text>

                        <Text
                            style={
                                styles.grandTotalValue
                            }
                        >
                            {formatCurrency(
                                booking.totalAmount
                            )}
                        </Text>
                    </View>

                    {/* BOOKING FEE */}

                    {/* {booking.bookingFee > 0 ? (
                        <>
                            <View
                                style={
                                    styles.divider
                                }
                            />

                            <View
                                style={
                                    styles.priceRow
                                }
                            >
                                <Text
                                    style={
                                        styles.priceLabel
                                    }
                                >
                                    Booking Fee
                                </Text>

                                <Text
                                    style={
                                        styles.priceValue
                                    }
                                >
                                    {formatCurrency(
                                        booking.bookingFee
                                    )}
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.priceRow
                                }
                            >
                                <Text
                                    style={
                                        styles.priceLabel
                                    }
                                >
                                    Remaining Amount
                                </Text>

                                <Text
                                    style={
                                        styles.remainingAmount
                                    }
                                >
                                    {formatCurrency(
                                        booking.remainingAmount
                                    )}
                                </Text>
                            </View>
                        </>
                    ) : null} */}
                    {booking.bookingFee > 0 ? (
                        <>
                            <View style={styles.divider} />

                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>
                                    Booking Fee
                                </Text>

                                <Text style={styles.priceValue}>
                                    {formatCurrency(
                                        booking.bookingFee
                                    )}
                                </Text>
                            </View>

                            {booking.bookingStatus !== 'COMPLETED' &&
                                Number(booking.remainingAmount || 0) > 0 ? (
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>
                                        Remaining Amount
                                    </Text>

                                    <Text style={styles.remainingAmount}>
                                        {formatCurrency(
                                            booking.remainingAmount
                                        )}
                                    </Text>
                                </View>
                            ) : null}
                        </>
                    ) : null}
                    <View
                        style={
                            styles.paymentStatusContainer
                        }
                    >
                        <Text
                            style={
                                styles.paymentMethodLabel
                            }
                        >
                            Payment Method
                        </Text>

                        <Text
                            style={
                                styles.paymentMethodValue
                            }
                        >
                            {booking.paymentMethod ===
                                'PAY_AT_SALON'
                                ? 'Pay at Salon'
                                : 'Online'}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.paymentStatusContainer
                        }
                    >
                        <Text
                            style={
                                styles.paymentMethodLabel
                            }
                        >
                            Payment Status
                        </Text>

                        <View
                            style={
                                styles.paymentStatusBadge
                            }
                        >
                            <Text
                                style={
                                    styles.paymentStatusText
                                }
                            >
                                {booking.paymentStatus}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CUSTOMER NOTE */}

                {booking.notes ? (
                    <View style={styles.card}>
                        <Text
                            style={styles.sectionTitle}
                        >
                            Your Note
                        </Text>

                        <Text
                            style={styles.noteText}
                        >
                            {booking.notes}
                        </Text>
                    </View>
                ) : null}

                {/* SALON NOTE */}

                {booking.salonNote ? (
                    <View style={styles.card}>
                        <Text
                            style={styles.sectionTitle}
                        >
                            Salon Note
                        </Text>

                        <Text
                            style={styles.noteText}
                        >
                            {booking.salonNote}
                        </Text>
                    </View>
                ) : null}

                {/* REVIEW */}

                {booking.bookingStatus ===
                    'COMPLETED' &&
                    !booking.reviewSubmitted ? (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() =>
                            navigation.navigate(
                                'WriteReview',
                                {
                                    bookingId:
                                        booking.bookingId,
                                    salonId:
                                        booking.salonId,
                                    salonName:
                                        booking.salonName,
                                }
                            )
                        }
                    >
                        <Text
                            style={
                                styles.reviewButtonText
                            }
                        >
                            ⭐ Write a Review
                        </Text>
                    </TouchableOpacity>
                ) : null}

                {/* EXISTING REVIEW */}

                {booking.reviewSubmitted &&
                    booking.review ? (
                    <View style={styles.card}>
                        <Text
                            style={styles.sectionTitle}
                        >
                            Your Review
                        </Text>

                        <Text
                            style={
                                styles.ratingText
                            }
                        >
                            {'★'.repeat(
                                booking.rating || 0
                            )}
                        </Text>

                        <Text
                            style={styles.reviewText}
                        >
                            {booking.review}
                        </Text>
                    </View>
                ) : null}

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const PRIMARY = '#009D94';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    content: {
        padding: 16,
    },

    loadingScreen: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },

    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 14,
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },

    errorText: {
        marginTop: 8,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },

    backButtonLarge: {
        marginTop: 20,
        backgroundColor: PRIMARY,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },

    backButtonLargeText: {
        color: '#fff',
        fontWeight: '700',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },

    back: {
        fontSize: 38,
        color: '#111827',
        lineHeight: 40,
    },

    headerTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },

    headerSpacer: {
        width: 42,
    },

    statusCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    statusLabel: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 7,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },

    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },

    bookingIdContainer: {
        alignItems: 'flex-end',
        maxWidth: 120,
    },

    bookingIdLabel: {
        color: '#9CA3AF',
        fontSize: 11,
        marginBottom: 4,
    },

    bookingId: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '600',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 15,
    },

    salonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    salonIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F8F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    salonIconText: {
        fontSize: 22,
        color: PRIMARY,
    },

    salonInfo: {
        marginLeft: 12,
        flex: 1,
    },

    salonName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
    },

    salonPhone: {
        marginTop: 4,
        fontSize: 13,
        color: '#6B7280',
    },

    appointmentRow: {
        flexDirection: 'row',
        gap: 18,
    },

    appointmentItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    appointmentIcon: {
        fontSize: 20,
        marginRight: 10,
    },

    smallLabel: {
        color: '#9CA3AF',
        fontSize: 11,
        marginBottom: 3,
    },

    appointmentValue: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '700',
    },

    endTime: {
        color: '#6B7280',
        fontSize: 11,
        marginTop: 2,
    },

    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },

    serviceBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    serviceInfo: {
        flex: 1,
        paddingRight: 10,
    },

    serviceName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },

    serviceMeta: {
        marginTop: 4,
        color: '#6B7280',
        fontSize: 12,
    },

    servicePrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

    totalDurationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },

    totalDurationLabel: {
        color: '#6B7280',
        fontSize: 13,
    },

    totalDurationValue: {
        color: '#111827',
        fontSize: 13,
        fontWeight: '600',
    },

    staffRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    staffAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F8F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    staffAvatarText: {
        color: PRIMARY,
        fontSize: 18,
        fontWeight: '700',
    },

    staffName: {
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },

    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    priceLabel: {
        color: '#6B7280',
        fontSize: 14,
    },

    priceValue: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '600',
    },

    discountText: {
        color: '#16A34A',
    },

    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 5,
        marginBottom: 15,
    },

    grandTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    grandTotalValue: {
        fontSize: 17,
        fontWeight: '800',
        color: PRIMARY,
    },

    remainingAmount: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '700',
    },

    paymentStatusContainer: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    paymentMethodLabel: {
        color: '#6B7280',
        fontSize: 13,
    },

    paymentMethodValue: {
        color: '#111827',
        fontSize: 13,
        fontWeight: '600',
    },

    paymentStatusBadge: {
        backgroundColor: '#E8F8F6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },

    paymentStatusText: {
        color: PRIMARY,
        fontSize: 11,
        fontWeight: '700',
    },

    noteText: {
        color: '#4B5563',
        fontSize: 14,
        lineHeight: 21,
    },

    reviewButton: {
        backgroundColor: PRIMARY,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    reviewButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    ratingText: {
        color: '#F59E0B',
        fontSize: 20,
        letterSpacing: 2,
        marginBottom: 8,
    },

    reviewText: {
        color: '#4B5563',
        fontSize: 14,
        lineHeight: 21,
    },
});

