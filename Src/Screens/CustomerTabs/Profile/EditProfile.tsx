import React, { useMemo, useState } from 'react';

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
// GRAPHQL
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
// HELPERS
// =============================================================

const getValidatedNewPhoneNumber = (
  value: string,
): string | null => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  if (digits.length === 10) {
    return digits;
  }

  return null;
};

const normalizePhoneForComparison = (
  value: string,
): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  return digits;
};

// =============================================================
// SCREEN
// =============================================================

export default function EditProfile() {
  const navigation = useNavigation<any>();
  const client = useApolloClient();

  const { currentUser, setCurrentUser } = useUser();

  const [fullName, setFullName] = useState(
    currentUser?.fullName || '',
  );

  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber || '',
  );

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [profileImageUri, setProfileImageUri] = useState<
    string | undefined
  >(currentUser?.profileImageUrl || undefined);

  const [selectedPhoto, setSelectedPhoto] =
    useState<Asset | null>(null);

  const [saving, setSaving] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);

  const originalName = currentUser?.fullName || '';
  const originalPhone = currentUser?.phoneNumber || '';

  const phoneChanged =
    normalizePhoneForComparison(phoneNumber) !==
    normalizePhoneForComparison(originalPhone);

  const nameChanged =
    fullName.trim() !== originalName.trim();

  const hasChanges = useMemo(
    () => nameChanged || phoneChanged || !!selectedPhoto,
    [nameChanged, phoneChanged, selectedPhoto],
  );

  const firstLetter =
    fullName.trim().charAt(0).toUpperCase() || 'U';

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
          result.errorMessage || 'Unable to select a photo.',
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
      console.error('[EditProfile] Choose photo error:', error);

      Alert.alert(
        'Photo unavailable',
        'Unable to open your photo library.',
      );
    }
  };

  // =========================================================
  // UPLOAD PROFILE PHOTO
  // Uses the verified/current phone number.
  // =========================================================

  const uploadProfilePhoto = async (
    asset: Asset,
    accountPhoneNumber: string,
  ): Promise<string> => {
    if (!currentUser?.userId || !accountPhoneNumber) {
      throw new Error(
        'Account details are unavailable. Please sign in again.',
      );
    }

    if (!asset.uri) {
      throw new Error('The selected photo has no file URI.');
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
      throw new Error('Unable to read the selected photo.');
    }

    const fileBlob = await fileResponse.blob();
    const fileSize = asset.fileSize ?? fileBlob.size;

    if (!fileSize || fileSize > MAX_PHOTO_SIZE) {
      throw new Error(
        'Please select an image smaller than 10 MB.',
      );
    }

    // 1. Generate a presigned URL.

    const uploadResponse = await client.mutate({
      mutation: GENERATE_CUSTOMER_PHOTO_UPLOAD_URL,
      variables: {
        input: {
          userId: currentUser.userId,
          phoneNumber: accountPhoneNumber,
          contentType,
          fileSize,
          fileName,
        },
      },
    });

    const uploadData =
      uploadResponse.data?.generateCustomerPhotoUploadUrl;

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

    const s3Response = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: fileBlob,
    });

    if (!s3Response.ok) {
      throw new Error(
        `Photo upload failed (HTTP ${s3Response.status}).`,
      );
    }

    // 3. Save the photo key.

    const saveResponse = await client.mutate({
      mutation: UPDATE_CUSTOMER_PROFILE_PHOTO,
      variables: {
        input: {
          userId: currentUser.userId,
          phoneNumber: accountPhoneNumber,
          key: uploadData.key,
        },
      },
    });

    const saveData =
      saveResponse.data?.updateCustomerProfilePhoto;

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
        phoneNumber: accountPhoneNumber,
      },
      fetchPolicy: 'network-only',
    });

    const photoData =
      photoResponse.data?.getCustomerProfilePhoto;

    if (!photoData?.success || !photoData?.viewUrl) {
      throw new Error(
        photoData?.message ||
          'Photo saved, but its display URL could not be retrieved.',
      );
    }

    return photoData.viewUrl;
  };

  // =========================================================
  // SAVE
  //
  // If phone changed:
  //   First press: send OTP.
  //   Second press: verify OTP, then save profile changes.
  //
  // The button label remains "Save".
  // =========================================================

  const handleSave = async () => {
    Keyboard.dismiss();

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    if (trimmedName.length > 100) {
      Alert.alert(
        'Name too long',
        'Your name must be 100 characters or fewer.',
      );
      return;
    }

    if (!currentUser?.userId || !currentUser.phoneNumber) {
      Alert.alert(
        'Unable to update',
        'Your account details are unavailable. Please sign in again.',
      );
      return;
    }

    if (!hasChanges) {
      return;
    }

    let accountPhoneNumber = currentUser.phoneNumber;

    // ---------------------------------------------------------
    // PHONE CHANGE: VALIDATE AND SEND OTP
    // ---------------------------------------------------------

    if (phoneChanged) {
      const normalizedNewPhone =
        getValidatedNewPhoneNumber(phoneNumber);

      if (
        !normalizedNewPhone ||
        !/^[6-9]\d{9}$/.test(normalizedNewPhone)
      ) {
        Alert.alert(
          'Invalid phone number',
          'Enter a valid 10-digit Indian mobile number.',
        );
        return;
      }

      const normalizedCurrentPhone =
        getValidatedNewPhoneNumber(currentUser.phoneNumber);

      if (normalizedNewPhone === normalizedCurrentPhone) {
        Alert.alert(
          'Same phone number',
          'Enter a number different from your current number.',
        );
        return;
      }

      // First press: send OTP and show the OTP input inline.

      if (!otpSent) {
        setPhoneBusy(true);

        try {
          const response = await client.mutate({
            mutation: SEND_PHONE_CHANGE_OTP,
            variables: {
              input: {
                userId: currentUser.userId,
                currentPhoneNumber: currentUser.phoneNumber,
                newPhoneNumber: normalizedNewPhone,
              },
            },
          });

          const result =
            response.data?.sendPhoneChangeOTP;

          if (!result?.success) {
            throw new Error(
              result?.message || 'Unable to send OTP.',
            );
          }

          setOtp('');
          setOtpSent(true);
        } catch (error: any) {
          console.error(
            '[EditProfile] Send OTP error:',
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

        return;
      }

      // Second press: verify OTP before updating the phone.

      if (!/^\d{6}$/.test(otp.trim())) {
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
              currentPhoneNumber: currentUser.phoneNumber,
              newPhoneNumber: normalizedNewPhone,
              otp: otp.trim(),
            },
          },
        });

        const result =
          response.data?.verifyPhoneChangeOTP;

        if (!result?.success || !result?.user?.phoneNumber) {
          throw new Error(
            result?.message ||
              'Phone verification failed.',
          );
        }

        accountPhoneNumber = result.user.phoneNumber;

        // The backend has verified and changed the number.
        // Update local account state immediately.

        const verifiedUser: User = {
          ...currentUser,
          phoneNumber: accountPhoneNumber,
          fullName:
            result.user.fullName ?? currentUser.fullName,
          updatedAt:
            result.user.updatedAt ?? currentUser.updatedAt,
        };

        setCurrentUser(verifiedUser);
        setPhoneNumber(accountPhoneNumber);
        setOtp('');
        setOtpSent(false);
      } catch (error: any) {
        console.error(
          '[EditProfile] Verify OTP error:',
          error?.message || error,
        );

        Alert.alert(
          'Verification failed',
          error?.message ||
            'Unable to verify the code. Please try again.',
        );

        return;
      } finally {
        setPhoneBusy(false);
      }
    }

    // ---------------------------------------------------------
    // SAVE NAME AND/OR PHOTO
    // ---------------------------------------------------------

    setSaving(true);

    try {
      let savedPhotoUrl =
        currentUser.profileImageUrl ?? null;

      if (selectedPhoto) {
        savedPhotoUrl = await uploadProfilePhoto(
          selectedPhoto,
          accountPhoneNumber,
        );
      }

      const response = await client.mutate({
        mutation: UPDATE_CUSTOMER_PROFILE,
        variables: {
          input: {
            userId: currentUser.userId,
            phoneNumber: accountPhoneNumber,
            fullName: trimmedName,
          },
        },
      });

      const result =
        response.data?.updateCustomerProfile;

      if (!result?.success || !result?.user) {
        throw new Error(
          result?.message || 'Unable to save your profile.',
        );
      }

      const updatedUser: User = {
        ...currentUser,
        phoneNumber: accountPhoneNumber,
        fullName: result.user.fullName || trimmedName,
        profileImageUrl: savedPhotoUrl,
        updatedAt:
          result.user.updatedAt ?? currentUser.updatedAt,
      };

      setCurrentUser(updatedUser);
      setFullName(updatedUser.fullName);
      setPhoneNumber(updatedUser.phoneNumber);
      setProfileImageUri(
        updatedUser.profileImageUrl ?? undefined,
      );
      setSelectedPhoto(null);
      setOtp('');
      setOtpSent(false);

      Alert.alert(
        'Profile updated',
        'Your changes have been saved successfully.',
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
  // UI
  // =========================================================

  const busy = saving || phoneBusy;

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
            disabled={busy}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          {/* PHOTO */}

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
                disabled={busy}
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
              disabled={busy}
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

          {/* ONE SIMPLE FORM */}

          <View style={styles.formCard}>
            {/* NAME */}

            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#9690A8"
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                maxLength={100}
                editable={!busy}
                accessibilityLabel="Full name"
              />
            </View>

            {/* PHONE NUMBER */}

            <View style={styles.field}>
              <Text style={styles.label}>Phone number</Text>

              <TextInput
                value={phoneNumber}
                onChangeText={value => {
                  setPhoneNumber(value);

                  // A changed number needs a fresh OTP.
                  setOtp('');
                  setOtpSent(false);
                }}
                placeholder="Enter mobile number"
                placeholderTextColor="#9690A8"
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={13}
                autoCorrect={false}
                editable={!busy}
                accessibilityLabel="Phone number"
              />

              {phoneChanged ? (
                <Text style={styles.inlineHint}>
                  Verify your new number with OTP to save changes
                </Text>
              ) : null}

              {/* OTP APPEARS ONLY WHEN NEEDED */}

              {phoneChanged && otpSent ? (
                <View style={styles.otpContainer}>
                  <Text style={styles.otpHint}>
                    Verification code sent to your new number.
                  </Text>

                  <TextInput
                    value={otp}
                    onChangeText={value =>
                      setOtp(
                        value.replace(/\D/g, '').slice(0, 6),
                      )
                    }
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#9690A8"
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!busy}
                    textContentType="oneTimeCode"
                    accessibilityLabel="Verification code"
                  />

                  <TouchableOpacity
                    disabled={busy}
                    activeOpacity={0.7}
                    style={styles.resendButton}
                    onPress={async () => {
                      const normalizedNewPhone =
                        getValidatedNewPhoneNumber(phoneNumber);

                      if (
                        !normalizedNewPhone ||
                        !/^[6-9]\d{9}$/.test(normalizedNewPhone)
                      ) {
                        Alert.alert(
                          'Invalid phone number',
                          'Enter a valid 10-digit Indian mobile number.',
                        );
                        return;
                      }

                      if (!currentUser?.userId || !currentUser.phoneNumber) {
                        Alert.alert(
                          'Account unavailable',
                          'Please sign in again and retry.',
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
                            result?.message || 'Unable to resend OTP.',
                          );
                        }

                        setOtp('');
                        Alert.alert(
                          'OTP sent',
                          'A new verification code has been sent.',
                        );
                      } catch (error: any) {
                        Alert.alert(
                          'Unable to resend OTP',
                          error?.message ||
                            'Please try again in a moment.',
                        );
                      } finally {
                        setPhoneBusy(false);
                      }
                    }}
                  >
                    <Text style={styles.resendText}>
                      Resend code
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>

          {/* THE ONLY SAVE BUTTON */}

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!hasChanges || busy}
            accessibilityRole="button"
            accessibilityLabel="Save profile changes"
            style={[
              styles.saveButtonWrapper,
              (!hasChanges || busy) && styles.saveButtonDisabled,
            ]}
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.saveButton}
            >
              {busy ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </AppGradient>
          </TouchableOpacity>
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
    backgroundColor: '#F8F7FC',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  header: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E4F0',
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
    color: '#211C35',
    fontSize: 18,
    fontWeight: '700',
  },

  headerRight: {
    width: 38,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  photoSection: {
    alignItems: 'center',
    marginBottom: 25,
  },

  avatarWrap: {
    width: 104,
    height: 104,
    marginBottom: 10,
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
    right: 0,
    bottom: 1,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3D9FF',
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
    backgroundColor: '#7655D9',
  },

  cameraBody: {
    width: 17,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#7655D9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraLens: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#7655D9',
  },

  changePhotoText: {
    color: '#6842B5',
    fontSize: 13,
    fontWeight: '600',
  },

  selectedPhotoText: {
    marginTop: 5,
    fontSize: 12,
    color: '#777389',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#E8E4F0',
  },

  field: {
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#494456',
    marginBottom: 8,
  },

  input: {
    minHeight: 48,
    backgroundColor: '#FBFAFE',
    borderWidth: 1,
    borderColor: '#E4E1EB',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#242033',
  },

  inlineHint: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 17,
    color: '#6842B5',
  },

  otpContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F5FF',
    borderWidth: 1,
    borderColor: '#E3D9FF',
    borderRadius: 12,
  },

  otpHint: {
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#6842B5',
  },

  resendButton: {
    alignSelf: 'flex-start',
    paddingTop: 12,
    paddingBottom: 2,
  },

  resendText: {
    color: '#6842B5',
    fontSize: 12,
    fontWeight: '700',
  },

  saveButtonWrapper: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});