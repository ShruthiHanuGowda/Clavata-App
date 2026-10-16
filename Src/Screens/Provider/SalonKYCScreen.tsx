
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from 'react-native';
import { Header } from '../../components';
import AppGradient from '../../common/AppGradient';
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  GRADIENTS,
} from '../../constants/constants';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';
import {
  pick,
  keepLocalCopy,
  types,
} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { gql, useMutation } from '@apollo/client';

/* ============================================================
   GRAPHQL
============================================================ */

const GENERATE_KYC_DOCUMENT_UPLOAD_URL = gql`
  mutation GenerateKycDocumentUploadUrl(
    $input: GenerateKycDocumentUploadUrlInput!
  ) {
    generateKycDocumentUploadUrl(input: $input) {
      success
      message
      uploadUrl
      key
      contentType
      expiresIn
    }
  }
`;

/* ============================================================
   TYPES
============================================================ */

type KycDocumentType =
  | 'PAN'
  | 'AADHAAR'
  | 'SHOP_ESTABLISHMENT'
  | 'GST'
  | 'UDYAM';

type KycDocument = {
  uri: string;
  localUri?: string;
  name: string;
  type?: string | null;
  size?: number | null;
  uploadId?: string;
  s3Key?: string;
  documentType?: KycDocumentType;
};

type GenerateKycDocumentUploadUrlResponse = {
  generateKycDocumentUploadUrl: {
    success: boolean;
    message: string;
    uploadUrl?: string | null;
    key?: string | null;
    contentType?: string | null;
    expiresIn?: number | null;
  };
};

type KycDraft = Record<string, any>;

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const AUTOSAVE_DELAY = 900;

const DOCUMENT_TYPES: KycDocumentType[] = [
  'PAN',
  'AADHAAR',
  'SHOP_ESTABLISHMENT',
  'GST',
  'UDYAM',
];

/* ============================================================
   HELPERS
============================================================ */

const createUploadId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 12);

  return `REG-${timestamp}-${randomPart}`;
};

const getContentType = (
  fileName: string,
  providedType?: string | null,
): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  const allowedTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  if (extension && allowedTypes[extension]) {
    return allowedTypes[extension];
  }

  const normalizedType = providedType?.trim().toLowerCase();

  if (
    normalizedType &&
    [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ].includes(normalizedType)
  ) {
    return normalizedType;
  }

  throw new Error(
    'Unsupported document format. Please select a PDF, JPG, PNG or WEBP file.',
  );
};

const getLocalFilePath = (fileUri: string): string => {
  if (!fileUri) {
    return '';
  }

  if (fileUri.startsWith('file://')) {
    return decodeURIComponent(fileUri.substring(7));
  }

  return fileUri;
};

const isValidS3DocumentKey = (
  key: string,
  documentType: KycDocumentType,
): boolean => {
  const segments = key.split('/').filter(Boolean);

  // Do not assume a fixed folder index. The generated key must
  // include the exact document type as one of its path segments.
  return segments.includes(documentType);
};

const sanitizeDocumentForDraft = (
  document: KycDocument | null,
): KycDocument | null => {
  if (!document) {
    return null;
  }

  // Persist durable metadata and the S3 key. A local cache path may
  // become invalid after the application is restarted.
  return {
    name: document.name,
    type: document.type,
    size: document.size,
    uploadId: document.uploadId,
    s3Key: document.s3Key,
    documentType: document.documentType,
    uri: document.s3Key ? '' : document.uri,
    localUri: undefined,
  };
};

/* ============================================================
   SCREEN
============================================================ */

