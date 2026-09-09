import React, {
    useMemo,
    useState,
} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Switch,
    ActivityIndicator,
} from 'react-native';
import {
    useNavigation,
    useRoute,
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import {
    useMutation,
    useQuery,
} from '@apollo/client';
import {
    CREATE_OFFER,
    UPDATE_OFFER,
    LIST_SALON_SERVICES,
} from '../../../graphql/queries';
import { useUser } from '../../../context/UserContext';

const PRIMARY = '#009D94';

/**
 * ============================================================
 * OFFER SERVICE TARGETING
 * ============================================================
 *
 * serviceIds:
 *
 * [] = ANY SERVICES
 *
 * [serviceId1, serviceId2] = PARTICULAR SERVICES
 *
 * Category is NOT manually selected anymore.
 *
 * Categories are derived automatically from the selected
 * services because every service already contains:
 *
 * service.category
 */

type DiscountType =
    | 'PERCENTAGE'
    | 'FIXED';

type ServiceOfferMode =
    | 'ANY'
    | 'SPECIFIC';

type SalonService = {
    serviceId: string;
    salonId: string;
    name: string;
    category: string;
    description?: string | null;
    duration: number;
    price: number;
    gender?: string;
    popular?: boolean;
    active?: boolean;
};

type CreateOfferRouteParams = {
    offerId?: string;
    offer?: any;
    mode?: 'EDIT';
};

export default function CreateOfferScreen() {
    const navigation =
        useNavigation<any>();

    const route =
        useRoute<any>();

    const {
        currentUser,
    } = useUser();

    const salonId =
        currentUser?.salonId ||
        null;

    const params =
        (route.params || {}) as CreateOfferRouteParams;

    const isEditMode =
        params.mode === 'EDIT';

    const existingOffer =
        params.offer;

    /**
     * ========================================================
     * SERVICES
     * ========================================================
     */

    const {
        data: servicesData,
        loading: servicesLoading,
        error: servicesError,
        refetch: refetchServices,
    } = useQuery(
        LIST_SALON_SERVICES,
        {
            variables: {
                salonId,
            },
            skip: !salonId,
            fetchPolicy: 'network-only',
        },
    );

    const salonServices: SalonService[] =
        useMemo(() => {
            const services =
                servicesData?.listServices ||
                [];

            return services.filter(
                (service: SalonService) =>
                    service.salonId ===
                    salonId,
            );
        }, [
            servicesData,
            salonId,
        ]);

    /**
     * ========================================================
     * EXISTING OFFER SERVICE MODE
     * ========================================================
     */

    const initialServiceIds =
        Array.isArray(
            existingOffer?.serviceIds,
        )
            ? existingOffer.serviceIds
            : [];

    const [
        serviceOfferMode,
        setServiceOfferMode,
    ] =
        useState<ServiceOfferMode>(
            initialServiceIds.length > 0
                ? 'SPECIFIC'
                : 'ANY',
        );

    const [
        selectedServiceIds,
        setSelectedServiceIds,
    ] = useState<string[]>(
        initialServiceIds,
    );

    /**
     * ========================================================
     * MUTATIONS
     * ========================================================
     */

    const [
        createOffer,
        {
            loading:
                createLoading,
        },
    ] = useMutation(
        CREATE_OFFER,
    );

    const [
        updateOffer,
        {
            loading:
                updateLoading,
        },
    ] = useMutation(
        UPDATE_OFFER,
    );

    /**
     * ========================================================
     * BASIC OFFER INFORMATION
     * ========================================================
     */

    const [title, setTitle] =
        useState(
            existingOffer?.title ||
            '',
        );

    const [
        description,
        setDescription,
    ] = useState(
        existingOffer?.description ||
        '',
    );

    /**
     * ========================================================
     * DISCOUNT
     * ========================================================
     */

    const [
        discountType,
        setDiscountType,
    ] =
        useState<DiscountType>(
            existingOffer?.discountType ||
            'PERCENTAGE',
        );

    const [
        discountValue,
        setDiscountValue,
    ] = useState(
        existingOffer?.discountValue !=
            null
            ? String(
                existingOffer.discountValue,
            )
            : '',
    );

    /**
     * ========================================================
     * COUPON
     * ========================================================
     */

    const [
        couponCode,
        setCouponCode,
    ] = useState(
        existingOffer?.couponCode ||
        '',
    );

    /**
     * ========================================================
     * BOOKING CONDITIONS
     * ========================================================
     */

    const [
        minimumBookingAmount,
        setMinimumBookingAmount,
    ] = useState(
        existingOffer?.minimumBookingAmount !=
            null
            ? String(
                existingOffer.minimumBookingAmount,
            )
            : '',
    );

    /**
     * ========================================================
     * OFFER DATES
     * ========================================================
     *
     * The values are still stored as YYYY-MM-DD strings so
     * the GraphQL/backend payload remains unchanged.
     *
     * Users cannot manually type dates anymore.
     * They select dates using the calendar picker.
     */

    const [
        startDate,
        setStartDate,
    ] = useState(
        existingOffer?.startDate
            ? String(
                existingOffer.startDate,
            ).substring(0, 10)
            : '',
    );

    const [
        endDate,
        setEndDate,
    ] = useState(
        existingOffer?.endDate
            ? String(
                existingOffer.endDate,
            ).substring(0, 10)
            : '',
    );

    /**
     * Calendar visibility
     */

    const [
        showStartDatePicker,
        setShowStartDatePicker,
    ] = useState(false);

    const [
        showEndDatePicker,
        setShowEndDatePicker,
    ] = useState(false);

    /**
     * ========================================================
     * DATE HELPERS
     * ========================================================
     */

    const parseDateString = (
        value: string,
        fallback: Date,
    ) => {
        if (!value) {
            return fallback;
        }

        const parts =
            value.split('-');

        if (
            parts.length !== 3
        ) {
            return fallback;
        }

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]) - 1;

        const day =
            Number(parts[2]);

        const parsed =
            new Date(
                year,
                month,
                day,
            );

        if (
            Number.isNaN(
                parsed.getTime(),
            )
        ) {
            return fallback;
        }

        return parsed;
    };

    const formatDateForBackend = (
        date: Date,
    ) => {
        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1,
            ).padStart(2, '0');

        const day =
            String(
                date.getDate(),
            ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (
        value: string,
    ) => {
        if (!value) {
            return '';
        }

        const date =
            parseDateString(
                value,
                new Date(),
            );

        if (
            Number.isNaN(
                date.getTime(),
            )
        ) {
            return value;
        }

        return date.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            },
        );
    };

    /**
     * ========================================================
     * START DATE SELECTED
     * ========================================================
     */

    const handleStartDateChange = (day: {
        dateString: string;
    }) => {
        const formattedDate =
            day.dateString;

        setStartDate(
            formattedDate,
        );

        /**
         * If an existing end date is earlier than the newly
         * selected start date, clear the end date so the user
         * must select a valid end date.
         */
        if (endDate) {
            const existingEndDate =
                parseDateString(
                    endDate,
                    new Date(),
                );

            const selectedStartDate =
                parseDateString(
                    formattedDate,
                    new Date(),
                );

            if (
                existingEndDate <
                selectedStartDate
            ) {
                setEndDate('');
            }
        }

        setShowStartDatePicker(false);
    };

    /**
     * ========================================================
     * END DATE SELECTED
     * ========================================================
     */

    const handleEndDateChange = (day: {
        dateString: string;
    }) => {
        const formattedDate =
            day.dateString;

        /**
         * End date cannot be before start date.
         */
        if (startDate) {
            const selectedStartDate =
                parseDateString(
                    startDate,
                    new Date(),
                );

            const selectedEndDate =
                parseDateString(
                    formattedDate,
                    new Date(),
                );

            if (
                selectedEndDate <
                selectedStartDate
            ) {
                Alert.alert(
                    'Invalid end date',
                    'End date cannot be before the start date.',
                );
                return;
            }
        }

        setEndDate(
            formattedDate,
        );
        setShowEndDatePicker(false);
    };

    /**
     * ========================================================
     * OPEN START DATE
     * ========================================================
     */

    const openStartDatePicker =
        () => {
            setShowEndDatePicker(
                false,
            );

            setShowStartDatePicker(
                true,
            );
        };

    /**
     * ========================================================
     * OPEN END DATE
     * ========================================================
     */

    const openEndDatePicker =
        () => {
            setShowStartDatePicker(
                false,
            );

            setShowEndDatePicker(
                true,
            );
        };

        /**
     * ========================================================
     * USAGE
     * ========================================================
     */

    const [
        usageLimit,
        setUsageLimit,
    ] = useState(
        existingOffer?.usageLimit !=
            null
            ? String(
                existingOffer.usageLimit,
            )
            : '',
    );

    const [
        customerLimit,
        setCustomerLimit,
    ] = useState(
        existingOffer?.customerLimit !=
            null
            ? String(
                existingOffer.customerLimit,
            )
            : '',
    );

    const [
        noMinimumBooking,
        setNoMinimumBooking,
    ] = useState(
        existingOffer?.minimumBookingAmount ==
        null,
    );

    const [
        unlimitedUsage,
        setUnlimitedUsage,
    ] = useState(
        existingOffer?.usageLimit ==
        null,
    );

    const [
        unlimitedCustomerUsage,
        setUnlimitedCustomerUsage,
    ] = useState(
        existingOffer?.customerLimit ==
        null,
    );

    const isSubmitting =
        createLoading ||
        updateLoading;

    /**
     * ========================================================
     * DISCOUNT PREVIEW
     * ========================================================
     */

    const discountPreview =
        useMemo(() => {
            const value =
                Number(
                    discountValue,
                );

            if (
                !value ||
                value <= 0
            ) {
                return 'Your discount will appear here';
            }

            if (
                discountType ===
                'PERCENTAGE'
            ) {
                return `${value}% OFF`;
            }

            return `₹${value} OFF`;
        }, [
            discountType,
            discountValue,
        ]);

    /**
     * ========================================================
     * SERVICE SELECTION
     * ========================================================
     */

    const toggleService = (
        serviceId: string,
    ) => {
        if (
            serviceOfferMode !==
            'SPECIFIC'
        ) {
            return;
        }

        setSelectedServiceIds(
            current => {
                if (
                    current.includes(
                        serviceId,
                    )
                ) {
                    return current.filter(
                        id =>
                            id !==
                            serviceId,
                    );
                }

                return [
                    ...current,
                    serviceId,
                ];
            },
        );
    };

    /**
     * ========================================================
     * ANY SERVICES
     * ========================================================
     */

    const selectAnyServices =
        () => {
            setServiceOfferMode(
                'ANY',
            );

            setSelectedServiceIds(
                [],
            );
        };

    /**
     * ========================================================
     * PARTICULAR SERVICES
     * ========================================================
     */

    const selectSpecificServices =
        () => {
            setServiceOfferMode(
                'SPECIFIC',
            );
        };

    /**
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    const validateForm =
        () => {
            if (!salonId) {
                Alert.alert(
                    'Salon information missing',
                    'Your salon information is unavailable. Please log in again.',
                );
                return false;
            }

            if (!title.trim()) {
                Alert.alert(
                    'Missing title',
                    'Please enter an offer title.',
                );
                return false;
            }

            if (
                !description.trim()
            ) {
                Alert.alert(
                    'Missing description',
                    'Please enter an offer description.',
                );
                return false;
            }

            const discount =
                Number(
                    discountValue,
                );

            if (
                !discountValue.trim() ||
                !Number.isFinite(
                    discount,
                ) ||
                discount <= 0
            ) {
                Alert.alert(
                    'Invalid discount',
                    'Please enter a valid discount value.',
                );
                return false;
            }

            if (
                discountType ===
                'PERCENTAGE' &&
                discount > 100
            ) {
                Alert.alert(
                    'Invalid discount',
                    'Percentage discount cannot be greater than 100%.',
                );
                return false;
            }

            /**
             * PARTICULAR SERVICES
             */

            if (
                serviceOfferMode ===
                'SPECIFIC' &&
                selectedServiceIds.length ===
                0
            ) {
                Alert.alert(
                    'Select services',
                    'Please select at least one service for this offer.',
                );
                return false;
            }

            /**
             * Make sure selected services belong to this salon.
             */

            if (
                serviceOfferMode ===
                'SPECIFIC'
            ) {
                const salonServiceIds =
                    new Set(
                        salonServices.map(
                            service =>
                                service.serviceId,
                        ),
                    );

                const invalidService =
                    selectedServiceIds.some(
                        id =>
                            !salonServiceIds.has(
                                id,
                            ),
                    );

                if (
                    invalidService
                ) {
                    Alert.alert(
                        'Invalid service',
                        'One or more selected services do not belong to your salon. Please select the services again.',
                    );
                    return false;
                }
            }

            /**
             * ====================================================
             * DATES
             * ====================================================
             */

            if (!startDate.trim()) {
                Alert.alert(
                    'Missing start date',
                    'Please select the offer start date.',
                );
                return false;
            }

            if (!endDate.trim()) {
                Alert.alert(
                    'Missing end date',
                    'Please select the offer end date.',
                );
                return false;
            }

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(
                    startDate.trim(),
                )
            ) {
                Alert.alert(
                    'Invalid start date',
                    'Please select a valid start date.',
                );
                return false;
            }

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(
                    endDate.trim(),
                )
            ) {
                Alert.alert(
                    'Invalid end date',
                    'Please select a valid end date.',
                );
                return false;
            }

            const start =
                new Date(
                    `${startDate.trim()}T00:00:00`,
                );

            const end =
                new Date(
                    `${endDate.trim()}T23:59:59`,
                );

            if (
                Number.isNaN(
                    start.getTime(),
                )
            ) {
                Alert.alert(
                    'Invalid start date',
                    'Please select a valid start date.',
                );
                return false;
            }

            if (
                Number.isNaN(
                    end.getTime(),
                )
            ) {
                Alert.alert(
                    'Invalid end date',
                    'Please select a valid end date.',
                );
                return false;
            }

            if (end < start) {
                Alert.alert(
                    'Invalid dates',
                    'End date must be on or after the start date.',
                );
                return false;
            }

            /**
             * ====================================================
             * MINIMUM BOOKING
             * ====================================================
             */

            if (
                !noMinimumBooking
            ) {
                const minimum =
                    Number(
                        minimumBookingAmount,
                    );

                if (
                    !minimumBookingAmount.trim() ||
                    !Number.isFinite(
                        minimum,
                    ) ||
                    minimum <= 0
                ) {
                    Alert.alert(
                        'Invalid minimum amount',
                        'Please enter a valid minimum booking amount.',
                    );
                    return false;
                }
            }

            /**
             * ====================================================
             * TOTAL USAGE LIMIT
             * ====================================================
             */

            if (
                !unlimitedUsage
            ) {
                const limit =
                    Number(
                        usageLimit,
                    );

                if (
                    !usageLimit.trim() ||
                    !Number.isFinite(
                        limit,
                    ) ||
                    limit <= 0 ||
                    !Number.isInteger(
                        limit,
                    )
                ) {
                    Alert.alert(
                        'Invalid usage limit',
                        'Please enter a valid whole-number usage limit.',
                    );
                    return false;
                }
            }

            /**
             * ====================================================
             * CUSTOMER USAGE LIMIT
             * ====================================================
             */

            if (
                !unlimitedCustomerUsage
            ) {
                const limit =
                    Number(
                        customerLimit,
                    );

                if (
                    !customerLimit.trim() ||
                    !Number.isFinite(
                        limit,
                    ) ||
                    limit <= 0 ||
                    !Number.isInteger(
                        limit,
                    )
                ) {
                    Alert.alert(
                        'Invalid customer limit',
                        'Please enter a valid whole-number customer usage limit.',
                    );
                    return false;
                }
            }

            return true;
        };

    /**
     * ========================================================
     * SUBMIT
     * ========================================================
     */

    const handleSubmit =
        async () => {
            if (
                !validateForm()
            ) {
                return;
            }

            if (!salonId) {
                return;
            }

            const offerServiceIds =
                serviceOfferMode ===
                    'ANY'
                    ? []
                    : selectedServiceIds;

            const offerInput = {
                salonId,

                title:
                    title.trim(),

                description:
                    description.trim(),

                discountType,

                discountValue:
                    Number(
                        discountValue,
                    ),

                couponCode:
                    couponCode.trim() ||
                    null,

                minimumBookingAmount:
                    noMinimumBooking
                        ? null
                        : Number(
                            minimumBookingAmount,
                        ),

                serviceIds:
                    offerServiceIds,

                startDate:
                    startDate.trim(),

                endDate:
                    endDate.trim(),

                usageLimit:
                    unlimitedUsage
                        ? null
                        : Number(
                            usageLimit,
                        ),

                customerLimit:
                    unlimitedCustomerUsage
                        ? null
                        : Number(
                            customerLimit,
                        ),
            };

            try {
                console.log(
                    '====================================',
                );

                console.log(
                    isEditMode
                        ? 'UPDATE OFFER INPUT:'
                        : 'CREATE OFFER INPUT:',
                    JSON.stringify(
                        offerInput,
                        null,
                        2,
                    ),
                );

                console.log(
                    'OFFER SERVICE MODE:',
                    serviceOfferMode,
                );

                console.log(
                    'OFFER APPLICATION:',
                    serviceOfferMode ===
                        'ANY'
                        ? 'ALL ELIGIBLE BOOKED SERVICES'
                        : 'SELECTED SERVICES ONLY',
                );

                console.log(
                    'SELECTED SERVICE IDS:',
                    JSON.stringify(
                        offerServiceIds,
                        null,
                        2,
                    ),
                );

                console.log(
                    '====================================',
                );

                /**
                 * ====================================================
                 * UPDATE
                 * ====================================================
                 */

                if (isEditMode) {
                    if (
                        !params.offerId
                    ) {
                        throw new Error(
                            'Offer ID is missing.',
                        );
                    }

                    const {
                        data,
                    } =
                        await updateOffer({
                            variables: {
                                input: {
                                    offerId:
                                        params.offerId,
                                    ...offerInput,
                                },
                            },
                        });

                    console.log(
                        'UPDATE OFFER RESPONSE:',
                        JSON.stringify(
                            data,
                            null,
                            2,
                        ),
                    );

                    const response =
                        data?.updateOffer;

                    if (!response) {
                        throw new Error(
                            'No response received from updateOffer.',
                        );
                    }

                    if (
                        !response.success
                    ) {
                        Alert.alert(
                            'Unable to update offer',
                            response.message ||
                            'The offer could not be updated.',
                        );
                        return;
                    }

                    Alert.alert(
                        'Offer updated',
                        response.message ||
                        'Your offer has been updated successfully.',
                        [
                            {
                                text: 'OK',
                                onPress:
                                    () =>
                                        navigation.goBack(),
                            },
                        ],
                    );

                    return;
                }

                /**
                 * ====================================================
                 * CREATE
                 * ====================================================
                 */

                const {
                    data,
                } =
                    await createOffer({
                        variables: {
                            input:
                                offerInput,
                        },
                    });

                console.log(
                    'CREATE OFFER RESPONSE:',
                    JSON.stringify(
                        data,
                        null,
                        2,
                    ),
                );

                const response =
                    data?.createOffer;

                if (!response) {
                    throw new Error(
                        'No response received from createOffer.',
                    );
                }

                if (
                    !response.success
                ) {
                    Alert.alert(
                        'Unable to create offer',
                        response.message ||
                        'The offer could not be created.',
                    );
                    return;
                }

                Alert.alert(
                    'Offer submitted',
                    response.message ||
                    'Your offer has been submitted for admin approval.',
                    [
                        {
                            text: 'OK',
                            onPress:
                                () =>
                                    navigation.goBack(),
                        },
                    ],
                );
            } catch (
                submitError: any
            ) {
                console.error(
                    isEditMode
                        ? 'Update offer error:'
                        : 'Create offer error:',
                    submitError,
                );

                const message =
                    submitError
                        ?.graphQLErrors?.[0]
                        ?.message ||
                    submitError
                        ?.networkError
                        ?.message ||
                    submitError?.message ||
                    'Something went wrong. Please try again.';

                Alert.alert(
                    isEditMode
                        ? 'Unable to update offer'
                        : 'Unable to create offer',
                    message,
                );
            }
        };

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            <KeyboardAvoidingView
                style={
                    styles.keyboardContainer
                }
                behavior={
                    Platform.OS ===
                        'ios'
                        ? 'padding'
                        : undefined
                }
            >
                {/* =====================================================
                    HEADER
                ====================================================== */}

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
                        <Ionicons
                            name="arrow-back"
                            size={23}
                            color="#111827"
                        />
                    </TouchableOpacity>

                    <View
                        style={
                            styles.headerTitleContainer
                        }
                    >
                        <Text
                            style={
                                styles.headerTitle
                            }
                        >
                            {isEditMode
                                ? 'Edit Offer'
                                : 'Create Offer'}
                        </Text>

                        <Text
                            style={
                                styles.headerSubtitle
                            }
                        >
                            {isEditMode
                                ? 'Update your offer'
                                : 'Create a new salon offer'}
                        </Text>
                    </View>
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
                    {/* =================================================
                        APPROVAL NOTICE
                    ================================================== */}

                    <View
                        style={
                            styles.approvalNotice
                        }
                    >
                        <View
                            style={
                                styles.approvalIcon
                            }
                        >
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={22}
                                color={
                                    PRIMARY
                                }
                            />
                        </View>

                        <View
                            style={
                                styles.approvalContent
                            }
                        >
                            <Text
                                style={
                                    styles.approvalTitle
                                }
                            >
                                Admin approval
                                required
                            </Text>

                            <Text
                                style={
                                    styles.approvalText
                                }
                            >
                                {isEditMode
                                    ? 'Changes to your offer will be reviewed by Clavata before becoming active.'
                                    : 'Your offer will be reviewed by Clavata before it becomes visible to customers.'}
                            </Text>
                        </View>
                    </View>

                    {/* =================================================
                        BASIC INFORMATION
                    ================================================== */}

                    <SectionTitle
                        title="Basic Information"
                        subtitle="Tell customers about your offer"
                    />

                    <InputField
                        label="Offer Title"
                        required
                        placeholder="e.g. Weekend Hair Special"
                        value={title}
                        onChangeText={
                            setTitle
                        }
                        maxLength={80}
                    />

                    <InputField
                        label="Description"
                        required
                        placeholder="Describe what customers will get with this offer..."
                        value={
                            description
                        }
                        onChangeText={
                            setDescription
                        }
                        multiline
                        maxLength={300}
                    />

                    {/* =================================================
                        DISCOUNT
                    ================================================== */}

                    <SectionTitle
                        title="Discount"
                        subtitle="Choose the type and amount"
                    />

                    <Text
                        style={
                            styles.fieldLabel
                        }
                    >
                        Discount Type
                        <Text
                            style={
                                styles.required
                            }
                        >
                            {' '}
                            *
                        </Text>
                    </Text>

                    <View
                        style={
                            styles.discountTypeContainer
                        }
                    >
                        <DiscountTypeButton
                            title="Percentage"
                            subtitle="% OFF"
                            icon="percent"
                            selected={
                                discountType ===
                                'PERCENTAGE'
                            }
                            onPress={() =>
                                setDiscountType(
                                    'PERCENTAGE',
                                )
                            }
                        />

                        <DiscountTypeButton
                            title="Fixed Amount"
                            subtitle="₹ OFF"
                            icon="cash-outline"
                            selected={
                                discountType ===
                                'FIXED'
                            }
                            onPress={() =>
                                setDiscountType(
                                    'FIXED',
                                )
                            }
                        />
                    </View>

                    <InputField
                        label={
                            discountType ===
                                'PERCENTAGE'
                                ? 'Discount Percentage'
                                : 'Discount Amount'
                        }
                        required
                        placeholder={
                            discountType ===
                                'PERCENTAGE'
                                ? 'e.g. 20'
                                : 'e.g. 200'
                        }
                        value={
                            discountValue
                        }
                        onChangeText={text =>
                            setDiscountValue(
                                text.replace(
                                    /[^0-9.]/g,
                                    '',
                                ),
                            )
                        }
                        keyboardType="numeric"
                        prefix={
                            discountType ===
                                'FIXED'
                                ? '₹'
                                : undefined
                        }
                        suffix={
                            discountType ===
                                'PERCENTAGE'
                                ? '%'
                                : undefined
                        }
                    />

                    <View
                        style={
                            styles.discountPreview
                        }
                    >
                        <Text
                            style={
                                styles.previewLabel
                            }
                        >
                            Customer sees
                        </Text>

                        <Text
                            style={
                                styles.previewDiscount
                            }
                        >
                            {
                                discountPreview
                            }
                        </Text>

                        <Text
                            style={
                                styles.previewTitle
                            }
                        >
                            {title ||
                                'Your offer title'}
                        </Text>
                    </View>

                    {/* =================================================
                        APPLY OFFER TO
                    ================================================== */}

                    <SectionTitle
                        title="Apply Offer To"
                        subtitle="Choose which services receive the discount"
                    />

                    <View
                        style={
                            styles.serviceModeContainer
                        }
                    >
                        <ServiceModeButton
                            title="Any Services"
                            description="Apply the discount to the combined amount of all eligible services in the customer's booking."
                            icon="layers-outline"
                            selected={
                                serviceOfferMode ===
                                'ANY'
                            }
                            onPress={
                                selectAnyServices
                            }
                        />

                        <ServiceModeButton
                            title="Particular Services"
                            description="Apply the discount only to the services you select. Other booked services remain at their regular price."
                            icon="list-outline"
                            selected={
                                serviceOfferMode ===
                                'SPECIFIC'
                            }
                            onPress={
                                selectSpecificServices
                            }
                        />
                    </View>

                    {/* =================================================
                        ANY SERVICES
                    ================================================== */}

                    {serviceOfferMode ===
                        'ANY' ? (
                        <View
                            style={
                                styles.anyServiceNotice
                            }
                        >
                            <View
                                style={
                                    styles.anyServiceIcon
                                }
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={
                                        PRIMARY
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.anyServiceContent
                                }
                            >
                                <Text
                                    style={
                                        styles.anyServiceTitle
                                    }
                                >
                                    Discount applies to
                                    all eligible services
                                </Text>

                                <Text
                                    style={
                                        styles.anyServiceText
                                    }
                                >
                                    Customers can book
                                    one or multiple
                                    eligible services.
                                    The service amounts
                                    are combined and
                                    your{' '}
                                    {
                                        discountPreview
                                    }{' '}
                                    discount is applied
                                    to that combined
                                    amount.
                                </Text>

                                <View
                                    style={
                                        styles.calculationBox
                                    }
                                >
                                    <Text
                                        style={
                                            styles.calculationText
                                        }
                                    >
                                        Example: ₹500 +
                                        ₹300 + ₹700 = ₹1,500
                                    </Text>

                                    <Text
                                        style={
                                            styles.calculationText
                                        }
                                    >
                                        50% OFF → ₹750
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View
                            style={
                                styles.specificServiceSection
                            }
                        >
                            <View
                                style={
                                    styles.serviceSelectionHeader
                                }
                            >
                                <View
                                    style={
                                        styles.serviceSelectionHeaderContent
                                    }
                                >
                                    <Text
                                        style={
                                            styles.serviceSelectionTitle
                                        }
                                    >
                                        Select Services
                                        <Text
                                            style={
                                                styles.required
                                            }
                                        >
                                            {' '}
                                            *
                                        </Text>
                                    </Text>

                                    <Text
                                        style={
                                            styles.serviceSelectionSubtitle
                                        }
                                    >
                                        Select one or
                                        more services
                                        that should receive
                                        the discount.
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.selectedCountBadge
                                    }
                                >
                                    <Text
                                        style={
                                            styles.selectedCountText
                                        }
                                    >
                                        {
                                            selectedServiceIds.length
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={
                                    styles.specificInfoNotice
                                }
                            >
                                <Ionicons
                                    name="information-circle-outline"
                                    size={19}
                                    color={
                                        PRIMARY
                                    }
                                />

                                <Text
                                    style={
                                        styles.specificInfoText
                                    }
                                >
                                    Only the selected
                                    services will receive
                                    the discount. Any other
                                    services in the booking
                                    will remain at their
                                    normal price and will be
                                    added to the discounted
                                    services.
                                </Text>
                            </View>

                            {servicesLoading ? (
                                <View
                                    style={
                                        styles.servicesLoadingContainer
                                    }
                                >
                                    <ActivityIndicator
                                        size="small"
                                        color={
                                            PRIMARY
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.servicesLoadingText
                                        }
                                    >
                                        Loading your
                                        services...
                                    </Text>
                                </View>
                            ) : servicesError ? (
                                <View
                                    style={
                                        styles.servicesErrorContainer
                                    }
                                >
                                    <Ionicons
                                        name="cloud-offline-outline"
                                        size={25}
                                        color="#DC2626"
                                    />

                                    <Text
                                        style={
                                            styles.servicesErrorText
                                        }
                                    >
                                        Unable to load
                                        your services.
                                    </Text>

                                    <TouchableOpacity
                                        style={
                                            styles.retryServicesButton
                                        }
                                        onPress={() =>
                                            refetchServices()
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.retryServicesButtonText
                                            }
                                        >
                                            Retry
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : salonServices.length ===
                                0 ? (
                                <View
                                    style={
                                        styles.noServicesContainer
                                    }
                                >
                                    <Ionicons
                                        name="cut-outline"
                                        size={30}
                                        color={
                                            PRIMARY
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.noServicesTitle
                                        }
                                    >
                                        No services found
                                    </Text>

                                    <Text
                                        style={
                                            styles.noServicesText
                                        }
                                    >
                                        Add services to
                                        your salon before
                                        creating a
                                        particular-service
                                        offer.
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    style={
                                        styles.servicesList
                                    }
                                >
                                    {salonServices.map(
                                        service => {
                                            const selected =
                                                selectedServiceIds.includes(
                                                    service.serviceId,
                                                );

                                            const inactive =
                                                service.active ===
                                                false;

                                            return (
                                                <TouchableOpacity
                                                    key={
                                                        service.serviceId
                                                    }
                                                    style={[
                                                        styles.serviceCard,
                                                        selected &&
                                                        styles.serviceCardSelected,
                                                        inactive &&
                                                        styles.serviceCardInactive,
                                                    ]}
                                                    onPress={() =>
                                                        toggleService(
                                                            service.serviceId,
                                                        )
                                                    }
                                                    activeOpacity={
                                                        0.8
                                                    }
                                                >
                                                    <View
                                                        style={[
                                                            styles.serviceCheckbox,
                                                            selected &&
                                                            styles.serviceCheckboxSelected,
                                                        ]}
                                                    >
                                                        {selected ? (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={
                                                                    17
                                                                }
                                                                color="#FFFFFF"
                                                            />
                                                        ) : null}
                                                    </View>

                                                    <View
                                                        style={
                                                            styles.serviceInfo
                                                        }
                                                    >
                                                        <View
                                                            style={
                                                                styles.serviceNameRow
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.serviceName
                                                                }
                                                                numberOfLines={
                                                                    1
                                                                }
                                                            >
                                                                {
                                                                    service.name
                                                                }
                                                            </Text>

                                                            {service.category ? (
                                                                <View
                                                                    style={
                                                                        styles.serviceCategoryBadge
                                                                    }
                                                                >
                                                                    <Text
                                                                        style={
                                                                            styles.serviceCategoryBadgeText
                                                                        }
                                                                        numberOfLines={
                                                                            1
                                                                        }
                                                                    >
                                                                        {
                                                                            service.category
                                                                        }
                                                                    </Text>
                                                                </View>
                                                            ) : null}

                                                            {inactive ? (
                                                                <View
                                                                    style={
                                                                        styles.inactiveBadge
                                                                    }
                                                                >
                                                                    <Text
                                                                        style={
                                                                            styles.inactiveBadgeText
                                                                    }
                                                                    >
                                                                        Inactive
                                                                    </Text>
                                                                </View>
                                                            ) : null}
                                                        </View>

                                                        <Text
                                                            style={
                                                                styles.serviceMeta
                                                            }
                                                            numberOfLines={
                                                                1
                                                            }
                                                        >
                                                            {
                                                                service.duration
                                                            }{' '}
                                                            min
                                                        </Text>
                                                    </View>

                                                    <Text
                                                        style={
                                                            styles.servicePrice
                                                        }
                                                    >
                                                        ₹
                                                        {Number(
                                                            service.price,
                                                        ).toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        },
                                    )}
                                </View>
                            )}

                            {selectedServiceIds.length >
                                0 ? (
                                <View
                                    style={
                                        styles.selectionSummary
                                    }
                                >
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={18}
                                        color={
                                            PRIMARY
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.selectionSummaryText
                                        }
                                    >
                                        {
                                            selectedServiceIds.length
                                        }{' '}
                                        service
                                        {selectedServiceIds.length !==
                                            1
                                            ? 's'
                                            : ''}{' '}
                                        selected for this
                                        offer. Only these
                                        services will receive
                                        the discount.
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    style={
                                        styles.categoryEmptyNotice
                                    }
                                >
                                    <Ionicons
                                        name="pricetags-outline"
                                        size={18}
                                        color="#6B7280"
                                    />

                                    <Text
                                        style={
                                            styles.categoryEmptyText
                                        }
                                    >
                                        Select the services that
                                        should receive this offer.
                                        Each service shows its
                                        category automatically.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* =================================================
                        COUPON
                    ================================================== */}

                    <SectionTitle
                        title="Coupon"
                        subtitle="Optional coupon code"
                    />

                    <InputField
                        label="Coupon Code"
                        placeholder="e.g. WEEKEND20"
                        value={
                            couponCode
                        }
                        onChangeText={text =>
                            setCouponCode(
                                text
                                    .toUpperCase()
                                    .replace(
                                        /[^A-Z0-9]/g,
                                        '',
                                    ),
                            )
                        }
                        autoCapitalize="characters"
                        maxLength={20}
                    />

                    {/* =================================================
                        BOOKING CONDITIONS
                    ================================================== */}

                    <SectionTitle
                        title="Booking Conditions"
                        subtitle="Set optional restrictions"
                    />

                    <SettingRow
                        title="No minimum booking amount"
                        description="Customers can use this offer on any eligible booking"
                        value={
                            noMinimumBooking
                        }
                        onValueChange={value => {
                            setNoMinimumBooking(
                                value,
                            );

                            if (
                                value
                            ) {
                                setMinimumBookingAmount(
                                    '',
                                );
                            }
                        }}
                    />

                    {!noMinimumBooking && (
                        <InputField
                            label="Minimum Booking Amount"
                            required
                            placeholder="e.g. 999"
                            value={
                                minimumBookingAmount
                            }
                            onChangeText={text =>
                                setMinimumBookingAmount(
                                    text.replace(
                                        /[^0-9]/g,
                                        '',
                                    ),
                                )
                            }
                            keyboardType="numeric"
                            prefix="₹"
                        />
                    )}

                    <SettingRow
                        title="Unlimited redemptions"
                        description="Allow unlimited customers to redeem this offer"
                        value={
                            unlimitedUsage
                        }
                        onValueChange={value => {
                            setUnlimitedUsage(
                                value,
                            );

                            if (
                                value
                            ) {
                                setUsageLimit(
                                    '',
                                );
                            }
                        }}
                    />

                    {!unlimitedUsage && (
                        <InputField
                            label="Total Usage Limit"
                            required
                            placeholder="e.g. 100"
                            value={
                                usageLimit
                            }
                            onChangeText={text =>
                                setUsageLimit(
                                    text.replace(
                                        /[^0-9]/g,
                                        '',
                                    ),
                                )
                            }
                            keyboardType="numeric"
                        />
                    )}

                    <SettingRow
                        title="Unlimited per-customer usage"
                        description="A customer can redeem this offer multiple times"
                        value={
                            unlimitedCustomerUsage
                        }
                        onValueChange={value => {
                            setUnlimitedCustomerUsage(
                                value,
                            );

                            if (
                                value
                            ) {
                                setCustomerLimit(
                                    '',
                                );
                            }
                        }}
                    />

                    {!unlimitedCustomerUsage && (
                        <InputField
                            label="Customer Usage Limit"
                            required
                            placeholder="e.g. 1"
                            value={
                                customerLimit
                            }
                            onChangeText={text =>
                                setCustomerLimit(
                                    text.replace(
                                        /[^0-9]/g,
                                        '',
                                    ),
                                )
                            }
                            keyboardType="numeric"
                        />
                    )}

                    {/* =================================================
                        OFFER PERIOD
                    ================================================== */}

                    <SectionTitle
                        title="Offer Period"
                        subtitle="When should customers be able to use this offer?"
                    />

                    {/* =================================================
                        START DATE
                    ================================================== */}

                    <View
                        style={
                            styles.inputContainer
                        }
                    >
                        <Text
                            style={
                                styles.fieldLabel
                            }
                        >
                            Start Date
                            <Text
                                style={
                                    styles.required
                                }
                            >
                                {' '}
                                *
                            </Text>
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.datePickerButton,
                                startDate &&
                                styles.datePickerButtonSelected,
                            ]}
                            onPress={
                                openStartDatePicker
                            }
                            activeOpacity={
                                0.8
                            }
                        >
                            <View
                                style={
                                    styles.datePickerIcon
                                }
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={
                                        PRIMARY
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.datePickerContent
                                }
                            >
                                <Text
                                    style={[
                                        styles.datePickerText,
                                        !startDate &&
                                        styles.datePickerPlaceholder,
                                    ]}
                                >
                                    {startDate
                                        ? formatDateForDisplay(
                                            startDate,
                                        )
                                        : 'Select start date'}
                                </Text>

                                {startDate ? (
                                    <Text
                                        style={
                                            styles.datePickerSubtext
                                        }
                                    >
                                        {startDate}
                                    </Text>
                                ) : null}
                            </View>

                            <Ionicons
                                name="chevron-down"
                                size={18}
                                color="#6B7280"
                            />
                        </TouchableOpacity>
                    </View>

                    {showStartDatePicker ? (
                        <View
                            style={
                                styles.calendarContainer
                            }
                        >
                            <View
                                style={
                                    styles.calendarHeader
                                }
                            >
                                <View
                                    style={
                                        styles.calendarHeaderIcon
                                    }
                                >
                                    <Ionicons
                                        name="calendar"
                                        size={18}
                                        color={
                                            PRIMARY
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.calendarHeaderContent
                                    }
                                >
                                    <Text
                                        style={
                                            styles.calendarHeaderTitle
                                        }
                                    >
                                        Select Start Date
                                    </Text>

                                    <Text
                                        style={
                                            styles.calendarHeaderSubtitle
                                        }
                                    >
                                        Choose when the offer starts
                                    </Text>
                                </View>
                            </View>

                            <Calendar
                                current={
                                    startDate ||
                                    formatDateForBackend(
                                        new Date(),
                                    )
                                }
                                minDate={
                                    formatDateForBackend(
                                        new Date(),
                                    )
                                }
                                onDayPress={
                                    handleStartDateChange
                                }
                                markedDates={
                                    startDate
                                        ? {
                                            [startDate]: {
                                                selected: true,
                                                selectedColor:
                                                    PRIMARY,
                                            },
                                        }
                                        : {}
                                }
                                theme={{
                                    todayTextColor:
                                        PRIMARY,
                                    arrowColor:
                                        PRIMARY,
                                    selectedDayBackgroundColor:
                                        PRIMARY,
                                    selectedDayTextColor:
                                        '#FFFFFF',
                                    textDayFontSize: 13,
                                    textMonthFontSize: 14,
                                    textDayHeaderFontSize: 11,
                                    textMonthFontWeight:
                                        '700',
                                }}
                            />
                        </View>
                    ) : null}

                    {/* =================================================
                        END DATE
                    ================================================== */}

                    <View
                        style={
                            styles.inputContainer
                        }
                    >
                        <Text
                            style={
                                styles.fieldLabel
                            }
                        >
                            End Date
                            <Text
                                style={
                                    styles.required
                                }
                            >
                                {' '}
                                *
                            </Text>
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.datePickerButton,
                                endDate &&
                                styles.datePickerButtonSelected,
                            ]}
                            onPress={
                                openEndDatePicker
                            }
                            activeOpacity={
                                0.8
                            }
                        >
                            <View
                                style={
                                    styles.datePickerIcon
                                }
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={
                                        PRIMARY
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.datePickerContent
                                }
                            >
                                <Text
                                    style={[
                                        styles.datePickerText,
                                        !endDate &&
                                        styles.datePickerPlaceholder,
                                    ]}
                                >
                                    {endDate
                                        ? formatDateForDisplay(
                                            endDate,
                                        )
                                        : 'Select end date'}
                                </Text>

                                {endDate ? (
                                    <Text
                                        style={
                                            styles.datePickerSubtext
                                        }
                                    >
                                        {endDate}
                                    </Text>
                                ) : null}
                            </View>

                            <Ionicons
                                name="chevron-down"
                                size={18}
                                color="#6B7280"
                            />
                        </TouchableOpacity>
                    </View>

                    {showEndDatePicker ? (
                        <View
                            style={
                                styles.calendarContainer
                            }
                        >
                            <View
                                style={
                                    styles.calendarHeader
                                }
                            >
                                <View
                                    style={
                                        styles.calendarHeaderIcon
                                    }
                                >
                                    <Ionicons
                                        name="calendar"
                                        size={18}
                                        color={
                                            PRIMARY
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.calendarHeaderContent
                                    }
                                >
                                    <Text
                                        style={
                                            styles.calendarHeaderTitle
                                        }
                                    >
                                        Select End Date
                                    </Text>

                                    <Text
                                        style={
                                            styles.calendarHeaderSubtitle
                                        }
                                    >
                                        {startDate
                                            ? `Must be on or after ${formatDateForDisplay(
                                                startDate,
                                            )}`
                                            : 'Choose when the offer ends'}
                                    </Text>
                                </View>
                            </View>

                            <Calendar
                                current={
                                    endDate ||
                                    startDate ||
                                    formatDateForBackend(
                                        new Date(),
                                    )
                                }
                                minDate={
                                    startDate ||
                                    formatDateForBackend(
                                        new Date(),
                                    )
                                }
                                onDayPress={
                                    handleEndDateChange
                                }
                                markedDates={
                                    endDate
                                        ? {
                                            [endDate]: {
                                                selected: true,
                                                selectedColor:
                                                    PRIMARY,
                                            },
                                        }
                                        : {}
                                }
                                theme={{
                                    todayTextColor:
                                        PRIMARY,
                                    arrowColor:
                                        PRIMARY,
                                    selectedDayBackgroundColor:
                                        PRIMARY,
                                    selectedDayTextColor:
                                        '#FFFFFF',
                                    textDayFontSize: 13,
                                    textMonthFontSize: 14,
                                    textDayHeaderFontSize: 11,
                                    textMonthFontWeight:
                                        '700',
                                }}
                            />
                        </View>
                    ) : null}

                    <View
                        style={
                            styles.dateHint
                        }
                    >
                        <Ionicons
                            name="information-circle-outline"
                            size={16}
                            color="#6B7280"
                        />

                        <Text
                            style={
                                styles.dateHintText
                            }
                        >
                            Select the dates from the
                            calendar. End date must be
                            on or after the start date.
                        </Text>
                    </View>

                    {/* =================================================
                        FINAL NOTICE
                    ================================================== */}

                    <View
                        style={
                            styles.finalNotice
                        }
                    >
                        <Ionicons
                            name="information-circle"
                            size={20}
                            color={
                                PRIMARY
                            }
                        />

                        <Text
                            style={
                                styles.finalNoticeText
                            }
                        >
                            {isEditMode
                                ? 'After submitting changes, the offer may return to Pending Approval so Clavata can review the updated details.'
                                : 'After submitting, your offer will have '}

                            {!isEditMode ? (
                                <>
                                    <Text
                                        style={
                                            styles.boldText
                                        }
                                    >
                                        Pending
                                        Approval
                                    </Text>{' '}
                                    status.
                                    Customers
                                    will not
                                    see it
                                    until
                                    Clavata
                                    approves
                                    it.
                                </>
                            ) : null}
                        </Text>
                    </View>

                    <View
                        style={{
                            height: 110,
                        }}
                    />
                </ScrollView>

                {/* =====================================================
                    BOTTOM ACTION
                ====================================================== */}

                <View
                    style={
                        styles.bottomAction
                    }
                >
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            isSubmitting &&
                            styles.submitButtonDisabled,
                        ]}
                        disabled={
                            isSubmitting
                        }
                        onPress={
                            handleSubmit
                        }
                        activeOpacity={
                            0.85
                        }
                    >
                        {isSubmitting ? (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : (
                            <Ionicons
                                name={
                                    isEditMode
                                        ? 'save-outline'
                                        : 'paper-plane-outline'
                                }
                                size={20}
                                color="#FFFFFF"
                            />
                        )}

                        <Text
                            style={
                                styles.submitButtonText
                            }
                        >
                            {isSubmitting
                                ? isEditMode
                                    ? 'Saving...'
                                    : 'Submitting...'
                                : isEditMode
                                    ? 'Save Changes'
                                    : 'Submit for Approval'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/**
 * ============================================================
 * SECTION TITLE
 * ============================================================
 */

function SectionTitle({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    return (
        <View
            style={
                styles.sectionHeader
            }
        >
            <Text
                style={
                    styles.sectionTitle
                }
            >
                {title}
            </Text>

            <Text
                style={
                    styles.sectionSubtitle
                }
            >
                {subtitle}
            </Text>
        </View>
    );
}

/**
 * ============================================================
 * INPUT FIELD
 * ============================================================
 */

function InputField({
    label,
    required,
    placeholder,
    value,
    onChangeText,
    multiline,
    maxLength,
    keyboardType,
    prefix,
    suffix,
    autoCapitalize,
}: {
    label: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChangeText: (
        text: string,
    ) => void;
    multiline?: boolean;
    maxLength?: number;
    keyboardType?: any;
    prefix?: string;
    suffix?: string;
    autoCapitalize?: any;
}) {
    return (
        <View
            style={
                styles.inputContainer
            }
        >
            <Text
                style={
                    styles.fieldLabel
                }
            >
                {label}

                {required && (
                    <Text
                        style={
                            styles.required
                        }
                    >
                        {' '}
                        *
                    </Text>
                )}
            </Text>

            <View
                style={[
                    styles.inputWrapper,
                    multiline &&
                    styles.multilineWrapper,
                ]}
            >
                {prefix ? (
                    <Text
                        style={
                            styles.inputPrefix
                        }
                    >
                        {prefix}
                    </Text>
                ) : null}

                <TextInput
                    style={[
                        styles.input,
                        multiline &&
                        styles.multilineInput,
                    ]}
                    placeholder={
                        placeholder
                    }
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={
                        onChangeText
                    }
                    multiline={
                        multiline
                    }
                    maxLength={
                        maxLength
                    }
                    keyboardType={
                        keyboardType
                    }
                    autoCapitalize={
                        autoCapitalize
                    }
                    textAlignVertical={
                        multiline
                            ? 'top'
                            : 'center'
                    }
                />

                {suffix ? (
                    <Text
                        style={
                            styles.inputSuffix
                        }
                    >
                        {suffix}
                    </Text>
                ) : null}
            </View>

            {maxLength &&
                value.length > 0 ? (
                <Text
                    style={
                        styles.characterCount
                    }
                >
                    {value.length}/
                    {maxLength}
                </Text>
            ) : null}
        </View>
    );
}

/**
 * ============================================================
 * DISCOUNT TYPE BUTTON
 * ============================================================
 */

function DiscountTypeButton({
    title,
    subtitle,
    icon,
    selected,
    onPress,
}: {
    title: string;
    subtitle: string;
    icon: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[
                styles.discountTypeButton,
                selected &&
                styles.discountTypeButtonActive,
            ]}
            onPress={onPress}
            activeOpacity={
                0.8
            }
        >
            <View
                style={[
                    styles.discountIcon,
                    selected &&
                    styles.discountIconActive,
                ]}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={
                        selected
                            ? '#FFFFFF'
                            : PRIMARY
                    }
                />
            </View>

            <View
                style={
                    styles.discountTypeText
                }
            >
                <Text
                    style={[
                        styles.discountTypeTitle,
                        selected &&
                        styles.discountTypeTitleActive,
                    ]}
                >
                    {title}
                </Text>

                <Text
                    style={[
                        styles.discountTypeSubtitle,
                        selected &&
                        styles.discountTypeSubtitleActive,
                    ]}
                >
                    {subtitle}
                </Text>
            </View>

            {selected ? (
                <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color={
                        PRIMARY
                    }
                />
            ) : null}
        </TouchableOpacity>
    );
}

/**
 * ============================================================
 * SERVICE MODE BUTTON
 * ============================================================
 */

function ServiceModeButton({
    title,
    description,
    icon,
    selected,
    onPress,
}: {
    title: string;
    description: string;
    icon: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[
                styles.serviceModeButton,
                selected &&
                styles.serviceModeButtonSelected,
            ]}
            onPress={onPress}
            activeOpacity={
                0.8
            }
        >
            <View
                style={[
                    styles.serviceModeIcon,
                    selected &&
                    styles.serviceModeIconSelected,
                ]}
            >
                <Ionicons
                    name={icon}
                    size={21}
                    color={
                        selected
                            ? '#FFFFFF'
                            : PRIMARY
                    }
                />
            </View>

            <View
                style={
                    styles.serviceModeContent
                }
            >
                <Text
                    style={[
                        styles.serviceModeTitle,
                        selected &&
                        styles.serviceModeTitleSelected,
                    ]}
                >
                    {title}
                </Text>

                <Text
                    style={
                        styles.serviceModeDescription
                    }
                >
                    {description}
                </Text>
            </View>

            <View
                style={[
                    styles.radioOuter,
                    selected &&
                    styles.radioOuterSelected,
                ]}
            >
                {selected ? (
                    <View
                        style={
                            styles.radioInner
                        }
                    />
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

/**
 * ============================================================
 * SETTING ROW
 * ============================================================
 */

function SettingRow({
    title,
    description,
    value,
    onValueChange,
}: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (
        value: boolean,
    ) => void;
}) {
    return (
        <View
            style={
                styles.settingRow
            }
        >
            <View
                style={
                    styles.settingContent
                }
            >
                <Text
                    style={
                        styles.settingTitle
                    }
                >
                    {title}
                </Text>

                <Text
                    style={
                        styles.settingDescription
                    }
                >
                    {description}
                </Text>
            </View>

            <Switch
                value={value}
                onValueChange={
                    onValueChange
                }
                trackColor={{
                    false: '#D1D5DB',
                    true: '#80D4CF',
                }}
                thumbColor={
                    value
                        ? PRIMARY
                        : '#F9FAFB'
                }
            />
        </View>
    );
}

/**
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            '#F8FAFC',
    },

    keyboardContainer: {
        flex: 1,
    },

    categoryEmptyNotice: {
        marginTop: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
    },

    categoryEmptyText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        lineHeight: 17,
        color: '#6B7280',
    },

    header: {
        height: 72,
        backgroundColor:
            '#FFFFFF',
        flexDirection:
            'row',
        alignItems:
            'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor:
            '#E5E7EB',
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor:
            '#F3F4F6',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    headerTitleContainer: {
        marginLeft: 12,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight:
            '700',
        color:
            '#111827',
    },

    headerSubtitle: {
        marginTop: 2,
        fontSize: 12,
        color:
            '#6B7280',
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 40,
    },

    approvalNotice: {
        flexDirection:
            'row',
        backgroundColor:
            '#ECFDFB',
        borderRadius: 15,
        padding: 14,
        borderWidth: 1,
        borderColor:
            '#C6EEEA',
        marginBottom: 8,
    },

    approvalIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor:
            '#D8F5F2',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    approvalContent: {
        flex: 1,
        marginLeft: 11,
    },

    approvalTitle: {
        fontSize: 14,
        fontWeight:
            '700',
        color:
            '#115E59',
    },

    approvalText: {
        marginTop: 3,
        fontSize: 12,
        lineHeight: 18,
        color:
            '#4B5563',
    },

    sectionHeader: {
        marginTop: 24,
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight:
            '700',
        color:
            '#111827',
    },

    sectionSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color:
            '#6B7280',
    },

    inputContainer: {
        marginBottom: 17,
    },

    fieldLabel: {
        fontSize: 13,
        fontWeight:
            '600',
        color:
            '#374151',
        marginBottom: 7,
    },

    required: {
        color:
            '#DC2626',
    },

    inputWrapper: {
        minHeight: 50,
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 12,
        flexDirection:
            'row',
        alignItems:
            'center',
        paddingHorizontal: 13,
    },

    multilineWrapper: {
        minHeight: 110,
        alignItems:
            'flex-start',
    },

    input: {
        flex: 1,
        minHeight: 48,
        fontSize: 14,
        color:
            '#111827',
        paddingVertical: 0,
    },

    multilineInput: {
        minHeight: 100,
        paddingTop: 13,
        paddingBottom: 13,
    },

    inputPrefix: {
        fontSize: 15,
        fontWeight:
            '600',
        color:
            '#374151',
        marginRight: 6,
    },

    inputSuffix: {
        fontSize: 14,
        fontWeight:
            '600',
        color:
            '#6B7280',
        marginLeft: 6,
    },

    characterCount: {
        alignSelf:
            'flex-end',
        marginTop: 4,
        fontSize: 10,
        color:
            '#9CA3AF',
    },

    discountTypeContainer: {
        flexDirection:
            'row',
        gap: 10,
        marginBottom: 18,
    },

    discountTypeButton: {
        flex: 1,
        minHeight: 74,
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 13,
        paddingHorizontal: 11,
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    discountTypeButtonActive: {
        borderColor:
            PRIMARY,
        backgroundColor:
            '#F0FDFA',
    },

    discountIcon: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor:
            '#E6F7F5',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    discountIconActive: {
        backgroundColor:
            PRIMARY,
    },

    discountTypeText: {
        flex: 1,
        marginLeft: 9,
    },

    discountTypeTitle: {
        fontSize: 12,
        fontWeight:
            '700',
        color:
            '#374151',
    },

    discountTypeTitleActive: {
        color:
            '#115E59',
    },

    discountTypeSubtitle: {
        marginTop: 2,
        fontSize: 10,
        color:
            '#9CA3AF',
    },

    discountTypeSubtitleActive: {
        color:
            '#0F766E',
    },

    discountPreview: {
        backgroundColor:
            '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        padding: 18,
        alignItems:
            'center',
        marginBottom: 5,
    },

    previewLabel: {
        fontSize: 11,
        color:
            '#9CA3AF',
        textTransform:
            'uppercase',
        letterSpacing: 0.6,
    },

    previewDiscount: {
        marginTop: 6,
        fontSize: 27,
        fontWeight:
            '800',
        color:
            PRIMARY,
    },

    previewTitle: {
        marginTop: 4,
        fontSize: 14,
        fontWeight:
            '600',
        color:
            '#374151',
        textAlign:
            'center',
    },

    serviceModeContainer: {
        gap: 10,
    },

    serviceModeButton: {
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 15,
        padding: 14,
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    serviceModeButtonSelected: {
        backgroundColor:
            '#F0FDFA',
        borderColor:
            PRIMARY,
    },

    serviceModeIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor:
            '#E6F7F5',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    serviceModeIconSelected: {
        backgroundColor:
            PRIMARY,
    },

    serviceModeContent: {
        flex: 1,
        marginLeft: 11,
        paddingRight: 8,
    },

    serviceModeTitle: {
        fontSize: 14,
        fontWeight:
            '700',
        color:
            '#374151',
    },

    serviceModeTitleSelected: {
        color:
            '#115E59',
    },

    serviceModeDescription: {
        marginTop: 4,
        fontSize: 11,
        lineHeight: 17,
        color:
            '#6B7280',
    },

    radioOuter: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 2,
        borderColor:
            '#D1D5DB',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    radioOuterSelected: {
        borderColor:
            PRIMARY,
    },

    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor:
            PRIMARY,
    },

    anyServiceNotice: {
        marginTop: 12,
        backgroundColor:
            '#ECFDFB',
        borderWidth: 1,
        borderColor:
            '#C6EEEA',
        borderRadius: 13,
        padding: 12,
        flexDirection:
            'row',
        alignItems:
            'flex-start',
    },

    anyServiceIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor:
            '#D8F5F2',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    anyServiceContent: {
        flex: 1,
        marginLeft: 9,
    },

    anyServiceTitle: {
        fontSize: 13,
        fontWeight:
            '700',
        color:
            '#115E59',
    },

    anyServiceText: {
        marginTop: 3,
        fontSize: 11,
        lineHeight: 17,
        color:
            '#4B5563',
    },

    calculationBox: {
        marginTop: 9,
        backgroundColor:
            '#FFFFFF',
        borderRadius: 9,
        padding: 9,
        borderWidth: 1,
        borderColor:
            '#D8F5F2',
    },

    calculationText: {
        fontSize: 10,
        lineHeight: 16,
        color:
            '#115E59',
        fontWeight:
            '600',
    },

    specificServiceSection: {
        marginTop: 12,
    },

    serviceSelectionHeader: {
        flexDirection:
            'row',
        alignItems:
            'center',
        justifyContent:
            'space-between',
        marginBottom: 10,
    },

    serviceSelectionHeaderContent: {
        flex: 1,
        paddingRight: 10,
    },

    serviceSelectionTitle: {
        fontSize: 14,
        fontWeight:
            '700',
        color:
            '#374151',
    },

    serviceSelectionSubtitle: {
        marginTop: 3,
        fontSize: 11,
        color:
            '#6B7280',
    },

    specificInfoNotice: {
        backgroundColor:
            '#F0FDFA',
        borderWidth: 1,
        borderColor:
            '#C6EEEA',
        borderRadius: 11,
        padding: 10,
        flexDirection:
            'row',
        alignItems:
            'flex-start',
        marginBottom: 10,
    },

    specificInfoText: {
        flex: 1,
        marginLeft: 7,
        fontSize: 10,
        lineHeight: 16,
        color:
            '#115E59',
    },

    selectedCountBadge: {
        minWidth: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor:
            '#E6F7F5',
        alignItems:
            'center',
        justifyContent:
            'center',
        paddingHorizontal: 8,
    },

    selectedCountText: {
        fontSize: 12,
        fontWeight:
            '800',
        color:
            PRIMARY,
    },

    servicesList: {
        gap: 8,
    },

    serviceCard: {
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 13,
        padding: 12,
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    serviceCardSelected: {
        borderColor:
            PRIMARY,
        backgroundColor:
            '#F0FDFA',
    },

    serviceCardInactive: {
        opacity: 0.65,
    },

    serviceCheckbox: {
        width: 23,
        height: 23,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor:
            '#D1D5DB',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    serviceCheckboxSelected: {
        backgroundColor:
            PRIMARY,
        borderColor:
            PRIMARY,
    },

    serviceInfo: {
        flex: 1,
        marginLeft: 10,
        marginRight: 8,
    },

    serviceNameRow: {
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    serviceName: {
        flexShrink: 1,
        fontSize: 13,
        fontWeight:
            '700',
        color:
            '#111827',
    },

    serviceCategoryBadge: {
        maxWidth: 120,
        marginLeft: 7,
        backgroundColor:
            '#E6F7F5',
        borderWidth: 1,
        borderColor:
            '#C6EEEA',
        borderRadius: 7,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },

    serviceCategoryBadgeText: {
        fontSize: 9,
        fontWeight:
            '700',
        color:
            '#0F766E',
    },

    serviceMeta: {
        marginTop: 3,
        fontSize: 10,
        color:
            '#6B7280',
    },

    servicePrice: {
        fontSize: 13,
        fontWeight:
            '700',
        color:
            '#111827',
    },

    inactiveBadge: {
        marginLeft: 6,
        backgroundColor:
            '#F3F4F6',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },

    inactiveBadgeText: {
        fontSize: 8,
        fontWeight:
            '700',
        color:
            '#6B7280',
    },

    selectionSummary: {
        marginTop: 10,
        backgroundColor:
            '#F0FDFA',
        borderRadius: 10,
        padding: 10,
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    selectionSummaryText: {
        flex: 1,
        marginLeft: 7,
        fontSize: 11,
        color:
            '#115E59',
        fontWeight:
            '600',
    },

    servicesLoadingContainer: {
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 13,
        paddingVertical: 22,
        alignItems:
            'center',
        justifyContent:
            'center',
        flexDirection:
            'row',
    },

    servicesLoadingText: {
        marginLeft: 9,
        fontSize: 12,
        color:
            '#6B7280',
    },

    servicesErrorContainer: {
        backgroundColor:
            '#FEF2F2',
        borderWidth: 1,
        borderColor:
            '#FECACA',
        borderRadius: 13,
        padding: 14,
        alignItems:
            'center',
    },

    servicesErrorText: {
        marginTop: 7,
        fontSize: 12,
        color:
            '#991B1B',
        textAlign:
            'center',
    },

    retryServicesButton: {
        marginTop: 10,
        backgroundColor:
            PRIMARY,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 9,
    },

    retryServicesButtonText: {
        color:
            '#FFFFFF',
        fontSize: 11,
        fontWeight:
            '700',
    },

    noServicesContainer: {
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 13,
        padding: 20,
        alignItems:
            'center',
    },

    noServicesTitle: {
        marginTop: 8,
        fontSize: 14,
        fontWeight:
            '700',
        color:
            '#374151',
    },

    noServicesText: {
        marginTop: 5,
        fontSize: 11,
        lineHeight: 17,
        textAlign:
            'center',
        color:
            '#6B7280',
    },

    settingRow: {
        backgroundColor:
            '#FFFFFF',
        borderRadius: 13,
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 13,
        marginBottom: 12,
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    settingContent: {
        flex: 1,
        paddingRight: 10,
    },

    settingTitle: {
        fontSize: 13,
        fontWeight:
            '600',
        color:
            '#374151',
    },

    settingDescription: {
        marginTop: 3,
        fontSize: 11,
        lineHeight: 16,
        color:
            '#9CA3AF',
    },

    /**
     * ========================================================
     * DATE PICKER
     * ========================================================
     */

    datePickerButton: {
        minHeight: 58,
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    datePickerButtonSelected: {
        borderColor:
            PRIMARY,
        backgroundColor:
            '#F0FDFA',
    },

    datePickerIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor:
            '#E6F7F5',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    datePickerContent: {
        flex: 1,
        marginLeft: 10,
    },

    datePickerText: {
        fontSize: 14,
        fontWeight:
            '600',
        color:
            '#111827',
    },

    datePickerPlaceholder: {
        color:
            '#9CA3AF',
        fontWeight:
            '500',
    },

    datePickerSubtext: {
        marginTop: 2,
        fontSize: 10,
        color:
            '#6B7280',
    },

    calendarContainer: {
        marginTop: -5,
        marginBottom: 17,
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        borderRadius: 15,
        overflow: 'hidden',
    },

    calendarHeader: {
        flexDirection:
            'row',
        alignItems:
            'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor:
            '#F0FDFA',
        borderBottomWidth: 1,
        borderBottomColor:
            '#E5E7EB',
    },

    calendarHeaderIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor:
            '#D8F5F2',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    calendarHeaderContent: {
        flex: 1,
        marginLeft: 9,
    },

    calendarHeaderTitle: {
        fontSize: 13,
        fontWeight:
            '700',
        color:
            '#115E59',
    },

    calendarHeaderSubtitle: {
        marginTop: 2,
        fontSize: 10,
        color:
            '#6B7280',
    },

    calendarDoneButton: {
        marginHorizontal: 14,
        marginBottom: 12,
        height: 44,
        borderRadius: 10,
        backgroundColor:
            PRIMARY,
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    calendarDoneButtonText: {
        color:
            '#FFFFFF',
        fontSize: 13,
        fontWeight:
            '700',
    },

    dateHint: {
        flexDirection:
            'row',
        alignItems:
            'center',
        marginTop: -5,
        marginBottom: 5,
    },

    dateHintText: {
        flex: 1,
        marginLeft: 6,
        fontSize: 11,
        color:
            '#6B7280',
        lineHeight: 16,
    },

    finalNotice: {
        marginTop: 24,
        backgroundColor:
            '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor:
            '#DDEFEF',
        flexDirection:
            'row',
        alignItems:
            'flex-start',
    },

    finalNoticeText: {
        flex: 1,
        marginLeft: 9,
        fontSize: 12,
        lineHeight: 18,
        color:
            '#6B7280',
    },

    boldText: {
        fontWeight:
            '700',
        color:
            '#374151',
    },

    bottomAction: {
        position:
            'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:
            '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom:
            Platform.OS ===
                'ios'
                ? 22
                : 12,
        borderTopWidth: 1,
        borderTopColor:
            '#E5E7EB',
    },

    submitButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor:
            PRIMARY,
        flexDirection:
            'row',
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        marginLeft: 8,
        color:
            '#FFFFFF',
        fontSize: 15,
        fontWeight:
            '700',
    },

    couponInput: {
        flex: 1,
    },
});