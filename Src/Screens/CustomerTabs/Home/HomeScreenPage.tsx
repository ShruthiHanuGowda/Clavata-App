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
} from '../../../constants/locationConfig';
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
type SalonStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'TEMPORARILY_CLOSED';
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
export type NearbySalonService = {
  serviceId: string;
  name: string;
  category: string;
  categoryId?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  audience?: ServiceAudience;
  price: number;
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
  price?: number;
  image: string;
  salonStatus?: SalonStatus;
  businessHours?: any;
  minServicePrice?: number;
  matchingServices?: NearbySalonService[];
};
// ============================================================
// SERVICE SELECTION
// ============================================================
type ServiceSelection = {
  categoryId: string;
  category: string;
  subcategoryIds: string[];
};
// ============================================================
// AUDIENCE OPTIONS
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
  // ==========================================================
  // AUDIENCE
  //
  // CUSTOMER CAN SELECT:
  // Female
  // Male
  // Kids
  //
  // Multiple selections are allowed.
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
  // TOGGLE AUDIENCE
  // ==========================================================
  const toggleAudience =
    useCallback(
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
      },
      [],
    );
  // ==========================================================
  // AUDIENCE LABEL
  // ==========================================================
  const audienceLabel =
    useMemo(
      () => {
        if (
          selectedAudiences.length === 0
        ) {
          return 'Choose audience';
        }
        if (
          selectedAudiences.length === 1
        ) {
          const selected =
            AUDIENCE_OPTIONS.find(
              option =>
                option.value ===
                selectedAudiences[0],
            );
          return (
            selected?.label ||
            'Choose audience'
          );
        }
        return `${selectedAudiences.length} audience`;
      },
      [
        selectedAudiences,
      ],
    );
  // ==========================================================
  // GET ACTIVE COORDINATES
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
  // RESOLVE LOCATION
  // ==========================================================
  const resolveSearchLocation =
    useCallback(
      async (): Promise<LocationData | null> => {
        if (
          locationCoordinates &&
          locationCoordinates.latitude != null &&
          locationCoordinates.longitude != null
        ) {
          return locationCoordinates;
        }
        const activeLocation =
          await getActiveLocation();
        if (
          activeLocation &&
          activeLocation.latitude != null &&
          activeLocation.longitude != null
        ) {
          setLocationCoordinates(
            activeLocation,
          );
          if (
            activeLocation.address
          ) {
            setSelectedLocation(
              activeLocation.address,
            );
          }
          return activeLocation;
        }
        if (
          !USE_HARDCODED_LOCATION
        ) {
          const currentLocation =
            await getCurrentLocation();
          if (
            currentLocation &&
            currentLocation.latitude != null &&
            currentLocation.longitude != null
          ) {
            setLocationCoordinates(
              currentLocation,
            );
            if (
              currentLocation.address
            ) {
              setSelectedLocation(
                currentLocation.address,
              );
            }
            return currentLocation;
          }
        }
        return null;
      },
      [
        locationCoordinates,
      ],
    );
  // ==========================================================
  // FETCH NEARBY SALONS
  // ==========================================================
 const fetchNearbySalons =
  useCallback(
    async (
      latitude?: number,
      longitude?: number,
      searchText = '',
      categoryId = '',
      subcategoryIds: string[] = [],
      radiusOverride?: number,
      audiencesOverride?: ServiceAudience[],
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
        '🏷️ Input categoryId:',
        categoryId,
      );
      console.log(
        '🏷️ Input subcategoryIds:',
        subcategoryIds,
      );
      console.log(
        '👥 Input audience:',
        audiencesOverride,
      );
      console.log(
        '📏 Input radius:',
        radiusOverride,
      );
      console.log(
        '💰 CURRENT BUDGET:',
        selectedBudget.label,
      );
      console.log(
        '========================================',
      );
      // ======================================================
      // LOCATION
      // ======================================================
      let finalLatitude: number | null = null;
      let finalLongitude: number | null = null;
      if (
        latitude != null &&
        longitude != null
      ) {
        finalLatitude = Number(latitude);
        finalLongitude = Number(longitude);
      } else if (
        USE_HARDCODED_LOCATION
      ) {
        const activeLocation =
          await getActiveLocation();
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
          setLocationCoordinates(
            activeLocation,
          );
          if (
            activeLocation.address
          ) {
            setSelectedLocation(
              activeLocation.address,
            );
          }
        }
      } else {
        const activeLocation =
          getActiveCoordinates();
        if (activeLocation) {
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
      // ======================================================
      // LOCATION VALIDATION
      // ======================================================
      if (
        finalLatitude == null ||
        finalLongitude == null ||
        !Number.isFinite(
          finalLatitude,
        ) ||
        !Number.isFinite(
          finalLongitude,
        )
      ) {
        console.log(
          '❌ LOCATION NOT AVAILABLE',
        );
        setSalons([]);
        return;
      }
      // ======================================================
      // NORMALIZE SEARCH
      // ======================================================
      const cleanSearch =
        String(
          searchText ?? '',
        ).trim();
      // ======================================================
      // NORMALIZE CATEGORY
      // ======================================================
      const cleanCategoryId =
        String(
          categoryId ?? '',
        ).trim();
      // ======================================================
      // NORMALIZE SUBCATEGORIES
      // ======================================================
      const cleanSubcategoryIds =
        Array.isArray(
          subcategoryIds,
        )
          ? subcategoryIds
              .map(
                id =>
                  String(
                    id ?? '',
                  ).trim(),
              )
              .filter(Boolean)
          : [];
      const uniqueSubcategoryIds =
        Array.from(
          new Set(
            cleanSubcategoryIds,
          ),
        );
      // ======================================================
      // NORMALIZE AUDIENCES
      // ======================================================
      const rawAudiences =
        Array.isArray(
          audiencesOverride,
        )
          ? audiencesOverride
          : selectedAudiences;
      const uniqueAudiences =
        Array.from(
          new Set(
            rawAudiences.filter(
              audience =>
                audience === 'FEMALE' ||
                audience === 'MALE' ||
                audience === 'KIDS',
            ),
          ),
        );
      console.log(
        '👥 AUDIENCE TO QUERY:',
        uniqueAudiences,
      );
      // ======================================================
      // SEARCH / CATEGORY
      // ======================================================
      const finalSearch =
        cleanSearch.length > 0
          ? cleanSearch
          : null;
      const finalCategoryId =
        cleanSearch.length === 0 &&
        cleanCategoryId.length > 0
          ? cleanCategoryId
          : null;
      const finalSubcategoryIds =
        cleanSearch.length === 0 &&
        uniqueSubcategoryIds.length > 0
          ? uniqueSubcategoryIds
          : null;
      // ======================================================
      // PRICE FILTER
      // ======================================================
      const applyPriceFilter =
        cleanSearch.length === 0 &&
        cleanCategoryId.length > 0 &&
        selectedBudget.label !== 'Any';
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
      //
      // IMPORTANT:
      //
      // Schema:
      //
      // audience: [ServiceAudience!]
      //
      // Therefore we send the ENTIRE array in ONE request.
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
        audience:
          uniqueAudiences.length > 0
            ? uniqueAudiences
            : null,
        categoryId:
          finalCategoryId,
        subcategoryIds:
          finalSubcategoryIds,
        minPrice:
          applyPriceFilter
            ? selectedBudget.min
            : null,
        maxPrice:
          applyPriceFilter &&
          selectedBudget.max !== Infinity
            ? selectedBudget.max
            : null,
      };
      console.log(
        '🌐 GRAPHQL VARIABLES:',
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
        // ====================================================
        // ONE GRAPHQL REQUEST
        // ====================================================
        const response =
          await client.query({
            query:
              GET_NEARBY_SALONS,
            variables,
            fetchPolicy:
              'network-only',
          });
        // ====================================================
        // EXTRACT RESULTS
        // ====================================================
        const nearbySalons =
          response?.data
            ?.nearbySalons ?? [];
        console.log(
          '🏪 MATCHING SALONS:',
          nearbySalons.length,
        );
        // ====================================================
        // FORMAT SALONS
        // ====================================================
        const formatted: Salon[] =
          nearbySalons.map(
            (item: any) => {
              const numericDistance =
                Number(
                  item?.distance ?? 0,
                );
              // ==============================================
              // MATCHING SERVICES
              // ==============================================
              const matchingServices:
                NearbySalonService[] =
                Array.isArray(
                  item?.matchingServices,
                )
                  ? item.matchingServices
                      .map(
                        (
                          service: any,
                        ) => ({
                          serviceId:
                            String(
                              service?.serviceId ??
                                '',
                            ),
                          name:
                            service?.name ??
                            '',
                          category:
                            service?.category ??
                            service?.categoryName ??
                            '',
                          categoryId:
                            service?.categoryId ??
                            undefined,
                          subcategoryId:
                            service?.subcategoryId ??
                            undefined,
                          subcategoryName:
                            service?.subcategoryName ??
                            undefined,
                          audience:
                            service?.audience ??
                            undefined,
                          price:
                            Number(
                              service?.price,
                            ),
                        }),
                      )
                      .filter(
                        (
                          service:
                            NearbySalonService,
                        ) =>
                          service.serviceId &&
                          Number.isFinite(
                            service.price,
                          ) &&
                          service.price >= 0,
                      )
                  : [];
              // ==============================================
              // SERVICE PRICES
              // ==============================================
              const servicePrices =
                matchingServices
                  .map(
                    service =>
                      Number(
                        service.price,
                      ),
                  )
                  .filter(
                    price =>
                      Number.isFinite(
                        price,
                      ) &&
                      price >= 0,
                  );
              // ==============================================
              // BACKEND PRICE CANDIDATES
              // ==============================================
              const backendPriceCandidates =
                [
                  item?.minServicePrice,
                  item?.price,
                  item?.servicePrice,
                  item?.startingPrice,
                  item?.minimumPrice,
                ];
              const validBackendPrices =
                backendPriceCandidates
                  .map(
                    value =>
                      Number(value),
                  )
                  .filter(
                    value =>
                      Number.isFinite(
                        value,
                      ) &&
                      value >= 0,
                  );
              // ==============================================
              // FINAL MINIMUM PRICE
              // ==============================================
              let minServicePrice:
                number | undefined;
              if (
                servicePrices.length > 0
              ) {
                minServicePrice =
                  Math.min(
                    ...servicePrices,
                  );
              } else if (
                validBackendPrices.length > 0
              ) {
                minServicePrice =
                  Math.min(
                    ...validBackendPrices,
                  );
              } else {
                minServicePrice =
                  undefined;
              }
              return {
                id:
                  String(
                    item?.salonId ??
                      '',
                  ),
                salonId:
                  String(
                    item?.salonId ??
                      '',
                  ),
                name:
                  item?.salonName ??
                  'Salon',
                rating:
                  Number(
                    item?.averageRating ??
                      0,
                  ),
                reviews:
                  Number(
                    item?.totalReviews ??
                      0,
                  ),
                distance:
                  Number.isFinite(
                    numericDistance,
                  )
                    ? numericDistance < 1
                      ? `${Math.round(
                          numericDistance *
                            1000,
                        )} m`
                      : `${numericDistance.toFixed(
                          1,
                        )} km`
                    : '',
                distanceValue:
                  numericDistance,
                address:
                  item?.address ??
                  {},
                price:
                  minServicePrice,
                minServicePrice:
                  minServicePrice,
                matchingServices:
                  matchingServices,
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
        // ====================================================
        // DEBUG MATCHING SERVICES
        // ====================================================
        console.log(
          '🔎 FINAL MATCHING SERVICES:',
          JSON.stringify(
            formatted.map(
              salon => ({
                salonId:
                  salon.salonId,
                salonName:
                  salon.name,
                matchingServices:
                  salon.matchingServices?.map(
                    service => ({
                      serviceId:
                        service.serviceId,
                      name:
                        service.name,
                      category:
                        service.category,
                      subcategoryName:
                        service.subcategoryName,
                      audience:
                        service.audience,
                      price:
                        service.price,
                    }),
                  ),
              }),
            ),
            null,
            2,
          ),
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
      selectedAudiences,
      selectedDistance,
      selectedBudget.label,
      selectedBudget.min,
      selectedBudget.max,
    ],
  );
  // ==========================================================
  // INITIAL LOCATION
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
            await fetchNearbySalons(
              Number(
                savedLocation.latitude,
              ),
              Number(
                savedLocation.longitude,
              ),
              search,
              selectedCategoryId,
              selectedSubcategoryIds,
              selectedDistance,
              selectedAudiences,
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
              setLocationCoordinates(
                activeLocation,
              );
              setSelectedLocation(
                activeLocation.address ||
                'Selected location',
              );
              await fetchNearbySalons(
                Number(
                  activeLocation.latitude,
                ),
                Number(
                  activeLocation.longitude,
                ),
                search,
                selectedCategoryId,
                selectedSubcategoryIds,
                selectedDistance,
                selectedAudiences,
              );
              return;
            }
          }
          const currentLocation =
            await getCurrentLocation();
          if (
            !currentLocation
          ) {
            setSelectedLocation(
              'Choose location',
            );
            setLocationCoordinates(
              null,
            );
            setSalons([]);
            return;
          }
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
            selectedCategoryId,
            selectedSubcategoryIds,
            selectedDistance,
            selectedAudiences,
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
        selectedCategoryId,
        selectedSubcategoryIds,
        selectedDistance,
        selectedAudiences,
      ],
    );
  // ==========================================================
  // INITIAL LOAD
  // ==========================================================
  useEffect(
    () => {
      loadLocation();
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await fetchNearbySalons(
        Number(
          location.latitude,
        ),
        Number(
          location.longitude,
        ),
        search,
        selectedCategoryId,
        selectedSubcategoryIds,
        selectedDistance,
        selectedAudiences,
      );
    };
  // ==========================================================
  // AUDIENCE CHANGE
  // ==========================================================
  const handleAudienceChange =
    async (
      audience: ServiceAudience,
    ) => {
      const location =
        await resolveSearchLocation();
      if (
        !location ||
        location.latitude == null ||
        location.longitude == null
      ) {
        setShowLocationModal(
          true,
        );
        return;
      }
      const alreadySelected =
        selectedAudiences.includes(
          audience,
        );
      const nextAudiences =
        alreadySelected
          ? selectedAudiences.filter(
            item =>
              item !== audience,
          )
          : [
            ...selectedAudiences,
            audience,
          ];
      setSelectedAudiences(
        nextAudiences,
      );
      await fetchNearbySalons(
        Number(
          location.latitude,
        ),
        Number(
          location.longitude,
        ),
        search,
        selectedCategoryId,
        selectedSubcategoryIds,
        selectedDistance,
        nextAudiences,
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
      if (
        text.trim().length > 0
      ) {
        setSelectedCategoryId('');
        setSelectedCategory('');
        setSelectedSubcategoryIds([]);
        setSelectedBudget(
          BUDGET_OPTIONS[0],
        );
      }
    };
  // ==========================================================
  // SEARCH SUBMIT
  // ==========================================================
  const handleSearchSubmit =
    async () => {
      const cleanSearch =
        search.trim();
      const location =
        await resolveSearchLocation();
      if (
        !location
      ) {
        setShowLocationModal(
          true,
        );
        return;
      }
      // ======================================================
      // CLEAR SEARCH
      // ======================================================
      if (
        !cleanSearch
      ) {
        setSearch('');
        setSelectedCategoryId('');
        setSelectedCategory('');
        setSelectedSubcategoryIds([]);
        setSelectedBudget(
          BUDGET_OPTIONS[0],
        );
        await fetchNearbySalons(
          Number(
            location.latitude,
          ),
          Number(
            location.longitude,
          ),
          '',
          '',
          [],
          selectedDistance,
          selectedAudiences,
        );
        return;
      }
      // ======================================================
      // SEARCH MODE
      // ======================================================
      setSelectedCategoryId('');
      setSelectedCategory('');
      setSelectedSubcategoryIds([]);
      setSelectedBudget(
        BUDGET_OPTIONS[0],
      );
      await fetchNearbySalons(
        Number(
          location.latitude,
        ),
        Number(
          location.longitude,
        ),
        cleanSearch,
        '',
        [],
        selectedDistance,
        selectedAudiences,
      );
    };
  // ==========================================================
  // CATEGORY / SUBCATEGORY SELECTION
  // ==========================================================
  const handleServiceSelection =
    async (
      selection: ServiceSelection,
    ) => {
      const {
        categoryId,
        category,
        subcategoryIds,
      } = selection;
      const location =
        await resolveSearchLocation();
      if (
        !location ||
        location.latitude == null ||
        location.longitude == null
      ) {
        setShowLocationModal(
          true,
        );
        return;
      }
      const normalizedCategoryId =
        String(
          categoryId ?? '',
        ).trim();
      const normalizedCategory =
        String(
          category ?? '',
        ).trim();
      const normalizedSubcategoryIds =
        Array.isArray(
          subcategoryIds,
        )
          ? Array.from(
            new Set(
              subcategoryIds
                .map(
                  id =>
                    String(
                      id ?? '',
                    ).trim(),
                )
                .filter(Boolean),
            ),
          )
          : [];
      // ========================================================
      // CLEAR SAME CATEGORY
      // ========================================================
      if (
        normalizedCategoryId &&
        normalizedCategoryId ===
        selectedCategoryId &&
        normalizedSubcategoryIds.length === 0 &&
        selectedSubcategoryIds.length === 0
      ) {
        setSelectedCategoryId('');
        setSelectedCategory('');
        setSelectedSubcategoryIds([]);
        setSearch('');
        setSelectedBudget(
          BUDGET_OPTIONS[0],
        );
        await fetchNearbySalons(
          Number(
            location.latitude,
          ),
          Number(
            location.longitude,
          ),
          '',
          '',
          [],
          selectedDistance,
          selectedAudiences,
        );
        return;
      }
      // ========================================================
      // CLEAR EVERYTHING
      // ========================================================
      if (
        !normalizedCategoryId
      ) {
        setSelectedCategoryId('');
        setSelectedCategory('');
        setSelectedSubcategoryIds([]);
        setSearch('');
        setSelectedBudget(
          BUDGET_OPTIONS[0],
        );
        await fetchNearbySalons(
          Number(
            location.latitude,
          ),
          Number(
            location.longitude,
          ),
          '',
          '',
          [],
          selectedDistance,
          selectedAudiences,
        );
        return;
      }
      // ========================================================
      // SAVE CATEGORY
      // ========================================================
      setSelectedCategoryId(
        normalizedCategoryId,
      );
      setSelectedCategory(
        normalizedCategory,
      );
      setSelectedSubcategoryIds(
        normalizedSubcategoryIds,
      );
      setSearch('');
      // ========================================================
      // FETCH WITH AUDIENCE
      // ========================================================
      await fetchNearbySalons(
        Number(
          location.latitude,
        ),
        Number(
          location.longitude,
        ),
        '',
        normalizedCategoryId,
        normalizedSubcategoryIds,
        selectedDistance,
        selectedAudiences,
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
      const hasService =
        selectedCategoryId.trim().length > 0;
      if (
        selectedBudget.label !== 'Any' &&
        !hasService
      ) {
        Alert.alert(
          'Choose a service',
          'Please choose a service first to apply the budget filter.',
        );
        return;
      }
      const location =
        await resolveSearchLocation();
      if (
        !location
      ) {
        setShowLocationModal(
          true,
        );
        return;
      }
      setShowFilterModal(
        false,
      );
      await fetchNearbySalons(
        Number(
          location.latitude,
        ),
        Number(
          location.longitude,
        ),
        search,
        selectedCategoryId,
        selectedSubcategoryIds,
        selectedDistance,
        selectedAudiences,
      );
    };
  // ==========================================================
  // CLAVATA MATCH
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
            selectedCategory.trim() ||
            undefined,
          categoryId:
            selectedCategoryId.trim() ||
            undefined,
          subcategoryIds:
            selectedSubcategoryIds.length > 0
              ? selectedSubcategoryIds
              : undefined,
          audience:
            selectedAudiences.length > 0
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
  // GET SALON PRICE
  // ==========================================================
  const getSalonBudgetPrice =
    useCallback(
      (
        salon: Salon,
      ): number | undefined => {
        const selectedSubcategorySet =
          new Set(
            selectedSubcategoryIds,
          );
        const matchingServices =
          Array.isArray(
            salon.matchingServices,
          )
            ? salon.matchingServices
            : [];
        // ======================================================
        // ONLY SELECTED AUDIENCE SERVICES
        // ======================================================
        const audienceFilteredServices =
          selectedAudiences.length > 0
            ? matchingServices.filter(
              service =>
                !!service.audience &&
                selectedAudiences.includes(
                  service.audience,
                ),
            )
            : matchingServices;
        // ======================================================
        // SUBCATEGORY FILTER
        // ======================================================
        const relevantServices =
          selectedSubcategorySet.size > 0
            ? audienceFilteredServices.filter(
              service =>
                !!service.subcategoryId &&
                selectedSubcategorySet.has(
                  String(
                    service.subcategoryId,
                  ),
                ),
            )
            : audienceFilteredServices;
        const servicePrices =
          relevantServices
            .map(
              service =>
                Number(
                  service?.price,
                ),
            )
            .filter(
              price =>
                Number.isFinite(
                  price,
                ) &&
                price >= 0,
            );
        if (
          servicePrices.length > 0
        ) {
          return Math.min(
            ...servicePrices,
          );
        }
        const minServicePrice =
          Number(
            salon.minServicePrice,
          );
        if (
          Number.isFinite(
            minServicePrice,
          ) &&
          minServicePrice >= 0
        ) {
          return minServicePrice;
        }
        const price =
          Number(
            salon.price,
          );
        if (
          Number.isFinite(
            price,
          ) &&
          price >= 0
        ) {
          return price;
        }
        return undefined;
      },
      [
        selectedSubcategoryIds,
        selectedAudiences,
      ],
    );
  // ==========================================================
  // LOCAL BUDGET FILTER
  // ==========================================================
  const displayedSalons =
    useMemo(
      () => {
        if (
          selectedCategoryId.trim().length === 0
        ) {
          return salons;
        }
        if (
          selectedBudget.label === 'Any'
        ) {
          return salons;
        }
        return salons.filter(
          salon => {
            const price =
              getSalonBudgetPrice(
                salon,
              );
            if (
              price === undefined
            ) {
              return false;
            }
            return (
              price >=
              selectedBudget.min &&
              price <=
              selectedBudget.max
            );
          },
        );
      },
      [
        salons,
        selectedBudget,
        selectedCategoryId,
        selectedSubcategoryIds,
        selectedAudiences,
        getSalonBudgetPrice,
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
          selectedAudiences.length > 0
        ) {
          count++;
        }
        if (
          selectedCategoryId.trim().length > 0 &&
          selectedBudget.label !== 'Any'
        ) {
          count++;
        }
        const defaultRadius =
          DEFAULT_LOCATION_RADIUS ||
          10;
        if (
          selectedDistance !==
          defaultRadius
        ) {
          count++;
        }
        return count;
      },
      [
        selectedAudiences,
        selectedBudget,
        selectedCategoryId,
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
                AUDIENCE
            ================================================== */}
            <View
              style={
                styles.audienceSection
              }
            >
              <Text
                style={
                  styles.audienceTitle
                }
              >
                Who is the service for?
              </Text>
              <Text
                style={
                  styles.audienceSubtitle
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
                            styles.audienceCheckbox,
                            selected &&
                            styles.audienceCheckboxSelected,
                          ]}
                        >
                          {selected && (
                            <Text
                              style={
                                styles.audienceCheck
                              }
                            >
                              ✓
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.audienceChipText,
                            selected &&
                            styles.audienceChipTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
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
                  {audienceLabel}
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
            {selectedAudiences.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Choose Services
                  </Text>
                </View>
                <ServiceChips
                  selectedCategoryId={selectedCategoryId}
                  selectedCategory={selectedCategory}
                  selectedSubcategoryIds={selectedSubcategoryIds}
                  selectedAudiences={selectedAudiences}
                  onSelect={handleServiceSelection}
                />
              </>
            )}
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
            {/* ==================================================
                AUDIENCE
            ================================================== */}
            <Text
              style={
                styles.filterLabel
              }
            >
              SERVICE FOR
            </Text>
            <View
              style={
                styles.filterAudienceRow
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
                        styles.filterAudienceOption,
                        selected &&
                        styles.filterAudienceOptionSelected,
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
                          styles.audienceCheckbox,
                          selected &&
                          styles.audienceCheckboxSelected,
                        ]}
                      >
                        {selected && (
                          <Text
                            style={
                              styles.audienceCheck
                            }
                          >
                            ✓
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.filterAudienceText,
                          selected &&
                          styles.filterAudienceTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
            {/* ==================================================
                SERVICE
            ================================================== */}
            {selectedAudiences.length > 0 && (
              <>
                <Text
                  style={
                    styles.filterLabel
                  }
                >
                  SERVICE
                </Text>
                <View
                  style={
                    styles.filterField
                  }
                >
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
                      {
                        selectedCategory ||
                        'Any service'
                      }
                    </Text>
                    <Text
                      style={
                        styles.filterFieldHint
                      }
                    >
                      {
                        selectedCategory
                          ? selectedSubcategoryIds.length > 0
                            ? `${selectedSubcategoryIds.length} subcategor${selectedSubcategoryIds.length === 1
                              ? 'y'
                              : 'ies'
                            } selected`
                            : 'All services in this category'
                          : 'Choose a service to apply budget'
                      }
                    </Text>
                  </View>
                </View>
                <ServiceChips
                  selectedCategoryId={selectedCategoryId}
                  selectedCategory={selectedCategory}
                  selectedSubcategoryIds={selectedSubcategoryIds}
                  selectedAudiences={selectedAudiences}
                  onSelect={handleServiceSelection}
                />
              </>
            )}
            {/* ==================================================
                LOCATION
            ================================================== */}
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
            {/* ==================================================
                BUDGET
            ================================================== */}
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
                      onPress={() => {
                        if (
                          option.label !== 'Any' &&
                          selectedCategoryId.trim().length === 0
                        ) {
                          Alert.alert(
                            'Choose a service',
                            'Please choose a service first to apply the budget filter.',
                          );
                          return;
                        }
                        setSelectedBudget(
                          option,
                        );
                      }}
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
            {/* ==================================================
                DISTANCE
            ================================================== */}
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
            {/* ==================================================
                ACTION
            ================================================== */}
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
            {/* ==================================================
                CLAVATA
            ================================================== */}
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
      marginRight:
        8,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 15,
      color:
        COLORS.black,
      paddingVertical:
        0,
    },
    filterButton: {
      width: 54,
      height: 54,
      borderRadius: 14,
      backgroundColor:
        COLORS.themeColor,
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
      right:
        -2,
      top:
        -4,
      minWidth:
        18,
      height:
        18,
      paddingHorizontal:
        4,
      borderRadius:
        9,
      backgroundColor:
        COLORS.white,
      borderWidth:
        2,
      borderColor:
        COLORS.black,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    filterBadgeText: {
      fontSize:
        9,
      color:
        COLORS.black,
      fontWeight:
        '800',
    },
    // ========================================================
    // AUDIENCE
    // ========================================================
    audienceSection: {
      marginHorizontal:
        SPACING.xl,
      marginBottom:
        18,
    },
    audienceTitle: {
      fontSize:
        16,
      color:
        COLORS.black,
      fontWeight:
        '700',
    },
    audienceSubtitle: {
      marginTop:
        3,
      fontSize:
        11,
      color:
        COLORS.textMuted,
      fontWeight:
        '500',
    },
    audienceRow: {
      flexDirection:
        'row',
      marginTop:
        10,
      gap:
        8,
    },
    audienceChip: {
      flexDirection:
        'row',
      alignItems:
        'center',
      height:
        42,
      paddingHorizontal:
        12,
      borderRadius:
        21,
      backgroundColor:
        COLORS.white,
      borderWidth:
        1,
      borderColor:
        '#E2E2E2',
    },
    audienceChipSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },
    audienceCheckbox: {
      width:
        19,
      height:
        19,
      borderRadius:
        5,
      borderWidth:
        1,
      borderColor:
        '#CFCFCF',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        7,
      backgroundColor:
        COLORS.white,
    },
    audienceCheckboxSelected: {
      borderColor:
        COLORS.white,
      backgroundColor:
        COLORS.white,
    },
    audienceCheck: {
      fontSize:
        13,
      color:
        COLORS.themeColor,
      fontWeight:
        '800',
      lineHeight:
        16,
    },
    audienceChipText: {
      fontSize:
        12,
      color:
        '#333333',
      fontWeight:
        '600',
    },
    audienceChipTextSelected: {
      color:
        COLORS.white,
    },
    quickFilters: {
      flexDirection:
        'row',
      marginHorizontal:
        SPACING.xl,
      marginBottom:
        22,
      gap:
        8,
    },
    quickChip: {
      height:
        34,
      paddingHorizontal:
        13,
      borderRadius:
        17,
      backgroundColor:
        COLORS.white,
      borderWidth:
        1,
      borderColor:
        '#E4E4E4',
      justifyContent:
        'center',
    },
    quickChipText: {
      fontSize:
        12,
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
      fontSize:
        21,
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
        COLORS.themeColor,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal:
        14,
    },
    clavataBody: {
      flex:
        1,
    },
    clavataTitle: {
      fontSize:
        15,
      color:
        COLORS.white,
      fontWeight:
        '700',
    },
    clavataText: {
      marginTop:
        3,
      fontSize:
        12,
      color:
        '#BEBEBE',
      fontWeight:
        '400',
    },
    clavataArrow: {
      width:
        36,
      height:
        36,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    clavataArrowText: {
      fontSize:
        21,
      color:
        COLORS.white,
      fontWeight:
        '300',
    },
    resultsHeader: {
      marginHorizontal:
        SPACING.xl,
      marginTop:
        24,
      marginBottom:
        14,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },
    resultsTitleWrap: {
      flex:
        1,
    },
    resultsTitle: {
      fontSize:
        21,
      color:
        COLORS.black,
      fontWeight:
        '700',
      letterSpacing:
        -0.3,
    },
    resultsSubtitle: {
      marginTop:
        3,
      fontSize:
        12,
      color:
        COLORS.textMuted,
      fontWeight:
        '500',
    },
    sortButton: {
      height:
        34,
      paddingHorizontal:
        13,
      borderRadius:
        17,
      borderWidth:
        1,
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
      fontSize:
        12,
      color:
        COLORS.black,
      fontWeight:
        '600',
    },
    loadingContainer: {
      marginTop:
        45,
      alignItems:
        'center',
    },
    loadingText: {
      marginTop:
        12,
      fontSize:
        13,
      color:
        COLORS.textSecondary,
      fontWeight:
        '500',
    },
    emptyContainer: {
      marginTop:
        45,
      marginHorizontal:
        30,
      alignItems:
        'center',
    },
    emptyTitle: {
      marginTop:
        16,
      fontSize:
        18,
      color:
        COLORS.black,
      fontWeight:
        '700',
    },
    emptyText: {
      marginTop:
        5,
      fontSize:
        13,
      color:
        COLORS.textSecondary,
    },
    emptyButton: {
      marginTop:
        18,
      height:
        44,
      paddingHorizontal:
        20,
      borderRadius:
        12,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    emptyButtonText: {
      color:
        COLORS.white,
      fontSize:
        13,
      fontWeight:
        '600',
    },
    modalOverlay: {
      flex:
        1,
      backgroundColor:
        'rgba(0,0,0,0.48)',
      justifyContent:
        'flex-end',
    },
    modalDismiss: {
      flex:
        1,
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
        '92%',
    },
    sheetHandle: {
      width:
        38,
      height:
        4,
      borderRadius:
        4,
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
      fontSize:
        27,
      color:
        COLORS.black,
      fontWeight:
        '700',
      letterSpacing:
        -0.7,
    },
    sheetSubtitle: {
      marginTop:
        4,
      fontSize:
        13,
      color:
        COLORS.textSecondary,
      fontWeight:
        '400',
    },
    closeButton: {
      width:
        36,
      height:
        36,
      borderRadius:
        18,
      backgroundColor:
        '#F4F4F4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    closeButtonText: {
      fontSize:
        24,
      color:
        COLORS.black,
      fontWeight:
        '300',
      marginTop:
        -2,
    },
    filterLabel: {
      fontSize:
        10,
      color:
        '#8A8A8A',
      fontWeight:
        '700',
      letterSpacing:
        1.1,
      marginTop:
        14,
      marginBottom:
        7,
    },
    // ========================================================
    // FILTER AUDIENCE
    // ========================================================
    filterAudienceRow: {
      flexDirection:
        'row',
      gap:
        8,
      marginBottom:
        2,
    },
    filterAudienceOption: {
      flex:
        1,
      minHeight:
        43,
      paddingHorizontal:
        8,
      borderRadius:
        12,
      borderWidth:
        1,
      borderColor:
        '#E2E2E2',
      backgroundColor:
        COLORS.white,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    filterAudienceOptionSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },
    filterAudienceText: {
      fontSize:
        11,
      color:
        COLORS.black,
      fontWeight:
        '600',
    },
    filterAudienceTextSelected: {
      color:
        COLORS.white,
    },
    filterField: {
      minHeight:
        56,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        '#E5E5E5',
      backgroundColor:
        '#FAFAFA',
      paddingHorizontal:
        14,
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
      fontSize:
        14,
      color:
        COLORS.black,
      fontWeight:
        '600',
    },
    filterFieldHint: {
      marginTop:
        2,
      fontSize:
        10,
      color:
        COLORS.textMuted,
      fontWeight:
        '400',
    },
    fieldArrow: {
      fontSize:
        20,
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
      flex:
        1,
    },
    locationDot: {
      width:
        10,
      height:
        10,
      borderRadius:
        5,
      backgroundColor:
        COLORS.themeColor,
      marginRight:
        12,
    },
    locationValueWrap: {
      flex:
        1,
    },
    labelRow: {
      marginTop:
        13,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },
    selectedValue: {
      fontSize:
        12,
      color:
        COLORS.black,
      fontWeight:
        '600',
      marginTop:
        14,
    },
    budgetGrid: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap:
        7,
      marginTop:
        1,
    },
    budgetOption: {
      paddingHorizontal:
        13,
      height:
        39,
      borderRadius:
        20,
      borderWidth:
        1,
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
    budgetOptionText: {
      fontSize:
        11,
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
      marginTop:
        10,
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
      marginTop:
        2,
    },
    distanceOption: {
      width:
        52,
      height:
        46,
      borderRadius:
        12,
      borderWidth:
        1,
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
      fontSize:
        14,
      color:
        COLORS.black,
      fontWeight:
        '700',
      lineHeight:
        16,
    },
    distanceNumberSelected: {
      color:
        COLORS.white,
    },
    distanceUnit: {
      fontSize:
        9,
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
      height:
        54,
      borderRadius:
        14,
      backgroundColor:
        COLORS.themeColor,
      marginTop:
        18,
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
      fontSize:
        14,
      fontWeight:
        '700',
    },
    findButtonArrow: {
      color:
        COLORS.white,
      fontSize:
        20,
      marginLeft:
        8,
      fontWeight:
        '300',
    },
    clavataLink: {
      height:
        40,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginTop:
        3,
    },
    clavataLinkText: {
      color:
        COLORS.black,
      fontSize:
        12,
      fontWeight:
        '600',
    },
  });