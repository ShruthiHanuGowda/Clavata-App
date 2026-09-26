import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';

import {
  COLORS,
  SPACING,
} from '../../../constants/constants';

import {
  useQuery,
  gql,
} from '@apollo/client';

import {
  GET_ACTIVE_CATEGORIES,
  GET_ACTIVE_SUBCATEGORIES
} from '../../../graphql/queries';

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
  status: 'ACTIVE' | 'INACTIVE';
};

type Subcategory = {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  servicesCount: number;
  status: 'ACTIVE' | 'INACTIVE';

  /**
   * Audience(s) for which this service is available.
   *
   * Examples:
   * ['FEMALE']
   * ['MALE']
   * ['KIDS']
   * ['FEMALE', 'MALE']
   * ['FEMALE', 'MALE', 'KIDS']
   */
  audience: ServiceAudience[];

  businessTypeIds?: string[];
};

type GetActiveCategoriesResponse = {
  categories: {
    success: boolean;
    message: string;
    categories: Category[];
    totalCount: number;
  };
};

type GetActiveSubcategoriesResponse = {
  subcategories: {
    success: boolean;
    message: string;
    subcategories: Subcategory[];
    totalCount: number;
  };
};

// ============================================================
// PROPS
// ============================================================

type Props = {
  onSelect: (selection: {
    categoryId: string;
    category: string;
    subcategoryIds: string[];
  }) => void;

  selectedCategoryId?: string;

  selectedCategory?: string;

  selectedSubcategoryIds?: string[];

  selectedAudiences?: ServiceAudience[];
};

// ============================================================
// ICON MAP
//
// KEEP THESE EXACTLY AS THEY ARE
// ============================================================

const categoryIcons: Record<string, any> = {
  hair: require('../../../assets/3d/hair.png'),
  face: require('../../../assets/3d/face.png'),
  skin: require('../../../assets/3d/skin.png'),
  nails: require('../../../assets/3d/nails.png'),
  makeup: require('../../../assets/3d/makeup.png'),
  beard: require('../../../assets/3d/beard.png'),
  spa: require('../../../assets/3d/spa.png'),
  massage: require('../../../assets/3d/massage.png'),
  waxing: require('../../../assets/3d/waxing.png'),
  threading: require('../../../assets/3d/threading.png'),
  bridal: require('../../../assets/3d/bridal.png'),
  "men's grooming": require('../../../assets/3d/mens_grooming.png'),
};

// ============================================================
// FALLBACK ICON
// ============================================================

const fallbackIcon =
  require('../../../assets/3d/hair.png');

// ============================================================
// HELPERS
// ============================================================

const normalizeCategoryName = (
  value: string,
): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const getCategoryIcon = (
  categoryName: string,
) => {
  const normalizedName =
    normalizeCategoryName(categoryName);

  return (
    categoryIcons[normalizedName] ||
    fallbackIcon
  );
};

// ============================================================
// AUDIENCE MATCHING
//
// A subcategory is available when ANY of the selected
// customer audiences is present in the subcategory audience.
// ============================================================

