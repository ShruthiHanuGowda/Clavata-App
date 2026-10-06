import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useQuery } from '@apollo/client';

import {
  COLORS,
  SPACING,
} from '../../../constants/constants';

import {
  GET_ACTIVE_CATEGORIES,
  GET_ACTIVE_SUBCATEGORIES,
} from '../../../graphql/queries';

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

  /*
   * IMPORTANT:
   * GraphQL now exposes:
   *
   * audiences: [ServiceAudience!]!
   */
  audiences: ServiceAudience[];

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

type Props = {
  onSelect: (selection: {
    categoryId: string;
    category: string;
    subcategoryIds: string[];
    audienceSubcategorySelections?: Array<{
      audience: ServiceAudience;
      subcategoryIds: string[];
    }>;
  }) => void;

  selectedCategoryId?: string;

  selectedCategory?: string;

  selectedSubcategoryIds?: string[];

  /**
   * Audience-specific selections.
   *
   * IMPORTANT:
   * A subcategory ID can be valid for multiple audiences.
   * Therefore the real selection identity is:
   *
   * audience + subcategoryId
   *
   * Example:
   * FEMALE + haircut-id
   * MALE + haircut-id
   *
   * are two different selections.
   */
  selectedAudienceSubcategorySelections?: Array<{
    audience: ServiceAudience;
    subcategoryIds: string[];
  }>;

  selectedAudiences?: ServiceAudience[];
};

/* =========================================================
   CATEGORY ICONS
========================================================= */

const categoryIcons: Record<string, any> = {
  "hair": require('../../../assets/category/Hair&styling.png'),
  "facial & skin care": require('../../../assets/category/Facials&skin.png'),
  // "hair color & treatments": require('../../../assets/category/Haircolor&treatments.png'),
  "nails": require('../../../assets/category/NailsHand&feet.png'),
  "makeup & bridal": require('../../../assets/category/Makeup.png'),
  "threading & hair removal": require('../../../assets/category/Waxing.png'),
  "lashes & brows": require('../../../assets/category/Threading.png'),
  "spa & massage": require('../../../assets/category/BridalIcon.png'),
  "body care & wellness": require('../../../assets/category/Facials&skin.png'),
};

const fallbackIcon =
  require('../../../assets/category/Facials&skin.png');

/* =========================================================
   HELPERS
========================================================= */

const normalizeCategoryName = (
  value: string,
): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/* =========================================================
   NORMALIZE AUDIENCES
========================================================= */

const normalizeAudienceList = (
  value: unknown,
): ServiceAudience[] => {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [value]
      : [];

  return values.filter(
    (
      item,
    ): item is ServiceAudience =>
      item === 'FEMALE' ||
      item === 'MALE' ||
      item === 'KIDS',
  );
};

/* =========================================================
   CATEGORY ICON
========================================================= */

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

/* =========================================================
   MATCH SELECTED AUDIENCES
========================================================= */

/**
 * OR behaviour:
 *
 * Female selected
 * → show Female services
 *
 * Female + Kids selected
 * → show services supporting Female OR Kids
 *
 * A subcategory supporting:
 * FEMALE + KIDS
 *
 * will appear under both audience sections.
 */
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

  /*
   * IMPORTANT:
   *
   * GraphQL field is now:
   *
   * audiences
   *
   * NOT:
   *
   * audience
   */
  const subcategoryAudiences =
    normalizeAudienceList(
      subcategory?.audiences,
    );

  if (
    subcategoryAudiences.length === 0
  ) {
    return false;
  }

  return selectedAudiences.some(
    selectedAudience =>
      subcategoryAudiences.includes(
        selectedAudience,
      ),
  );
};

/* =========================================================
   AUDIENCE LABEL
========================================================= */

