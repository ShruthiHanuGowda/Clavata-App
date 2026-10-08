import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import {
  useApolloClient,
} from '@apollo/client';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import HomeHeader from './HomeHeader';
import ServiceChips from './ServiceChips';
import LocationBottomSheet from './LocationBottomSheet';
import ReviewPopup from './ReviewPopup';

import {
  getActiveLocation,
  getCurrentLocation,
  LocationData,
} from '../../../services/locationStorage';

import {
  DEFAULT_LOCATION_RADIUS,
  USE_HARDCODED_LOCATION,
} from '../../../constants/locationConfig';

import {
  CUSTOMER_BOOKINGS,
} from '../../../graphql/queries';

import {
  useUser,
} from '../../../context/UserContext';

import {
  COLORS,
  SPACING,
} from '../../../constants/constants';

// ============================================================
// TYPES
// ============================================================

type ServiceAudience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

type Booking = {
  bookingId: string;
  salonId: string;
  customerUserId: string;
  customerName: string;
  salonName: string;

  bookingStatus: string;
  salonResponseStatus?: string;

  salonResponseDeadline?: string | null;
  bookingFeePaymentDeadline?: string | null;

  bookingFeeStatus?: string | null;
  paymentStatus?: string | null;

  bookingFee?: number | null;
  remainingAmount?: number | null;
  totalAmount?: number | null;

  bookingDate?: string;
  startTime?: string;
  endTime?: string;

  reviewSubmitted?: boolean;
};

type BudgetOption = {
  label: string;
  min: number;
  max: number;
};

type ServiceSelection = {
  categoryId: string;
  category: string;
  subcategoryIds: string[];

  audienceSubcategorySelections?: Array<{
    audience: ServiceAudience;
    subcategoryIds: string[];
  }>;
};

// ============================================================
// AUDIENCE
// ============================================================

const AUDIENCE_OPTIONS: {
  value: ServiceAudience;
  label: string;
}[] = [
  {
    value: 'FEMALE',
    label: 'Female',
  },
  {
    value: 'MALE',
    label: 'Male',
  },
  {
    value: 'KIDS',
    label: 'Kids',
  },
];

// ============================================================
// BUDGET
// ============================================================

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    label: 'Any',
    min: 0,
    max: Infinity,
  },
  {
    label: 'Under ₹500',
    min: 0,
    max: 499.99,
  },
  {
    label: '₹500 – ₹1K',
    min: 500,
    max: 1000,
  },
  {
    label: '₹1K – ₹2K',
    min: 1000.01,
    max: 2000,
  },
  {
    label: '₹2K+',
    min: 2000.01,
    max: Infinity,
  },
];

// ============================================================
// DISTANCE
// ============================================================

const DISTANCE_OPTIONS = [
  2,
  5,
  10,
  15,
  25,
];

// ============================================================
// BOOKING HELPERS
// ============================================================

const TERMINAL_BOOKING_STATUSES = [
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
];

/**
 * Returns true when the backend deadline has passed.
 *
 * This does NOT change the booking status.
 * It is only a UI guard so an expired countdown
 * cannot continue displaying an active card.
 */
const hasDeadlineExpired = (
  deadline?: string | null,
  now: number = Date.now(),
): boolean => {
  if (!deadline) {
    return false;
  }

  const deadlineTime =
    new Date(deadline).getTime();

  if (!Number.isFinite(deadlineTime)) {
    return false;
  }

  return deadlineTime <= now;
};

/**
 * Determines whether a booking should be considered
 * active for the Home screen.
 *
 * IMPORTANT:
 * This function does not mutate the booking.
 *
 * Backend remains the source of truth for the actual
 * booking status.
 *
 * The deadline checks are only a presentation guard
 * so the Home card disappears as soon as its timer expires.
 */
const isActiveBooking = (
  booking: Booking,
  now: number = Date.now(),
): boolean => {
  const bookingStatus =
    String(
      booking?.bookingStatus || '',
    ).toUpperCase();

  const responseStatus =
    String(
      booking?.salonResponseStatus || '',
    ).toUpperCase();

  const feeStatus =
    String(
      booking?.bookingFeeStatus || '',
    ).toUpperCase();

  const paymentStatus =
    String(
      booking?.paymentStatus || '',
    ).toUpperCase();

  // ----------------------------------------------------------
  // Terminal backend statuses
  // ----------------------------------------------------------

  if (
    TERMINAL_BOOKING_STATUSES.includes(
      bookingStatus,
    )
  ) {
    return false;
  }

  // ----------------------------------------------------------
  // Rejected / expired response
  // ----------------------------------------------------------

  if (
    responseStatus === 'REJECTED' ||
    responseStatus === 'EXPIRED'
  ) {
    return false;
  }

  // ----------------------------------------------------------
  // WAITING FOR SALON
  // ----------------------------------------------------------

  if (
    bookingStatus === 'PENDING' &&
    (
      responseStatus === '' ||
      responseStatus === 'PENDING'
    )
  ) {
    /*
     * If the salon response deadline has passed,
     * do not keep showing this booking as active.
     *
     * Backend should separately change it to EXPIRED.
     */
    if (
      hasDeadlineExpired(
        booking.salonResponseDeadline,
        now,
      )
    ) {
      return false;
    }

    return true;
  }

  // ----------------------------------------------------------
  // SALON ACCEPTED / PAYMENT REQUIRED
  // ----------------------------------------------------------

  if (
    responseStatus === 'ACCEPTED' &&
    feeStatus !== 'PAID' &&
    paymentStatus !== 'PAID'
  ) {
    /*
     * The salon accepted, so the customer has the
     * payment window.
     *
     * Once the payment deadline expires, the booking
     * should no longer appear as active.
     */
    if (
      hasDeadlineExpired(
        booking.bookingFeePaymentDeadline,
        now,
      )
    ) {
      return false;
    }

    return true;
  }

  // ----------------------------------------------------------
  // CONFIRMED
  // ----------------------------------------------------------

  if (
    bookingStatus === 'CONFIRMED'
  ) {
    /*
     * If the booking is CONFIRMED and already paid,
     * it remains active until terminal completion/cancellation.
     */
    if (
      feeStatus === 'PAID' ||
      paymentStatus === 'PAID'
    ) {
      return true;
    }

    /*
     * CONFIRMED but unpaid means the customer is
     * still within the ₹9 payment window.
     */
    if (
      hasDeadlineExpired(
        booking.bookingFeePaymentDeadline,
        now,
      )
    ) {
      return false;
    }

    return true;
  }

  // ----------------------------------------------------------
  // FALLBACK
  // ----------------------------------------------------------

  return false;
};

