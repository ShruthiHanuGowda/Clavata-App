import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  useApolloClient,
} from '@apollo/client';

import {
  useNavigation,
} from '@react-navigation/native';

import HomeHeader from './HomeHeader';
import ServiceChips from './ServiceChips';
import LocationBottomSheet from './LocationBottomSheet';
import ReviewPopup from './ReviewPopup';

import {
  getActiveLocation,
  getCurrentLocation,
  LocationData,
} from '../../../services/locationStorage';

import {
  DEFAULT_LOCATION_RADIUS,
  USE_HARDCODED_LOCATION,
} from '../../../constants/locationConfig';

import {
  CUSTOMER_BOOKINGS,
} from '../../../graphql/queries';

import {
  useUser,
} from '../../../context/UserContext';

import {
  COLORS,
  SPACING,
} from '../../../constants/constants';

// ============================================================
// TYPES
// ============================================================

type ServiceAudience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

type Booking = {
  bookingId: string;
  salonId: string;
  customerUserId: string;
  customerName: string;
  salonName: string;
  bookingStatus: string;
  reviewSubmitted?: boolean;
};

type BudgetOption = {
  label: string;
  min: number;
  max: number;
};

type ServiceSelection = {
  categoryId: string;
  category: string;
  subcategoryIds: string[];

  /**
   * Keeps subcategory selections independent per audience.
   *
   * Example:
   * FEMALE -> ['haircut-id']
   * MALE   -> []
   *
   * The same subcategory ID may legitimately exist for
   * multiple audiences, so audience is part of the selection identity.
   */
  audienceSubcategorySelections?: Array<{
    audience: ServiceAudience;
    subcategoryIds: string[];
  }>;
};

// ============================================================
// AUDIENCE
// ============================================================

const AUDIENCE_OPTIONS: {
  value: ServiceAudience;
  label: string;
}[] = [
  {
    value: 'FEMALE',
    label: 'Female',
  },
  {
    value: 'MALE',
    label: 'Male',
  },
  {
    value: 'KIDS',
    label: 'Kids',
  },
];

// ============================================================
// BUDGET
// ============================================================

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    label: 'Any',
    min: 0,
    max: Infinity,
  },
  {
    label: 'Under ₹500',
    min: 0,
    max: 499.99,
  },
  {
    label: '₹500 – ₹1K',
    min: 500,
    max: 1000,
  },
  {
    label: '₹1K – ₹2K',
    min: 1000.01,
    max: 2000,
  },
  {
    label: '₹2K+',
    min: 2000.01,
    max: Infinity,
  },
];

// ============================================================
// DISTANCE
// ============================================================

const DISTANCE_OPTIONS = [
  2,
  5,
  10,
  15,
  25,
];

// ============================================================
// COMPONENT
// ============================================================

