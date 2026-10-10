
import React, { useCallback, useEffect, useState } from 'react';
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
import { useApolloClient } from '@apollo/client';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import HomeHeader from './HomeHeader';
import ServiceChips from './ServiceChips';
import LocationBottomSheet from './LocationBottomSheet';
import ReviewPopup from './ReviewPopup';
import AppGradient from '../../../common/AppGradient';
import {
  getActiveLocation,
  getCurrentLocation,
  LocationData,
} from '../../../services/locationStorage';
import {
  DEFAULT_LOCATION_RADIUS,
  USE_HARDCODED_LOCATION,
} from '../../../constants/config';
import { CUSTOMER_BOOKINGS } from '../../../graphql/queries';
import { useUser } from '../../../context/UserContext';
import { COLORS, GRADIENTS, SPACING } from '../../../constants/constants';

type ServiceAudience = 'FEMALE' | 'MALE' | 'KIDS';

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

const AUDIENCE_OPTIONS: { value: ServiceAudience; label: string }[] = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'KIDS', label: 'Kids' },
];

const BUDGET_OPTIONS: BudgetOption[] = [
  { label: 'Any', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 499.99 },
  { label: '₹500 – ₹1K', min: 500, max: 1000 },
  { label: '₹1K – ₹2K', min: 1000.01, max: 2000 },
  { label: '₹2K+', min: 2000.01, max: Infinity },
];

const DISTANCE_OPTIONS = [2, 5, 10, 15, 25];
const TERMINAL_BOOKING_STATUSES = ['COMPLETED', 'CANCELLED', 'EXPIRED'];

const hasDeadlineExpired = (
  deadline?: string | null,
  now: number = Date.now(),
): boolean => {
  if (!deadline) return false;

  const deadlineTime = new Date(deadline).getTime();

  return Number.isFinite(deadlineTime) && deadlineTime <= now;
};

const isActiveBooking = (
  booking: Booking,
  now: number = Date.now(),
): boolean => {
  const status = String(booking?.bookingStatus || '').toUpperCase();
  const response = String(booking?.salonResponseStatus || '').toUpperCase();
  const feeStatus = String(booking?.bookingFeeStatus || '').toUpperCase();
  const paymentStatus = String(booking?.paymentStatus || '').toUpperCase();

  if (TERMINAL_BOOKING_STATUSES.includes(status)) return false;
  if (response === 'REJECTED' || response === 'EXPIRED') return false;

  if (status === 'PENDING' && (response === '' || response === 'PENDING')) {
    return !hasDeadlineExpired(booking.salonResponseDeadline, now);
  }

  if (
    response === 'ACCEPTED' &&
    feeStatus !== 'PAID' &&
    paymentStatus !== 'PAID'
  ) {
    return !hasDeadlineExpired(booking.bookingFeePaymentDeadline, now);
  }

  if (status === 'CONFIRMED') {
    if (feeStatus === 'PAID' || paymentStatus === 'PAID') return true;

    return !hasDeadlineExpired(booking.bookingFeePaymentDeadline, now);
  }

  return false;
};

