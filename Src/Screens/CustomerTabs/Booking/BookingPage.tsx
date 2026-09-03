import React, { useState } from 'react';
import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from 'react-native';

import { useMutation, useQuery } from '@apollo/client';

import { useUser } from '../../../context/UserContext';

import {
    CUSTOMER_BOOKINGS,
    CANCEL_BOOKING,
} from '../../../graphql/queries';

import { useNavigation } from '@react-navigation/native';
import { WalletStackParamList } from '../../../../types';

type BookingNavigationProp =
    NativeStackNavigationProp<
        WalletStackParamList,
        'explore'
    >;
// ============================================================
// DESIGN SYSTEM
// ============================================================

const COLORS = {
    background: '#F8F8FA',
    surface: '#FFFFFF',

    badgeColor: '#F9ECEC',

    primary: '#111111',

    text: '#111111',
    textSecondary: '#6B6B6B',
    textMuted: '#8A8A8A',

    border: '#E7E7E7',
    borderStrong: '#D6D6D6',

    white: '#FFFFFF',
    black: '#252525',

    transparent: 'transparent',
};


// ============================================================
// COMPONENT
// ============================================================

export default function BookingPage() {

    const navigation =
        useNavigation<BookingNavigationProp>();

    const [tab, setTab] =
        useState<'Upcoming' | 'Completed' | 'Cancelled'>(
            'Upcoming',
        );

    const [refreshing, setRefreshing] =
        useState(false);

    const { currentUser } =
        useUser();


    // ============================================================
    // GET BOOKINGS
    // ============================================================

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery(
        CUSTOMER_BOOKINGS,
        {
            variables: {
                customerUserId:
                    currentUser?.userId,
            },

            skip:
                !currentUser?.userId,

            fetchPolicy:
                'network-only',
        },
    );


    // ============================================================
    // CANCEL MUTATION
    // ============================================================

    const [
        cancelBookingMutation,
    ] = useMutation(
        CANCEL_BOOKING,
    );


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh =
        async () => {

            try {

                setRefreshing(true);

                await refetch();

            } catch (error) {

                console.log(
                    'Booking refresh error:',
                    error,
                );

            } finally {

                setRefreshing(false);

            }
        };


    // ============================================================
    // FILTER BOOKINGS
    // ============================================================

    const filteredBookings =
        data?.customerBookings?.filter(
            (booking: any) => {

                if (
                    tab === 'Upcoming'
                ) {

                    return (
                        booking.bookingStatus ===
                        'PENDING' ||

                        booking.bookingStatus ===
                        'CONFIRMED'
                    );
                }


                if (
                    tab === 'Completed'
                ) {

                    return (
                        booking.bookingStatus ===
                        'COMPLETED'
                    );
                }


                if (
                    tab === 'Cancelled'
                ) {

                    return (
                        booking.bookingStatus ===
                        'CANCELLED'
                    );
                }


                return false;

            },
        ) || [];


    // ============================================================
    // STATUS
    // ============================================================

    const getBookingStatus =
        (booking: any) => {

            if (
                booking.bookingStatus ===
                'PENDING'
            ) {

                return {

                    text:
                        'Waiting for salon',

                    color:
                        '#8A5A00',

                    background:
                        '#FFF8E7',

                    border:
                        '#F3D38A',

                };

            }


            if (
                booking.bookingStatus ===
                'CONFIRMED' &&

                booking.bookingFeeStatus !==
                'PAID'
            ) {

                return {

                    text:
                        'Payment required',

                    color:
                        '#A64B00',

                    background:
                        '#FFF4E8',

                    border:
                        '#F1C49A',

                };

            }


            if (
                booking.bookingStatus ===
                'CONFIRMED' &&

                booking.bookingFeeStatus ===
                'PAID'
            ) {

                return {

                    text:
                        'Booking confirmed',

                    color:
                        '#3F3F3F',

                    background:
                        '#F2F2F2',

                    border:
                        '#D8D8D8',

                };

            }


            if (
                booking.bookingStatus ===
                'COMPLETED'
            ) {

                return {

                    text:
                        'Completed',

                    color:
                        '#3F3F3F',

                    background:
                        '#F2F2F2',

                    border:
                        '#D8D8D8',

                };

            }


            return {

                text:
                    'Cancelled',

                color:
                    '#A33A3A',

                background:
                    '#FBEFEF',

                border:
                    '#EBCACA',

            };

        };


    // ============================================================
    // CANCEL BOOKING
    // ============================================================

    const cancelBooking =
        (bookingId: string) => {

            Alert.alert(

                'Cancel Booking',

                'Are you sure you want to cancel this booking?',

                [

                    {
                        text:
                            'Keep Booking',

                        style:
                            'cancel',
                    },

                    {

                        text:
                            'Cancel Booking',

                        style:
                            'destructive',

                        onPress:
                            async () => {

                                try {

                                    await cancelBookingMutation(
                                        {
                                            variables: {
                                                bookingId,
                                            },
                                        },
                                    );


                                    await refetch();


                                    Alert.alert(
                                        'Booking Cancelled',
                                        'Your booking has been cancelled successfully.',
                                    );

                                } catch (
                                e: any
                                ) {

                                    Alert.alert(
                                        'Unable to Cancel',
                                        e?.message ||
                                        'Something went wrong.',
                                    );

                                }

                            },
                    },

                ],
            );
        };

    const bookAgain = (booking: any) => {
        console.log('BOOK AGAIN:', {
            bookingId: booking?.bookingId,
            salonId: booking?.salonId,
            services: booking?.services,
        });

        if (!booking?.salonId) {
            Alert.alert(
                'Unable to book again',
                'Salon information is missing from this booking.',
            );
            return;
        }

        if (
            !Array.isArray(booking?.services) ||
            booking.services.length === 0
        ) {
            Alert.alert(
                'Unable to book again',
                'Service information is missing from this booking.',
            );
            return;
        }

        if (!currentUser?.userId) {
            Alert.alert(
                'Unable to book again',
                'Customer information is missing. Please login again.',
            );
            return;
        }

        const services = booking.services
            .map((service: any) => ({
                serviceId: String(service?.serviceId ?? ''),
                name: service?.name ?? '',
                category: service?.category ?? '',
                price: Number(service?.price ?? 0),
                duration: Number(service?.duration ?? 0),
            }))
            .filter(
                (service: {
                    serviceId: string;
                    name: string;
                    category: string;
                    price: number;
                    duration: number;
                }) => Boolean(service.serviceId),
            );

        if (services.length === 0) {
            Alert.alert(
                'Unable to book again',
                'No valid services were found in the previous booking.',
            );
            return;
        }

        console.log('BOOK AGAIN NAVIGATION:', {
            salonId: booking.salonId,
            customerUserId: currentUser.userId,
            services,
        });

        const parentNavigation = navigation.getParent<any>();

        if (!parentNavigation) {
            Alert.alert(
                'Unable to continue',
                'Navigation is not available.',
            );
            return;
        }

        parentNavigation.navigate('Home', {
            screen: 'BookingDateTime',
            params: {
                salonId: booking.salonId,
                customerUserId: currentUser.userId,
                services,
            },
        });
    };
    // ============================================================
    // VIEW BOOKING
    // ============================================================

    const viewBooking = (booking: any) => {
        console.log(
            'VIEW BOOKING:',
            booking.bookingId,
        );

        navigation.navigate(
            'BookingDetails',
            {
                bookingId:
                    booking.bookingId,

                booking,
            },
        );
    };
    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <SafeAreaView
                style={
                    styles.container
                }
            >

                <View
                    style={
                        styles.loadingContainer
                    }
                >

                    <View
                        style={
                            styles.loadingCircle
                        }
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Loading your bookings...
                    </Text>

                </View>

            </SafeAreaView>

        );

    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (

            <SafeAreaView
                style={
                    styles.container
                }
            >

                <View
                    style={
                        styles.errorContainer
                    }
                >

                    <View
                        style={
                            styles.errorIcon
                        }
                    >

                        <Text
                            style={
                                styles.errorIconText
                            }
                        >
                            !
                        </Text>

                    </View>


                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Unable to load bookings
                    </Text>


                    <Text
                        style={
                            styles.errorMessage
                        }
                    >
                        {error.message}
                    </Text>


                    <TouchableOpacity
                        style={
                            styles.retryButton
                        }
                        onPress={() =>
                            refetch()
                        }
                    >

                        <Text
                            style={
                                styles.retryText
                            }
                        >
                            Try Again
                        </Text>

                    </TouchableOpacity>

                </View>

            </SafeAreaView>

        );

    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <SafeAreaView
            style={
                styles.container
            }
        >

            <ScrollView

                showsVerticalScrollIndicator={
                    false
                }

                contentContainerStyle={
                    styles.scrollContent
                }

                refreshControl={

                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                        tintColor={
                            COLORS.primary
                        }
                    />

                }

            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <View
                    style={
                        styles.header
                    }
                >

                    <View>

                        <Text
                            style={
                                styles.title
                            }
                        >
                            Bookings
                        </Text>


                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Manage your appointments
                        </Text>

                    </View>


                    <View
                        style={
                            styles.headerIcon
                        }
                    >

                        <Text
                            style={
                                styles.headerIconText
                            }
                        >
                            ✓
                        </Text>

                    </View>

                </View>


                {/* ================================================= */}
                {/* TABS */}
                {/* ================================================= */}

                <View
                    style={
                        styles.tabsContainer
                    }
                >

                    {[
                        'Upcoming',
                        'Completed',
                        'Cancelled',
                    ].map(
                        item => {

                            const selected =
                                tab === item;


                            return (

                                <TouchableOpacity

                                    key={
                                        item
                                    }

                                    activeOpacity={
                                        0.8
                                    }

                                    style={[
                                        styles.tab,

                                        selected &&
                                        styles.activeTab,
                                    ]}

                                    onPress={() =>
                                        setTab(
                                            item as
                                            | 'Upcoming'
                                            | 'Completed'
                                            | 'Cancelled',
                                        )
                                    }

                                >

                                    <Text
                                        style={[
                                            styles.tabText,

                                            selected &&
                                            styles.activeTabText,
                                        ]}
                                    >
                                        {item}
                                    </Text>

                                </TouchableOpacity>

                            );

                        },
                    )}

                </View>


                {/* ================================================= */}
                {/* BOOKING COUNT */}
                {/* ================================================= */}

                {filteredBookings.length >
                    0 && (

                        <Text
                            style={
                                styles.resultText
                            }
                        >
                            {filteredBookings.length}{' '}
                            {filteredBookings.length ===
                                1
                                ? 'booking'
                                : 'bookings'}
                        </Text>

                    )}


                {/* ================================================= */}
                {/* EMPTY STATE */}
                {/* ================================================= */}

                {filteredBookings.length ===
                    0 ? (

                    <View
                        style={
                            styles.emptyContainer
                        }
                    >

                        <View
                            style={
                                styles.emptyIcon
                            }
                        >

                            <Text
                                style={
                                    styles.emptyIconText
                                }
                            >
                                ♢
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No {tab.toLowerCase()}{' '}
                            bookings
                        </Text>


                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            {tab ===
                                'Upcoming'
                                ? 'Your upcoming salon appointments will appear here.'
                                : tab ===
                                    'Completed'
                                    ? 'Completed appointments will appear here.'
                                    : 'Cancelled appointments will appear here.'}
                        </Text>

                    </View>

                ) : (

                    filteredBookings.map(
                        (item: any) => (

                            <BookingCard
                                key={
                                    item.bookingId
                                }

                                booking={
                                    item
                                }

                                status={
                                    getBookingStatus(
                                        item,
                                    )
                                }

                                tab={
                                    tab
                                }

                                onCancel={() =>
                                    cancelBooking(
                                        item.bookingId,
                                    )
                                }

                                onView={() =>
                                    viewBooking(
                                        item,
                                    )
                                }

                                onPay={() => {
                                    console.log(
                                        'PAYMENT BOOKING:',
                                        JSON.stringify(item, null, 2),
                                    );

                                    console.log(
                                        'PAYMENT PREFERRED METHOD:',
                                        item?.preferredPaymentMethod || 'NOT SET',
                                    );

                                    navigation.navigate(
                                        'BookingPayment',
                                        {
                                            booking: item,
                                        },
                                    );
                                }}
                                onBookAgain={() =>
                                    bookAgain(item)
                                }
                            />

                        ),
                    )

                )}


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                {filteredBookings.length >
                    0 && (

                        <Text
                            style={
                                styles.footer
                            }
                        >
                            Keep your appointments organised
                            with Clavata.
                        </Text>

                    )}

            </ScrollView>

        </SafeAreaView>

    );
}


