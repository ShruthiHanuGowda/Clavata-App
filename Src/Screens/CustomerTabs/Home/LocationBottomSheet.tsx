import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Modal from 'react-native-modal';
import Geolocation from '@react-native-community/geolocation';

import {
  reverseGeocode,
  searchAddress,
} from '../../../services/locationService';

import {
  getSavedLocations,
  getRecentLocations,
  saveLocation,
  addRecentLocation,
  LocationData,
  SavedLocation,
} from '../../../services/locationStorage';

import { USE_HARDCODED_LOCATION } from '../../../constants/config';

type Props = {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: LocationData) => void;
};

type SearchResult = LocationData & {
  display_name?: string;
  name?: string;
};

const COLORS = {
  primary: '#7655D9',
  primaryLight: '#F2EDFF',
  primaryBorder: '#E3D9FF',
  background: '#F8F7FC',
  surface: '#FFFFFF',
  inputBackground: '#FBFAFE',
  text: '#211C35',
  muted: '#777389',
  placeholder: '#9690A8',
  border: '#E8E4F0',
  error: '#C63F52',
  success: '#26845B',
};

const HARDCODED_LOCATION: LocationData = {
  latitude: 12.963694,
  longitude: 77.4014239,
  address: 'Gangenahalli, Tavarekere, Bengaluru, Karnataka',
};

const getAddressText = (location: LocationData): string => {
  return location.address || 'Selected location';
};

const getLocationKey = (location: LocationData): string => {
  return `${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`;
};

const LocationBottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  onLocationSelected,
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationData[]>([]);
  const [detectedLocation, setDetectedLocation] =
    useState<LocationData | null>(null);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  const hasSearchText = searchText.trim().length > 0;

  const loadLocations = useCallback(async () => {
    setIsLoadingSaved(true);

    try {
      const [saved, recent] = await Promise.all([
        getSavedLocations(),
        getRecentLocations(),
      ]);

      setSavedLocations(Array.isArray(saved) ? saved : []);
      setRecentLocations(Array.isArray(recent) ? recent : []);
    } catch (error) {
      console.warn('Unable to load saved or recent locations:', error);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadLocations();
    }
  }, [visible, loadLocations]);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setSearchResults([]);
      setDetectedLocation(null);
      setIsSearching(false);
    }
  }, [visible]);

  const handleSearch = useCallback(async () => {
    const query = searchText.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);
    setSearchResults([]);

    try {
      const results = await searchAddress(query);

      const mappedResults: SearchResult[] = (Array.isArray(results)
        ? results
        : []
      )
        .map((item: any) => ({
          latitude: Number(item.latitude ?? item.lat),
          longitude: Number(item.longitude ?? item.lon),
          address:
            item.address ||
            item.display_name ||
            item.name ||
            'Selected location',
          display_name: item.display_name,
          name: item.name,
        }))
        .filter(
          item =>
            Number.isFinite(item.latitude) &&
            Number.isFinite(item.longitude),
        );

      setSearchResults(mappedResults);
    } catch (error) {
      console.warn('Location search failed:', error);
      Alert.alert(
        'Search unavailable',
        'We could not search for that location. Please try again.',
      );
    } finally {
      setIsSearching(false);
    }
  }, [searchText]);

  const handleUseCurrentLocation = useCallback(() => {
    Keyboard.dismiss();
    setIsLoadingLocation(true);
    setDetectedLocation(null);

    if (USE_HARDCODED_LOCATION) {
      setDetectedLocation(HARDCODED_LOCATION);
      setIsLoadingLocation(false);
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          const result: any = await reverseGeocode(latitude, longitude);

          const address =
            result?.display_name ||
            result?.address?.suburb ||
            result?.address?.neighbourhood ||
            result?.address?.city ||
            result?.address?.town ||
            result?.address?.village ||
            'Current location';

          setDetectedLocation({
            latitude,
            longitude,
            address:
              typeof address === 'string'
                ? address
                : 'Current location',
          });
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);

          setDetectedLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current location',
          });
        } finally {
          setIsLoadingLocation(false);
        }
      },
      error => {
        console.warn('Unable to get current location:', error);
        setIsLoadingLocation(false);

        Alert.alert(
          'Location unavailable',
          'Please enable location permission and GPS, or search for your location manually.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      },
    );
  }, []);

  const handleSelectLocation = useCallback(
    async (location: LocationData) => {
      Keyboard.dismiss();

      try {
        await saveLocation(location);
        await addRecentLocation(location);
      } catch (error) {
        console.warn('Unable to save selected location:', error);
      }

      onLocationSelected(location);
      onClose();
    },
    [onClose, onLocationSelected],
  );

  const filteredSavedLocations = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return savedLocations;
    }

    return savedLocations.filter(location =>
      `${location.title} ${location.address}`.toLowerCase().includes(query),
    );
  }, [savedLocations, searchText]);

  const filteredRecentLocations = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return recentLocations;
    }

    return recentLocations.filter(location =>
      location.address.toLowerCase().includes(query),
    );
  }, [recentLocations, searchText]);

  const renderSectionTitle = (
    title: string,
    trailing?: React.ReactNode,
  ) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {trailing}
    </View>
  );

  const renderSearchResult = (
    location: SearchResult,
    index: number,
  ) => (
    <TouchableOpacity
      key={`${getLocationKey(location)}-${index}`}
      activeOpacity={0.75}
      style={styles.locationRow}
      onPress={() => handleSelectLocation(location)}
    >
      <View style={styles.locationIconContainer}>
        <Text style={styles.locationIcon}>⌖</Text>
      </View>

      <View style={styles.locationContent}>
        <Text style={styles.locationTitle} numberOfLines={2}>
          {location.name || location.address.split(',')[0]}
        </Text>
        <Text style={styles.locationSubtitle} numberOfLines={2}>
          {location.display_name || location.address}
        </Text>
      </View>

      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );

  const renderSavedLocation = (location: SavedLocation) => (
    <TouchableOpacity
      key={location.id}
      activeOpacity={0.75}
      style={styles.locationRow}
      onPress={() => handleSelectLocation(location)}
    >
      <View style={styles.locationIconContainer}>
        <Text style={styles.locationIcon}>
          {location.title?.toLowerCase().includes('home') ? '⌂' : '▦'}
        </Text>
      </View>

      <View style={styles.locationContent}>
        <Text style={styles.locationTitle} numberOfLines={1}>
          {location.title}
        </Text>
        <Text style={styles.locationSubtitle} numberOfLines={2}>
          {location.address}
        </Text>
      </View>

      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );

  const renderRecentLocation = (
    location: LocationData,
    index: number,
  ) => (
    <TouchableOpacity
      key={`${getLocationKey(location)}-${index}`}
      activeOpacity={0.75}
      style={styles.locationRow}
      onPress={() => handleSelectLocation(location)}
    >
      <View style={styles.recentIconContainer}>
        <Text style={styles.recentIcon}>◷</Text>
      </View>

      <View style={styles.locationContent}>
        <Text style={styles.locationTitle} numberOfLines={1}>
          {location.address.split(',')[0] || 'Recent location'}
        </Text>
        <Text style={styles.locationSubtitle} numberOfLines={2}>
          {location.address}
        </Text>
      </View>

      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );

  return (
  <Modal
  isVisible={visible}
  onBackdropPress={onClose}
  onBackButtonPress={onClose}
  style={styles.modal}
  animationIn="slideInUp"
  animationOut="slideOutDown"
  backdropOpacity={0.42}
  useNativeDriver={false}
  useNativeDriverForBackdrop={false}
>
      <View style={styles.sheet}>
        <View style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Choose your location</Text>
            <Text style={styles.headerSubtitle}>
              Find salons and services near you
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Close location picker"
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              setSearchResults([]);
            }}
            onSubmitEditing={handleSearch}
            placeholder="Search area, street or landmark"
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search for a location"
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setSearchResults([]);
              }}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching || !hasSearchText}
            activeOpacity={0.8}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          <View style={styles.currentLocationIconContainer}>
            <Text style={styles.currentLocationIcon}>◎</Text>
          </View>

          <View style={styles.currentLocationContent}>
            <Text style={styles.currentLocationTitle}>
              Use current location
            </Text>
            <Text style={styles.currentLocationSubtitle}>
              Detect your location using GPS
            </Text>
          </View>

          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.rowChevron}>›</Text>
          )}
        </TouchableOpacity>

        {isLoadingLocation && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              Detecting your location...
            </Text>
          </View>
        )}

        {detectedLocation && (
          <View style={styles.detectedCard}>
            <View style={styles.detectedHeader}>
              <View style={styles.detectedIconContainer}>
                <Text style={styles.detectedIcon}>✓</Text>
              </View>

              <View style={styles.detectedTextContainer}>
                <Text style={styles.detectedTitle}>
                  Current location detected
                </Text>
                <Text style={styles.detectedAddress} numberOfLines={3}>
                  {getAddressText(detectedLocation)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.useLocationButton}
              onPress={() => handleSelectLocation(detectedLocation)}
            >
              <Text style={styles.useLocationButtonText}>
                Use this location
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {hasSearchText && (
            <>
              {renderSectionTitle('Search results')}

              {isSearching ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                  <Text style={styles.emptyStateText}>
                    Searching locations...
                  </Text>
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map(renderSearchResult)
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Text style={styles.emptyIcon}>⌕</Text>
                  </View>
                  <Text style={styles.emptyStateTitle}>
                    No search results yet
                  </Text>
                  <Text style={styles.emptyStateText}>
                    Tap Search to find matching locations.
                  </Text>
                </View>
              )}
            </>
          )}

          {!hasSearchText && (
            <>
              {filteredSavedLocations.length > 0 && (
                <>
                  {renderSectionTitle('Saved locations')}
                  {filteredSavedLocations.map(renderSavedLocation)}
                </>
              )}

              {renderSectionTitle(
                'Recent locations',
                isLoadingSaved ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                ) : undefined,
              )}

              {filteredRecentLocations.length > 0 ? (
                filteredRecentLocations.map(renderRecentLocation)
              ) : (
                !isLoadingSaved && (
                  <View style={styles.emptyRecent}>
                    <View style={styles.emptyIconContainer}>
                      <Text style={styles.emptyIcon}>◷</Text>
                    </View>
                    <Text style={styles.emptyStateTitle}>
                      No recent locations
                    </Text>
                    <Text style={styles.emptyStateText}>
                      Locations you select will appear here.
                    </Text>
                  </View>
                )
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Choose your location to discover nearby salons
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default LocationBottomSheet;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },

  sheet: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingBottom: 12,
    overflow: 'hidden',
  },

  handleArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
  },

  handle: {
    width: 42,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#DAD5E6',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    color: COLORS.muted,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '400',
    marginTop: -2,
  },

  searchContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: 12,
    paddingRight: 6,
    marginBottom: 12,
  },

  searchIcon: {
    fontSize: 26,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: -2,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 13,
    color: COLORS.text,
  },

  clearButton: {
    width: 26,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonText: {
    fontSize: 22,
    color: COLORS.placeholder,
  },

  searchButton: {
    minWidth: 66,
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  currentLocationButton: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 12,
  },

  currentLocationIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  currentLocationIcon: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: '600',
    lineHeight: 31,
  },

  currentLocationContent: {
    flex: 1,
  },

  currentLocationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  currentLocationSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.muted,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
  },

  loadingText: {
    marginLeft: 9,
    fontSize: 12,
    color: COLORS.muted,
  },

  detectedCard: {
    padding: 13,
    backgroundColor: '#FBF9FF',
    borderWidth: 1,
    borderColor: '#E5DDFB',
    borderRadius: 16,
    marginBottom: 15,
  },

  detectedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  detectedIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E8F6EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  detectedIcon: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.success,
  },

  detectedTextContainer: {
    flex: 1,
  },

  detectedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 5,
  },

  detectedAddress: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },

  useLocationButton: {
    height: 42,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  useLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  scrollArea: {
    flexShrink: 1,
  },

  scrollContent: {
    paddingBottom: 8,
  },

  sectionHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  locationRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  locationIconContainer: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  locationIcon: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '600',
  },

  locationContent: {
    flex: 1,
    paddingRight: 8,
  },

  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  locationSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
  },

  rowChevron: {
    fontSize: 25,
    color: '#AAA3BC',
    paddingLeft: 4,
  },

  recentIconContainer: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#F1EDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  recentIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
  },

  emptyRecent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 22,
    paddingBottom: 26,
  },

  emptyIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyIcon: {
    fontSize: 25,
    color: COLORS.primary,
  },

  emptyStateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyStateText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  footer: {
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    marginTop: 5,
  },

  footerText: {
    fontSize: 10,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
});
