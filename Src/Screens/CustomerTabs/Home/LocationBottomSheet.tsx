import React, {
    useEffect,
    useState,
} from 'react';

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    ScrollView,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';

import Modal from 'react-native-modal';

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
    getSavedLocations,
    getRecentLocations,
    addRecentLocation,
    SavedLocation,
    LocationData,
} from '../../../services/locationStorage';

import {
    USE_HARDCODED_LOCATION,
    HARDCODED_LOCATION,
} from '../../../services/locationConfig';

const PRIMARY = '#008060';


// ============================================================
// TYPES
// ============================================================

type Props = {
    visible: boolean;

    onClose: () => void;

    onLocationSelected: (
        location: LocationData,
    ) => void;
};


// ============================================================
// COMPONENT
// ============================================================

export default function LocationBottomSheet({
    visible,
    onClose,
    onLocationSelected,
}: Props) {

    // ==========================================================
    // STATE
    // ==========================================================

    const [
        recentLocations,
        setRecentLocations,
    ] = useState<LocationData[]>([]);

    const [
        savedLocations,
        setSavedLocations,
    ] = useState<SavedLocation[]>([]);

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        detectedLocation,
        setDetectedLocation,
    ] = useState<LocationData | null>(null);

    const [
        loadingLocation,
        setLoadingLocation,
    ] = useState(false);


    // ==========================================================
    // LOAD WHEN MODAL OPENS
    // ==========================================================

    useEffect(() => {
        if (visible) {

            console.log('');
            console.log(
                '========================================',
            );

            console.log(
                '📍 LOCATION BOTTOM SHEET OPENED',
            );

            console.log(
                'Location Mode:',
                USE_HARDCODED_LOCATION
                    ? '🧪 HARDCODED TEST'
                    : '🚀 PRODUCTION',
            );

            console.log(
                '========================================',
            );

            loadLocations();

            // Clear temporary state whenever sheet opens
            setDetectedLocation(null);
            setSearch('');
        }
    }, [visible]);


    // ==========================================================
    // LOAD SAVED + RECENT LOCATIONS
    // ==========================================================

    const loadLocations = async () => {

        try {

            console.log('');
            console.log(
                '========================================',
            );

            console.log(
                '📍 LOADING SAVED / RECENT LOCATIONS',
            );

            console.log(
                '========================================',
            );


            // ======================================================
            // SAVED LOCATIONS
            // ======================================================

            const saved =
                await getSavedLocations();

            console.log(
                '📦 Saved locations:',
                saved,
            );


            // ======================================================
            // RECENT LOCATIONS
            // ======================================================

            const recent =
                await getRecentLocations();

            console.log(
                '🕘 Recent locations:',
                recent,
            );


            // ======================================================
            // UPDATE UI
            // ======================================================

            setSavedLocations(
                saved,
            );

            setRecentLocations(
                recent,
            );


            console.log(
                '✅ Location UI state updated',
            );

        } catch (error) {

            console.log(
                '❌ LOAD LOCATIONS ERROR:',
                error,
            );
        }
    };


    // ==========================================================
    // CURRENT LOCATION
    // ==========================================================

    const getCurrentLocation = () => {

        // ========================================================
        // TEST MODE
        // ========================================================

        if (USE_HARDCODED_LOCATION) {

            console.log('');
            console.log(
                '🧪 TEST MODE: Using HARDCODED_LOCATION',
            );

            console.log(
                '📍 Test location:',
                HARDCODED_LOCATION,
            );


            const location: LocationData = {
                ...HARDCODED_LOCATION,
            };


            setDetectedLocation(
                location,
            );

            return;
        }


        // ========================================================
        // PRODUCTION MODE
        // ========================================================

        console.log('');
        console.log(
            '🚀 PRODUCTION MODE: Requesting GPS',
        );

        setLoadingLocation(
            true,
        );


        Geolocation.getCurrentPosition(

            async position => {

                try {

                    console.log(
                        '📍 GPS coordinates:',
                        position.coords,
                    );


                    // ==================================================
                    // REVERSE GEOCODE
                    // ==================================================

                    const result =
                        await reverseGeocode(
                            position.coords.latitude,
                            position.coords.longitude,
                        );


                    const location: LocationData = {

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,

                        address:
                            result?.display_name ||
                            'Current Location',
                    };


                    console.log(
                        '📍 Detected Location:',
                        location,
                    );


                    setDetectedLocation(
                        location,
                    );

                } catch (error) {

                    console.log(
                        '❌ Location detection error:',
                        error,
                    );

                    Alert.alert(
                        'Location Error',
                        'Unable to determine your location.',
                    );

                } finally {

                    setLoadingLocation(
                        false,
                    );
                }
            },


            error => {

                setLoadingLocation(
                    false,
                );


                console.log(
                    '❌ GPS Error:',
                    error,
                );


                Alert.alert(
                    'Location Error',
                    error.message ||
                    'Unable to detect your location.',
                );
            },


            {
                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 10000,
            },
        );
    };


    // ==========================================================
    // LOCATION PERMISSION
    // ==========================================================

    const requestLocationPermission =
        async () => {

            // ======================================================
            // TEST MODE
            // ======================================================

            if (USE_HARDCODED_LOCATION) {

                console.log(
                    '🧪 TEST MODE: GPS permission not required',
                );

                getCurrentLocation();

                return;
            }


            // ======================================================
            // PRODUCTION MODE
            // ======================================================

            try {

                const permission =
                    Platform.OS === 'android'
                        ? PERMISSIONS.ANDROID
                            .ACCESS_FINE_LOCATION
                        : PERMISSIONS.IOS
                            .LOCATION_WHEN_IN_USE;


                let status =
                    await check(
                        permission,
                    );


                console.log(
                    '📍 Location permission:',
                    status,
                );


                // ====================================================
                // REQUEST PERMISSION
                // ====================================================

                if (
                    status !==
                    RESULTS.GRANTED
                ) {

                    status =
                        await request(
                            permission,
                        );
                }


                // ====================================================
                // GRANTED
                // ====================================================

                if (
                    status ===
                    RESULTS.GRANTED
                ) {

                    getCurrentLocation();

                }


                // ====================================================
                // DENIED
                // ====================================================

                else {

                    console.log(
                        '❌ Location permission denied:',
                        status,
                    );


                    Alert.alert(
                        'Permission Required',
                        'Please allow location access to find salons near you.',
                    );
                }

            } catch (error) {

                console.log(
                    '❌ Permission Error:',
                    error,
                );


                Alert.alert(
                    'Location Error',
                    'Unable to request location permission.',
                );
            }
        };


    // ==========================================================
    // SELECT LOCATION
    // ==========================================================

    const handleSelectLocation =
        async (
            location: LocationData,
        ) => {

            try {

                console.log('');
                console.log(
                    '========================================',
                );

                console.log(
                    '📍 LOCATION SELECTED',
                );

                console.log(
                    location,
                );

                console.log(
                    '========================================',
                );


                // ====================================================
                // SAVE AS ACTIVE LOCATION
                // ====================================================

                await saveLocation(
                    location,
                );


                // ====================================================
                // ADD TO RECENT
                // ====================================================

                await addRecentLocation(
                    location,
                );


                // ====================================================
                // REFRESH RECENT LOCATIONS
                // ====================================================

                const updatedRecent =
                    await getRecentLocations();


                setRecentLocations(
                    updatedRecent,
                );


                // ====================================================
                // NOTIFY HOME SCREEN
                // ====================================================

                onLocationSelected(
                    location,
                );


                // ====================================================
                // CLOSE
                // ====================================================

                onClose();

            } catch (error) {

                console.log(
                    '❌ Select Location Error:',
                    error,
                );


                Alert.alert(
                    'Location Error',
                    'Unable to select this location.',
                );
            }
        };


    // ==========================================================
    // SEARCH
    // ==========================================================

    const cleanSearch =
        search
            .trim()
            .toLowerCase();


    // ==========================================================
    // FILTER SAVED
    // ==========================================================

    const filteredSaved =
        cleanSearch
            ? savedLocations.filter(
                item =>
                    item.title
                        .toLowerCase()
                        .includes(
                            cleanSearch,
                        ) ||
                    item.address
                        .toLowerCase()
                        .includes(
                            cleanSearch,
                        ),
            )
            : savedLocations;


    // ==========================================================
    // FILTER RECENT
    // ==========================================================

    const filteredRecent =
        cleanSearch
            ? recentLocations.filter(
                item =>
                    item.address
                        .toLowerCase()
                        .includes(
                            cleanSearch,
                        ),
            )
            : recentLocations;


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <Modal
            isVisible={
                visible
            }

            onBackdropPress={
                onClose
            }

            onBackButtonPress={
                onClose
            }

            swipeDirection="down"

            onSwipeComplete={
                onClose
            }

            style={
                styles.modal
            }
        >

            <View
                style={
                    styles.sheet
                }
            >

                {/* ================================================== */}
                {/* HANDLE */}
                {/* ================================================== */}

                <View
                    style={
                        styles.handle
                    }
                />


                {/* ================================================== */}
                {/* TITLE */}
                {/* ================================================== */}

                <Text
                    style={
                        styles.title
                    }
                >
                    Choose your location
                </Text>


                {/* ================================================== */}
                {/* SEARCH */}
                {/* ================================================== */}

                <TextInput
                    placeholder="Search area, street or pincode"
                    placeholderTextColor="#999"

                    value={
                        search
                    }

                    onChangeText={
                        setSearch
                    }

                    style={
                        styles.search
                    }

                    autoCorrect={false}

                    returnKeyType="search"
                />


                {/* ================================================== */}
                {/* CURRENT LOCATION */}
                {/* ================================================== */}

                <TouchableOpacity
                    style={
                        styles.currentLocation
                    }

                    onPress={
                        requestLocationPermission
                    }

                    activeOpacity={0.8}
                >

                    <Text
                        style={
                            styles.currentTitle
                        }
                    >
                        📍 Use Current Location
                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        {USE_HARDCODED_LOCATION
                            ? 'Using configured test location'
                            : 'Find salons near your current location'}
                    </Text>

                </TouchableOpacity>


                {/* ================================================== */}
                {/* LOADING */}
                {/* ================================================== */}

                {loadingLocation && (

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Detecting your location...
                    </Text>

                )}


                {/* ================================================== */}
                {/* DETECTED LOCATION */}
                {/* ================================================== */}

                {detectedLocation && (

                    <View
                        style={
                            styles.detectedContainer
                        }
                    >

                        <Text
                            style={
                                styles.detectedTitle
                            }
                        >
                            📍 Detected Location
                        </Text>


                        <Text
                            style={
                                styles.detectedAddress
                            }
                        >
                            {
                                detectedLocation.address
                            }
                        </Text>


                        <Text
                            style={
                                styles.detectedCoordinates
                            }
                        >
                            {detectedLocation.latitude.toFixed(6)}
                            {', '}
                            {detectedLocation.longitude.toFixed(6)}
                        </Text>


                        <TouchableOpacity
                            style={
                                styles.useButton
                            }

                            onPress={() =>
                                handleSelectLocation(
                                    detectedLocation,
                                )
                            }

                            activeOpacity={0.8}
                        >

                            <Text
                                style={
                                    styles.useButtonText
                                }
                            >
                                Use this location
                            </Text>

                        </TouchableOpacity>

                    </View>

                )}


                {/* ================================================== */}
                {/* SCROLL CONTENT */}
                {/* ================================================== */}

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }

                    keyboardShouldPersistTaps="handled"
                >

                    {/* ================================================= */}
                    {/* SAVED LOCATIONS */}
                    {/* ================================================= */}

                    <Text
                        style={
                            styles.section
                        }
                    >
                        Saved Locations
                    </Text>


                    {filteredSaved.length > 0 ? (

                        filteredSaved.map(
                            item => (

                                <TouchableOpacity
                                    key={
                                        item.id
                                    }

                                    style={
                                        styles.row
                                    }

                                    onPress={() =>
                                        handleSelectLocation(
                                            item,
                                        )
                                    }

                                    activeOpacity={0.7}
                                >

                                    <View
                                        style={
                                            styles.iconCircle
                                        }
                                    >

                                        <Text>

                                            {item.title
                                                .toLowerCase()
                                                .includes(
                                                    'office',
                                                )
                                                ? '🏢'
                                                : '🏠'}

                                        </Text>

                                    </View>


                                    <View
                                        style={
                                            styles.rowContent
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.rowTitle
                                            }
                                        >
                                            {
                                                item.title
                                            }
                                        </Text>


                                        <Text
                                            style={
                                                styles.rowSub
                                            }

                                            numberOfLines={
                                                2
                                            }
                                        >
                                            {
                                                item.address
                                            }
                                        </Text>

                                    </View>

                                </TouchableOpacity>

                            ),
                        )

                    ) : (

                        <View
                            style={
                                styles.emptySection
                            }
                        >

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                No saved locations
                            </Text>

                        </View>

                    )}


                    {/* ================================================= */}
                    {/* RECENT SEARCHES */}
                    {/* ================================================= */}

                    <Text
                        style={
                            styles.section
                        }
                    >
                        Recent Searches
                    </Text>


                    {filteredRecent.length > 0 ? (

                        filteredRecent.map(
                            (
                                item,
                                index,
                            ) => (

                                <TouchableOpacity
                                    key={`${item.latitude}-${item.longitude}-${index}`}

                                    style={
                                        styles.row
                                    }

                                    onPress={() =>
                                        handleSelectLocation(
                                            item,
                                        )
                                    }

                                    activeOpacity={0.7}
                                >

                                    <View
                                        style={
                                            styles.iconCircle
                                        }
                                    >

                                        <Text>
                                            🕘
                                        </Text>

                                    </View>


                                    <View
                                        style={
                                            styles.rowContent
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.rowTitle
                                            }

                                            numberOfLines={
                                                2
                                            }
                                        >
                                            {
                                                item.address
                                            }
                                        </Text>


                                        <Text
                                            style={
                                                styles.coordinates
                                            }
                                        >
                                            {
                                                item.latitude
                                            }
                                            {', '}
                                            {
                                                item.longitude
                                            }
                                        </Text>

                                    </View>

                                </TouchableOpacity>

                            ),
                        )

                    ) : (

                        <View
                            style={
                                styles.emptySection
                            }
                        >

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                No recent searches
                            </Text>

                        </View>

                    )}


                    <View
                        style={
                            styles.bottomSpace
                        }
                    />

                </ScrollView>

            </View>

        </Modal>
    );
}


// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({

        // ========================================================
        // MODAL
        // ========================================================

        modal: {
            justifyContent:
                'flex-end',

            margin: 0,
        },


        // ========================================================
        // SHEET
        // ========================================================

        sheet: {
            backgroundColor:
                '#FFF',

            borderTopLeftRadius:
                28,

            borderTopRightRadius:
                28,

            paddingHorizontal:
                20,

            paddingTop:
                12,

            maxHeight:
                '90%',
        },


        // ========================================================
        // HANDLE
        // ========================================================

        handle: {
            width:
                50,

            height:
                5,

            backgroundColor:
                '#DDD',

            borderRadius:
                10,

            alignSelf:
                'center',

            marginBottom:
                20,
        },


        // ========================================================
        // TITLE
        // ========================================================

        title: {
            fontSize:
                24,

            fontWeight:
                '700',

            color:
                '#111',
        },


        // ========================================================
        // SEARCH
        // ========================================================

        search: {
            marginTop:
                20,

            backgroundColor:
                '#F4F4F4',

            borderRadius:
                12,

            paddingHorizontal:
                15,

            height:
                55,

            color:
                '#111',
        },


        // ========================================================
        // CURRENT LOCATION
        // ========================================================

        currentLocation: {
            marginTop:
                20,

            backgroundColor:
                '#F5FCF8',

            padding:
                18,

            borderRadius:
                14,
        },


        currentTitle: {
            color:
                PRIMARY,

            fontWeight:
                '700',

            fontSize:
                16,
        },


        subtitle: {
            color:
                '#666',

            marginTop:
                5,
        },


        // ========================================================
        // LOADING
        // ========================================================

        loadingText: {
            marginTop:
                15,

            textAlign:
                'center',

            color:
                '#666',
        },


        // ========================================================
        // DETECTED LOCATION
        // ========================================================

        detectedContainer: {
            marginTop:
                20,

            padding:
                15,

            borderRadius:
                12,

            backgroundColor:
                '#F5FCF8',

            borderWidth:
                1,

            borderColor:
                '#D8F3E5',
        },


        detectedTitle: {
            fontWeight:
                '700',

            fontSize:
                16,

            color:
                PRIMARY,
        },


        detectedAddress: {
            marginTop:
                8,

            color:
                '#444',

            lineHeight:
                22,
        },


        detectedCoordinates: {
            marginTop:
                5,

            color:
                '#888',

            fontSize:
                11,
        },


        useButton: {
            marginTop:
                15,

            backgroundColor:
                PRIMARY,

            paddingVertical:
                14,

            borderRadius:
                12,

            alignItems:
                'center',
        },


        useButtonText: {
            color:
                '#FFF',

            fontWeight:
                '700',

            fontSize:
                16,
        },


        // ========================================================
        // SECTION
        // ========================================================

        section: {
            marginTop:
                25,

            marginBottom:
                10,

            fontWeight:
                '700',

            fontSize:
                18,

            color:
                '#111',
        },


        // ========================================================
        // ROW
        // ========================================================

        row: {
            flexDirection:
                'row',

            alignItems:
                'center',

            paddingVertical:
                14,

            borderBottomWidth:
                1,

            borderColor:
                '#EEE',
        },


        // ========================================================
        // ICON
        // ========================================================

        iconCircle: {
            width:
                42,

            height:
                42,

            borderRadius:
                21,

            backgroundColor:
                '#F5F5F5',

            alignItems:
                'center',

            justifyContent:
                'center',

            marginRight:
                12,
        },


        // ========================================================
        // CONTENT
        // ========================================================

        rowContent: {
            flex:
                1,
        },


        rowTitle: {
            fontWeight:
                '600',

            fontSize:
                16,

            color:
                '#111',
        },


        rowSub: {
            color:
                '#777',

            marginTop:
                4,

            fontSize:
                13,
        },


        coordinates: {
            color:
                '#999',

            marginTop:
                4,

            fontSize:
                11,
        },


        // ========================================================
        // EMPTY
        // ========================================================

        emptySection: {
            paddingVertical:
                12,
        },


        emptyText: {
            color:
                '#999',

            fontSize:
                13,
        },


        // ========================================================
        // BOTTOM SPACE
        // ========================================================

        bottomSpace: {
            height:
                30,
        },

    });