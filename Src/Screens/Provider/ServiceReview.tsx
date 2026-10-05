import React, {
    useMemo,
    useCallback,
} from 'react';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';

import {
    Header,
} from '../../components';

import {
    COLORS,
    FONTS,
    SPACING,
    RADIUS,
} from '../../constants/constants';

import {
    SalonServiceSelection,
    useSalonRegistration,
} from '../../context/SalonRegistrationContext';


// ============================================================
// TYPES
// ============================================================

type ReviewService =
    SalonServiceSelection & {
        uniqueId?: string;
        businessTypeId?: string;
        name: string;
        description?: string;
    };

type AudienceGroup = {
    audience: string;
    audienceLabel: string;
    categories: CategoryGroup[];
};

type CategoryGroup = {
    categoryId: string;
    categoryName: string;
    subcategories: SubcategoryGroup[];
};

type SubcategoryGroup = {
    subcategoryId: string;
    subcategoryName: string;
    services: ReviewService[];
};


// ============================================================
// HELPERS
// ============================================================

const getAudienceLabel = (
    audience?: string,
): string => {

    switch (
        String(audience ?? '')
            .trim()
            .toUpperCase()
    ) {

        case 'FEMALE':
            return 'Female';

        case 'MALE':
            return 'Male';

        case 'KIDS':
            return 'Kids';

        default:
            return 'Other';
    }
};


const getAudienceOrder = (
    audience?: string,
): number => {

    switch (
        String(audience ?? '')
            .trim()
            .toUpperCase()
    ) {

        case 'FEMALE':
            return 1;

        case 'MALE':
            return 2;

        case 'KIDS':
            return 3;

        default:
            return 99;
    }
};


// ============================================================
// COMPONENT
// ============================================================

