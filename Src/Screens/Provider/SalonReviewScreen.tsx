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
//
// IMPORTANT:
//
// This matches SalonServiceSelection from
// SalonRegistrationContext.
//
// serviceKey is local only.
// Backend creates the real serviceId.
//
// ============================================================

type ReviewServiceSelection = {
  serviceKey: string;

  businessTypeId?: string;

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
//
// MUST MATCH GRAPHQL
//
// input KycDocumentInput {
//   documentType: KycDocumentType!
//   fileName: String!
//   contentType: String!
//   fileSize: Int
//   s3Key: String!
// }
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
//
// NEW SERVICE MODEL
//
// services:
// [
//   {
//     businessTypeId,
//     categoryId,
//     subcategoryId,
//     name,
//     description,
//     audience,
//     price,
//     duration
//   }
// ]
//
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

    businessHours: Record<
      string,
      {
        isOpen: boolean;
        open?: string;
        close?: string;
      }
    >;

    latitude?: number;
    longitude?: number;

    gstNumber?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    shopEstablishmentNumber?: string;
    udyamNumber?: string;

    bankAccount?: string;
    ifsc?: string;

    services: Array<{
      businessTypeId: string;
      categoryId: string;
      subcategoryId: string;
      name: string;
      description: string;
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
) => {

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


// ============================================================
// UPLOAD ID
//
// Used only for debugging.
// NOT SENT TO GRAPHQL.
// ============================================================

const getKycDocumentUploadId = (
  document: any,
): string => {

  return String(
    document?.uploadId ??
    '',
  ).trim();
};


// ============================================================
// S3 KEY
// ============================================================

const getKycDocumentS3Key = (
  document: any,
): string => {

  return String(
    document?.s3Key ??
    document?.key ??
    '',
  ).trim();
};


// ============================================================
// VALID KYC DOCUMENT
// ============================================================

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
        'network-only',

      notifyOnNetworkStatusChange:
        true,

      onError: error => {

        console.log(
          '[SalonReview] GET_BUSINESS_TYPES error:',
          error,
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

      return ids
        .map(
          id =>
            String(
              id ?? '',
            ).trim(),
        )
        .filter(Boolean);

    }, [
      data.businessTypeIds,
      data.businessTypeId,
    ]);


  // ==========================================================
  // SELECTED BUSINESS TYPE NAMES
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
              ) ||
              businessTypeId,
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

      if (
        selectedBusinessTypes.length ===
        0
      ) {

        return (
          data.businessType ||
          'Not provided'
        );
      }

      return selectedBusinessTypes
        .map(
          item =>
            item.name,
        )
        .join(', ');

    }, [
      selectedBusinessTypes,
      data.businessType,
    ]);


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


  // ==========================================================
  // SERVICE SELECTIONS
  // ==========================================================
  //
  // Context already contains:
  //
  // serviceKey
  // businessTypeId
  // name
  // description
  // audience
  // categoryId
  // categoryName
  // subcategoryId
  // subcategoryName
  // price
  // durationMinutes
  //
  // No catalog lookup is required here.
  //
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

      return data.serviceSelections
        .filter(
          selection =>
            selection &&
            selection.serviceKey &&
            selection.audience &&
            selection.categoryId &&
            selection.subcategoryId,
        )
        .map(
          selection => ({
            serviceKey:
              String(
                selection.serviceKey,
              ).trim(),

            businessTypeId:
              selection.businessTypeId
                ? String(
                  selection.businessTypeId,
                ).trim()
                : undefined,

            name:
              String(
                selection.name ||
                '',
              ).trim(),

            description:
              String(
                selection.description ||
                '',
              ).trim(),

            audience:
              selection.audience,

            categoryId:
              String(
                selection.categoryId,
              ).trim(),

            categoryName:
              String(
                selection.categoryName ||
                '',
              ).trim(),

            subcategoryId:
              String(
                selection.subcategoryId,
              ).trim(),

            subcategoryName:
              String(
                selection.subcategoryName ||
                '',
              ).trim(),

            price:
              selection.price,

            durationMinutes:
              selection.durationMinutes,
          }),
        );

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

    if (!data.userId) {

      Alert.alert(
        'Registration Error',
        'User information is missing. Please restart registration.',
      );

      return;
    }


    // --------------------------------------------------------
    // SALON NAME
    // --------------------------------------------------------

    if (
      !String(
        data.salonName ||
        '',
      ).trim()
    ) {

      Alert.alert(
        'Registration Error',
        'Salon name is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // OWNER NAME
    // --------------------------------------------------------

    if (
      !String(
        data.ownerName ||
        '',
      ).trim()
    ) {

      Alert.alert(
        'Registration Error',
        'Owner name is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    if (
      !String(
        data.email ||
        '',
      ).trim()
    ) {

      Alert.alert(
        'Registration Error',
        'Email address is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // BUSINESS TYPE
    // --------------------------------------------------------

    const normalizedBusinessTypeIds =
      selectedBusinessTypeIds
        .map(
          id =>
            String(
              id,
            ).trim(),
        )
        .filter(Boolean);


    const primaryBusinessTypeId =
      normalizedBusinessTypeIds[0] ||
      String(
        data.businessTypeId ||
        '',
      ).trim();


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
      selectedBusinessTypeLabel.trim();


    if (!businessTypeName) {

      Alert.alert(
        'Business Type Required',
        'Business type information is missing.',
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
            audience,
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

    if (
      !String(
        data.addressLine ||
        '',
      ).trim() ||
      !String(
        data.city ||
        '',
      ).trim() ||
      !String(
        data.state ||
        '',
      ).trim() ||
      !String(
        data.pincode ||
        '',
      ).trim()
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


    // --------------------------------------------------------
    // PAN
    // --------------------------------------------------------

    const cleanPAN =
      String(
        data.panNumber ||
        '',
      )
        .trim()
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


    // --------------------------------------------------------
    // PAN DOCUMENT
    // --------------------------------------------------------

    if (!hasPanDocument) {

      Alert.alert(
        'PAN Document Required',
        'Please upload the PAN document before submitting your salon registration.',
      );

      return;
    }


    // --------------------------------------------------------
    // AADHAAR
    // --------------------------------------------------------

    const cleanAadhaar =
      String(
        data.aadhaarNumber ||
        '',
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


    // --------------------------------------------------------
    // AADHAAR DOCUMENT
    // --------------------------------------------------------

    if (!hasAadhaarDocument) {

      Alert.alert(
        'Aadhaar Document Required',
        'Please upload the Aadhaar document before submitting your salon registration.',
      );

      return;
    }


    // --------------------------------------------------------
    // SHOP & ESTABLISHMENT
    // --------------------------------------------------------

    const cleanShop =
      String(
        data.shopEstablishmentNumber ||
        '',
      ).trim();


    if (!cleanShop) {

      Alert.alert(
        'Salon Registration Required',
        'Please provide your Shop & Establishment registration number.',
      );

      return;
    }


    // --------------------------------------------------------
    // SHOP & ESTABLISHMENT DOCUMENT
    // --------------------------------------------------------

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
    // VALIDATE SERVICES
    // ========================================================

    const invalidService =
      selectedServiceSelections.find(
        selection => {

          const businessTypeId =
            String(
              selection.businessTypeId ||
              '',
            ).trim();

          const serviceName =
            String(
              selection.name ||
              '',
            ).trim();

          const categoryId =
            String(
              selection.categoryId ||
              '',
            ).trim();

          const subcategoryId =
            String(
              selection.subcategoryId ||
              '',
            ).trim();

          const price =
            Number(
              selection.price,
            );

          const duration =
            Number(
              selection.durationMinutes,
            );

          return (
            !selection.serviceKey ||

            !businessTypeId ||

            !serviceName ||

            !selection.audience ||

            !categoryId ||

            !subcategoryId ||

            !Number.isFinite(price) ||

            price <= 0 ||

            !Number.isFinite(duration) ||

            duration <= 0
          );
        },
      );


    if (invalidService) {

      Alert.alert(
        'Invalid Service',
        'Every service must have a business type, service name, audience, category, subcategory, price, and duration.',
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
    // BUILD NEW SERVICE PAYLOAD
    // ========================================================

    const services =
      selectedServiceSelections.map(
        selection => {

          const businessTypeId =
            String(
              selection.businessTypeId ||
              '',
            ).trim();

          const serviceName =
            String(
              selection.name ||
              '',
            ).trim();

          const description =
            String(
              selection.description ||
              '',
            ).trim();

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

            categoryId:
              String(
                selection.categoryId,
              ).trim(),

            subcategoryId:
              String(
                selection.subcategoryId,
              ).trim(),

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
    // DEBUG SERVICES
    // ========================================================

    console.log(
      '[SalonReview] SERVICES PAYLOAD:',
      JSON.stringify(
        services,
        null,
        2,
      ),
    );


    // ========================================================
    // SUBMIT
    // ========================================================

    try {

      console.log(
        '==========================================',
      );

      console.log(
        'SUBMITTING SALON REGISTRATION',
      );

      console.log(
        'BUSINESS TYPE IDS:',
        normalizedBusinessTypeIds,
      );

      console.log(
        'BUSINESS TYPE NAME:',
        businessTypeName,
      );

      console.log(
        'TARGET AUDIENCES:',
        targetAudiences,
      );

      console.log(
        'SERVICES:',
        JSON.stringify(
          services,
          null,
          2,
        ),
      );

      console.log(
        'KYC DOCUMENTS:',
        JSON.stringify(
          kycDocuments,
          null,
          2,
        ),
      );

      console.log(
        '==========================================',
      );


      // ======================================================
      // FINAL REGISTER INPUT
      // ======================================================

      const registerInput = {

        userId:
          currentUser.userId,

        phoneNumber:
          currentUser.phoneNumber ||
          data.phoneNumber ||
          '',

        salonName:
          data.salonName.trim(),

        ownerName:
          data.ownerName.trim(),

        email:
          data.email.trim(),

        businessTypeId:
          primaryBusinessTypeId,

        businessTypeIds:
          normalizedBusinessTypeIds,

        businessType:
          businessTypeName,

        targetAudiences:
          targetAudiences,

        address: {

          addressLine:
            data.addressLine.trim(),

          city:
            data.city.trim(),

          state:
            data.state.trim(),

          pincode:
            data.pincode.trim(),

        },

        businessHours:
          data.businessHours,

        latitude:
          data.latitude,

        longitude:
          data.longitude,

        gstNumber:
          String(
            data.gstNumber ||
            '',
          ).trim(),

        panNumber:
          cleanPAN,

        aadhaarNumber:
          cleanAadhaar,

        shopEstablishmentNumber:
          cleanShop,

        udyamNumber:
          String(
            data.udyamNumber ||
            '',
          ).trim(),

        bankAccount:
          String(
            data.bankAccount ||
            '',
          ).trim(),

        ifsc:
          String(
            data.ifsc ||
            '',
          ).trim(),

        // ====================================================
        // NEW ACTUAL SERVICES
        // ====================================================

        services,

        // ====================================================
        // KYC
        //
        // No uploadId.
        // ====================================================

        kycDocuments,
      };


      console.log(
        '[SalonReview] FINAL REGISTER INPUT:',
        JSON.stringify(
          registerInput,
          null,
          2,
        ),
      );


      // ======================================================
      // REGISTER SALON
      // ======================================================

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
        'REGISTER SALON RESPONSE:',
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
        result?.salonId;


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

        salonId:
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
        'REGISTER SALON ERROR',
      );

      console.error(
        error,
      );

      console.error(
        'MESSAGE:',
        error?.message,
      );

      console.error(
        'GRAPHQL ERRORS:',
        error?.graphQLErrors,
      );

      console.error(
        'NETWORK ERROR:',
        error?.networkError,
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
              data.salonName
            }
          />


          <DetailRow
            label="Owner"
            value={
              data.ownerName
            }
          />


          <DetailRow
            label="Email"
            value={
              data.email
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

            ) : selectedBusinessTypes.length >
              0 ? (

              <View
                style={
                  styles.businessTypeList
                }
              >

                {selectedBusinessTypes.map(
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
                  data.businessType ||
                  'Not provided'
                }
              </Text>

            )}

          </View>


          <DetailRow
            label="Address"
            value={
              `${data.addressLine}, ${data.city}, ${data.state} - ${data.pincode}`
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
                    audience =>
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
              data.gstNumber ||
              'Not provided'
            }
          />


          <DetailRow
            label="Shop & Establishment"
            value={
              data.shopEstablishmentNumber ||
              '-'
            }
          />


          <DetailRow
            label="Udyam"
            value={
              data.udyamNumber ||
              'Not provided'
            }
          />


          <DetailRow
            label="PAN"
            value={
              data.panNumber ||
              '-'
            }
          />


          <DetailRow
            label="Aadhaar"
            value={
              data.aadhaarNumber
                ? `XXXX XXXX ${String(
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

                const services =
                  groupedServices[
                    audience
                  ];


                if (
                  services.length ===
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

                    {/* ==================================================
                        AUDIENCE HEADER
                    ================================================== */}

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


                    {/* ==================================================
                        SERVICES
                    ================================================== */}

                    {services.map(
                      (
                        service,
                      ) => (

                        <View
                          key={
                            service.serviceKey
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
                              styles.serviceInfo
                            }
                          >

                            {/* CATEGORY */}

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


                            {/* SUBCATEGORY */}

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


                            {/* ACTUAL SERVICE NAME */}

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


                            {/* DESCRIPTION */}

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


                            {/* DURATION */}

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


                          {/* PRICE */}

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
          style={[
            styles.button,
            {
              backgroundColor:
                COLORS.themeColor,
            },
            loading &&
            styles.buttonDisabled,
          ]}
          onPress={
            onSubmit
          }
          disabled={
            loading
          }
        >

          {loading ? (

            <View
              style={
                styles.loadingContent
              }
            >

              <ActivityIndicator
                size="small"
                color={
                  COLORS.white
                }
              />


              <Text
                style={
                  styles.buttonText
                }
              >
                Submitting...
              </Text>

            </View>

          ) : (

            <Text
              style={
                styles.buttonText
              }
            >
              Submit Registration
            </Text>

          )}

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

    buttonDisabled: {
      opacity:
        0.7,
    },

    buttonText: {
      color:
        COLORS.white,

      fontFamily:
        FONTS.semiBold,

      fontSize:
        FONT_SIZES.body,

      textAlign:
        'center',
    },

    loadingContent: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 10,
    },

    bottomSpacing: {
      height:
        SPACING.huge,
    },

  });