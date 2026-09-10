
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    launchImageLibrary,
    ImagePickerResponse,
    Asset,
} from 'react-native-image-picker';

import {
    gql,
    useMutation,
    useQuery,
} from '@apollo/client';

import {
    useNavigation,
} from '@react-navigation/native';

import { useUser } from '../../../context/UserContext';
import { DELETE_SALON_MEDIA, GENERATE_SALON_MEDIA_UPLOAD_URL, GET_SALON, UPDATE_SALON_PROFILE } from '../../../graphql/queries';


// ============================================================
// CONSTANTS
// ============================================================

const MAX_GALLERY_IMAGES = 6;

const MAX_FILE_SIZE_BYTES =
    10 * 1024 * 1024;

const DEFAULT_IMAGE_TYPE = 'image/jpeg';


// ============================================================
// TYPES
// ============================================================

type SalonAddress = {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
};

type Salon = {
    salonId: string;
    ownerUserId: string;

    salonName: string;
    ownerName: string;
    businessType: string;

    ownerPhoneNumber: string;
    alternatePhone?: string | null;
    email: string;

    address: SalonAddress;

    logoUrl?: string | null;
    coverImageUrl?: string | null;
    galleryImages: string[];

    kycStatus?: string;
    salonStatus?: string;

    isActive?: boolean;
    isVisible?: boolean;
    isDeleted?: boolean;

    averageRating?: number;
    totalReviews?: number;

    createdAt?: string;
    updatedAt?: string;
};

type ImageType =
    | 'logo'
    | 'cover'
    | 'gallery';


// ============================================================
// HELPERS
// ============================================================

const normalizeString = (
    value: unknown,
): string => {
    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    return String(value).trim();
};


// ============================================================
// CONTENT TYPE
// ============================================================

const getContentType = (
    asset: Asset,
): string => {
    const type =
        normalizeString(
            asset.type,
        ).toLowerCase();

    if (
        type === 'image/jpeg' ||
        type === 'image/png' ||
        type === 'image/webp'
    ) {
        return type;
    }

    return DEFAULT_IMAGE_TYPE;
};


// ============================================================
// SUPPORTED IMAGE
// ============================================================

const isSupportedImage = (
    asset: Asset,
): boolean => {
    const type =
        normalizeString(
            asset.type,
        ).toLowerCase();

    return (
        type === 'image/jpeg' ||
        type === 'image/png' ||
        type === 'image/webp'
    );
};


// ============================================================
// FILE EXTENSION
// ============================================================

const getFileExtension = (
    contentType: string,
): string => {
    switch (contentType) {
        case 'image/png':
            return 'png';

        case 'image/webp':
            return 'webp';

        case 'image/jpeg':
        default:
            return 'jpg';
    }
};


// ============================================================
// GET S3 KEY FROM STORED URL
// ============================================================

const getS3KeyFromUrl = (
    value: string,
): string | null => {
    try {
        if (!value) {
            return null;
        }

        /*
         * Example:
         *
         * https://bucket.s3.ap-south-2.amazonaws.com/
         * salons/123/gallery/abc.jpg
         */

        const parsed =
            new URL(value);

        const pathname =
            decodeURIComponent(
                parsed.pathname,
            );

        const key =
            pathname.replace(
                /^\/+/,
                '',
            );

        if (
            key.startsWith(
                'salons/',
            )
        ) {
            return key;
        }

        return null;
    } catch (error) {
        console.warn(
            'Unable to extract S3 key:',
            error,
        );

        return null;
    }
};


// ============================================================
// IMAGE UPLOAD
// ============================================================

async function uploadImageToS3(
    asset: Asset,
    salonId: string,
    mediaType: ImageType,
    generateUploadUrl: any,
): Promise<{
    objectUrl: string;
    key: string;
}> {
    if (!salonId) {
        throw new Error(
            'Salon ID is missing.',
        );
    }

    if (!asset.uri) {
        throw new Error(
            'Selected image does not have a valid URI.',
        );
    }

    if (!isSupportedImage(asset)) {
        throw new Error(
            'Only JPEG, PNG and WebP images are supported.',
        );
    }

    if (
        asset.fileSize &&
        asset.fileSize >
        MAX_FILE_SIZE_BYTES
    ) {
        throw new Error(
            'Image size cannot exceed 10 MB.',
        );
    }

    const contentType =
        getContentType(asset);

    console.log(
        'Requesting S3 upload URL:',
        {
            salonId,
            mediaType,
            contentType,
            fileSize:
                asset.fileSize,
        },
    );

    const { data } =
        await generateUploadUrl({
            variables: {
                input: {
                    salonId,
                    mediaType:
                        mediaType.toUpperCase(),
                    contentType,
                    fileSize:
                        asset.fileSize ||
                        undefined,
                },
            },
        });

    const response =
        data?.generateSalonMediaUploadUrl;

    if (!response?.success) {
        throw new Error(
            response?.message ||
            'Unable to generate S3 upload URL.',
        );
    }

    if (!response.uploadUrl) {
        throw new Error(
            'S3 upload URL was not returned.',
        );
    }

    if (!response.objectUrl) {
        throw new Error(
            'S3 object URL was not returned.',
        );
    }

    console.log(
        'Uploading image to S3:',
        response.key,
    );

    const localResponse =
        await fetch(asset.uri);

    if (!localResponse.ok) {
        throw new Error(
            'Unable to read the selected image.',
        );
    }

    const blob =
        await localResponse.blob();

    const uploadResponse =
        await fetch(
            response.uploadUrl,
            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        contentType,
                },

                body: blob,
            },
        );

    if (!uploadResponse.ok) {
        const errorText =
            await uploadResponse
                .text()
                .catch(
                    () => '',
                );

        console.error(
            'S3 upload failed:',
            uploadResponse.status,
            errorText,
        );

        throw new Error(
            `Image upload failed (${uploadResponse.status}).`,
        );
    }

    console.log(
        'S3 upload successful:',
        response.key,
    );

    return {
        objectUrl:
            response.objectUrl,
        key:
            response.key,
    };
}


