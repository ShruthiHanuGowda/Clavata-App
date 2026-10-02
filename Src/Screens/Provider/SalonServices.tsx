import React, {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

import {
  Header,
  DButton,
} from '../../components';

import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';

import {
  useSalonRegistration,
  SalonServiceSelection,
} from '../../context/SalonRegistrationContext';

import {
  useQuery,
} from '@apollo/client';

import {
  GET_CLAVATA_CATEGORIES,
  GET_CLAVATA_SUBCATEGORIES,
} from '../../graphql/queries';

// ============================================================
// TYPES
// ============================================================

type ServiceAudience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

type Category = {
  categoryId: string;
  name: string;
  description?: string | null;
  servicesCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Subcategory = {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  servicesCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  audiences?: ServiceAudience[];
  businessTypeIds?: string[];
};

// ============================================================
// CONFIGURABLE SERVICE
// ============================================================

type ConfigurableSalonService =
  SalonServiceSelection & {
    serviceKey: string;
    businessTypeId?: string;
    name: string;
    description?: string;
    price?: number;
    durationMinutes?: number;
  };

type AudienceTab = {
  key: ServiceAudience;
  label: string;
  shortLabel: string;
};

// ============================================================
// GROUPED SELECTED SERVICES
// ============================================================

type GroupedSelectedSubcategory = {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  services: ConfigurableSalonService[];
};

type GroupedSelectedCategory = {
  categoryId: string;
  categoryName: string;
  subcategories: GroupedSelectedSubcategory[];
};

// ============================================================
// AUDIENCE CONFIG
// ============================================================

const AUDIENCE_TABS: AudienceTab[] = [
  {
    key: 'FEMALE',
    label: 'Female',
    shortLabel: 'Women',
  },
  {
    key: 'MALE',
    label: 'Male',
    shortLabel: 'Men',
  },
  {
    key: 'KIDS',
    label: 'Kids',
    shortLabel: 'Kids',
  },
];

// ============================================================
// LOCAL SERVICE KEY
// ============================================================

const createServiceKey = (
  audience: ServiceAudience,
  categoryId: string,
  subcategoryId: string,
) => {
  return `LOCAL-${audience}-${categoryId}-${subcategoryId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

// ============================================================
// SCREEN
// ============================================================

export default function SalonServices({
  navigation,
}: any) {
  const {
    data,
    updateData,
  } = useSalonRegistration();

  // ==========================================================
  // SELECTED SERVICES EXPANSION
  // ==========================================================

  const [
    showAllSelectedServices,
    setShowAllSelectedServices,
  ] = useState(false);

  // ==========================================================
  // SERVICES MODAL
  // ==========================================================

  const [
    servicesModalVisible,
    setServicesModalVisible,
  ] = useState(false);

  // ==========================================================
  // SELECTED AUDIENCE
  // ==========================================================

  const [
    selectedAudience,
    setSelectedAudience,
  ] = useState<ServiceAudience | null>(
    null,
  );

  // ==========================================================
  // OPEN CATEGORIES
  // ==========================================================

  const [
    openCategories,
    setOpenCategories,
  ] = useState<
    Record<string, boolean>
  >({});

  // ==========================================================
  // SUBMITTING
  // ==========================================================

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ==========================================================
  // CLAVATA CATEGORIES
  // ==========================================================

  const {
    data: categoryResponse,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(
    GET_CLAVATA_CATEGORIES,
    {
      fetchPolicy: 'network-only',
    },
  );

  // ==========================================================
  // CLAVATA SUBCATEGORIES
  // ==========================================================

  const {
    data: subcategoryResponse,
    loading: subcategoriesLoading,
    error: subcategoriesError,
    refetch: refetchSubcategories,
  } = useQuery(
    GET_CLAVATA_SUBCATEGORIES,
    {
      fetchPolicy: 'network-only',
    },
  );

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories: Category[] =
    useMemo(() => {
      const rawCategories: Category[] =
        Array.isArray(
          categoryResponse?.categories?.categories,
        )
          ? categoryResponse.categories.categories
          : [];

      const uniqueCategories =
        new Map<string, Category>();

      rawCategories.forEach(
        category => {
          if (
            category?.categoryId &&
            !uniqueCategories.has(
              category.categoryId,
            )
          ) {
            uniqueCategories.set(
              category.categoryId,
              category,
            );
          }
        },
      );

      return Array.from(
        uniqueCategories.values(),
      );
    }, [
      categoryResponse,
    ]);

  // ==========================================================
  // SUBCATEGORIES
  // ==========================================================

  const subcategories: Subcategory[] =
    useMemo(() => {
      const rawSubcategories: Subcategory[] =
        Array.isArray(
          subcategoryResponse?.subcategories?.subcategories,
        )
          ? subcategoryResponse.subcategories.subcategories
          : [];

      const uniqueSubcategories =
        new Map<
          string,
          Subcategory
        >();

      rawSubcategories.forEach(
        subcategory => {
          if (
            !subcategory?.categoryId ||
            !subcategory?.subcategoryId
          ) {
            return;
          }

          const uniqueKey =
            `${subcategory.categoryId}-${subcategory.subcategoryId}`;

          if (
            !uniqueSubcategories.has(
              uniqueKey,
            )
          ) {
            uniqueSubcategories.set(
              uniqueKey,
              subcategory,
            );
          }
        },
      );

      return Array.from(
        uniqueSubcategories.values(),
      );
    }, [
      subcategoryResponse,
    ]);

  // ==========================================================
  // SALON TARGET AUDIENCES
  // ==========================================================

  const salonAudiences: ServiceAudience[] =
    useMemo(() => {
      const audiences =
        Array.isArray(
          data?.targetAudiences,
        )
          ? data.targetAudiences
          : [];

      return audiences.filter(
        (
          audience: any,
        ): audience is ServiceAudience =>
          audience === 'FEMALE' ||
          audience === 'MALE' ||
          audience === 'KIDS',
      );
    }, [
      data?.targetAudiences,
    ]);

  // ==========================================================
  // AVAILABLE AUDIENCE TABS
  // ==========================================================

  const availableAudienceTabs =
    useMemo(() => {
      return AUDIENCE_TABS.filter(
        tab =>
          salonAudiences.includes(
            tab.key,
          ),
      );
    }, [
      salonAudiences,
    ]);

  // ==========================================================
  // DEFAULT AUDIENCE
  // ==========================================================

  const activeAudience =
    selectedAudience &&
      salonAudiences.includes(
        selectedAudience,
      )
      ? selectedAudience
      : availableAudienceTabs[0]
        ?.key || null;

  // ==========================================================
  // SALON BUSINESS TYPES
  // ==========================================================

  const salonBusinessTypeIds =
    useMemo(() => {
      const selectedIds =
        Array.isArray(
          (data as any)?.businessTypeIds,
        )
          ? (data as any).businessTypeIds
          : (data as any)?.businessTypeId
            ? [(data as any).businessTypeId]
            : [];

      return selectedIds
        .map((id: any) =>
          String(id ?? '').trim(),
        )
        .filter(Boolean);
    }, [
      (data as any)?.businessTypeIds,
      (data as any)?.businessTypeId,
    ]);

  // ==========================================================
  // CURRENT SERVICE SELECTIONS
  // ==========================================================

  const selectedServiceSelections:
    ConfigurableSalonService[] =
    useMemo(() => {
      if (
        !Array.isArray(
          data?.serviceSelections,
        )
      ) {
        return [];
      }

      const uniqueSelections =
        new Map<
          string,
          ConfigurableSalonService
        >();

      (
        data.serviceSelections as ConfigurableSalonService[]
      ).forEach(
        (selection, index) => {
          if (
            !selection ||
            !selection.audience ||
            !selection.categoryId ||
            !selection.subcategoryId
          ) {
            return;
          }

          const key =
            `${selection.audience}-${selection.categoryId}-${selection.subcategoryId}`;

          if (
            !uniqueSelections.has(
              key,
            )
          ) {
            uniqueSelections.set(
              key,
              {
                ...selection,

                name:
                  typeof selection.name ===
                  'string'
                    ? selection.name.trim()
                    : '',

                serviceKey:
                  selection.serviceKey ||
                  `LEGACY-${index}-${selection.audience}-${selection.categoryId}-${selection.subcategoryId}`,

                description:
                  selection.description ??
                  '',

                price:
                  typeof selection.price ===
                  'number'
                    ? selection.price
                    : undefined,

                durationMinutes:
                  typeof selection.durationMinutes ===
                  'number'
                    ? selection.durationMinutes
                    : undefined,
              },
            );
          }
        },
      );

      return Array.from(
        uniqueSelections.values(),
      );
    }, [
      data?.serviceSelections,
    ]);

  // ==========================================================
  // FILTER SUBCATEGORIES BY BUSINESS TYPE + AUDIENCE
  // ==========================================================

  const audienceSubcategories =
    useMemo(() => {
      if (!activeAudience) {
        return [];
      }

      return subcategories.filter(
        subcategory => {
          if (
            salonBusinessTypeIds.length ===
            0
          ) {
            return false;
          }

          if (
            !Array.isArray(
              subcategory.businessTypeIds,
            ) ||
            subcategory.businessTypeIds.length ===
            0
          ) {
            return false;
          }

          const normalizedSubcategoryBusinessTypeIds =
            subcategory.businessTypeIds
              .map(id =>
                String(id ?? '').trim(),
              )
              .filter(Boolean);

          const matchesBusinessType =
            normalizedSubcategoryBusinessTypeIds.some(
              businessTypeId =>
                salonBusinessTypeIds.includes(
                  businessTypeId,
                ),
            );

          if (
            !matchesBusinessType
          ) {
            return false;
          }

          if (
            !Array.isArray(
              subcategory.audiences,
            )
          ) {
            return false;
          }

          return subcategory.audiences.includes(
            activeAudience,
          );
        },
      );
    }, [
      subcategories,
      activeAudience,
      salonBusinessTypeIds,
    ]);

  // ==========================================================
  // FILTER CATEGORIES BY AUDIENCE
  // ==========================================================

  const visibleCategories =
    useMemo(() => {
      const categoryIds =
        new Set(
          audienceSubcategories.map(
            subcategory =>
              subcategory.categoryId,
          ),
        );

      return categories.filter(
        category =>
          categoryIds.has(
            category.categoryId,
          ),
      );
    }, [
      categories,
      audienceSubcategories,
    ]);

  // ==========================================================
  // NORMALIZED SELECTED SERVICES
  // ==========================================================

  const normalizedSelectedServices =
    useMemo(() => {
      return selectedServiceSelections.map(
        selection => {
          const category =
            categories.find(
              item =>
                item.categoryId ===
                selection.categoryId,
            );

          const subcategory =
            subcategories.find(
              item =>
                item.categoryId ===
                  selection.categoryId &&
                item.subcategoryId ===
                  selection.subcategoryId,
            );

          return {
            ...selection,

            categoryName:
              selection.categoryName ||
              category?.name ||
              selection.categoryId,

            subcategoryName:
              selection.subcategoryName ||
              subcategory?.name ||
              selection.subcategoryId,

            name:
              typeof selection.name ===
              'string'
                ? selection.name.trim()
                : '',

            description:
              selection.description ??
              '',
          };
        },
      );
    }, [
      selectedServiceSelections,
      categories,
      subcategories,
    ]);

  // ==========================================================
  // SORTED SELECTED SERVICES
  // ==========================================================

  const sortedSelectedServices =
    useMemo(() => {
      return [
        ...normalizedSelectedServices,
      ].sort((a, b) => {
        const categoryCompare =
          (
            a.categoryName ||
            ''
          ).localeCompare(
            b.categoryName ||
              '',
            undefined,
            {
              sensitivity:
                'base',
            },
          );

        if (
          categoryCompare !==
          0
        ) {
          return categoryCompare;
        }

        return (
          a.subcategoryName ||
          ''
        ).localeCompare(
          b.subcategoryName ||
            '',
          undefined,
          {
            sensitivity:
              'base',
          },
        );
      });
    }, [
      normalizedSelectedServices,
    ]);

  // ==========================================================
  // GROUP SELECTED SERVICES
  //
  // Category
  //   Subcategory
  //     Audience
  // ==========================================================

  const groupedSelectedServices =
    useMemo<GroupedSelectedCategory[]>(
      () => {
        const categoryMap =
          new Map<
            string,
            GroupedSelectedCategory
          >();

        sortedSelectedServices.forEach(
          selection => {
            const categoryId =
              selection.categoryId;

            const subcategoryId =
              selection.subcategoryId;

            let categoryGroup =
              categoryMap.get(
                categoryId,
              );

            if (
              !categoryGroup
            ) {
              categoryGroup = {
                categoryId,
                categoryName:
                  selection.categoryName ||
                  categoryId,
                subcategories: [],
              };

              categoryMap.set(
                categoryId,
                categoryGroup,
              );
            }

            let subcategoryGroup =
              categoryGroup.subcategories.find(
                item =>
                  item.subcategoryId ===
                  subcategoryId,
              );

            if (
              !subcategoryGroup
            ) {
              subcategoryGroup = {
                categoryId,
                categoryName:
                  selection.categoryName ||
                  categoryId,

                subcategoryId,

                subcategoryName:
                  selection.subcategoryName ||
                  subcategoryId,

                services: [],
              };

              categoryGroup.subcategories.push(
                subcategoryGroup,
              );
            }

            subcategoryGroup.services.push(
              selection,
            );
          },
        );

        return Array.from(
          categoryMap.values(),
        );
      },
      [
        sortedSelectedServices,
      ],
    );

  // ==========================================================
  // VISIBLE SELECTED SERVICES
  // ==========================================================

  const visibleSelectedServices =
    useMemo(() => {
      return showAllSelectedServices
        ? sortedSelectedServices
        : sortedSelectedServices.slice(
            0,
            6,
          );
    }, [
      showAllSelectedServices,
      sortedSelectedServices,
    ]);

  // ==========================================================
  // VISIBLE GROUPED SELECTED SERVICES
  // ==========================================================

  const visibleGroupedSelectedServices =
    useMemo(() => {
      const visibleKeys =
        new Set(
          visibleSelectedServices.map(
            service =>
              service.serviceKey,
          ),
        );

      return groupedSelectedServices
        .map(
          category => ({
            ...category,

            subcategories:
              category.subcategories
                .map(
                  subcategory => ({
                    ...subcategory,

                    services:
                      subcategory.services.filter(
                        service =>
                          visibleKeys.has(
                            service.serviceKey,
                          ),
                      ),
                  }),
                )
                .filter(
                  subcategory =>
                    subcategory.services
                      .length >
                    0,
                ),
          }),
        )
        .filter(
          category =>
            category.subcategories
              .length >
            0,
        );
    }, [
      groupedSelectedServices,
      visibleSelectedServices,
    ]);

  // ==========================================================
  // CHECK SELECTION
  // ==========================================================

  const isSelected = (
    audience: ServiceAudience,
    categoryId: string,
    subcategoryId: string,
  ) => {
    return selectedServiceSelections.some(
      selection =>
        selection.audience ===
          audience &&
        selection.categoryId ===
          categoryId &&
        selection.subcategoryId ===
          subcategoryId,
    );
  };

  // ==========================================================
  // GET BUSINESS TYPE FOR SUBCATEGORY
  // ==========================================================

  const getBusinessTypeIdForSubcategory =
    (
      subcategory: Subcategory,
    ): string => {
      const subcategoryBusinessTypeIds =
        Array.isArray(
          subcategory.businessTypeIds,
        )
          ? subcategory.businessTypeIds
              .map(id =>
                String(
                  id ?? '',
                ).trim(),
              )
              .filter(Boolean)
          : [];

      const matchingBusinessTypeId =
        salonBusinessTypeIds.find(
          (businessTypeId: string) =>
            subcategoryBusinessTypeIds.includes(
              businessTypeId,
            ),
        );

      return (
        matchingBusinessTypeId ||
        (
          salonBusinessTypeIds.length ===
          1
            ? salonBusinessTypeIds[0]
            : ''
        )
      );
    };

  // ==========================================================
  // UPDATE REGISTRATION SERVICES
  // ==========================================================

  const saveServiceSelections = (
    selections: ConfigurableSalonService[],
  ) => {
    updateData({
      serviceSelections:
        selections as any,
    });
  };

  // ==========================================================
  // CHANGE AUDIENCE
  // ==========================================================

  const handleAudienceChange = (
    audience: ServiceAudience,
  ) => {
    setSelectedAudience(
      audience,
    );

    setOpenCategories({});
  };

  // ==========================================================
  // TOGGLE CATEGORY OPEN / CLOSE
  // ==========================================================

  const toggleCategory = (
    categoryId: string,
  ) => {
    if (!activeAudience) {
      return;
    }

    const key =
      `${activeAudience}-${categoryId}`;

    setOpenCategories(
      previous => ({
        ...previous,
        [key]:
          !previous[key],
      }),
    );
  };

  // ==========================================================
  // GET SUBCATEGORIES FOR ACTIVE AUDIENCE
  // ==========================================================

  const getCategorySubcategories = (
    categoryId: string,
  ) => {
    return audienceSubcategories.filter(
      subcategory =>
        subcategory.categoryId ===
        categoryId,
    );
  };

  // ==========================================================
  // TOGGLE ENTIRE CATEGORY
  // ==========================================================

  const toggleCategorySelection = (
    category: Category,
  ) => {
    const categorySubcategories =
      getCategorySubcategories(
        category.categoryId,
      );

    if (
      categorySubcategories.length ===
        0 ||
      !activeAudience
    ) {
      return;
    }

    const selectedCategoryCount =
      selectedServiceSelections.filter(
        selection =>
          selection.audience ===
            activeAudience &&
          selection.categoryId ===
            category.categoryId &&
          categorySubcategories.some(
            subcategory =>
              subcategory.subcategoryId ===
              selection.subcategoryId,
          ),
      ).length;

    const allSelected =
      selectedCategoryCount ===
      categorySubcategories.length;

    // REMOVE ALL
    if (allSelected) {
      const audienceSubcategoryIds =
        new Set(
          categorySubcategories.map(
            subcategory =>
              subcategory.subcategoryId,
          ),
        );

      saveServiceSelections(
        selectedServiceSelections.filter(
          selection =>
            !(
              selection.audience ===
                activeAudience &&
              selection.categoryId ===
                category.categoryId &&
              audienceSubcategoryIds.has(
                selection.subcategoryId,
              )
            ),
        ),
      );

      return;
    }

    // SELECT ALL
    const selectedIds =
      new Set(
        selectedServiceSelections
          .filter(
            selection =>
              selection.audience ===
                activeAudience &&
              selection.categoryId ===
                category.categoryId,
          )
          .map(
            selection =>
              selection.subcategoryId,
          ),
      );

    const newSelections =
      categorySubcategories
        .filter(
          subcategory =>
            !selectedIds.has(
              subcategory.subcategoryId,
            ),
        )
        .map(
          subcategory => {
            const businessTypeId =
              getBusinessTypeIdForSubcategory(
                subcategory,
              );

            return {
              serviceKey:
                createServiceKey(
                  activeAudience,
                  category.categoryId,
                  subcategory.subcategoryId,
                ),

              audience:
                activeAudience,

              businessTypeId,

              categoryId:
                category.categoryId,

              categoryName:
                category.name,

              subcategoryId:
                subcategory.subcategoryId,

              subcategoryName:
                subcategory.name,

              name: '',

              description: '',

              price:
                undefined,

              durationMinutes:
                undefined,
            };
          },
        );

    const mergedSelections = [
      ...selectedServiceSelections,
      ...newSelections,
    ];

    const uniqueSelections =
      Array.from(
        new Map(
          mergedSelections.map(
            selection => [
              `${selection.audience}-${selection.categoryId}-${selection.subcategoryId}`,
              selection,
            ],
          ),
        ).values(),
      );

    saveServiceSelections(
      uniqueSelections,
    );
  };

  // ==========================================================
  // CATEGORY CHECKBOX STATE
  // ==========================================================

  const getCategorySelectionState = (
    categoryId: string,
  ) => {
    const categorySubcategories =
      getCategorySubcategories(
        categoryId,
      );

    const categorySubcategoryIds =
      new Set(
        categorySubcategories.map(
          subcategory =>
            subcategory.subcategoryId,
        ),
      );

    const selectedCount =
      selectedServiceSelections.filter(
        selection =>
          selection.audience ===
            activeAudience &&
          selection.categoryId ===
            categoryId &&
          categorySubcategoryIds.has(
            selection.subcategoryId,
          ),
      ).length;

    return {
      selectedCount,

      totalCount:
        categorySubcategories.length,

      allSelected:
        categorySubcategories.length >
          0 &&
        selectedCount ===
          categorySubcategories.length,

      partiallySelected:
        selectedCount > 0 &&
        selectedCount <
          categorySubcategories.length,
    };
  };

  // ==========================================================
  // TOGGLE SUBCATEGORY
  // ==========================================================

  const toggleSubcategory = (
    category: Category,
    subcategory: Subcategory,
  ) => {
    if (!activeAudience) {
      return;
    }

    const alreadySelected =
      isSelected(
        activeAudience,
        category.categoryId,
        subcategory.subcategoryId,
      );

    let updatedSelections:
      ConfigurableSalonService[];

    // REMOVE
    if (alreadySelected) {
      updatedSelections =
        selectedServiceSelections.filter(
          selection =>
            !(
              selection.audience ===
                activeAudience &&
              selection.categoryId ===
                category.categoryId &&
              selection.subcategoryId ===
                subcategory.subcategoryId
            ),
        );
    }

    // ADD
    else {
      const businessTypeId =
        getBusinessTypeIdForSubcategory(
          subcategory,
        );

      updatedSelections = [
        ...selectedServiceSelections,

        {
          serviceKey:
            createServiceKey(
              activeAudience,
              category.categoryId,
              subcategory.subcategoryId,
            ),

          audience:
            activeAudience,

          businessTypeId,

          categoryId:
            category.categoryId,

          categoryName:
            category.name,

          subcategoryId:
            subcategory.subcategoryId,

          subcategoryName:
            subcategory.name,

          name: '',

          description: '',

          price:
            undefined,

          durationMinutes:
            undefined,
        },
      ];
    }

    saveServiceSelections(
      updatedSelections,
    );
  };

  // ==========================================================
  // OPEN SERVICES MODAL
  // ==========================================================

  const openServicesModal = () => {
    setServicesModalVisible(
      true,
    );

    if (
      !activeAudience &&
      availableAudienceTabs.length >
        0
    ) {
      setSelectedAudience(
        availableAudienceTabs[0]
          .key,
      );
    }
  };

  // ==========================================================
  // CLOSE SERVICES MODAL
  // ==========================================================

  const closeServicesModal = () => {
    setServicesModalVisible(
      false,
    );
  };

  // ==========================================================
  // CONTINUE
  // ==========================================================

  const handleContinue = async () => {
    if (
      selectedServiceSelections.length ===
      0
    ) {
      Alert.alert(
        'Services required',
        'Please select at least one service category and subcategory provided by your business.',
        [
          {
            text: 'Select Services',
            onPress:
              openServicesModal,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );

      return;
    }

    const preservedSelections =
      selectedServiceSelections.map(
        selection => ({
          ...selection,

          serviceKey:
            selection.serviceKey ||
            createServiceKey(
              selection.audience,
              selection.categoryId,
              selection.subcategoryId,
            ),

          name:
            typeof selection.name ===
            'string'
              ? selection.name.trim()
              : '',

          description:
            selection.description ??
            '',

          price:
            typeof selection.price ===
            'number'
              ? selection.price
              : undefined,

          durationMinutes:
            typeof selection.durationMinutes ===
            'number'
              ? selection.durationMinutes
              : undefined,
        }),
      );

    try {
      setSubmitting(true);

      saveServiceSelections(
        preservedSelections,
      );

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            150,
          ),
      );

      navigation.navigate(
        'ConfigureSalonServices',
      );
    } catch (error) {
      console.error(
        'SALON SERVICES CONTINUE ERROR:',
        error,
      );

      Alert.alert(
        'Unable to continue',
        'Something went wrong while saving your selected services. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // RETRY CATALOG
  // ==========================================================

  const handleRetry = async () => {
    try {
      await Promise.all([
        refetchCategories(),
        refetchSubcategories(),
      ]);
    } catch (error) {
      console.error(
        'SERVICE CATALOG RETRY ERROR:',
        error,
      );
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Business Services"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={styles.title}
        >
          Services provided by your business
        </Text>

        <Text
          style={styles.subtitle}
        >
          Select the services you offer based on
          the audience your business serves.
        </Text>

        {!categoriesLoading &&
        !subcategoriesLoading &&
        salonAudiences.length ===
          0 ? (
          <View
            style={
              styles.noAudienceCard
            }
          >
            <Text
              style={
                styles.noAudienceTitle
              }
            >
              No service audience selected
            </Text>

            <Text
              style={
                styles.noAudienceText
              }
            >
              Please go back and select whether
              your business provides services for
              Female, Male, or Kids customers.
            </Text>
          </View>
        ) : null}

        {(
          categoriesLoading ||
          subcategoriesLoading
        ) ? (
          <View
            style={
              styles.catalogLoading
            }
          >
            <ActivityIndicator
              size="small"
              color={
                COLORS.themeColor
              }
            />

            <Text
              style={
                styles.catalogLoadingText
              }
            >
              Loading Clavata services...
            </Text>
          </View>
        ) : null}

        {!categoriesLoading &&
        !subcategoriesLoading &&
        (
          categoriesError ||
          subcategoriesError
        ) ? (
          <View
            style={
              styles.catalogError
            }
          >
            <Text
              style={
                styles.catalogErrorTitle
              }
            >
              Unable to load services
            </Text>

            <Text
              style={
                styles.catalogErrorText
              }
            >
              {categoriesError
                ? `Categories error: ${categoriesError.message}`
                : `Subcategories error: ${subcategoriesError?.message}`}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                handleRetry
              }
              style={
                styles.retryButton
              }
            >
              <Text
                style={
                  styles.retryButtonText
                }
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!categoriesLoading &&
        !subcategoriesLoading &&
        !categoriesError &&
        !subcategoriesError &&
        categories.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={
              openServicesModal
            }
            style={[
              styles.serviceSelector,
              selectedServiceSelections.length ===
                0 &&
                styles.serviceSelectorRequired,
            ]}
          >
            <View
              style={
                styles.serviceSelectorLeft
              }
            >
              <Text
                style={
                  styles.serviceSelectorTitle
                }
              >
                Select Services
              </Text>

              <Text
                style={
                  styles.serviceSelectorSubtitle
                }
              >
                {selectedServiceSelections.length >
                0
                  ? `${selectedServiceSelections.length} ${
                      selectedServiceSelections.length ===
                      1
                        ? 'selection'
                        : 'selections'
                    } selected`
                  : 'Required • Select at least one'}
              </Text>
            </View>

            <Text
              style={
                styles.serviceSelectorArrow
              }
            >
              ›
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* ====================================================
            SELECTED SERVICE CATEGORIES
            Category → Subcategory → Audience
            ==================================================== */}

        {!categoriesLoading &&
        !subcategoriesLoading &&
        sortedSelectedServices.length >
          0 ? (
          <View
            style={
              styles.selectedServicesPreview
            }
          >
            <View
              style={
                styles.selectedPreviewHeader
              }
            >
              <View
                style={
                  styles.selectedPreviewHeaderLeft
                }
              >
                <Text
                  style={
                    styles.selectedPreviewTitle
                  }
                >
                  Selected Service Categories
                </Text>

                <Text
                  style={
                    styles.selectedPreviewCount
                  }
                >
                  {
                    sortedSelectedServices.length
                  }{' '}
                  selected
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  openServicesModal
                }
              >
                <Text
                  style={
                    styles.editServicesText
                  }
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            {visibleGroupedSelectedServices.map(
              (
                category,
                categoryIndex,
              ) => (
                <View
                  key={
                    category.categoryId
                  }
                  style={[
                    styles.selectedCategoryGroup,
                    categoryIndex >
                      0 &&
                      styles.selectedCategoryGroupSpacing,
                  ]}
                >
                  {/* CATEGORY */}
                  <View
                    style={
                      styles.selectedCategoryHeader
                    }
                  >
                    <View
                      style={
                        styles.selectedCategoryNumber
                      }
                    >
                      <Text
                        style={
                          styles.selectedCategoryNumberText
                        }
                      >
                        {categoryIndex +
                          1}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.selectedCategoryHeaderContent
                      }
                    >
                      <Text
                        style={
                          styles.selectedCategoryName
                        }
                      >
                        {
                          category.categoryName
                        }
                      </Text>

                      <Text
                        style={
                          styles.selectedCategoryMeta
                        }
                      >
                        {
                          category
                            .subcategories
                            .length
                        }{' '}
                        {category
                          .subcategories
                          .length ===
                        1
                          ? 'subcategory'
                          : 'subcategories'}
                      </Text>
                    </View>
                  </View>

                  {/* SUBCATEGORIES */}
                  {category.subcategories.map(
                    (
                      subcategory,
                      subcategoryIndex,
                    ) => (
                      <View
                        key={`${category.categoryId}-${subcategory.subcategoryId}`}
                        style={
                          styles.selectedSubcategoryGroup
                        }
                      >
                        <View
                          style={
                            styles.selectedSubcategoryHeader
                          }
                        >
                          <Text
                            style={
                              styles.selectedSubcategoryNumber
                            }
                          >
                            {subcategoryIndex +
                              1}
                          </Text>

                          <View
                            style={
                              styles.selectedSubcategoryHeaderContent
                            }
                          >
                            <Text
                              style={
                                styles.selectedSubcategoryName
                              }
                            >
                              {
                                subcategory.subcategoryName
                              }
                            </Text>
                          </View>
                        </View>

                        {/* AUDIENCE LIST */}
                        <View
                          style={
                            styles.selectedAudienceList
                          }
                        >
                          {subcategory.services.map(
                            selection => {
                              const audienceLabel =
                                AUDIENCE_TABS.find(
                                  tab =>
                                    tab.key ===
                                    selection.audience,
                                )?.label ||
                                selection.audience;

                              return (
                                <View
                                  key={
                                    selection.serviceKey
                                  }
                                  style={
                                    styles.selectedAudienceRow
                                  }
                                >
                                  <View
                                    style={
                                      styles.selectedAudienceIndicator
                                    }
                                  />

                                  <Text
                                    style={
                                      styles.selectedAudienceText
                                    }
                                  >
                                    {
                                      audienceLabel
                                    }
                                  </Text>
                                </View>
                              );
                            },
                          )}
                        </View>
                      </View>
                    ),
                  )}
                </View>
              ),
            )}

            {sortedSelectedServices.length >
            6 ? (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  setShowAllSelectedServices(
                    previous =>
                      !previous,
                  )
                }
                style={
                  styles.moreSelectedButton
                }
              >
                <Text
                  style={
                    styles.moreSelectedText
                  }
                >
                  {showAllSelectedServices
                    ? 'Show less'
                    : `+ ${
                        sortedSelectedServices.length -
                        6
                      } more selected`}
                </Text>

                <Text
                  style={
                    styles.moreSelectedArrow
                  }
                >
                  {showAllSelectedServices
                    ? '⌃'
                    : '⌄'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {!categoriesLoading &&
        !subcategoriesLoading &&
        !categoriesError &&
        !subcategoriesError &&
        selectedServiceSelections.length ===
          0 ? (
          <Text
            style={
              styles.requiredText
            }
          >
            * Service selection is mandatory
            to continue.
          </Text>
        ) : null}

        <View
          style={styles.infoCard}
        >
          <Text
            style={styles.infoTitle}
          >
            About your services
          </Text>

          <Text
            style={styles.infoText}
          >
            • Services are shown according to
            the audience selected for your business.
          </Text>

          <Text
            style={styles.infoText}
          >
            • Select an entire category or choose
            individual subcategories.
          </Text>

          <Text
            style={styles.infoText}
          >
            • You can switch between Female, Male,
            and Kids when those audiences are
            enabled for your business.
          </Text>

          <Text
            style={styles.infoText}
          >
            • You can remove individual services
            whenever needed.
          </Text>

          <Text
            style={styles.infoText}
          >
            • You can edit your service settings
            later from your business profile.
          </Text>
        </View>

        <DButton
          style={styles.button}
          onPress={
            handleContinue
          }
          disabled={
            submitting
          }
        >
          {submitting ? (
            <ActivityIndicator
              color={
                COLORS.white
              }
            />
          ) : (
            <Text
              style={styles.buttonText}
            >
              Continue
            </Text>
          )}
        </DButton>
      </ScrollView>

      {/* ======================================================
          SERVICES MODAL
          ====================================================== */}

      <Modal
        visible={
          servicesModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeServicesModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.servicesModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderText
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Select Services
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose services based on your
                  business audience
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  closeServicesModal
                }
                style={
                  styles.modalCloseButton
                }
              >
                <Text
                  style={
                    styles.modalCloseText
                  }
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {availableAudienceTabs.length >
            0 ? (
              <View
                style={
                  styles.audienceTabsContainer
                }
              >
                {availableAudienceTabs.map(
                  tab => {
                    const isActive =
                      activeAudience ===
                      tab.key;

                    const tabServiceCount =
                      subcategories.filter(
                        subcategory => {
                          const matchesAudience =
                            subcategory.audiences?.includes(
                              tab.key,
                            );

                          const matchesBusinessType =
                            Array.isArray(
                              subcategory.businessTypeIds,
                            ) &&
                            subcategory.businessTypeIds.some(
                              businessTypeId =>
                                salonBusinessTypeIds.includes(
                                  String(
                                    businessTypeId,
                                  ).trim(),
                                ),
                            );

                          return (
                            matchesAudience &&
                            matchesBusinessType
                          );
                        },
                      ).length;

                    return (
                      <TouchableOpacity
                        key={tab.key}
                        activeOpacity={0.8}
                        onPress={() =>
                          handleAudienceChange(
                            tab.key,
                          )
                        }
                        style={[
                          styles.audienceTab,
                          isActive &&
                            styles.audienceTabActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.audienceTabText,
                            isActive &&
                              styles.audienceTabTextActive,
                          ]}
                        >
                          {tab.label}
                        </Text>

                        <Text
                          style={[
                            styles.audienceTabCount,
                            isActive &&
                              styles.audienceTabCountActive,
                          ]}
                        >
                          {
                            tabServiceCount
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            ) : null}

            {activeAudience ? (
              <View
                style={
                  styles.activeAudienceBar
                }
              >
                <View>
                  <Text
                    style={
                      styles.activeAudienceTitle
                    }
                  >
                    {AUDIENCE_TABS.find(
                      tab =>
                        tab.key ===
                        activeAudience,
                    )?.label ||
                      activeAudience}{' '}
                    Services
                  </Text>

                  <Text
                    style={
                      styles.activeAudienceSubtitle
                    }
                  >
                    {
                      audienceSubcategories.length
                    }{' '}
                    service subcategories
                    available
                  </Text>
                </View>

                <View
                  style={
                    styles.activeAudienceBadge
                  }
                >
                  <Text
                    style={
                      styles.activeAudienceBadgeText
                    }
                  >
                    {activeAudience ===
                    'FEMALE'
                      ? 'W'
                      : activeAudience ===
                          'MALE'
                        ? 'M'
                        : 'K'}
                  </Text>
                </View>
              </View>
            ) : null}

            <View
              style={
                styles.modalSelectedBar
              }
            >
              <Text
                style={
                  styles.modalSelectedText
                }
              >
                {
                  selectedServiceSelections.length
                }{' '}
                {selectedServiceSelections.length ===
                1
                  ? 'subcategory'
                  : 'subcategories'}{' '}
                selected
              </Text>

              {selectedServiceSelections.length ===
              0 ? (
                <Text
                  style={
                    styles.modalRequiredText
                  }
                >
                  Required
                </Text>
              ) : null}
            </View>

            <ScrollView
              style={
                styles.modalScroll
              }
              contentContainerStyle={
                styles.modalScrollContent
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              {visibleCategories.length ===
              0 ? (
                <View
                  style={
                    styles.emptyAudienceState
                  }
                >
                  <View
                    style={
                      styles.emptyAudienceIcon
                    }
                  >
                    <Text
                      style={
                        styles.emptyAudienceIconText
                      }
                    >
                      —
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.emptyAudienceTitle
                    }
                  >
                    No services available
                  </Text>

                  <Text
                    style={
                      styles.emptyAudienceText
                    }
                  >
                    There are currently no
                    services configured for
                    this audience.
                  </Text>
                </View>
              ) : (
                visibleCategories.map(
                  category => {
                    const categorySubcategories =
                      getCategorySubcategories(
                        category.categoryId,
                      );

                    const categoryOpenKey =
                      `${activeAudience}-${category.categoryId}`;

                    const isOpen =
                      !!openCategories[
                        categoryOpenKey
                      ];

                    const categorySelectionState =
                      getCategorySelectionState(
                        category.categoryId,
                      );

                    const selectedCount =
                      categorySelectionState.selectedCount;

                    const categorySelected =
                      categorySelectionState.allSelected;

                    const categoryPartial =
                      categorySelectionState.partiallySelected;

                    return (
                      <View
                        key={`${activeAudience}-${category.categoryId}`}
                        style={
                          styles.modalCategory
                        }
                      >
                        <View
                          style={[
                            styles.modalCategoryHeader,
                            isOpen &&
                              styles.modalCategoryHeaderOpen,
                          ]}
                        >
                          <View
                            style={
                              styles.modalCategoryHeaderLeft
                            }
                          >
                            <TouchableOpacity
                              activeOpacity={
                                0.8
                              }
                              disabled={
                                categorySubcategories.length ===
                                0
                              }
                              onPress={() =>
                                toggleCategorySelection(
                                  category,
                                )
                              }
                              style={[
                                styles.categoryCheckbox,
                                categorySelected &&
                                  styles.categoryCheckboxSelected,
                                categoryPartial &&
                                  styles.categoryCheckboxPartial,
                                categorySubcategories.length ===
                                  0 &&
                                  styles.categoryCheckboxDisabled,
                              ]}
                            >
                              {categorySelected ? (
                                <Text
                                  style={
                                    styles.categoryCheckmark
                                  }
                                >
                                  ✓
                                </Text>
                              ) : categoryPartial ? (
                                <Text
                                  style={
                                    styles.categoryPartialMark
                                  }
                                >
                                  −
                                </Text>
                              ) : null}
                            </TouchableOpacity>

                            <View
                              style={
                                styles.categoryIcon
                              }
                            >
                              <Text
                                style={
                                  styles.categoryIconText
                                }
                              >
                                {category.name
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </Text>
                            </View>

                            <TouchableOpacity
                              activeOpacity={
                                0.8
                              }
                              onPress={() =>
                                toggleCategory(
                                  category.categoryId,
                                )
                              }
                              style={
                                styles.modalCategoryText
                              }
                            >
                              <Text
                                style={
                                  styles.modalCategoryName
                                }
                              >
                                {
                                  category.name
                                }
                              </Text>

                              <Text
                                style={
                                  styles.modalCategoryMeta
                                }
                              >
                                {
                                  categorySubcategories.length
                                }{' '}
                                {categorySubcategories.length ===
                                1
                                  ? 'subcategory'
                                  : 'subcategories'}

                                {selectedCount >
                                0
                                  ? ` • ${selectedCount} selected`
                                  : ''}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            activeOpacity={
                              0.8
                            }
                            onPress={() =>
                              toggleCategory(
                                category.categoryId,
                              )
                            }
                            style={
                              styles.categoryToggle
                            }
                          >
                            <Text
                              style={
                                styles.categoryToggleText
                              }
                            >
                              {isOpen
                                ? '−'
                                : '+'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {isOpen ? (
                          <View
                            style={
                              styles.modalSubcategories
                            }
                          >
                            {categorySubcategories.length ===
                            0 ? (
                              <Text
                                style={
                                  styles.noSubcategoryText
                                }
                              >
                                No active
                                subcategories
                                available.
                              </Text>
                            ) : (
                              categorySubcategories
                                .slice()
                                .sort(
                                  (
                                    a,
                                    b,
                                  ) =>
                                    a.name.localeCompare(
                                      b.name,
                                      undefined,
                                      {
                                        sensitivity:
                                          'base',
                                      },
                                    ),
                                )
                                .map(
                                  subcategory => {
                                    const selected =
                                      activeAudience
                                        ? isSelected(
                                            activeAudience,
                                            category.categoryId,
                                            subcategory.subcategoryId,
                                          )
                                        : false;

                                    return (
                                      <TouchableOpacity
                                        key={`${activeAudience}-${category.categoryId}-${subcategory.subcategoryId}`}
                                        activeOpacity={
                                          0.8
                                        }
                                        onPress={() =>
                                          toggleSubcategory(
                                            category,
                                            subcategory,
                                          )
                                        }
                                        style={[
                                          styles.modalSubcategoryRow,
                                          selected &&
                                            styles.modalSubcategoryRowSelected,
                                        ]}
                                      >
                                        <View
                                          style={[
                                            styles.checkbox,
                                            selected &&
                                              styles.checkboxSelected,
                                          ]}
                                        >
                                          {selected ? (
                                            <Text
                                              style={
                                                styles.checkmark
                                              }
                                            >
                                              ✓
                                            </Text>
                                          ) : null}
                                        </View>

                                        <View
                                          style={
                                            styles.subcategoryContent
                                          }
                                        >
                                          <Text
                                            style={
                                              styles.subcategoryName
                                            }
                                          >
                                            {
                                              subcategory.name
                                            }
                                          </Text>

                                          {!!subcategory.description && (
                                            <Text
                                              style={
                                                styles.subcategoryDescription
                                              }
                                            >
                                              {
                                                subcategory.description
                                              }
                                            </Text>
                                          )}
                                        </View>
                                      </TouchableOpacity>
                                    );
                                  },
                                )
                            )}
                          </View>
                        ) : null}
                      </View>
                    );
                  },
                )
              )}
            </ScrollView>

            <View
              style={
                styles.modalFooter
              }
            >
              <Pressable
                onPress={() => {
                  if (
                    selectedServiceSelections.length ===
                    0
                  ) {
                    Alert.alert(
                      'Services required',
                      'Please select at least one service category and subcategory provided by your business.',
                    );

                    return;
                  }

                  closeServicesModal();
                }}
                style={[
                  styles.modalDoneButton,
                  selectedServiceSelections.length ===
                    0 &&
                    styles.modalDoneButtonDisabled,
                ]}
              >
                <Text
                  style={
                    styles.modalDoneButtonText
                  }
                >
                  Done
                </Text>
              </Pressable>
            </View>
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

    content: {
      paddingHorizontal:
        SPACING.xxl,
      paddingTop:
        SPACING.xxl,
      paddingBottom:
        SPACING.huge,
    },

    title: {
      fontFamily:
        FONTS.bold,
      fontSize: 22,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },

    subtitle: {
      fontFamily:
        FONTS.regular,
      fontSize: 14,
      lineHeight: 21,
      color:
        COLORS.textSecondary,
      marginBottom:
        SPACING.xxl,
    },

    noAudienceCard: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      borderRadius:
        RADIUS.large,
      padding:
        SPACING.large,
      marginBottom:
        SPACING.large,
    },

    noAudienceTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 14,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },

    noAudienceText: {
      fontFamily:
        FONTS.regular,
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },

    catalogLoading: {
      minHeight: 140,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingVertical:
        SPACING.large,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.large,
      marginBottom:
        SPACING.large,
    },

    catalogLoadingText: {
      fontFamily:
        FONTS.regular,
      fontSize: 12,
      color:
        COLORS.textSecondary,
      marginTop:
        SPACING.small,
    },

    catalogError: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.large,
      padding:
        SPACING.large,
      marginBottom:
        SPACING.large,
    },

    catalogErrorTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 14,
      color:
        COLORS.text,
      marginBottom: 6,
    },

    catalogErrorText: {
      fontFamily:
        FONTS.regular,
      fontSize: 12,
      lineHeight: 17,
      color:
        COLORS.textSecondary,
    },

    retryButton: {
      alignSelf:
        'flex-start',
      marginTop:
        SPACING.medium,
      paddingHorizontal:
        SPACING.large,
      paddingVertical:
        SPACING.small,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
    },

    retryButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 12,
      color:
        COLORS.white,
    },

    serviceSelector: {
      minHeight: 68,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.medium,
    },

    serviceSelectorRequired: {
      borderColor:
        COLORS.themeColor,
    },

    serviceSelectorLeft: {
      flex: 1,
    },

    serviceSelectorTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 14,
      color:
        COLORS.text,
      marginBottom: 3,
    },

    serviceSelectorSubtitle: {
      fontFamily:
        FONTS.regular,
      fontSize: 11,
      color:
        COLORS.textSecondary,
    },

    serviceSelectorArrow: {
      fontFamily:
        FONTS.regular,
      fontSize: 30,
      lineHeight: 30,
      color:
        COLORS.themeColor,
      marginLeft:
        SPACING.medium,
    },

    requiredText: {
      fontFamily:
        FONTS.regular,
      fontSize: 11,
      color:
        COLORS.textSecondary,
      marginTop:
        SPACING.small,
    },

    // ========================================================
    // SELECTED SERVICE CATEGORIES
    // ========================================================

    selectedServicesPreview: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      padding:
        SPACING.medium,
      marginTop:
        SPACING.medium,
    },

    selectedPreviewHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom:
        SPACING.medium,
    },

    selectedPreviewHeaderLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    selectedPreviewTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 13,
      color:
        COLORS.text,
    },

    selectedPreviewCount: {
      fontFamily:
        FONTS.regular,
      fontSize: 10,
      color:
        COLORS.textSecondary,
      marginLeft:
        SPACING.small,
    },

    editServicesText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 12,
      color:
        COLORS.themeColor,
    },

    // ========================================================
    // CATEGORY
    // ========================================================

    selectedCategoryGroup: {
      paddingBottom:
        SPACING.small,
    },

    selectedCategoryGroupSpacing: {
      marginTop:
        SPACING.medium,
      paddingTop:
        SPACING.medium,
      borderTopWidth:
        1,
      borderTopColor:
        COLORS.border,
    },

    selectedCategoryHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginBottom:
        SPACING.small,
    },

    selectedCategoryNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        COLORS.background,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        SPACING.small,
    },

    selectedCategoryNumberText: {
      fontFamily:
        FONTS.bold,
      fontSize: 12,
      color:
        COLORS.themeColor,
    },

    selectedCategoryHeaderContent: {
      flex: 1,
    },

    selectedCategoryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 14,
      color:
        COLORS.text,
    },

    selectedCategoryMeta: {
      fontFamily:
        FONTS.regular,
      fontSize: 10,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },

    // ========================================================
    // SUBCATEGORY
    // ========================================================

    selectedSubcategoryGroup: {
      marginLeft:
        36,
      marginBottom:
        SPACING.small,
    },

    selectedSubcategoryHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      minHeight: 25,
    },

    selectedSubcategoryNumber: {
      width: 22,
      fontFamily:
        FONTS.semiBold,
      fontSize: 11,
      color:
        COLORS.themeColor,
    },

    selectedSubcategoryHeaderContent: {
      flex: 1,
    },

    selectedSubcategoryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 12,
      color:
        COLORS.text,
    },

    // ========================================================
    // AUDIENCE
    // ========================================================

    selectedAudienceList: {
      marginLeft:
        22,
      marginTop: 2,
    },

    selectedAudienceRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      minHeight: 24,
    },

    selectedAudienceIndicator: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor:
        COLORS.themeColor,
      marginRight:
        SPACING.small,
    },

    selectedAudienceText: {
      fontFamily:
        FONTS.regular,
      fontSize: 11,
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // SHOW MORE
    // ========================================================

    moreSelectedButton: {
      flexDirection:
        'row',
      alignItems:
        'center',
      alignSelf:
        'flex-start',
      marginTop:
        SPACING.small,
      paddingVertical: 5,
      paddingHorizontal: 2,
    },

    moreSelectedText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 11,
      color:
        COLORS.themeColor,
    },

    moreSelectedArrow: {
      fontFamily:
        FONTS.bold,
      fontSize: 15,
      lineHeight: 15,
      color:
        COLORS.themeColor,
      marginLeft: 5,
    },

    // ========================================================
    // MODAL
    // ========================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.45)',
      justifyContent:
        'flex-end',
    },

    servicesModal: {
      width:
        '100%',
      height:
        '90%',
      backgroundColor:
        COLORS.surface,
      borderTopLeftRadius:
        RADIUS.large,
      borderTopRightRadius:
        RADIUS.large,
      overflow:
        'hidden',
    },

    modalHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      paddingHorizontal:
        SPACING.large,
      paddingTop:
        SPACING.large,
      paddingBottom:
        SPACING.medium,
      borderBottomWidth:
        1,
      borderBottomColor:
        COLORS.border,
    },

    modalHeaderText: {
      flex: 1,
      paddingRight:
        SPACING.medium,
    },

    modalTitle: {
      fontFamily:
        FONTS.bold,
      fontSize: 19,
      color:
        COLORS.text,
      marginBottom: 3,
    },

    modalSubtitle: {
      fontFamily:
        FONTS.regular,
      fontSize: 11,
      color:
        COLORS.textSecondary,
    },

    modalCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        COLORS.background,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    modalCloseText: {
      fontFamily:
        FONTS.regular,
      fontSize: 28,
      lineHeight: 30,
      color:
        COLORS.textSecondary,
      marginTop: -2,
    },

    audienceTabsContainer: {
      flexDirection:
        'row',
      backgroundColor:
        COLORS.background,
      paddingHorizontal:
        SPACING.medium,
      paddingTop:
        SPACING.medium,
      paddingBottom:
        SPACING.small,
      borderBottomWidth:
        1,
      borderBottomColor:
        COLORS.border,
    },

    audienceTab: {
      flex: 1,
      minHeight: 50,
      alignItems:
        'center',
      justifyContent:
        'center',
      borderRadius:
        RADIUS.medium,
      marginHorizontal: 3,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    audienceTabActive: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    audienceTabText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 13,
      color:
        COLORS.text,
    },

    audienceTabTextActive: {
      color:
        COLORS.white,
    },

    audienceTabCount: {
      fontFamily:
        FONTS.regular,
      fontSize: 9,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },

    audienceTabCountActive: {
      color:
        COLORS.white,
      opacity: 0.9,
    },

    activeAudienceBar: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      paddingHorizontal:
        SPACING.large,
      paddingVertical:
        SPACING.medium,
      backgroundColor:
        COLORS.surface,
      borderBottomWidth:
        1,
      borderBottomColor:
        COLORS.border,
    },

    activeAudienceTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 13,
      color:
        COLORS.text,
    },

    activeAudienceSubtitle: {
      fontFamily:
        FONTS.regular,
      fontSize: 10,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },

    activeAudienceBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems:
        'center',
      justifyContent:
        'center',
      backgroundColor:
        COLORS.background,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
    },

    activeAudienceBadgeText: {
      fontFamily:
        FONTS.bold,
      fontSize: 13,
      color:
        COLORS.themeColor,
    },

    modalSelectedBar: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      backgroundColor:
        COLORS.background,
      paddingHorizontal:
        SPACING.large,
      paddingVertical:
        SPACING.small,
    },

    modalSelectedText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 12,
      color:
        COLORS.themeColor,
    },

    modalRequiredText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 10,
      color:
        COLORS.textSecondary,
    },

    modalScroll: {
      flex: 1,
    },

    modalScrollContent: {
      padding:
        SPACING.large,
      paddingBottom:
        SPACING.medium,
    },

    emptyAudienceState: {
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingVertical:
        SPACING.huge,
      paddingHorizontal:
        SPACING.xxl,
    },

    emptyAudienceIcon: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor:
        COLORS.background,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom:
        SPACING.medium,
    },

    emptyAudienceIconText: {
      fontFamily:
        FONTS.bold,
      fontSize: 24,
      color:
        COLORS.themeColor,
    },

    emptyAudienceTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 14,
      color:
        COLORS.text,
      textAlign:
        'center',
      marginBottom:
        SPACING.small,
    },

    emptyAudienceText: {
      fontFamily:
        FONTS.regular,
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
      textAlign:
        'center',
    },

    modalCategory: {
      marginBottom:
        SPACING.small,
    },

    modalCategoryHeader: {
      minHeight: 66,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      backgroundColor:
        COLORS.background,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
    },

    modalCategoryHeaderOpen: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderColor:
        COLORS.themeColor,
    },

    modalCategoryHeaderLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    categoryIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        SPACING.medium,
    },

    categoryIconText: {
      fontFamily:
        FONTS.bold,
      fontSize: 14,
      color:
        COLORS.themeColor,
    },

    modalCategoryText: {
      flex: 1,
    },

    modalCategoryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 14,
      color:
        COLORS.text,
      marginBottom: 3,
    },

    modalCategoryMeta: {
      fontFamily:
        FONTS.regular,
      fontSize: 10,
      color:
        COLORS.textSecondary,
    },

    categoryCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        SPACING.medium,
      backgroundColor:
        COLORS.surface,
    },

    categoryCheckboxSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    categoryCheckboxPartial: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    categoryCheckboxDisabled: {
      opacity:
        0.45,
    },

    categoryCheckmark: {
      color:
        COLORS.white,
      fontFamily:
        FONTS.bold,
      fontSize: 15,
      lineHeight: 18,
    },

    categoryPartialMark: {
      color:
        COLORS.white,
      fontFamily:
        FONTS.bold,
      fontSize: 18,
      lineHeight: 18,
    },

    categoryToggle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginLeft:
        SPACING.small,
    },

    categoryToggleText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 20,
      lineHeight: 22,
      color:
        COLORS.themeColor,
      marginTop: -1,
    },

    modalSubcategories: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor:
        COLORS.themeColor,
      borderBottomLeftRadius:
        RADIUS.medium,
      borderBottomRightRadius:
        RADIUS.medium,
      padding:
        SPACING.small,
    },

    modalSubcategoryRow: {
      minHeight: 54,
      flexDirection:
        'row',
      alignItems:
        'center',
      backgroundColor:
        COLORS.background,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
      marginBottom:
        SPACING.small,
    },

    modalSubcategoryRowSelected: {
      borderColor:
        COLORS.themeColor,
      backgroundColor:
        COLORS.surface,
    },

    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        SPACING.medium,
    },

    checkboxSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    checkmark: {
      color:
        COLORS.white,
      fontFamily:
        FONTS.bold,
      fontSize: 14,
      lineHeight: 18,
    },

    subcategoryContent: {
      flex: 1,
    },

    subcategoryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 13,
      color:
        COLORS.text,
    },

    subcategoryDescription: {
      fontFamily:
        FONTS.regular,
      fontSize: 11,
      lineHeight: 15,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },

    noSubcategoryText: {
      fontFamily:
        FONTS.regular,
      fontSize: 11,
      color:
        COLORS.textSecondary,
      paddingVertical:
        SPACING.small,
      paddingHorizontal:
        SPACING.small,
    },

    modalFooter: {
      padding:
        SPACING.large,
      paddingTop:
        SPACING.medium,
      borderTopWidth:
        1,
      borderTopColor:
        COLORS.border,
      backgroundColor:
        COLORS.surface,
    },

    modalDoneButton: {
      height: 52,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    modalDoneButtonDisabled: {
      opacity:
        0.55,
    },

    modalDoneButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 15,
      color:
        COLORS.white,
    },

    infoCard: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.large,
      padding:
        SPACING.large,
      marginTop:
        SPACING.large,
      marginBottom:
        SPACING.large,
    },

    infoTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 15,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },

    infoText: {
      fontFamily:
        FONTS.regular,
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
      marginBottom:
        SPACING.small,
    },

    button: {
      width:
        '100%',
      backgroundColor:
        COLORS.themeColor,
      height: 54,
      borderRadius:
        RADIUS.medium,
    },

    buttonText: {
      color:
        COLORS.white,
      fontFamily:
        FONTS.semiBold,
      fontSize: 15,
      textAlign:
        'center',
    },
  });

