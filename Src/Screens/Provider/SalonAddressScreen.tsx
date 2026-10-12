import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  FlatList,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Geolocation from '@react-native-community/geolocation';

import MapView, {
  MapPressEvent,
  Marker,
  MarkerDragStartEndEvent,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';

import { reverseGeocode } from '../../services/locationService';
import { Header } from '../../components';
import AppGradient from '../../common/AppGradient';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  GRADIENTS,
} from '../../constants/constants';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationMode = 'current' | 'address' | null;

type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
};

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const SELECTED_LOCATION_DELTA = {
  latitudeDelta: 0.003,
  longitudeDelta: 0.003,
};

const INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export default function SalonAddressScreen({
  navigation,
}: any) {
  const { updateData } = useSalonRegistration();

  const mapRef = useRef<MapView>(null);

  // Address
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // State and city selection
  const [selectionModal, setSelectionModal] =
    useState<'city' | 'state' | null>(null);

  const [selectionSearch, setSelectionSearch] = useState('');
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityLoadError, setCityLoadError] = useState('');

  // Location
  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null);

  const [locationMode, setLocationMode] =
    useState<LocationMode>(null);

  const [locationFound, setLocationFound] = useState(false);

  // Loading
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  // Search
  const [searchText, setSearchText] = useState('');
  const [selectedDisplayName, setSelectedDisplayName] = useState('');

  // Map
  const [mapRegion, setMapRegion] = useState<Region>({
    ...DEFAULT_COORDINATES,
    ...DEFAULT_DELTA,
  });

  const isLocationBusy =
    gettingLocation || searchingAddress || reverseGeocoding;

  const addressComplete =
    !!addressLine.trim() &&
    !!city.trim() &&
    !!state.trim() &&
    /^\d{6}$/.test(pincode.trim());

  const locationLocked =
    locationFound && coordinates !== null && addressComplete;

  const buildAddressSearchQuery = useCallback(() => {
    return [
      addressLine.trim(),
      city.trim(),
      state.trim(),
      pincode.trim(),
      'India',
    ]
      .filter(Boolean)
      .join(', ');
  }, [addressLine, city, state, pincode]);

  useEffect(() => {
    if (locationMode !== 'address' || locationFound) {
      return;
    }

    setSearchText(buildAddressSearchQuery());
  }, [
    addressLine,
    city,
    state,
    pincode,
    locationMode,
    locationFound,
    buildAddressSearchQuery,
  ]);

  // ----------------------------------------------------------
  // FORWARD GEOCODING
  // ----------------------------------------------------------

  const geocodeAddress = useCallback(
    async (query: string): Promise<GeocodeResult | null> => {
      try {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
          return null;
        }

        const url =
          'https://nominatim.openstreetmap.org/search?' +
          `q=${encodeURIComponent(trimmedQuery)}` +
          '&format=jsonv2&limit=1&addressdetails=1&countrycodes=in';

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'ClavataSalonApp/1.0',
          },
        });

        if (!response.ok) {
          throw new Error(
            `Geocoding failed with status ${response.status}`,
          );
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          return null;
        }

        const result = data[0] as {
          lat?: string;
          lon?: string;
          display_name?: string;
        };

        const latitude = Number(result.lat);
        const longitude = Number(result.lon);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          return null;
        }

        return {
          latitude,
          longitude,
          displayName: result.display_name || trimmedQuery,
        };
      } catch (error) {
        console.error('GEOCODE ADDRESS ERROR:', error);
        return null;
      }
    },
    [],
  );

  // ----------------------------------------------------------
  // REVERSE GEOCODING
  // ----------------------------------------------------------

  const applyReverseGeocode = useCallback(
    async (
      location: Coordinates,
      preserveSearchText = false,
    ): Promise<boolean> => {
      try {
        setReverseGeocoding(true);

        const data = await reverseGeocode(
          location.latitude,
          location.longitude,
        );

        if (!data) {
          return false;
        }

        const address = data.address || {};

        const addressLineParts = [
          address.house_number,
          address.road,
          address.neighbourhood,
          address.suburb,
        ].filter(Boolean);

        const newAddressLine = addressLineParts.join(', ');

        const newCity =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.county ||
          '';

        const newState = address.state || '';
        const newPincode = address.postcode || '';
        const displayName = data.display_name || '';

        if (newAddressLine.trim()) {
          setAddressLine(newAddressLine.trim());
        }

        if (newCity.trim()) {
          setCity(newCity.trim());
        }

        if (newState.trim()) {
          setState(newState.trim());
        }

        if (newPincode.trim()) {
          setPincode(
            newPincode.replace(/\D/g, '').slice(0, 6),
          );
        }

        if (!preserveSearchText && displayName.trim()) {
          setSearchText(displayName.trim());
          setSelectedDisplayName(displayName.trim());
        }

        return true;
      } catch (error) {
        console.error('REVERSE GEOCODE ERROR:', error);
        return false;
      } finally {
        setReverseGeocoding(false);
      }
    },
    [],
  );

  // ----------------------------------------------------------
  // UPDATE LOCATION AND MAP PIN
  // ----------------------------------------------------------

  const updateSelectedLocation = useCallback(
    async (
      newCoordinates: Coordinates,
      preserveSearchText = false,
    ): Promise<boolean> => {
      const { latitude, longitude } = newCoordinates;

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return false;
      }

      const validCoordinates = { latitude, longitude };

      const newRegion: Region = {
        ...validCoordinates,
        ...SELECTED_LOCATION_DELTA,
      };

      // Update the marker coordinates immediately.
      setCoordinates(validCoordinates);
      setMapRegion(newRegion);
      setLocationFound(true);

      // Animate if the map is already mounted.
      requestAnimationFrame(() => {
        mapRef.current?.animateToRegion(newRegion, 500);
      });

      return applyReverseGeocode(
        validCoordinates,
        preserveSearchText,
      );
    },
    [applyReverseGeocode],
  );

  // Recenter the map after it mounts or the selected location changes.
  useEffect(() => {
    if (!locationFound || !coordinates) {
      return;
    }

    const region: Region = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      ...SELECTED_LOCATION_DELTA,
    };

    setMapRegion(region);

    const frame = requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(region, 500);
    });

    return () => cancelAnimationFrame(frame);
  }, [coordinates, locationFound]);

  // ----------------------------------------------------------
  // LOAD CITIES
  // ----------------------------------------------------------

  const loadCitiesForState = useCallback(
    async (stateName: string) => {
      setLoadingCities(true);
      setCityLoadError('');
      setCityOptions([]);

      try {
        const response = await fetch(
          'https://countriesnow.space/api/v0.1/countries/state/cities',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              country: 'India',
              state: stateName,
            }),
          },
        );

        const result = await response.json();

        if (
          !response.ok ||
          result?.error ||
          !Array.isArray(result?.data)
        ) {
          throw new Error('City list unavailable');
        }

        const cities = [
          ...new Set<string>(
            result.data
              .filter(
                (item: unknown) =>
                  typeof item === 'string' && item.trim(),
              )
              .map((item: string) => item.trim()),
          ),
        ].sort((a, b) => a.localeCompare(b));

        setCityOptions(cities);
      } catch (error) {
        console.error('LOAD CITIES ERROR:', error);

        setCityLoadError(
          'Could not load cities. Please check your internet connection and try again.',
        );
      } finally {
        setLoadingCities(false);
      }
    },
    [],
  );

  const visibleSelectionOptions = useMemo(() => {
    const options =
      selectionModal === 'state' ? INDIA_STATES : cityOptions;

    const query = selectionSearch.trim().toLowerCase();

    return options.filter(item =>
      item.toLowerCase().includes(query),
    );
  }, [selectionModal, selectionSearch, cityOptions]);

  const openSelectionModal = useCallback(
    (type: 'city' | 'state') => {
      if (locationLocked) {
        return;
      }

      setSelectionSearch('');
      setSelectionModal(type);

      if (
        type === 'city' &&
        state.trim() &&
        cityOptions.length === 0
      ) {
        loadCitiesForState(state.trim());
      }
    },
    [locationLocked, state, cityOptions.length, loadCitiesForState],
  );

  const selectAddressOption = useCallback(
    (value: string) => {
      if (selectionModal === 'state') {
        setState(value);
        setCity('');
        setCityOptions([]);
        setCityLoadError('');
        loadCitiesForState(value);
      } else if (selectionModal === 'city') {
        setCity(value);
      }

      setSelectionModal(null);
      setSelectionSearch('');
    },
    [selectionModal, loadCitiesForState],
  );

  // ----------------------------------------------------------
  // ADDRESS FIELD CHANGES
  // ----------------------------------------------------------

  const handleAddressFieldChange = useCallback(
    (
      field: 'address' | 'city' | 'state' | 'pincode',
      value: string,
    ) => {
      if (locationLocked) {
        return;
      }

      switch (field) {
        case 'address':
          setAddressLine(value);
          break;
        case 'city':
          setCity(value);
          break;
        case 'state':
          setState(value);
          break;
        case 'pincode':
          setPincode(value.replace(/\D/g, '').slice(0, 6));
          break;
      }
    },
    [locationLocked],
  );

  // ----------------------------------------------------------
  // SELECT ADDRESS MODE
  // ----------------------------------------------------------

  const handleSelectAddressMode = useCallback(() => {
    if (isLocationBusy || locationFound) {
      return;
    }

    setLocationMode('address');

    const query = buildAddressSearchQuery();

    if (query) {
      setSearchText(query);
    }
  }, [isLocationBusy, locationFound, buildAddressSearchQuery]);

  // ----------------------------------------------------------
  // CURRENT LOCATION
  // ----------------------------------------------------------

  const handleUseCurrentLocation = useCallback(async () => {
    if (gettingLocation || locationFound) {
      return;
    }

    try {
      setLocationMode('current');
      setGettingLocation(true);

      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'Clavata uses your location to place your business accurately on the map.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );

        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Location Permission Required',
            'Please allow location access to use your current location.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );

          setLocationMode(null);
          return;
        }
      }

      const location = await new Promise<Coordinates | null>(
        resolve => {
          Geolocation.getCurrentPosition(
            position => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            error => {
              console.log('GPS ERROR:', error);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            },
          );
        },
      );

      if (!location) {
        Alert.alert(
          'Location unavailable',
          'We could not determine your current location. Make sure your device location is turned on and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );

        setLocationMode(null);
        return;
      }

      const success = await updateSelectedLocation(location);

      if (!success) {
        Alert.alert(
          'Address unavailable',
          'The map pin has been placed. Please complete any missing address details manually.',
        );
      }
    } catch (error) {
      console.error('CURRENT LOCATION ERROR:', error);
      setLocationMode(null);

      Alert.alert(
        'Location unavailable',
        'Unable to get your current location. Please try again.',
      );
    } finally {
      setGettingLocation(false);
    }
  }, [gettingLocation, locationFound, updateSelectedLocation]);

  // ----------------------------------------------------------
  // SEARCH ADDRESS
  // ----------------------------------------------------------

  const handleSearchAddress = useCallback(async () => {
    const query = searchText.trim();

    if (!query) {
      Alert.alert(
        'Enter Address',
        'Please enter your salon address.',
      );
      return;
    }

    setSearchingAddress(true);
    setLocationMode('address');

    try {
      const queries = [
        query,
        query.toLowerCase().includes('india')
          ? query
          : `${query}, India`,
        [
          addressLine.trim(),
          city.trim(),
          state.trim(),
          pincode.trim(),
          'India',
        ]
          .filter(Boolean)
          .join(', '),
      ].filter(
        (item, index, all) =>
          item && all.indexOf(item) === index,
      );

      let result: GeocodeResult | null = null;

      for (const searchQuery of queries) {
        result = await geocodeAddress(searchQuery);

        if (result) {
          break;
        }
      }

      if (!result) {
        Alert.alert(
          'Address Not Found',
          'We could not find that address. Try searching with the area, city and PIN code, for example: Indiranagar, Bengaluru, Karnataka, 560038.',
        );
        return;
      }

      const newCoordinates: Coordinates = {
        latitude: result.latitude,
        longitude: result.longitude,
      };

      const newRegion: Region = {
        ...newCoordinates,
        ...SELECTED_LOCATION_DELTA,
      };

      setSelectedDisplayName(result.displayName);
      setCoordinates(newCoordinates);
      setMapRegion(newRegion);
      setLocationFound(true);

      const reverseSuccess = await applyReverseGeocode(
        newCoordinates,
        true,
      );

      if (!reverseSuccess) {
        Alert.alert(
          'Location Found',
          'The map has been positioned at the search result. Please check the pin and complete the address details manually.',
        );
      }
    } catch (error) {
      console.error('SEARCH ADDRESS ERROR:', error);

      Alert.alert(
        'Search Failed',
        'Please check your internet connection and try again.',
      );
    } finally {
      setSearchingAddress(false);
    }
  }, [
    searchText,
    addressLine,
    city,
    state,
    pincode,
    geocodeAddress,
    applyReverseGeocode,
  ]);

  // ----------------------------------------------------------
  // MAP EVENTS
  // ----------------------------------------------------------

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setMapRegion(region);
    },
    [],
  );

  const handleMapPress = useCallback(
    async (event: MapPressEvent) => {
      if (reverseGeocoding) {
        return;
      }

      const { latitude, longitude } =
        event.nativeEvent.coordinate;

      const success = await updateSelectedLocation({
        latitude,
        longitude,
      });

      if (!success) {
        Alert.alert(
          'Address unavailable',
          'The pin has been moved. Please complete any missing address details manually.',
        );
      }
    },
    [reverseGeocoding, updateSelectedLocation],
  );

  const handleMarkerDragEnd = useCallback(
    async (event: MarkerDragStartEndEvent) => {
      if (reverseGeocoding) {
        return;
      }

      const { latitude, longitude } =
        event.nativeEvent.coordinate;

      const success = await updateSelectedLocation({
        latitude,
        longitude,
      });

      if (!success) {
        Alert.alert(
          'Address unavailable',
          'The pin has been moved. Please complete any missing address details manually.',
        );
      }
    },
    [reverseGeocoding, updateSelectedLocation],
  );

  // ----------------------------------------------------------
  // CHANGE LOCATION
  // ----------------------------------------------------------

  const handleChangeLocation = useCallback(() => {
    if (isLocationBusy) {
      return;
    }

    setCoordinates(null);
    setLocationFound(false);
    setLocationMode(null);

    setAddressLine('');
    setCity('');
    setState('');
    setPincode('');
    setSearchText('');
    setSelectedDisplayName('');

    setMapRegion({
      ...DEFAULT_COORDINATES,
      ...DEFAULT_DELTA,
    });
  }, [isLocationBusy]);

  // ----------------------------------------------------------
  // CONFIRM LOCATION
  // ----------------------------------------------------------

  const handleConfirmLocation = useCallback(() => {
    if (!coordinates) {
      Alert.alert(
        'Select your location',
        'Please search for your business address or use your current location first.',
      );
      return;
    }

    if (!addressLine.trim()) {
      Alert.alert(
        'Address required',
        'Please enter your business street address.',
      );
      return;
    }

    if (!city.trim()) {
      Alert.alert('City required', 'Please enter your city.');
      return;
    }

    if (!state.trim()) {
      Alert.alert('State required', 'Please enter your state.');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert(
        'Invalid Pincode',
        'Please enter a valid 6-digit Indian pincode.',
      );
      return;
    }

    updateData({
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });

    navigation.navigate('SalonBusinessHours');
  }, [
    coordinates,
    addressLine,
    city,
    state,
    pincode,
    updateData,
    navigation,
  ]);

  const locationSummary = useMemo(
    () =>
      [
        addressLine.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
      ]
        .filter(Boolean)
        .join(', '),
    [addressLine, city, state, pincode],
  );

  const showAddressFields =
    (locationMode === 'address' && !locationFound) ||
    (locationFound && !addressComplete);

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Business Address" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introSection}>
            <Text style={styles.pageTitle}>
              Find your business location
            </Text>

            <Text style={styles.pageSubtitle}>
              Add your business location so customers can easily find it.
            </Text>
          </View>

          {!locationFound && (
            <View style={styles.methodSection}>
              <Text style={styles.sectionTitle}>
                Choose how to add your location
              </Text>

              <Text style={styles.sectionSubtitle}>
                Use your current location if you are at your business,
                or enter the address manually.
              </Text>

              <TouchableOpacity
                style={[
                  styles.methodCard,
                  locationMode === 'current' &&
                    styles.methodCardSelected,
                  gettingLocation && styles.methodCardDisabled,
                ]}
                onPress={handleUseCurrentLocation}
                disabled={isLocationBusy}
                activeOpacity={0.85}
              >
                {locationMode === 'current' && (
                  <AppGradient
                    colors={[...GRADIENTS.SOFT_PURPLE]}
                    style={styles.selectedMethodGradient}
                  >
                    <View style={styles.selectedMethodGradientInner} />
                  </AppGradient>
                )}

                <View style={styles.methodIcon}>
                  <Text style={styles.methodIconText}>◎</Text>
                </View>

                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>
                    Use my current location
                  </Text>

                  <Text style={styles.methodDescription}>
                    Best if you are currently at your business.
                  </Text>
                </View>

                {gettingLocation ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.themeColor}
                  />
                ) : (
                  <Text style={styles.chevron}>›</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodCard,
                  locationMode === 'address' &&
                    styles.methodCardSelected,
                ]}
                onPress={handleSelectAddressMode}
                disabled={isLocationBusy}
                activeOpacity={0.85}
              >
                {locationMode === 'address' && (
                  <AppGradient
                    colors={[...GRADIENTS.SOFT_PURPLE]}
                    style={styles.selectedMethodGradient}
                  >
                    <View style={styles.selectedMethodGradientInner} />
                  </AppGradient>
                )}

                <View style={styles.methodIcon}>
                  <Text style={styles.methodIconText}>⌖</Text>
                </View>

                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>
                    Enter business address
                  </Text>

                  <Text style={styles.methodDescription}>
                    Enter your address and find it on the map.
                  </Text>
                </View>

                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {showAddressFields && (
            <View style={styles.addressSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Business address
                </Text>

                <Text style={styles.requiredText}>* Required</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>

                <TextInput
                  value={addressLine}
                  onChangeText={value =>
                    handleAddressFieldChange('address', value)
                  }
                  placeholder="House / building / street"
                  placeholderTextColor={COLORS.textMuted}
                  editable={!locationLocked}
                  style={[
                    styles.input,
                    locationLocked && styles.inputDisabled,
                  ]}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>State</Text>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => openSelectionModal('state')}
                    disabled={locationLocked}
                    style={[
                      styles.input,
                      styles.selectInput,
                      locationLocked && styles.inputDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectInputText,
                        !state && styles.selectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {state || 'Select state'}
                    </Text>

                    <Text style={styles.selectArrow}>⌄</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>City</Text>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => openSelectionModal('city')}
                    disabled={locationLocked}
                    style={[
                      styles.input,
                      styles.selectInput,
                      locationLocked && styles.inputDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectInputText,
                        !city && styles.selectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {city || 'Select city'}
                    </Text>

                    <Text style={styles.selectArrow}>⌄</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pincode</Text>

                <TextInput
                  value={pincode}
                  onChangeText={value =>
                    handleAddressFieldChange('pincode', value)
                  }
                  placeholder="6-digit pincode"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!locationLocked}
                  style={[
                    styles.input,
                    styles.pincodeInput,
                    locationLocked && styles.inputDisabled,
                  ]}
                />
              </View>

              {!locationFound && (
                <View style={styles.searchSection}>
                  <Text style={styles.searchTitle}>
                    Find your business location
                  </Text>

                  <Text style={styles.searchDescription}>
                    Search using your address, area, landmark or pincode.
                  </Text>

                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Enter area, street, landmark or pincode"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.searchInput}
                    editable={!searchingAddress}
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={handleSearchAddress}
                  />

                  <TouchableOpacity
                    style={[
                      styles.gradientButtonWrapper,
                      (searchingAddress || !searchText.trim()) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleSearchAddress}
                    disabled={
                      searchingAddress || !searchText.trim()
                    }
                    activeOpacity={0.85}
                  >
                    <AppGradient
                      colors={[...GRADIENTS.SOFT_PURPLE]}
                      style={styles.searchButton}
                    >
                      {searchingAddress ? (
                        <>
                          <ActivityIndicator
                            size="small"
                            color={COLORS.white}
                          />
                          <Text style={styles.searchButtonText}>
                            Finding location...
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.searchButtonText}>
                          Search
                        </Text>
                      )}
                    </AppGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {locationFound && coordinates && (
            <View style={styles.locationFoundSection}>
              <View style={styles.foundCard}>
                <AppGradient
                  colors={[...GRADIENTS.SOFT_PURPLE]}
                  style={styles.foundIcon}
                >
                  <Text style={styles.foundIconText}>✓</Text>
                </AppGradient>

                <View style={styles.foundContent}>
                  <Text style={styles.foundTitle}>
                    Location selected
                  </Text>

                  <Text style={styles.foundDescription}>
                    Check the map and ensure the pin is at your business.
                    Drag the pin to correct its position if needed.
                  </Text>
                </View>
              </View>

              <View style={styles.mapSection}>
                <Text style={styles.sectionTitle}>
                  Verify your location
                </Text>

                <Text style={styles.mapInstruction}>
                  Tap the map or drag the pin to place it as close as
                  possible to your business entrance.
                </Text>

                <View style={styles.mapContainer}>
                  <MapView
                    ref={mapRef}
                    provider={
                      Platform.OS === 'android'
                        ? PROVIDER_GOOGLE
                        : undefined
                    }
                    style={styles.map}
                    initialRegion={{
                      ...coordinates,
                      ...SELECTED_LOCATION_DELTA,
                    }}
                    region={mapRegion}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    onPress={handleMapPress}
                    showsUserLocation={locationMode === 'current'}
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                    loadingEnabled
                    moveOnMarkerPress={false}
                  >
                    {/* Use the native map marker, not a custom emoji view. */}
                    <Marker
                      coordinate={coordinates}
                      title="Salon location"
                      description="Your selected salon location"
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                      anchor={{ x: 0.5, y: 1 }}
                      zIndex={1000}
                    />
                  </MapView>

                  {reverseGeocoding && (
                    <View style={styles.mapLoading}>
                      <ActivityIndicator
                        size="small"
                        color={COLORS.themeColor}
                      />
                      <Text style={styles.mapLoadingText}>
                        Updating address...
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.mapHint}>
                  {selectedDisplayName
                    ? `Search result: ${selectedDisplayName}`
                    : 'Tap the map or drag the pin to adjust the exact location.'}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Text style={styles.summaryIconText}>⌖</Text>
                </View>

                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>
                    Business location
                  </Text>

                  <Text style={styles.summaryAddress}>
                    {locationSummary || 'Location selected'}
                  </Text>

                  <Text style={styles.coordinatesText}>
                    {coordinates.latitude.toFixed(6)},{' '}
                    {coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.changeLocationButton}
                onPress={handleChangeLocation}
                disabled={isLocationBusy}
                activeOpacity={0.7}
              >
                <Text style={styles.changeLocationText}>
                  Change location
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gradientButtonWrapper,
                  styles.continueButtonWrapper,
                  (reverseGeocoding || !addressComplete) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleConfirmLocation}
                disabled={reverseGeocoding || !addressComplete}
                activeOpacity={0.85}
              >
                <AppGradient
                  colors={[...GRADIENTS.SOFT_PURPLE]}
                  style={styles.continueButton}
                >
                  {reverseGeocoding ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color={COLORS.white}
                      />
                      <Text style={styles.continueButtonText}>
                        Updating...
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.continueButtonText}>
                      Verify & Continue
                    </Text>
                  )}
                </AppGradient>
              </TouchableOpacity>

              {!addressComplete && (
                <Text style={styles.validationHint}>
                  Complete the address, city, state and 6-digit pincode
                  to continue.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={selectionModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectionModal(null)}
      >
        <View style={styles.selectionModalOverlay}>
          <View style={styles.selectionModalCard}>
            <View style={styles.selectionModalHeader}>
              <Text style={styles.selectionModalTitle}>
                {selectionModal === 'state'
                  ? 'Select state / union territory'
                  : 'Select city'}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectionModal(null)}
                hitSlop={10}
              >
                <Text style={styles.selectionModalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={selectionSearch}
              onChangeText={setSelectionSearch}
              placeholder={
                selectionModal === 'state'
                  ? 'Search state...'
                  : 'Search city...'
              }
              placeholderTextColor={COLORS.textMuted}
              style={styles.selectionSearchInput}
              autoCorrect={false}
            />

            {selectionModal === 'city' && loadingCities ? (
              <View style={styles.selectionLoading}>
                <ActivityIndicator color={COLORS.themeColor} />
                <Text style={styles.selectionMessage}>
                  Loading cities...
                </Text>
              </View>
            ) : selectionModal === 'city' && cityLoadError ? (
              <View style={styles.selectionLoading}>
                <Text style={styles.selectionMessage}>
                  {cityLoadError}
                </Text>

                <TouchableOpacity
                  style={styles.selectionRetry}
                  onPress={() => {
                    if (state.trim()) {
                      loadCitiesForState(state.trim());
                    }
                  }}
                >
                  <Text style={styles.selectionRetryText}>
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : selectionModal === 'city' && !state.trim() ? (
              <View style={styles.selectionLoading}>
                <Text style={styles.selectionMessage}>
                  Select a state first.
                </Text>
              </View>
            ) : (
              <FlatList
                data={visibleSelectionOptions}
                keyExtractor={item => item}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectionOption}
                    onPress={() => selectAddressOption(item)}
                  >
                    <Text style={styles.selectionOptionText}>
                      {item}
                    </Text>

                    {(selectionModal === 'state' ? state : city) ===
                      item && (
                      <Text style={styles.selectionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.selectionMessage}>
                    No matching options found.
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large,
    paddingBottom: SPACING.huge,
  },
  introSection: {
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.title,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  pageSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  methodSection: {
    marginBottom: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.medium,
  },
  requiredText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  methodCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    marginBottom: SPACING.small,
    position: 'relative',
  },
  methodCardSelected: {
    borderColor: 'transparent',
    borderWidth: 0,
  },
  selectedMethodGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADIUS.large,
    padding: 1.5,
  },
  selectedMethodGradientInner: {
    flex: 1,
    borderRadius: RADIUS.large - 1,
    backgroundColor: COLORS.surface,
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.medium,
  },
  methodIconText: {
    fontFamily: FONTS.medium,
    fontSize: 21,
    color: COLORS.text,
  },
  methodContent: {
    flex: 1,
    paddingRight: SPACING.small,
  },
  methodTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  methodDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontFamily: FONTS.regular,
    fontSize: 26,
    color: COLORS.textMuted,
  },
  addressSection: {
    marginTop: SPACING.small,
    marginBottom: SPACING.large,
  },
  inputGroup: {
    marginBottom: SPACING.medium,
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  input: {
    minHeight: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectInputText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  selectPlaceholder: {
    color: COLORS.textMuted,
  },
  selectArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  halfInput: {
    flex: 1,
  },
  inputDisabled: {
    backgroundColor: '#F1F1F3',
    borderColor: '#E2E2E2',
    color: COLORS.textMuted,
  },
  pincodeInput: {
    maxWidth: 180,
  },
  searchSection: {
    marginTop: SPACING.large,
    paddingTop: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  searchTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  searchDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  searchInput: {
    minHeight: 52,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  gradientButtonWrapper: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  searchButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.large,
    gap: SPACING.small,
  },
  searchButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.white,
  },
  locationFoundSection: {
    marginTop: SPACING.small,
  },
  foundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: SPACING.large,
  },
  foundIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
  },
  foundIconText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  foundContent: {
    flex: 1,
  },
  foundTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  foundDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  mapSection: {
    marginBottom: SPACING.large,
  },
  mapInstruction: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.small,
  },
  mapContainer: {
    height: 270,
    overflow: 'hidden',
    borderRadius: RADIUS.large,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    position: 'absolute',
    top: SPACING.small,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  mapLoadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    marginLeft: SPACING.small,
  },
  mapHint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 17,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.medium,
  },
  summaryIconText: {
    fontFamily: FONTS.medium,
    fontSize: 19,
    color: COLORS.text,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  summaryAddress: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  coordinatesText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  changeLocationButton: {
    marginTop: SPACING.medium,
    minHeight: 48,
    borderRadius: RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeLocationText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },
  continueButtonWrapper: {
    marginTop: SPACING.small,
  },
  continueButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.large,
    gap: SPACING.small,
  },
  continueButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  validationHint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  selectionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: SPACING.large,
  },
  selectionModalCard: {
    maxHeight: '82%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.large,
    padding: SPACING.medium,
  },
  selectionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  selectionModalTitle: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },
  selectionModalClose: {
    fontSize: 30,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.small,
  },
  selectionSearchInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.small,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },
  selectionOption: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.small,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  selectionOptionText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },
  selectionCheck: {
    fontSize: 18,
    color: COLORS.themeColor,
    marginLeft: SPACING.small,
  },
  selectionLoading: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
  },
  selectionMessage: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.medium,
  },
  selectionRetry: {
    marginTop: SPACING.small,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.themeColor,
  },
  selectionRetryText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.small,
    color: COLORS.white,
  },
});