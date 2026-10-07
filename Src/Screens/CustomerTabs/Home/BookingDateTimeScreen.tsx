import React, {
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';

import {
    Calendar,
} from 'react-native-calendars';

import Icon from 'react-native-vector-icons/Ionicons';

import {
    useMutation,
} from '@apollo/client';

import {
    useNavigation,
    useRoute,
} from '@react-navigation/native';

import {
    CREATE_BOOKING,
} from '../../../graphql/queries';


const PRIMARY = '#009D94';

const BOOKING_FEE = 9;

const PAYMENT_WINDOW_MINUTES = 15;

const { height: SCREEN_HEIGHT } =
    Dimensions.get('window');


/* ================================================================
   TYPES
================================================================ */

type WeekdayKey =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';


type BusinessDay = {
    isOpen?: boolean;
    open?: string;
    close?: string;
    openingTime?: string;
    closingTime?: string;
};


type BusinessHours = {
    [key in WeekdayKey]?:
        | BusinessDay
        | null;
};


type Service = {
    serviceId: string;
    salonId?: string;
    id?: string;
    name: string;
    category?: string;
    description?: string;
    duration: number;
    price: number;
    gender?: string;
    audience?: string;
    popular?: boolean;
    active?: boolean;
};


type Offer = {
    offerId: string;
    id?: string;
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
    code?: string | null;
    minimumBookingAmount?:
        | number
        | null;
    category?: string | null;
    serviceIds: string[];
    startDate?: string;
    endDate?: string;
    status?: string;
};


type Salon = {
    salonId?: string;
    id?: string;
    name?: string;
    salonName?: string;

    address?: {
        addressLine?: string;
        city?: string;
        state?: string;
    };

    businessHours?:
        | BusinessHours
        | any;
};


type DateItem = {
    date: Date;
    dateString: string;
    dayName: string;
    dayNumber: number;
    month: string;
    label: string;
};


type Slot = {
    id: string;
    time: string;
    startTime: string;
};


/* ================================================================
   HELPERS
================================================================ */

const formatDate = (
    date: Date,
) => {
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
    return {
        date,
        dateString:
            formatDate(date),

        dayName:
            date.toLocaleDateString(
                'en-US',
                {
                    weekday: 'short',
                },
            ),

        dayNumber:
            date.getDate(),

        month:
            date.toLocaleDateString(
                'en-US',
                {
                    month: 'short',
                },
            ),

        label:
            date.toLocaleDateString(
                'en-US',
                {
                    weekday: 'long',
                },
            ),
    };
};


const generateFutureDates = (
    days: number = 365,
) => {
    const result: DateItem[] = [];

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0,
    );

    for (
        let index = 0;
        index < days;
        index++
    ) {
        const date =
            new Date(today);

        date.setDate(
            today.getDate() +
                index,
        );

        result.push(
            createDateItem(date),
        );
    }

    return result;
};


const isSameDate = (
    first: Date,
    second: Date,
) => {
    return (
        first.getFullYear() ===
            second.getFullYear() &&
        first.getMonth() ===
            second.getMonth() &&
        first.getDate() ===
            second.getDate()
    );
};


const formatTime = (
    totalMinutes: number,
) => {
    let hours =
        Math.floor(
            totalMinutes / 60,
        );

    const minutes =
        totalMinutes % 60;

    const period =
        hours >= 12
            ? 'PM'
            : 'AM';

    if (hours === 0) {
        hours = 12;
    } else if (
        hours > 12
    ) {
        hours -= 12;
    }

    return `${hours}:${String(
        minutes,
    ).padStart(
        2,
        '0',
    )} ${period}`;
};


