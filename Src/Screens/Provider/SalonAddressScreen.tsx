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
  // APPLY REVERSE GEOCODE
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
          // UPDATE ADDRESS
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
  // UPDATE LOCATION
  // ==========================================================

  const updateSelectedLocation =
    useCallback(
      async (
        newCoordinates: Coordinates,
      ) => {
        setCoordinates(
          newCoordinates,
        );

        // Any location change requires confirmation again.
        setLocationConfirmed(
          false,
        );

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

        await applyReverseGeocode(
          newCoordinates,
        );
      },
      [applyReverseGeocode],
    );

  // ==========================================================
  // SEARCH ADDRESS
  // ==========================================================

  const handleSearchAddress =
    useCallback(async () => {
      if (!searchText.trim()) {
        Alert.alert(
          'Enter an address',
          'Please enter your salon address to search.',
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
            'We could not find this address. Try adding the area, city or pincode.',
          );

          return;
        }

        const newCoordinates: Coordinates = {
          latitude:
            result.latitude,

          longitude:
            result.longitude,
        };

        await updateSelectedLocation(
          newCoordinates,
        );
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
        setSearchingAddress(
          false,
        );
      }
    }, [
      searchText,
      geocodeAddress,
      updateSelectedLocation,
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
                  'Clavata uses your location to place your salon accurately on the map.',

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
                  'CURRENT GPS:',
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
                  'GPS ERROR:',
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

          return;
        }

        // ======================================================
        // UPDATE LOCATION
        // ======================================================

        const newCoordinates: Coordinates = {
          latitude:
            location.latitude,

          longitude:
            location.longitude,
        };

        await updateSelectedLocation(
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
      updateSelectedLocation,
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

        await updateSelectedLocation(
          newCoordinates,
        );
      },
      [updateSelectedLocation],
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

        await updateSelectedLocation(
          newCoordinates,
        );
      },
      [updateSelectedLocation],
    );

  // ==========================================================
  // CONFIRM LOCATION
  //
  // This is now the FINAL action on this screen.
  //
  // Once the user confirms:
  // 1. Validate address
  // 2. Save address + coordinates
  // 3. Navigate automatically to next screen
  // ==========================================================

  const handleConfirmLocation =
    useCallback(() => {
      // --------------------------------------------------------
      // LOCATION
      // --------------------------------------------------------

      if (!coordinates) {
        Alert.alert(
          'Select your location',
          'Search for your address or use your current location first.',
        );

        return;
      }

      // --------------------------------------------------------
      // ADDRESS
      // --------------------------------------------------------

      if (!addressLine.trim()) {
        Alert.alert(
          'Address required',
          'Please enter your salon street address.',
        );

        return;
      }

      // --------------------------------------------------------
      // CITY
      // --------------------------------------------------------

      if (!city.trim()) {
        Alert.alert(
          'City required',
          'Please enter your city.',
        );

        return;
      }

      // --------------------------------------------------------
      // STATE
      // --------------------------------------------------------

      if (!state.trim()) {
        Alert.alert(
          'State required',
          'Please enter your state.',
        );

        return;
      }

      // --------------------------------------------------------
      // PINCODE
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // SAVE REGISTRATION DATA
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // MARK AS CONFIRMED
      // --------------------------------------------------------

      setLocationConfirmed(
        true,
      );

      // --------------------------------------------------------
      // LOG
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // AUTOMATICALLY GO TO NEXT SCREEN
      // --------------------------------------------------------

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
          {/* ==================================================
              LOCATION METHOD CARD
          ================================================== */}

          <View
            style={
              styles.locationMethodCard
            }
          >
            <View
              style={
                styles.locationMethodHeader
              }
            >
              <View
                style={
                  styles.locationMethodHeaderText
                }
              >
                <Text
                  style={
                    styles.locationMethodTitle
                  }
                >
                  Find your salon
                </Text>
              </View>
            </View>

            {/* ==================================================
                SEARCH
            ================================================== */}

            <Text
              style={
                styles.searchLabel
              }
            >
              Search address
            </Text>

            <View
              style={
                styles.searchRow
              }
            >
              <TextInput
                style={
                  styles.searchInput
                }
                placeholder="Enter salon address, area or pincode"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={
                  searchText
                }
                onChangeText={
                  text => {
                    setSearchText(
                      text,
                    );

                    setLocationConfirmed(
                      false,
                    );
                  }
                }
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={
                  handleSearchAddress
                }
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
                  gettingLocation ||
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

            {/* ==================================================
                DIVIDER
            ================================================== */}

            <View
              style={
                styles.orContainer
              }
            >
              <View
                style={
                  styles.orLine
                }
              />

              <Text
                style={
                  styles.orText
                }
              >
                OR
              </Text>

              <View
                style={
                  styles.orLine
                }
              />
            </View>

            {/* ==================================================
                CURRENT LOCATION
            ================================================== */}

            <TouchableOpacity
              style={
                styles.currentLocationButton
              }
              onPress={
                handleUseCurrentLocation
              }
              disabled={
                gettingLocation ||
                searchingAddress ||
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
                  <View
                    style={
                      styles.currentLocationContent
                    }
                  >
                    <Text
                      style={
                        styles.currentLocationTitle
                      }
                    >
                      Use my current location
                    </Text>

                    <Text
                      style={
                        styles.currentLocationSubtitle
                      }
                    >
                      Automatically detect where you are
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.currentLocationArrow
                    }
                  >
                    ›
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ==================================================
              SELECTED LOCATION STATUS
          ================================================== */}

          {coordinates && (
            <View
              style={
                styles.selectedLocationBanner
              }
            >
              <View
                style={
                  styles.selectedLocationDot
                }
              />

              <View
                style={
                  styles.selectedLocationTextContainer
                }
              >
                <Text
                  style={
                    styles.selectedLocationTitle
                  }
                >
                  Location selected
                </Text>

                <Text
                  style={
                    styles.selectedLocationSubtitle
                  }
                >
                  Check the map below and adjust the pin if
                  needed.
                </Text>
              </View>
            </View>
          )}

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
              These details will be used as your salon's
              registered address.
            </Text>
          </View>

          {/* ==================================================
              ADDRESS
          ================================================== */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              Address
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.addressInput,
              ]}
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
              textAlignVertical="top"
            />
          </View>

          {/* ==================================================
              CITY + STATE
          ================================================== */}

          <View
            style={
              styles.twoColumnRow
            }
          >
            <View
              style={[
                styles.field,
                styles.columnField,
              ]}
            >
              <Text
                style={styles.label}
              >
                City
              </Text>

              <TextInput
                style={
                  styles.input
                }
                placeholder="City"
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

            <View
              style={[
                styles.field,
                styles.columnField,
              ]}
            >
              <Text
                style={styles.label}
              >
                State
              </Text>

              <TextInput
                style={
                  styles.input
                }
                placeholder="State"
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
          </View>

          {/* ==================================================
              PINCODE
          ================================================== */}

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
              placeholder="6-digit pincode"
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
                style={
                  styles.mapHeaderTextContainer
                }
              >
                <Text
                  style={
                    styles.mapTitle
                  }
                >
                  Verify your exact location
                </Text>

                <Text
                  style={
                    styles.mapSubtitle
                  }
                >
                  Drag the pin or tap anywhere on the map to
                  adjust the location.
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

            {/* ==================================================
                MAP
            ================================================== */}

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
                    description="Drag this pin to your exact salon location."
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
                  <View
                    style={
                      styles.mapEmptyCard
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
                      location above.
                    </Text>
                  </View>
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
                FINAL ACTION
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER
  // ==========================================================

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

  // ==========================================================
  // HEADER
  // ==========================================================

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

    maxWidth: 350,
  },

  // ==========================================================
  // LOCATION METHOD CARD
  // ==========================================================

  locationMethodCard: {
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

  locationMethodHeader: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginBottom:
      SPACING.large,
  },

  locationIconContainer: {
    width: 42,

    height: 42,

    borderRadius:
      RADIUS.round,

    backgroundColor:
      COLORS.background,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    alignItems:
      'center',

    justifyContent:
      'center',

    marginRight:
      SPACING.medium,
  },

  locationPinIcon: {
    fontSize: 22,

    color:
      COLORS.primary,
  },

  locationMethodHeaderText: {
    flex: 1,
  },

  locationMethodTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 16,

    color:
      COLORS.text,

    marginBottom: 3,
  },

  locationMethodSubtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    lineHeight: 17,

    color:
      COLORS.textSecondary,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchLabel: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.text,

    marginBottom:
      SPACING.small,
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
      COLORS.themeColor,

    alignItems:
      'center',

    justifyContent:
      'center',

    minWidth: 82,
  },

  searchButtonText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize: 13,
  },

  // ==========================================================
  // OR DIVIDER
  // ==========================================================

  orContainer: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginVertical:
      SPACING.large,
  },

  orLine: {
    flex: 1,

    height: 1,

    backgroundColor:
      COLORS.border,
  },

  orText: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 10,

    color:
      COLORS.textMuted,

    marginHorizontal:
      SPACING.medium,
  },

  // ==========================================================
  // CURRENT LOCATION
  // ==========================================================

  currentLocationButton: {
    minHeight: 58,

    borderRadius:
      RADIUS.medium,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    flexDirection:
      'row',

    alignItems:
      'center',

    paddingHorizontal:
      SPACING.medium,

    backgroundColor:
      COLORS.background,
  },

  currentLocationIcon: {
    fontSize: 23,

    color:
      COLORS.primary,

    marginRight:
      SPACING.medium,
  },

  currentLocationContent: {
    flex: 1,
  },

  currentLocationTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 14,

    color:
      COLORS.text,

    marginBottom: 2,
  },

  currentLocationSubtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 11,

    color:
      COLORS.textSecondary,
  },

  currentLocationArrow: {
    fontFamily:
      FONTS.regular,

    fontSize: 25,

    color:
      COLORS.textMuted,

    marginLeft:
      SPACING.small,
  },

  // ==========================================================
  // SELECTED LOCATION BANNER
  // ==========================================================

  selectedLocationBanner: {
    flexDirection:
      'row',

    alignItems:
      'center',

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.medium,

    padding:
      SPACING.medium,

    marginBottom:
      SPACING.medium,
  },

  selectedLocationDot: {
    width: 9,

    height: 9,

    borderRadius:
      RADIUS.round,

    backgroundColor:
      COLORS.themeColor,

    marginRight:
      SPACING.small,
  },

  selectedLocationTextContainer: {
    flex: 1,
  },

  selectedLocationTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.text,

    marginBottom: 2,
  },

  selectedLocationSubtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 11,

    color:
      COLORS.textSecondary,
  },

  // ==========================================================
  // ADDRESS SECTION
  // ==========================================================

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

    lineHeight: 17,

    color:
      COLORS.textSecondary,
  },

  field: {
    marginBottom:
      SPACING.large,
  },

  twoColumnRow: {
    flexDirection:
      'row',

    gap:
      SPACING.medium,
  },

  columnField: {
    flex: 1,
  },

  label: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

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

    fontSize: 15,

    color:
      COLORS.text,
  },

  addressInput: {
    minHeight: 82,

    paddingTop:
      SPACING.medium,
  },

  // ==========================================================
  // MAP SECTION
  // ==========================================================

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

  mapHeaderTextContainer: {
    flex: 1,

    paddingRight:
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
  },

  confirmedBadge: {
    backgroundColor:
      COLORS.themeColor,

    paddingHorizontal:
      SPACING.small,

    paddingVertical:
      6,

    borderRadius:
      RADIUS.medium,
  },

  confirmedBadgeText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize: 10,
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

  // ==========================================================
  // EMPTY MAP
  // ==========================================================

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

  mapEmptyCard: {
    backgroundColor:
      'rgba(255,255,255,0.94)',

    borderRadius:
      RADIUS.large,

    paddingHorizontal:
      SPACING.xl,

    paddingVertical:
      SPACING.large,

    alignItems:
      'center',

    maxWidth: 290,

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  mapEmptyIcon: {
    fontSize: 26,

    color:
      COLORS.primary,

    marginBottom:
      SPACING.small,
  },

  mapEmptyTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 14,

    color:
      COLORS.text,

    marginBottom: 5,
  },

  mapEmptyText: {
    fontFamily:
      FONTS.regular,

    fontSize: 11,

    lineHeight: 16,

    color:
      COLORS.textSecondary,

    textAlign:
      'center',
  },

  // ==========================================================
  // MAP LOADING
  // ==========================================================

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

  // ==========================================================
  // COORDINATES
  // ==========================================================

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

    fontSize: 10,

    color:
      COLORS.textMuted,

    marginBottom: 3,
  },

  coordinateValue: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 12,

    color:
      COLORS.text,
  },

  // ==========================================================
  // CONFIRM LOCATION
  // ==========================================================

  confirmLocationButton: {
    height: 52,

    marginTop:
      SPACING.medium,

    borderRadius:
      RADIUS.medium,

    backgroundColor:
      COLORS.themeColor,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  confirmLocationButtonDisabled: {
    opacity: 0.4,
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
});