import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  USE_HARDCODED_LOCATION,
  HARDCODED_LOCATION,
} from './locationConfig';

// ============================================================
// TYPES
// ============================================================

export type LocationData = {
  latitude: number;
  longitude: number;
  address: string;
};

export type SavedLocation = LocationData & {
  id: string;
  title: string;
};

// ============================================================
// STORAGE KEYS
// ============================================================

const LOCATION_KEY = 'selected_location';

const SAVED_LOCATIONS_KEY = 'saved_locations';

const RECENT_LOCATIONS_KEY = 'recent_locations';

// ============================================================
// SELECTED / ACTIVE LOCATION
// ============================================================

/**
 * Save the user's selected location.
 *
 * NOTE:
 * In hardcoded test mode this can still be called,
 * but getActiveLocation() will always return
 * HARDCODED_LOCATION from locationConfig.ts.
 */
export const saveLocation = async (
  location: LocationData,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
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
// GET SAVED / SELECTED LOCATION
// ============================================================

export const getSavedLocation =
  async (): Promise<LocationData | null> => {
    try {
      const value =
        await AsyncStorage.getItem(
          LOCATION_KEY,
        );

      console.log(
        '🔎 selected_location raw:',
        value,
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
      await AsyncStorage.removeItem(
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
//
// THIS IS THE IMPORTANT PART.
//
// USE_HARDCODED_LOCATION controls the source.
//
// true:
//     HARDCODED_LOCATION from locationConfig.ts
//
// false:
//     selected_location from AsyncStorage
//
// ============================================================

export const getActiveLocation =
  async (): Promise<LocationData | null> => {
    // --------------------------------------------------------
    // TEST MODE
    // --------------------------------------------------------

    if (USE_HARDCODED_LOCATION) {
      console.log(
        '🧪 TEST MODE: Using HARDCODED_LOCATION from locationConfig.ts',
      );

      console.log(
        '📍 Test Location:',
        HARDCODED_LOCATION,
      );

      return {
        ...HARDCODED_LOCATION,
      };
    }

    // --------------------------------------------------------
    // PRODUCTION MODE
    // --------------------------------------------------------

    console.log(
      '🚀 PRODUCTION MODE: Loading selected location',
    );

    const savedLocation =
      await getSavedLocation();

    if (savedLocation) {
      console.log(
        '📍 Production active location:',
        savedLocation,
      );
    } else {
      console.log(
        'ℹ️ No production location selected',
      );
    }

    return savedLocation;
  };

// ============================================================
// SAVED LOCATIONS
// ============================================================

export const getSavedLocations =
  async (): Promise<SavedLocation[]> => {
    try {
      const value =
        await AsyncStorage.getItem(
          SAVED_LOCATIONS_KEY,
        );

      console.log(
        '🔎 saved_locations raw:',
        value,
      );

      if (!value) {
        console.log(
          'ℹ️ No saved locations found',
        );

        return [];
      }

      const locations =
        JSON.parse(value);

      if (!Array.isArray(locations)) {
        console.log(
          '⚠️ saved_locations is not an array',
        );

        return [];
      }

      console.log(
        '✅ Saved locations loaded:',
        locations,
      );

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
      console.log(
        '💾 Adding saved location:',
        location,
      );

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

      await AsyncStorage.setItem(
        SAVED_LOCATIONS_KEY,
        JSON.stringify(updated),
      );

      console.log(
        '✅ Saved location added:',
        updated,
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

      await AsyncStorage.setItem(
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
// RECENT LOCATIONS
// ============================================================

export const getRecentLocations =
  async (): Promise<LocationData[]> => {
    try {
      const value =
        await AsyncStorage.getItem(
          RECENT_LOCATIONS_KEY,
        );

      console.log(
        '🔎 recent_locations raw:',
        value,
      );

      if (!value) {
        console.log(
          'ℹ️ No recent locations found',
        );

        return [];
      }

      const locations =
        JSON.parse(value);

      if (!Array.isArray(locations)) {
        console.log(
          '⚠️ recent_locations is not an array',
        );

        return [];
      }

      console.log(
        '✅ Recent locations loaded:',
        locations,
      );

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
      console.log(
        '🕘 Adding recent location:',
        location,
      );

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

      await AsyncStorage.setItem(
        RECENT_LOCATIONS_KEY,
        JSON.stringify(updated),
      );

      console.log(
        '✅ Recent location added:',
        updated,
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
      await AsyncStorage.removeItem(
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
      await AsyncStorage.multiRemove([
        LOCATION_KEY,
        SAVED_LOCATIONS_KEY,
        RECENT_LOCATIONS_KEY,
      ]);

      console.log(
        '🧹 ALL LOCATION STORAGE CLEARED',
      );
    } catch (error) {
      console.log(
        '❌ Clear all location storage error:',
        error,
      );
    }
  };