const getBookingCountdown = (
  deadline?: string | null,
  now: number = Date.now(),
): string | null => {
  if (!deadline) return null;

  const deadlineTime = new Date(deadline).getTime();

  if (!Number.isFinite(deadlineTime)) return null;

  const remainingMilliseconds = deadlineTime - now;

  if (remainingMilliseconds <= 0) return '00:00';

  const totalSeconds = Math.floor(remainingMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function HomeScreenPage() {
  const client = useApolloClient();
  const navigation = useNavigation<any>();
  const { currentUser } = useUser();

  const [search, setSearch] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<ServiceAudience[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [
    selectedAudienceSubcategorySelections,
    setSelectedAudienceSubcategorySelections,
  ] = useState<
    Array<{ audience: ServiceAudience; subcategoryIds: string[] }>
  >([]);

  const [selectedLocation, setSelectedLocation] = useState('Choose location');
  const [locationCoordinates, setLocationCoordinates] =
    useState<LocationData | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(
    DEFAULT_LOCATION_RADIUS || 10,
  );
  const [selectedBudget, setSelectedBudget] = useState<BudgetOption>(
    BUDGET_OPTIONS[0],
  );

  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  const loadLocation = useCallback(async () => {
    try {
      const savedLocation = await getActiveLocation();

      if (
        savedLocation &&
        savedLocation.latitude != null &&
        savedLocation.longitude != null
      ) {
        setSelectedLocation(savedLocation.address || 'Selected location');
        setLocationCoordinates(savedLocation);
        return;
      }

      if (USE_HARDCODED_LOCATION) {
        const activeLocation = await getActiveLocation();

        if (
          activeLocation &&
          activeLocation.latitude != null &&
          activeLocation.longitude != null
        ) {
          setSelectedLocation(activeLocation.address || 'Selected location');
          setLocationCoordinates(activeLocation);
          return;
        }
      }

      const currentLocation = await getCurrentLocation();

      if (
        currentLocation &&
        currentLocation.latitude != null &&
        currentLocation.longitude != null
      ) {
        setSelectedLocation(currentLocation.address || 'Current location');
        setLocationCoordinates(currentLocation);
        return;
      }

      setSelectedLocation('Choose location');
      setLocationCoordinates(null);
    } catch (error) {
      console.log('LOAD LOCATION ERROR:', error);
      setSelectedLocation('Choose location');
      setLocationCoordinates(null);
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const loadCustomerBookings = useCallback(async () => {
    if (!currentUser?.userId) {
      setActiveBooking(null);
      return;
    }

    try {
      const { data } = await client.query({
        query: CUSTOMER_BOOKINGS,
        variables: { customerUserId: currentUser.userId },
        fetchPolicy: 'network-only',
      });

      const customerBookings: Booking[] = data?.customerBookings || [];
      const now = Date.now();

      const active =
        customerBookings.find(booking => isActiveBooking(booking, now)) || null;

      setActiveBooking(active);

      const bookingForReview = customerBookings.find(
        booking =>
          String(booking.bookingStatus || '').toUpperCase() === 'COMPLETED' &&
          booking.reviewSubmitted === false,
      );

      if (bookingForReview) {
        setPendingBooking(bookingForReview);
        setShowReviewPopup(true);
      }
    } catch (error) {
      console.log('BOOKING LOADING ERROR:', error);
    }
  }, [client, currentUser?.userId]);

  useFocusEffect(
    useCallback(() => {
      loadCustomerBookings();
    }, [loadCustomerBookings]),
  );

  useEffect(() => {
    if (!activeBooking) return;

    const bookingStatus = String(activeBooking.bookingStatus || '').toUpperCase();
    const responseStatus = String(
      activeBooking.salonResponseStatus || '',
    ).toUpperCase();
    const feeStatus = String(activeBooking.bookingFeeStatus || '').toUpperCase();
    const paymentStatus = String(activeBooking.paymentStatus || '').toUpperCase();

    let deadline: string | null = null;

    if (
      bookingStatus === 'PENDING' &&
      (responseStatus === '' || responseStatus === 'PENDING')
    ) {
      deadline = activeBooking.salonResponseDeadline || null;
    }

    if (
      responseStatus === 'ACCEPTED' &&
      feeStatus !== 'PAID' &&
      paymentStatus !== 'PAID'
    ) {
      deadline = activeBooking.bookingFeePaymentDeadline || null;
    }

    if (
      bookingStatus === 'CONFIRMED' &&
      feeStatus !== 'PAID' &&
      paymentStatus !== 'PAID'
    ) {
      deadline = activeBooking.bookingFeePaymentDeadline || null;
    }

    if (!deadline) return;

    const deadlineTime = new Date(deadline).getTime();

    if (!Number.isFinite(deadlineTime) || deadlineTime > Date.now()) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const refreshAfterExpiry = async () => {
      try {
        await loadCustomerBookings();

        if (cancelled) return;

        retryTimer = setTimeout(() => {
          if (!cancelled) loadCustomerBookings();
        }, 3000);
      } catch (error) {
        console.log('EXPIRY REFRESH ERROR:', error);
      }
    };

    refreshAfterExpiry();

    return () => {
      cancelled = true;

      if (retryTimer) clearTimeout(retryTimer);
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

  const activeBookingDisplay = useCallback(() => {
    if (!activeBooking) return null;

    const bookingStatus = String(activeBooking.bookingStatus || '').toUpperCase();
    const responseStatus = String(
      activeBooking.salonResponseStatus || '',
    ).toUpperCase();
    const feeStatus = String(activeBooking.bookingFeeStatus || '').toUpperCase();
    const paymentStatus = String(activeBooking.paymentStatus || '').toUpperCase();

    if (TERMINAL_BOOKING_STATUSES.includes(bookingStatus)) return null;
    if (responseStatus === 'REJECTED' || responseStatus === 'EXPIRED') return null;

    if (
      responseStatus === 'ACCEPTED' &&
      feeStatus !== 'PAID' &&
      paymentStatus !== 'PAID'
    ) {
      const deadline = activeBooking.bookingFeePaymentDeadline;

      if (hasDeadlineExpired(deadline, currentTime)) return null;

      const countdown = getBookingCountdown(deadline, currentTime);

      if (!countdown) return null;

      return {
        status: 'Salon accepted your request',
        countdown,
        timerLabel: 'PAY ₹9 BOOKING FEE • PAYMENT TIME LEFT',
        showTimer: true,
        subtitle: '',
        type: 'payment' as const,
      };
    }

    if (
      bookingStatus === 'PENDING' &&
      (responseStatus === 'PENDING' || responseStatus === '')
    ) {
      const deadline = activeBooking.salonResponseDeadline;

      if (hasDeadlineExpired(deadline, currentTime)) return null;

      const countdown = getBookingCountdown(deadline, currentTime);

      if (!countdown) return null;

      return {
        status: 'Waiting for salon to confirm',
        countdown,
        timerLabel: 'SALON RESPONSE TIME LEFT',
        showTimer: true,
        subtitle: '',
        type: 'pending' as const,
      };
    }

    if (
      bookingStatus === 'CONFIRMED' ||
      feeStatus === 'PAID' ||
      paymentStatus === 'PAID'
    ) {
      return {
        status: 'Booking confirmed',
        subtitle: 'Your appointment is confirmed',
        countdown: null,
        timerLabel: '',
        showTimer: false,
        type: 'confirmed' as const,
      };
    }

    return {
      status: 'Booking in progress',
      subtitle: 'Tap to view your booking',
      countdown: null,
      timerLabel: '',
      showTimer: false,
      type: 'pending' as const,
    };
  }, [activeBooking, currentTime])();

  const handleOpenActiveBooking = useCallback(() => {
    navigation.navigate('Bookings');
  }, [navigation]);

  const handleLocationSelected = (location: LocationData) => {
    setSelectedLocation(location.address || 'Selected location');
    setLocationCoordinates(location);
    setShowLocationModal(false);
  };

  const handleAudienceChange = (audience: ServiceAudience) => {
    setSelectedAudiences(previous =>
      previous.includes(audience)
        ? previous.filter(item => item !== audience)
        : [...previous, audience],
    );

    setSelectedCategoryId('');
    setSelectedCategory('');
    setSelectedSubcategoryIds([]);
    setSelectedAudienceSubcategorySelections([]);
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);

    if (text.trim().length > 0) {
      setSelectedCategoryId('');
      setSelectedCategory('');
      setSelectedSubcategoryIds([]);
      setSelectedAudienceSubcategorySelections([]);
      setSelectedBudget(BUDGET_OPTIONS[0]);
    }
  };

  const handleServiceSelection = (selection: ServiceSelection) => {
    const normalizedCategoryId = String(selection?.categoryId ?? '').trim();
    const normalizedCategory = String(selection?.category ?? '').trim();

    const normalizedSubcategoryIds = Array.from(
      new Set(
        Array.isArray(selection?.subcategoryIds)
          ? selection.subcategoryIds
            .map(id => String(id ?? '').trim())
            .filter(Boolean)
          : [],
      ),
    );

    const normalizedAudienceSelections = Array.isArray(
      selection?.audienceSubcategorySelections,
    )
      ? selection.audienceSubcategorySelections
        .filter(
          item =>
            item &&
            ['FEMALE', 'MALE', 'KIDS'].includes(item.audience),
        )
        .map(item => ({
          audience: item.audience,
          subcategoryIds: Array.from(
            new Set(
              Array.isArray(item.subcategoryIds)
                ? item.subcategoryIds
                  .map(id => String(id ?? '').trim())
                  .filter(Boolean)
                : [],
            ),
          ),
        }))
        .filter(item => item.subcategoryIds.length > 0)
      : [];

    setSelectedCategoryId(normalizedCategoryId);
    setSelectedCategory(normalizedCategory);
    setSelectedSubcategoryIds(normalizedSubcategoryIds);
    setSelectedAudienceSubcategorySelections(normalizedAudienceSelections);
    setSearch('');
  };

  const handleFinalSearch = () => {
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
            onPress: () => setShowLocationModal(true),
          },
        ],
      );
      return;
    }

    if (selectedAudiences.length === 0) {
      Alert.alert('Select audience', 'Please select who the service is for.');
      return;
    }

    const cleanSearch = search.trim();
    const hasService = selectedCategoryId.trim().length > 0;
    const hasSearch = cleanSearch.length > 0;

    if (!hasService && !hasSearch) {
      Alert.alert(
        'Select a service',
        'Please select a service or search for a salon/service.',
      );
      return;
    }

    navigation.navigate('SalonSearchResults', {
      latitude: Number(locationCoordinates.latitude),
      longitude: Number(locationCoordinates.longitude),
      radius: Number(selectedDistance),
      search: hasSearch ? cleanSearch : '',
      audiences: selectedAudiences,
      categoryId: hasService ? selectedCategoryId : '',
      category: selectedCategory,
      subcategoryIds: hasService ? selectedSubcategoryIds : [],
      minPrice:
        hasService && selectedBudget.label !== 'Any'
          ? selectedBudget.min
          : undefined,
      maxPrice:
        hasService &&
          selectedBudget.label !== 'Any' &&
          selectedBudget.max !== Infinity
          ? selectedBudget.max
          : undefined,
      budgetLabel: selectedBudget.label,
      location: selectedLocation,
    });
  };

  const askClavata = () => {
    navigation.navigate('ClavataMatch', {
      service: selectedCategory.trim() || undefined,
      categoryId: selectedCategoryId.trim() || undefined,
      subcategoryIds:
        selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
      audience: selectedAudiences.length > 0 ? selectedAudiences : undefined,
      location: locationCoordinates,
      minBudget: selectedBudget.min,
      maxBudget: selectedBudget.max,
      distance: selectedDistance,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HomeHeader
          location={selectedLocation}
          onPressLocation={() => setShowLocationModal(true)}
        />

        {activeBooking && activeBookingDisplay && (
          <TouchableOpacity
            style={styles.bookingCard}
            onPress={handleOpenActiveBooking}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Open active booking"
          >
            <View style={styles.bookingTop}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingSalonName} numberOfLines={1}>
                  {activeBooking.salonName || 'Salon'}
                </Text>
                <Text style={styles.bookingStatus} numberOfLines={2}>
                  {activeBookingDisplay.status}
                </Text>
              </View>
              <Text style={styles.bookingChevron}>›</Text>
            </View>

            {activeBookingDisplay.showTimer &&
              activeBookingDisplay.countdown && (
                <View style={styles.timerContainer}>
                  <Text style={styles.timerValue}>
                    {activeBookingDisplay.countdown}
                  </Text>
                  <Text style={styles.timerLabel} numberOfLines={2}>
                    {activeBookingDisplay.timerLabel}
                  </Text>
                </View>
              )}

            {!activeBookingDisplay.showTimer &&
              activeBookingDisplay.type === 'confirmed' && (
                <Text style={styles.bookingSubtitle} numberOfLines={1}>
                  {activeBookingDisplay.subtitle}
                </Text>
              )}
          </TouchableOpacity>
        )}

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Text style={styles.searchSymbol}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={handleSearchChange}
              placeholder="Search salons or services"
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who is the service for?</Text>
          <Text style={styles.sectionSubtitle}>Select one or more</Text>

          <View style={styles.audienceRow}>
            {AUDIENCE_OPTIONS.map(option => {
              const selected = selectedAudiences.includes(option.value);

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.audienceChip,
                    selected && styles.audienceChipSelected,
                  ]}
                  onPress={() => handleAudienceChange(option.value)}
                  activeOpacity={0.85}
                >
                  {selected ? (
                    <AppGradient
                      colors={[...GRADIENTS.SOFT_PURPLE]}
                      style={styles.audienceChipGradient}
                    >
                      <View style={styles.audienceChipContent}>
                        <View
                          style={[
                            styles.checkbox,
                            styles.checkboxSelected,
                          ]}
                        >
                          <Text style={styles.checkmark}>✓</Text>
                        </View>
                        <Text
                          style={[
                            styles.audienceText,
                            styles.audienceTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </AppGradient>
                  ) : (
                    <View style={styles.audienceChipContent}>
                      <View style={styles.checkbox} />
                      <Text style={styles.audienceText}>{option.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedAudiences.length > 0 && (
          <View style={styles.serviceSection}>
            <Text style={styles.sectionTitle}>Choose a service</Text>
            <Text style={styles.sectionSubtitle}>
              Services are filtered for your selected audience
            </Text>
            <ServiceChips
              selectedCategoryId={selectedCategoryId}
              selectedCategory={selectedCategory}
              selectedSubcategoryIds={selectedSubcategoryIds}
              selectedAudienceSubcategorySelections={
                selectedAudienceSubcategorySelections
              }
              selectedAudiences={selectedAudiences}
              onSelect={handleServiceSelection}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <View>
              <Text style={styles.sectionTitle}>Distance</Text>
              <Text style={styles.sectionSubtitle}>
                How far should we search?
              </Text>
            </View>
            <Text style={styles.selectedValue}>{selectedDistance} km</Text>
          </View>

          <View style={styles.distanceRow}>
            {DISTANCE_OPTIONS.map(distance => {
              const selected = selectedDistance === distance;

              return (
                <TouchableOpacity
                  key={distance}
                  style={[
                    styles.distanceOption,
                    selected && styles.distanceOptionSelected,
                  ]}
                  onPress={() => setSelectedDistance(distance)}
                  activeOpacity={0.85}
                >
                  {selected ? (
                    <AppGradient
                      colors={[...GRADIENTS.SOFT_PURPLE]}
                      style={styles.distanceOptionGradient}
                    >
                      <Text
                        style={[
                          styles.distanceNumber,
                          styles.distanceNumberSelected,
                        ]}
                      >
                        {distance}
                      </Text>
                      <Text
                        style={[
                          styles.distanceUnit,
                          styles.distanceUnitSelected,
                        ]}
                      >
                        km
                      </Text>
                    </AppGradient>
                  ) : (
                    <View style={styles.distanceOptionContent}>
                      <Text style={styles.distanceNumber}>{distance}</Text>
                      <Text style={styles.distanceUnit}>km</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <Text style={styles.sectionSubtitle}>
            Select your preferred service price
          </Text>

          <View style={styles.budgetRow}>
            {BUDGET_OPTIONS.map(option => {
              const selected = selectedBudget.label === option.label;
              const disabled =
                option.label !== 'Any' &&
                selectedCategoryId.trim().length === 0;

              return (
                <TouchableOpacity
                  key={option.label}
                  disabled={disabled}
                  style={[
                    styles.budgetOption,
                    selected && styles.budgetOptionSelected,
                    disabled && styles.budgetOptionDisabled,
                  ]}
                  onPress={() => setSelectedBudget(option)}
                  activeOpacity={0.85}
                >
                  {selected ? (
                    <AppGradient
                      colors={[...GRADIENTS.SOFT_PURPLE]}
                      style={styles.budgetOptionGradient}
                    >
                      <Text
                        style={[
                          styles.budgetText,
                          styles.budgetTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </AppGradient>
                  ) : (
                    <View style={styles.budgetOptionContent}>
                      <Text
                        style={[
                          styles.budgetText,
                          disabled && styles.budgetTextDisabled,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedCategoryId.trim().length === 0 && (
            <Text style={styles.budgetHint}>
              Select a service first to use a budget filter.
            </Text>
          )}
        </View>

        <AppGradient
          colors={[...GRADIENTS.SOFT_PURPLE]}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>Your search</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>For</Text>
            <Text style={styles.summaryValue}>
              {selectedAudiences.length > 0
                ? selectedAudiences
                  .map(audience =>
                    audience === 'FEMALE'
                      ? 'Female'
                      : audience === 'MALE'
                        ? 'Male'
                        : 'Kids',
                  )
                  .join(', ')
                : 'Not selected'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {selectedCategory || search.trim() || 'Not selected'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Distance</Text>
            <Text style={styles.summaryValue}>{selectedDistance} km</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryValue}>{selectedBudget.label}</Text>
          </View>
        </AppGradient>


        <TouchableOpacity
          onPress={handleFinalSearch}
          activeOpacity={0.85}
          style={styles.searchButton}
          accessibilityRole="button"
          accessibilityLabel="Search salons"
        >
          <AppGradient
            colors={[...GRADIENTS.SOFT_PURPLE]}
            style={styles.searchButtonGradient}
          >
            <View style={styles.searchButtonContent}>
              <Text style={styles.searchButtonText}>Search</Text>
              <Text style={styles.searchButtonArrow}>→</Text>
            </View>
          </AppGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clavataCard}
          onPress={askClavata}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Let Clavata choose"
        >
          <AppGradient
            colors={[...GRADIENTS.ORANGE]}
            style={styles.clavataGradient}
          >
            <View style={styles.clavataBody}>
              <Text style={styles.clavataTitle}>Let Clavata choose</Text>
              <Text style={styles.clavataText}>
                Find the best match for you
              </Text>
                 <Text style={styles.clavataArrow}>→</Text>
            </View>
          </AppGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <LocationBottomSheet
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={handleLocationSelected}
      />

      <ReviewPopup
        visible={showReviewPopup}
        salonName={pendingBooking?.salonName}
        onRate={() => {
          setShowReviewPopup(false);
          navigation.navigate('Bookings', {
            screen: 'RateReview',
            params: { booking: pendingBooking },
          });
        }}
        onLater={() => setShowReviewPopup(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 30,
  },
  bookingCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F7F3FF',
    borderWidth: 1,
    borderColor: '#E8DFFF',
    shadowColor: '#6F4BB8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: COLORS.themeColor,
  },
  bookingChevron: {
    marginLeft: 8,
    fontSize: 24,
    lineHeight: 26,
    color: COLORS.themeColor,
    fontWeight: '400',
  },
  timerContainer: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ECE6F7',
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '800',
    color: COLORS.themeColor,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timerLabel: {
    marginTop: 1,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#8A7BA5',
    textAlign: 'center',
  },
  bookingSubtitle: {
    marginTop: 8,
    fontSize: 10,
    color: '#70677F',
    fontWeight: '500',
  },
  searchSection: {
    marginHorizontal: SPACING.xl,
    marginTop: 4,
    marginBottom: 22,
  },
  searchBox: {
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchSymbol: {
    fontSize: 25,
    color: COLORS.themeColor,
    marginRight: 8,
    fontWeight: '300',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: COLORS.black,
    paddingVertical: 0,
  },
  section: {
    marginHorizontal: SPACING.xl,
    marginBottom: 24,
  },
  serviceSection: {
    marginBottom: 20,
    marginLeft: 20,
  },
  sectionTitle: {
    fontSize: 17,
    color: COLORS.black,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  audienceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  audienceChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    overflow: 'hidden',
  },
  audienceChipSelected: {
    borderColor: 'transparent',
  },
  audienceChipGradient: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  audienceChipContent: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkboxSelected: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
  },
  checkmark: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  audienceText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '600',
  },
  audienceTextSelected: {
    color: COLORS.white,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedValue: {
    color: COLORS.themeColor,
    fontSize: 13,
    fontWeight: '700',
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  distanceOption: {
    width: 54,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  distanceOptionSelected: {
    borderColor: 'transparent',
  },
  distanceOptionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  distanceOptionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceNumber: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '700',
  },
  distanceNumberSelected: {
    color: COLORS.white,
  },
  distanceUnit: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  distanceUnitSelected: {
    color: COLORS.white,
  },
  budgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  budgetOption: {
    minHeight: 40,
    paddingHorizontal: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: COLORS.white,
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  budgetOptionSelected: {
    borderColor: 'transparent',
  },
  budgetOptionGradient: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetOptionContent: {
    minHeight: 40,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetOptionDisabled: {
    opacity: 0.45,
  },
  budgetText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '600',
  },
  budgetTextSelected: {
    color: COLORS.white,
  },
  budgetTextDisabled: {
    color: COLORS.textMuted,
  },
  budgetHint: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  summaryCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: 18,
    padding: 18,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  summaryLabel: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '68%',
    textAlign: 'right',
    flexShrink: 1,
  },

  clavataCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  clavataGradient: {
    minHeight: 82,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 66,
    borderRadius: 22,
  },
  clavataBody: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clavataTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  clavataText: {
    marginTop: 3,
    color: COLORS.white,
    opacity: 0.9,
    fontSize: 14,
    textAlign: 'center',
  },
  
  clavataArrow: {
    color: COLORS.white,
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    includeFontPadding: false,
  },
  bottomSpace: {
    height: 25,
  },

  searchButton: {
    height: 54,
    marginHorizontal: SPACING.xl,
    marginTop: 0,
    marginBottom: 8,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },

  searchButtonGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  searchButtonArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 26,
    includeFontPadding: false,
    bottom: 3,
  },
});