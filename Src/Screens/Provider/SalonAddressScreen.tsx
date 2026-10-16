
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';

import Geolocation from '@react-native-community/geolocation';

import AppGradient from '../../common/AppGradient';
import { GRADIENTS } from '../../constants/constants';

import { useSalonRegistration } from '../../context/SalonRegistrationContext';

import {
  getPlaceDetails,
  reverseGeocode,
  searchAddress,
  Coordinates,
  AddressSuggestion,
} from '../../services/locationService';

/* ============================================================
   TYPES
============================================================ */

type AddressFields = {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

type Props = {
  navigation: {
    navigate: (
      screen: string,
      params?: Record<string, any>,
    ) => void;
    goBack?: () => void;
  };
  route?: {
    params?: {
      registrationData?: Record<string, any>;
      initialStep?: number;
      completedSteps?: number[];
    };
  };
};

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const DEFAULT_REGION: Region = {
  ...DEFAULT_COORDINATES,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const COLORS = {
  primary: '#7652D6',
  primaryDark: '#5A38B5',
  primaryLight: '#F1ECFF',
  background: '#F8F7FC',
  white: '#FFFFFF',
  text: '#211A32',
  secondaryText: '#777184',
  border: '#E8E3F0',
  success: '#21865B',
};

/* ============================================================
   HELPERS
============================================================ */

const clean = (value?: string | null): string =>
  (value ?? '').trim();

const extractAddressFields = (
  result: Awaited<ReturnType<typeof reverseGeocode>>,
): AddressFields | null => {
  if (!result) {
    return null;
  }

  const address = result.address ?? {};

  return {
    addressLine: clean(
      result.display_name || result.formatted_address,
    ),
    city: clean(
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county,
    ),
    state: clean(address.state),
    pincode: clean(address.pincode || address.postcode),
  };
};

const isValidCoordinates = (
  latitude: number,
  longitude: number,
): boolean =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

/* ============================================================
   SCREEN
============================================================ */

const SalonAddressScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const {
    data,
    updateData,
    completedSteps,
    setCurrentStep,
    markStepCompleted,
    saveDraft,
    isDraftLoading,
    isDraftSaving,
  } = useSalonRegistration();

  const mapRef = useRef<MapView | null>(null);
  const searchTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [addressLine, setAddressLine] = useState(
    data.addressLine || '',
  );
  const [city, setCity] = useState(data.city || '');
  const [state, setState] = useState(data.state || '');
  const [pincode, setPincode] = useState(data.pincode || '');

  const [coordinates, setCoordinates] = useState<Coordinates>(() => ({
    latitude:
      typeof data.latitude === 'number'
        ? data.latitude
        : DEFAULT_COORDINATES.latitude,
    longitude:
      typeof data.longitude === 'number'
        ? data.longitude
        : DEFAULT_COORDINATES.longitude,
  }));

  const [mapRegion, setMapRegion] = useState<Region>(() => ({
    latitude:
      typeof data.latitude === 'number'
        ? data.latitude
        : DEFAULT_REGION.latitude,
    longitude:
      typeof data.longitude === 'number'
        ? data.longitude
        : DEFAULT_REGION.longitude,
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  }));

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<
    AddressSuggestion[]
  >([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] =
    useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [locationFound, setLocationFound] = useState(
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number',
  );

  /* ============================================================
     RESTORE SAVED ADDRESS
  ============================================================ */

  useEffect(() => {
    const routeData = route?.params?.registrationData ?? {};

    const restoredAddressLine =
      data.addressLine || routeData.addressLine || '';
    const restoredCity = data.city || routeData.city || '';
    const restoredState = data.state || routeData.state || '';
    const restoredPincode = data.pincode || routeData.pincode || '';

    const restoredLatitude =
      typeof data.latitude === 'number'
        ? data.latitude
        : typeof routeData.latitude === 'number'
          ? routeData.latitude
          : null;

    const restoredLongitude =
      typeof data.longitude === 'number'
        ? data.longitude
        : typeof routeData.longitude === 'number'
          ? routeData.longitude
          : null;

    setAddressLine(restoredAddressLine);
    setCity(restoredCity);
    setState(restoredState);
    setPincode(restoredPincode);

    if (
      typeof restoredLatitude === 'number' &&
      typeof restoredLongitude === 'number'
    ) {
      const restoredCoordinates = {
        latitude: restoredLatitude,
        longitude: restoredLongitude,
      };

      const restoredRegion: Region = {
        ...restoredCoordinates,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
      };

      setCoordinates(restoredCoordinates);
      setMapRegion(restoredRegion);
      setLocationFound(true);

      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion(restoredRegion, 400);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [
    data.addressLine,
    data.city,
    data.state,
    data.pincode,
    data.latitude,
    data.longitude,
    route?.params?.registrationData,
  ]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  /* ============================================================
     REVERSE GEOCODE HELPERS
  ============================================================ */

  const resolveAddressFromCoordinates = useCallback(
    async (nextCoordinates: Coordinates) => {
      setCoordinates(nextCoordinates);
      setLocationFound(true);

      try {
        setIsResolvingLocation(true);

        const result = await reverseGeocode(
          nextCoordinates.latitude,
          nextCoordinates.longitude,
        );

        const fields = extractAddressFields(result);

        if (fields) {
          setAddressLine(fields.addressLine);
          setCity(fields.city);
          setState(fields.state);
          setPincode(fields.pincode);
        } else {
          Alert.alert(
            'Address not found',
            'The map location was selected, but we could not retrieve its address. You can enter the address manually.',
          );
        }
      } catch (error) {
        console.warn('REVERSE GEOCODE ERROR:', error);

        Alert.alert(
          'Address lookup failed',
          'Please enter the address details manually.',
        );
      } finally {
        setIsResolvingLocation(false);
      }
    },
    [],
  );

  /* ============================================================
     ADDRESS AUTOCOMPLETE
  ============================================================ */

  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);

      try {
        const results = await searchAddress(value.trim());
        setSuggestions(results);
      } catch (error) {
        console.warn('ADDRESS SEARCH ERROR:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  }, []);

  /* ============================================================
     SELECT AUTOCOMPLETE RESULT
  ============================================================ */

  const handleSelectSuggestion = useCallback(
    async (suggestion: AddressSuggestion) => {
      Keyboard.dismiss();
      setSuggestions([]);
      setSearchText(suggestion.description);
      setIsResolvingLocation(true);

      try {
        const place = await getPlaceDetails(suggestion.placeId);

        if (!place) {
          Alert.alert(
            'Location unavailable',
            'We could not retrieve this location. Please select another result.',
          );
          return;
        }

        const nextCoordinates: Coordinates = {
          latitude: place.latitude,
          longitude: place.longitude,
        };

        if (
          !isValidCoordinates(
            nextCoordinates.latitude,
            nextCoordinates.longitude,
          )
        ) {
          Alert.alert(
            'Invalid location',
            'The selected result returned invalid coordinates.',
          );
          return;
        }

        setCoordinates(nextCoordinates);
        setLocationFound(true);

        const nextRegion: Region = {
          ...nextCoordinates,
          latitudeDelta: DEFAULT_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_REGION.longitudeDelta,
        };

        setMapRegion(nextRegion);
        mapRef.current?.animateToRegion(nextRegion, 500);

        setAddressLine(
          place.addressLine || place.formattedAddress || '',
        );
        setCity(place.city || '');
        setState(place.state || '');
        setPincode(place.pincode || '');

        setIsMapVisible(false);
      } catch (error) {
        console.warn('PLACE DETAILS ERROR:', error);

        Alert.alert(
          'Location error',
          'Unable to load the selected location. Please try again.',
        );
      } finally {
        setIsResolvingLocation(false);
      }
    },
    [],
  );

  /* ============================================================
     MAP EVENTS
  ============================================================ */

  const handleMapPress = useCallback(
    (event: { nativeEvent: { coordinate: Coordinates } }) => {
      const nextCoordinates = event.nativeEvent.coordinate;

      setMapRegion(previous => ({
        ...previous,
        ...nextCoordinates,
      }));

      void resolveAddressFromCoordinates(nextCoordinates);
    },
    [resolveAddressFromCoordinates],
  );

  const handleMarkerDragEnd = useCallback(
    (event: { nativeEvent: { coordinate: Coordinates } }) => {
      const nextCoordinates = event.nativeEvent.coordinate;

      setMapRegion(previous => ({
        ...previous,
        ...nextCoordinates,
      }));

      void resolveAddressFromCoordinates(nextCoordinates);
    },
    [resolveAddressFromCoordinates],
  );

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Allow location access',
          message:
            'Clavata uses your location to help you set your salon address accurately.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn('LOCATION PERMISSION ERROR:', error);
      return false;
    }
  }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    const permitted = await requestLocationPermission();

    if (!permitted) {
      Alert.alert(
        'Location permission required',
        'Allow location access or search for your salon address manually.',
      );
      return;
    }

    setIsResolvingLocation(true);

    Geolocation.getCurrentPosition(
      async position => {
        const nextCoordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCoordinates(nextCoordinates);
        setLocationFound(true);

        const nextRegion: Region = {
          ...nextCoordinates,
          latitudeDelta: DEFAULT_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_REGION.longitudeDelta,
        };

        setMapRegion(nextRegion);
        mapRef.current?.animateToRegion(nextRegion, 500);

        try {
          const result = await reverseGeocode(
            nextCoordinates.latitude,
            nextCoordinates.longitude,
          );

          const fields = extractAddressFields(result);

          if (fields) {
            setAddressLine(fields.addressLine);
            setCity(fields.city);
            setState(fields.state);
            setPincode(fields.pincode);
          } else {
            Alert.alert(
              'Address not found',
              'Your coordinates were found. Please enter the address manually.',
            );
          }

          setIsMapVisible(false);
        } catch (error) {
          console.warn('CURRENT LOCATION GEOCODE ERROR:', error);

          Alert.alert(
            'Address lookup failed',
            'Your location was found, but the address could not be retrieved.',
          );
        } finally {
          setIsResolvingLocation(false);
        }
      },
      error => {
        console.warn('CURRENT LOCATION ERROR:', error);
        setIsResolvingLocation(false);

        Alert.alert(
          'Unable to get location',
          'Check that location services are enabled, or search for your address manually.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      },
    );
  }, [requestLocationPermission]);

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateAddress = useCallback(() => {
    if (!addressLine.trim()) {
      Alert.alert(
        'Address required',
        'Enter your salon’s complete street address.',
      );
      return false;
    }

    if (!city.trim()) {
      Alert.alert('City required', 'Enter your salon’s city.');
      return false;
    }

    if (!state.trim()) {
      Alert.alert('State required', 'Enter your salon’s state.');
      return false;
    }

    if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
      Alert.alert(
        'Invalid PIN code',
        'Enter a valid six-digit Indian PIN code.',
      );
      return false;
    }

    if (
      !isValidCoordinates(
        coordinates.latitude,
        coordinates.longitude,
      )
    ) {
      Alert.alert(
        'Location required',
        'Please select your salon location on the map.',
      );
      return false;
    }

    return true;
  }, [addressLine, city, state, pincode, coordinates]);

  /* ============================================================
     SAVE DRAFT AND CONTINUE
  ============================================================ */

  const handleConfirmAddress = useCallback(async () => {
    if (isSubmitting || isDraftSaving || isDraftLoading) {
      return;
    }

    Keyboard.dismiss();

    if (!validateAddress()) {
      return;
    }

    const latestData = {
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    const nextCompletedSteps = Array.from(
      new Set([...(completedSteps || []), 1, 2]),
    ).sort((a, b) => a - b);

    setIsSubmitting(true);

    try {
      updateData(latestData);
      markStepCompleted(2);
      setCurrentStep(3);

      const saved = await saveDraft(
        3,
        nextCompletedSteps,
        latestData,
      );

      if (saved === false) {
        setCurrentStep(2);

        Alert.alert(
          'Unable to save progress',
          'Your address could not be saved. Please try again.',
        );
        return;
      }

      navigation.navigate('SalonBusinessHours', {
        initialStep: 3,
        completedSteps: nextCompletedSteps,
        registrationData: {
          ...data,
          ...latestData,
        },
      });
    } catch (error) {
      console.warn('SALON ADDRESS DRAFT SAVE ERROR:', error);

      setCurrentStep(2);

      Alert.alert(
        'Could not continue',
        'We could not save your registration progress. Please check your connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    isDraftSaving,
    isDraftLoading,
    validateAddress,
    addressLine,
    city,
    state,
    pincode,
    coordinates,
    completedSteps,
    updateData,
    markStepCompleted,
    setCurrentStep,
    saveDraft,
    navigation,
    data,
  ]);

  const isBusy =
    isSubmitting || isDraftSaving || isDraftLoading;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack?.()}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerEyebrow}>
                SALON REGISTRATION
              </Text>
              <Text style={styles.headerTitle}>Salon address</Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>02 / 06</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.progressFill}
            >
              <View style={styles.progressFillInner} />
            </AppGradient>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.intro}>
              <Text style={styles.title}>Where is your salon?</Text>
              <Text style={styles.subtitle}>
                Add your salon address and pin the exact location so
                customers can find you easily.
              </Text>
            </View>

            {/* SEARCH */}
            <View style={styles.section}>
              <Text style={styles.label}>Find your location</Text>

              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>⌕</Text>

                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={handleSearchChange}
                  placeholder="Search area, street or landmark"
                  placeholderTextColor={COLORS.secondaryText}
                  returnKeyType="search"
                  autoCorrect={false}
                />

                {isSearching && (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                )}
              </View>

              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={
                        suggestion.placeId ||
                        `${suggestion.description}-${index}`
                      }
                      style={styles.suggestionRow}
                      onPress={() =>
                        void handleSelectSuggestion(suggestion)
                      }
                    >
                      <View style={styles.suggestionIconContainer}>
                        <Text style={styles.suggestionIcon}>⌖</Text>
                      </View>
                      <Text style={styles.suggestionText}>
                        {suggestion.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={() => void handleUseCurrentLocation()}
                disabled={isResolvingLocation}
              >
                {isResolvingLocation ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                ) : (
                  <Text style={styles.currentLocationIcon}>◎</Text>
                )}
                <Text style={styles.currentLocationText}>
                  Use my current location
                </Text>
              </TouchableOpacity>
            </View>

            {/* MAP PREVIEW */}
            <View style={styles.section}>
              <View style={styles.mapHeadingRow}>
                <Text style={styles.label}>Pin your salon</Text>
                <TouchableOpacity
                  onPress={() => setIsMapVisible(true)}
                >
                  <Text style={styles.editMapText}>Open map</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.mapPreviewContainer}
                onPress={() => setIsMapVisible(true)}
              >
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={styles.mapPreview}
                  region={mapRegion}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={coordinates}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                  />
                </MapView>

                <View style={styles.mapOverlay}>
                  <View style={styles.mapOverlayBadge}>
                    <Text style={styles.mapOverlayBadgeText}>
                      {locationFound
                        ? 'Location selected'
                        : 'Select your location'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <Text style={styles.helperText}>
                Open the map, tap the location, or drag the pin to
                adjust your salon’s exact location.
              </Text>
            </View>

            {/* ADDRESS FORM */}
            <View style={styles.section}>
              <Text style={styles.label}>Complete address</Text>

              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={addressLine}
                onChangeText={setAddressLine}
                placeholder="Building, street, area and landmark"
                placeholderTextColor={COLORS.secondaryText}
                multiline
                textAlignVertical="top"
                maxLength={300}
              />

              <View style={styles.twoColumnRow}>
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.textInput}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Enter city"
                    placeholderTextColor={COLORS.secondaryText}
                    maxLength={100}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.halfColumn}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.textInput}
                    value={state}
                    onChangeText={setState}
                    placeholder="Enter state"
                    placeholderTextColor={COLORS.secondaryText}
                    maxLength={100}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <Text style={styles.label}>PIN code</Text>
              <TextInput
                style={styles.textInput}
                value={pincode}
                onChangeText={value =>
                  setPincode(
                    value.replace(/\D/g, '').slice(0, 6),
                  )
                }
                placeholder="6-digit PIN code"
                placeholderTextColor={COLORS.secondaryText}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            {locationFound && (
              <View style={styles.coordinatesCard}>
                <View style={styles.coordinatesIconContainer}>
                  <Text style={styles.coordinatesIcon}>✓</Text>
                </View>

                <View style={styles.coordinatesTextContainer}>
                  <Text style={styles.coordinatesTitle}>
                    Map location selected
                  </Text>
                  <Text style={styles.coordinatesSubtitle}>
                    {coordinates.latitude.toFixed(6)},{' '}
                    {coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* CONTINUE */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                isBusy && styles.continueButtonDisabled,
              ]}
              onPress={() => void handleConfirmAddress()}
              disabled={isBusy}
              accessibilityRole="button"
            >
              <AppGradient
                colors={[...GRADIENTS.SOFT_PURPLE]}
                style={styles.continueButtonGradient}
              >
                {isBusy ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator
                      color={COLORS.white}
                      size="small"
                    />
                    <Text style={styles.continueButtonText}>
                      {isDraftLoading
                        ? 'Loading your draft…'
                        : 'Saving your progress…'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.continueButtonInner}>
                    <Text style={styles.continueButtonText}>
                      Save & Continue
                    </Text>
                    <Text style={styles.continueArrow}>→</Text>
                  </View>
                )}
              </AppGradient>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Your progress is saved as you continue.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* FULL-SCREEN MAP */}
      <Modal
        visible={isMapVisible}
        animationType="slide"
        onRequestClose={() => setIsMapVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setIsMapVisible(false)}
            >
              <Text style={styles.modalBackText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.modalHeaderTextContainer}>
              <Text style={styles.modalTitle}>Pin your salon</Text>
              <Text style={styles.modalSubtitle}>
                Tap the map or drag the pin to your exact location.
              </Text>
            </View>
          </View>

          <View style={styles.fullMapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.fullMap}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
            >
              <Marker
                coordinate={coordinates}
                draggable
                onDragEnd={handleMarkerDragEnd}
              />
            </MapView>

            {isResolvingLocation && (
              <View style={styles.mapLoadingOverlay}>
                <ActivityIndicator
                  color={COLORS.primary}
                  size="large"
                />
                <Text style={styles.mapLoadingText}>
                  Finding address…
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <View style={styles.modalCoordinatesCard}>
              <Text style={styles.modalCoordinatesLabel}>
                SELECTED COORDINATES
              </Text>
              <Text style={styles.modalCoordinatesValue}>
                {coordinates.latitude.toFixed(6)},{' '}
                {coordinates.longitude.toFixed(6)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setIsMapVisible(false)}
            >
              <AppGradient
                colors={[...GRADIENTS.SOFT_PURPLE]}
                style={styles.modalConfirmGradient}
              >
                <Text style={styles.modalConfirmText}>
                  Confirm location
                </Text>
              </AppGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 32,
    lineHeight: 35,
    color: COLORS.text,
    marginTop: -3,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },
  stepBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  stepBadgeText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#EAE5F3',
    marginHorizontal: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '33.333%',
    borderRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  intro: {
    marginBottom: 24,
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.secondaryText,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 9,
  },
  searchContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 14,
  },
  searchIcon: {
    fontSize: 27,
    color: COLORS.primary,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 8,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  suggestionIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestionIcon: {
    color: COLORS.primary,
    fontSize: 21,
  },
  suggestionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
  },
  currentLocationButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  currentLocationIcon: {
    fontSize: 21,
    color: COLORS.primary,
    marginRight: 8,
  },
  currentLocationText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 8,
  },
  mapHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editMapText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 9,
  },
  mapPreviewContainer: {
    height: 185,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EDE9F5',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    alignItems: 'flex-start',
  },
  mapOverlayBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  mapOverlayBadgeText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  helperText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
  textInput: {
    minHeight: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 17,
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 13,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfColumn: {
    flex: 1,
  },
  coordinatesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FAF5',
    borderWidth: 1,
    borderColor: '#D7EFE2',
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
  },
  coordinatesIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#D9F3E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coordinatesIcon: {
    color: COLORS.success,
    fontWeight: '900',
    fontSize: 17,
  },
  coordinatesTextContainer: {
    flex: 1,
  },
  coordinatesTitle: {
    color: COLORS.success,
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 4,
  },
  coordinatesSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 18,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#EEEAF4',
  },
  continueButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonGradient: {
    minHeight: 54,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  continueArrow: {
    color: COLORS.white,
    fontSize: 21,
    marginLeft: 12,
    marginTop: -2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  footerNote: {
    color: COLORS.secondaryText,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalBackButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalBackText: {
    fontSize: 32,
    color: COLORS.text,
    lineHeight: 35,
    marginTop: -3,
  },
  modalHeaderTextContainer: {
    flex: 1,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 4,
  },
  fullMapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  fullMap: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoadingText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  modalFooter: {
    padding: 18,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalCoordinatesCard: {
    backgroundColor: COLORS.background,
    borderRadius: 13,
    padding: 13,
    marginBottom: 14,
  },
  modalCoordinatesLabel: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalCoordinatesValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  progressFillInner: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default SalonAddressScreen;
