import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
  Marker,
  Region,
  MapPressEvent,
  MarkerDragStartEndEvent,
} from 'react-native-maps';

import {
  reverseGeocode,
} from '../../services/locationService';

import {
  Header,
  DButton,
} from '../../components';

import {
  useSalonRegistration,
} from '../../context/SalonRegistrationContext';

import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';

// ============================================================
// TYPES
// ============================================================

type Coordinates = {
  latitude: number;
  longitude: number;
};

type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
};

// ============================================================
// DEFAULT LOCATION
// ============================================================

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// ============================================================
// SCREEN
// ============================================================

export default function SalonAddressScreen({
  navigation,
}: any) {
  const {
    updateData,
  } = useSalonRegistration();

  // ==========================================================
  // ADDRESS
  // ==========================================================

  const [
    addressLine,
    setAddressLine,
  ] = useState<string>('');

  const [
    city,
    setCity,
  ] = useState<string>('');

  const [
    state,
    setState,
  ] = useState<string>('');

  const [
    pincode,
    setPincode,
  ] = useState<string>('');

  // ==========================================================
  // LOCATION
  // ==========================================================

  const [
    coordinates,
    setCoordinates,
  ] = useState<Coordinates | null>(null);

  const [
    locationConfirmed,
    setLocationConfirmed,
  ] = useState<boolean>(false);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    searchingAddress,
    setSearchingAddress,
  ] = useState<boolean>(false);

  const [
    gettingLocation,
    setGettingLocation,
  ] = useState<boolean>(false);

  const [
    reverseGeocoding,
    setReverseGeocoding,
  ] = useState<boolean>(false);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    searchText,
    setSearchText,
  ] = useState<string>('');

  // ==========================================================
  // MAP
  // ==========================================================

  const [
    mapRegion,
    setMapRegion,
  ] = useState<Region>({
    ...DEFAULT_COORDINATES,
    ...DEFAULT_DELTA,
  });

  // ==========================================================
  // GEOCODE ADDRESS
  // ==========================================================

  const geocodeAddress =
    useCallback(
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
            `q=${encodeURIComponent(
              trimmedQuery,
            )}` +
            `&format=jsonv2` +
            `&limit=1` +
            `&countrycodes=in`;

          const response =
            await fetch(url, {
              method: 'GET',

              headers: {
                Accept:
                  'application/json',

                'User-Agent':
                  'ClavataSalonApp/1.0',
              },
            });

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
            'GEOCODE ERROR:',
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
      ) => {
        try {
          setReverseGeocoding(true);

          const data =
            await reverseGeocode(
              location.latitude,
              location.longitude,
            );

          if (!data) {
            return;
          }

          const address =
            data.address || {};

          // ----------------------------------------------------
          // ADDRESS LINE
          // ----------------------------------------------------

          const addressLineParts = [
            address.house_number,
            address.road,
            address.neighbourhood,
            address.suburb,
          ].filter(Boolean);

          const newAddressLine =
            addressLineParts.join(', ');

          // ----------------------------------------------------
          // CITY
          // ----------------------------------------------------

          const newCity =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            '';

          // ----------------------------------------------------
          // STATE
          // ----------------------------------------------------

          const newState =
            address.state || '';

          // ----------------------------------------------------
          // PINCODE
          // ----------------------------------------------------

          const newPincode =
            address.postcode || '';

          // ----------------------------------------------------
          // DISPLAY NAME
          // ----------------------------------------------------

          const displayName =
            data.display_name || '';

          // ----------------------------------------------------
          // ONLY UPDATE IF VALUE EXISTS
          // ----------------------------------------------------

          if (
            newAddressLine.trim()
          ) {
            setAddressLine(
              newAddressLine.trim(),
            );
          }

          if (
            newCity.trim()
          ) {
            setCity(
              newCity.trim(),
            );
          }

          if (
            newState.trim()
          ) {
            setState(
              newState.trim(),
            );
          }

          if (
            newPincode.trim()
          ) {
            setPincode(
              newPincode.trim(),
            );
          }

          if (
            displayName.trim()
          ) {
            setSearchText(
              displayName.trim(),
            );
          }
        } catch (error) {
          console.error(
            'APPLY REVERSE GEOCODE ERROR:',
            error,
          );
        } finally {
          setReverseGeocoding(
            false,
          );
        }
      },
      [],
    );

  // ==========================================================
  // SEARCH ADDRESS
  // ==========================================================

  const handleSearchAddress =
    useCallback(async () => {
      if (!searchText.trim()) {
        Alert.alert(
          'Enter an address',
          'Please enter your salon address first.',
        );

        return;
      }

      try {
        setSearchingAddress(true);

        const result =
          await geocodeAddress(
            searchText,
          );

        if (!result) {
          Alert.alert(
            'Address not found',
            'We could not find this address. Please enter a more complete address including city and pincode.',
          );

          return;
        }

        const newCoordinates: Coordinates = {
          latitude:
            result.latitude,

          longitude:
            result.longitude,
        };

        // ------------------------------------------------------
        // SET COORDINATES
        // ------------------------------------------------------

        setCoordinates(
          newCoordinates,
        );

        // New location needs confirmation.
        setLocationConfirmed(
          false,
        );

        // ------------------------------------------------------
        // MOVE MAP
        // ------------------------------------------------------

        setMapRegion({
          latitude:
            newCoordinates.latitude,

          longitude:
            newCoordinates.longitude,

          latitudeDelta:
            0.005,

          longitudeDelta:
            0.005,
        });

        // ------------------------------------------------------
        // REVERSE GEOCODE
        // ------------------------------------------------------

        await applyReverseGeocode(
          newCoordinates,
        );
      } catch (error) {
        console.error(
          'SEARCH ADDRESS ERROR:',
          error,
        );

        Alert.alert(
          'Unable to find address',
          'Something went wrong while finding this address. Please try again.',
        );
      } finally {
        setSearchingAddress(
          false,
        );
      }
    }, [
      searchText,
      geocodeAddress,
      applyReverseGeocode,
    ]);

  // ==========================================================
  // CURRENT DEVICE LOCATION
  // ==========================================================

  const handleUseCurrentLocation =
    useCallback(async () => {
      if (gettingLocation) {
        return;
      }

      try {
        setGettingLocation(
          true,
        );

        console.log(
          '📍 Requesting current device location...',
        );

        // ======================================================
        // ANDROID PERMISSION
        // ======================================================

        if (Platform.OS === 'android') {
          const permission =
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title:
                  'Location Permission',

                message:
                  'Clavata needs your location to find your salon location.',

                buttonPositive:
                  'Allow',

                buttonNegative:
                  'Cancel',
              },
            );

          if (
            permission !==
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert(
              'Location Permission Required',
              'Please allow location permission to use your current location.',
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

            return;
          }
        }

        // ======================================================
        // GET GPS LOCATION
        // ======================================================

        const location =
          await new Promise<{
            latitude: number;
            longitude: number;
          } | null>((resolve) => {
            Geolocation.getCurrentPosition(
              position => {
                const {
                  latitude,
                  longitude,
                } = position.coords;

                console.log(
                  '📍 GPS coordinates:',
                  latitude,
                  longitude,
                );

                resolve({
                  latitude,
                  longitude,
                });
              },

              error => {
                console.log(
                  '❌ GPS location error:',
                  error,
                );

                resolve(null);
              },

              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
              },
            );
          });

        // ======================================================
        // GPS FAILED
        // ======================================================

        if (!location) {
          Alert.alert(
            'Location unavailable',
            'We could not determine your current location. Please make sure your device location is turned on and try again.',
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

          return;
        }

        // ======================================================
        // SET COORDINATES
        // ======================================================

        const newCoordinates: Coordinates = {
          latitude:
            location.latitude,

          longitude:
            location.longitude,
        };

        console.log(
          '📍 Current location:',
          newCoordinates,
        );

        setCoordinates(
          newCoordinates,
        );

        setLocationConfirmed(
          false,
        );

        // ======================================================
        // MOVE MAP
        // ======================================================

        setMapRegion({
          latitude:
            newCoordinates.latitude,

          longitude:
            newCoordinates.longitude,

          latitudeDelta:
            0.005,

          longitudeDelta:
            0.005,
        });

        // ======================================================
        // REVERSE GEOCODE
        // ======================================================

        await applyReverseGeocode(
          newCoordinates,
        );
      } catch (error) {
        console.error(
          'CURRENT LOCATION ERROR:',
          error,
        );

        Alert.alert(
          'Location unavailable',
          'Unable to get your current location. Please try again.',
        );
      } finally {
        setGettingLocation(
          false,
        );
      }
    }, [
      gettingLocation,
      applyReverseGeocode,
    ]);

  // ==========================================================
  // MAP REGION CHANGE
  // ==========================================================

  const handleRegionChangeComplete =
    useCallback(
      (currentRegion: Region) => {
        setMapRegion(
          currentRegion,
        );
      },
      [],
    );

  // ==========================================================
  // MAP PRESSED
  // ==========================================================

  const handleMapPress =
    useCallback(
      async (
        event: MapPressEvent,
      ) => {
        const {
          latitude,
          longitude,
        } =
          event.nativeEvent.coordinate;

        const newCoordinates: Coordinates = {
          latitude,
          longitude,
        };

        setCoordinates(
          newCoordinates,
        );

        setLocationConfirmed(
          false,
        );

        setMapRegion({
          latitude,
          longitude,

          latitudeDelta:
            0.005,

          longitudeDelta:
            0.005,
        });

        await applyReverseGeocode(
          newCoordinates,
        );
      },
      [applyReverseGeocode],
    );

  // ==========================================================
  // MARKER DRAG END
  // ==========================================================

  const handleMarkerDragEnd =
    useCallback(
      async (
        event: MarkerDragStartEndEvent,
      ) => {
        const {
          latitude,
          longitude,
        } =
          event.nativeEvent.coordinate;

        const newCoordinates: Coordinates = {
          latitude,
          longitude,
        };

        setCoordinates(
          newCoordinates,
        );

        setLocationConfirmed(
          false,
        );

        setMapRegion({
          latitude,
          longitude,

          latitudeDelta:
            0.005,

          longitudeDelta:
            0.005,
        });

        await applyReverseGeocode(
          newCoordinates,
        );
      },
      [applyReverseGeocode],
    );

  // ==========================================================
  // CONFIRM LOCATION
  // ==========================================================

  const handleConfirmLocation =
    useCallback(() => {
      if (!coordinates) {
        Alert.alert(
          'Select a location',
          'Please search for your salon address or use your current location first.',
        );

        return;
      }

      // ------------------------------------------------------
      // ADDRESS VALIDATION
      // ------------------------------------------------------

      if (!addressLine.trim()) {
        Alert.alert(
          'Address required',
          'Please enter your salon street address.',
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

      setLocationConfirmed(
        true,
      );

      Alert.alert(
        'Location confirmed',
        'Your salon location has been confirmed.',
      );
    }, [
      coordinates,
      addressLine,
      city,
      state,
      pincode,
    ]);

  // ==========================================================
  // NEXT
  // ==========================================================

  const onNext =
    useCallback(() => {
      // ------------------------------------------------------
      // ADDRESS VALIDATION
      // ------------------------------------------------------

      if (
        !addressLine.trim() ||
        !city.trim() ||
        !state.trim() ||
        !pincode.trim()
      ) {
        Alert.alert(
          'Missing Information',
          'Please fill all address details.',
        );

        return;
      }

      // ------------------------------------------------------
      // PINCODE
      // ------------------------------------------------------

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
      // COORDINATES
      // ------------------------------------------------------

      if (!coordinates) {
        Alert.alert(
          'Location required',
          'Please search for your salon location or use your current location.',
        );

        return;
      }

      // ------------------------------------------------------
      // CONFIRMATION
      // ------------------------------------------------------

      if (!locationConfirmed) {
        Alert.alert(
          'Confirm your location',
          'Please tap "Confirm Location" after checking the marker on the map.',
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

      navigation.navigate(
        'SalonBusinessHours',
      );
    }, [
      addressLine,
      city,
      state,
      pincode,
      coordinates,
      locationConfirmed,
      updateData,
      navigation,
    ]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Salon Address"
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
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.headerSection
            }
          >
            <Text
              style={styles.title}
            >
              Where is your salon located?
            </Text>

            <Text
              style={styles.subtitle}
            >
              Add your salon address and confirm its exact
              location on the map.
            </Text>
          </View>

          {/* ==================================================
              OPTION A - SEARCH
          ================================================== */}

          <View
            style={
              styles.optionCard
            }
          >
            <View
              style={
                styles.optionHeader
              }
            >
              <View
                style={
                  styles.optionNumber
                }
              >
                <Text
                  style={
                    styles.optionNumberText
                  }
                >
                  A
                </Text>
              </View>

              <View
                style={
                  styles.optionHeaderText
                }
              >
                <Text
                  style={
                    styles.optionTitle
                  }
                >
                  Search your address
                </Text>

                <Text
                  style={
                    styles.optionSubtitle
                  }
                >
                  Enter your salon address and find it on the map.
                </Text>
              </View>
            </View>

            <View
              style={
                styles.searchRow
              }
            >
              <TextInput
                style={
                  styles.searchInput
                }
                placeholder="Search salon address"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={
                  searchText
                }
                onChangeText={
                  setSearchText
                }
                autoCapitalize="words"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={
                  styles.searchButton
                }
                onPress={
                  handleSearchAddress
                }
                disabled={
                  searchingAddress ||
                  reverseGeocoding
                }
                activeOpacity={
                  0.8
                }
              >
                {searchingAddress ? (
                  <ActivityIndicator
                    color={
                      COLORS.white
                    }
                  />
                ) : (
                  <Text
                    style={
                      styles.searchButtonText
                    }
                  >
                    Search
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ==================================================
              OPTION B - CURRENT LOCATION
          ================================================== */}

          <View
            style={
              styles.optionCard
            }
          >
            <View
              style={
                styles.optionHeader
              }
            >
              <View
                style={
                  styles.optionNumber
                }
              >
                <Text
                  style={
                    styles.optionNumberText
                  }
                >
                  B
                </Text>
              </View>

              <View
                style={
                  styles.optionHeaderText
                }
              >
                <Text
                  style={
                    styles.optionTitle
                  }
                >
                  Use current location
                </Text>

                <Text
                  style={
                    styles.optionSubtitle
                  }
                >
                  Use your phone's GPS location.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={
                styles.currentLocationButton
              }
              onPress={
                handleUseCurrentLocation
              }
              disabled={
                gettingLocation ||
                reverseGeocoding
              }
              activeOpacity={
                0.8
              }
            >
              {gettingLocation ? (
                <ActivityIndicator
                  color={
                    COLORS.primary
                  }
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.locationIcon
                    }
                  >
                    ◎
                  </Text>

                  <Text
                    style={
                      styles.currentLocationText
                    }
                  >
                    Use my current location
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ==================================================
              ADDRESS DETAILS
          ================================================== */}

          <View
            style={
              styles.sectionTitleContainer
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Address details
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              You can edit these details if necessary.
            </Text>
          </View>

          {/* ADDRESS */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              Address
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter street address"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                addressLine
              }
              onChangeText={
                (text: string) => {
                  setAddressLine(
                    text,
                  );

                  setLocationConfirmed(
                    false,
                  );
                }
              }
              autoCapitalize="words"
              autoCorrect={false}
              multiline
            />
          </View>

          {/* CITY */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              City
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter city"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={city}
              onChangeText={
                (text: string) => {
                  setCity(text);

                  setLocationConfirmed(
                    false,
                  );
                }
              }
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* STATE */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              State
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter state"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={state}
              onChangeText={
                (text: string) => {
                  setState(text);

                  setLocationConfirmed(
                    false,
                  );
                }
              }
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* PINCODE */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              Pincode
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter pincode"
              placeholderTextColor={
                COLORS.textMuted
              }
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={
                (text: string) => {
                  const numericText =
                    text.replace(
                      /\D/g,
                      '',
                    );

                  setPincode(
                    numericText,
                  );

                  setLocationConfirmed(
                    false,
                  );
                }
              }
            />
          </View>

          {/* ==================================================
              MAP
          ================================================== */}

          <View
            style={
              styles.mapSection
            }
          >
            <View
              style={
                styles.mapHeader
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.mapTitle
                  }
                >
                  Confirm salon location
                </Text>

                <Text
                  style={
                    styles.mapSubtitle
                  }
                >
                  Move the map or drag the marker to adjust the
                  exact salon location.
                </Text>
              </View>

              {locationConfirmed && (
                <View
                  style={
                    styles.confirmedBadge
                  }
                >
                  <Text
                    style={
                      styles.confirmedBadgeText
                    }
                  >
                    ✓ Confirmed
                  </Text>
                </View>
              )}
            </View>

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
                  true
                }
                showsMyLocationButton={
                  false
                }
              >
                {coordinates && (
                  <Marker
                    coordinate={
                      coordinates
                    }
                    title="Salon location"
                    description="Your salon will be registered at this location."
                    draggable
                    onDragEnd={
                      handleMarkerDragEnd
                    }
                  />
                )}
              </MapView>

              {!coordinates && (
                <View
                  pointerEvents="none"
                  style={
                    styles.mapEmptyOverlay
                  }
                >
                  <Text
                    style={
                      styles.mapEmptyTitle
                    }
                  >
                    Location not selected
                  </Text>

                  <Text
                    style={
                      styles.mapEmptyText
                    }
                  >
                    Search your address or use your current
                    location.
                  </Text>
                </View>
              )}

              {reverseGeocoding && (
                <View
                  style={
                    styles.mapLoadingOverlay
                  }
                >
                  <View
                    style={
                      styles.mapLoadingCard
                    }
                  >
                    <ActivityIndicator
                      color={
                        COLORS.primary
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
                </View>
              )}
            </View>

            {/* ==================================================
                COORDINATES
            ================================================== */}

            {coordinates && (
              <View
                style={
                  styles.coordinatesCard
                }
              >
                <View
                  style={
                    styles.coordinateItem
                  }
                >
                  <Text
                    style={
                      styles.coordinateLabel
                    }
                  >
                    Latitude
                  </Text>

                  <Text
                    style={
                      styles.coordinateValue
                    }
                  >
                    {coordinates.latitude.toFixed(
                      6,
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.coordinateDivider
                  }
                />

                <View
                  style={
                    styles.coordinateItem
                  }
                >
                  <Text
                    style={
                      styles.coordinateLabel
                    }
                  >
                    Longitude
                  </Text>

                  <Text
                    style={
                      styles.coordinateValue
                    }
                  >
                    {coordinates.longitude.toFixed(
                      6,
                    )}
                  </Text>
                </View>
              </View>
            )}

            {/* ==================================================
                CONFIRM LOCATION
            ================================================== */}

            <TouchableOpacity
              style={[
                styles.confirmLocationButton,

                !coordinates &&
                styles.confirmLocationButtonDisabled,

                locationConfirmed &&
                styles.confirmLocationButtonConfirmed,
              ]}
              disabled={
                !coordinates ||
                reverseGeocoding
              }
              onPress={
                handleConfirmLocation
              }
              activeOpacity={
                0.8
              }
            >
              {reverseGeocoding ? (
                <ActivityIndicator
                  color={
                    COLORS.white
                  }
                />
              ) : (
                <Text
                  style={
                    styles.confirmLocationText
                  }
                >
                  {locationConfirmed
                    ? '✓ Location Confirmed'
                    : 'Confirm Location'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ==================================================
              CONTINUE
          ================================================== */}

          <DButton
            type="primary"
            style={
              styles.button
            }
            onPress={
              onNext
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Continue
            </Text>
          </DButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  flex: {
    flex: 1,
  },

  content: {
    paddingHorizontal:
      SPACING.xxl,

    paddingTop:
      SPACING.xxxl,

    paddingBottom:
      SPACING.huge,
  },

  headerSection: {
    marginBottom:
      SPACING.xxl,
  },

  title: {
    fontFamily:
      FONTS.bold,

    fontSize: 21,

    lineHeight: 27,

    color:
      COLORS.text,

    letterSpacing: -0.3,

    marginBottom:
      SPACING.small,
  },

  subtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    lineHeight: 21,

    color:
      COLORS.textSecondary,

    maxWidth: 340,
  },

  optionCard: {
    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.large,

    padding:
      SPACING.large,

    marginBottom:
      SPACING.medium,
  },

  optionHeader: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginBottom:
      SPACING.medium,
  },

  optionNumber: {
    width: 38,

    height: 38,

    borderRadius:
      RADIUS.round,

    backgroundColor:
      COLORS.black,

    alignItems:
      'center',

    justifyContent:
      'center',

    marginRight:
      SPACING.medium,
  },

  optionNumberText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.bold,

    fontSize: 15,
  },

  optionHeaderText: {
    flex: 1,
  },

  optionTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 15,

    color:
      COLORS.text,

    marginBottom: 3,
  },

  optionSubtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    lineHeight: 17,

    color:
      COLORS.textSecondary,
  },

  searchRow: {
    flexDirection:
      'row',

    alignItems:
      'center',
  },

  searchInput: {
    flex: 1,

    height: 50,

    backgroundColor:
      COLORS.background,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.medium,

    paddingHorizontal:
      SPACING.medium,

    fontFamily:
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.text,

    marginRight:
      SPACING.small,
  },

  searchButton: {
    height: 50,

    paddingHorizontal:
      SPACING.large,

    borderRadius:
      RADIUS.medium,

    backgroundColor:
      COLORS.black,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  searchButtonText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize: 13,
  },

  currentLocationButton: {
    height: 50,

    borderRadius:
      RADIUS.medium,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  locationIcon: {
    fontSize: 22,

    color:
      COLORS.primary,

    marginRight:
      SPACING.small,
  },

  currentLocationText: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 14,

    color:
      COLORS.primary,
  },

  sectionTitleContainer: {
    marginTop:
      SPACING.large,

    marginBottom:
      SPACING.large,
  },

  sectionTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 17,

    color:
      COLORS.text,

    marginBottom: 4,
  },

  sectionSubtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    color:
      COLORS.textSecondary,
  },

  field: {
    marginBottom:
      SPACING.large,
  },

  label: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 14,

    color:
      COLORS.text,

    marginBottom:
      SPACING.small,
  },

  input: {
    minHeight: 52,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.medium,

    paddingHorizontal:
      SPACING.large,

    paddingVertical:
      SPACING.medium,

    fontFamily:
      FONTS.regular,

    fontSize: 16,

    color:
      COLORS.text,
  },

  mapSection: {
    marginTop:
      SPACING.medium,

    marginBottom:
      SPACING.xl,
  },

  mapHeader: {
    flexDirection:
      'row',

    alignItems:
      'flex-start',

    justifyContent:
      'space-between',

    marginBottom:
      SPACING.medium,
  },

  mapTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 17,

    color:
      COLORS.text,

    marginBottom: 4,
  },

  mapSubtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    lineHeight: 17,

    color:
      COLORS.textSecondary,

    maxWidth: 260,
  },

  confirmedBadge: {
    backgroundColor:
      COLORS.black,

    paddingHorizontal:
      SPACING.small,

    paddingVertical: 6,

    borderRadius:
      RADIUS.medium,
  },

  confirmedBadgeText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize: 11,
  },

  mapContainer: {
    height: 300,

    borderRadius:
      RADIUS.large,

    overflow:
      'hidden',

    borderWidth: 1,

    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,
  },

  map: {
    flex: 1,
  },

  mapEmptyOverlay: {
    position:
      'absolute',

    left: 20,

    right: 20,

    top: 0,

    bottom: 0,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  mapEmptyTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 15,

    color:
      COLORS.text,

    marginBottom: 5,
  },

  mapEmptyText: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    color:
      COLORS.textSecondary,

    textAlign:
      'center',

    maxWidth: 250,
  },

  mapLoadingOverlay: {
    position:
      'absolute',

    left: 0,

    right: 0,

    top: 0,

    bottom: 0,

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      'rgba(255,255,255,0.25)',
  },

  mapLoadingCard: {
    backgroundColor:
      COLORS.surface,

    borderRadius:
      RADIUS.medium,

    paddingHorizontal:
      SPACING.large,

    paddingVertical:
      SPACING.medium,

    flexDirection:
      'row',

    alignItems:
      'center',

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  mapLoadingText: {
    marginLeft:
      SPACING.small,

    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.text,
  },

  coordinatesCard: {
    flexDirection:
      'row',

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.medium,

    marginTop:
      SPACING.medium,

    padding:
      SPACING.medium,
  },

  coordinateItem: {
    flex: 1,
  },

  coordinateDivider: {
    width: 1,

    backgroundColor:
      COLORS.border,

    marginHorizontal:
      SPACING.medium,
  },

  coordinateLabel: {
    fontFamily:
      FONTS.regular,

    fontSize: 11,

    color:
      COLORS.textMuted,

    marginBottom: 3,
  },

  coordinateValue: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.text,
  },

  confirmLocationButton: {
    height: 52,

    marginTop:
      SPACING.medium,

    borderRadius:
      RADIUS.medium,

    backgroundColor:
      COLORS.black,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  confirmLocationButtonDisabled: {
    opacity: 0.45,
  },

  confirmLocationButtonConfirmed: {
    opacity: 1,
  },

  confirmLocationText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize: 15,
  },

  button: {
    width:
      '100%',

    height: 54,

    marginTop:
      SPACING.medium,

    borderRadius:
      RADIUS.medium,
  },

  buttonText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize: 16,

    textAlign:
      'center',
  },
});