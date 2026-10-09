
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

type ServiceAudience = 'FEMALE' | 'MALE' | 'KIDS';

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

type AudienceSelection = {
  audience: ServiceAudience;
  subcategoryIds: string[];
};

type Props = {
  onSelect: (selection: {
    categoryId: string;
    category: string;
    subcategoryIds: string[];
    audienceSubcategorySelections?: AudienceSelection[];
  }) => void;

  selectedCategoryId?: string;
  selectedCategory?: string;
  selectedSubcategoryIds?: string[];
  selectedAudienceSubcategorySelections?: AudienceSelection[];
  selectedAudiences?: ServiceAudience[];
};

/* =========================================================
   AUDIENCE-SPECIFIC CATEGORY IMAGES

   All images are JPG files in:
   ../../../assets/category/

   IMPORTANT:
   These require() filenames must match your actual files.
========================================================= */

const categoryAudienceIcons: Record<
  ServiceAudience,
  Record<string, any>
> = {
  FEMALE: {
    hair: require('../../../assets/category/Hair&styling-female.jpg'),
    'facial & skin care': require('../../../assets/category/Facials&skin-female.jpg'),
    nails: require('../../../assets/category/nails-female.jpg'),
    'makeup & bridal': require('../../../assets/category/Makeup-female.png'),
    'threading & hair removal': require('../../../assets/category/Waxing-female.png'),
    'lashes & brows': require('../../../assets/category/lash&eyebrow-female.jpg'),
    'spa & massage': require('../../../assets/category/massage-female.jpg'),
    'body care & wellness': require('../../../assets/category/bodycare&wellness-female.jpg'),
  },

  MALE: {
    hair: require('../../../assets/category/hair-male.png'),
    'facial & skin care': require('../../../assets/category/face-male.png'),
    nails: require('../../../assets/category/nails-male.jpg'),
    'makeup & bridal': require('../../../assets/category/makeup-male.jpg'),
    'threading & hair removal': require('../../../assets/category/Waxing-male.png'),
    'lashes & brows': require('../../../assets/category/lash&eyebrow-male.jpg'),
    'spa & massage': require('../../../assets/category/massage-male.jpg'),
    'body care & wellness': require('../../../assets/category/bodycare-male.jpg'),
  },

  KIDS: {
    hair: require('../../../assets/category/hair-kid.png'),
    // 'facial & skin care': require('../../../assets/category/Facials&skin-kids.jpg'),
    // nails: require('../../../assets/category/nails-kids.jpg'),
    // 'makeup & bridal': require('../../../assets/category/Makeup-kids.jpg'),
    // 'threading & hair removal': require('../../../assets/category/Waxing-kids.jpg'),
    // 'lashes & brows': require('../../../assets/category/lash&eyebrow-kids.jpg'),
    // 'spa & massage': require('../../../assets/category/massage-kids.jpg'),
    // 'body care & wellness': require('../../../assets/category/bodycare&wellness-kids.jpg'),
  },
};

/* Existing generic JPGs are retained as fallbacks. */
const categoryFallbackIcons: Record<string, any> = {
  hair: require('../../../assets/category/Hair&styling-female.jpg'),
    'facial & skin care': require('../../../assets/category/Facials&skin-female.jpg'),
    nails: require('../../../assets/category/nails-female.jpg'),
    'makeup & bridal': require('../../../assets/category/Makeup-female.png'),
    'threading & hair removal': require('../../../assets/category/Waxing-female.png'),
    'lashes & brows': require('../../../assets/category/lash&eyebrow-female.jpg'),
    'spa & massage': require('../../../assets/category/massage-female.jpg'),
    'body care & wellness': require('../../../assets/category/bodycare&wellness-female.jpg'),
};

const fallbackIcon =
  require('../../../assets/category/fallback.jpg');

const AUDIENCES: ServiceAudience[] = [
  'FEMALE',
  'MALE',
  'KIDS',
];

