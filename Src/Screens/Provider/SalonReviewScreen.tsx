
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { useMutation } from '@apollo/client';

import { Header } from '../../components';

import {
  REGISTER_SALON_PARTNER,
  GENERATE_SALON_MEDIA_UPLOAD_URL,
  CREATE_SALON_MEDIA,
} from '../../graphql/queries';

import {
  useSalonRegistration,
  type SalonProfilePhoto,
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
  GRADIENTS,
} from '../../constants/constants';

import AppGradient from '../../common/AppGradient';

// ============================================================
// TYPES
// ============================================================

type Audience = 'FEMALE' | 'MALE' | 'KIDS';

type KycDocumentType =
  | 'PAN'
  | 'AADHAAR'
  | 'SHOP_ESTABLISHMENT'
  | 'GST'
  | 'UDYAM';

type GraphQLMediaType = 'LOGO' | 'COVER' | 'GALLERY';

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

type KycDocumentInput = {
  documentType: KycDocumentType;
  fileName: string;
  contentType: string;
  fileSize?: number;
  s3Key: string;
};

type BusinessHour = {
  open: string;
  close: string;
  isOpen: boolean;
};

type RegisterSalonPartnerResponse = {
  registerSalonPartner: {
    success: boolean;
    message: string;
    salonId: string;
  };
};

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
    kycDocuments: KycDocumentInput[];
    services: Array<{
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
  };
};

type UploadedSalonMedia = {
  imageId: string;
  objectUrl: string;
  key: string;
  mediaType: GraphQLMediaType;
};

// ============================================================
// HELPERS
// ============================================================

const MAX_PROFILE_PHOTO_BYTES = 10 * 1024 * 1024;

const cleanString = (value: unknown): string =>
  String(value ?? '').trim();

const isValidAudience = (value: unknown): value is Audience =>
  value === 'FEMALE' ||
  value === 'MALE' ||
  value === 'KIDS';

const getAudienceLabel = (audience: Audience): string => {
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

const maskPan = (value: unknown): string => {
  const pan = cleanString(value).toUpperCase();

  if (!pan) {
    return '-';
  }

  if (pan.length <= 4) {
    return 'XXXXXXX' + pan;
  }

  return `XXXXX${pan.slice(-4)}`;
};

const getKycDocumentName = (document: any): string =>
  cleanString(document?.name ?? document?.fileName);

const getKycDocumentContentType = (document: any): string =>
  cleanString(document?.type ?? document?.contentType);

const getKycDocumentS3Key = (document: any): string =>
  cleanString(document?.s3Key ?? document?.key);

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

  const size = Number(document.size);

  return Number.isFinite(size) && size > 0
    ? size
    : undefined;
};

const hasValidKycDocument = (document: any): boolean =>
  Boolean(
    document &&
      getKycDocumentName(document) &&
      getKycDocumentContentType(document) &&
      getKycDocumentS3Key(document),
  );

const getPhotoContentType = (
  photo: SalonProfilePhoto,
): string => {
  const declaredType = cleanString(photo.type).toLowerCase();

  if (
    declaredType === 'image/jpeg' ||
    declaredType === 'image/jpg' ||
    declaredType === 'image/png' ||
    declaredType === 'image/webp'
  ) {
    return declaredType === 'image/jpg'
      ? 'image/jpeg'
      : declaredType;
  }

  const filename = cleanString(photo.name).toLowerCase();
  const uri = cleanString(
    photo.localUri || photo.uri,
  ).toLowerCase();

  if (filename.endsWith('.png') || uri.endsWith('.png')) {
    return 'image/png';
  }

  if (
    filename.endsWith('.webp') ||
    uri.endsWith('.webp')
  ) {
    return 'image/webp';
  }

  if (
    filename.endsWith('.jpg') ||
    filename.endsWith('.jpeg') ||
    uri.endsWith('.jpg') ||
    uri.endsWith('.jpeg')
  ) {
    return 'image/jpeg';
  }

  throw new Error(
    'The salon photo must be a JPG, PNG or WebP image. Please select it again.',
  );
};

const getPhotoLocalUri = (
  photo: SalonProfilePhoto,
): string =>
  cleanString(photo.localUri || photo.uri);

// ============================================================
// SCREEN
// ============================================================

