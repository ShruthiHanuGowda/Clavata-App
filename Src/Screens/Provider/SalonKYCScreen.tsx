import React, {
  useState,
} from 'react';

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

import {
  Header,
  DButton,
} from '../../components';

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
  types,
} from '@react-native-documents/picker';

import {
  gql,
  useMutation,
} from '@apollo/client';

// ============================================================
// GRAPHQL
// ============================================================

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

// ============================================================
// DOCUMENT TYPE
// ============================================================

type KycDocumentType =
  | 'PAN'
  | 'AADHAAR'
  | 'SHOP_ESTABLISHMENT'
  | 'GST'
  | 'UDYAM';

type KycDocument = {
  uri: string;
  name: string;
  type?: string | null;
  size?: number | null;

  // ==========================================================
  // S3 UPLOAD INFORMATION
  // ==========================================================

  uploadId?: string;

  s3Key?: string;

  documentType?: KycDocumentType;
};

// ============================================================
// UPLOAD RESPONSE
// ============================================================

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

// ============================================================
// SCREEN
// ============================================================

export default function SalonKYCScreen({
  navigation,
}: any) {

  const {
    data,
    updateData,
  } = useSalonRegistration();

  // ==========================================================
  // GRAPHQL
  // ==========================================================

  const [
    generateKycDocumentUploadUrl,
  ] =
    useMutation<
      GenerateKycDocumentUploadUrlResponse
    >(
      GENERATE_KYC_DOCUMENT_UPLOAD_URL,
    );

  // ==========================================================
  // KYC STATE
  // ==========================================================

  const [
    panNumber,
    setPanNumber,
  ] = useState('');

  const [
    aadhaarNumber,
    setAadhaarNumber,
  ] = useState('');

  const [
    gstNumber,
    setGstNumber,
  ] = useState('');

  const [
    shopEstablishmentNumber,
    setShopEstablishmentNumber,
  ] = useState('');

  const [
    udyamNumber,
    setUdyamNumber,
  ] = useState('');

  // ==========================================================
  // DOCUMENT STATE
  // ==========================================================

  const [
    panDocument,
    setPanDocument,
  ] = useState<KycDocument | null>(
    null,
  );

  const [
    aadhaarDocument,
    setAadhaarDocument,
  ] = useState<KycDocument | null>(
    null,
  );

  const [
    shopEstablishmentDocument,
    setShopEstablishmentDocument,
  ] = useState<KycDocument | null>(
    null,
  );

  const [
    gstDocument,
    setGstDocument,
  ] = useState<KycDocument | null>(
    null,
  );

  const [
    udyamDocument,
    setUdyamDocument,
  ] = useState<KycDocument | null>(
    null,
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    pickingDocument,
    setPickingDocument,
  ] = useState<string | null>(
    null,
  );

  // ==========================================================
  // GENERATE UPLOAD ID
  //
  // One uploadId is used for the complete registration.
  //
  // ==========================================================

  const createUploadId =
    () => {

      const timestamp =
        Date.now().toString(36);

      const randomPart =
        Math.random()
          .toString(36)
          .substring(2, 12);

      return `REG-${timestamp}-${randomPart}`;
    };

  // ==========================================================
  // CONTENT TYPE
  // ==========================================================

  const getContentType =
    (
      document: KycDocument,
    ): string => {

      const existingType =
        document.type
          ?.trim()
          .toLowerCase();

      if (
        existingType &&
        (
          existingType ===
          'application/pdf' ||
          existingType ===
          'image/jpeg' ||
          existingType ===
          'image/png' ||
          existingType ===
          'image/webp'
        )
      ) {
        return existingType;
      }

      const fileName =
        document.name
          ?.toLowerCase() || '';

      if (
        fileName.endsWith(
          '.pdf',
        )
      ) {
        return 'application/pdf';
      }

      if (
        fileName.endsWith(
          '.jpg',
        ) ||
        fileName.endsWith(
          '.jpeg',
        )
      ) {
        return 'image/jpeg';
      }

      if (
        fileName.endsWith(
          '.png',
        )
      ) {
        return 'image/png';
      }

      if (
        fileName.endsWith(
          '.webp',
        )
      ) {
        return 'image/webp';
      }

      return '';
    };

  // ==========================================================
  // UPLOAD FILE TO S3
  // ==========================================================

  const uploadDocumentToS3 =
    async (
      document: KycDocument,
      documentType: KycDocumentType,
      uploadId: string,
    ): Promise<KycDocument> => {

      // ========================================================
      // VALIDATE LOCAL FILE
      // ========================================================

      if (!document.uri) {
        throw new Error(
          `${documentType} document URI is missing.`,
        );
      }

      const contentType =
        getContentType(
          document,
        );

      if (!contentType) {
        throw new Error(
          `${document.name} has an unsupported file type. Please select a PDF, JPG, JPEG, PNG or WEBP file.`,
        );
      }

      const fileSize =
        Number(
          document.size || 0,
        );

      if (
        !Number.isFinite(
          fileSize,
        ) ||
        fileSize <= 0
      ) {
        throw new Error(
          `${document.name} has an invalid file size.`,
        );
      }

      // ========================================================
      // MAX FILE SIZE
      //
      // Keep this aligned with Lambda:
      // KYC_MAX_FILE_SIZE_BYTES=10485760
      //
      // ========================================================

      const MAX_FILE_SIZE =
        10 * 1024 * 1024;

      if (
        fileSize >
        MAX_FILE_SIZE
      ) {
        throw new Error(
          `${document.name} is larger than 10 MB.`,
        );
      }

      // ========================================================
      // GENERATE PRESIGNED URL
      // ========================================================

      console.log(
        '======================================',
      );

      console.log(
        'GENERATING KYC UPLOAD URL',
      );

      console.log(
        'Document type:',
        documentType,
      );

      console.log(
        'File name:',
        document.name,
      );

      console.log(
        'Content type:',
        contentType,
      );

      console.log(
        'File size:',
        fileSize,
      );

      console.log(
        'Upload ID:',
        uploadId,
      );

      console.log(
        '======================================',
      );

      const result =
        await generateKycDocumentUploadUrl({
          variables: {
            input: {
              uploadId,

              documentType,

              fileName:
                document.name,

              contentType,

              fileSize,
            },
          },
        });

      const response =
        result?.data
          ?.generateKycDocumentUploadUrl;

      if (!response) {
        throw new Error(
          'No response was received while generating the KYC upload URL.',
        );
      }

      if (
        !response.success
      ) {
        throw new Error(
          response.message ||
          'Unable to generate the KYC upload URL.',
        );
      }

      if (
        !response.uploadUrl
      ) {
        throw new Error(
          'KYC upload URL was not returned by the server.',
        );
      }

      if (
        !response.key
      ) {
        throw new Error(
          'KYC S3 key was not returned by the server.',
        );
      }

      // ========================================================
      // READ LOCAL FILE
      // ========================================================

      const fileResponse =
        await fetch(
          document.uri,
        );

      if (
        !fileResponse.ok
      ) {
        throw new Error(
          `Unable to read ${document.name} from the device.`,
        );
      }

      const fileBlob =
        await fileResponse.blob();

      // ========================================================
      // UPLOAD TO S3
      //
      // IMPORTANT:
      //
      // Lambda presigns only ContentType.
      //
      // Do NOT send x-amz-meta-* headers here because they are
      // not part of the signed PutObjectCommand.
      //
      // ========================================================

      console.log(
        'Uploading KYC document to S3:',
        response.key,
      );

      const uploadResponse =
        await fetch(
          response.uploadUrl,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                contentType,
            },

            body:
              fileBlob,
          },
        );

      if (
        !uploadResponse.ok
      ) {

        let uploadError =
          '';

        try {

          uploadError =
            await uploadResponse.text();

        } catch {
          uploadError =
            '';
        }

        console.error(
          '❌ S3 KYC UPLOAD FAILED:',
          uploadResponse.status,
          uploadError,
        );

        throw new Error(
          `Unable to upload ${document.name} to storage. HTTP ${uploadResponse.status}.`,
        );
      }

      console.log(
        '✅ KYC DOCUMENT UPLOADED:',
        response.key,
      );

      // ========================================================
      // RETURN DOCUMENT WITH S3 INFORMATION
      // ========================================================

      return {
        ...document,

        type:
          contentType,

        size:
          fileSize,

        uploadId,

        s3Key:
          response.key,

        documentType,
      };
    };

  // ==========================================================
  // DOCUMENT PICKER
  // ==========================================================

  const pickKycDocument = async (
    documentType:
      | 'PAN'
      | 'AADHAAR'
      | 'SHOP'
      | 'GST'
      | 'UDYAM',
  ) => {

    try {

      setPickingDocument(
        documentType,
      );

      const result =
        await pick({
          type: [
            types.pdf,
            types.images,
          ],
          allowMultiSelection:
            false,
        });

      const selected =
        result?.[0];

      if (!selected) {
        return;
      }

      const document: KycDocument = {
        uri:
          selected.uri,

        name:
          selected.name ||
          `${documentType.toLowerCase()}-document`,

        type:
          selected.type,

        size:
          selected.size,
      };

      if (
        documentType === 'PAN'
      ) {

        setPanDocument(
          document,
        );

      } else if (
        documentType === 'AADHAAR'
      ) {

        setAadhaarDocument(
          document,
        );

      } else if (
        documentType === 'SHOP'
      ) {

        setShopEstablishmentDocument(
          document,
        );

      } else if (
        documentType === 'GST'
      ) {

        setGstDocument(
          document,
        );

      } else if (
        documentType === 'UDYAM'
      ) {

        setUdyamDocument(
          document,
        );
      }

    } catch (error: any) {

      // User cancelled the picker.
      if (
        error?.code ===
        'DOCUMENT_PICKER_CANCELED'
      ) {
        return;
      }

      console.error(
        'KYC DOCUMENT PICK ERROR:',
        error,
      );

      Alert.alert(
        'Unable to select document',
        'Something went wrong while selecting the document. Please try again.',
      );

    } finally {

      setPickingDocument(
        null,
      );
    }
  };

  // ==========================================================
  // DOCUMENT BUTTON
  // ==========================================================

  const renderDocumentPicker = (
    label: string,
    document: KycDocument | null,
    documentType:
      | 'PAN'
      | 'AADHAAR'
      | 'SHOP'
      | 'GST'
      | 'UDYAM',
    required: boolean = false,
  ) => {

    const isPicking =
      pickingDocument ===
      documentType;

    return (
      <View
        style={styles.documentContainer}
      >

        <View
          style={styles.documentHeader}
        >

          <Text
            style={styles.documentLabel}
          >
            {label}
            {required
              ? ' *'
              : ''}
          </Text>

          {document && (
            <Text
              style={
                styles.documentSelected
              }
            >
              Selected
            </Text>
          )}

        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.uploadButton,
            document &&
            styles.uploadButtonSelected,
          ]}
          onPress={() =>
            pickKycDocument(
              documentType,
            )
          }
          disabled={
            isPicking ||
            submitting
          }
        >

          {isPicking ? (

            <ActivityIndicator
              size="small"
              color={
                COLORS.themeColor
              }
            />

          ) : (

            <Text
              style={
                styles.uploadButtonText
              }
            >
              {document
                ? 'Change Document'
                : 'Upload Document'}
            </Text>

          )}

        </TouchableOpacity>

        {document && (

          <View
            style={
              styles.documentInfo
            }
          >

            <Text
              style={
                styles.documentName
              }
              numberOfLines={2}
            >
              {document.name}
            </Text>

            <Text
              style={
                styles.documentHint
              }
            >
              PDF or image selected
            </Text>

          </View>

        )}

      </View>
    );
  };

  // ==========================================================
  // CONTINUE
  // ==========================================================

  const handleContinue =
    async () => {

      // ========================================================
      // CLEAN VALUES
      // ========================================================

      const cleanPAN =
        panNumber
          .trim()
          .toUpperCase();

      const cleanAadhaar =
        aadhaarNumber
          .replace(
            /\D/g,
            '',
          );

      const cleanGST =
        gstNumber
          .trim()
          .toUpperCase();

      const cleanShop =
        shopEstablishmentNumber
          .trim();

      const cleanUdyam =
        udyamNumber
          .trim()
          .toUpperCase();

      // ========================================================
      // PAN VALIDATION
      // ========================================================

      if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
          cleanPAN,
        )
      ) {

        Alert.alert(
          'Invalid PAN',
          'Please enter a valid PAN number.',
        );

        return;
      }

      // ========================================================
      // PAN DOCUMENT
      // ========================================================

      if (!panDocument) {

        Alert.alert(
          'PAN document required',
          'Please upload the PAN document before continuing.',
        );

        return;
      }

      // ========================================================
      // AADHAAR VALIDATION
      // ========================================================

      if (
        !/^\d{12}$/.test(
          cleanAadhaar,
        )
      ) {

        Alert.alert(
          'Invalid Aadhaar',
          'Please enter a valid 12-digit Aadhaar number.',
        );

        return;
      }

      // ========================================================
      // AADHAAR DOCUMENT
      // ========================================================

      if (!aadhaarDocument) {

        Alert.alert(
          'Aadhaar document required',
          'Please upload the Aadhaar document before continuing.',
        );

        return;
      }

      // ========================================================
      // SHOP & ESTABLISHMENT
      // ========================================================

      if (!cleanShop) {

        Alert.alert(
          'Salon registration required',
          'Please enter your Shop & Establishment registration number.',
        );

        return;
      }

      // ========================================================
      // SHOP & ESTABLISHMENT DOCUMENT
      // ========================================================

      if (
        !shopEstablishmentDocument
      ) {

        Alert.alert(
          'Shop & Establishment document required',
          'Please upload your Shop & Establishment registration certificate.',
        );

        return;
      }

      // ========================================================
      // OPTIONAL DOCUMENT VALIDATION
      //
      // If GSTIN is entered, a GST document is required.
      //
      // If Udyam number is entered, a Udyam document is required.
      //
      // ========================================================

      if (
        cleanGST &&
        !gstDocument
      ) {

        Alert.alert(
          'GST document required',
          'You entered a GSTIN. Please upload the GST certificate.',
        );

        return;
      }

      if (
        cleanUdyam &&
        !udyamDocument
      ) {

        Alert.alert(
          'Udyam document required',
          'You entered a Udyam number. Please upload the Udyam certificate.',
        );

        return;
      }

      try {

        setSubmitting(true);

        // ======================================================
        // CREATE ONE UPLOAD ID FOR THIS REGISTRATION
        // ======================================================

        const uploadId =
          createUploadId();

        console.log(
          '======================================',
        );

        console.log(
          'STARTING KYC DOCUMENT UPLOAD',
        );

        console.log(
          'KYC uploadId:',
          uploadId,
        );

        console.log(
          '======================================',
        );

        // ======================================================
        // UPLOAD REQUIRED DOCUMENTS
        // ======================================================

        const uploadedPanDocument =
          await uploadDocumentToS3(
            panDocument,
            'PAN',
            uploadId,
          );

        const uploadedAadhaarDocument =
          await uploadDocumentToS3(
            aadhaarDocument,
            'AADHAAR',
            uploadId,
          );

        const uploadedShopDocument =
          await uploadDocumentToS3(
            shopEstablishmentDocument,
            'SHOP_ESTABLISHMENT',
            uploadId,
          );

        // ======================================================
        // UPLOAD OPTIONAL GST
        // ======================================================

        let uploadedGstDocument:
          | KycDocument
          | null =
          null;

        if (
          gstDocument
        ) {

          uploadedGstDocument =
            await uploadDocumentToS3(
              gstDocument,
              'GST',
              uploadId,
            );
        }

        // ======================================================
        // UPLOAD OPTIONAL UDYAM
        // ======================================================

        let uploadedUdyamDocument:
          | KycDocument
          | null =
          null;

        if (
          udyamDocument
        ) {

          uploadedUdyamDocument =
            await uploadDocumentToS3(
              udyamDocument,
              'UDYAM',
              uploadId,
            );
        }

        // ======================================================
        // DEVELOPMENT REFERENCE
        // ======================================================

        const referenceId =
          data.kycReferenceId ||
          `DEV-KYC-${Date.now()}`;

        // ======================================================
        // SAVE KYC INFORMATION
        //
        // Documents now contain:
        //
        // uploadId
        // s3Key
        // documentType
        //
        // SalonReview will send these to:
        //
        // registerSalonPartner
        //
        // ======================================================

        updateData({

          panNumber:
            cleanPAN,

          aadhaarNumber:
            cleanAadhaar,

          gstNumber:
            cleanGST,

          shopEstablishmentNumber:
            cleanShop,

          udyamNumber:
            cleanUdyam,

          // ====================================================
          // REQUIRED DOCUMENTS
          // ====================================================

          panDocument:
            uploadedPanDocument,

          aadhaarDocument:
            uploadedAadhaarDocument,

          shopEstablishmentDocument:
            uploadedShopDocument,

          // ====================================================
          // OPTIONAL DOCUMENTS
          // ====================================================

          gstDocument:
            uploadedGstDocument,

          udyamDocument:
            uploadedUdyamDocument,

          // ====================================================
          // KYC UPLOAD INFORMATION
          // ====================================================

          kycUploadId:
            uploadId,

          kycStatus:
            'PENDING',

          kycReferenceId:
            referenceId,

          kycSubmittedAt:
            '',

          kycReviewedAt:
            '',

          kycRejectionReason:
            '',

          providerStatus:
            'NOT_REGISTERED',
        });

        // ======================================================
        // SMALL DELAY FOR UI
        // ======================================================

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              300,
            ),
        );

        // ======================================================
        // GO TO SALON REVIEW
        // ======================================================

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

        setSubmitting(
          false,
        );
      }
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >

      <Header
        headerTitle="Business Verification"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <Text
          style={
            styles.title
          }
        >
          Verify your salon
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Please provide the required business verification
          details and upload the supporting documents.
        </Text>

        {/* ==================================================
            OWNER VERIFICATION
        ================================================== */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Owner verification
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            These details are used to verify the business
            owner.
          </Text>

          {/* PAN */}

          <View
            style={
              styles.field
            }
          >

            <Text
              style={
                styles.label
              }
            >
              PAN Number *
            </Text>

            <TextInput
              style={
                styles.input
              }
              placeholder="ABCDE1234F"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                panNumber
              }
              onChangeText={
                text =>
                  setPanNumber(
                    text
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        '',
                      ),
                  )
              }
              maxLength={10}
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {renderDocumentPicker(
            'PAN Document',
            panDocument,
            'PAN',
            true,
          )}

          {/* AADHAAR */}

          <View
            style={
              styles.field
            }
          >

            <Text
              style={
                styles.label
              }
            >
              Aadhaar Number *
            </Text>

            <TextInput
              style={
                styles.input
              }
              placeholder="12 digit Aadhaar"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                aadhaarNumber
              }
              onChangeText={
                text =>
                  setAadhaarNumber(
                    text.replace(
                      /\D/g,
                      '',
                    ),
                  )
              }
              keyboardType="number-pad"
              maxLength={12}
              secureTextEntry
            />

          </View>

          {renderDocumentPicker(
            'Aadhaar Document',
            aadhaarDocument,
            'AADHAAR',
            true,
          )}

        </View>

        {/* ==================================================
            BUSINESS VERIFICATION
        ================================================== */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Business verification
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Shop & Establishment registration is required for
            applicable physical salon establishments. GSTIN
            and Udyam registration can be provided if
            applicable.
          </Text>

          {/* SHOP & ESTABLISHMENT */}

          <View
            style={
              styles.field
            }
          >

            <Text
              style={
                styles.label
              }
            >
              Shop & Establishment Number *
            </Text>

            <TextInput
              style={
                styles.input
              }
              placeholder="Enter registration number"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                shopEstablishmentNumber
              }
              onChangeText={
                setShopEstablishmentNumber
              }
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {renderDocumentPicker(
            'Shop & Establishment Certificate',
            shopEstablishmentDocument,
            'SHOP',
            true,
          )}

          {/* GST */}

          <View
            style={
              styles.field
            }
          >

            <Text
              style={
                styles.label
              }
            >
              GSTIN
            </Text>

            <TextInput
              style={
                styles.input
              }
              placeholder="Optional / If applicable"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                gstNumber
              }
              onChangeText={
                text =>
                  setGstNumber(
                    text
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        '',
                      ),
                  )
              }
              maxLength={15}
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {renderDocumentPicker(
            'GST Certificate',
            gstDocument,
            'GST',
            false,
          )}

          {/* UDYAM */}

          <View
            style={
              styles.field
            }
          >

            <Text
              style={
                styles.label
              }
            >
              Udyam Number
            </Text>

            <TextInput
              style={
                styles.input
              }
              placeholder="Optional"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                udyamNumber
              }
              onChangeText={
                setUdyamNumber
              }
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {renderDocumentPicker(
            'Udyam Certificate',
            udyamDocument,
            'UDYAM',
            false,
          )}

        </View>

        {/* ==================================================
            DOCUMENT INFORMATION
        ================================================== */}

        <View
          style={
            styles.infoCard
          }
        >

          <Text
            style={
              styles.infoTitle
            }
          >
            Document requirements
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            • PAN document is required.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            • Aadhaar document is required.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            • Shop & Establishment certificate is required.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            • GST certificate is optional if GSTIN is applicable.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            • Udyam certificate is optional.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            • Documents will be reviewed by Clavata Admin.
          </Text>

        </View>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <View
          style={
            styles.infoCard
          }
        >

          <Text
            style={
              styles.infoTitle
            }
          >
            What happens next?
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            1. Select the services your salon provides.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            2. Review all your salon registration information.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            3. Submit the registration.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            4. Clavata will review your salon business
            information and documents.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            5. Admin may initiate PAN and Aadhaar verification
            after reviewing the submitted information.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            6. Your salon will remain pending until verification
            and Clavata approval are completed.
          </Text>

        </View>

        {/* ==================================================
            CONTINUE
        ================================================== */}

        <DButton
          style={
            styles.button
          }
          onPress={
            handleContinue
          }
          disabled={
            submitting
          }
        >

          {submitting ? (

            <ActivityIndicator
              color={
                COLORS.white
              }
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

      </ScrollView>

    </SafeAreaView>
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
        SPACING.huge,
    },

    title: {
      fontFamily:
        FONTS.bold,

      fontSize: 22,

      color:
        COLORS.text,

      marginBottom:
        SPACING.small,
    },

    subtitle: {
      fontFamily:
        FONTS.regular,

      fontSize: 13,

      lineHeight: 19,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.large,
    },

    section: {
      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.large,

      padding:
        SPACING.large,

      marginBottom:
        SPACING.large,
    },

    sectionTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 17,

      color:
        COLORS.text,

      marginBottom: 4,
    },

    sectionSubtitle: {
      fontFamily:
        FONTS.regular,

      fontSize: 12,

      lineHeight: 17,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.large,
    },

    field: {
      marginBottom:
        SPACING.large,
    },

    label: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 13,

      color:
        COLORS.text,

      marginBottom:
        SPACING.small,
    },

    input: {
      height: 52,

      backgroundColor:
        COLORS.background,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.medium,

      paddingHorizontal:
        SPACING.medium,

      fontFamily:
        FONTS.regular,

      fontSize: 15,

      color:
        COLORS.text,
    },

    // ========================================================
    // DOCUMENT
    // ========================================================

    documentContainer: {
      marginBottom:
        SPACING.large,
    },

    documentHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom:
        SPACING.small,
    },

    documentLabel: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 13,

      color:
        COLORS.text,
    },

    documentSelected: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 11,

      color:
        COLORS.themeColor,
    },

    uploadButton: {
      minHeight: 48,

      borderWidth: 1,

      borderColor:
        COLORS.themeColor,

      borderRadius:
        RADIUS.medium,

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal:
        SPACING.medium,

      backgroundColor:
        COLORS.background,
    },

    uploadButtonSelected: {
      backgroundColor:
        COLORS.surface,
    },

    uploadButtonText: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 13,

      color:
        COLORS.themeColor,
    },

    documentInfo: {
      marginTop:
        SPACING.small,

      padding:
        SPACING.medium,

      borderRadius:
        RADIUS.medium,

      backgroundColor:
        COLORS.background,

      borderWidth: 1,

      borderColor:
        COLORS.border,
    },

    documentName: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 12,

      color:
        COLORS.text,
    },

    documentHint: {
      fontFamily:
        FONTS.regular,

      fontSize: 10,

      color:
        COLORS.textMuted,

      marginTop: 3,
    },

    // ========================================================
    // INFORMATION
    // ========================================================

    infoCard: {
      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.large,

      padding:
        SPACING.large,

      marginBottom:
        SPACING.large,
    },

    infoTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 15,

      color:
        COLORS.text,

      marginBottom:
        SPACING.small,
    },

    infoText: {
      fontFamily:
        FONTS.regular,

      fontSize: 12,

      lineHeight: 18,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.small,
    },

    // ========================================================
    // BUTTON
    // ========================================================

    button: {
      width:
        '100%',

      backgroundColor:
        COLORS.themeColor,

      height:
        54,

      borderRadius:
        RADIUS.medium,
    },

    buttonText: {
      color:
        COLORS.white,

      fontFamily:
        FONTS.semiBold,

      fontSize: 15,

      textAlign:
        'center',
    },

  });