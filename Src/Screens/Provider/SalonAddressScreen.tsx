import React, {
  useCallback,
  useEffect,
  useMemo,
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


// ============================================================
// TYPES
// ============================================================

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


// ============================================================
// DEFAULT MAP LOCATION
// ============================================================

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// All Indian states and union territories.
const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];


// ============================================================
// COMPONENT
// ============================================================

export default function SalonAddressScreen({
  navigation,
}: any) {
  const { updateData } = useSalonRegistration();


  // ==========================================================
  // ADDRESS STATE
  // ==========================================================

  const [addressLine, setAddressLine] =
    useState<string>('');

  const [city, setCity] =
    useState<string>('');

  const [state, setState] =
    useState<string>('');

  const [pincode, setPincode] =
    useState<string>('');

  const [selectionModal, setSelectionModal] =
    useState<'city' | 'state' | null>(null);
  const [selectionSearch, setSelectionSearch] =
    useState<string>('');
  const [cityOptions, setCityOptions] =
    useState<string[]>([]);
  const [loadingCities, setLoadingCities] =
    useState<boolean>(false);
  const [cityLoadError, setCityLoadError] =
    useState<string>('');


  // ==========================================================
  // LOCATION STATE
  // ==========================================================

  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null);

  const [locationMode, setLocationMode] =
    useState<LocationMode>(null);

  /**
   * locationFound means that Clavata has successfully
   * found a location using either:
   *
   * 1. Current device location
   * 2. Address search
   * 3. Map adjustment
   *
   * Once this becomes true, the address/search controls
   * become read-only. The map remains editable.
   */
  const [locationFound, setLocationFound] =
    useState<boolean>(false);


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  const [searchingAddress, setSearchingAddress] =
    useState<boolean>(false);

  const [gettingLocation, setGettingLocation] =
    useState<boolean>(false);

  const [reverseGeocoding, setReverseGeocoding] =
    useState<boolean>(false);


  // ==========================================================
  // SEARCH STATE
  // ==========================================================

  const [searchText, setSearchText] =
    useState<string>('');


  // ==========================================================
  // MAP STATE
  // ==========================================================

  const [mapRegion, setMapRegion] =
    useState<Region>({
      ...DEFAULT_COORDINATES,
      ...DEFAULT_DELTA,
    });


  // ==========================================================
  // DERIVED STATE
  // ==========================================================

  const isLocationBusy =
    gettingLocation ||
    searchingAddress ||
    reverseGeocoding;

  const locationLocked =
    locationFound && coordinates !== null;


  // ==========================================================
  // BUILD SEARCH QUERY
  // ==========================================================

  const buildAddressSearchQuery = useCallback(() => {
    const parts = [
      addressLine.trim(),
      city.trim(),
      state.trim(),
      pincode.trim(),
      'India',
    ].filter(Boolean);

    return parts.join(', ');
  }, [
    addressLine,
    city,
    state,
    pincode,
  ]);


  // ==========================================================
  // AUTOMATICALLY POPULATE SEARCH BOX
  // ==========================================================

  /**
   * While entering the structured address, automatically
   * build the search query.
   *
   * Example:
   *
   * Address:
   * 12 MG Road
   *
   * City:
   * Bengaluru
   *
   * State:
   * Karnataka
   *
   * Pincode:
   * 560001
   *
   * Search box becomes:
   *
   * 12 MG Road, Bengaluru, Karnataka, 560001, India
   *
   * Once a location is found, the search box is locked.
   */
  useEffect(() => {
    if (
      locationMode !== 'address' ||
      locationFound
    ) {
      return;
    }

    const query =
      buildAddressSearchQuery();

    setSearchText(query);
  }, [
    addressLine,
    city,
    state,
    pincode,
    locationMode,
    locationFound,
    buildAddressSearchQuery,
  ]);


  // ==========================================================
  // GEOCODE ADDRESS
  // ==========================================================

  const geocodeAddress = useCallback(
    async (
      query: string,
    ): Promise<GeocodeResult | null> => {
      try {
        const trimmedQuery =
          query.trim();

        if (!trimmedQuery) {
          return null;
        }

        const url =
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(trimmedQuery)}` +
          `&format=jsonv2` +
          `&limit=1` +
          `&countrycodes=in`;

        const response =
          await fetch(
            url,
            {
              method: 'GET',
              headers: {
                Accept:
                  'application/json',
                'User-Agent':
                  'ClavataSalonApp/1.0',
              },
            },
          );

        if (!response.ok) {
          throw new Error(
            `Geocoding failed: ${response.status}`,
          );
        }

        const data: unknown =
          await response.json();

        if (
          !Array.isArray(data) ||
          data.length === 0
        ) {
          return null;
        }

        const result =
          data[0] as {
            lat?: string;
            lon?: string;
            display_name?: string;
          };

        const latitude =
          Number(result.lat);

        const longitude =
          Number(result.lon);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return null;
        }

        return {
          latitude,
          longitude,
          displayName:
            result.display_name || '',
        };
      } catch (error) {
        console.error(
          'GEOCODE ADDRESS ERROR:',
          error,
        );

        return null;
      }
    },
    [],
  );


  // ==========================================================
  // REVERSE GEOCODE
  // ==========================================================

  const applyReverseGeocode =
    useCallback(
      async (
        location: Coordinates,
        preserveSearchText = false,
      ): Promise<boolean> => {
        try {
          setReverseGeocoding(true);

          const data =
            await reverseGeocode(
              location.latitude,
              location.longitude,
            );

          if (!data) {
            return false;
          }

          const address =
            data.address || {};

          const addressLineParts = [
            address.house_number,
            address.road,
            address.neighbourhood,
            address.suburb,
          ].filter(Boolean);

          const newAddressLine =
            addressLineParts.join(', ');

          const newCity =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            '';

          const newState =
            address.state || '';

          const newPincode =
            address.postcode || '';

          const displayName =
            data.display_name || '';


          // ----------------------------------------------------
          // UPDATE STRUCTURED ADDRESS
          // ----------------------------------------------------

          if (newAddressLine.trim()) {
            setAddressLine(
              newAddressLine.trim(),
            );
          }

          if (newCity.trim()) {
            setCity(
              newCity.trim(),
            );
          }

          if (newState.trim()) {
            setState(
              newState.trim(),
            );
          }

          if (newPincode.trim()) {
            setPincode(
              newPincode.trim(),
            );
          }


          // ----------------------------------------------------
          // UPDATE SEARCH TEXT
          // ----------------------------------------------------

          if (
            !preserveSearchText &&
            displayName.trim()
          ) {
            setSearchText(
              displayName.trim(),
            );
          }

          return true;
        } catch (error) {
          console.error(
            'REVERSE GEOCODE ERROR:',
            error,
          );

          return false;
        } finally {
          setReverseGeocoding(false);
        }
      },
      [],
    );


  // ==========================================================
  // UPDATE SELECTED LOCATION
  // ==========================================================

  const updateSelectedLocation =
    useCallback(
      async (
        newCoordinates: Coordinates,
        preserveSearchText = false,
      ): Promise<boolean> => {
        setCoordinates(
          newCoordinates,
        );

        setMapRegion({
          latitude:
            newCoordinates.latitude,
          longitude:
            newCoordinates.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });

        const reverseGeocodeSuccess =
          await applyReverseGeocode(
            newCoordinates,
            preserveSearchText,
          );

        /**
         * Only lock the address/search controls
         * if we successfully obtained the location
         * and its address.
         */
        if (reverseGeocodeSuccess) {
          setLocationFound(true);
        }

        return reverseGeocodeSuccess;
      },
      [applyReverseGeocode],
    );


  const visibleSelectionOptions = useMemo(() => {
    const options = selectionModal === 'state' ? INDIA_STATES : cityOptions;
    const query = selectionSearch.trim().toLowerCase();
    return options.filter(item => item.toLowerCase().includes(query));
  }, [selectionModal, selectionSearch, cityOptions]);

  const loadCitiesForState = useCallback(async (stateName: string) => {
    setLoadingCities(true);
    setCityLoadError('');
    setCityOptions([]);
    try {
      const response = await fetch(
        'https://countriesnow.space/api/v0.1/countries/state/cities',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'India', state: stateName }),
        },
      );
      const result = await response.json();
      if (!response.ok || result?.error || !Array.isArray(result?.data)) {
        throw new Error('City list unavailable');
      }
      setCityOptions(
        [...new Set<string>(result.data.filter((item: unknown) => typeof item === 'string' && item.trim()).map((item: string) => item.trim()))]
          .sort((a, b) => a.localeCompare(b)),
      );
    } catch (error) {
      setCityLoadError('Could not load cities. Please check your internet connection and try again.');
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const openSelectionModal = useCallback((type: 'city' | 'state') => {
    if (locationLocked) return;
    setSelectionSearch('');
    setSelectionModal(type);
    if (type === 'city' && state.trim() && cityOptions.length === 0) {
      loadCitiesForState(state.trim());
    }
  }, [locationLocked, state, cityOptions.length, loadCitiesForState]);

  const selectAddressOption = useCallback((value: string) => {
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
  }, [selectionModal, loadCitiesForState]);

  // ==========================================================
  // ADDRESS FIELD CHANGE
  // ==========================================================

  const handleAddressFieldChange =
    useCallback(
      (
        field:
          | 'address'
          | 'city'
          | 'state'
          | 'pincode',
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
            setPincode(
              value
                .replace(/\D/g, '')
                .slice(0, 6),
            );
            break;
        }
      },
      [locationLocked],
    );


  // ==========================================================
  // SELECT ADDRESS MODE
  // ==========================================================

  const handleSelectAddressMode =
    useCallback(() => {
      if (
        isLocationBusy ||
        locationFound
      ) {
        return;
      }

      setLocationMode('address');

      const query =
        buildAddressSearchQuery();

      if (query) {
        setSearchText(query);
      }
    }, [
      isLocationBusy,
      locationFound,
      buildAddressSearchQuery,
    ]);


  // ==========================================================
  // USE CURRENT LOCATION
  // ==========================================================

  const handleUseCurrentLocation =
    useCallback(async () => {
      if (
        gettingLocation ||
        locationFound
      ) {
        return;
      }

      try {
        setLocationMode('current');

        setGettingLocation(true);


        // ------------------------------------------------------
        // ANDROID PERMISSION
        // ------------------------------------------------------

        if (Platform.OS === 'android') {
          const permission =
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS
                .ACCESS_FINE_LOCATION,
              {
                title:
                  'Location Permission',
                message:
                  'Clavata uses your location to place your business accurately on the map.',
                buttonPositive:
                  'Allow',
                buttonNegative:
                  'Cancel',
              },
            );

          if (
            permission !==
            PermissionsAndroid.RESULTS
              .GRANTED
          ) {
            Alert.alert(
              'Location Permission Required',
              'Please allow location access to use your current location.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Settings',
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ],
            );

            setLocationMode(null);

            return;
          }
        }


        // ------------------------------------------------------
        // GET GPS LOCATION
        // ------------------------------------------------------

        const location =
          await new Promise<Coordinates | null>(
            resolve => {
              Geolocation.getCurrentPosition(
                position => {
                  const {
                    latitude,
                    longitude,
                  } = position.coords;

                  resolve({
                    latitude,
                    longitude,
                  });
                },
                error => {
                  console.log(
                    'GPS ERROR:',
                    error,
                  );

                  resolve(null);
                },
                {
                  enableHighAccuracy:
                    true,
                  timeout: 15000,
                  maximumAge: 10000,
                },
              );
            },
          );


        // ------------------------------------------------------
        // GPS FAILURE
        // ------------------------------------------------------

        if (!location) {
          Alert.alert(
            'Location unavailable',
            'We could not determine your current location. Make sure your device location is turned on and try again.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ],
          );

          setLocationMode(null);

          return;
        }


        // ------------------------------------------------------
        // REVERSE GEOCODE GPS
        // ------------------------------------------------------

        const success =
          await updateSelectedLocation(
            location,
          );

        if (!success) {
          Alert.alert(
            'Address unavailable',
            'We found your location, but could not read the business address. Please try again or enter your address manually.',
          );

          setLocationFound(false);
        }
      } catch (error) {
        console.error(
          'CURRENT LOCATION ERROR:',
          error,
        );

        setLocationMode(null);

        Alert.alert(
          'Location unavailable',
          'Unable to get your current location. Please try again.',
        );
      } finally {
        setGettingLocation(false);
      }
    }, [
      gettingLocation,
      locationFound,
      updateSelectedLocation,
    ]);


  // ==========================================================
  // SEARCH ADDRESS
  // ==========================================================

  const handleSearchAddress =
    useCallback(async () => {
      const query =
        searchText.trim();

      if (!query) {
        Alert.alert(
          'Enter an address',
          'Please enter your business address to search.',
        );

        return;
      }

      if (locationLocked) {
        return;
      }

      try {
        setLocationMode('address');

        setSearchingAddress(true);

        const result =
          await geocodeAddress(query);

        if (!result) {
          Alert.alert(
            'Address not found',
            'We could not find this address. Try adding the area, city, state or pincode.',
          );

          return;
        }

        const newCoordinates: Coordinates =
        {
          latitude:
            result.latitude,
          longitude:
            result.longitude,
        };


        /**
         * Preserve exactly what the user searched.
         *
         * Reverse geocoding still updates the structured
         * address fields.
         */
        const success =
          await updateSelectedLocation(
            newCoordinates,
            true,
          );

        if (!success) {
          Alert.alert(
            'Address unavailable',
            'We found the location, but could not read its address. Please try another search.',
          );

          setLocationFound(false);

          return;
        }

        setSearchText(query);
      } catch (error) {
        console.error(
          'SEARCH ADDRESS ERROR:',
          error,
        );

        Alert.alert(
          'Unable to find address',
          'Something went wrong while searching for this address. Please try again.',
        );
      } finally {
        setSearchingAddress(false);
      }
    }, [
      searchText,
      locationLocked,
      geocodeAddress,
      updateSelectedLocation,
    ]);


  // ==========================================================
  // MAP REGION CHANGE
  // ==========================================================

  const handleRegionChangeComplete =
    useCallback(
      (region: Region) => {
        setMapRegion(region);
      },
      [],
    );


  // ==========================================================
  // MAP PRESS
  // ==========================================================

  const handleMapPress =
    useCallback(
      async (
        event: MapPressEvent,
      ) => {
        if (reverseGeocoding) {
          return;
        }

        const {
          latitude,
          longitude,
        } =
          event.nativeEvent.coordinate;

        const newCoordinates: Coordinates =
        {
          latitude,
          longitude,
        };

        const success =
          await updateSelectedLocation(
            newCoordinates,
          );

        if (!success) {
          Alert.alert(
            'Address unavailable',
            'We could not read the address at this location. Please move the pin to another location.',
          );
        }
      },
      [
        reverseGeocoding,
        updateSelectedLocation,
      ],
    );


  // ==========================================================
  // MARKER DRAG
  // ==========================================================

  const handleMarkerDragEnd =
    useCallback(
      async (
        event: MarkerDragStartEndEvent,
      ) => {
        if (reverseGeocoding) {
          return;
        }

        const {
          latitude,
          longitude,
        } =
          event.nativeEvent.coordinate;

        const newCoordinates: Coordinates =
        {
          latitude,
          longitude,
        };

        const success =
          await updateSelectedLocation(
            newCoordinates,
          );

        if (!success) {
          Alert.alert(
            'Address unavailable',
            'We could not read the address at this location. Please move the pin to another location.',
          );
        }
      },
      [
        reverseGeocoding,
        updateSelectedLocation,
      ],
    );


  // ==========================================================
  // CHANGE LOCATION
  // ==========================================================

  const handleChangeLocation =
    useCallback(() => {
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

      setMapRegion({
        ...DEFAULT_COORDINATES,
        ...DEFAULT_DELTA,
      });
    }, [
      isLocationBusy,
    ]);


  // ==========================================================
  // CONFIRM LOCATION
  // ==========================================================

  const handleConfirmLocation =
    useCallback(() => {
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
        Alert.alert(
          'City required',
          'Please enter your city.',
        );

        return;
      }

      if (!state.trim()) {
        Alert.alert(
          'State required',
          'Please enter your state.',
        );

        return;
      }

      if (
        !/^\d{6}$/.test(
          pincode.trim(),
        )
      ) {
        Alert.alert(
          'Invalid Pincode',
          'Please enter a valid 6-digit Indian pincode.',
        );

        return;
      }


      // ------------------------------------------------------
      // SAVE REGISTRATION DATA
      // ------------------------------------------------------

      updateData({
        addressLine:
          addressLine.trim(),

        city:
          city.trim(),

        state:
          state.trim(),

        pincode:
          pincode.trim(),

        latitude:
          coordinates.latitude,

        longitude:
          coordinates.longitude,
      });


      console.log(
        '======================================',
      );

      console.log(
        'SALON LOCATION CONFIRMED',
      );

      console.log(
        'ADDRESS:',
        addressLine.trim(),
      );

      console.log(
        'CITY:',
        city.trim(),
      );

      console.log(
        'STATE:',
        state.trim(),
      );

      console.log(
        'PINCODE:',
        pincode.trim(),
      );

      console.log(
        'LATITUDE:',
        coordinates.latitude,
      );

      console.log(
        'LONGITUDE:',
        coordinates.longitude,
      );

      console.log(
        '======================================',
      );


      // ------------------------------------------------------
      // NEXT STEP
      // ------------------------------------------------------

      navigation.navigate(
        'SalonBusinessHours',
      );
    }, [
      coordinates,
      addressLine,
      city,
      state,
      pincode,
      updateData,
      navigation,
    ]);


  // ==========================================================
  // LOCATION SUMMARY
  // ==========================================================

  const locationSummary =
    useMemo(() => {
      const parts = [
        addressLine.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
      ].filter(Boolean);

      return parts.join(', ');
    }, [
      addressLine,
      city,
      state,
      pincode,
    ]);


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Business Address"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >

          {/* ================================================== */}
          {/* INTRO */}
          {/* ================================================== */}

          <View
            style={
              styles.introSection
            }
          >
            <Text
              style={
                styles.pageTitle
              }
            >
              Find your business location
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Add your business location so
              customers can easily find
            </Text>
          </View>


          {/* ================================================== */}
          {/* LOCATION METHOD */}
          {/* ================================================== */}

          {!locationFound && (
            <View
              style={
                styles.methodSection
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Choose how to add your location
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Use your current location if you
                are at your business, or enter the
                address manually
              </Text>


              {/* ---------------------------------------------- */}
              {/* CURRENT LOCATION */}
              {/* ---------------------------------------------- */}

              <TouchableOpacity
                style={[
                  styles.methodCard,
                  locationMode ===
                  'current' &&
                  styles.methodCardSelected,
                  gettingLocation &&
                  styles.methodCardDisabled,
                ]}
                onPress={
                  handleUseCurrentLocation
                }
                disabled={
                  isLocationBusy ||
                  locationFound
                }
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
                <View
                  style={
                    styles.methodIcon
                  }
                >
                  <Text
                    style={
                      styles.methodIconText
                    }
                  >
                    ◎
                  </Text>
                </View>

                <View
                  style={
                    styles.methodContent
                  }
                >
                  <Text
                    style={
                      styles.methodTitle
                    }
                  >
                    Use my current location
                  </Text>

                  <Text
                    style={
                      styles.methodDescription
                    }
                  >
                    Best if you are currently at
                    your business
                  </Text>
                </View>

                {gettingLocation ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      COLORS.themeColor
                    }
                  />
                ) : (
                  <Text
                    style={
                      styles.chevron
                    }
                  >
                    ›
                  </Text>
                )}
              </TouchableOpacity>


              {/* ---------------------------------------------- */}
              {/* ENTER ADDRESS */}
              {/* ---------------------------------------------- */}

              <TouchableOpacity
                style={[
                  styles.methodCard,
                  locationMode ===
                  'address' &&
                  styles.methodCardSelected,
                ]}
                onPress={
                  handleSelectAddressMode
                }
                disabled={
                  isLocationBusy ||
                  locationFound
                }
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
                <View
                  style={
                    styles.methodIcon
                  }
                >
                  <Text
                    style={
                      styles.methodIconText
                    }
                  >
                    ⌖
                  </Text>
                </View>

                <View
                  style={
                    styles.methodContent
                  }
                >
                  <Text
                    style={
                      styles.methodTitle
                    }
                  >
                    Enter business address
                  </Text>

                  <Text
                    style={
                      styles.methodDescription
                    }
                  >
                    Enter your address and find it
                    on the map
                  </Text>
                </View>

                <Text
                  style={
                    styles.chevron
                  }
                >
                  ›
                </Text>
              </TouchableOpacity>
            </View>
          )}


          {/* ================================================== */}
          {/* MANUAL ADDRESS */}
          {/* ================================================== */}

          {locationMode ===
            'address' &&
            !locationFound && (
              <View
                style={
                  styles.addressSection
                }
              >

                {/* -------------------------------------------- */}
                {/* SECTION HEADER */}
                {/* -------------------------------------------- */}

                <View
                  style={
                    styles.sectionHeader
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Business address
                  </Text>

                  <Text
                    style={
                      styles.requiredText
                    }
                  >
                    * Required
                  </Text>
                </View>


                {/* -------------------------------------------- */}
                {/* ADDRESS */}
                {/* -------------------------------------------- */}

                <View
                  style={
                    styles.inputGroup
                  }
                >
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    Address
                  </Text>

                  <TextInput
                    value={
                      addressLine
                    }
                    onChangeText={
                      value =>
                        handleAddressFieldChange(
                          'address',
                          value,
                        )
                    }
                    placeholder="House / building / street"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    editable={
                      !locationLocked
                    }
                    style={[
                      styles.input,
                      locationLocked &&
                      styles.inputDisabled,
                    ]}
                    returnKeyType="next"
                  />
                </View>


                {/* -------------------------------------------- */}
                {/* CITY + STATE */}
                {/* -------------------------------------------- */}

                <View
                  style={
                    styles.row
                  }
                >
                  <View
                    style={
                      styles.halfInput
                    }
                  >
                    <Text
                      style={
                        styles.inputLabel
                      }
                    >
                      City
                    </Text>

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
                      <Text style={[styles.selectInputText, !city && styles.selectPlaceholder]} numberOfLines={1}>
                        {city || 'Select city'}
                      </Text>
                      <View style={styles.selectChevron}>
                        <View style={[styles.selectChevronLine, styles.selectChevronLineLeft]} />
                        <View style={[styles.selectChevronLine, styles.selectChevronLineRight]} />
                      </View>
                    </TouchableOpacity>
                  </View>


                  <View
                    style={
                      styles.halfInput
                    }
                  >
                    <Text
                      style={
                        styles.inputLabel
                      }
                    >
                      State
                    </Text>

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
                      <Text style={[styles.selectInputText, !state && styles.selectPlaceholder]} numberOfLines={1}>
                        {state || 'Select state'}
                      </Text>
                      <View style={styles.selectChevron}>
                        <View style={[styles.selectChevronLine, styles.selectChevronLineLeft]} />
                        <View style={[styles.selectChevronLine, styles.selectChevronLineRight]} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>


                {/* -------------------------------------------- */}
                {/* PINCODE */}
                {/* -------------------------------------------- */}

                <View
                  style={
                    styles.inputGroup
                  }
                >
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    Pincode
                  </Text>

                  <TextInput
                    value={
                      pincode
                    }
                    onChangeText={
                      value =>
                        handleAddressFieldChange(
                          'pincode',
                          value,
                        )
                    }
                    placeholder="6-digit pincode"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={
                      !locationLocked
                    }
                    style={[
                      styles.input,
                      styles.pincodeInput,
                      locationLocked &&
                      styles.inputDisabled,
                    ]}
                  />
                </View>


                {/* ================================================== */}
                {/* FIND BUSINESS LOCATION */}
                {/* ================================================== */}

                <View
                  style={
                    styles.searchSection
                  }
                >
                  <Text
                    style={
                      styles.searchTitle
                    }
                  >
                    Find your business location
                  </Text>

                  <Text
                    style={
                      styles.searchDescription
                    }
                  >
                    We'll use the address above to
                    find your location on the map.
                    You can edit the search text if
                    needed.
                  </Text>


                  {/* ---------------------------------------------- */}
                  {/* SEARCH INPUT */}
                  {/* ---------------------------------------------- */}

                  {/* <TextInput
                    value={
                      searchText
                    }
                    onChangeText={
                      setSearchText
                    }
                    placeholder="Search your business address"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    editable={
                      !locationLocked &&
                      !isLocationBusy
                    }
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    style={[
                      styles.searchInput,
                      locationLocked &&
                        styles.inputDisabled,
                    ]}
                  /> */}


                  {/* ---------------------------------------------- */}
                  {/* SEARCH BUTTON */}
                  {/* ---------------------------------------------- */}

                  <TouchableOpacity
                    style={[
                      styles.gradientButtonWrapper,
                      (
                        searchingAddress ||
                        locationLocked ||
                        !searchText.trim()
                      ) &&
                      styles.buttonDisabled,
                    ]}
                    onPress={
                      handleSearchAddress
                    }
                    disabled={
                      searchingAddress ||
                      locationLocked ||
                      !searchText.trim()
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
                            color={
                              COLORS.white
                            }
                          />

                          <Text
                            style={
                              styles.searchButtonText
                            }
                          >
                            Finding location...
                          </Text>
                        </>
                      ) : (
                        <Text
                          style={
                            styles.searchButtonText
                          }
                        >
                          Search
                        </Text>
                      )}
                    </AppGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}


          {/* ================================================== */}
          {/* LOCATION FOUND / MAP VERIFICATION */}
          {/* ================================================== */}

          {locationFound &&
            coordinates && (
              <View
                style={
                  styles.locationFoundSection
                }
              >

                {/* -------------------------------------------- */}
                {/* LOCATION FOUND BANNER */}
                {/* -------------------------------------------- */}

                <AppGradient
                  colors={[...GRADIENTS.SOFT_PURPLE]}
                  style={styles.foundCard}
                >
                  <View style={styles.foundIcon}>
                    <Text style={styles.foundIconText}>
                      ✓
                    </Text>
                  </View>

                  <View style={styles.foundContent}>
                    <Text style={styles.foundTitle}>
                      Location found
                    </Text>

                    <Text style={styles.foundDescription}>
                      Please check the map and make
                      sure the pin is at your business
                      location.
                    </Text>
                  </View>
                </AppGradient>

                {/* -------------------------------------------- */}
                {/* MAP */}
                {/* -------------------------------------------- */}

                <View
                  style={
                    styles.mapSection
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Verify your location
                  </Text>

                  <Text
                    style={
                      styles.mapInstruction
                    }
                  >
                    Move the pin if necessary. Place
                    it as close as possible to your
                    business entrance.
                  </Text>


                  {/* MAP */}

                  <View
                    style={
                      styles.mapContainer
                    }
                  >
                    <MapView
                      style={
                        styles.map
                      }
                      region={
                        mapRegion
                      }
                      onRegionChangeComplete={
                        handleRegionChangeComplete
                      }
                      onPress={
                        handleMapPress
                      }
                      showsUserLocation={
                        locationMode ===
                        'current'
                      }
                      showsMyLocationButton={
                        false
                      }
                      toolbarEnabled={
                        false
                      }
                      loadingEnabled
                      moveOnMarkerPress={
                        false
                      }
                    >
                      <Marker
                        coordinate={
                          coordinates
                        }
                        draggable={
                          !reverseGeocoding
                        }
                        onDragEnd={
                          handleMarkerDragEnd
                        }
                        title="Business location"
                        description="Drag the pin to your exact business location"
                      />
                    </MapView>


                    {/* MAP LOADING */}

                    {reverseGeocoding && (
                      <View
                        style={
                          styles.mapLoading
                        }
                      >
                        <ActivityIndicator
                          size="small"
                          color={
                            COLORS.themeColor
                          }
                        />

                        <Text
                          style={
                            styles.mapLoadingText
                          }
                        >
                          Updating address...
                        </Text>
                      </View>
                    )}
                  </View>


                  <Text
                    style={
                      styles.mapHint
                    }
                  >
                    Tap the map or drag the pin to
                    adjust the exact location.
                  </Text>
                </View>


                {/* -------------------------------------------- */}
                {/* BUSINESS LOCATION SUMMARY */}
                {/* -------------------------------------------- */}

                <View
                  style={
                    styles.summaryCard
                  }
                >
                  <View
                    style={
                      styles.summaryIcon
                    }
                  >
                    <Text
                      style={
                        styles.summaryIconText
                      }
                    >
                      ⌖
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryContent
                    }
                  >
                    <Text
                      style={
                        styles.summaryTitle
                      }
                    >
                      Business location
                    </Text>

                    <Text
                      style={
                        styles.summaryAddress
                      }
                    >
                      {locationSummary ||
                        'Location selected'}
                    </Text>
                  </View>
                </View>

                {/* -------------------------------------------- */}
                {/* CHANGE LOCATION */}
                {/* -------------------------------------------- */}

                <TouchableOpacity
                  style={
                    styles.changeLocationButton
                  }
                  onPress={
                    handleChangeLocation
                  }
                  disabled={
                    isLocationBusy
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      styles.changeLocationText
                    }
                  >
                    Change location
                  </Text>
                </TouchableOpacity>
                {/* -------------------------------------------- */}
                {/* VERIFY & CONTINUE */}
                {/* -------------------------------------------- */}

                <TouchableOpacity
                  style={[
                    styles.gradientButtonWrapper,
                    styles.continueButtonWrapper,
                    reverseGeocoding &&
                    styles.buttonDisabled,
                  ]}
                  onPress={
                    handleConfirmLocation
                  }
                  disabled={
                    reverseGeocoding
                  }
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
                          color={
                            COLORS.white
                          }
                        />

                        <Text
                          style={
                            styles.continueButtonText
                          }
                        >
                          Updating...
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={
                          styles.continueButtonText
                        }
                      >
                        Verify & Continue
                      </Text>
                    )}
                  </AppGradient>
                </TouchableOpacity>

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
                {selectionModal === 'state' ? 'Select state / union territory' : 'Select city'}
              </Text>
              <TouchableOpacity onPress={() => setSelectionModal(null)} hitSlop={10}>
                <Text style={styles.selectionModalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={selectionSearch}
              onChangeText={setSelectionSearch}
              placeholder={selectionModal === 'state' ? 'Search state...' : 'Search city...'}
              placeholderTextColor={COLORS.textMuted}
              style={styles.selectionSearchInput}
              autoCorrect={false}
            />
            {selectionModal === 'city' && loadingCities ? (
              <View style={styles.selectionLoading}>
                <ActivityIndicator color={COLORS.themeColor} />
                <Text style={styles.selectionMessage}>Loading cities...</Text>
              </View>
            ) : selectionModal === 'city' && cityLoadError ? (
              <View style={styles.selectionLoading}>
                <Text style={styles.selectionMessage}>{cityLoadError}</Text>
                <TouchableOpacity style={styles.selectionRetry} onPress={() => state.trim() && loadCitiesForState(state.trim())}>
                  <Text style={styles.selectionRetryText}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : selectionModal === 'city' && !state.trim() ? (
              <View style={styles.selectionLoading}>
                <Text style={styles.selectionMessage}>Select a state first.</Text>
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
                    <Text style={styles.selectionOptionText}>{item}</Text>
                    {(selectionModal === 'state' ? state : city) === item ? (
                      <Text style={styles.selectionCheck}>✓</Text>
                    ) : null}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.selectionMessage}>No matching options found.</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

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


  // ==========================================================
  // INTRO
  // ==========================================================

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


  // ==========================================================
  // SECTIONS
  // ==========================================================

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


  // ==========================================================
  // LOCATION METHOD CARDS
  // ==========================================================

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


  // ==========================================================
  // ADDRESS
  // ==========================================================

  addressSection: {
    marginTop: SPACING.small,
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

  selectChevron: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },

  selectChevronLine: {
    position: 'absolute',
    width: 6,
    height: 1.8,
    borderRadius: 1,
    backgroundColor: COLORS.textSecondary,
    top: 8,
  },

  selectChevronLineLeft: {
    left: 3,
    transform: [{ rotate: '45deg' }],
  },

  selectChevronLineRight: {
    right: 3,
    transform: [{ rotate: '-45deg' }],
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

  inputDisabled: {
    backgroundColor: '#F1F1F3',
    borderColor: '#E2E2E2',
    color: COLORS.textMuted,
  },

  pincodeInput: {
    maxWidth: 180,
  },

  row: {
    flexDirection: 'row',
    gap: SPACING.medium,
  },

  halfInput: {
    flex: 1,
  },


  // ==========================================================
  // SEARCH
  // ==========================================================

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
    minHeight: 72,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: RADIUS.medium,

    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,

    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 20,

    color: COLORS.text,

    marginBottom: SPACING.small,
  },

  gradientButtonWrapper: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },

  continueButtonWrapper: {
    marginTop: SPACING.small,
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


  // ==========================================================
  // LOCATION FOUND
  // ==========================================================

  locationFoundSection: {
    marginTop: SPACING.small,
  },

  foundCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: RADIUS.large,

    padding: SPACING.medium,

    marginBottom: SPACING.large,
  },

  foundIcon: {
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

  foundIconText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
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


  // ==========================================================
  // MAP
  // ==========================================================

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


  // ==========================================================
  // LOCATION SUMMARY
  // ==========================================================

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


  // ==========================================================
  // VERIFY & CONTINUE
  // ==========================================================

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


  // ==========================================================
  // CHANGE LOCATION
  // ==========================================================

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
});