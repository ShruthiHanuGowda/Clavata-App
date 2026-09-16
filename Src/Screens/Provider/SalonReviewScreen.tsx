import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useMutation,
  useQuery,
} from '@apollo/client';

import {
  Header,
  DButton,
} from '../../components';

import {
  useSalonRegistration,
} from '../../context/SalonRegistrationContext';

import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';

import {
  REGISTER_SALON_PARTNER,
  GET_CLAVATA_CATEGORIES,
  GET_CLAVATA_SUBCATEGORIES,
} from '../../graphql/queries';


/*
 * =====================================================
 * TYPES
 * =====================================================
 */

type RegisterSalonPartnerResponse = {
  registerSalonPartner: {
    success: boolean;
    message: string;
    salonId: string;
  };
};


type ReviewServiceSelection = {
  categoryId: string;
  categoryName?: string;
  subcategoryId: string;
  subcategoryName?: string;
};


type Category = {
  categoryId: string;
  name: string;
  description?: string;
  servicesCount: number;
  status: string;
};


type Subcategory = {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description?: string;
  servicesCount: number;
  status: string;
};


type RegisterSalonPartnerVariables = {
  input: {
    userId: string;
    phoneNumber: string;
    salonName: string;
    ownerName: string;
    email: string;
    businessType: string;

    address: {
      addressLine: string;
      city: string;
      state: string;
      pincode: string;
    };

    businessHours: Record<
      string,
      {
        isOpen: boolean;
        open?: string;
        close?: string;
      }
    >;

    gstNumber?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    bankAccount?: string;
    ifsc?: string;

    /*
     * Master category/subcategory selections.
     */
    serviceSelections: Array<{
      categoryId: string;
      subcategoryId: string;
    }>;
  };
};


/*
 * =====================================================
 * SCREEN
 * =====================================================
 */

