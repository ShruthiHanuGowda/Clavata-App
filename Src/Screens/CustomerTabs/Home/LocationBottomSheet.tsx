import React, {
    useEffect,
    useState,
} from 'react';
import type {
    SavedLocation,
    LocationData,
} from '../../../services/locationTypes';
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

// import Geolocation from '@react-native-community/geolocation';
import Modal from './AppModal';

import {
    check,
    request,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';

import {
    reverseGeocode,
    searchAddress
} from '../../../services/locationService';

import {
    getCurrentLocation,
    getSavedLocations,
    getRecentLocations,
    saveLocation,
    addRecentLocation,
} from '../../../services/locationStorage';
import { USE_HARDCODED_LOCATION } from '../../../services/locationConfig';

// import {
//     USE_HARDCODED_LOCATION,
//     HARDCODED_LOCATION,
// } from '../../../services/locationConfig';


// ============================================================
// COLORS
// ============================================================

const PRIMARY = '#008060';
const PRIMARY_LIGHT = '#EAF8F5';

const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';

const BORDER = '#E5E7EB';
const BACKGROUND = '#F8FAFC';


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
        searchResults,
        setSearchResults,
    ] = useState<any[]>([]);

    const [
        searchingAddress,
        setSearchingAddress,
    ] = useState(false);

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

        if (!visible) {
            return;
        }

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

        setDetectedLocation(null);
        setSearch('');

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
            // SAVED
            // ======================================================

            const saved =
                await getSavedLocations();

            console.log(
                '📦 Saved locations:',
                saved,
            );


            // ======================================================
            // RECENT
            // ======================================================

            const recent =
                await getRecentLocations();

            console.log(
                '🕘 Recent locations:',
                recent,
            );


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
    // LOCATION PERMISSION
    // ==========================================================
    const detectCurrentLocation = async () => {
        try {
            console.log('');
            console.log(
                '========================================',
            );

            console.log(
                '📍 DETECTING CURRENT LOCATION',
            );

            console.log(
                '========================================',
            );

            setLoadingLocation(true);

            const location =
                await getCurrentLocation();

            if (!location) {
                Alert.alert(
                    'Location Error',
                    'Unable to determine your current location.',
                );

                return;
            }

            console.log(
                '📍 Current location:',
                location,
            );

            // ======================================================
            // REVERSE GEOCODE
            // ======================================================

            if (!USE_HARDCODED_LOCATION) {
                try {
                    const result =
                        await reverseGeocode(
                            location.latitude,
                            location.longitude,
                        );

                    location.address =
                        result?.display_name ||
                        'Current Location';
                } catch (error) {
                    console.log(
                        '⚠️ Reverse geocoding failed:',
                        error,
                    );

                    location.address =
                        'Current Location';
                }
            }

            console.log(
                '📍 Final detected location:',
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

            setLoadingLocation(false);
        }
    };

    const requestLocationPermission =
        async () => {

            console.log(
                '📍 Location request:',
                USE_HARDCODED_LOCATION,
            );

            // ======================================================
            // HARDCODED TEST MODE
            // ======================================================

            if (USE_HARDCODED_LOCATION) {

                console.log(
                    '🧪 TEST MODE: GPS permission not required',
                );

                await detectCurrentLocation();

                return;
            }

            // ======================================================
            // PRODUCTION
            // ======================================================

            try {

                const permission =
                    Platform.OS === 'android'
                        ? PERMISSIONS.ANDROID
                            .ACCESS_FINE_LOCATION
                        : PERMISSIONS.IOS
                            .LOCATION_WHEN_IN_USE;

                console.log(
                    '📍 Checking permission:',
                    permission,
                );

                let status =
                    await check(permission);

                console.log(
                    '📍 Current permission:',
                    status,
                );

                if (
                    status !== RESULTS.GRANTED
                ) {
                    status =
                        await request(permission);

                    console.log(
                        '📍 Permission after request:',
                        status,
                    );
                }

                if (
                    status === RESULTS.GRANTED
                ) {

                    await detectCurrentLocation();

                } else {

                    console.log(
                        '❌ Location permission denied:',
                        status,
                    );

                    Alert.alert(
                        'Location Permission',
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
                // SAVE ACTIVE LOCATION
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
                // REFRESH RECENT
                // ====================================================

                const updatedRecent =
                    await getRecentLocations();


                setRecentLocations(
                    updatedRecent,
                );


                // ====================================================
                // NOTIFY HOME
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

    const handleAddressSearch = async () => {
        const query = search.trim();

        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchingAddress(true);

            console.log(
                '🔎 Searching address:',
                query,
            );

            const results =
                await searchAddress(query);

            console.log(
                '🔎 Search results:',
                results,
            );

            setSearchResults(results);

        } catch (error) {

            console.log(
                '❌ ADDRESS SEARCH ERROR:',
                error,
            );

            setSearchResults([]);

        } finally {
            setSearchingAddress(false);
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
            isVisible={visible}

            onBackdropPress={onClose}

            onBackButtonPress={onClose}

            swipeDirection="down"

            onSwipeComplete={onClose}

            style={styles.modal}

            animationIn="slideInUp"

            animationOut="slideOutDown"

            animationInTiming={300}

            animationOutTiming={250}

            backdropOpacity={0.35}

            useNativeDriver={false}
        >

            <View style={styles.sheet}>

                {/* ================================================== */}
                {/* HANDLE */}
                {/* ================================================== */}

                <View style={styles.handle} />


                {/* ================================================== */}
                {/* HEADER */}
                {/* ================================================== */}

                <View style={styles.header}>

                    <View>

                        <Text style={styles.title}>
                            Choose your location
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            Find salons and services near you
                        </Text>

                    </View>


                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >

                        <Text style={styles.closeText}>
                            ×
                        </Text>

                    </TouchableOpacity>

                </View>


                {/* ================================================== */}
                {/* SEARCH */}
                {/* ================================================== */}

                {/* <View style={styles.searchContainer}>

                    <Text style={styles.searchIcon}>
                        ⌕
                    </Text>

                    <TextInput
                        placeholder="Search area, street or pincode"
                        placeholderTextColor="#9CA3AF"

                        value={search}

                        onChangeText={(text) => {
                            setSearch(text);

                            if (!text.trim()) {
                                setSearchResults([]);
                            }
                        }}

                        onSubmitEditing={handleAddressSearch}

                        style={styles.search}

                        autoCorrect={false}

                        autoCapitalize="none"

                        returnKeyType="search"

                        clearButtonMode="while-editing"
                    />

                </View> */}
                <View style={styles.searchContainer}>

                    <Text style={styles.searchIcon}>
                        ⌕
                    </Text>

                    <TextInput
                        placeholder="Search area, street or pincode"
                        placeholderTextColor="#9CA3AF"

                        value={search}

                        onChangeText={(text) => {
                            setSearch(text);

                            if (!text.trim()) {
                                setSearchResults([]);
                            }
                        }}

                        onSubmitEditing={handleAddressSearch}

                        style={styles.search}

                        autoCorrect={false}

                        autoCapitalize="none"

                        returnKeyType="search"

                        clearButtonMode="while-editing"
                    />

                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleAddressSearch}
                        disabled={
                            searchingAddress ||
                            !search.trim()
                        }
                        activeOpacity={0.8}
                    >
                        <Text style={styles.searchButtonText}>
                            {searchingAddress
                                ? '...'
                                : 'Search'}
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* ================================================== */}
                {/* CURRENT LOCATION */}
                {/* ================================================== */}

                <TouchableOpacity
                    style={styles.currentLocation}
                    onPress={requestLocationPermission}
                    activeOpacity={0.85}
                    disabled={loadingLocation}
                >

                    <View style={styles.currentIcon}>

                        <Text style={styles.currentIconText}>
                            ⌖
                        </Text>

                    </View>


                    <View style={styles.currentContent}>

                        <Text style={styles.currentTitle}>
                            Use current location
                        </Text>

                        <Text
                            style={styles.subtitle}
                            numberOfLines={1}
                        >
                            {USE_HARDCODED_LOCATION
                                ? 'Using configured test location'
                                : 'Find salons near your current location'}
                        </Text>

                    </View>


                    <View style={styles.currentArrow}>

                        <Text style={styles.arrowText}>
                            ›
                        </Text>

                    </View>

                </TouchableOpacity>


                {/* ================================================== */}
                {/* LOADING */}
                {/* ================================================== */}

                {loadingLocation && (

                    <View style={styles.loadingContainer}>

                        <View style={styles.loadingDot} />

                        <Text style={styles.loadingText}>
                            Detecting your location...
                        </Text>

                    </View>

                )}


                {/* ================================================== */}
                {/* DETECTED LOCATION */}
                {/* ================================================== */}

                {detectedLocation && (

                    <View style={styles.detectedContainer}>

                        <View style={styles.detectedHeader}>

                            <View style={styles.detectedIcon}>

                                <Text style={styles.detectedIconText}>
                                    ✓
                                </Text>

                            </View>

                            <View style={styles.detectedHeaderText}>

                                <Text style={styles.detectedTitle}>
                                    Location detected
                                </Text>

                                <Text style={styles.detectedSmall}>
                                    Your current location
                                </Text>

                            </View>

                        </View>


                        <Text
                            style={styles.detectedAddress}
                            numberOfLines={3}
                        >
                            {detectedLocation.address}
                        </Text>


                        <TouchableOpacity
                            style={styles.useButton}
                            onPress={() =>
                                handleSelectLocation(
                                    detectedLocation,
                                )
                            }
                            activeOpacity={0.85}
                        >

                            <Text style={styles.useButtonText}>
                                Use this location
                            </Text>

                        </TouchableOpacity>

                    </View>

                )}


                {/* ================================================== */}
                {/* CONTENT */}
                {/* ================================================== */}

                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.scrollContent
                    }
                >
                    {searchResults.length > 0 && (

                        <View>

                            <View style={styles.sectionHeader}>

                                <Text style={styles.section}>
                                    Search results
                                </Text>

                                <Text style={styles.sectionCount}>
                                    {searchResults.length}
                                </Text>

                            </View>

                            {searchResults.map(
                                (
                                    item,
                                    index,
                                ) => {

                                    const latitude =
                                        Number(item.lat);

                                    const longitude =
                                        Number(item.lon);

                                    const location: LocationData = {
                                        latitude,
                                        longitude,
                                        address:
                                            item.display_name ||
                                            'Selected location',
                                    };

                                    return (
                                        <TouchableOpacity
                                            key={`${item.place_id}-${index}`}
                                            style={styles.row}
                                            onPress={() =>
                                                handleSelectLocation(
                                                    location,
                                                )
                                            }
                                            activeOpacity={0.75}
                                        >

                                            <View style={styles.iconCircle}>

                                                <Text style={styles.historyIcon}>
                                                    ⌖
                                                </Text>

                                            </View>

                                            <View style={styles.rowContent}>

                                                <Text
                                                    style={styles.rowTitle}
                                                    numberOfLines={3}
                                                >
                                                    {item.display_name}
                                                </Text>

                                                <Text style={styles.coordinates}>
                                                    {latitude.toFixed(5)}
                                                    {', '}
                                                    {longitude.toFixed(5)}
                                                </Text>

                                            </View>

                                            <Text style={styles.rowArrow}>
                                                ›
                                            </Text>

                                        </TouchableOpacity>
                                    );
                                },
                            )}

                        </View>

                    )}
                    {/* ================================================= */}
                    {/* RECENT */}
                    {/* ================================================= */}

                    {filteredRecent.length > 0 && (

                        <View>

                            <View style={styles.sectionHeader}>

                                <Text style={styles.section}>
                                    Recent searches
                                </Text>

                                <Text style={styles.sectionCount}>
                                    {filteredRecent.length}
                                </Text>

                            </View>


                            {filteredRecent.map(
                                (
                                    item,
                                    index,
                                ) => (

                                    <TouchableOpacity
                                        key={`${item.latitude}-${item.longitude}-${index}`}
                                        style={styles.row}
                                        onPress={() =>
                                            handleSelectLocation(
                                                item,
                                            )
                                        }
                                        activeOpacity={0.75}
                                    >

                                        <View style={styles.iconCircle}>

                                            <Text style={styles.historyIcon}>
                                                ◷
                                            </Text>

                                        </View>


                                        <View style={styles.rowContent}>

                                            <Text
                                                style={styles.rowTitle}
                                                numberOfLines={2}
                                            >
                                                {item.address}
                                            </Text>


                                            <Text style={styles.coordinates}>
                                                {item.latitude.toFixed(5)}
                                                {', '}
                                                {item.longitude.toFixed(5)}
                                            </Text>

                                        </View>


                                        <Text style={styles.rowArrow}>
                                            ›
                                        </Text>

                                    </TouchableOpacity>

                                ),
                            )}

                        </View>

                    )}


                    {/* ================================================= */}
                    {/* NO SEARCH RESULTS */}
                    {/* ================================================= */}

                    {cleanSearch &&
                        !searchingAddress &&
                        searchResults.length === 0 &&
                        filteredRecent.length === 0 &&
                        filteredSaved.length === 0 && (

                            <View style={styles.noResults}>

                                <View style={styles.noResultsIcon}>

                                    <Text style={styles.noResultsIconText}>
                                        ⌕
                                    </Text>

                                </View>

                                <Text style={styles.noResultsTitle}>
                                    No locations found
                                </Text>

                                <Text style={styles.noResultsText}>
                                    Try searching for another area,
                                    street or pincode.
                                </Text>

                            </View>
                        )}


                    {/* ================================================= */}
                    {/* EMPTY RECENT */}
                    {/* ================================================= */}

                    {!cleanSearch &&
                        filteredRecent.length === 0 && (

                            <View style={styles.emptySection}>

                                <View style={styles.emptyIcon}>

                                    <Text style={styles.emptyIconText}>
                                        ◷
                                    </Text>

                                </View>

                                <View>

                                    <Text style={styles.emptyTitle}>
                                        No recent searches
                                    </Text>

                                    <Text style={styles.emptyText}>
                                        Your recently selected locations
                                        will appear here.
                                    </Text>

                                </View>

                            </View>

                        )}


                    <View style={styles.bottomSpace} />

                </ScrollView>

            </View>

        </Modal>
    );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    // ==========================================================
    // MODAL
    // ==========================================================

    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },


    // ==========================================================
    // SHEET
    // ==========================================================

    sheet: {
        backgroundColor: '#FFFFFF',

        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,

        paddingHorizontal: 18,
        paddingTop: 10,

        maxHeight: '88%',

        overflow: 'hidden',

        elevation: 20,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },


    // ==========================================================
    // HANDLE
    // ==========================================================

    handle: {
        width: 42,
        height: 4,

        backgroundColor: '#D1D5DB',

        borderRadius: 10,

        alignSelf: 'center',

        marginBottom: 16,
    },


    // ==========================================================
    // HEADER
    // ==========================================================

    header: {
        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'space-between',

        marginBottom: 16,
    },


    title: {
        fontSize: 21,

        fontWeight: '800',

        color: TEXT_PRIMARY,

        letterSpacing: -0.3,
    },


    headerSubtitle: {
        marginTop: 4,

        fontSize: 12,

        color: TEXT_SECONDARY,
    },


    closeButton: {
        width: 34,
        height: 34,

        borderRadius: 17,

        backgroundColor: '#F3F4F6',

        alignItems: 'center',
        justifyContent: 'center',
    },


    closeText: {
        fontSize: 25,

        lineHeight: 27,

        color: '#4B5563',

        fontWeight: '400',
    },


    // ==========================================================
    // SEARCH
    // ==========================================================

    searchContainer: {
        height: 48,

        flexDirection: 'row',

        alignItems: 'center',

        backgroundColor: '#F5F7F8',

        borderRadius: 13,

        borderWidth: 1,

        borderColor: '#EEF0F1',

        paddingHorizontal: 13,

        marginBottom: 12,
    },


    searchIcon: {
        fontSize: 25,

        color: '#6B7280',

        marginRight: 7,

        marginTop: -3,
    },


    search: {
        flex: 1,

        height: 48,

        paddingHorizontal: 0,

        paddingVertical: 0,

        fontSize: 14,

        color: TEXT_PRIMARY,
    },


    // ==========================================================
    // CURRENT LOCATION
    // ==========================================================

    currentLocation: {
        minHeight: 66,

        flexDirection: 'row',

        alignItems: 'center',

        backgroundColor: PRIMARY_LIGHT,

        borderRadius: 15,

        paddingHorizontal: 12,

        paddingVertical: 10,

        borderWidth: 1,

        borderColor: '#D8F0EA',
    },


    currentIcon: {
        width: 40,
        height: 40,

        borderRadius: 20,

        backgroundColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 11,
    },


    currentIconText: {
        fontSize: 22,

        color: PRIMARY,

        fontWeight: '700',
    },


    currentContent: {
        flex: 1,

        minWidth: 0,
    },


    currentTitle: {
        fontSize: 14,

        fontWeight: '800',

        color: PRIMARY,

        textTransform: 'none',
    },


    subtitle: {
        marginTop: 3,

        fontSize: 11.5,

        color: TEXT_SECONDARY,
    },


    currentArrow: {
        width: 28,
        height: 28,

        borderRadius: 14,

        alignItems: 'center',
        justifyContent: 'center',
    },


    arrowText: {
        fontSize: 25,

        color: PRIMARY,

        fontWeight: '300',

        marginTop: -2,
    },


    // ==========================================================
    // LOADING
    // ==========================================================

    loadingContainer: {
        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'center',

        paddingVertical: 10,
    },


    loadingDot: {
        width: 7,
        height: 7,

        borderRadius: 4,

        backgroundColor: PRIMARY,

        marginRight: 7,
    },


    loadingText: {
        fontSize: 12,

        color: TEXT_SECONDARY,

        fontWeight: '600',
    },


    // ==========================================================
    // DETECTED LOCATION
    // ==========================================================

    detectedContainer: {
        marginTop: 12,

        padding: 13,

        backgroundColor: '#F7FCFA',

        borderRadius: 15,

        borderWidth: 1,

        borderColor: '#DCEFE8',
    },


    detectedHeader: {
        flexDirection: 'row',

        alignItems: 'center',
    },

    searchButton: {
        height: 36,

        paddingHorizontal: 12,

        borderRadius: 9,

        backgroundColor: PRIMARY,

        alignItems: 'center',

        justifyContent: 'center',
    },

    searchButtonText: {
        color: '#FFFFFF',

        fontSize: 12,

        fontWeight: '800',
    },
    detectedIcon: {
        width: 32,
        height: 32,

        borderRadius: 16,

        backgroundColor: PRIMARY,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 9,
    },


    detectedIconText: {
        color: '#FFFFFF',

        fontSize: 17,

        fontWeight: '800',
    },


    detectedHeaderText: {
        flex: 1,
    },


    detectedTitle: {
        fontSize: 14,

        fontWeight: '800',

        color: TEXT_PRIMARY,
    },


    detectedSmall: {
        marginTop: 1,

        fontSize: 11,

        color: TEXT_SECONDARY,
    },


    detectedAddress: {
        marginTop: 10,

        fontSize: 13,

        lineHeight: 19,

        color: '#374151',
    },


    useButton: {
        marginTop: 11,

        height: 40,

        borderRadius: 11,

        backgroundColor: PRIMARY,

        alignItems: 'center',
        justifyContent: 'center',
    },


    useButtonText: {
        color: '#FFFFFF',

        fontSize: 13,

        fontWeight: '800',
    },


    // ==========================================================
    // SCROLL
    // ==========================================================

    scroll: {
        marginTop: 5,
    },


    scrollContent: {
        paddingTop: 5,

        paddingBottom: 10,
    },


    // ==========================================================
    // SECTION
    // ==========================================================

    sectionHeader: {
        flexDirection: 'row',

        alignItems: 'center',

        marginTop: 14,

        marginBottom: 7,
    },


    section: {
        fontSize: 14,

        fontWeight: '800',

        color: TEXT_PRIMARY,
    },


    sectionCount: {
        marginLeft: 7,

        minWidth: 20,

        height: 20,

        paddingHorizontal: 5,

        borderRadius: 10,

        backgroundColor: '#F0F2F3',

        textAlign: 'center',

        lineHeight: 20,

        fontSize: 10,

        color: TEXT_SECONDARY,

        fontWeight: '700',
    },


    // ==========================================================
    // LOCATION ROW
    // ==========================================================

    row: {
        flexDirection: 'row',

        alignItems: 'center',

        minHeight: 67,

        paddingVertical: 9,

        borderBottomWidth: 1,

        borderBottomColor: '#F0F1F2',
    },


    iconCircle: {
        width: 40,
        height: 40,

        borderRadius: 20,

        backgroundColor: '#F3F6F5',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 11,
    },


    historyIcon: {
        fontSize: 19,

        color: PRIMARY,

        fontWeight: '600',
    },


    rowContent: {
        flex: 1,

        minWidth: 0,

        paddingRight: 8,
    },


    rowTitle: {
        fontSize: 13,

        lineHeight: 18,

        fontWeight: '700',

        color: TEXT_PRIMARY,
    },


    coordinates: {
        marginTop: 3,

        fontSize: 10,

        color: TEXT_MUTED,
    },


    rowArrow: {
        fontSize: 23,

        color: '#B4B8BC',

        fontWeight: '300',

        paddingLeft: 5,
    },


    // ==========================================================
    // EMPTY
    // ==========================================================

    emptySection: {
        flexDirection: 'row',

        alignItems: 'center',

        paddingVertical: 20,

        paddingHorizontal: 4,
    },


    emptyIcon: {
        width: 42,
        height: 42,

        borderRadius: 21,

        backgroundColor: '#F5F6F7',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 11,
    },


    emptyIconText: {
        fontSize: 20,

        color: '#9CA3AF',
    },


    emptyTitle: {
        fontSize: 13,

        fontWeight: '700',

        color: TEXT_SECONDARY,
    },


    emptyText: {
        marginTop: 3,

        fontSize: 11,

        color: TEXT_MUTED,

        maxWidth: 270,

        lineHeight: 16,
    },


    // ==========================================================
    // NO RESULTS
    // ==========================================================

    noResults: {
        alignItems: 'center',

        paddingTop: 30,

        paddingHorizontal: 25,
    },


    noResultsIcon: {
        width: 48,
        height: 48,

        borderRadius: 24,

        backgroundColor: '#F4F6F6',

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: 10,
    },


    noResultsIconText: {
        fontSize: 24,

        color: '#9CA3AF',
    },


    noResultsTitle: {
        fontSize: 14,

        fontWeight: '800',

        color: TEXT_PRIMARY,
    },


    noResultsText: {
        marginTop: 4,

        fontSize: 11.5,

        color: TEXT_MUTED,

        textAlign: 'center',

        lineHeight: 17,
    },


    // ==========================================================
    // BOTTOM SPACE
    // ==========================================================

    bottomSpace: {
        height: 25,
    },

});