import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { useQuery } from '@apollo/client';

import { Header, DButton } from '../../components';

import {
  useSalonRegistration,
  ServiceMode,
} from '../../context/SalonRegistrationContext';

import { useUser } from '../../context/UserContext';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

import { GET_BUSINESS_TYPES } from '../../graphql/queries';

/* =========================================================
   TYPES
========================================================= */

interface BusinessType {
  businessTypeId: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

interface BusinessTypesQueryData {
  businessTypes: {
    success: boolean;
    message: string;
    totalCount: number;
    businessTypes: BusinessType[];
  };
}

interface BusinessTypesQueryVariables {
  status: 'ACTIVE' | 'INACTIVE';
}

/*
 * Who the business serves.
 *
 * Multiple values can be selected.
 */
type TargetAudience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

interface TargetAudienceOption {
  value: TargetAudience;
  label: string;
  description: string;
}

/* =========================================================
   TARGET AUDIENCE OPTIONS
========================================================= */

const TARGET_AUDIENCE_OPTIONS: TargetAudienceOption[] = [
  {
    value: 'FEMALE',
    label: 'Female',
    description:
      'Services primarily intended for women.',
  },
  {
    value: 'MALE',
    label: 'Male',
    description:
      'Services primarily intended for men.',
  },
  {
    value: 'KIDS',
    label: 'Kids',
    description:
      'Services specifically offered for children.',
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const SalonRegistrationScreen = ({
  navigation,
}: any) => {
  const {  data, updateData } =
    useSalonRegistration();

  const { currentUser } = useUser();

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [businessType, setBusinessType] =
    useState('');

  const [
    selectedBusinessType,
    setSelectedBusinessType,
  ] = useState<BusinessType | null>(null);

  const [salonName, setSalonName] =
    useState('');

  const [ownerName, setOwnerName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [
    businessTypeModalVisible,
    setBusinessTypeModalVisible,
  ] = useState(false);

  const [
    helpModalVisible,
    setHelpModalVisible,
  ] = useState(false);

  const [
    serviceMode,
    setServiceMode,
  ] = useState<ServiceMode | null>(null);

  const [
    serviceModeModalVisible,
    setServiceModeModalVisible,
  ] = useState(false);

  /*
   * Multiple target audiences can be selected.
   */
  const [
    targetAudiences,
    setTargetAudiences,
  ] = useState<TargetAudience[]>([]);

  const [
    targetAudienceModalVisible,
    setTargetAudienceModalVisible,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  /* =======================================================
     BUSINESS TYPES
     SOURCE OF TRUTH = ADMIN PANEL
  ======================================================= */

  const {
    data: businessTypesData,
    loading: businessTypesLoading,
    error: businessTypesError,
    refetch: refetchBusinessTypes,
  } = useQuery<
    BusinessTypesQueryData,
    BusinessTypesQueryVariables
  >(GET_BUSINESS_TYPES, {
    variables: {
      status: 'ACTIVE',
    },

    fetchPolicy: 'network-only',

    notifyOnNetworkStatusChange: true,

    onError: error => {
      console.log(
        '[SalonRegistration] GET_BUSINESS_TYPES error:',
        error,
      );
    },
  });

  /* =======================================================
     ACTIVE BUSINESS TYPE OPTIONS

     - Only ACTIVE types
     - No "Other"
     - Sorted alphabetically
     - Duplicate names removed
  ======================================================= */

  const businessTypeOptions =
    useMemo(() => {
      const types =
        businessTypesData
          ?.businessTypes
          ?.businessTypes ?? [];

      const activeTypes =
        types.filter(
          item =>
            item.status === 'ACTIVE' &&
            item.name?.trim(),
        );

      const uniqueTypes: BusinessType[] =
        [];

      const seenNames =
        new Set<string>();

      activeTypes
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              sensitivity: 'base',
            },
          ),
        )
        .forEach(item => {
          const normalizedName =
            item.name
              .trim()
              .toLowerCase();

          if (
            !seenNames.has(
              normalizedName,
            )
          ) {
            seenNames.add(
              normalizedName,
            );

            uniqueTypes.push(item);
          }
        });

      return uniqueTypes;
    }, [businessTypesData]);

  /* =======================================================
     SELECT BUSINESS TYPE
  ======================================================= */

  const selectBusinessType = (
    type: BusinessType,
) => {
    setSelectedBusinessType(type);

    setBusinessType(
        type.name.trim(),
    );

    updateData({
        businessTypeId:
            type.businessTypeId.trim(),

        businessType:
            type.name.trim(),
    });

    setBusinessTypeModalVisible(
        false,
    );
};

  /* =======================================================
     TARGET AUDIENCE
  ======================================================= */

  const toggleTargetAudience = (
    audience: TargetAudience,
  ) => {
    setTargetAudiences(
      current => {
        if (
          current.includes(audience)
        ) {
          return current.filter(
            item =>
              item !== audience,
          );
        }

        return [
          ...current,
          audience,
        ];
      },
    );
  };

  /* =======================================================
     TARGET AUDIENCE LABEL
  ======================================================= */

  const getTargetAudienceLabel =
    () => {
      if (
        targetAudiences.length === 0
      ) {
        return '';
      }

      const selectedLabels =
        TARGET_AUDIENCE_OPTIONS
          .filter(option =>
            targetAudiences.includes(
              option.value,
            ),
          )
          .map(option => option.label);

      return selectedLabels.join(
        ', ',
      );
    };

  /* =======================================================
     SELECT SERVICE MODE
  ======================================================= */

  const selectServiceMode = (
    mode: ServiceMode,
  ) => {
    setServiceMode(mode);

    setServiceModeModalVisible(
      false,
    );
  };

  /* =======================================================
     SERVICE MODE LABEL
  ======================================================= */

  const getServiceModeLabel = () => {
    switch (serviceMode) {
      case 'SALON_ONLY':
        return 'Salon only';

      case 'HOME_ONLY':
        return 'Home only';

      case 'SALON_AND_HOME':
        return 'Salon & Home';

      default:
        return '';
    }
  };

  /* =======================================================
     SERVICE MODE DESCRIPTION
  ======================================================= */

  const getServiceModeDescription = (
    mode: ServiceMode,
  ) => {
    switch (mode) {
      case 'SALON_ONLY':
        return 'Customers visit your business location for services.';

      case 'HOME_ONLY':
        return 'You provide services at the customer’s location.';

      case 'SALON_AND_HOME':
        return 'You provide services both at your business location and at the customer’s location.';

      default:
        return '';
    }
  };

  /* =======================================================
     SUBMIT / NEXT
  ======================================================= */

  const onNext = async () => {
    if (submitting) {
      return;
    }

    const trimmedBusinessType =
      businessType.trim();

    const trimmedSalonName =
      salonName.trim();

    const trimmedOwnerName =
      ownerName.trim();

    const trimmedEmail =
      email.trim();

    /* -------------------------------------------------------
       BUSINESS TYPE NAME
    ------------------------------------------------------- */

    if (!trimmedBusinessType) {
      Alert.alert(
        'Business Type Required',
        'Please select your business type to continue.',
      );

      return;
    }

    /* -------------------------------------------------------
       BUSINESS TYPE ID
       
       RegisterSalonPartnerInput requires:
       
       businessTypeId: ID!
       
       Therefore a valid selected business
       type object must exist.
    ------------------------------------------------------- */

const businessTypeId =
    selectedBusinessType?.businessTypeId?.trim()
    || data.businessTypeId?.trim();

if (!businessTypeId) {
    console.log(
        '[SalonRegistration] BUSINESS TYPE ID IS MISSING',
        {
            selectedBusinessType,
            contextBusinessTypeId: data.businessTypeId,
            businessType,
        },
    );

    Alert.alert(
        'Business Type Required',
        'Please select a valid business type to continue.',
    );

    return;
}

    /* -------------------------------------------------------
       TARGET AUDIENCE
    ------------------------------------------------------- */

    if (
      targetAudiences.length === 0
    ) {
      Alert.alert(
        'Customer Type Required',
        'Please select who your business serves. You can select more than one.',
      );

      return;
    }

    /* -------------------------------------------------------
       BUSINESS NAME
    ------------------------------------------------------- */

    if (!trimmedSalonName) {
      Alert.alert(
        'Business Name Required',
        'Please enter your business name.',
      );

      return;
    }

    /* -------------------------------------------------------
       OWNER NAME
    ------------------------------------------------------- */

    if (!trimmedOwnerName) {
      Alert.alert(
        'Owner Name Required',
        'Please enter the owner name as per Aadhaar.',
      );

      return;
    }

    /* -------------------------------------------------------
       EMAIL
    ------------------------------------------------------- */

    if (!trimmedEmail) {
      Alert.alert(
        'Email Required',
        'Please enter your business email address.',
      );

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        trimmedEmail,
      )
    ) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid business email address.',
      );

      return;
    }