const SalonKYCScreen = ({ navigation }: any) => {
  const { data, updateData, saveDraft } = useSalonRegistration();

  const [generateKycDocumentUploadUrl] =
    useMutation<GenerateKycDocumentUploadUrlResponse>(
      GENERATE_KYC_DOCUMENT_UPLOAD_URL,
    );

  const [panNumber, setPanNumber] = useState(data?.panNumber || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(
    data?.aadhaarNumber || '',
  );
  const [gstNumber, setGstNumber] = useState(data?.gstNumber || '');
  const [shopEstablishmentNumber, setShopEstablishmentNumber] =
    useState(data?.shopEstablishmentNumber || '');
  const [udyamNumber, setUdyamNumber] = useState(data?.udyamNumber || '');

  const [panDocument, setPanDocument] = useState<KycDocument | null>(
    data?.panDocument || null,
  );
  const [aadhaarDocument, setAadhaarDocument] =
    useState<KycDocument | null>(data?.aadhaarDocument || null);
  const [shopEstablishmentDocument, setShopEstablishmentDocument] =
    useState<KycDocument | null>(
      data?.shopEstablishmentDocument || null,
    );
  const [gstDocument, setGstDocument] = useState<KycDocument | null>(
    data?.gstDocument || null,
  );
  const [udyamDocument, setUdyamDocument] = useState<KycDocument | null>(
    data?.udyamDocument || null,
  );

  const [submitting, setSubmitting] = useState(false);
  const [pickingDocument, setPickingDocument] = useState(false);

  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveDraftRef = useRef(saveDraft);
  const draftSaveQueueRef = useRef<Promise<any>>(Promise.resolve());
  const latestDraftRef = useRef<KycDraft | null>(null);
  const finalizingRef = useRef(false);
  const mountedRef = useRef(true);

  // Keep the latest context function without restarting effects.
  saveDraftRef.current = saveDraft;

  /*
   * Keep the latest complete registration snapshot.
   * The registration context remains responsible for merging/sanitizing
   * the payload and persisting it to the backend.
   */
  const currentKycData: KycDraft = {
    panNumber,
    aadhaarNumber,
    gstNumber,
    shopEstablishmentNumber,
    udyamNumber,
    panDocument,
    aadhaarDocument,
    shopEstablishmentDocument,
    gstDocument,
    udyamDocument,
    kycUploadId: data?.kycUploadId || '',
  };

  if (!finalizingRef.current) {
    latestDraftRef.current = {
      ...data,
      ...currentKycData,
    };
  }

  /*
   * Serialize draft saves. If autosave is already running when the user
   * presses Continue, the final save runs after it instead of racing it.
   */
  const saveDraftSafely = (
    snapshot: KycDraft,
    completedSteps?: number[],
  ): Promise<boolean> => {
    const operation = draftSaveQueueRef.current
      .catch(() => false)
      .then(() =>
        saveDraftRef.current(5, completedSteps, snapshot),
      )
      .then((result: boolean) => {
        if (!result) {
          console.warn('KYC draft save returned false.');
        }
        return Boolean(result);
      });

    draftSaveQueueRef.current = operation;
    return operation;
  };

  const clearDraftTimer = () => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    }
  };

  /* ============================================================
     AUTOSAVE
     Step 5 = Business verification / KYC.

     - Update the shared registration context.
     - Debounce network saves while the user is typing.
     - Serialize saves to prevent older snapshots overwriting newer ones.
     - Queue a final snapshot on screen exit.
  ============================================================ */

  useEffect(() => {
    updateData(currentKycData);

    if (finalizingRef.current) {
      return;
    }

    clearDraftTimer();

    draftTimerRef.current = setTimeout(() => {
      const snapshot = latestDraftRef.current;

      if (!snapshot || finalizingRef.current) {
        return;
      }

      saveDraftSafely(snapshot).catch((error: any) => {
        console.warn(
          'KYC autosave failed:',
          error?.message || 'Unknown error',
        );
      });
    }, AUTOSAVE_DELAY);

    return clearDraftTimer;
    // Intentionally depend on editable KYC fields, not the entire context
    // data object, to avoid an autosave loop when updateData changes context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    panNumber,
    aadhaarNumber,
    gstNumber,
    shopEstablishmentNumber,
    udyamNumber,
    panDocument,
    aadhaarDocument,
    shopEstablishmentDocument,
    gstDocument,
    udyamDocument,
    updateData,
  ]);

  /*
   * On leaving the screen, queue the latest draft behind any save already
   * in progress. Continue sets finalizingRef first, so this cleanup does
   * not enqueue a stale draft over the final submitted data.
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearDraftTimer();

      if (finalizingRef.current) {
        return;
      }

      const snapshot = latestDraftRef.current;

      if (snapshot) {
        saveDraftSafely(snapshot).catch((error: any) => {
          console.warn(
            'KYC exit draft save failed:',
            error?.message || 'Unknown error',
          );
        });
      }
    };
    // The cleanup should run when this screen unmounts, not on each edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================================================
     DOCUMENT PICKER
  ============================================================ */

  const pickKycDocument = async (
    documentType: KycDocumentType,
  ) => {
    try {
      setPickingDocument(true);

      const result = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });

      if (!result?.length) {
        return;
      }

      const selected = result[0];
      const fileName =
        selected.name || `${documentType.toLowerCase()}-document`;

      // Validate supported file type before copying it.
      getContentType(fileName, selected.type);

      const localCopy = await keepLocalCopy({
        files: [
          {
            uri: selected.uri,
            fileName,
          },
        ],
        destination: 'cachesDirectory',
      });

      const copiedFile = localCopy[0];

      if (
        copiedFile.status !== 'success' ||
        !copiedFile.localUri
      ) {
        throw new Error(
          'Unable to create a local copy of the selected document.',
        );
      }

      const localPath = getLocalFilePath(copiedFile.localUri);

      if (!localPath) {
        throw new Error(
          'Unable to determine the local file path.',
        );
      }

      const exists = await RNFS.exists(localPath);

      if (!exists) {
        throw new Error(
          'The selected document could not be accessed after copying it.',
        );
      }

      const stat = await RNFS.stat(localPath);
      const actualSize = Number(stat.size);

      if (!actualSize || actualSize <= 0) {
        throw new Error('The selected document is empty.');
      }

      if (actualSize > MAX_DOCUMENT_SIZE) {
        throw new Error(
          `${fileName} is larger than the 10 MB limit.`,
        );
      }

      /*
       * Important: create a fresh object without the previous S3 key or
       * upload ID. Replacing a document must trigger a new upload.
       */
      const selectedDocument: KycDocument = {
        uri: selected.uri,
        localUri: copiedFile.localUri,
        name: fileName,
        type: getContentType(fileName, selected.type),
        size: actualSize,
        documentType,
        s3Key: undefined,
        uploadId: undefined,
      };

      switch (documentType) {
        case 'PAN':
          setPanDocument(selectedDocument);
          break;
        case 'AADHAAR':
          setAadhaarDocument(selectedDocument);
          break;
        case 'SHOP_ESTABLISHMENT':
          setShopEstablishmentDocument(selectedDocument);
          break;
        case 'GST':
          setGstDocument(selectedDocument);
          break;
        case 'UDYAM':
          setUdyamDocument(selectedDocument);
          break;
      }
    } catch (error: any) {
      if (
        error?.code === 'DOCUMENT_PICKER_CANCELED' ||
        error?.code === 'OPERATION_CANCELED'
      ) {
        return;
      }

      console.error(
        'KYC document selection failed:',
        error?.message || 'Unknown error',
      );

      Alert.alert(
        'Unable to select document',
        error?.message || 'Please try again.',
      );
    } finally {
      setPickingDocument(false);
    }
  };

  /* ============================================================
     S3 UPLOAD
  ============================================================ */

  const uploadDocumentToS3 = async (
    document: KycDocument,
    documentType: KycDocumentType,
    uploadId: string,
  ): Promise<KycDocument> => {
    /*
     * A valid S3 key means the document was previously uploaded.
     * Reuse it when resuming registration, even if the old local cache
     * URI is no longer available.
     */
    if (document.s3Key) {
      if (
        !isValidS3DocumentKey(
          document.s3Key,
          documentType,
        )
      ) {
        throw new Error(
          `The saved ${documentType} document reference is invalid. Please select the document again.`,
        );
      }

      return {
        ...document,
        uploadId: document.uploadId || uploadId,
        documentType,
        localUri: undefined,
      };
    }

    if (!document.localUri) {
      throw new Error(
        `The local file for ${document.name} is no longer available. Please select the document again.`,
      );
    }

    const filePath = getLocalFilePath(document.localUri);

    if (
      !filePath ||
      filePath.startsWith('http://') ||
      filePath.startsWith('https://') ||
      filePath.startsWith('content://')
    ) {
      throw new Error(
        `Invalid local file path for ${document.name}. Please select it again.`,
      );
    }

    const fileExists = await RNFS.exists(filePath);

    if (!fileExists) {
      throw new Error(
        `The local file for ${document.name} is missing. Please select it again.`,
      );
    }

    const stat = await RNFS.stat(filePath);
    const actualFileSize = Number(stat.size);

    if (!actualFileSize || actualFileSize <= 0) {
      throw new Error(`The file ${document.name} is empty.`);
    }

    if (actualFileSize > MAX_DOCUMENT_SIZE) {
      throw new Error(
        `${document.name} is larger than the 10 MB limit.`,
      );
    }

    const contentType = getContentType(
      document.name,
      document.type,
    );

    const { data: mutationData } =
      await generateKycDocumentUploadUrl({
        variables: {
          input: {
            uploadId,
            documentType,
            fileName: document.name,
            contentType,
            fileSize: actualFileSize,
          },
        },
      });

    const response =
      mutationData?.generateKycDocumentUploadUrl;

    if (!response?.success) {
      throw new Error(
        response?.message ||
          `Failed to prepare the ${documentType} upload.`,
      );
    }

    if (!response.uploadUrl || !response.key) {
      throw new Error(
        `The server did not return a valid upload destination for ${document.name}.`,
      );
    }

    if (
      !isValidS3DocumentKey(
        response.key,
        documentType,
      )
    ) {
      throw new Error(
        `The server returned an unexpected storage location for ${documentType}.`,
      );
    }

    const uploadContentType =
      response.contentType || contentType;

    const uploadResponse = await ReactNativeBlobUtil
      .config({
        fileCache: false,
        followRedirect: true,
        timeout: 120000,
      })
      .fetch(
        'PUT',
        response.uploadUrl,
        {
          'Content-Type': uploadContentType,
        },
        ReactNativeBlobUtil.wrap(filePath),
      );

    const status = uploadResponse.info().status;

    if (status < 200 || status >= 300) {
      throw new Error(
        `Upload failed for ${document.name} (HTTP ${status}). Please try again.`,
      );
    }

    return {
      ...document,
      type: uploadContentType,
      size: actualFileSize,
      uploadId,
      s3Key: response.key,
      documentType,
      // Keep this for the current session only.
      localUri: filePath,
    };
  };

  /* ============================================================
     DOCUMENT PICKER UI
  ============================================================ */

  const renderDocumentPicker = (
    label: string,
    document: KycDocument | null,
    documentType: KycDocumentType,
    required = false,
  ) => (
    <View style={styles.documentPickerContainer}>
      <View style={styles.documentPickerHeader}>
        <Text style={styles.documentLabel}>
          {label}
          {required ? ' *' : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.documentPickerButton,
          document && styles.documentPickerButtonSelected,
        ]}
        onPress={() => pickKycDocument(documentType)}
        disabled={pickingDocument || submitting}
        activeOpacity={0.8}
      >
        {document ? (
          <View style={styles.documentSelectedContent}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.documentSelectedIconGradient}
            >
              <Text style={styles.documentSelectedIcon}>✓</Text>
            </AppGradient>

            <View style={styles.documentSelectedTextContainer}>
              <Text
                style={styles.documentSelectedText}
                numberOfLines={1}
              >
                {document.name}
              </Text>
              <Text style={styles.documentSelectedSubText}>
                {document.s3Key
                  ? 'Document uploaded'
                  : 'Document selected'}
              </Text>
            </View>

            <Text style={styles.documentChangeText}>Change</Text>
          </View>
        ) : (
          <View style={styles.documentEmptyContent}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.documentUploadIconGradient}
            >
              <Text style={styles.documentUploadIcon}>↑</Text>
            </AppGradient>

            <View style={styles.documentEmptyTextContainer}>
              <Text style={styles.documentUploadText}>
                Upload document
              </Text>
              <Text style={styles.documentUploadSubText}>
                PDF, JPG, PNG or WEBP
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  /* ============================================================
     CONTINUE
  ============================================================ */

  const handleContinue = async () => {
    if (submitting || pickingDocument) {
      return;
    }

    try {
      setSubmitting(true);

      const cleanPan = panNumber.trim().toUpperCase();
      const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
      const cleanGst = gstNumber.trim().toUpperCase();
      const cleanShop = shopEstablishmentNumber.trim();
      const cleanUdyam = udyamNumber.trim().toUpperCase();

      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
        Alert.alert(
          'Invalid PAN',
          'Please enter a valid PAN number.',
        );
        return;
      }

      if (!/^\d{12}$/.test(cleanAadhaar)) {
        Alert.alert(
          'Invalid Aadhaar',
          'Please enter a valid 12-digit Aadhaar number.',
        );
        return;
      }

      if (!cleanShop) {
        Alert.alert(
          'Shop & Establishment Number required',
          'Please enter your Shop & Establishment registration number.',
        );
        return;
      }

      if (!panDocument) {
        Alert.alert(
          'PAN document required',
          'Please upload your PAN document.',
        );
        return;
      }

      if (!aadhaarDocument) {
        Alert.alert(
          'Aadhaar document required',
          'Please upload your Aadhaar document.',
        );
        return;
      }

      if (!shopEstablishmentDocument) {
        Alert.alert(
          'Shop & Establishment document required',
          'Please upload your Shop & Establishment document.',
        );
        return;
      }

      if (cleanGst && !gstDocument) {
        Alert.alert(
          'GST document required',
          'Please upload your GST certificate because you entered a GSTIN.',
        );
        return;
      }

      if (cleanUdyam && !udyamDocument) {
        Alert.alert(
          'Udyam document required',
          'Please upload your Udyam certificate because you entered a Udyam number.',
        );
        return;
      }

      if (!cleanGst && gstDocument) {
        // A GST document must not be submitted when its number is blank.
        setGstDocument(null);
      }

      if (!cleanUdyam && udyamDocument) {
        setUdyamDocument(null);
      }

      /*
       * Stop the debounce timer and prevent state-driven autosave effects
       * from queuing snapshots while the final submission is running.
       */
      finalizingRef.current = true;
      clearDraftTimer();

      const existingUploadId =
        data?.kycUploadId ||
        panDocument.uploadId ||
        aadhaarDocument.uploadId ||
        shopEstablishmentDocument.uploadId ||
        gstDocument?.uploadId ||
        udyamDocument?.uploadId;

      const uploadId = existingUploadId || createUploadId();

      // Upload required documents first.
      const uploadedPanDocument = await uploadDocumentToS3(
        { ...panDocument, documentType: 'PAN' },
        'PAN',
        uploadId,
      );

      const uploadedAadhaarDocument = await uploadDocumentToS3(
        { ...aadhaarDocument, documentType: 'AADHAAR' },
        'AADHAAR',
        uploadId,
      );

      const uploadedShopDocument = await uploadDocumentToS3(
        {
          ...shopEstablishmentDocument,
          documentType: 'SHOP_ESTABLISHMENT',
        },
        'SHOP_ESTABLISHMENT',
        uploadId,
      );

      let uploadedGstDocument: KycDocument | null = null;

      if (cleanGst && gstDocument) {
        uploadedGstDocument = await uploadDocumentToS3(
          { ...gstDocument, documentType: 'GST' },
          'GST',
          uploadId,
        );
      }

      let uploadedUdyamDocument: KycDocument | null = null;

      if (cleanUdyam && udyamDocument) {
        uploadedUdyamDocument = await uploadDocumentToS3(
          { ...udyamDocument, documentType: 'UDYAM' },
          'UDYAM',
          uploadId,
        );
      }

      const finalKycData = {
        panNumber: cleanPan,
        aadhaarNumber: cleanAadhaar,
        gstNumber: cleanGst,
        shopEstablishmentNumber: cleanShop,
        udyamNumber: cleanUdyam,

        panDocument: sanitizeDocumentForDraft(
          uploadedPanDocument,
        ),
        aadhaarDocument: sanitizeDocumentForDraft(
          uploadedAadhaarDocument,
        ),
        shopEstablishmentDocument: sanitizeDocumentForDraft(
          uploadedShopDocument,
        ),
        gstDocument: sanitizeDocumentForDraft(
          uploadedGstDocument,
        ),
        udyamDocument: sanitizeDocumentForDraft(
          uploadedUdyamDocument,
        ),

        kycUploadId: uploadId,
        kycStatus: 'PENDING' as const,
        kycReferenceId: uploadId,
        kycSubmittedAt: '',
        kycReviewedAt: '',
        kycRejectionReason: '',
        providerStatus: 'NOT_REGISTERED' as const,
      };

      const completeKycData: KycDraft = {
        ...data,
        ...finalKycData,
      };

      latestDraftRef.current = completeKycData;

      // Update the shared registration context with the final values.
      updateData(finalKycData);

      // Update local state to reflect successful uploads.
      setPanDocument(uploadedPanDocument);
      setAadhaarDocument(uploadedAadhaarDocument);
      setShopEstablishmentDocument(uploadedShopDocument);
      setGstDocument(uploadedGstDocument);
      setUdyamDocument(uploadedUdyamDocument);

      /*
       * This final save is serialized behind any already-running autosave.
       * Step 5 remains KYC, and steps 1–5 are marked complete.
       */
      const draftSaved = await saveDraftSafely(
        completeKycData,
        [1, 2, 3, 4, 5],
      );

      if (!draftSaved) {
        finalizingRef.current = false;

        Alert.alert(
          'Draft could not be saved',
          'Your documents were uploaded, but registration progress could not be saved. Please check your connection and try again.',
        );
        return;
      }

      if (!mountedRef.current) {
        return;
      }

      navigation.navigate('SalonReview');
    } catch (error: any) {
      finalizingRef.current = false;

      console.error(
        'KYC submission failed:',
        error?.message || 'Unknown error',
      );

      Alert.alert(
        'Unable to submit documents',
        error?.message ||
          'Something went wrong while uploading your KYC documents. Please try again.',
      );
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        headerTitle="Business Verification"
        backBtn={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Verify your business</Text>

        <Text style={styles.subtitle}>
          Complete your business verification to continue with business
          registration.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner verification</Text>

          <Text style={styles.sectionSubtitle}>
            These details are required to verify the business owner.
          </Text>

          <Text style={styles.inputLabel}>PAN Number *</Text>

          <TextInput
            value={panNumber}
            onChangeText={text =>
              setPanNumber(
                text.toUpperCase().replace(/[^A-Z0-9]/g, ''),
              )
            }
            placeholder="Enter PAN number"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            maxLength={10}
            style={styles.input}
          />

          {renderDocumentPicker(
            'PAN Document',
            panDocument,
            'PAN',
            true,
          )}

          <Text style={styles.inputLabel}>Aadhaar Number *</Text>

          <TextInput
            value={aadhaarNumber}
            onChangeText={text =>
              setAadhaarNumber(text.replace(/\D/g, ''))
            }
            placeholder="Enter 12-digit Aadhaar number"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="number-pad"
            maxLength={12}
            style={styles.input}
          />

          {renderDocumentPicker(
            'Aadhaar Document',
            aadhaarDocument,
            'AADHAAR',
            true,
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business verification</Text>

          <Text style={styles.sectionSubtitle}>
            Provide your business registration documents.
          </Text>

          <Text style={styles.inputLabel}>
            Shop &amp; Establishment Number *
          </Text>

          <TextInput
            value={shopEstablishmentNumber}
            onChangeText={setShopEstablishmentNumber}
            placeholder="Enter registration number"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
          />

          {renderDocumentPicker(
            'Shop & Establishment Document',
            shopEstablishmentDocument,
            'SHOP_ESTABLISHMENT',
            true,
          )}

          <Text style={styles.inputLabel}>
            GSTIN
            <Text style={styles.optionalText}> (Optional)</Text>
          </Text>

          <TextInput
            value={gstNumber}
            onChangeText={text =>
              setGstNumber(
                text.toUpperCase().replace(/[^A-Z0-9]/g, ''),
              )
            }
            placeholder="Enter GSTIN if applicable"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            maxLength={15}
            style={styles.input}
          />

          {renderDocumentPicker(
            'GST Certificate',
            gstDocument,
            'GST',
          )}

          <Text style={styles.inputLabel}>
            Udyam Registration Number
            <Text style={styles.optionalText}> (Optional)</Text>
          </Text>

          <TextInput
            value={udyamNumber}
            onChangeText={text =>
              setUdyamNumber(text.toUpperCase().trim())
            }
            placeholder="Enter Udyam number if applicable"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            style={styles.input}
          />

          {renderDocumentPicker(
            'Udyam Certificate',
            udyamDocument,
            'UDYAM',
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Document requirements</Text>

          <Text style={styles.infoText}>
            • PDF, JPG, PNG or WEBP files are accepted.
          </Text>

          <Text style={styles.infoText}>
            • Maximum file size is 10 MB.
          </Text>

          <Text style={styles.infoText}>
            • PAN, Aadhaar and Shop &amp; Establishment documents are
            required.
          </Text>

          <Text style={styles.infoText}>
            • GST and Udyam documents are optional unless the corresponding
            number is provided.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>

          <Text style={styles.infoText}>
            Your documents will be submitted for verification after you
            continue.
          </Text>

          <Text style={styles.infoText}>
            Your business will remain pending until the verification and
            approval process is completed.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {submitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={COLORS.themeColor}
              />

              <Text style={styles.loadingText}>
                Uploading documents...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleContinue}
              disabled={pickingDocument}
              activeOpacity={0.85}
              style={styles.continueButtonWrapper}
            >
              <AppGradient
                colors={[...GRADIENTS.SOFT_PURPLE]}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>
                  Continue
                </Text>
              </AppGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: SPACING.large,
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  optionalText: {
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    color: COLORS.primary,
    backgroundColor: COLORS.white,
    fontFamily: FONTS.regular,
    fontSize: 15,
    marginBottom: SPACING.medium,
  },
  documentPickerContainer: {
    marginBottom: SPACING.large,
  },
  documentPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  documentLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
  },
  documentPickerButton: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.medium,
    justifyContent: 'center',
  },
  documentPickerButtonSelected: {
    borderColor: COLORS.themeColor,
  },
  documentEmptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentUploadIconGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
    overflow: 'hidden',
  },
  documentUploadIcon: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  documentEmptyTextContainer: {
    flex: 1,
  },
  documentUploadText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  documentUploadSubText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  documentSelectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentSelectedIconGradient: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
    overflow: 'hidden',
  },
  documentSelectedIcon: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  documentSelectedTextContainer: {
    flex: 1,
  },
  documentSelectedText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary,
  },
  documentSelectedSubText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  documentChangeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.themeColor,
    marginLeft: SPACING.small,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
  },
  infoTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.primary,
    marginBottom: SPACING.small,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  buttonContainer: {
    marginTop: SPACING.small,
    width: '100%',
  },
  continueButtonWrapper: {
    width: '100%',
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    minHeight: 48,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: FONTS.semiBold || FONTS.medium,
    fontSize: 15,
    color: COLORS.white,
  },
  loadingContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: SPACING.small,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.themeColor,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default SalonKYCScreen;
