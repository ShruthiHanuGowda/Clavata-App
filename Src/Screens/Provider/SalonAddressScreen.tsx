// SalonAddressScreen.tsx

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

type RegistrationData = Record<string, any>;

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
      registrationData?: RegistrationData;
      initialStep?: number;
      completedSteps?: number[];
      resumeDraft?: boolean;
    };
  };
};

/* ============================================================
   CONFIGURATION

   Step 1: SalonRegistration
   Step 2: SalonAddress
   Step 3: SalonBusinessHours
   Step 4: SalonKYC
   Step 5: SalonServices
   Step 6: SalonReview
============================================================ */

const NEXT_REGISTRATION_ROUTE = 'SalonBusinessHours';

const CURRENT_STEP = 2;
const NEXT_STEP = 3;
const TOTAL_STEPS = 6;

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
  primary: '#7652D8',
  primaryDark: '#5B3BB5',
  background: '#F8F6FC',
  surface: '#FFFFFF',
  text: '#242033',
  secondaryText: '#777184',
  border: '#E8E2F0',
  placeholder: '#A7A1B2',
  error: '#D64545',
  success: '#21865B',
  lightPurple: '#F0EAFE',
  white: '#FFFFFF',
};

/* ============================================================
   HELPERS
============================================================ */

const clean = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const isValidCoordinates = (
  coordinates: Coordinates | null | undefined,
): boolean => {
  if (!coordinates) {
    return false;
  }

  const { latitude, longitude } = coordinates;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const extractCoordinates = (result: any): Coordinates | null => {
  if (!result) {
    return null;
  }

  const latitude = Number(
    result.latitude ??
      result.lat ??
      result.geometry?.location?.lat,
  );

  const longitude = Number(
    result.longitude ??
      result.lng ??
      result.lon ??
      result.geometry?.location?.lng,
  );

  const coordinates = {
    latitude,
    longitude,
  };

  return isValidCoordinates(coordinates)
    ? coordinates
    : null;
};

const extractAddressFields = (result: any): AddressFields => {
  const address = result?.address ?? result?.components ?? {};

  const addressLine = clean(
    result?.display_name ??
      result?.formatted_address ??
      result?.formattedAddress ??
      result?.description,
  );

  const city = clean(
    address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.city_district ??
      address.county ??
      address.suburb,
  );

  const state = clean(
    address.state ??
      address.state_district ??
      address.region,
  );

  const pincode = clean(
    address.postcode ??
      address.postal_code ??
      address.pincode,
  );

  return {
    addressLine,
    city,
    state,
    pincode,
  };
};

const getSavedCoordinates = (
  data: RegistrationData,
): Coordinates | null => {
  const latitudeValue = data?.latitude;
  const longitudeValue = data?.longitude;

  if (
    latitudeValue === null ||
    latitudeValue === undefined ||
    latitudeValue === '' ||
    longitudeValue === null ||
    longitudeValue === undefined ||
    longitudeValue === ''
  ) {
    return null;
  }

  const coordinates = {
    latitude: Number(latitudeValue),
    longitude: Number(longitudeValue),
  };

  return isValidCoordinates(coordinates)
    ? coordinates
    : null;
};

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

  const routeData = route?.params?.registrationData ?? {};

  /* ----------------------------------------------------------
     FORM STATE
  ---------------------------------------------------------- */

  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [coordinates, setCoordinates] =
    useState<Coordinates>(DEFAULT_COORDINATES);

  const [mapRegion, setMapRegion] =
    useState<Region>(DEFAULT_REGION);

  const [searchText, setSearchText] = useState('');

  const [suggestions, setSuggestions] =
    useState<AddressSuggestion[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  const [isResolvingLocation, setIsResolvingLocation] =
    useState(false);

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationFound, setLocationFound] = useState(false);

  /* ----------------------------------------------------------
     REFS

     Request IDs ensure an older search or reverse-geocoding
     request cannot overwrite newer user selections.
  ---------------------------------------------------------- */

  const searchTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const mountedRef = useRef(false);
  const searchRequestIdRef = useRef(0);
  const addressRequestIdRef = useRef(0);
  const locationRequestIdRef = useRef(0);
  const draftRestoredRef = useRef(false);

  const busy =
    isDraftLoading ||
    isDraftSaving ||
    isSubmitting;

  /* ----------------------------------------------------------
     MOUNT / CLEANUP
  ---------------------------------------------------------- */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      searchRequestIdRef.current += 1;
      addressRequestIdRef.current += 1;
      locationRequestIdRef.current += 1;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);

  /* ----------------------------------------------------------
     RESTORE DRAFT

     Prefer the shared context, because it contains the loaded
     server draft. Route params are a fallback only.

     Do not reset restored values to Bengaluru coordinates
     when saved coordinates are absent.
  ---------------------------------------------------------- */

  useEffect(() => {
    if (isDraftLoading || draftRestoredRef.current) {
      return;
    }

    const restoredData: RegistrationData = {
      ...routeData,
      ...(data ?? {}),
    };

    const restoredAddressLine = clean(
      restoredData.addressLine,
    );

    const restoredCity = clean(restoredData.city);
    const restoredState = clean(restoredData.state);
    const restoredPincode = clean(restoredData.pincode);

    const restoredCoordinates =
      getSavedCoordinates(restoredData);

    setAddressLine(restoredAddressLine);
    setCity(restoredCity);
    setState(restoredState);
    setPincode(restoredPincode);

    if (restoredCoordinates) {
      setCoordinates(restoredCoordinates);

      setMapRegion({
        ...restoredCoordinates,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      });

      setLocationFound(true);
    } else {
      // The default map is only a starting point.
      // It is not treated as a selected salon location.
      setCoordinates(DEFAULT_COORDINATES);
      setMapRegion(DEFAULT_REGION);
      setLocationFound(false);
    }

    draftRestoredRef.current = true;
    setCurrentStep(CURRENT_STEP);

    console.log('[SalonAddressScreen] Draft restored:', {
      hasAddress: Boolean(restoredAddressLine),
      hasCity: Boolean(restoredCity),
      hasCoordinates: Boolean(restoredCoordinates),
      currentStep: CURRENT_STEP,
    });
  }, [
    isDraftLoading,
    data,
    routeData,
    setCurrentStep,
  ]);

  /* ----------------------------------------------------------
     REVERSE GEOCODING

     Updates address fields for the most recent request only.
  ---------------------------------------------------------- */

  const resolveAddressFromCoordinates = useCallback(
    async (
      nextCoordinates: Coordinates,
      showError = true,
    ) => {
      if (!isValidCoordinates(nextCoordinates)) {
        return;
      }

      const requestId = ++addressRequestIdRef.current;

      setCoordinates(nextCoordinates);

      setMapRegion(previous => ({
        ...previous,
        ...nextCoordinates,
      }));

      setLocationFound(true);
      setIsResolvingLocation(true);

      try {
        const result = await reverseGeocode(
          nextCoordinates.latitude,
          nextCoordinates.longitude,
        );

        if (
          !mountedRef.current ||
          requestId !== addressRequestIdRef.current
        ) {
          return;
        }

        if (result) {
          const fields = extractAddressFields(result);

          if (fields.addressLine) {
            setAddressLine(fields.addressLine);
          }

          if (fields.city) {
            setCity(fields.city);
          }

          if (fields.state) {
            setState(fields.state);
          }

          if (fields.pincode) {
            setPincode(fields.pincode);
          }
        }
      } catch (error) {
        console.warn(
          '[SalonAddressScreen] Reverse geocoding failed:',
          error,
        );

        if (
          showError &&
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          Alert.alert(
            'Address unavailable',
            'We could not retrieve the address for this map location. You can enter the address manually.',
          );
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          setIsResolvingLocation(false);
        }
      }
    },
    [],
  );

  /* ----------------------------------------------------------
     ADDRESS SEARCH

     Debounce requests and ignore outdated responses.
  ---------------------------------------------------------- */

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchText(value);

      searchRequestIdRef.current += 1;

      const requestId = searchRequestIdRef.current;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      if (!value.trim()) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      searchTimeoutRef.current = setTimeout(async () => {
        if (
          !mountedRef.current ||
          requestId !== searchRequestIdRef.current
        ) {
          return;
        }

        try {
          const results = await searchAddress(value.trim());

          if (
            !mountedRef.current ||
            requestId !== searchRequestIdRef.current
          ) {
            return;
          }

          setSuggestions(
            Array.isArray(results) ? results : [],
          );
        } catch (error) {
          console.warn(
            '[SalonAddressScreen] Address search failed:',
            error,
          );

          if (
            mountedRef.current &&
            requestId === searchRequestIdRef.current
          ) {
            setSuggestions([]);
          }
        } finally {
          if (
            mountedRef.current &&
            requestId === searchRequestIdRef.current
          ) {
            setIsSearching(false);
          }
        }
      }, 450);
    },
    [],
  );

  /* ----------------------------------------------------------
     SELECT SEARCH SUGGESTION
  ---------------------------------------------------------- */

  const handleSelectSuggestion = useCallback(
    async (suggestion: AddressSuggestion) => {
      Keyboard.dismiss();

      const placeId = (suggestion as any)?.placeId;
      const description = clean(
        (suggestion as any)?.description,
      );

      if (!placeId) {
        Alert.alert(
          'Location unavailable',
          'We could not identify this address. Please choose another search result.',
        );
        return;
      }

      // Invalidate any outstanding address search.
      searchRequestIdRef.current += 1;

      const requestId = ++addressRequestIdRef.current;

      setSearchText(description);
      setSuggestions([]);
      setIsSearching(true);

      try {
        const result = await getPlaceDetails(placeId);

        if (
          !mountedRef.current ||
          requestId !== addressRequestIdRef.current
        ) {
          return;
        }

        const selectedCoordinates =
          extractCoordinates(result);

        if (!selectedCoordinates) {
          Alert.alert(
            'Location unavailable',
            'We could not get the map coordinates for this address. Please select another result.',
          );
          return;
        }

        setCoordinates(selectedCoordinates);

        setMapRegion({
          ...selectedCoordinates,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });

        setLocationFound(true);

        const fields = extractAddressFields(result);

        setAddressLine(
          fields.addressLine || description,
        );

        if (fields.city) {
          setCity(fields.city);
        }

        if (fields.state) {
          setState(fields.state);
        }

        if (fields.pincode) {
          setPincode(fields.pincode);
        }

        setIsMapVisible(false);
      } catch (error) {
        console.warn(
          '[SalonAddressScreen] Could not select address:',
          error,
        );

        if (
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          Alert.alert(
            'Unable to select address',
            'Please try another search result or select your location on the map.',
          );
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          setIsSearching(false);
        }
      }
    },
    [],
  );

  /* ----------------------------------------------------------
     MAP INTERACTIONS
  ---------------------------------------------------------- */

  const handleMapPress = useCallback((event: any) => {
    const nextCoordinates =
      event?.nativeEvent?.coordinate;

    if (!isValidCoordinates(nextCoordinates)) {
      return;
    }

    // A manually selected pin invalidates older geocoding.
    addressRequestIdRef.current += 1;
    setIsResolvingLocation(false);

    setCoordinates(nextCoordinates);

    setMapRegion(previous => ({
      ...previous,
      ...nextCoordinates,
    }));

    setLocationFound(true);
  }, []);

  const handleMarkerDragEnd = useCallback(
    (event: any) => {
      const nextCoordinates =
        event?.nativeEvent?.coordinate;

      if (!isValidCoordinates(nextCoordinates)) {
        return;
      }

      addressRequestIdRef.current += 1;
      setIsResolvingLocation(false);

      setCoordinates(nextCoordinates);

      setMapRegion(previous => ({
        ...previous,
        ...nextCoordinates,
      }));

      setLocationFound(true);
    },
    [],
  );

  const handleConfirmMapLocation = useCallback(async () => {
    if (!isValidCoordinates(coordinates)) {
      Alert.alert(
        'Select a location',
        'Please select a valid location on the map.',
      );
      return;
    }

    setIsMapVisible(false);

    await resolveAddressFromCoordinates(
      coordinates,
      false,
    );
  }, [coordinates, resolveAddressFromCoordinates]);

  /* ----------------------------------------------------------
     CURRENT DEVICE LOCATION
  ---------------------------------------------------------- */

  const requestLocationPermission =
    useCallback(async (): Promise<boolean> => {
      if (Platform.OS !== 'android') {
        return true;
      }

      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location permission',
            message:
              'Clavata uses your location to help you set your salon address accurately.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );

        return (
          result === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.warn(
          '[SalonAddressScreen] Permission request failed:',
          error,
        );

        return false;
      }
    }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();

    if (!mountedRef.current) {
      return;
    }

    if (!hasPermission) {
      Alert.alert(
        'Location permission required',
        'Allow location access or search for your salon address manually.',
      );
      return;
    }

    const requestId = ++locationRequestIdRef.current;

    setIsResolvingLocation(true);

    Geolocation.getCurrentPosition(
      async position => {
        if (
          !mountedRef.current ||
          requestId !== locationRequestIdRef.current
        ) {
          return;
        }

        const nextCoordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        if (!isValidCoordinates(nextCoordinates)) {
          setIsResolvingLocation(false);
          return;
        }

        setCoordinates(nextCoordinates);

        setMapRegion({
          ...nextCoordinates,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });

        setLocationFound(true);

        try {
          const result = await reverseGeocode(
            nextCoordinates.latitude,
            nextCoordinates.longitude,
          );

          if (
            !mountedRef.current ||
            requestId !== locationRequestIdRef.current
          ) {
            return;
          }

          if (result) {
            const fields = extractAddressFields(result);

            if (fields.addressLine) {
              setAddressLine(fields.addressLine);
            }

            if (fields.city) {
              setCity(fields.city);
            }

            if (fields.state) {
              setState(fields.state);
            }

            if (fields.pincode) {
              setPincode(fields.pincode);
            }
          }
        } catch (error) {
          console.warn(
            '[SalonAddressScreen] Current location reverse geocoding failed:',
            error,
          );
        } finally {
          if (
            mountedRef.current &&
            requestId === locationRequestIdRef.current
          ) {
            setIsResolvingLocation(false);
          }
        }
      },
      error => {
        console.warn(
          '[SalonAddressScreen] Current location failed:',
          error,
        );

        if (
          !mountedRef.current ||
          requestId !== locationRequestIdRef.current
        ) {
          return;
        }

        setIsResolvingLocation(false);

        Alert.alert(
          'Unable to get location',
          'Please check that location services are enabled, or search for your address manually.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      },
    );
  }, [requestLocationPermission]);

  /* ----------------------------------------------------------
     VALIDATE FORM
  ---------------------------------------------------------- */

  const validateAddress = useCallback((): boolean => {
    if (!addressLine.trim()) {
      Alert.alert(
        'Address required',
        'Please enter your salon address.',
      );
      return false;
    }

    if (!city.trim()) {
      Alert.alert(
        'City required',
        'Please enter your city.',
      );
      return false;
    }

    if (!state.trim()) {
      Alert.alert(
        'State required',
        'Please enter your state.',
      );
      return false;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      Alert.alert(
        'Invalid PIN code',
        'Please enter a valid six-digit Indian PIN code.',
      );
      return false;
    }

    if (!isValidCoordinates(coordinates) || !locationFound) {
      Alert.alert(
        'Location required',
        'Please search for your salon or select and confirm its location on the map.',
      );
      return false;
    }

    return true;
  }, [
    addressLine,
    city,
    state,
    pincode,
    coordinates,
    locationFound,
  ]);

  /* ----------------------------------------------------------
     SAVE DRAFT AND CONTINUE

     Preserve the full registration object, save Step 3 as the
     current step, and only update completed/current steps
     after saving succeeds.
  ---------------------------------------------------------- */

  const handleConfirmAddress = useCallback(async () => {
    if (
      busy ||
      isResolvingLocation ||
      isSearching
    ) {
      return;
    }

    Keyboard.dismiss();

    if (!validateAddress()) {
      return;
    }

    const nextCompletedSteps = Array.from(
      new Set([
        ...(completedSteps ?? []),
        1,
        CURRENT_STEP,
      ]),
    ).sort((a, b) => a - b);

    const latestData: RegistrationData = {
      ...(data ?? {}),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    setIsSubmitting(true);

    try {
      updateData(latestData);

      const saved = await saveDraft(
        NEXT_STEP,
        nextCompletedSteps,
        latestData,
      );

      if (saved === false) {
        if (mountedRef.current) {
          Alert.alert(
            'Unable to save progress',
            'Your registration progress could not be saved. Please try again before continuing.',
          );
        }
        return;
      }

      if (!mountedRef.current) {
        return;
      }

      markStepCompleted(CURRENT_STEP);
      setCurrentStep(NEXT_STEP);

      navigation.navigate(NEXT_REGISTRATION_ROUTE, {
        initialStep: NEXT_STEP,
        resumeDraft: true,
        completedSteps: nextCompletedSteps,
        registrationData: latestData,
      });
    } catch (error) {
      console.error(
        '[SalonAddressScreen] Failed to save registration draft:',
        error,
      );

      if (mountedRef.current) {
        Alert.alert(
          'Unable to continue',
          'We could not save your registration progress. Please check your connection and try again.',
        );
      }
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    busy,
    isResolvingLocation,
    isSearching,
    validateAddress,
    completedSteps,
    data,
    addressLine,
    city,
    state,
    pincode,
    coordinates,
    updateData,
    saveDraft,
    markStepCompleted,
    setCurrentStep,
    navigation,
  ]);

  /* ----------------------------------------------------------
     PROGRESS
  ---------------------------------------------------------- */

  const progressPercentage =
    (CURRENT_STEP / TOTAL_STEPS) * 100;

  /* ----------------------------------------------------------
     LOADING SCREEN
  ---------------------------------------------------------- */

  if (isDraftLoading || !draftRestoredRef.current) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Please wait ...
        </Text>
      </SafeAreaView>
    );
  }

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

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
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.75}
              onPress={() => navigation.goBack?.()}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.eyebrow}>
                SALON REGISTRATION
              </Text>

              <Text style={styles.title}>
                Salon location
              </Text>

              <Text style={styles.subtitle}>
                Add your salon address so customers can
                find you easily.
              </Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                {String(CURRENT_STEP).padStart(2, '0')}/
                {String(TOTAL_STEPS).padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* PROGRESS */}

          <View style={styles.progressTrack}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            >
              <View />
            </AppGradient>
          </View>

          {/* MAP PREVIEW */}

          <View style={styles.mapCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>◎</Text>
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  Pin your salon location
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Search an address or adjust the map pin.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.mapPreview}
              onPress={() => setIsMapVisible(true)}
            >
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.previewMap}
                region={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                pointerEvents="none"
              >
                {locationFound && (
                  <Marker
                    coordinate={coordinates}
                    title="Salon location"
                  />
                )}
              </MapView>

              <View style={styles.mapOverlay}>
                <View style={styles.mapOverlayButton}>
                  <Text style={styles.mapOverlayButtonText}>
                    Open map and select location
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.currentLocationButton}
              activeOpacity={0.75}
              onPress={handleUseCurrentLocation}
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

            {locationFound && (
              <View style={styles.locationStatus}>
                <View style={styles.locationStatusDot} />

                <Text style={styles.locationStatusText}>
                  Map location selected
                </Text>
              </View>
            )}
          </View>

          {/* ADDRESS FORM */}

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Address details
            </Text>

            <Text style={styles.formDescription}>
              Make sure your address is accurate.
            </Text>

            <Text style={styles.label}>
              Search address
            </Text>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Search area, street or landmark"
                placeholderTextColor={COLORS.placeholder}
                returnKeyType="search"
              />

              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={styles.searchSpinner}
                />
              )}
            </View>

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => {
                  const suggestionKey =
                    (suggestion as any)?.placeId ??
                    `${(suggestion as any)?.description}-${index}`;

                  return (
                    <TouchableOpacity
                      key={suggestionKey}
                      style={styles.suggestionRow}
                      activeOpacity={0.75}
                      onPress={() =>
                        handleSelectSuggestion(suggestion)
                      }
                    >
                      <Text style={styles.suggestionIcon}>⌖</Text>

                      <Text
                        style={styles.suggestionText}
                        numberOfLines={2}
                      >
                        {clean(
                          (suggestion as any)?.description,
                        )}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={styles.label}>
              Full address *
            </Text>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={addressLine}
              onChangeText={setAddressLine}
              placeholder="Building, street, area and landmark"
              placeholderTextColor={COLORS.placeholder}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.label}>City *</Text>

            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              placeholderTextColor={COLORS.placeholder}
              autoCapitalize="words"
              maxLength={100}
            />

            <Text style={styles.label}>State *</Text>

            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="Enter state"
              placeholderTextColor={COLORS.placeholder}
              autoCapitalize="words"
              maxLength={100}
            />

            <Text style={styles.label}>PIN code *</Text>

            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={value =>
                setPincode(
                  value.replace(/[^0-9]/g, '').slice(0, 6),
                )
              }
              placeholder="Enter six-digit PIN code"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Text style={styles.helperText}>
              Fields marked with * are required.
            </Text>
          </View>

          {/* CONTINUE */}

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              busy ||
              isResolvingLocation ||
              isSearching
            }
            onPress={handleConfirmAddress}
            style={[
              styles.continueButton,
              (busy || isResolvingLocation || isSearching) &&
                styles.continueButtonDisabled,
            ]}
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.continueGradient}
            >
              {isSubmitting || isDraftSaving ? (
                <ActivityIndicator
                  color={COLORS.white}
                  size="small"
                />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    Save and continue
                  </Text>

                  <Text style={styles.continueArrow}>→</Text>
                </>
              )}
            </AppGradient>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Your progress is saved as you continue through
            registration.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FULLSCREEN MAP MODAL */}

      <Modal
        visible={isMapVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsMapVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={COLORS.white}
          />

          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsMapVisible(false)}
              activeOpacity={0.75}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                Select salon location
              </Text>

              <Text style={styles.modalSubtitle}>
                Move the map or drag the pin to your salon.
              </Text>
            </View>
          </View>

          {/* MAP SEARCH */}

          <View style={styles.modalSearchWrapper}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Search address or landmark"
                placeholderTextColor={COLORS.placeholder}
                returnKeyType="search"
              />

              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              )}
            </View>

            {suggestions.length > 0 && (
              <View style={styles.modalSuggestions}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {suggestions.map((suggestion, index) => {
                    const suggestionKey =
                      (suggestion as any)?.placeId ??
                      `${(suggestion as any)?.description}-${index}`;

                    return (
                      <TouchableOpacity
                        key={suggestionKey}
                        style={styles.suggestionRow}
                        activeOpacity={0.75}
                        onPress={() =>
                          handleSelectSuggestion(suggestion)
                        }
                      >
                        <Text style={styles.suggestionIcon}>⌖</Text>

                        <Text
                          style={styles.suggestionText}
                          numberOfLines={2}
                        >
                          {clean(
                            (suggestion as any)?.description,
                          )}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* INTERACTIVE MAP */}

          <View style={styles.fullMapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.fullMap}
              region={mapRegion}
              onRegionChangeComplete={region =>
                setMapRegion(region)
              }
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton={false}
            >
              <Marker
                coordinate={coordinates}
                title="Salon location"
                description="Drag this pin to your salon"
                draggable
                onDragEnd={handleMarkerDragEnd}
              />
            </MapView>

            <TouchableOpacity
              style={styles.mapCurrentLocationButton}
              activeOpacity={0.8}
              onPress={handleUseCurrentLocation}
            >
              <Text style={styles.mapCurrentLocationText}>◎</Text>
            </TouchableOpacity>
          </View>

          {/* MAP FOOTER */}

          <View style={styles.mapFooter}>
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesLabel}>
                Selected coordinates
              </Text>

              <Text style={styles.coordinatesText}>
                {coordinates.latitude.toFixed(6)},{' '}
                {coordinates.longitude.toFixed(6)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmLocationButton}
              activeOpacity={0.85}
              onPress={handleConfirmMapLocation}
              disabled={isResolvingLocation}
            >
              <AppGradient
                colors={[...GRADIENTS.SOFT_PURPLE]}
                style={styles.confirmLocationGradient}
              >
                {isResolvingLocation ? (
                  <ActivityIndicator
                    color={COLORS.white}
                    size="small"
                  />
                ) : (
                  <Text style={styles.confirmLocationText}>
                    Confirm location
                  </Text>
                )}
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
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: COLORS.secondaryText,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 30,
    lineHeight: 32,
    color: COLORS.text,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
    paddingTop: 1,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    paddingRight: 4,
  },

  stepBadge: {
    backgroundColor: COLORS.lightPurple,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    marginLeft: 8,
  },

  stepBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },

  /* PROGRESS */

  progressTrack: {
    height: 5,
    backgroundColor: '#EAE5F3',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  /* CARDS */

  mapCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionIconText: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: '700',
  },

  sectionHeadingText: {
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  mapPreview: {
    height: 175,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: '#EAE7F0',
  },

  previewMap: {
    ...StyleSheet.absoluteFillObject,
  },

  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },

  mapOverlayButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  mapOverlayButtonText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },

  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    marginTop: 7,
    gap: 8,
  },

  currentLocationIcon: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '700',
  },

  currentLocationText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },

  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },

  locationStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },

  locationStatusText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '600',
  },

  /* FORM */

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },

  formTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },

  formDescription: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 17,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 13,
  },

  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FDFCFF',
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 13,
  },

  multilineInput: {
    minHeight: 86,
    paddingTop: 13,
  },

  helperText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 14,
  },

  /* SEARCH */

  searchContainer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FDFCFF',
    paddingHorizontal: 12,
  },

  searchIcon: {
    color: COLORS.primary,
    fontSize: 24,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
  },

  searchSpinner: {
    marginLeft: 8,
  },

  suggestionsContainer: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  suggestionIcon: {
    color: COLORS.primary,
    fontSize: 18,
    marginRight: 10,
  },

  suggestionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 17,
  },

  /* CONTINUE */

  continueButton: {
    overflow: 'hidden',
    borderRadius: 15,
  },

  continueButtonDisabled: {
    opacity: 0.65,
  },

  continueGradient: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  continueArrow: {
    color: COLORS.white,
    fontSize: 22,
    marginLeft: 12,
    marginTop: -2,
  },

  footerNote: {
    textAlign: 'center',
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
    paddingHorizontal: 12,
  },

  /* MAP MODAL */

  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  modalCloseText: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 30,
    marginTop: -3,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },

  modalSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  modalSearchWrapper: {
    paddingHorizontal: 15,
    paddingBottom: 12,
    zIndex: 2,
  },

  modalSuggestions: {
    maxHeight: 210,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: 5,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  fullMapContainer: {
    flex: 1,
    backgroundColor: '#ECE9F2',
  },

  fullMap: {
    ...StyleSheet.absoluteFillObject,
  },

  mapCurrentLocationButton: {
    position: 'absolute',
    right: 15,
    bottom: 20,
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  mapCurrentLocationText: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: '700',
  },

  mapFooter: {
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  coordinatesContainer: {
    marginBottom: 12,
  },

  coordinatesLabel: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginBottom: 4,
  },

  coordinatesText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  confirmLocationButton: {
    overflow: 'hidden',
    borderRadius: 13,
  },

  confirmLocationGradient: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  confirmLocationText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default SalonAddressScreen;
