import React, {
  useMemo,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
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
  REGISTER_SALON_PARTNER,
  GET_BUSINESS_TYPES,
} from '../../graphql/queries';

import {
  useSalonRegistration,
} from '../../context/SalonRegistrationContext';

import {
  useUser,
} from '../../context/UserContext';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';


// ============================================================
// TYPES
// ============================================================

type Audience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

type KycDocumentType =
  | 'PAN'
  | 'AADHAAR'
  | 'SHOP_ESTABLISHMENT'
  | 'GST'
  | 'UDYAM';

type BusinessType = {
  businessTypeId: string;
  name: string;
  status?: string;
};


// ============================================================
// REVIEW SERVICE
// ============================================================

type ReviewServiceSelection = {
  uniqueId?: string;
  serviceKey: string;

  businessTypeId?: string;

  /*
   * Required by GraphQL SalonServiceInput.
   */
  businessTypeName: string;

  name: string;

  description?: string;

  audience: Audience;

  categoryId: string;

  categoryName: string;

  subcategoryId: string;

  subcategoryName: string;

  price?: number;

  durationMinutes?: number;
};


// ============================================================
// KYC DOCUMENT INPUT
// ============================================================

type KycDocumentInput = {
  documentType: KycDocumentType;
  fileName: string;
  contentType: string;
  fileSize?: number;
  s3Key: string;
};


// ============================================================
// REGISTER RESPONSE
// ============================================================

type RegisterSalonPartnerResponse = {
  registerSalonPartner: {
    success: boolean;
    message: string;
    salonId: string;
  };
};


// ============================================================
// REGISTER VARIABLES
// ============================================================

type RegisterSalonPartnerVariables = {
  input: {
    userId: string;
    phoneNumber: string;

    salonName: string;
    ownerName: string;
    email: string;

    businessTypeId: string;
    businessTypeIds: string[];
    businessType: string;

    targetAudiences: Audience[];

    address: {
      addressLine: string;
      city: string;
      state: string;
      pincode: string;
    };

    businessHours: {
      MONDAY: {
        open: string;
        close: string;
        isOpen: boolean;
      };
      TUESDAY: {
        open: string;
        close: string;
        isOpen: boolean;
      };
      WEDNESDAY: {
        open: string;
        close: string;
        isOpen: boolean;
      };
      THURSDAY: {
        open: string;
        close: string;
        isOpen: boolean;
      };
      FRIDAY: {
        open: string;
        close: string;
        isOpen: boolean;
      };
      SATURDAY: {
        open: string;
        close: string;
        isOpen: boolean;
      };
      SUNDAY: {
        open: string;
        close: string;
        isOpen: boolean;
      };
    };

    latitude?: number;
    longitude?: number;

    gstNumber?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    shopEstablishmentNumber?: string;
    udyamNumber?: string;

    bankAccount?: string;
    ifsc?: string;

    /*
     * IMPORTANT:
     *
     * These fields MUST match SalonServiceInput
     * in the GraphQL schema.
     */
    services: Array<{
      businessTypeId: string;
      businessTypeName: string;

      categoryId: string;
      categoryName: string;

      subcategoryId: string;
      subcategoryName: string;

      name: string;
      description?: string;

      audience: Audience;

      price: number;
      duration: number;
    }>;

    kycDocuments: KycDocumentInput[];
  };
};


// ============================================================
// AUDIENCE ORDER
// ============================================================

const AUDIENCE_ORDER: Audience[] = [
  'FEMALE',
  'MALE',
  'KIDS',
];


// ============================================================
// AUDIENCE LABEL
// ============================================================

