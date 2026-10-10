import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useApolloClient, gql } from '@apollo/client';
import {
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';

import { MAX_PHOTO_SIZE } from '../../../constants/config';
import {
  useUser,
  type User,
} from '../../../context/UserContext';
import { GRADIENTS } from '../../../constants/constants';
import AppGradient from '../../../common/AppGradient';

import {
  GET_CUSTOMER_PROFILE_PHOTO,
  UPDATE_CUSTOMER_PROFILE_PHOTO,
  GENERATE_CUSTOMER_PHOTO_UPLOAD_URL,
} from '../../../graphql/queries';

// =============================================================
// GRAPHQL MUTATIONS
// =============================================================

const UPDATE_CUSTOMER_PROFILE = gql`
  mutation UpdateCustomerProfile(
    $input: UpdateCustomerProfileInput!
  ) {
    updateCustomerProfile(input: $input) {
      success
      message
      user {
        userId
        phoneNumber
        fullName
        role
        providerStatus
        salonId
        createdAt
        updatedAt
        preferredPaymentMethod
      }
    }
  }
`;

const SEND_PHONE_CHANGE_OTP = gql`
  mutation SendPhoneChangeOTP(
    $input: SendPhoneChangeOTPInput!
  ) {
    sendPhoneChangeOTP(input: $input) {
      success
      message
    }
  }
`;

const VERIFY_PHONE_CHANGE_OTP = gql`
  mutation VerifyPhoneChangeOTP(
    $input: VerifyPhoneChangeOTPInput!
  ) {
    verifyPhoneChangeOTP(input: $input) {
      success
      message
      user {
        userId
        phoneNumber
        fullName
        role
        providerStatus
        salonId
        createdAt
        updatedAt
        preferredPaymentMethod
      }
    }
  }
`;

// =============================================================
// SCREEN
// =============================================================

export default function EditProfile() {
  const navigation = useNavigation<any>();
  const client = useApolloClient();

  const {
    currentUser,
    setCurrentUser,
  } = useUser();

  const [fullName, setFullName] = useState(
    currentUser?.fullName || '',
  );

  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber || '',
  );

  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [profileImageUri, setProfileImageUri] = useState<
    string | undefined
  >(currentUser?.profileImageUrl || undefined);

  const [selectedPhoto, setSelectedPhoto] =
    useState<Asset | null>(null);

  const [saving, setSaving] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);

  // =========================================================
  // CHOOSE PHOTO
  // =========================================================

  const handleChoosePhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Photo unavailable',
          result.errorMessage ||
            'Unable to select a photo.',
        );
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          'Photo unavailable',
          'The selected image could not be opened.',
        );
        return;
      }

      if (
        typeof asset.fileSize === 'number' &&
        asset.fileSize > MAX_PHOTO_SIZE
      ) {
        Alert.alert(
          'Image too large',
          'Please select an image smaller than 10 MB.',
        );
        return;
      }

      const contentType = (
        asset.type || 'image/jpeg'
      ).toLowerCase();

      if (
        ![
          'image/jpeg',
          'image/png',
          'image/webp',
        ].includes(contentType)
      ) {
        Alert.alert(
          'Unsupported image',
          'Please select a JPEG, PNG, or WebP image.',
        );
        return;
      }

      setSelectedPhoto({
        ...asset,
        type: contentType,
      });

      setProfileImageUri(asset.uri);
    } catch (error) {
      console.error(
        '[EditProfile] Choose photo error:',
        error,
      );

      Alert.alert(
        'Photo unavailable',
        'Unable to open your photo library.',
      );
    }
  };

  // =========================================================
  // UPLOAD PHOTO TO S3
  // =========================================================

  const uploadProfilePhoto = async (
    asset: Asset,
  ): Promise<string> => {
    if (
      !currentUser?.userId ||
      !currentUser.phoneNumber
    ) {
      throw new Error(
        'Account details are unavailable. Please sign in again.',
      );
    }

    if (!asset.uri) {
      throw new Error(
        'The selected photo has no file URI.',
      );
    }

    const contentType = (
      asset.type || 'image/jpeg'
    ).toLowerCase();

    const extension =
      contentType === 'image/png'
        ? 'png'
        : contentType === 'image/webp'
          ? 'webp'
          : 'jpg';

    const fileName =
      asset.fileName ||
      `profile-${Date.now()}.${extension}`;

    const fileResponse = await fetch(asset.uri);

    if (!fileResponse.ok) {
      throw new Error(
        'Unable to read the selected photo.',
      );
    }

    const fileBlob = await fileResponse.blob();
    const fileSize = asset.fileSize ?? fileBlob.size;

    if (
      !fileSize ||
      fileSize > MAX_PHOTO_SIZE
    ) {
      throw new Error(
        'Please select an image smaller than 10 MB.',
      );
    }

    // 1. Generate a presigned upload URL.

    const uploadResponse = await client.mutate({
      mutation: GENERATE_CUSTOMER_PHOTO_UPLOAD_URL,
      variables: {
        input: {
          userId: currentUser.userId,
          phoneNumber: currentUser.phoneNumber,
          contentType,
          fileSize,
          fileName,
        },
      },
    });

    const uploadData =
      uploadResponse.data
        ?.generateCustomerPhotoUploadUrl;

    if (
      !uploadData?.success ||
      !uploadData?.uploadUrl ||
      !uploadData?.key
    ) {
      throw new Error(
        uploadData?.message ||
          'Unable to prepare the photo upload.',
      );
    }

    // 2. Upload directly to S3.

    const s3Response = await fetch(
      uploadData.uploadUrl,
      {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: fileBlob,
      },
    );

    if (!s3Response.ok) {
      console.error(
        '[EditProfile] S3 upload status:',
        s3Response.status,
      );

      throw new Error(
        `Photo upload failed (HTTP ${s3Response.status}).`,
      );
    }

    // 3. Save the private S3 key in the customer profile.

    const saveResponse = await client.mutate({
      mutation: UPDATE_CUSTOMER_PROFILE_PHOTO,
      variables: {
        input: {
          userId: currentUser.userId,
          phoneNumber: currentUser.phoneNumber,
          key: uploadData.key,
        },
      },
    });

    const saveData =
      saveResponse.data
        ?.updateCustomerProfilePhoto;

    if (!saveData?.success) {
      throw new Error(
        saveData?.message ||
          'The uploaded photo could not be saved.',
      );
    }

    // 4. Retrieve a fresh signed URL.

    const photoResponse = await client.query({
      query: GET_CUSTOMER_PROFILE_PHOTO,
      variables: {
        userId: currentUser.userId,
        phoneNumber: currentUser.phoneNumber,
      },
      fetchPolicy: 'network-only',
    });

    const photoData =
      photoResponse.data?.getCustomerProfilePhoto;

    if (
      !photoData?.success ||
      !photoData?.viewUrl
    ) {
      throw new Error(
        photoData?.message ||
          'Photo saved, but its display URL could not be retrieved.',
      );
    }

    return photoData.viewUrl;
  };

  // =========================================================
  // SAVE NAME AND PHOTO
  // =========================================================

  const handleSave = async () => {
    Keyboard.dismiss();

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      Alert.alert(
        'Name required',
        'Please enter your full name.',
      );
      return;
    }

    if (trimmedName.length > 100) {
      Alert.alert(
        'Name too long',
        'Your name must be 100 characters or fewer.',
      );
      return;
    }

    if (
      !currentUser?.userId ||
      !currentUser.phoneNumber
    ) {
      Alert.alert(
        'Unable to update',
        'Your account details are unavailable. Please sign in again.',
      );
      return;
    }

    setSaving(true);

    try {
      // Upload the photo before changing profile data.

      let savedPhotoUrl =
        currentUser.profileImageUrl ?? null;

      if (selectedPhoto) {
        savedPhotoUrl =
          await uploadProfilePhoto(selectedPhoto);
      }

      // Persist the name in the backend.

      const response = await client.mutate({
        mutation: UPDATE_CUSTOMER_PROFILE,
        variables: {
          input: {
            userId: currentUser.userId,
            phoneNumber: currentUser.phoneNumber,
            fullName: trimmedName,
          },
        },
      });

      const result =
        response.data?.updateCustomerProfile;

      if (!result?.success || !result?.user) {
        throw new Error(
          result?.message ||
            'Unable to save your profile.',
        );
      }

      // Preserve the existing typed User object.
      // Do not spread the GraphQL user because its role
      // may be inferred as a plain string.

      const updatedUser: User = {
        ...currentUser,
        fullName:
          result.user.fullName || trimmedName,
        profileImageUrl: savedPhotoUrl,
        updatedAt:
          result.user.updatedAt ??
          currentUser.updatedAt,
      };

      setCurrentUser(updatedUser);

      setFullName(updatedUser.fullName);
      setProfileImageUri(
        updatedUser.profileImageUrl ?? undefined,
      );
      setSelectedPhoto(null);

      Alert.alert(
        'Profile updated',
        selectedPhoto
          ? 'Your name and profile photo have been saved.'
          : 'Your name has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error(
        '[EditProfile] Save error:',
        error?.message || error,
      );

      Alert.alert(
        'Update failed',
        error?.message ||
          'Unable to update your profile. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // VALIDATE NEW PHONE NUMBER
  // =========================================================

  const getValidatedNewPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    // Accept either a 10-digit Indian mobile number
    // or a 12-digit number beginning with country code 91.

    if (
      digitsOnly.length === 12 &&
      digitsOnly.startsWith('91')
    ) {
      return digitsOnly.slice(2);
    }

    if (digitsOnly.length === 10) {
      return digitsOnly;
    }

    return null;
  };

  // =========================================================
  // SEND PHONE CHANGE OTP
  // =========================================================

  const handleSendPhoneOTP = async () => {
    Keyboard.dismiss();

    if (
      !currentUser?.userId ||
      !currentUser.phoneNumber
    ) {
      Alert.alert(
        'Account unavailable',
        'Please sign in again and retry.',
      );
      return;
    }

    const enteredPhone = newPhoneNumber.trim();
    const normalizedNewPhone =
      getValidatedNewPhoneNumber(enteredPhone);

    if (!normalizedNewPhone) {
      Alert.alert(
        'Invalid phone number',
        'Enter a valid 10-digit Indian mobile number.',
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(normalizedNewPhone)) {
      Alert.alert(
        'Invalid phone number',
        'Enter a valid Indian mobile number.',
      );
      return;
    }

    const currentDigits =
      currentUser.phoneNumber.replace(/\D/g, '');

    const normalizedCurrentPhone =
      currentDigits.length === 12 &&
      currentDigits.startsWith('91')
        ? currentDigits.slice(2)
        : currentDigits;

    if (
      normalizedNewPhone ===
      normalizedCurrentPhone
    ) {
      Alert.alert(
        'Same phone number',
        'Enter a number different from your current number.',
      );
      return;
    }

    setPhoneBusy(true);

    try {
      const response = await client.mutate({
        mutation: SEND_PHONE_CHANGE_OTP,
        variables: {
          input: {
            userId: currentUser.userId,
            currentPhoneNumber:
              currentUser.phoneNumber,
            newPhoneNumber: normalizedNewPhone,
          },
        },
      });

      const result =
        response.data?.sendPhoneChangeOTP;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            'Unable to send OTP.',
        );
      }

      // Store the normalized number so the same number
      // is sent when verifying the OTP.

      setNewPhoneNumber(normalizedNewPhone);
      setOtp('');
      setOtpSent(true);

      Alert.alert(
        'OTP sent',
        'Enter the verification code sent to your new phone number.',
      );
    } catch (error: any) {
      console.error(
        '[EditProfile] Send phone OTP error:',
        error?.message || error,
      );

      Alert.alert(
        'Unable to send OTP',
        error?.message ||
          'Please check the number and try again.',
      );
    } finally {
      setPhoneBusy(false);
    }
  };

  // =========================================================
  // VERIFY OTP AND CHANGE PHONE NUMBER
  // =========================================================

  const handleVerifyPhoneOTP = async () => {
    Keyboard.dismiss();

    if (
      !currentUser?.userId ||
      !currentUser.phoneNumber
    ) {
      Alert.alert(
        'Account unavailable',
        'Please sign in again and retry.',
      );
      return;
    }

    const enteredOtp = otp.trim();
    const normalizedNewPhone =
      getValidatedNewPhoneNumber(newPhoneNumber);

    if (!normalizedNewPhone) {
      Alert.alert(
        'Invalid phone number',
        'Enter a valid new mobile number.',
      );
      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      Alert.alert(
        'Invalid OTP',
        'Enter the 6-digit verification code.',
      );
      return;
    }

    setPhoneBusy(true);

    try {
      const response = await client.mutate({
        mutation: VERIFY_PHONE_CHANGE_OTP,
        variables: {
          input: {
            userId: currentUser.userId,
            currentPhoneNumber:
              currentUser.phoneNumber,
            newPhoneNumber: normalizedNewPhone,
            otp: enteredOtp,
          },
        },
      });

      const result =
        response.data?.verifyPhoneChangeOTP;

      if (!result?.success || !result?.user) {
        throw new Error(
          result?.message ||
            'Phone verification failed.',
        );
      }

      const responseUser = result.user;
      const verifiedPhoneNumber =
        responseUser.phoneNumber;

      if (!verifiedPhoneNumber) {
        throw new Error(
          'The server did not return the updated phone number.',
        );
      }

      // Preserve the existing User role and other typed fields.
      // Only update fields that this operation should change.

      const updatedUser: User = {
        ...currentUser,
        phoneNumber: verifiedPhoneNumber,
        fullName:
          responseUser.fullName ??
          currentUser.fullName,
        updatedAt:
          responseUser.updatedAt ??
          currentUser.updatedAt,
        profileImageUrl:
          currentUser.profileImageUrl ?? null,
      };

      setCurrentUser(updatedUser);
      setPhoneNumber(verifiedPhoneNumber);

      setNewPhoneNumber('');
      setOtp('');
      setOtpSent(false);

      Alert.alert(
        'Phone number updated',
        'Your new phone number has been verified and saved.',
      );
    } catch (error: any) {
      console.error(
        '[EditProfile] Verify phone OTP error:',
        error?.message || error,
      );

      Alert.alert(
        'Verification failed',
        error?.message ||
          'Unable to verify the code. Please try again.',
      );
    } finally {
      setPhoneBusy(false);
    }
  };

  // =========================================================
  // AVATAR INITIAL
  // =========================================================

  const firstLetter =
    fullName.trim().charAt(0).toUpperCase() || 'U';

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={saving || phoneBusy}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Edit Profile
          </Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          {/* PROFILE PHOTO */}

          <View style={styles.photoSection}>
            <View style={styles.avatarWrap}>
              <AppGradient
                colors={[...GRADIENTS.SOFT_PURPLE]}
                style={styles.avatar}
              >
                {profileImageUri ? (
                  <Image
                    source={{ uri: profileImageUri }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={() => {
                      if (!selectedPhoto) {
                        setProfileImageUri(undefined);
                      }
                    }}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {firstLetter}
                  </Text>
                )}
              </AppGradient>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleChoosePhoto}
                disabled={saving || phoneBusy}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                <View style={styles.cameraIcon}>
                  <View style={styles.cameraTop} />
                  <View style={styles.cameraBody}>
                    <View style={styles.cameraLens} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleChoosePhoto}
              disabled={saving || phoneBusy}
              activeOpacity={0.7}
            >
              <Text style={styles.changePhotoText}>
                Change photo
              </Text>
            </TouchableOpacity>

            {selectedPhoto ? (
              <Text style={styles.selectedPhotoText}>
                New photo selected
              </Text>
            ) : null}
          </View>

          {/* NAME AND CURRENT PHONE */}

          <View style={styles.fieldCard}>
            <View style={styles.field}>
              <Text style={styles.label}>
                Full name
              </Text>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                maxLength={100}
                editable={!saving && !phoneBusy}
              />
            </View>

            <View
              style={[
                styles.field,
                styles.lastField,
              ]}
            >
              <Text style={styles.label}>
                Current phone number
              </Text>

              <TextInput
                value={phoneNumber}
                editable={false}
                style={[
                  styles.input,
                  styles.disabledInput,
                ]}
              />

              <Text style={styles.helperText}>
                A new number must be verified before it is saved.
              </Text>
            </View>
          </View>

          {/* SAVE NAME AND PHOTO */}

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving || phoneBusy}
            style={[
              styles.saveButtonWrapper,
              (saving || phoneBusy) &&
                styles.saveButtonDisabled,
            ]}
            accessibilityRole="button"
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.saveButton}
            >
              {saving ? (
                <View style={styles.savingRow}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveButtonText}>
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>
                  Save name and photo
                </Text>
              )}
            </AppGradient>
          </TouchableOpacity>

          {/* CHANGE PHONE */}

          <View style={styles.phoneCard}>
            <Text style={styles.phoneSectionTitle}>
              Change phone number
            </Text>

            <Text style={styles.phoneDescription}>
              We'll send a verification code to your new number.
            </Text>

            <TextInput
              value={newPhoneNumber}
              onChangeText={(value) => {
                setNewPhoneNumber(value);
                setOtpSent(false);
                setOtp('');
              }}
              placeholder="Enter new mobile number"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={13}
              editable={!saving && !phoneBusy}
              autoCorrect={false}
            />

            {!otpSent ? (
              <TouchableOpacity
                onPress={handleSendPhoneOTP}
                disabled={saving || phoneBusy}
                activeOpacity={0.85}
                style={[
                  styles.secondaryButton,
                  (saving || phoneBusy) &&
                    styles.saveButtonDisabled,
                ]}
              >
                {phoneBusy ? (
                  <ActivityIndicator
                    color="#7650C8"
                    size="small"
                  />
                ) : (
                  <Text style={styles.secondaryButtonText}>
                    Send verification code
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.otpSentText}>
                  Verification code sent. Enter the 6-digit code.
                </Text>

                <TextInput
                  value={otp}
                  onChangeText={(value) =>
                    setOtp(
                      value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!phoneBusy}
                  textContentType="oneTimeCode"
                />

                <TouchableOpacity
                  onPress={handleVerifyPhoneOTP}
                  disabled={phoneBusy || saving}
                  activeOpacity={0.85}
                  style={[
                    styles.secondaryButton,
                    (phoneBusy || saving) &&
                      styles.saveButtonDisabled,
                  ]}
                >
                  {phoneBusy ? (
                    <ActivityIndicator
                      color="#7650C8"
                      size="small"
                    />
                  ) : (
                    <Text style={styles.secondaryButtonText}>
                      Verify and update number
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSendPhoneOTP}
                  disabled={phoneBusy || saving}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>
                    Resend code
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EAE8F0',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    color: '#29243A',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '400',
    marginTop: -3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#211B2D',
    fontSize: 19,
    fontWeight: '700',
  },
  headerRight: {
    width: 38,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrap: {
    width: 108,
    height: 108,
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  photoButton: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDF8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#211B2D',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  cameraIcon: {
    width: 17,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTop: {
    position: 'absolute',
    top: -3,
    left: 4,
    width: 7,
    height: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#7650C8',
  },
  cameraBody: {
    width: 17,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#7650C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#7650C8',
  },
  changePhotoText: {
    color: '#6842B5',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedPhotoText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#ECEAF1',
    elevation: 1,
  },
  field: {
    marginBottom: 20,
  },
  lastField: {
    marginBottom: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#494456',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E1EB',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#242033',
  },
  disabledInput: {
    backgroundColor: '#F5F4F8',
    borderColor: '#EFEDF3',
    color: '#777282',
  },
  helperText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 17,
    color: '#777282',
  },
  saveButtonWrapper: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  phoneCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEAF1',
  },
  phoneSectionTitle: {
    color: '#211B2D',
    fontSize: 16,
    fontWeight: '700',
  },
  phoneDescription: {
    marginTop: 6,
    marginBottom: 16,
    color: '#777282',
    fontSize: 13,
    lineHeight: 19,
  },
  secondaryButton: {
    minHeight: 48,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8C9F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: '#6842B5',
    fontSize: 14,
    fontWeight: '700',
  },
  otpSentText: {
    marginTop: 14,
    marginBottom: 10,
    color: '#5F4A86',
    fontSize: 13,
    lineHeight: 19,
  },
  resendButton: {
    alignSelf: 'center',
    padding: 12,
  },
  resendButtonText: {
    color: '#6842B5',
    fontSize: 13,
    fontWeight: '600',
  },
});

