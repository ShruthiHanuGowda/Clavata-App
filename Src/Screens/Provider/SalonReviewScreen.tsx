
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { useMutation } from '@apollo/client';

import { Header } from '../../components';
import { REGISTER_SALON_PARTNER } from '../../graphql/queries';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';
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

// ============================================================
// HELPERS
// ============================================================

const cleanString = (value: any): string =>
  String(value ?? '').trim();

const isValidAudience = (value: any): value is Audience =>
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

const getKycDocumentName = (document: any): string =>
  cleanString(document?.name ?? document?.fileName);

const getKycDocumentContentType = (document: any): string =>
  cleanString(document?.type ?? document?.contentType);

const getKycDocumentUploadId = (document: any): string =>
  cleanString(document?.uploadId);

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

// ============================================================
// SCREEN
// ============================================================

export default function SalonReviewScreen({
  navigation,
}: any) {
  const { data, reset, saveDraft } = useSalonRegistration();

  const { currentUser, setCurrentUser } = useUser();

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
  //
  // Current step: 6 (review)
  // Completed steps: 1–5
  //
  // The review screen itself is not considered submitted
  // until the backend successfully creates the salon.
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
          '[SalonReview] Draft save returned false. ' +
          'Check that userId is available and the draft mutation succeeds.',
        );
      }

      return saved;
    } catch (error: any) {
      console.warn(
        '[SalonReview] Draft save failed:',
        error?.message || error,
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

      // Do not recreate a draft after successful registration.
      if (!registrationSucceededRef.current) {
        void persistReviewDraft();
      }
    };
  }, [persistReviewDraft]);

  // ==========================================================
  // GRAPHQL MUTATION
  // ==========================================================

  const [
    registerSalonPartner,
    { loading },
  ] = useMutation<
    RegisterSalonPartnerResponse,
    RegisterSalonPartnerVariables
  >(REGISTER_SALON_PARTNER);

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

      data.serviceSelections.forEach(
        (selection: any, index: number) => {
          if (
            !selection ||
            !isValidAudience(selection.audience)
          ) {
            return;
          }

          const categoryId = cleanString(selection.categoryId);
          const categoryName = cleanString(selection.categoryName);
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
            console.warn(
              '[SalonReview] Ignoring incomplete service:',
              selection,
            );
            return;
          }

          const uniqueId = cleanString(selection.uniqueId);
          const originalServiceKey = cleanString(
            selection.serviceKey,
          );

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

          if (seenKeys.has(effectiveServiceKey)) {
            console.warn(
              '[SalonReview] Duplicate service ignored:',
              effectiveServiceKey,
            );
            return;
          }

          seenKeys.add(effectiveServiceKey);

          result.push({
            uniqueId: uniqueId || undefined,
            serviceKey:
              originalServiceKey || effectiveServiceKey,
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
        },
      );

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
      if (isValidAudience(selection.audience)) {
        groups[selection.audience].push(selection);
      }
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
  const hasAadhaarDocument = hasValidKycDocument(aadhaarDocument);
  const hasShopEstablishmentDocument =
    hasValidKycDocument(shopEstablishmentDocument);
  const hasGstDocument = hasValidKycDocument(gstDocument);
  const hasUdyamDocument = hasValidKycDocument(udyamDocument);

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
          `${item.label} document information is incomplete. ` +
          `Please upload the document again.`,
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
    if (submittingRef.current || loading) {
      return;
    }

    if (!currentUser?.userId) {
      Alert.alert(
        'Session Expired',
        'Please sign in again.',
      );
      return;
    }

    if (!cleanString(data.userId)) {
      Alert.alert(
        'Registration Error',
        'User information is missing. Please restart registration.',
      );
      return;
    }

    const salonName = cleanString(data.salonName);
    const ownerName = cleanString(data.ownerName);
    const email = cleanString(data.email);

    if (!salonName) {
      Alert.alert('Registration Error', 'Salon name is missing.');
      return;
    }

    if (!ownerName) {
      Alert.alert('Registration Error', 'Owner name is missing.');
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
      currentUser.phoneNumber || data.phoneNumber,
    );

    if (!phoneNumber) {
      Alert.alert(
        'Registration Error',
        'Phone number is missing.',
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

    // PAN validation
    const cleanPAN = cleanString(data.panNumber).toUpperCase();

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

    // Aadhaar validation
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

    // Shop & Establishment validation
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

    // Services validation
    if (selectedServiceSelections.length === 0) {
      Alert.alert(
        'Services Required',
        'Please add at least one service.',
      );
      return;
    }

    const services: RegisterSalonPartnerVariables['input']['services'] =
      selectedServiceSelections.map(selection => {
        const categoryId = cleanString(selection.categoryId);
        const categoryName = cleanString(selection.categoryName);
        const subcategoryId = cleanString(
          selection.subcategoryId,
        );
        const subcategoryName = cleanString(
          selection.subcategoryName,
        );
        const name = cleanString(selection.name);
        const description = cleanString(selection.description);
        const price = Number(selection.price);
        const duration = Number(selection.durationMinutes);

        return {
          categoryId,
          categoryName,
          subcategoryId,
          subcategoryName,
          name,
          ...(description ? { description } : {}),
          audience: selection.audience,
          price,
          duration,
        };
      });

    const invalidServiceIndex = services.findIndex(service =>
      !service.categoryId ||
      !service.categoryName ||
      !service.subcategoryId ||
      !service.subcategoryName ||
      !service.name ||
      !isValidAudience(service.audience) ||
      !Number.isFinite(service.price) ||
      service.price <= 0 ||
      !Number.isFinite(service.duration) ||
      service.duration <= 0,
    );

    if (invalidServiceIndex >= 0) {
      console.error(
        '[SalonReview] Invalid service:',
        JSON.stringify(
          services[invalidServiceIndex],
          null,
          2,
        ),
      );

      Alert.alert(
        'Invalid Service',
        `Service ${invalidServiceIndex + 1} is missing required category, subcategory, service, price, or duration information.`,
      );
      return;
    }

    // KYC documents
    let kycDocuments: KycDocumentInput[];

    try {
      kycDocuments = buildKycDocumentPayload();
    } catch (error: any) {
      console.error(
        '[SalonReview] KYC payload error:',
        error,
      );

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
        userId: currentUser.userId,
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

    submittingRef.current = true;

    try {
      // Save the latest draft before starting submission.
      await persistReviewDraft();

      console.log(
        '[SalonReview] Submitting registration:',
        {
          userId: registerInput.userId,
          targetAudiences: registerInput.targetAudiences,
          servicesCount: registerInput.services.length,
          kycDocumentCount: registerInput.kycDocuments.length,
        },
      );

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
        Alert.alert(
          'Registration Error',
          'Salon was created, but the business ID was not returned by the server.',
        );
        return;
      }

      const updatedUser: User = {
        ...currentUser,
        role: 'PROVIDER',
        providerStatus: 'PENDING' as ProviderStatus,
        salonId,
      };

      setCurrentUser(updatedUser);

      // Prevent the unmount cleanup from saving a new draft.
      registrationSucceededRef.current = true;

      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
        draftTimerRef.current = null;
      }

      reset();

      navigation.navigate('SalonSuccess', { salonId });
    } catch (error: any) {
      console.error(
        '[SalonReview] Registration error:',
        error,
      );

      console.error(
        '[SalonReview] GraphQL errors:',
        JSON.stringify(error?.graphQLErrors, null, 2),
      );

      Alert.alert(
        'Registration Failed',
        error?.message ||
          'Something went wrong while registering the business.',
      );
    } finally {
      submittingRef.current = false;
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
            Please check everything before submitting your business registration
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
            value={[
              cleanString(data.addressLine),
              cleanString(data.city),
              cleanString(data.state),
              cleanString(data.pincode),
            ].filter(Boolean).join(', ') || 'Address not provided'}
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
            value={cleanString(data.gstNumber) || 'Not provided'}
          />

          <DetailRow
            label="Shop & Establishment"
            value={
              cleanString(data.shopEstablishmentNumber) || '-'
            }
          />

          <DetailRow
            label="Udyam"
            value={cleanString(data.udyamNumber) || 'Not provided'}
          />

          <DetailRow
            label="PAN"
            value={cleanString(data.panNumber) || '-'}
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
            Your services are organized by customer type, category and subcategory
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
                                style={
                                  styles.serviceSubcategoryGroup
                                }
                              >
                                <Text
                                  style={
                                    styles.serviceCategoryHeading
                                  }
                                >
                                  {category.categoryName}
                                  <Text
                                    style={
                                      styles.serviceHierarchySeparator
                                    }
                                  >
                                    {' > '}
                                  </Text>
                                  <Text
                                    style={
                                      styles.serviceSubcategoryHeading
                                    }
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
                                      <View
                                        style={styles.serviceInfo}
                                      >
                                        <Text
                                          style={styles.serviceName}
                                        >
                                          {service.name}
                                        </Text>

                                        {service.description ? (
                                          <Text
                                            style={
                                              styles.serviceDescription
                                            }
                                          >
                                            {service.description}
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
                                            {Number(
                                              service.durationMinutes,
                                            )}{' '}
                                            min
                                          </Text>
                                        ) : null}
                                      </View>

                                      {service.price !== undefined &&
                                      service.price !== null ? (
                                        <Text
                                          style={styles.servicePrice}
                                        >
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
          disabled={loading}
          activeOpacity={0.85}
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
        >
          <AppGradient
            colors={[...GRADIENTS.SOFT_PURPLE]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Submitting...' : 'Submit Registration'}
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
