import React, { useState } from 'react';
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
import { Header, DButton } from '../../components';
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';
import {
  useSalonRegistration,
} from '../../context/SalonRegistrationContext';
import {
  pick,
  keepLocalCopy,
  types,
} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  gql,
  useMutation,
} from '@apollo/client';
const GENERATE_KYC_DOCUMENT_UPLOAD_URL = gql`
  mutation GenerateKycDocumentUploadUrl(
    $input: GenerateKycDocumentUploadUrlInput!
  ) {
    generateKycDocumentUploadUrl(
      input: $input
    ) {
      success
      message
      uploadUrl
      key
      contentType
      expiresIn
    }
  }
`;
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
const SalonKYCScreen = ({
  navigation,
}: any) => {
  const {
    data,
    updateData,
  } = useSalonRegistration();
  const [
    generateKycDocumentUploadUrl,
  ] = useMutation<
    GenerateKycDocumentUploadUrlResponse
  >(
    GENERATE_KYC_DOCUMENT_UPLOAD_URL,
  );
  const [
    panNumber,
    setPanNumber,
  ] = useState(
    data?.panNumber || '',
  );
  const [
    aadhaarNumber,
    setAadhaarNumber,
  ] = useState(
    data?.aadhaarNumber || '',
  );
  const [
    gstNumber,
    setGstNumber,
  ] = useState(
    data?.gstNumber || '',
  );
  const [
    shopEstablishmentNumber,
    setShopEstablishmentNumber,
  ] = useState(
    data?.shopEstablishmentNumber || '',
  );
  const [
    udyamNumber,
    setUdyamNumber,
  ] = useState(
    data?.udyamNumber || '',
  );
  const [
    panDocument,
    setPanDocument,
  ] = useState<KycDocument | null>(
    data?.panDocument || null,
  );
  const [
    aadhaarDocument,
    setAadhaarDocument,
  ] = useState<KycDocument | null>(
    data?.aadhaarDocument || null,
  );
  const [
    shopEstablishmentDocument,
    setShopEstablishmentDocument,
  ] = useState<KycDocument | null>(
    data?.shopEstablishmentDocument || null,
  );
  const [
    gstDocument,
    setGstDocument,
  ] = useState<KycDocument | null>(
    data?.gstDocument || null,
  );
  const [
    udyamDocument,
    setUdyamDocument,
  ] = useState<KycDocument | null>(
    data?.udyamDocument || null,
  );
  const [
    submitting,
    setSubmitting,
  ] = useState(false);
  const [
    pickingDocument,
    setPickingDocument,
  ] = useState(false);
  const createUploadId = () => {
    const timestamp =
      Date.now().toString(36);
    const randomPart =
      Math.random()
        .toString(36)
        .substring(2, 12);
    return `REG-${timestamp}-${randomPart}`;
  };
  const getContentType = (
    fileName: string,
    providedType?: string | null,
  ): string => {
    if (
      providedType &&
      providedType.trim()
    ) {
      return providedType
        .trim()
        .toLowerCase();
    }
    const extension =
      fileName
        .split('.')
        .pop()
        ?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  };
  const getLocalFilePath = (
    fileUri: string,
  ): string => {
    if (!fileUri) {
      return '';
    }
    if (
      fileUri.startsWith('file://')
    ) {
      return fileUri.substring(7);
    }
    return fileUri;
  };
  const pickKycDocument = async (
    documentType: KycDocumentType,
  ) => {
    try {
      setPickingDocument(true);
      const result = await pick({
        type: [
          types.pdf,
          types.images,
        ],
        allowMultiSelection: false,
      });
      if (
        !result ||
        result.length === 0
      ) {
        return;
      }
      const selected =
        result[0];
      const fileName =
        selected.name ||
        `${documentType.toLowerCase()}-document`;
      console.log(
        '======================================',
      );
      console.log(
        '📄 SELECTED DOCUMENT:',
        {
          documentType,
          uri: selected.uri,
          name: selected.name,
          type: selected.type,
          size: selected.size,
        },
      );
      const localCopy =
        await keepLocalCopy({
          files: [
            {
              uri: selected.uri,
              fileName,
            },
          ],
          destination: 'cachesDirectory',
        });
      const copiedFile =
        localCopy[0];
      if (
        copiedFile.status !== 'success' ||
        !copiedFile.localUri
      ) {
        throw new Error(
          'Unable to create a local copy of the selected document.',
        );
      }
      console.log(
        '📂 LOCAL COPY:',
        copiedFile.localUri,
      );
      const localPath =
        getLocalFilePath(
          copiedFile.localUri,
        );
      console.log(
        '📂 NORMALIZED LOCAL PATH:',
        localPath,
      );
      if (!localPath) {
        throw new Error(
          'Unable to determine the local file path.',
        );
      }
      const exists =
        await RNFS.exists(
          localPath,
        );
      console.log(
        '📂 LOCAL FILE EXISTS:',
        exists,
      );
      if (!exists) {
        throw new Error(
          'The selected document could not be accessed after copying it.',
        );
      }
      const stat =
        await RNFS.stat(
          localPath,
        );
      console.log(
        '📂 LOCAL FILE SIZE:',
        stat.size,
      );
      if (
        !Number(stat.size) ||
        Number(stat.size) <= 0
      ) {
        throw new Error(
          'The selected document is empty.',
        );
      }
      if (
        Number(stat.size) >
        10 * 1024 * 1024
      ) {
        throw new Error(
          `${fileName} is larger than the 10 MB limit.`,
        );
      }
      const selectedDocument: KycDocument = {
        uri: selected.uri,
        localUri:
          copiedFile.localUri,
        name: fileName,
        type: selected.type,
        size:
          selected.size ??
          Number(stat.size),
        documentType,
      };
      switch (documentType) {
        case 'PAN':
          setPanDocument(
            selectedDocument,
          );
          break;
        case 'AADHAAR':
          setAadhaarDocument(
            selectedDocument,
          );
          break;
        case 'SHOP_ESTABLISHMENT':
          setShopEstablishmentDocument(
            selectedDocument,
          );
          break;
        case 'GST':
          setGstDocument(
            selectedDocument,
          );
          break;
        case 'UDYAM':
          setUdyamDocument(
            selectedDocument,
          );
          break;
      }
      console.log(
        '======================================',
      );
      console.log(
        `🔄 ${documentType} document selected/replaced.`,
      );
      console.log(
        '🔄 Existing S3 key cleared for this document.',
      );
      console.log(
        '======================================',
      );
    } catch (error: any) {
      if (
        error?.code ===
        'DOCUMENT_PICKER_CANCELED'
      ) {
        return;
      }
      console.error(
        '❌ DOCUMENT PICK ERROR:',
        error,
      );
      Alert.alert(
        'Unable to select document',
        error?.message ||
        'Please try again.',
      );
    } finally {
      setPickingDocument(false);
    }
  };
  const uploadDocumentToS3 = async (
    document: KycDocument,
    documentType: KycDocumentType,
    uploadId: string,
  ): Promise<KycDocument> => {
    try {
      if (document.s3Key) {
        console.log(
          '======================================',
        );
        console.log(
          `⏭️ ${documentType} ALREADY UPLOADED`,
        );
        console.log(
          '⏭️ EXISTING S3 KEY:',
          document.s3Key,
        );
        console.log(
          '⏭️ SKIPPING S3 UPLOAD',
        );
        console.log(
          '======================================',
        );
        return {
          ...document,
          uploadId:
            document.uploadId ||
            uploadId,
          documentType,
        };
      }
      console.log(
        '======================================',
      );
      console.log(
        '📤 STARTING S3 KYC UPLOAD',
      );
      console.log(
        '📄 DOCUMENT TYPE:',
        documentType,
      );
      console.log(
        '📄 FILE NAME:',
        document.name,
      );
      console.log(
        '📄 ORIGINAL URI:',
        document.uri,
      );
      console.log(
        '📄 LOCAL URI:',
        document.localUri,
      );
      console.log(
        '🆔 UPLOAD ID:',
        uploadId,
      );
      console.log(
        '======================================',
      );
      if (!document.localUri) {
        throw new Error(
          `No local cached file available for ${document.name}. Please select the document again.`,
        );
      }
      const filePath =
        getLocalFilePath(
          document.localUri,
        );
      console.log(
        '📂 FINAL LOCAL FILE PATH:',
        filePath,
      );
      if (!filePath) {
        throw new Error(
          `Invalid local file path for ${document.name}.`,
        );
      }
      if (
        filePath.startsWith('http://') ||
        filePath.startsWith('https://') ||
        filePath.startsWith('content://')
      ) {
        throw new Error(
          `Invalid local file path for ${document.name}. A local filesystem path is required.`,
        );
      }
      const fileExists =
        await RNFS.exists(
          filePath,
        );
      console.log(
        '📂 FILE EXISTS:',
        fileExists,
      );
      if (!fileExists) {
        throw new Error(
          `Local file does not exist: ${filePath}`,
        );
      }
      const stat =
        await RNFS.stat(
          filePath,
        );
      const actualFileSize =
        Number(stat.size);
      console.log(
        '📂 ACTUAL FILE SIZE:',
        actualFileSize,
      );
      if (
        !actualFileSize ||
        actualFileSize <= 0
      ) {
        throw new Error(
          `Local file is empty: ${document.name}`,
        );
      }
      if (
        actualFileSize >
        10 * 1024 * 1024
      ) {
        throw new Error(
          `${document.name} is larger than the 10 MB limit.`,
        );
      }
      const contentType =
        getContentType(
          document.name,
          document.type,
        );
      console.log(
        '📄 CONTENT TYPE:',
        contentType,
      );
      console.log(
        '🔐 Generating presigned S3 URL...',
      );
      console.log(
        '🔐 REQUEST DOCUMENT TYPE:',
        documentType,
      );
      console.log(
        '🔐 REQUEST UPLOAD ID:',
        uploadId,
      );
      console.log(
        '🔐 REQUEST FILE NAME:',
        document.name,
      );
      const {
        data: mutationData,
      } =
        await generateKycDocumentUploadUrl({
          variables: {
            input: {
              uploadId,
              documentType,
              fileName:
                document.name,
              contentType,
              fileSize:
                actualFileSize,
            },
          },
        });
      const response =
        mutationData
          ?.generateKycDocumentUploadUrl;
      console.log(
        '🔐 PRESIGNED URL RESPONSE:',
        {
          success:
            response?.success,
          key:
            response?.key,
          contentType:
            response?.contentType,
          expiresIn:
            response?.expiresIn,
          hasUploadUrl:
            !!response?.uploadUrl,
        },
      );
      if (!response?.success) {
        throw new Error(
          response?.message ||
          `Failed to generate upload URL for ${document.name}`,
        );
      }
      if (!response.uploadUrl) {
        throw new Error(
          `No upload URL returned for ${document.name}`,
        );
      }
      if (!response.key) {
        throw new Error(
          `No S3 key returned for ${document.name}`,
        );
      }
      const keyParts =
        String(response.key)
          .split('/')
          .filter(Boolean);
      const returnedDocumentType =
        keyParts[3] || '';
      console.log(
        '🔎 S3 KEY DOCUMENT TYPE:',
        {
          requested:
            documentType,
          returned:
            returnedDocumentType,
          key:
            response.key,
        },
      );
      if (
        returnedDocumentType !==
        documentType
      ) {
        console.error(
          '❌ S3 KEY DOCUMENT TYPE MISMATCH',
          {
            documentType,
            returnedDocumentType,
            returnedKey:
              response.key,
            uploadId,
            fileName:
              document.name,
          },
        );
        throw new Error(
          `S3 returned an incorrect document path for ${document.name}. Expected ${documentType} folder but received ${returnedDocumentType || 'unknown'}.`,
        );
      }
      console.log(
        '✅ S3 DOCUMENT TYPE VERIFIED:',
        documentType,
      );
      console.log(
        '☁️ S3 KEY:',
        response.key,
      );
      const uploadContentType =
        response.contentType ||
        contentType;
      console.log(
        '☁️ S3 UPLOAD CONTENT TYPE:',
        uploadContentType,
      );
      console.log(
        '☁️ STARTING DIRECT S3 PUT...',
      );
      console.log(
        '☁️ FILE:',
        filePath,
      );
      console.log(
        '☁️ FILE SIZE:',
        actualFileSize,
      );
      console.log(
        '☁️ CONTENT TYPE:',
        uploadContentType,
      );
      const uploadTask =
        ReactNativeBlobUtil
          .config({
            fileCache: false,
            followRedirect: true,
            timeout: 120000,
          })
          .fetch(
            'PUT',
            response.uploadUrl,
            {
              'Content-Type':
                uploadContentType,
            },
            ReactNativeBlobUtil.wrap(
              filePath,
            ),
          );
      const uploadResponse =
        await uploadTask.uploadProgress(
          {
            interval: 250,
          },
          (
            written,
            total,
          ) => {
            const percentage =
              total > 0
                ? Math.min(
                  100,
                  Math.round(
                    (written /
                      total) *
                    100,
                  ),
                )
                : 0;
            console.log(
              `☁️ S3 KYC UPLOAD PROGRESS: ${percentage}% (${written}/${total})`,
            );
          },
        );
      const uploadInfo =
        uploadResponse.info();
      console.log(
        '======================================',
      );
      console.log(
        '☁️ S3 UPLOAD RESPONSE',
      );
      console.log(
        '☁️ STATUS:',
        uploadInfo.status,
      );
      console.log(
        '☁️ HEADERS:',
        uploadInfo.headers,
      );
      let responseBody: any = '';
      try {
        responseBody =
          uploadResponse.text();
      } catch {
        responseBody = '';
      }
      console.log(
        '☁️ RESPONSE BODY:',
        responseBody,
      );
      console.log(
        '======================================',
      );
      if (
        uploadInfo.status < 200 ||
        uploadInfo.status >= 300
      ) {
        console.error(
          '❌ S3 UPLOAD FAILED:',
          {
            status:
              uploadInfo.status,
            body:
              responseBody,
          },
        );
        throw new Error(
          `S3 upload failed for ${document.name}. HTTP ${uploadInfo.status}${responseBody ? `: ${responseBody}` : ''}`,
        );
      }
      console.log(
        '======================================',
      );
      console.log(
        `✅ S3 UPLOAD SUCCESS: ${document.name}`,
      );
      console.log(
        '✅ DOCUMENT TYPE:',
        documentType,
      );
      console.log(
        '✅ S3 KEY:',
        response.key,
      );
      console.log(
        '======================================',
      );
      return {
        ...document,
        type:
          uploadContentType,
        size:
          actualFileSize,
        uploadId,
        s3Key:
          response.key,
        documentType,
        localUri:
          filePath,
      };
    } catch (error: any) {
      console.error(
        '======================================',
      );
      console.error(
        '❌ S3 KYC BINARY UPLOAD ERROR:',
        error,
      );
      console.error(
        '❌ MESSAGE:',
        error?.message,
      );
      console.error(
        '❌ DESCRIPTION:',
        error?.description,
      );
      console.error(
        '❌ DOCUMENT TYPE:',
        documentType,
      );
      console.error(
        '❌ UPLOAD ID:',
        uploadId,
      );
      console.error(
        '❌ FILE NAME:',
        document.name,
      );
      console.error(
        '❌ FILE PATH:',
        document.localUri,
      );
      let fileExists = false;
      try {
        if (
          document.localUri
        ) {
          const errorFilePath =
            getLocalFilePath(
              document.localUri,
            );
          if (
            !errorFilePath.startsWith(
              'http://',
            ) &&
            !errorFilePath.startsWith(
              'https://',
            ) &&
            !errorFilePath.startsWith(
              'content://',
            )
          ) {
            fileExists =
              await RNFS.exists(
                errorFilePath,
              );
          }
        }
      } catch {
        fileExists = false;
      }
      console.error(
        '❌ FILE EXISTS:',
        fileExists,
      );
      console.error(
        '======================================',
      );
      throw new Error(
        `Unable to upload ${document.name} to document storage. ${error?.message ||
        'Unknown upload error'
        }`,
      );
    }
  };
  const renderDocumentPicker = (
    label: string,
    document: KycDocument | null,
    documentType: KycDocumentType,
    required = false,
  ) => {
    return (
      <View
        style={
          styles.documentPickerContainer
        }
      >
        <View
          style={
            styles.documentPickerHeader
          }
        >
          <Text
            style={
              styles.documentLabel
            }
          >
            {label}
            {required ? ' *' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.documentPickerButton,
            document &&
            styles.documentPickerButtonSelected,
          ]}
          onPress={() =>
            pickKycDocument(
              documentType,
            )
          }
          disabled={
            pickingDocument ||
            submitting
          }
        >
          {document ? (
            <View
              style={
                styles.documentSelectedContent
              }
            >
              <Text
                style={
                  styles.documentSelectedIcon
                }
              >
                ✓
              </Text>
              <View
                style={
                  styles.documentSelectedTextContainer
                }
              >
                <Text
                  style={
                    styles.documentSelectedText
                  }
                  numberOfLines={1}
                >
                  {document.name}
                </Text>
                <Text
                  style={
                    styles.documentSelectedSubText
                  }
                >
                  {document.s3Key
                    ? 'Document uploaded'
                    : 'Document selected'}
                </Text>
              </View>
              <Text
                style={
                  styles.documentChangeText
                }
              >
                Change
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.documentEmptyContent
              }
            >
              <Text
                style={
                  styles.documentUploadIcon
                }
              >
                ↑
              </Text>
              <View
                style={
                  styles.documentEmptyTextContainer
                }
              >
                <Text
                  style={
                    styles.documentUploadText
                  }
                >
                  Upload document
                </Text>
                <Text
                  style={
                    styles.documentUploadSubText
                  }
                >
                  PDF, JPG, PNG 
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  const handleContinue = async () => {
    try {
      setSubmitting(true);
      const cleanPan =
        panNumber
          .trim()
          .toUpperCase();
      const cleanAadhaar =
        aadhaarNumber.replace(
          /\D/g,
          '',
        );
      const cleanGst =
        gstNumber
          .trim()
          .toUpperCase();
      const cleanShop =
        shopEstablishmentNumber.trim();
      const cleanUdyam =
        udyamNumber
          .trim()
          .toUpperCase();
      const panRegex =
        /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (
        !panRegex.test(
          cleanPan,
        )
      ) {
        Alert.alert(
          'Invalid PAN',
          'Please enter a valid PAN number.',
        );
        return;
      }
      const aadhaarRegex =
        /^\d{12}$/;
      if (
        !aadhaarRegex.test(
          cleanAadhaar,
        )
      ) {
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
      if (
        !shopEstablishmentDocument
      ) {
        Alert.alert(
          'Shop & Establishment document required',
          'Please upload your Shop & Establishment document.',
        );
        return;
      }
      if (
        cleanGst &&
        !gstDocument
      ) {
        Alert.alert(
          'GST document required',
          'Please upload your GST certificate because you entered a GSTIN.',
        );
        return;
      }
      if (
        cleanUdyam &&
        !udyamDocument
      ) {
        Alert.alert(
          'Udyam document required',
          'Please upload your Udyam certificate because you entered a Udyam number.',
        );
        return;
      }
      const existingUploadId =
        data?.kycUploadId ||
        panDocument?.uploadId ||
        aadhaarDocument?.uploadId ||
        shopEstablishmentDocument?.uploadId ||
        gstDocument?.uploadId ||
        udyamDocument?.uploadId;
      const uploadId =
        existingUploadId ||
        createUploadId();
      console.log(
        '======================================',
      );
      console.log(
        '🚀 STARTING KYC DOCUMENT PROCESSING',
      );
      console.log(
        '🆔 KYC UPLOAD ID:',
        uploadId,
      );
      console.log(
        '📌 EXISTING KYC UPLOAD ID:',
        existingUploadId || 'NONE - NEW KYC',
      );
      console.log(
        '======================================',
      );
      console.log(
        '🔵 PROCESSING PAN...',
      );
      const uploadedPanDocument =
        await uploadDocumentToS3(
          {
            ...panDocument,
            documentType: 'PAN',
          },
          'PAN',
          uploadId,
        );
      console.log(
        '🟢 PROCESSING AADHAAR...',
      );
      const uploadedAadhaarDocument =
        await uploadDocumentToS3(
          {
            ...aadhaarDocument,
            documentType: 'AADHAAR',
          },
          'AADHAAR',
          uploadId,
        );
      console.log(
        '🟠 PROCESSING SHOP & ESTABLISHMENT...',
      );
      const uploadedShopDocument =
        await uploadDocumentToS3(
          {
            ...shopEstablishmentDocument,
            documentType:
              'SHOP_ESTABLISHMENT',
          },
          'SHOP_ESTABLISHMENT',
          uploadId,
        );
      let uploadedGstDocument:
        | KycDocument
        | null = null;
      if (
        cleanGst &&
        gstDocument
      ) {
        console.log(
          '🟣 PROCESSING GST...',
        );
        uploadedGstDocument =
          await uploadDocumentToS3(
            {
              ...gstDocument,
              documentType: 'GST',
            },
            'GST',
            uploadId,
          );
      }
      let uploadedUdyamDocument:
        | KycDocument
        | null = null;
      if (
        cleanUdyam &&
        udyamDocument
      ) {
        console.log(
          '🟡 PROCESSING UDYAM...',
        );
        uploadedUdyamDocument =
          await uploadDocumentToS3(
            {
              ...udyamDocument,
              documentType: 'UDYAM',
            },
            'UDYAM',
            uploadId,
          );
      }
      updateData({
        panNumber:
          cleanPan,
        aadhaarNumber:
          cleanAadhaar,
        gstNumber:
          cleanGst,
        shopEstablishmentNumber:
          cleanShop,
        udyamNumber:
          cleanUdyam,
        panDocument:
          uploadedPanDocument,
        aadhaarDocument:
          uploadedAadhaarDocument,
        shopEstablishmentDocument:
          uploadedShopDocument,
        gstDocument:
          uploadedGstDocument,
        udyamDocument:
          uploadedUdyamDocument,
        kycUploadId:
          uploadId,
        kycStatus:
          'PENDING',
        kycReferenceId:
          uploadId,
        kycSubmittedAt:
          '',
        kycReviewedAt:
          '',
        kycRejectionReason:
          '',
        providerStatus:
          'NOT_REGISTERED',
      });
      console.log(
        '======================================',
      );
      console.log(
        '✅ KYC DOCUMENT PROCESSING COMPLETE',
      );
      console.log(
        '🆔 KYC UPLOAD ID:',
        uploadId,
      );
      console.log(
        '📄 PAN S3 KEY:',
        uploadedPanDocument.s3Key,
      );
      console.log(
        '📄 AADHAAR S3 KEY:',
        uploadedAadhaarDocument.s3Key,
      );
      console.log(
        '📄 SHOP S3 KEY:',
        uploadedShopDocument.s3Key,
      );
      if (uploadedGstDocument) {
        console.log(
          '📄 GST S3 KEY:',
          uploadedGstDocument.s3Key,
        );
      }
      if (uploadedUdyamDocument) {
        console.log(
          '📄 UDYAM S3 KEY:',
          uploadedUdyamDocument.s3Key,
        );
      }
      console.log(
        '======================================',
      );
      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            300,
          ),
      );
      navigation.navigate(
        'SalonReview',
      );
    } catch (error: any) {
      console.error(
        '======================================',
      );
      console.error(
        '❌ KYC UPLOAD / CONTINUE ERROR:',
        error,
      );
      console.error(
        '❌ KYC ERROR MESSAGE:',
        error?.message,
      );
      console.error(
        '======================================',
      );
      Alert.alert(
        'Unable to upload documents',
        error?.message ||
        'Something went wrong while uploading your KYC documents. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <Header
        headerTitle="Business Verification"
        backBtn={() =>
          navigation.goBack()
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Verify your business
        </Text>
        <Text style={styles.subtitle}>
          Complete your business verification
          to continue with business registration.
        </Text>
        {}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Owner verification
          </Text>
          <Text
            style={styles.sectionSubtitle}
          >
            These details are required to verify
            the business owner.
          </Text>
          {}
          <Text
            style={styles.inputLabel}
          >
            PAN Number *
          </Text>
          <TextInput
            value={panNumber}
            onChangeText={text =>
              setPanNumber(
                text
                  .toUpperCase()
                  .replace(
                    /[^A-Z0-9]/g,
                    '',
                  ),
              )
            }
            placeholder="Enter PAN number"
            placeholderTextColor={
              COLORS.textSecondary
            }
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
          {}
          <Text
            style={styles.inputLabel}
          >
            Aadhaar Number *
          </Text>
          <TextInput
            value={aadhaarNumber}
            onChangeText={text =>
              setAadhaarNumber(
                text.replace(
                  /\D/g,
                  '',
                ),
              )
            }
            placeholder="Enter 12-digit Aadhaar number"
            placeholderTextColor={
              COLORS.textSecondary
            }
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
        {}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Business verification
          </Text>
          <Text
            style={styles.sectionSubtitle}
          >
            Provide your business registration
            documents.
          </Text>
          {}
          <Text
            style={styles.inputLabel}
          >
            Shop & Establishment Number *
          </Text>
          <TextInput
            value={
              shopEstablishmentNumber
            }
            onChangeText={
              setShopEstablishmentNumber
            }
            placeholder="Enter registration number"
            placeholderTextColor={
              COLORS.textSecondary
            }
            style={styles.input}
          />
          {renderDocumentPicker(
            'Shop & Establishment Document',
            shopEstablishmentDocument,
            'SHOP_ESTABLISHMENT',
            true,
          )}
          {}
          <Text
            style={styles.inputLabel}
          >
            GSTIN
            <Text
              style={
                styles.optionalText
              }
            >
              {' '}
              (Optional)
            </Text>
          </Text>
          <TextInput
            value={gstNumber}
            onChangeText={text =>
              setGstNumber(
                text
                  .toUpperCase()
                  .replace(
                    /[^A-Z0-9]/g,
                    '',
                  ),
              )
            }
            placeholder="Enter GSTIN if applicable"
            placeholderTextColor={
              COLORS.textSecondary
            }
            autoCapitalize="characters"
            style={styles.input}
          />
          {renderDocumentPicker(
            'GST Certificate',
            gstDocument,
            'GST',
            false,
          )}
          {}
          <Text
            style={styles.inputLabel}
          >
            Udyam Registration Number
            <Text
              style={
                styles.optionalText
              }
            >
              {' '}
              (Optional)
            </Text>
          </Text>
          <TextInput
            value={udyamNumber}
            onChangeText={text =>
              setUdyamNumber(
                text
                  .toUpperCase()
                  .trim(),
              )
            }
            placeholder="Enter Udyam number if applicable"
            placeholderTextColor={
              COLORS.textSecondary
            }
            autoCapitalize="characters"
            style={styles.input}
          />
          {renderDocumentPicker(
            'Udyam Certificate',
            udyamDocument,
            'UDYAM',
            false,
          )}
        </View>
        {}
        <View
          style={styles.infoCard}
        >
          <Text
            style={styles.infoTitle}
          >
            Document requirements
          </Text>
          <Text
            style={styles.infoText}
          >
            • PDF, JPG, PNG files are
            accepted.
          </Text>
          <Text
            style={styles.infoText}
          >
            • Maximum file size is 10 MB.
          </Text>
          <Text
            style={styles.infoText}
          >
            • PAN, Aadhaar and Shop &
            Establishment documents are required.
          </Text>
          <Text
            style={styles.infoText}
          >
            • GST and Udyam documents are
            optional unless the corresponding
            number is provided.
          </Text>
        </View>
        {}
        <View
          style={styles.infoCard}
        >
          <Text
            style={styles.infoTitle}
          >
            What happens next?
          </Text>
          <Text
            style={styles.infoText}
          >
            Your documents will be submitted
            for verification after you continue.
          </Text>
          <Text
            style={styles.infoText}
          >
            Your business will remain pending until
            the verification and approval process
            is completed.
          </Text>
        </View>
        {}
        <View
          style={styles.buttonContainer}
        >
          {submitting ? (
            <View
              style={
                styles.loadingContainer
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
                Uploading documents...
              </Text>
            </View>
          ) : (
            <DButton
              onPress={handleContinue}
              disabled={
                submitting ||
                pickingDocument
              }
              style={{
                width: '100%',
                alignSelf: 'stretch',
                backgroundColor:
                  COLORS.themeColor,
              }}
            >
              Continue
            </DButton>
          )}
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
      SPACING.large,
    paddingTop:
      SPACING.large,
    paddingBottom:
      SPACING.xl,
  },
  title: {
    fontFamily:
      FONTS.bold,
    fontSize: 20,
    color:
      COLORS.primary,
    marginBottom:
      SPACING.xs,
  },
  subtitle: {
    fontFamily:
      FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    color:
      COLORS.textSecondary,
    marginBottom:
      SPACING.xl,
  },
  section: {
    marginBottom:
      SPACING.xl,
  },
  sectionTitle: {
    fontFamily:
      FONTS.bold,
    fontSize: 18,
    color:
      COLORS.primary,
    marginBottom:
      SPACING.xs,
  },
  sectionSubtitle: {
    fontFamily:
      FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color:
      COLORS.textSecondary,
    marginBottom:
      SPACING.large,
  },
  inputLabel: {
    fontFamily:
      FONTS.medium,
    fontSize: 14,
    color:
      COLORS.primary,
    marginBottom:
      SPACING.xs,
  },
  optionalText: {
    fontFamily:
      FONTS.regular,
    color:
      COLORS.textSecondary,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      RADIUS.medium,
    paddingHorizontal:
      SPACING.medium,
    color:
      COLORS.primary,
    backgroundColor:
      COLORS.white,
    fontFamily:
      FONTS.regular,
    fontSize: 15,
    marginBottom:
      SPACING.medium,
  },
  documentPickerContainer: {
    marginBottom:
      SPACING.large,
  },
  documentPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:
      SPACING.xs,
  },
  documentLabel: {
    fontFamily:
      FONTS.medium,
    fontSize: 14,
    color:
      COLORS.primary,
  },
  documentPickerButton: {
    minHeight: 64,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      RADIUS.medium,
    backgroundColor:
      COLORS.white,
    paddingHorizontal:
      SPACING.medium,
    justifyContent:
      'center',
  },
  documentPickerButtonSelected: {
    borderColor:
      COLORS.themeColor,
  },
  documentEmptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentUploadIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      COLORS.themeColor,
    color:
      COLORS.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 22,
    fontFamily:
      FONTS.bold,
    marginRight:
      SPACING.medium,
    overflow: 'hidden',
  },
  documentEmptyTextContainer: {
    flex: 1,
  },
  documentUploadText: {
    fontFamily:
      FONTS.medium,
    fontSize: 14,
    color:
      COLORS.primary,
    marginBottom: 2,
  },
  documentUploadSubText: {
    fontFamily:
      FONTS.regular,
    fontSize: 12,
    color:
      COLORS.textSecondary,
  },
  documentSelectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentSelectedIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      COLORS.themeColor,
    color:
      COLORS.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    fontFamily:
      FONTS.bold,
    marginRight:
      SPACING.medium,
    overflow: 'hidden',
  },
  documentSelectedTextContainer: {
    flex: 1,
  },
  documentSelectedText: {
    fontFamily:
      FONTS.medium,
    fontSize: 13,
    color:
      COLORS.primary,
  },
  documentSelectedSubText: {
    fontFamily:
      FONTS.regular,
    fontSize: 11,
    color:
      COLORS.textSecondary,
    marginTop: 2,
  },
  documentChangeText: {
    fontFamily:
      FONTS.medium,
    fontSize: 12,
    color:
      COLORS.themeColor,
    marginLeft:
      SPACING.small,
  },
  infoCard: {
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      RADIUS.medium,
    padding:
      SPACING.medium,
    marginBottom:
      SPACING.large,
  },
  infoTitle: {
    fontFamily:
      FONTS.bold,
    fontSize: 15,
    color:
      COLORS.primary,
    marginBottom:
      SPACING.small,
  },
  infoText: {
    fontFamily:
      FONTS.regular,
    fontSize: 13,
    lineHeight: 20,
    color:
      COLORS.textSecondary,
    marginBottom:
      SPACING.xs,
  },
  buttonContainer: {
    marginTop:
      SPACING.small,
    width: '100%',
  },
  loadingContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
  },
  loadingText: {
    marginLeft:
      SPACING.small,
    fontFamily:
      FONTS.medium,
    fontSize: 14,
    color:
      COLORS.themeColor,
  },
  bottomSpacing: {
    height:
      SPACING.xl,
  },
});
export default SalonKYCScreen;
