import React, {
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
} from 'react-native';

import { Calendar } from 'react-native-calendars';

const PRIMARY = '#009D94';

const BOOKING_FEE = 9;

/*
================================================================
TYPES
================================================================
*/

type DateItem = {
    id: string;
    date: Date;
    label: string;
    day: string;
    dayNumber: string;
    month: string;
};

type Slot = {
    id: string;
    time: string;
    startTime: string;
    available: boolean;
    reason?: string;
};

type Service = {
    serviceId: string;
    salonId?: string;
    name: string;
    category?: string;
    description?: string;
    duration: number;
    price: number;
    gender?: string;
    popular?: boolean;
    active?: boolean;
};

type Offer = {
    offerId: string;
    salonId: string;
    salonName?: string;
    title: string;
    description?: string;

    discountType:
        | 'PERCENTAGE'
        | 'FIXED'
        | string;

    discountValue: number;

    couponCode?: string | null;

    minimumBookingAmount?: number | null;

    category?: string | null;

    serviceIds: string[];

    startDate?: string;

    endDate?: string;

    status?: string;
};

type ExistingBooking = {
    bookingId?: string;
    salonId?: string;
    customerUserId?: string;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
    bookingStatus?: string;
};

type BusinessDay = {
    open?: string;
    close?: string;
    isOpen?: boolean;
};

type WeekdayKey =
    | 'SUNDAY'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY';

type BusinessHours = {
    MONDAY?: BusinessDay;
    TUESDAY?: BusinessDay;
    WEDNESDAY?: BusinessDay;
    THURSDAY?: BusinessDay;
    FRIDAY?: BusinessDay;
    SATURDAY?: BusinessDay;
    SUNDAY?: BusinessDay;
};

type Salon = {
    salonId?: string;
    salonName?: string;

    businessHours?: BusinessHours;

    MONDAY?: BusinessDay;
    TUESDAY?: BusinessDay;
    WEDNESDAY?: BusinessDay;
    THURSDAY?: BusinessDay;
    FRIDAY?: BusinessDay;
    SATURDAY?: BusinessDay;
    SUNDAY?: BusinessDay;

    [key: string]: any;
};

/*
================================================================
GENERATE FUTURE DATES

Used for the selected date object.

We allow future dates for one year.
================================================================
*/

const generateFutureDates = (): DateItem[] => {
    const today = new Date();

    return Array.from({
        length: 366,
    }).map((_, index) => {
        const d = new Date(today);

        d.setHours(
            12,
            0,
            0,
            0,
        );

        d.setDate(
            today.getDate() +
                index,
        );

        const weekday =
            d.toLocaleDateString(
                'en-US',
                {
                    weekday: 'short',
                },
            );

        const month =
            d.toLocaleDateString(
                'en-US',
                {
                    month: 'short',
                },
            );

        return {
            id:
                formatDate(d),

            date: d,

            label:
                index === 0
                    ? 'Today'
                    : index === 1
                        ? 'Tomorrow'
                        : weekday,

            day:
                weekday,

            dayNumber:
                d.getDate().toString(),

            month,
        };
    });
};

/*
================================================================
DATE HELPERS
================================================================
*/

const formatDate = (
    date: Date,
): string => {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(2, '0');

    const day =
        String(
            date.getDate(),
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const createDateItem = (
    date: Date,
): DateItem => {
    const today =
        formatDate(
            new Date(),
        );

    const tomorrow =
        new Date();

    tomorrow.setHours(
        12,
        0,
        0,
        0,
    );

    tomorrow.setDate(
        tomorrow.getDate() + 1,
    );

    const dateString =
        formatDate(date);

    const tomorrowString =
        formatDate(tomorrow);

    const weekday =
        date.toLocaleDateString(
            'en-US',
            {
                weekday: 'short',
            },
        );

    const month =
        date.toLocaleDateString(
            'en-US',
            {
                month: 'short',
            },
        );

    return {
        id: dateString,

        date,

        label:
            dateString === today
                ? 'Today'
                : dateString ===
                      tomorrowString
                    ? 'Tomorrow'
                    : weekday,

        day:
            weekday,

        dayNumber:
            date.getDate().toString(),

        month,
    };
};

/*
================================================================
FORMAT MINUTES AS 12-HOUR TIME
================================================================
*/

const formatTime = (
    totalMinutes: number,
): string => {
    const hours24 =
        Math.floor(
            totalMinutes / 60,
        );

    const minutes =
        totalMinutes % 60;

    const suffix =
        hours24 >= 12
            ? 'PM'
            : 'AM';

    let hours12 =
        hours24 % 12;

    if (
        hours12 === 0
    ) {
        hours12 = 12;
    }

    return `${String(
        hours12,
    ).padStart(
        2,
        '0',
    )}:${String(
        minutes,
    ).padStart(
        2,
        '0',
    )} ${suffix}`;
};

/*
================================================================
FORMAT MINUTES AS 24-HOUR TIME
================================================================
*/

const formatTime24 = (
    totalMinutes: number,
): string => {
    const hours =
        Math.floor(
            totalMinutes / 60,
        );

    const minutes =
        totalMinutes % 60;

    return `${String(
        hours,
    ).padStart(
        2,
        '0',
    )}:${String(
        minutes,
    ).padStart(
        2,
        '0',
    )}`;
};

/*
================================================================
TIME TO MINUTES
================================================================
*/

const timeToMinutes = (
    value?: string | null,
): number | null => {
    if (!value) {
        return null;
    }

    const normalized =
        String(value)
            .trim()
            .toUpperCase();

    const twentyFourHour =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
            normalized,
        );

    if (
        twentyFourHour
    ) {
        return (
            Number(
                twentyFourHour[1],
            ) *
                60 +
            Number(
                twentyFourHour[2],
            )
        );
    }

    const twelveHour =
        /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i.exec(
            normalized,
        );

    if (
        twelveHour
    ) {
        let hours =
            Number(
                twelveHour[1],
            );

        const minutes =
            Number(
                twelveHour[2],
            );

        const period =
            twelveHour[3].toUpperCase();

        if (
            hours < 1 ||
            hours > 12
        ) {
            return null;
        }

        if (
            period === 'AM'
        ) {
            if (
                hours === 12
            ) {
                hours = 0;
            }
        } else {
            if (
                hours !== 12
            ) {
                hours += 12;
            }
        }

        return (
            hours * 60 +
            minutes
        );
    }

    return null;
};

/*
================================================================
GET SALON BUSINESS DAY
================================================================
*/

const getBusinessDay = (
    salon: Salon | null | undefined,
    date: Date,
): BusinessDay | null => {
    if (!salon) {
        return null;
    }

    const weekdays: WeekdayKey[] = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
    ];

    const weekdayKey: WeekdayKey =
        weekdays[date.getDay()];

    const nestedBusinessDay =
        salon.businessHours?.[
            weekdayKey
        ];

    if (
        nestedBusinessDay
    ) {
        return nestedBusinessDay;
    }

    const directBusinessDay =
        salon[weekdayKey];

    if (
        directBusinessDay &&
        typeof directBusinessDay ===
            'object'
    ) {
        return directBusinessDay as BusinessDay;
    }

    return null;
};

/*
================================================================
NORMALIZE BOOKING TIME
================================================================
*/

const normalizeBookingTime = (
    value?: string | null,
): number | null => {
    return timeToMinutes(
        value,
    );
};

/*
================================================================
BOOKING STATUS
================================================================
*/

const bookingOccupiesSlot = (
    booking: ExistingBooking,
): boolean => {
    const status =
        String(
            booking.bookingStatus ||
                '',
        )
            .trim()
            .toUpperCase();

    return (
        status === 'PENDING' ||
        status === 'CONFIRMED'
    );
};

/*
================================================================
TIME OVERLAP
================================================================
*/

const timesOverlap = (
    newStart: number,
    newEnd: number,
    existingStart: number,
    existingEnd: number,
): boolean => {
    return (
        newStart <
            existingEnd &&
        newEnd >
            existingStart
    );
};

