
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApolloClient, gql } from '@apollo/client';
import {
    launchImageLibrary,
    Asset,
} from 'react-native-image-picker';
import { MAX_PHOTO_SIZE } from '../../../constants/config';
import { useUser } from '../../../context/UserContext';
import { GRADIENTS } from '../../../constants/constants';
import AppGradient from '../../../common/AppGradient';
import { GET_CUSTOMER_PROFILE_PHOTO, UPDATE_CUSTOMER_PROFILE_PHOTO, GENERATE_CUSTOMER_PHOTO_UPLOAD_URL } from '../../../graphql/queries';

export default function EditProfile() {
    const navigation = useNavigation<any>();
    const client = useApolloClient();

    const { currentUser, setCurrentUser } = useUser();

    const [fullName, setFullName] = useState(
        currentUser?.fullName || '',
    );

    const [profileImageUri, setProfileImageUri] = useState<
        string | undefined
    >(currentUser?.profileImageUrl || undefined);

    const [selectedPhoto, setSelectedPhoto] = useState<Asset | null>(
        null,
    );

    const [saving, setSaving] = useState(false);

    // =========================================================
    // CHOOSE PROFILE PHOTO
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
    // UPLOAD PHOTO TO S3 AND SAVE PHOTO KEY
    // =========================================================

    const uploadProfilePhoto = async (
        asset: Asset,
    ): Promise<string | null> => {
        if (!currentUser?.userId || !currentUser?.phoneNumber) {
            throw new Error(
                'Customer details are unavailable. Please sign in again.',
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

        const fileName =
            asset.fileName ||
            `profile-${Date.now()}.${contentType === 'image/png'
                ? 'png'
                : contentType === 'image/webp'
                    ? 'webp'
                    : 'jpg'
            }`;

        const fileResponse = await fetch(asset.uri);

        if (!fileResponse.ok) {
            throw new Error(
                'Unable to read the selected photo.',
            );
        }

        const fileBlob = await fileResponse.blob();

        const fileSize =
            asset.fileSize ?? fileBlob.size;

        if (!fileSize || fileSize > MAX_PHOTO_SIZE) {
            throw new Error(
                'Please select an image smaller than 10 MB.',
            );
        }

        // 1. Generate a presigned S3 upload URL.

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

        // 2. Upload the photo directly to S3.

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
            const errorBody = await s3Response
                .text()
                .catch(() => '');

            console.error(
                '[EditProfile] S3 upload status:',
                s3Response.status,
            );

            console.error(
                '[EditProfile] S3 upload response:',
                errorBody,
            );

            throw new Error(
                `Photo upload failed (HTTP ${s3Response.status}). Check logs for details.`,
            );
        }

        // 3. Save the S3 key in the customer record.

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
            saveResponse.data?.updateCustomerProfilePhoto;

        if (!saveData?.success) {
            throw new Error(
                saveData?.message ||
                'The uploaded photo could not be saved to your profile.',
            );
        }

        // 4. Retrieve a signed URL for the private photo.

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

        if (!photoData?.success || !photoData?.viewUrl) {
            throw new Error(
                photoData?.message ||
                'Photo saved, but its display URL could not be retrieved.',
            );
        }

        return photoData.viewUrl;
    };

    // =========================================================
    // SAVE PROFILE
    // =========================================================

    const handleSave = async () => {
        const trimmedName = fullName.trim();

        if (!trimmedName) {
            Alert.alert(
                'Name required',
                'Please enter your full name.',
            );
            return;
        }

        if (!currentUser) {
            Alert.alert(
                'Unable to update',
                'Your user details could not be found. Please sign in again.',
            );
            return;
        }

        setSaving(true);

        try {
            let savedPhotoUrl =
                currentUser.profileImageUrl || undefined;

            if (selectedPhoto) {
                savedPhotoUrl =
                    (await uploadProfilePhoto(selectedPhoto)) ||
                    undefined;
            }

            // Update the in-memory user context.
            setCurrentUser({
                ...currentUser,
                fullName: trimmedName,
                profileImageUrl: savedPhotoUrl,
            });

            Alert.alert(
                'Profile updated',
                selectedPhoto
                    ? 'Your profile photo has been uploaded and saved.'
                    : 'Your name has been updated in this session.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ],
            );
        } catch (error: any) {
            console.error(
                '[EditProfile] Save error details:',
                JSON.stringify(
                    {
                        message: error?.message,
                        graphQLErrors: error?.graphQLErrors,
                        networkError: error?.networkError,
                    },
                    null,
                    2,
                ),
            );
            console.error(
                '[EditProfile] Save error:',
                error,
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
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        disabled={saving}
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
                    <View style={styles.photoSection}>
                        <View style={styles.avatarWrap}>
                            <AppGradient
                                colors={[...GRADIENTS.SOFT_PURPLE]}
                                style={styles.avatar}
                            >
                                {profileImageUri ? (
                                    <Image
                                        source={{
                                            uri: profileImageUri,
                                        }}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
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
                                disabled={saving}
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
                            disabled={saving}
                            activeOpacity={0.7}
                            accessibilityRole="button"
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
                                editable={!saving}
                            />
                        </View>

                        <View
                            style={[
                                styles.field,
                                styles.lastField,
                            ]}
                        >
                            <Text style={styles.label}>
                                Phone number
                            </Text>

                            <TextInput
                                value={currentUser?.phoneNumber || ''}
                                editable={false}
                                style={[
                                    styles.input,
                                    styles.disabledInput,
                                ]}
                                placeholder="Phone number not available"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSave}
                        activeOpacity={0.85}
                        disabled={saving}
                        style={[
                            styles.saveButtonWrapper,
                            saving && styles.saveButtonDisabled,
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
                                    Save changes
                                </Text>
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
        letterSpacing: 0.1,
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
        letterSpacing: 0.1,
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
        shadowColor: '#29243A',
        shadowOpacity: 0.035,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
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
        letterSpacing: 0.15,
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
        fontWeight: '400',
        color: '#242033',
    },
    disabledInput: {
        backgroundColor: '#F5F4F8',
        borderColor: '#EFEDF3',
        color: '#777282',
    },
    saveButtonWrapper: {
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonDisabled: {
        opacity: 0.7,
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
        letterSpacing: 0.2,
    },
});