const getAudienceLabel = (
  audience: ServiceAudience,
): string => {
  switch (audience) {
    case 'FEMALE':
      return 'Female';

    case 'MALE':
      return 'Male';

    case 'KIDS':
      return 'Kids';

    default:
      return '';
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const ServiceChips: React.FC<Props> = ({
  onSelect,
  selectedCategoryId,
  selectedCategory,
  selectedSubcategoryIds,
  selectedAudienceSubcategorySelections,
  selectedAudiences,
}) => {
  /* =======================================================
     GRAPHQL
  ======================================================= */

  const {
    data,
    loading: categoriesLoading,
    error: categoriesError,
  } =
    useQuery<GetActiveCategoriesResponse>(
      GET_ACTIVE_CATEGORIES,
      {
        fetchPolicy: 'cache-and-network',
      },
    );

  const {
    data: subcategoryData,
    loading: subcategoriesLoading,
    error: subcategoriesError,
  } =
    useQuery<GetActiveSubcategoriesResponse>(
      GET_ACTIVE_SUBCATEGORIES,
      {
        fetchPolicy: 'network-only',
      },
    );

  /* =======================================================
     STATE
  ======================================================= */

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    subcategoriesByCategory,
    setSubcategoriesByCategory,
  ] = useState<
    Record<string, Subcategory[]>
  >({});

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

  /**
   * IMPORTANT:
   * Do NOT store modal selections as only string IDs.
   *
   * The same subcategory can appear under multiple audience
   * sections. The selection must therefore include audience.
   */
  const [
    internalSelectedAudienceSubcategories,
    setInternalSelectedAudienceSubcategories,
  ] = useState<
    Record<ServiceAudience, string[]>
  >({
    FEMALE: [],
    MALE: [],
    KIDS: [],
  });

  const [
    modalSelectedAudienceSubcategories,
    setModalSelectedAudienceSubcategories,
  ] = useState<
    Record<ServiceAudience, string[]>
  >({
    FEMALE: [],
    MALE: [],
    KIDS: [],
  });

  /* =======================================================
     NORMALIZED AUDIENCES
  ======================================================= */

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
              audience === 'FEMALE' ||
              audience === 'MALE' ||
              audience === 'KIDS',
          ),
        ),
      );
    }, [selectedAudiences]);

  /* =======================================================
     ACTIVE CATEGORY ID
  ======================================================= */

  const activeCategoryId =
    activeCategory?.categoryId || '';

  /* =======================================================
     CATEGORY DATA
  ======================================================= */

  useEffect(() => {
    const apiCategories =
      data?.categories?.categories;

    if (
      !Array.isArray(apiCategories)
    ) {
      setCategories([]);
      return;
    }

    const activeCategories =
      apiCategories.filter(
        item =>
          item &&
          item.status === 'ACTIVE' &&
          typeof item.name === 'string' &&
          item.name.trim().length > 0 &&
          typeof item.categoryId === 'string' &&
          item.categoryId.trim().length > 0,
      );

    setCategories(activeCategories);

    console.log(
      '========================================',
    );

    console.log(
      'SERVICE CHIPS - ACTIVE CATEGORIES',
    );

    console.log(
      activeCategories.map(
        item => ({
          id: item.categoryId,
          name: item.name,
        }),
      ),
    );

    console.log(
      '========================================',
    );
  }, [data]);

  /* =======================================================
     SUBCATEGORY DATA
  ======================================================= */

  useEffect(() => {
    const apiSubcategories =
      subcategoryData
        ?.subcategories
        ?.subcategories;

    console.log(
      '========================================',
    );

    console.log(
      'SERVICE CHIPS - RAW SUBCATEGORIES',
    );

    console.log(
      JSON.stringify(
        apiSubcategories,
        null,
        2,
      ),
    );

    console.log(
      '========================================',
    );

    if (
      !Array.isArray(
        apiSubcategories,
      )
    ) {
      setSubcategoriesByCategory({});
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
            item.status !== 'ACTIVE' ||
            typeof item.categoryId !==
            'string' ||
            typeof item.name !==
            'string' ||
            item.name.trim().length === 0
          ) {
            return result;
          }

          const categoryId =
            String(
              item.categoryId,
            ).trim();

          if (!categoryId) {
            return result;
          }

          /*
           * IMPORTANT:
           *
           * Read GraphQL `audiences`.
           */
          const normalizedAudiences =
            normalizeAudienceList(
              item.audiences,
            );

          console.log(
            'SUBCATEGORY:',
            item.name,
            'SUBCATEGORY ID:',
            item.subcategoryId,
            'CATEGORY ID:',
            categoryId,
            'RAW AUDIENCES:',
            item.audiences,
            'NORMALIZED AUDIENCES:',
            normalizedAudiences,
          );

          if (
            normalizedAudiences.length === 0
          ) {
            console.warn(
              'SUBCATEGORY HAS NO VALID AUDIENCES:',
              item.name,
              item.audiences,
            );

            return result;
          }

          if (
            !result[categoryId]
          ) {
            result[categoryId] = [];
          }

          result[categoryId].push({
            ...item,

            categoryId,

            /*
             * IMPORTANT:
             *
             * Store as `audiences`.
             */
            audiences:
              normalizedAudiences,
          });

          return result;
        },
        {},
      );

    console.log(
      '========================================',
    );

    console.log(
      'GROUPED SUBCATEGORIES',
    );

    console.log(
      JSON.stringify(
        grouped,
        null,
        2,
      ),
    );

    console.log(
      '========================================',
    );

    setSubcategoriesByCategory(
      grouped,
    );
  }, [subcategoryData]);

  /* =======================================================
     SYNC SELECTED SUBCATEGORIES
  ======================================================= */

  useEffect(() => {
    /*
     * Prefer the new audience-specific value when supplied.
     *
     * We keep selectedSubcategoryIds as a compatibility fallback
     * for callers that have not yet been updated.
     */
    if (
      Array.isArray(
        selectedAudienceSubcategorySelections,
      )
    ) {
      const next: Record<
        ServiceAudience,
        string[]
      > = {
        FEMALE: [],
        MALE: [],
        KIDS: [],
      };

      selectedAudienceSubcategorySelections.forEach(
        selection => {
          if (
            !selection ||
            !(
              selection.audience === 'FEMALE' ||
              selection.audience === 'MALE' ||
              selection.audience === 'KIDS'
            )
          ) {
            return;
          }

          next[selection.audience] =
            Array.from(
              new Set(
                Array.isArray(
                  selection.subcategoryIds,
                )
                  ? selection.subcategoryIds.map(
                      id => String(id),
                    )
                  : [],
              ),
            );
        },
      );

      setInternalSelectedAudienceSubcategories(
        next,
      );

      return;
    }

    /*
     * Backward-compatible fallback.
     *
     * If the parent still supplies only IDs, those IDs are
     * considered selected for the currently selected audiences.
     *
     * Once the parent starts passing
     * selectedAudienceSubcategorySelections, each audience
     * will be completely independent.
     */
    const nextIds =
      Array.isArray(
        selectedSubcategoryIds,
      )
        ? selectedSubcategoryIds.map(id =>
            String(id),
          )
        : [];

    const next: Record<
      ServiceAudience,
      string[]
    > = {
      FEMALE: [],
      MALE: [],
      KIDS: [],
    };

    normalizedSelectedAudiences.forEach(
      audience => {
        next[audience] = [...nextIds];
      },
    );

    setInternalSelectedAudienceSubcategories(
      next,
    );
  }, [
    selectedSubcategoryIds,
    selectedAudienceSubcategorySelections,
    normalizedSelectedAudiences,
  ]);

  /* =======================================================
     CLEAR INVALID SELECTIONS WHEN
     AUDIENCE CHANGES
  ======================================================= */

  useEffect(() => {
    if (
      normalizedSelectedAudiences.length === 0
    ) {
      setInternalSelectedAudienceSubcategories({
        FEMALE: [],
        MALE: [],
        KIDS: [],
      });

      setModalSelectedAudienceSubcategories({
        FEMALE: [],
        MALE: [],
        KIDS: [],
      });

      setActiveCategory(null);
      setModalVisible(false);

      return;
    }

    setInternalSelectedAudienceSubcategories(
      previous => {
        const next: Record<
          ServiceAudience,
          string[]
        > = {
          FEMALE: [],
          MALE: [],
          KIDS: [],
        };

        (
          ['FEMALE', 'MALE', 'KIDS'] as ServiceAudience[]
        ).forEach(audience => {
          if (
            !normalizedSelectedAudiences.includes(
              audience,
            )
          ) {
            return;
          }

          const validIds =
            new Set<string>();

          Object.values(
            subcategoriesByCategory,
          ).forEach(
            subcategories => {
              subcategories.forEach(
                subcategory => {
                  const audiences =
                    normalizeAudienceList(
                      subcategory.audiences,
                    );

                  if (
                    audiences.includes(
                      audience,
                    )
                  ) {
                    validIds.add(
                      String(
                        subcategory.subcategoryId,
                      ),
                    );
                  }
                },
              );
            },
          );

          next[audience] =
            previous[audience].filter(id =>
              validIds.has(String(id)),
            );
        });

        return next;
      },
    );
  }, [
    normalizedSelectedAudiences,
    subcategoriesByCategory,
  ]);

  /* =======================================================
     DISPLAY CATEGORIES
  ======================================================= */

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

      const result =
        categories.filter(
          category => {
            const categoryId =
              String(
                category.categoryId ?? '',
              ).trim();

            const normalizedName =
              normalizeCategoryName(
                category.name,
              );

            if (
              !categoryId ||
              seen.has(
                normalizedName,
              )
            ) {
              return false;
            }

            const categorySubcategories =
              subcategoriesByCategory[
              categoryId
              ] ?? [];

            const hasMatchingSubcategory =
              categorySubcategories.some(
                subcategory =>
                  matchesSelectedAudiences(
                    subcategory,
                    normalizedSelectedAudiences,
                  ),
              );

            console.log(
              'CATEGORY CHECK:',
              category.name,
              'CATEGORY ID:',
              categoryId,
              'SELECTED AUDIENCES:',
              normalizedSelectedAudiences,
              'SUBCATEGORY COUNT:',
              categorySubcategories.length,
              'MATCH:',
              hasMatchingSubcategory,
            );

            if (
              !hasMatchingSubcategory
            ) {
              return false;
            }

            seen.add(
              normalizedName,
            );

            return true;
          },
        );

      console.log(
        'DISPLAY CATEGORIES:',
        result.map(
          category => ({
            id: category.categoryId,
            name: category.name,
          }),
        ),
      );

      return result;
    }, [
      categories,
      subcategoriesByCategory,
      normalizedSelectedAudiences,
    ]);

  /* =======================================================
     CURRENT SUBCATEGORIES
  ======================================================= */

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
        ] ?? [];

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

  /* =======================================================
     GROUP CURRENT SUBCATEGORIES BY AUDIENCE
  ======================================================= */

  const subcategoriesByAudience =
    useMemo(() => {
      const result: Record<
        ServiceAudience,
        Subcategory[]
      > = {
        FEMALE: [],
        MALE: [],
        KIDS: [],
      };

      normalizedSelectedAudiences.forEach(
        audience => {
          result[audience] =
            currentSubcategories.filter(
              subcategory =>
                normalizeAudienceList(
                  subcategory.audiences,
                ).includes(
                  audience,
                ),
            );
        },
      );

      return result;
    }, [
      currentSubcategories,
      normalizedSelectedAudiences,
    ]);

  /* =======================================================
     SELECTED COUNT
  ======================================================= */

  const getSelectedCount = (
    categoryId: string,
  ) => {
    const categorySubcategories =
      subcategoriesByCategory[
        categoryId
      ] ?? [];

    const categorySubcategoryIds =
      new Set(
        categorySubcategories.map(
          subcategory =>
            String(
              subcategory.subcategoryId,
            ),
        ),
      );

    return normalizedSelectedAudiences.reduce(
      (count, audience) =>
        count +
        internalSelectedAudienceSubcategories[
          audience
        ].filter(id =>
          categorySubcategoryIds.has(
            String(id),
          ),
        ).length,
      0,
    );
  };

  /* =======================================================
     CLEAR CATEGORY
  ======================================================= */

  const clearCategory = (
    category: Category,
  ) => {
    const categoryId =
      String(
        category.categoryId,
      ).trim();

    const categorySubcategories =
      subcategoriesByCategory[
        categoryId
      ] ?? [];

    const categorySubcategoryIds =
      new Set(
        categorySubcategories.map(
          subcategory =>
            String(
              subcategory.subcategoryId,
            ),
        ),
      );

    const next: Record<
      ServiceAudience,
      string[]
    > = {
      FEMALE: [],
      MALE: [],
      KIDS: [],
    };

    (
      ['FEMALE', 'MALE', 'KIDS'] as ServiceAudience[]
    ).forEach(audience => {
      next[audience] =
        internalSelectedAudienceSubcategories[
          audience
        ].filter(
          id =>
            !categorySubcategoryIds.has(
              String(id),
            ),
        );
    });

    setInternalSelectedAudienceSubcategories(
      next,
    );

    const flattenedIds =
      Array.from(
        new Set(
          Object.values(next).flat(),
        ),
      );

    onSelect({
      categoryId: '',
      category: '',
      subcategoryIds:
        flattenedIds,
      audienceSubcategorySelections:
        (
          ['FEMALE', 'MALE', 'KIDS'] as ServiceAudience[]
        ).map(audience => ({
          audience,
          subcategoryIds:
            next[audience],
        })),
    });
  };

  /* =======================================================
     CATEGORY SELECT
  ======================================================= */

  const handleCategorySelect = (
    category: Category,
  ) => {
    const selectedCount =
      getSelectedCount(
        category.categoryId,
      );

    if (selectedCount > 0) {
      clearCategory(category);
      return;
    }

    const categorySubcategories =
      subcategoriesByCategory[
        category.categoryId
      ] ?? [];

    const modalState: Record<
      ServiceAudience,
      string[]
    > = {
      FEMALE: [],
      MALE: [],
      KIDS: [],
    };

    /*
     * IMPORTANT:
     * Load selections independently for every audience.
     *
     * Female haircut and Male haircut can have the same
     * subcategoryId, but they are still separate selections.
     */
    normalizedSelectedAudiences.forEach(
      audience => {
        const validCategoryIds =
          new Set(
            categorySubcategories
              .filter(subcategory =>
                normalizeAudienceList(
                  subcategory.audiences,
                ).includes(audience),
              )
              .map(
                subcategory =>
                  String(
                    subcategory.subcategoryId,
                  ),
              ),
          );

        modalState[audience] =
          internalSelectedAudienceSubcategories[
            audience
          ].filter(id =>
            validCategoryIds.has(
              String(id),
            ),
          );
      },
    );

    setActiveCategory(
      category,
    );

    setModalSelectedAudienceSubcategories(
      modalState,
    );

    setModalVisible(true);
  };

  /* =======================================================
     SUBCATEGORY TOGGLE
  ======================================================= */

  const handleSubcategoryToggle = (
    audience: ServiceAudience,
    subcategoryId: string,
  ) => {
    const normalizedId =
      String(
        subcategoryId,
      );

    /*
     * CRITICAL FIX:
     *
     * The audience is part of the selection identity.
     *
     * Before:
     *   [subcategoryId]
     *
     * After:
     *   {
     *     FEMALE: [subcategoryId],
     *     MALE: [],
     *   }
     *
     * This means selecting Haircut for Female no longer
     * selects Haircut for Male.
     */
    setModalSelectedAudienceSubcategories(
      previous => {
        const current =
          previous[audience] ?? [];

        const alreadySelected =
          current.some(
            id =>
              String(id) ===
              normalizedId,
          );

        return {
          ...previous,
          [audience]: alreadySelected
            ? current.filter(
                id =>
                  String(id) !==
                  normalizedId,
              )
            : [
                ...current,
                normalizedId,
              ],
        };
      },
    );
  };

  /* =======================================================
     DONE
  ======================================================= */

  const handleDone = () => {
    if (!activeCategory) {
      setModalVisible(false);
      return;
    }

    const activeCategoryId =
      String(
        activeCategory.categoryId,
      ).trim();

    const currentCategorySubcategories =
      subcategoriesByCategory[
        activeCategoryId
      ] ?? [];

    const validSelections: Record<
      ServiceAudience,
      string[]
    > = {
      FEMALE: [],
      MALE: [],
      KIDS: [],
    };

    /*
     * Validate each audience separately.
     *
     * A subcategory can be shared by multiple audiences,
     * so validation must never merge the audience buckets.
     */
    (
      ['FEMALE', 'MALE', 'KIDS'] as ServiceAudience[]
    ).forEach(audience => {
      const validIds =
        new Set(
          currentCategorySubcategories
            .filter(subcategory =>
              normalizeAudienceList(
                subcategory.audiences,
              ).includes(audience),
            )
            .map(
              subcategory =>
                String(
                  subcategory.subcategoryId,
                ),
            ),
        );

      validSelections[audience] =
        (
          modalSelectedAudienceSubcategories[
            audience
          ] ?? []
        ).filter(id =>
          validIds.has(String(id)),
        );
    });

    /*
     * Keep selections from OTHER categories for each
     * audience independently.
     */
    const next: Record<
      ServiceAudience,
      string[]
    > = {
      FEMALE: [],
      MALE: [],
      KIDS: [],
    };

    (
      ['FEMALE', 'MALE', 'KIDS'] as ServiceAudience[]
    ).forEach(audience => {
      const currentCategoryIds =
        new Set(
          currentCategorySubcategories.map(
            subcategory =>
              String(
                subcategory.subcategoryId,
              ),
          ),
        );

      const otherCategorySelections =
        internalSelectedAudienceSubcategories[
          audience
        ].filter(
          id =>
            !currentCategoryIds.has(
              String(id),
            ),
        );

      next[audience] =
        Array.from(
          new Set([
            ...otherCategorySelections,
            ...validSelections[audience],
          ]),
        );
    });

    setInternalSelectedAudienceSubcategories(
      next,
    );

    /*
     * Keep the old flattened subcategoryIds output for
     * compatibility with existing parent code.
     *
     * The NEW audienceSubcategorySelections field is the
     * authoritative value when the parent needs to know
     * exactly which audience owns which subcategory.
     */
    const flattenedIds =
      Array.from(
        new Set(
          Object.values(next).flat(),
        ),
      );

    onSelect({
      categoryId:
        activeCategoryId,

      category:
        activeCategory.name.trim(),

      subcategoryIds:
        flattenedIds,

      audienceSubcategorySelections:
        (
          ['FEMALE', 'MALE', 'KIDS'] as ServiceAudience[]
        ).map(audience => ({
          audience,
          subcategoryIds:
            next[audience],
        })),
    });

    setModalVisible(false);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseModal = () => {
    setModalVisible(false);

    setModalSelectedAudienceSubcategories({
      FEMALE: [],
      MALE: [],
      KIDS: [],
    });

    setActiveCategory(null);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  const loading =
    categoriesLoading ||
    subcategoriesLoading;

  /* =======================================================
     NO AUDIENCE
  ======================================================= */

  if (
    normalizedSelectedAudiences.length ===
    0
  ) {
    return null;
  }

  /* =======================================================
     ERROR LOGGING
  ======================================================= */

  if (categoriesError) {
    console.warn(
      'GET_ACTIVE_CATEGORIES ERROR:',
      categoriesError,
    );
  }

  if (subcategoriesError) {
    console.warn(
      'GET_ACTIVE_SUBCATEGORIES ERROR:',
      subcategoriesError,
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.headerRow}>
        {/* <Text style={styles.title}>
          Choose a Service
        </Text> */}

        <Text style={styles.subtitle}>
          {normalizedSelectedAudiences
            .map(
              getAudienceLabel,
            )
            .join(', ')}
        </Text>
      </View>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <View style={styles.loadingContainer}>
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
      ) : displayCategories.length ===
        0 ? (
        <View
          style={
            styles.emptyContainer
          }
        >
          <Text
            style={
              styles.emptyText
            }
          >
            No services available for the
            selected audience.
          </Text>
        </View>
      ) : (
        /* ===============================================
           CATEGORY GRID
        =============================================== */

        <View style={styles.categoryGrid}>
          {displayCategories.map(
            category => {
              const selectedCount =
                getSelectedCount(
                  category.categoryId,
                );

              const isSelected =
                selectedCount > 0;

              return (
                <TouchableOpacity
                  key={
                    category.categoryId
                  }
                  activeOpacity={0.8}
                  style={[
                    styles.categoryCard,
                    isSelected &&
                    styles.categoryCardSelected,
                  ]}
                  onPress={() =>
                    handleCategorySelect(
                      category,
                    )
                  }
                >
                  {/* ICON */}

                  <View
                    style={[
                      styles.iconContainer,
                      isSelected &&
                      styles.iconContainerSelected,
                    ]}
                  >
                    <Image
                      source={getCategoryIcon(
                        category.name,
                      )}
                      style={
                        styles.categoryIcon
                      }
                      resizeMode="contain"
                    />
                  </View>

                  {/* NAME */}

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.categoryName,
                      isSelected &&
                      styles.categoryNameSelected,
                    ]}
                  >
                    {category.name}
                  </Text>

                  {/* SELECTED COUNT */}

                  {selectedCount > 0 && (
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
                        {selectedCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            },
          )}
        </View>
      )}

      {/* =================================================
          SUBCATEGORY MODAL
      ================================================= */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={
          handleCloseModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              styles.modalBackgroundPressable
            }
            onPress={
              handleCloseModal
            }
          />

          <View
            style={
              styles.modalContainer
            }
          >

            {/* =========================================
                MODAL HEADER
            ========================================= */}

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
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {activeCategory?.name ||
                    'Select Services'}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select one or more services
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={
                  handleCloseModal
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

            {/* =========================================
                SELECTED AUDIENCES
            ========================================= */}

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

              <View
                style={
                  styles.audiencePills
                }
              >
                {normalizedSelectedAudiences.map(
                  audience => (
                    <View
                      key={audience}
                      style={
                        styles.audiencePill
                      }
                    >
                      <Text
                        style={
                          styles.audiencePillText
                        }
                      >
                        {getAudienceLabel(
                          audience,
                        )}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>

            {/* =========================================
                GROUPED SUBCATEGORY LIST
            ========================================= */}

            {currentSubcategories.length ===
              0 ? (
              <View
                style={
                  styles.modalEmptyContainer
                }
              >
                <Text
                  style={
                    styles.modalEmptyText
                  }
                >
                  No services available for the
                  selected audience.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={
                  styles.subcategoryScroll
                }
                contentContainerStyle={
                  styles.subcategoryContent
                }
                showsVerticalScrollIndicator={
                  false
                }
              >
                {normalizedSelectedAudiences.map(
                  audience => {
                    const audienceSubcategories =
                      subcategoriesByAudience[
                      audience
                      ] ?? [];

                    if (
                      audienceSubcategories.length ===
                      0
                    ) {
                      return null;
                    }

                    return (
                      <View
                        key={audience}
                        style={
                          styles.audienceSection
                        }
                      >

                        {/* =================================
                            AUDIENCE HEADING
                        ================================= */}

                        <View
                          style={
                            styles.audienceSectionHeader
                          }
                        >
                          <View
                            style={
                              styles.audienceHeadingLine
                            }
                          />

                          <Text
                            style={
                              styles.audienceSectionTitle
                            }
                          >
                            {getAudienceLabel(
                              audience,
                            )}
                          </Text>

                          <View
                            style={
                              styles.audienceHeadingLine
                            }
                          />
                        </View>

                        {/* =================================
                            AUDIENCE SUBCATEGORIES
                        ================================= */}

                        {audienceSubcategories.map(
                          subcategory => {
                            const id =
                              String(
                                subcategory.subcategoryId,
                              );

                            const selected =
                              (
                                modalSelectedAudienceSubcategories[
                                  audience
                                ] ?? []
                              ).some(
                                selectedId =>
                                  String(
                                    selectedId,
                                  ) === id,
                              );

                            return (
                              <TouchableOpacity
                                key={`${audience}-${id}`}
                                activeOpacity={0.8}
                                style={[
                                  styles.subcategoryRow,
                                  selected &&
                                  styles.subcategoryRowSelected,
                                ]}
                                onPress={() =>
                                  handleSubcategoryToggle(
                                    audience,
                                    id,
                                  )
                                }
                              >

                                {/* CHECKBOX */}

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

                                {/* TEXT */}

                                <View
                                  style={
                                    styles.subcategoryTextContainer
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.subcategoryName,
                                      selected &&
                                      styles.subcategoryNameSelected,
                                    ]}
                                  >
                                    {
                                      subcategory.name
                                    }
                                  </Text>

                                  {subcategory.description ? (
                                    <Text
                                      numberOfLines={
                                        2
                                      }
                                      style={
                                        styles.subcategoryDescription
                                      }
                                    >
                                      {
                                        subcategory.description
                                      }
                                    </Text>
                                  ) : null}
                                </View>
                              </TouchableOpacity>
                            );
                          },
                        )}
                      </View>
                    );
                  },
                )}
              </ScrollView>
            )}

            {/* =========================================
                MODAL FOOTER
            ========================================= */}

            <View
              style={
                styles.modalFooter
              }
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.cancelButton
                }
                onPress={
                  handleCloseModal
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.doneButton
                }
                onPress={
                  handleDone
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

          </View>
        </View>
      </Modal>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop:
      SPACING?.small ?? 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom:
      SPACING?.medium ?? 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.themeColor,
  },

  loadingContainer: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color:
      COLORS.textSecondary,
  },

  emptyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color:
      COLORS.textSecondary,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'flex-start',
    // paddingHorizontal: 2,
  },

  categoryCard: {
    width: '22%',
    marginHorizontal: '1%',
    marginBottom: 12,
    height: 110,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border || 'rgba(0,0,0,0.08)',
    position: 'relative',
  },

  categoryCardSelected: {
    borderColor: COLORS.themeColor,
    backgroundColor: '#FFFFFF',
  },

  iconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  iconContainerSelected: {
    // backgroundColor:
    //   COLORS.themeColor + '20',
  },

  categoryIcon: {
    width: 60,
    height: 60,
  },

  categoryName: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  categoryNameSelected: {
    color:
      COLORS.themeColor,
    fontWeight: '700',
  },

  countBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    backgroundColor:
      COLORS.themeColor,
  },

  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* =====================================================
     MODAL
  ===================================================== */

  modalOverlay: {
    flex: 1,
    justifyContent:
      'flex-end',
  },

  modalBackgroundPressable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0,0,0,0.45)',
  },

  modalContainer: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor:
      COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  modalTitleContainer: {
    flex: 1,
    paddingRight: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color:
      COLORS.textSecondary,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.themeColor + '12',
  },

  closeButtonText: {
    color:
      COLORS.themeColor,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '400',
  },

  /* =====================================================
     AUDIENCE INFO
  ===================================================== */

  audienceInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  audienceInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color:
      COLORS.textSecondary,
    marginBottom: 7,
  },

  audiencePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  audiencePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 7,
    marginBottom: 5,
    backgroundColor:
      COLORS.themeColor + '15',
  },

  audiencePillText: {
    color:
      COLORS.themeColor,
    fontSize: 12,
    fontWeight: '700',
  },

  /* =====================================================
     GROUPED AUDIENCE SECTIONS
  ===================================================== */

  audienceSection: {
    marginBottom: 18,
  },

  audienceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  audienceHeadingLine: {
    flex: 1,
    height: 1,
    backgroundColor:
      COLORS.themeColor + '35',
  },

  audienceSectionTitle: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color:
      COLORS.themeColor,
  },

  /* =====================================================
     SUBCATEGORIES
  ===================================================== */

  subcategoryScroll: {
    flexGrow: 0,
  },

  subcategoryContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  subcategoryRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border ||
      'rgba(0,0,0,0.08)',
    backgroundColor:
      COLORS.background,
  },

  subcategoryRowSelected: {
    borderColor:
      COLORS.themeColor,
    backgroundColor:
      COLORS.themeColor + '10',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor:
      COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxSelected: {
    backgroundColor:
      COLORS.themeColor,
    borderColor:
      COLORS.themeColor,
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  subcategoryTextContainer: {
    flex: 1,
  },

  subcategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  subcategoryNameSelected: {
    color:
      COLORS.themeColor,
    fontWeight: '700',
  },

  subcategoryDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    color:
      COLORS.textSecondary,
  },

  modalEmptyContainer: {
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: 'center',
  },

  modalEmptyText: {
    textAlign: 'center',
    fontSize: 14,
    color:
      COLORS.textSecondary,
  },

  /* =====================================================
     FOOTER
  ===================================================== */

  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border ||
      'rgba(0,0,0,0.08)',
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor:
      COLORS.themeColor,
  },

  cancelButtonText: {
    color:
      COLORS.themeColor,
    fontSize: 14,
    fontWeight: '700',
  },

  doneButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor:
      COLORS.themeColor,
  },

  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ServiceChips;
