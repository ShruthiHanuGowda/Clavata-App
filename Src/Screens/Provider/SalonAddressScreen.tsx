
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
  Platform,
  PermissionsAndroid,
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

import {
  getPlaceDetails,
  reverseGeocode,
  searchAddress,
  type AddressSuggestion,
  type Coordinates,
} from '../../services/locationService';

type AddressData = {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
};

type RegistrationData = Record<string, unknown> & {
  address?: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  latitude?: number;
  longitude?: number;
};

type Props = {
  navigation: {
    navigate: (
      screen: string,
      params?: Record<string, unknown>,
    ) => void;
    goBack?: () => void;
  };
  route?: {
    params?: {
      registrationData?: RegistrationData;
    };
  };
};

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const MAP_DELTA = {
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const COLORS = {
  primary: '#7655D9',
  primaryLight: '#F2EDFF',
  background: '#F8F7FC',
  surface: '#FFFFFF',
  text: '#211C35',
  muted: '#777389',
  border: '#E8E4F0',
  error: '#C63F52',
  success: '#26845B',
};

const SalonAddressScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const selectedAddressRef = useRef(false);
  const mapRef = useRef<MapView>(null);

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchRequestIdRef = useRef(0);
  const locationRequestIdRef = useRef(0);

  const [coordinates, setCoordinates] =
    useState<Coordinates>(DEFAULT_COORDINATES);

  const [searchText, setSearchText] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [suggestions, setSuggestions] =
    useState<AddressSuggestion[]>([]);

  const [loadingSuggestions, setLoadingSuggestions] =
    useState(false);

  const [loadingAddress, setLoadingAddress] =
    useState(false);

  const [loadingCurrentLocation, setLoadingCurrentLocation] =
    useState(false);

  const [selectingSuggestion, setSelectingSuggestion] =
    useState(false);

  const [locationFound, setLocationFound] =
    useState(false);

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [addressError, setAddressError] = useState('');
  const [searchError, setSearchError] = useState('');

  // RESTORE REGISTRATION DATA
  useEffect(() => {
    const saved = route?.params?.registrationData;

    if (!saved) {
      return;
    }

    if (saved.address) {
      setAddressLine(saved.address.addressLine ?? '');
      setCity(saved.address.city ?? '');
      setState(saved.address.state ?? '');
      setPincode(saved.address.pincode ?? '');
    }

    if (
      typeof saved.latitude === 'number' &&
      typeof saved.longitude === 'number'
    ) {
      const point: Coordinates = {
        latitude: saved.latitude,
        longitude: saved.longitude,
      };

      setCoordinates(point);
      setLocationFound(true);

      mapRef.current?.animateToRegion(
        {
          ...point,
          ...MAP_DELTA,
        },
        0,
      );
    }
  }, [route?.params?.registrationData]);

  // MAP ANIMATION
  const animateMap = useCallback((point: Coordinates) => {
    const region: Region = {
      ...point,
      ...MAP_DELTA,
    };

    mapRef.current?.animateToRegion(region, 450);
  }, []);

  // APPLY REVERSE-GEOCODED ADDRESS
  const applyGeocodedAddress = useCallback(
    (
      data: Awaited<ReturnType<typeof reverseGeocode>>,
    ) => {
      if (!data) {
        setLocationFound(false);

        setAddressError(
          'We could not identify this address. Please enter it manually.',
        );

        return;
      }

      const address = data.address ?? {};

      const streetParts = [
        address.house_number,
        address.road,
        address.neighbourhood,
        address.suburb,
      ].filter(
        (value, index, values) =>
          Boolean(value) &&
          values.indexOf(value) === index,
      );

      const street =
        streetParts.join(', ') ||
        data.formatted_address ||
        '';

      const resolvedCity =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        '';

      setAddressLine(previous => street || previous);
      setCity(resolvedCity);
      setState(address.state ?? '');
      setPincode(address.postcode ?? '');

      setAddressError('');
      setLocationFound(true);
    },
    [],
  );

  // SELECT LOCATION FROM MAP OR CURRENT LOCATION
  const updateSelectedLocation = useCallback(
    async (
      point: Coordinates,
      preserveSearchText = false,
    ) => {
      const requestId =
        ++locationRequestIdRef.current;

      // Invalidate any pending autocomplete request.
      ++searchRequestIdRef.current;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      setCoordinates(point);
      setLocationFound(false);
      setLoadingAddress(true);
      setAddressError('');

      if (!preserveSearchText) {
        selectedAddressRef.current = false;
        setSearchText('');
      }

      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      setSearchError('');

      animateMap(point);

      try {
        const result = await reverseGeocode(
          point.latitude,
          point.longitude,
        );

        if (
          requestId !== locationRequestIdRef.current
        ) {
          return;
        }

        applyGeocodedAddress(result);
      } catch (error) {
        if (
          requestId !== locationRequestIdRef.current
        ) {
          return;
        }

        console.error(
          'Selected location error:',
          error,
        );

        setAddressError(
          'Unable to retrieve the selected address. You can enter it manually.',
        );

        setLocationFound(false);
      } finally {
        if (
          requestId === locationRequestIdRef.current
        ) {
          setLoadingAddress(false);
        }
      }
    },
    [animateMap, applyGeocodedAddress],
  );

  // ADDRESS AUTOCOMPLETE
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Keep suggestions closed while a result is being selected
    // and after a result has been selected.
    if (
      selectingSuggestion ||
      selectedAddressRef.current
    ) {
      ++searchRequestIdRef.current;

      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      setSearchError('');

      return;
    }

    const query = searchText.trim();

    if (query.length < 3) {
      ++searchRequestIdRef.current;

      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      setSearchError('');

      return;
    }

    const requestId =
      ++searchRequestIdRef.current;

    setLoadingSuggestions(true);
    setSearchError('');

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(query);

        // Ignore results from outdated requests.
        if (
          requestId !== searchRequestIdRef.current ||
          selectedAddressRef.current
        ) {
          return;
        }

        setSuggestions(results);
        setShowSuggestions(results.length > 0);

        setSearchError(
          results.length === 0
            ? 'No matching addresses found. Try another search.'
            : '',
        );
      } catch (error) {
        if (
          requestId !== searchRequestIdRef.current ||
          selectedAddressRef.current
        ) {
          return;
        }

        console.error(
          'Autocomplete error:',
          error,
        );

        setSuggestions([]);
        setShowSuggestions(false);

        setSearchError(
          'Address search is temporarily unavailable.',
        );
      } finally {
        if (
          requestId === searchRequestIdRef.current
        ) {
          setLoadingSuggestions(false);
        }
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [searchText, selectingSuggestion]);

  // SELECT AUTOCOMPLETE RESULT
 
