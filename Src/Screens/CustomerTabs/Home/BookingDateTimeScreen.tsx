import React, {
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ScrollView,
    StyleSheet,
} from 'react-native';

import { Calendar } from 'react-native-calendars';

const PRIMARY = '#009D94';

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

    /*
    Display value.
    Example:
    09:30 AM
    */
    time: string;

    /*
    Backend-friendly 24-hour value.
    Example:
    09:30
    */
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

/*
================================================================
IMPORTANT

This prevents the TypeScript error:

Element implicitly has an 'any' type because expression of type
'string' can't be used to index type 'BusinessHours'.
================================================================
*/

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

    /*
    Actual API structure:

    businessHours: {
        MONDAY: {...},
        TUESDAY: {...}
    }
    */
    businessHours?: BusinessHours;

    /*
    Keep these because some API responses
    may use weekday fields directly.
    */
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
GENERATE NEXT 30 DAYS
================================================================
*/

const generateDates = (): DateItem[] => {
    const today = new Date();

    return Array.from({
        length: 30,
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
                index.toString(),

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

Supports:

09:30
19:00

AND:

09:30 AM
07:00 PM
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

    /*
    ------------------------------------------------------------
    24-HOUR FORMAT
    ------------------------------------------------------------
    */

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

    /*
    ------------------------------------------------------------
    12-HOUR FORMAT
    ------------------------------------------------------------
    */

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
        console.log(
            'BUSINESS HOURS DEBUG: salon is missing',
        );

        return null;
    }

    /*
    ------------------------------------------------------------
    Use a strongly typed weekday array.

    This is what fixes TS7053.
    ------------------------------------------------------------
    */

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

    console.log(
        'BUSINESS HOURS DEBUG:',
        {
            date:
                formatDate(date),

            weekday:
                weekdayKey,

            salonBusinessHours:
                salon.businessHours,
        },
    );

    /*
    ============================================================
    1. CHECK NESTED BUSINESS HOURS
    ============================================================

    Your actual API structure:

    businessHours: {
        MONDAY: {
            open: "09:00",
            close: "19:00",
            isOpen: true
        }
    }
    ============================================================
    */

    const nestedBusinessDay =
        salon.businessHours?.[
            weekdayKey
        ];

    if (
        nestedBusinessDay
    ) {
        console.log(
            'BUSINESS HOURS DEBUG: selected nested day:',
            nestedBusinessDay,
        );

        return nestedBusinessDay;
    }

    /*
    ============================================================
    2. FALLBACK TO DIRECT WEEKDAY FIELD
    ============================================================

    Supports:

    salon: {
        MONDAY: {
            open: "09:00",
            close: "19:00",
            isOpen: true
        }
    }
    ============================================================
    */

    const directBusinessDay =
        salon[weekdayKey];

    if (
        directBusinessDay &&
        typeof directBusinessDay ===
            'object'
    ) {
        console.log(
            'BUSINESS HOURS DEBUG: selected direct day:',
            directBusinessDay,
        );

        return directBusinessDay as BusinessDay;
    }

    console.log(
        'BUSINESS HOURS DEBUG: no hours found for:',
        weekdayKey,
    );

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
CHECK BOOKING STATUS
================================================================

Only PENDING and CONFIRMED bookings occupy the schedule.
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
CHECK TIME OVERLAP
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

    /*
    ================================================================
    DEBUG
    ================================================================
    */

    console.log(
        'BookingDateTime params:',
        route?.params,
    );

    console.log(
        'BookingDateTime salon:',
        salon,
    );

    console.log(
        'BookingDateTime salon.businessHours:',
        salon?.businessHours,
    );

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
    DATES
    ================================================================
    */

    const dates =
        useMemo(
            () =>
                generateDates(),
            [],
        );

    const [
        selectedDate,
        setSelectedDate,
    ] =
        useState<DateItem>(
            dates[0],
        );

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
    CHECK OFFER VALIDITY
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
    SERVICE ELIGIBILITY
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

            /*
            --------------------------------------------------------
            EXPLICIT SERVICE IDS
            --------------------------------------------------------
            */

            if (
                serviceIds.length >
                0
            ) {
                return serviceIds.includes(
                    service.serviceId,
                );
            }

            /*
            --------------------------------------------------------
            CATEGORY
            --------------------------------------------------------
            */

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

            /*
            --------------------------------------------------------
            NO RESTRICTION
            --------------------------------------------------------
            */

            return true;
        };

    /*
    ================================================================
    ORIGINAL SUBTOTAL
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

            /*
            --------------------------------------------------------
            PERCENTAGE
            --------------------------------------------------------
            */

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

            /*
            --------------------------------------------------------
            FIXED
            --------------------------------------------------------
            */

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
    FINAL TOTAL
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

            /*
            --------------------------------------------------------
            PERCENTAGE
            --------------------------------------------------------
            */

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

            /*
            --------------------------------------------------------
            FIXED
            --------------------------------------------------------
            */

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
    SALON BUSINESS DAY
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
    DEBUG SELECTED BUSINESS DAY
    ================================================================
    */

    console.log(
        'BUSINESS HOURS DEBUG: selectedBusinessDay:',
        selectedBusinessDay,
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

            /*
            --------------------------------------------------------
            isOpen is BOOLEAN.
            --------------------------------------------------------
            */

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
                console.log(
                    'BUSINESS HOURS DEBUG: invalid opening/closing time:',
                    {
                        open:
                            selectedBusinessDay.open,
                        close:
                            selectedBusinessDay.close,
                    },
                );

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
    DEBUG NORMALIZED HOURS
    ================================================================
    */

    console.log(
        'BUSINESS HOURS DEBUG: normalized businessHours:',
        businessHours,
    );

    /*
    ================================================================
    CHECK IF TIME HAS PASSED TODAY
    ================================================================
    */

    const isTimePassedToday =
        (
            slotStartMinutes: number,
        ): boolean => {
            if (
                selectedDateString !==
                today
            ) {
                return false;
            }

            const now =
                new Date();

            const currentMinutes =
                now.getHours() *
                    60 +
                now.getMinutes();

            return (
                slotStartMinutes <=
                currentMinutes
            );
        };

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
                    /*
                    ------------------------------------------------
                    DATE
                    ------------------------------------------------
                    */

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

                    /*
                    ------------------------------------------------
                    STATUS
                    ------------------------------------------------
                    */

                    if (
                        !bookingOccupiesSlot(
                            booking,
                        )
                    ) {
                        return false;
                    }

                    /*
                    ------------------------------------------------
                    EXISTING START
                    ------------------------------------------------
                    */

                    const existingStart =
                        normalizeBookingTime(
                            booking.startTime,
                        );

                    /*
                    ------------------------------------------------
                    EXISTING END
                    ------------------------------------------------
                    */

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

                    /*
                    ------------------------------------------------
                    OVERLAP
                    ------------------------------------------------
                    */

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
    GENERATE DYNAMIC TIME SLOTS
    ================================================================
    */

    const allSlots =
        useMemo<Slot[]>(() => {
            /*
            --------------------------------------------------------
            CLOSED / INVALID HOURS
            --------------------------------------------------------
            */

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

            /*
            --------------------------------------------------------
            Latest valid starting time
            --------------------------------------------------------
            */

            const latestStart =
                close -
                totalDuration;

            if (
                latestStart <
                open
            ) {
                return [];
            }

            /*
            --------------------------------------------------------
            Generate every 30 minutes
            --------------------------------------------------------
            */

            let current =
                open;

            let slotIndex =
                0;

            while (
                current <=
                latestStart
            ) {
                const slotEnd =
                    current +
                    totalDuration;

                let available =
                    true;

                let reason:
                    | string
                    | undefined;

                /*
                ----------------------------------------------------
                TODAY - PAST TIME
                ----------------------------------------------------
                */

                if (
                    isTimePassedToday(
                        current,
                    )
                ) {
                    available =
                        false;

                    reason =
                        'Passed';
                }

                /*
                ----------------------------------------------------
                REAL BOOKING
                ----------------------------------------------------
                */

                if (
                    available &&
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

                    /*
                    Display:
                    09:30 AM
                    */
                    time:
                        formatTime(
                            current,
                        ),

                    /*
                    Backend:
                    09:30
                    */
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
    DEBUG GENERATED SLOTS
    ================================================================
    */

    console.log(
        'BUSINESS HOURS DEBUG: generated slots:',
        {
            selectedDate:
                selectedDateString,

            businessHours,

            totalDuration,

            totalSlots:
                allSlots.length,

            availableSlots:
                allSlots.filter(
                    slot =>
                        slot.available,
                ).length,
        },
    );

    /*
    ================================================================
    GROUP SLOTS
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
    SLOT RENDER
    ================================================================
    */

    const renderSlot = ({
        item,
    }: {
        item: Slot;
    }) => {
        const selected =
            selectedSlot ===
            item.time;

        return (
            <TouchableOpacity
                disabled={
                    !item.available
                }
                onPress={() =>
                    setSelectedSlot(
                        item.time,
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
                    {item.time}
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
    CALENDAR DAY PRESS
    ================================================================
    */

    const onDayPress = (
        day: any,
    ) => {
        const selected =
            new Date(
                `${day.dateString}T12:00:00`,
            );

        const tomorrow =
            new Date();

        tomorrow.setDate(
            tomorrow.getDate() +
                1,
        );

        const tomorrowString =
            formatDate(
                tomorrow,
            );

        const weekday =
            selected.toLocaleDateString(
                'en-US',
                {
                    weekday:
                        'short',
                },
            );

        const month =
            selected.toLocaleDateString(
                'en-US',
                {
                    month:
                        'short',
                },
            );

        setSelectedDate({
            id:
                day.dateString,

            date:
                selected,

            label:
                day.dateString ===
                    today
                    ? 'Today'
                    : day.dateString ===
                          tomorrowString
                        ? 'Tomorrow'
                        : weekday,

            day:
                weekday,

            dayNumber:
                selected
                    .getDate()
                    .toString(),

            month,
        });

        /*
        ------------------------------------------------------------
        Clear previous selected time whenever date changes.
        ------------------------------------------------------------
        */

        setSelectedSlot(
            null,
        );
    };

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
                >
                    <Text
                        style={
                            styles.back
                        }
                    >
                        ←
                    </Text>
                </TouchableOpacity>

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
                    Choose your preferred
                    date & time
                </Text>

                <Text
                    style={
                        styles.month
                    }
                >
                    {
                        selectedDate.month
                    }{' '}
                    {
                        selectedDate.date.getFullYear()
                    }
                </Text>
            </View>

            {/* ===================================================== */}
            {/* OFFER BANNER */}
            {/* ===================================================== */}

            {normalizedOffer && (
                <View
                    style={
                        styles.offerBanner
                    }
                >
                    <View
                        style={
                            styles.offerBannerContent
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
                </View>
            )}

            {/* ===================================================== */}
            {/* CALENDAR */}
            {/* ===================================================== */}

            <Calendar
                minDate={
                    today
                }

                maxDate={
                    formatDate(
                        dates[
                            dates.length -
                                1
                        ].date,
                    )
                }

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
                        22,

                    textMonthFontWeight:
                        '700',

                    dayTextColor:
                        '#222',

                    textDayFontWeight:
                        '600',

                    textDayHeaderFontWeight:
                        '700',

                    textDayHeaderFontSize:
                        13,

                    selectedDayBackgroundColor:
                        PRIMARY,

                    selectedDayTextColor:
                        '#fff',

                    todayTextColor:
                        PRIMARY,

                    arrowColor:
                        PRIMARY,

                    textDisabledColor:
                        '#d2d2d2',
                }}
            />

            {/* ===================================================== */}
            {/* SALON HOURS */}
            {/* ===================================================== */}

            <View
                style={
                    styles.hoursBanner
                }
            >
                <Text
                    style={
                        styles.hoursTitle
                    }
                >
                    {selectedDate.label}
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
                        Salon is closed
                    </Text>
                )}
            </View>

            {/* ===================================================== */}
            {/* TIME SLOTS */}
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
                {!businessHours ? (
                    <View
                        style={
                            styles.noSlotsCard
                        }
                    >
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
                    <>
                        {/* ========================================= */}
                        {/* MORNING */}
                        {/* ========================================= */}

                        {morning.length >
                            0 && (
                            <>
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Morning
                                </Text>

                                <FlatList
                                    data={
                                        morning
                                    }
                                    renderItem={
                                        renderSlot
                                    }
                                    keyExtractor={item =>
                                        item.id
                                    }
                                    numColumns={
                                        3
                                    }
                                    scrollEnabled={
                                        false
                                    }
                                />
                            </>
                        )}

                        {/* ========================================= */}
                        {/* AFTERNOON */}
                        {/* ========================================= */}

                        {afternoon.length >
                            0 && (
                            <>
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Afternoon
                                </Text>

                                <FlatList
                                    data={
                                        afternoon
                                    }
                                    renderItem={
                                        renderSlot
                                    }
                                    keyExtractor={item =>
                                        item.id
                                    }
                                    numColumns={
                                        3
                                    }
                                    scrollEnabled={
                                        false
                                    }
                                />
                            </>
                        )}

                        {/* ========================================= */}
                        {/* EVENING */}
                        {/* ========================================= */}

                        {evening.length >
                            0 && (
                            <>
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Evening
                                </Text>

                                <FlatList
                                    data={
                                        evening
                                    }
                                    renderItem={
                                        renderSlot
                                    }
                                    keyExtractor={item =>
                                        item.id
                                    }
                                    numColumns={
                                        3
                                    }
                                    scrollEnabled={
                                        false
                                    }
                                />
                            </>
                        )}

                        {/* ========================================= */}
                        {/* NO AVAILABLE SLOTS */}
                        {/* ========================================= */}

                        {allSlots.length >
                            0 &&
                            !allSlots.some(
                                slot =>
                                    slot.available,
                            ) && (
                                <View
                                    style={
                                        styles.noSlotsCard
                                    }
                                >
                                    <Text
                                        style={
                                            styles.noSlotsTitle
                                        }
                                    >
                                        No available times
                                    </Text>

                                    <Text
                                        style={
                                            styles.noSlotsText
                                        }
                                    >
                                        All appointment times
                                        for this date are
                                        unavailable. Please
                                        choose another date.
                                    </Text>
                                </View>
                            )}
                    </>
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
                            Services
                        </Text>

                        {offerApplied && (
                            <Text
                                style={
                                    styles.summaryOffer
                                }
                            >
                                Offer discount
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
            {/* BOTTOM BAR */}
            {/* ===================================================== */}

            <View
                style={
                    styles.bottomBar
                }
            >
                <View>
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
                        ₹
                        {totalPrice.toFixed(
                            0,
                        )}
                    </Text>

                    {offerApplied ? (
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
                    ) : (
                        <Text
                            style={
                                styles.bottomServices
                            }
                        >
                            {
                                services.length
                            }{' '}
                            services
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    disabled={
                        !selectedSlot ||
                        !selectedSlotObject?.available
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

                        /*
                        ==================================================
                        BACKEND-FRIENDLY VALUES
                        ==================================================

                        bookingDate:
                            2026-09-09

                        startTime:
                            09:30

                        Display time:
                            09:30 AM
                        ==================================================
                        */

                        navigation.navigate(
                            'BookingSummary',
                            {
                                salonId,

                                salon,

                                customerUserId,

                                services,

                                /*
                                Existing DateItem
                                preserved for compatibility.
                                */
                                date:
                                    selectedDate,

                                /*
                                Backend-ready date.
                                */
                                bookingDate:
                                    selectedDateString,

                                /*
                                Display time.
                                */
                                time:
                                    selectedSlot,

                                /*
                                Backend-ready start time.
                                */
                                startTime:
                                    selectedSlotObject.startTime,

                                /*
                                Offer
                                */
                                offer:
                                    normalizedOffer ||
                                    undefined,

                                offerId:
                                    normalizedOffer?.offerId ||
                                    undefined,

                                /*
                                Pricing
                                */
                                subtotal,

                                discountAmount,

                                totalPrice,

                                offerApplied,

                                /*
                                Duration
                                */
                                totalDuration,
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

        header: {
            paddingHorizontal:
                20,
            paddingTop: 20,
            paddingBottom: 10,
        },

        title: {
            fontSize: 18,
            fontWeight:
                '700',
            color: '#111',
        },

        subtitle: {
            marginTop: 4,
            fontSize: 15,
            color: '#777',
        },

        month: {
            marginTop: 10,
            fontSize: 16,
            fontWeight:
                '600',
            color: '#444',
        },

        back: {
            fontSize: 28,
            fontWeight:
                '700',
        },

        /*
        ================================================================
        OFFER
        ================================================================
        */

        offerBanner: {
            marginHorizontal:
                16,
            marginBottom: 6,
            backgroundColor:
                '#E8F7F2',
            borderRadius: 14,
            paddingHorizontal:
                16,
            paddingVertical:
                12,
            borderWidth: 1,
            borderColor:
                '#BFE7D9',
        },

        offerBannerContent: {
            flexDirection:
                'column',
        },

        offerTitle: {
            fontSize: 15,
            fontWeight:
                '700',
            color: PRIMARY,
        },

        offerAppliedText: {
            marginTop: 4,
            fontSize: 13,
            fontWeight:
                '600',
            color: '#176B53',
        },

        offerMessage: {
            marginTop: 4,
            fontSize: 13,
            color: '#666',
        },

        /*
        ================================================================
        BUSINESS HOURS
        ================================================================
        */

        hoursBanner: {
            marginHorizontal:
                16,
            marginTop: 8,
            paddingHorizontal:
                16,
            paddingVertical:
                10,
            backgroundColor:
                '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor:
                '#EAEAEA',
        },

        hoursTitle: {
            fontSize: 14,
            fontWeight:
                '700',
            color: '#222',
        },

        hoursText: {
            marginTop: 3,
            fontSize: 13,
            color: PRIMARY,
            fontWeight:
                '600',
        },

        closedText: {
            marginTop: 3,
            fontSize: 13,
            color: '#E53935',
            fontWeight:
                '600',
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
            padding: 20,
            backgroundColor:
                '#FFFFFF',
            borderRadius: 16,
            alignItems:
                'center',
            borderWidth: 1,
            borderColor:
                '#EEEEEE',
        },

        noSlotsTitle: {
            fontSize: 17,
            fontWeight:
                '700',
            color: '#222',
        },

        noSlotsText: {
            marginTop: 6,
            textAlign:
                'center',
            fontSize: 14,
            color: '#777',
        },

        /*
        ================================================================
        SUMMARY
        ================================================================
        */

        summaryCard: {
            marginHorizontal:
                16,
            marginTop: 20,
            marginBottom: 10,
            backgroundColor:
                '#FFF',
            borderRadius: 16,
            padding: 18,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
            elevation: 2,
        },

        summaryTitle: {
            fontSize: 17,
            fontWeight:
                '700',
            color: '#111',
        },

        summarySub: {
            marginTop: 5,
            color: '#777',
            fontSize: 14,
        },

        summaryOffer: {
            marginTop: 6,
            color: PRIMARY,
            fontSize: 13,
            fontWeight:
                '600',
        },

        summaryRight: {
            alignItems:
                'flex-end',
        },

        summaryOriginalPrice: {
            fontSize: 14,
            color: '#999',
            textDecorationLine:
                'line-through',
        },

        summaryPrice: {
            marginTop: 2,
            fontSize: 22,
            fontWeight:
                '700',
            color: PRIMARY,
        },

        summaryDiscount: {
            marginTop: 3,
            fontSize: 13,
            color: '#16845E',
            fontWeight:
                '600',
        },

        /*
        ================================================================
        SERVICE PRICE BREAKDOWN
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
            padding: 18,
            elevation: 2,
        },

        servicePriceTitle: {
            fontSize: 17,
            fontWeight:
                '700',
            color: '#111',
            marginBottom: 12,
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
            fontSize: 15,
            fontWeight:
                '600',
            color: '#222',
        },

        eligibleText: {
            marginTop: 3,
            fontSize: 11,
            color: PRIMARY,
            fontWeight:
                '600',
        },

        servicePriceRight: {
            alignItems:
                'flex-end',
        },

        serviceOriginalPrice: {
            fontSize: 12,
            color: '#999',
            textDecorationLine:
                'line-through',
        },

        servicePrice: {
            fontSize: 15,
            fontWeight:
                '700',
            color: '#222',
        },

        serviceDiscountedPrice: {
            color: PRIMARY,
        },

        /*
        ================================================================
        SECTION
        ================================================================
        */

        sectionTitle: {
            marginHorizontal:
                18,
            marginTop: 20,
            marginBottom: 12,
            fontSize: 20,
            fontWeight:
                '700',
            color: '#111',
        },

        /*
        ================================================================
        SLOTS
        ================================================================
        */

        slotCard: {
            flex: 1,
            marginHorizontal: 8,
            marginBottom: 14,
            backgroundColor:
                '#FFF',
            borderRadius: 14,
            paddingVertical:
                16,
            alignItems:
                'center',
            justifyContent:
                'center',
            borderWidth: 1,
            borderColor:
                '#EAEAEA',
            elevation: 1,
        },

        slotCardSelected: {
            backgroundColor:
                PRIMARY,
            borderColor:
                PRIMARY,
        },

        slotDisabled: {
            backgroundColor:
                '#F2F2F2',
            borderColor:
                '#F2F2F2',
        },

        slotText: {
            fontWeight:
                '700',
            fontSize: 15,
            color: '#111',
        },

        slotTextSelected: {
            color: '#FFF',
        },

        slotDisabledText: {
            color: '#AAA',
        },

        bookedText: {
            marginTop: 5,
            color: '#E53935',
            fontSize: 11,
            fontWeight:
                '600',
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
                '#EEE',
            paddingHorizontal:
                20,
            paddingVertical:
                16,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
        },

        bottomOriginalPrice: {
            fontSize: 13,
            color: '#999',
            textDecorationLine:
                'line-through',
        },

        bottomPrice: {
            fontSize: 24,
            fontWeight:
                '700',
            color: PRIMARY,
        },

        bottomDiscount: {
            marginTop: 3,
            color: '#16845E',
            fontSize: 13,
            fontWeight:
                '600',
        },

        bottomServices: {
            marginTop: 4,
            color: '#666',
            fontSize: 14,
        },

        continueButton: {
            backgroundColor:
                PRIMARY,
            paddingHorizontal:
                34,
            paddingVertical:
                15,
            borderRadius: 30,
        },

        continueText: {
            color: '#FFF',
            fontWeight:
                '700',
            fontSize: 16,
        },

        /*
        ================================================================
        KEPT EXISTING DATE STYLES
        ================================================================
        */

        calendarContainer: {
            paddingHorizontal:
                16,
            paddingBottom: 10,
        },

        dateCard: {
            width: 78,
            height: 100,
            backgroundColor:
                '#FFF',
            borderRadius: 18,
            marginRight: 12,
            justifyContent:
                'center',
            alignItems:
                'center',
            borderWidth: 1,
            borderColor:
                '#ECECEC',
            elevation: 2,
        },

        dateCardSelected: {
            backgroundColor:
                PRIMARY,
            borderColor:
                PRIMARY,
        },

        dateLabel: {
            fontSize: 12,
            color: '#777',
            fontWeight:
                '600',
        },

        dateLabelSelected: {
            color: '#FFF',
        },

        dateNumber: {
            marginTop: 6,
            fontSize: 28,
            fontWeight:
                '700',
            color: '#111',
        },

        dateNumberSelected: {
            color: '#FFF',
        },

        favorite: {
            fontSize: 28,
        },

        dateMonth: {
            marginTop: 4,
            fontSize: 12,
            color: '#777',
        },

        dateMonthSelected: {
            color: '#FFF',
        },

        calendarWrapper: {
            backgroundColor:
                '#FFF',
            marginHorizontal:
                16,
            marginTop: 10,
            borderRadius: 18,
            elevation: 2,
            paddingVertical: 8,
        },
    });