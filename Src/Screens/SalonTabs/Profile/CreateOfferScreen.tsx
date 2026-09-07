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
import {
    useMutation,
} from '@apollo/client';
import {
    CREATE_OFFER,
    UPDATE_OFFER,
} from '../../../graphql/queries';
import { useUser } from '../../../context/UserContext';

const PRIMARY = '#009D94';

type DiscountType =
    | 'PERCENTAGE'
    | 'FIXED';

type OfferCategory =
    | 'Hair'
    | 'Skin'
    | 'Nails'
    | 'Spa'
    | 'Makeup'
    | 'Other';

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

    const [
        category,
        setCategory,
    ] =
        useState<OfferCategory>(
            existingOffer?.category ||
                'Hair',
        );

    const [
        couponCode,
        setCouponCode,
    ] = useState(
        existingOffer?.couponCode ||
            '',
    );

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

            if (!startDate.trim()) {
                Alert.alert(
                    'Missing start date',
                    'Please enter the offer start date.',
                );
                return false;
            }

            if (!endDate.trim()) {
                Alert.alert(
                    'Missing end date',
                    'Please enter the offer end date.',
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
                    'Use the format YYYY-MM-DD.',
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
                    'Use the format YYYY-MM-DD.',
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
                    'Please enter a valid start date.',
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
                    'Please enter a valid end date.',
                );
                return false;
            }

            if (end < start) {
                Alert.alert(
                    'Invalid dates',
                    'End date must be after the start date.',
                );
                return false;
            }

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
                category:
                    category ||
                    null,
                serviceIds:
                    existingOffer?.serviceIds ||
                    [],
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
                    '====================================',
                );

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

                    <SectionTitle
                        title="Category"
                        subtitle="Which service category is this offer for?"
                    />

                    <View
                        style={
                            styles.categoryContainer
                        }
                    >
                        {[
                            'Hair',
                            'Skin',
                            'Nails',
                            'Spa',
                            'Makeup',
                            'Other',
                        ].map(
                            item => (
                                <TouchableOpacity
                                    key={
                                        item
                                    }
                                    style={[
                                        styles.categoryButton,
                                        category ===
                                            item &&
                                            styles.categoryButtonActive,
                                    ]}
                                    onPress={() =>
                                        setCategory(
                                            item as OfferCategory,
                                        )
                                    }
                                    activeOpacity={
                                        0.8
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            category ===
                                                item &&
                                                styles.categoryTextActive,
                                        ]}
                                    >
                                        {
                                            item
                                        }
                                    </Text>
                                </TouchableOpacity>
                            ),
                        )}
                    </View>

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

                    <SectionTitle
                        title="Booking Conditions"
                        subtitle="Set optional restrictions"
                    />

                    <SettingRow
                        title="No minimum booking amount"
                        description="Customers can use this offer on any booking"
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

                    <SectionTitle
                        title="Offer Period"
                        subtitle="When should customers be able to use this offer?"
                    />

                    <InputField
                        label="Start Date"
                        required
                        placeholder="YYYY-MM-DD"
                        value={
                            startDate
                        }
                        onChangeText={
                            setStartDate
                        }
                        keyboardType="numbers-and-punctuation"
                    />

                    <InputField
                        label="End Date"
                        required
                        placeholder="YYYY-MM-DD"
                        value={
                            endDate
                        }
                        onChangeText={
                            setEndDate
                        }
                        keyboardType="numbers-and-punctuation"
                    />

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
                            Use the format
                            YYYY-MM-DD, for
                            example
                            2026-09-30.
                        </Text>
                    </View>

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            '#F8FAFC',
    },
    keyboardContainer: {
        flex: 1,
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
    categoryContainer: {
        flexDirection:
            'row',
        flexWrap:
            'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 22,
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
    },
    categoryButtonActive: {
        backgroundColor:
            PRIMARY,
        borderColor:
            PRIMARY,
    },
    categoryText: {
        fontSize: 13,
        fontWeight:
            '600',
        color:
            '#6B7280',
    },
    categoryTextActive: {
        color:
            '#FFFFFF',
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
    dateHint: {
        flexDirection:
            'row',
        alignItems:
            'center',
        marginTop: -5,
        marginBottom: 5,
    },
    dateHintText: {
        marginLeft: 6,
        fontSize: 11,
        color:
            '#6B7280',
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
});