const formatTime24 = (
    totalMinutes: number,
) => {
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


const timeToMinutes = (
    value?: string,
) => {
    if (!value) {
        return null;
    }

    const cleaned =
        String(value)
            .trim()
            .toUpperCase();

    /*
     * Supports:
     * 09:30
     * 9:30
     * 09:30 AM
     * 9:30 PM
     */

    const match =
        cleaned.match(
            /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/,
        );

    if (!match) {
        return null;
    }

    let hours =
        Number(match[1]);

    const minutes =
        Number(match[2]);

    const period =
        match[3];

    if (
        period === 'PM' &&
        hours !== 12
    ) {
        hours += 12;
    }

    if (
        period === 'AM' &&
        hours === 12
    ) {
        hours = 0;
    }

    return (
        hours * 60 +
        minutes
    );
};


const getBusinessDay = (
    salon: Salon,
    date: Date,
): BusinessDay | null => {
    const hours =
        salon?.businessHours;

    if (!hours) {
        return null;
    }

    const day =
        date.getDay();

    const map: {
        [key: number]: WeekdayKey;
    } = {
        0: 'SUNDAY',
        1: 'MONDAY',
        2: 'TUESDAY',
        3: 'WEDNESDAY',
        4: 'THURSDAY',
        5: 'FRIDAY',
        6: 'SATURDAY',
    };

    const key =
        map[day];

    return (
        hours[key] || null
    );
};


const getOpeningMinutes = (
    businessDay:
        | BusinessDay
        | null,
) => {
    if (!businessDay) {
        return null;
    }

    return timeToMinutes(
        businessDay.open ||
            businessDay.openingTime,
    );
};


const getClosingMinutes = (
    businessDay:
        | BusinessDay
        | null,
) => {
    if (!businessDay) {
        return null;
    }

    return timeToMinutes(
        businessDay.close ||
            businessDay.closingTime,
    );
};


const getServiceId = (
    service: Service,
) => {
    return (
        service.serviceId ||
        service.id ||
        ''
    );
};


const getServicePrice = (
    service: Service,
) => {
    return Number(
        service.price || 0,
    );
};


const getServiceDuration = (
    service: Service,
) => {
    return Number(
        service.duration || 0,
    );
};


/* ================================================================
   SCREEN
================================================================ */

export default function BookingDateTimeScreen() {
    const navigation =
        useNavigation<any>();

    const route =
        useRoute<any>();

    const params =
        route.params || {};

    const {
        salon,
        salonId,
        customerUserId,
        services = [],
        offer,
    } = params;


    /* ============================================================
       MUTATION
    ============================================================ */

    const [
        createBooking,
        {
            loading:
                creatingBooking,
        },
    ] = useMutation(
        CREATE_BOOKING,
    );


    /* ============================================================
       DATE
    ============================================================ */

    const today =
        useMemo(() => {
            const value =
                new Date();

            value.setHours(
                0,
                0,
                0,
                0,
            );

            return value;
        }, []);


    const futureDates =
        useMemo(
            () =>
                generateFutureDates(
                    365,
                ),
            [],
        );


    const initialDate =
        useMemo(() => {
            const incoming =
                params.selectedDate ||
                params.preferredDate;

            if (
                incoming instanceof Date
            ) {
                return incoming;
            }

            if (
                typeof incoming ===
                'string'
            ) {
                const parsed =
                    new Date(
                        `${incoming}T00:00:00`,
                    );

                if (
                    !Number.isNaN(
                        parsed.getTime(),
                    )
                ) {
                    return parsed;
                }
            }

            return today;
        }, [
            params.selectedDate,
            params.preferredDate,
            today,
        ]);


    const [
        selectedDate,
        setSelectedDate,
    ] = useState<Date>(
        initialDate,
    );


    const [
        selectedTime,
        setSelectedTime,
    ] = useState<Slot | null>(
        params.selectedTime &&
            params.selectedTime24
            ? {
                  id: `${formatDate(
                      initialDate,
                  )}-${params.selectedTime24}`,

                  time:
                      params.selectedTime,

                  startTime:
                      params.selectedTime24,
              }
            : null,
    );


    /* ============================================================
       PICKER STATE
    ============================================================ */

    const [
        showPicker,
        setShowPicker,
    ] = useState(false);


    const [
        showFullCalendar,
        setShowFullCalendar,
    ] = useState(false);


    const [
        pickerDate,
        setPickerDate,
    ] = useState<Date>(
        initialDate,
    );


    const [
        pickerTime,
        setPickerTime,
    ] = useState<Slot | null>(
        selectedTime,
    );


    /* ============================================================
       NORMALIZED SERVICES
    ============================================================ */

    const normalizedServices =
        useMemo<Service[]>(() => {
            if (
                !Array.isArray(
                    services,
                )
            ) {
                return [];
            }

            return services;
        }, [services]);


    /* ============================================================
       TOTAL DURATION
    ============================================================ */

    const totalDuration =
        useMemo(() => {
            return normalizedServices.reduce(
                (
                    total,
                    service,
                ) =>
                    total +
                    getServiceDuration(
                        service,
                    ),
                0,
            );
        }, [
            normalizedServices,
        ]);


    /* ============================================================
       SUBTOTAL
    ============================================================ */

    const subtotal =
        useMemo(() => {
            return normalizedServices.reduce(
                (
                    total,
                    service,
                ) =>
                    total +
                    getServicePrice(
                        service,
                    ),
                0,
            );
        }, [
            normalizedServices,
        ]);


    /* ============================================================
       NORMALIZE OFFER
    ============================================================ */

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


    /* ============================================================
       OFFER VALIDATION
    ============================================================ */

    const isOfferValid =
        useMemo(() => {
            if (
                !normalizedOffer
            ) {
                return false;
            }

            if (
                normalizedOffer.status &&
                normalizedOffer.status !==
                    'ACTIVE'
            ) {
                return false;
            }

            const now =
                new Date();

            if (
                normalizedOffer.startDate
            ) {
                const startDate =
                    new Date(
                        normalizedOffer.startDate,
                    );

                if (
                    !Number.isNaN(
                        startDate.getTime(),
                    ) &&
                    now < startDate
                ) {
                    return false;
                }
            }

            if (
                normalizedOffer.endDate
            ) {
                const endDate =
                    new Date(
                        normalizedOffer.endDate,
                    );

                if (
                    !Number.isNaN(
                        endDate.getTime(),
                    ) &&
                    now > endDate
                ) {
                    return false;
                }
            }

            return true;
        }, [
            normalizedOffer,
        ]);


    /* ============================================================
       SERVICE ELIGIBILITY
    ============================================================ */

    const isServiceEligibleForOffer =
        (
            service: Service,
        ) => {
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
                serviceIds.length > 0
            ) {
                return serviceIds.includes(
                    getServiceId(
                        service,
                    ),
                );
            }

            if (
                normalizedOffer.category &&
                normalizedOffer.category.trim()
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


    /* ============================================================
       ELIGIBLE SUBTOTAL
    ============================================================ */

    const eligibleSubtotal =
        useMemo(() => {
            return normalizedServices.reduce(
                (
                    total,
                    service,
                ) => {
                    if (
                        !isServiceEligibleForOffer(
                            service,
                        )
                    ) {
                        return total;
                    }

                    return (
                        total +
                        getServicePrice(
                            service,
                        )
                    );
                },
                0,
            );
        }, [
            normalizedServices,
            normalizedOffer,
            isOfferValid,
        ]);


    /* ============================================================
       MINIMUM BOOKING AMOUNT
    ============================================================ */

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


    /* ============================================================
       DISCOUNT
    ============================================================ */

    const discountAmount =
        useMemo(() => {
            if (
                !normalizedOffer ||
                !isOfferValid ||
                !minimumBookingAmountMet ||
                eligibleSubtotal <= 0
            ) {
                return 0;
            }

            const discountValue =
                Number(
                    normalizedOffer.discountValue ||
                        0,
                );

            if (
                discountValue <= 0
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
                    ) / 100,
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


    /* ============================================================
       FINAL SERVICE TOTAL
    ============================================================ */

    const discountedServicesTotal =
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


    /* ============================================================
       OFFER APPLIED
    ============================================================ */

    const offerApplied =
        Boolean(
            normalizedOffer &&
                isOfferValid &&
                minimumBookingAmountMet &&
                discountAmount > 0,
        );


    /* ============================================================
       INDIVIDUAL SERVICE DISPLAY PRICE
    ============================================================ */

    const getServiceDisplayPrice =
        (
            service: Service,
        ) => {
            const originalPrice =
                getServicePrice(
                    service,
                );

            if (
                !offerApplied ||
                !isServiceEligibleForOffer(
                    service,
                )
            ) {
                return originalPrice;
            }

            const discountType =
                String(
                    normalizedOffer?.discountType ||
                        '',
                ).toUpperCase();

            if (
                discountType ===
                'PERCENTAGE'
            ) {
                const percentage =
                    Number(
                        normalizedOffer
                            ?.discountValue ||
                            0,
                    );

                const serviceDiscount =
                    (
                        originalPrice *
                        percentage
                    ) / 100;

                return Math.max(
                    0,
                    originalPrice -
                        serviceDiscount,
                );
            }

            if (
                discountType ===
                    'FIXED' &&
                eligibleSubtotal > 0
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


    /* ============================================================
       OFFER MESSAGE
    ============================================================ */

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
                return 'This offer is no longer active.';
            }

            if (
                !minimumBookingAmountMet &&
                normalizedOffer.minimumBookingAmount !==
                    null &&
                normalizedOffer.minimumBookingAmount !==
                    undefined
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
                offerApplied
            ) {
                return `You save ₹${discountAmount.toFixed(
                    0,
                )} with this offer.`;
            }

            return null;
        }, [
            normalizedOffer,
            isOfferValid,
            minimumBookingAmountMet,
            subtotal,
            offerApplied,
            discountAmount,
        ]);


    /* ============================================================
       DATE / BUSINESS HOURS
    ============================================================ */

    const selectedDateString =
        formatDate(
            selectedDate,
        );


    const pickerDateString =
        formatDate(
            pickerDate,
        );


    const selectedBusinessDay =
        useMemo(
            () =>
                getBusinessDay(
                    salon,
                    selectedDate,
                ),
            [
                salon,
                selectedDate,
            ],
        );


    const pickerBusinessDay =
        useMemo(
            () =>
                getBusinessDay(
                    salon,
                    pickerDate,
                ),
            [
                salon,
                pickerDate,
            ],
        );


    const pickerSalonIsOpen =
        Boolean(
            pickerBusinessDay &&
                pickerBusinessDay.isOpen !==
                    false,
        );


    const pickerOpeningMinutes =
        getOpeningMinutes(
            pickerBusinessDay,
        );


    const pickerClosingMinutes =
        getClosingMinutes(
            pickerBusinessDay,
        );


    /* ============================================================
       TIME SLOTS

       IMPORTANT:
       These are based ONLY on salon business hours.

       They do NOT check:
       - existing bookings
       - staff
       - employee slots
       - other customers
    ============================================================ */

    const allSlots =
        useMemo<Slot[]>(() => {
            if (
                !pickerSalonIsOpen ||
                pickerOpeningMinutes ===
                    null ||
                pickerClosingMinutes ===
                    null
            ) {
                return [];
            }

            const slots: Slot[] =
                [];

            const duration =
                totalDuration >
                0
                    ? totalDuration
                    : 30;

            const isToday =
                isSameDate(
                    pickerDate,
                    today,
                );

            const now =
                new Date();

            const nowMinutes =
                now.getHours() *
                    60 +
                now.getMinutes();

            for (
                let start =
                    pickerOpeningMinutes;

                start + duration <=
                    pickerClosingMinutes;

                start += 30
            ) {
                /*
                 * For today, don't offer
                 * times that have already started.
                 */
                if (
                    isToday &&
                    start <= nowMinutes
                ) {
                    continue;
                }

                slots.push({
                    id: `${pickerDateString}-${formatTime24(
                        start,
                    )}`,

                    time:
                        formatTime(
                            start,
                        ),

                    startTime:
                        formatTime24(
                            start,
                        ),
                });
            }

            return slots;
        }, [
            pickerSalonIsOpen,
            pickerOpeningMinutes,
            pickerClosingMinutes,
            totalDuration,
            pickerDate,
            pickerDateString,
            today,
        ]);


    const morningSlots =
        allSlots.filter(
            slot => {
                const minutes =
                    timeToMinutes(
                        slot.startTime,
                    ) || 0;

                return minutes <
                    12 * 60;
            },
        );


    const afternoonSlots =
        allSlots.filter(
            slot => {
                const minutes =
                    timeToMinutes(
                        slot.startTime,
                    ) || 0;

                return (
                    minutes >=
                        12 * 60 &&
                    minutes <
                        17 * 60
                );
            },
        );


    const eveningSlots =
        allSlots.filter(
            slot => {
                const minutes =
                    timeToMinutes(
                        slot.startTime,
                    ) || 0;

                return minutes >=
                    17 * 60;
            },
        );


    /* ============================================================
       OPEN PICKER
    ============================================================ */

    const openPicker =
        () => {
            setPickerDate(
                selectedDate,
            );

            setPickerTime(
                selectedTime,
            );

            setShowFullCalendar(
                false,
            );

            setShowPicker(true);
        };


    /* ============================================================
       CLOSE PICKER
    ============================================================ */

    const closePicker =
        () => {
            setShowPicker(
                false,
            );
        };


    /* ============================================================
       PICKER DATE CHANGE
    ============================================================ */

    const handlePickerDateChange =
        (
            dateString: string,
        ) => {
            const parsed =
                new Date(
                    `${dateString}T00:00:00`,
                );

            if (
                Number.isNaN(
                    parsed.getTime(),
                )
            ) {
                return;
            }

            setPickerDate(
                parsed,
            );

            /*
             * Changing date clears the
             * previously selected time.
             *
             * This prevents accidentally
             * carrying a time that isn't
             * available on the new day.
             */
            setPickerTime(
                null,
            );

            setShowFullCalendar(
                false,
            );
        };


    /* ============================================================
       DATE CHIP
    ============================================================ */

    const handleDateChipPress =
        (
            item: DateItem,
        ) => {
            setPickerDate(
                item.date,
            );

            setPickerTime(
                null,
            );
        };


    /* ============================================================
       TIME
    ============================================================ */

    const handleTimePress =
        (
            slot: Slot,
        ) => {
            setPickerTime(
                slot,
            );
        };


    /* ============================================================
       CONFIRM DATE/TIME
    ============================================================ */

    const handleConfirmPicker =
        () => {
            if (
                !pickerTime
            ) {
                Alert.alert(
                    'Select a time',
                    'Please select your preferred appointment time.',
                );

                return;
            }

            setSelectedDate(
                pickerDate,
            );

            setSelectedTime(
                pickerTime,
            );

            setShowPicker(
                false,
            );
        };


    /* ============================================================
       START TIME CONVERSION
    ============================================================ */

    const convertToBackendTime =
        (
            value: string,
        ) => {
            if (
                /^\d{2}:\d{2}$/.test(
                    value,
                )
            ) {
                return value;
            }

            const [
                clock,
                period,
            ] =
                value.split(' ');

            let [
                hour,
                minute,
            ] =
                clock.split(':');

            let h =
                parseInt(
                    hour,
                    10,
                );

            if (
                period === 'PM' &&
                h !== 12
            ) {
                h += 12;
            }

            if (
                period === 'AM' &&
                h === 12
            ) {
                h = 0;
            }

            return `${String(
                h,
            ).padStart(
                2,
                '0',
            )}:${minute}`;
        };


    /* ============================================================
       REQUEST BOOKING
    ============================================================ */

    const requestBooking =
        async () => {
            try {
                if (
                    !salonId &&
                    !salon?.salonId &&
                    !salon?.id
                ) {
                    Alert.alert(
                        'Unable to continue',
                        'Salon information is missing.',
                    );

                    return;
                }

                if (
                    !customerUserId
                ) {
                    Alert.alert(
                        'Unable to continue',
                        'Customer information is missing.',
                    );

                    return;
                }

                if (
                    normalizedServices.length ===
                    0
                ) {
                    Alert.alert(
                        'No services selected',
                        'Please select at least one service.',
                    );

                    return;
                }

                if (
                    !selectedTime
                ) {
                    Alert.alert(
                        'Select time',
                        'Please select your preferred appointment time.',
                    );

                    return;
                }


                const finalSalonId =
                    salonId ||
                    salon?.salonId ||
                    salon?.id;


                const bookingDate =
                    selectedDateString;


                const startTime =
                    convertToBackendTime(
                        selectedTime.startTime ||
                            selectedTime.time,
                    );


                const finalOfferId =
                    normalizedOffer
                        ?.offerId ||
                    normalizedOffer?.id ||
                    offer?.offerId ||
                    offer?.id;


                console.log(
                    '[Appointment] CREATE BOOKING:',
                    {
                        salonId:
                            finalSalonId,

                        customerUserId,

                        bookingDate,

                        startTime,

                        services:
                            normalizedServices.map(
                                service => ({
                                    serviceId:
                                        getServiceId(
                                            service,
                                        ),
                                }),
                            ),

                        offerId:
                            finalOfferId,

                        discountedServicesTotal,
                    },
                );


                /*
                 * IMPORTANT
                 *
                 * There is NO payment here.
                 *
                 * The booking is only a request.
                 *
                 * Salon must accept first.
                 *
                 * Only after acceptance:
                 * customer gets 15 minutes
                 * to pay ₹9.
                 */

                const response =
                    await createBooking({
                        variables: {
                            input: {
                                salonId:
                                    finalSalonId,

                                customerUserId,

                                bookingDate,

                                startTime,

                                paymentMethod:
                                    'PAY_AT_SALON',

                                services:
                                    normalizedServices.map(
                                        service => ({
                                            serviceId:
                                                getServiceId(
                                                    service,
                                                ),
                                        }),
                                    ),

                                notes: '',

                                ...(finalOfferId
                                    ? {
                                          offerId:
                                              finalOfferId,
                                      }
                                    : {}),
                            },
                        },
                    });


                console.log(
                    '[Appointment] CREATE BOOKING RESPONSE:',
                    response.data,
                );


                if (
                    response.data
                        ?.createBooking
                        ?.success
                ) {
                    const booking =
                        response.data
                            ?.createBooking
                            ?.booking;


                    /*
                     * Do NOT open payment here.
                     *
                     * Customer only waits for
                     * salon acceptance.
                     */

                    navigation.replace(
                        'BookingRequestSent',
                        {
                            booking,

                            bookingFee:
                                BOOKING_FEE,

                            serviceTotal:
                                discountedServicesTotal,

                            amountToPayNow:
                                BOOKING_FEE,

                            amountAtSalon:
                                discountedServicesTotal,

                            paymentStatus:
                                'WAITING_FOR_SALON_CONFIRMATION',

                            paymentWindowMinutes:
                                PAYMENT_WINDOW_MINUTES,
                        },
                    );

                    return;
                }


                Alert.alert(
                    response.data
                        ?.createBooking
                        ?.message ||
                        'Unable to send booking request.',
                );
            } catch (
                error: any
            ) {
                console.error(
                    '[Appointment] CREATE BOOKING ERROR:',
                    error,
                );

                Alert.alert(
                    'Unable to send request',
                    error?.message ||
                        'Something went wrong while sending your booking request.',
                );
            }
        };


    /* ============================================================
       SALON HOURS DISPLAY
    ============================================================ */

    const selectedOpening =
        getOpeningMinutes(
            selectedBusinessDay,
        );

    const selectedClosing =
        getClosingMinutes(
            selectedBusinessDay,
        );


    const selectedSalonIsOpen =
        Boolean(
            selectedBusinessDay &&
                selectedBusinessDay.isOpen !==
                    false,
        );


    /* ============================================================
       RENDER SLOT SECTION
    ============================================================ */

    const renderSlotSection =
        (
            title: string,
            slots: Slot[],
        ) => {
            if (
                slots.length === 0
            ) {
                return null;
            }

            return (
                <View
                    style={
                        styles.slotSection
                    }
                >
                    <Text
                        style={
                            styles.slotSectionTitle
                        }
                    >
                        {title}
                    </Text>

                    <View
                        style={
                            styles.slotGrid
                        }
                    >
                        {slots.map(
                            slot => {
                                const isSelected =
                                    pickerTime?.id ===
                                    slot.id;

                                return (
                                    <TouchableOpacity
                                        key={
                                            slot.id
                                        }
                                        activeOpacity={
                                            0.75
                                        }
                                        onPress={() =>
                                            handleTimePress(
                                                slot,
                                            )
                                        }
                                        style={[
                                            styles.timeChip,
                                            isSelected &&
                                                styles.timeChipSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.timeChipText,
                                                isSelected &&
                                                    styles.timeChipTextSelected,
                                            ]}
                                        >
                                            {
                                                slot.time
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                );
                            },
                        )}
                    </View>
                </View>
            );
        };


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            {/* ==================================================== */}
            {/* HEADER */}
            {/* ==================================================== */}

            <View
                style={
                    styles.header
                }
            >
                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                    activeOpacity={0.7}
                    style={
                        styles.backButton
                    }
                >
                    <Icon
                        name="arrow-back"
                        size={24}
                        color="#171717"
                    />
                </TouchableOpacity>

                <View
                    style={
                        styles.headerTextContainer
                    }
                >
                    <Text
                        style={
                            styles.headerTitle
                        }
                    >
                        Appointment
                    </Text>

                    <Text
                        style={
                            styles.headerSubtitle
                        }
                    >
                        Choose your preferred
                        date & time
                    </Text>
                </View>
            </View>


            {/* ==================================================== */}
            {/* CONTENT */}
            {/* ==================================================== */}

            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
            >
                <View
                    style={
                        styles.card
                    }
                >
                    <Text
                        style={
                            styles.salonName
                        }
                    >
                        {salon?.name ||
                            salon?.salonName ||
                            'Salon'}
                    </Text>

                    {(salon
                        ?.address
                        ?.addressLine ||
                        salon
                            ?.address
                            ?.city) && (
                        <Text
                            style={
                                styles.address
                            }
                        >
                            <Icon
                                name="location-outline"
                                size={15}
                                color="#777"
                            />{' '}
                            {salon
                                ?.address
                                ?.addressLine ||
                                ''}

                            {salon
                                ?.address
                                ?.city
                                ? `, ${salon.address.city}`
                                : ''}
                        </Text>
                    )}
                </View>


                {/* ================================================= */}
                {/* APPOINTMENT DATE/TIME */}
                {/* ================================================= */}

                <View
                    style={
                        styles.card
                    }
                >
                    <View
                        style={
                            styles.cardHeaderRow
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Appointment
                        </Text>

                        <TouchableOpacity
                            onPress={
                                openPicker
                            }
                            activeOpacity={0.7}
                        >
                            <Text
                                style={
                                    styles.changeText
                                }
                            >
                                Change
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={
                            styles.appointmentSummary
                        }
                    >
                        <View
                            style={
                                styles.appointmentSummaryIcon
                            }
                        >
                            <Icon
                                name="calendar-outline"
                                size={22}
                                color={
                                    PRIMARY
                                }
                            />
                        </View>

                        <View
                            style={
                                styles.appointmentSummaryContent
                            }
                        >
                            <Text
                                style={
                                    styles.appointmentSummaryDate
                                }
                            >
                                {selectedDate.toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday:
                                            'long',
                                        month:
                                            'long',
                                        day:
                                            'numeric',
                                        year:
                                            'numeric',
                                    },
                                )}
                            </Text>

                            <Text
                                style={
                                    styles.appointmentSummaryTime
                                }
                            >
                                {selectedTime
                                    ?.time ||
                                    'Select a preferred time'}
                            </Text>
                        </View>
                    </View>

                    {selectedSalonIsOpen &&
                        selectedOpening !==
                            null &&
                        selectedClosing !==
                            null && (
                            <Text
                                style={
                                    styles.hoursText
                                }
                            >
                                Salon hours:{' '}
                                {formatTime(
                                    selectedOpening,
                                )}{' '}
                                –{' '}
                                {formatTime(
                                    selectedClosing,
                                )}
                            </Text>
                        )}

                    {!selectedSalonIsOpen && (
                        <Text
                            style={
                                styles.closedText
                            }
                        >
                            Salon is closed on this
                            day.
                        </Text>
                    )}
                </View>


                {/* ================================================= */}
                {/* SELECTED SERVICES */}
                {/* ================================================= */}

                <View
                    style={
                        styles.servicesCard
                    }
                >
                    <View
                        style={
                            styles.cardHeaderRow
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Selected Services
                        </Text>

                        <Text
                            style={
                                styles.serviceCount
                            }
                        >
                            {
                                normalizedServices.length
                            }{' '}
                            {normalizedServices.length ===
                            1
                                ? 'service'
                                : 'services'}
                        </Text>
                    </View>


                    {normalizedServices.map(
                        (
                            service,
                            index,
                        ) => {
                            const originalPrice =
                                getServicePrice(
                                    service,
                                );

                            const displayPrice =
                                getServiceDisplayPrice(
                                    service,
                                );

                            const hasDiscount =
                                displayPrice <
                                originalPrice;

                            const eligible =
                                isServiceEligibleForOffer(
                                    service,
                                );

                            return (
                                <View
                                    key={`${getServiceId(
                                        service,
                                    )}-${index}`}
                                    style={[
                                        styles.serviceRow,
                                        index >
                                            0 &&
                                            styles.serviceRowBorder,
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
                                            {
                                                service.name
                                            }
                                        </Text>

                                        <Text
                                            style={
                                                styles.serviceDuration
                                            }
                                        >
                                            {
                                                getServiceDuration(
                                                    service,
                                                )
                                            }{' '}
                                            mins
                                        </Text>

                                        {offerApplied &&
                                            eligible && (
                                                <Text
                                                    style={
                                                        styles.offerAppliedSmall
                                                    }
                                                >
                                                    ✓ Offer
                                                    applied
                                                </Text>
                                            )}
                                    </View>

                                    <View
                                        style={
                                            styles.servicePriceContainer
                                        }
                                    >
                                        {hasDiscount && (
                                            <Text
                                                style={
                                                    styles.originalPrice
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
                                                hasDiscount &&
                                                    styles.discountedPrice,
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


                {/* ================================================= */}
                {/* OFFER */}
                {/* ================================================= */}

                {normalizedOffer && (
                    <View
                        style={
                            styles.offerCard
                        }
                    >
                        <View
                            style={
                                styles.offerIcon
                            }
                        >
                            <Icon
                                name="pricetag-outline"
                                size={19}
                                color={
                                    PRIMARY
                                }
                            />
                        </View>

                        <View
                            style={
                                styles.offerContent
                            }
                        >
                            <Text
                                style={
                                    styles.offerTitle
                                }
                            >
                                {normalizedOffer.title ||
                                    'Special Offer'}
                            </Text>

                            {offerMessage && (
                                <Text
                                    style={
                                        styles.offerMessage
                                    }
                                >
                                    {
                                        offerMessage
                                    }
                                </Text>
                            )}

                            {normalizedOffer.description && (
                                <Text
                                    style={
                                        styles.offerDescription
                                    }
                                >
                                    {
                                        normalizedOffer.description
                                    }
                                </Text>
                            )}
                        </View>

                        {offerApplied && (
                            <Text
                                style={
                                    styles.offerDiscount
                                }
                            >
                                -₹
                                {discountAmount.toFixed(
                                    0,
                                )}
                            </Text>
                        )}
                    </View>
                )}


                {/* ================================================= */}
                {/* DURATION */}
                {/* ================================================= */}

                <View
                    style={
                        styles.card
                    }
                >
                    <View
                        style={
                            styles.simpleRow
                        }
                    >
                        <View>
                            <Text
                                style={
                                    styles.sectionTitleSmall
                                }
                            >
                                Total Duration
                            </Text>

                            <Text
                                style={
                                    styles.mutedText
                                }
                            >
                                Combined duration of
                                selected services
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.durationValue
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
                {/* PAYMENT SUMMARY */}
                {/* ================================================= */}

                <View
                    style={
                        styles.card
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Payment
                    </Text>


                    {/* SERVICES */}

                    <View
                        style={
                            styles.paymentRow
                        }
                    >
                        <View>
                            <Text
                                style={
                                    styles.paymentLabel
                                }
                            >
                                Services
                            </Text>

                            {offerApplied && (
                                <Text
                                    style={
                                        styles.paymentSubLabel
                                    }
                                >
                                    After discount
                                </Text>
                            )}
                        </View>

                        <View
                            style={
                                styles.paymentPriceContainer
                            }
                        >
                            {offerApplied && (
                                <Text
                                    style={
                                        styles.paymentOriginalPrice
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
                                    styles.paymentAmount
                                }
                            >
                                ₹
                                {discountedServicesTotal.toFixed(
                                    0,
                                )}
                            </Text>
                        </View>
                    </View>


                    {/* DISCOUNT */}

                    {offerApplied && (
                        <View
                            style={
                                styles.paymentRow
                            }
                        >
                            <Text
                                style={
                                    styles.discountLabel
                                }
                            >
                                Offer Discount
                            </Text>

                            <Text
                                style={
                                    styles.discountValue
                                }
                            >
                                -₹
                                {discountAmount.toFixed(
                                    0,
                                )}
                            </Text>
                        </View>
                    )}


                    {!offerApplied &&
                        normalizedOffer &&
                        !minimumBookingAmountMet && (
                            <Text
                                style={
                                    styles.minimumAmountText
                                }
                            >
                                This offer cannot be
                                applied because the
                                minimum booking amount
                                has not been met.
                            </Text>
                        )}


                    <View
                        style={
                            styles.divider
                        }
                    />


                    {/* BOOKING FEE */}

                    <View
                        style={
                            styles.bookingFeeRow
                        }
                    >
                        <View
                            style={
                                styles.bookingFeeInfo
                            }
                        >
                            <Text
                                style={
                                    styles.bookingFeeTitle
                                }
                            >
                                Clavata booking fee
                            </Text>

                            <Text
                                style={
                                    styles.bookingFeeSubtitle
                                }
                            >
                                ₹{BOOKING_FEE} paid only
                                after salon accepts
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.bookingFeeAmount
                            }
                        >
                            ₹{BOOKING_FEE}
                        </Text>
                    </View>


                    {/* SALON PAYMENT */}

                    <View
                        style={
                            styles.salonPaymentBox
                        }
                    >
                        <View
                            style={
                                styles.salonPaymentIcon
                            }
                        >
                            <Icon
                                name="storefront-outline"
                                size={20}
                                color={
                                    PRIMARY
                                }
                            />
                        </View>

                        <View
                            style={{
                                flex: 1,
                            }}
                        >
                            <Text
                                style={
                                    styles.salonPaymentTitle
                                }
                            >
                                Remaining amount at salon
                            </Text>

                            <Text
                                style={
                                    styles.salonPaymentText
                                }
                            >
                                ₹
                                {discountedServicesTotal.toFixed(
                                    0,
                                )}{' '}
                                will be paid directly
                                to the salon.
                            </Text>
                        </View>
                    </View>


                    {/* SAVINGS */}

                    {offerApplied && (
                        <Text
                            style={
                                styles.savingsText
                            }
                        >
                            You save ₹
                            {discountAmount.toFixed(
                                0,
                            )}{' '}
                            with this offer.
                        </Text>
                    )}
                </View>


                {/* ================================================= */}
                {/* HOW IT WORKS */}
                {/* ================================================= */}

                <View
                    style={
                        styles.howItWorksCard
                    }
                >
                    <Text
                        style={
                            styles.howItWorksTitle
                        }
                    >
                        How your booking works
                    </Text>


                    <View
                        style={
                            styles.stepRow
                        }
                    >
                        <View
                            style={
                                styles.stepCircle
                            }
                        >
                            <Text
                                style={
                                    styles.stepNumber
                                }
                            >
                                1
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.stepText
                            }
                        >
                            Send your booking request
                            with your preferred date
                            and time.
                        </Text>
                    </View>


                    <View
                        style={
                            styles.stepRow
                        }
                    >
                        <View
                            style={
                                styles.stepCircle
                            }
                        >
                            <Text
                                style={
                                    styles.stepNumber
                                }
                            >
                                2
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.stepText
                            }
                        >
                            The salon reviews and
                            accepts or rejects your
                            request.
                        </Text>
                    </View>


                    <View
                        style={
                            styles.stepRow
                        }
                    >
                        <View
                            style={
                                styles.stepCircle
                            }
                        >
                            <Text
                                style={
                                    styles.stepNumber
                                }
                            >
                                3
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.stepText
                            }
                        >
                            If accepted, you get 15
                            minutes to pay the ₹
                            {BOOKING_FEE} Clavata
                            booking fee.
                        </Text>
                    </View>


                    <View
                        style={[
                            styles.stepRow,
                            {
                                marginBottom: 0,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.stepCircle
                            }
                        >
                            <Text
                                style={
                                    styles.stepNumber
                                }
                            >
                                4
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.stepText
                            }
                        >
                            Pay the remaining ₹
                            {discountedServicesTotal.toFixed(
                                0,
                            )}{' '}
                            directly at the salon.
                        </Text>
                    </View>
                </View>


                {/* ================================================= */}
                {/* FINAL INFO */}
                {/* ================================================= */}

                <View
                    style={
                        styles.finalInfo
                    }
                >
                    <Icon
                        name="information-circle-outline"
                        size={19}
                        color="#777"
                    />

                    <Text
                        style={
                            styles.finalInfoText
                        }
                    >
                        No payment is required now.
                        Your request will be sent to
                        the salon first.
                    </Text>
                </View>


                {/* ================================================= */}
                {/* REQUEST BUTTON */}
                {/* ================================================= */}

                <TouchableOpacity
                    style={[
                        styles.requestButton,
                        creatingBooking &&
                            styles.requestButtonDisabled,
                    ]}
                    disabled={
                        creatingBooking
                    }
                    onPress={
                        requestBooking
                    }
                    activeOpacity={0.85}
                >
                    {creatingBooking ? (
                        <>
                            <ActivityIndicator
                                color="#FFF"
                                size="small"
                            />

                            <Text
                                style={
                                    styles.requestButtonText
                                }
                            >
                                Sending request...
                            </Text>
                        </>
                    ) : (
                        <>
                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text
                                    style={
                                        styles.requestButtonText
                                    }
                                >
                                    Request Booking
                                </Text>

                                <Text
                                    style={
                                        styles.requestButtonSubText
                                    }
                                >
                                    No payment required yet
                                </Text>
                            </View>

                            <Icon
                                name="arrow-forward"
                                size={24}
                                color="#FFF"
                            />
                        </>
                    )}
                </TouchableOpacity>


                <View
                    style={{
                        height: 30,
                    }}
                />
            </ScrollView>


            {/* ==================================================== */}
            {/* COMBINED DATE + TIME BOTTOM SHEET */}
            {/* ==================================================== */}

            <Modal
                visible={
                    showPicker
                }
                transparent
                animationType="slide"
                onRequestClose={
                    closePicker
                }
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={[
                            styles.bottomSheet,
                            {
                                maxHeight:
                                    SCREEN_HEIGHT *
                                    0.92,
                            },
                        ]}
                    >
                        {/* ========================================= */}
                        {/* SHEET HEADER */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.sheetHeader
                            }
                        >
                            <View>
                                <Text
                                    style={
                                        styles.sheetTitle
                                    }
                                >
                                    Select date & time
                                </Text>

                                <Text
                                    style={
                                        styles.sheetSubtitle
                                    }
                                >
                                    Choose your preferred
                                    appointment time
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={
                                    closePicker
                                }
                                style={
                                    styles.closeButton
                                }
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name="close"
                                    size={22}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>


                        <ScrollView
                            showsVerticalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.sheetContent
                            }
                        >
                            {/* ===================================== */}
                            {/* CURRENT SELECTION */}
                            {/* ===================================== */}

                            <View
                                style={
                                    styles.selectedSummary
                                }
                            >
                                <View
                                    style={
                                        styles.selectedSummaryIcon
                                    }
                                >
                                    <Icon
                                        name="calendar-outline"
                                        size={20}
                                        color={
                                            PRIMARY
                                        }
                                    />
                                </View>

                                <View
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    <Text
                                        style={
                                            styles.selectedSummaryLabel
                                        }
                                    >
                                        Selected
                                    </Text>

                                    <Text
                                        style={
                                            styles.selectedSummaryValue
                                        }
                                    >
                                        {pickerDate.toLocaleDateString(
                                            'en-US',
                                            {
                                                weekday:
                                                    'long',
                                                month:
                                                    'short',
                                                day:
                                                    'numeric',
                                            },
                                        )}

                                        {pickerTime
                                            ? ` • ${pickerTime.time}`
                                            : ''}
                                    </Text>
                                </View>
                            </View>


                            {/* ===================================== */}
                            {/* CALENDAR TOGGLE */}
                            {/* ===================================== */}

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() =>
                                    setShowFullCalendar(
                                        value =>
                                            !value,
                                    )
                                }
                                style={
                                    styles.calendarToggle
                                }
                            >
                                <Icon
                                    name="calendar"
                                    size={18}
                                    color={
                                        PRIMARY
                                    }
                                />

                                <Text
                                    style={
                                        styles.calendarToggleText
                                    }
                                >
                                    {showFullCalendar
                                        ? 'Hide calendar'
                                        : 'Choose from calendar'}
                                </Text>

                                <Icon
                                    name={
                                        showFullCalendar
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                    }
                                    size={18}
                                    color="#666"
                                />
                            </TouchableOpacity>


                            {/* ===================================== */}
                            {/* FULL CALENDAR */}
                            {/* ===================================== */}

                            {showFullCalendar && (
                                <View
                                    style={
                                        styles.calendarContainer
                                    }
                                >
                                    <Calendar
                                        current={
                                            pickerDateString
                                        }

                                        minDate={
                                            formatDate(
                                                today,
                                            )
                                        }

                                        maxDate={
                                            formatDate(
                                                futureDates[
                                                    futureDates.length -
                                                        1
                                                ].date,
                                            )
                                        }

                                        markedDates={{
                                            [pickerDateString]:
                                                {
                                                    selected:
                                                        true,

                                                    selectedColor:
                                                        PRIMARY,

                                                    selectedTextColor:
                                                        '#fff',
                                                },
                                        }}

                                        onDayPress={day =>
                                            handlePickerDateChange(
                                                day.dateString,
                                            )
                                        }

                                        theme={{
                                            todayTextColor:
                                                PRIMARY,

                                            arrowColor:
                                                PRIMARY,

                                            textDayFontSize:
                                                14,

                                            textMonthFontSize:
                                                16,

                                            textDayHeaderFontSize:
                                                12,
                                        }}
                                    />
                                </View>
                            )}


                            {/* ===================================== */}
                            {/* DATE CHIPS */}
                            {/* ===================================== */}

                            <Text
                                style={
                                    styles.sheetSectionTitle
                                }
                            >
                                Date
                            </Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={
                                    false
                                }
                                contentContainerStyle={{
                                    paddingRight: 10,
                                }}
                            >
                                {futureDates
                                    .slice(
                                        0,
                                        14,
                                    )
                                    .map(
                                        item => {
                                            const selected =
                                                pickerDateString ===
                                                item.dateString;

                                            return (
                                                <TouchableOpacity
                                                    key={
                                                        item.dateString
                                                    }
                                                    activeOpacity={
                                                        0.75
                                                    }
                                                    onPress={() =>
                                                        handleDateChipPress(
                                                            item,
                                                        )
                                                    }
                                                    style={[
                                                        styles.dateChip,
                                                        selected &&
                                                            styles.dateChipSelected,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.dateChipDay,
                                                            selected &&
                                                                styles.dateChipDaySelected,
                                                        ]}
                                                    >
                                                        {
                                                            item.dayName
                                                        }
                                                    </Text>

                                                    <Text
                                                        style={[
                                                            styles.dateChipNumber,
                                                            selected &&
                                                                styles.dateChipNumberSelected,
                                                        ]}
                                                    >
                                                        {
                                                            item.dayNumber
                                                        }
                                                    </Text>

                                                    <Text
                                                        style={[
                                                            styles.dateChipMonth,
                                                            selected &&
                                                                styles.dateChipMonthSelected,
                                                        ]}
                                                    >
                                                        {
                                                            item.month
                                                        }
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        },
                                    )}
                            </ScrollView>


                            {/* ===================================== */}
                            {/* SALON HOURS */}
                            {/* ===================================== */}

                            {pickerSalonIsOpen &&
                                pickerOpeningMinutes !==
                                    null &&
                                pickerClosingMinutes !==
                                    null && (
                                    <View
                                        style={
                                            styles.hoursBox
                                        }
                                    >
                                        <Icon
                                            name="time-outline"
                                            size={18}
                                            color={
                                                PRIMARY
                                            }
                                        />

                                        <Text
                                            style={
                                                styles.hoursBoxText
                                            }
                                        >
                                            Salon hours:{' '}
                                            {formatTime(
                                                pickerOpeningMinutes,
                                            )}{' '}
                                            –{' '}
                                            {formatTime(
                                                pickerClosingMinutes,
                                            )}
                                        </Text>
                                    </View>
                                )}


                            {/* ===================================== */}
                            {/* TIME */}
                            {/* ===================================== */}

                            <Text
                                style={
                                    styles.sheetSectionTitle
                                }
                            >
                                Preferred time
                            </Text>


                            {!pickerSalonIsOpen ? (
                                <View
                                    style={
                                        styles.closedBox
                                    }
                                >
                                    <Icon
                                        name="calendar-outline"
                                        size={25}
                                        color="#999"
                                    />

                                    <Text
                                        style={
                                            styles.closedTitle
                                        }
                                    >
                                        Salon is closed
                                    </Text>

                                    <Text
                                        style={
                                            styles.closedMessage
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
                                        styles.closedBox
                                    }
                                >
                                    <Icon
                                        name="time-outline"
                                        size={25}
                                        color="#999"
                                    />

                                    <Text
                                        style={
                                            styles.closedTitle
                                        }
                                    >
                                        No times available
                                    </Text>

                                    <Text
                                        style={
                                            styles.closedMessage
                                        }
                                    >
                                        Please choose another
                                        date.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {renderSlotSection(
                                        'Morning',
                                        morningSlots,
                                    )}

                                    {renderSlotSection(
                                        'Afternoon',
                                        afternoonSlots,
                                    )}

                                    {renderSlotSection(
                                        'Evening',
                                        eveningSlots,
                                    )}
                                </>
                            )}
                        </ScrollView>


                        {/* ========================================= */}
                        {/* SHEET FOOTER */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.sheetFooter
                            }
                        >
                            <View
                                style={
                                    styles.sheetSelectionFooter
                                }
                            >
                                <Text
                                    style={
                                        styles.sheetFooterLabel
                                    }
                                >
                                    Your selection
                                </Text>

                                <Text
                                    style={
                                        styles.sheetFooterValue
                                    }
                                >
                                    {pickerDate.toLocaleDateString(
                                        'en-US',
                                        {
                                            month:
                                                'short',
                                            day:
                                                'numeric',
                                        },
                                    )}

                                    {pickerTime
                                        ? ` • ${pickerTime.time}`
                                        : ' • Select time'}
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={
                                    0.85
                                }
                                onPress={
                                    handleConfirmPicker
                                }
                                disabled={
                                    !pickerTime
                                }
                                style={[
                                    styles.confirmPickerButton,
                                    !pickerTime &&
                                        styles.confirmPickerDisabled,
                                ]}
                            >
                                <Text
                                    style={
                                        styles.confirmPickerText
                                    }
                                >
                                    Confirm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}


/* ================================================================
   STYLES
================================================================ */

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor:
                '#F5F6FA',
        },

        /* ========================================================
           HEADER
        ======================================================== */

        header: {
            flexDirection:
                'row',
            alignItems:
                'center',
            paddingHorizontal:
                8,
            paddingTop:
                4,
            paddingBottom:
                10,
            backgroundColor:
                '#FFF',
        },

        backButton: {
            width: 44,
            height: 44,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        headerTextContainer: {
            flex: 1,
            paddingLeft: 4,
        },

        headerTitle: {
            fontSize: 24,
            fontWeight:
                '800',
            color:
                '#171717',
        },

        headerSubtitle: {
            marginTop: 2,
            fontSize: 13,
            color:
                '#777',
        },

        /* ========================================================
           CONTENT
        ======================================================== */

        content: {
            paddingTop: 14,
            paddingBottom: 30,
        },

        /* ========================================================
           REQUEST INFO
        ======================================================== */

        requestInfoCard: {
            marginHorizontal: 15,
            marginBottom: 15,
            padding: 16,
            borderRadius: 16,
            backgroundColor:
                '#EAF8F3',
            borderWidth: 1,
            borderColor:
                '#B9E5D5',
            flexDirection:
                'row',
        },

        requestInfoIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor:
                PRIMARY,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight: 12,
        },

        requestInfoContent: {
            flex: 1,
        },

        requestInfoTitle: {
            fontSize: 16,
            fontWeight:
                '800',
            color:
                '#176B53',
        },

        requestInfoText: {
            marginTop: 5,
            fontSize: 13,
            lineHeight: 19,
            color:
                '#39705F',
        },

        /* ========================================================
           CARD
        ======================================================== */

        card: {
            marginHorizontal: 15,
            marginBottom: 15,
            padding: 18,
            borderRadius: 14,
            backgroundColor:
                '#FFF',
        },

        salonName: {
            fontSize: 20,
            fontWeight:
                '800',
            color:
                '#171717',
        },

        address: {
            marginTop: 8,
            color:
                '#666',
            fontSize: 13,
            lineHeight: 20,
        },

        cardHeaderRow: {
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
        },

        sectionTitle: {
            fontSize: 18,
            fontWeight:
                '700',
            color:
                '#171717',
        },

        changeText: {
            color:
                PRIMARY,
            fontSize: 14,
            fontWeight:
                '700',
        },

        /* ========================================================
           APPOINTMENT
        ======================================================== */

        appointmentSummary: {
            marginTop: 14,
            padding: 14,
            borderRadius: 13,
            backgroundColor:
                '#F7FAFA',
            borderWidth: 1,
            borderColor:
                '#E1EEEE',
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        appointmentSummaryIcon: {
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor:
                '#EAF8F3',
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight: 12,
        },

        appointmentSummaryContent: {
            flex: 1,
        },

        appointmentSummaryDate: {
            fontSize: 15,
            fontWeight:
                '700',
            color:
                '#222',
        },

        appointmentSummaryTime: {
            marginTop: 4,
            fontSize: 14,
            color:
                PRIMARY,
            fontWeight:
                '700',
        },

        hoursText: {
            marginTop: 10,
            fontSize: 12,
            color:
                '#777',
        },

        closedText: {
            marginTop: 10,
            color:
                '#B45F00',
            fontSize: 12,
            fontWeight:
                '600',
        },

        /* ========================================================
           SERVICES
        ======================================================== */

        servicesCard: {
            marginHorizontal: 15,
            marginBottom: 15,
            padding: 18,
            borderRadius: 14,
            backgroundColor:
                '#FFF',
        },

        serviceCount: {
            fontSize: 13,
            fontWeight:
                '600',
            color:
                '#777',
        },

        serviceRow: {
            paddingVertical: 14,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
        },

        serviceRowBorder: {
            borderTopWidth: 1,
            borderTopColor:
                '#EEEEEE',
        },

        serviceInfo: {
            flex: 1,
            paddingRight: 12,
        },

        serviceName: {
            fontSize: 16,
            fontWeight:
                '700',
            color:
                '#222',
        },

        serviceDuration: {
            marginTop: 4,
            fontSize: 13,
            color:
                '#777',
        },

        offerAppliedSmall: {
            marginTop: 4,
            fontSize: 11,
            fontWeight:
                '700',
            color:
                PRIMARY,
        },

        servicePriceContainer: {
            alignItems:
                'flex-end',
        },

        originalPrice: {
            fontSize: 12,
            color:
                '#999',
            textDecorationLine:
                'line-through',
        },

        servicePrice: {
            marginTop: 2,
            fontSize: 17,
            fontWeight:
                '800',
            color:
                '#222',
        },

        discountedPrice: {
            color:
                PRIMARY,
        },

        /* ========================================================
           OFFER
        ======================================================== */

        offerCard: {
            marginHorizontal: 15,
            marginBottom: 15,
            padding: 15,
            borderRadius: 14,
            backgroundColor:
                '#EAF8F3',
            borderWidth: 1,
            borderColor:
                '#B9E5D5',
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        offerIcon: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor:
                '#FFF',
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight: 10,
        },

        offerContent: {
            flex: 1,
        },

        offerTitle: {
            fontSize: 15,
            fontWeight:
                '800',
            color:
                PRIMARY,
        },

        offerMessage: {
            marginTop: 4,
            fontSize: 12,
            color:
                '#39705F',
        },

        offerDescription: {
            marginTop: 4,
            fontSize: 12,
            color:
                '#666',
        },

        offerDiscount: {
            marginLeft: 10,
            fontSize: 17,
            fontWeight:
                '800',
            color:
                PRIMARY,
        },

        /* ========================================================
           DURATION
        ======================================================== */

        simpleRow: {
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
        },

        sectionTitleSmall: {
            fontSize: 16,
            fontWeight:
                '700',
            color:
                '#171717',
        },

        mutedText: {
            marginTop: 4,
            fontSize: 12,
            color:
                '#777',
        },

        durationValue: {
            fontSize: 17,
            fontWeight:
                '800',
            color:
                PRIMARY,
        },

        /* ========================================================
           PAYMENT
        ======================================================== */

        paymentRow: {
            marginVertical: 7,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
        },

        paymentLabel: {
            fontSize: 15,
            fontWeight:
                '500',
            color:
                '#222',
        },

        paymentSubLabel: {
            marginTop: 2,
            fontSize: 11,
            color:
                '#888',
        },

        paymentPriceContainer: {
            alignItems:
                'flex-end',
        },

        paymentOriginalPrice: {
            fontSize: 12,
            color:
                '#999',
            textDecorationLine:
                'line-through',
        },

        paymentAmount: {
            marginTop: 2,
            fontSize: 16,
            fontWeight:
                '800',
            color:
                '#222',
        },

        discountLabel: {
            fontWeight:
                '600',
            color:
                PRIMARY,
        },

        discountValue: {
            fontWeight:
                '700',
            color:
                PRIMARY,
        },

        minimumAmountText: {
            marginTop: 8,
            color:
                '#B06A00',
            fontSize: 12,
            lineHeight: 18,
        },

        divider: {
            height: 1,
            backgroundColor:
                '#EEEEEE',
            marginVertical: 14,
        },

        bookingFeeRow: {
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
        },

        bookingFeeInfo: {
            flex: 1,
            paddingRight: 10,
        },

        bookingFeeTitle: {
            fontSize: 16,
            fontWeight:
                '700',
            color:
                '#222',
        },

        bookingFeeSubtitle: {
            marginTop: 3,
            fontSize: 12,
            lineHeight: 17,
            color:
                '#777',
        },

        bookingFeeAmount: {
            fontSize: 18,
            fontWeight:
                '800',
            color:
                PRIMARY,
        },

        salonPaymentBox: {
            marginTop: 15,
            padding: 13,
            borderRadius: 12,
            backgroundColor:
                '#F7F7F7',
            borderWidth: 1,
            borderColor:
                '#E7E7E7',
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        salonPaymentIcon: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor:
                '#FFF',
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight: 10,
        },

        salonPaymentTitle: {
            fontSize: 14,
            fontWeight:
                '700',
            color:
                '#222',
        },

        salonPaymentText: {
            marginTop: 3,
            fontSize: 12,
            lineHeight: 17,
            color:
                '#666',
        },

        savingsText: {
            marginTop: 12,
            fontSize: 13,
            fontWeight:
                '700',
            color:
                '#16845E',
        },

        /* ========================================================
           HOW IT WORKS
        ======================================================== */

        howItWorksCard: {
            marginHorizontal: 15,
            marginBottom: 15,
            padding: 16,
            borderRadius: 14,
            backgroundColor:
                '#F8FAFA',
            borderWidth: 1,
            borderColor:
                '#E5EEEE',
        },

        howItWorksTitle: {
            marginBottom: 12,
            fontSize: 15,
            fontWeight:
                '800',
            color:
                '#222',
        },

        stepRow: {
            flexDirection:
                'row',
            alignItems:
                'flex-start',
            marginBottom: 11,
        },

        stepCircle: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor:
                PRIMARY,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight: 10,
        },

        stepNumber: {
            fontSize: 12,
            fontWeight:
                '800',
            color:
                '#FFF',
        },

        stepText: {
            flex: 1,
            paddingTop: 2,
            fontSize: 12,
            lineHeight: 18,
            color:
                '#666',
        },

        finalInfo: {
            marginHorizontal: 20,
            marginBottom: 14,
            flexDirection:
                'row',
            alignItems:
                'flex-start',
        },

        finalInfoText: {
            flex: 1,
            marginLeft: 7,
            fontSize: 12,
            lineHeight: 18,
            color:
                '#777',
        },

        /* ========================================================
           REQUEST BUTTON
        ======================================================== */

        requestButton: {
            marginHorizontal: 20,
            minHeight: 64,
            paddingHorizontal: 20,
            borderRadius: 18,
            backgroundColor:
                PRIMARY,
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
        },

        requestButtonDisabled: {
            opacity:
                0.65,
        },

        requestButtonText: {
            fontSize: 17,
            fontWeight:
                '800',
            color:
                '#FFF',
        },

        requestButtonSubText: {
            marginTop: 3,
            fontSize: 12,
            color:
                '#E7FFFA',
        },

        /* ========================================================
           MODAL
        ======================================================== */

        modalOverlay: {
            flex: 1,
            backgroundColor:
                'rgba(0,0,0,0.35)',
            justifyContent:
                'flex-end',
        },

        bottomSheet: {
            width: '100%',
            backgroundColor:
                '#FFF',
            borderTopLeftRadius:
                26,
            borderTopRightRadius:
                26,
            overflow:
                'hidden',
        },

        sheetHeader: {
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 14,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            alignItems:
                'center',
            borderBottomWidth: 1,
            borderBottomColor:
                '#EEEEEE',
        },

        sheetTitle: {
            fontSize: 20,
            fontWeight:
                '800',
            color:
                '#171717',
        },

        sheetSubtitle: {
            marginTop: 3,
            fontSize: 12,
            color:
                '#777',
        },

        closeButton: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor:
                '#F4F4F4',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        sheetContent: {
            paddingHorizontal: 20,
            paddingTop: 15,
            paddingBottom: 20,
        },

        /* ========================================================
           SELECTED SUMMARY
        ======================================================== */

        selectedSummary: {
            padding: 13,
            borderRadius: 13,
            backgroundColor:
                '#F7FAFA',
            borderWidth: 1,
            borderColor:
                '#E1EEEE',
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        selectedSummaryIcon: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor:
                '#EAF8F3',
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight: 10,
        },

        selectedSummaryLabel: {
            fontSize: 11,
            color:
                '#888',
        },

        selectedSummaryValue: {
            marginTop: 2,
            fontSize: 14,
            fontWeight:
                '700',
            color:
                '#222',
        },

        /* ========================================================
           CALENDAR
        ======================================================== */

        calendarToggle: {
            marginTop: 12,
            paddingVertical: 11,
            paddingHorizontal: 13,
            borderRadius: 11,
            backgroundColor:
                '#FFF',
            borderWidth: 1,
            borderColor:
                '#DDDDDD',
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        calendarToggleText: {
            flex: 1,
            marginLeft: 8,
            fontSize: 13,
            fontWeight:
                '600',
            color:
                '#333',
        },

        calendarContainer: {
            marginTop: 10,
            borderRadius: 13,
            overflow:
                'hidden',
            borderWidth: 1,
            borderColor:
                '#EEEEEE',
        },

        /* ========================================================
           SHEET DATE
        ======================================================== */

        sheetSectionTitle: {
            marginTop: 18,
            marginBottom: 10,
            fontSize: 15,
            fontWeight:
                '800',
            color:
                '#222',
        },

        dateChip: {
            width: 68,
            height: 78,
            marginRight: 9,
            borderRadius: 13,
            backgroundColor:
                '#F7F7F7',
            borderWidth: 1,
            borderColor:
                '#E5E5E5',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        dateChipSelected: {
            backgroundColor:
                PRIMARY,
            borderColor:
                PRIMARY,
        },

        dateChipDay: {
            fontSize: 11,
            fontWeight:
                '600',
            color:
                '#777',
        },

        dateChipDaySelected: {
            color:
                '#DFFFFA',
        },

        dateChipNumber: {
            marginTop: 4,
            fontSize: 21,
            fontWeight:
                '800',
            color:
                '#222',
        },

        dateChipNumberSelected: {
            color:
                '#FFF',
        },

        dateChipMonth: {
            marginTop: 2,
            fontSize: 10,
            color:
                '#888',
        },

        dateChipMonthSelected: {
            color:
                '#E7FFFA',
        },

        /* ========================================================
           HOURS
        ======================================================== */

        hoursBox: {
            marginTop: 14,
            padding: 11,
            borderRadius: 11,
            backgroundColor:
                '#F7FAFA',
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        hoursBoxText: {
            marginLeft: 8,
            fontSize: 12,
            color:
                '#666',
        },

        /* ========================================================
           TIME SLOTS
        ======================================================== */

        slotSection: {
            marginTop: 4,
        },

        slotSectionTitle: {
            marginBottom: 8,
            fontSize: 12,
            fontWeight:
                '700',
            color:
                '#888',
        },

        slotGrid: {
            flexDirection:
                'row',
            flexWrap:
                'wrap',
        },

        timeChip: {
            minWidth: 92,
            marginRight: 8,
            marginBottom: 8,
            paddingVertical: 11,
            paddingHorizontal: 10,
            borderRadius: 11,
            backgroundColor:
                '#FFF',
            borderWidth: 1,
            borderColor:
                '#DDDDDD',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        timeChipSelected: {
            backgroundColor:
                PRIMARY,
            borderColor:
                PRIMARY,
        },

        timeChipText: {
            fontSize: 13,
            fontWeight:
                '600',
            color:
                '#333',
        },

        timeChipTextSelected: {
            color:
                '#FFF',
            fontWeight:
                '800',
        },

        /* ========================================================
           CLOSED
        ======================================================== */

        closedBox: {
            marginTop: 5,
            padding: 25,
            borderRadius: 13,
            backgroundColor:
                '#F7F7F7',
            alignItems:
                'center',
        },

        closedTitle: {
            marginTop: 8,
            fontSize: 15,
            fontWeight:
                '700',
            color:
                '#444',
        },

        closedMessage: {
            marginTop: 4,
            fontSize: 12,
            color:
                '#888',
        },

        /* ========================================================
           SHEET FOOTER
        ======================================================== */

        sheetFooter: {
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 18,
            borderTopWidth: 1,
            borderTopColor:
                '#EEEEEE',
            flexDirection:
                'row',
            alignItems:
                'center',
            backgroundColor:
                '#FFF',
        },

        sheetSelectionFooter: {
            flex: 1,
            paddingRight: 12,
        },

        sheetFooterLabel: {
            fontSize: 11,
            color:
                '#888',
        },

        sheetFooterValue: {
            marginTop: 3,
            fontSize: 14,
            fontWeight:
                '700',
            color:
                '#222',
        },

        confirmPickerButton: {
            minWidth: 110,
            height: 48,
            borderRadius: 13,
            backgroundColor:
                PRIMARY,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal: 18,
        },

        confirmPickerDisabled: {
            backgroundColor:
                '#C8D5D3',
        },

        confirmPickerText: {
            color:
                '#FFF',
            fontSize: 14,
            fontWeight:
                '800',
        },
    });