// ============================================================
// COUNTDOWN
// ============================================================

const getBookingCountdown = (
  deadline?: string | null,
  now: number = Date.now(),
): string | null => {
  if (!deadline) {
    return null;
  }

  const deadlineTime =
    new Date(deadline).getTime();

  if (
    !Number.isFinite(deadlineTime)
  ) {
    return null;
  }

  const remainingMilliseconds =
    deadlineTime - now;

  if (
    remainingMilliseconds <= 0
  ) {
    return '00:00';
  }

  const totalSeconds =
    Math.floor(
      remainingMilliseconds / 1000,
    );

  const minutes =
    Math.floor(
      totalSeconds / 60,
    );

  const seconds =
    totalSeconds % 60;

  return (
    `${String(minutes).padStart(2, '0')}:` +
    `${String(seconds).padStart(2, '0')}`
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function HomeScreenPage() {
  const client =
    useApolloClient();

  const navigation =
    useNavigation<any>();

  const {
    currentUser,
  } = useUser();

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState('');

  // ==========================================================
  // AUDIENCE
  // ==========================================================

  const [
    selectedAudiences,
    setSelectedAudiences,
  ] = useState<ServiceAudience[]>([]);

  // ==========================================================
  // CATEGORY / SUBCATEGORY
  // ==========================================================

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('');

  const [
    selectedSubcategoryIds,
    setSelectedSubcategoryIds,
  ] = useState<string[]>([]);

  const [
    selectedAudienceSubcategorySelections,
    setSelectedAudienceSubcategorySelections,
  ] = useState<
    Array<{
      audience: ServiceAudience;
      subcategoryIds: string[];
    }>
  >([]);

  // ==========================================================
  // LOCATION
  // ==========================================================

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(
    'Choose location',
  );

  const [
    locationCoordinates,
    setLocationCoordinates,
  ] = useState<LocationData | null>(
    null,
  );

  const [
    showLocationModal,
    setShowLocationModal,
  ] = useState(false);

  // ==========================================================
  // DISTANCE
  // ==========================================================

  const [
    selectedDistance,
    setSelectedDistance,
  ] = useState(
    DEFAULT_LOCATION_RADIUS || 10,
  );

  // ==========================================================
  // BUDGET
  // ==========================================================

  const [
    selectedBudget,
    setSelectedBudget,
  ] = useState<BudgetOption>(
    BUDGET_OPTIONS[0],
  );

  // ==========================================================
  // REVIEW
  // ==========================================================

  const [
    showReviewPopup,
    setShowReviewPopup,
  ] = useState(false);

  const [
    pendingBooking,
    setPendingBooking,
  ] = useState<Booking | null>(
    null,
  );

  // ==========================================================
  // ACTIVE BOOKING
  // ==========================================================

  const [
    activeBooking,
    setActiveBooking,
  ] = useState<Booking | null>(
    null,
  );

  // ==========================================================
  // CURRENT TIME
  // ==========================================================

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    Date.now(),
  );

  // ==========================================================
  // LIVE COUNTDOWN CLOCK
  // ==========================================================

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          Date.now(),
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ==========================================================
  // INITIAL LOCATION
  // ==========================================================

  const loadLocation =
    useCallback(
      async () => {
        try {
          const savedLocation =
            await getActiveLocation();

          if (
            savedLocation &&
            savedLocation.latitude != null &&
            savedLocation.longitude != null
          ) {
            setSelectedLocation(
              savedLocation.address ||
                'Selected location',
            );

            setLocationCoordinates(
              savedLocation,
            );

            return;
          }

          if (
            USE_HARDCODED_LOCATION
          ) {
            const activeLocation =
              await getActiveLocation();

            if (
              activeLocation &&
              activeLocation.latitude != null &&
              activeLocation.longitude != null
            ) {
              setSelectedLocation(
                activeLocation.address ||
                  'Selected location',
              );

              setLocationCoordinates(
                activeLocation,
              );

              return;
            }
          }

          const currentLocation =
            await getCurrentLocation();

          if (
            currentLocation &&
            currentLocation.latitude != null &&
            currentLocation.longitude != null
          ) {
            setSelectedLocation(
              currentLocation.address ||
                'Current location',
            );

            setLocationCoordinates(
              currentLocation,
            );

            return;
          }

          setSelectedLocation(
            'Choose location',
          );

          setLocationCoordinates(
            null,
          );
        } catch (error) {
          console.log(
            '❌ LOAD LOCATION ERROR:',
            error,
          );

          setSelectedLocation(
            'Choose location',
          );

          setLocationCoordinates(
            null,
          );
        }
      },
      [],
    );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadLocation();
  }, [
    loadLocation,
  ]);

  // ==========================================================
  // LOAD CUSTOMER BOOKINGS
  // ==========================================================

  const loadCustomerBookings =
    useCallback(
      async () => {
        if (
          !currentUser?.userId
        ) {
          setActiveBooking(null);
          return;
        }

        try {
          const {
            data,
          } = await client.query({
            query:
              CUSTOMER_BOOKINGS,

            variables: {
              customerUserId:
                currentUser.userId,
            },

            fetchPolicy:
              'network-only',
          });

          const customerBookings:
            Booking[] =
            data?.customerBookings || [];

          console.log(
            '🏠 CUSTOMER BOOKINGS:',
            JSON.stringify(
              customerBookings,
              null,
              2,
            ),
          );

          // --------------------------------------------------
          // ACTIVE BOOKING
          // --------------------------------------------------

          const now =
            Date.now();

          const active =
            customerBookings.find(
              booking =>
                isActiveBooking(
                  booking,
                  now,
                ),
            ) || null;

          setActiveBooking(
            active,
          );

          // --------------------------------------------------
          // REVIEW
          // --------------------------------------------------

          const bookingForReview =
            customerBookings.find(
              booking =>
                String(
                  booking.bookingStatus ||
                    '',
                ).toUpperCase() ===
                  'COMPLETED' &&
                booking.reviewSubmitted ===
                  false,
            );

          if (
            bookingForReview
          ) {
            setPendingBooking(
              bookingForReview,
            );

            setShowReviewPopup(
              true,
            );
          }
        } catch (error) {
          console.log(
            '❌ BOOKING LOADING ERROR:',
            error,
          );
        }
      },
      [
        client,
        currentUser?.userId,
      ],
    );

  // ==========================================================
  // REFRESH WHEN HOME GETS FOCUS
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      loadCustomerBookings();
    }, [
      loadCustomerBookings,
    ]),
  );

  // ==========================================================
  // EXPIRED DEADLINE REFRESH
  //
  // When the countdown reaches zero:
  //
  // 1. UI immediately hides the card through the deadline guard.
  // 2. Backend is refreshed.
  // 3. A second refresh is performed after 3 seconds in case
  //    the backend expiry worker/Lambda runs slightly later.
  //
  // We NEVER locally set bookingStatus = EXPIRED.
  // ==========================================================

  useEffect(() => {
    if (!activeBooking) {
      return;
    }

    const bookingStatus =
      String(
        activeBooking.bookingStatus || '',
      ).toUpperCase();

    const responseStatus =
      String(
        activeBooking.salonResponseStatus || '',
      ).toUpperCase();

    const feeStatus =
      String(
        activeBooking.bookingFeeStatus || '',
      ).toUpperCase();

    const paymentStatus =
      String(
        activeBooking.paymentStatus || '',
      ).toUpperCase();

    let deadline:
      string | null = null;

    // --------------------------------------------------------
    // Waiting for salon
    // --------------------------------------------------------

    if (
      bookingStatus === 'PENDING' &&
      (
        responseStatus === '' ||
        responseStatus === 'PENDING'
      )
    ) {
      deadline =
        activeBooking.salonResponseDeadline ||
        null;
    }

    // --------------------------------------------------------
    // Salon accepted / payment required
    // --------------------------------------------------------

    if (
      responseStatus === 'ACCEPTED' &&
      feeStatus !== 'PAID' &&
      paymentStatus !== 'PAID'
    ) {
      deadline =
        activeBooking.bookingFeePaymentDeadline ||
        null;
    }

    // --------------------------------------------------------
    // Confirmed but unpaid
    // --------------------------------------------------------

    if (
      bookingStatus === 'CONFIRMED' &&
      feeStatus !== 'PAID' &&
      paymentStatus !== 'PAID'
    ) {
      deadline =
        activeBooking.bookingFeePaymentDeadline ||
        null;
    }

    if (!deadline) {
      return;
    }

    const deadlineTime =
      new Date(deadline).getTime();

    if (
      !Number.isFinite(deadlineTime)
    ) {
      return;
    }

    /*
     * Do nothing until the actual backend deadline
     * has been reached.
     */
    if (
      deadlineTime > Date.now()
    ) {
      return;
    }

    let cancelled = false;

    const refreshAfterExpiry =
      async () => {
        try {
          await loadCustomerBookings();

          if (cancelled) {
            return;
          }

          /*
           * Backend expiry may be processed asynchronously.
           * Give it a few seconds and check again.
           */
          setTimeout(() => {
            if (!cancelled) {
              loadCustomerBookings();
            }
          }, 3000);
        } catch (error) {
          console.log(
            '❌ EXPIRY REFRESH ERROR:',
            error,
          );
        }
      };

    refreshAfterExpiry();

    return () => {
      cancelled = true;
    };
  }, [
    activeBooking?.bookingId,
    activeBooking?.bookingStatus,
    activeBooking?.salonResponseStatus,
    activeBooking?.bookingFeeStatus,
    activeBooking?.paymentStatus,
    activeBooking?.salonResponseDeadline,
    activeBooking?.bookingFeePaymentDeadline,
    loadCustomerBookings,
  ]);

  // ==========================================================
  // ACTIVE BOOKING DISPLAY
  // ==========================================================

  const getActiveBookingDisplay =
    useCallback(() => {
      if (!activeBooking) {
        return null;
      }

      const bookingStatus =
        String(
          activeBooking.bookingStatus || '',
        ).toUpperCase();

      const responseStatus =
        String(
          activeBooking.salonResponseStatus || '',
        ).toUpperCase();

      const feeStatus =
        String(
          activeBooking.bookingFeeStatus || '',
        ).toUpperCase();

      const paymentStatus =
        String(
          activeBooking.paymentStatus || '',
        ).toUpperCase();

      // ======================================================
      // BACKEND TERMINAL GUARD
      // ======================================================

      if (
        TERMINAL_BOOKING_STATUSES.includes(
          bookingStatus,
        )
      ) {
        return null;
      }

      if (
        responseStatus === 'REJECTED' ||
        responseStatus === 'EXPIRED'
      ) {
        return null;
      }

      // ======================================================
      // SALON ACCEPTED
      //
      // Customer must pay fixed ₹9 booking fee.
      // ======================================================

      if (
        responseStatus === 'ACCEPTED' &&
        feeStatus !== 'PAID' &&
        paymentStatus !== 'PAID'
      ) {
        const deadline =
          activeBooking.bookingFeePaymentDeadline;

        /*
         * If the payment deadline has passed,
         * immediately stop rendering the active card.
         *
         * We do NOT change booking status locally.
         */
        if (
          hasDeadlineExpired(
            deadline,
            currentTime,
          )
        ) {
          return null;
        }

        const countdown =
          getBookingCountdown(
            deadline,
            currentTime,
          );

        if (!countdown) {
          return null;
        }

        return {
          status:
            'Salon accepted your request',

          countdown,

          timerLabel:
            'PAY ₹9 BOOKING FEE • PAYMENT TIME LEFT',

          showTimer:
            true,

          timerExpired:
            false,

          type:
            'payment' as const,
        };
      }

      // ======================================================
      // WAITING FOR SALON
      // ======================================================

      if (
        bookingStatus === 'PENDING' &&
        (
          responseStatus === 'PENDING' ||
          responseStatus === ''
        )
      ) {
        const deadline =
          activeBooking.salonResponseDeadline;

        /*
         * If the salon response deadline has passed,
         * immediately hide the card.
         */
        if (
          hasDeadlineExpired(
            deadline,
            currentTime,
          )
        ) {
          return null;
        }

        const countdown =
          getBookingCountdown(
            deadline,
            currentTime,
          );

        if (!countdown) {
          return null;
        }

        return {
          status:
            'Waiting for salon to confirm',

          countdown,

          timerLabel:
            'SALON RESPONSE TIME LEFT',

          showTimer:
            true,

          timerExpired:
            false,

          type:
            'pending' as const,
        };
      }

      // ======================================================
      // CONFIRMED / PAID
      // ======================================================

      if (
        bookingStatus === 'CONFIRMED' ||
        feeStatus === 'PAID' ||
        paymentStatus === 'PAID'
      ) {
        return {
          status:
            'Booking confirmed',

          subtitle:
            'Your appointment is confirmed',

          countdown:
            null,

          timerLabel:
            '',

          showTimer:
            false,

          timerExpired:
            false,

          type:
            'confirmed' as const,
        };
      }

      // ======================================================
      // FALLBACK
      // ======================================================

      return {
        status:
          'Booking in progress',

        subtitle:
          'Tap to view your booking',

        countdown:
          null,

        timerLabel:
          '',

        showTimer:
          false,

        timerExpired:
          false,

        type:
          'pending' as const,
      };
    }, [
      activeBooking,
      currentTime,
    ]);

  const activeBookingDisplay =
    getActiveBookingDisplay();

  // ==========================================================
  // OPEN BOOKING
  // ==========================================================

  const handleOpenActiveBooking =
    useCallback(() => {
      navigation.navigate(
        'Bookings',
      );
    }, [
      navigation,
    ]);

  // ==========================================================
  // LOCATION SELECTED
  // ==========================================================

  const handleLocationSelected =
    (
      location: LocationData,
    ) => {
      setSelectedLocation(
        location.address ||
          'Selected location',
      );

      setLocationCoordinates(
        location,
      );

      setShowLocationModal(
        false,
      );
    };

  // ==========================================================
  // AUDIENCE
  // ==========================================================

  const handleAudienceChange =
    (
      audience: ServiceAudience,
    ) => {
      setSelectedAudiences(
        previous => {
          if (
            previous.includes(
              audience,
            )
          ) {
            return previous.filter(
              item =>
                item !== audience,
            );
          }

          return [
            ...previous,
            audience,
          ];
        },
      );

      setSelectedCategoryId('');
      setSelectedCategory('');
      setSelectedSubcategoryIds([]);
      setSelectedAudienceSubcategorySelections([]);
    };

  // ==========================================================
  // SEARCH TEXT
  // ==========================================================

  const handleSearchChange =
    (
      text: string,
    ) => {
      setSearch(text);

      if (
        text.trim().length > 0
      ) {
        setSelectedCategoryId('');
        setSelectedCategory('');
        setSelectedSubcategoryIds([]);
        setSelectedAudienceSubcategorySelections([]);

        setSelectedBudget(
          BUDGET_OPTIONS[0],
        );
      }
    };

  // ==========================================================
  // SERVICE SELECTION
  // ==========================================================

  const handleServiceSelection =
    (
      selection: ServiceSelection,
    ) => {
      const normalizedCategoryId =
        String(
          selection?.categoryId ?? '',
        ).trim();

      const normalizedCategory =
        String(
          selection?.category ?? '',
        ).trim();

      const normalizedSubcategoryIds =
        Array.from(
          new Set(
            Array.isArray(
              selection?.subcategoryIds,
            )
              ? selection.subcategoryIds
                  .map(id =>
                    String(
                      id ?? '',
                    ).trim(),
                  )
                  .filter(Boolean)
              : [],
          ),
        );

      const normalizedAudienceSubcategorySelections =
        Array.isArray(
          selection?.audienceSubcategorySelections,
        )
          ? selection
              .audienceSubcategorySelections
              .filter(
                item =>
                  item &&
                  (
                    item.audience === 'FEMALE' ||
                    item.audience === 'MALE' ||
                    item.audience === 'KIDS'
                  ),
              )
              .map(item => ({
                audience:
                  item.audience,

                subcategoryIds:
                  Array.from(
                    new Set(
                      Array.isArray(
                        item.subcategoryIds,
                      )
                        ? item.subcategoryIds
                            .map(id =>
                              String(
                                id ?? '',
                              ).trim(),
                            )
                            .filter(Boolean)
                        : [],
                    ),
                  ),
              }))
              .filter(
                item =>
                  item.subcategoryIds
                    .length > 0,
              )
          : [];

      setSelectedCategoryId(
        normalizedCategoryId,
      );

      setSelectedCategory(
        normalizedCategory,
      );

      setSelectedSubcategoryIds(
        normalizedSubcategoryIds,
      );

      setSelectedAudienceSubcategorySelections(
        normalizedAudienceSubcategorySelections,
      );

      setSearch('');
    };

  // ==========================================================
  // FINAL SEARCH
  // ==========================================================

  const handleFinalSearch =
    () => {
      if (
        !locationCoordinates ||
        locationCoordinates.latitude == null ||
        locationCoordinates.longitude == null
      ) {
        Alert.alert(
          'Choose location',
          'Please select your location before searching.',
          [
            {
              text: 'Choose location',
              onPress: () =>
                setShowLocationModal(
                  true,
                ),
            },
          ],
        );

        return;
      }

      if (
        selectedAudiences.length === 0
      ) {
        Alert.alert(
          'Select audience',
          'Please select who the service is for.',
        );

        return;
      }

      const cleanSearch =
        search.trim();

      const hasService =
        selectedCategoryId.trim()
          .length > 0;

      const hasSearch =
        cleanSearch.length > 0;

      if (
        !hasService &&
        !hasSearch
      ) {
        Alert.alert(
          'Select a service',
          'Please select a service or search for a salon/service.',
        );

        return;
      }

      navigation.navigate(
        'SalonSearchResults',
        {
          latitude:
            Number(
              locationCoordinates.latitude,
            ),

          longitude:
            Number(
              locationCoordinates.longitude,
            ),

          radius:
            Number(
              selectedDistance,
            ),

          search:
            hasSearch
              ? cleanSearch
              : '',

          audiences:
            selectedAudiences,

          categoryId:
            hasService
              ? selectedCategoryId
              : '',

          category:
            selectedCategory,

          subcategoryIds:
            hasService
              ? selectedSubcategoryIds
              : [],

          minPrice:
            hasService &&
            selectedBudget.label !==
              'Any'
              ? selectedBudget.min
              : undefined,

          maxPrice:
            hasService &&
            selectedBudget.label !==
              'Any' &&
            selectedBudget.max !==
              Infinity
              ? selectedBudget.max
              : undefined,

          budgetLabel:
            selectedBudget.label,

          location:
            selectedLocation,
        },
      );
    };

  // ==========================================================
  // CLAVATA MATCH
  // ==========================================================

  const askClavata =
    () => {
      navigation.navigate(
        'ClavataMatch',
        {
          service:
            selectedCategory.trim() ||
            undefined,

          categoryId:
            selectedCategoryId.trim() ||
            undefined,

          subcategoryIds:
            selectedSubcategoryIds.length >
            0
              ? selectedSubcategoryIds
              : undefined,

          audience:
            selectedAudiences.length >
            0
              ? selectedAudiences
              : undefined,

          location:
            locationCoordinates,

          minBudget:
            selectedBudget.min,

          maxBudget:
            selectedBudget.max,

          distance:
            selectedDistance,
        },
      );
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <HomeHeader
          location={
            selectedLocation
          }
          onPressLocation={() =>
            setShowLocationModal(
              true,
            )
          }
        />

        {/* ==================================================
            ACTIVE BOOKING
        ================================================== */}

        {activeBooking &&
          activeBookingDisplay && (
            <TouchableOpacity
              style={
                styles.bookingCard
              }
              onPress={
                handleOpenActiveBooking
              }
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Open active booking"
            >
              {/* ------------------------------------------
                  BOOKING HEADER
              ------------------------------------------ */}

              <View
                style={
                  styles.bookingTop
                }
              >
                <View
                  style={
                    styles.bookingInfo
                  }
                >
                  <Text
                    style={
                      styles.bookingSalonName
                    }
                    numberOfLines={1}
                  >
                    {activeBooking.salonName ||
                      'Salon'}
                  </Text>

                  <Text
                    style={
                      styles.bookingStatus
                    }
                    numberOfLines={2}
                  >
                    {
                      activeBookingDisplay.status
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.bookingChevron
                  }
                >
                  ›
                </Text>
              </View>

              {/* ------------------------------------------
                  TIMER
              ------------------------------------------ */}

              {activeBookingDisplay.showTimer &&
                activeBookingDisplay.countdown && (
                  <View
                    style={
                      styles.timerContainer
                    }
                  >
                    <Text
                      style={
                        styles.timerValue
                      }
                    >
                      {
                        activeBookingDisplay.countdown
                      }
                    </Text>

                    <Text
                      style={
                        styles.timerLabel
                      }
                      numberOfLines={2}
                    >
                      {
                        activeBookingDisplay.timerLabel
                      }
                    </Text>
                  </View>
                )}

              {/* ------------------------------------------
                  CONFIRMED
              ------------------------------------------ */}

              {!activeBookingDisplay.showTimer &&
                activeBookingDisplay.type ===
                  'confirmed' && (
                  <Text
                    style={
                      styles.bookingSubtitle
                    }
                    numberOfLines={1}
                  >
                    {
                      activeBookingDisplay.subtitle
                    }
                  </Text>
                )}
            </TouchableOpacity>
          )}

        {/* ==================================================
            SEARCH
        ================================================== */}

        <View
          style={
            styles.searchSection
          }
        >
          <View
            style={
              styles.searchBox
            }
          >
            <Text
              style={
                styles.searchSymbol
              }
            >
              ⌕
            </Text>

            <TextInput
              value={search}
              onChangeText={
                handleSearchChange
              }
              placeholder="Search salons or services"
              placeholderTextColor={
                COLORS.textMuted
              }
              style={
                styles.searchInput
              }
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* ==================================================
            AUDIENCE
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Who is the service for?
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Select one or more
          </Text>

          <View
            style={
              styles.audienceRow
            }
          >
            {AUDIENCE_OPTIONS.map(
              option => {
                const selected =
                  selectedAudiences.includes(
                    option.value,
                  );

                return (
                  <TouchableOpacity
                    key={
                      option.value
                    }
                    style={[
                      styles.audienceChip,
                      selected &&
                        styles.audienceChipSelected,
                    ]}
                    onPress={() =>
                      handleAudienceChange(
                        option.value,
                      )
                    }
                    activeOpacity={
                      0.8
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selected && (
                        <Text
                          style={
                            styles.checkmark
                          }
                        >
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.audienceText,
                        selected &&
                          styles.audienceTextSelected,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* ==================================================
            SERVICE
        ================================================== */}

        {selectedAudiences.length >
          0 && (
          <View
            style={
              styles.serviceSection
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Choose a service
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Services are filtered for your selected audience
            </Text>

            <ServiceChips
              selectedCategoryId={
                selectedCategoryId
              }
              selectedCategory={
                selectedCategory
              }
              selectedSubcategoryIds={
                selectedSubcategoryIds
              }
              selectedAudienceSubcategorySelections={
                selectedAudienceSubcategorySelections
              }
              selectedAudiences={
                selectedAudiences
              }
              onSelect={
                handleServiceSelection
              }
            />
          </View>
        )}

        {/* ==================================================
            DISTANCE
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.labelRow
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Distance
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                How far should we search?
              </Text>
            </View>

            <Text
              style={
                styles.selectedValue
              }
            >
              {selectedDistance} km
            </Text>
          </View>

          <View
            style={
              styles.distanceRow
            }
          >
            {DISTANCE_OPTIONS.map(
              distance => {
                const selected =
                  selectedDistance ===
                  distance;

                return (
                  <TouchableOpacity
                    key={
                      distance
                    }
                    style={[
                      styles.distanceOption,
                      selected &&
                        styles.distanceOptionSelected,
                    ]}
                    onPress={() =>
                      setSelectedDistance(
                        distance,
                      )
                    }
                    activeOpacity={
                      0.8
                    }
                  >
                    <Text
                      style={[
                        styles.distanceNumber,
                        selected &&
                          styles.distanceNumberSelected,
                      ]}
                    >
                      {
                        distance
                      }
                    </Text>

                    <Text
                      style={[
                        styles.distanceUnit,
                        selected &&
                          styles.distanceUnitSelected,
                      ]}
                    >
                      km
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* ==================================================
            BUDGET
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Budget
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Select your preferred service price
          </Text>

          <View
            style={
              styles.budgetRow
            }
          >
            {BUDGET_OPTIONS.map(
              option => {
                const selected =
                  selectedBudget.label ===
                  option.label;

                const disabled =
                  option.label !==
                    'Any' &&
                  selectedCategoryId
                    .trim()
                    .length ===
                    0;

                return (
                  <TouchableOpacity
                    key={
                      option.label
                    }
                    disabled={
                      disabled
                    }
                    style={[
                      styles.budgetOption,
                      selected &&
                        styles.budgetOptionSelected,
                      disabled &&
                        styles.budgetOptionDisabled,
                    ]}
                    onPress={() =>
                      setSelectedBudget(
                        option,
                      )
                    }
                    activeOpacity={
                      0.8
                    }
                  >
                    <Text
                      style={[
                        styles.budgetText,
                        selected &&
                          styles.budgetTextSelected,
                        disabled &&
                          styles.budgetTextDisabled,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {selectedCategoryId
            .trim()
            .length === 0 && (
            <Text
              style={
                styles.budgetHint
              }
            >
              Select a service first to use a budget filter.
            </Text>
          )}
        </View>

        {/* ==================================================
            SEARCH SUMMARY
        ================================================== */}

        <View
          style={
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.summaryTitle
            }
          >
            Your search
          </Text>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              For
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {selectedAudiences.length >
              0
                ? selectedAudiences
                    .map(
                      audience => {
                        if (
                          audience ===
                          'FEMALE'
                        ) {
                          return 'Female';
                        }

                        if (
                          audience ===
                          'MALE'
                        ) {
                          return 'Male';
                        }

                        return 'Kids';
                      },
                    )
                    .join(', ')
                : 'Not selected'}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Service
            </Text>

            <Text
              style={
                styles.summaryValue
              }
              numberOfLines={
                2
              }
            >
              {selectedCategory ||
                search.trim() ||
                'Not selected'}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Distance
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {selectedDistance} km
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Budget
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                selectedBudget.label
              }
            </Text>
          </View>
        </View>

        {/* ==================================================
            SEARCH BUTTON
        ================================================== */}

        <TouchableOpacity
          style={
            styles.searchButton
          }
          onPress={
            handleFinalSearch
          }
          activeOpacity={
            0.85
          }
        >
          <Text
            style={
              styles.searchButtonText
            }
          >
            Search
          </Text>

          <Text
            style={
              styles.searchButtonArrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        {/* ==================================================
            CLAVATA MATCH
        ================================================== */}

        <TouchableOpacity
          style={
            styles.clavataCard
          }
          onPress={
            askClavata
          }
          activeOpacity={
            0.85
          }
        >
          <View
            style={
              styles.clavataBody
            }
          >
            <Text
              style={
                styles.clavataTitle
              }
            >
              Let Clavata choose
            </Text>

            <Text
              style={
                styles.clavataText
              }
            >
              Find the best match for you
            </Text>
          </View>

          <Text
            style={
              styles.clavataArrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <LocationBottomSheet
        visible={
          showLocationModal
        }
        onClose={() =>
          setShowLocationModal(
            false,
          )
        }
        onLocationSelected={
          handleLocationSelected
        }
      />

      {/* ======================================================
          REVIEW
      ====================================================== */}

      <ReviewPopup
        visible={
          showReviewPopup
        }
        salonName={
          pendingBooking?.salonName
        }
        onRate={() => {
          setShowReviewPopup(
            false,
          );

          navigation.navigate(
            'Bookings',
            {
              screen:
                'RateReview',

              params: {
                booking:
                  pendingBooking,
              },
            },
          );
        }}
        onLater={() => {
          setShowReviewPopup(
            false,
          );
        }}
      />
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    content: {
      paddingBottom: 30,
    },

    // ========================================================
    // ACTIVE BOOKING CARD
    // ========================================================

    bookingCard: {
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 14,

      padding: 14,

      borderRadius: 18,

      backgroundColor:
        '#F7F3FF',

      borderWidth: 1,
      borderColor:
        '#E8DFFF',

      shadowColor:
        '#6F4BB8',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.06,

      shadowRadius: 8,

      elevation: 2,
    },

    bookingTop: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    bookingInfo: {
      flex: 1,
      minWidth: 0,
    },

    bookingSalonName: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.black,
    },

    bookingStatus: {
      marginTop: 3,

      fontSize: 11,
      fontWeight: '600',

      color:
        COLORS.themeColor,
    },

    bookingChevron: {
      marginLeft: 8,

      fontSize: 24,
      lineHeight: 26,

      color:
        COLORS.themeColor,

      fontWeight: '400',
    },

    // ========================================================
    // TIMER
    // ========================================================

    timerContainer: {
      marginTop: 10,

      paddingVertical: 10,
      paddingHorizontal: 12,

      borderRadius: 12,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,
      borderColor:
        '#ECE6F7',

      alignItems:
        'center',
    },

    timerValue: {
      fontSize: 27,

      lineHeight: 31,

      fontWeight: '800',

      color:
        COLORS.themeColor,

      fontVariant: [
        'tabular-nums',
      ],

      letterSpacing: 1,
    },

    timerLabel: {
      marginTop: 1,

      fontSize: 8,

      lineHeight: 11,

      fontWeight: '800',

      letterSpacing: 0.9,

      color:
        '#8A7BA5',

      textAlign:
        'center',
    },

    // ========================================================
    // CONFIRMED BOOKING
    // ========================================================

    bookingSubtitle: {
      marginTop: 8,

      fontSize: 10,

      color:
        '#70677F',

      fontWeight: '500',
    },

    // ========================================================
    // SEARCH
    // ========================================================

    searchSection: {
      marginHorizontal:
        SPACING.xl,

      marginTop: 4,

      marginBottom: 22,
    },

    searchBox: {
      height: 54,

      borderRadius: 14,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        '#E2E2E2',

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 15,
    },

    searchSymbol: {
      fontSize: 25,

      color:
        COLORS.themeColor,

      marginRight: 8,

      fontWeight: '300',
    },

    searchInput: {
      flex: 1,

      height: '100%',

      fontSize: 15,

      color:
        COLORS.black,

      paddingVertical: 0,
    },

    // ========================================================
    // SECTIONS
    // ========================================================

    section: {
      marginHorizontal:
        SPACING.xl,

      marginBottom: 24,
    },

    serviceSection: {
      marginBottom: 20,

      marginLeft: 20,
    },

    sectionTitle: {
      fontSize: 17,

      color:
        COLORS.black,

      fontWeight: '700',
    },

    sectionSubtitle: {
      marginTop: 4,

      fontSize: 11,

      color:
        COLORS.textMuted,

      fontWeight: '500',
    },

    // ========================================================
    // AUDIENCE
    // ========================================================

    audienceRow: {
      flexDirection:
        'row',

      gap: 8,

      marginTop: 12,
    },

    audienceChip: {
      flex: 1,

      minHeight: 44,

      borderRadius: 22,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        '#E1E1E1',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 8,
    },

    audienceChipSelected: {
      backgroundColor:
        COLORS.themeColor,

      borderColor:
        COLORS.themeColor,
    },

    checkbox: {
      width: 19,

      height: 19,

      borderRadius: 5,

      borderWidth: 1,

      borderColor:
        '#CCCCCC',

      backgroundColor:
        COLORS.white,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight: 7,
    },

    checkboxSelected: {
      borderColor:
        COLORS.white,

      backgroundColor:
        COLORS.white,
    },

    checkmark: {
      color:
        COLORS.themeColor,

      fontSize: 13,

      fontWeight: '800',
    },

    audienceText: {
      color:
        COLORS.black,

      fontSize: 12,

      fontWeight: '600',
    },

    audienceTextSelected: {
      color:
        COLORS.white,
    },

    // ========================================================
    // DISTANCE
    // ========================================================

    labelRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    selectedValue: {
      color:
        COLORS.themeColor,

      fontSize: 13,

      fontWeight: '700',
    },

    distanceRow: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      marginTop: 12,
    },

    distanceOption: {
      width: 54,

      height: 48,

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        '#E2E2E2',

      backgroundColor:
        COLORS.white,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    distanceOptionSelected: {
      backgroundColor:
        COLORS.themeColor,

      borderColor:
        COLORS.themeColor,
    },

    distanceNumber: {
      color:
        COLORS.black,

      fontSize: 14,

      fontWeight: '700',
    },

    distanceNumberSelected: {
      color:
        COLORS.white,
    },

    distanceUnit: {
      color:
        COLORS.textMuted,

      fontSize: 9,
    },

    distanceUnitSelected: {
      color:
        COLORS.white,
    },

    // ========================================================
    // BUDGET
    // ========================================================

    budgetRow: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap: 8,

      marginTop: 12,
    },

    budgetOption: {
      minHeight: 40,

      paddingHorizontal: 13,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        '#E2E2E2',

      backgroundColor:
        COLORS.white,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    budgetOptionSelected: {
      backgroundColor:
        COLORS.themeColor,

      borderColor:
        COLORS.themeColor,
    },

    budgetOptionDisabled: {
      opacity: 0.45,
    },

    budgetText: {
      color:
        COLORS.black,

      fontSize: 11,

      fontWeight: '600',
    },

    budgetTextSelected: {
      color:
        COLORS.white,
    },

    budgetTextDisabled: {
      color:
        COLORS.textMuted,
    },

    budgetHint: {
      marginTop: 8,

      color:
        COLORS.textMuted,

      fontSize: 10,
    },

    // ========================================================
    // SEARCH SUMMARY
    // ========================================================

    summaryCard: {
      marginHorizontal:
        SPACING.xl,

      marginBottom: 16,

      padding: 16,

      borderRadius: 18,

      backgroundColor:
        COLORS.themeColor,
    },

    summaryTitle: {
      color:
        COLORS.white,

      fontSize: 15,

      fontWeight: '700',

      marginBottom: 10,
    },

    summaryRow: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'flex-start',

      marginTop: 7,
    },

    summaryLabel: {
      color:
        COLORS.white,

      opacity: 0.75,

      fontSize: 11,
    },

    summaryValue: {
      color:
        COLORS.white,

      fontSize: 12,

      fontWeight: '600',

      maxWidth: '68%',

      textAlign:
        'right',
    },

    // ========================================================
    // SEARCH BUTTON
    // ========================================================

    searchButton: {
      marginHorizontal:
        SPACING.xl,

      height: 56,

      borderRadius: 15,

      backgroundColor:
        COLORS.themeColor,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    searchButtonText: {
      color:
        COLORS.white,

      fontSize: 15,

      fontWeight: '700',
    },

    searchButtonArrow: {
      color:
        COLORS.white,

      fontSize: 21,

      marginLeft: 9,

      fontWeight: '300',
    },

    // ========================================================
    // CLAVATA MATCH
    // ========================================================

    clavataCard: {
      marginHorizontal:
        SPACING.xl,

      marginTop: 12,

      minHeight: 70,

      borderRadius: 18,

      backgroundColor:
        COLORS.secondaryColor,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 16,
    },

    clavataBody: {
      flex: 1,
    },

    clavataTitle: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight: '700',
    },

    clavataText: {
      marginTop: 3,

      color:
        COLORS.white,

      opacity: 0.75,

      fontSize: 11,
    },

    clavataArrow: {
      color:
        COLORS.white,

      fontSize: 22,
    },

    bottomSpace: {
      height: 25,
    },
  });