const getAudienceLabel = (
  audience: Audience,
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


// ============================================================
// BUSINESS TYPE HELPERS
// ============================================================

const getBusinessTypeId = (
  item: any,
): string => {

  return String(
    item?.businessTypeId ??
    item?.id ??
    '',
  ).trim();
};


const getBusinessTypeName = (
  item: any,
): string => {

  return String(
    item?.name ??
    item?.businessType ??
    item?.label ??
    '',
  ).trim();
};


// ============================================================
// KYC DOCUMENT HELPERS
// ============================================================

const getKycDocumentName = (
  document: any,
): string => {

  return String(
    document?.name ??
    document?.fileName ??
    '',
  ).trim();
};


const getKycDocumentContentType = (
  document: any,
): string => {

  return String(
    document?.type ??
    document?.contentType ??
    '',
  ).trim();
};


const getKycDocumentUploadId = (
  document: any,
): string => {

  return String(
    document?.uploadId ??
    '',
  ).trim();
};


const getKycDocumentS3Key = (
  document: any,
): string => {

  return String(
    document?.s3Key ??
    document?.key ??
    '',
  ).trim();
};


const hasValidKycDocument = (
  document: any,
): boolean => {

  return !!(
    document &&
    getKycDocumentName(
      document,
    ) &&
    getKycDocumentContentType(
      document,
    ) &&
    getKycDocumentS3Key(
      document,
    )
  );
};


// ============================================================
// CLEAN STRING
// ============================================================

const cleanString = (
  value: any,
): string => {

  return String(
    value ?? '',
  ).trim();
};


// ============================================================
// SCREEN
// ============================================================

export default function SalonReviewScreen({
  navigation,
}: any) {

  const {
    data,
    reset,
  } = useSalonRegistration();

  const {
    currentUser,
    setCurrentUser,
  } = useUser();


  // ==========================================================
  // REGISTER SALON
  // ==========================================================

  const [
    registerSalonPartner,
    {
      loading,
    },
  ] = useMutation<
    RegisterSalonPartnerResponse,
    RegisterSalonPartnerVariables
  >(
    REGISTER_SALON_PARTNER,
  );


  // ==========================================================
  // GET BUSINESS TYPES
  // ==========================================================

  const {
    data: businessTypesData,
    loading: businessTypesLoading,
  } = useQuery(
    GET_BUSINESS_TYPES,
    {
      variables: {
        status: 'ACTIVE',
      },

      fetchPolicy:
        'cache-first',

      notifyOnNetworkStatusChange:
        true,

      onError: error => {

        console.log(
          '[SalonReview] GET_BUSINESS_TYPES error:',
          error,
        );

        console.log(
          '[SalonReview] GET_BUSINESS_TYPES message:',
          error?.message,
        );

        console.log(
          '[SalonReview] GET_BUSINESS_TYPES graphQLErrors:',
          JSON.stringify(
            error?.graphQLErrors,
            null,
            2,
          ),
        );

        console.log(
          '[SalonReview] GET_BUSINESS_TYPES networkError:',
          error?.networkError,
        );
      },
    },
  );


  // ==========================================================
  // BUSINESS TYPE MASTER
  // ==========================================================

  const businessTypes: BusinessType[] =
    businessTypesData
      ?.businessTypes
      ?.businessTypes ??
    [];


  // ==========================================================
  // SELECTED BUSINESS TYPE IDS
  // ==========================================================

  const selectedBusinessTypeIds =
    useMemo(() => {

      const ids =
        Array.isArray(
          data.businessTypeIds,
        )
          ? data.businessTypeIds
          : data.businessTypeId
            ? [
              data.businessTypeId,
            ]
            : [];

      return Array.from(
        new Set(
          ids
            .map(
              id =>
                cleanString(
                  id,
                ),
            )
            .filter(Boolean),
        ),
      );

    }, [
      data.businessTypeIds,
      data.businessTypeId,
    ]);


  // ==========================================================
  // SELECTED BUSINESS TYPES
  // ==========================================================

  const selectedBusinessTypes =
    useMemo(() => {

      return selectedBusinessTypeIds.map(
        businessTypeId => {

          const matched =
            businessTypes.find(
              item =>
                getBusinessTypeId(
                  item,
                ) ===
                businessTypeId,
            );

          return {
            businessTypeId,

            name:
              getBusinessTypeName(
                matched,
              ),
          };
        },
      );

    }, [
      selectedBusinessTypeIds,
      businessTypes,
    ]);


  // ==========================================================
  // BUSINESS TYPE DISPLAY LABEL
  // ==========================================================

  const selectedBusinessTypeLabel =
    useMemo(() => {

      const names =
        selectedBusinessTypes
          .map(
            item =>
              cleanString(
                item.name,
              ),
          )
          .filter(Boolean);

      if (
        names.length > 0
      ) {

        return names.join(', ');
      }


      const storedName =
        cleanString(
          data.businessType,
        );


      const looksLikeBusinessTypeId =
        storedName.startsWith(
          'BT#',
        );


      if (
        storedName &&
        !looksLikeBusinessTypeId
      ) {

        return storedName;
      }


      return '';

    }, [
      selectedBusinessTypes,
      data.businessType,
    ]);


  // ==========================================================
  // BUSINESS TYPE NAME BY ID
  //
  // IMPORTANT:
  //
  // SalonServiceInput now requires:
  //
  // businessTypeName: String!
  //
  // Therefore we resolve the name from the business type
  // master using the service's businessTypeId.
  // ==========================================================

  const getBusinessTypeNameById =
    (
      businessTypeId?: string,
    ): string => {

      const id =
        cleanString(
          businessTypeId,
        );

      if (!id) {
        return '';
      }


      const matched =
        businessTypes.find(
          item =>
            getBusinessTypeId(
              item,
            ) === id,
        );


      const masterName =
        getBusinessTypeName(
          matched,
        );


      if (masterName) {
        return masterName;
      }


      const selected =
        selectedBusinessTypes.find(
          item =>
            item.businessTypeId === id,
        );


      return cleanString(
        selected?.name,
      );
    };


  // ==========================================================
  // DEBUG BUSINESS TYPES
  // ==========================================================

  console.log(
    '[SalonReview] SELECTED BUSINESS TYPE IDS:',
    selectedBusinessTypeIds,
  );

  console.log(
    '[SalonReview] SELECTED BUSINESS TYPE NAMES:',
    selectedBusinessTypes,
  );

  console.log(
    '[SalonReview] RESOLVED BUSINESS TYPE LABEL:',
    selectedBusinessTypeLabel,
  );


  // ==========================================================
  // SERVICE SELECTIONS
  // ==========================================================

  const selectedServiceSelections:
    ReviewServiceSelection[] =
    useMemo(() => {

      if (
        !Array.isArray(
          data.serviceSelections,
        )
      ) {

        return [];
      }


      const seenKeys =
        new Set<string>();


      const result:
        ReviewServiceSelection[] = [];


      data.serviceSelections.forEach(
        (selection: any, index: number) => {

          if (
            !selection ||
            !selection.audience ||
            !selection.categoryId ||
            !selection.subcategoryId
          ) {

            return;
          }


          const uniqueId =
            cleanString(
              selection.uniqueId,
            );


          const originalServiceKey =
            cleanString(
              selection.serviceKey,
            );


          /*
           * IMPORTANT:
           *
           * ConfigureSalonServices creates a new uniqueId
           * when "Add another service" is used.
           *
           * The copied serviceKey can therefore be the same
           * for multiple services under the same subcategory.
           *
           * uniqueId MUST take priority so those services are
           * not incorrectly removed as duplicates.
           */
          const effectiveServiceKey =
            uniqueId ||
            originalServiceKey ||
            [
              selection.audience,
              selection.categoryId,
              selection.subcategoryId,
              cleanString(
                selection.name,
              ),
              index,
            ].join('::');


          if (
            seenKeys.has(
              effectiveServiceKey,
            )
          ) {

            console.warn(
              '[SalonReview] Duplicate service ignored:',
              effectiveServiceKey,
            );

            return;
          }


          seenKeys.add(
            effectiveServiceKey,
          );


          result.push({

            uniqueId:
              uniqueId ||
              undefined,

            /*
             * Preserve the original serviceKey when it exists.
             * effectiveServiceKey is only used internally to
             * distinguish the current service instance.
             */
            serviceKey:
              originalServiceKey ||
              effectiveServiceKey,

            businessTypeId:
              cleanString(
                selection.businessTypeId,
              ) ||
              undefined,

            businessTypeName:
              cleanString(
                selection.businessTypeName,
              ),

            name:
              cleanString(
                selection.name,
              ),

            description:
              cleanString(
                selection.description,
              ),

            audience:
              selection.audience,

            categoryId:
              cleanString(
                selection.categoryId,
              ),

            categoryName:
              cleanString(
                selection.categoryName,
              ),

            subcategoryId:
              cleanString(
                selection.subcategoryId,
              ),

            subcategoryName:
              cleanString(
                selection.subcategoryName,
              ),

            price:
              selection.price,

            durationMinutes:
              selection.durationMinutes,
          });
        },
      );


      return result;

    }, [
      data.serviceSelections,
    ]);

  // ==========================================================
  // GROUP SERVICES BY AUDIENCE
  // ==========================================================

  const groupedServices =
    useMemo(() => {

      const groups:
        Record<
          Audience,
          ReviewServiceSelection[]
        > = {

        FEMALE: [],

        MALE: [],

        KIDS: [],
      };


      selectedServiceSelections.forEach(
        selection => {

          if (
            groups[
              selection.audience
            ]
          ) {

            groups[
              selection.audience
            ].push(
              selection,
            );
          }
        },
      );


      return groups;

    }, [
      selectedServiceSelections,
    ]);


  // ==========================================================
  // KYC DOCUMENTS
  // ==========================================================

  const panDocument =
    data.panDocument;

  const aadhaarDocument =
    data.aadhaarDocument;

  const shopEstablishmentDocument =
    data.shopEstablishmentDocument;

  const gstDocument =
    data.gstDocument;

  const udyamDocument =
    data.udyamDocument;


  // ==========================================================
  // KYC DOCUMENT STATUS
  // ==========================================================

  const hasPanDocument =
    hasValidKycDocument(
      panDocument,
    );

  const hasAadhaarDocument =
    hasValidKycDocument(
      aadhaarDocument,
    );

  const hasShopEstablishmentDocument =
    hasValidKycDocument(
      shopEstablishmentDocument,
    );

  const hasGstDocument =
    hasValidKycDocument(
      gstDocument,
    );

  const hasUdyamDocument =
    hasValidKycDocument(
      udyamDocument,
    );


  // ==========================================================
  // BUILD KYC DOCUMENT PAYLOAD
  // ==========================================================

  const buildKycDocumentPayload =
    (): KycDocumentInput[] => {

      const documents:
        KycDocumentInput[] = [];


      // ------------------------------------------------------
      // PAN
      // ------------------------------------------------------

      if (
        !hasValidKycDocument(
          panDocument,
        )
      ) {

        throw new Error(
          'PAN document is missing or has not been uploaded successfully.',
        );
      }


      documents.push({

        documentType:
          'PAN',

        fileName:
          getKycDocumentName(
            panDocument,
          ),

        contentType:
          getKycDocumentContentType(
            panDocument,
          ),

        ...(panDocument?.size != null
          ? {
            fileSize:
              Number(
                panDocument.size,
              ),
          }
          : {}),

        s3Key:
          getKycDocumentS3Key(
            panDocument,
          ),
      });


      // ------------------------------------------------------
      // AADHAAR
      // ------------------------------------------------------

      if (
        !hasValidKycDocument(
          aadhaarDocument,
        )
      ) {

        throw new Error(
          'Aadhaar document is missing or has not been uploaded successfully.',
        );
      }


      documents.push({

        documentType:
          'AADHAAR',

        fileName:
          getKycDocumentName(
            aadhaarDocument,
          ),

        contentType:
          getKycDocumentContentType(
            aadhaarDocument,
          ),

        ...(aadhaarDocument?.size != null
          ? {
            fileSize:
              Number(
                aadhaarDocument.size,
              ),
          }
          : {}),

        s3Key:
          getKycDocumentS3Key(
            aadhaarDocument,
          ),
      });


      // ------------------------------------------------------
      // SHOP & ESTABLISHMENT
      // ------------------------------------------------------

      if (
        !hasValidKycDocument(
          shopEstablishmentDocument,
        )
      ) {

        throw new Error(
          'Shop & Establishment document is missing or has not been uploaded successfully.',
        );
      }


      documents.push({

        documentType:
          'SHOP_ESTABLISHMENT',

        fileName:
          getKycDocumentName(
            shopEstablishmentDocument,
          ),

        contentType:
          getKycDocumentContentType(
            shopEstablishmentDocument,
          ),

        ...(shopEstablishmentDocument?.size != null
          ? {
            fileSize:
              Number(
                shopEstablishmentDocument.size,
              ),
          }
          : {}),

        s3Key:
          getKycDocumentS3Key(
            shopEstablishmentDocument,
          ),
      });


      // ------------------------------------------------------
      // GST
      // ------------------------------------------------------

      if (
        gstDocument
      ) {

        if (
          !hasValidKycDocument(
            gstDocument,
          )
        ) {

          throw new Error(
            'GST document information is incomplete. Please upload the GST document again.',
          );
        }


        documents.push({

          documentType:
            'GST',

          fileName:
            getKycDocumentName(
              gstDocument,
            ),

          contentType:
            getKycDocumentContentType(
              gstDocument,
            ),

          ...(gstDocument?.size != null
            ? {
              fileSize:
                Number(
                  gstDocument.size,
                ),
            }
            : {}),

          s3Key:
            getKycDocumentS3Key(
              gstDocument,
            ),
        });
      }


      // ------------------------------------------------------
      // UDYAM
      // ------------------------------------------------------

      if (
        udyamDocument
      ) {

        if (
          !hasValidKycDocument(
            udyamDocument,
          )
        ) {

          throw new Error(
            'Udyam document information is incomplete. Please upload the Udyam document again.',
          );
        }


        documents.push({

          documentType:
            'UDYAM',

          fileName:
            getKycDocumentName(
              udyamDocument,
            ),

          contentType:
            getKycDocumentContentType(
              udyamDocument,
            ),

          ...(udyamDocument?.size != null
            ? {
              fileSize:
                Number(
                  udyamDocument.size,
                ),
              }
            : {}),

          s3Key:
            getKycDocumentS3Key(
              udyamDocument,
            ),
        });
      }


      return documents;
    };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const onSubmit = async () => {

    // --------------------------------------------------------
    // USER CHECK
    // --------------------------------------------------------

    if (
      !currentUser?.userId
    ) {

      Alert.alert(
        'Session Expired',
        'Please sign in again.',
      );

      return;
    }


    // --------------------------------------------------------
    // USER DATA CHECK
    // --------------------------------------------------------

    if (
      !data.userId
    ) {

      Alert.alert(
        'Registration Error',
        'User information is missing. Please restart registration.',
      );

      return;
    }


    // --------------------------------------------------------
    // SALON NAME
    // --------------------------------------------------------

    const salonName =
      cleanString(
        data.salonName,
      );


    if (!salonName) {

      Alert.alert(
        'Registration Error',
        'Salon name is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // OWNER NAME
    // --------------------------------------------------------

    const ownerName =
      cleanString(
        data.ownerName,
      );


    if (!ownerName) {

      Alert.alert(
        'Registration Error',
        'Owner name is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    const email =
      cleanString(
        data.email,
      );


    if (!email) {

      Alert.alert(
        'Registration Error',
        'Email address is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // PHONE
    // --------------------------------------------------------

    const phoneNumber =
      cleanString(
        currentUser.phoneNumber ||
        data.phoneNumber,
      );


    if (!phoneNumber) {

      Alert.alert(
        'Registration Error',
        'Phone number is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // BUSINESS TYPES
    // --------------------------------------------------------

    const normalizedBusinessTypeIds =
      selectedBusinessTypeIds
        .map(
          id =>
            cleanString(
              id,
            ),
        )
        .filter(Boolean);


    const primaryBusinessTypeId =
      normalizedBusinessTypeIds[0] ||
      cleanString(
        data.businessTypeId,
      );


    if (
      normalizedBusinessTypeIds.length ===
      0 ||
      !primaryBusinessTypeId
    ) {

      Alert.alert(
        'Business Type Required',
        'Please select at least one business type.',
      );

      return;
    }


    // --------------------------------------------------------
    // BUSINESS TYPE NAME
    // --------------------------------------------------------

    const businessTypeName =
      cleanString(
        selectedBusinessTypeLabel,
      );


    if (
      !businessTypeName ||
      businessTypeName.startsWith(
        'BT#',
      )
    ) {

      console.warn(
        '[SalonReview] Business type names are not available.',
        {
          ids:
            normalizedBusinessTypeIds,

          businessTypes,
        },
      );

      Alert.alert(
        'Business Type Information',
        'Business type names could not be loaded. Please go back and select your business types again.',
      );

      return;
    }


    // --------------------------------------------------------
    // TARGET AUDIENCE
    // --------------------------------------------------------

    const targetAudiences =
      Array.isArray(
        data.targetAudiences,
      )
        ? data.targetAudiences.filter(
          (
            audience: any,
          ): audience is Audience =>
            audience ===
            'FEMALE' ||
            audience ===
            'MALE' ||
            audience ===
            'KIDS',
        )
        : [];


    if (
      targetAudiences.length ===
      0
    ) {

      Alert.alert(
        'Customer Type Required',
        'Please select who your business serves.',
      );

      return;
    }


    // --------------------------------------------------------
    // ADDRESS
    // --------------------------------------------------------

    const addressLine =
      cleanString(
        data.addressLine,
      );

    const city =
      cleanString(
        data.city,
      );

    const state =
      cleanString(
        data.state,
      );

    const pincode =
      cleanString(
        data.pincode,
      );


    if (
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {

      Alert.alert(
        'Address Required',
        'Please complete your business address.',
      );

      return;
    }


    // --------------------------------------------------------
    // BUSINESS HOURS
    // --------------------------------------------------------

    if (
      !data.businessHours ||
      Object.keys(
        data.businessHours,
      ).length === 0
    ) {

      Alert.alert(
        'Business Hours Required',
        'Please provide your business hours.',
      );

      return;
    }


    /*
     * GraphQL requires every day to contain:
     *
     * open: String!
     * close: String!
     * isOpen: Boolean!
     *
     * Therefore normalize every day before submitting.
     */

    const days = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ] as const;


    const normalizedBusinessHours =
      {} as RegisterSalonPartnerVariables['input']['businessHours'];


    for (
      const day of days
    ) {

      const sourceDay =
        (
          data.businessHours as any
        )?.[day];


      if (!sourceDay) {

        Alert.alert(
          'Business Hours Required',
          `${day} business hours are missing.`,
        );

        return;
      }


      normalizedBusinessHours[day] = {

        isOpen:
          Boolean(
            sourceDay.isOpen,
          ),

        open:
          cleanString(
            sourceDay.open,
          ),

        close:
          cleanString(
            sourceDay.close,
          ),
      };


      if (
        !normalizedBusinessHours[day].open ||
        !normalizedBusinessHours[day].close
      ) {

        Alert.alert(
          'Business Hours Required',
          `Please provide opening and closing times for ${day}.`,
        );

        return;
      }
    }


    // ========================================================
    // PAN
    // ========================================================

    const cleanPAN =
      cleanString(
        data.panNumber,
      )
        .toUpperCase();


    if (
      !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
        cleanPAN,
      )
    ) {

      Alert.alert(
        'PAN Required',
        'Please provide a valid PAN number.',
      );

      return;
    }


    // ========================================================
    // PAN DOCUMENT
    // ========================================================

    if (!hasPanDocument) {

      Alert.alert(
        'PAN Document Required',
        'Please upload the PAN document before submitting your salon registration.',
      );

      return;
    }


    // ========================================================
    // AADHAAR
    // ========================================================

    const cleanAadhaar =
      cleanString(
        data.aadhaarNumber,
      )
        .replace(
          /\D/g,
          '',
        );


    if (
      !/^\d{12}$/.test(
        cleanAadhaar,
      )
    ) {

      Alert.alert(
        'Aadhaar Required',
        'Please provide a valid 12-digit Aadhaar number.',
      );

      return;
    }


    // ========================================================
    // AADHAAR DOCUMENT
    // ========================================================

    if (!hasAadhaarDocument) {

      Alert.alert(
        'Aadhaar Document Required',
        'Please upload the Aadhaar document before submitting your salon registration.',
      );

      return;
    }


    // ========================================================
    // SHOP & ESTABLISHMENT
    // ========================================================

    const cleanShop =
      cleanString(
        data.shopEstablishmentNumber,
      );


    if (!cleanShop) {

      Alert.alert(
        'Salon Registration Required',
        'Please provide your Shop & Establishment registration number.',
      );

      return;
    }


    // ========================================================
    // SHOP DOCUMENT
    // ========================================================

    if (
      !hasShopEstablishmentDocument
    ) {

      Alert.alert(
        'Shop & Establishment Document Required',
        'Please upload the Shop & Establishment document before submitting your salon registration.',
      );

      return;
    }


    // ========================================================
    // SERVICES
    // ========================================================

    if (
      selectedServiceSelections.length ===
      0
    ) {

      Alert.alert(
        'Services Required',
        'Please select at least one service.',
      );

      return;
    }


    // ========================================================
    // BUILD SERVICES
    // ========================================================

    const services =
      selectedServiceSelections.map(
        selection => {

          const businessTypeId =
            cleanString(
              selection.businessTypeId,
            );


          /*
           * IMPORTANT:
           *
           * businessTypeName is REQUIRED by GraphQL.
           *
           * First use the name stored on the service.
           * If unavailable, resolve it from the master list.
           */

          const businessTypeName =
            cleanString(
              selection.businessTypeName,
            ) ||
            getBusinessTypeNameById(
              selection.businessTypeId,
            );


          const categoryId =
            cleanString(
              selection.categoryId,
            );


          const categoryName =
            cleanString(
              selection.categoryName,
            );


          const subcategoryId =
            cleanString(
              selection.subcategoryId,
            );


          const subcategoryName =
            cleanString(
              selection.subcategoryName,
            );


          const serviceName =
            cleanString(
              selection.name,
            );


          const description =
            cleanString(
              selection.description,
            );


          const price =
            Number(
              selection.price,
            );


          const duration =
            Number(
              selection.durationMinutes,
            );


          return {

            businessTypeId,

            businessTypeName,

            categoryId,

            categoryName,

            subcategoryId,

            subcategoryName,

            name:
              serviceName,

            description,

            audience:
              selection.audience,

            price,

            duration,
          };
        },
      );


    // ========================================================
    // VALIDATE FINAL SERVICES PAYLOAD
    //
    // This validates the ACTUAL GraphQL payload rather than
    // validating the source selection object.
    // ========================================================

    const invalidService =
      services.find(
        service => {

          return (

            !service.businessTypeId ||

            !service.businessTypeName ||

            !service.categoryId ||

            !service.categoryName ||

            !service.subcategoryId ||

            !service.subcategoryName ||

            !service.name ||

            !service.audience ||

            !Number.isFinite(
              service.price,
            ) ||

            service.price <= 0 ||

            !Number.isFinite(
              service.duration,
            ) ||

            service.duration <= 0

          );
        },
      );


    if (invalidService) {

      console.error(
        '[SalonReview] INVALID SERVICE PAYLOAD:',
        JSON.stringify(
          invalidService,
          null,
          2,
        ),
      );


      Alert.alert(
        'Invalid Service',
        'Every service must have a business type, business type name, category, category name, subcategory, subcategory name, service name, audience, price, and duration.',
      );

      return;
    }


    // ========================================================
    // BUILD KYC DOCUMENTS
    // ========================================================

    let kycDocuments:
      KycDocumentInput[] = [];


    try {

      kycDocuments =
        buildKycDocumentPayload();

    } catch (
      error: any
    ) {

      console.error(
        '[SalonReview] KYC DOCUMENT PAYLOAD ERROR:',
        error,
      );

      Alert.alert(
        'KYC Documents Required',
        error?.message ||
        'Please check your KYC documents and upload them again if necessary.',
      );

      return;
    }


    // ========================================================
    // REQUIRED KYC DOCUMENT COUNT
    // ========================================================

    const requiredKycDocumentTypes:
      KycDocumentType[] = [
        'PAN',
        'AADHAAR',
        'SHOP_ESTABLISHMENT',
      ];


    const missingRequiredKycDocuments =
      requiredKycDocumentTypes.filter(
        documentType =>
          !kycDocuments.some(
            document =>
              document.documentType ===
              documentType,
          ),
      );


    if (
      missingRequiredKycDocuments.length >
      0
    ) {

      Alert.alert(
        'KYC Documents Required',
        'Please upload all required KYC documents before submitting your salon registration.',
      );

      return;
    }


    // ========================================================
    // DEBUG KYC
    // ========================================================

    console.log(
      '[SalonReview] KYC UPLOAD IDS:',
      {
        pan:
          getKycDocumentUploadId(
            panDocument,
          ),

        aadhaar:
          getKycDocumentUploadId(
            aadhaarDocument,
          ),

        shopEstablishment:
          getKycDocumentUploadId(
            shopEstablishmentDocument,
          ),

        gst:
          getKycDocumentUploadId(
            gstDocument,
          ),

        udyam:
          getKycDocumentUploadId(
            udyamDocument,
          ),
      },
    );


    console.log(
      '[SalonReview] KYC DOCUMENTS PAYLOAD:',
      JSON.stringify(
        kycDocuments,
        null,
        2,
      ),
    );


    // ========================================================
    // FINAL REGISTER INPUT
    // ========================================================

    const registerInput:
      RegisterSalonPartnerVariables['input'] = {

      userId:
        currentUser.userId,

      phoneNumber,

      salonName,

      ownerName,

      email,

      businessTypeId:
        primaryBusinessTypeId,

      businessTypeIds:
        normalizedBusinessTypeIds,

      businessType:
        businessTypeName,

      targetAudiences,

      address: {

        addressLine,

        city,

        state,

        pincode,
      },

      businessHours:
        normalizedBusinessHours,

      latitude:
        data.latitude,

      longitude:
        data.longitude,

      /*
       * These are optional according to GraphQL.
       * Empty strings are omitted so that the server receives
       * undefined rather than unnecessary empty values.
       */

      ...(cleanString(
        data.gstNumber,
      )
        ? {
          gstNumber:
            cleanString(
              data.gstNumber,
            ).toUpperCase(),
        }
        : {}),

      panNumber:
        cleanPAN,

      aadhaarNumber:
        cleanAadhaar,

      shopEstablishmentNumber:
        cleanShop,

      ...(cleanString(
        data.udyamNumber,
      )
        ? {
          udyamNumber:
            cleanString(
              data.udyamNumber,
            ).toUpperCase(),
        }
        : {}),

      ...(cleanString(
        data.bankAccount,
      )
        ? {
          bankAccount:
            cleanString(
              data.bankAccount,
            ),
        }
        : {}),

      ...(cleanString(
        data.ifsc,
      )
        ? {
          ifsc:
            cleanString(
              data.ifsc,
            ).toUpperCase(),
        }
        : {}),

      services,

      kycDocuments,
    };


    // ========================================================
    // FINAL DEBUG
    // ========================================================

    console.log(
      '==========================================',
    );

    console.log(
      '[SalonReview] SUBMITTING SALON REGISTRATION',
    );

    console.log(
      '[SalonReview] BUSINESS TYPE IDS:',
      normalizedBusinessTypeIds,
    );

    console.log(
      '[SalonReview] BUSINESS TYPE NAME:',
      businessTypeName,
    );

    console.log(
      '[SalonReview] TARGET AUDIENCES:',
      targetAudiences,
    );

    console.log(
      '[SalonReview] SERVICES COUNT:',
      services.length,
    );

    console.log(
      '[SalonReview] SERVICES PAYLOAD:',
      JSON.stringify(
        services,
        null,
        2,
      ),
    );

    console.log(
      '[SalonReview] KYC DOCUMENT COUNT:',
      kycDocuments.length,
    );

    console.log(
      '[SalonReview] FINAL REGISTER INPUT:',
      JSON.stringify(
        registerInput,
        null,
        2,
      ),
    );

    console.log(
      '[SalonReview] Calling registerSalonPartner...',
    );

    console.log(
      '==========================================',
    );


    // ========================================================
    // REGISTER SALON
    // ========================================================

    try {

      const response =
        await registerSalonPartner({

          variables: {

            input:
              registerInput,

          },

        });


      console.log(
        '==========================================',
      );

      console.log(
        '[SalonReview] REGISTER SALON RESPONSE:',
      );

      console.log(
        JSON.stringify(
          response.data,
          null,
          2,
        ),
      );

      console.log(
        '==========================================',
      );


      // ======================================================
      // RESULT
      // ======================================================

      const result =
        response.data
          ?.registerSalonPartner;


      // ======================================================
      // BACKEND FAILURE
      // ======================================================

      if (
        !result?.success
      ) {

        Alert.alert(
          'Registration Failed',
          result?.message ||
          'Unable to register your business.',
        );

        return;
      }


      // ======================================================
      // SALON ID
      // ======================================================

      const salonId =
        cleanString(
          result?.salonId,
        );


      if (!salonId) {

        Alert.alert(
          'Registration Error',
          'Salon was created, but the business ID was not returned by the server.',
        );

        return;
      }


      // ======================================================
      // UPDATE USER
      // ======================================================

      const existingRoles =
        currentUser.roles || {
          customer: false,
          businessPartner: false,
        };


      const updatedUser = {

        ...currentUser,

        activeRole:
          'PROVIDER',

        providerStatus:
          'PENDING',

        salonId,

        roles: {

          ...existingRoles,

          businessPartner:
            true,
        },
      };


      setCurrentUser(
        updatedUser,
      );


      // ======================================================
      // RESET REGISTRATION
      // ======================================================

      reset();


      // ======================================================
      // SUCCESS SCREEN
      // ======================================================

      navigation.navigate(
        'SalonSuccess',
        {
          salonId,
        },
      );

    } catch (
      error: any
    ) {

      console.error(
        '==========================================',
      );

      console.error(
        '[SalonReview] REGISTER SALON ERROR',
      );

      console.error(
        '[SalonReview] ERROR:',
        error,
      );

      console.error(
        '[SalonReview] MESSAGE:',
        error?.message,
      );

      console.error(
        '[SalonReview] GRAPHQL ERRORS:',
        JSON.stringify(
          error?.graphQLErrors,
          null,
          2,
        ),
      );

      console.error(
        '[SalonReview] NETWORK ERROR:',
        error?.networkError,
      );

      console.error(
        '[SalonReview] NETWORK ERROR NAME:',
        error?.networkError?.name,
      );

      console.error(
        '[SalonReview] NETWORK ERROR MESSAGE:',
        error?.networkError?.message,
      );

      console.error(
        '[SalonReview] NETWORK ERROR STACK:',
        error?.networkError?.stack,
      );

      console.error(
        '[SalonReview] ERROR RESULT:',
        JSON.stringify(
          error,
          Object.getOwnPropertyNames(
            error,
          ),
          2,
        ),
      );

      console.error(
        '==========================================',
      );


      Alert.alert(
        'Registration Failed',
        error?.message ||
        'Something went wrong while registering the business.',
      );
    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >

      <Header
        headerTitle="Review Details"
      />


      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Review your details
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Please check everything before submitting your business registration.
          </Text>

        </View>


        {/* ====================================================
            BASIC DETAILS
        ==================================================== */}

        <View
          style={
            styles.card
          }
        >

          <DetailRow
            label="Salon"
            value={
              cleanString(
                data.salonName,
              )
            }
          />


          <DetailRow
            label="Owner"
            value={
              cleanString(
                data.ownerName,
              )
            }
          />


          <DetailRow
            label="Email"
            value={
              cleanString(
                data.email,
              )
            }
          />


          {/* ==================================================
              BUSINESS TYPES
          ================================================== */}

          <View
            style={
              styles.businessTypeRow
            }
          >

            <Text
              style={
                styles.detailLabel
              }
            >
              Business types
            </Text>


            {businessTypesLoading ? (

              <View
                style={
                  styles.businessTypeLoading
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
                    styles.businessTypeLoadingText
                  }
                >
                  Loading business types...
                </Text>

              </View>

            ) : selectedBusinessTypes.some(
              item =>
                !!item.name,
            ) ? (

              <View
                style={
                  styles.businessTypeList
                }
              >

                {selectedBusinessTypes
                  .filter(
                    item =>
                      !!item.name,
                  )
                  .map(
                    businessType => (

                      <View
                        key={
                          businessType.businessTypeId
                        }
                        style={
                          styles.businessTypeChip
                        }
                      >

                        <Text
                          style={
                            styles.businessTypeChipText
                          }
                        >
                          {
                            businessType.name
                          }
                        </Text>

                      </View>

                    ),
                  )}

              </View>

            ) : (

              <Text
                style={
                  styles.detailValue
                }
              >
                {
                  selectedBusinessTypeLabel ||
                  'Business type information unavailable'
                }
              </Text>

            )}

          </View>


          <DetailRow
            label="Address"
            value={
              `${cleanString(data.addressLine)}, ${cleanString(data.city)}, ${cleanString(data.state)} - ${cleanString(data.pincode)}`
            }
          />


          <DetailRow
            label="Customer type"
            value={
              Array.isArray(
                data.targetAudiences,
              )
                ? data.targetAudiences
                  .map(
                    (
                      audience: Audience,
                    ) =>
                      getAudienceLabel(
                        audience,
                      ),
                  )
                  .join(', ')
                : '-'
            }
          />


          <DetailRow
            label="GSTIN"
            value={
              cleanString(
                data.gstNumber,
              ) ||
              'Not provided'
            }
          />


          <DetailRow
            label="Shop & Establishment"
            value={
              cleanString(
                data.shopEstablishmentNumber,
              ) ||
              '-'
            }
          />


          <DetailRow
            label="Udyam"
            value={
              cleanString(
                data.udyamNumber,
              ) ||
              'Not provided'
            }
          />


          <DetailRow
            label="PAN"
            value={
              cleanString(
                data.panNumber,
              ) ||
              '-'
            }
          />


          <DetailRow
            label="Aadhaar"
            value={
              data.aadhaarNumber
                ? `XXXX XXXX ${cleanString(
                  data.aadhaarNumber,
                ).slice(-4)}`
                : '-'
            }
            last
          />

        </View>


        {/* ====================================================
            KYC DOCUMENTS
        ==================================================== */}

        <View
          style={
            styles.sectionCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            KYC documents
          </Text>


          <Text
            style={
              styles.sectionSubtitle
            }
          >
            PAN, Aadhaar and Shop & Establishment documents are required. GST and Udyam documents are optional.
          </Text>


          <KycDocumentRow
            title="PAN document"
            document={
              panDocument
            }
            uploaded={
              hasPanDocument
            }
            required
          />


          <KycDocumentRow
            title="Aadhaar document"
            document={
              aadhaarDocument
            }
            uploaded={
              hasAadhaarDocument
            }
            required
          />


          <KycDocumentRow
            title="Shop & Establishment document"
            document={
              shopEstablishmentDocument
            }
            uploaded={
              hasShopEstablishmentDocument
            }
            required
          />


          <KycDocumentRow
            title="GST document"
            document={
              gstDocument
            }
            uploaded={
              hasGstDocument
            }
            required={false}
          />


          <KycDocumentRow
            title="Udyam document"
            document={
              udyamDocument
            }
            uploaded={
              hasUdyamDocument
            }
            required={false}
            last
          />

        </View>


        {/* ====================================================
            SERVICES
        ==================================================== */}

        <View
          style={
            styles.sectionCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Services provided
          </Text>


          <Text
            style={
              styles.sectionSubtitle
            }
          >
            These are the actual services that will be offered by your business.
          </Text>


          {selectedServiceSelections.length ===
            0 ? (

            <Text
              style={
                styles.emptyText
              }
            >
              No services selected.
            </Text>

          ) : (

            AUDIENCE_ORDER.map(
              audience => {

                const audienceServices =
                  groupedServices[
                    audience
                  ];


                if (
                  audienceServices.length ===
                  0
                ) {

                  return null;
                }


                return (

                  <View
                    key={
                      audience
                    }
                    style={
                      styles.audienceSection
                    }
                  >

                    <View
                      style={
                        styles.audienceHeader
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


                    {audienceServices.map(
                      (
                        service,
                        index,
                      ) => (

                        <View
                          key={`${service.serviceKey}-${index}`}
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
                              styles.serviceInfo
                            }
                          >

                            <Text
                              style={
                                styles.serviceCategory
                              }
                            >
                              {
                                service.categoryName ||
                                service.categoryId
                              }
                            </Text>


                            <Text
                              style={
                                styles.serviceSubcategory
                              }
                            >
                              {
                                service.subcategoryName ||
                                service.subcategoryId
                              }
                            </Text>


                            <Text
                              style={
                                styles.serviceName
                              }
                            >
                              {
                                service.name ||
                                'Service name not provided'
                              }
                            </Text>


                            {service.description ? (

                              <Text
                                style={
                                  styles.serviceDescription
                                }
                              >
                                {
                                  service.description
                                }
                              </Text>

                            ) : null}


                            {service.durationMinutes !==
                              undefined &&
                              service.durationMinutes !==
                              null ? (

                              <Text
                                style={
                                  styles.serviceDuration
                                }
                              >
                                {
                                  Number(
                                    service.durationMinutes,
                                  )
                                } min
                              </Text>

                            ) : null}

                          </View>


                          {service.price !==
                            undefined &&
                            service.price !==
                            null ? (

                            <Text
                              style={
                                styles.servicePrice
                              }
                            >
                              ₹
                              {
                                Number(
                                  service.price,
                                ).toFixed(
                                  0,
                                )
                              }
                            </Text>

                          ) : null}

                        </View>

                      ),
                    )}

                  </View>

                );
              },
            )

          )}

        </View>


        {/* ====================================================
            VERIFICATION
        ==================================================== */}

        <View
          style={
            styles.notice
          }
        >

          <Text
            style={
              styles.noticeTitle
            }
          >
            Verification
          </Text>


          <Text
            style={
              styles.noticeText
            }
          >
            After submission, your business registration will be reviewed. Provider access will be activated only after the required verification and approval process is completed.
          </Text>

        </View>


        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <DButton
          style={
            styles.button
          }
          onPress={
            onSubmit
          }
          disabled={
            loading
          }
          loading={
            loading
          }
        >
          {
            loading
              ? 'Submitting...'
              : 'Submit Registration'
          }
        </DButton>


        <View
          style={
            styles.bottomSpacing
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
}


// ============================================================
// KYC DOCUMENT ROW
// ============================================================

function KycDocumentRow({
  title,
  document,
  uploaded,
  required = false,
  last = false,
}: {
  title: string;
  document?: any;
  uploaded: boolean;
  required?: boolean;
  last?: boolean;
}) {

  return (

    <View
      style={[
        styles.documentRow,
        !last &&
        styles.documentBorder,
      ]}
    >

      <View
        style={
          styles.documentInfo
        }
      >

        <Text
          style={
            styles.documentTitle
          }
        >
          {title}
          {required
            ? ' *'
            : ''}
        </Text>


        <Text
          style={
            styles.documentName
          }
        >
          {
            document?.name ||
            document?.fileName ||
            'Not uploaded'
          }
        </Text>

      </View>


      <View
        style={[
          styles.documentStatus,
          uploaded
            ? styles.documentUploaded
            : styles.documentMissing,
        ]}
      >

        <Text
          style={[
            styles.documentStatusText,
            uploaded
              ? styles.documentUploadedText
              : styles.documentMissingText,
          ]}
        >
          {
            uploaded
              ? 'Uploaded'
              : required
                ? 'Required'
                : 'Optional'
          }
        </Text>

      </View>

    </View>
  );
}


// ============================================================
// DETAIL ROW
// ============================================================

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {

  return (

    <View
      style={[
        styles.detailRow,
        !last &&
        styles.detailBorder,
      ]}
    >

      <Text
        style={
          styles.detailLabel
        }
      >
        {
          label
        }
      </Text>


      <Text
        style={
          styles.detailValue
        }
      >
        {
          value ||
          '-'
        }
      </Text>

    </View>
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
        SPACING.xxxl,
    },

    header: {
      marginBottom:
        SPACING.xxl,
    },

    title: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.title,

      lineHeight:
        FONT_SIZES.title + 5,

      color:
        COLORS.text,

      textAlign:
        'center',

      letterSpacing:
        -0.2,
    },

    subtitle: {
      marginTop:
        SPACING.small,

      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      lineHeight:
        FONT_SIZES.small + 7,

      color:
        COLORS.textSecondary,

      textAlign:
        'center',
    },

    card: {
      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.large,

      paddingHorizontal:
        SPACING.xl,
    },

    detailRow: {
      paddingVertical:
        SPACING.large,
    },

    detailBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.border,
    },

    detailLabel: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.xs,
    },

    detailValue: {
      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.body,

      lineHeight:
        FONT_SIZES.body + 6,

      color:
        COLORS.text,
    },

    businessTypeRow: {
      paddingVertical:
        SPACING.large,

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.border,
    },

    businessTypeList: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap: 8,

      marginTop:
        SPACING.xs,
    },

    businessTypeChip: {
      backgroundColor:
        COLORS.themeColor,

      borderRadius:
        RADIUS.medium,

      paddingHorizontal:
        SPACING.medium,

      paddingVertical:
        SPACING.small,
    },

    businessTypeChipText: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.white,
    },

    businessTypeLoading: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop:
        SPACING.xs,
    },

    businessTypeLoadingText: {
      marginLeft:
        SPACING.small,

      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.textSecondary,
    },

    sectionCard: {
      marginTop:
        SPACING.xl,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.large,

      padding:
        SPACING.xl,
    },

    sectionTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.body,

      color:
        COLORS.text,

      marginBottom:
        SPACING.xs,
    },

    sectionSubtitle: {
      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      lineHeight:
        FONT_SIZES.small + 7,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.large,
    },

    // ========================================================
    // KYC DOCUMENTS
    // ========================================================

    documentRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      paddingVertical:
        SPACING.medium,
    },

    documentBorder: {
      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },

    documentInfo: {
      flex: 1,
    },

    documentTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.text,

      marginBottom:
        3,
    },

    documentName: {
      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.textSecondary,
    },

    documentStatus: {
      borderRadius:
        RADIUS.medium,

      paddingHorizontal:
        SPACING.medium,

      paddingVertical:
        SPACING.small,

      marginLeft:
        SPACING.small,
    },

    documentUploaded: {
      backgroundColor:
        COLORS.themeColor,
    },

    documentMissing: {
      backgroundColor:
        COLORS.border,
    },

    documentStatusText: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,
    },

    documentUploadedText: {
      color:
        COLORS.white,
    },

    documentMissingText: {
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // SERVICES
    // ========================================================

    emptyText: {
      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.textSecondary,

      paddingVertical:
        SPACING.medium,
    },

    audienceSection: {
      marginBottom:
        SPACING.large,
    },

    audienceHeader: {
      backgroundColor:
        COLORS.themeColor,

      borderRadius:
        RADIUS.medium,

      paddingHorizontal:
        SPACING.medium,

      paddingVertical:
        SPACING.small,

      marginBottom:
        SPACING.small,
    },

    audienceTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.white,
    },

    serviceItem: {
      flexDirection:
        'row',

      alignItems:
        'center',

      paddingVertical:
        SPACING.medium,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },

    serviceDot: {
      width: 7,

      height: 7,

      borderRadius: 4,

      backgroundColor:
        COLORS.themeColor,

      marginRight:
        SPACING.small,
    },

    serviceInfo: {
      flex: 1,
    },

    serviceCategory: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.text,
    },

    serviceSubcategory: {
      marginTop:
        2,

      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.textSecondary,
    },

    serviceName: {
      marginTop:
        4,

      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.body,

      color:
        COLORS.text,
    },

    serviceDescription: {
      marginTop:
        3,

      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      lineHeight:
        FONT_SIZES.small + 5,

      color:
        COLORS.textSecondary,
    },

    serviceDuration: {
      marginTop:
        4,

      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.textSecondary,
    },

    servicePrice: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.themeColor,

      marginLeft:
        SPACING.small,
    },

    // ========================================================
    // VERIFICATION
    // ========================================================

    notice: {
      marginTop:
        SPACING.xl,

      padding:
        SPACING.large,

      borderRadius:
        RADIUS.medium,

      backgroundColor:
        '#F5F7FA',

      borderWidth: 1,

      borderColor:
        COLORS.border,
    },

    noticeTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.small,

      color:
        COLORS.text,

      marginBottom:
        SPACING.xs,
    },

    noticeText: {
      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

      lineHeight:
        FONT_SIZES.small + 7,

      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // BUTTON
    // ========================================================

    button: {
      width:
        '100%',

      height:
        54,

      borderRadius:
        RADIUS.medium,

      marginTop:
        SPACING.xl,

      backgroundColor:
        COLORS.themeColor,
    },

    bottomSpacing: {
      height:
        SPACING.huge,
    },

  });