export default function SalonReviewScreen({
  navigation,
}: any) {
  const {
    data,
    reset,
    saveDraft,
    updateData,
  } = useSalonRegistration();

  const { currentUser, setCurrentUser } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const draftTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestDraftRef = useRef(data);
  const saveDraftRef = useRef(saveDraft);

  const registrationSucceededRef = useRef(false);
  const submittingRef = useRef(false);

  latestDraftRef.current = data;
  saveDraftRef.current = saveDraft;

  // ==========================================================
  // DRAFT AUTOSAVE
  // ==========================================================

  const persistReviewDraft = useCallback(async () => {
    if (registrationSucceededRef.current) {
      return true;
    }

    try {
      const saved = await saveDraftRef.current(
        6,
        [1, 2, 3, 4, 5],
        latestDraftRef.current,
      );

      if (!saved) {
        console.warn(
          '[SalonReview] Draft save returned false.',
        );
      }

      return Boolean(saved);
    } catch (error: any) {
      console.warn(
        '[SalonReview] Draft save failed:',
        error?.message || 'Unknown error',
      );

      return false;
    }
  }, []);

  useEffect(() => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }

    draftTimerRef.current = setTimeout(() => {
      draftTimerRef.current = null;

      if (!registrationSucceededRef.current) {
        void persistReviewDraft();
      }
    }, 900);

    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
        draftTimerRef.current = null;
      }
    };
  }, [data, persistReviewDraft]);

  useEffect(() => {
    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
        draftTimerRef.current = null;
      }

      if (!registrationSucceededRef.current) {
        void persistReviewDraft();
      }
    };
  }, [persistReviewDraft]);

  // ==========================================================
  // GRAPHQL MUTATIONS
  // ==========================================================

  const [
    registerSalonPartner,
    { loading: registrationLoading },
  ] = useMutation<
    RegisterSalonPartnerResponse,
    RegisterSalonPartnerVariables
  >(REGISTER_SALON_PARTNER);

  const [generateSalonMediaUploadUrl] = useMutation(
    GENERATE_SALON_MEDIA_UPLOAD_URL,
  );

  const [createSalonMedia] = useMutation(
    CREATE_SALON_MEDIA,
  );

  // ==========================================================
  // UPLOAD SALON PROFILE PHOTO TO S3
  // ==========================================================

  const uploadSalonProfilePhoto = useCallback(
    async (
      photo: SalonProfilePhoto,
      salonId: string,
    ): Promise<UploadedSalonMedia> => {
      if (!salonId) {
        throw new Error(
          'Salon ID is required before uploading the profile photo.',
        );
      }

      if (
        photo.imageId &&
        photo.objectUrl &&
        photo.key &&
        photo.salonId === salonId &&
        photo.mediaType === 'LOGO'
      ) {
        return {
          imageId: photo.imageId,
          objectUrl: photo.objectUrl,
          key: photo.key,
          mediaType: 'LOGO',
        };
      }

      const localUri = getPhotoLocalUri(photo);

      if (!localUri) {
        throw new Error(
          'The selected salon photo is no longer available on this device. Please select the photo again.',
        );
      }

      const contentType = getPhotoContentType(photo);
      const fileSize = Number(photo.size);

      if (
        Number.isFinite(fileSize) &&
        fileSize > MAX_PROFILE_PHOTO_BYTES
      ) {
        throw new Error(
          'Salon profile photo cannot exceed 10 MB.',
        );
      }

      const uploadUrlResult =
        await generateSalonMediaUploadUrl({
          variables: {
            input: {
              salonId,
              mediaType: 'LOGO',
              contentType,
              ...(Number.isFinite(fileSize) && fileSize > 0
                ? { fileSize }
                : {}),
            },
          },
        });

      const uploadInfo =
        uploadUrlResult.data?.generateSalonMediaUploadUrl;

      if (!uploadInfo?.success) {
        throw new Error(
          uploadInfo?.message ||
            'Unable to generate the salon photo upload URL.',
        );
      }

      const uploadUrl = cleanString(uploadInfo.uploadUrl);
      const objectUrl = cleanString(uploadInfo.objectUrl);
      const key = cleanString(uploadInfo.key);
      const imageId = cleanString(uploadInfo.imageId);

      if (!uploadUrl || !objectUrl || !key || !imageId) {
        throw new Error(
          'The server did not return all required photo upload details.',
        );
      }

      const localResponse = await fetch(localUri);

      if (!localResponse.ok) {
        throw new Error(
          'Unable to read the selected salon photo from this device.',
        );
      }

      const blob = await localResponse.blob();

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });

      if (!s3Response.ok) {
        throw new Error(
          `Salon photo upload failed (${s3Response.status}).`,
        );
      }

      return {
        imageId,
        objectUrl,
        key,
        mediaType: 'LOGO',
      };
    },
    [generateSalonMediaUploadUrl],
  );

  // ==========================================================
  // CREATE SALON MEDIA RECORD
  // ==========================================================

  const createSalonProfileMediaRecord = useCallback(
    async (
      uploaded: UploadedSalonMedia,
      salonId: string,
    ) => {
      const result = await createSalonMedia({
        variables: {
          input: {
            salonId,
            imageId: uploaded.imageId,
            mediaType: uploaded.mediaType,
            key: uploaded.key,
            objectUrl: uploaded.objectUrl,
          },
        },
      });

      const response = result.data?.createSalonMedia;

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'The photo was uploaded, but the salon media record could not be created.',
        );
      }

      if (!response.media) {
        throw new Error(
          'The salon media record was not returned by the server.',
        );
      }

      return response.media;
    },
    [createSalonMedia],
  );

  // ==========================================================
  // NORMALIZE SELECTED SERVICES
  // ==========================================================

  const selectedServiceSelections:
    ReviewServiceSelection[] = useMemo(() => {
      if (!Array.isArray(data.serviceSelections)) {
        return [];
      }

      const seenKeys = new Set<string>();
      const result: ReviewServiceSelection[] = [];

      data.serviceSelections.forEach((selection: any) => {
        if (
          !selection ||
          !isValidAudience(selection.audience)
        ) {
          return;
        }

        const categoryId = cleanString(selection.categoryId);
        const categoryName = cleanString(
          selection.categoryName,
        );
        const subcategoryId = cleanString(
          selection.subcategoryId,
        );
        const subcategoryName = cleanString(
          selection.subcategoryName,
        );
        const serviceName = cleanString(
          selection.name ?? selection.serviceName,
        );

        if (
          !categoryId ||
          !categoryName ||
          !subcategoryId ||
          !subcategoryName ||
          !serviceName
        ) {
          return;
        }

        // Deduplicate by the actual service identity, not an
        // array index or a potentially unstable generated key.
        const semanticKey = [
          selection.audience,
          categoryId,
          subcategoryId,
          serviceName.toLowerCase(),
        ].join('::');

        if (seenKeys.has(semanticKey)) {
          return;
        }

        seenKeys.add(semanticKey);

        const uniqueId = cleanString(selection.uniqueId);
        const originalServiceKey = cleanString(
          selection.serviceKey,
        );

        result.push({
          uniqueId: uniqueId || undefined,
          serviceKey:
            originalServiceKey || semanticKey,
          name: serviceName,
          description: cleanString(selection.description),
          audience: selection.audience,
          categoryId,
          categoryName,
          subcategoryId,
          subcategoryName,
          price: selection.price,
          durationMinutes: selection.durationMinutes,
        });
      });

      return result;
    }, [data.serviceSelections]);

  // ==========================================================
  // GROUP SERVICES BY AUDIENCE
  // ==========================================================

  const groupedServices = useMemo(() => {
    const groups: Record<Audience, ReviewServiceSelection[]> = {
      FEMALE: [],
      MALE: [],
      KIDS: [],
    };

    selectedServiceSelections.forEach(selection => {
      groups[selection.audience].push(selection);
    });

    return groups;
  }, [selectedServiceSelections]);

  // ==========================================================
  // KYC DOCUMENTS
  // ==========================================================

  const panDocument = data.panDocument;
  const aadhaarDocument = data.aadhaarDocument;
  const shopEstablishmentDocument =
    data.shopEstablishmentDocument;
  const gstDocument = data.gstDocument;
  const udyamDocument = data.udyamDocument;

  const hasPanDocument = hasValidKycDocument(panDocument);
  const hasAadhaarDocument =
    hasValidKycDocument(aadhaarDocument);
  const hasShopEstablishmentDocument =
    hasValidKycDocument(shopEstablishmentDocument);
  const hasGstDocument = hasValidKycDocument(gstDocument);
  const hasUdyamDocument = hasValidKycDocument(udyamDocument);

  const salonProfilePhoto = data.salonProfilePhoto ?? null;

  const profilePhotoPreviewUri = salonProfilePhoto
    ? cleanString(
        salonProfilePhoto.localUri ||
          salonProfilePhoto.uri ||
          salonProfilePhoto.objectUrl,
      )
    : '';

  const hasProfilePhoto = Boolean(
    salonProfilePhoto &&
      profilePhotoPreviewUri &&
      cleanString(salonProfilePhoto.name) &&
      cleanString(salonProfilePhoto.type),
  );

  // ==========================================================
  // BUILD KYC DOCUMENT PAYLOAD
  // ==========================================================

  const buildKycDocumentPayload = (): KycDocumentInput[] => {
    const documents: KycDocumentInput[] = [];

    const requiredDocuments: Array<{
      type: KycDocumentType;
      document: any;
      label: string;
    }> = [
      {
        type: 'PAN',
        document: panDocument,
        label: 'PAN',
      },
      {
        type: 'AADHAAR',
        document: aadhaarDocument,
        label: 'Aadhaar',
      },
      {
        type: 'SHOP_ESTABLISHMENT',
        document: shopEstablishmentDocument,
        label: 'Shop & Establishment',
      },
    ];

    for (const item of requiredDocuments) {
      if (!hasValidKycDocument(item.document)) {
        throw new Error(
          `${item.label} document is missing or has not been uploaded successfully.`,
        );
      }

      const fileSize = getKycDocumentFileSize(item.document);

      documents.push({
        documentType: item.type,
        fileName: getKycDocumentName(item.document),
        contentType: getKycDocumentContentType(item.document),
        ...(fileSize !== undefined ? { fileSize } : {}),
        s3Key: getKycDocumentS3Key(item.document),
      });
    }

    const optionalDocuments: Array<{
      type: KycDocumentType;
      document: any;
      label: string;
    }> = [
      {
        type: 'GST',
        document: gstDocument,
        label: 'GST',
      },
      {
        type: 'UDYAM',
        document: udyamDocument,
        label: 'Udyam',
      },
    ];

    for (const item of optionalDocuments) {
      if (!item.document) {
        continue;
      }

      if (!hasValidKycDocument(item.document)) {
        throw new Error(
          `${item.label} document information is incomplete. Please upload the document again.`,
        );
      }

      const fileSize = getKycDocumentFileSize(item.document);

      documents.push({
        documentType: item.type,
        fileName: getKycDocumentName(item.document),
        contentType: getKycDocumentContentType(item.document),
        ...(fileSize !== undefined ? { fileSize } : {}),
        s3Key: getKycDocumentS3Key(item.document),
      });
    }

    return documents;
  };

  // ==========================================================
  // SUBMIT REGISTRATION
  // ==========================================================

  const onSubmit = async () => {
    if (submittingRef.current || registrationLoading) {
      return;
    }

    const authenticatedUserId = cleanString(
      currentUser?.userId,
    );

    const registrationUserId = cleanString(data.userId);

    if (!authenticatedUserId || !registrationUserId) {
      Alert.alert(
        'Session Expired',
        'Please sign in again before submitting.',
      );
      return;
    }

    if (authenticatedUserId !== registrationUserId) {
      Alert.alert(
        'Registration Error',
        'Your registration session does not match the current user. Please restart registration.',
      );
      return;
    }

    const salonName = cleanString(data.salonName);
    const ownerName = cleanString(data.ownerName);
    const email = cleanString(data.email);

    if (!salonName) {
      Alert.alert(
        'Registration Error',
        'Salon name is missing.',
      );
      return;
    }

    if (!ownerName) {
      Alert.alert(
        'Registration Error',
        'Owner name is missing.',
      );
      return;
    }

    if (!email) {
      Alert.alert(
        'Registration Error',
        'Email address is missing.',
      );
      return;
    }

    const phoneNumber = cleanString(
      currentUser?.phoneNumber || data.phoneNumber,
    );

    if (!phoneNumber) {
      Alert.alert(
        'Registration Error',
        'Phone number is missing.',
      );
      return;
    }

    if (!hasProfilePhoto || !salonProfilePhoto) {
      Alert.alert(
        'Salon Photo Required',
        'Please go back to the KYC step and select a salon profile photo before submitting.',
      );
      return;
    }

    const photoSize = Number(salonProfilePhoto.size);

    if (
      Number.isFinite(photoSize) &&
      photoSize > MAX_PROFILE_PHOTO_BYTES
    ) {
      Alert.alert(
        'Photo Too Large',
        'Salon profile photo cannot exceed 10 MB. Please select a smaller photo.',
      );
      return;
    }

    try {
      getPhotoContentType(salonProfilePhoto);
    } catch (error: any) {
      Alert.alert(
        'Invalid Salon Photo',
        error?.message ||
          'Please select a JPG, PNG or WebP photo.',
      );
      return;
    }

    const targetAudiences: Audience[] = Array.isArray(
      data.targetAudiences,
    )
      ? data.targetAudiences.filter(
          (audience: any): audience is Audience =>
            isValidAudience(audience),
        )
      : [];

    if (targetAudiences.length === 0) {
      Alert.alert(
        'Customer Type Required',
        'Please select who your business serves.',
      );
      return;
    }

    const addressLine = cleanString(data.addressLine);
    const city = cleanString(data.city);
    const state = cleanString(data.state);
    const pincode = cleanString(data.pincode);

    if (!addressLine || !city || !state || !pincode) {
      Alert.alert(
        'Address Required',
        'Please complete your business address.',
      );
      return;
    }

    if (
      !data.businessHours ||
      Object.keys(data.businessHours).length === 0
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
      {} as RegisterSalonPartnerVariables['input']['businessHours'];

    for (const day of days) {
      const sourceDay = (data.businessHours as any)?.[day];

      if (!sourceDay) {
        Alert.alert(
          'Business Hours Required',
          `${day} business hours are missing.`,
        );
        return;
      }

      const open = cleanString(sourceDay.open);
      const close = cleanString(sourceDay.close);

      normalizedBusinessHours[day] = {
        isOpen: Boolean(sourceDay.isOpen),
        open,
        close,
      };

      if (sourceDay.isOpen && (!open || !close)) {
        Alert.alert(
          'Business Hours Required',
          `Please provide opening and closing times for ${day}.`,
        );
        return;
      }
    }

    const cleanPAN = cleanString(
      data.panNumber,
    ).toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN)) {
      Alert.alert(
        'PAN Required',
        'Please provide a valid PAN number.',
      );
      return;
    }

    if (!hasPanDocument) {
      Alert.alert(
        'PAN Document Required',
        'Please upload the PAN document before submitting.',
      );
      return;
    }

    const cleanAadhaar = cleanString(
      data.aadhaarNumber,
    ).replace(/\D/g, '');

    if (!/^\d{12}$/.test(cleanAadhaar)) {
      Alert.alert(
        'Aadhaar Required',
        'Please provide a valid 12-digit Aadhaar number.',
      );
      return;
    }

    if (!hasAadhaarDocument) {
      Alert.alert(
        'Aadhaar Document Required',
        'Please upload the Aadhaar document before submitting.',
      );
      return;
    }

    const cleanShop = cleanString(
      data.shopEstablishmentNumber,
    );

    if (!cleanShop) {
      Alert.alert(
        'Salon Registration Required',
        'Please provide your Shop & Establishment registration number.',
      );
      return;
    }

    if (!hasShopEstablishmentDocument) {
      Alert.alert(
        'Shop & Establishment Document Required',
        'Please upload the Shop & Establishment document before submitting.',
      );
      return;
    }

    if (selectedServiceSelections.length === 0) {
      Alert.alert(
        'Services Required',
        'Please add at least one service.',
      );
      return;
    }

    const services: RegisterSalonPartnerVariables['input']['services'] =
      selectedServiceSelections.map(selection => {
        const description = cleanString(
          selection.description,
        );

        return {
          categoryId: cleanString(selection.categoryId),
          categoryName: cleanString(selection.categoryName),
          subcategoryId: cleanString(
            selection.subcategoryId,
          ),
          subcategoryName: cleanString(
            selection.subcategoryName,
          ),
          name: cleanString(selection.name),
          ...(description ? { description } : {}),
          audience: selection.audience,
          price: Number(selection.price),
          duration: Number(selection.durationMinutes),
        };
      });

    const invalidServiceIndex = services.findIndex(
      service =>
        !service.categoryId ||
        !service.categoryName ||
        !service.subcategoryId ||
        !service.subcategoryName ||
        !service.name ||
        !isValidAudience(service.audience) ||
        !Number.isFinite(service.price) ||
        service.price < 0 ||
        !Number.isFinite(service.duration) ||
        service.duration <= 0,
    );

    if (invalidServiceIndex >= 0) {
      Alert.alert(
        'Invalid Service',
        `Service ${invalidServiceIndex + 1} is missing required category, subcategory, service, price, or duration information.`,
      );
      return;
    }

    let kycDocuments: KycDocumentInput[];

    try {
      kycDocuments = buildKycDocumentPayload();
    } catch (error: any) {
      Alert.alert(
        'KYC Documents Required',
        error?.message ||
          'Please check your KYC documents and upload them again.',
      );
      return;
    }

    const requiredKycDocumentTypes: KycDocumentType[] = [
      'PAN',
      'AADHAAR',
      'SHOP_ESTABLISHMENT',
    ];

    const missingRequiredKycDocuments =
      requiredKycDocumentTypes.filter(
        documentType =>
          !kycDocuments.some(
            document =>
              document.documentType === documentType,
          ),
      );

    if (missingRequiredKycDocuments.length > 0) {
      Alert.alert(
        'KYC Documents Required',
        'Please upload all required KYC documents before submitting.',
      );
      return;
    }

    const gstNumber = cleanString(
      data.gstNumber,
    ).toUpperCase();

    const udyamNumber = cleanString(
      data.udyamNumber,
    ).toUpperCase();

    const registerInput:
      RegisterSalonPartnerVariables['input'] = {
        userId: authenticatedUserId,
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
        businessHours: normalizedBusinessHours,
        ...(typeof data.latitude === 'number'
          ? { latitude: data.latitude }
          : {}),
        ...(typeof data.longitude === 'number'
          ? { longitude: data.longitude }
          : {}),
        ...(gstNumber ? { gstNumber } : {}),
        panNumber: cleanPAN,
        aadhaarNumber: cleanAadhaar,
        shopEstablishmentNumber: cleanShop,
        ...(udyamNumber ? { udyamNumber } : {}),
        kycDocuments,
        services,
      };

    // Start the submitting state only after local validation.
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const draftSaved = await persistReviewDraft();

      if (!draftSaved) {
        Alert.alert(
          'Unable to Save Draft',
          'Your registration details could not be saved. Please try again before submitting.',
        );
        return;
      }

      const response = await registerSalonPartner({
        variables: {
          input: registerInput,
        },
      });

      const result = response.data?.registerSalonPartner;

      if (!result?.success) {
        Alert.alert(
          'Registration Failed',
          result?.message ||
            'Unable to register your business.',
        );
        return;
      }

      const salonId = cleanString(result.salonId);

      if (!salonId) {
        // The server may have created the salon even though the
        // response is incomplete. Do not silently retry registration.
        Alert.alert(
          'Registration Status Unclear',
          'The server did not return a salon ID. Please contact support before trying again.',
        );
        return;
      }

      // Registration has succeeded. Prevent further draft autosaves
      // and avoid submitting the registration a second time.
      registrationSucceededRef.current = true;

      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
        draftTimerRef.current = null;
      }

      const updatedUser: User = {
        ...currentUser!,
        role: 'PROVIDER',
        providerStatus: 'PENDING' as ProviderStatus,
        salonId,
      };

      setCurrentUser(updatedUser);

      let photoUploadError: string | null = null;

      try {
        const uploaded = await uploadSalonProfilePhoto(
          salonProfilePhoto,
          salonId,
        );

        await createSalonProfileMediaRecord(
          uploaded,
          salonId,
        );

        updateData({
          salonProfilePhoto: {
            ...salonProfilePhoto,
            imageId: uploaded.imageId,
            objectUrl: uploaded.objectUrl,
            key: uploaded.key,
            salonId,
            mediaType: uploaded.mediaType,
            uri: uploaded.objectUrl,
          },
        });
      } catch (error: any) {
        photoUploadError =
          error?.message ||
          'The salon was registered, but the profile photo could not be uploaded.';

        // Do not log the full error object or registration/KYC data.
        console.warn(
          '[SalonReview] Profile photo upload failed:',
          photoUploadError,
        );
      }

      // NOTE: reset() clears local registration context. It does not
      // mark the server-side draft COMPLETED. That requires a separate
      // backend operation.
      reset();

      if (photoUploadError) {
        Alert.alert(
          'Registration Submitted',
          `Your salon registration was submitted successfully, but the profile photo could not be saved.\n\n${photoUploadError}\n\nPlease add the photo later from Salon Information.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.navigate('SalonSuccess', {
                  salonId,
                  profilePhotoUploadFailed: true,
                });
              },
            },
          ],
          { cancelable: false },
        );

        return;
      }

      navigation.navigate('SalonSuccess', {
        salonId,
        profilePhotoUploaded: true,
      });
    } catch (error: any) {
      // Avoid logging the full GraphQL error because its payload
      // could contain sensitive registration or KYC information.
      console.error(
        '[SalonReview] Registration request failed:',
        error?.message || 'Unknown error',
      );

      Alert.alert(
        'Registration Failed',
        error?.message ||
          'Something went wrong while registering the business. If you are unsure whether it succeeded, contact support before trying again.',
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Review Details" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Review your details
          </Text>

          <Text style={styles.subtitle}>
            Please check everything before submitting your business registration.
          </Text>
        </View>

        {/* SALON PROFILE PHOTO */}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Salon profile photo *
          </Text>

          <Text style={styles.sectionSubtitle}>
            This photo will be uploaded to your salon profile when you submit your registration.
          </Text>

          {hasProfilePhoto ? (
            <>
              <View style={styles.profilePhotoFrame}>
                <Image
                  source={{ uri: profilePhotoPreviewUri }}
                  style={styles.profilePhoto}
                  resizeMode="cover"
                  onError={() => {
                    console.warn(
                      '[SalonReview] Profile photo preview could not be loaded.',
                    );
                  }}
                />
              </View>

              <Text style={styles.profilePhotoName}>
                {salonProfilePhoto?.name}
              </Text>

              <View style={styles.photoStatusRow}>
                <View style={styles.photoStatusBadge}>
                  <Text style={styles.photoStatusText}>
                    Photo selected
                  </Text>
                </View>

                <Text style={styles.photoSizeText}>
                  {salonProfilePhoto?.size
                    ? `${(
                        salonProfilePhoto.size /
                        (1024 * 1024)
                      ).toFixed(2)} MB`
                    : ''}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.missingPhotoBox}>
              <Text style={styles.missingPhotoTitle}>
                No salon photo selected
              </Text>

              <Text style={styles.missingPhotoText}>
                Go back to the KYC step and select your salon profile photo.
              </Text>
            </View>
          )}

          <Text style={styles.photoUploadNote}>
            The photo is saved to your salon's media records after the salon is created.
          </Text>
        </View>

        {/* BASIC DETAILS */}

        <View style={styles.card}>
          <DetailRow
            label="Salon"
            value={cleanString(data.salonName)}
          />

          <DetailRow
            label="Owner"
            value={cleanString(data.ownerName)}
          />

          <DetailRow
            label="Email"
            value={cleanString(data.email)}
          />

          <DetailRow
            label="Address"
            value={
              [
                cleanString(data.addressLine),
                cleanString(data.city),
                cleanString(data.state),
                cleanString(data.pincode),
              ]
                .filter(Boolean)
                .join(', ') || 'Address not provided'
            }
          />

          <DetailRow
            label="Customer type"
            value={
              Array.isArray(data.targetAudiences)
                ? data.targetAudiences
                    .filter(
                      (audience: any): audience is Audience =>
                        isValidAudience(audience),
                    )
                    .map(getAudienceLabel)
                    .join(', ')
                : '-'
            }
          />

          <DetailRow
            label="GSTIN"
            value={
              cleanString(data.gstNumber) || 'Not provided'
            }
          />

          <DetailRow
            label="Shop & Establishment"
            value={
              cleanString(data.shopEstablishmentNumber) || '-'
            }
          />

          <DetailRow
            label="Udyam"
            value={
              cleanString(data.udyamNumber) || 'Not provided'
            }
          />

          <DetailRow
            label="PAN"
            value={maskPan(data.panNumber)}
          />

          <DetailRow
            label="Aadhaar"
            value={
              data.aadhaarNumber
                ? `XXXX XXXX ${cleanString(
                    data.aadhaarNumber,
                  ).replace(/\D/g, '').slice(-4)}`
                : '-'
            }
            last
          />
        </View>

        {/* KYC DOCUMENTS */}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            KYC documents
          </Text>

          <Text style={styles.sectionSubtitle}>
            PAN, Aadhaar and Shop & Establishment documents are required.
            GST and Udyam documents are optional.
          </Text>

          <KycDocumentRow
            title="PAN document"
            document={panDocument}
            uploaded={hasPanDocument}
            required
          />

          <KycDocumentRow
            title="Aadhaar document"
            document={aadhaarDocument}
            uploaded={hasAadhaarDocument}
            required
          />

          <KycDocumentRow
            title="Shop & Establishment document"
            document={shopEstablishmentDocument}
            uploaded={hasShopEstablishmentDocument}
            required
          />

          <KycDocumentRow
            title="GST document"
            document={gstDocument}
            uploaded={hasGstDocument}
          />

          <KycDocumentRow
            title="Udyam document"
            document={udyamDocument}
            uploaded={hasUdyamDocument}
            last
          />
        </View>

        {/* SERVICES */}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Services provided
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your services are organized by customer type, category and subcategory.
          </Text>

          {selectedServiceSelections.length === 0 ? (
            <Text style={styles.emptyText}>
              No services selected.
            </Text>
          ) : (
            (['FEMALE', 'MALE', 'KIDS'] as Audience[]).map(
              audience => {
                const audienceServices =
                  groupedServices[audience];

                if (audienceServices.length === 0) {
                  return null;
                }

                const categoryGroups = new Map<
                  string,
                  {
                    categoryName: string;
                    subcategories: Map<
                      string,
                      {
                        subcategoryName: string;
                        services: ReviewServiceSelection[];
                      }
                    >;
                  }
                >();

                audienceServices.forEach(service => {
                  const categoryKey = service.categoryId;

                  if (!categoryGroups.has(categoryKey)) {
                    categoryGroups.set(categoryKey, {
                      categoryName:
                        service.categoryName || service.categoryId,
                      subcategories: new Map(),
                    });
                  }

                  const categoryGroup =
                    categoryGroups.get(categoryKey)!;

                  const subcategoryKey = service.subcategoryId;

                  if (
                    !categoryGroup.subcategories.has(
                      subcategoryKey,
                    )
                  ) {
                    categoryGroup.subcategories.set(
                      subcategoryKey,
                      {
                        subcategoryName:
                          service.subcategoryName ||
                          service.subcategoryId,
                        services: [],
                      },
                    );
                  }

                  categoryGroup.subcategories
                    .get(subcategoryKey)!
                    .services.push(service);
                });

                return (
                  <View
                    key={audience}
                    style={styles.audienceSection}
                  >
                    <AppGradient
                      colors={[...GRADIENTS.SOFT_PURPLE]}
                      style={styles.audienceHeader}
                    >
                      <Text style={styles.audienceTitle}>
                        {getAudienceLabel(audience)}
                      </Text>
                    </AppGradient>

                    {Array.from(categoryGroups.entries()).map(
                      ([categoryKey, category]) => (
                        <View
                          key={categoryKey}
                          style={styles.serviceCategoryGroup}
                        >
                          {Array.from(
                            category.subcategories.entries(),
                          ).map(
                            ([subcategoryKey, subcategory]) => (
                              <View
                                key={subcategoryKey}
                                style={styles.serviceSubcategoryGroup}
                              >
                                <Text
                                  style={styles.serviceCategoryHeading}
                                >
                                  {category.categoryName}
                                  <Text
                                    style={styles.serviceHierarchySeparator}
                                  >
                                    {' > '}
                                  </Text>
                                  <Text
                                    style={styles.serviceSubcategoryHeading}
                                  >
                                    {subcategory.subcategoryName}
                                  </Text>
                                </Text>

                                {subcategory.services.map(
                                  (service, index) => (
                                    <View
                                      key={`${service.serviceKey}-${index}`}
                                      style={styles.serviceListItem}
                                    >
                                      <View style={styles.serviceInfo}>
                                        <Text style={styles.serviceName}>
                                          {service.name}
                                        </Text>

                                        {service.description ? (
                                          <Text
                                            style={styles.serviceDescription}
                                          >
                                            {service.description}
                                          </Text>
                                        ) : null}

                                        {service.durationMinutes !==
                                          undefined &&
                                        service.durationMinutes !==
                                          null ? (
                                          <Text
                                            style={styles.serviceDuration}
                                          >
                                            {Number(
                                              service.durationMinutes,
                                            )}{' '}
                                            min
                                          </Text>
                                        ) : null}
                                      </View>

                                      {service.price !== undefined &&
                                      service.price !== null ? (
                                        <Text style={styles.servicePrice}>
                                          ₹
                                          {Number(
                                            service.price,
                                          ).toFixed(0)}
                                        </Text>
                                      ) : null}
                                    </View>
                                  ),
                                )}
                              </View>
                            ),
                          )}
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

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>
            Verification
          </Text>

          <Text style={styles.noticeText}>
            After submission, your business registration will be reviewed.
            Provider access will be activated only after the required
            verification and approval process is completed.
          </Text>
        </View>

        {/* SUBMIT */}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={registrationLoading || isSubmitting}
          activeOpacity={0.85}
          style={[
            styles.button,
            (registrationLoading || isSubmitting) &&
              styles.buttonDisabled,
          ]}
        >
          <AppGradient
            colors={[...GRADIENTS.SOFT_PURPLE]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {isSubmitting || registrationLoading
                ? 'Submitting...'
                : 'Submit Registration'}
            </Text>
          </AppGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
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
        !last && styles.documentBorder,
      ]}
    >
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>
          {title}
          {required ? ' *' : ''}
        </Text>

        <Text style={styles.documentName}>
          {document?.name ||
            document?.fileName ||
            'Not uploaded'}
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
        {uploaded ? (
          <AppGradient
            colors={[...GRADIENTS.SOFT_PURPLE]}
            style={styles.documentStatusBadge}
          >
            <Text style={styles.documentUploadedText}>
              Uploaded
            </Text>
          </AppGradient>
        ) : (
          <Text
            style={[
              styles.documentStatusText,
              styles.documentMissingText,
            ]}
          >
            {required ? 'Required' : 'Optional'}
          </Text>
        )}
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
        !last && styles.detailBorder,
      ]}
    >
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value || '-'}
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },

  header: {
    marginBottom: SPACING.xxl,
  },

  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.title,
    lineHeight: FONT_SIZES.title + 5,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: SPACING.small,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 7,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    paddingHorizontal: SPACING.xl,
  },

  detailRow: {
    paddingVertical: SPACING.large,
  },

  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  detailLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  detailValue: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    lineHeight: FONT_SIZES.body + 6,
    color: COLORS.text,
  },

  sectionCard: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
  },

  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 7,
    color: COLORS.textSecondary,
    marginBottom: SPACING.large,
  },

  profilePhotoFrame: {
    width: '100%',
    height: 210,
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    backgroundColor: '#F4F0FA',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profilePhoto: {
    width: '100%',
    height: '100%',
  },

  profilePhotoName: {
    marginTop: SPACING.medium,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },

  photoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.small,
  },

  photoStatusBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },

  photoStatusText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: '#6D28D9',
  },

  photoSizeText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },

  photoUploadNote: {
    marginTop: SPACING.medium,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 6,
    color: COLORS.textSecondary,
  },

  missingPhotoBox: {
    borderWidth: 1,
    borderColor: '#F0B4B4',
    borderRadius: RADIUS.medium,
    backgroundColor: '#FFF5F5',
    padding: SPACING.large,
  },

  missingPhotoTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: '#B42318',
  },

  missingPhotoText: {
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 6,
    color: '#8E3333',
  },

  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
  },

  documentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  documentInfo: {
    flex: 1,
  },

  documentTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginBottom: 3,
  },

  documentName: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },

  documentStatus: {
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginLeft: SPACING.small,
  },

  documentUploaded: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  documentMissing: {
    backgroundColor: COLORS.border,
  },

  documentStatusText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
  },

  documentUploadedText: {
    color: '#FFFFFF',
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
  },

  documentMissingText: {
    color: COLORS.textSecondary,
  },

  documentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    paddingVertical: SPACING.medium,
  },

  audienceSection: {
    marginBottom: SPACING.large,
  },

  audienceHeader: {
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginBottom: SPACING.small,
  },

  audienceTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.white,
  },

  serviceCategoryGroup: {
    marginTop: SPACING.medium,
  },

  serviceSubcategoryGroup: {
    marginLeft: SPACING.small,
    marginBottom: SPACING.medium,
    paddingLeft: SPACING.medium,
    borderLeftWidth: 2,
    borderLeftColor: '#C084FC',
  },

  serviceCategoryHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },

  serviceHierarchySeparator: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },

  serviceSubcategoryHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  serviceListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceName: {
    marginTop: 4,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },

  serviceDescription: {
    marginTop: 3,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 5,
    color: COLORS.textSecondary,
  },

  serviceDuration: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },

  servicePrice: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.themeColor,
    marginLeft: SPACING.small,
  },

  notice: {
    marginTop: SPACING.xl,
    padding: SPACING.large,
    borderRadius: RADIUS.medium,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  noticeTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  noticeText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 7,
    color: COLORS.textSecondary,
  },

  button: {
    width: '100%',
    height: 54,
    borderRadius: RADIUS.medium,
    marginTop: SPACING.xl,
    overflow: 'hidden',
  },

  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: '#FFFFFF',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  bottomSpacing: {
    height: SPACING.huge,
  },
});
