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
  price?: number;
  durationMinutes?: number;
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

    /*
     * -------------------------------------------------
     * SERVICE AUDIENCE
     * -------------------------------------------------
     *
     * Who the salon provides services to.
     *
     * Multiple values are allowed.
     *
     * Example:
     *
     * ['FEMALE', 'MALE']
     *
     * -------------------------------------------------
     */

    targetAudiences: Array<
      'FEMALE' |
      'MALE' |
      'KIDS'
    >;

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
      price: number;
      duration: number;
    }>;
  };
};


/*
 * =====================================================
 * AUDIENCE LABELS
 * =====================================================
 */

const getAudienceLabel = (
  audience: string,
): string => {

  switch (audience) {

    case 'FEMALE':
      return 'Female';

    case 'MALE':
      return 'Male';

    case 'KIDS':
      return 'Kids';

    default:
      return audience;

  }
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
   * ---------------------------------------------------
   * MASTER CATEGORIES
   * ---------------------------------------------------
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
   * ---------------------------------------------------
   * MASTER SUBCATEGORIES
   * ---------------------------------------------------
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
   * ---------------------------------------------------
   * SERVICE SELECTIONS
   * ---------------------------------------------------
   */

  const serviceSelections: ReviewServiceSelection[] =
    data.serviceSelections || [];


  /*
   * ---------------------------------------------------
   * SELECTED AUDIENCES
   * ---------------------------------------------------
   *
   * The values come from SalonRegistrationContext.
   *
   * Example:
   *
   * ['FEMALE', 'MALE']
   *
   * ---------------------------------------------------
   */

  const selectedAudiences =
    data.targetAudiences || [];


  /*
   * ---------------------------------------------------
   * DISPLAY AUDIENCE LABEL
   * ---------------------------------------------------
   */

  const selectedAudienceLabel =
    selectedAudiences.length > 0
      ? selectedAudiences
          .map(getAudienceLabel)
          .join(', ')
      : 'Not provided';


  /*
   * ---------------------------------------------------
   * GROUP SELECTED SERVICES BY CATEGORY
   * ---------------------------------------------------
   *
   * Category names and service names are resolved from
   * Clavata master data.
   *
   * Categories are displayed alphabetically.
   *
   * Services inside every category are also displayed
   * alphabetically.
   *
   * ---------------------------------------------------
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
          price?: number;
          durationMinutes?: number;
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
         * Resolve names.
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
         * Create category group.
         */

        if (!grouped[categoryId]) {

          grouped[categoryId] = {
            categoryId,
            categoryName,
            services: [],
          };

        }


        /*
         * Prevent duplicate services.
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

            price:
              selection.price,

            durationMinutes:
              selection.durationMinutes,

          });

        }

      },
    );


    /*
     * Sort services alphabetically.
     */

    Object.values(grouped).forEach(
      category => {

        category.services.sort(
          (a, b) =>
            a.subcategoryName.localeCompare(
              b.subcategoryName,
              undefined,
              {
                sensitivity: 'base',
              },
            ),
        );

      },
    );


    /*
     * Sort categories alphabetically.
     */

    return Object.values(grouped).sort(
      (a, b) =>
        a.categoryName.localeCompare(
          b.categoryName,
          undefined,
          {
            sensitivity: 'base',
          },
        ),
    );

  }, [
    serviceSelections,
    categories,
    subcategories,
  ]);


  /*
   * ---------------------------------------------------
   * REGISTER MUTATION
   * ---------------------------------------------------
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
   * ---------------------------------------------------
   * EDIT HANDLERS
   * ---------------------------------------------------
   */

  const handleEditSalonInformation =
    () => {

      navigation.navigate(
        'SalonInformation',
      );

    };


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


  const handleEditServices =
    () => {

      navigation.navigate(
        'SalonServices',
      );

    };


  const handleEditKYC =
    () => {

      navigation.navigate(
        'SalonKYC',
      );

    };


  /*
   * ---------------------------------------------------
   * EDIT AUDIENCE
   * ---------------------------------------------------
   *
   * Audience is selected on the salon information/
   * registration screen.
   *
   * Change this route if your screen is named
   * differently.
   *
   * ---------------------------------------------------
   */

  const handleEditAudience =
    () => {

      navigation.navigate(
        'SalonInformation',
      );

    };


  /*
   * ---------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------
   */

  const handleSubmit =
    useCallback(
      async () => {

        if (submitting) {
          return;
        }


        /*
         * ---------------------------------------------
         * BASIC VALIDATION
         * ---------------------------------------------
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
         * ---------------------------------------------
         * SERVICE AUDIENCE VALIDATION
         * ---------------------------------------------
         */

        if (
          !data.targetAudiences ||
          data.targetAudiences.length === 0
        ) {

          Alert.alert(
            'Service Audience Required',
            'Please select at least one audience: Female, Male, or Kids.',
          );

          return;

        }


        /*
         * ---------------------------------------------
         * ADDRESS VALIDATION
         * ---------------------------------------------
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
         * ---------------------------------------------
         * BUSINESS HOURS VALIDATION
         * ---------------------------------------------
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
         * ---------------------------------------------
         * KYC VALIDATION
         * ---------------------------------------------
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
         * ---------------------------------------------
         * SERVICE VALIDATION
         * ---------------------------------------------
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
         * ---------------------------------------------
         * REMOVE INVALID SELECTIONS
         * ---------------------------------------------
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
         * ---------------------------------------------
         * PRICE + DURATION VALIDATION
         * ---------------------------------------------
         */

        const incompleteServices =
          validServiceSelections.filter(
            selection => {

              const price =
                Number(
                  selection.price,
                );

              const duration =
                Number(
                  selection.durationMinutes,
                );

              return (
                !Number.isFinite(price) ||
                price <= 0 ||
                !Number.isFinite(duration) ||
                duration <= 0
              );

            },
          );


        if (
          incompleteServices.length > 0
        ) {

          Alert.alert(
            'Service Details Required',
            'Please provide a valid price and duration for every selected service.',
          );

          return;

        }


        /*
         * ---------------------------------------------
         * SUBMIT
         * ---------------------------------------------
         */

        try {

          setSubmitting(true);


          /*
           * Current backend input.
           *
           * targetAudiences is included so the backend
           * can store who the salon serves.
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

            /*
             * -----------------------------------------
             * SERVICE AUDIENCE
             * -----------------------------------------
             */

            targetAudiences:
              data.targetAudiences,

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
             * Master service selections.
             */

            serviceSelections:
              validServiceSelections.map(
                selection => ({

                  categoryId:
                    selection.categoryId,

                  subcategoryId:
                    selection.subcategoryId,

                  price:
                    Number(
                      selection.price,
                    ),

                  duration:
                    Number(
                      selection.durationMinutes,
                    ),

                }),
              ),

          };


          console.log(
            '======================================',
          );

          console.log(
            'Submitting salon registration',
          );

          console.log(
            JSON.stringify(
              input,
              null,
              2,
            ),
          );

          console.log(
            '======================================',
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


          /*
           * -------------------------------------------
           * SUCCESS
           * -------------------------------------------
           */

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
   * ---------------------------------------------------
   * MASKED VALUES
   * ---------------------------------------------------
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
   * ---------------------------------------------------
   * RENDER
   * ---------------------------------------------------
   */

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* ============================================
          HEADER
      ============================================ */}

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
              onPress={
                handleEditSalonInformation
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
            />


            {/* ========================================
                SERVICE AUDIENCE
            ======================================== */}

            <View
              style={[
                styles.reviewRow,
                styles.reviewRowLast,
              ]}
            >

              <View
                style={
                  styles.audienceHeader
                }
              >

                <View
                  style={
                    styles.audienceLabelContainer
                  }
                >

                  <Text
                    style={
                      styles.reviewLabel
                    }
                  >
                    Service Audience
                  </Text>


                  <Text
                    style={
                      styles.audienceHelper
                    }
                  >
                    Who your salon provides services to
                  </Text>

                </View>


                <TouchableOpacity
                  onPress={
                    handleEditAudience
                  }
                >

                  <Text
                    style={
                      styles.editText
                    }
                  >
                    Edit
                  </Text>

                </TouchableOpacity>

              </View>


              <View
                style={
                  styles.audienceValueContainer
                }
              >

                {selectedAudiences.length >
                0 ? (

                  <View
                    style={
                      styles.audienceChipContainer
                    }
                  >

                    {selectedAudiences.map(
                      audience => (

                        <View
                          key={audience}
                          style={
                            styles.audienceChip
                          }
                        >

                          <Text
                            style={
                              styles.audienceChipText
                            }
                          >
                            {
                              getAudienceLabel(
                                audience,
                              )
                            }
                          </Text>

                        </View>

                      ),
                    )}

                  </View>

                ) : (

                  <Text
                    style={
                      styles.notProvidedText
                    }
                  >
                    Not provided
                  </Text>

                )}

              </View>

            </View>

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
                        ? `${hours.open || ''} - ${hours.close ||
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


                            <View
                              style={
                                styles.serviceContent
                              }
                            >

                              <Text
                                style={
                                  styles.serviceName
                                }
                              >
                                {
                                  service.subcategoryName
                                }
                              </Text>


                              <View
                                style={
                                  styles.serviceDetails
                                }
                              >

                                <Text
                                  style={
                                    styles.serviceDetailText
                                  }
                                >
                                  {typeof service.price ===
                                    'number' &&
                                    service.price > 0
                                    ? `₹${service.price}`
                                    : 'Price not set'}
                                </Text>


                                <Text
                                  style={
                                    styles.serviceSeparator
                                  }
                                >
                                  •
                                </Text>


                                <Text
                                  style={
                                    styles.serviceDetailText
                                  }
                                >
                                  {typeof service.durationMinutes ===
                                    'number' &&
                                    service.durationMinutes > 0
                                    ? `${service.durationMinutes} min`
                                    : 'Duration not set'}
                                </Text>

                              </View>

                            </View>

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
              onPress={
                handleEditKYC
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
            onPress={
              handleSubmit
            }
            disabled={
              submitting
            }
            loading={
              submitting
            }
          >

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
        style={
          styles.reviewLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.reviewValue
        }
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


  /*
   * ---------------------------------------------------
   * AUDIENCE
   * ---------------------------------------------------
   */

  audienceHeader: {
    flexDirection:
      'row',

    alignItems:
      'flex-start',

    justifyContent:
      'space-between',
  },


  audienceLabelContainer: {
    flex: 1,

    paddingRight: 12,
  },


  audienceHelper: {
    fontFamily:
      FONTS.regular,

    fontSize: 11,

    color:
      COLORS.textSecondary ||
      '#888888',

    marginTop: 1,
  },


  audienceValueContainer: {
    marginTop:
      SPACING.small,
  },


  audienceChipContainer: {
    flexDirection:
      'row',

    flexWrap:
      'wrap',

    gap: 8,
  },


  audienceChip: {
    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 20,

    backgroundColor:
      '#E8F7F5',

    borderWidth: 1,

    borderColor:
      COLORS.primary ||
      '#009D94',
  },


  audienceChipText: {
    fontFamily:
      FONTS.medium ||
      FONTS.regular,

    fontSize: 13,

    color:
      COLORS.primary ||
      '#009D94',
  },


  notProvidedText: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.textSecondary ||
      '#777777',
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
      'flex-start',

    paddingVertical: 5,
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

    marginTop: 7,
  },


  serviceContent: {
    flex: 1,
  },


  serviceName: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    color:
      COLORS.text ||
      '#333333',

    flex: 1,
  },


  serviceDetails: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginTop: 3,
  },


  serviceDetailText: {
    fontFamily:
      FONTS.medium ||
      FONTS.regular,

    fontSize: 12,

    color:
      COLORS.textSecondary ||
      '#777777',
  },


  serviceSeparator: {
    marginHorizontal: 7,

    fontSize: 12,

    color:
      COLORS.textSecondary ||
      '#999999',
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


  submitContainer: {
    width: '100%',

    paddingHorizontal: 20,

    paddingBottom: 24,
  },


  submitButtonStyle: {
    width: '100%',

    minHeight: 56,

    borderRadius: 14,

    justifyContent:
      'center',

    alignItems:
      'center',

    backgroundColor:
      COLORS.themeColor ||
      '#009D94',
  },


  submitButtonText: {
    fontFamily:
      FONTS.semiBold ||
      FONTS.bold,

    fontSize: 16,

    color: '#FFFFFF',

    textAlign: 'center',
  },


  bottomSpacing: {
    height:
      SPACING.huge,
  },

});


export default SalonReviewScreen;