export default function HomeScreenPage() {
  const client = useApolloClient();

  const navigation =
    useNavigation<any>();

  const {
    currentUser,
  } = useUser();

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState('');

  // ==========================================================
  // AUDIENCE
  // ==========================================================

  const [
    selectedAudiences,
    setSelectedAudiences,
  ] = useState<ServiceAudience[]>([]);

  // ==========================================================
  // CATEGORY / SUBCATEGORY
  // ==========================================================

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('');

  const [
    selectedSubcategoryIds,
    setSelectedSubcategoryIds,
  ] = useState<string[]>([]);

  /**
   * IMPORTANT:
   * Keep the real service selection separated by audience.
   *
   * Do NOT use selectedSubcategoryIds as the source of truth
   * for the ServiceChips UI because the same subcategory ID can
   * exist for Female, Male and Kids.
   */
  const [
    selectedAudienceSubcategorySelections,
    setSelectedAudienceSubcategorySelections,
  ] = useState<
    Array<{
      audience: ServiceAudience;
      subcategoryIds: string[];
    }>
  >([]);

  // ==========================================================
  // LOCATION
  // ==========================================================

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(
    'Choose location',
  );

  const [
    locationCoordinates,
    setLocationCoordinates,
  ] = useState<LocationData | null>(
    null,
  );

  const [
    showLocationModal,
    setShowLocationModal,
  ] = useState(false);

  // ==========================================================
  // DISTANCE
  // ==========================================================

  const [
    selectedDistance,
    setSelectedDistance,
  ] = useState(
    DEFAULT_LOCATION_RADIUS || 10,
  );

  // ==========================================================
  // BUDGET
  // ==========================================================

  const [
    selectedBudget,
    setSelectedBudget,
  ] = useState<BudgetOption>(
    BUDGET_OPTIONS[0],
  );

  // ==========================================================
  // REVIEW
  // ==========================================================

  const [
    showReviewPopup,
    setShowReviewPopup,
  ] = useState(false);

  const [
    pendingBooking,
    setPendingBooking,
  ] = useState<Booking | null>(
    null,
  );

  // ==========================================================
  // INITIAL LOCATION
  //
  // IMPORTANT:
  // We ONLY load the location here.
  //
  // We DO NOT search salons here.
  // ==========================================================

  const loadLocation =
    useCallback(
      async () => {
        try {
          const savedLocation =
            await getActiveLocation();

          if (
            savedLocation &&
            savedLocation.latitude != null &&
            savedLocation.longitude != null
          ) {
            setSelectedLocation(
              savedLocation.address ||
                'Selected location',
            );

            setLocationCoordinates(
              savedLocation,
            );

            return;
          }

          if (
            USE_HARDCODED_LOCATION
          ) {
            const activeLocation =
              await getActiveLocation();

            if (
              activeLocation &&
              activeLocation.latitude != null &&
              activeLocation.longitude != null
            ) {
              setSelectedLocation(
                activeLocation.address ||
                  'Selected location',
              );

              setLocationCoordinates(
                activeLocation,
              );

              return;
            }
          }

          const currentLocation =
            await getCurrentLocation();

          if (
            currentLocation &&
            currentLocation.latitude != null &&
            currentLocation.longitude != null
          ) {
            setSelectedLocation(
              currentLocation.address ||
                'Current location',
            );

            setLocationCoordinates(
              currentLocation,
            );

            return;
          }

          setSelectedLocation(
            'Choose location',
          );

          setLocationCoordinates(
            null,
          );
        } catch (error) {
          console.log(
            '❌ LOAD LOCATION ERROR:',
            error,
          );

          setSelectedLocation(
            'Choose location',
          );

          setLocationCoordinates(
            null,
          );
        }
      },
      [],
    );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadLocation();
  }, [
    loadLocation,
  ]);

  // ==========================================================
  // BOOKINGS / REVIEW
  // ==========================================================

  const loadCustomerBookings =
    useCallback(
      async () => {
        if (
          !currentUser?.userId
        ) {
          return;
        }

        try {
          const {
            data,
          } = await client.query({
            query:
              CUSTOMER_BOOKINGS,

            variables: {
              customerUserId:
                currentUser.userId,
            },

            fetchPolicy:
              'network-only',
          });

          const customerBookings =
            data?.customerBookings ||
            [];

          const booking =
            customerBookings.find(
              (
                item: Booking,
              ) =>
                item.bookingStatus ===
                  'COMPLETED' &&
                item.reviewSubmitted ===
                  false,
            );

          if (booking) {
            setPendingBooking(
              booking,
            );

            setShowReviewPopup(
              true,
            );
          }
        } catch (error) {
          console.log(
            '❌ BOOKING LOADING ERROR:',
            error,
          );
        }
      },
      [
        client,
        currentUser?.userId,
      ],
    );

  useEffect(() => {
    loadCustomerBookings();
  }, [
    loadCustomerBookings,
  ]);

  // ==========================================================
  // LOCATION SELECTED
  //
  // IMPORTANT:
  // Selecting a location DOES NOT search.
  // ==========================================================

  const handleLocationSelected =
    (
      location: LocationData,
    ) => {
      setSelectedLocation(
        location.address ||
          'Selected location',
      );

      setLocationCoordinates(
        location,
      );

      setShowLocationModal(
        false,
      );
    };

  // ==========================================================
  // AUDIENCE
  //
  // IMPORTANT:
  // Changing audience DOES NOT search.
  // ==========================================================

  const handleAudienceChange =
    (
      audience: ServiceAudience,
    ) => {
      setSelectedAudiences(
        previous => {
          if (
            previous.includes(
              audience,
            )
          ) {
            return previous.filter(
              item =>
                item !== audience,
            );
          }

          return [
            ...previous,
            audience,
          ];
        },
      );

      // Clear service selection
      // because available services
      // depend on audience.

      setSelectedCategoryId('');
      setSelectedCategory('');
      setSelectedSubcategoryIds([]);
      setSelectedAudienceSubcategorySelections([]);
    };

  // ==========================================================
  // SEARCH TEXT
  // ==========================================================

  const handleSearchChange =
    (
      text: string,
    ) => {
      setSearch(text);

      // Search text and service
      // selection are separate modes.
      //
      // If customer starts typing a
      // salon/service name, clear the
      // category selection.

      if (
        text.trim().length > 0
      ) {
        setSelectedCategoryId('');
        setSelectedCategory('');
        setSelectedSubcategoryIds([]);
        setSelectedAudienceSubcategorySelections([]);

        setSelectedBudget(
          BUDGET_OPTIONS[0],
        );
      }
    };

  // ==========================================================
  // SERVICE SELECTION
  //
  // ServiceChips already filters the
  // available subcategories using audience.
  //
  // IMPORTANT:
  // No API request here.
  // ==========================================================

  const handleServiceSelection =
    (
      selection: ServiceSelection,
    ) => {
      const normalizedCategoryId =
        String(
          selection?.categoryId ??
            '',
        ).trim();

      const normalizedCategory =
        String(
          selection?.category ??
            '',
        ).trim();

      const normalizedSubcategoryIds =
        Array.from(
          new Set(
            Array.isArray(
              selection?.subcategoryIds,
            )
              ? selection.subcategoryIds
                  .map(id =>
                    String(
                      id ?? '',
                    ).trim(),
                  )
                  .filter(Boolean)
              : [],
          ),
        );

      /**
       * This is the important part:
       *
       * ServiceChips now returns selections grouped by audience.
       * We preserve that mapping in the parent instead of rebuilding
       * it from the flattened subcategoryIds array.
       */
      const normalizedAudienceSubcategorySelections =
        Array.isArray(
          selection?.audienceSubcategorySelections,
        )
          ? selection.audienceSubcategorySelections
              .filter(
                item =>
                  item &&
                  (
                    item.audience ===
                      'FEMALE' ||
                    item.audience ===
                      'MALE' ||
                    item.audience ===
                      'KIDS'
                  ),
              )
              .map(item => ({
                audience:
                  item.audience,
                subcategoryIds:
                  Array.from(
                    new Set(
                      Array.isArray(
                        item.subcategoryIds,
                      )
                        ? item.subcategoryIds
                            .map(id =>
                              String(
                                id ?? '',
                              ).trim(),
                            )
                            .filter(Boolean)
                        : [],
                    ),
                  ),
              }))
              .filter(
                item =>
                  item.subcategoryIds
                    .length > 0,
              )
          : [];

      setSelectedCategoryId(
        normalizedCategoryId,
      );

      setSelectedCategory(
        normalizedCategory,
      );

      /**
       * Keep the flattened list because the search/results screen
       * currently expects subcategoryIds + audiences separately.
       */
      setSelectedSubcategoryIds(
        normalizedSubcategoryIds,
      );

      /**
       * Keep the audience-specific list because ServiceChips needs
       * it to know which audience actually selected each subcategory.
       */
      setSelectedAudienceSubcategorySelections(
        normalizedAudienceSubcategorySelections,
      );

      // Service search mode.
      setSearch('');
    };

  // ==========================================================
  // FINAL SEARCH
  //
  // THIS IS THE ONLY PLACE WHERE
  // WE NAVIGATE TO SALON RESULTS.
  // ==========================================================

  const handleFinalSearch =
    () => {
      // ------------------------------------------------------
      // LOCATION
      // ------------------------------------------------------

      if (
        !locationCoordinates ||
        locationCoordinates.latitude ==
          null ||
        locationCoordinates.longitude ==
          null
      ) {
        Alert.alert(
          'Choose location',
          'Please select your location before searching.',
          [
            {
              text: 'Choose location',
              onPress: () =>
                setShowLocationModal(
                  true,
                ),
            },
          ],
        );

        return;
      }

      // ------------------------------------------------------
      // AUDIENCE
      // ------------------------------------------------------

      if (
        selectedAudiences.length === 0
      ) {
        Alert.alert(
          'Select audience',
          'Please select who the service is for.',
        );

        return;
      }

      // ------------------------------------------------------
      // SERVICE / SEARCH
      // ------------------------------------------------------

      const cleanSearch =
        search.trim();

      const hasService =
        selectedCategoryId.trim()
          .length > 0;

      const hasSearch =
        cleanSearch.length > 0;

      if (
        !hasService &&
        !hasSearch
      ) {
        Alert.alert(
          'Select a service',
          'Please select a service or search for a salon/service.',
        );

        return;
      }

      // ------------------------------------------------------
      // NAVIGATE
      //
      // API is intentionally NOT called here.
      // SalonSearchResults will call the API.
      // ------------------------------------------------------

      navigation.navigate(
        'SalonSearchResults',
        {
          latitude:
            Number(
              locationCoordinates.latitude,
            ),

          longitude:
            Number(
              locationCoordinates.longitude,
            ),

          radius:
            Number(
              selectedDistance,
            ),

          search:
            hasSearch
              ? cleanSearch
              : '',

          audiences:
            selectedAudiences,

          categoryId:
            hasService
              ? selectedCategoryId
              : '',

          category:
            selectedCategory,

          subcategoryIds:
            hasService
              ? selectedSubcategoryIds
              : [],

          minPrice:
            hasService &&
            selectedBudget.label !==
              'Any'
              ? selectedBudget.min
              : undefined,

          maxPrice:
            hasService &&
            selectedBudget.label !==
              'Any' &&
            selectedBudget.max !==
              Infinity
              ? selectedBudget.max
              : undefined,

          budgetLabel:
            selectedBudget.label,

          location:
            selectedLocation,
        },
      );
    };

  // ==========================================================
  // CLAVATA MATCH
  // ==========================================================

  const askClavata =
    () => {
      navigation.navigate(
        'ClavataMatch',
        {
          service:
            selectedCategory.trim() ||
            undefined,

          categoryId:
            selectedCategoryId.trim() ||
            undefined,

          subcategoryIds:
            selectedSubcategoryIds.length >
            0
              ? selectedSubcategoryIds
              : undefined,

          audience:
            selectedAudiences.length >
            0
              ? selectedAudiences
              : undefined,

          location:
            locationCoordinates,

          minBudget:
            selectedBudget.min,

          maxBudget:
            selectedBudget.max,

          distance:
            selectedDistance,
        },
      );
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <HomeHeader
          location={
            selectedLocation
          }
          onPressLocation={() =>
            setShowLocationModal(
              true,
            )
          }
        />

        {/* ==================================================
            SEARCH
        ================================================== */}

        <View
          style={
            styles.searchSection
          }
        >
          <View
            style={
              styles.searchBox
            }
          >
            <Text
              style={
                styles.searchSymbol
              }
            >
              ⌕
            </Text>

            <TextInput
              value={search}
              onChangeText={
                handleSearchChange
              }
              placeholder={
                'Search salons or services'
              }
              placeholderTextColor={
                COLORS.textMuted
              }
              style={
                styles.searchInput
              }
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* ==================================================
            AUDIENCE
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Who is the service for?
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Select one or more
          </Text>

          <View
            style={
              styles.audienceRow
            }
          >
            {AUDIENCE_OPTIONS.map(
              option => {
                const selected =
                  selectedAudiences.includes(
                    option.value,
                  );

                return (
                  <TouchableOpacity
                    key={
                      option.value
                    }
                    style={[
                      styles.audienceChip,
                      selected &&
                        styles.audienceChipSelected,
                    ]}
                    onPress={() =>
                      handleAudienceChange(
                        option.value,
                      )
                    }
                    activeOpacity={
                      0.8
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selected && (
                        <Text
                          style={
                            styles.checkmark
                          }
                        >
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.audienceText,
                        selected &&
                          styles.audienceTextSelected,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* ==================================================
            SERVICE
        ================================================== */}

        {selectedAudiences.length >
          0 && (
          <View
            style={
              styles.serviceSection
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Choose a service
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Services are filtered for your selected audience
            </Text>

            <ServiceChips
              selectedCategoryId={
                selectedCategoryId
              }
              selectedCategory={
                selectedCategory
              }
              selectedSubcategoryIds={
                selectedSubcategoryIds
              }
              selectedAudienceSubcategorySelections={
                selectedAudienceSubcategorySelections
              }
              selectedAudiences={
                selectedAudiences
              }
              onSelect={
                handleServiceSelection
              }
            />
          </View>
        )}

        {/* ==================================================
            DISTANCE
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.labelRow
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Distance
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                How far should we search?
              </Text>
            </View>

            <Text
              style={
                styles.selectedValue
              }
            >
              {
                selectedDistance
              }{' '}
              km
            </Text>
          </View>

          <View
            style={
              styles.distanceRow
            }
          >
            {DISTANCE_OPTIONS.map(
              distance => {
                const selected =
                  selectedDistance ===
                  distance;

                return (
                  <TouchableOpacity
                    key={
                      distance
                    }
                    style={[
                      styles.distanceOption,
                      selected &&
                        styles.distanceOptionSelected,
                    ]}
                    onPress={() =>
                      setSelectedDistance(
                        distance,
                      )
                    }
                    activeOpacity={
                      0.8
                    }
                  >
                    <Text
                      style={[
                        styles.distanceNumber,
                        selected &&
                          styles.distanceNumberSelected,
                      ]}
                    >
                      {
                        distance
                      }
                    </Text>

                    <Text
                      style={[
                        styles.distanceUnit,
                        selected &&
                          styles.distanceUnitSelected,
                      ]}
                    >
                      km
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* ==================================================
            BUDGET
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Budget
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Select your preferred service price
          </Text>

          <View
            style={
              styles.budgetRow
            }
          >
            {BUDGET_OPTIONS.map(
              option => {
                const selected =
                  selectedBudget.label ===
                  option.label;

                const disabled =
                  option.label !==
                    'Any' &&
                  selectedCategoryId.trim()
                    .length === 0;

                return (
                  <TouchableOpacity
                    key={
                      option.label
                    }
                    disabled={
                      disabled
                    }
                    style={[
                      styles.budgetOption,
                      selected &&
                        styles.budgetOptionSelected,
                      disabled &&
                        styles.budgetOptionDisabled,
                    ]}
                    onPress={() =>
                      setSelectedBudget(
                        option,
                      )
                    }
                    activeOpacity={
                      0.8
                    }
                  >
                    <Text
                      style={[
                        styles.budgetText,
                        selected &&
                          styles.budgetTextSelected,
                        disabled &&
                          styles.budgetTextDisabled,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {selectedCategoryId.trim()
            .length === 0 && (
            <Text
              style={
                styles.budgetHint
              }
            >
              Select a service first to use a budget filter.
            </Text>
          )}
        </View>

        {/* ==================================================
            SELECTED SUMMARY
        ================================================== */}

        <View
          style={
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.summaryTitle
            }
          >
            Your search
          </Text>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              For
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {selectedAudiences.length >
              0
                ? selectedAudiences
                    .map(
                      audience => {
                        if (
                          audience ===
                          'FEMALE'
                        ) {
                          return 'Female';
                        }

                        if (
                          audience ===
                          'MALE'
                        ) {
                          return 'Male';
                        }

                        return 'Kids';
                      },
                    )
                    .join(', ')
                : 'Not selected'}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Service
            </Text>

            <Text
              style={
                styles.summaryValue
              }
              numberOfLines={
                2
              }
            >
              {selectedCategory ||
                search.trim() ||
                'Not selected'}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Distance
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                selectedDistance
              }{' '}
              km
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Budget
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                selectedBudget.label
              }
            </Text>
          </View>
        </View>

        {/* ==================================================
            SEARCH BUTTON
        ================================================== */}

        <TouchableOpacity
          style={
            styles.searchButton
          }
          onPress={
            handleFinalSearch
          }
          activeOpacity={
            0.85
          }
        >
          <Text
            style={
              styles.searchButtonText
            }
          >
            Search
          </Text>

          <Text
            style={
              styles.searchButtonArrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        {/* ==================================================
            CLAVATA MATCH
        ================================================== */}

        <TouchableOpacity
          style={
            styles.clavataCard
          }
          onPress={
            askClavata
          }
          activeOpacity={
            0.85
          }
        >
          <View
            style={
              styles.clavataBody
            }
          >
            <Text
              style={
                styles.clavataTitle
              }
            >
              Let Clavata choose
            </Text>

            <Text
              style={
                styles.clavataText
              }
            >
              Find the best match for you
            </Text>
          </View>

          <Text
            style={
              styles.clavataArrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <LocationBottomSheet
        visible={
          showLocationModal
        }
        onClose={() =>
          setShowLocationModal(
            false,
          )
        }
        onLocationSelected={
          handleLocationSelected
        }
      />

      {/* ======================================================
          REVIEW
      ====================================================== */}

      <ReviewPopup
        visible={
          showReviewPopup
        }
        salonName={
          pendingBooking?.salonName
        }
        onRate={() => {
          setShowReviewPopup(
            false,
          );

          navigation.navigate(
            'Bookings',
            {
              screen:
                'RateReview',
              params: {
                booking:
                  pendingBooking,
              },
            },
          );
        }}
        onLater={() => {
          setShowReviewPopup(
            false,
          );
        }}
      />
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    content: {
      paddingBottom: 30,
    },

    searchSection: {
      marginHorizontal:
        SPACING.xl,
      marginTop: 8,
      marginBottom: 22,
    },

    searchBox: {
      height: 54,
      borderRadius: 14,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        '#E2E2E2',
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 15,
    },

    searchSymbol: {
      fontSize: 25,
      color:
        COLORS.themeColor,
      marginRight: 8,
      fontWeight: '300',
    },

    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 15,
      color:
        COLORS.black,
      paddingVertical: 0,
    },

    section: {
      marginHorizontal:
        SPACING.xl,
      marginBottom: 24,
    },

    serviceSection: {
      marginBottom: 20,
      marginLeft: 20
    },

    sectionTitle: {
      fontSize: 17,
      color:
        COLORS.black,
      fontWeight: '700',
    },

    sectionSubtitle: {
      marginTop: 4,
      fontSize: 11,
      color:
        COLORS.textMuted,
      fontWeight: '500',
    },

    audienceRow: {
      flexDirection:
        'row',
      gap: 8,
      marginTop: 12,
    },

    audienceChip: {
      flex: 1,
      minHeight: 44,
      borderRadius: 22,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        '#E1E1E1',
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 8,
    },

    audienceChipSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    checkbox: {
      width: 19,
      height: 19,
      borderRadius: 5,
      borderWidth: 1,
      borderColor:
        '#CCCCCC',
      backgroundColor:
        COLORS.white,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 7,
    },

    checkboxSelected: {
      borderColor:
        COLORS.white,
      backgroundColor:
        COLORS.white,
    },

    checkmark: {
      color:
        COLORS.themeColor,
      fontSize: 13,
      fontWeight: '800',
    },

    audienceText: {
      color:
        COLORS.black,
      fontSize: 12,
      fontWeight: '600',
    },

    audienceTextSelected: {
      color:
        COLORS.white,
    },

    labelRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    selectedValue: {
      color:
        COLORS.themeColor,
      fontSize: 13,
      fontWeight: '700',
    },

    distanceRow: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      marginTop: 12,
    },

    distanceOption: {
      width: 54,
      height: 48,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        '#E2E2E2',
      backgroundColor:
        COLORS.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    distanceOptionSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    distanceNumber: {
      color:
        COLORS.black,
      fontSize: 14,
      fontWeight: '700',
    },

    distanceNumberSelected: {
      color:
        COLORS.white,
    },

    distanceUnit: {
      color:
        COLORS.textMuted,
      fontSize: 9,
    },

    distanceUnitSelected: {
      color:
        COLORS.white,
    },

    budgetRow: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap: 8,
      marginTop: 12,
    },

    budgetOption: {
      minHeight: 40,
      paddingHorizontal: 13,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        '#E2E2E2',
      backgroundColor:
        COLORS.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    budgetOptionSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    budgetOptionDisabled: {
      opacity: 0.45,
    },

    budgetText: {
      color:
        COLORS.black,
      fontSize: 11,
      fontWeight: '600',
    },

    budgetTextSelected: {
      color:
        COLORS.white,
    },

    budgetTextDisabled: {
      color:
        COLORS.textMuted,
    },

    budgetHint: {
      marginTop: 8,
      color:
        COLORS.textMuted,
      fontSize: 10,
    },

    summaryCard: {
      marginHorizontal:
        SPACING.xl,
      marginBottom: 16,
      padding: 16,
      borderRadius: 18,
      backgroundColor:
        COLORS.themeColor,
    },

    summaryTitle: {
      color:
        COLORS.white,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 10,
    },

    summaryRow: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'flex-start',
      marginTop: 7,
    },

    summaryLabel: {
      color:
        COLORS.white,
      opacity: 0.75,
      fontSize: 11,
    },

    summaryValue: {
      color:
        COLORS.white,
      fontSize: 12,
      fontWeight: '600',
      maxWidth: '68%',
      textAlign: 'right',
    },

    searchButton: {
      marginHorizontal:
        SPACING.xl,
      height: 56,
      borderRadius: 15,
      backgroundColor:
        COLORS.themeColor,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    searchButtonText: {
      color:
        COLORS.white,
      fontSize: 15,
      fontWeight: '700',
    },

    searchButtonArrow: {
      color:
        COLORS.white,
      fontSize: 21,
      marginLeft: 9,
      fontWeight: '300',
    },

    clavataCard: {
      marginHorizontal:
        SPACING.xl,
      marginTop: 12,
      minHeight: 70,
      borderRadius: 18,
      backgroundColor:
        COLORS.secondaryColor,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 16,
    },

    clavataBody: {
      flex: 1,
    },

    clavataTitle: {
      color:
        COLORS.white,
      fontSize: 14,
      fontWeight: '700',
    },

    clavataText: {
      marginTop: 3,
      color:
        COLORS.white,
      opacity: 0.75,
      fontSize: 11,
    },

    clavataArrow: {
      color:
        COLORS.white,
      fontSize: 22,
    },

    bottomSpace: {
      height: 25,
    },
  });