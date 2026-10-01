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
    // Category
    //    Subcategory
    //       Service 1
    //       Service 2
    //
    // ========================================================

    const groupedServices = useMemo(() => {

        type SubcategoryGroup = {
            subcategoryId: string;
            subcategoryName: string;
            services: ReviewService[];
        };

        type CategoryGroup = {
            categoryId: string;
            categoryName: string;
            subcategories: SubcategoryGroup[];
        };


        const categoryMap =
            new Map<
                string,
                CategoryGroup
            >();


        services.forEach(service => {

            const categoryId =
                String(
                    service.categoryId ?? '',
                );

            const subcategoryId =
                String(
                    service.subcategoryId ?? '',
                );


            if (!categoryMap.has(categoryId)) {

                categoryMap.set(
                    categoryId,
                    {
                        categoryId,
                        categoryName:
                            String(
                                service.categoryName ?? '',
                            ).trim() ||
                            'Category',
                        subcategories: [],
                    },
                );

            }


            const category =
                categoryMap.get(
                    categoryId,
                )!;


            let subcategory =
                category.subcategories.find(
                    item =>
                        item.subcategoryId ===
                        subcategoryId,
                );


            if (!subcategory) {

                subcategory = {
                    subcategoryId,
                    subcategoryName:
                        String(
                            service.subcategoryName ?? '',
                        ).trim() ||
                        'Subcategory',
                    services: [],
                };


                category.subcategories.push(
                    subcategory,
                );

            }


            subcategory.services.push(
                service,
            );

        });


        return Array.from(
            categoryMap.values(),
        );

    }, [services]);


    // ========================================================
    // TOTAL
    // ========================================================

    const totalServices =
        services.length;


    // ========================================================
    // EDIT
    // ========================================================
    //
    // We simply go back to ConfigureSalonServices.
    //
    // The registration context already contains the
    // service name, price and duration, so all values
    // remain available for editing.
    //

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
                            onPress: handleEdit,
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
                {/* CATEGORY GROUPS */}
                {/* ================================================= */}

                {groupedServices.map(
                    category => (

                        <View
                            key={
                                category.categoryId
                            }
                            style={
                                styles.categoryCard
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


                            {/* SUBCATEGORIES */}

                            {category.subcategories.map(
                                subcategory => (

                                    <View
                                        key={
                                            subcategory.subcategoryId
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


                                        {subcategory.services.map(
                                            (
                                                service,
                                                index,
                                            ) => {

                                                const serviceName =
                                                    String(
                                                        service.name ??
                                                        '',
                                                    ).trim();


                                                const price =
                                                    typeof service.price ===
                                                        'number'
                                                        ? service.price
                                                        : 0;


                                                const duration =
                                                    typeof service.durationMinutes ===
                                                        'number'
                                                        ? service.durationMinutes
                                                        : 0;


                                                const audience =
                                                    service.audience ===
                                                        'FEMALE'
                                                        ? 'Women'
                                                        : service.audience ===
                                                            'MALE'
                                                            ? 'Men'
                                                            : 'Kids';


                                                const serviceKey =
                                                    String(
                                                        service.uniqueId ??
                                                        (service as any).serviceKey ??
                                                        `${service.categoryId}-${service.subcategoryId}-${service.audience}-${index}`,
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
                                                                        {index + 1}
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


                                                                    <Text
                                                                        style={
                                                                            styles.audienceText
                                                                        }
                                                                    >
                                                                        For{' '}
                                                                        {
                                                                            audience
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
                                                                        ₹{price}
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
                                                                        {duration}{' '}
                                                                        min
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

    categoryCard: {
        backgroundColor:
            COLORS.white,
        borderRadius:
            RADIUS.large,
        marginBottom:
            SPACING.medium,
        overflow:
            'hidden',
    },

    categoryHeader: {
        paddingHorizontal:
            SPACING.medium,
        paddingVertical:
            SPACING.medium,
        backgroundColor:
            '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor:
            '#EEEEEE',
    },

    categoryName: {
        fontFamily:
            FONTS.bold,
        fontSize: 17,
        color:
            COLORS.black,
    },

    subcategorySection: {
        paddingHorizontal:
            SPACING.medium,
        paddingTop:
            SPACING.medium,
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

    serviceCard: {
        borderWidth: 1,
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
        width: 30,
        height: 30,
        borderRadius: 15,
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
        fontSize: 12,
        color:
            COLORS.primary,
    },

    serviceNameContainer: {
        flex: 1,
    },

    serviceName: {
        fontFamily:
            FONTS.bold,
        fontSize: 15,
        color:
            COLORS.black,
    },

    audienceText: {
        fontFamily:
            FONTS.regular,
        fontSize: 11,
        color:
            COLORS.primary,
        marginTop: 3,
    },

    detailsRow: {
        flexDirection:
            'row',
        alignItems:
            'center',
        marginTop:
            SPACING.medium,
        paddingTop:
            SPACING.medium,
        borderTopWidth: 1,
        borderTopColor:
            '#EEEEEE',
    },

    detailItem: {
        flex: 1,
    },

    detailLabel: {
        fontFamily:
            FONTS.regular,
        fontSize: 11,
        color:
            COLORS.textSecondary,
        marginBottom: 3,
    },

    detailValue: {
        fontFamily:
            FONTS.bold,
        fontSize: 14,
        color:
            COLORS.black,
    },

    detailDivider: {
        width: 1,
        height: 30,
        backgroundColor:
            '#E5E5E5',
        marginHorizontal:
            SPACING.medium,
    },

    editButton: {
        alignSelf:
            'flex-end',
        marginTop:
            SPACING.medium,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius:
            RADIUS.medium,
        backgroundColor:
            '#E8F6F4',
    },

    editButtonText: {
        fontFamily:
            FONTS.medium,
        fontSize: 12,
        color:
            COLORS.primary,
    },

    confirmationCard: {
        backgroundColor:
            COLORS.white,
        borderWidth: 1,
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
        fontSize: 14,
        color:
            COLORS.black,
        marginBottom: 6,
    },

    confirmationText: {
        fontFamily:
            FONTS.regular,
        fontSize: 12,
        lineHeight: 18,
        color:
            COLORS.textSecondary,
    },

    footer: {
        backgroundColor:
            COLORS.white,
        paddingHorizontal:
            SPACING.large,
        paddingTop:
            SPACING.small,
        paddingBottom:
            SPACING.medium,
        borderTopWidth: 1,
        borderTopColor:
            '#EEEEEE',
    },

    editAllButton: {
        width: '100%',
        minHeight: 46,
        borderRadius:
            RADIUS.medium,
        borderWidth: 1,
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
        fontSize: 14,
        color:
            COLORS.themeColor,
    },

    confirmButton: {
        width: '100%',
        minHeight: 50,
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
        fontSize: 15,
        color:
            COLORS.white,
    },

    primaryButton: {
        marginTop:
            SPACING.large,
        minHeight: 48,
        paddingHorizontal: 24,
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
        fontSize: 14,
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
        fontSize: 18,
        color:
            COLORS.black,
        textAlign:
            'center',
    },

    emptyText: {
        fontFamily:
            FONTS.regular,
        fontSize: 14,
        lineHeight: 21,
        color:
            COLORS.textSecondary,
        textAlign:
            'center',
        marginTop: 8,
    },

    bottomSpace: {
        height: 20,
    },

});


export default ServiceReview;