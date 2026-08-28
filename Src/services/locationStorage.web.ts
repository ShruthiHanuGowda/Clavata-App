import type {
    LocationData,
    SavedLocation,
} from './locationTypes';

// ============================================================
// STORAGE KEYS
// ============================================================

const LOCATION_KEY = 'selected_location';

const SAVED_LOCATIONS_KEY = 'saved_locations';

const RECENT_LOCATIONS_KEY = 'recent_locations';

// ============================================================
// SAVE SELECTED LOCATION
// ============================================================

export const saveLocation = async (
    location: LocationData,
): Promise<void> => {

    try {

        localStorage.setItem(
            LOCATION_KEY,
            JSON.stringify(location),
        );

        console.log(
            '✅ Selected location saved:',
            location,
        );

    } catch (error) {

        console.log(
            '❌ Save Location Error:',
            error,
        );
    }
};

// ============================================================
// GET SELECTED LOCATION
// ============================================================

export const getSavedLocation =
    async (): Promise<LocationData | null> => {

        try {

            const value =
                localStorage.getItem(
                    LOCATION_KEY,
                );

            if (!value) {

                console.log(
                    'ℹ️ No selected location found',
                );

                return null;
            }

            const location =
                JSON.parse(value) as LocationData;

            console.log(
                '✅ Selected location loaded:',
                location,
            );

            return location;

        } catch (error) {

            console.log(
                '❌ Get Location Error:',
                error,
            );

            return null;
        }
    };

// ============================================================
// CLEAR SELECTED LOCATION
// ============================================================

export const clearSavedLocation =
    async (): Promise<void> => {

        try {

            localStorage.removeItem(
                LOCATION_KEY,
            );

            console.log(
                '✅ Selected location cleared',
            );

        } catch (error) {

            console.log(
                '❌ Clear Location Error:',
                error,
            );
        }
    };

// ============================================================
// GET ACTIVE LOCATION
// ============================================================

export const getActiveLocation =
    async (): Promise<LocationData | null> => {

        const savedLocation =
            await getSavedLocation();

        if (savedLocation) {

            console.log(
                '📍 Active location:',
                savedLocation,
            );

        } else {

            console.log(
                'ℹ️ No active location selected',
            );
        }

        return savedLocation;
    };

// ============================================================
// GET CURRENT BROWSER LOCATION
// ============================================================

export const getCurrentLocation =
    async (): Promise<LocationData | null> => {

        try {

            if (
                typeof navigator === 'undefined' ||
                !navigator.geolocation
            ) {

                console.log(
                    '❌ Browser geolocation is not available',
                );

                return null;
            }

            return await new Promise<LocationData | null>(
                resolve => {

                    navigator.geolocation.getCurrentPosition(

                        position => {

                            const {
                                latitude,
                                longitude,
                            } = position.coords;

                            console.log(
                                '📍 Browser GPS coordinates:',
                                latitude,
                                longitude,
                            );

                            const location: LocationData = {
                                latitude,
                                longitude,
                                address:
                                    'Current location',
                            };

                            resolve(location);
                        },

                        error => {

                            console.log(
                                '❌ Browser GPS location error:',
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
                },
            );

        } catch (error) {

            console.log(
                '❌ Get Current Location Error:',
                error,
            );

            return null;
        }
    };

// ============================================================
// GET SAVED LOCATIONS
// ============================================================

export const getSavedLocations =
    async (): Promise<SavedLocation[]> => {

        try {

            const value =
                localStorage.getItem(
                    SAVED_LOCATIONS_KEY,
                );

            if (!value) {
                return [];
            }

            const locations =
                JSON.parse(value);

            if (!Array.isArray(locations)) {
                return [];
            }

            return locations as SavedLocation[];

        } catch (error) {

            console.log(
                '❌ Get Saved Locations Error:',
                error,
            );

            return [];
        }
    };

// ============================================================
// ADD SAVED LOCATION
// ============================================================

export const addSavedLocation =
    async (
        location: SavedLocation,
    ): Promise<void> => {

        try {

            const existing =
                await getSavedLocations();

            const alreadyExists =
                existing.some(
                    item =>
                        item.latitude ===
                            location.latitude &&
                        item.longitude ===
                            location.longitude,
                );

            if (alreadyExists) {

                console.log(
                    'ℹ️ Location already saved',
                );

                return;
            }

            const updated = [
                ...existing,
                location,
            ];

            localStorage.setItem(
                SAVED_LOCATIONS_KEY,
                JSON.stringify(updated),
            );

            console.log(
                '✅ Saved location added:',
                location,
            );

        } catch (error) {

            console.log(
                '❌ Add Saved Location Error:',
                error,
            );
        }
    };

// ============================================================
// REMOVE SAVED LOCATION
// ============================================================

export const removeSavedLocation =
    async (
        id: string,
    ): Promise<void> => {

        try {

            const existing =
                await getSavedLocations();

            const updated =
                existing.filter(
                    item => item.id !== id,
                );

            localStorage.setItem(
                SAVED_LOCATIONS_KEY,
                JSON.stringify(updated),
            );

            console.log(
                '✅ Saved location removed:',
                id,
            );

        } catch (error) {

            console.log(
                '❌ Remove Saved Location Error:',
                error,
            );
        }
    };

// ============================================================
// GET RECENT LOCATIONS
// ============================================================

export const getRecentLocations =
    async (): Promise<LocationData[]> => {

        try {

            const value =
                localStorage.getItem(
                    RECENT_LOCATIONS_KEY,
                );

            if (!value) {
                return [];
            }

            const locations =
                JSON.parse(value);

            if (!Array.isArray(locations)) {
                return [];
            }

            return locations as LocationData[];

        } catch (error) {

            console.log(
                '❌ Get Recent Locations Error:',
                error,
            );

            return [];
        }
    };

// ============================================================
// ADD RECENT LOCATION
// ============================================================

export const addRecentLocation =
    async (
        location: LocationData,
    ): Promise<void> => {

        try {

            const existing =
                await getRecentLocations();

            const filtered =
                existing.filter(
                    item =>
                        !(
                            item.latitude ===
                                location.latitude &&
                            item.longitude ===
                                location.longitude
                        ),
                );

            const updated = [
                location,
                ...filtered,
            ].slice(0, 5);

            localStorage.setItem(
                RECENT_LOCATIONS_KEY,
                JSON.stringify(updated),
            );

            console.log(
                '🕘 Recent location added:',
                location,
            );

        } catch (error) {

            console.log(
                '❌ Add Recent Location Error:',
                error,
            );
        }
    };

// ============================================================
// CLEAR RECENT LOCATIONS
// ============================================================

export const clearRecentLocations =
    async (): Promise<void> => {

        try {

            localStorage.removeItem(
                RECENT_LOCATIONS_KEY,
            );

            console.log(
                '✅ Recent locations cleared',
            );

        } catch (error) {

            console.log(
                '❌ Clear Recent Locations Error:',
                error,
            );
        }
    };

// ============================================================
// CLEAR ALL LOCATION STORAGE
// ============================================================

export const clearAllLocationStorage =
    async (): Promise<void> => {

        try {

            localStorage.removeItem(
                LOCATION_KEY,
            );

            localStorage.removeItem(
                SAVED_LOCATIONS_KEY,
            );

            localStorage.removeItem(
                RECENT_LOCATIONS_KEY,
            );

            console.log(
                '🧹 ALL LOCATION STORAGE CLEARED',
            );

        } catch (error) {

            console.log(
                '❌ Clear All Location Storage Error:',
                error,
            );
        }
    };