import React, {
  useState,
} from 'react';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function SalonKYCScreen({
  navigation,
}: any) {

  const {
    data,
    updateData,
  } = useSalonRegistration();

  // ==========================================================
  // KYC STATE
  //
  // IMPORTANT:
  // These are intentionally EMPTY when the KYC screen opens.
  //
  // Previously these were initialized using:
  //
  // useState(data.panNumber || '')
  //
  // which caused previously stored context values to appear
  // automatically.
  // ==========================================================

  const [
    panNumber,
    setPanNumber,
  ] = useState('');

  const [
    aadhaarNumber,
    setAadhaarNumber,
  ] = useState('');

  const [
    gstNumber,
    setGstNumber,
  ] = useState('');

  const [
    shopEstablishmentNumber,
    setShopEstablishmentNumber,
  ] = useState('');

  const [
    udyamNumber,
    setUdyamNumber,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

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
  // CLAVATA CATEGORY / SUBCATEGORY
  // ==========================================================

  const {
    data: categoryResponse,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(
    GET_CLAVATA_CATEGORIES,
    {
      fetchPolicy: 'network-only',
    },
  );

  const {
    data: subcategoryResponse,
    loading: subcategoriesLoading,
    error: subcategoriesError,
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
  //
  // These SHOULD continue coming from context.
  // The user already selected these on the previous screen.
  // ==========================================================

  const selectedServiceSelections:
    SalonServiceSelection[] =
    Array.isArray(
      data.serviceSelections,
    )
      ? data.serviceSelections
      : [];

  // ==========================================================
  // CHECK SELECTION
  // ==========================================================

  const isSelected = (
    categoryId: string,
    subcategoryId: string,
  ) => {

    return selectedServiceSelections.some(
      selection =>
        selection.categoryId === categoryId &&
        selection.subcategoryId === subcategoryId,
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
      categorySubcategories.length === 0
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
        categorySubcategories.length > 0 &&
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
    // SAVE INTO REGISTRATION CONTEXT
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
    // CLEAN VALUES
    // ========================================================

    const cleanPAN =
      panNumber
        .trim()
        .toUpperCase();

    const cleanAadhaar =
      aadhaarNumber
        .replace(/\D/g, '');

    const cleanGST =
      gstNumber
        .trim()
        .toUpperCase();

    const cleanShop =
      shopEstablishmentNumber
        .trim();

    const cleanUdyam =
      udyamNumber
        .trim()
        .toUpperCase();

    // ========================================================
    // PAN VALIDATION
    // ========================================================

    if (
      !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
        cleanPAN,
      )
    ) {

      Alert.alert(
        'Invalid PAN',
        'Please enter a valid PAN number.',
      );

      return;
    }

    // ========================================================
    // AADHAAR VALIDATION
    // ========================================================

    if (
      !/^\d{12}$/.test(
        cleanAadhaar,
      )
    ) {

      Alert.alert(
        'Invalid Aadhaar',
        'Please enter a valid 12-digit Aadhaar number.',
      );

      return;
    }

    // ========================================================
    // BUSINESS DOCUMENT
    // ========================================================

    if (
      !cleanGST &&
      !cleanShop &&
      !cleanUdyam
    ) {

      Alert.alert(
        'Business verification required',
        'Please provide at least one business registration detail such as GSTIN, Shop & Establishment number, or Udyam number.',
      );

      return;
    }

    // ========================================================
    // SERVICE SELECTION
    //
    // MANDATORY
    // ========================================================

    if (
      selectedServiceSelections.length === 0
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
      // DEVELOPMENT REFERENCE
      // ======================================================

      const referenceId =
        data.kycReferenceId ||
        `DEV-KYC-${Date.now()}`;

      // ======================================================
      // SAVE KYC INFORMATION
      //
      // KYC fields are saved into registration context ONLY
      // when Continue is pressed.
      // ======================================================

      updateData({

        panNumber:
          cleanPAN,

        aadhaarNumber:
          cleanAadhaar,

        gstNumber:
          cleanGST,

        shopEstablishmentNumber:
          cleanShop,

        udyamNumber:
          cleanUdyam,

        kycStatus:
          'PENDING',

        kycReferenceId:
          referenceId,

        kycSubmittedAt:
          '',

        kycReviewedAt:
          '',

        kycRejectionReason:
          '',

        providerStatus:
          'NOT_REGISTERED',

        // ====================================================
        // KEEP SELECTED CLAVATA CATEGORIES/SUBCATEGORIES
        //
        // Only IDs are sent to backend.
        // Names are used by UI.
        // ====================================================

        serviceSelections:
          selectedServiceSelections.map(
            selection => ({
              categoryId:
                selection.categoryId,

              subcategoryId:
                selection.subcategoryId,
            }),
          ),
      });

      // ======================================================
      // SMALL DELAY FOR UI
      // ======================================================

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            300,
          ),
      );

      // ======================================================
      // GO TO REVIEW
      // ======================================================

      navigation.navigate(
        'SalonReview',
      );

    } catch (error) {

      console.error(
        'KYC CONTINUE ERROR:',
        error,
      );

      Alert.alert(
        'Unable to continue',
        'Something went wrong while saving your KYC information. Please try again.',
      );

    } finally {

      setSubmitting(false);
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
        headerTitle="Business Verification"
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
            HEADER
        ================================================== */}

        <Text
          style={styles.title}
        >
          Verify your salon
        </Text>

        {/* <Text
          style={styles.subtitle}
        >
          Provide the owner and business information required
          to verify your salon.
        </Text> */}

        {/* ==================================================
            OWNER VERIFICATION
        ================================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={styles.sectionTitle}
          >
            Owner verification
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            These details are used to verify the business owner.
          </Text>

          {/* PAN */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              PAN Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="ABCDE1234F"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={panNumber}
              onChangeText={
                text =>
                  setPanNumber(
                    text
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        '',
                      ),
                  )
              }
              maxLength={10}
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {/* AADHAAR */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              Aadhaar Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="12 digit Aadhaar"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={aadhaarNumber}
              onChangeText={
                text =>
                  setAadhaarNumber(
                    text.replace(
                      /\D/g,
                      '',
                    ),
                  )
              }
              keyboardType="number-pad"
              maxLength={12}
              secureTextEntry
            />

          </View>

        </View>

        {/* ==================================================
            BUSINESS VERIFICATION
        ================================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={styles.sectionTitle}
          >
            Business verification
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            Provide whichever business registration details
            apply to your salon.
          </Text>

          {/* GST */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              GSTIN
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={gstNumber}
              onChangeText={
                text =>
                  setGstNumber(
                    text
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        '',
                      ),
                  )
              }
              maxLength={15}
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {/* SHOP */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              Shop & Establishment Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                shopEstablishmentNumber
              }
              onChangeText={
                setShopEstablishmentNumber
              }
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {/* UDYAM */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              Udyam Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={udyamNumber}
              onChangeText={
                setUdyamNumber
              }
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

        </View>

        {/* ==================================================
            CLAVATA SERVICES
        ================================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={styles.sectionTitle}
          >
            Services provided by your salon
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            Select the Clavata categories and subcategories
            that your salon provides. This is required.
          </Text>

          {/* =================================================
              SERVICE LOADING
          ================================================= */}

          {(
            categoriesLoading ||
            subcategoriesLoading
          ) ? (

            <View
              style={styles.catalogLoading}
            >

              <ActivityIndicator
                size="small"
                color={
                  COLORS.themeColor
                }
              />

              <Text
                style={styles.catalogLoadingText}
              >
                Loading Clavata services...
              </Text>

            </View>

          ) : null}

          {/* =================================================
              ERROR
          ================================================= */}

          {!categoriesLoading &&
          !subcategoriesLoading &&
          (
            categoriesError ||
            subcategoriesError
          ) ? (

            <View
              style={styles.catalogError}
            >

              <Text
                style={styles.catalogErrorTitle}
              >
                Unable to load services
              </Text>

              <Text
                style={styles.catalogErrorText}
              >
                {categoriesError
                  ? `Categories error: ${categoriesError.message}`
                  : `Subcategories error: ${subcategoriesError?.message}`}
              </Text>

            </View>

          ) : null}

          {/* =================================================
              SELECT BUTTON
          ================================================= */}

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
                selectedServiceSelections.length === 0 &&
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
                  {selectedServiceSelections.length > 0
                    ? `${selectedServiceSelections.length} ${
                        selectedServiceSelections.length === 1
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

          {/* =================================================
              SELECTED SERVICES PREVIEW
          ================================================= */}

          {!categoriesLoading &&
          !subcategoriesLoading &&
          selectedServiceSelections.length > 0 ? (

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
                  Selected services (
                  {selectedServiceSelections.length}
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
                  ? selectedServiceSelections
                  : selectedServiceSelections.slice(0, 6)
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
                          {selection.categoryName}
                        </Text>

                      ) : null}

                    </View>

                  </View>

                ),
              )}

              {/* MORE / SHOW LESS */}

              {selectedServiceSelections.length > 6 ? (

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
                          selectedServiceSelections.length - 6
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

          {/* =================================================
              REQUIRED MESSAGE
          ================================================= */}

          {!categoriesLoading &&
          !subcategoriesLoading &&
          !categoriesError &&
          !subcategoriesError &&
          selectedServiceSelections.length === 0 ? (

            <Text
              style={
                styles.requiredText
              }
            >
              * Service selection is mandatory to continue.
            </Text>

          ) : null}

        </View>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <View
          style={styles.infoCard}
        >

          <Text
            style={styles.infoTitle}
          >
            What happens next?
          </Text>

          <Text
            style={styles.infoText}
          >
            1. Review all your salon registration information.
          </Text>

          <Text
            style={styles.infoText}
          >
            2. Submit the registration.
          </Text>

          <Text
            style={styles.infoText}
          >
            3. Your KYC/business verification will be processed.
          </Text>

          <Text
            style={styles.infoText}
          >
            4. Your salon will remain pending until verification
            and approval are completed.
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
              Continue to Review
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
                  Choose the services your salon provides
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
                {selectedServiceSelections.length}{' '}
                {selectedServiceSelections.length === 1
                  ? 'subcategory'
                  : 'subcategories'}{' '}
                selected
              </Text>

              {selectedServiceSelections.length === 0 ? (

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

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          toggleCategory(
                            category.categoryId,
                          )
                        }
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

                          {(() => {

                            const categorySelectionState =
                              getCategorySelectionState(
                                category.categoryId,
                              );

                            const categorySelected =
                              categorySelectionState.allSelected;

                            const categoryPartial =
                              categorySelectionState.partiallySelected;

                            return (
                              <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={
                                  categorySubcategories.length === 0
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
                                  categorySubcategories.length === 0 &&
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
                            );

                          })()}

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
                                .charAt(0)
                                .toUpperCase()}
                            </Text>

                          </View>

                          {/* CATEGORY NAME */}

                          <View
                            style={
                              styles.modalCategoryText
                            }
                          >

                            <Text
                              style={
                                styles.modalCategoryName
                              }
                            >
                              {category.name}
                            </Text>

                            <Text
                              style={
                                styles.modalCategoryMeta
                              }
                            >
                              {categorySubcategories.length}{' '}
                              {categorySubcategories.length === 1
                                ? 'subcategory'
                                : 'subcategories'}

                              {selectedCount > 0
                                ? ` • ${selectedCount} selected`
                                : ''}
                            </Text>

                          </View>

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

                      </TouchableOpacity>

                      {/* =====================================
                          SUBCATEGORIES
                      ===================================== */}

                      {isOpen ? (

                        <View
                          style={
                            styles.modalSubcategories
                          }
                        >

                          {categorySubcategories.length === 0 ? (

                            <Text
                              style={
                                styles.noSubcategoryText
                              }
                            >
                              No active subcategories available.
                            </Text>

                          ) : (

                            categorySubcategories.map(
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
                                    activeOpacity={0.8}
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
                    selectedServiceSelections.length === 0
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
                  selectedServiceSelections.length === 0 &&
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

    section: {
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

    sectionTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 17,

      color:
        COLORS.text,

      marginBottom: 4,
    },

    sectionSubtitle: {
      fontFamily:
        FONTS.regular,

      fontSize: 12,

      lineHeight: 17,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.large,
    },

    field: {
      marginBottom:
        SPACING.large,
    },

    label: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 13,

      color:
        COLORS.text,

      marginBottom:
        SPACING.small,
    },

    input: {
      height: 52,

      backgroundColor:
        COLORS.background,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.medium,

      paddingHorizontal:
        SPACING.medium,

      fontFamily:
        FONTS.regular,

      fontSize: 15,

      color:
        COLORS.text,
    },

    // ========================================================
    // CATALOG
    // ========================================================

    catalogLoading: {
      minHeight: 90,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingVertical:
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
        COLORS.background,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.medium,

      padding:
        SPACING.medium,
    },

    catalogErrorTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 13,

      color:
        COLORS.text,

      marginBottom: 4,
    },

    catalogErrorText: {
      fontFamily:
        FONTS.regular,

      fontSize: 12,

      lineHeight: 17,

      color:
        COLORS.textSecondary,
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
        COLORS.background,

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
    // SELECTED SERVICES PREVIEW
    // ========================================================

    selectedServicesPreview: {
      backgroundColor:
        COLORS.background,

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

    // ========================================================
    // MORE SELECTED / SHOW LESS
    // ========================================================

    moreSelectedButton: {
      flexDirection:
        'row',

      alignItems:
        'center',

      alignSelf:
        'flex-start',

      marginTop:
        5,

      paddingVertical:
        5,

      paddingHorizontal:
        2,
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

      marginLeft:
        5,
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
    // MODAL CATEGORY
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
    // MODAL SUBCATEGORIES
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