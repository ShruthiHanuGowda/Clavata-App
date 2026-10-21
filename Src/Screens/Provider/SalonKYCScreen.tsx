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
  Image,
} from 'react-native';
import { Header } from '../../components';
import AppGradient from '../../common/AppGradient';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  GRADIENTS,
} from '../../constants/constants';
import { useSalonRegistration, type SalonProfilePhoto } from '../../context/SalonRegistrationContext';
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

// type SalonProfilePhoto = {
//   uri: string;
//   localUri: string;
//   name: string;
//   type: string;
//   size: number;
// };

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
  return segments.includes(documentType);
};

const sanitizeDocumentForDraft = (
  document: KycDocument | null,
): KycDocument | null => {
  if (!document) {
    return null;
  }

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

const getFileUri = (path: string): string => {
  if (!path) {
    return '';
  }

  return path.startsWith('file://') ? path : `file://${path}`;
};

const getSafeFileName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/* ============================================================
   SCREEN
============================================================ */

const SalonKYCScreen = ({ navigation }: any) => {
  const { data, updateData, saveDraft } = useSalonRegistration();
  const CURRENT_STEP = 5;
  const TOTAL_STEPS = 6;

  const progressPercentage = Math.round(
    (CURRENT_STEP / TOTAL_STEPS) * 100,
  );
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

  // Mandatory salon profile photo. It is saved with the draft and
  // uploaded after the backend creates the salonId.
  const [salonProfilePhoto, setSalonProfilePhoto] =
    useState<SalonProfilePhoto | null>(
      data?.salonProfilePhoto || null,
    );

  const [submitting, setSubmitting] = useState(false);
  const [pickingDocument, setPickingDocument] = useState(false);
  const [pickingSalonPhoto, setPickingSalonPhoto] = useState(false);

  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveDraftRef = useRef(saveDraft);
  const draftSaveQueueRef = useRef<Promise<any>>(Promise.resolve());
  const latestDraftRef = useRef<KycDraft | null>(null);
  const finalizingRef = useRef(false);
  const mountedRef = useRef(true);

  saveDraftRef.current = saveDraft;

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
    salonProfilePhoto,
    kycUploadId: data?.kycUploadId || '',
  };

  if (!finalizingRef.current) {
    latestDraftRef.current = {
      ...data,
      ...currentKycData,
    };
  }

  /* ============================================================
     SERIALIZED DRAFT SAVING
  ============================================================ */

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
    salonProfilePhoto,
    updateData,
  ]);

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
        throw new Error('Unable to determine the local file path.');
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
     MANDATORY SALON PROFILE PHOTO PICKER

     This photo is stored in the app's document directory so the
     draft is less dependent on the temporary picker/cache URI.

     The photo is NOT uploaded here because salonId does not exist
     yet. The final registration flow must upload it after creating
     the salon record.
  ============================================================ */

  const pickSalonPhoto = async () => {
    try {
      setPickingSalonPhoto(true);

      const result = await pick({
        type: [types.images],
        allowMultiSelection: false,
      });

      if (!result?.length) {
        return;
      }

      const selected = result[0];
      const originalName =
        selected.name || `business-profile-${Date.now()}.jpg`;
      const extension = originalName.split('.').pop()?.toLowerCase();

      const imageTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
      };

      const contentType =
        imageTypes[extension || ''] ||
        selected.type?.toLowerCase() ||
        '';

      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(
          contentType,
        )
      ) {
        throw new Error(
          'Please select a JPG, PNG or WEBP image.',
        );
      }

      const copiedFiles = await keepLocalCopy({
        files: [
          {
            uri: selected.uri,
            fileName: getSafeFileName(originalName),
          },
        ],
        destination: 'cachesDirectory',
      });

      const copiedFile = copiedFiles[0];

      if (
        copiedFile.status !== 'success' ||
        !copiedFile.localUri
      ) {
        throw new Error(
          'Unable to access the selected photo. Please try again.',
        );
      }

      const temporaryPath = getLocalFilePath(copiedFile.localUri);

      if (!(await RNFS.exists(temporaryPath))) {
        throw new Error(
          'The selected photo could not be accessed.',
        );
      }

      const stat = await RNFS.stat(temporaryPath);
      const actualSize = Number(stat.size);

      if (!actualSize || actualSize <= 0) {
        throw new Error('The selected photo is empty.');
      }

      if (actualSize > MAX_DOCUMENT_SIZE) {
        throw new Error(
          'The business photo must be 10 MB or smaller.',
        );
      }

      // Keep a persistent app-managed copy rather than relying only
      // on the document picker's temporary cache file.
      const persistentFileName =
        `clavata-business-profile-${Date.now()}.${extension || 'jpg'}`;

      const persistentPath =
        `${RNFS.DocumentDirectoryPath}/${persistentFileName}`;

      await RNFS.copyFile(temporaryPath, persistentPath);

      const persistentExists = await RNFS.exists(persistentPath);

      if (!persistentExists) {
        throw new Error(
          'Unable to save the photo for registration recovery.',
        );
      }

      const persistentUri = getFileUri(persistentPath);

      const photo: SalonProfilePhoto = {
        uri: persistentUri,
        localUri: persistentUri,
        name: originalName,
        type: contentType,
        size: actualSize,
      };

      setSalonProfilePhoto(photo);

      // Immediately update the shared context so navigating away
      // does not lose the photo selection.
      updateData({
        salonProfilePhoto: photo,
      });
    } catch (error: any) {
      if (
        error?.code === 'DOCUMENT_PICKER_CANCELED' ||
        error?.code === 'OPERATION_CANCELED'
      ) {
        return;
      }

      console.error(
        'Salon profile photo selection failed:',
        error?.message || 'Unknown error',
      );

      Alert.alert(
        'Unable to select business photo',
        error?.message ||
        'Please select a valid JPG, PNG or WEBP image.',
      );
    } finally {
      setPickingSalonPhoto(false);
    }
  };

  const removeSalonPhoto = () => {
    Alert.alert(
      'Remove business photo?',
      'You must select a business profile photo before continuing.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSalonProfilePhoto(null);
            updateData({
              salonProfilePhoto: null,
            });
          },
        },
      ],
    );
  };

  /* ============================================================
     S3 UPLOAD — KYC DOCUMENTS ONLY
  ============================================================ */

  const uploadDocumentToS3 = async (
    document: KycDocument,
    documentType: KycDocumentType,
    uploadId: string,
  ): Promise<KycDocument> => {
    if (document.s3Key) {
      if (!isValidS3DocumentKey(document.s3Key, documentType)) {
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

    if (!(await RNFS.exists(filePath))) {
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

    if (!isValidS3DocumentKey(response.key, documentType)) {
      throw new Error(
        `The server returned an unexpected storage location for ${documentType}.`,
      );
    }

    const uploadContentType = response.contentType || contentType;

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
        disabled={pickingDocument || pickingSalonPhoto || submitting}
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
     SALON PROFILE PHOTO UI
  ============================================================ */

  const renderSalonProfilePhoto = () => {
    const photoUri =
      salonProfilePhoto?.localUri || salonProfilePhoto?.uri;

    return (
      <View style={styles.salonPhotoSection}>
        <Text style={styles.salonPhotoTitle}>
          Salon Profile Photo *
        </Text>

        <Text style={styles.salonPhotoDescription}>
          Add a clear photo representing your business. This photo will be
          uploaded after your business registration creates its business ID
        </Text>

        {salonProfilePhoto && photoUri ? (
          <View style={styles.salonPhotoPreviewCard}>
            <Image
              source={{ uri: photoUri }}
              style={styles.salonPhotoPreview}
              resizeMode="cover"
              onError={() => {
                console.warn(
                  'Could not display the saved business profile photo',
                );
              }}
            />

            <View style={styles.salonPhotoDetails}>
              <Text
                style={styles.salonPhotoFileName}
                numberOfLines={2}
              >
                {salonProfilePhoto.name}
              </Text>

              <Text style={styles.salonPhotoFileSize}>
                {(salonProfilePhoto.size / (1024 * 1024)).toFixed(2)} MB
              </Text>

              <Text style={styles.salonPhotoPendingText}>
                Selected — upload pending
              </Text>
            </View>

            <View style={styles.salonPhotoActions}>
              <TouchableOpacity
                style={styles.salonPhotoActionButton}
                onPress={pickSalonPhoto}
                disabled={
                  pickingSalonPhoto ||
                  pickingDocument ||
                  submitting
                }
                activeOpacity={0.8}
              >
                <Text style={styles.salonPhotoChangeText}>
                  Change photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.salonPhotoActionButton}
                onPress={removeSalonPhoto}
                disabled={
                  pickingSalonPhoto ||
                  pickingDocument ||
                  submitting
                }
                activeOpacity={0.8}
              >
                <Text style={styles.salonPhotoRemoveText}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.salonPhotoUploadButton}
            onPress={pickSalonPhoto}
            disabled={
              pickingSalonPhoto ||
              pickingDocument ||
              submitting
            }
            activeOpacity={0.85}
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.salonPhotoUploadIcon}
            >
              <Text style={styles.salonPhotoUploadIconText}>↑</Text>
            </AppGradient>

            <View style={styles.salonPhotoUploadTextContainer}>
              <Text style={styles.salonPhotoUploadLabel}>
                {pickingSalonPhoto
                  ? 'Preparing photo...'
                  : 'Choose business photo'}
              </Text>

              <Text style={styles.salonPhotoUploadHint}>
                JPG, PNG or WEBP · Maximum 10 MB
              </Text>
            </View>

            {pickingSalonPhoto ? (
              <ActivityIndicator color={COLORS.themeColor} />
            ) : (
              <Text style={styles.salonPhotoRequiredLabel}>
                Required
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* ============================================================
     CONTINUE
  ============================================================ */

  const handleContinue = async () => {
    if (submitting || pickingDocument || pickingSalonPhoto) {
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
          'Please upload your Udyam certificate because you entered a Udyam number',
        );
        return;
      }

      if (!salonProfilePhoto) {
        Alert.alert(
          'Salon photo required',
          'Please select a business profile photo before continuing',
        );
        return;
      }

      const photoPath = getLocalFilePath(
        salonProfilePhoto.localUri || salonProfilePhoto.uri,
      );

      if (
        !photoPath ||
        !(await RNFS.exists(photoPath))
      ) {
        Alert.alert(
          'Salon photo unavailable',
          'Your saved business photo cannot be accessed. Please select it again',
        );
        return;
      }

      const photoStat = await RNFS.stat(photoPath);
      const actualPhotoSize = Number(photoStat.size);

      if (!actualPhotoSize || actualPhotoSize > MAX_DOCUMENT_SIZE) {
        Alert.alert(
          'Invalid business photo',
          'Please select a valid photo that is no larger than 10 MB',
        );
        return;
      }

      if (!cleanGst && gstDocument) {
        setGstDocument(null);
      }

      if (!cleanUdyam && udyamDocument) {
        setUdyamDocument(null);
      }

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

        // Keep the salon photo in the registration draft. It must
        // be uploaded through the salon-media mutations after the
        // salon record exists and provides a real salonId.
        salonProfilePhoto: {
          ...salonProfilePhoto,
          uri: getFileUri(photoPath),
          localUri: getFileUri(photoPath),
          size: actualPhotoSize,
        },

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

      updateData(finalKycData);

      setPanDocument(uploadedPanDocument);
      setAadhaarDocument(uploadedAadhaarDocument);
      setShopEstablishmentDocument(uploadedShopDocument);
      setGstDocument(uploadedGstDocument);
      setUdyamDocument(uploadedUdyamDocument);

      const draftSaved = await saveDraftSafely(
        completeKycData,
        [1, 2, 3, 4, 5],
      );

      if (!draftSaved) {
        finalizingRef.current = false;

        Alert.alert(
          'Draft could not be saved',
          'Your KYC documents were uploaded, but registration progress could not be saved. Please check your connection and try again.',
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
        <View style={styles.pageHeader}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepLabel}>
              STEP {String(CURRENT_STEP).padStart(2, '0')} OF{' '}
              {String(TOTAL_STEPS).padStart(2, '0')}
            </Text>

            <Text style={styles.progressText}>
              {progressPercentage}% completed
            </Text>
          </View>

          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityLabel={`Registration progress: step ${CURRENT_STEP} of ${TOTAL_STEPS}`}
            accessibilityValue={{
              min: 0,
              max: TOTAL_STEPS,
              now: CURRENT_STEP,
            }}
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            >
              <View style={styles.progressFillContent} />
            </AppGradient>
          </View>
        </View>
        <Text style={styles.title}>Verify your business</Text>

        <Text style={styles.subtitle}>
          Complete your business verification to continue with business
          registration
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner verification</Text>

          <Text style={styles.sectionSubtitle}>
            These details are required to verify the business owner
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
            Provide your business registration documents
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

          {/* Mandatory salon profile photo appears after Udyam. */}
          {renderSalonProfilePhoto()}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Document requirements</Text>

          <Text style={styles.infoText}>
            • PDF, JPG, PNG or WEBP files are accepted for KYC documents
          </Text>

          <Text style={styles.infoText}>
            • Maximum file size is 10 MB.
          </Text>

          <Text style={styles.infoText}>
            • PAN, Aadhaar and Shop &amp; Establishment documents are
            required
          </Text>

          <Text style={styles.infoText}>
            • GST and Udyam documents are optional unless the corresponding
            number is provided
          </Text>

          <Text style={styles.infoText}>
            • A business profile photo is mandatory
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>

          <Text style={styles.infoText}>
            Your KYC documents will be uploaded when you continue. Your
            selected business photo will be retained in your registration
            draft and uploaded after the business record is created
          </Text>

          <Text style={styles.infoText}>
            Your business will remain pending until the verification and
            approval process is completed
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
                Uploading KYC documents...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleContinue}
              disabled={pickingDocument || pickingSalonPhoto}
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

  /* Salon profile photo */
  salonPhotoSection: {
    marginTop: SPACING.small,
    marginBottom: SPACING.large,
  },
  salonPhotoTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  salonPhotoDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  salonPhotoUploadButton: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.themeColor,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
  },
  salonPhotoUploadIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
    overflow: 'hidden',
  },
  salonPhotoUploadIconText: {
    fontFamily: FONTS.bold,
    fontSize: 23,
    color: COLORS.white,
  },
  salonPhotoUploadTextContainer: {
    flex: 1,
  },
  salonPhotoUploadLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  salonPhotoUploadHint: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  salonPhotoRequiredLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.themeColor,
    marginLeft: SPACING.small,
  },
  salonPhotoPreviewCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
  },
  salonPhotoPreview: {
    width: '100%',
    height: 190,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.medium,
  },
  salonPhotoDetails: {
    marginBottom: SPACING.small,
  },
  salonPhotoFileName: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 4,
  },
  salonPhotoFileSize: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  salonPhotoPendingText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.themeColor,
  },
  salonPhotoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.small,
  },
  salonPhotoActionButton: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.small,
  },
  salonPhotoChangeText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.themeColor,
  },
  salonPhotoRemoveText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#C62828',
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
  pageHeader: {
    marginBottom: SPACING.large,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  stepLabel: {
    fontFamily: FONTS.semiBold || FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: '#8B5CF6',
  },
  progressText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.medium,
  },
  progressFillContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default SalonKYCScreen;