// ============================================================
// MAIN SCREEN
// ============================================================

export default function SalonInformation() {
    const navigation =
        useNavigation<any>();

    const {
        currentUser,
    } = useUser();

    // ========================================================
    // IMPORTANT TYPESCRIPT FIX
    //
    // currentUser?.salonId can be:
    // string | null | undefined
    //
    // Converting missing values to an empty string means
    // salonId is ALWAYS a string from this point onward.
    // ========================================================

    const salonId =
        currentUser?.salonId ?? '';


    // ========================================================
    // SALON QUERY
    // ========================================================

    const {
        data,
        loading:
        loadingSalon,
        error:
        salonError,
        refetch,
    } = useQuery(
        GET_SALON,
        {
            variables: {
                salonId,
            },

            skip:
                !salonId,

            fetchPolicy:
                'network-only',
        },
    );


    // ========================================================
    // MUTATIONS
    // ========================================================

    const [
        updateSalonProfile,
        {
            loading:
            updatingProfile,
        },
    ] = useMutation(
        UPDATE_SALON_PROFILE,
    );


    const [
        generateUploadUrl,
    ] = useMutation(
        GENERATE_SALON_MEDIA_UPLOAD_URL,
    );


    const [
        deleteSalonMedia,
    ] = useMutation(
        DELETE_SALON_MEDIA,
    );


    // ========================================================
    // FORM STATE
    // ========================================================

    const [
        salonName,
        setSalonName,
    ] = useState('');

    const [
        ownerName,
        setOwnerName,
    ] = useState('');

    const [
        businessType,
        setBusinessType,
    ] = useState('');

    const [
        email,
        setEmail,
    ] = useState('');

    const [
        phoneNumber,
        setPhoneNumber,
    ] = useState('');

    const [
        alternatePhone,
        setAlternatePhone,
    ] = useState('');

    const [
        addressLine,
        setAddressLine,
    ] = useState('');

    const [
        city,
        setCity,
    ] = useState('');

    const [
        state,
        setState,
    ] = useState('');

    const [
        pincode,
        setPincode,
    ] = useState('');

    const [
        logoUrl,
        setLogoUrl,
    ] = useState('');

    const [
        coverImageUrl,
        setCoverImageUrl,
    ] = useState('');

    const [
        galleryImages,
        setGalleryImages,
    ] = useState<string[]>(
        [],
    );


    // ========================================================
    // UI STATE
    // ========================================================

    const [
        savingImage,
        setSavingImage,
    ] = useState<
        ImageType | null
    >(null);

    const [
        removingGalleryIndex,
        setRemovingGalleryIndex,
    ] = useState<
        number | null
    >(null);


    // ========================================================
    // INITIALIZE FORM
    // ========================================================

    useEffect(() => {
        const salon:
            Salon | undefined =
            data?.getSalon;

        if (!salon) {
            return;
        }

        setSalonName(
            salon.salonName || '',
        );

        setOwnerName(
            salon.ownerName || '',
        );

        setBusinessType(
            salon.businessType || '',
        );

        setEmail(
            salon.email || '',
        );

        setPhoneNumber(
            salon.ownerPhoneNumber ||
            '',
        );

        setAlternatePhone(
            salon.alternatePhone ||
            '',
        );

        setAddressLine(
            salon.address
                ?.addressLine || '',
        );

        setCity(
            salon.address?.city ||
            '',
        );

        setState(
            salon.address?.state ||
            '',
        );

        setPincode(
            salon.address
                ?.pincode || '',
        );

        setLogoUrl(
            salon.logoUrl || '',
        );

        setCoverImageUrl(
            salon.coverImageUrl ||
            '',
        );

        const images =
            Array.isArray(
                salon.galleryImages,
            )
                ? salon.galleryImages
                : [];

        setGalleryImages(
            Array.from(
                new Set(
                    images.filter(
                        Boolean,
                    ),
                ),
            ).slice(
                0,
                MAX_GALLERY_IMAGES,
            ),
        );
    }, [data]);


    // ========================================================
    // ERROR
    // ========================================================

    useEffect(() => {
        if (!salonError) {
            return;
        }

        console.error(
            'Get salon error:',
            salonError,
        );

        Alert.alert(
            'Unable to load salon',
            salonError.message ||
            'Unable to load salon information.',
        );
    }, [salonError]);


    // ========================================================
    // SALON
    // ========================================================

    const salon:
        Salon | null =
        data?.getSalon || null;


    // ========================================================
    // VALIDATION
    // ========================================================

    const validateForm =
        useCallback(() => {
            if (!salonId) {
                Alert.alert(
                    'Salon not found',
                    'Your salon information could not be identified.',
                );

                return false;
            }

            if (
                !salonName.trim()
            ) {
                Alert.alert(
                    'Salon name required',
                    'Please enter your salon name.',
                );

                return false;
            }

            if (
                !ownerName.trim()
            ) {
                Alert.alert(
                    'Owner name required',
                    'Please enter the owner name.',
                );

                return false;
            }

            if (
                !businessType.trim()
            ) {
                Alert.alert(
                    'Business type required',
                    'Please enter the business type.',
                );

                return false;
            }

            if (
                !email.trim()
            ) {
                Alert.alert(
                    'Email required',
                    'Please enter your email address.',
                );

                return false;
            }

            if (
                !phoneNumber.trim()
            ) {
                Alert.alert(
                    'Phone number required',
                    'Please enter your phone number.',
                );

                return false;
            }

            if (
                !addressLine.trim()
            ) {
                Alert.alert(
                    'Address required',
                    'Please enter your address.',
                );

                return false;
            }

            if (!city.trim()) {
                Alert.alert(
                    'City required',
                    'Please enter your city.',
                );

                return false;
            }

            if (!state.trim()) {
                Alert.alert(
                    'State required',
                    'Please enter your state.',
                );

                return false;
            }

            if (!pincode.trim()) {
                Alert.alert(
                    'Pincode required',
                    'Please enter your pincode.',
                );

                return false;
            }

            if (
                galleryImages.length >
                MAX_GALLERY_IMAGES
            ) {
                Alert.alert(
                    'Gallery limit exceeded',
                    `You can have a maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
                );

                return false;
            }

            return true;
        }, [
            salonId,
            salonName,
            ownerName,
            businessType,
            email,
            phoneNumber,
            addressLine,
            city,
            state,
            pincode,
            galleryImages.length,
        ]);


    // ========================================================
    // PICK IMAGE
    // ========================================================

    const pickImage =
        useCallback(
            async (
                mediaType: ImageType,
            ) => {
                if (
                    savingImage
                ) {
                    return;
                }

                // Extra runtime safety.
                if (!salonId) {
                    Alert.alert(
                        'Salon not found',
                        'Your salon information could not be identified.',
                    );

                    return;
                }

                if (
                    mediaType ===
                    'gallery' &&
                    galleryImages.length >=
                    MAX_GALLERY_IMAGES
                ) {
                    Alert.alert(
                        'Gallery full',
                        `You can add a maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
                    );

                    return;
                }

                try {
                    const result:
                        ImagePickerResponse =
                        await launchImageLibrary(
                            {
                                mediaType:
                                    'photo',

                                selectionLimit:
                                    mediaType ===
                                        'gallery'
                                        ? Math.max(
                                            1,
                                            MAX_GALLERY_IMAGES -
                                            galleryImages.length,
                                        )
                                        : 1,

                                includeBase64:
                                    false,

                                // Removed quality because
                                // the installed image-picker
                                // typings reject 0.8 / 0.85.
                            },
                        );

                    if (
                        result.didCancel
                    ) {
                        return;
                    }

                    if (
                        result.errorCode
                    ) {
                        console.error(
                            'Image picker error:',
                            result.errorCode,
                            result.errorMessage,
                        );

                        Alert.alert(
                            'Image selection failed',
                            result.errorMessage ||
                            'Unable to select image.',
                        );

                        return;
                    }

                    const assets =
                        result.assets ||
                        [];

                    if (
                        assets.length ===
                        0
                    ) {
                        return;
                    }

                    setSavingImage(
                        mediaType,
                    );

                    // ==================================================
                    // GALLERY
                    // ==================================================

                    if (
                        mediaType ===
                        'gallery'
                    ) {
                        const remaining =
                            MAX_GALLERY_IMAGES -
                            galleryImages.length;

                        const selectedAssets =
                            assets.slice(
                                0,
                                remaining,
                            );

                        const uploadedUrls:
                            string[] =
                            [];

                        for (
                            const asset of selectedAssets
                        ) {
                            try {
                                const uploaded =
                                    await uploadImageToS3(
                                        asset,
                                        salonId,
                                        mediaType,
                                        generateUploadUrl,
                                    );

                                if (
                                    !galleryImages.includes(
                                        uploaded.objectUrl,
                                    ) &&
                                    !uploadedUrls.includes(
                                        uploaded.objectUrl,
                                    )
                                ) {
                                    uploadedUrls.push(
                                        uploaded.objectUrl,
                                    );
                                }
                            } catch (
                            uploadError
                            ) {
                                console.error(
                                    'Gallery image upload error:',
                                    uploadError,
                                );

                                Alert.alert(
                                    'Image upload failed',
                                    uploadError instanceof
                                        Error
                                        ? uploadError.message
                                        : 'Unable to upload image.',
                                );

                                break;
                            }
                        }

                        if (
                            uploadedUrls.length >
                            0
                        ) {
                            setGalleryImages(
                                previous =>
                                    Array.from(
                                        new Set([
                                            ...previous,
                                            ...uploadedUrls,
                                        ]),
                                    ).slice(
                                        0,
                                        MAX_GALLERY_IMAGES,
                                    ),
                            );
                        }
                    }

                    // ==================================================
                    // LOGO / COVER
                    // ==================================================

                    else {
                        const asset =
                            assets[0];

                        const uploaded =
                            await uploadImageToS3(
                                asset,
                                salonId,
                                mediaType,
                                generateUploadUrl,
                            );

                        if (
                            mediaType ===
                            'logo'
                        ) {
                            setLogoUrl(
                                uploaded.objectUrl,
                            );
                        }

                        if (
                            mediaType ===
                            'cover'
                        ) {
                            setCoverImageUrl(
                                uploaded.objectUrl,
                            );
                        }
                    }
                } catch (error) {
                    console.error(
                        'Image selection/upload error:',
                        error,
                    );

                    Alert.alert(
                        'Upload failed',
                        error instanceof
                            Error
                            ? error.message
                            : 'Unable to upload image.',
                    );
                } finally {
                    setSavingImage(
                        null,
                    );
                }
            },
            [
                savingImage,
                galleryImages,
                salonId,
                generateUploadUrl,
            ],
        );


    // ========================================================
    // REMOVE GALLERY IMAGE
    // ========================================================

    const removeGalleryImage =
        useCallback(
            (
                index: number,
            ) => {
                const image =
                    galleryImages[
                    index
                    ];

                if (!image) {
                    return;
                }

                if (!salonId) {
                    Alert.alert(
                        'Salon not found',
                        'Your salon information could not be identified.',
                    );

                    return;
                }

                Alert.alert(
                    'Remove image',
                    'Are you sure you want to remove this gallery image?',
                    [
                        {
                            text:
                                'Cancel',
                            style:
                                'cancel',
                        },
                        {
                            text:
                                'Remove',
                            style:
                                'destructive',

                            onPress:
                                async () => {
                                    try {
                                        setRemovingGalleryIndex(
                                            index,
                                        );

                                        const key =
                                            getS3KeyFromUrl(
                                                image,
                                            );

                                        if (
                                            key
                                        ) {
                                            const {
                                                data: deleteData,
                                            } =
                                                await deleteSalonMedia(
                                                    {
                                                        variables:
                                                        {
                                                            input:
                                                            {
                                                                salonId,
                                                                key,
                                                            },
                                                        },
                                                    },
                                                );

                                            const deleteResponse =
                                                deleteData
                                                    ?.deleteSalonMedia;

                                            if (
                                                !deleteResponse?.success
                                            ) {
                                                throw new Error(
                                                    deleteResponse?.message ||
                                                    'Unable to delete image from S3.',
                                                );
                                            }
                                        }

                                        setGalleryImages(
                                            previous =>
                                                previous.filter(
                                                    (
                                                        _,
                                                        imageIndex,
                                                    ) =>
                                                        imageIndex !==
                                                        index,
                                                ),
                                        );

                                        Alert.alert(
                                            'Image removed',
                                            'The gallery image has been removed.',
                                        );
                                    } catch (
                                    error
                                    ) {
                                        console.error(
                                            'Delete gallery image error:',
                                            error,
                                        );

                                        Alert.alert(
                                            'Unable to remove image',
                                            error instanceof
                                                Error
                                                ? error.message
                                                : 'Please try again.',
                                        );
                                    } finally {
                                        setRemovingGalleryIndex(
                                            null,
                                        );
                                    }
                                },
                        },
                    ],
                );
            },
            [
                galleryImages,
                salonId,
                deleteSalonMedia,
            ],
        );


    // ========================================================
    // SAVE PROFILE
    // ========================================================

    const handleSave =
        useCallback(
            async () => {
                if (
                    updatingProfile
                ) {
                    return;
                }

                if (!salonId) {
                    Alert.alert(
                        'Salon not found',
                        'Your salon information could not be identified.',
                    );

                    return;
                }

                if (
                    !validateForm()
                ) {
                    return;
                }

                try {
                    const {
                        data:
                        mutationData,
                    } =
                        await updateSalonProfile(
                            {
                                variables:
                                {
                                    input:
                                    {
                                        salonId,

                                        salonName:
                                            salonName.trim(),

                                        ownerName:
                                            ownerName.trim(),

                                        businessType:
                                            businessType.trim(),

                                        email:
                                            email.trim(),

                                        ownerPhoneNumber:
                                            phoneNumber.trim(),

                                        alternatePhone:
                                            alternatePhone.trim() ||
                                            null,

                                        address:
                                        {
                                            addressLine:
                                                addressLine.trim(),

                                            city:
                                                city.trim(),

                                            state:
                                                state.trim(),

                                            pincode:
                                                pincode.trim(),
                                        },

                                        logoUrl:
                                            logoUrl ||
                                            null,

                                        coverImageUrl:
                                            coverImageUrl ||
                                            null,

                                        galleryImages:
                                            galleryImages,
                                    },
                                },
                            },
                        );

                    const response =
                        mutationData
                            ?.updateSalonProfile;

                    if (
                        !response?.success
                    ) {
                        throw new Error(
                            response?.message ||
                            'Unable to update salon profile.',
                        );
                    }

                    await refetch();

                   Alert.alert(
    'Changes submitted',
    'Your profile changes have been submitted for admin approval. Your current customer-facing profile will remain unchanged until the changes are approved.',
);
                } catch (
                error
                ) {
                    console.error(
                        'Update salon profile error:',
                        error,
                    );

                    Alert.alert(
                        'Update failed',
                        error instanceof
                            Error
                            ? error.message
                            : 'Unable to update salon information.',
                    );
                }
            },
            [
                updatingProfile,
                validateForm,
                updateSalonProfile,
                salonId,
                salonName,
                ownerName,
                businessType,
                email,
                phoneNumber,
                alternatePhone,
                addressLine,
                city,
                state,
                pincode,
                logoUrl,
                coverImageUrl,
                galleryImages,
                refetch,
            ],
        );


    // ========================================================
    // HEADER TITLE
    // ========================================================

    const screenTitle =
        useMemo(
            () =>
                salon?.salonName ||
                'Salon Information',
            [salon],
        );


    // ========================================================
    // NO SALON ID
    // ========================================================

    if (!salonId) {
        return (
            <SafeAreaView
                style={
                    styles.container
                }
            >
                <View
                    style={
                        styles.centerContainer
                    }
                >
                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Salon not found
                    </Text>

                    <Text
                        style={
                            styles.errorMessage
                        }
                    >
                        Your provider account is not
                        currently linked to a salon.
                    </Text>

                    <TouchableOpacity
                        style={
                            styles.secondaryButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >
                        <Text
                            style={
                                styles.secondaryButtonText
                            }
                        >
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }


    // ========================================================
    // LOADING
    // ========================================================

    if (
        loadingSalon &&
        !salon
    ) {
        return (
            <SafeAreaView
                style={
                    styles.container
                }
            >
                <View
                    style={
                        styles.centerContainer
                    }
                >
                    <ActivityIndicator
                        size="large"
                        color={
                            stylesVars.primary
                        }
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Loading salon information...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            <KeyboardAvoidingView
                style={
                    styles.flex
                }
                behavior={
                    Platform.OS ===
                        'ios'
                        ? 'padding'
                        : undefined
                }
            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <View
                    style={
                        styles.header
                    }
                >
                    <TouchableOpacity
                        style={
                            styles.backButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >
                        <Text
                            style={
                                styles.backIcon
                            }
                        >
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={
                            styles.headerTitle
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {screenTitle}
                    </Text>

                    <View
                        style={
                            styles.headerSpacer
                        }
                    />
                </View>


                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.scrollContent
                    }
                >

                    {/* ================================================= */}
                    {/* BASIC INFORMATION */}
                    {/* ================================================= */}

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
                            Basic Information
                        </Text>

                        <Text
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            Update the information customers see
                            about your salon.
                        </Text>


                        <InputField
                            label="Salon Name"
                            value={
                                salonName
                            }
                            onChangeText={
                                setSalonName
                            }
                            placeholder="Enter salon name"
                        />


                        <InputField
                            label="Owner Name"
                            value={
                                ownerName
                            }
                            onChangeText={
                                setOwnerName
                            }
                            placeholder="Enter owner name"
                        />


                        <InputField
                            label="Business Type"
                            value={
                                businessType
                            }
                            onChangeText={
                                setBusinessType
                            }
                            placeholder="e.g. Salon, Beauty Parlour"
                        />


                        <InputField
                            label="Email"
                            value={
                                email
                            }
                            onChangeText={
                                setEmail
                            }
                            placeholder="Enter email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />


                        <InputField
                            label="Phone Number"
                            value={
                                phoneNumber
                            }
                            onChangeText={
                                setPhoneNumber
                            }
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />


                        <InputField
                            label="Alternate Phone"
                            value={
                                alternatePhone
                            }
                            onChangeText={
                                setAlternatePhone
                            }
                            placeholder="Optional alternate phone"
                            keyboardType="phone-pad"
                            optional
                        />
                    </View>


                    {/* ================================================= */}
                    {/* ADDRESS */}
                    {/* ================================================= */}

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
                            Salon Address
                        </Text>

                        <InputField
                            label="Address"
                            value={
                                addressLine
                            }
                            onChangeText={
                                setAddressLine
                            }
                            placeholder="Enter full address"
                            multiline
                        />

                        <InputField
                            label="City"
                            value={
                                city
                            }
                            onChangeText={
                                setCity
                            }
                            placeholder="Enter city"
                        />

                        <InputField
                            label="State"
                            value={
                                state
                            }
                            onChangeText={
                                setState
                            }
                            placeholder="Enter state"
                        />

                        <InputField
                            label="Pincode"
                            value={
                                pincode
                            }
                            onChangeText={
                                setPincode
                            }
                            placeholder="Enter pincode"
                            keyboardType="number-pad"
                            maxLength={
                                6
                            }
                        />
                    </View>


                    {/* ================================================= */}
                    {/* LOGO */}
                    {/* ================================================= */}

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
                            Salon Logo
                        </Text>

                        <Text
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            Add a clear logo customers can
                            recognize.
                        </Text>

                        <View
                            style={
                                styles.logoRow
                            }
                        >
                            <View
                                style={
                                    styles.logoPreview
                                }
                            >
                                {logoUrl ? (
                                    <Image
                                        source={{
                                            uri:
                                                logoUrl,
                                        }}
                                        style={
                                            styles.logoImage
                                        }
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.logoPlaceholder
                                        }
                                    >
                                        {getInitials(
                                            salonName,
                                        )}
                                    </Text>
                                )}
                            </View>

                            <View
                                style={
                                    styles.logoActions
                                }
                            >
                                <TouchableOpacity
                                    style={
                                        styles.outlineButton
                                    }
                                    onPress={() =>
                                        pickImage(
                                            'logo',
                                        )
                                    }
                                    disabled={
                                        !!savingImage
                                    }
                                >
                                    {savingImage ===
                                        'logo' ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={
                                                stylesVars.primary
                                            }
                                        />
                                    ) : (
                                        <Text
                                            style={
                                                styles.outlineButtonText
                                            }
                                        >
                                            {logoUrl
                                                ? 'Change Logo'
                                                : 'Add Logo'}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <Text
                                    style={
                                        styles.imageHint
                                    }
                                >
                                    JPEG, PNG or WebP • Max 10 MB
                                </Text>
                            </View>
                        </View>
                    </View>


                    {/* ================================================= */}
                    {/* COVER */}
                    {/* ================================================= */}

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
                            Cover Photo
                        </Text>

                        <Text
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            This image can be used as the main
                            banner for your salon.
                        </Text>

                        <View
                            style={
                                styles.coverContainer
                            }
                        >
                            {coverImageUrl ? (
                                <Image
                                    source={{
                                        uri:
                                            coverImageUrl,
                                    }}
                                    style={
                                        styles.coverImage
                                    }
                                />
                            ) : (
                                <View
                                    style={
                                        styles.coverPlaceholder
                                    }
                                >
                                    <Text
                                        style={
                                            styles.coverPlaceholderText
                                        }
                                    >
                                        No cover photo
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={
                                    styles.coverButton
                                }
                                onPress={() =>
                                    pickImage(
                                        'cover',
                                    )
                                }
                                disabled={
                                    !!savingImage
                                }
                            >
                                {savingImage ===
                                    'cover' ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.coverButtonText
                                        }
                                    >
                                        {coverImageUrl
                                            ? 'Change Cover'
                                            : 'Add Cover'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>


                    {/* ================================================= */}
                    {/* GALLERY */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.section
                        }
                    >
                        <View
                            style={
                                styles.galleryHeader
                            }
                        >
                            <View
                                style={
                                    styles.galleryTitleContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Gallery
                                </Text>

                                <Text
                                    style={
                                        styles.sectionSubtitle
                                    }
                                >
                                    Showcase your salon and work.
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.galleryCount
                                }
                            >
                                {galleryImages.length} /{' '}
                                {
                                    MAX_GALLERY_IMAGES
                                }
                            </Text>
                        </View>


                        {galleryImages.length ===
                            0 ? (
                            <View
                                style={
                                    styles.emptyGallery
                                }
                            >
                                <Text
                                    style={
                                        styles.emptyGalleryIcon
                                    }
                                >
                                    +
                                </Text>

                                <Text
                                    style={
                                        styles.emptyGalleryTitle
                                    }
                                >
                                    No gallery images
                                </Text>

                                <Text
                                    style={
                                        styles.emptyGalleryText
                                    }
                                >
                                    Add photos to help customers
                                    discover your salon.
                                </Text>
                            </View>
                        ) : (
                            <View
                                style={
                                    styles.galleryGrid
                                }
                            >
                                {galleryImages.map(
                                    (
                                        image,
                                        index,
                                    ) => (
                                        <View
                                            key={`${image}-${index}`}
                                            style={
                                                styles.galleryItem
                                            }
                                        >
                                            <Image
                                                source={{
                                                    uri:
                                                        image,
                                                }}
                                                style={
                                                    styles.galleryImage
                                                }
                                            />

                                            <Pressable
                                                style={
                                                    styles.removeGalleryButton
                                                }
                                                onPress={() =>
                                                    removeGalleryImage(
                                                        index,
                                                    )
                                                }
                                                disabled={
                                                    removingGalleryIndex ===
                                                    index
                                                }
                                            >
                                                {removingGalleryIndex ===
                                                    index ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#FFFFFF"
                                                    />
                                                ) : (
                                                    <Text
                                                        style={
                                                            styles.removeGalleryText
                                                        }
                                                    >
                                                        ×
                                                    </Text>
                                                )}
                                            </Pressable>
                                        </View>
                                    ),
                                )}
                            </View>
                        )}


                        {galleryImages.length <
                            MAX_GALLERY_IMAGES && (
                                <TouchableOpacity
                                    style={
                                        styles.addGalleryButton
                                    }
                                    onPress={() =>
                                        pickImage(
                                            'gallery',
                                        )
                                    }
                                    disabled={
                                        !!savingImage
                                    }
                                >
                                    {savingImage ===
                                        'gallery' ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={
                                                stylesVars.primary
                                            }
                                        />
                                    ) : (
                                        <Text
                                            style={
                                                styles.addGalleryButtonText
                                            }
                                        >
                                            + Add Gallery Photos
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}

                        <Text
                            style={
                                styles.imageHint
                            }
                        >
                            You can add up to{' '}
                            {
                                MAX_GALLERY_IMAGES
                            } images.
                        </Text>
                    </View>


                    {/* ================================================= */}
                    {/* PROTECTED INFORMATION */}
                    {/* ================================================= */}

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
                            Verification information
                        </Text>

                        <Text
                            style={
                                styles.infoText
                            }
                        >
                            KYC, GST, PAN, Aadhaar, bank details,
                            approval status and salon status are
                            managed separately and cannot be changed
                            from Salon Information.
                        </Text>
                    </View>


                    {/* ================================================= */}
                    {/* SAVE */}
                    {/* ================================================= */}

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            updatingProfile &&
                            styles.saveButtonDisabled,
                        ]}
                        onPress={
                            handleSave
                        }
                        disabled={
                            updatingProfile
                        }
                    >
                        {updatingProfile ? (
                            <>
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />

                                <Text
                                    style={
                                        styles.saveButtonText
                                    }
                                >
                                    Saving...
                                </Text>
                            </>
                        ) : (
                            <Text
                                style={
                                    styles.saveButtonText
                                }
                            >
                                Save Changes
                            </Text>
                        )}
                    </TouchableOpacity>


                    <View
                        style={{
                            height: 40,
                        }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


// ============================================================
// INPUT COMPONENT
// ============================================================

function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    multiline,
    maxLength,
    autoCapitalize,
    optional,
}: {
    label: string;
    value: string;
    onChangeText: (
        value: string,
    ) => void;
    placeholder: string;
    keyboardType?: any;
    multiline?: boolean;
    maxLength?: number;
    autoCapitalize?: any;
    optional?: boolean;
}) {
    return (
        <View
            style={
                styles.inputContainer
            }
        >
            <View
                style={
                    styles.inputLabelRow
                }
            >
                <Text
                    style={
                        styles.inputLabel
                    }
                >
                    {label}
                </Text>

                {optional && (
                    <Text
                        style={
                            styles.optionalText
                        }
                    >
                        Optional
                    </Text>
                )}
            </View>

            <TextInput
                value={
                    value
                }
                onChangeText={
                    onChangeText
                }
                placeholder={
                    placeholder
                }
                placeholderTextColor={
                    stylesVars.placeholder
                }
                keyboardType={
                    keyboardType
                }
                multiline={
                    multiline
                }
                maxLength={
                    maxLength
                }
                autoCapitalize={
                    autoCapitalize ||
                    'sentences'
                }
                style={[
                    styles.input,
                    multiline &&
                    styles.multilineInput,
                ]}
                textAlignVertical={
                    multiline
                        ? 'top'
                        : 'center'
                }
            />
        </View>
    );
}


// ============================================================
// INITIALS
// ============================================================

function getInitials(
    name: string,
): string {
    const normalized =
        normalizeString(
            name,
        );

    if (!normalized) {
        return 'S';
    }

    return normalized
        .split(/\s+/)
        .map(
            word =>
                word.charAt(
                    0,
                ),
        )
        .slice(0, 2)
        .join('')
        .toUpperCase();
}


// ============================================================
// STYLE CONSTANTS
// ============================================================

const stylesVars = {
    primary:
        '#009D94',

    primaryDark:
        '#009D94',

    background:
        '#F8F7FC',

    card:
        '#FFFFFF',

    text:
        '#17121F',

    secondaryText:
        '#6F6878',

    border:
        '#E7E2ED',

    placeholder:
        '#A39BAA',

    danger:
        '#DC2626',
};


// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({
        flex: {
            flex: 1,
        },

        container: {
            flex: 1,
            backgroundColor:
                stylesVars.background,
        },

        centerContainer: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                30,
        },

        loadingText: {
            marginTop: 14,
            fontSize: 14,
            color:
                stylesVars.secondaryText,
        },

        errorTitle: {
            fontSize: 21,
            fontWeight:
                '700',
            color:
                stylesVars.text,
            marginBottom: 8,
        },

        errorMessage: {
            textAlign:
                'center',
            fontSize: 14,
            lineHeight: 21,
            color:
                stylesVars.secondaryText,
            marginBottom: 24,
        },

        secondaryButton: {
            minWidth: 120,
            height: 46,
            paddingHorizontal: 24,
            borderRadius: 12,
            alignItems:
                'center',
            justifyContent:
                'center',
            backgroundColor:
                stylesVars.text,
        },

        secondaryButtonText: {
            color:
                '#FFFFFF',
            fontSize: 14,
            fontWeight:
                '700',
        },

        // ====================================================
        // HEADER
        // ====================================================

        header: {
            height: 58,
            flexDirection:
                'row',
            alignItems:
                'center',
            paddingHorizontal:
                16,
            backgroundColor:
                '#FFFFFF',
            borderBottomWidth:
                1,
            borderBottomColor:
                stylesVars.border,
        },

        backButton: {
            width: 40,
            height: 40,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        backIcon: {
            fontSize: 34,
            lineHeight: 36,
            color:
                stylesVars.text,
            fontWeight:
                '300',
        },

        headerTitle: {
            flex: 1,
            textAlign:
                'center',
            fontSize: 18,
            fontWeight:
                '700',
            color:
                stylesVars.text,
        },

        headerSpacer: {
            width: 40,
        },

        scrollContent: {
            paddingHorizontal:
                16,
            paddingTop:
                18,
        },

        // ====================================================
        // SECTIONS
        // ====================================================

        section: {
            backgroundColor:
                stylesVars.card,
            borderRadius:
                18,
            padding:
                18,
            marginBottom:
                16,
            borderWidth:
                1,
            borderColor:
                stylesVars.border,
        },

        sectionTitle: {
            fontSize: 18,
            fontWeight:
                '700',
            color:
                stylesVars.text,
        },

        sectionSubtitle: {
            fontSize: 13,
            lineHeight: 19,
            color:
                stylesVars.secondaryText,
            marginTop: 5,
            marginBottom: 18,
        },

        // ====================================================
        // INPUT
        // ====================================================

        inputContainer: {
            marginBottom:
                15,
        },

        inputLabelRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
            marginBottom:
                7,
        },

        inputLabel: {
            fontSize: 13,
            fontWeight:
                '600',
            color:
                stylesVars.text,
        },

        optionalText: {
            fontSize: 11,
            color:
                stylesVars.secondaryText,
        },

        input: {
            minHeight: 48,
            borderWidth:
                1,
            borderColor:
                stylesVars.border,
            borderRadius:
                12,
            paddingHorizontal:
                14,
            paddingVertical:
                11,
            backgroundColor:
                '#FFFFFF',
            color:
                stylesVars.text,
            fontSize: 14,
        },

        multilineInput: {
            minHeight: 90,
        },

        // ====================================================
        // LOGO
        // ====================================================

        logoRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        logoPreview: {
            width: 92,
            height: 92,
            borderRadius:
                46,
            backgroundColor:
                '#F0EAFE',
            alignItems:
                'center',
            justifyContent:
                'center',
            overflow:
                'hidden',
            borderWidth:
                1,
            borderColor:
                stylesVars.border,
        },

        logoImage: {
            width: '100%',
            height: '100%',
            resizeMode:
                'cover',
        },

        logoPlaceholder: {
            fontSize: 25,
            fontWeight:
                '800',
            color:
                stylesVars.primary,
        },

        logoActions: {
            flex: 1,
            marginLeft:
                16,
        },

        outlineButton: {
            minHeight: 44,
            paddingHorizontal:
                16,
            borderRadius:
                11,
            borderWidth:
                1,
            borderColor:
                stylesVars.primary,
            alignItems:
                'center',
            justifyContent:
                'center',
            alignSelf:
                'flex-start',
        },

        outlineButtonText: {
            color:
                stylesVars.primary,
            fontSize: 13,
            fontWeight:
                '700',
        },

        imageHint: {
            fontSize: 11,
            color:
                stylesVars.secondaryText,
            marginTop: 8,
            lineHeight: 16,
        },

        // ====================================================
        // COVER
        // ====================================================

        coverContainer: {
            height: 190,
            borderRadius:
                15,
            overflow:
                'hidden',
            backgroundColor:
                '#F0EDF4',
            position:
                'relative',
        },

        coverImage: {
            width: '100%',
            height: '100%',
            resizeMode:
                'cover',
        },

        coverPlaceholder: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        coverPlaceholderText: {
            fontSize: 14,
            color:
                stylesVars.secondaryText,
        },

        coverButton: {
            position:
                'absolute',
            right: 12,
            bottom: 12,
            paddingHorizontal: 15,
            minHeight: 42,
            borderRadius: 11,
            alignItems:
                'center',
            justifyContent:
                'center',
            backgroundColor:
                'rgba(0,0,0,0.70)',
        },

        coverButtonText: {
            color:
                '#FFFFFF',
            fontSize: 13,
            fontWeight:
                '700',
        },

        // ====================================================
        // GALLERY
        // ====================================================

        galleryHeader: {
            flexDirection:
                'row',
            alignItems:
                'flex-start',
            justifyContent:
                'space-between',
        },

        galleryTitleContainer: {
            flex: 1,
        },

        galleryCount: {
            fontSize: 13,
            fontWeight:
                '700',
            color:
                stylesVars.primary,
            marginTop: 3,
        },

        emptyGallery: {
            minHeight: 170,
            borderRadius:
                14,
            borderWidth:
                1,
            borderStyle:
                'dashed',
            borderColor:
                '#CFC6D8',
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                24,
        },

        emptyGalleryIcon: {
            width: 44,
            height: 44,
            borderRadius:
                22,
            backgroundColor:
                '#F0EAFE',
            color:
                stylesVars.primary,
            fontSize: 27,
            textAlign:
                'center',
            lineHeight: 42,
            marginBottom:
                10,
        },

        emptyGalleryTitle: {
            fontSize: 14,
            fontWeight:
                '700',
            color:
                stylesVars.text,
        },

        emptyGalleryText: {
            fontSize: 12,
            color:
                stylesVars.secondaryText,
            textAlign:
                'center',
            marginTop: 5,
            lineHeight: 18,
        },

        galleryGrid: {
            flexDirection:
                'row',
            flexWrap:
                'wrap',
            marginHorizontal:
                -4,
        },

        galleryItem: {
            width: '33.3333%',
            aspectRatio: 1,
            padding: 4,
        },

        galleryImage: {
            width: '100%',
            height: '100%',
            borderRadius:
                12,
            resizeMode:
                'cover',
            backgroundColor:
                '#F0EDF4',
        },

        removeGalleryButton: {
            position:
                'absolute',
            right: 8,
            top: 8,
            width: 28,
            height: 28,
            borderRadius:
                14,
            backgroundColor:
                'rgba(0,0,0,0.72)',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        removeGalleryText: {
            color:
                '#FFFFFF',
            fontSize: 22,
            lineHeight: 23,
            fontWeight:
                '300',
        },

        addGalleryButton: {
            height: 46,
            borderRadius:
                12,
            borderWidth:
                1,
            borderColor:
                stylesVars.primary,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginTop:
                14,
        },

        addGalleryButtonText: {
            fontSize: 13,
            fontWeight:
                '700',
            color:
                stylesVars.primary,
        },

        // ====================================================
        // INFO
        // ====================================================

        infoCard: {
            backgroundColor:
                '#F0EAFE',
            borderRadius:
                16,
            padding:
                16,
            marginBottom:
                16,
            borderWidth:
                1,
            borderColor:
                '#DDD1FA',
        },

        infoTitle: {
            fontSize: 14,
            fontWeight:
                '700',
            color:
                stylesVars.text,
            marginBottom:
                6,
        },

        infoText: {
            fontSize: 12,
            lineHeight: 18,
            color:
                '#5E5368',
        },

        // ====================================================
        // SAVE
        // ====================================================

        saveButton: {
            minHeight: 52,
            borderRadius:
                14,
            backgroundColor:
                stylesVars.primary,
            alignItems:
                'center',
            justifyContent:
                'center',
            flexDirection:
                'row',
            gap: 9,
            marginBottom:
                10,
        },

        saveButtonDisabled: {
            opacity:
                0.65,
        },

        saveButtonText: {
            color:
                '#FFFFFF',
            fontSize: 15,
            fontWeight:
                '700',
        },
    });

