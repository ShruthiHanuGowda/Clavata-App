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

type Audience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';


type RegisterSalonPartnerResponse = {
  registerSalonPartner: {
    success: boolean;
    message: string;
    salonId: string;
  };
};


type ReviewServiceSelection = {
  audience: Audience;

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

    targetAudiences: Audience[];

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

    serviceSelections: Array<{
      audience: Audience;
      categoryId: string;
      subcategoryId: string;
      price: number;
      duration: number;
    }>;
  };
};


/*
 * =====================================================
 * AUDIENCE CONFIG
 * =====================================================
 */

const AUDIENCE_ORDER: Audience[] = [
  'FEMALE',
  'MALE',
  'KIDS',
];


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
   *
   * IMPORTANT:
   *
   * Every service selection must contain:
   *
   * audience: 'FEMALE' | 'MALE' | 'KIDS'
   *
   * Example:
   *
   * {
   *   audience: 'FEMALE',
   *   categoryId: '1',
   *   subcategoryId: '10',
   *   price: 500,
   *   durationMinutes: 45
   * }
   *
   * ---------------------------------------------------
   */

  const serviceSelections: ReviewServiceSelection[] =
    data.serviceSelections || [];


  /*
   * ---------------------------------------------------
   * SELECTED AUDIENCES
   * ---------------------------------------------------
   */

  const selectedAudiences: Audience[] =
    data.targetAudiences || [];


  /*
   * ---------------------------------------------------
   * GROUP SERVICES
   *
   * Audience
   *    ↓
   * Category
   *    ↓
   * Services
   * ---------------------------------------------------
   */

  const groupedServicesByAudience =
    useMemo(() => {

      const grouped: Record<
        Audience,
        {
          categoryId: string;
          categoryName: string;
          services: Array<{
            subcategoryId: string;
            subcategoryName: string;
            price?: number;
            durationMinutes?: number;
          }>;
        }[]
      > = {
        FEMALE: [],
        MALE: [],
        KIDS: [],
      };


      serviceSelections.forEach(
        selection => {

          /*
           * Ignore selections without audience.
           */

          if (
            !selection.audience ||
            !AUDIENCE_ORDER.includes(
              selection.audience,
            )
          ) {
            return;
          }


          const audience =
            selection.audience;


          /*
           * Resolve category.
           */

          const category =
            categories.find(
              item =>
                item.categoryId ===
                selection.categoryId,
            );


          /*
           * Resolve subcategory.
           */

          const subcategory =
            subcategories.find(
              item =>
                item.subcategoryId ===
                selection.subcategoryId,
            );


          const categoryName =
            selection.categoryName ||
            category?.name ||
            'Category';


          const subcategoryName =
            selection.subcategoryName ||
            subcategory?.name ||
            'Service';


          /*
           * Find existing category
           * inside this audience.
           */

          let categoryGroup =
            grouped[audience].find(
              item =>
                item.categoryId ===
                selection.categoryId,
            );


          /*
           * Create category group.
           */

          if (!categoryGroup) {

            categoryGroup = {
              categoryId:
                selection.categoryId,

              categoryName,

              services: [],
            };


            grouped[audience].push(
              categoryGroup,
            );

          }


          /*
           * Prevent duplicate services.
           */

          const alreadyExists =
            categoryGroup.services.some(
              service =>
                service.subcategoryId ===
                selection.subcategoryId,
            );


          if (!alreadyExists) {

            categoryGroup.services.push({

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
       * Sort every audience.
       */

      AUDIENCE_ORDER.forEach(
        audience => {

          grouped[audience].forEach(
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


          grouped[audience].sort(
            (a, b) =>
              a.categoryName.localeCompare(
                b.categoryName,
                undefined,
                {
                  sensitivity: 'base',
                },
              ),
          );

        },
      );


      return grouped;

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
   * ===================================================
   * EDIT HANDLERS
   * ===================================================
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


  const handleEditAudience =
    () => {

      navigation.navigate(
        'SalonInformation',
      );

    };


  /*
   * ===================================================
   * SUBMIT
   * ===================================================
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

      if (!data.userId) {

        Alert.alert(
          'Registration Error',
          'User ID is missing. Please sign in again.',
        );

        return;

      }


      if (!data.phoneNumber) {

        Alert.alert(
          'Missing Information',
          'Phone number is missing.',
        );

        return;

      }


      if (!data.salonName) {

        Alert.alert(
          'Missing Information',
          'Please enter the salon name.',
        );

        return;

      }


      if (!data.ownerName) {

        Alert.alert(
          'Missing Information',
          'Please enter the owner name.',
        );

        return;

      }


      if (!data.email) {

        Alert.alert(
          'Missing Information',
          'Please provide the business email.',
        );

        return;

      }


      /*
       * ---------------------------------------------
       * BUSINESS TYPE VALIDATION
       * ---------------------------------------------
       *
       * GraphQL requires:
       *
       * businessTypeId: ID!
       * businessType: String!
       *
       */

      if (!data.businessTypeId) {

        console.error(
          'BUSINESS TYPE ID IS MISSING:',
          data.businessTypeId,
        );

        Alert.alert(
          'Business Type Required',
          'Please select a business type for your salon.',
        );

        return;

      }


      if (!data.businessType) {

        Alert.alert(
          'Business Type Required',
          'Please select a business type for your salon.',
        );

        return;

      }


      /*
       * ---------------------------------------------
       * AUDIENCE VALIDATION
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
       * BUSINESS HOURS
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
       * KYC
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
          'Please select at least one service for your salon.',
        );

        return;

      }


      /*
       * ---------------------------------------------
       * VALID SERVICE SELECTIONS
       * ---------------------------------------------
       */

      const validServiceSelections =
        serviceSelections.filter(
          selection =>
            Boolean(
              selection.audience,
            ) &&
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
          'Please select at least one valid audience and service.',
        );

        return;

      }


      /*
       * ---------------------------------------------
       * PRICE + DURATION
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
         * -----------------------------------------
         * FINAL REQUIRED ID CHECK
         * -----------------------------------------
         */

        const userId =
          String(
            data.userId,
          ).trim();

        const businessTypeId =
          String(
            data.businessTypeId,
          ).trim();


        if (!userId) {

          Alert.alert(
            'Registration Error',
            'User ID is missing. Please sign in again.',
          );

          return;

        }


        if (!businessTypeId) {

          Alert.alert(
            'Business Type Required',
            'Business type ID is missing. Please select your business type again.',
          );

          return;

        }


        /*
         * -----------------------------------------
         * GRAPHQL INPUT
         * -----------------------------------------
         */

        const input = {

          /*
           * REQUIRED USER ID
           */

          userId:


            userId,


          /*
           * REQUIRED PHONE
           */

          phoneNumber:
            data.phoneNumber,


          /*
           * REQUIRED SALON NAME
           */

          salonName:
            data.salonName,


          /*
           * REQUIRED OWNER NAME
           */

          ownerName:
            data.ownerName,


          /*
           * REQUIRED EMAIL
           */

          email:
            data.email,


          /*
           * REQUIRED BUSINESS TYPE ID
           *
           * IMPORTANT:
           * This was missing from your
           * previous code.
           */

          businessTypeId:


            businessTypeId,


          /*
           * REQUIRED BUSINESS TYPE NAME
           */

          businessType:
            data.businessType,


          /*
           * -----------------------------------------
           * AUDIENCES
           * -----------------------------------------
           */

          targetAudiences:
            data.targetAudiences,


          /*
           * -----------------------------------------
           * ADDRESS
           * -----------------------------------------
           */

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


          /*
           * -----------------------------------------
           * BUSINESS HOURS
           * -----------------------------------------
           */

          businessHours:
            data.businessHours,


          /*
           * -----------------------------------------
           * LOCATION
           * -----------------------------------------
           */

          latitude:
            data.latitude ??
            undefined,

          longitude:
            data.longitude ??
            undefined,


          /*
           * -----------------------------------------
           * KYC / BUSINESS DOCUMENTS
           * -----------------------------------------
           */

          gstNumber:
            data.gstNumber ||
            undefined,

          panNumber:
            data.panNumber ||
            undefined,

          aadhaarNumber:
            data.aadhaarNumber ||
            undefined,

          shopEstablishmentNumber:
            data.shopEstablishmentNumber ||
            undefined,

          udyamNumber:
            data.udyamNumber ||
            undefined,


          /*
           * -----------------------------------------
           * BANK DETAILS
           * -----------------------------------------
           */

          bankAccount:
            data.bankAccount ||
            undefined,

          ifsc:
            data.ifsc ||
            undefined,


          /*
           * -----------------------------------------
           * AUDIENCE-SPECIFIC SERVICES
           * -----------------------------------------
           */

          serviceSelections:
            validServiceSelections.map(
              selection => ({

                audience:
                  selection.audience,

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


        /*
         * ---------------------------------------------
         * DEBUG LOG
         * ---------------------------------------------
         */

        console.log(
          '======================================',
        );

        console.log(
          'Submitting salon registration',
        );

        console.log(
          'USER ID:',
          input.userId,
        );

        console.log(
          'BUSINESS TYPE ID:',
          input.businessTypeId,
        );

        console.log(
          'BUSINESS TYPE:',
          input.businessType,
        );

        console.log(
          'PHONE:',
          input.phoneNumber,
        );

        console.log(
          'SALON NAME:',
          input.salonName,
        );

        console.log(
          'SERVICE COUNT:',
          input.serviceSelections.length,
        );

        console.log(
          'FULL REGISTRATION INPUT:',
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


        /*
         * ---------------------------------------------
         * GRAPHQL MUTATION
         * ---------------------------------------------
         */

        const result =
          await registerSalonPartner({

            variables: {
              input,
            },

          });


        /*
         * ---------------------------------------------
         * RESPONSE
         * ---------------------------------------------
         */

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
         * ---------------------------------------------
         * SUCCESS
         * ---------------------------------------------
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


        console.error(
          'Salon registration error message:',
          error?.message,
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
   * ===================================================
   * MASKED VALUES
   * ===================================================
   */

  const maskedAadhaar =
    data.aadhaarNumber
      ? `XXXX XXXX ${data.aadhaarNumber.slice(-4)}`
      : 'Not provided';


  const maskedBankAccount =
    data.bankAccount
      ? `XXXXXX${data.bankAccount.slice(-4)}`
      : 'Not provided';


  /*
   * ===================================================
   * RENDER
   * ===================================================
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

        {/* =================================================
            SALON INFORMATION
        ================================================= */}

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


            {/* ---------------------------------------------
                SELECTED AUDIENCE
            --------------------------------------------- */}

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


        {/* =================================================
            ADDRESS
        ================================================= */}

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


        {/* =================================================
            BUSINESS HOURS
        ================================================= */}

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
                        ? `${hours.open || ''} - ${hours.close || ''}`
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


        {/* =================================================
            SERVICES BY AUDIENCE
        ================================================= */}

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

            ) : (

              /*
               * =========================================
               * AUDIENCE LOOP
               * =========================================
               */

              AUDIENCE_ORDER
                .filter(
                  audience =>
                    selectedAudiences.includes(
                      audience,
                    ),
                )
                .map(
                  audience => {

                    const audienceCategories =
                      groupedServicesByAudience[
                        audience
                      ];


                    /*
                     * Audience selected but no
                     * service assigned to it.
                     */

                    if (
                      audienceCategories.length ===
                      0
                    ) {

                      return (
                        <View
                          key={audience}
                          style={
                            styles.audienceSection
                          }
                        >

                          <View
                            style={
                              styles.audienceTitleContainer
                            }
                          >

                            <Text
                              style={
                                styles.audienceTitle
                              }
                            >
                              {
                                getAudienceLabel(
                                  audience,
                                )
                              }
                            </Text>

                          </View>


                          <Text
                            style={
                              styles.noAudienceServices
                            }
                          >
                            No services selected for this audience.
                          </Text>

                        </View>
                      );

                    }


                    return (
                      <View
                        key={audience}
                        style={
                          styles.audienceSection
                        }
                      >

                        {/* =================================
                            AUDIENCE HEADER
                        ================================= */}

                        <View
                          style={
                            styles.audienceTitleContainer
                          }
                        >

                          <Text
                            style={
                              styles.audienceTitle
                            }
                          >
                            {
                              getAudienceLabel(
                                audience,
                              )
                            }
                          </Text>


                          <View
                            style={
                              styles.audienceBadge
                            }
                          >

                            <Text
                              style={
                                styles.audienceBadgeText
                              }
                            >
                              Audience
                            </Text>

                          </View>

                        </View>


                        {/* =================================
                            CATEGORY LOOP
                        ================================= */}

                        {audienceCategories.map(
                          category => (

                            <View
                              key={
                                `${audience}-${category.categoryId}`
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
                                        `${audience}-${category.categoryId}-${service.subcategoryId}`
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
                                            {
                                              typeof service.price ===
                                                'number' &&
                                              service.price > 0
                                                ? `₹${service.price}`
                                                : 'Price not set'
                                            }
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
                                            {
                                              typeof service.durationMinutes ===
                                                'number' &&
                                              service.durationMinutes > 0
                                                ? `${service.durationMinutes} min`
                                                : 'Duration not set'
                                            }
                                          </Text>

                                        </View>

                                      </View>

                                    </View>

                                  ),
                                )}

                              </View>

                            </View>

                          ),
                        )}

                      </View>
                    );

                  },
                )

            )}

          </View>

        </View>


        {/* =================================================
            KYC
        ================================================= */}

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


        {/* =================================================
            VERIFICATION NOTICE
        ================================================= */}

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


        {/* =================================================
            SUBMIT
        ================================================= */}

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
   * ===================================================
   * AUDIENCE
   * ===================================================
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


  /*
   * ===================================================
   * AUDIENCE-SPECIFIC SERVICE SECTION
   * ===================================================
   */

  audienceSection: {
    marginTop:
      SPACING.small,

    marginBottom:
      SPACING.medium,

    borderWidth: 1,

    borderColor:
      COLORS.border ||
      '#E5E5E5',

    borderRadius:
      RADIUS.medium,

    overflow: 'hidden',

    backgroundColor:
      '#FFFFFF',
  },


  audienceTitleContainer: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    paddingHorizontal:
      SPACING.medium,

    paddingVertical:
      SPACING.medium,

    backgroundColor:
      '#E8F7F5',

    borderBottomWidth: 1,

    borderBottomColor:
      '#D5EFEC',
  },


  audienceTitle: {
    fontFamily:
      FONTS.bold ||
      FONTS.semiBold,

    fontSize: 16,

    color:
      COLORS.primary ||
      '#009D94',
  },


  audienceBadge: {
    paddingHorizontal: 9,

    paddingVertical: 4,

    borderRadius: 12,

    backgroundColor:
      COLORS.primary ||
      '#009D94',
  },


  audienceBadgeText: {
    fontFamily:
      FONTS.medium ||
      FONTS.regular,

    fontSize: 10,

    color:
      '#FFFFFF',
  },


  noAudienceServices: {
    fontFamily:
      FONTS.regular,

    fontSize: 13,

    color:
      COLORS.textSecondary ||
      '#777777',

    padding:
      SPACING.medium,
  },


  serviceCategory: {
    paddingHorizontal:
      SPACING.medium,

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

    fontSize: 14,

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


  /*
   * ===================================================
   * HOURS
   * ===================================================
   */

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


  /*
   * ===================================================
   * KYC
   * ===================================================
   */

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


  /*
   * ===================================================
   * SUBMIT
   * ===================================================
   */

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

    color:
      '#FFFFFF',

    textAlign:
      'center',
  },


  bottomSpacing: {
    height:
      SPACING.huge,
  },

});


export default SalonReviewScreen;