    /* -------------------------------------------------------
       SERVICE MODE
    ------------------------------------------------------- */

    if (!serviceMode) {
      Alert.alert(
        'Service Availability Required',
        'Please select how you provide your services.',
      );

      return;
    }

    /* -------------------------------------------------------
       CURRENT USER
    ------------------------------------------------------- */

    if (!currentUser?.userId) {
      Alert.alert(
        'Unable to Continue',
        'Your user information is unavailable. Please sign in again.',
      );

      return;
    }

    if (
      !currentUser?.phoneNumber
    ) {
      Alert.alert(
        'Phone Number Missing',
        'Your phone number is unavailable. Please sign in again.',
      );

      return;
    }

    /* -------------------------------------------------------
       SAVE REGISTRATION DATA
    ------------------------------------------------------- */

    try {
      setSubmitting(true);

      console.log(
        '[SalonRegistration] BUSINESS TYPE:',
        {
          businessTypeId,
          businessType:
            trimmedBusinessType,
        },
      );

      await updateData({
        userId:
          currentUser.userId,

        phoneNumber:
          currentUser.phoneNumber,

        salonName:
          trimmedSalonName,

        ownerName:
          trimmedOwnerName,

        email:
          trimmedEmail,

        /*
         * REQUIRED BY:
         *
         * RegisterSalonPartnerInput
         *
         * businessTypeId: ID!
         */
        businessTypeId:
          businessTypeId,

        /*
         * REQUIRED BY:
         *
         * RegisterSalonPartnerInput
         *
         * businessType: String!
         */
        businessType:
          trimmedBusinessType,

        /*
         * Store who this business serves.
         */
        targetAudiences:
          targetAudiences,

        serviceMode,

        /*
         * Service-specific modes are
         * configured later.
         */
        serviceSpecificModes: {},
      });

      navigation.navigate(
        'SalonAddress',
      );
    } catch (error) {
      console.log(
        '[SalonRegistration] Failed to save registration:',
        error,
      );

      Alert.alert(
        'Unable to Continue',
        'Something went wrong while saving your registration details. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <Header
        headerTitle="Registration"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.card}>
          {/* =================================================
              INTRO
          ================================================= */}

          <Text style={styles.title}>
            Tell us about your business
          </Text>

          <Text
            style={styles.subtitle}
          >
            Provide your business details
            to get started with Clavata.
          </Text>

          {/* =================================================
              BUSINESS TYPE
          ================================================= */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <View
              style={styles.labelRow}
            >
              <Text
                style={styles.label}
              >
                Business type
              </Text>

              <TouchableOpacity
                style={
                  styles.helpButton
                }
                activeOpacity={0.7}
                onPress={() =>
                  setHelpModalVisible(
                    true,
                  )
                }
              >
                <View
                  style={
                    styles.helpIcon
                  }
                >
                  <Text
                    style={
                      styles.helpIconText
                    }
                  >
                    ?
                  </Text>
                </View>

                <Text
                  style={
                    styles.helpButtonText
                  }
                >
                  Need help?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.dropdown,
                businessTypeModalVisible &&
                  styles.dropdownActive,
              ]}
              activeOpacity={0.7}
              onPress={() =>
                setBusinessTypeModalVisible(
                  true,
                )
              }
              disabled={
                businessTypesLoading
              }
            >
              <View
                style={
                  styles.dropdownContent
                }
              >
                {businessTypesLoading ? (
                  <View
                    style={
                      styles.loadingRow
                    }
                  >
                    <ActivityIndicator
                      size="small"
                    />

                    <Text
                      style={
                        styles.loadingText
                      }
                    >
                      Loading business
                      types...
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.dropdownText,
                      !businessType &&
                        styles.placeholderText,
                    ]}
                    numberOfLines={1}
                  >
                    {businessType ||
                      'Select business type'}
                  </Text>
                )}
              </View>

              {!businessTypesLoading && (
                <Text
                  style={
                    styles.dropdownArrow
                  }
                >
                  ▾
                </Text>
              )}
            </TouchableOpacity>

            {/* ERROR */}

            {!businessTypesLoading &&
              businessTypesError && (
                <View
                  style={
                    styles.errorContainer
                  }
                >
                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    We couldn't load the
                    available business
                    types.
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      refetchBusinessTypes()
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={
                        styles.retryText
                      }
                    >
                      Try again
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {/* EMPTY */}

            {!businessTypesLoading &&
              !businessTypesError &&
              businessTypeOptions.length ===
                0 && (
                <View
                  style={
                    styles.errorContainer
                  }
                >
                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    No business types are
                    currently available.
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setHelpModalVisible(
                        true,
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={
                        styles.retryText
                      }
                    >
                      Need help?
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {/* SELECTED BUSINESS TYPE DESCRIPTION */}

            {selectedBusinessType
              ?.description
              ?.trim() && (
              <View
                style={
                  styles.selectedBusinessTypeInfo
                }
              >
                <View
                  style={
                    styles.infoIconContainer
                  }
                >
                  <Text
                    style={
                      styles.infoIconText
                    }
                  >
                    i
                  </Text>
                </View>

                <View
                  style={
                    styles.selectedDescriptionContent
                  }
                >
                  <Text
                    style={
                      styles.selectedDescriptionLabel
                    }
                  >
                    About this business type
                  </Text>

                  <Text
                    style={
                      styles.selectedDescription
                    }
                  >
                    {selectedBusinessType.description.trim()}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* =================================================
              TARGET AUDIENCE
          ================================================= */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text style={styles.label}>
              Who does your business serve?
            </Text>

            <Text
              style={
                styles.audienceHelperText
              }
            >
              Select all that apply
            </Text>

            <TouchableOpacity
              style={[
                styles.dropdown,
                targetAudienceModalVisible &&
                  styles.dropdownActive,
              ]}
              activeOpacity={0.7}
              onPress={() =>
                setTargetAudienceModalVisible(
                  true,
                )
              }
            >
              <View
                style={
                  styles.dropdownContent
                }
              >
                <Text
                  style={[
                    styles.dropdownText,
                    targetAudiences.length ===
                      0 &&
                      styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {getTargetAudienceLabel() ||
                    'Select customer type'}
                </Text>
              </View>

              <Text
                style={
                  styles.dropdownArrow
                }
              >
                ▾
              </Text>
            </TouchableOpacity>

            {targetAudiences.length >
              0 && (
              <View
                style={
                  styles.selectedAudienceInfo
                }
              >
                <Text
                  style={
                    styles.selectedAudienceTitle
                  }
                >
                  Selected
                </Text>

                <View
                  style={
                    styles.audienceChipContainer
                  }
                >
                  {TARGET_AUDIENCE_OPTIONS
                    .filter(option =>
                      targetAudiences.includes(
                        option.value,
                      ),
                    )
                    .map(option => (
                      <View
                        key={
                          option.value
                        }
                        style={
                          styles.audienceChip
                        }
                      >
                        <Text
                          style={
                            styles.audienceChipText
                          }
                        >
                          {option.label}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>

          {/* =================================================
              BUSINESS / SALON NAME
          ================================================= */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text style={styles.label}>
              Business / Salon name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your business name"
              placeholderTextColor={
                COLORS.textSecondary
              }
              value={salonName}
              onChangeText={
                setSalonName
              }
              autoCapitalize="words"
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          {/* =================================================
              OWNER NAME
          ================================================= */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text style={styles.label}>
              Owner name
            </Text>

            <Text
              style={styles.helperText}
            >
              Enter the name exactly as it
              appears on Aadhaar.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter owner name"
              placeholderTextColor={
                COLORS.textSecondary
              }
              value={ownerName}
              onChangeText={
                setOwnerName
              }
              autoCapitalize="words"
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          {/* =================================================
              BUSINESS EMAIL
          ================================================= */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text style={styles.label}>
              Business email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter business email"
              placeholderTextColor={
                COLORS.textSecondary
              }
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              maxLength={150}
            />
          </View>

          {/* =================================================
              SERVICE AVAILABILITY
          ================================================= */}

          <View
            style={
              styles.sectionContainer
            }
          >
            <Text
              style={styles.sectionTitle}
            >
              Service availability
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Choose where you provide your
              services. You can configure
              availability for individual
              services later.
            </Text>

            <TouchableOpacity
              style={[
                styles.dropdown,
                serviceModeModalVisible &&
                  styles.dropdownActive,
              ]}
              activeOpacity={0.7}
              onPress={() =>
                setServiceModeModalVisible(
                  true,
                )
              }
            >
              <Text
                style={[
                  styles.dropdownText,
                  !serviceMode &&
                    styles.placeholderText,
                ]}
              >
                {getServiceModeLabel() ||
                  'Select service availability'}
              </Text>

              <Text
                style={
                  styles.dropdownArrow
                }
              >
                ▾
              </Text>
            </TouchableOpacity>

            {serviceMode && (
              <View
                style={
                  styles.selectedModeInfo
                }
              >
                <Text
                  style={
                    styles.selectedModeTitle
                  }
                >
                  {getServiceModeLabel()}
                </Text>

                <Text
                  style={
                    styles.selectedModeDescription
                  }
                >
                  {getServiceModeDescription(
                    serviceMode,
                  )}
                </Text>
              </View>
            )}
          </View>

          {/* =================================================
              INFO BOX
          ================================================= */}

          <View
            style={styles.infoBox}
          >
            <View
              style={
                styles.infoBoxIcon
              }
            >
              <Text
                style={
                  styles.infoBoxIconText
                }
              >
                i
              </Text>
            </View>

            <View
              style={
                styles.infoBoxContent
              }
            >
              <Text
                style={
                  styles.infoBoxTitle
                }
              >
                Service settings
              </Text>

              <Text
                style={
                  styles.infoBoxText
                }
              >
                After registration, you can
                select the services you offer
                and configure pricing, duration,
                and service-specific availability.
              </Text>
            </View>
          </View>

          {/* =================================================
              CONTINUE BUTTON
          ================================================= */}

          <DButton
            style={styles.button}
            onPress={onNext}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator
                color={COLORS.white}
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Continue
              </Text>
            )}
          </DButton>
        </View>
      </ScrollView>

      {/* =====================================================
          BUSINESS TYPE MODAL
      ===================================================== */}

      <Modal
        visible={
          businessTypeModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setBusinessTypeModalVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              styles.modalOutside
            }
            onPress={() =>
              setBusinessTypeModalVisible(
                false,
              )
            }
          />

          <View
            style={
              styles.modalContainer
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderTextContainer
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Select Business Type
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose the option that best
                  describes your business.
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                activeOpacity={0.7}
                onPress={() =>
                  setBusinessTypeModalVisible(
                    false,
                  )
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
            >
              {businessTypesLoading ? (
                <View
                  style={
                    styles.modalLoadingContainer
                  }
                >
                  <ActivityIndicator />

                  <Text
                    style={
                      styles.modalLoadingText
                    }
                  >
                    Loading business types...
                  </Text>
                </View>
              ) : businessTypeOptions.length ===
                0 ? (
                <View
                  style={
                    styles.emptyModalContainer
                  }
                >
                  <Text
                    style={
                      styles.emptyModalTitle
                    }
                  >
                    No business types available
                  </Text>

                  <Text
                    style={
                      styles.emptyModalText
                    }
                  >
                    Please contact Clavata
                    Support if you need
                    assistance choosing a
                    business type.
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.modalActionButton
                    }
                    activeOpacity={0.7}
                    onPress={() => {
                      setBusinessTypeModalVisible(
                        false,
                      );

                      setHelpModalVisible(
                        true,
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.modalActionButtonText
                      }
                    >
                      Contact Clavata Support
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                businessTypeOptions.map(
                  type => {
                    const isSelected =
                      selectedBusinessType
                        ?.businessTypeId ===
                      type.businessTypeId;

                    return (
                      <TouchableOpacity
                        key={
                          type.businessTypeId
                        }
                        style={[
                          styles.businessTypeOption,
                          isSelected &&
                            styles.businessTypeOptionSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() =>
                          selectBusinessType(
                            type,
                          )
                        }
                      >
                        <View
                          style={
                            styles.businessTypeOptionContent
                          }
                        >
                          <View
                            style={
                              styles.businessTypeTitleRow
                            }
                          >
                            <Text
                              style={[
                                styles.businessTypeOptionTitle,
                                isSelected &&
                                  styles.businessTypeOptionTitleSelected,
                              ]}
                            >
                              {type.name}
                            </Text>

                            {isSelected && (
                              <View
                                style={
                                  styles.selectedCheck
                                }
                              >
                                <Text
                                  style={
                                    styles.selectedCheckText
                                  }
                                >
                                  ✓
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text
                            style={
                              styles.businessTypeOptionDescription
                            }
                          >
                            {type.description?.trim() ||
                              'Select this option if it best describes your business.'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  },
                )
              )}
            </ScrollView>

            {businessTypeOptions.length >
              0 && (
              <View
                style={
                  styles.modalHelpContainer
                }
              >
                <Text
                  style={
                    styles.modalHelpText
                  }
                >
                  Can't find a suitable
                  business type?
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setBusinessTypeModalVisible(
                      false,
                    );

                    setHelpModalVisible(
                      true,
                    );
                  }}
                >
                  <Text
                    style={
                      styles.modalHelpLink
                    }
                  >
                    Contact Clavata Support
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* =====================================================
          TARGET AUDIENCE MODAL
      ===================================================== */}

      <Modal
        visible={
          targetAudienceModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setTargetAudienceModalVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              styles.modalOutside
            }
            onPress={() =>
              setTargetAudienceModalVisible(
                false,
              )
            }
          />

          <View
            style={
              styles.modalContainer
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
                  styles.modalHeaderTextContainer
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Who does your business serve?
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select all that apply
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                activeOpacity={0.7}
                onPress={() =>
                  setTargetAudienceModalVisible(
                    false,
                  )
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

            {/* OPTIONS */}

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
            >
              {TARGET_AUDIENCE_OPTIONS.map(
                option => {
                  const isSelected =
                    targetAudiences.includes(
                      option.value,
                    );

                  return (
                    <TouchableOpacity
                      key={
                        option.value
                      }
                      style={[
                        styles.audienceOption,
                        isSelected &&
                          styles.audienceOptionSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() =>
                        toggleTargetAudience(
                          option.value,
                        )
                      }
                    >
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
                              styles.checkboxText
                            }
                          >
                            ✓
                          </Text>
                        )}
                      </View>

                      {/* CONTENT */}

                      <View
                        style={
                          styles.audienceOptionContent
                        }
                      >
                        <Text
                          style={[
                            styles.audienceOptionTitle,
                            isSelected &&
                              styles.audienceOptionTitleSelected,
                          ]}
                        >
                          {option.label}
                        </Text>

                        <Text
                          style={
                            styles.audienceOptionDescription
                          }
                        >
                          {
                            option.description
                          }
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                },
              )}

              {/* INFO */}

              <View
                style={
                  styles.audienceInfoBox
                }
              >
                <View
                  style={
                    styles.modalInfoIcon
                  }
                >
                  <Text
                    style={
                      styles.modalInfoIconText
                    }
                  >
                    i
                  </Text>
                </View>

                <Text
                  style={
                    styles.modalInfoText
                  }
                >
                  You can select more than one.
                  For example, select Female,
                  Male and Kids if your business
                  serves all three.
                </Text>
              </View>
            </ScrollView>

            {/* DONE */}

            <View
              style={
                styles.audienceDoneContainer
              }
            >
              <TouchableOpacity
                style={[
                  styles.audienceDoneButton,
                  targetAudiences.length ===
                    0 &&
                    styles.audienceDoneButtonDisabled,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  setTargetAudienceModalVisible(
                    false,
                  )
                }
              >
                <Text
                  style={
                    styles.audienceDoneButtonText
                  }
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          HELP MODAL
      ===================================================== */}

      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setHelpModalVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.helpModalOverlay
          }
        >
          <Pressable
            style={
              styles.helpModalOutside
            }
            onPress={() =>
              setHelpModalVisible(
                false,
              )
            }
          />

          <View
            style={
              styles.helpModalContainer
            }
          >
            <Text
              style={
                styles.helpModalTitle
              }
            >
              Business type not listed?
            </Text>

            <Text
              style={
                styles.helpModalDescription
              }
            >
              Please contact Clavata Support
              and tell us about your business.
              Our team will help you identify
              the appropriate business type.
            </Text>

            <View
              style={
                styles.helpGuidanceBox
              }
            >
              <Text
                style={
                  styles.helpGuidanceTitle
                }
              >
                Important
              </Text>

              <Text
                style={
                  styles.helpGuidanceText
                }
              >
                Please do not select an unrelated
                business type just to continue
                your registration.
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.helpCloseButton
              }
              activeOpacity={0.7}
              onPress={() =>
                setHelpModalVisible(
                  false,
                )
              }
            >
              <Text
                style={
                  styles.helpCloseButtonText
                }
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          SERVICE MODE MODAL
      ===================================================== */}

      <Modal
        visible={
          serviceModeModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setServiceModeModalVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              styles.modalOutside
            }
            onPress={() =>
              setServiceModeModalVisible(
                false,
              )
            }
          />

          <View
            style={
              styles.modalContainer
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
                  styles.modalHeaderTextContainer
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Service Availability
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose where you provide your
                  services.
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                activeOpacity={0.7}
                onPress={() =>
                  setServiceModeModalVisible(
                    false,
                  )
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
            >
              {/* SALON ONLY */}

              <TouchableOpacity
                style={[
                  styles.serviceModeOption,
                  serviceMode ===
                    'SALON_ONLY' &&
                    styles.serviceModeOptionSelected,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  selectServiceMode(
                    'SALON_ONLY',
                  )
                }
              >
                <View
                  style={[
                    styles.radioOuter,
                    serviceMode ===
                      'SALON_ONLY' &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {serviceMode ===
                    'SALON_ONLY' && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}
                </View>

                <View
                  style={
                    styles.serviceModeContent
                  }
                >
                  <Text
                    style={
                      styles.serviceModeTitle
                    }
                  >
                    Salon only
                  </Text>

                  <Text
                    style={
                      styles.serviceModeDescription
                    }
                  >
                    Customers visit your
                    business location for
                    services.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* HOME ONLY */}

              <TouchableOpacity
                style={[
                  styles.serviceModeOption,
                  serviceMode ===
                    'HOME_ONLY' &&
                    styles.serviceModeOptionSelected,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  selectServiceMode(
                    'HOME_ONLY',
                  )
                }
              >
                <View
                  style={[
                    styles.radioOuter,
                    serviceMode ===
                      'HOME_ONLY' &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {serviceMode ===
                    'HOME_ONLY' && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}
                </View>

                <View
                  style={
                    styles.serviceModeContent
                  }
                >
                  <Text
                    style={
                      styles.serviceModeTitle
                    }
                  >
                    Home only
                  </Text>

                  <Text
                    style={
                      styles.serviceModeDescription
                    }
                  >
                    You provide services at
                    the customer's location.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* SALON AND HOME */}

              <TouchableOpacity
                style={[
                  styles.serviceModeOption,
                  serviceMode ===
                    'SALON_AND_HOME' &&
                    styles.serviceModeOptionSelected,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  selectServiceMode(
                    'SALON_AND_HOME',
                  )
                }
              >
                <View
                  style={[
                    styles.radioOuter,
                    serviceMode ===
                      'SALON_AND_HOME' &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {serviceMode ===
                    'SALON_AND_HOME' && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}
                </View>

                <View
                  style={
                    styles.serviceModeContent
                  }
                >
                  <Text
                    style={
                      styles.serviceModeTitle
                    }
                  >
                    Salon & Home
                  </Text>

                  <Text
                    style={
                      styles.serviceModeDescription
                    }
                  >
                    You provide services both at
                    your business location and at
                    the customer's location.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* INFO */}

              <View
                style={
                  styles.modalInfoBox
                }
              >
                <View
                  style={
                    styles.modalInfoIcon
                  }
                >
                  <Text
                    style={
                      styles.modalInfoIconText
                    }
                  >
                    i
                  </Text>
                </View>

                <Text
                  style={
                    styles.modalInfoText
                  }
                >
                  You can configure availability
                  for individual services during
                  the next service setup step.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal:
      SPACING?.medium ?? 16,

    paddingTop:
      SPACING?.medium ?? 16,

    paddingBottom: 40,
  },

  card: {
    backgroundColor:
      COLORS.white,

    borderRadius:
      RADIUS?.large ?? 16,

    padding:
      SPACING?.medium ?? 16,
  },

  title: {
    fontSize:
      FONT_SIZES?.title ?? 24,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.text,

    marginBottom: 6,
  },

  subtitle: {
    fontSize:
      FONT_SIZES?.small ?? 14,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 21,

    marginBottom: 24,
  },

  /* =======================================================
     FIELDS
  ======================================================= */

  fieldContainer: {
    marginBottom: 22,
  },

  labelRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    marginBottom: 8,
  },

  label: {
    fontSize:
      FONT_SIZES?.small ?? 14,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 8,
  },

  helperText: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    marginTop: -3,

    marginBottom: 8,

    lineHeight: 17,
  },

  /* =======================================================
     TARGET AUDIENCE
  ======================================================= */

  audienceHelperText: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    marginTop: -4,

    marginBottom: 9,
  },

  selectedAudienceInfo: {
    marginTop: 9,

    padding: 12,

    backgroundColor:
      COLORS.background,

    borderRadius:
      RADIUS?.medium ?? 10,
  },

  selectedAudienceTitle: {
    fontSize: 12,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 8,
  },

  audienceChipContainer: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 7,
  },

  audienceChip: {
    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor:
      COLORS.white,

    borderWidth: 1,

    borderColor:
      COLORS.primary,
  },

  audienceChipText: {
    fontSize: 12,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.primary,
  },

  input: {
    height: 52,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS?.medium ?? 10,

    paddingHorizontal: 14,

    fontSize:
      FONT_SIZES?.small ?? 14,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.text,

    backgroundColor:
      COLORS.white,
  },

  /* =======================================================
     HELP BUTTON
  ======================================================= */

  helpButton: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 8,

    paddingVertical: 2,
  },

  helpIcon: {
    width: 18,

    height: 18,

    borderRadius: 9,

    borderWidth: 1,

    borderColor:
      COLORS.primary,

    alignItems: 'center',

    justifyContent:
      'center',

    marginRight: 5,
  },

  helpIconText: {
    fontSize: 11,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.primary,
  },

  helpButtonText: {
    fontSize: 12,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.primary,
  },

  /* =======================================================
     DROPDOWN
  ======================================================= */

  dropdown: {
    minHeight: 52,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS?.medium ?? 10,

    paddingHorizontal: 14,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    backgroundColor:
      COLORS.white,
  },

  dropdownActive: {
    borderColor:
      COLORS.primary,
  },

  dropdownContent: {
    flex: 1,

    marginRight: 10,
  },

  dropdownText: {
    fontSize:
      FONT_SIZES?.small ?? 14,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.text,
  },

  placeholderText: {
    color:
      COLORS.textSecondary,
  },

  dropdownArrow: {
    fontSize: 18,

    color:
      COLORS.textSecondary,

    marginTop: -3,
  },

  loadingRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  loadingText: {
    fontSize: 13,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    marginLeft: 8,
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorContainer: {
    marginTop: 8,

    paddingHorizontal: 2,
  },

  errorText: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 17,
  },

  retryText: {
    fontSize: 12,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.primary,

    marginTop: 4,
  },

  /* =======================================================
     SELECTED BUSINESS TYPE
  ======================================================= */

  selectedBusinessTypeInfo: {
    flexDirection: 'row',

    backgroundColor:
      COLORS.background,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 12,

    marginTop: 10,
  },

  infoIconContainer: {
    width: 22,

    height: 22,

    borderRadius: 11,

    backgroundColor:
      COLORS.themeColor,

    alignItems: 'center',

    justifyContent:
      'center',

    marginRight: 9,

    marginTop: 1,
  },

  infoIconText: {
    fontSize: 12,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.white,
  },

  selectedDescriptionContent: {
    flex: 1,
  },

  selectedDescriptionLabel: {
    fontSize: 12,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 3,
  },

  selectedDescription: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },

  /* =======================================================
     SECTION
  ======================================================= */

  sectionContainer: {
    marginTop: 4,

    marginBottom: 20,
  },

  sectionTitle: {
    fontSize:
      FONT_SIZES?.medium ?? 16,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.text,

    marginBottom: 5,
  },

  sectionDescription: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,

    marginBottom: 12,
  },

  selectedModeInfo: {
    marginTop: 9,

    padding: 12,

    backgroundColor:
      COLORS.background,

    borderRadius:
      RADIUS?.medium ?? 10,
  },

  selectedModeTitle: {
    fontSize: 13,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 3,
  },

  selectedModeDescription: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },

  /* =======================================================
     INFO BOX
  ======================================================= */

  infoBox: {
    flexDirection: 'row',

    backgroundColor:
      COLORS.background,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 13,

    marginBottom: 24,
  },

  infoBoxIcon: {
    width: 22,

    height: 22,

    borderRadius: 11,

    backgroundColor:
      COLORS.themeColor,

    alignItems: 'center',

    justifyContent:
      'center',

    marginRight: 10,
  },

  infoBoxIconText: {
    fontSize: 12,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.white,
  },

  infoBoxContent: {
    flex: 1,
  },

  infoBoxTitle: {
    fontSize: 13,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 3,
  },

  infoBoxText: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },

  /* =======================================================
     BUTTON
  ======================================================= */

  button: {
    width: '100%',

    height: 54,

    borderRadius:
      RADIUS?.medium ?? 10,

    backgroundColor:
      COLORS.themeColor,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  buttonText: {
    color:
      COLORS.white,

    fontSize:
      FONT_SIZES?.medium ?? 16,

    fontFamily:
      FONTS?.medium,
  },

  /* =======================================================
     MODAL
  ======================================================= */

  modalOverlay: {
    flex: 1,

    justifyContent:
      'flex-end',

    backgroundColor:
      'rgba(0,0,0,0.45)',
  },

  modalOutside: {
    flex: 1,
  },

  modalContainer: {
    backgroundColor:
      COLORS.white,

    borderTopLeftRadius: 22,

    borderTopRightRadius: 22,

    maxHeight: '85%',

    paddingBottom: 10,
  },

  modalHeader: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems:
      'flex-start',

    paddingHorizontal: 20,

    paddingTop: 20,

    paddingBottom: 15,

    borderBottomWidth:
      StyleSheet.hairlineWidth,

    borderBottomColor:
      COLORS.border,
  },

  modalHeaderTextContainer: {
    flex: 1,

    paddingRight: 12,
  },

  modalTitle: {
    fontSize: 18,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.text,

    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },

  closeButton: {
    width: 34,

    height: 34,

    borderRadius: 17,

    backgroundColor:
      COLORS.background,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  closeButtonText: {
    fontSize: 24,

    lineHeight: 25,

    color:
      COLORS.textSecondary,

    fontFamily:
      FONTS?.regular,
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalScrollContent: {
    padding: 16,
  },

  /* =======================================================
     BUSINESS TYPE OPTIONS
  ======================================================= */

  businessTypeOption: {
    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 15,

    marginBottom: 10,

    backgroundColor:
      COLORS.white,
  },

  businessTypeOptionSelected: {
    borderColor:
      COLORS.primary,

    backgroundColor:
      'rgba(0,157,148,0.04)',
  },

  businessTypeOptionContent: {
    flex: 1,
  },

  businessTypeTitleRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  businessTypeOptionTitle: {
    flex: 1,

    fontSize: 15,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    paddingRight: 10,
  },

  businessTypeOptionTitleSelected: {
    fontFamily:
      FONTS?.bold,

    color:
      COLORS.primary,
  },

  businessTypeOptionDescription: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,

    marginTop: 6,

    paddingRight: 8,
  },

  selectedCheck: {
    width: 22,

    height: 22,

    borderRadius: 11,

    backgroundColor:
      COLORS.themeColor,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  selectedCheckText: {
    color:
      COLORS.white,

    fontSize: 13,

    fontFamily:
      FONTS?.bold,
  },

  /* =======================================================
     TARGET AUDIENCE OPTIONS
  ======================================================= */

  audienceOption: {
    flexDirection: 'row',

    alignItems: 'flex-start',

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 15,

    marginBottom: 10,

    backgroundColor:
      COLORS.white,
  },

  audienceOptionSelected: {
    borderColor:
      COLORS.primary,

    backgroundColor:
      'rgba(0,157,148,0.04)',
  },

  checkbox: {
    width: 22,

    height: 22,

    borderRadius: 6,

    borderWidth: 1.5,

    borderColor:
      COLORS.border,

    alignItems: 'center',

    justifyContent:
      'center',

    marginRight: 12,

    marginTop: 1,
  },

  checkboxSelected: {
    borderColor:
      COLORS.themeColor,

    backgroundColor:
      COLORS.themeColor,
  },

  checkboxText: {
    color:
      COLORS.white,

    fontSize: 14,

    fontFamily:
      FONTS?.bold,
  },

  audienceOptionContent: {
    flex: 1,
  },

  audienceOptionTitle: {
    fontSize: 15,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 4,
  },

  audienceOptionTitleSelected: {
    fontFamily:
      FONTS?.bold,

    color:
      COLORS.primary,
  },

  audienceOptionDescription: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },

  audienceInfoBox: {
    flexDirection: 'row',

    backgroundColor:
      COLORS.background,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 13,

    marginTop: 5,
  },

  audienceDoneContainer: {
    borderTopWidth:
      StyleSheet.hairlineWidth,

    borderTopColor:
      COLORS.border,

    paddingHorizontal: 16,

    paddingTop: 12,

    paddingBottom: 6,
  },

  audienceDoneButton: {
    height: 48,

    borderRadius:
      RADIUS?.medium ?? 10,

    backgroundColor:
      COLORS.themeColor,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  audienceDoneButtonDisabled: {
    opacity: 0.5,
  },

  audienceDoneButtonText: {
    color:
      COLORS.white,

    fontSize: 14,

    fontFamily:
      FONTS?.medium,
  },

  /* =======================================================
     MODAL LOADING / EMPTY
  ======================================================= */

  modalLoadingContainer: {
    alignItems: 'center',

    justifyContent:
      'center',

    paddingVertical: 50,
  },

  modalLoadingText: {
    fontSize: 13,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    marginTop: 10,
  },

  emptyModalContainer: {
    alignItems: 'center',

    paddingVertical: 40,

    paddingHorizontal: 20,
  },

  emptyModalTitle: {
    fontSize: 16,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.text,

    marginBottom: 8,

    textAlign: 'center',
  },

  emptyModalText: {
    fontSize: 13,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 19,

    textAlign: 'center',

    marginBottom: 20,
  },

  modalActionButton: {
    backgroundColor:
      COLORS.primary,

    borderRadius:
      RADIUS?.medium ?? 10,

    paddingHorizontal: 18,

    paddingVertical: 12,
  },

  modalActionButtonText: {
    color:
      COLORS.white,

    fontSize: 13,

    fontFamily:
      FONTS?.medium,
  },

  /* =======================================================
     MODAL HELP
  ======================================================= */

  modalHelpContainer: {
    borderTopWidth:
      StyleSheet.hairlineWidth,

    borderTopColor:
      COLORS.border,

    paddingHorizontal: 20,

    paddingVertical: 15,

    alignItems: 'center',
  },

  modalHelpText: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    marginBottom: 4,
  },

  modalHelpLink: {
    fontSize: 13,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.primary,
  },

  /* =======================================================
     HELP MODAL
  ======================================================= */

  helpModalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(0,0,0,0.5)',

    justifyContent:
      'center',

    alignItems:
      'center',

    paddingHorizontal: 22,
  },

  helpModalOutside: {
    ...StyleSheet.absoluteFillObject,
  },

  helpModalContainer: {
    width: '100%',

    backgroundColor:
      COLORS.white,

    borderRadius: 18,

    padding: 22,
  },

  helpModalTitle: {
    fontSize: 19,

    fontFamily:
      FONTS?.bold,

    color:
      COLORS.text,

    textAlign: 'center',

    marginBottom: 12,
  },

  helpModalDescription: {
    fontSize: 13,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 20,

    textAlign: 'center',

    marginBottom: 8,
  },

  helpGuidanceBox: {
    backgroundColor:
      COLORS.background,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 13,

    marginTop: 10,

    marginBottom: 18,
  },

  helpGuidanceTitle: {
    fontSize: 13,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 4,
  },

  helpGuidanceText: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },

  helpCloseButton: {
    height: 48,

    borderRadius:
      RADIUS?.medium ?? 10,

    backgroundColor:
      COLORS.themeColor,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  helpCloseButtonText: {
    color:
      COLORS.white,

    fontSize: 14,

    fontFamily:
      FONTS?.medium,
  },

  /* =======================================================
     SERVICE MODE
  ======================================================= */

  serviceModeOption: {
    flexDirection: 'row',

    alignItems:
      'flex-start',

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 15,

    marginBottom: 10,
  },

  serviceModeOptionSelected: {
    borderColor:
      COLORS.primary,

    backgroundColor:
      'rgba(0,157,148,0.04)',
  },

  radioOuter: {
    width: 22,

    height: 22,

    borderRadius: 11,

    borderWidth: 1.5,

    borderColor:
      COLORS.border,

    alignItems: 'center',

    justifyContent:
      'center',

    marginRight: 12,

    marginTop: 1,
  },

  radioOuterSelected: {
    borderColor:
      COLORS.primary,
  },

  radioInner: {
    width: 11,

    height: 11,

    borderRadius: 5.5,

    backgroundColor:
      COLORS.primary,
  },

  serviceModeContent: {
    flex: 1,
  },

  serviceModeTitle: {
    fontSize: 14,

    fontFamily:
      FONTS?.medium,

    color:
      COLORS.text,

    marginBottom: 4,
  },

  serviceModeDescription: {
    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },

  modalInfoBox: {
    flexDirection: 'row',

    backgroundColor:
      COLORS.background,

    borderRadius:
      RADIUS?.medium ?? 10,

    padding: 13,

    marginTop: 5,
  },

  modalInfoIcon: {
    width: 21,

    height: 21,

    borderRadius: 10.5,

    backgroundColor:
      COLORS.themeColor,

    alignItems: 'center',

    justifyContent:
      'center',

    marginRight: 9,
  },

  modalInfoIconText: {
    color:
      COLORS.white,

    fontSize: 11,

    fontFamily:
      FONTS?.bold,
  },

  modalInfoText: {
    flex: 1,

    fontSize: 12,

    fontFamily:
      FONTS?.regular,

    color:
      COLORS.textSecondary,

    lineHeight: 18,
  },
});

export default SalonRegistrationScreen;