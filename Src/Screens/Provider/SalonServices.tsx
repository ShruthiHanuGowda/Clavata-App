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
};

type SalonServiceSelection = {
  categoryId: string;
  categoryName?: string;
  subcategoryId: string;
  subcategoryName?: string;
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
  // OPEN CATEGORIES
  //
  // Empty object = all categories closed initially.
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
    categoryResponse
      ?.categories
      ?.categories ||
    [];

  // ==========================================================
  // SUBCATEGORIES
  // ==========================================================

  const subcategories: Subcategory[] =
    subcategoryResponse
      ?.subcategories
      ?.subcategories ||
    [];

  // ==========================================================
  // CURRENT SERVICE SELECTIONS
  // ==========================================================

  const selectedServiceSelections:
    SalonServiceSelection[] =
    Array.isArray(
      data.serviceSelections,
    )
      ? data.serviceSelections
      : [];

  // ==========================================================
  // SORTED SELECTED SERVICES
  //
  // Alphabetical order makes the selected list easier
  // to find and review.
  // ==========================================================

  const sortedSelectedServices =
    useMemo(() => {
      return [
        ...selectedServiceSelections,
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
              sensitivity: 'base',
            },
          );

        if (categoryCompare !== 0) {
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
            sensitivity: 'base',
          },
        );
      });
    }, [
      selectedServiceSelections,
    ]);

  // ==========================================================
  // CHECK SELECTION
  // ==========================================================

  const isSelected = (
    categoryId: string,
    subcategoryId: string,
  ) => {
    return selectedServiceSelections.some(
      selection =>
        selection.categoryId ===
          categoryId &&
        selection.subcategoryId ===
          subcategoryId,
    );
  };

  // ==========================================================
  // TOGGLE CATEGORY OPEN / CLOSE
  // ==========================================================

  const toggleCategory = (
    categoryId: string,
  ) => {
    setOpenCategories(
      previous => ({
        ...previous,
        [categoryId]:
          !previous[categoryId],
      }),
    );
  };

  // ==========================================================
  // GET SUBCATEGORIES FOR CATEGORY
  // ==========================================================

  const getCategorySubcategories = (
    categoryId: string,
  ) => {
    return subcategories.filter(
      subcategory =>
        subcategory.categoryId ===
        categoryId,
    );
  };

  // ==========================================================
  // TOGGLE ENTIRE CATEGORY
  //
  // Checking category = select all subcategories.
  // Unchecking category = remove all subcategories.
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
      0
    ) {
      return;
    }

    const selectedCategoryCount =
      selectedServiceSelections.filter(
        selection =>
          selection.categoryId ===
          category.categoryId,
      ).length;

    const allSelected =
      selectedCategoryCount ===
      categorySubcategories.length;

    // ========================================================
    // REMOVE ALL
    // ========================================================

    if (allSelected) {
      updateData({
        serviceSelections:
          selectedServiceSelections.filter(
            selection =>
              selection.categoryId !==
              category.categoryId,
          ),
      });

      return;
    }

    // ========================================================
    // SELECT ALL
    // ========================================================

    const selectionsForCategory =
      categorySubcategories.map(
        subcategory => ({
          categoryId:
            category.categoryId,

          categoryName:
            category.name,

          subcategoryId:
            subcategory.subcategoryId,

          subcategoryName:
            subcategory.name,
        }),
      );

    const selectionsFromOtherCategories =
      selectedServiceSelections.filter(
        selection =>
          selection.categoryId !==
          category.categoryId,
      );

    updateData({
      serviceSelections: [
        ...selectionsFromOtherCategories,
        ...selectionsForCategory,
      ],
    });
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

    const selectedCount =
      selectedServiceSelections.filter(
        selection =>
          selection.categoryId ===
          categoryId,
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
    const alreadySelected =
      isSelected(
        category.categoryId,
        subcategory.subcategoryId,
      );

    let updatedSelections:
      SalonServiceSelection[];

    // ========================================================
    // REMOVE
    // ========================================================

    if (alreadySelected) {
      updatedSelections =
        selectedServiceSelections.filter(
          selection =>
            !(
              selection.categoryId ===
                category.categoryId &&
              selection.subcategoryId ===
                subcategory.subcategoryId
            ),
        );
    } else {
      // ======================================================
      // ADD
      // ======================================================

      updatedSelections = [
        ...selectedServiceSelections,
        {
          categoryId:
            category.categoryId,

          categoryName:
            category.name,

          subcategoryId:
            subcategory.subcategoryId,

          subcategoryName:
            subcategory.name,
        },
      ];
    }

    // ========================================================
    // SAVE INTO CONTEXT
    // ========================================================

    updateData({
      serviceSelections:
        updatedSelections,
    });
  };

  // ==========================================================
  // OPEN SERVICES MODAL
  // ==========================================================

  const openServicesModal = () => {
    setServicesModalVisible(
      true,
    );
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
    // ========================================================
    // SERVICE VALIDATION
    // ========================================================

    if (
      selectedServiceSelections.length ===
      0
    ) {
      Alert.alert(
        'Services required',
        'Please select at least one service category and subcategory provided by your salon.',
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

    try {
      setSubmitting(true);

      // ======================================================
      // CLEAN SELECTIONS
      //
      // Backend receives IDs only.
      // Names remain useful for UI.
      // ======================================================

      const cleanedSelections =
        selectedServiceSelections.map(
          selection => ({
            categoryId:
              selection.categoryId,

            subcategoryId:
              selection.subcategoryId,
          }),
        );

      updateData({
        serviceSelections:
          cleanedSelections,
      });

      // ======================================================
      // SMALL DELAY FOR UI
      // ======================================================

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            200,
          ),
      );

      // ======================================================
      // GO TO KYC
      // ======================================================

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
        headerTitle="Salon Services"
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
        {/* ==================================================
            TITLE
        ================================================== */}

        <Text
          style={styles.title}
        >
          Services provided by your salon
        </Text>

        <Text
          style={styles.subtitle}
        >
          Select the Clavata categories and
          subcategories that your salon
          provides. You can select an entire
          category or individual services.
        </Text>

        {/* ==================================================
            CATALOG LOADING
        ================================================== */}

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

        {/* ==================================================
            CATALOG ERROR
        ================================================== */}

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

        {/* ==================================================
            SELECT SERVICES BUTTON
        ================================================== */}

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
                        ? 'subcategory'
                        : 'subcategories'
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

        {/* ==================================================
            SELECTED SERVICES PREVIEW
        ================================================== */}

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
              <Text
                style={
                  styles.selectedPreviewTitle
                }
              >
                Your selected services (
                {
                  sortedSelectedServices.length
                }
                )
              </Text>

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

            {(
              showAllSelectedServices
                ? sortedSelectedServices
                : sortedSelectedServices.slice(
                    0,
                    6,
                  )
            ).map(
              selection => (
                <View
                  key={`${selection.categoryId}-${selection.subcategoryId}`}
                  style={
                    styles.selectedServiceChip
                  }
                >
                  <View
                    style={
                      styles.selectedServiceDot
                    }
                  />

                  <View
                    style={
                      styles.selectedServiceContent
                    }
                  >
                    <Text
                      style={
                        styles.selectedServiceText
                      }
                    >
                      {
                        selection.subcategoryName ||
                        'Selected service'
                      }
                    </Text>

                    {!!selection.categoryName ? (
                      <Text
                        style={
                          styles.selectedServiceCategory
                        }
                      >
                        {
                          selection.categoryName
                        }
                      </Text>
                    ) : null}
                  </View>
                </View>
              ),
            )}

            {/* =================================================
                MORE / SHOW LESS
            ================================================= */}

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

        {/* ==================================================
            REQUIRED MESSAGE
        ================================================== */}

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
            * Service selection is
            mandatory to continue.
          </Text>
        ) : null}

        {/* ==================================================
            INFORMATION
        ================================================== */}

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
            • Select all categories and
            individual services that your
            salon provides.
          </Text>

          <Text
            style={styles.infoText}
          >
            • Selecting a category selects all
            services under that category.
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
            • Service availability such as Salon,
            Home, or Salon & Home can be
            configured separately.
          </Text>

          <Text
            style={styles.infoText}
          >
            • You can edit your service settings
            later from your salon profile.
          </Text>
        </View>

        {/* ==================================================
            CONTINUE
        ================================================== */}

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
            {/* =================================================
                MODAL HEADER
            ================================================= */}

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
                  Choose the services your
                  salon provides
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

            {/* =================================================
                SELECTED COUNT
            ================================================= */}

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

            {/* =================================================
                CATEGORY LIST
            ================================================= */}

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
              {categories.map(
                category => {
                  const categorySubcategories =
                    getCategorySubcategories(
                      category.categoryId,
                    );

                  const isOpen =
                    !!openCategories[
                      category.categoryId
                    ];

                  const selectedCount =
                    selectedServiceSelections.filter(
                      selection =>
                        selection.categoryId ===
                        category.categoryId,
                    ).length;

                  const categorySelectionState =
                    getCategorySelectionState(
                      category.categoryId,
                    );

                  const categorySelected =
                    categorySelectionState.allSelected;

                  const categoryPartial =
                    categorySelectionState.partiallySelected;

                  return (
                    <View
                      key={
                        category.categoryId
                      }
                      style={
                        styles.modalCategory
                      }
                    >
                      {/* =====================================
                          CATEGORY HEADER
                      ===================================== */}

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
                          {/* CATEGORY CHECKBOX */}

                          <TouchableOpacity
                            activeOpacity={0.8}
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

                          {/* CATEGORY ICON */}

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

                          {/* CATEGORY NAME */}

                          <TouchableOpacity
                            activeOpacity={0.8}
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

                        {/* OPEN / CLOSE */}

                        <TouchableOpacity
                          activeOpacity={0.8}
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

                      {/* =====================================
                          SUBCATEGORIES
                      ===================================== */}

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
                                    isSelected(
                                      category.categoryId,
                                      subcategory.subcategoryId,
                                    );

                                  return (
                                    <TouchableOpacity
                                      key={
                                        subcategory.subcategoryId
                                      }
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
                                      {/* CHECKBOX */}

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

                                      {/* NAME */}

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
              )}
            </ScrollView>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

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
                      'Please select at least one service category and subcategory provided by your salon.',
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

    // ========================================================
    // CATALOG
    // ========================================================

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

    // ========================================================
    // SERVICE SELECTOR
    // ========================================================

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
    // SELECTED SERVICES
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
        SPACING.small,
    },

    selectedPreviewTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 12,

      color:
        COLORS.text,
    },

    editServicesText: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 12,

      color:
        COLORS.themeColor,
    },

    selectedServiceChip: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      paddingVertical:
        6,
    },

    selectedServiceDot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      backgroundColor:
        COLORS.themeColor,

      marginRight:
        SPACING.small,

      marginTop: 5,
    },

    selectedServiceContent: {
      flex: 1,
    },

    selectedServiceText: {
      fontFamily:
        FONTS.regular,

      fontSize: 12,

      color:
        COLORS.text,
    },

    selectedServiceCategory: {
      fontFamily:
        FONTS.regular,

      fontSize: 10,

      color:
        COLORS.textSecondary,

      marginTop: 2,
    },

    moreSelectedButton: {
      flexDirection:
        'row',

      alignItems:
        'center',

      alignSelf:
        'flex-start',

      marginTop: 5,

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
        '88%',

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

    // ========================================================
    // CATEGORY
    // ========================================================

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

    // ========================================================
    // CATEGORY CHECKBOX
    // ========================================================

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

    // ========================================================
    // SUBCATEGORIES
    // ========================================================

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

    // ========================================================
    // MODAL FOOTER
    // ========================================================

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

    // ========================================================
    // INFORMATION
    // ========================================================

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

    // ========================================================
    // BUTTON
    // ========================================================

    button: {
      width:
        '100%',

      backgroundColor:
        COLORS.themeColor,

      height:
        54,

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