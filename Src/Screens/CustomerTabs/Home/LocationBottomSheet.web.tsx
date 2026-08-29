import React, { useEffect, useState } from 'react';

import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

import {
    reverseGeocode,
    searchAddress,
} from '../../../services/locationService';

import {
    getCurrentLocation,
    getSavedLocations,
    getRecentLocations,
    saveLocation,
    addRecentLocation,
    SavedLocation,
    LocationData,
} from '../../../services/locationStorage';

import {
    USE_HARDCODED_LOCATION,
} from '../../../services/locationConfig';


// ============================================================
// COLORS
// ============================================================

const PRIMARY = '#008060';
const PRIMARY_DARK = '#006B50';
const PRIMARY_LIGHT = '#EAF8F5';

const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#667085';
const TEXT_MUTED = '#98A2B3';

const BORDER = '#E4E7EC';
const BACKGROUND = '#F8FAFC';
const WHITE = '#FFFFFF';


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
    // LOAD WHEN OPENED
    // ==========================================================

    useEffect(() => {

        if (!visible) {
            return;
        }

        loadLocations();

        setDetectedLocation(null);
        setSearch('');
        setSearchResults([]);

    }, [visible]);


    // ==========================================================
    // LOAD SAVED + RECENT
    // ==========================================================

    const loadLocations = async () => {

        try {

            const saved =
                await getSavedLocations();

            const recent =
                await getRecentLocations();

            setSavedLocations(
                saved,
            );

            setRecentLocations(
                recent,
            );

        } catch (error) {

            console.log(
                '❌ LOAD LOCATIONS ERROR:',
                error,
            );

        }
    };


    // ==========================================================
    // DETECT CURRENT LOCATION
    // ==========================================================

    const detectCurrentLocation = async () => {

        try {

            setLoadingLocation(true);

            const location =
                await getCurrentLocation();

            if (!location) {

                console.log(
                    '❌ Unable to determine location',
                );

                return;
            }


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


            setDetectedLocation(
                location,
            );

        } catch (error) {

            console.log(
                '❌ Location detection error:',
                error,
            );

        } finally {

            setLoadingLocation(false);
        }
    };


    // ==========================================================
    // REQUEST LOCATION
    // ==========================================================

    const requestLocationPermission =
        async () => {

            /*
             * IMPORTANT:
             *
             * Your existing getCurrentLocation()
             * already handles the actual location logic.
             *
             * For web we simply call it.
             */

            await detectCurrentLocation();
        };


    // ==========================================================
    // SELECT LOCATION
    // ==========================================================

    const handleSelectLocation =
        async (
            location: LocationData,
        ) => {

            try {

                await saveLocation(
                    location,
                );

                await addRecentLocation(
                    location,
                );


                const updatedRecent =
                    await getRecentLocations();

                setRecentLocations(
                    updatedRecent,
                );


                onLocationSelected(
                    location,
                );


                onClose();

            } catch (error) {

                console.log(
                    '❌ SELECT LOCATION ERROR:',
                    error,
                );

            }
        };


    // ==========================================================
    // SEARCH ADDRESS
    // ==========================================================

    const handleAddressSearch = async () => {

        const query =
            search.trim();

        if (!query) {

            setSearchResults([]);

            return;
        }


        try {

            setSearchingAddress(true);


            const results =
                await searchAddress(
                    query,
                );


            setSearchResults(
                results || [],
            );

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
    // ENTER KEY
    // ==========================================================

    const handleSearchKeyPress = (
        event: any,
    ) => {

        if (
            event?.nativeEvent?.key === 'Enter'
        ) {

            handleAddressSearch();
        }
    };


    // ==========================================================
    // SEARCH FILTER
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
                        ?.toLowerCase()
                        .includes(
                            cleanSearch,
                        ) ||
                    item.address
                        ?.toLowerCase()
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
                        ?.toLowerCase()
                        .includes(
                            cleanSearch,
                        ),
            )
            : recentLocations;


    // ==========================================================
    // HIDDEN
    // ==========================================================

    if (!visible) {
        return null;
    }


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <View
            style={styles.overlay}
        >

            {/* ==================================================
                BACKDROP
            ================================================== */}

            <Pressable
                style={styles.backdrop}
                onPress={onClose}
            />


            {/* ==================================================
                MODAL
            ================================================== */}

            <View
                style={styles.modalCard}
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <View
                    style={styles.header}
                >

                    <View
                        style={styles.headerLeft}
                    >

                        <View
                            style={styles.headerIcon}
                        >

                            <Text
                                style={styles.headerIconText}
                            >
                                ⌖
                            </Text>

                        </View>


                        <View>

                            <Text
                                style={styles.title}
                            >
                                Choose your location
                            </Text>

                            <Text
                                style={styles.headerSubtitle}
                            >
                                Find salons and services near you
                            </Text>

                        </View>

                    </View>


                    <Pressable
                        onPress={onClose}
                        style={({ hovered }: any) => [
                            styles.closeButton,

                            hovered &&
                            styles.closeButtonHover,
                        ]}
                    >

                        <Text
                            style={styles.closeText}
                        >
                            ×
                        </Text>

                    </Pressable>

                </View>


                {/* ==================================================
                    SEARCH
                ================================================== */}

                <View
                    style={styles.searchContainer}
                >

                    <Text
                        style={styles.searchIcon}
                    >
                        ⌕
                    </Text>


                    <TextInput
                        value={search}

                        onChangeText={(text) => {

                            setSearch(text);

                            if (!text.trim()) {
                                setSearchResults([]);
                            }

                        }}

                        onKeyPress={
                            handleSearchKeyPress
                        }

                        placeholder="Search area, street or pincode"

                        placeholderTextColor={
                            TEXT_MUTED
                        }

                        style={styles.searchInput}

                        autoCorrect={false}

                        autoCapitalize="none"
                    />


                    {search.length > 0 && (

                        <Pressable
                            onPress={() => {

                                setSearch('');

                                setSearchResults([]);

                            }}

                            style={styles.clearButton}
                        >

                            <Text
                                style={styles.clearText}
                            >
                                ×
                            </Text>

                        </Pressable>

                    )}


                    <Pressable
                        onPress={
                            handleAddressSearch
                        }

                        disabled={
                            searchingAddress ||
                            !search.trim()
                        }

                        style={({ hovered }: any) => [

                            styles.searchButton,

                            (!search.trim() ||
                                searchingAddress) &&
                            styles.searchButtonDisabled,

                            hovered &&
                            search.trim() &&
                            !searchingAddress &&
                            styles.searchButtonHover,

                        ]}
                    >

                        {searchingAddress ? (

                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />

                        ) : (

                            <Text
                                style={styles.searchButtonText}
                            >
                                Search
                            </Text>

                        )}

                    </Pressable>

                </View>


                {/* ==================================================
                    CURRENT LOCATION
                ================================================== */}

                <Pressable
                    onPress={
                        requestLocationPermission
                    }

                    disabled={
                        loadingLocation
                    }

                    style={({ hovered }: any) => [

                        styles.currentLocation,

                        hovered &&
                        !loadingLocation &&
                        styles.currentLocationHover,

                    ]}
                >

                    <View
                        style={styles.currentIcon}
                    >

                        <Text
                            style={styles.currentIconText}
                        >
                            ⌖
                        </Text>

                    </View>


                    <View
                        style={styles.currentContent}
                    >

                        <Text
                            style={styles.currentTitle}
                        >
                            Use current location
                        </Text>

                        <Text
                            style={styles.currentSubtitle}
                        >

                            {USE_HARDCODED_LOCATION

                                ? 'Using configured test location'

                                : 'Find salons near your current location'

                            }

                        </Text>

                    </View>


                    {loadingLocation ? (

                        <ActivityIndicator
                            size="small"
                            color={PRIMARY}
                        />

                    ) : (

                        <Text
                            style={styles.currentArrow}
                        >
                            →
                        </Text>

                    )}

                </Pressable>


                {/* ==================================================
                    DETECTED LOCATION
                ================================================== */}

                {detectedLocation && (

                    <View
                        style={styles.detectedCard}
                    >

                        <View
                            style={styles.detectedTop}
                        >

                            <View
                                style={styles.successIcon}
                            >

                                <Text
                                    style={styles.successIconText}
                                >
                                    ✓
                                </Text>

                            </View>


                            <View
                                style={styles.detectedTitleContainer}
                            >

                                <Text
                                    style={styles.detectedTitle}
                                >
                                    Location detected
                                </Text>

                                <Text
                                    style={styles.detectedSubtitle}
                                >
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


                        <Pressable
                            onPress={() =>
                                handleSelectLocation(
                                    detectedLocation,
                                )
                            }

                            style={({ hovered }: any) => [

                                styles.useLocationButton,

                                hovered &&
                                styles.useLocationButtonHover,

                            ]}
                        >

                            <Text
                                style={
                                    styles.useLocationButtonText
                                }
                            >
                                Use this location
                            </Text>

                        </Pressable>

                    </View>

                )}


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.scrollContent
                    }
                >

                    {/* ==================================================
                        SEARCH RESULTS
                    ================================================== */}

                    {searchResults.length > 0 && (

                        <View>

                            <SectionHeader
                                title="Search results"
                                count={
                                    searchResults.length
                                }
                            />


                            {searchResults.map(
                                (
                                    item,
                                    index,
                                ) => {

                                    const latitude =
                                        Number(
                                            item.lat,
                                        );

                                    const longitude =
                                        Number(
                                            item.lon,
                                        );


                                    const location:
                                        LocationData = {

                                        latitude,

                                        longitude,

                                        address:
                                            item.display_name ||
                                            'Selected location',
                                    };


                                    return (

                                        <LocationRow
                                            key={
                                                `${item.place_id}-${index}`
                                            }

                                            icon="⌖"

                                            title={
                                                item.display_name ||
                                                'Selected location'
                                            }

                                            latitude={
                                                latitude
                                            }

                                            longitude={
                                                longitude
                                            }

                                            onPress={() =>
                                                handleSelectLocation(
                                                    location,
                                                )
                                            }
                                        />

                                    );

                                },
                            )}

                        </View>

                    )}


                    {/* ==================================================
                        SAVED
                    ================================================== */}

                    {!cleanSearch &&
                        filteredSaved.length > 0 && (

                            <View>

                                <SectionHeader
                                    title="Saved locations"
                                    count={
                                        filteredSaved.length
                                    }
                                />


                                {filteredSaved.map(
                                    (
                                        item,
                                        index,
                                    ) => (

                                        <Pressable
                                            key={
                                                `${item.title}-${index}`
                                            }

                                            onPress={() =>
                                                handleSelectLocation(
                                                    item,
                                                )
                                            }

                                            style={({ hovered }: any) => [

                                                styles.locationRow,

                                                hovered &&
                                                styles.locationRowHover,

                                            ]}
                                        >

                                            <View
                                                style={
                                                    styles.locationIcon
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.locationIconText
                                                    }
                                                >
                                                    ★
                                                </Text>

                                            </View>


                                            <View
                                                style={
                                                    styles.locationContent
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.locationTitle
                                                    }
                                                    numberOfLines={1}
                                                >
                                                    {item.title}
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.locationAddress
                                                    }
                                                    numberOfLines={2}
                                                >
                                                    {item.address}
                                                </Text>

                                            </View>


                                            <Text
                                                style={
                                                    styles.rowArrow
                                                }
                                            >
                                                →
                                            </Text>

                                        </Pressable>

                                    ),
                                )}

                            </View>

                        )}


                    {/* ==================================================
                        RECENT
                    ================================================== */}

                    {filteredRecent.length > 0 && (

                        <View>

                            <SectionHeader
                                title="Recent searches"
                                count={
                                    filteredRecent.length
                                }
                            />


                            {filteredRecent.map(
                                (
                                    item,
                                    index,
                                ) => (

                                    <LocationRow
                                        key={
                                            `${item.latitude}-${item.longitude}-${index}`
                                        }

                                        icon="◷"

                                        title={
                                            item.address
                                        }

                                        latitude={
                                            item.latitude
                                        }

                                        longitude={
                                            item.longitude
                                        }

                                        onPress={() =>
                                            handleSelectLocation(
                                                item,
                                            )
                                        }
                                    />

                                ),
                            )}

                        </View>

                    )}


                    {/* ==================================================
                        NO RESULTS
                    ================================================== */}

                    {cleanSearch &&
                        !searchingAddress &&
                        searchResults.length === 0 &&
                        filteredRecent.length === 0 &&
                        filteredSaved.length === 0 && (

                            <View
                                style={
                                    styles.noResults
                                }
                            >

                                <View
                                    style={
                                        styles.noResultsIcon
                                    }
                                >

                                    <Text
                                        style={
                                            styles.noResultsIconText
                                        }
                                    >
                                        ⌕
                                    </Text>

                                </View>


                                <Text
                                    style={
                                        styles.noResultsTitle
                                    }
                                >
                                    No locations found
                                </Text>


                                <Text
                                    style={
                                        styles.noResultsText
                                    }
                                >
                                    Try another area, street or
                                    pincode.
                                </Text>

                            </View>

                        )}


                    {/* ==================================================
                        EMPTY
                    ================================================== */}

                    {!cleanSearch &&
                        filteredRecent.length === 0 &&
                        filteredSaved.length === 0 &&
                        searchResults.length === 0 && (

                            <View
                                style={
                                    styles.emptyState
                                }
                            >

                                <View
                                    style={
                                        styles.emptyIcon
                                    }
                                >

                                    <Text
                                        style={
                                            styles.emptyIconText
                                        }
                                    >
                                        ◷
                                    </Text>

                                </View>


                                <View>

                                    <Text
                                        style={
                                            styles.emptyTitle
                                        }
                                    >
                                        No recent locations
                                    </Text>

                                    <Text
                                        style={
                                            styles.emptyText
                                        }
                                    >
                                        Locations you select will
                                        appear here.
                                    </Text>

                                </View>

                            </View>

                        )}


                    <View
                        style={
                            styles.bottomSpace
                        }
                    />

                </ScrollView>

            </View>

        </View>
    );
}


// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
    title,
    count,
}: {
    title: string;
    count: number;
}) {

    return (

        <View
            style={styles.sectionHeader}
        >

            <Text
                style={styles.sectionTitle}
            >
                {title}
            </Text>


            <View
                style={styles.countBadge}
            >

                <Text
                    style={styles.countText}
                >
                    {count}
                </Text>

            </View>

        </View>
    );
}


// ============================================================
// LOCATION ROW
// ============================================================

function LocationRow({
    icon,
    title,
    latitude,
    longitude,
    onPress,
}: {
    icon: string;
    title: string;
    latitude: number;
    longitude: number;
    onPress: () => void;
}) {

    return (

        <Pressable
            onPress={onPress}

            style={({ hovered }: any) => [

                styles.locationRow,

                hovered &&
                styles.locationRowHover,

            ]}
        >

            <View
                style={styles.locationIcon}
            >

                <Text
                    style={styles.locationIconText}
                >
                    {icon}
                </Text>

            </View>


            <View
                style={styles.locationContent}
            >

                <Text
                    style={styles.locationTitle}
                    numberOfLines={2}
                >
                    {title}
                </Text>


                <Text
                    style={styles.locationCoordinates}
                >
                    {Number(latitude).toFixed(5)}
                    {' · '}
                    {Number(longitude).toFixed(5)}
                </Text>

            </View>


            <Text
                style={styles.rowArrow}
            >
                →
            </Text>

        </Pressable>
    );
}


// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({

        // ======================================================
        // OVERLAY
        // ======================================================

        overlay: {
            position: 'fixed' as any,

            top: 0,
            left: 0,
            right: 0,
            bottom: 0,

            zIndex: 9999,

            alignItems: 'center',
            justifyContent: 'center',
        },


        // ======================================================
        // BACKDROP
        // ======================================================

        backdrop: {
            position: 'absolute',

            top: 0,
            left: 0,
            right: 0,
            bottom: 0,

            backgroundColor:
                'rgba(15, 23, 42, 0.42)',

            cursor: 'pointer',
        },


        // ======================================================
        // MODAL
        // ======================================================

        modalCard: {
            width: 560,

            maxWidth: 'calc(100% - 40px)' as any,

            maxHeight: '88vh' as any,

            backgroundColor: WHITE,

            borderRadius: 24,

            overflow: 'hidden',

            zIndex: 2,

            borderWidth: 1,
            borderColor:
                'rgba(0,0,0,0.06)',

            shadowColor: '#000',

            shadowOffset: {
                width: 0,
                height: 16,
            },

            shadowOpacity: 0.16,

            shadowRadius: 40,

            elevation: 20,
        },


        // ======================================================
        // HEADER
        // ======================================================

        header: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent: 'space-between',

            paddingHorizontal: 26,

            paddingTop: 24,

            paddingBottom: 20,

            borderBottomWidth: 1,

            borderBottomColor:
                '#F0F1F3',
        },


        headerLeft: {
            flexDirection: 'row',

            alignItems: 'center',

            minWidth: 0,

            flex: 1,
        },


        headerIcon: {
            width: 46,
            height: 46,

            borderRadius: 14,

            backgroundColor:
                PRIMARY_LIGHT,

            alignItems: 'center',
            justifyContent: 'center',

            marginRight: 13,
        },


        headerIconText: {
            fontSize: 24,

            color: PRIMARY,

            fontWeight: '700',
        },


        title: {
            fontSize: 20,

            fontWeight: '800',

            color: TEXT_PRIMARY,

            letterSpacing: -0.4,
        },


        headerSubtitle: {
            marginTop: 4,

            fontSize: 12,

            color: TEXT_SECONDARY,
        },


        closeButton: {
            width: 38,
            height: 38,

            borderRadius: 12,

            backgroundColor:
                '#F2F4F7',

            alignItems: 'center',
            justifyContent: 'center',

            marginLeft: 15,

            cursor: 'pointer',
        },


        closeButtonHover: {
            backgroundColor:
                '#E7E9ED',
        },


        closeText: {
            fontSize: 25,

            lineHeight: 28,

            color: '#475467',

            fontWeight: '400',
        },


        // ======================================================
        // SEARCH
        // ======================================================

        searchContainer: {
            height: 52,

            flexDirection: 'row',

            alignItems: 'center',

            marginHorizontal: 26,

            marginTop: 20,

            marginBottom: 14,

            paddingLeft: 14,

            paddingRight: 7,

            backgroundColor:
                '#F8FAFC',

            borderWidth: 1,

            borderColor:
                '#E4E7EC',

            borderRadius: 14,
        },


        searchIcon: {
            fontSize: 24,

            color: '#667085',

            marginRight: 9,
        },


        searchInput: {
            flex: 1,

            height: 50,

            padding: 0,

            fontSize: 14,

            color: TEXT_PRIMARY,

            outlineStyle: 'none' as any,
        },


        clearButton: {
            width: 28,
            height: 28,

            alignItems: 'center',
            justifyContent: 'center',

            cursor: 'pointer',
        },


        clearText: {
            fontSize: 19,

            color: '#98A2B3',
        },


        searchButton: {
            height: 38,

            minWidth: 78,

            paddingHorizontal: 15,

            borderRadius: 10,

            backgroundColor:
                PRIMARY,

            alignItems: 'center',
            justifyContent: 'center',

            cursor: 'pointer',
        },


        searchButtonHover: {
            backgroundColor:
                PRIMARY_DARK,
        },


        searchButtonDisabled: {
            opacity: 0.45,

            cursor: 'auto',
        },


        searchButtonText: {
            color: WHITE,

            fontSize: 12,

            fontWeight: '800',
        },


        // ======================================================
        // CURRENT LOCATION
        // ======================================================

        currentLocation: {
            minHeight: 70,

            flexDirection: 'row',

            alignItems: 'center',

            marginHorizontal: 26,

            paddingHorizontal: 14,

            paddingVertical: 11,

            backgroundColor:
                PRIMARY_LIGHT,

            borderWidth: 1,

            borderColor:
                '#CDEDE4',

            borderRadius: 15,

            cursor: 'pointer',
        },


        currentLocationHover: {
            backgroundColor:
                '#DFF5EF',
        },


        currentIcon: {
            width: 42,
            height: 42,

            borderRadius: 13,

            backgroundColor: WHITE,

            alignItems: 'center',
            justifyContent: 'center',

            marginRight: 12,
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
        },


        currentSubtitle: {
            marginTop: 4,

            fontSize: 11,

            color: TEXT_SECONDARY,
        },


        currentArrow: {
            fontSize: 20,

            color: PRIMARY,

            paddingHorizontal: 6,
        },


        // ======================================================
        // DETECTED
        // ======================================================

        detectedCard: {
            marginHorizontal: 26,

            marginTop: 14,

            padding: 15,

            backgroundColor:
                '#F6FCFA',

            borderWidth: 1,

            borderColor:
                '#D6EEE7',

            borderRadius: 15,
        },


        detectedTop: {
            flexDirection: 'row',

            alignItems: 'center',
        },


        successIcon: {
            width: 34,
            height: 34,

            borderRadius: 17,

            backgroundColor:
                PRIMARY,

            alignItems: 'center',
            justifyContent: 'center',

            marginRight: 10,
        },


        successIconText: {
            color: WHITE,

            fontSize: 17,

            fontWeight: '800',
        },


        detectedTitleContainer: {
            flex: 1,
        },


        detectedTitle: {
            fontSize: 13,

            fontWeight: '800',

            color: TEXT_PRIMARY,
        },


        detectedSubtitle: {
            marginTop: 2,

            fontSize: 10.5,

            color: TEXT_SECONDARY,
        },


        detectedAddress: {
            marginTop: 10,

            fontSize: 12.5,

            lineHeight: 18,

            color: '#344054',
        },


        useLocationButton: {
            height: 40,

            marginTop: 12,

            borderRadius: 10,

            backgroundColor:
                PRIMARY,

            alignItems: 'center',
            justifyContent: 'center',

            cursor: 'pointer',
        },


        useLocationButtonHover: {
            backgroundColor:
                PRIMARY_DARK,
        },


        useLocationButtonText: {
            color: WHITE,

            fontSize: 12,

            fontWeight: '800',
        },


        // ======================================================
        // SCROLL
        // ======================================================

        scroll: {
            maxHeight: 430,
        },


        scrollContent: {
            paddingHorizontal: 26,

            paddingTop: 6,

            paddingBottom: 20,
        },


        // ======================================================
        // SECTION
        // ======================================================

        sectionHeader: {
            flexDirection: 'row',

            alignItems: 'center',

            marginTop: 16,

            marginBottom: 6,
        },


        sectionTitle: {
            fontSize: 12,

            fontWeight: '800',

            color: TEXT_PRIMARY,

            letterSpacing: 0.1,
        },


        countBadge: {
            minWidth: 21,
            height: 21,

            paddingHorizontal: 6,

            borderRadius: 11,

            backgroundColor:
                '#F2F4F7',

            alignItems: 'center',
            justifyContent: 'center',

            marginLeft: 7,
        },


        countText: {
            fontSize: 9,

            color: TEXT_SECONDARY,

            fontWeight: '800',
        },


        // ======================================================
        // LOCATION ROW
        // ======================================================

        locationRow: {
            minHeight: 63,

            flexDirection: 'row',

            alignItems: 'center',

            paddingVertical: 8,

            paddingHorizontal: 8,

            marginHorizontal: -8,

            borderRadius: 12,

            borderBottomWidth: 1,

            borderBottomColor:
                '#F2F4F7',

            cursor: 'pointer',
        },


        locationRowHover: {
            backgroundColor:
                '#F8FAFC',
        },


        locationIcon: {
            width: 38,
            height: 38,

            borderRadius: 12,

            backgroundColor:
                '#F1F7F5',

            alignItems: 'center',
            justifyContent: 'center',

            marginRight: 11,
        },


        locationIconText: {
            fontSize: 18,

            color: PRIMARY,

            fontWeight: '700',
        },


        locationContent: {
            flex: 1,

            minWidth: 0,

            paddingRight: 8,
        },


        locationTitle: {
            fontSize: 12.5,

            lineHeight: 17,

            fontWeight: '700',

            color: TEXT_PRIMARY,
        },


        locationAddress: {
            marginTop: 3,

            fontSize: 10.5,

            color: TEXT_SECONDARY,

            lineHeight: 15,
        },


        locationCoordinates: {
            marginTop: 3,

            fontSize: 9.5,

            color: TEXT_MUTED,
        },


        rowArrow: {
            fontSize: 17,

            color: '#98A2B3',

            paddingHorizontal: 5,
        },


        // ======================================================
        // EMPTY
        // ======================================================

        emptyState: {
            flexDirection: 'row',

            alignItems: 'center',

            paddingVertical: 25,
        },


        emptyIcon: {
            width: 42,
            height: 42,

            borderRadius: 13,

            backgroundColor:
                '#F2F4F7',

            alignItems: 'center',
            justifyContent: 'center',

            marginRight: 11,
        },


        emptyIconText: {
            fontSize: 19,

            color: TEXT_MUTED,
        },


        emptyTitle: {
            fontSize: 12.5,

            fontWeight: '700',

            color: TEXT_SECONDARY,
        },


        emptyText: {
            marginTop: 3,

            fontSize: 10.5,

            color: TEXT_MUTED,
        },


        // ======================================================
        // NO RESULTS
        // ======================================================

        noResults: {
            alignItems: 'center',

            paddingTop: 35,

            paddingBottom: 30,
        },


        noResultsIcon: {
            width: 50,
            height: 50,

            borderRadius: 16,

            backgroundColor:
                '#F2F4F7',

            alignItems: 'center',
            justifyContent: 'center',

            marginBottom: 11,
        },


        noResultsIconText: {
            fontSize: 23,

            color: TEXT_MUTED,
        },


        noResultsTitle: {
            fontSize: 13,

            fontWeight: '800',

            color: TEXT_PRIMARY,
        },


        noResultsText: {
            marginTop: 5,

            fontSize: 10.5,

            color: TEXT_MUTED,

            textAlign: 'center',
        },


        // ======================================================
        // BOTTOM
        // ======================================================

        bottomSpace: {
            height: 20,
        },

    });