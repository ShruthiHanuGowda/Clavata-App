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
} from 'react-native';

import {
  useMutation,
} from '@apollo/client';

import {
  Header,
  DButton,
} from '../../components';

import {
  REGISTER_SALON_PARTNER,
} from '../../graphql/queries';

import {
  useSalonRegistration,
} from '../../context/SalonRegistrationContext';

import {
  useUser,
  User,
  ProviderStatus,
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


// ============================================================
// REVIEW SERVICE
// ============================================================
//
// Service hierarchy:
//
// Audience
//   → Category
//      → Subcategory
//         → Service
//
// Business type is intentionally NOT part of the service model.
//
// Multiple services are allowed under the same:
//
// Audience + Category + Subcategory
//
// Example:
//
// FEMALE → Hair → Hair Cut → Layer Haircut
// FEMALE → Hair → Hair Cut → Bob Haircut
// FEMALE → Hair → Hair Cut → Step Haircut
//
// ============================================================

type ReviewServiceSelection = {
  uniqueId?: string;

  serviceKey: string;

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
// GRAPHQL KYC DOCUMENT INPUT
// ============================================================

type KycDocumentInput = {
  documentType: KycDocumentType;

  fileName: string;

  contentType: string;

  fileSize?: number;

  s3Key: string;
};


// ============================================================
// GRAPHQL REGISTER RESPONSE
// ============================================================

type RegisterSalonPartnerResponse = {
  registerSalonPartner: {
    success: boolean;

    message: string;

    salonId: string;
  };
};


// ============================================================
// BUSINESS HOURS
// ============================================================

type BusinessHour = {
  open: string;

  close: string;

  isOpen: boolean;
};


// ============================================================
// GRAPHQL REGISTER VARIABLES
// ============================================================
//
// IMPORTANT:
//
// This must match the current GraphQL schema:
//
// RegisterSalonPartnerInput
//
// There is NO:
//
// businessTypeId
// businessTypeIds
// businessType
// bankAccount
// ifsc
// services
//
// Service field is:
//
// serviceSelections
//
// And each selection contains:
//
// categoryId
// categoryName
// subcategoryId
// subcategoryName
// serviceName
// audience
// price
// duration
//
// ============================================================

type RegisterSalonPartnerVariables = {
  input: {
    userId: string;

    phoneNumber: string;

    salonName: string;

    ownerName: string;

    email: string;

    targetAudiences: Audience[];

    address: {
      addressLine: string;

      city: string;

      state: string;

      pincode: string;
    };

    businessHours: {
      MONDAY: BusinessHour;

      TUESDAY: BusinessHour;

      WEDNESDAY: BusinessHour;

      THURSDAY: BusinessHour;

      FRIDAY: BusinessHour;

      SATURDAY: BusinessHour;

      SUNDAY: BusinessHour;
    };

    latitude?: number;

    longitude?: number;

    gstNumber?: string;

    panNumber?: string;

    aadhaarNumber?: string;

    shopEstablishmentNumber?: string;

    udyamNumber?: string;

    serviceSelections: Array<{
      categoryId: string;

      categoryName: string;

      subcategoryId: string;

      subcategoryName: string;

      serviceName: string;

      audience: Audience;

      price: number;

      duration: number;
    }>;

    kycDocuments: KycDocumentInput[];
  };
};


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


const getKycDocumentFileSize = (
  document: any,
): number | undefined => {

  if (
    document?.size === undefined ||
    document?.size === null ||
    document?.size === ''
  ) {

    return undefined;
  }

  const size =
    Number(
      document.size,
    );

  return Number.isFinite(size) &&
    size > 0
    ? size
    : undefined;
};


const hasValidKycDocument = (
  document: any,
): boolean => {

  return Boolean(
    document &&
    getKycDocumentName(document) &&
    getKycDocumentContentType(document) &&
    getKycDocumentS3Key(document),
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
// NORMALIZE AUDIENCE
// ============================================================

const isValidAudience = (
  value: any,
): value is Audience => {

  return (
    value === 'FEMALE' ||
    value === 'MALE' ||
    value === 'KIDS'
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
        (
          selection: any,
          index: number,
        ) => {

          if (
            !selection ||
            !isValidAudience(
              selection.audience,
            )
          ) {

            return;
          }


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


          /*
           * The registration context currently stores
           * the service name as `name`.
           *
           * We keep that local structure unchanged.
           *
           * It will be converted to `serviceName`
           * only when building the GraphQL payload.
           */
          const serviceName =
            cleanString(
              selection.name ??
              selection.serviceName,
            );


          if (
            !categoryId ||
            !categoryName ||
            !subcategoryId ||
            !subcategoryName ||
            !serviceName
          ) {

            console.warn(
              '[SalonReview] Ignoring incomplete service selection:',
              selection,
            );

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
           * The service name remains part of the fallback
           * identity so multiple services under the same
           * category/subcategory remain separate.
           */
          const effectiveServiceKey =
            uniqueId ||
            originalServiceKey ||
            [
              selection.audience,
              categoryId,
              subcategoryId,
              serviceName,
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

            serviceKey:
              originalServiceKey ||
              effectiveServiceKey,

            name:
              serviceName,

            description:
              cleanString(
                selection.description,
              ),

            audience:
              selection.audience,

            categoryId,

            categoryName,

            subcategoryId,

            subcategoryName,

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
            isValidAudience(
              selection.audience,
            )
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


      const panFileSize =
        getKycDocumentFileSize(
          panDocument,
        );


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

        ...(panFileSize !== undefined
          ? {
            fileSize:
              panFileSize,
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


      const aadhaarFileSize =
        getKycDocumentFileSize(
          aadhaarDocument,
        );


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

        ...(aadhaarFileSize !== undefined
          ? {
            fileSize:
              aadhaarFileSize,
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


      const shopFileSize =
        getKycDocumentFileSize(
          shopEstablishmentDocument,
        );


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

        ...(shopFileSize !== undefined
          ? {
            fileSize:
              shopFileSize,
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


        const gstFileSize =
          getKycDocumentFileSize(
            gstDocument,
          );


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

          ...(gstFileSize !== undefined
            ? {
              fileSize:
                gstFileSize,
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


        const udyamFileSize =
          getKycDocumentFileSize(
            udyamDocument,
          );


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

          ...(udyamFileSize !== undefined
            ? {
              fileSize:
                udyamFileSize,
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
      !cleanString(
        data.userId,
      )
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
    // TARGET AUDIENCES
    // --------------------------------------------------------

    const targetAudiences =
      Array.isArray(
        data.targetAudiences,
      )
        ? data.targetAudiences.filter(
          (
            audience: any,
          ): audience is Audience =>
            isValidAudience(
              audience,
            ),
        )
        : [];


    if (
      targetAudiences.length === 0
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
      {} as RegisterSalonPartnerVariables[
        'input'
      ]['businessHours'];


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


      const open =
        cleanString(
          sourceDay.open,
        );

      const close =
        cleanString(
          sourceDay.close,
        );


      normalizedBusinessHours[day] = {

        isOpen:
          Boolean(
            sourceDay.isOpen,
          ),

        open,

        close,
      };


      if (
        sourceDay.isOpen &&
        (
          !open ||
          !close
        )
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
      ).toUpperCase();


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
      ).replace(
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
      selectedServiceSelections.length === 0
    ) {

      Alert.alert(
        'Services Required',
        'Please add at least one service.',
      );

      return;
    }


    // ========================================================
    // BUILD SERVICE SELECTIONS
    // ========================================================
    //
    // LOCAL MODEL:
    //
    // name
    // durationMinutes
    //
    // GRAPHQL MODEL:
    //
    // serviceName
    // duration
    //
    // description is intentionally NOT sent.
    //
    // ========================================================

    const serviceSelections =
      selectedServiceSelections.map(
        selection => {

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

          const price =
            Number(
              selection.price,
            );

          const duration =
            Number(
              selection.durationMinutes,
            );


          return {

            categoryId,

            categoryName,

            subcategoryId,

            subcategoryName,

            serviceName,

            audience:
              selection.audience,

            price,

            duration,
          };
        },
      );


    // ========================================================
    // VALIDATE FINAL SERVICE SELECTIONS
    // ========================================================

    const invalidServiceIndex =
      serviceSelections.findIndex(
        service => {

          return (

            !service.categoryId ||

            !service.categoryName ||

            !service.subcategoryId ||

            !service.subcategoryName ||

            !service.serviceName ||

            !isValidAudience(
              service.audience,
            ) ||

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


    if (
      invalidServiceIndex >= 0
    ) {

      const invalidService =
        serviceSelections[
          invalidServiceIndex
        ];


      console.error(
        '====================================================',
      );

      console.error(
        '[SalonReview] INVALID SERVICE PAYLOAD',
      );

      console.error(
        '[SalonReview] INVALID SERVICE INDEX:',
        invalidServiceIndex,
      );

      console.error(
        '[SalonReview] INVALID SERVICE:',
        JSON.stringify(
          invalidService,
          null,
          2,
        ),
      );

      console.error(
        '[SalonReview] RAW SERVICE SELECTIONS:',
        JSON.stringify(
          data.serviceSelections,
          null,
          2,
        ),
      );

      console.error(
        '====================================================',
      );


      Alert.alert(
        'Invalid Service',
        `Service ${invalidServiceIndex + 1} is missing required category, subcategory, service, price, or duration information.`,
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
    // REQUIRED KYC DOCUMENT TYPES
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
      missingRequiredKycDocuments.length > 0
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
    // OPTIONAL FIELDS
    // ========================================================

    const gstNumber =
      cleanString(
        data.gstNumber,
      ).toUpperCase();

    const udyamNumber =
      cleanString(
        data.udyamNumber,
      ).toUpperCase();


    // ========================================================
    // FINAL REGISTER INPUT
    // ========================================================
    //
    // IMPORTANT:
    //
    // Do NOT add:
    //
    // bankAccount
    // ifsc
    // services
    //
    // They are not part of RegisterSalonPartnerInput.
    //
    // ========================================================

    const registerInput:
      RegisterSalonPartnerVariables[
        'input'
      ] = {

      userId:
        currentUser.userId,

      phoneNumber,

      salonName,

      ownerName,

      email,

      targetAudiences,

      address: {

        addressLine,

        city,

        state,

        pincode,
      },

      businessHours:
        normalizedBusinessHours,

      ...(typeof data.latitude === 'number'
        ? {
          latitude:
            data.latitude,
        }
        : {}),

      ...(typeof data.longitude === 'number'
        ? {
          longitude:
            data.longitude,
        }
        : {}),

      ...(gstNumber
        ? {
          gstNumber,
        }
        : {}),

      panNumber:
        cleanPAN,

      aadhaarNumber:
        cleanAadhaar,

      shopEstablishmentNumber:
        cleanShop,

      ...(udyamNumber
        ? {
          udyamNumber,
        }
        : {}),

      kycDocuments,

      serviceSelections,
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
      '[SalonReview] TARGET AUDIENCES:',
      targetAudiences,
    );

    console.log(
      '[SalonReview] SERVICE SELECTIONS COUNT:',
      serviceSelections.length,
    );

    console.log(
      '[SalonReview] SERVICE SELECTIONS PAYLOAD:',
      JSON.stringify(
        serviceSelections,
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


      const result =
        response.data
          ?.registerSalonPartner;


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


      const salonId =
        cleanString(
          result.salonId,
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

      const updatedUser:
        User = {

        ...currentUser,

        role:
          'PROVIDER',

        providerStatus:
          'PENDING' as ProviderStatus,

        salonId,
      };


      setCurrentUser(
        updatedUser,
      );


      // ======================================================
      // RESET REGISTRATION
      // ======================================================

      reset();


      // ======================================================
      // SUCCESS
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

        {/* HEADER */}

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


        {/* BASIC DETAILS */}

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
                  .filter(
                    (
                      audience: any,
                    ): audience is Audience =>
                      isValidAudience(
                        audience,
                      ),
                  )
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


        {/* KYC DOCUMENTS */}

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


        {/* SERVICES */}

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
            Your services are organized by customer type, category and subcategory.
          </Text>


          {selectedServiceSelections.length === 0 ? (

            <Text
              style={
                styles.emptyText
              }
            >
              No services selected.
            </Text>

          ) : (

            (
              [
                'FEMALE',
                'MALE',
                'KIDS',
              ] as Audience[]
            ).map(
              audience => {

                const audienceServices =
                  groupedServices[
                    audience
                  ];


                if (
                  audienceServices.length === 0
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
                          key={
                            `${service.serviceKey}-${index}`
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


                            {service.durationMinutes !== undefined &&
                              service.durationMinutes !== null ? (

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


                          {service.price !== undefined &&
                            service.price !== null ? (

                            <Text
                              style={
                                styles.servicePrice
                              }
                            >
                              ₹
                              {
                                Number(
                                  service.price,
                                ).toFixed(0)
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


        {/* VERIFICATION */}

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


        {/* SUBMIT */}

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
          {required ? ' *' : ''}
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

      borderWidth:
        1,

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
      borderBottomWidth:
        1,

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

    sectionCard: {
      marginTop:
        SPACING.xl,

      backgroundColor:
        COLORS.surface,

      borderWidth:
        1,

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
      width:
        7,

      height:
        7,

      borderRadius:
        4,

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

    notice: {
      marginTop:
        SPACING.xl,

      padding:
        SPACING.large,

      borderRadius:
        RADIUS.medium,

      backgroundColor:
        '#F5F7FA',

      borderWidth:
        1,

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