const EMPTY_SELECTIONS: Record<ServiceAudience, string[]> = {
  FEMALE: [],
  MALE: [],
  KIDS: [],
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeCategoryName = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

const normalizeAudienceList = (
  value: unknown,
): ServiceAudience[] => {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [value]
      : [];

  return Array.from(
    new Set(
      values.filter(
        (item): item is ServiceAudience =>
          item === 'FEMALE' ||
          item === 'MALE' ||
          item === 'KIDS',
      ),
    ),
  );
};

const getCategoryIcon = (
  categoryName: string,
  audience: ServiceAudience,
) => {
  const normalizedName = normalizeCategoryName(categoryName);

  return (
    categoryAudienceIcons[audience]?.[normalizedName] ||
    categoryFallbackIcons[normalizedName] ||
    fallbackIcon
  );
};

const matchesSelectedAudiences = (
  subcategory: Subcategory,
  selectedAudiences: ServiceAudience[],
): boolean => {
  const audiences = normalizeAudienceList(subcategory.audiences);

  return selectedAudiences.some(audience =>
    audiences.includes(audience),
  );
};

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

const createEmptySelections = (): Record<ServiceAudience, string[]> => ({
  FEMALE: [],
  MALE: [],
  KIDS: [],
});

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
  const {
    data,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery<GetActiveCategoriesResponse>(
    GET_ACTIVE_CATEGORIES,
    { fetchPolicy: 'cache-and-network' },
  );

  const {
    data: subcategoryData,
    loading: subcategoriesLoading,
    error: subcategoriesError,
  } = useQuery<GetActiveSubcategoriesResponse>(
    GET_ACTIVE_SUBCATEGORIES,
    { fetchPolicy: 'network-only' },
  );

  const [categories, setCategories] = useState<Category[]>([]);

  const [
    subcategoriesByCategory,
    setSubcategoriesByCategory,
  ] = useState<Record<string, Subcategory[]>>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const [
    internalSelectedAudienceSubcategories,
    setInternalSelectedAudienceSubcategories,
  ] = useState<Record<ServiceAudience, string[]>>(
    createEmptySelections,
  );

  const [
    modalSelectedAudienceSubcategories,
    setModalSelectedAudienceSubcategories,
  ] = useState<Record<ServiceAudience, string[]>>(
    createEmptySelections,
  );

  const normalizedSelectedAudiences = useMemo(
    () =>
      Array.from(
        new Set(normalizeAudienceList(selectedAudiences)),
      ),
    [selectedAudiences],
  );

  const activeCategoryId = activeCategory?.categoryId || '';

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
    const apiCategories = data?.categories?.categories;

    if (!Array.isArray(apiCategories)) {
      setCategories([]);
      return;
    }

    setCategories(
      apiCategories.filter(
        item =>
          item &&
          item.status === 'ACTIVE' &&
          typeof item.categoryId === 'string' &&
          item.categoryId.trim().length > 0 &&
          typeof item.name === 'string' &&
          item.name.trim().length > 0,
      ),
    );
  }, [data]);

  /* =========================================================
     LOAD AND GROUP SUBCATEGORIES
  ========================================================= */

  useEffect(() => {
    const apiSubcategories =
      subcategoryData?.subcategories?.subcategories;

    if (!Array.isArray(apiSubcategories)) {
      setSubcategoriesByCategory({});
      return;
    }

    const grouped = apiSubcategories.reduce<
      Record<string, Subcategory[]>
    >((result, item) => {
      if (
        !item ||
        item.status !== 'ACTIVE' ||
        typeof item.categoryId !== 'string' ||
        typeof item.subcategoryId !== 'string' ||
        typeof item.name !== 'string' ||
        !item.name.trim()
      ) {
        return result;
      }

      const categoryId = item.categoryId.trim();
      const audiences = normalizeAudienceList(item.audiences);

      if (!categoryId || audiences.length === 0) {
        return result;
      }

      if (!result[categoryId]) {
        result[categoryId] = [];
      }

      result[categoryId].push({
        ...item,
        categoryId,
        audiences,
      });

      return result;
    }, {});

    setSubcategoriesByCategory(grouped);
  }, [subcategoryData]);

  /* =========================================================
     SYNC PARENT SELECTIONS
  ========================================================= */

  useEffect(() => {
    if (Array.isArray(selectedAudienceSubcategorySelections)) {
      const next = createEmptySelections();

      selectedAudienceSubcategorySelections.forEach(selection => {
        if (!selection || !AUDIENCES.includes(selection.audience)) {
          return;
        }

        next[selection.audience] = Array.from(
          new Set(
            Array.isArray(selection.subcategoryIds)
              ? selection.subcategoryIds.map(String)
              : [],
          ),
        );
      });

      setInternalSelectedAudienceSubcategories(next);
      return;
    }

    const ids = Array.isArray(selectedSubcategoryIds)
      ? selectedSubcategoryIds.map(String)
      : [];

    const next = createEmptySelections();

    normalizedSelectedAudiences.forEach(audience => {
      next[audience] = [...ids];
    });

    setInternalSelectedAudienceSubcategories(next);
  }, [
    selectedSubcategoryIds,
    selectedAudienceSubcategorySelections,
    normalizedSelectedAudiences,
  ]);

  /* =========================================================
     CLEAR AUDIENCES THAT ARE NO LONGER SELECTED
  ========================================================= */

  useEffect(() => {
    if (normalizedSelectedAudiences.length === 0) {
      setInternalSelectedAudienceSubcategories(createEmptySelections());
      setModalSelectedAudienceSubcategories(createEmptySelections());
      setActiveCategory(null);
      setModalVisible(false);
      return;
    }

    setInternalSelectedAudienceSubcategories(previous => {
      const next = createEmptySelections();

      AUDIENCES.forEach(audience => {
        if (!normalizedSelectedAudiences.includes(audience)) {
          return;
        }

        const validIds = new Set<string>();

        Object.values(subcategoriesByCategory).forEach(subcategories => {
          subcategories.forEach(subcategory => {
            if (
              normalizeAudienceList(subcategory.audiences).includes(
                audience,
              )
            ) {
              validIds.add(String(subcategory.subcategoryId));
            }
          });
        });

        next[audience] = (previous[audience] || []).filter(id =>
          validIds.has(String(id)),
        );
      });

      return next;
    });

    setModalSelectedAudienceSubcategories(previous => {
      const next = createEmptySelections();

      AUDIENCES.forEach(audience => {
        if (normalizedSelectedAudiences.includes(audience)) {
          next[audience] = previous[audience] || [];
        }
      });

      return next;
    });
  }, [normalizedSelectedAudiences, subcategoriesByCategory]);

  /* =========================================================
     DISPLAY CATEGORIES
  ========================================================= */

  const displayCategories = useMemo(() => {
    if (normalizedSelectedAudiences.length === 0) {
      return [];
    }

    const seen = new Set<string>();

    return categories.filter(category => {
      const categoryId = String(category.categoryId).trim();
      const normalizedName = normalizeCategoryName(category.name);

      if (!categoryId || seen.has(normalizedName)) {
        return false;
      }

      const subcategories =
        subcategoriesByCategory[categoryId] || [];

      const hasMatchingSubcategory = subcategories.some(subcategory =>
        matchesSelectedAudiences(
          subcategory,
          normalizedSelectedAudiences,
        ),
      );

      if (!hasMatchingSubcategory) {
        return false;
      }

      seen.add(normalizedName);
      return true;
    });
  }, [
    categories,
    subcategoriesByCategory,
    normalizedSelectedAudiences,
  ]);

  /* =========================================================
     CATEGORY AUDIENCES

     Only display icons for audiences that actually have
     subcategories in that category.
  ========================================================= */

  const getCategoryAudiences = (
    category: Category,
  ): ServiceAudience[] => {
    const subcategories =
      subcategoriesByCategory[String(category.categoryId)] || [];

    return normalizedSelectedAudiences.filter(audience =>
      subcategories.some(subcategory =>
        normalizeAudienceList(subcategory.audiences).includes(
          audience,
        ),
      ),
    );
  };

  /* =========================================================
     CURRENT SUBCATEGORIES
  ========================================================= */

  const currentSubcategories = useMemo(() => {
    if (!activeCategoryId || normalizedSelectedAudiences.length === 0) {
      return [];
    }

    return (
      subcategoriesByCategory[activeCategoryId] || []
    ).filter(subcategory =>
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

  const subcategoriesByAudience = useMemo(() => {
    const result: Record<ServiceAudience, Subcategory[]> = {
      FEMALE: [],
      MALE: [],
      KIDS: [],
    };

    normalizedSelectedAudiences.forEach(audience => {
      result[audience] = currentSubcategories.filter(subcategory =>
        normalizeAudienceList(subcategory.audiences).includes(
          audience,
        ),
      );
    });

    return result;
  }, [currentSubcategories, normalizedSelectedAudiences]);

  /* =========================================================
     SELECTED COUNT
  ========================================================= */

  const getSelectedCount = (categoryId: string) => {
    const ids = new Set(
      (subcategoriesByCategory[categoryId] || []).map(item =>
        String(item.subcategoryId),
      ),
    );

    return normalizedSelectedAudiences.reduce(
      (total, audience) =>
        total +
        (internalSelectedAudienceSubcategories[audience] || []).filter(
          id => ids.has(String(id)),
        ).length,
      0,
    );
  };

  /* =========================================================
     CLEAR CATEGORY
  ========================================================= */

  const clearCategory = (category: Category) => {
    const categoryIds = new Set(
      (subcategoriesByCategory[category.categoryId] || []).map(item =>
        String(item.subcategoryId),
      ),
    );

    const next = createEmptySelections();

    AUDIENCES.forEach(audience => {
      next[audience] = (
        internalSelectedAudienceSubcategories[audience] || []
      ).filter(id => !categoryIds.has(String(id)));
    });

    setInternalSelectedAudienceSubcategories(next);

    onSelect({
      categoryId: '',
      category: '',
      subcategoryIds: Array.from(
        new Set(Object.values(next).flat()),
      ),
      audienceSubcategorySelections: AUDIENCES.map(audience => ({
        audience,
        subcategoryIds: next[audience],
      })),
    });
  };

  /* =========================================================
     OPEN CATEGORY MODAL
  ========================================================= */

  const handleCategorySelect = (category: Category) => {
    if (getSelectedCount(category.categoryId) > 0) {
      clearCategory(category);
      return;
    }

    const categorySubcategories =
      subcategoriesByCategory[category.categoryId] || [];

    const modalState = createEmptySelections();

    normalizedSelectedAudiences.forEach(audience => {
      const validIds = new Set(
        categorySubcategories
          .filter(subcategory =>
            normalizeAudienceList(subcategory.audiences).includes(
              audience,
            ),
          )
          .map(item => String(item.subcategoryId)),
      );

      modalState[audience] = (
        internalSelectedAudienceSubcategories[audience] || []
      ).filter(id => validIds.has(String(id)));
    });

    setActiveCategory(category);
    setModalSelectedAudienceSubcategories(modalState);
    setModalVisible(true);
  };

  /* =========================================================
     TOGGLE SUBCATEGORY

     Audience + subcategory ID are treated as the selection
     identity, so selecting Female does not select Male/Kids.
  ========================================================= */

  const handleSubcategoryToggle = (
    audience: ServiceAudience,
    subcategoryId: string,
  ) => {
    const id = String(subcategoryId);

    setModalSelectedAudienceSubcategories(previous => {
      const current = previous[audience] || [];
      const exists = current.some(item => String(item) === id);

      return {
        ...previous,
        [audience]: exists
          ? current.filter(item => String(item) !== id)
          : [...current, id],
      };
    });
  };

  /* =========================================================
     SAVE SELECTIONS
  ========================================================= */

  const handleDone = () => {
    if (!activeCategory) {
      setModalVisible(false);
      return;
    }

    const categoryId = String(activeCategory.categoryId);
    const categorySubcategories =
      subcategoriesByCategory[categoryId] || [];

    const categoryIds = new Set(
      categorySubcategories.map(item => String(item.subcategoryId)),
    );

    const next = createEmptySelections();

    AUDIENCES.forEach(audience => {
      const validIds = new Set(
        categorySubcategories
          .filter(subcategory =>
            normalizeAudienceList(subcategory.audiences).includes(
              audience,
            ),
          )
          .map(item => String(item.subcategoryId)),
      );

      const existingOtherCategoryIds = (
        internalSelectedAudienceSubcategories[audience] || []
      ).filter(id => !categoryIds.has(String(id)));

      const selectedForCategory = (
        modalSelectedAudienceSubcategories[audience] || []
      ).filter(id => validIds.has(String(id)));

      next[audience] = Array.from(
        new Set([
          ...existingOtherCategoryIds,
          ...selectedForCategory,
        ]),
      );
    });

    setInternalSelectedAudienceSubcategories(next);

    onSelect({
      categoryId,
      category: activeCategory.name.trim(),
      subcategoryIds: Array.from(
        new Set(Object.values(next).flat()),
      ),
      audienceSubcategorySelections: AUDIENCES.map(audience => ({
        audience,
        subcategoryIds: next[audience],
      })),
    });

    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalSelectedAudienceSubcategories(createEmptySelections());
    setActiveCategory(null);
  };

  const loading = categoriesLoading || subcategoriesLoading;

  if (normalizedSelectedAudiences.length === 0) {
    return null;
  }

  if (categoriesError) {
    console.warn('GET_ACTIVE_CATEGORIES ERROR:', categoriesError);
  }

  if (subcategoriesError) {
    console.warn('GET_ACTIVE_SUBCATEGORIES ERROR:', subcategoriesError);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>
          {normalizedSelectedAudiences.map(getAudienceLabel).join(', ')}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={COLORS.themeColor}
          />
          <Text style={styles.loadingText}>
            Loading services...
          </Text>
        </View>
      ) : displayCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No services available for the selected audience.
          </Text>
        </View>
      ) : (
        <View style={styles.categoryGrid}>
          {displayCategories.map(category => {
            const selectedCount = getSelectedCount(
              category.categoryId,
            );

            const isSelected = selectedCount > 0;

            const categoryAudiences =
              getCategoryAudiences(category);

            return (
              <TouchableOpacity
                key={category.categoryId}
                activeOpacity={0.8}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                {/* DIFFERENT IMAGE FOR EACH SUPPORTED AUDIENCE */}
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected,
                  ]}
                >
                  {categoryAudiences.length === 1 ? (
                    <Image
                      source={getCategoryIcon(
                        category.name,
                        categoryAudiences[0],
                      )}
                      style={styles.categoryIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.audienceIconRow}>
                      {categoryAudiences.map(audience => (
                        <Image
                          key={`${category.categoryId}-${audience}`}
                          source={getCategoryIcon(
                            category.name,
                            audience,
                          )}
                          style={styles.audienceCategoryIcon}
                          resizeMode="contain"
                        />
                      ))}
                    </View>
                  )}
                </View>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.categoryName,
                    isSelected && styles.categoryNameSelected,
                  ]}
                >
                  {category.name}
                </Text>

                {selectedCount > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {selectedCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackgroundPressable}
            onPress={handleCloseModal}
          />

          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>
                  {activeCategory?.name || 'Select Services'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Select one or more services
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.audienceInfo}>
              <Text style={styles.audienceInfoLabel}>
                Services for
              </Text>

              <View style={styles.audiencePills}>
                {normalizedSelectedAudiences.map(audience => (
                  <View key={audience} style={styles.audiencePill}>
                    <Text style={styles.audiencePillText}>
                      {getAudienceLabel(audience)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {currentSubcategories.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Text style={styles.modalEmptyText}>
                  No services available for the selected audience.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.subcategoryScroll}
                contentContainerStyle={styles.subcategoryContent}
                showsVerticalScrollIndicator={false}
              >
                {normalizedSelectedAudiences.map(audience => {
                  const audienceSubcategories =
                    subcategoriesByAudience[audience] || [];

                  if (audienceSubcategories.length === 0) {
                    return null;
                  }

                  return (
                    <View
                      key={audience}
                      style={styles.audienceSection}
                    >
                      <View style={styles.audienceSectionHeader}>
                        <View style={styles.audienceHeadingLine} />
                        <Text style={styles.audienceSectionTitle}>
                          {getAudienceLabel(audience)}
                        </Text>
                        <View style={styles.audienceHeadingLine} />
                      </View>

                      {audienceSubcategories.map(subcategory => {
                        const id = String(subcategory.subcategoryId);

                        const selected = (
                          modalSelectedAudienceSubcategories[
                            audience
                          ] || []
                        ).some(selectedId => String(selectedId) === id);

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
                              handleSubcategoryToggle(audience, id)
                            }
                          >
                            <View
                              style={[
                                styles.checkbox,
                                selected && styles.checkboxSelected,
                              ]}
                            >
                              {selected && (
                                <Text style={styles.checkmark}>
                                  ✓
                                </Text>
                              )}
                            </View>

                            <View style={styles.subcategoryTextContainer}>
                              <Text
                                style={[
                                  styles.subcategoryName,
                                  selected &&
                                    styles.subcategoryNameSelected,
                                ]}
                              >
                                {subcategory.name}
                              </Text>

                              {subcategory.description ? (
                                <Text
                                  numberOfLines={2}
                                  style={styles.subcategoryDescription}
                                >
                                  {subcategory.description}
                                </Text>
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.doneButton}
                onPress={handleDone}
              >
                <Text style={styles.doneButtonText}>
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
    marginTop: SPACING?.small ?? 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING?.medium ?? 12,
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
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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

  iconContainerSelected: {},

  categoryIcon: {
    width: 60,
    height: 60,
  },

  audienceIconRow: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  audienceCategoryIcon: {
    width: 30,
    height: 48,
    marginHorizontal: 1,
  },

  categoryName: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  categoryNameSelected: {
    color: COLORS.themeColor,
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
    backgroundColor: COLORS.themeColor,
  },

  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackgroundPressable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalContainer: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: COLORS.textSecondary,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.themeColor + '12',
  },

  closeButtonText: {
    color: COLORS.themeColor,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '400',
  },

  audienceInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  audienceInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.themeColor + '15',
  },

  audiencePillText: {
    color: COLORS.themeColor,
    fontSize: 12,
    fontWeight: '700',
  },

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
    backgroundColor: COLORS.themeColor + '35',
  },

  audienceSectionTitle: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.themeColor,
  },

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
    borderColor: COLORS.border || 'rgba(0,0,0,0.08)',
    backgroundColor: COLORS.background,
  },

  subcategoryRowSelected: {
    borderColor: COLORS.themeColor,
    backgroundColor: COLORS.themeColor + '10',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxSelected: {
    backgroundColor: COLORS.themeColor,
    borderColor: COLORS.themeColor,
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
    color: COLORS.themeColor,
    fontWeight: '700',
  },

  subcategoryDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.textSecondary,
  },

  modalEmptyContainer: {
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: 'center',
  },

  modalEmptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || 'rgba(0,0,0,0.08)',
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.themeColor,
  },

  cancelButtonText: {
    color: COLORS.themeColor,
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
    backgroundColor: COLORS.themeColor,
  },

  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ServiceChips;