const handleSelectSuggestion = useCallback(
  async (suggestion: AddressSuggestion) => {
    // Lock autocomplete before changing any state.
    selectedAddressRef.current = true;

    ++searchRequestIdRef.current;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Invalidate older reverse-geocoding operations.
    ++locationRequestIdRef.current;

    Keyboard.dismiss();

    setSelectingSuggestion(true);
    setLoadingSuggestions(false);
    setLoadingAddress(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchError('');
    setAddressError('');

    try {
      const place = await getPlaceDetails(
        suggestion.placeId,
      );

      if (!place) {
        selectedAddressRef.current = false;

        Alert.alert(
          'Location unavailable',
          'We could not retrieve this address. Please try again.',
        );

        return;
      }

      const latitude = place.latitude;
      const longitude = place.longitude;

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        selectedAddressRef.current = false;

        Alert.alert(
          'Location unavailable',
          'The selected address has invalid coordinates. Please choose another result.',
        );

        return;
      }

      const point: Coordinates = {
        latitude,
        longitude,
      };

      // Preserve the exact selected address in the search field.
      setSearchText(
        suggestion.description.trim(),
      );

      // Populate the form with structured address fields.
      // Fall back to the selected description only if no
      // separate street/address line is returned.
      setAddressLine(
        (place.addressLine || '').trim() ||
          suggestion.description.trim(),
      );

      setCity((place.city || '').trim());
      setState((place.state || '').trim());

      setPincode(
        String(place.pincode || '')
          .replace(/\D/g, '')
          .slice(0, 6),
      );

      // Update selected coordinates and map.
      setCoordinates(point);
      setLocationFound(true);
      setAddressError('');

      animateMap(point);

      // Invalidate any older location lookups.
      ++locationRequestIdRef.current;

      setSuggestions([]);
      setShowSuggestions(false);
      setSearchError('');
    } catch (error) {
      console.error(
        'Place selection error:',
        error,
      );

      selectedAddressRef.current = false;

      Alert.alert(
        'Unable to select address',
        'Please try selecting the address again.',
      );
    } finally {
      setSelectingSuggestion(false);
      setLoadingAddress(false);
    }
  },
  [animateMap],
);


  // LOCATION PERMISSION
  const requestLocationPermission =
    useCallback(async () => {
      if (Platform.OS !== 'android') {
        return true;
      }

      try {
        const permission =
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

        const alreadyGranted =
          await PermissionsAndroid.check(permission);

        if (alreadyGranted) {
          return true;
        }

        const result =
          await PermissionsAndroid.request(
            permission,
            {
              title: 'Clavata location permission',
              message:
                'Clavata uses your location to help you set your salon address.',
              buttonPositive: 'Allow',
              buttonNegative: 'Cancel',
            },
          );

        return (
          result ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error(
          'Location permission error:',
          error,
        );

        return false;
      }
    }, []);

  // CURRENT LOCATION
  const handleUseCurrentLocation =
    useCallback(async () => {
      const permitted =
        await requestLocationPermission();

      if (!permitted) {
        Alert.alert(
          'Location permission required',
          'Allow location access in your device settings, or search for your address manually.',
        );

        return;
      }

      setLoadingCurrentLocation(true);

      Geolocation.getCurrentPosition(
        position => {
          const point: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setLoadingCurrentLocation(false);

          void updateSelectedLocation(point);
        },
        error => {
          console.error(
            'Current location error:',
            error,
          );

          setLoadingCurrentLocation(false);

          Alert.alert(
            'Unable to get location',
            'Check that device location is enabled, then try again or search for your address.',
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000,
        },
      );
    }, [
      requestLocationPermission,
      updateSelectedLocation,
    ]);

  // MAP INTERACTIONS
  const handleMapPress = useCallback(
    (event: {
      nativeEvent: {
        coordinate: Coordinates;
      };
    }) => {
      Keyboard.dismiss();

      void updateSelectedLocation(
        event.nativeEvent.coordinate,
      );
    },
    [updateSelectedLocation],
  );

  const handleMarkerDragEnd = useCallback(
    (event: {
      nativeEvent: {
        coordinate: Coordinates;
      };
    }) => {
      void updateSelectedLocation(
        event.nativeEvent.coordinate,
      );
    },
    [updateSelectedLocation],
  );

  // CONFIRM ADDRESS
  const handleConfirmAddress = useCallback(() => {
    Keyboard.dismiss();

    const trimmedAddress = addressLine.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

    if (!trimmedAddress) {
      Alert.alert(
        'Address required',
        'Enter your salon street address.',
      );

      return;
    }

    if (!trimmedCity) {
      Alert.alert(
        'City required',
        'Enter your salon city.',
      );

      return;
    }

    if (!trimmedState) {
      Alert.alert(
        'State required',
        'Enter your salon state.',
      );

      return;
    }

    if (!/^\d{6}$/.test(trimmedPincode)) {
      Alert.alert(
        'Invalid PIN code',
        'Enter a valid 6-digit Indian PIN code.',
      );

      return;
    }

    if (
      !Number.isFinite(coordinates.latitude) ||
      !Number.isFinite(coordinates.longitude) ||
      coordinates.latitude < -90 ||
      coordinates.latitude > 90 ||
      coordinates.longitude < -180 ||
      coordinates.longitude > 180
    ) {
      Alert.alert(
        'Location required',
        'Please select your location on the map.',
      );

      return;
    }

    const addressData: AddressData = {
      addressLine: trimmedAddress,
      city: trimmedCity,
      state: trimmedState,
      pincode: trimmedPincode,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    // Preserve all registration data from the previous step.
    const existingData =
      route?.params?.registrationData ?? {};

    const registrationData: RegistrationData = {
      ...existingData,
      address: {
        addressLine: addressData.addressLine,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
      },
      latitude: addressData.latitude,
      longitude: addressData.longitude,
    };

    navigation.navigate('SalonBusinessHours', {
      registrationData,
    });
  }, [
    addressLine,
    city,
    state,
    pincode,
    coordinates,
    navigation,
    route?.params?.registrationData,
  ]);

  // CLEANUP
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      ++searchRequestIdRef.current;
      ++locationRequestIdRef.current;
    };
  }, []);

  // UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
            onPress={() => navigation.goBack?.()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            {/* <Text style={styles.stepLabel}>
              SALON REGISTRATION · STEP 2
            </Text> */}

            <Text style={styles.title}>
              Your business location
            </Text>

            <Text style={styles.subtitle}>
              Help customers find your company easily.
            </Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ADDRESS SEARCH */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Find your address
            </Text>

            <Text style={styles.helperText}>
              Search for your salon, choose a result, or pin
              the exact location on the map.
            </Text>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                value={searchText}
                onChangeText={value => {
                  // Editing explicitly unlocks autocomplete.
                  selectedAddressRef.current = false;

                  ++searchRequestIdRef.current;

                  setSearchText(value);
                  setSearchError('');

                  const hasEnoughText =
                    value.trim().length >= 3;

                  setShowSuggestions(hasEnoughText);

                  if (!hasEnoughText) {
                    setSuggestions([]);
                    setLoadingSuggestions(false);
                  }
                }}
                onFocus={() => {
                  // Do not reopen results for a selected address.
                  if (selectedAddressRef.current) {
                    setShowSuggestions(false);
                    setSuggestions([]);
                    return;
                  }

                  setShowSuggestions(
                    searchText.trim().length >= 3,
                  );
                }}
                placeholder="Search street, area or landmark"
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Search salon address"
              />

              {loadingSuggestions ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : null}
            </View>

            {showSuggestions &&
              suggestions.length > 0 ? (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={item.placeId}
                    style={[
                      styles.suggestionItem,
                      index === suggestions.length - 1 &&
                      styles.lastSuggestion,
                    ]}
                    onPress={() =>
                      void handleSelectSuggestion(item)
                    }
                    disabled={selectingSuggestion}
                    accessibilityRole="button"
                  >
                    <View
                      style={styles.suggestionIconContainer}
                    >
                      <Text style={styles.suggestionIcon}>
                        ⌖
                      </Text>
                    </View>

                    <Text style={styles.suggestionText}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {!!searchError && showSuggestions ? (
              <Text style={styles.errorText}>
                {searchError}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={() =>
                void handleUseCurrentLocation()
              }
              disabled={loadingCurrentLocation}
              accessibilityRole="button"
            >
              {loadingCurrentLocation ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : (
                <Text style={styles.currentLocationIcon}>
                  ◎
                </Text>
              )}

              <Text style={styles.currentLocationText}>
                Use my current location
              </Text>
            </TouchableOpacity>
          </View>

          {/* MAP */}
          <View style={styles.card}>
            <View style={styles.mapHeader}>
              <View style={styles.mapHeaderContent}>
                <Text style={styles.sectionTitle}>
                  Pin your business location
                </Text>

                <Text style={styles.helperText}>
                  Move the pin to the exact entrance or building.
                </Text>
              </View>

              <View style={styles.mapBadge}>
                <Text style={styles.mapBadgeText}>
                  MAP
                </Text>
              </View>
            </View>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  ...DEFAULT_COORDINATES,
                  ...MAP_DELTA,
                }}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton={false}
                loadingEnabled
                toolbarEnabled={false}
              >
                <Marker
                  coordinate={coordinates}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                  title="Your salon"
                  description="Drag to adjust the salon location"
                  pinColor="red"
                />
              </MapView>

              <TouchableOpacity
                style={styles.mapLocationButton}
                onPress={() =>
                  void handleUseCurrentLocation()
                }
                accessibilityRole="button"
                accessibilityLabel="Move map to current location"
              >
                <Text style={styles.mapLocationButtonText}>
                  ◎
                </Text>
              </TouchableOpacity>
            </View>

            {loadingAddress ? (
              <View style={styles.loadingAddress}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />

                <Text style={styles.loadingAddressText}>
                  Getting address details…
                </Text>
              </View>
            ) : locationFound ? (
              <View style={styles.locationSuccess}>
                <Text style={styles.successIcon}>✓</Text>

                <Text style={styles.successText}>
                  Location selected
                </Text>
              </View>
            ) : (
              <Text style={styles.mapHint}>
                Tap the map or drag the pin to select your
                location.
              </Text>
            )}
          </View>

          {/* ADDRESS DETAILS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Address details
            </Text>

            <Text style={styles.helperText}>
              Review the details and correct anything that is
              missing.
            </Text>

            {!!addressError ? (
              <Text style={styles.errorText}>
                {addressError}
              </Text>
            ) : null}

            <Text style={styles.fieldLabel}>
              Street address *
            </Text>

            <TextInput
              value={addressLine}
              onChangeText={setAddressLine}
              placeholder="Building, street, area or landmark"
              placeholderTextColor={COLORS.muted}
              style={[
                styles.input,
                styles.multilineInput,
              ]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Street address"
            />

            <Text style={styles.fieldLabel}>City *</Text>

            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              accessibilityLabel="City"
            />

            <Text style={styles.fieldLabel}>State *</Text>

            <TextInput
              value={state}
              onChangeText={setState}
              placeholder="Enter state"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              accessibilityLabel="State"
            />

            <Text style={styles.fieldLabel}>
              PIN code *
            </Text>

            <TextInput
              value={pincode}
              onChangeText={value =>
                setPincode(
                  value.replace(/\D/g, '').slice(0, 6),
                )
              }
              placeholder="6-digit PIN code"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="PIN code"
            />

            <View style={styles.coordinateInfo}>
              <Text style={styles.coordinateLabel}>
                Selected coordinates
              </Text>

              <Text style={styles.coordinateValue}>
                {coordinates.latitude.toFixed(6)},{' '}
                {coordinates.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmAddress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Save location and continue"
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>
                Save location and continue
              </Text>

              <Text style={styles.confirmButtonArrow}>
                →
              </Text>
            </AppGradient>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Your location helps customers discover your salon
            nearby.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 30,
    lineHeight: 32,
    marginTop: -3,
  },
  headerContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#261B49',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 13,
  },
  searchContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFAFE',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 25,
    color: COLORS.primary,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: 10,
  },
  suggestionsContainer: {
    marginTop: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDF5',
  },
  lastSuggestion: {
    borderBottomWidth: 0,
  },
  suggestionIconContainer: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestionIcon: {
    color: COLORS.primary,
    fontSize: 20,
  },
  suggestionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },
  currentLocationButton: {
    minHeight: 45,
    marginTop: 11,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currentLocationIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  currentLocationText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  mapHeaderContent: {
    flex: 1,
  },
  mapBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    marginLeft: 8,
  },
  mapBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mapContainer: {
    height: 245,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#EEEAF6',
  },
  map: {
    flex: 1,
  },
  mapLocationButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  mapLocationButtonText: {
    color: COLORS.primary,
    fontSize: 25,
  },
  mapHint: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  loadingAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    gap: 8,
  },
  loadingAddressText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  locationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    gap: 7,
  },
  successIcon: {
    color: COLORS.success,
    fontWeight: '900',
    fontSize: 15,
  },
  successText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    backgroundColor: '#FFFEFF',
    fontSize: 13,
  },
  multilineInput: {
    minHeight: 82,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 5,
  },
  coordinateInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F6FC',
  },
  coordinateLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 5,
  },
  coordinateValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  confirmButtonGradient: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmButtonArrow: {
    marginBottom: 6,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    position: 'absolute',
    right: 65,
  },
  footerNote: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 13,
    paddingHorizontal: 14,
  },
});

export default SalonAddressScreen;