const matchesSelectedAudiences = (
  subcategory: Subcategory,
  selectedAudiences: ServiceAudience[],
): boolean => {
  if (
    !Array.isArray(selectedAudiences) ||
    selectedAudiences.length === 0
  ) {
    return false;
  }

  if (
    !Array.isArray(subcategory?.audience) ||
    subcategory.audience.length === 0
  ) {
    return false;
  }

  return selectedAudiences.some(
    selectedAudience =>
      subcategory.audience.includes(
        selectedAudience,
      ),
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function ServiceChips({
  onSelect,
  selectedCategoryId = '',
  selectedCategory = '',
  selectedSubcategoryIds = [],
  selectedAudiences = [],
}: Props) {
  // ==========================================================
  // CATEGORIES QUERY
  // ==========================================================

  const {
    data,
    loading: categoriesLoading,
  } =
    useQuery<GetActiveCategoriesResponse>(
      GET_ACTIVE_CATEGORIES,
      {
        fetchPolicy:
          'cache-and-network',
      },
    );

  console.log("GET_ACTIVE_CATEGORIES", data)

  // ==========================================================
  // ALL SUBCATEGORIES QUERY
  //
  // IMPORTANT:
  // We intentionally do NOT pass categoryId here.
  //
  // We need all active subcategories so we can determine
  // which categories support the selected audience.
  // ==========================================================

const {
  data: subcategoryData,
  loading: subcategoriesLoading,
  error: subcategoriesError,
} = useQuery<GetActiveSubcategoriesResponse>(
  GET_ACTIVE_SUBCATEGORIES,
  {
    fetchPolicy: 'network-only',
  },
);

  console.log(
    '========== SUBCATEGORY QUERY =========='
  );

  console.log(
    'SUBCATEGORY DATA:',
    JSON.stringify(
      subcategoryData,
      null,
      2,
    ),
  );
console.log(
  'SUBCATEGORY ERROR:',
  subcategoriesError
    ? JSON.stringify(
        subcategoriesError,
        null,
        2,
      )
    : null,
);
  console.log(
    'ALL SUBCATEGORIES:',
    JSON.stringify(
      subcategoryData?.subcategories?.subcategories,
      null,
      2,
    ),
  );

  console.log(
    'ALL SUBCATEGORIES:',
    JSON.stringify(
      subcategoryData?.subcategories?.subcategories,
      null,
      2,
    ),
  );

  console.log(
    'SELECTED AUDIENCES:',
    selectedAudiences,
  );
  // ==========================================================
  // CATEGORY STATE
  // ==========================================================

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  // ==========================================================
  // SUBCATEGORY CACHE
  //
  // {
  //   categoryId: [
  //     subcategory,
  //     subcategory
  //   ]
  // }
  // ==========================================================

  const [
    subcategoriesByCategory,
    setSubcategoriesByCategory,
  ] =
    useState<
      Record<string, Subcategory[]>
    >({});

  // ==========================================================
  // SELECTED SUBCATEGORIES
  // ==========================================================

  const [
    internalSelectedSubcategoryIds,
    setInternalSelectedSubcategoryIds,
  ] =
    useState<string[]>(
      Array.isArray(
        selectedSubcategoryIds,
      )
        ? selectedSubcategoryIds
        : [],
    );

  // ==========================================================
  // POPUP STATE
  // ==========================================================

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<Category | null>(
    null,
  );

  // ==========================================================
  // TEMPORARY SELECTION INSIDE POPUP
  // ==========================================================

  const [
    modalSelectedSubcategoryIds,
    setModalSelectedSubcategoryIds,
  ] =
    useState<string[]>([]);

  // ==========================================================
  // NORMALIZED SELECTED AUDIENCES
  // ==========================================================

  const normalizedSelectedAudiences =
    useMemo(() => {
      if (
        !Array.isArray(
          selectedAudiences,
        )
      ) {
        return [];
      }

      return Array.from(
        new Set(
          selectedAudiences.filter(
            audience =>
              audience ===
              'FEMALE' ||
              audience ===
              'MALE' ||
              audience ===
              'KIDS',
          ),
        ),
      );
    }, [
      selectedAudiences,
    ]);

  // ==========================================================
  // ACTIVE CATEGORY ID
  // ==========================================================

  const activeCategoryId =
    activeCategory?.categoryId || '';

  // ==========================================================
  // UPDATE CATEGORIES
  // ==========================================================

  useEffect(() => {
    const apiCategories =
      data?.categories?.categories;

    if (
      !Array.isArray(
        apiCategories,
      )
    ) {
      return;
    }

    const activeCategories =
      apiCategories.filter(
        item =>
          item &&
          item.status ===
          'ACTIVE' &&
          typeof item.name ===
          'string' &&
          item.name.trim().length >
          0,
      );

    setCategories(
      activeCategories,
    );
  }, [data]);

  // ==========================================================
  // STORE ALL SUBCATEGORIES
  //
  // This is the important fix.
  //
  // We receive ALL active subcategories from GraphQL and
  // group them by categoryId.
  // ==========================================================

  useEffect(() => {
    const apiSubcategories =
      subcategoryData
        ?.subcategories
        ?.subcategories;

    if (
      !Array.isArray(
        apiSubcategories,
      )
    ) {
      return;
    }

    const grouped =
      apiSubcategories.reduce<
        Record<string, Subcategory[]>
      >(
        (
          result,
          item,
        ) => {
          if (
            !item ||
            item.status !==
            'ACTIVE' ||
            typeof item.categoryId !==
            'string' ||
            typeof item.name !==
            'string' ||
            item.name.trim().length ===
            0
          ) {
            return result;
          }

          if (
            !Array.isArray(
              item.audience,
            )
          ) {
            return result;
          }

          const categoryId =
            String(
              item.categoryId,
            );

          if (
            !result[
            categoryId
            ]
          ) {
            result[
              categoryId
            ] = [];
          }

          result[
            categoryId
          ].push(item);

          return result;
        },
        {},
      );

    setSubcategoriesByCategory(
      grouped,
    );
  }, [
    subcategoryData,
  ]);

  // ==========================================================
  // SYNC PARENT SELECTION
  // ==========================================================

  useEffect(() => {
    setInternalSelectedSubcategoryIds(
      Array.isArray(
        selectedSubcategoryIds,
      )
        ? selectedSubcategoryIds
        : [],
    );
  }, [
    selectedSubcategoryIds,
  ]);

  // ==========================================================
  // AUDIENCE CHANGE
  //
  // Remove selected subcategories that are no longer valid
  // for the selected audience combination.
  // ==========================================================

  useEffect(() => {
    if (
      normalizedSelectedAudiences.length ===
      0
    ) {
      setInternalSelectedSubcategoryIds(
        [],
      );

      setModalSelectedSubcategoryIds(
        [],
      );

      setActiveCategory(
        null,
      );

      setModalVisible(
        false,
      );

      return;
    }

    setInternalSelectedSubcategoryIds(
      previous => {
        if (
          previous.length ===
          0
        ) {
          return previous;
        }

        let changed =
          false;

        const next =
          previous.filter(
            subcategoryId => {
              let found =
                false;

              Object.values(
                subcategoriesByCategory,
              ).forEach(
                subcategories => {
                  const subcategory =
                    subcategories.find(
                      item =>
                        item.subcategoryId ===
                        subcategoryId,
                    );

                  if (
                    subcategory
                  ) {
                    found =
                      matchesSelectedAudiences(
                        subcategory,
                        normalizedSelectedAudiences,
                      );
                  }
                },
              );

              if (
                !found
              ) {
                changed =
                  true;

                return false;
              }

              return true;
            },
          );

        return changed
          ? next
          : previous;
      },
    );
  }, [
    normalizedSelectedAudiences,
    subcategoriesByCategory,
  ]);

  // ==========================================================
  // DISPLAY CATEGORIES
  //
  // ONLY categories having at least one subcategory matching
  // the selected audience(s) are displayed.
  //
  // Example:
  //
  // Female selected
  //   ↓
  // Hair has FEMALE service
  // Face has FEMALE service
  // Barber only has MALE
  //   ↓
  // Show Hair + Face
  // Hide Barber
  //
  // Female + Kids
  //   ↓
  // Show categories having FEMALE OR KIDS.
  // ==========================================================

  const displayCategories =
    useMemo(() => {
      if (
        normalizedSelectedAudiences.length ===
        0
      ) {
        return [];
      }

      const seen =
        new Set<string>();

      return categories.filter(
        category => {
          const normalized =
            normalizeCategoryName(
              category.name,
            );

          if (
            seen.has(
              normalized,
            )
          ) {
            return false;
          }

          const categorySubcategories =
            subcategoriesByCategory[
            category.categoryId
            ] ?? [];

          const hasMatchingSubcategory =
            categorySubcategories.some(
              subcategory =>
                matchesSelectedAudiences(
                  subcategory,
                  normalizedSelectedAudiences,
                ),
            );

          if (
            !hasMatchingSubcategory
          ) {
            return false;
          }

          seen.add(
            normalized,
          );

          return true;
        },
      );
    }, [
      categories,
      subcategoriesByCategory,
      normalizedSelectedAudiences,
    ]);

  // ==========================================================
  // CURRENT SUBCATEGORIES
  //
  // Only subcategories matching the selected audience(s)
  // are displayed inside the category modal.
  // ==========================================================

  const currentSubcategories =
    useMemo(() => {
      if (
        !activeCategoryId ||
        normalizedSelectedAudiences.length ===
        0
      ) {
        return [];
      }

      const subcategories =
        subcategoriesByCategory[
        activeCategoryId
        ] || [];

      return subcategories.filter(
        subcategory =>
          matchesSelectedAudiences(
            subcategory,
            normalizedSelectedAudiences,
          ),
      );
    }, [
      activeCategoryId,
      subcategoriesByCategory,
      normalizedSelectedAudiences,
    ]);

  // ==========================================================
  // GET SELECTED COUNT
  // ==========================================================

  const getSelectedCount = (
    categoryId: string,
  ): number => {
    const categorySubcategories =
      subcategoriesByCategory[
      categoryId
      ] || [];

    if (
      categorySubcategories.length ===
      0
    ) {
      return 0;
    }

    const categorySubcategoryIds =
      new Set(
        categorySubcategories
          .filter(
            subcategory =>
              matchesSelectedAudiences(
                subcategory,
                normalizedSelectedAudiences,
              ),
          )
          .map(
            subcategory =>
              subcategory.subcategoryId,
          ),
      );

    return internalSelectedSubcategoryIds.filter(
      subcategoryId =>
        categorySubcategoryIds.has(
          subcategoryId,
        ),
    ).length;
  };

  // ==========================================================
  // CLEAR CATEGORY
  // ==========================================================

  const clearCategory = (
    category: Category,
  ) => {
    const categoryId =
      category.categoryId;

    const categorySubcategories =
      subcategoriesByCategory[
      categoryId
      ] || [];

    const categorySubcategoryIds =
      new Set(
        categorySubcategories.map(
          item =>
            item.subcategoryId,
        ),
      );

    const remainingSubcategoryIds =
      internalSelectedSubcategoryIds.filter(
        id =>
          !categorySubcategoryIds.has(
            id,
          ),
      );

    setInternalSelectedSubcategoryIds(
      remainingSubcategoryIds,
    );

    setModalSelectedSubcategoryIds(
      [],
    );

    setActiveCategory(
      null,
    );

    setModalVisible(
      false,
    );

    onSelect({
      categoryId: '',
      category: '',
      subcategoryIds: [],
    });
  };

  // ==========================================================
  // OPEN CATEGORY POPUP / TOGGLE CATEGORY
  // ==========================================================

  const handleCategorySelect = (
    category: Category,
  ) => {
    if (
      !category?.categoryId
    ) {
      return;
    }

    if (
      normalizedSelectedAudiences.length ===
      0
    ) {
      return;
    }

    const categoryId =
      category.categoryId;

    const isCurrentlySelected =
      Boolean(
        selectedCategoryId &&
        selectedCategoryId ===
        categoryId,
      ) ||
      Boolean(
        !selectedCategoryId &&
        selectedCategory &&
        normalizeCategoryName(
          selectedCategory,
        ) ===
        normalizeCategoryName(
          category.name,
        ),
      );

    // ========================================================
    // CATEGORY ALREADY SELECTED
    // ========================================================

    if (
      isCurrentlySelected
    ) {
      clearCategory(
        category,
      );

      return;
    }

    // ========================================================
    // OPEN CATEGORY
    // ========================================================

    const existingSubcategories =
      subcategoriesByCategory[
      categoryId
      ] || [];

    const selectedForCategory =
      internalSelectedSubcategoryIds.filter(
        id =>
          existingSubcategories.some(
            subcategory =>
              subcategory.subcategoryId ===
              id &&
              matchesSelectedAudiences(
                subcategory,
                normalizedSelectedAudiences,
              ),
          ),
      );

    setActiveCategory(
      category,
    );

    setModalSelectedSubcategoryIds(
      selectedForCategory,
    );

    setModalVisible(
      true,
    );
  };

  // ==========================================================
  // TOGGLE SUBCATEGORY
  // ==========================================================

  const handleSubcategoryToggle = (
    subcategoryId: string,
  ) => {
    if (
      !subcategoryId
    ) {
      return;
    }

    const currentSubcategory =
      currentSubcategories.find(
        item =>
          item.subcategoryId ===
          subcategoryId,
      );

    if (
      !currentSubcategory
    ) {
      return;
    }

    setModalSelectedSubcategoryIds(
      previous => {
        if (
          previous.includes(
            subcategoryId,
          )
        ) {
          return previous.filter(
            id =>
              id !==
              subcategoryId,
          );
        }

        return [
          ...previous,
          subcategoryId,
        ];
      },
    );
  };

  // ==========================================================
  // DONE
  // ==========================================================

  const handleDone = () => {
    if (
      !activeCategory
    ) {
      setModalVisible(
        false,
      );

      return;
    }

    const categoryId =
      activeCategory.categoryId;

    const currentCategorySubcategories =
      subcategoriesByCategory[
      categoryId
      ] || [];

    const currentCategorySubcategoryIds =
      new Set(
        currentCategorySubcategories.map(
          item =>
            item.subcategoryId,
        ),
      );

    // ========================================================
    // KEEP OTHER CATEGORY SELECTIONS
    // ========================================================

    const selectionsFromOtherCategories =
      internalSelectedSubcategoryIds.filter(
        id =>
          !currentCategorySubcategoryIds.has(
            id,
          ),
      );

    // ========================================================
    // ONLY KEEP VALID AUDIENCE SELECTIONS
    // ========================================================

    const validModalSelections =
      modalSelectedSubcategoryIds.filter(
        id =>
          currentSubcategories.some(
            subcategory =>
              subcategory.subcategoryId ===
              id,
          ),
      );

    // ========================================================
    // COMBINE
    // ========================================================

    const nextSelectedIds = [
      ...selectionsFromOtherCategories,
      ...validModalSelections,
    ];

    const uniqueSelectedIds =
      Array.from(
        new Set(
          nextSelectedIds,
        ),
      );

    setInternalSelectedSubcategoryIds(
      uniqueSelectedIds,
    );

    // ========================================================
    // SEND TO HOMESCREEN
    // ========================================================

    onSelect({
      categoryId:
        activeCategory.categoryId,

      category:
        activeCategory.name.trim(),

      subcategoryIds:
        uniqueSelectedIds,
    });

    setModalVisible(
      false,
    );
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = () => {
    setModalVisible(
      false,
    );
  };

  // ==========================================================
  // LOADING
  //
  // Wait for BOTH category and subcategory information before
  // deciding that there are no categories.
  // ==========================================================

  const initialLoading =
    categoriesLoading ||
    subcategoriesLoading;

  if (
    initialLoading &&
    displayCategories.length ===
    0
  ) {
    return (
      <View
        style={
          styles.wrapper
        }
      >
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
        </View>
      </View>
    );
  }

  // ==========================================================
  // NO AUDIENCE
  // ==========================================================

  if (
    normalizedSelectedAudiences.length ===
    0
  ) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <View
      style={
        styles.wrapper
      }
    >
      {/* ================================================== */}
      {/* CATEGORY GRID */}
      {/* ================================================== */}

      <View
        style={
          styles.grid
        }
      >
        {displayCategories.map(
          item => {
            const categoryName =
              item.name.trim();

            const selectedCount =
              getSelectedCount(
                item.categoryId,
              );

            const isSelected =
              Boolean(
                selectedCategoryId &&
                selectedCategoryId ===
                item.categoryId,
              ) ||
              Boolean(
                !selectedCategoryId &&
                selectedCategory &&
                normalizeCategoryName(
                  selectedCategory,
                ) ===
                normalizeCategoryName(
                  categoryName,
                ),
              );

            const icon =
              getCategoryIcon(
                categoryName,
              );

            return (
              <TouchableOpacity
                key={
                  item.categoryId
                }
                activeOpacity={
                  0.85
                }
                onPress={() =>
                  handleCategorySelect(
                    item,
                  )
                }
                style={[
                  styles.card,
                  isSelected &&
                  styles.cardSelected,
                ]}
              >
                {/* IMAGE */}

                <View
                  style={[
                    styles.imageContainer,
                    isSelected &&
                    styles.imageContainerSelected,
                  ]}
                >
                  <Image
                    source={
                      icon
                    }
                    style={
                      styles.image
                    }
                    resizeMode="contain"
                  />
                </View>

                {/* NAME */}

                <Text
                  numberOfLines={
                    1
                  }
                  ellipsizeMode="tail"
                  style={[
                    styles.name,
                    isSelected &&
                    styles.nameSelected,
                  ]}
                >
                  {
                    categoryName
                  }
                </Text>

                {/* CHECK */}

                {isSelected &&
                  selectedCount ===
                  0 && (
                    <View
                      style={
                        styles.checkContainer
                      }
                    >
                      <Text
                        style={
                          styles.check
                        }
                      >
                        ✓
                      </Text>
                    </View>
                  )}

                {/* BADGE */}

                {selectedCount >
                  0 && (
                    <View
                      style={
                        styles.countBadge
                      }
                    >
                      <Text
                        style={
                          styles.countBadgeText
                        }
                      >
                        {
                          selectedCount
                        }
                      </Text>
                    </View>
                  )}
              </TouchableOpacity>
            );
          },
        )}
      </View>

      {/* ================================================== */}
      {/* SUBCATEGORY POPUP */}
      {/* ================================================== */}

      <Modal
        visible={
          modalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          handleCancel
        }
      >
        {/* BACKDROP */}

        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={
            handleCancel
          }
        >
          {/* MODAL CARD */}

          <Pressable
            style={
              styles.modalCard
            }
            onPress={event =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalTitleContainer
                }
              >
                {activeCategory && (
                  <View
                    style={
                      styles.modalIconContainer
                    }
                  >
                    <Image
                      source={getCategoryIcon(
                        activeCategory.name,
                      )}
                      style={
                        styles.modalIcon
                      }
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View>
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    {activeCategory?.name ||
                      'Select services'}
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Select one or more services
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={
                  0.7
                }
                onPress={
                  handleCancel
                }
                style={
                  styles.closeButton
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

            {/* ================================================= */}
            {/* AUDIENCE INFORMATION */}
            {/* ================================================= */}

            <View
              style={
                styles.audienceInfo
              }
            >
              <Text
                style={
                  styles.audienceInfoLabel
                }
              >
                Services for
              </Text>

              <Text
                style={
                  styles.audienceInfoValue
                }
              >
                {normalizedSelectedAudiences
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
                  .join(
                    ', ',
                  )}
              </Text>
            </View>

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {subcategoriesLoading &&
              currentSubcategories.length ===
              0 && (
                <View
                  style={
                    styles.modalLoading
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
                      styles.loadingText
                    }
                  >
                    Loading services...
                  </Text>
                </View>
              )}

            {/* ================================================= */}
            {/* SUBCATEGORY LIST */}
            {/* ================================================= */}

            {!subcategoriesLoading &&
              currentSubcategories.length >
              0 && (
                <ScrollView
                  style={
                    styles.subcategoryList
                  }
                  contentContainerStyle={
                    styles.subcategoryListContent
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                >
                  {currentSubcategories.map(
                    subcategory => {
                      const isSelected =
                        modalSelectedSubcategoryIds.includes(
                          subcategory.subcategoryId,
                        );

                      return (
                        <TouchableOpacity
                          key={
                            subcategory.subcategoryId
                          }
                          activeOpacity={
                            0.85
                          }
                          onPress={() =>
                            handleSubcategoryToggle(
                              subcategory.subcategoryId,
                            )
                          }
                          style={[
                            styles.subcategoryRow,
                            isSelected &&
                            styles.subcategoryRowSelected,
                          ]}
                        >
                          <View
                            style={
                              styles.subcategoryTextContainer
                            }
                          >
                            <Text
                              style={[
                                styles.subcategoryName,
                                isSelected &&
                                styles.subcategoryNameSelected,
                              ]}
                            >
                              {
                                subcategory.name
                              }
                            </Text>

                            {subcategory.description && (
                              <Text
                                numberOfLines={
                                  1
                                }
                                style={[
                                  styles.subcategoryDescription,
                                  isSelected &&
                                  styles.subcategoryDescriptionSelected,
                                ]}
                              >
                                {
                                  subcategory.description
                                }
                              </Text>
                            )}
                          </View>

                          {/* CHECKBOX */}

                          <View
                            style={[
                              styles.checkbox,
                              isSelected &&
                              styles.checkboxSelected,
                            ]}
                          >
                            {isSelected && (
                              <Text
                                style={
                                  styles.checkboxCheck
                                }
                              >
                                ✓
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </ScrollView>
              )}

            {/* ================================================= */}
            {/* NO MATCHING SERVICES */}
            {/* ================================================= */}

            {!subcategoriesLoading &&
              currentSubcategories.length ===
              0 && (
                <View
                  style={
                    styles.noSubcategoriesContainer
                  }
                >
                  <Text
                    style={
                      styles.noSubcategoriesText
                    }
                  >
                    No services available for the selected
                    audience
                  </Text>
                </View>
              )}

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <View
              style={
                styles.modalFooter
              }
            >
              <Text
                style={
                  styles.footerSelectedText
                }
              >
                {
                  modalSelectedSubcategoryIds.filter(
                    id =>
                      currentSubcategories.some(
                        subcategory =>
                          subcategory.subcategoryId ===
                          id,
                      ),
                  ).length
                }{' '}
                selected
              </Text>

              <TouchableOpacity
                activeOpacity={
                  0.85
                }
                onPress={
                  handleDone
                }
                style={
                  styles.doneButton
                }
              >
                <Text
                  style={
                    styles.doneButtonText
                  }
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    wrapper: {
      paddingHorizontal:
        SPACING.xl,
      marginBottom:
        SPACING.medium,
    },

    loadingContainer: {
      height: 68,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    grid: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      justifyContent:
        'space-between',
      rowGap: 7,
    },

    card: {
      width:
        '23.5%',
      height: 68,
      borderRadius: 12,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        '#EAEAEA',
      alignItems:
        'center',
      justifyContent:
        'center',
      position:
        'relative',
      shadowColor:
        COLORS.black,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity:
        0.025,
      shadowRadius: 3,
      elevation: 1,
    },

    cardSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
      shadowOpacity:
        0.10,
      elevation: 2,
    },

    imageContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor:
        '#F7F7F7',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 2,
    },

    imageContainerSelected: {
      backgroundColor:
        COLORS.white,
    },

    image: {
      width: 34,
      height: 34,
    },

    name: {
      width:
        '90%',
      fontSize:
        9.5,
      lineHeight:
        11,
      color:
        '#222222',
      fontWeight:
        '600',
      textAlign:
        'center',
      letterSpacing:
        -0.1,
    },

    nameSelected: {
      color:
        COLORS.white,
      fontWeight:
        '700',
    },

    checkContainer: {
      position:
        'absolute',
      top: 4,
      right: 4,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor:
        COLORS.themeColor,
      borderWidth: 1,
      borderColor:
        COLORS.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    check: {
      color:
        COLORS.white,
      fontSize: 8,
      lineHeight: 9,
      fontWeight:
        '900',
    },

    countBadge: {
      position:
        'absolute',
      top: 3,
      right: 3,
      minWidth: 17,
      height: 17,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.black,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    countBadgeText: {
      color:
        COLORS.black,
      fontSize: 9,
      lineHeight: 10,
      fontWeight:
        '800',
      textAlign:
        'center',
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.45)',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 20,
    },

    modalCard: {
      width:
        '100%',
      maxWidth: 430,
      maxHeight:
        '75%',
      backgroundColor:
        COLORS.white,
      borderRadius: 20,
      overflow:
        'hidden',
      shadowColor:
        COLORS.black,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity:
        0.20,
      shadowRadius: 12,
      elevation: 10,
    },

    modalHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 18,
      paddingTop: 17,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor:
        '#EEEEEE',
    },

    modalTitleContainer: {
      flexDirection:
        'row',
      alignItems:
        'center',
      flex: 1,
    },

    modalIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor:
        '#F7F7F7',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    modalIcon: {
      width: 34,
      height: 34,
    },

    modalTitle: {
      fontSize: 16,
      fontWeight:
        '800',
      color:
        '#222222',
    },

    modalSubtitle: {
      marginTop: 2,
      fontSize: 10.5,
      color:
        '#777777',
      fontWeight:
        '500',
    },

    audienceInfo: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor:
        '#F8F8F8',
      borderBottomWidth: 1,
      borderBottomColor:
        '#EEEEEE',
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    audienceInfoLabel: {
      fontSize: 10,
      color:
        '#777777',
      fontWeight:
        '600',
      marginRight: 5,
    },

    audienceInfoValue: {
      fontSize: 10,
      color:
        COLORS.themeColor,
      fontWeight:
        '800',
      flex: 1,
    },

    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor:
        '#F5F5F5',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginLeft: 10,
    },

    closeButtonText: {
      fontSize: 23,
      lineHeight: 25,
      color:
        '#555555',
      fontWeight:
        '400',
      marginTop: -2,
    },

    modalLoading: {
      minHeight: 120,
      alignItems:
        'center',
      justifyContent:
        'center',
      flexDirection:
        'row',
      gap: 8,
    },

    loadingText: {
      fontSize: 11,
      color:
        '#777777',
      fontWeight:
        '500',
    },

    subcategoryList: {
      maxHeight:
        380,
    },

    subcategoryListContent: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 8,
    },

    subcategoryRow: {
      minHeight: 55,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        '#E6E6E6',
      backgroundColor:
        COLORS.white,
      paddingHorizontal: 13,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    subcategoryRowSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    subcategoryTextContainer: {
      flex: 1,
      paddingRight: 10,
    },

    subcategoryName: {
      fontSize: 12.5,
      color:
        '#222222',
      fontWeight:
        '700',
    },

    subcategoryNameSelected: {
      color:
        COLORS.white,
    },

    subcategoryDescription: {
      marginTop: 2,
      fontSize: 9.5,
      color:
        '#888888',
      fontWeight:
        '500',
    },

    subcategoryDescriptionSelected: {
      color:
        'rgba(255,255,255,0.85)',
    },

    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor:
        '#D0D0D0',
      backgroundColor:
        COLORS.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    checkboxSelected: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.white,
    },

    checkboxCheck: {
      color:
        COLORS.white,
      fontSize: 13,
      lineHeight: 15,
      fontWeight:
        '900',
    },

    noSubcategoriesContainer: {
      minHeight: 120,
      paddingHorizontal: 25,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    noSubcategoriesText: {
      fontSize: 11,
      color:
        '#888888',
      paddingVertical: 8,
      textAlign:
        'center',
    },

    modalFooter: {
      minHeight: 65,
      paddingHorizontal: 16,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      borderTopWidth: 1,
      borderTopColor:
        '#EEEEEE',
      backgroundColor:
        COLORS.white,
    },

    footerSelectedText: {
      fontSize: 11,
      color:
        '#666666',
      fontWeight:
        '600',
    },

    doneButton: {
      minWidth: 90,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 20,
    },

    doneButtonText: {
      color:
        COLORS.white,
      fontSize: 12,
      fontWeight:
        '800',
    },
  });