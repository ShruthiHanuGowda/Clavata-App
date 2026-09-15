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

// ============================================================
// GRAPHQL
// ============================================================

const GET_ACTIVE_CATEGORIES = gql`
  query GetActiveCategories {
    categories(status: ACTIVE) {
      success
      message

      categories {
        categoryId
        name
        description
        servicesCount
        status
      }

      totalCount
    }
  }
`;

const GET_ACTIVE_SUBCATEGORIES = gql`
  query GetActiveSubcategories(
    $categoryId: ID
  ) {
    subcategories(
      categoryId: $categoryId
      status: ACTIVE
    ) {
      success
      message

      subcategories {
        subcategoryId
        categoryId
        name
        description
        servicesCount
        status
      }

      totalCount
    }
  }
`;

// ============================================================
// TYPES
// ============================================================

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
    normalizeCategoryName(
      categoryName,
    );

  return (
    categoryIcons[
      normalizedName
    ] ||
    fallbackIcon
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

  // ==========================================================
  // CATEGORY STATE
  // ==========================================================

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  // ==========================================================
  // SUBCATEGORY CACHE
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
      selectedSubcategoryIds || [],
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
  // SUBCATEGORY QUERY
  // ==========================================================

  const activeCategoryId =
    activeCategory?.categoryId || '';

  const {
    data:
      subcategoryData,
    loading:
      subcategoriesLoading,
  } =
    useQuery<GetActiveSubcategoriesResponse>(
      GET_ACTIVE_SUBCATEGORIES,
      {
        variables: {
          categoryId:
            activeCategoryId || null,
        },

        skip:
          !activeCategoryId,

        fetchPolicy:
          'cache-and-network',
      },
    );

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
  // STORE SUBCATEGORIES
  // ==========================================================

  useEffect(() => {

    if (
      !activeCategoryId
    ) {
      return;
    }

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

    const activeSubcategories =
      apiSubcategories.filter(
        item =>
          item &&
          item.status ===
            'ACTIVE' &&
          item.categoryId ===
            activeCategoryId &&
          typeof item.name ===
            'string' &&
          item.name.trim().length >
            0,
      );

    setSubcategoriesByCategory(
      previous => ({
        ...previous,

        [activeCategoryId]:
          activeSubcategories,
      }),
    );

  }, [
    subcategoryData,
    activeCategoryId,
  ]);

  // ==========================================================
  // DISPLAY CATEGORIES
  // ==========================================================

  const displayCategories =
    useMemo(() => {

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

          seen.add(
            normalized,
          );

          return true;
        },
      );

    }, [categories]);

  // ==========================================================
  // CURRENT SUBCATEGORIES
  // ==========================================================

  const currentSubcategories =
    activeCategoryId
      ? (
          subcategoriesByCategory[
            activeCategoryId
          ] || []
        )
      : [];

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
        categorySubcategories.map(
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
  //
  // NEW
  //
  // This completely removes the selected category and all
  // subcategory selections belonging to that category.
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

    setActiveCategory(null);

    setModalVisible(false);

    // --------------------------------------------------------
    // Tell HomeScreenPage that there is NO selected category.
    // --------------------------------------------------------

    onSelect({
      categoryId: '',
      category: '',
      subcategoryIds: [],
    });
  };

  // ==========================================================
  // OPEN CATEGORY POPUP / TOGGLE CATEGORY
  //
  // NEW BEHAVIOR:
  //
  // 1. First tap on category -> opens services popup.
  // 2. Category already selected + tap again -> unselects it.
  //
  // This allows the user to remove a category completely.
  // ==========================================================

  const handleCategorySelect = (
    category: Category,
  ) => {

    if (
      !category?.categoryId
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

    // --------------------------------------------------------
    // CATEGORY IS ALREADY SELECTED
    //
    // Tapping it again means UNSELECT.
    // --------------------------------------------------------

    if (
      isCurrentlySelected
    ) {
      clearCategory(
        category,
      );

      return;
    }

    // --------------------------------------------------------
    // CATEGORY IS NOT SELECTED
    //
    // Open the services popup.
    // --------------------------------------------------------

    const existingSubcategories =
      subcategoriesByCategory[
        categoryId
      ] || [];

    const categorySubcategoryIds =
      new Set(
        existingSubcategories.map(
          item =>
            item.subcategoryId,
        ),
      );

    const selectedForCategory =
      internalSelectedSubcategoryIds.filter(
        id =>
          categorySubcategoryIds.has(
            id,
          ),
      );

    setActiveCategory(
      category,
    );

    setModalSelectedSubcategoryIds(
      selectedForCategory,
    );

    setModalVisible(true);
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
  //
  // IMPORTANT:
  //
  // Even when ZERO subcategories are selected, we still send
  // the categoryId to HomeScreenPage.
  //
  // Therefore:
  //
  // category + no service
  //       ↓
  // categoryId = selected category
  // subcategoryIds = []
  //
  // HomeScreenPage can then request category-only salons.
  // ==========================================================

  const handleDone = () => {

    if (
      !activeCategory
    ) {
      setModalVisible(false);
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

    // --------------------------------------------------------
    // Keep selections from OTHER categories
    // --------------------------------------------------------

    const selectionsFromOtherCategories =
      internalSelectedSubcategoryIds.filter(
        id =>
          !currentCategorySubcategoryIds.has(
            id,
          ),
      );

    // --------------------------------------------------------
    // Add current category selections
    //
    // This can legitimately be an EMPTY array.
    // --------------------------------------------------------

    const nextSelectedIds = [
      ...selectionsFromOtherCategories,
      ...modalSelectedSubcategoryIds,
    ];

    setInternalSelectedSubcategoryIds(
      nextSelectedIds,
    );

    // --------------------------------------------------------
    // ALWAYS send category.
    //
    // If no services are selected:
    //
    // {
    //   categoryId: "CAT#...",
    //   category: "Hair",
    //   subcategoryIds: []
    // }
    //
    // This is exactly what HomeScreenPage needs for
    // category-only filtering.
    // --------------------------------------------------------

    onSelect({
      categoryId:
        activeCategory.categoryId,

      category:
        activeCategory.name.trim(),

      subcategoryIds:
        nextSelectedIds,
    });

    setModalVisible(false);
  };

  // ==========================================================
  // CLOSE POPUP WITHOUT APPLYING
  // ==========================================================

  const handleCancel = () => {

    setModalVisible(false);
  };

  // ==========================================================
  // LOADING CATEGORIES
  // ==========================================================

  if (
    categoriesLoading &&
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
              (
                selectedCategoryId &&
                selectedCategoryId ===
                  item.categoryId
              ) ||
              (
                !selectedCategoryId &&
                selectedCategory &&
                normalizeCategoryName(
                  selectedCategory,
                ) ===
                  normalizeCategoryName(
                    categoryName,
                  )
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

                {/* ================================================= */}
                {/* CHECK */}
                {/* ================================================= */}

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

                {/* ================================================= */}
                {/* BADGE */}
                {/* ================================================= */}

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

          {/* ================================================= */}
          {/* MODAL CARD */}
          {/* ================================================= */}

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
            {/* NO SUBCATEGORIES */}
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
                    No services available
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
                  modalSelectedSubcategoryIds.length
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

