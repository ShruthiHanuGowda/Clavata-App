import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import MapView, {
    Marker,
    MapPressEvent,
    MarkerDragStartEndEvent,
    Region,
} from 'react-native-maps';

import Geolocation from '@react-native-community/geolocation';

import {
    check,
    request,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';

import {
    reverseGeocode,
} from '../../../services/locationService';

import {
    saveLocation,
    addRecentLocation,
    LocationData,
} from '../../../services/locationStorage';

import {
    USE_HARDCODED_LOCATION,
    HARDCODED_LOCATION,
} from '../../../services/locationConfig';

import {
    COLORS,
    FONTS,
    SPACING,
    RADIUS,
} from '../../../constants/constants';


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
// DEFAULT MAP LOCATION
// ============================================================

const DEFAULT_COORDINATES: Coordinates = {
    latitude: 12.9716,
    longitude: 77.5946,
};

const DEFAULT_DELTA = {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};


// ============================================================
// SCREEN
// ============================================================

export default function CustomerLocationScreen({
    navigation,
}: any) {

    // ==========================================================
    // LOCATION
    // ==========================================================
    console.log('======================================');
    console.log('📍 CUSTOMER LOCATION SCREEN MOUNTED');
    console.log('======================================');
    const [
        coordinates,
        setCoordinates,
    ] = useState<Coordinates | null>(null);

    const [
        address,
        setAddress,
    ] = useState('');

    const [
        locationConfirmed,
        setLocationConfirmed,
    ] = useState(false);


    // ==========================================================
    // SEARCH
    // ==========================================================

    const [
        searchText,
        setSearchText,
    ] = useState('');

    const [
        searchingAddress,
        setSearchingAddress,
    ] = useState(false);


    // ==========================================================
    // LOADING
    // ==========================================================

    const [
        gettingLocation,
        setGettingLocation,
    ] = useState(false);

    const [
        reverseGeocoding,
        setReverseGeocoding,
    ] = useState(false);

    const [
        savingLocation,
        setSavingLocation,
    ] = useState(false);


    // ==========================================================
    // PERMISSION
    // ==========================================================

    const [
        permissionChecked,
        setPermissionChecked,
    ] = useState(false);

    const [
        permissionDenied,
        setPermissionDenied,
    ] = useState(false);


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
    // PERMISSION TYPE
    // ==========================================================

    const getLocationPermission =
        useCallback(() => {

            if (Platform.OS === 'android') {
                return PERMISSIONS.ANDROID
                    .ACCESS_FINE_LOCATION;
            }

            return PERMISSIONS.IOS
                .LOCATION_WHEN_IN_USE;

        }, []);


    // ==========================================================
    // REVERSE GEOCODE
    //
    // We use the same Nominatim approach as your
    // SalonAddressScreen.
    // ==========================================================

    const reverseGeocodeLocation =
        useCallback(
            async (
                location: Coordinates,
            ): Promise<string | null> => {

                try {

                    setReverseGeocoding(true);

                    const url =
                        `https://nominatim.openstreetmap.org/reverse?` +
                        `lat=${location.latitude}` +
                        `&lon=${location.longitude}` +
                        `&format=jsonv2`;

                    const response =
                        await fetch(
                            url,
                            {
                                method: 'GET',

                                headers: {
                                    Accept:
                                        'application/json',

                                    'User-Agent':
                                        'ClavataCustomerApp/1.0',
                                },
                            },
                        );

                    if (!response.ok) {
                        return null;
                    }

                    const data =
                        (await response.json()) as {
                            display_name?: string;
                        };

                    const displayName =
                        data?.display_name?.trim();

                    if (!displayName) {
                        return null;
                    }

                    return displayName;

                } catch (error) {

                    console.error(
                        'REVERSE GEOCODE ERROR:',
                        error,
                    );

                    return null;

                } finally {

                    setReverseGeocoding(false);
                }

            },
            [],
        );


    // ==========================================================
    // APPLY LOCATION
    // ==========================================================

    const applyCoordinates =
        useCallback(
            async (
                location: Coordinates,
            ) => {

                setCoordinates(
                    location,
                );

                setLocationConfirmed(
                    false,
                );

                setMapRegion({
                    latitude:
                        location.latitude,

                    longitude:
                        location.longitude,

                    latitudeDelta:
                        0.005,

                    longitudeDelta:
                        0.005,
                });

                const result =
                    await reverseGeocodeLocation(
                        location,
                    );

                if (result) {

                    setAddress(
                        result,
                    );

                    setSearchText(
                        result,
                    );

                } else {

                    setAddress(
                        'Current location',
                    );

                    setSearchText(
                        '',
                    );
                }

            },
            [
                reverseGeocodeLocation,
            ],
        );


    // ==========================================================
    // HARD-CODED DEVELOPMENT LOCATION
    // ==========================================================

    const useHardcodedLocation =
        useCallback(
            async () => {

                console.log('');
                console.log(
                    '========================================',
                );

                console.log(
                    '🧪 TEST MODE: USING HARDCODED LOCATION',
                );

                console.log(
                    '📍 Test location:',
                    HARDCODED_LOCATION,
                );

                console.log(
                    '========================================',
                );

                const location: Coordinates = {
                    latitude:
                        HARDCODED_LOCATION.latitude,

                    longitude:
                        HARDCODED_LOCATION.longitude,
                };

                await applyCoordinates(
                    location,
                );

            },
            [
                applyCoordinates,
            ],
        );


    // ==========================================================
    // CURRENT GPS LOCATION
    // ==========================================================

    // ==========================================================
    // CURRENT GPS LOCATION
    // ==========================================================

    const getCurrentLocation = useCallback(async () => {
        console.log('========================================');
        console.log('📍 getCurrentLocation() STARTED');
        console.log('========================================');

        setGettingLocation(true);

        try {
            console.log(
                '📍 Calling Geolocation.getCurrentPosition...',
            );

            Geolocation.getCurrentPosition(
                async position => {
                    console.log('========================================');
                    console.log('✅ GPS LOCATION RECEIVED');

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    console.log(
                        '📍 latitude:',
                        latitude,
                    );

                    console.log(
                        '📍 longitude:',
                        longitude,
                    );

                    console.log(
                        '📍 FULL LOCATION:',
                        JSON.stringify(position),
                    );

                    console.log(
                        '========================================',
                    );

                    const location: Coordinates = {
                        latitude,
                        longitude,
                    };

                    await applyCoordinates(
                        location,
                    );

                    setGettingLocation(false);
                },

                error => {
                    console.log('========================================');
                    console.error(
                        '❌ GET CURRENT LOCATION ERROR',
                    );
                    console.error(
                        'Code:',
                        error.code,
                    );
                    console.error(
                        'Message:',
                        error.message,
                    );
                    console.log('========================================');

                    setGettingLocation(false);

                    Alert.alert(
                        'Unable to get location',
                        'We could not determine your current location. Please try again.',
                    );
                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                },
            );
        } catch (error) {
            console.log('========================================');
            console.error(
                '❌ GET CURRENT LOCATION ERROR',
                error,
            );
            console.log('========================================');

            setGettingLocation(false);

            Alert.alert(
                'Location Error',
                'Unable to get your current location.',
            );
        }
    }, [
        applyCoordinates,
    ]);


    // ==========================================================
    // REQUEST LOCATION PERMISSION
    // ==========================================================
    const requestLocationPermission = useCallback(
        async () => {
            console.log("i am called")
            // ------------------------------------------------------
            // DEVELOPMENT MODE
            // ------------------------------------------------------

            if (USE_HARDCODED_LOCATION) {
                setPermissionChecked(true);
                setPermissionDenied(false);
                await useHardcodedLocation();
                return;
            }

            // ------------------------------------------------------
            // PRODUCTION
            // ------------------------------------------------------

            try {
                const permission = getLocationPermission();

                let status = await check(permission);

                console.log('📍 Location permission:', status);

                // ----------------------------------------------------
                // Already granted
                // ----------------------------------------------------

                if (status === RESULTS.GRANTED) {
                    console.log('✅ Location permission already granted');

                    setPermissionChecked(true);
                    setPermissionDenied(false);

                    console.log('🚀 PRODUCTION MODE: Requesting GPS');

                    await getCurrentLocation();

                    return;
                }

                // ----------------------------------------------------
                // Request permission
                // ----------------------------------------------------

                if (status === RESULTS.DENIED) {
                    console.log('📍 Requesting location permission...');

                    status = await request(permission);

                    console.log(
                        '📍 Location permission after request:',
                        status,
                    );
                }

                // ----------------------------------------------------
                // Granted after request
                // ----------------------------------------------------

                if (status === RESULTS.GRANTED) {
                    console.log('✅ Location permission granted');

                    setPermissionChecked(true);
                    setPermissionDenied(false);

                    console.log('🚀 PRODUCTION MODE: Requesting GPS');

                    await getCurrentLocation();

                    return;
                }

                // ----------------------------------------------------
                // Blocked
                // ----------------------------------------------------

                if (status === RESULTS.BLOCKED) {
                    console.log('❌ Location permission blocked');

                    setPermissionChecked(true);
                    setPermissionDenied(true);

                    return;
                }

                // ----------------------------------------------------
                // Other denied state
                // ----------------------------------------------------

                console.log(
                    '❌ Location permission denied:',
                    status,
                );

                setPermissionChecked(true);
                setPermissionDenied(true);

            } catch (error) {
                console.error(
                    'LOCATION PERMISSION ERROR:',
                    error,
                );

                setPermissionChecked(true);
                setPermissionDenied(true);

                Alert.alert(
                    'Location Error',
                    'Unable to request location permission.',
                );
            }
        },
        [
            getLocationPermission,
            getCurrentLocation,
            useHardcodedLocation,
        ],
    );


    // ==========================================================
    // AUTOMATICALLY REQUEST LOCATION AFTER LOGIN
    // ==========================================================

    useEffect(() => {
        console.log('📍 CUSTOMER LOCATION: REQUESTING PERMISSION');
        requestLocationPermission();
    }, [
        requestLocationPermission,
    ]);


    // ==========================================================
    // SEARCH ADDRESS
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
                                        'ClavataCustomerApp/1.0',
                                },
                            },
                        );

                    if (!response.ok) {
                        throw new Error(
                            `Geocoding failed: ${response.status}`,
                        );
                    }

                    const data =
                        (await response.json()) as Array<{
                            lat?: string;
                            lon?: string;
                            display_name?: string;
                        }>;

                    if (
                        !Array.isArray(data) ||
                        data.length === 0
                    ) {
                        return null;
                    }

                    const result =
                        data[0];

                    const latitude =
                        Number(result.lat);

                    const longitude =
                        Number(result.lon);

                    if (
                        !Number.isFinite(
                            latitude,
                        ) ||
                        !Number.isFinite(
                            longitude,
                        )
                    ) {
                        return null;
                    }

                    return {
                        latitude,
                        longitude,
                        displayName:
                            result.display_name ||
                            '',
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
    // SEARCH BUTTON
    // ==========================================================

    const handleSearchAddress =
        useCallback(
            async () => {

                const query =
                    searchText.trim();

                if (!query) {

                    Alert.alert(
                        'Enter a location',
                        'Please enter an address, area or pincode.',
                    );

                    return;
                }

                try {

                    setSearchingAddress(
                        true,
                    );

                    const result =
                        await geocodeAddress(
                            query,
                        );

                    if (!result) {

                        Alert.alert(
                            'Location not found',
                            'We could not find this location. Try adding the city or pincode.',
                        );

                        return;
                    }

                    const location: Coordinates = {
                        latitude:
                            result.latitude,

                        longitude:
                            result.longitude,
                    };

                    await applyCoordinates(
                        location,
                    );

                } catch (error) {

                    console.error(
                        'SEARCH LOCATION ERROR:',
                        error,
                    );

                    Alert.alert(
                        'Search Error',
                        'Unable to find this location. Please try again.',
                    );

                } finally {

                    setSearchingAddress(
                        false,
                    );
                }

            },
            [
                searchText,
                geocodeAddress,
                applyCoordinates,
            ],
        );


    // ==========================================================
    // MAP PRESS
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

                const location: Coordinates = {
                    latitude,
                    longitude,
                };

                await applyCoordinates(
                    location,
                );
            },
            [
                applyCoordinates,
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

                const {
                    latitude,
                    longitude,
                } =
                    event.nativeEvent.coordinate;

                const location: Coordinates = {
                    latitude,
                    longitude,
                };

                await applyCoordinates(
                    location,
                );
            },
            [
                applyCoordinates,
            ],
        );


    // ==========================================================
    // MAP REGION CHANGE
    // ==========================================================

    const handleRegionChangeComplete =
        useCallback(
            (
                region: Region,
            ) => {

                setMapRegion(
                    region,
                );
            },
            [],
        );


    // ==========================================================
    // CONFIRM LOCATION
    // ==========================================================

    const handleConfirmLocation = useCallback(
        async () => {
            if (!coordinates) {
                Alert.alert(
                    'Select a location',
                    'Please allow location access or search for your location first.',
                );

                return;
            }

            if (reverseGeocoding) {
                return;
            }

            try {
                setSavingLocation(true);

                const location: LocationData = {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    address:
                        address.trim() || 'Selected Location',
                };

                console.log('');
                console.log(
                    '========================================',
                );

                console.log(
                    '📍 CUSTOMER LOCATION CONFIRMED',
                );

                console.log(
                    'ADDRESS:',
                    location.address,
                );

                console.log(
                    'LATITUDE:',
                    location.latitude,
                );

                console.log(
                    'LONGITUDE:',
                    location.longitude,
                );

                console.log(
                    '========================================',
                );

                // ----------------------------------------------------
                // SAVE ACTIVE LOCATION
                // ----------------------------------------------------

                await saveLocation(location);

                // ----------------------------------------------------
                // ADD TO RECENT LOCATIONS
                // ----------------------------------------------------

                await addRecentLocation(location);

                setLocationConfirmed(true);

                console.log(
                    '✅ Customer location saved',
                );

                // ----------------------------------------------------
                // GO HOME
                // ----------------------------------------------------

                navigation.replace('HomeScreen', {
                    latitude: location.latitude,
                    longitude: location.longitude,
                });

            } catch (error) {
                console.error(
                    'SAVE LOCATION ERROR:',
                    error,
                );

                Alert.alert(
                    'Location Error',
                    'Unable to save your location. Please try again.',
                );
            } finally {
                setSavingLocation(false);
            }
        },
        [
            coordinates,
            address,
            reverseGeocoding,
            saveLocation,
            addRecentLocation,
            navigation,
        ],
    );

    // ==========================================================
    // OPEN SETTINGS
    // ==========================================================

    const handleOpenSettings =
        useCallback(() => {

            Linking.openSettings();

        }, []);


    // ==========================================================
    // RENDER
    // ==========================================================

    return (
        <SafeAreaView
            style={styles.container}
        >

            {/* ======================================================
          HEADER
      ====================================================== */}

            <View
                style={styles.header}
            >

                <Text
                    style={styles.headerTitle}
                >
                    Choose your location
                </Text>

                <Text
                    style={styles.headerSubtitle}
                >
                    We use your location to show salons near you.
                </Text>

            </View>


            {/* ======================================================
          PERMISSION DENIED
      ====================================================== */}

            {permissionDenied &&
                !coordinates && (

                    <View
                        style={
                            styles.permissionCard
                        }
                    >

                        <View
                            style={
                                styles.permissionIcon
                            }
                        >
                            <Text
                                style={
                                    styles.permissionIconText
                                }
                            >
                                📍
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.permissionTitle
                            }
                        >
                            Location access is needed
                        </Text>

                        <Text
                            style={
                                styles.permissionText
                            }
                        >
                            Clavata uses your location to find
                            salons and services near you.
                        </Text>

                        <TouchableOpacity
                            style={
                                styles.permissionButton
                            }
                            onPress={
                                handleOpenSettings
                            }
                            activeOpacity={0.8}
                        >

                            <Text
                                style={
                                    styles.permissionButtonText
                                }
                            >
                                Enable Location
                            </Text>

                        </TouchableOpacity>

                    </View>
                )}


            {/* ======================================================
          SEARCH
      ====================================================== */}

            <View
                style={styles.searchSection}
            >

                <View
                    style={styles.searchRow}
                >

                    <TextInput
                        style={
                            styles.searchInput
                        }
                        placeholder="Search area, address or pincode"
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
                            reverseGeocoding
                        }
                        activeOpacity={0.8}
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


                {/* ====================================================
            CURRENT LOCATION
        ==================================================== */}

                <TouchableOpacity
                    style={
                        styles.currentLocationButton
                    }
                    onPress={
                        requestLocationPermission
                    }
                    disabled={
                        gettingLocation ||
                        reverseGeocoding
                    }
                    activeOpacity={0.8}
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
                                    styles.currentLocationIcon
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


            {/* ======================================================
          MAP
      ====================================================== */}

            <View
                style={styles.mapContainer}
            >

                <MapView
                    style={styles.map}
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
                            title="Your location"
                            description={
                                address ||
                                'Selected location'
                            }
                            draggable
                            onDragEnd={
                                handleMarkerDragEnd
                            }
                        />

                    )}

                </MapView>


                {/* ====================================================
            EMPTY MAP
        ==================================================== */}

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
                                Allow location access or search for
                                your area above.
                            </Text>

                        </View>

                    </View>
                )}


                {/* ====================================================
            REVERSE GEOCODING LOADER
        ==================================================== */}

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
                                Finding address...
                            </Text>

                        </View>

                    </View>
                )}

            </View>


            {/* ======================================================
          SELECTED LOCATION
      ====================================================== */}

            {coordinates && (

                <View
                    style={
                        styles.locationCard
                    }
                >

                    <View
                        style={
                            styles.locationCardIcon
                        }
                    >

                        <Text
                            style={
                                styles.locationCardIconText
                            }
                        >
                            📍
                        </Text>

                    </View>


                    <View
                        style={
                            styles.locationCardContent
                        }
                    >

                        <Text
                            style={
                                styles.locationCardTitle
                            }
                        >
                            Your location
                        </Text>

                        <Text
                            style={
                                styles.locationAddress
                            }
                            numberOfLines={3}
                        >
                            {address ||
                                'Selected location'}
                        </Text>

                        <Text
                            style={
                                styles.coordinatesText
                            }
                        >
                            {coordinates.latitude.toFixed(
                                6,
                            )}
                            {'  •  '}
                            {coordinates.longitude.toFixed(
                                6,
                            )}
                        </Text>

                    </View>

                </View>
            )}


            {/* ======================================================
          CONFIRM
      ====================================================== */}

            <View
                style={
                    styles.bottomContainer
                }
            >

                <TouchableOpacity
                    style={[
                        styles.confirmButton,

                        !coordinates &&
                        styles.confirmButtonDisabled,

                        locationConfirmed &&
                        styles.confirmButtonConfirmed,
                    ]}
                    onPress={
                        handleConfirmLocation
                    }
                    disabled={
                        !coordinates ||
                        reverseGeocoding ||
                        savingLocation
                    }
                    activeOpacity={0.8}
                >

                    {savingLocation ? (

                        <ActivityIndicator
                            color={
                                COLORS.white
                            }
                        />

                    ) : (

                        <Text
                            style={
                                styles.confirmButtonText
                            }
                        >
                            {locationConfirmed
                                ? '✓ Location Confirmed'
                                : 'Confirm Location'}
                        </Text>

                    )}

                </TouchableOpacity>

            </View>

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


    // ==========================================================
    // HEADER
    // ==========================================================

    header: {
        paddingHorizontal:
            SPACING.xxl,

        paddingTop:
            SPACING.xxl,

        paddingBottom:
            SPACING.medium,
    },

    headerTitle: {
        fontFamily:
            FONTS.bold,

        fontSize: 22,

        color:
            COLORS.text,

        marginBottom:
            SPACING.small,
    },

    headerSubtitle: {
        fontFamily:
            FONTS.regular,

        fontSize: 13,

        lineHeight: 19,

        color:
            COLORS.textSecondary,
    },


    // ==========================================================
    // PERMISSION
    // ==========================================================

    permissionCard: {
        marginHorizontal:
            SPACING.xxl,

        marginBottom:
            SPACING.medium,

        padding:
            SPACING.large,

        borderRadius:
            RADIUS.large,

        backgroundColor:
            COLORS.surface,

        borderWidth: 1,

        borderColor:
            COLORS.border,

        alignItems:
            'center',
    },

    permissionIcon: {
        width: 54,

        height: 54,

        borderRadius: 27,

        backgroundColor:
            '#EAF8F5',

        alignItems:
            'center',

        justifyContent:
            'center',

        marginBottom:
            SPACING.medium,
    },

    permissionIconText: {
        fontSize: 25,
    },

    permissionTitle: {
        fontFamily:
            FONTS.semiBold,

        fontSize: 16,

        color:
            COLORS.text,

        marginBottom: 6,

        textAlign:
            'center',
    },

    permissionText: {
        fontFamily:
            FONTS.regular,

        fontSize: 12,

        lineHeight: 18,

        color:
            COLORS.textSecondary,

        textAlign:
            'center',

        marginBottom:
            SPACING.medium,
    },

    permissionButton: {
        height: 46,

        paddingHorizontal:
            SPACING.xxl,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.primary,

        alignItems:
            'center',

        justifyContent:
            'center',
    },

    permissionButtonText: {
        fontFamily:
            FONTS.semiBold,

        fontSize: 13,

        color:
            COLORS.white,
    },


    // ==========================================================
    // SEARCH
    // ==========================================================

    searchSection: {
        paddingHorizontal:
            SPACING.xxl,

        marginBottom:
            SPACING.medium,
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
            COLORS.surface,

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
        fontFamily:
            FONTS.semiBold,

        fontSize: 13,

        color:
            COLORS.white,
    },


    // ==========================================================
    // CURRENT LOCATION
    // ==========================================================

    currentLocationButton: {
        height: 48,

        marginTop:
            SPACING.small,

        borderRadius:
            RADIUS.medium,

        borderWidth: 1,

        borderColor:
            COLORS.border,

        backgroundColor:
            COLORS.surface,

        flexDirection:
            'row',

        alignItems:
            'center',

        justifyContent:
            'center',
    },

    currentLocationIcon: {
        fontSize: 22,

        color:
            COLORS.primary,

        marginRight:
            SPACING.small,
    },

    currentLocationText: {
        fontFamily:
            FONTS.semiBold,

        fontSize: 13,

        color:
            COLORS.primary,
    },


    // ==========================================================
    // MAP
    // ==========================================================

    mapContainer: {
        flex: 1,

        marginHorizontal:
            SPACING.xxl,

        borderRadius:
            RADIUS.large,

        overflow:
            'hidden',

        borderWidth: 1,

        borderColor:
            COLORS.border,

        backgroundColor:
            COLORS.surface,

        minHeight: 280,
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

    mapEmptyCard: {
        backgroundColor:
            'rgba(255,255,255,0.94)',

        paddingHorizontal:
            SPACING.large,

        paddingVertical:
            SPACING.medium,

        borderRadius:
            RADIUS.medium,

        borderWidth: 1,

        borderColor:
            COLORS.border,

        alignItems:
            'center',
    },

    mapEmptyTitle: {
        fontFamily:
            FONTS.semiBold,

        fontSize: 14,

        color:
            COLORS.text,

        marginBottom: 4,
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

        maxWidth: 240,
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
    // LOCATION CARD
    // ==========================================================

    locationCard: {
        flexDirection:
            'row',

        marginHorizontal:
            SPACING.xxl,

        marginTop:
            SPACING.medium,

        padding:
            SPACING.medium,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.surface,

        borderWidth: 1,

        borderColor:
            COLORS.border,
    },

    locationCardIcon: {
        width: 38,

        height: 38,

        borderRadius: 19,

        backgroundColor:
            '#EAF8F5',

        alignItems:
            'center',

        justifyContent:
            'center',

        marginRight:
            SPACING.medium,
    },

    locationCardIconText: {
        fontSize: 18,
    },

    locationCardContent: {
        flex: 1,
    },

    locationCardTitle: {
        fontFamily:
            FONTS.semiBold,

        fontSize: 12,

        color:
            COLORS.textSecondary,

        marginBottom: 3,
    },

    locationAddress: {
        fontFamily:
            FONTS.semiBold,

        fontSize: 13,

        lineHeight: 18,

        color:
            COLORS.text,
    },

    coordinatesText: {
        fontFamily:
            FONTS.regular,

        fontSize: 10,

        color:
            COLORS.textMuted,

        marginTop: 5,
    },


    // ==========================================================
    // BOTTOM
    // ==========================================================

    bottomContainer: {
        paddingHorizontal:
            SPACING.xxl,

        paddingTop:
            SPACING.medium,

        paddingBottom:
            SPACING.large,

        backgroundColor:
            COLORS.background,
    },

    confirmButton: {
        height: 54,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.primary,

        alignItems:
            'center',

        justifyContent:
            'center',
    },

    confirmButtonDisabled: {
        opacity: 0.45,
    },

    confirmButtonConfirmed: {
        opacity: 1,
    },

    confirmButtonText: {
        fontFamily:
            FONTS.semiBold,

        fontSize: 15,

        color:
            COLORS.white,
    },
});