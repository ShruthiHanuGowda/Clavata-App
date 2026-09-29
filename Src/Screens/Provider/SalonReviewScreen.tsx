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
  GET_CLAVATA_CATEGORIES,
  GET_CLAVATA_SUBCATEGORIES,
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

type ReviewServiceSelection = {
  audience: Audience;
  categoryId: string;
  categoryName?: string;
  subcategoryId: string;
  subcategoryName?: string;
  price?: number;
  durationMinutes?: number;
};

type RegisterSalonPartnerResponse = {
  registerSalonPartner: {
    success: boolean;
    message: string;
    salonId: string;
  };
};

type KycDocumentInput = {
  uploadId: string;
  documentType: KycDocumentType;
  fileName: string;
  contentType: string;
  fileSize?: number;
  s3Key: string;
};

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

    serviceSelections: Array<{
      audience: Audience;
      categoryId: string;
      subcategoryId: string;
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
    getKycDocumentUploadId(
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
          (data as any)?.businessTypeIds,
        )
          ? (data as any).businessTypeIds

          : (data as any)?.businessTypeId
            ? [
              (data as any)
                .businessTypeId,
            ]

            : [];

      return ids
        .map(
          (id: any) =>
            String(
              id ?? '',
            ).trim(),
        )
        .filter(Boolean);

    }, [
      (data as any)?.businessTypeIds,
      (data as any)?.businessTypeId,
    ]);


  // ==========================================================
  // SELECTED BUSINESS TYPE NAMES
  // ==========================================================

  const selectedBusinessTypes =
    useMemo(() => {

      return selectedBusinessTypeIds.map(
        (businessTypeId: string) => {

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
          (
            item: {
              name: string;
            },
          ) =>
            item.name,
        )
        .join(', ');

    }, [
      selectedBusinessTypes,
      data.businessType,
    ]);


  // ==========================================================
  // DEBUG
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
  // GET CATEGORIES
  // ==========================================================

  const {
    data: categoryResponse,
    loading:
    categoriesLoading,
  } = useQuery(
    GET_CLAVATA_CATEGORIES,
    {
      fetchPolicy:
        'network-only',
    },
  );


  // ==========================================================
  // GET SUBCATEGORIES
  // ==========================================================

  const {
    data: subcategoryResponse,
    loading:
    subcategoriesLoading,
  } = useQuery(
    GET_CLAVATA_SUBCATEGORIES,
    {
      fetchPolicy:
        'network-only',
    },
  );


  const categories: Category[] =
    categoryResponse
      ?.categories
      ?.categories ??
    [];


  const subcategories: Subcategory[] =
    subcategoryResponse
      ?.subcategories
      ?.subcategories ??
    [];


  // ==========================================================
  // RESOLVE CATEGORY NAME
  // ==========================================================

  const getCategoryName = (
    categoryId: string,
  ) => {

    const category =
      categories.find(
        item =>
          String(
            item.categoryId,
          ).trim() ===
          String(
            categoryId,
          ).trim(),
      );

    return (
      category?.name ||
      ''
    );
  };


  // ==========================================================
  // RESOLVE SUBCATEGORY NAME
  // ==========================================================

  const getSubcategoryName = (
    subcategoryId: string,
  ) => {

    const subcategory =
      subcategories.find(
        item =>
          String(
            item.subcategoryId,
          ).trim() ===
          String(
            subcategoryId,
          ).trim(),
      );

    return (
      subcategory?.name ||
      ''
    );
  };


  // ==========================================================
  // SERVICE SELECTIONS
  // ==========================================================

  const selectedServiceSelections:
    ReviewServiceSelection[] =
    useMemo(() => {

      if (
        !Array.isArray(
          data?.serviceSelections,
        )
      ) {

        return [];
      }

      return data
        .serviceSelections
        .filter(
          (
            selection: any,
          ) =>
            selection &&
            selection.audience &&
            selection.categoryId &&
            selection.subcategoryId,
        )
        .map(
          (
            selection: any,
          ) => {

            const categoryName =
              selection.categoryName ||
              getCategoryName(
                selection.categoryId,
              );

            const subcategoryName =
              selection.subcategoryName ||
              getSubcategoryName(
                selection.subcategoryId,
              );

            return {

              audience:
                selection.audience,

              categoryId:
                selection.categoryId,

              categoryName,

              subcategoryId:
                selection.subcategoryId,

              subcategoryName,

              price:
                selection.price,

              durationMinutes:
                selection.durationMinutes ??
                selection.duration,
            };
          },
        );

    }, [
      data?.serviceSelections,
      categories,
      subcategories,
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
    (data as any)?.panDocument;

  const aadhaarDocument =
    (data as any)?.aadhaarDocument;

  const shopEstablishmentDocument =
    (data as any)?.shopEstablishmentDocument;

  const gstDocument =
    (data as any)?.gstDocument;

  const udyamDocument =
    (data as any)?.udyamDocument;


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

  const buildKycDocumentPayload = (): KycDocumentInput[] => {

    const documents: KycDocumentInput[] = [];


    // --------------------------------------------------------
    // PAN
    // --------------------------------------------------------

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
      uploadId:
        getKycDocumentUploadId(
          panDocument,
        ),

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


    // --------------------------------------------------------
    // AADHAAR
    // --------------------------------------------------------

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
      uploadId:
        getKycDocumentUploadId(
          aadhaarDocument,
        ),

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


    // --------------------------------------------------------
    // SHOP & ESTABLISHMENT
    // REQUIRED
    // --------------------------------------------------------

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
      uploadId:
        getKycDocumentUploadId(
          shopEstablishmentDocument,
        ),

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


    // --------------------------------------------------------
    // GST
    // OPTIONAL
    // --------------------------------------------------------

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
        uploadId:
          getKycDocumentUploadId(
            gstDocument,
          ),

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


    // --------------------------------------------------------
    // UDYAM
    // OPTIONAL
    // --------------------------------------------------------

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
        uploadId:
          getKycDocumentUploadId(
            udyamDocument,
          ),

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

    if (!data.salonName) {

      Alert.alert(
        'Registration Error',
        'Salon name is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // OWNER NAME
    // --------------------------------------------------------

    if (!data.ownerName) {

      Alert.alert(
        'Registration Error',
        'Owner name is missing.',
      );

      return;
    }


    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    if (!data.email) {

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
          (id: any) =>
            String(
              id,
            ).trim(),
        )
        .filter(Boolean);


    const primaryBusinessTypeId =
      normalizedBusinessTypeIds[0] ||
      String(
        (data as any)
          ?.businessTypeId ??
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
      selectedBusinessTypeLabel
        .trim();


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

    if (
      !data.addressLine ||
      !data.city ||
      !data.state ||
      !data.pincode
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
    // REQUIRED
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
    // REQUIRED
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


    // --------------------------------------------------------
    // SERVICES
    // --------------------------------------------------------

    if (
      selectedServiceSelections.length ===
      0
    ) {

      Alert.alert(
        'Services Required',
        'Please select at least one service category and subcategory.',
      );

      return;
    }


    // --------------------------------------------------------
    // VALIDATE SERVICES
    // --------------------------------------------------------

    const invalidService =
      selectedServiceSelections.find(
        selection =>
          !selection.audience ||
          !selection.categoryId ||
          !selection.subcategoryId ||
          !selection.price ||
          Number(
            selection.price,
          ) <= 0 ||
          !selection.durationMinutes ||
          Number(
            selection.durationMinutes,
          ) <= 0,
      );


    if (invalidService) {

      Alert.alert(
        'Invalid Service',
        'Every selected service must have an audience, category, subcategory, price, and duration.',
      );

      return;
    }


    // --------------------------------------------------------
    // BUILD KYC DOCUMENTS
    // --------------------------------------------------------

    let kycDocuments: KycDocumentInput[] = [];

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


    // --------------------------------------------------------
    // VALIDATE REQUIRED KYC DOCUMENT COUNT
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // DEBUG KYC
    // --------------------------------------------------------

    console.log(
      '[SalonReview] KYC UPLOAD ID:',
      (data as any)?.kycUploadId,
    );

    console.log(
      '[SalonReview] KYC DOCUMENTS:',
      JSON.stringify(
        kycDocuments,
        null,
        2,
      ),
    );


    // --------------------------------------------------------
    // SUBMIT
    // --------------------------------------------------------

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
        'PAN DOCUMENT:',
        panDocument,
      );

      console.log(
        'AADHAAR DOCUMENT:',
        aadhaarDocument,
      );

      console.log(
        'SHOP & ESTABLISHMENT DOCUMENT:',
        shopEstablishmentDocument,
      );

      console.log(
        'GST DOCUMENT:',
        gstDocument,
      );

      console.log(
        'UDYAM DOCUMENT:',
        udyamDocument,
      );

      console.log(
        'KYC DOCUMENTS PAYLOAD:',
        JSON.stringify(
          kycDocuments,
          null,
          2,
        ),
      );

      console.log(
        'SERVICES:',
        JSON.stringify(
          selectedServiceSelections,
          null,
          2,
        ),
      );

      console.log(
        '==========================================',
      );


      // ------------------------------------------------------
      // SERVICE PAYLOAD
      // ------------------------------------------------------

      const serviceSelections =
        selectedServiceSelections.map(
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
        );


      // ------------------------------------------------------
      // REGISTER SALON
      // ------------------------------------------------------

      const response =
        await registerSalonPartner({

          variables: {

            input: {

              userId:
                currentUser.userId,

              phoneNumber:
                currentUser.phoneNumber ||
                data.phoneNumber ||
                '',

              salonName:
                data.salonName,

              ownerName:
                data.ownerName,

              email:
                data.email,

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

              latitude:
                data.latitude,

              longitude:
                data.longitude,

              gstNumber:
                data.gstNumber ||
                '',

              panNumber:
                cleanPAN,

              aadhaarNumber:
                cleanAadhaar,

              shopEstablishmentNumber:
                cleanShop,

              udyamNumber:
                data.udyamNumber ||
                '',

              bankAccount:
                data.bankAccount ||
                '',

              ifsc:
                data.ifsc ||
                '',

              serviceSelections:
                serviceSelections,

              // ==================================================
              // KYC DOCUMENTS
              // ==================================================

              kycDocuments:
                kycDocuments,

            },

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


      const result =
        response.data
          ?.registerSalonPartner;


      // --------------------------------------------------------
      // BACKEND FAILURE
      // --------------------------------------------------------

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


      // --------------------------------------------------------
      // SALON ID
      // --------------------------------------------------------

      const salonId =
        result?.salonId;


      if (!salonId) {

        Alert.alert(
          'Registration Error',
          'Salon was created, but the business ID was not returned by the server.',
        );

        return;
      }


      // --------------------------------------------------------
      // UPDATE USER
      // --------------------------------------------------------

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


      // --------------------------------------------------------
      // RESET
      // --------------------------------------------------------

      reset();


      // --------------------------------------------------------
      // NAVIGATE
      // --------------------------------------------------------

      navigation.navigate(
        'BecomePartner',
        {
          screen:
            'SalonPendingVerification',
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
                  (
                    businessType: {
                      businessTypeId: string;
                      name: string;
                    },
                  ) => (

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
          />


          <DetailRow
            label="Bank account"
            value={
              data.bankAccount
                ? `XXXXXX${String(
                  data.bankAccount,
                ).slice(-4)}`
                : '-'
            }
          />


          <DetailRow
            label="IFSC"
            value={
              data.ifsc ||
              '-'
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


          {/* ==================================================
              PAN
          ================================================== */}

          <KycDocumentRow
            title="PAN document"
            document={panDocument}
            uploaded={hasPanDocument}
            required
          />


          {/* ==================================================
              AADHAAR
          ================================================== */}

          <KycDocumentRow
            title="Aadhaar document"
            document={aadhaarDocument}
            uploaded={hasAadhaarDocument}
            required
          />


          {/* ==================================================
              SHOP & ESTABLISHMENT
          ================================================== */}

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


          {/* ==================================================
              GST
          ================================================== */}

          <KycDocumentRow
            title="GST document"
            document={
              gstDocument
            }
            uploaded={
              hasGstDocument
            }
            required={false}
            last={
              !udyamDocument
            }
          />


          {/* ==================================================
              UDYAM
          ================================================== */}

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
            These are the Clavata services selected for your business.
          </Text>


          {categoriesLoading ||
            subcategoriesLoading ? (

            <View
              style={
                styles.servicesLoading
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
                  styles.loadingText
                }
              >
                Loading service details...
              </Text>

            </View>

          ) : selectedServiceSelections.length ===
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


                    {services.map(
                      (
                        service,
                        index,
                      ) => (

                        <View
                          key={`${audience}-${service.categoryId}-${service.subcategoryId}-${index}`}
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
                                styles.serviceName
                              }
                            >
                              {
                                service.subcategoryName ||
                                service.subcategoryId
                              }
                            </Text>

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

    servicesLoading: {
      flexDirection:
        'row',

      alignItems:
        'center',

      paddingVertical:
        SPACING.medium,
    },

    loadingText: {
      marginLeft:
        SPACING.small,

      fontFamily:
        FONTS.regular,

      fontSize:
        FONT_SIZES.small,

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
        SPACING.small,

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

    serviceName: {
      marginTop:
        2,

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