const ServiceReview = ({
    navigation,
}: any) => {

    const {
        data,
    } = useSalonRegistration();


    // ========================================================
    // SERVICES
    // ========================================================

    const services: ReviewService[] =
        Array.isArray(data.serviceSelections)
            ? data.serviceSelections as ReviewService[]
            : [];


    // ========================================================
    // GROUP SERVICES
    // ========================================================
    //
    // Audience
    //   Category
    //      Subcategory
    //          Service 1
    //          Service 2
    //
    // Example:
    //
    // Female
    //   Hair
    //      Haircut
    //          Layer Haircut
    //          Bob Haircut
    //
    // Male
    //   Hair
    //      Haircut
    //          Classic Haircut
    //          Fade Haircut
    //
    // ========================================================

    const groupedServices =
        useMemo<AudienceGroup[]>(() => {

            const audienceMap =
                new Map<
                    string,
                    AudienceGroup
                >();


            services.forEach(
                service => {

                    const rawAudience =
                        String(
                            service.audience ?? '',
                        )
                            .trim()
                            .toUpperCase();

                    const audienceKey =
                        rawAudience || 'OTHER';


                    // ==================================================
                    // AUDIENCE
                    // ==================================================

                    if (
                        !audienceMap.has(
                            audienceKey,
                        )
                    ) {

                        audienceMap.set(
                            audienceKey,
                            {
                                audience:
                                    audienceKey,

                                audienceLabel:
                                    getAudienceLabel(
                                        audienceKey,
                                    ),

                                categories: [],
                            },
                        );

                    }


                    const audienceGroup =
                        audienceMap.get(
                            audienceKey,
                        )!;


                    // ==================================================
                    // CATEGORY
                    // ==================================================

                    const categoryId =
                        String(
                            service.categoryId ?? '',
                        )
                            .trim();


                    let category =
                        audienceGroup.categories.find(
                            item =>
                                item.categoryId ===
                                categoryId,
                        );


                    if (
                        !category
                    ) {

                        category = {
                            categoryId,

                            categoryName:
                                String(
                                    service.categoryName ?? '',
                                )
                                    .trim() ||
                                'Category',

                            subcategories: [],
                        };


                        audienceGroup.categories.push(
                            category,
                        );

                    }


                    // ==================================================
                    // SUBCATEGORY
                    // ==================================================

                    const subcategoryId =
                        String(
                            service.subcategoryId ?? '',
                        )
                            .trim();


                    let subcategory =
                        category.subcategories.find(
                            item =>
                                item.subcategoryId ===
                                subcategoryId,
                        );


                    if (
                        !subcategory
                    ) {

                        subcategory = {
                            subcategoryId,

                            subcategoryName:
                                String(
                                    service.subcategoryName ?? '',
                                )
                                    .trim() ||
                                'Subcategory',

                            services: [],
                        };


                        category.subcategories.push(
                            subcategory,
                        );

                    }


                    // ==================================================
                    // SERVICE
                    // ==================================================

                    subcategory.services.push(
                        service,
                    );

                },
            );


            // ==========================================================
            // SORT AUDIENCES
            // ==========================================================

            const audiences =
                Array.from(
                    audienceMap.values(),
                );


            audiences.sort(
                (
                    first,
                    second,
                ) =>
                    getAudienceOrder(
                        first.audience,
                    ) -
                    getAudienceOrder(
                        second.audience,
                    ),
            );


            return audiences;

        }, [
            services,
        ]);


    // ========================================================
    // TOTAL
    // ========================================================

    const totalServices =
        services.length;


    // ========================================================
    // EDIT
    // ========================================================

    const handleEdit =
        useCallback(() => {

            navigation.navigate(
                'ConfigureSalonServices',
            );

        }, [
            navigation,
        ]);


    // ========================================================
    // CONFIRM
    // ========================================================

    const handleConfirm =
        useCallback(() => {

            if (
                services.length === 0
            ) {

                Alert.alert(
                    'Services required',
                    'Please add at least one service before continuing.',
                );

                return;
            }


            const incompleteService =
                services.find(
                    service => {

                        const name =
                            String(
                                service.name ?? '',
                            ).trim();


                        const validPrice =
                            typeof service.price ===
                                'number' &&
                            Number.isFinite(
                                service.price,
                            ) &&
                            service.price > 0;


                        const validDuration =
                            typeof service.durationMinutes ===
                                'number' &&
                            Number.isFinite(
                                service.durationMinutes,
                            ) &&
                            service.durationMinutes > 0;


                        return (
                            !name ||
                            !validPrice ||
                            !validDuration
                        );

                    },
                );


            if (
                incompleteService
            ) {

                Alert.alert(
                    'Complete service details',
                    'Please edit the incomplete service and enter its name, price and duration.',
                    [
                        {
                            text: 'Edit',
                            onPress:
                                handleEdit,
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ],
                );

                return;
            }


            navigation.navigate(
                'SalonKYC',
            );

        }, [
            services,
            navigation,
            handleEdit,
        ]);


    // ========================================================
    // EMPTY
    // ========================================================

    if (
        totalServices === 0
    ) {

        return (
            <SafeAreaView
                style={
                    styles.container
                }
            >

                <Header
                    headerTitle="Review Services"
                    backBtn={() =>
                        navigation.goBack()
                    }
                />


                <View
                    style={
                        styles.emptyContainer
                    }
                >

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        No services selected
                    </Text>


                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        Please go back and add the services
                        your business provides.
                    </Text>


                    <TouchableOpacity
                        style={
                            styles.primaryButton
                        }
                        onPress={
                            handleEdit
                        }
                        activeOpacity={
                            0.8
                        }
                    >

                        <Text
                            style={
                                styles.primaryButtonText
                            }
                        >
                            Add Services
                        </Text>

                    </TouchableOpacity>

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

            <Header
                headerTitle="Review Services"
                backBtn={() =>
                    navigation.goBack()
                }
            />


            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
            >

                {/* ================================================= */}
                {/* INTRO */}
                {/* ================================================= */}

                <View
                    style={
                        styles.introContainer
                    }
                >

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Your business provides the
                        following services
                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Please review the details below
                        and confirm that everything is
                        correct.
                    </Text>


                    <View
                        style={
                            styles.serviceCountBadge
                        }
                    >

                        <Text
                            style={
                                styles.serviceCountText
                            }
                        >
                            {totalServices}{' '}
                            {totalServices === 1
                                ? 'service'
                                : 'services'}
                        </Text>

                    </View>

                </View>


                {/* ================================================= */}
                {/* AUDIENCE GROUPS */}
                {/* ================================================= */}

                {groupedServices.map(
                    audienceGroup => (

                        <View
                            key={
                                audienceGroup.audience
                            }
                            style={
                                styles.audienceCard
                            }
                        >

                            {/* ================================================= */}
                            {/* AUDIENCE HEADER */}
                            {/* ================================================= */}

                            <View
                                style={
                                    styles.audienceHeader
                                }
                            >

                                <Text
                                    style={
                                        styles.audienceHeaderName
                                    }
                                >
                                    {
                                        audienceGroup.audienceLabel
                                    }
                                </Text>


                                <Text
                                    style={
                                        styles.audienceHeaderSubtitle
                                    }
                                >
                                    Services for{' '}
                                    {
                                        audienceGroup.audienceLabel.toLowerCase()
                                    }
                                </Text>

                            </View>


                            {/* ================================================= */}
                            {/* CATEGORIES */}
                            {/* ================================================= */}

                            {audienceGroup.categories.map(
                                category => (

                                    <View
                                        key={
                                            `${audienceGroup.audience}-${category.categoryId}`
                                        }
                                        style={
                                            styles.categorySection
                                        }
                                    >

                                        {/* CATEGORY */}

                                        <View
                                            style={
                                                styles.categoryHeader
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.categoryName
                                                }
                                            >
                                                {
                                                    category.categoryName
                                                }
                                            </Text>

                                        </View>


                                        {/* ================================================= */}
                                        {/* SUBCATEGORIES */}
                                        {/* ================================================= */}

                                        {category.subcategories.map(
                                            subcategory => (

                                                <View
                                                    key={
                                                        `${audienceGroup.audience}-${category.categoryId}-${subcategory.subcategoryId}`
                                                    }
                                                    style={
                                                        styles.subcategorySection
                                                    }
                                                >

                                                    <Text
                                                        style={
                                                            styles.subcategoryName
                                                        }
                                                    >
                                                        {
                                                            subcategory.subcategoryName
                                                        }
                                                    </Text>


                                                    {/* ================================================= */}
                                                    {/* SERVICES */}
                                                    {/* ================================================= */}

                                                    {subcategory.services.map(
                                                        (
                                                            service,
                                                            index,
                                                        ) => {

                                                            const serviceName =
                                                                String(
                                                                    service.name ?? '',
                                                                ).trim();


                                                            const price =
                                                                typeof service.price ===
                                                                    'number'
                                                                    ? service.price
                                                                    : null;


                                                            const duration =
                                                                typeof service.durationMinutes ===
                                                                    'number'
                                                                    ? service.durationMinutes
                                                                    : null;


                                                            const serviceKey =
                                                                String(
                                                                    service.uniqueId ??
                                                                    (service as any).serviceKey ??
                                                                    `${audienceGroup.audience}-${service.categoryId}-${service.subcategoryId}-${service.name}-${index}`,
                                                                );


                                                            return (
                                                                <View
                                                                    key={
                                                                        serviceKey
                                                                    }
                                                                    style={
                                                                        styles.serviceCard
                                                                    }
                                                                >

                                                                    {/* SERVICE INFO */}

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

                                                                            <View
                                                                                style={
                                                                                    styles.serviceNumber
                                                                                }
                                                                            >

                                                                                <Text
                                                                                    style={
                                                                                        styles.serviceNumberText
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        index + 1
                                                                                    }
                                                                                </Text>

                                                                            </View>


                                                                            <View
                                                                                style={
                                                                                    styles.serviceNameContainer
                                                                                }
                                                                            >

                                                                                <Text
                                                                                    style={
                                                                                        styles.serviceName
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        serviceName ||
                                                                                        'Service name not set'
                                                                                    }
                                                                                </Text>

                                                                            </View>

                                                                        </View>


                                                                        {/* PRICE + DURATION */}

                                                                        <View
                                                                            style={
                                                                                styles.detailsRow
                                                                            }
                                                                        >

                                                                            <View
                                                                                style={
                                                                                    styles.detailItem
                                                                                }
                                                                            >

                                                                                <Text
                                                                                    style={
                                                                                        styles.detailLabel
                                                                                    }
                                                                                >
                                                                                    Price
                                                                                </Text>


                                                                                <Text
                                                                                    style={
                                                                                        styles.detailValue
                                                                                    }
                                                                                >
                                                                                    {price !== null
                                                                                        ? `₹${price}`
                                                                                        : 'Not set'}
                                                                                </Text>

                                                                            </View>


                                                                            <View
                                                                                style={
                                                                                    styles.detailDivider
                                                                                }
                                                                            />


                                                                            <View
                                                                                style={
                                                                                    styles.detailItem
                                                                                }
                                                                            >

                                                                                <Text
                                                                                    style={
                                                                                        styles.detailLabel
                                                                                    }
                                                                                >
                                                                                    Duration
                                                                                </Text>


                                                                                <Text
                                                                                    style={
                                                                                        styles.detailValue
                                                                                    }
                                                                                >
                                                                                    {duration !== null
                                                                                        ? `${duration} min`
                                                                                        : 'Not set'}
                                                                                </Text>

                                                                            </View>

                                                                        </View>

                                                                    </View>


                                                                    {/* EDIT */}

                                                                    <TouchableOpacity
                                                                        activeOpacity={
                                                                            0.7
                                                                        }
                                                                        style={
                                                                            styles.editButton
                                                                        }
                                                                        onPress={
                                                                            handleEdit
                                                                        }
                                                                    >

                                                                        <Text
                                                                            style={
                                                                                styles.editButtonText
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </Text>

                                                                    </TouchableOpacity>

                                                                </View>
                                                            );

                                                        },
                                                    )}

                                                </View>

                                            ),
                                        )}

                                    </View>

                                ),
                            )}

                        </View>

                    ),
                )}


                {/* ================================================= */}
                {/* CONFIRMATION MESSAGE */}
                {/* ================================================= */}

                <View
                    style={
                        styles.confirmationCard
                    }
                >

                    <Text
                        style={
                            styles.confirmationTitle
                        }
                    >
                        Please confirm
                    </Text>


                    <Text
                        style={
                            styles.confirmationText
                        }
                    >
                        These service names, prices and durations
                        will be used for your salon listing.
                        You can edit them later from your business
                        profile.
                    </Text>

                </View>


                <View
                    style={
                        styles.bottomSpace
                    }
                />

            </ScrollView>


            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <View
                style={
                    styles.footer
                }
            >

                <TouchableOpacity
                    activeOpacity={
                        0.8
                    }
                    style={
                        styles.editAllButton
                    }
                    onPress={
                        handleEdit
                    }
                >

                    <Text
                        style={
                            styles.editAllButtonText
                        }
                    >
                        Edit Services
                    </Text>

                </TouchableOpacity>


                <TouchableOpacity
                    activeOpacity={
                        0.8
                    }
                    style={
                        styles.confirmButton
                    }
                    onPress={
                        handleConfirm
                    }
                >

                    <Text
                        style={
                            styles.confirmButtonText
                        }
                    >
                        Confirm & Continue
                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
};


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor:
            COLORS.background,
    },

    content: {
        paddingHorizontal:
            SPACING.large,
        paddingTop:
            SPACING.large,
        paddingBottom:
            SPACING.xl,
    },

    introContainer: {
        marginBottom:
            SPACING.large,
    },

    title: {
        fontFamily:
            FONTS.bold,
        fontSize: 23,
        lineHeight: 30,
        color:
            COLORS.black,
        marginBottom:
            SPACING.small,
    },

    subtitle: {
        fontFamily:
            FONTS.regular,
        fontSize: 14,
        lineHeight: 21,
        color:
            COLORS.textSecondary,
    },

    serviceCountBadge: {
        alignSelf:
            'flex-start',
        marginTop:
            SPACING.medium,
        paddingHorizontal:
            12,
        paddingVertical:
            7,
        borderRadius:
            20,
        backgroundColor:
            '#E8F6F4',
    },

    serviceCountText: {
        fontFamily:
            FONTS.medium,
        fontSize: 12,
        color:
            COLORS.primary,
    },

    // ========================================================
    // AUDIENCE
    // ========================================================

    audienceCard: {
        backgroundColor:
            COLORS.white,
        borderRadius:
            RADIUS.large,
        marginBottom:
            SPACING.large,
        overflow:
            'hidden',
    },

    audienceHeader: {
        paddingHorizontal:
            SPACING.medium,
        paddingVertical:
            SPACING.medium,
        backgroundColor:
            '#F7F5FF',
        borderBottomWidth:
            1,
        borderBottomColor:
            '#E9E5F5',
    },

    audienceHeaderName: {
        fontFamily:
            FONTS.bold,
        fontSize: 19,
        color:
            COLORS.black,
    },

    audienceHeaderSubtitle: {
        fontFamily:
            FONTS.regular,
        fontSize: 12,
        color:
            COLORS.textSecondary,
        marginTop:
            3,
    },

    // ========================================================
    // CATEGORY
    // ========================================================

    categorySection: {
        paddingTop:
            SPACING.small,
    },

    categoryHeader: {
        paddingHorizontal:
            SPACING.medium,
        paddingTop:
            SPACING.medium,
        paddingBottom:
            SPACING.small,
    },

    categoryName: {
        fontFamily:
            FONTS.bold,
        fontSize: 16,
        color:
            COLORS.black,
    },

    // ========================================================
    // SUBCATEGORY
    // ========================================================

    subcategorySection: {
        paddingHorizontal:
            SPACING.medium,
        paddingTop:
            SPACING.small,
    },

    subcategoryName: {
        fontFamily:
            FONTS.medium,
        fontSize: 13,
        color:
            COLORS.textSecondary,
        marginBottom:
            SPACING.small,
    },

    // ========================================================
    // SERVICE
    // ========================================================

    serviceCard: {
        borderWidth:
            1,
        borderColor:
            '#E6E6E6',
        borderRadius:
            RADIUS.medium,
        padding:
            SPACING.medium,
        marginBottom:
            SPACING.medium,
        backgroundColor:
            COLORS.white,
    },

    serviceInfo: {
        flex: 1,
    },

    serviceNameRow: {
        flexDirection:
            'row',
        alignItems:
            'center',
    },

    serviceNumber: {
        width:
            30,
        height:
            30,
        borderRadius:
            15,
        backgroundColor:
            '#E8F6F4',
        alignItems:
            'center',
        justifyContent:
            'center',
        marginRight:
            10,
    },

    serviceNumberText: {
        fontFamily:
            FONTS.bold,
        fontSize:
            12,
        color:
            COLORS.primary,
    },

    serviceNameContainer: {
        flex: 1,
    },

    serviceName: {
        fontFamily:
            FONTS.bold,
        fontSize:
            15,
        color:
            COLORS.black,
        lineHeight:
            20,
    },

    // ========================================================
    // PRICE / DURATION
    // ========================================================

    detailsRow: {
        flexDirection:
            'row',
        alignItems:
            'center',
        marginTop:
            SPACING.medium,
        paddingTop:
            SPACING.medium,
        borderTopWidth:
            1,
        borderTopColor:
            '#EEEEEE',
    },

    detailItem: {
        flex: 1,
    },

    detailLabel: {
        fontFamily:
            FONTS.regular,
        fontSize:
            11,
        color:
            COLORS.textSecondary,
        marginBottom:
            3,
    },

    detailValue: {
        fontFamily:
            FONTS.bold,
        fontSize:
            14,
        color:
            COLORS.black,
    },

    detailDivider: {
        width:
            1,
        height:
            30,
        backgroundColor:
            '#E5E5E5',
        marginHorizontal:
            SPACING.medium,
    },

    // ========================================================
    // EDIT
    // ========================================================

    editButton: {
        alignSelf:
            'flex-end',
        marginTop:
            SPACING.medium,
        paddingHorizontal:
            16,
        paddingVertical:
            8,
        borderRadius:
            RADIUS.medium,
        backgroundColor:
            '#E8F6F4',
    },

    editButtonText: {
        fontFamily:
            FONTS.medium,
        fontSize:
            12,
        color:
            COLORS.primary,
    },

    // ========================================================
    // CONFIRMATION
    // ========================================================

    confirmationCard: {
        backgroundColor:
            COLORS.white,
        borderWidth:
            1,
        borderColor:
            '#E5E5E5',
        borderRadius:
            RADIUS.large,
        padding:
            SPACING.medium,
        marginTop:
            SPACING.small,
    },

    confirmationTitle: {
        fontFamily:
            FONTS.bold,
        fontSize:
            14,
        color:
            COLORS.black,
        marginBottom:
            6,
    },

    confirmationText: {
        fontFamily:
            FONTS.regular,
        fontSize:
            12,
        lineHeight:
            18,
        color:
            COLORS.textSecondary,
    },

    // ========================================================
    // FOOTER
    // ========================================================

    footer: {
        backgroundColor:
            COLORS.white,
        paddingHorizontal:
            SPACING.large,
        paddingTop:
            SPACING.small,
        paddingBottom:
            SPACING.medium,
        borderTopWidth:
            1,
        borderTopColor:
            '#EEEEEE',
    },

    editAllButton: {
        width:
            '100%',
        minHeight:
            46,
        borderRadius:
            RADIUS.medium,
        borderWidth:
            1,
        borderColor:
            COLORS.themeColor,
        alignItems:
            'center',
        justifyContent:
            'center',
        marginBottom:
            SPACING.small,
    },

    editAllButtonText: {
        fontFamily:
            FONTS.bold,
        fontSize:
            14,
        color:
            COLORS.themeColor,
    },

    confirmButton: {
        width:
            '100%',
        minHeight:
            50,
        borderRadius:
            RADIUS.medium,
        backgroundColor:
            COLORS.themeColor,
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    confirmButtonText: {
        fontFamily:
            FONTS.bold,
        fontSize:
            15,
        color:
            COLORS.white,
    },

    // ========================================================
    // EMPTY
    // ========================================================

    primaryButton: {
        marginTop:
            SPACING.large,
        minHeight:
            48,
        paddingHorizontal:
            24,
        borderRadius:
            RADIUS.medium,
        backgroundColor:
            COLORS.themeColor,
        alignItems:
            'center',
        justifyContent:
            'center',
    },

    primaryButtonText: {
        fontFamily:
            FONTS.bold,
        fontSize:
            14,
        color:
            COLORS.white,
    },

    emptyContainer: {
        flex: 1,
        alignItems:
            'center',
        justifyContent:
            'center',
        paddingHorizontal:
            SPACING.large,
    },

    emptyTitle: {
        fontFamily:
            FONTS.bold,
        fontSize:
            18,
        color:
            COLORS.black,
        textAlign:
            'center',
    },

    emptyText: {
        fontFamily:
            FONTS.regular,
        fontSize:
            14,
        lineHeight:
            21,
        color:
            COLORS.textSecondary,
        textAlign:
            'center',
        marginTop:
            8,
    },

    bottomSpace: {
        height:
            20,
    },

});


export default ServiceReview;