/*
================================================================
MAIN SCREEN
================================================================
*/

export default function BookingDateTimeScreen({
    navigation,
    route,
}: any) {
    const {
        salonId,
        salon,
        customerUserId,
        services = [],
        offer,
        bookings = [],
        existingBookings = [],
    } = route.params || {};

    const typedSalon =
        salon as Salon;

    /*
    ================================================================
    TODAY
    ================================================================
    */

    const today =
        formatDate(
            new Date(),
        );

    /*
    ================================================================
    FUTURE DATE RANGE
    ================================================================
    */

    const dates =
        useMemo(
            () =>
                generateFutureDates(),
            [],
        );

    /*
    ================================================================
    SELECTED DATE
    ================================================================
    */

    const [
        selectedDate,
        setSelectedDate,
    ] =
        useState<DateItem>(
            dates[0],
        );

    /*
    ================================================================
    CALENDAR VISIBILITY
    ================================================================
    */

    const [
        calendarVisible,
        setCalendarVisible,
    ] =
        useState(false);

    /*
    ================================================================
    TIME POPUP
    ================================================================
    */

    const [
        timeModalVisible,
        setTimeModalVisible,
    ] =
        useState(false);

    /*
    ================================================================
    SELECTED SLOT
    ================================================================
    */

    const [
        selectedSlot,
        setSelectedSlot,
    ] =
        useState<
            string | null
        >(null);

    /*
    ================================================================
    REAL BOOKINGS
    ================================================================
    */

    const salonBookings =
        useMemo<
            ExistingBooking[]
        >(() => {
            if (
                Array.isArray(
                    bookings,
                ) &&
                bookings.length >
                    0
            ) {
                return bookings;
            }

            if (
                Array.isArray(
                    existingBookings,
                )
            ) {
                return existingBookings;
            }

            return [];
        }, [
            bookings,
            existingBookings,
        ]);

    /*
    ================================================================
    NORMALIZED OFFER
    ================================================================
    */

    const normalizedOffer:
        | Offer
        | null =
        useMemo(() => {
            if (!offer) {
                return null;
            }

            return {
                ...offer,

                discountValue:
                    Number(
                        offer.discountValue ||
                            0,
                    ),

                minimumBookingAmount:
                    offer.minimumBookingAmount !==
                        null &&
                    offer.minimumBookingAmount !==
                        undefined
                        ? Number(
                            offer.minimumBookingAmount,
                        )
                        : null,

                serviceIds:
                    Array.isArray(
                        offer.serviceIds,
                    )
                        ? offer.serviceIds
                        : [],
            };
        }, [offer]);

    /*
    ================================================================
    OFFER VALIDITY
    ================================================================
    */

    const isOfferValid =
        useMemo(() => {
            if (
                !normalizedOffer
            ) {
                return false;
            }

            if (
                normalizedOffer.status &&
                String(
                    normalizedOffer.status,
                ).toUpperCase() !==
                    'ACTIVE'
            ) {
                return false;
            }

            const selectedDateString =
                formatDate(
                    selectedDate.date,
                );

            if (
                normalizedOffer.startDate
            ) {
                const offerStart =
                    String(
                        normalizedOffer.startDate,
                    ).substring(
                        0,
                        10,
                    );

                if (
                    selectedDateString <
                    offerStart
                ) {
                    return false;
                }
            }

            if (
                normalizedOffer.endDate
            ) {
                const offerEnd =
                    String(
                        normalizedOffer.endDate,
                    ).substring(
                        0,
                        10,
                    );

                if (
                    selectedDateString >
                    offerEnd
                ) {
                    return false;
                }
            }

            return true;
        }, [
            normalizedOffer,
            selectedDate,
        ]);

    /*
    ================================================================
    SERVICE OFFER ELIGIBILITY
    ================================================================
    */

    const isServiceEligibleForOffer =
        (
            service: Service,
        ): boolean => {
            if (
                !normalizedOffer ||
                !isOfferValid
            ) {
                return false;
            }

            const serviceIds =
                normalizedOffer.serviceIds ||
                [];

            if (
                serviceIds.length >
                0
            ) {
                return serviceIds.includes(
                    service.serviceId,
                );
            }

            if (
                normalizedOffer.category &&
                String(
                    normalizedOffer.category,
                ).trim()
            ) {
                return (
                    String(
                        service.category ||
                            '',
                    )
                        .trim()
                        .toLowerCase() ===
                    String(
                        normalizedOffer.category,
                    )
                        .trim()
                        .toLowerCase()
                );
            }

            return true;
        };

    /*
    ================================================================
    SUBTOTAL
    ================================================================
    */

    const subtotal =
        useMemo(() => {
            return services.reduce(
                (
                    sum: number,
                    item: Service,
                ) => {
                    return (
                        sum +
                        Number(
                            item.price ||
                                0,
                        )
                    );
                },
                0,
            );
        }, [services]);

    /*
    ================================================================
    ELIGIBLE SUBTOTAL
    ================================================================
    */

    const eligibleSubtotal =
        useMemo(() => {
            return services.reduce(
                (
                    sum: number,
                    item: Service,
                ) => {
                    if (
                        !isServiceEligibleForOffer(
                            item,
                        )
                    ) {
                        return sum;
                    }

                    return (
                        sum +
                        Number(
                            item.price ||
                                0,
                        )
                    );
                },
                0,
            );
        }, [
            services,
            normalizedOffer,
            isOfferValid,
        ]);

    /*
    ================================================================
    MINIMUM BOOKING AMOUNT
    ================================================================
    */

    const minimumBookingAmountMet =
        useMemo(() => {
            if (
                !normalizedOffer ||
                normalizedOffer.minimumBookingAmount ===
                    null ||
                normalizedOffer.minimumBookingAmount ===
                    undefined
            ) {
                return true;
            }

            return (
                subtotal >=
                Number(
                    normalizedOffer.minimumBookingAmount,
                )
            );
        }, [
            normalizedOffer,
            subtotal,
        ]);

    /*
    ================================================================
    DISCOUNT
    ================================================================
    */

    const discountAmount =
        useMemo(() => {
            if (
                !normalizedOffer ||
                !isOfferValid ||
                !minimumBookingAmountMet ||
                eligibleSubtotal <=
                    0
            ) {
                return 0;
            }

            const discountValue =
                Number(
                    normalizedOffer.discountValue ||
                        0,
                );

            if (
                discountValue <=
                0
            ) {
                return 0;
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                'PERCENTAGE'
            ) {
                return Math.min(
                    eligibleSubtotal,
                    (
                        eligibleSubtotal *
                        discountValue
                    ) /
                        100,
                );
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                'FIXED'
            ) {
                return Math.min(
                    eligibleSubtotal,
                    discountValue,
                );
            }

            return 0;
        }, [
            normalizedOffer,
            isOfferValid,
            minimumBookingAmountMet,
            eligibleSubtotal,
        ]);

    /*
    ================================================================
    FINAL SERVICE TOTAL
    ================================================================
    */

    const totalPrice =
        useMemo(() => {
            return Math.max(
                0,
                subtotal -
                    discountAmount,
            );
        }, [
            subtotal,
            discountAmount,
        ]);

    /*
    ================================================================
    SERVICE DISPLAY PRICE
    ================================================================
    */

    const getServiceDisplayPrice =
        (
            service: Service,
        ): number => {
            const originalPrice =
                Number(
                    service.price ||
                        0,
                );

            if (
                !normalizedOffer ||
                !isOfferValid ||
                !minimumBookingAmountMet ||
                !isServiceEligibleForOffer(
                    service,
                ) ||
                discountAmount <=
                    0
            ) {
                return originalPrice;
            }

            const discountType =
                String(
                    normalizedOffer.discountType,
                ).toUpperCase();

            if (
                discountType ===
                'PERCENTAGE'
            ) {
                const percentage =
                    Number(
                        normalizedOffer.discountValue ||
                            0,
                    );

                const serviceDiscount =
                    (
                        originalPrice *
                        percentage
                    ) /
                    100;

                return Math.max(
                    0,
                    originalPrice -
                        serviceDiscount,
                );
            }

            if (
                discountType ===
                    'FIXED' &&
                eligibleSubtotal >
                    0
            ) {
                const serviceShare =
                    originalPrice /
                    eligibleSubtotal;

                const allocatedDiscount =
                    discountAmount *
                    serviceShare;

                return Math.max(
                    0,
                    originalPrice -
                        allocatedDiscount,
                );
            }

            return originalPrice;
        };

    /*
    ================================================================
    TOTAL DURATION
    ================================================================
    */

    const totalDuration =
        useMemo(() => {
            return services.reduce(
                (
                    sum: number,
                    item: Service,
                ) => {
                    return (
                        sum +
                        Number(
                            item.duration ||
                                0,
                        )
                    );
                },
                0,
            );
        }, [services]);

    /*
    ================================================================
    OFFER APPLIED
    ================================================================
    */

    const offerApplied =
        Boolean(
            normalizedOffer &&
            isOfferValid &&
            minimumBookingAmountMet &&
            discountAmount >
                0,
        );

    /*
    ================================================================
    OFFER MESSAGE
    ================================================================
    */

    const offerMessage =
        useMemo(() => {
            if (
                !normalizedOffer
            ) {
                return null;
            }

            if (
                !isOfferValid
            ) {
                return 'This offer is not valid for the selected date.';
            }

            if (
                normalizedOffer.minimumBookingAmount !==
                    null &&
                normalizedOffer.minimumBookingAmount !==
                    undefined &&
                !minimumBookingAmountMet
            ) {
                const remaining =
                    Math.max(
                        0,
                        Number(
                            normalizedOffer.minimumBookingAmount,
                        ) -
                            subtotal,
                    );

                return `Add ₹${remaining.toFixed(
                    0,
                )} more to use this offer.`;
            }

            if (
                discountAmount >
                0
            ) {
                return `${normalizedOffer.title} applied`;
            }

            return null;
        }, [
            normalizedOffer,
            isOfferValid,
            minimumBookingAmountMet,
            subtotal,
            discountAmount,
        ]);

    /*
    ================================================================
    SELECTED DATE STRING
    ================================================================
    */

    const selectedDateString =
        useMemo(
            () =>
                formatDate(
                    selectedDate.date,
                ),
            [selectedDate],
        );

    /*
    ================================================================
    SELECTED BUSINESS DAY
    ================================================================
    */

    const selectedBusinessDay =
        useMemo(
            () =>
                getBusinessDay(
                    typedSalon,
                    selectedDate.date,
                ),
            [
                typedSalon,
                selectedDate,
            ],
        );

    /*
    ================================================================
    NORMALIZED BUSINESS HOURS
    ================================================================
    */

    const businessHours =
        useMemo(() => {
            if (
                !selectedBusinessDay
            ) {
                return null;
            }

            const isOpen =
                selectedBusinessDay.isOpen ===
                true;

            if (
                !isOpen
            ) {
                return null;
            }

            const openMinutes =
                timeToMinutes(
                    selectedBusinessDay.open,
                );

            const closeMinutes =
                timeToMinutes(
                    selectedBusinessDay.close,
                );

            if (
                openMinutes ===
                    null ||
                closeMinutes ===
                    null ||
                closeMinutes <=
                    openMinutes
            ) {
                return null;
            }

            return {
                open:
                    openMinutes,

                close:
                    closeMinutes,
            };
        }, [
            selectedBusinessDay,
        ]);

    /*
    ================================================================
    CHECK REAL BOOKING CONFLICT
    ================================================================
    */

    const hasBookingConflict =
        (
            slotStartMinutes: number,
            slotEndMinutes: number,
        ): boolean => {
            if (
                salonBookings.length ===
                0
            ) {
                return false;
            }

            return salonBookings.some(
                booking => {
                    const bookingDate =
                        String(
                            booking.bookingDate ||
                                '',
                        ).substring(
                            0,
                            10,
                        );

                    if (
                        bookingDate !==
                        selectedDateString
                    ) {
                        return false;
                    }

                    if (
                        !bookingOccupiesSlot(
                            booking,
                        )
                    ) {
                        return false;
                    }

                    const existingStart =
                        normalizeBookingTime(
                            booking.startTime,
                        );

                    const existingEnd =
                        normalizeBookingTime(
                            booking.endTime,
                        );

                    if (
                        existingStart ===
                            null ||
                        existingEnd ===
                            null
                    ) {
                        return false;
                    }

                    return timesOverlap(
                        slotStartMinutes,
                        slotEndMinutes,
                        existingStart,
                        existingEnd,
                    );
                },
            );
        };

    /*
    ================================================================
    GENERATE TIME SLOTS
    ================================================================

    IMPORTANT:

    Past times are NOT generated for today.

    We do not display "Passed".
    ================================================================
    */

    const allSlots =
        useMemo<Slot[]>(() => {
            if (
                !businessHours
            ) {
                return [];
            }

            const slots: Slot[] =
                [];

            const {
                open,
                close,
            } =
                businessHours;

            const latestStart =
                close -
                totalDuration;

            if (
                latestStart <
                open
            ) {
                return [];
            }

            let current =
                open;

            let slotIndex =
                0;

            /*
            --------------------------------------------------------
            Current time only matters for TODAY.
            --------------------------------------------------------
            */

            const now =
                new Date();

            const currentMinutes =
                now.getHours() *
                    60 +
                now.getMinutes();

            while (
                current <=
                latestStart
            ) {
                const slotEnd =
                    current +
                    totalDuration;

                /*
                ----------------------------------------------------
                PAST TIMES

                Simply skip them.

                No "Passed" card is created.
                ----------------------------------------------------
                */

                if (
                    selectedDateString ===
                        today &&
                    current <=
                        currentMinutes
                ) {
                    current +=
                        30;

                    continue;
                }

                let available =
                    true;

                let reason:
                    | string
                    | undefined;

                /*
                ----------------------------------------------------
                BOOKING CONFLICT
                ----------------------------------------------------
                */

                if (
                    hasBookingConflict(
                        current,
                        slotEnd,
                    )
                ) {
                    available =
                        false;

                    reason =
                        'Booked';
                }

                slots.push({
                    id:
                        `${selectedDateString}-${slotIndex}`,

                    time:
                        formatTime(
                            current,
                        ),

                    startTime:
                        formatTime24(
                            current,
                        ),

                    available,

                    reason,
                });

                current +=
                    30;

                slotIndex++;
            }

            return slots;
        }, [
            businessHours,
            totalDuration,
            selectedDateString,
            today,
            salonBookings,
        ]);

    /*
    ================================================================
    TIME GROUPS
    ================================================================
    */

    const morning =
        useMemo(
            () =>
                allSlots.filter(
                    slot => {
                        const minutes =
                            timeToMinutes(
                                slot.startTime,
                            );

                        return (
                            minutes !==
                                null &&
                            minutes <
                                12 *
                                    60
                        );
                    },
                ),
            [allSlots],
        );

    const afternoon =
        useMemo(
            () =>
                allSlots.filter(
                    slot => {
                        const minutes =
                            timeToMinutes(
                                slot.startTime,
                            );

                        return (
                            minutes !==
                                null &&
                            minutes >=
                                12 *
                                    60 &&
                            minutes <
                                17 *
                                    60
                        );
                    },
                ),
            [allSlots],
        );

    const evening =
        useMemo(
            () =>
                allSlots.filter(
                    slot => {
                        const minutes =
                            timeToMinutes(
                                slot.startTime,
                            );

                        return (
                            minutes !==
                                null &&
                            minutes >=
                                17 *
                                    60
                        );
                    },
                ),
            [allSlots],
        );

    /*
    ================================================================
    SELECTED SLOT OBJECT
    ================================================================
    */

    const selectedSlotObject =
        useMemo(
            () =>
                allSlots.find(
                    slot =>
                        slot.time ===
                        selectedSlot,
                ),
            [
                allSlots,
                selectedSlot,
            ],
        );

    /*
    ================================================================
    DAY PRESS
    ================================================================
    */

    const onDayPress = (
        day: any,
    ) => {
        const selected =
            new Date(
                `${day.dateString}T12:00:00`,
            );

        const newDate =
            createDateItem(
                selected,
            );

        setSelectedDate(
            newDate,
        );

        /*
        ------------------------------------------------------------
        Clear previous time.
        ------------------------------------------------------------
        */

        setSelectedSlot(
            null,
        );

        /*
        ------------------------------------------------------------
        Close calendar after date selection.
        ------------------------------------------------------------
        */

        setCalendarVisible(
            false,
        );

        /*
        ------------------------------------------------------------
        Open time popup.

        The effect is handled with a timeout so the newly selected
        business hours / slots have time to recalculate.
        ------------------------------------------------------------
        */

        setTimeout(() => {
            setTimeModalVisible(
                true,
            );
        }, 150);
    };

    /*
    ================================================================
    OPEN TIME PICKER
    ================================================================
    */

    const openTimePicker = () => {
        setTimeModalVisible(
            true,
        );
    };

    /*
    ================================================================
    SLOT SELECTION
    ================================================================
    */

    const handleSlotPress = (
        slot: Slot,
    ) => {
        if (
            !slot.available
        ) {
            return;
        }

        setSelectedSlot(
            slot.time,
        );

        setTimeModalVisible(
            false,
        );
    };

    /*
    ================================================================
    RENDER TIME SLOT
    ================================================================
    */

    const renderSlot = (
        item: Slot,
    ) => {
        const selected =
            selectedSlot ===
            item.time;

        return (
            <TouchableOpacity
                key={
                    item.id
                }
                disabled={
                    !item.available
                }
                activeOpacity={
                    0.8
                }
                onPress={() =>
                    handleSlotPress(
                        item,
                    )
                }
                style={[
                    styles.slotCard,

                    selected &&
                        styles.slotCardSelected,

                    !item.available &&
                        styles.slotDisabled,
                ]}
            >
                <Text
                    style={[
                        styles.slotText,

                        selected &&
                            styles.slotTextSelected,

                        !item.available &&
                            styles.slotDisabledText,
                    ]}
                >
                    {
                        item.time
                    }
                </Text>

                {!item.available && (
                    <Text
                        style={
                            styles.bookedText
                        }
                    >
                        {item.reason ||
                            'Unavailable'}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    /*
    ================================================================
    TIME SECTION
    ================================================================
    */

    const renderTimeSection = (
        title: string,
        slots: Slot[],
    ) => {
        if (
            slots.length ===
            0
        ) {
            return null;
        }

        return (
            <View
                style={
                    styles.timeSection
                }
            >
                <Text
                    style={
                        styles.timeSectionTitle
                    }
                >
                    {
                        title
                    }
                </Text>

                <View
                    style={
                        styles.slotGrid
                    }
                >
                    {slots.map(
                        renderSlot,
                    )}
                </View>
            </View>
        );
    };

    /*
    ================================================================
    RENDER
    ================================================================
    */

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            {/* ===================================================== */}
            {/* HEADER */}
            {/* ===================================================== */}

            <View
                style={
                    styles.header
                }
            >
                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                    style={
                        styles.backButton
                    }
                >
                    <Text
                        style={
                            styles.back
                        }
                    >
                        ←
                    </Text>
                </TouchableOpacity>

                <View
                    style={
                        styles.headerTextContainer
                    }
                >
                    <Text
                        style={
                            styles.title
                        }
                    >
                        Select Appointment
                    </Text>

                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Choose a date and
                        time that works for
                        you
                    </Text>
                </View>
            </View>

            {/* ===================================================== */}
            {/* OFFER */}
            {/* ===================================================== */}

            {normalizedOffer && (
                <View
                    style={
                        styles.offerBanner
                    }
                >
                    <Text
                        style={
                            styles.offerTitle
                        }
                    >
                        {
                            normalizedOffer.title
                        }
                    </Text>

                    {offerApplied ? (
                        <Text
                            style={
                                styles.offerAppliedText
                            }
                        >
                            Offer applied •
                            Save ₹
                            {discountAmount.toFixed(
                                0,
                            )}
                        </Text>
                    ) : (
                        offerMessage && (
                            <Text
                                style={
                                    styles.offerMessage
                                }
                            >
                                {
                                    offerMessage
                                }
                            </Text>
                        )
                    )}
                </View>
            )}

            {/* ===================================================== */}
            {/* SELECTED DATE CARD */}
            {/* ===================================================== */}

            <View
                style={
                    styles.selectedDateCard
                }
            >
                <View
                    style={
                        styles.selectedDateLeft
                    }
                >
                    <View
                        style={
                            styles.calendarIcon
                        }
                    >
                        <Text
                            style={
                                styles.calendarIconText
                            }
                        >
                            📅
                        </Text>
                    </View>

                    <View
                        style={
                            styles.selectedDateInfo
                        }
                    >
                        <Text
                            style={
                                styles.selectedDateLabel
                            }
                        >
                            {
                                selectedDate.label
                            }
                        </Text>

                        <Text
                            style={
                                styles.selectedDateValue
                            }
                        >
                            {
                                selectedDate.day
                            }
                            ,{' '}
                            {
                                selectedDate.dayNumber
                            }{' '}
                            {
                                selectedDate.month
                            }{' '}
                            {
                                selectedDate.date.getFullYear()
                            }
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={
                        0.8
                    }
                    style={
                        styles.changeDateButton
                    }
                    onPress={() =>
                        setCalendarVisible(
                            previous =>
                                !previous,
                        )
                    }
                >
                    <Text
                        style={
                            styles.changeDateText
                        }
                    >
                        {calendarVisible
                            ? 'Close'
                            : 'Change'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ===================================================== */}
            {/* CALENDAR TOGGLE */}
            {/* ===================================================== */}

            {calendarVisible && (
                <View
                    style={
                        styles.calendarWrapper
                    }
                >
                    <Calendar
                        minDate={
                            today
                        }

                        /*
                        ------------------------------------------------
                        Allow future dates for one year.
                        ------------------------------------------------
                        */

                        maxDate={formatDate(
                            dates[
                                dates.length -
                                    1
                            ].date,
                        )}

                        enableSwipeMonths

                        hideExtraDays={
                            false
                        }

                        firstDay={
                            1
                        }

                        onDayPress={
                            onDayPress
                        }

                        markedDates={{
                            [
                                selectedDateString
                            ]: {
                                selected:
                                    true,

                                selectedColor:
                                    PRIMARY,
                            },
                        }}

                        theme={{
                            backgroundColor:
                                '#fff',

                            calendarBackground:
                                '#fff',

                            monthTextColor:
                                '#111',

                            textMonthFontSize:
                                20,

                            textMonthFontWeight:
                                '700',

                            dayTextColor:
                                '#222',

                            textDayFontWeight:
                                '600',

                            textDayHeaderFontWeight:
                                '700',

                            textDayHeaderFontSize:
                                12,

                            selectedDayBackgroundColor:
                                PRIMARY,

                            selectedDayTextColor:
                                '#fff',

                            todayTextColor:
                                PRIMARY,

                            arrowColor:
                                PRIMARY,

                            textDisabledColor:
                                '#D2D2D2',
                        }}
                    />
                </View>
            )}

            {/* ===================================================== */}
            {/* SELECTED TIME CARD */}
            {/* ===================================================== */}

            <TouchableOpacity
                activeOpacity={
                    0.8
                }
                style={[
                    styles.selectedTimeCard,

                    selectedSlot &&
                        styles.selectedTimeCardActive,
                ]}
                onPress={
                    openTimePicker
                }
            >
                <View
                    style={
                        styles.timeIcon
                    }
                >
                    <Text
                        style={
                            styles.timeIconText
                        }
                    >
                        🕐
                    </Text>
                </View>

                <View
                    style={
                        styles.selectedTimeInfo
                    }
                >
                    <Text
                        style={
                            styles.selectedTimeLabel
                        }
                    >
                        {selectedSlot
                            ? 'Selected time'
                            : 'Choose a time'}
                    </Text>

                    <Text
                        style={
                            styles.selectedTimeValue
                        }
                    >
                        {selectedSlot ||
                            'Tap to view available times'}
                    </Text>
                </View>

                <Text
                    style={
                        styles.changeTimeText
                    }
                >
                    {selectedSlot
                        ? 'Change'
                        : 'Select'}
                </Text>
            </TouchableOpacity>

            {/* ===================================================== */}
            {/* SALON HOURS */}
            {/* ===================================================== */}

            <View
                style={
                    styles.hoursBanner
                }
            >
                <View
                    style={
                        styles.hoursLeft
                    }
                >
                    <Text
                        style={
                            styles.hoursTitle
                        }
                    >
                        {
                            selectedDate.label
                        }
                    </Text>

                    {businessHours ? (
                        <Text
                            style={
                                styles.hoursText
                            }
                        >
                            Salon hours:{' '}
                            {
                                formatTime(
                                    businessHours.open,
                                )
                            }{' '}
                            -{' '}
                            {
                                formatTime(
                                    businessHours.close,
                                )
                            }
                        </Text>
                    ) : (
                        <Text
                            style={
                                styles.closedText
                            }
                        >
                            Salon is closed on
                            this day
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    onPress={
                        openTimePicker
                    }
                    activeOpacity={
                        0.8
                    }
                    style={
                        styles.hoursTimeButton
                    }
                >
                    <Text
                        style={
                            styles.hoursTimeButtonText
                        }
                    >
                        View times
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ===================================================== */}
            {/* MAIN CONTENT */}
            {/* ===================================================== */}

            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingBottom:
                        180,
                }}
            >
                {/* ================================================= */}
                {/* SELECTED TIME SUMMARY */}
                {/* ================================================= */}

                {selectedSlot && (
                    <View
                        style={
                            styles.confirmedTimeCard
                        }
                    >
                        <View>
                            <Text
                                style={
                                    styles.confirmedTimeLabel
                                }
                            >
                                Your appointment
                            </Text>

                            <Text
                                style={
                                    styles.confirmedTimeValue
                                }
                            >
                                {
                                    selectedDate.label
                                }{' '}
                                •{' '}
                                {
                                    selectedSlot
                                }
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={
                                openTimePicker
                            }
                            style={
                                styles.confirmedChangeButton
                            }
                        >
                            <Text
                                style={
                                    styles.confirmedChangeText
                                }
                            >
                                Change
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ================================================= */}
                {/* NO TIME */}
                {/* ================================================= */}

                {!businessHours ? (
                    <View
                        style={
                            styles.noSlotsCard
                        }
                    >
                        <Text
                            style={
                                styles.noSlotsIcon
                            }
                        >
                            🕐
                        </Text>

                        <Text
                            style={
                                styles.noSlotsTitle
                            }
                        >
                            Salon is closed
                        </Text>

                        <Text
                            style={
                                styles.noSlotsText
                            }
                        >
                            Please choose another
                            date.
                        </Text>
                    </View>
                ) : allSlots.length ===
                  0 ? (
                    <View
                        style={
                            styles.noSlotsCard
                        }
                    >
                        <Text
                            style={
                                styles.noSlotsIcon
                            }
                        >
                            🕐
                        </Text>

                        <Text
                            style={
                                styles.noSlotsTitle
                            }
                        >
                            No appointment times
                        </Text>

                        <Text
                            style={
                                styles.noSlotsText
                            }
                        >
                            The selected services
                            cannot fit within the
                            salon's working hours.
                        </Text>
                    </View>
                ) : (
                    <View
                        style={
                            styles.availableTimesCard
                        }
                    >
                        <Text
                            style={
                                styles.availableTimesTitle
                            }
                        >
                            Available times
                        </Text>

                        <Text
                            style={
                                styles.availableTimesSub
                            }
                        >
                            Tap “View times” or
                            “Select” above to choose
                            your appointment time.
                        </Text>
                    </View>
                )}

                {/* ================================================= */}
                {/* BOOKING SUMMARY */}
                {/* ================================================= */}

                <View
                    style={
                        styles.summaryCard
                    }
                >
                    <View>
                        <Text
                            style={
                                styles.summaryTitle
                            }
                        >
                            Booking Summary
                        </Text>

                        <Text
                            style={
                                styles.summarySub
                            }
                        >
                            {
                                services.length
                            }{' '}
                            {services.length ===
                            1
                                ? 'Service'
                                : 'Services'}
                        </Text>

                        {offerApplied && (
                            <Text
                                style={
                                    styles.summaryOffer
                                }
                            >
                                Offer discount applied
                            </Text>
                        )}
                    </View>

                    <View
                        style={
                            styles.summaryRight
                        }
                    >
                        {offerApplied && (
                            <Text
                                style={
                                    styles.summaryOriginalPrice
                                }
                            >
                                ₹
                                {subtotal.toFixed(
                                    0,
                                )}
                            </Text>
                        )}

                        <Text
                            style={
                                styles.summaryPrice
                            }
                        >
                            ₹
                            {totalPrice.toFixed(
                                0,
                            )}
                        </Text>

                        {offerApplied && (
                            <Text
                                style={
                                    styles.summaryDiscount
                                }
                            >
                                -₹
                                {discountAmount.toFixed(
                                    0,
                                )}
                            </Text>
                        )}

                        <Text
                            style={
                                styles.summarySub
                            }
                        >
                            {
                                totalDuration
                            }{' '}
                            mins
                        </Text>
                    </View>
                </View>

                {/* ================================================= */}
                {/* PAYMENT BREAKDOWN */}
                {/* ================================================= */}

                <View
                    style={
                        styles.paymentCard
                    }
                >
                    <Text
                        style={
                            styles.paymentTitle
                        }
                    >
                        Payment
                    </Text>

                    <View
                        style={
                            styles.paymentRow
                        }
                    >
                        <Text
                            style={
                                styles.paymentLabel
                            }
                        >
                            Services
                        </Text>

                        <Text
                            style={
                                styles.paymentValue
                            }
                        >
                            ₹
                            {totalPrice.toFixed(
                                0,
                            )}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.paymentRow
                        }
                    >
                        <Text
                            style={
                                styles.paymentLabel
                            }
                        >
                            Clavata booking fee
                        </Text>

                        <Text
                            style={
                                styles.bookingFeeValue
                            }
                        >
                            ₹9
                        </Text>
                    </View>

                    <View
                        style={
                            styles.paymentDivider
                        }
                    />

                    <View
                        style={
                            styles.paymentRow
                        }
                    >
                        <View>
                            <Text
                                style={
                                    styles.payNowLabel
                                }
                            >
                                Pay now
                            </Text>

                            <Text
                                style={
                                    styles.payNowSub
                                }
                            >
                                Booking fee
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.payNowValue
                            }
                        >
                            ₹9
                        </Text>
                    </View>

                    <View
                        style={
                            styles.paymentRow
                        }
                    >
                        <Text
                            style={
                                styles.paymentLabel
                            }
                        >
                            Pay at salon
                        </Text>

                        <Text
                            style={
                                styles.paymentValue
                            }
                        >
                            ₹
                            {totalPrice.toFixed(
                                0,
                            )}
                        </Text>
                    </View>
                </View>

                {/* ================================================= */}
                {/* SERVICE PRICE BREAKDOWN */}
                {/* ================================================= */}

                <View
                    style={
                        styles.servicePriceCard
                    }
                >
                    <Text
                        style={
                            styles.servicePriceTitle
                        }
                    >
                        Selected Services
                    </Text>

                    {services.map(
                        (
                            service: Service,
                        ) => {
                            const originalPrice =
                                Number(
                                    service.price ||
                                        0,
                                );

                            const displayPrice =
                                getServiceDisplayPrice(
                                    service,
                                );

                            const serviceHasDiscount =
                                displayPrice <
                                originalPrice;

                            return (
                                <View
                                    key={
                                        service.serviceId
                                    }
                                    style={
                                        styles.serviceRow
                                    }
                                >
                                    <View
                                        style={
                                            styles.serviceRowLeft
                                        }
                                    >
                                        <Text
                                            numberOfLines={
                                                1
                                            }
                                            style={
                                                styles.serviceName
                                            }
                                        >
                                            {
                                                service.name
                                            }
                                        </Text>

                                        {offerApplied &&
                                            isServiceEligibleForOffer(
                                                service,
                                            ) && (
                                                <Text
                                                    style={
                                                        styles.eligibleText
                                                    }
                                                >
                                                    Offer
                                                    eligible
                                                </Text>
                                            )}
                                    </View>

                                    <View
                                        style={
                                            styles.servicePriceRight
                                        }
                                    >
                                        {serviceHasDiscount && (
                                            <Text
                                                style={
                                                    styles.serviceOriginalPrice
                                                }
                                            >
                                                ₹
                                                {originalPrice.toFixed(
                                                    0,
                                                )}
                                            </Text>
                                        )}

                                        <Text
                                            style={[
                                                styles.servicePrice,

                                                serviceHasDiscount &&
                                                    styles.serviceDiscountedPrice,
                                            ]}
                                        >
                                            ₹
                                            {displayPrice.toFixed(
                                                0,
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            );
                        },
                    )}
                </View>
            </ScrollView>

            {/* ===================================================== */}
            {/* TIME SELECTION MODAL */}
            {/* ===================================================== */}

            <Modal
                visible={
                    timeModalVisible
                }
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setTimeModalVisible(
                        false,
                    )
                }
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={
                            styles.modalBackdrop
                        }
                        onPress={() =>
                            setTimeModalVisible(
                                false,
                            )
                        }
                    />

                    <View
                        style={
                            styles.timeModal
                        }
                    >
                        <View
                            style={
                                styles.modalHandle
                            }
                        />

                        {/* HEADER */}

                        <View
                            style={
                                styles.timeModalHeader
                            }
                        >
                            <View
                                style={
                                    styles.timeModalHeaderText
                                }
                            >
                                <Text
                                    style={
                                        styles.timeModalTitle
                                    }
                                >
                                    Choose a time
                                </Text>

                                <Text
                                    style={
                                        styles.timeModalSubtitle
                                    }
                                >
                                    {
                                        selectedDate.day
                                    }
                                    ,{' '}
                                    {
                                        selectedDate.dayNumber
                                    }{' '}
                                    {
                                        selectedDate.month
                                    }
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() =>
                                    setTimeModalVisible(
                                        false,
                                    )
                                }
                                style={
                                    styles.modalCloseButton
                                }
                            >
                                <Text
                                    style={
                                        styles.modalCloseText
                                    }
                                >
                                    ×
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* SALON HOURS */}

                        {businessHours && (
                            <View
                                style={
                                    styles.modalHours
                                }
                            >
                                <Text
                                    style={
                                        styles.modalHoursText
                                    }
                                >
                                    Open{' '}
                                    {
                                        formatTime(
                                            businessHours.open,
                                        )
                                    }{' '}
                                    –{' '}
                                    {
                                        formatTime(
                                            businessHours.close,
                                        )
                                    }
                                </Text>
                            </View>
                        )}

                        {/* TIMES */}

                        <ScrollView
                            showsVerticalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.timeModalContent
                            }
                        >
                            {!businessHours ? (
                                <View
                                    style={
                                        styles.modalEmpty
                                    }
                                >
                                    <Text
                                        style={
                                            styles.modalEmptyIcon
                                        }
                                    >
                                        🕐
                                    </Text>

                                    <Text
                                        style={
                                            styles.modalEmptyTitle
                                        }
                                    >
                                        Salon is closed
                                    </Text>

                                    <Text
                                        style={
                                            styles.modalEmptyText
                                        }
                                    >
                                        Please choose
                                        another date.
                                    </Text>
                                </View>
                            ) : allSlots.length ===
                              0 ? (
                                <View
                                    style={
                                        styles.modalEmpty
                                    }
                                >
                                    <Text
                                        style={
                                            styles.modalEmptyIcon
                                        }
                                    >
                                        🕐
                                    </Text>

                                    <Text
                                        style={
                                            styles.modalEmptyTitle
                                        }
                                    >
                                        No times available
                                    </Text>

                                    <Text
                                        style={
                                            styles.modalEmptyText
                                        }
                                    >
                                        Please choose
                                        another date.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {
                                        renderTimeSection(
                                            'Morning',
                                            morning,
                                        )
                                    }

                                    {
                                        renderTimeSection(
                                            'Afternoon',
                                            afternoon,
                                        )
                                    }

                                    {
                                        renderTimeSection(
                                            'Evening',
                                            evening,
                                        )
                                    }

                                    {allSlots.length >
                                        0 &&
                                        !allSlots.some(
                                            slot =>
                                                slot.available,
                                        ) && (
                                            <View
                                                style={
                                                    styles.noAvailableTimes
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.noAvailableTimesTitle
                                                    }
                                                >
                                                    All times are booked
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.noAvailableTimesText
                                                    }
                                                >
                                                    Please choose another
                                                    date.
                                                </Text>
                                            </View>
                                        )}
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ===================================================== */}
            {/* BOTTOM BAR */}
            {/* ===================================================== */}

            <View
                style={
                    styles.bottomBar
                }
            >
                <View
                    style={
                        styles.bottomPriceContainer
                    }
                >
                    {offerApplied && (
                        <Text
                            style={
                                styles.bottomOriginalPrice
                            }
                        >
                            ₹
                            {subtotal.toFixed(
                                0,
                            )}
                        </Text>
                    )}

                    <Text
                        style={
                            styles.bottomPrice
                        }
                    >
                        ₹9
                    </Text>

                    <Text
                        style={
                            styles.bottomBookingFee
                        }
                    >
                        Booking fee
                    </Text>

                    <Text
                        style={
                            styles.bottomServices
                        }
                    >
                        ₹
                        {totalPrice.toFixed(
                            0,
                        )}{' '}
                        at salon
                    </Text>

                    {offerApplied && (
                        <Text
                            style={
                                styles.bottomDiscount
                            }
                        >
                            Save ₹
                            {discountAmount.toFixed(
                                0,
                            )}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    disabled={
                        !selectedSlot ||
                        !selectedSlotObject?.available
                    }
                    activeOpacity={
                        0.85
                    }
                    style={[
                        styles.continueButton,

                        (!selectedSlot ||
                            !selectedSlotObject?.available) && {
                            opacity: 0.5,
                        },
                    ]}
                    onPress={() => {
                        if (
                            !selectedSlot ||
                            !selectedSlotObject?.available
                        ) {
                            return;
                        }

                        navigation.navigate(
                            'BookingSummary',
                            {
                                salonId,

                                salon,

                                customerUserId,

                                services,

                                date:
                                    selectedDate,

                                bookingDate:
                                    selectedDateString,

                                time:
                                    selectedSlot,

                                startTime:
                                    selectedSlotObject.startTime,

                                offer:
                                    normalizedOffer ||
                                    undefined,

                                offerId:
                                    normalizedOffer?.offerId ||
                                    undefined,

                                subtotal,

                                discountAmount,

                                totalPrice,

                                offerApplied,

                                totalDuration,

                                /*
                                Fixed Clavata booking fee.
                                This is separate from service
                                amount.
                                */
                                bookingFee:
                                    BOOKING_FEE,
                            },
                        );
                    }}
                >
                    <Text
                        style={
                            styles.continueText
                        }
                    >
                        Continue
                    </Text>

                    <Text
                        style={
                            styles.continueArrow
                        }
                    >
                        →
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

/*
================================================================
STYLES
================================================================
*/

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor:
                '#F6F7FB',
        },

        /*
        ================================================================
        HEADER
        ================================================================
        */

        header: {
            paddingHorizontal:
                18,
            paddingTop: 14,
            paddingBottom: 8,
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        backButton: {
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor:
                '#FFF',
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight: 12,
        },

        back: {
            fontSize: 25,
            fontWeight:
                '700',
            color: '#222',
        },

        headerTextContainer: {
            flex: 1,
        },

        title: {
            fontSize: 20,
            fontWeight:
                '800',
            color: '#111',
        },

        subtitle: {
            marginTop: 3,
            fontSize: 13,
            color: '#777',
        },

        /*
        ================================================================
        OFFER
        ================================================================
        */

        offerBanner: {
            marginHorizontal:
                16,
            marginBottom: 10,
            backgroundColor:
                '#E8F7F2',
            borderRadius: 14,
            paddingHorizontal:
                15,
            paddingVertical:
                11,
            borderWidth: 1,
            borderColor:
                '#BFE7D9',
        },

        offerTitle: {
            fontSize: 14,
            fontWeight:
                '800',
            color: PRIMARY,
        },

        offerAppliedText: {
            marginTop: 4,
            fontSize: 12,
            fontWeight:
                '600',
            color: '#176B53',
        },

        offerMessage: {
            marginTop: 4,
            fontSize: 12,
            color: '#666',
        },

        /*
        ================================================================
        SELECTED DATE
        ================================================================
        */

        selectedDateCard: {
            marginHorizontal:
                16,
            marginTop: 4,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            padding: 14,
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
            borderWidth: 1,
            borderColor:
                '#E7EAEA',
        },

        selectedDateLeft: {
            flexDirection:
                'row',
            alignItems:
                'center',
            flex: 1,
        },

        calendarIcon: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor:
                '#E8F7F2',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        calendarIconText: {
            fontSize: 21,
        },

        selectedDateInfo: {
            marginLeft: 11,
        },

        selectedDateLabel: {
            fontSize: 12,
            fontWeight:
                '700',
            color: PRIMARY,
        },

        selectedDateValue: {
            marginTop: 2,
            fontSize: 15,
            fontWeight:
                '800',
            color: '#222',
        },

        changeDateButton: {
            paddingHorizontal:
                14,
            paddingVertical:
                9,
            borderRadius: 18,
            backgroundColor:
                '#E8F7F2',
        },

        changeDateText: {
            color: PRIMARY,
            fontSize: 12,
            fontWeight:
                '800',
        },

        /*
        ================================================================
        CALENDAR
        ================================================================
        */

        calendarWrapper: {
            backgroundColor:
                '#FFF',
            marginHorizontal:
                16,
            marginTop: 8,
            borderRadius: 18,
            overflow:
                'hidden',
            borderWidth: 1,
            borderColor:
                '#E8E8E8',
        },

        /*
        ================================================================
        SELECTED TIME
        ================================================================
        */

        selectedTimeCard: {
            marginHorizontal:
                16,
            marginTop: 10,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            padding: 14,
            flexDirection:
                'row',
            alignItems:
                'center',
            borderWidth: 1,
            borderColor:
                '#E5E5E5',
        },

        selectedTimeCardActive: {
            borderColor:
                '#BFE7D9',
            backgroundColor:
                '#F8FFFC',
        },

        timeIcon: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor:
                '#F1F7F6',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        timeIconText: {
            fontSize: 21,
        },

        selectedTimeInfo: {
            flex: 1,
            marginLeft: 11,
        },

        selectedTimeLabel: {
            fontSize: 11,
            color: '#777',
            fontWeight:
                '600',
        },

        selectedTimeValue: {
            marginTop: 2,
            fontSize: 15,
            fontWeight:
                '800',
            color: '#222',
        },

        changeTimeText: {
            color: PRIMARY,
            fontSize: 12,
            fontWeight:
                '800',
        },

        /*
        ================================================================
        HOURS
        ================================================================
        */

        hoursBanner: {
            marginHorizontal:
                16,
            marginTop: 10,
            paddingHorizontal:
                14,
            paddingVertical:
                11,
            backgroundColor:
                '#FFF',
            borderRadius: 14,
            borderWidth: 1,
            borderColor:
                '#EAEAEA',
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
        },

        hoursLeft: {
            flex: 1,
        },

        hoursTitle: {
            fontSize: 13,
            fontWeight:
                '800',
            color: '#222',
        },

        hoursText: {
            marginTop: 3,
            fontSize: 12,
            color: PRIMARY,
            fontWeight:
                '600',
        },

        closedText: {
            marginTop: 3,
            fontSize: 12,
            color: '#E53935',
            fontWeight:
                '600',
        },

        hoursTimeButton: {
            paddingHorizontal:
                12,
            paddingVertical:
                8,
            borderRadius: 16,
            backgroundColor:
                '#F1F7F6',
        },

        hoursTimeButtonText: {
            fontSize: 11,
            fontWeight:
                '800',
            color: PRIMARY,
        },

        /*
        ================================================================
        CONFIRMED TIME
        ================================================================
        */

        confirmedTimeCard: {
            marginHorizontal:
                16,
            marginTop: 16,
            backgroundColor:
                '#E8F7F2',
            borderRadius: 16,
            padding: 15,
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
            borderWidth: 1,
            borderColor:
                '#BFE7D9',
        },

        confirmedTimeLabel: {
            fontSize: 11,
            color: '#47796E',
            fontWeight:
                '600',
        },

        confirmedTimeValue: {
            marginTop: 3,
            fontSize: 15,
            color: '#155D4D',
            fontWeight:
                '800',
        },

        confirmedChangeButton: {
            paddingHorizontal:
                12,
            paddingVertical:
                8,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
        },

        confirmedChangeText: {
            color: PRIMARY,
            fontSize: 11,
            fontWeight:
                '800',
        },

        /*
        ================================================================
        AVAILABLE TIMES
        ================================================================
        */

        availableTimesCard: {
            marginHorizontal:
                16,
            marginTop: 18,
            padding: 18,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            borderWidth: 1,
            borderColor:
                '#EEEEEE',
        },

        availableTimesTitle: {
            fontSize: 16,
            fontWeight:
                '800',
            color: '#222',
        },

        availableTimesSub: {
            marginTop: 5,
            fontSize: 12,
            color: '#777',
            lineHeight: 18,
        },

        /*
        ================================================================
        NO SLOTS
        ================================================================
        */

        noSlotsCard: {
            marginHorizontal:
                16,
            marginTop: 20,
            padding: 22,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            alignItems:
                'center',
            borderWidth: 1,
            borderColor:
                '#EEEEEE',
        },

        noSlotsIcon: {
            fontSize: 28,
            marginBottom: 7,
        },

        noSlotsTitle: {
            fontSize: 17,
            fontWeight:
                '800',
            color: '#222',
        },

        noSlotsText: {
            marginTop: 6,
            textAlign:
                'center',
            fontSize: 13,
            color: '#777',
            lineHeight: 19,
        },

        /*
        ================================================================
        SUMMARY
        ================================================================
        */

        summaryCard: {
            marginHorizontal:
                16,
            marginTop: 18,
            marginBottom: 10,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            padding: 17,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
            borderWidth: 1,
            borderColor:
                '#EEEEEE',
        },

        summaryTitle: {
            fontSize: 16,
            fontWeight:
                '800',
            color: '#111',
        },

        summarySub: {
            marginTop: 4,
            color: '#777',
            fontSize: 12,
        },

        summaryOffer: {
            marginTop: 5,
            color: PRIMARY,
            fontSize: 11,
            fontWeight:
                '700',
        },

        summaryRight: {
            alignItems:
                'flex-end',
        },

        summaryOriginalPrice: {
            fontSize: 12,
            color: '#999',
            textDecorationLine:
                'line-through',
        },

        summaryPrice: {
            marginTop: 1,
            fontSize: 21,
            fontWeight:
                '800',
            color: PRIMARY,
        },

        summaryDiscount: {
            marginTop: 2,
            fontSize: 12,
            color: '#16845E',
            fontWeight:
                '700',
        },

        /*
        ================================================================
        PAYMENT
        ================================================================
        */

        paymentCard: {
            marginHorizontal:
                16,
            marginTop: 4,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            padding: 17,
            borderWidth: 1,
            borderColor:
                '#EEEEEE',
        },

        paymentTitle: {
            fontSize: 16,
            fontWeight:
                '800',
            color: '#111',
            marginBottom: 10,
        },

        paymentRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
            paddingVertical:
                6,
        },

        paymentLabel: {
            fontSize: 13,
            color: '#666',
        },

        paymentValue: {
            fontSize: 13,
            color: '#222',
            fontWeight:
                '700',
        },

        bookingFeeValue: {
            fontSize: 13,
            color: PRIMARY,
            fontWeight:
                '800',
        },

        paymentDivider: {
            height: 1,
            backgroundColor:
                '#EEEEEE',
            marginVertical: 7,
        },

        payNowLabel: {
            fontSize: 14,
            fontWeight:
                '800',
            color: '#222',
        },

        payNowSub: {
            marginTop: 2,
            fontSize: 10,
            color: '#888',
        },

        payNowValue: {
            fontSize: 18,
            fontWeight:
                '800',
            color: PRIMARY,
        },

        /*
        ================================================================
        SERVICE PRICE
        ================================================================
        */

        servicePriceCard: {
            marginHorizontal:
                16,
            marginTop: 10,
            marginBottom: 20,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            padding: 17,
            borderWidth: 1,
            borderColor:
                '#EEEEEE',
        },

        servicePriceTitle: {
            fontSize: 16,
            fontWeight:
                '800',
            color: '#111',
            marginBottom: 10,
        },

        serviceRow: {
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
            paddingVertical:
                10,
            borderBottomWidth:
                1,
            borderBottomColor:
                '#F0F0F0',
        },

        serviceRowLeft: {
            flex: 1,
            paddingRight: 10,
        },

        serviceName: {
            fontSize: 14,
            fontWeight:
                '600',
            color: '#222',
        },

        eligibleText: {
            marginTop: 3,
            fontSize: 10,
            color: PRIMARY,
            fontWeight:
                '700',
        },

        servicePriceRight: {
            alignItems:
                'flex-end',
        },

        serviceOriginalPrice: {
            fontSize: 11,
            color: '#999',
            textDecorationLine:
                'line-through',
        },

        servicePrice: {
            fontSize: 14,
            fontWeight:
                '800',
            color: '#222',
        },

        serviceDiscountedPrice: {
            color: PRIMARY,
        },

        /*
        ================================================================
        TIME MODAL
        ================================================================
        */

        modalOverlay: {
            flex: 1,
            justifyContent:
                'flex-end',
            backgroundColor:
                'rgba(0,0,0,0.35)',
        },

        modalBackdrop: {
            ...StyleSheet.absoluteFillObject,
        },

        timeModal: {
            backgroundColor:
                '#FFF',
            borderTopLeftRadius:
                24,
            borderTopRightRadius:
                24,
            maxHeight:
                '82%',
            paddingTop:
                10,
            paddingHorizontal:
                18,
            paddingBottom:
                20,
        },

        modalHandle: {
            width: 42,
            height: 4,
            borderRadius: 2,
            backgroundColor:
                '#D7D7D7',
            alignSelf:
                'center',
            marginBottom: 15,
        },

        timeModalHeader: {
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
        },

        timeModalHeaderText: {
            flex: 1,
        },

        timeModalTitle: {
            fontSize: 20,
            fontWeight:
                '800',
            color: '#111',
        },

        timeModalSubtitle: {
            marginTop: 3,
            fontSize: 12,
            color: '#777',
            fontWeight:
                '600',
        },

        modalCloseButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor:
                '#F4F4F4',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        modalCloseText: {
            fontSize: 25,
            color: '#555',
            lineHeight: 27,
        },

        modalHours: {
            marginTop: 12,
            paddingHorizontal:
                12,
            paddingVertical:
                9,
            borderRadius: 11,
            backgroundColor:
                '#F1F7F6',
        },

        modalHoursText: {
            color: PRIMARY,
            fontSize: 12,
            fontWeight:
                '700',
        },

        timeModalContent: {
            paddingTop: 8,
            paddingBottom: 12,
        },

        timeSection: {
            marginTop: 12,
        },

        timeSectionTitle: {
            fontSize: 14,
            fontWeight:
                '800',
            color: '#222',
            marginBottom: 9,
        },

        slotGrid: {
            flexDirection:
                'row',
            flexWrap:
                'wrap',
            justifyContent:
                'flex-start',
        },

        slotCard: {
            width: '31%',
            marginRight: '3.5%',
            marginBottom: 10,
            backgroundColor:
                '#FFF',
            borderRadius: 12,
            paddingVertical:
                13,
            alignItems:
                'center',
            justifyContent:
                'center',
            borderWidth: 1,
            borderColor:
                '#E4E4E4',
        },

        slotCardSelected: {
            backgroundColor:
                PRIMARY,
            borderColor:
                PRIMARY,
        },

        slotDisabled: {
            backgroundColor:
                '#F3F3F3',
            borderColor:
                '#ECECEC',
        },

        slotText: {
            fontWeight:
                '700',
            fontSize: 13,
            color: '#222',
        },

        slotTextSelected: {
            color: '#FFF',
        },

        slotDisabledText: {
            color: '#AAA',
        },

        bookedText: {
            marginTop: 3,
            color: '#D94A4A',
            fontSize: 9,
            fontWeight:
                '600',
        },

        modalEmpty: {
            alignItems:
                'center',
            paddingVertical:
                45,
        },

        modalEmptyIcon: {
            fontSize: 30,
            marginBottom: 8,
        },

        modalEmptyTitle: {
            fontSize: 17,
            fontWeight:
                '800',
            color: '#222',
        },

        modalEmptyText: {
            marginTop: 5,
            fontSize: 13,
            color: '#777',
            textAlign:
                'center',
        },

        noAvailableTimes: {
            marginTop: 15,
            backgroundColor:
                '#FFF7F7',
            borderRadius: 14,
            padding: 15,
            alignItems:
                'center',
        },

        noAvailableTimesTitle: {
            fontSize: 14,
            fontWeight:
                '800',
            color: '#B33A3A',
        },

        noAvailableTimesText: {
            marginTop: 4,
            fontSize: 12,
            color: '#777',
        },

        /*
        ================================================================
        BOTTOM BAR
        ================================================================
        */

        bottomBar: {
            position:
                'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor:
                '#FFF',
            borderTopWidth:
                1,
            borderTopColor:
                '#EAEAEA',
            paddingHorizontal:
                18,
            paddingVertical:
                12,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
        },

        bottomPriceContainer: {
            flex: 1,
        },

        bottomOriginalPrice: {
            fontSize: 11,
            color: '#999',
            textDecorationLine:
                'line-through',
        },

        bottomPrice: {
            fontSize: 22,
            fontWeight:
                '800',
            color: PRIMARY,
        },

        bottomBookingFee: {
            marginTop: -1,
            fontSize: 10,
            color: '#777',
            fontWeight:
                '600',
        },

        bottomServices: {
            marginTop: 3,
            color: '#666',
            fontSize: 11,
        },

        bottomDiscount: {
            marginTop: 2,
            color: '#16845E',
            fontSize: 10,
            fontWeight:
                '700',
        },

        continueButton: {
            backgroundColor:
                PRIMARY,
            paddingHorizontal:
                28,
            paddingVertical:
                14,
            borderRadius: 28,
            flexDirection:
                'row',
            alignItems:
                'center',
            marginLeft: 12,
        },

        continueText: {
            color: '#FFF',
            fontWeight:
                '800',
            fontSize: 15,
        },

        continueArrow: {
            marginLeft: 7,
            color: '#FFF',
            fontSize: 18,
            fontWeight:
                '700',
        },
    });