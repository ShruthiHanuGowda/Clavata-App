// ============================================================
// LOCATION CONFIGURATION
// ============================================================
//
// TESTING:
// USE_HARDCODED_LOCATION = true
//
// PRODUCTION:
// USE_HARDCODED_LOCATION = false
//
// When true:
// - App uses HARDCODED_LOCATION everywhere
// - "Use Current Location" uses HARDCODED_LOCATION
// - GPS is NOT requested
// - No test locations are written to AsyncStorage
//
// When false:
// - App uses saved/selected location
// - "Use Current Location" uses real GPS
// - Saved/recent locations use AsyncStorage
//
// ============================================================

export const USE_HARDCODED_LOCATION = true;

// ============================================================
// HARD-CODED TEST LOCATION
// ============================================================
//
// Change ONLY this location when testing.
//
// You do NOT need to change locationStorage.ts,
// HomeScreenPage.tsx or LocationBottomSheet.tsx.
//

export const HARDCODED_LOCATION = {
  latitude: 12.963694,
  longitude: 77.4014239,
  address: 'Gangenahalli, Tavarekere, Bengaluru, Karnataka',
};

// ============================================================
// SEARCH RADIUS
// ============================================================

export const DEFAULT_LOCATION_RADIUS = 10;