import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import {
  useApolloClient,
} from '@apollo/client';

import {
  useNavigation,
} from '@react-navigation/native';

import HomeHeader from './HomeHeader';
import ServiceChips from './ServiceChips';
import SalonCard from './SalonCard';
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
} from '../../../services/locationConfig';

import {
  GET_NEARBY_SALONS,
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
type SalonStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'TEMPORARILY_CLOSED';

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

type Salon = {
  id: string;
  salonId: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  distanceValue: number;
  address: any;
  price: number;
  image: string;
  salonStatus?: SalonStatus;
  businessHours?: any;
};


// ============================================================
// BUDGET
// ============================================================

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    label: 'Any',
    min: 0,
    max: 100000,
  },
  {
    label: 'Under ₹500',
    min: 0,
    max: 500,
  },
  {
    label: '₹500 – ₹1K',
    min: 500,
    max: 1000,
  },
  {
    label: '₹1K – ₹2K',
    min: 1000,
    max: 2000,
  },
  {
    label: '₹2K+',
    min: 2000,
    max: 100000,
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
  // DATA
  // ==========================================================

  const [
    salons,
    setSalons,
  ] = useState<Salon[]>([]);

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('');


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
  // FILTER
  // ==========================================================

  const [
    showFilterModal,
    setShowFilterModal,
  ] = useState(false);

  const [
    selectedBudget,
    setSelectedBudget,
  ] = useState<BudgetOption>(
    BUDGET_OPTIONS[0],
  );

  const [
    selectedDistance,
    setSelectedDistance,
  ] = useState(
    DEFAULT_LOCATION_RADIUS || 10,
  );


  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loadingSalons,
    setLoadingSalons,
  ] = useState(false);


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
  // GET CURRENT ACTIVE COORDINATES
  // ==========================================================

  const getActiveCoordinates =
    useCallback(
      (): LocationData | null => {

        if (
          locationCoordinates &&
          locationCoordinates.latitude != null &&
          locationCoordinates.longitude != null
        ) {
          return locationCoordinates;
        }

        return null;
      },
      [
        locationCoordinates,
      ],
    );


  // ==========================================================
  // FETCH SALONS
  // ==========================================================

  const fetchNearbySalons =
    useCallback(
      async (
        latitude?: number,
        longitude?: number,
        searchText = '',
        category = '',
        radiusOverride?: number,
      ) => {

        console.log(
          '========================================',
        );

        console.log(
          '🔍 FETCH NEARBY SALONS',
        );

        console.log(
          '📍 Input latitude:',
          latitude,
        );

        console.log(
          '📍 Input longitude:',
          longitude,
        );

        console.log(
          '🔎 Input search:',
          searchText,
        );

        console.log(
          '🏷️ Input category:',
          category,
        );

        console.log(
          '📏 Input radius:',
          radiusOverride,
        );

        console.log(
          '⚙️ USE_HARDCODED_LOCATION:',
          USE_HARDCODED_LOCATION,
        );

        console.log(
          '========================================',
        );


        let finalLatitude:
          number | null = null;

        let finalLongitude:
          number | null = null;


        // ======================================================
        // LOCATION
        // ======================================================

        /*
         * IMPORTANT:
         *
         * Always prefer the coordinates explicitly passed into
         * this function.
         *
         * This is important when the user changes location.
         *
         * USE_HARDCODED_LOCATION is only used as a fallback.
         */

        if (
          latitude != null &&
          longitude != null
        ) {

          finalLatitude =
            Number(latitude);

          finalLongitude =
            Number(longitude);

          console.log(
            '📍 Using PASSED coordinates',
          );

        } else if (
          USE_HARDCODED_LOCATION
        ) {

          const activeLocation =
            await getActiveLocation();

          console.log(
            '📦 Active location:',
            activeLocation,
          );

          if (
            activeLocation &&
            activeLocation.latitude != null &&
            activeLocation.longitude != null
          ) {

            finalLatitude =
              Number(
                activeLocation.latitude,
              );

            finalLongitude =
              Number(
                activeLocation.longitude,
              );

          }

        } else {

          const activeLocation =
            getActiveCoordinates();

          if (
            activeLocation
          ) {

            finalLatitude =
              Number(
                activeLocation.latitude,
              );

            finalLongitude =
              Number(
                activeLocation.longitude,
              );

          }

        }


        console.log(
          '📍 FINAL LATITUDE:',
          finalLatitude,
        );

        console.log(
          '📍 FINAL LONGITUDE:',
          finalLongitude,
        );


        // ======================================================
        // LOCATION VALIDATION
        // ======================================================

        if (
          finalLatitude == null ||
          finalLongitude == null ||
          !Number.isFinite(finalLatitude) ||
          !Number.isFinite(finalLongitude)
        ) {

          console.log(
            '❌ LOCATION NOT AVAILABLE',
          );

          setSalons([]);

          return;

        }


        // ======================================================
        // SEARCH / CATEGORY
        // ======================================================

        const cleanSearch =
          String(
            searchText ?? '',
          ).trim();

        const cleanCategory =
          String(
            category ?? '',
          ).trim();


        /*
         * SEARCH AND CATEGORY ARE MUTUALLY EXCLUSIVE.
         *
         * Example:
         *
         * Salon search:
         * search   = "Lakme"
         * category = null
         *
         * Service:
         * search   = null
         * category = "Hair"
         *
         * Normal nearby:
         * search   = null
         * category = null
         */

        const finalSearch =
          cleanSearch.length > 0
            ? cleanSearch
            : null;

        const finalCategory =
          cleanSearch.length === 0 &&
            cleanCategory.length > 0
            ? cleanCategory
            : null;


        // ======================================================
        // RADIUS
        // ======================================================

        const finalRadius =
          Number(
            radiusOverride ??
            selectedDistance ??
            DEFAULT_LOCATION_RADIUS ??
            10,
          );


        // ======================================================
        // GRAPHQL VARIABLES
        // ======================================================

        const variables = {

          latitude:
            finalLatitude,

          longitude:
            finalLongitude,

          radius:
            finalRadius,

          search:
            finalSearch,

          category:
            finalCategory,

        };


        console.log(
          '🚀 GET_NEARBY_SALONS VARIABLES:',
          JSON.stringify(
            variables,
            null,
            2,
          ),
        );


        try {

          setLoadingSalons(
            true,
          );


          const {
            data,
          } =
            await client.query({

              query:
                GET_NEARBY_SALONS,

              variables,

              fetchPolicy:
                'network-only',

            });


          console.log(
            '📦 GET_NEARBY_SALONS RESPONSE:',
            JSON.stringify(
              data,
              null,
              2,
            ),
          );


          const nearbySalons =
            data?.nearbySalons ?? [];


          console.log(
            '🏪 MATCHING SALONS:',
            nearbySalons.length,
          );


          const formatted:
            Salon[] =
            nearbySalons.map(
              (item: any) => {

                const numericDistance =
                  Number(
                    item?.distance ?? 0,
                  );


                return {

                  id:
                    item?.salonId,

                  salonId:
                    item?.salonId,

                  name:
                    item?.salonName ??
                    'Salon',

                  rating:
                    Number(
                      item?.averageRating ?? 0,
                    ),

                  reviews:
                    Number(
                      item?.totalReviews ?? 0,
                    ),

                  distance:
                    Number.isFinite(
                      numericDistance,
                    )
                      ? numericDistance < 1
                        ? `${Math.round(
                          numericDistance * 1000,
                        )} m`
                        : `${numericDistance.toFixed(
                          1,
                        )} km`
                      : '',

                  distanceValue:
                    numericDistance,

                  address:
                    item?.address ?? {},

                  price:
                    0,

                  image:
                    item?.logoUrl ||
                    'https://picsum.photos/300/300',

                  salonStatus:
                    item?.salonStatus,

                  businessHours:
                    item?.businessHours,

                };

              },
            );


          setSalons(
            formatted,
          );


        } catch (
        error: any
        ) {

          console.log(
            '❌ NEARBY SALONS ERROR:',
            error,
          );

          console.log(
            '❌ ERROR MESSAGE:',
            error?.message,
          );

          console.log(
            '❌ GRAPHQL ERRORS:',
            error?.graphQLErrors,
          );


          setSalons([]);

        } finally {

          setLoadingSalons(
            false,
          );

        }

      },
      [
        client,
        getActiveCoordinates,
        selectedDistance,
      ],
    );


  // ==========================================================
  // INITIAL LOCATION
  // ==========================================================

  const loadLocation =
    useCallback(
      async () => {

        try {

          console.log(
            '📍 Loading active location...',
          );


          // ====================================================
          // SAVED LOCATION
          // ====================================================

          const savedLocation =
            await getActiveLocation();


          if (
            savedLocation &&
            savedLocation.latitude != null &&
            savedLocation.longitude != null
          ) {

            console.log(
              '📍 Using saved location:',
              savedLocation,
            );


            setSelectedLocation(
              savedLocation.address ||
              'Selected location',
            );


            setLocationCoordinates(
              savedLocation,
            );


            await fetchNearbySalons(

              Number(
                savedLocation.latitude,
              ),

              Number(
                savedLocation.longitude,
              ),

              search,

              selectedCategory,

              selectedDistance,

            );


            return;

          }


          // ====================================================
          // DEVICE LOCATION
          // ====================================================

          console.log(
            '📍 No saved location. Getting device location...',
          );


          const currentLocation =
            await getCurrentLocation();


          if (
            !currentLocation
          ) {

            console.log(
              '⚠️ Location unavailable',
            );


            setSelectedLocation(
              'Choose location',
            );

            setLocationCoordinates(
              null,
            );

            setSalons([]);

            return;

          }


          console.log(
            '✅ Device location:',
            currentLocation,
          );


          setSelectedLocation(
            currentLocation.address ||
            'Current location',
          );


          setLocationCoordinates(
            currentLocation,
          );


          await fetchNearbySalons(

            Number(
              currentLocation.latitude,
            ),

            Number(
              currentLocation.longitude,
            ),

            search,

            selectedCategory,

            selectedDistance,

          );


        } catch (
        error
        ) {

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

          setSalons([]);

        }

      },
      [
        fetchNearbySalons,
        search,
        selectedCategory,
        selectedDistance,
      ],
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {

      loadLocation();

    },
    [],
  );


  // ==========================================================
  // BOOKINGS
  // ==========================================================

  useEffect(
    () => {

      if (
        currentUser?.userId
      ) {

        loadCustomerBookings();

      }

    },
    [
      currentUser?.userId,
    ],
  );


  // ==========================================================
  // LOCATION SELECTED
  // ==========================================================

  const handleLocationSelected =
    async (
      location: LocationData,
    ) => {

      console.log(
        '📍 NEW LOCATION SELECTED:',
        location,
      );


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


      /*
       * Immediately search using the NEW coordinates.
       *
       * Do not wait for React state to update.
       */

      await fetchNearbySalons(

        Number(
          location.latitude,
        ),

        Number(
          location.longitude,
        ),

        search,

        selectedCategory,

        selectedDistance,

      );

    };


  // ==========================================================
  // SEARCH CHANGE
  // ==========================================================

  const handleSearchChange =
    (
      text: string,
    ) => {

      setSearch(text);


      /*
       * If user starts salon/service text search,
       * clear category selection.
       */

      if (
        text.trim().length > 0
      ) {

        setSelectedCategory('');

      }

    };


  // ==========================================================
  // SEARCH SUBMIT
  // ==========================================================

  const handleSearchSubmit =
    async () => {

      const cleanSearch =
        search.trim();


      console.log(
        '🔎 SEARCH SUBMITTED:',
        cleanSearch,
      );


      const location =
        getActiveCoordinates();


      if (
        !location
      ) {

        console.log(
          '❌ SEARCH CANNOT RUN: NO LOCATION',
        );


        setShowLocationModal(
          true,
        );

        return;

      }


      if (
        !cleanSearch
      ) {

        /*
         * Empty search means:
         *
         * nearby salons
         */

        setSearch('');
        setSelectedCategory('');


        await fetchNearbySalons(

          Number(
            location.latitude,
          ),

          Number(
            location.longitude,
          ),

          '',

          '',

          selectedDistance,

        );


        return;

      }


      setSelectedCategory('');


      await fetchNearbySalons(

        Number(
          location.latitude,
        ),

        Number(
          location.longitude,
        ),

        cleanSearch,

        '',

        selectedDistance,

      );

    };


  // ==========================================================
  // CATEGORY
  // ==========================================================

  const handleCategorySelect = async (category: string) => {
    console.log('========================================');
    console.log('🏷️ CATEGORY TOGGLE');
    console.log('🏷️ Category:', category);
    console.log('🏷️ Current selected category:', selectedCategory);
    console.log('========================================');

    const location = getActiveCoordinates();

    // Location is required for nearby salon results
    if (
      !location ||
      location.latitude == null ||
      location.longitude == null
    ) {
      console.log(
        '❌ Cannot search category: location unavailable',
      );

      setShowLocationModal(true);
      return;
    }

    const isAlreadySelected =
      selectedCategory.trim().toLowerCase() ===
      category.trim().toLowerCase();

    // ==========================================================
    // TOGGLE OFF
    // ==========================================================

    if (isAlreadySelected) {
      console.log(
        '🔄 Service already selected → UNSELECTING',
      );

      setSelectedCategory('');
      setSearch('');

      await fetchNearbySalons(
        Number(location.latitude),
        Number(location.longitude),
        '',
        '',
        selectedDistance,
      );

      return;
    }

    // ==========================================================
    // SELECT NEW SERVICE
    // ==========================================================

    console.log(
      '✅ Selecting service:',
      category,
    );

    setSelectedCategory(category);
    setSearch('');

    await fetchNearbySalons(
      Number(location.latitude),
      Number(location.longitude),
      '',
      category,
      selectedDistance,
    );
  };


  // ==========================================================
  // FILTER
  // ==========================================================

  const openFilter =
    () => {

      setShowFilterModal(
        true,
      );

    };


  const applyFilters =
    async () => {

      setShowFilterModal(
        false,
      );


      const location =
        getActiveCoordinates();


      if (
        !location
      ) {

        setShowLocationModal(
          true,
        );

        return;

      }


      /*
       * The API currently receives radius.
       *
       * Budget is applied locally below because
       * GET_NEARBY_SALONS currently has no budget variable.
       */

      await fetchNearbySalons(

        Number(
          location.latitude,
        ),

        Number(
          location.longitude,
        ),

        search,

        selectedCategory,

        selectedDistance,

      );

    };


  // ==========================================================
  // CLAVATA
  // ==========================================================

  const askClavata =
    () => {

      setShowFilterModal(
        false,
      );


      navigation.navigate(
        'ClavataMatch',
        {

          service:
            selectedCategory ||
            search.trim(),

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
  // BOOKINGS
  // ==========================================================

  const loadCustomerBookings =
    async () => {

      try {

        const {
          data,
        } =
          await client.query({

            query:
              CUSTOMER_BOOKINGS,

            variables: {

              customerUserId:
                currentUser?.userId,

            },

            fetchPolicy:
              'network-only',

          });


        const customerBookings =
          data?.customerBookings ||
          [];


        setBookings(
          customerBookings,
        );


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


        if (
          booking
        ) {

          setPendingBooking(
            booking,
          );

          setShowReviewPopup(
            true,
          );

        }

      } catch (
      error
      ) {

        console.log(
          '❌ BOOKING LOADING ERROR:',
          error,
        );

      }

    };


  // ==========================================================
  // LOCAL BUDGET FILTER
  // ==========================================================

  /*
   * NOTE:
   *
   * Your current nearbySalons GraphQL response does not return
   * service price.
   *
   * Therefore we DO NOT fake a budget filter here.
   *
   * Once backend returns minimum/service price, this can become
   * a real dynamic budget filter.
   */

  const displayedSalons =
    useMemo(
      () => {

        return salons;

      },
      [
        salons,
        selectedBudget,
      ],
    );


  // ==========================================================
  // FILTER COUNT
  // ==========================================================

  const filterCount =
    useMemo(
      () => {

        let count = 0;


        if (
          selectedBudget.label !==
          'Any'
        ) {

          count++;

        }


        if (
          selectedDistance !==
          10
        ) {

          count++;

        }


        return count;

      },
      [
        selectedBudget,
        selectedDistance,
      ],
    );


  // ==========================================================
  // RESULT TITLE
  // ==========================================================

  const resultTitle =
    useMemo(
      () => {

        if (
          search.trim()
        ) {

          return 'Search results';

        }


        if (
          selectedCategory
        ) {

          return selectedCategory;

        }


        return 'Salons near you';

      },
      [
        search,
        selectedCategory,
      ],
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <FlatList

        data={
          displayedSalons
        }

        keyExtractor={
          item =>
            String(
              item.id,
            )
        }

        renderItem={({
          item,
        }) => (

          <SalonCard
            salon={
              item
            }
          />

        )}

        ListHeaderComponent={
          <>

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
                styles.searchRow
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

                  value={
                    search
                  }

                  onChangeText={
                    handleSearchChange
                  }

                  onSubmitEditing={
                    handleSearchSubmit
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

                  returnKeyType={
                    'search'
                  }

                  enterKeyHint={
                    'search'
                  }

                  autoCorrect={
                    false
                  }

                  autoCapitalize={
                    'none'
                  }

                />

              </View>


              <TouchableOpacity

                style={
                  styles.filterButton
                }

                onPress={
                  openFilter
                }

                activeOpacity={
                  0.8
                }

              >

                <Text
                  style={
                    styles.filterSymbol
                  }
                >
                  ☷
                </Text>


                {filterCount > 0 && (

                  <View
                    style={
                      styles.filterBadge
                    }
                  >

                    <Text
                      style={
                        styles.filterBadgeText
                      }
                    >
                      {filterCount}
                    </Text>

                  </View>

                )}

              </TouchableOpacity>

            </View>


            {/* ==================================================
                QUICK FILTERS
            ================================================== */}

            <View
              style={
                styles.quickFilters
              }
            >

              <TouchableOpacity
                style={
                  styles.quickChip
                }
                onPress={
                  openFilter
                }
              >

                <Text
                  style={
                    styles.quickChipText
                  }
                >
                  ₹ {selectedBudget.label}
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.quickChip
                }
                onPress={
                  openFilter
                }
              >

                <Text
                  style={
                    styles.quickChipText
                  }
                >
                  Within {selectedDistance} km
                </Text>

              </TouchableOpacity>

            </View>


            {/* ==================================================
                SERVICES
            ================================================== */}

            <View
              style={
                styles.sectionHeader
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Choose Services
              </Text>

            </View>


            <ServiceChips

              selectedCategory={
                selectedCategory
              }

              onSelect={
                handleCategorySelect
              }

            />


            {/* ==================================================
                CLAVATA
            ================================================== */}

            <TouchableOpacity

              style={
                styles.clavataCard
              }

              onPress={
                askClavata
              }

              activeOpacity={
                0.9
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
                  Best match for you
                </Text>

              </View>


              <View
                style={
                  styles.clavataArrow
                }
              >

                <Text
                  style={
                    styles.clavataArrowText
                  }
                >
                  →
                </Text>

              </View>

            </TouchableOpacity>


            {/* ==================================================
                RESULTS
            ================================================== */}

            <View
              style={
                styles.resultsHeader
              }
            >

              <View
                style={
                  styles.resultsTitleWrap
                }
              >

                <Text
                  style={
                    styles.resultsTitle
                  }
                >
                  {resultTitle}
                </Text>


                <Text
                  style={
                    styles.resultsSubtitle
                  }
                >
                  {displayedSalons.length} places
                </Text>

              </View>


              <TouchableOpacity

                style={
                  styles.sortButton
                }

                onPress={
                  openFilter
                }

              >

                <Text
                  style={
                    styles.sortText
                  }
                >
                  Filter
                </Text>

              </TouchableOpacity>

            </View>

          </>
        }


        ListEmptyComponent={

          loadingSalons ? (

            <View
              style={
                styles.loadingContainer
              }
            >

              <ActivityIndicator

                size="small"

                color={
                  COLORS.black
                }

              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Finding nearby salons
              </Text>

            </View>

          ) : (

            <View
              style={
                styles.emptyContainer
              }
            >

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No salons near by
              </Text>


              <Text
                style={
                  styles.emptyText
                }
              >
                Try a wider search area
              </Text>


              <TouchableOpacity

                style={
                  styles.emptyButton
                }

                onPress={
                  openFilter
                }

              >

                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Adjust search
                </Text>

              </TouchableOpacity>

            </View>

          )
        }


        contentContainerStyle={
          styles.listContent
        }

        showsVerticalScrollIndicator={
          false
        }

      />


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


      {/* ======================================================
          FILTER SHEET
      ====================================================== */}

      <Modal

        visible={
          showFilterModal
        }

        transparent

        animationType={
          'slide'
        }

        onRequestClose={() =>
          setShowFilterModal(
            false,
          )
        }

      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <Pressable

            style={
              styles.modalDismiss
            }

            onPress={() =>
              setShowFilterModal(
                false,
              )
            }

          />


          <View
            style={
              styles.filterSheet
            }
          >

            <View
              style={
                styles.sheetHandle
              }
            />


            {/* HEADER */}

            <View
              style={
                styles.sheetHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.sheetTitle
                  }
                >
                  Filters
                </Text>

                <Text
                  style={
                    styles.sheetSubtitle
                  }
                >
                  Refine your search
                </Text>

              </View>


              <TouchableOpacity

                style={
                  styles.closeButton
                }

                onPress={() =>
                  setShowFilterModal(
                    false,
                  )
                }

              >

                <Text
                  style={
                    styles.closeButtonText
                  }
                >
                  ×
                </Text>

              </TouchableOpacity>

            </View>


            {/* SERVICE */}

            <Text
              style={
                styles.filterLabel
              }
            >
              SERVICE
            </Text>


            <TouchableOpacity

              style={
                styles.filterField
              }

              onPress={() => {

                setShowFilterModal(
                  false,
                );

              }}

            >

              <View>

                <Text
                  style={
                    styles.filterFieldValue
                  }
                  numberOfLines={
                    1
                  }
                >
                  {
                    selectedCategory ||
                    search ||
                    'Any service'
                  }
                </Text>

                <Text
                  style={
                    styles.filterFieldHint
                  }
                >
                  Search or choose a service above
                </Text>

              </View>


              <Text
                style={
                  styles.fieldArrow
                }
              >
                →
              </Text>

            </TouchableOpacity>


            {/* LOCATION */}

            <Text
              style={
                styles.filterLabel
              }
            >
              LOCATION
            </Text>


            <TouchableOpacity

              style={
                styles.filterField
              }

              onPress={() => {

                setShowFilterModal(
                  false,
                );

                setShowLocationModal(
                  true,
                );

              }}

            >

              <View
                style={
                  styles.locationField
                }
              >

                <View
                  style={
                    styles.locationDot
                  }
                />

                <View
                  style={
                    styles.locationValueWrap
                  }
                >

                  <Text
                    style={
                      styles.filterFieldValue
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {selectedLocation}
                  </Text>

                  <Text
                    style={
                      styles.filterFieldHint
                    }
                  >
                    Search around this location
                  </Text>

                </View>

              </View>


              <Text
                style={
                  styles.fieldArrow
                }
              >
                →
              </Text>

            </TouchableOpacity>


            {/* BUDGET */}

            <View
              style={
                styles.labelRow
              }
            >

              <Text
                style={
                  styles.filterLabel
                }
              >
                BUDGET
              </Text>

              <Text
                style={
                  styles.selectedValue
                }
              >
                {selectedBudget.label}
              </Text>

            </View>


            <View
              style={
                styles.budgetGrid
              }
            >

              {BUDGET_OPTIONS.map(
                option => {

                  const isSelected =
                    selectedBudget.label ===
                    option.label;


                  return (

                    <TouchableOpacity

                      key={
                        option.label
                      }

                      style={[
                        styles.budgetOption,
                        isSelected &&
                        styles.budgetOptionSelected,
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
                          styles.budgetOptionText,
                          isSelected &&
                          styles.budgetOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>

                    </TouchableOpacity>

                  );

                },
              )}

            </View>


            {/* DISTANCE */}

            <View
              style={
                styles.labelRowDistance
              }
            >

              <Text
                style={
                  styles.filterLabel
                }
              >
                DISTANCE
              </Text>

              <Text
                style={
                  styles.selectedValue
                }
              >
                {selectedDistance} km
              </Text>

            </View>


            <View
              style={
                styles.distanceRow
              }
            >

              {DISTANCE_OPTIONS.map(
                distance => {

                  const isSelected =
                    selectedDistance ===
                    distance;


                  return (

                    <TouchableOpacity

                      key={
                        distance
                      }

                      style={[
                        styles.distanceOption,
                        isSelected &&
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
                          isSelected &&
                          styles.distanceNumberSelected,
                        ]}
                      >
                        {distance}
                      </Text>

                      <Text
                        style={[
                          styles.distanceUnit,
                          isSelected &&
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


            {/* ACTION */}

            <TouchableOpacity

              style={
                styles.findButton
              }

              onPress={
                applyFilters
              }

              activeOpacity={
                0.85
              }

            >

              <Text
                style={
                  styles.findButtonText
                }
              >
                Show salons
              </Text>

              <Text
                style={
                  styles.findButtonArrow
                }
              >
                →
              </Text>

            </TouchableOpacity>


            {/* CLAVATA */}

            <TouchableOpacity

              style={
                styles.clavataLink
              }

              onPress={
                askClavata
              }

              activeOpacity={
                0.8
              }

            >

              <Text
                style={
                  styles.clavataLinkText
                }
              >
                ✦  Let Clavata decide
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

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

    listContent: {
      paddingBottom:
        40,
    },

    searchRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginHorizontal:
        SPACING.xl,
      marginTop:
        8,
      marginBottom:
        12,
      gap:
        10,
    },

    searchBox: {
      flex: 1,
      height: 54,
      backgroundColor:
        COLORS.white,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        '#E3E3E3',
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal:
        15,
    },

    searchSymbol: {
      fontSize: 25,
      color:
        COLORS.black,
      fontWeight:
        '300',
      marginRight: 8,
    },

    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 15,
      color:
        COLORS.black,
      paddingVertical: 0,
    },

    filterButton: {
      width: 54,
      height: 54,
      borderRadius: 14,
      backgroundColor:
        COLORS.black,
      alignItems:
        'center',
      justifyContent:
        'center',
      position:
        'relative',
    },

    filterSymbol: {
      color:
        COLORS.white,
      fontSize: 22,
      fontWeight:
        '400',
    },

    filterBadge: {
      position:
        'absolute',
      right: -2,
      top: -4,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor:
        COLORS.white,
      borderWidth: 2,
      borderColor:
        COLORS.black,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    filterBadgeText: {
      fontSize: 9,
      color:
        COLORS.black,
      fontWeight:
        '800',
    },

    quickFilters: {
      flexDirection:
        'row',
      marginHorizontal:
        SPACING.xl,
      marginBottom:
        22,
      gap: 8,
    },

    quickChip: {
      height: 34,
      paddingHorizontal: 13,
      borderRadius: 17,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        '#E4E4E4',
      justifyContent:
        'center',
    },

    quickChipText: {
      fontSize: 12,
      color:
        '#333333',
      fontWeight:
        '600',
    },

    sectionHeader: {
      marginHorizontal:
        SPACING.xl,
      marginBottom:
        12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    sectionTitle: {
      fontSize: 21,
      color:
        COLORS.black,
      fontWeight:
        '700',
      letterSpacing:
        -0.4,
    },

    clavataCard: {
      marginHorizontal:
        SPACING.xl,
      marginTop:
        20,
      marginBottom:
        20,
      minHeight:
        72,
      borderRadius:
        18,
      backgroundColor:
        COLORS.black,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal:
        14,
    },

    clavataBody: {
      flex: 1,
    },

    clavataTitle: {
      fontSize: 15,
      color:
        COLORS.white,
      fontWeight:
        '700',
    },

    clavataText: {
      marginTop: 3,
      fontSize: 12,
      color:
        '#BEBEBE',
      fontWeight:
        '400',
    },

    clavataArrow: {
      width: 36,
      height: 36,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    clavataArrowText: {
      fontSize: 21,
      color:
        COLORS.white,
      fontWeight:
        '300',
    },

    resultsHeader: {
      marginHorizontal:
        SPACING.xl,
      marginTop: 24,
      marginBottom: 14,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    resultsTitleWrap: {
      flex: 1,
    },

    resultsTitle: {
      fontSize: 21,
      color:
        COLORS.black,
      fontWeight:
        '700',
      letterSpacing:
        -0.3,
    },

    resultsSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color:
        COLORS.textMuted,
      fontWeight:
        '500',
    },

    sortButton: {
      height: 34,
      paddingHorizontal: 13,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        '#DDDDDD',
      backgroundColor:
        COLORS.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    sortText: {
      fontSize: 12,
      color:
        COLORS.black,
      fontWeight:
        '600',
    },

    loadingContainer: {
      marginTop: 45,
      alignItems:
        'center',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color:
        COLORS.textSecondary,
      fontWeight:
        '500',
    },

    emptyContainer: {
      marginTop: 45,
      marginHorizontal: 30,
      alignItems:
        'center',
    },

    emptyTitle: {
      marginTop: 16,
      fontSize: 18,
      color:
        COLORS.black,
      fontWeight:
        '700',
    },

    emptyText: {
      marginTop: 5,
      fontSize: 13,
      color:
        COLORS.textSecondary,
    },

    emptyButton: {
      marginTop: 18,
      height: 44,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor:
        COLORS.black,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    emptyButtonText: {
      color:
        COLORS.white,
      fontSize: 13,
      fontWeight:
        '600',
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.48)',
      justifyContent:
        'flex-end',
    },

    modalDismiss: {
      flex: 1,
    },

    filterSheet: {
      backgroundColor:
        COLORS.white,
      borderTopLeftRadius:
        28,
      borderTopRightRadius:
        28,
      paddingHorizontal:
        22,
      paddingTop:
        10,
      paddingBottom:
        22,
      maxHeight:
        '88%',
    },

    sheetHandle: {
      width: 38,
      height: 4,
      borderRadius: 4,
      backgroundColor:
        '#D4D4D4',
      alignSelf:
        'center',
      marginBottom:
        18,
    },

    sheetHeader: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      marginBottom:
        12,
    },

    sheetTitle: {
      fontSize: 27,
      color:
        COLORS.black,
      fontWeight:
        '700',
      letterSpacing:
        -0.7,
    },

    sheetSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color:
        COLORS.textSecondary,
      fontWeight:
        '400',
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor:
        '#F4F4F4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    closeButtonText: {
      fontSize: 24,
      color:
        COLORS.black,
      fontWeight:
        '300',
      marginTop: -2,
    },

    filterLabel: {
      fontSize: 10,
      color:
        '#8A8A8A',
      fontWeight:
        '700',
      letterSpacing:
        1.1,
      marginTop: 14,
      marginBottom: 7,
    },

    filterField: {
      minHeight: 56,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        '#E5E5E5',
      backgroundColor:
        '#FAFAFA',
      paddingHorizontal: 14,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    filterFieldValue: {
      maxWidth:
        '90%',
      fontSize: 14,
      color:
        COLORS.black,
      fontWeight:
        '600',
    },

    filterFieldHint: {
      marginTop: 2,
      fontSize: 10,
      color:
        COLORS.textMuted,
      fontWeight:
        '400',
    },

    fieldArrow: {
      fontSize: 20,
      color:
        COLORS.black,
      fontWeight:
        '300',
    },

    locationField: {
      flexDirection:
        'row',
      alignItems:
        'center',
      flex: 1,
    },

    locationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor:
        COLORS.black,
      marginRight: 12,
    },

    locationValueWrap: {
      flex: 1,
    },

    labelRow: {
      marginTop: 13,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    selectedValue: {
      fontSize: 12,
      color:
        COLORS.black,
      fontWeight:
        '600',
      marginTop: 14,
    },

    budgetGrid: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap: 7,
      marginTop: 1,
    },

    budgetOption: {
      paddingHorizontal: 13,
      height: 39,
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
        COLORS.black,
      borderColor:
        COLORS.black,
    },

    budgetOptionText: {
      fontSize: 11,
      color:
        '#333333',
      fontWeight:
        '600',
    },

    budgetOptionTextSelected: {
      color:
        COLORS.white,
    },

    labelRowDistance: {
      marginTop: 10,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    distanceRow: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      marginTop: 2,
    },

    distanceOption: {
      width: 52,
      height: 46,
      borderRadius: 12,
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
        COLORS.black,
      borderColor:
        COLORS.black,
    },

    distanceNumber: {
      fontSize: 14,
      color:
        COLORS.black,
      fontWeight:
        '700',
      lineHeight: 16,
    },

    distanceNumberSelected: {
      color:
        COLORS.white,
    },

    distanceUnit: {
      fontSize: 9,
      color:
        COLORS.textMuted,
      fontWeight:
        '500',
    },

    distanceUnitSelected: {
      color:
        '#CFCFCF',
    },

    findButton: {
      height: 54,
      borderRadius: 14,
      backgroundColor:
        COLORS.black,
      marginTop: 18,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    findButtonText: {
      color:
        COLORS.white,
      fontSize: 14,
      fontWeight:
        '700',
    },

    findButtonArrow: {
      color:
        COLORS.white,
      fontSize: 20,
      marginLeft: 8,
      fontWeight:
        '300',
    },

    clavataLink: {
      height: 40,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginTop: 3,
    },

    clavataLinkText: {
      color:
        COLORS.black,
      fontSize: 12,
      fontWeight:
        '600',
    },

  });