// ============================================================
// BOOKING CARD
// ============================================================

type BookingCardProps = {

    booking: any;

    status: {
        text: string;
        color: string;
        background: string;
        border: string;
    };

    tab:
    | 'Upcoming'
    | 'Completed'
    | 'Cancelled';

    onCancel: () => void;

    onView: () => void;

    onPay: () => void;

    onBookAgain: () => void;
};


function BookingCard({
    booking,
    status,
    tab,
    onCancel,
    onView,
    onPay,
    onBookAgain,
}: BookingCardProps) {

    const services =
        booking.services
            ?.map(
                (service: any) =>
                    service.name,
            )
            .join(', ') ||
        'Salon services';


    return (

        <View
            style={
                styles.card
            }
        >

            {/* ================================================= */}
            {/* CARD HEADER */}
            {/* ================================================= */}

            <View
                style={
                    styles.cardHeader
                }
            >

                <View
                    style={
                        styles.salonIcon
                    }
                >

                    <Text
                        style={
                            styles.salonIconText
                        }
                    >
                        S
                    </Text>

                </View>


                <View
                    style={
                        styles.salonInfo
                    }
                >

                    <Text
                        style={
                            styles.salonName
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {booking.salonName ||
                            'Salon'}
                    </Text>


                    <Text
                        style={
                            styles.serviceText
                        }
                        numberOfLines={
                            2
                        }
                    >
                        {services}
                    </Text>

                </View>


                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                status.background,

                            borderColor:
                                status.border,
                        },
                    ]}
                >

                    <Text
                        style={[
                            styles.statusText,
                            {
                                color:
                                    status.color,
                            },
                        ]}
                    >
                        {status.text}
                    </Text>

                </View>

            </View>


            {/* ================================================= */}
            {/* DIVIDER */}
            {/* ================================================= */}

            <View
                style={
                    styles.divider
                }
            />


            {/* ================================================= */}
            {/* APPOINTMENT DETAILS */}
            {/* ================================================= */}

            <View
                style={
                    styles.detailsRow
                }
            >

                <View
                    style={
                        styles.detailItem
                    }
                >

                    <Text
                        style={
                            styles.detailLabel
                        }
                    >
                        DATE
                    </Text>


                    <Text
                        style={
                            styles.detailValue
                        }
                    >
                        {booking.bookingDate ||
                            '—'}
                    </Text>

                </View>


                <View
                    style={
                        styles.detailDivider
                    }
                />


                <View
                    style={
                        styles.detailItem
                    }
                >

                    <Text
                        style={
                            styles.detailLabel
                        }
                    >
                        TIME
                    </Text>


                    <Text
                        style={
                            styles.detailValue
                        }
                    >
                        {booking.startTime ||
                            '—'}
                    </Text>

                </View>


                <View
                    style={
                        styles.detailDivider
                    }
                />


                <View
                    style={[
                        styles.detailItem,
                        styles.amountItem,
                    ]}
                >

                    <Text
                        style={
                            styles.detailLabel
                        }
                    >
                        TOTAL
                    </Text>


                    <Text
                        style={
                            styles.amountValue
                        }
                    >
                        ₹
                        {booking.totalAmount ??
                            0}
                    </Text>

                </View>

            </View>


            {/* ================================================= */}
            {/* PAYMENT REQUIRED */}
            {/* ================================================= */}

            {booking.bookingStatus ===
                'CONFIRMED' &&

                booking.bookingFeeStatus ===
                'PENDING' && (

                    <View
                        style={
                            styles.paymentCard
                        }
                    >

                        <View
                            style={
                                styles.paymentHeader
                            }
                        >

                            <View
                                style={
                                    styles.paymentIndicator
                                }
                            />


                            <Text
                                style={
                                    styles.paymentTitle
                                }
                            >
                                Payment required
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.paymentMessage
                            }
                        >
                            Your appointment has been
                            accepted by the salon.
                        </Text>


                        <View
                            style={
                                styles.paymentAmountRow
                            }
                        >

                            <View>

                                <Text
                                    style={
                                        styles.paymentLabel
                                    }
                                >
                                    Booking fee
                                </Text>

                                <Text
                                    style={
                                        styles.paymentAmount
                                    }
                                >
                                    ₹
                                    {
                                        booking.bookingFee ??
                                        0
                                    }
                                </Text>

                            </View>


                            <View
                                style={
                                    styles.remainingBox
                                }
                            >

                                <Text
                                    style={
                                        styles.remainingLabel
                                    }
                                >
                                    Pay at salon
                                </Text>

                                <Text
                                    style={
                                        styles.remainingAmount
                                    }
                                >
                                    ₹
                                    {
                                        booking.remainingAmount ??
                                        0
                                    }
                                </Text>

                            </View>

                        </View>


                        <TouchableOpacity
                            style={
                                styles.payNowButton
                            }
                            activeOpacity={
                                0.85
                            }
                            onPress={
                                onPay
                            }
                        >

                            <Text
                                style={
                                    styles.payNowText
                                }
                            >
                                Pay booking fee
                            </Text>


                            <Text
                                style={
                                    styles.payNowArrow
                                }
                            >
                                →
                            </Text>

                        </TouchableOpacity>

                    </View>

                )}


            {/* ================================================= */}
            {/* PAYMENT COMPLETED */}
            {/* ================================================= */}

            {booking.bookingStatus ===
                'CONFIRMED' &&

                booking.bookingFeeStatus ===
                'PAID' && (

                    <View
                        style={
                            styles.confirmedCard
                        }
                    >

                        <View
                            style={
                                styles.confirmedIcon
                            }
                        >

                            <Text
                                style={
                                    styles.confirmedIconText
                                }
                            >
                                ✓
                            </Text>

                        </View>


                        <View
                            style={
                                styles.confirmedContent
                            }
                        >

                            <Text
                                style={
                                    styles.confirmedTitle
                                }
                            >
                                Booking confirmed
                            </Text>


                            <Text
                                style={
                                    styles.confirmedMessage
                                }
                            >
                                Booking fee received successfully.
                                Remaining ₹
                                {
                                    booking.remainingAmount ??
                                    0
                                }{' '}
                                is payable at the salon.
                            </Text>

                        </View>

                    </View>

                )}


            {/* ================================================= */}
            {/* ACTIONS */}
            {/* ================================================= */}

            {tab ===
                'Upcoming' ? (

                <View
                    style={
                        styles.buttons
                    }
                >

                    <TouchableOpacity
                        style={
                            styles.cancelButton
                        }
                        activeOpacity={
                            0.8
                        }
                        onPress={
                            onCancel
                        }
                    >

                        <Text
                            style={
                                styles.cancelButtonText
                            }
                        >
                            Cancel
                        </Text>

                    </TouchableOpacity>


                    <TouchableOpacity
                        style={
                            styles.viewButton
                        }
                        activeOpacity={
                            0.85
                        }
                        onPress={
                            onView
                        }
                    >

                        <Text
                            style={
                                styles.viewButtonText
                            }
                        >
                            View booking
                        </Text>


                        <Text
                            style={
                                styles.viewButtonArrow
                            }
                        >
                            →
                        </Text>

                    </TouchableOpacity>

                </View>

            ) : (

                <TouchableOpacity
                    style={
                        styles.bookAgainButton
                    }
                    activeOpacity={
                        0.8
                    }
                    onPress={
                        onBookAgain
                    }
                >

                    <Text
                        style={
                            styles.bookAgainText
                        }
                    >
                        Book again
                    </Text>


                    <Text
                        style={
                            styles.bookAgainArrow
                        }
                    >
                        →
                    </Text>

                </TouchableOpacity>

            )}

        </View>

    );
}


// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({

        // ======================================================
        // CONTAINER
        // ======================================================

        container: {
            flex: 1,
            backgroundColor:
                COLORS.background,
        },

        scrollContent: {
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 40,
        },


        // ======================================================
        // HEADER
        // ======================================================

        header: {
            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'space-between',

            marginBottom:
                22,
        },

        title: {
            fontSize: 29,
            fontWeight: '800',
            color: COLORS.text,
            letterSpacing: -0.5,
        },

        subtitle: {
            marginTop: 4,
            fontSize: 13,
            color: COLORS.textSecondary,
        },

        headerIcon: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor:
                COLORS.primary,

            alignItems:
                'center',

            justifyContent:
                'center',
        },

        headerIconText: {
            color:
                COLORS.white,

            fontSize: 18,

            fontWeight:
                '800',
        },


        // ======================================================
        // TABS
        // ======================================================

        tabsContainer: {
            flexDirection:
                'row',

            backgroundColor:
                COLORS.surface,

            borderRadius:
                13,

            padding:
                4,

            borderWidth:
                1,

            borderColor:
                COLORS.border,

            marginBottom:
                14,
        },

        tab: {
            flex: 1,

            height: 40,

            alignItems:
                'center',

            justifyContent:
                'center',

            borderRadius:
                10,
        },

        activeTab: {
            backgroundColor:
                COLORS.primary,
        },

        tabText: {
            fontSize:
                12,

            fontWeight:
                '600',

            color:
                COLORS.textSecondary,
        },

        activeTabText: {
            color:
                COLORS.white,

            fontWeight:
                '700',
        },


        // ======================================================
        // RESULT COUNT
        // ======================================================

        resultText: {
            fontSize:
                12,

            color:
                COLORS.textMuted,

            marginBottom:
                10,

            marginLeft:
                2,
        },


        // ======================================================
        // CARD
        // ======================================================

        card: {
            backgroundColor:
                COLORS.surface,

            borderRadius:
                18,

            padding:
                15,

            marginBottom:
                13,

            borderWidth:
                1,

            borderColor:
                COLORS.border,

            shadowColor:
                '#000',

            shadowOffset: {
                width: 0,
                height: 2,
            },

            shadowOpacity:
                0.04,

            shadowRadius:
                8,

            elevation:
                2,
        },


        // ======================================================
        // CARD HEADER
        // ======================================================

        cardHeader: {
            flexDirection:
                'row',

            alignItems:
                'center',
        },

        salonIcon: {
            width: 48,
            height: 48,

            borderRadius: 14,

            backgroundColor:
                COLORS.badgeColor,

            alignItems:
                'center',

            justifyContent:
                'center',

            marginRight:
                11,
        },

        salonIconText: {
            fontSize:
                17,

            fontWeight:
                '800',

            color:
                COLORS.primary,
        },

        salonInfo: {
            flex: 1,
            minWidth: 0,
        },

        salonName: {
            fontSize:
                16,

            fontWeight:
                '700',

            color:
                COLORS.text,
        },

        serviceText: {
            marginTop:
                4,

            fontSize:
                12,

            lineHeight:
                17,

            color:
                COLORS.textSecondary,
        },


        // ======================================================
        // STATUS
        // ======================================================

        statusBadge: {
            paddingHorizontal:
                8,

            paddingVertical:
                5,

            borderRadius:
                8,

            borderWidth:
                1,

            marginLeft:
                8,

            maxWidth:
                115,
        },

        statusText: {
            fontSize:
                9,

            fontWeight:
                '700',

            textAlign:
                'center',
        },


        // ======================================================
        // DIVIDER
        // ======================================================

        divider: {
            height:
                1,

            backgroundColor:
                COLORS.border,

            marginVertical:
                13,
        },


        // ======================================================
        // DETAILS
        // ======================================================

        detailsRow: {
            flexDirection:
                'row',

            alignItems:
                'center',
        },

        detailItem: {
            flex:
                1,
        },

        amountItem: {
            alignItems:
                'flex-end',
        },

        detailLabel: {
            fontSize:
                9,

            fontWeight:
                '700',

            color:
                COLORS.textMuted,

            letterSpacing:
                0.5,

            marginBottom:
                4,
        },

        detailValue: {
            fontSize:
                12,

            fontWeight:
                '600',

            color:
                COLORS.text,
        },

        amountValue: {
            fontSize:
                14,

            fontWeight:
                '800',

            color:
                COLORS.text,
        },

        detailDivider: {
            width:
                1,

            height:
                27,

            backgroundColor:
                COLORS.border,

            marginHorizontal:
                10,
        },


        // ======================================================
        // PAYMENT
        // ======================================================

        paymentCard: {
            marginTop:
                13,

            backgroundColor:
                '#FFF8EF',

            borderWidth:
                1,

            borderColor:
                '#F1D2AE',

            borderRadius:
                13,

            padding:
                12,
        },

        paymentHeader: {
            flexDirection:
                'row',

            alignItems:
                'center',

            marginBottom:
                5,
        },

        paymentIndicator: {
            width:
                7,

            height:
                7,

            borderRadius:
                4,

            backgroundColor:
                '#B86618',

            marginRight:
                7,
        },

        paymentTitle: {
            fontSize:
                14,

            fontWeight:
                '700',

            color:
                '#8B4A10',
        },

        paymentMessage: {
            fontSize:
                12,

            lineHeight:
                17,

            color:
                COLORS.textSecondary,

            marginBottom:
                12,
        },

        paymentAmountRow: {
            flexDirection:
                'row',

            justifyContent:
                'space-between',

            alignItems:
                'center',

            marginBottom:
                12,
        },

        paymentLabel: {
            fontSize:
                10,

            color:
                COLORS.textMuted,

            marginBottom:
                2,
        },

        paymentAmount: {
            fontSize:
                18,

            fontWeight:
                '800',

            color:
                COLORS.text,
        },

        remainingBox: {
            alignItems:
                'flex-end',
        },

        remainingLabel: {
            fontSize:
                10,

            color:
                COLORS.textMuted,

            marginBottom:
                2,
        },

        remainingAmount: {
            fontSize:
                14,

            fontWeight:
                '700',

            color:
                COLORS.textSecondary,
        },

        payNowButton: {
            height:
                43,

            backgroundColor:
                COLORS.primary,

            borderRadius:
                10,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },

        payNowText: {
            color:
                COLORS.white,

            fontSize:
                13,

            fontWeight:
                '700',
        },

        payNowArrow: {
            color:
                COLORS.white,

            fontSize:
                17,

            marginLeft:
                7,
        },


        // ======================================================
        // CONFIRMED
        // ======================================================

        confirmedCard: {
            marginTop:
                13,

            backgroundColor:
                '#F5F5F5',

            borderWidth:
                1,

            borderColor:
                COLORS.border,

            borderRadius:
                13,

            padding:
                12,

            flexDirection:
                'row',

            alignItems:
                'flex-start',
        },

        confirmedIcon: {
            width:
                28,

            height:
                28,

            borderRadius:
                14,

            backgroundColor:
                COLORS.primary,

            alignItems:
                'center',

            justifyContent:
                'center',

            marginRight:
                9,
        },

        confirmedIconText: {
            color:
                COLORS.white,

            fontSize:
                13,

            fontWeight:
                '800',
        },

        confirmedContent: {
            flex:
                1,
        },

        confirmedTitle: {
            fontSize:
                13,

            fontWeight:
                '700',

            color:
                COLORS.text,

            marginBottom:
                3,
        },

        confirmedMessage: {
            fontSize:
                11,

            lineHeight:
                16,

            color:
                COLORS.textSecondary,
        },


        // ======================================================
        // BUTTONS
        // ======================================================

        buttons: {
            flexDirection:
                'row',

            marginTop:
                13,

            gap:
                9,
        },

        cancelButton: {
            flex:
                0.8,

            height:
                42,

            borderRadius:
                10,

            borderWidth:
                1,

            borderColor:
                COLORS.borderStrong,

            alignItems:
                'center',

            justifyContent:
                'center',

            backgroundColor:
                COLORS.white,
        },

        cancelButtonText: {
            fontSize:
                12,

            fontWeight:
                '700',

            color:
                COLORS.textSecondary,
        },

        viewButton: {
            flex:
                1.4,

            height:
                42,

            borderRadius:
                10,

            backgroundColor:
                COLORS.primary,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },

        viewButtonText: {
            fontSize:
                12,

            fontWeight:
                '700',

            color:
                COLORS.white,
        },

        viewButtonArrow: {
            fontSize:
                16,

            color:
                COLORS.white,

            marginLeft:
                6,
        },

        bookAgainButton: {
            marginTop:
                13,

            height:
                42,

            borderRadius:
                10,

            borderWidth:
                1,

            borderColor:
                COLORS.primary,

            backgroundColor:
                COLORS.white,

            flexDirection:
                'row',

            alignItems:
                'center',

            justifyContent:
                'center',
        },

        bookAgainText: {
            fontSize:
                12,

            fontWeight:
                '700',

            color:
                COLORS.primary,
        },

        bookAgainArrow: {
            marginLeft:
                6,

            fontSize:
                16,

            color:
                COLORS.primary,
        },


        // ======================================================
        // EMPTY
        // ======================================================

        emptyContainer: {
            alignItems:
                'center',

            justifyContent:
                'center',

            paddingVertical:
                70,

            paddingHorizontal:
                30,
        },

        emptyIcon: {
            width:
                68,

            height:
                68,

            borderRadius:
                22,

            backgroundColor:
                COLORS.badgeColor,

            alignItems:
                'center',

            justifyContent:
                'center',

            marginBottom:
                16,
        },

        emptyIconText: {
            fontSize:
                28,

            color:
                COLORS.primary,

            fontWeight:
                '700',
        },

        emptyTitle: {
            fontSize:
                18,

            fontWeight:
                '700',

            color:
                COLORS.text,
        },

        emptyText: {
            marginTop:
                7,

            fontSize:
                13,

            lineHeight:
                19,

            color:
                COLORS.textSecondary,

            textAlign:
                'center',

            maxWidth:
                290,
        },


        // ======================================================
        // LOADING
        // ======================================================

        loadingContainer: {
            flex:
                1,

            alignItems:
                'center',

            justifyContent:
                'center',
        },

        loadingCircle: {
            width:
                34,

            height:
                34,

            borderRadius:
                17,

            borderWidth:
                3,

            borderColor:
                COLORS.borderStrong,

            borderTopColor:
                COLORS.primary,

            marginBottom:
                12,
        },

        loadingText: {
            fontSize:
                13,

            color:
                COLORS.textSecondary,
        },


        // ======================================================
        // ERROR
        // ======================================================

        errorContainer: {
            flex:
                1,

            alignItems:
                'center',

            justifyContent:
                'center',

            padding:
                30,
        },

        errorIcon: {
            width:
                54,

            height:
                54,

            borderRadius:
                18,

            backgroundColor:
                COLORS.badgeColor,

            alignItems:
                'center',

            justifyContent:
                'center',

            marginBottom:
                14,
        },

        errorIconText: {
            fontSize:
                22,

            fontWeight:
                '800',

            color:
                '#A33A3A',
        },

        errorTitle: {
            fontSize:
                18,

            fontWeight:
                '700',

            color:
                COLORS.text,

            marginBottom:
                6,
        },

        errorMessage: {
            fontSize:
                12,

            lineHeight:
                18,

            color:
                COLORS.textSecondary,

            textAlign:
                'center',
        },

        retryButton: {
            marginTop:
                18,

            paddingHorizontal:
                24,

            height:
                42,

            borderRadius:
                10,

            backgroundColor:
                COLORS.primary,

            alignItems:
                'center',

            justifyContent:
                'center',
        },

        retryText: {
            color:
                COLORS.white,

            fontSize:
                13,

            fontWeight:
                '700',
        },


        // ======================================================
        // FOOTER
        // ======================================================

        footer: {
            textAlign:
                'center',

            marginTop:
                10,

            fontSize:
                11,

            color:
                COLORS.textMuted,

            paddingHorizontal:
                20,

            lineHeight:
                17,
        },

    });