const SalonReviewScreen = ({
  navigation,
}: any) => {
  const {
    data,
  } = useSalonRegistration();


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  /*
   * --------------------------------------------------
   * MASTER CATEGORIES
   * --------------------------------------------------
   */

  const {
    data: categoryResponse,
    loading: categoriesLoading,
  } = useQuery(
    GET_CLAVATA_CATEGORIES,
    {
      fetchPolicy: 'network-only',
    },
  );


  /*
   * --------------------------------------------------
   * MASTER SUBCATEGORIES
   * --------------------------------------------------
   */

  const {
    data: subcategoryResponse,
    loading: subcategoriesLoading,
  } = useQuery(
    GET_CLAVATA_SUBCATEGORIES,
    {
      fetchPolicy: 'network-only',
    },
  );


  const categories: Category[] =
    categoryResponse?.categories?.categories || [];


  const subcategories: Subcategory[] =
    subcategoryResponse?.subcategories?.subcategories || [];


  /*
   * --------------------------------------------------
   * SERVICE SELECTIONS
   * --------------------------------------------------
   */

  const serviceSelections: ReviewServiceSelection[] =
    data.serviceSelections || [];


  /*
   * --------------------------------------------------
   * GROUP SELECTED SERVICES BY CATEGORY
   * --------------------------------------------------
   *
   * Context currently stores categoryId + subcategoryId.
   *
   * We resolve the names from the master Category and
   * Subcategory data so the Review screen always shows
   * the actual Clavata master names.
   *
   * --------------------------------------------------
   */

  const groupedServices = useMemo(() => {
    const grouped: Record<
      string,
      {
        categoryId: string;
        categoryName: string;
        services: Array<{
          subcategoryId: string;
          subcategoryName: string;
        }>;
      }
    > = {};


    serviceSelections.forEach(
      selection => {
        const categoryId =
          selection.categoryId;


        if (!categoryId) {
          return;
        }


        /*
         * Find category from master list.
         */

        const category =
          categories.find(
            item =>
              item.categoryId ===
              categoryId,
          );


        /*
         * Find subcategory from master list.
         */

        const subcategory =
          subcategories.find(
            item =>
              item.subcategoryId ===
              selection.subcategoryId,
          );


        /*
         * Prefer stored name if available.
         * Otherwise use master data.
         */

        const categoryName =
          selection.categoryName ||
          category?.name ||
          'Category';


        const subcategoryName =
          selection.subcategoryName ||
          subcategory?.name ||
          'Service';


        /*
         * Create category group if needed.
         */

        if (!grouped[categoryId]) {
          grouped[categoryId] = {
            categoryId,
            categoryName,
            services: [],
          };
        }


        /*
         * Prevent duplicate subcategories
         * inside the same category.
         */

        const alreadyExists =
          grouped[
            categoryId
          ].services.some(
            service =>
              service.subcategoryId ===
              selection.subcategoryId,
          );


        if (!alreadyExists) {
          grouped[
            categoryId
          ].services.push({
            subcategoryId:
              selection.subcategoryId,

            subcategoryName,
          });
        }
      },
    );


    return Object.values(grouped);
  }, [
    serviceSelections,
    categories,
    subcategories,
  ]);


  /*
   * --------------------------------------------------
   * REGISTER MUTATION
   * --------------------------------------------------
   */

  const [
    registerSalonPartner,
  ] = useMutation<
    RegisterSalonPartnerResponse,
    RegisterSalonPartnerVariables
  >(
    REGISTER_SALON_PARTNER,
  );


  /*
   * --------------------------------------------------
   * EDIT HANDLERS
   * --------------------------------------------------
   */

  const handleEditAddress =
    () => {
      navigation.navigate(
        'SalonAddress',
      );
    };


  const handleEditBusinessHours =
    () => {
      navigation.navigate(
        'SalonBusinessHours',
      );
    };


  const handleEditKYC =
    () => {
      navigation.navigate(
        'SalonKYC',
      );
    };


  const handleEditServices =
    () => {
      navigation.navigate(
        'SalonKYC',
      );
    };


  /*
   * --------------------------------------------------
   * SUBMIT
   * --------------------------------------------------
   */

  const handleSubmit =
    useCallback(
      async () => {
        if (submitting) {
          return;
        }


        /*
         * --------------------------------------------
         * BASIC VALIDATION
         * --------------------------------------------
         */

        if (
          !data.userId ||
          !data.phoneNumber ||
          !data.salonName ||
          !data.ownerName ||
          !data.email ||
          !data.businessType
        ) {
          Alert.alert(
            'Missing Information',
            'Please complete all required salon information.',
          );

          return;
        }


        /*
         * --------------------------------------------
         * ADDRESS VALIDATION
         * --------------------------------------------
         */

        if (
          !data.addressLine ||
          !data.city ||
          !data.state ||
          !data.pincode
        ) {
          Alert.alert(
            'Missing Address',
            'Please complete the salon address.',
          );

          return;
        }


        /*
         * --------------------------------------------
         * BUSINESS HOURS VALIDATION
         * --------------------------------------------
         */

        if (
          !data.businessHours ||
          Object.keys(
            data.businessHours,
          ).length === 0
        ) {
          Alert.alert(
            'Missing Business Hours',
            'Please provide your business hours.',
          );

          return;
        }


        /*
         * --------------------------------------------
         * KYC VALIDATION
         * --------------------------------------------
         */

        if (!data.panNumber) {
          Alert.alert(
            'Missing PAN',
            'Please provide your PAN number.',
          );

          return;
        }


        if (!data.aadhaarNumber) {
          Alert.alert(
            'Missing Aadhaar',
            'Please provide your Aadhaar number.',
          );

          return;
        }


        if (
          !data.gstNumber &&
          !data.shopEstablishmentNumber &&
          !data.udyamNumber
        ) {
          Alert.alert(
            'Business Verification Required',
            'Please provide GST, Shop Establishment Number, or Udyam Number.',
          );

          return;
        }


        /*
         * --------------------------------------------
         * SERVICE VALIDATION
         * --------------------------------------------
         */

        if (
          !serviceSelections ||
          serviceSelections.length === 0
        ) {
          Alert.alert(
            'Services Required',
            'Please select at least one service category/subcategory for your salon.',
          );

          return;
        }


        /*
         * --------------------------------------------
         * REMOVE INVALID SELECTIONS
         * --------------------------------------------
         */

        const validServiceSelections =
          serviceSelections.filter(
            selection =>
              Boolean(
                selection.categoryId,
              ) &&
              Boolean(
                selection.subcategoryId,
              ),
          );


        if (
          validServiceSelections.length ===
          0
        ) {
          Alert.alert(
            'Services Required',
            'Please select at least one valid service category/subcategory for your salon.',
          );

          return;
        }


        /*
         * --------------------------------------------
         * SUBMIT
         * --------------------------------------------
         */

        try {
          setSubmitting(true);


          /*
           * Only IDs are sent to the backend.
           *
           * Category/subcategory names are master
           * data and should not be trusted from the
           * mobile client.
           */

          const input = {
            userId:
              data.userId,

            phoneNumber:
              data.phoneNumber,

            salonName:
              data.salonName,

            ownerName:
              data.ownerName,

            email:
              data.email,

            businessType:
              data.businessType,


            address: {
              addressLine:
                data.addressLine,

              city:
                data.city,

              state:
                data.state,

              pincode:
                data.pincode,
            },


            businessHours:
              data.businessHours,


            gstNumber:
              data.gstNumber ||
              undefined,

            panNumber:
              data.panNumber ||
              undefined,

            aadhaarNumber:
              data.aadhaarNumber ||
              undefined,

            bankAccount:
              data.bankAccount ||
              undefined,

            ifsc:
              data.ifsc ||
              undefined,


            /*
             * ----------------------------------------
             * MASTER SERVICE SELECTIONS
             * ----------------------------------------
             */

            serviceSelections:
              validServiceSelections.map(
                selection => ({
                  categoryId:
                    selection.categoryId,

                  subcategoryId:
                    selection.subcategoryId,
                }),
              ),
          };


          console.log(
            'Submitting salon registration:',
            {
              ...input,
              serviceSelections:
                input.serviceSelections,
            },
          );


          const result =
            await registerSalonPartner({
              variables: {
                input,
              },
            });


          const response =
            result.data
              ?.registerSalonPartner;


          if (
            !response?.success
          ) {
            throw new Error(
              response?.message ||
                'Unable to submit salon registration.',
            );
          }


          Alert.alert(
            'Registration Submitted',
            response.message ||
              'Your salon registration has been submitted successfully.',
            [
              {
                text: 'OK',

                onPress: () => {
                  navigation.navigate(
                    'SalonSuccess',
                    {
                      salonId:
                        response.salonId,

                      salonName:
                        data.salonName,
                    },
                  );
                },
              },
            ],
          );
        } catch (error: any) {
          console.error(
            'Salon registration error:',
            error,
          );


          Alert.alert(
            'Registration Failed',
            error?.message ||
              'Something went wrong while submitting your registration.',
          );
        } finally {
          setSubmitting(false);
        }
      },
      [
        data,
        serviceSelections,
        submitting,
        registerSalonPartner,
        navigation,
      ],
    );


  /*
   * --------------------------------------------------
   * HELPERS
   * --------------------------------------------------
   */

  const maskedAadhaar =
    data.aadhaarNumber
      ? `XXXX XXXX ${data.aadhaarNumber.slice(
          -4,
        )}`
      : 'Not provided';


  const maskedBankAccount =
    data.bankAccount
      ? `XXXXXX${data.bankAccount.slice(
          -4,
        )}`
      : 'Not provided';


  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Review & Submit"
        backBtn={() =>
          navigation.goBack()
        }
      />


      <ScrollView
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ============================================
            SALON INFORMATION
        ============================================ */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              Salon Information
            </Text>


            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'SalonInformation',
                )
              }
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>


          <View
            style={styles.card}
          >
            <ReviewRow
              label="Salon Name"
              value={
                data.salonName ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Owner Name"
              value={
                data.ownerName ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Email"
              value={
                data.email ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Phone Number"
              value={
                data.phoneNumber ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Business Type"
              value={
                data.businessType ||
                'Not provided'
              }
              last
            />
          </View>
        </View>


        {/* ============================================
            ADDRESS
        ============================================ */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              Address
            </Text>


            <TouchableOpacity
              onPress={
                handleEditAddress
              }
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>


          <View
            style={styles.card}
          >
            <ReviewRow
              label="Address"
              value={
                data.addressLine ||
                'Not provided'
              }
            />


            <ReviewRow
              label="City"
              value={
                data.city ||
                'Not provided'
              }
            />


            <ReviewRow
              label="State"
              value={
                data.state ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Pincode"
              value={
                data.pincode ||
                'Not provided'
              }
              last
            />
          </View>
        </View>


        {/* ============================================
            BUSINESS HOURS
        ============================================ */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              Business Hours
            </Text>


            <TouchableOpacity
              onPress={
                handleEditBusinessHours
              }
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>


          <View
            style={styles.card}
          >
            {data.businessHours &&
            Object.keys(
              data.businessHours,
            ).length > 0 ? (
              Object.entries(
                data.businessHours,
              ).map(
                (
                  [
                    day,
                    hours,
                  ],
                ) => (
                  <View
                    key={day}
                    style={
                      styles.hoursRow
                    }
                  >
                    <Text
                      style={
                        styles.dayText
                      }
                    >
                      {day}
                    </Text>


                    <Text
                      style={
                        styles.hoursText
                      }
                    >
                      {hours.isOpen
                        ? `${hours.open || ''} - ${
                            hours.close ||
                            ''
                          }`
                        : 'Closed'}
                    </Text>
                  </View>
                ),
              )
            ) : (
              <Text
                style={
                  styles.emptyText
                }
              >
                Business hours not provided
              </Text>
            )}
          </View>
        </View>


        {/* ============================================
            SERVICES
        ============================================ */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              Services provided by your salon
            </Text>


            <TouchableOpacity
              onPress={
                handleEditServices
              }
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>


          <View
            style={styles.card}
          >
            {(
              categoriesLoading ||
              subcategoriesLoading
            ) ? (
              <View
                style={
                  styles.servicesLoading
                }
              >
                <ActivityIndicator
                  size="small"
                  color={
                    COLORS.primary ||
                    '#009D94'
                  }
                />


                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading selected services...
                </Text>
              </View>
            ) : serviceSelections.length ===
              0 ? (
              <Text
                style={
                  styles.emptyText
                }
              >
                No services selected
              </Text>
            ) : groupedServices.length ===
              0 ? (
              <Text
                style={
                  styles.emptyText
                }
              >
                Selected services could not be loaded.
                Please edit your services and try again.
              </Text>
            ) : (
              groupedServices.map(
                category => (
                  <View
                    key={
                      category.categoryId
                    }
                    style={
                      styles.serviceCategory
                    }
                  >
                    <Text
                      style={
                        styles.categoryName
                      }
                    >
                      {
                        category.categoryName
                      }
                    </Text>


                    <View
                      style={
                        styles.serviceList
                      }
                    >
                      {category.services.map(
                        service => (
                          <View
                            key={
                              `${category.categoryId}-${service.subcategoryId}`
                            }
                            style={
                              styles.serviceItem
                            }
                          >
                            <View
                              style={
                                styles.serviceDot
                              }
                            />


                            <Text
                              style={
                                styles.serviceName
                              }
                            >
                              {
                                service.subcategoryName
                              }
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                ),
              )
            )}
          </View>
        </View>


        {/* ============================================
            KYC
        ============================================ */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              KYC & Verification
            </Text>


            <TouchableOpacity
              onPress={handleEditKYC}
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>


          <View
            style={styles.card}
          >
            <ReviewRow
              label="PAN Number"
              value={
                data.panNumber ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Aadhaar Number"
              value={
                maskedAadhaar
              }
            />


            <ReviewRow
              label="GST Number"
              value={
                data.gstNumber ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Shop Establishment Number"
              value={
                data.shopEstablishmentNumber ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Udyam Number"
              value={
                data.udyamNumber ||
                'Not provided'
              }
            />


            <ReviewRow
              label="Bank Account"
              value={
                maskedBankAccount
              }
            />


            <ReviewRow
              label="IFSC"
              value={
                data.ifsc ||
                'Not provided'
              }
              last
            />
          </View>
        </View>


        {/* ============================================
            VERIFICATION NOTICE
        ============================================ */}

        <View
          style={
            styles.verificationNotice
          }
        >
          <Text
            style={
              styles.verificationTitle
            }
          >
            Verification Required
          </Text>


          <Text
            style={
              styles.verificationText
            }
          >
            Your salon registration will be
            reviewed by Clavata. Your salon
            will become active only after the
            required verification and approval
            are completed.
          </Text>
        </View>


        {/* ============================================
            SUBMIT
        ============================================ */}

        <View
          style={
            styles.submitContainer
          }
        >
          <DButton
          style={
                styles.submitButtonStyle
              }
            onPress={handleSubmit}
            disabled={submitting}
            loading={submitting}
          >
            {/*
             * IMPORTANT:
             * DButton renders children directly.
             * Therefore this MUST be wrapped in
             * Text instead of passing a raw string.
             */}

            <Text
              style={
                styles.submitButtonText
              }
            >
              Submit Registration
            </Text>
          </DButton>
        </View>


        <View
          style={
            styles.bottomSpacing
          }
        />

      </ScrollView>
    </SafeAreaView>
  );
};


/*
 * =====================================================
 * REVIEW ROW
 * =====================================================
 */

type ReviewRowProps = {
  label: string;
  value: string;
  last?: boolean;
};


const ReviewRow = ({
  label,
  value,
  last = false,
}: ReviewRowProps) => {
  return (
    <View
      style={[
        styles.reviewRow,
        last &&
          styles.reviewRowLast,
      ]}
    >
      <Text
        style={styles.reviewLabel}
      >
        {label}
      </Text>


      <Text
        style={styles.reviewValue}
      >
        {value}
      </Text>
    </View>
  );
};


/*
 * =====================================================
 * STYLES
 * =====================================================
 */

const styles = StyleSheet.create({
  submitContainer: {
  width: '100%',
  paddingHorizontal: 20,
  paddingBottom: 24,
},

submitButton: {
  width: '100%',
  minHeight: 56,
  borderRadius: 14,
  justifyContent: 'center',
  alignItems: 'center',
},

submitButtonText: {
  fontFamily: FONTS.semiBold || FONTS.bold,
  fontSize: 16,
  color: '#FFFFFF',
  textAlign: 'center',
},
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background ||
      '#FFFFFF',
  },


  contentContainer: {
    paddingHorizontal:
      SPACING.large,

    paddingTop:
      SPACING.medium,

    paddingBottom:
      SPACING.huge,
  },

submitButtonStyle:{
backgroundColor: COLORS.themeColor
},
  section: {
    marginBottom:
      SPACING.large,
  },


  sectionHeader: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    marginBottom:
      SPACING.small,
  },


  sectionTitle: {
    fontFamily:
      FONTS.semiBold ||
      FONTS.bold,

    fontSize: 17,

    color:
      COLORS.text ||
      '#111111',

    flex: 1,
  },


  editText: {
    fontFamily:
      FONTS.semiBold ||
      FONTS.bold,

    fontSize: 14,

    color:
      COLORS.primary ||
      '#009D94',
  },


  card: {
    backgroundColor:
      COLORS.white ||
      '#FFFFFF',

    borderRadius:
      RADIUS.medium,

    paddingHorizontal:
      SPACING.medium,

    paddingVertical:
      SPACING.small,

    borderWidth: 1,

    borderColor:
      COLORS.border ||
      '#E5E5E5',
  },


  reviewRow: {
    paddingVertical:
      SPACING.medium,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border ||
      '#E5E5E5',
  },


  reviewRowLast: {
    borderBottomWidth: 0,
  },


  reviewLabel: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    color:
      COLORS.textSecondary ||
      '#777777',

    marginBottom: 4,
  },


  reviewValue: {
    fontFamily:
      FONTS.medium ||
      FONTS.regular,

    fontSize: 15,

    color:
      COLORS.text ||
      '#111111',
  },


  hoursRow: {
    flexDirection:
      'row',

    justifyContent:
      'space-between',

    alignItems:
      'center',

    paddingVertical:
      SPACING.medium,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border ||
      '#E5E5E5',
  },


  dayText: {
    fontFamily:
      FONTS.medium ||
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.text ||
      '#111111',

    textTransform:
      'capitalize',
  },


  hoursText: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.textSecondary ||
      '#666666',
  },


  emptyText: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.textSecondary ||
      '#777777',

    paddingVertical:
      SPACING.medium,
  },


  servicesLoading: {
    flexDirection:
      'row',

    alignItems:
      'center',

    paddingVertical:
      SPACING.medium,
  },


  loadingText: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.textSecondary ||
      '#777777',

    marginLeft:
      SPACING.small,
  },


  serviceCategory: {
    paddingVertical:
      SPACING.medium,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border ||
      '#E5E5E5',
  },


  categoryName: {
    fontFamily:
      FONTS.semiBold ||
      FONTS.bold,

    fontSize: 15,

    color:
      COLORS.text ||
      '#111111',

    marginBottom:
      SPACING.small,
  },


  serviceList: {
    gap: 7,
  },


  serviceItem: {
    flexDirection:
      'row',

    alignItems:
      'center',

    paddingVertical: 3,
  },


  serviceDot: {
    width: 6,

    height: 6,

    borderRadius: 3,

    backgroundColor:
      COLORS.primary ||
      '#009D94',

    marginRight:
      SPACING.small,
  },


  serviceName: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.textSecondary ||
      '#555555',

    flex: 1,
  },


  verificationNotice: {
    backgroundColor:
      '#F5F7FA',

    borderRadius:
      RADIUS.medium,

    padding:
      SPACING.medium,

    marginBottom:
      SPACING.large,

    borderWidth: 1,

    borderColor:
      COLORS.border ||
      '#E5E5E5',
  },


  verificationTitle: {
    fontFamily:
      FONTS.semiBold ||
      FONTS.bold,

    fontSize: 15,

    color:
      COLORS.text ||
      '#111111',

    marginBottom:
      SPACING.small,
  },


  verificationText: {
    fontFamily:
      FONTS.regular,

    fontSize: 13,

    lineHeight: 20,

    color:
      COLORS.textSecondary ||
      '#666666',
  },
  bottomSpacing: {
    height:
      SPACING.huge,
  },
});


export default SalonReviewScreen;