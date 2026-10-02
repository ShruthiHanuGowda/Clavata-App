import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    useQuery,
} from '@apollo/client';

import {
    Header,
    DButton,
} from '../../components';

import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    RADIUS,
} from '../../constants/constants';

import {
    SalonServiceSelection,
    ServiceAudience,
    useSalonRegistration,
} from '../../context/SalonRegistrationContext';

import {
    GET_CLAVATA_CATEGORIES,
    GET_CLAVATA_SUBCATEGORIES,
} from '../../graphql/queries';


/* =====================================================
   TYPES
===================================================== */

type Category = {
    id: string;
    name: string;
};

type Subcategory = {
    id: string;
    name: string;
    categoryId?: string;
    category?: {
        id?: string;
        name?: string;
    };
};

type ConfiguredService =
    SalonServiceSelection & {
        serviceKey: string;
    };

type ServiceGroup = {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    audience: ServiceAudience;
    services: ConfiguredService[];
};

type ServiceFormState = {
    serviceKey?: string;
    businessTypeId?: string;
    businessTypeName?: string;
    categoryId: string;
    categoryName: string;

    subcategoryId: string;
    subcategoryName: string;

    audience: ServiceAudience;

    name: string;
    description: string;

    price: string;
    durationMinutes: string;
};


/* =====================================================
   HELPERS
===================================================== */

const normalizeText = (
    value?: string | null,
): string => {
    return String(
        value ?? '',
    ).trim();
};


const createServiceKey = (): string => {
    return (
        `SERVICE-${Date.now()}-` +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
};


const getAudienceLabel = (
    audience: ServiceAudience,
): string => {

    switch (audience) {

        case 'FEMALE':
            return 'Female';

        case 'MALE':
            return 'Male';

        case 'KIDS':
            return 'Kids';

        default:
            return audience;
    }
};


const getPriceText = (
    price?: number,
): string => {

    if (
        typeof price !== 'number' ||
        !Number.isFinite(price)
    ) {
        return '';
    }

    return String(price);
};


const getDurationText = (
    duration?: number,
): string => {

    if (
        typeof duration !== 'number' ||
        !Number.isFinite(duration)
    ) {
        return '';
    }

    return String(duration);
};


/* =====================================================
   COMPONENT
===================================================== */

const ConfigureSalonServices = ({
    navigation,
}: any) => {

    const {
        data,
        updateData,
    } = useSalonRegistration();


    /* =================================================
       ALL HOOKS MUST BE ABOVE CONDITIONAL RETURNS
    ================================================= */

    const {
        data: categoryData,
        loading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories,
    } = useQuery(
        GET_CLAVATA_CATEGORIES,
        {
            fetchPolicy:
                'cache-and-network',
        },
    );


    const {
        data: subcategoryData,
        loading: subcategoriesLoading,
        error: subcategoriesError,
        refetch: refetchSubcategories,
    } = useQuery(
        GET_CLAVATA_SUBCATEGORIES,
        {
            fetchPolicy:
                'cache-and-network',
        },
    );


    const [
        searchText,
        setSearchText,
    ] = useState('');


    const [
        expandedCategories,
        setExpandedCategories,
    ] = useState<
        Record<string, boolean>
    >({});


    const [
        commonDuration,
        setCommonDuration,
    ] = useState('');


    const [
        categoryDurations,
        setCategoryDurations,
    ] = useState<
        Record<string, string>
    >({});


    const [
        serviceForm,
        setServiceForm,
    ] = useState<
        ServiceFormState | null
    >(null);


    const [
        isSaving,
        setIsSaving,
    ] = useState(false);


    /* =================================================
       CATEGORIES
    ================================================= */

    const categories: Category[] =
        useMemo(() => {

            const raw =
                categoryData?.getClavataCategories ??
                categoryData?.getCategories ??
                categoryData?.clavataCategories ??
                categoryData?.categories ??
                [];

            if (!Array.isArray(raw)) {
                return [];
            }

            return raw
                .filter(Boolean)
                .map(
                    (item: any) => ({
                        id: String(
                            item.id ?? '',
                        ),

                        name: String(
                            item.name ?? '',
                        ),
                    }),
                )
                .filter(
                    item =>
                        item.id &&
                        item.name,
                );

        }, [
            categoryData,
        ]);


    /* =================================================
       SUBCATEGORIES
    ================================================= */

    const subcategories:
        Subcategory[] =
        useMemo(() => {

            const raw =
                subcategoryData?.getClavataSubcategories ??
                subcategoryData?.getSubcategories ??
                subcategoryData?.clavataSubcategories ??
                subcategoryData?.subcategories ??
                [];

            if (!Array.isArray(raw)) {
                return [];
            }

            return raw
                .filter(Boolean)
                .map(
                    (item: any) => {

                        const categoryId =
                            item.categoryId ??
                            item.category?.id ??
                            '';

                        return {
                            id: String(
                                item.id ?? '',
                            ),

                            name: String(
                                item.name ?? '',
                            ),

                            categoryId:
                                categoryId
                                    ? String(
                                        categoryId,
                                    )
                                    : undefined,

                            category:
                                item.category
                                    ? {
                                        id:
                                            item.category.id
                                                ? String(
                                                    item.category.id,
                                                )
                                                : undefined,

                                        name:
                                            item.category.name
                                                ? String(
                                                    item.category.name,
                                                )
                                                : undefined,
                                    }
                                    : undefined,
                        };
                    },
                )
                .filter(
                    item =>
                        item.id &&
                        item.name,
                );

        }, [
            subcategoryData,
        ]);


    /* =================================================
       LOOKUPS
    ================================================= */

    const getCategory =
        useCallback(
            (
                categoryId: string,
            ) => {

                return categories.find(
                    category =>
                        category.id ===
                        categoryId,
                );

            },
            [
                categories,
            ],
        );


    const getSubcategory =
        useCallback(
            (
                subcategoryId: string,
            ) => {

                return subcategories.find(
                    subcategory =>
                        subcategory.id ===
                        subcategoryId,
                );

            },
            [
                subcategories,
            ],
        );


    /* =================================================
       NORMALIZED SERVICES
    ================================================= */

    const selectedServices:
        ConfiguredService[] =
        useMemo(() => {

            return (
                data.serviceSelections ??
                []
            ).map(
                (
                    service:
                        SalonServiceSelection,
                    index,
                ) => {

                    const existingKey =
                        normalizeText(
                            service.serviceKey,
                        );

                    return {
                        ...service,

                        serviceKey:
                            existingKey ||
                            `LEGACY-${service.categoryId}-${service.subcategoryId}-${service.audience}-${index}`,
                    };
                },
            );

        }, [
            data.serviceSelections,
        ]);


    /* =================================================
       GROUP SERVICES

       IMPORTANT:

       DO NOT SORT BY SERVICE NAME.

       Original order is preserved.
    ================================================= */

    const serviceGroups:
        ServiceGroup[] =
        useMemo(() => {

            const groups:
                ServiceGroup[] = [];

            /*
             * serviceSelections can initially contain
             * category/subcategory selections with an
             * empty service name.
             *
             * Those entries identify WHICH subcategories
             * were selected, but they are NOT actual
             * configured services yet.
             *
             * Therefore:
             * - Use every selection to create the group.
             * - Only put selections with a real name into
             *   the group's services array.
             */

            selectedServices.forEach(
                service => {

                    const existing =
                        groups.find(
                            group =>
                                group.categoryId ===
                                service.categoryId &&
                                group.subcategoryId ===
                                service.subcategoryId &&
                                group.audience ===
                                service.audience,
                        );


                    if (existing) {

                        /*
                         * Do not create "Unnamed service".
                         *
                         * An empty-name selection is only a
                         * placeholder for the selected
                         * subcategory.
                         */

                        if (
                            normalizeText(
                                service.name,
                            )
                        ) {
                            existing.services.push(
                                service,
                            );
                        }

                        return;
                    }


                    const category =
                        getCategory(
                            service.categoryId,
                        );


                    const subcategory =
                        getSubcategory(
                            service.subcategoryId,
                        );


                    groups.push({

                        categoryId:
                            service.categoryId,

                        categoryName:
                            service.categoryName ||
                            category?.name ||
                            'Category',

                        subcategoryId:
                            service.subcategoryId,

                        subcategoryName:
                            service.subcategoryName ||
                            subcategory?.name ||
                            'Subcategory',

                        audience:
                            service.audience,

                        /*
                         * Only actual configured services
                         * are placed here.
                         */
                        services:
                            normalizeText(
                                service.name,
                            )
                                ? [service]
                                : [],
                    });
                },
            );


            return groups;

        }, [
            selectedServices,
            getCategory,
            getSubcategory,
        ]);

    /* =================================================
       SEARCH FILTER

       Search only filters.

       It NEVER changes ordering.
    ================================================= */

    const filteredGroups =
        useMemo(() => {

            const search =
                normalizeText(
                    searchText,
                ).toLowerCase();


            if (!search) {
                return serviceGroups;
            }


            return serviceGroups
                .map(group => {

                    const categoryMatches =
                        group.categoryName
                            .toLowerCase()
                            .includes(search);


                    const subcategoryMatches =
                        group.subcategoryName
                            .toLowerCase()
                            .includes(search);


                    if (
                        categoryMatches ||
                        subcategoryMatches
                    ) {
                        return group;
                    }


                    const matchingServices =
                        group.services.filter(
                            service =>
                                normalizeText(
                                    service.name,
                                )
                                    .toLowerCase()
                                    .includes(
                                        search,
                                    ),
                        );


                    if (
                        matchingServices.length >
                        0
                    ) {

                        return {
                            ...group,

                            services:
                                matchingServices,
                        };
                    }


                    return null;
                })
                .filter(
                    (
                        group,
                    ): group is ServiceGroup =>
                        group !== null,
                );

        }, [
            serviceGroups,
            searchText,
        ]);


    /* =================================================
       COUNTS
    ================================================= */

    const totalServices =
        selectedServices.filter(
            service =>
                normalizeText(
                    service.name,
                ),
        ).length;


    const configuredServices =
        selectedServices.filter(
            service =>
                normalizeText(
                    service.name,
                ) &&
                typeof service.price ===
                'number' &&
                service.price > 0 &&
                typeof service.durationMinutes ===
                'number' &&
                service.durationMinutes > 0,
        ).length;


    const allServicesConfigured =
        totalServices > 0 &&
        configuredServices ===
        totalServices;


    /* =================================================
       CATEGORY GROUPING FOR DISPLAY

       This preserves first appearance order.
    ================================================= */

    const categoriesForDisplay =
        useMemo(() => {

            const result: {
                id: string;
                name: string;
                groups: ServiceGroup[];
            }[] = [];


            filteredGroups.forEach(
                group => {

                    const existing =
                        result.find(
                            item =>
                                item.id ===
                                group.categoryId,
                        );


                    if (existing) {

                        existing.groups.push(
                            group,
                        );

                        return;
                    }


                    result.push({

                        id:
                            group.categoryId,

                        name:
                            group.categoryName,

                        groups: [
                            group,
                        ],
                    });
                },
            );


            return result;

        }, [
            filteredGroups,
        ]);


    /* =================================================
       CATEGORY TOGGLE
    ================================================= */

    const toggleCategory = (
        categoryId: string,
    ) => {

        setExpandedCategories(
            previous => ({
                ...previous,

                [categoryId]:
                    !(
                        previous[
                        categoryId
                        ] ?? true
                    ),
            }),
        );
    };


    /* =================================================
       ADD SERVICE
    ================================================= */

    const openAddService = (
        group: ServiceGroup,
    ) => {

        setServiceForm({

            serviceKey:
                undefined,

            categoryId:
                group.categoryId,

            categoryName:
                group.categoryName,

            subcategoryId:
                group.subcategoryId,

            subcategoryName:
                group.subcategoryName,

            audience:
                group.audience,

            name:
                '',

            description:
                '',

            price:
                '',

            durationMinutes:
                '',
        });
    };


    /* =================================================
       EDIT SERVICE
    ================================================= */

    const openEditService = (
        service: ConfiguredService,
    ) => {

        setServiceForm({

            serviceKey:
                service.serviceKey,

            categoryId:
                service.categoryId,

            categoryName:
                service.categoryName,

            subcategoryId:
                service.subcategoryId,

            subcategoryName:
                service.subcategoryName,

            audience:
                service.audience,

            name:
                service.name ?? '',

            description:
                service.description ?? '',

            price:
                getPriceText(
                    service.price,
                ),

            durationMinutes:
                getDurationText(
                    service.durationMinutes,
                ),
        });
    };


    /* =================================================
       CLOSE SERVICE FORM
    ================================================= */

    const closeServiceForm = () => {

        setServiceForm(null);
    };


    /* =================================================
       SAVE SERVICE
    ================================================= */

    const saveService = () => {

        if (!serviceForm) {
            return;
        }


        const name =
            normalizeText(
                serviceForm.name,
            );


        const priceText =
            normalizeText(
                serviceForm.price,
            );


        const durationText =
            normalizeText(
                serviceForm.durationMinutes,
            );


        /* =============================================
           NAME
        ============================================= */

        if (!name) {

            Alert.alert(
                'Service Name Required',
                'Please enter a service name.',
            );

            return;
        }


        /* =============================================
           PRICE
        ============================================= */

        if (!priceText) {

            Alert.alert(
                'Price Required',
                'Please enter the service price.',
            );

            return;
        }


        const price =
            Number(
                priceText,
            );


        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {

            Alert.alert(
                'Invalid Price',
                'Please enter a valid price.',
            );

            return;
        }


        /* =============================================
           DURATION
        ============================================= */

        if (!durationText) {

            Alert.alert(
                'Duration Required',
                'Please enter the service duration.',
            );

            return;
        }


        const duration =
            Number(
                durationText,
            );


        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {

            Alert.alert(
                'Invalid Duration',
                'Please enter a valid duration.',
            );

            return;
        }


        const description =
            normalizeText(
                serviceForm.description,
            );


        /* =============================================
           EDIT
        ============================================= */

        if (
            serviceForm.serviceKey
        ) {

            const updatedServices =
                selectedServices.map(
                    service => {

                        if (
                            service.serviceKey !==
                            serviceForm.serviceKey
                        ) {
                            return service;
                        }


                        return {

                            ...service,

                            name:
                                name,

                            description:
                                description,

                            price:
                                price,

                            durationMinutes:
                                duration,
                        };
                    },
                );


            updateData({
                serviceSelections:
                    updatedServices,
            });


            setServiceForm(null);

            return;
        }


        /* =============================================
           ADD
        ============================================= */

        const newService:
            ConfiguredService = {

            serviceKey:
                createServiceKey(),

            name:
                name,

            description:
                description,

            audience:
                serviceForm.audience,

            categoryId:
                serviceForm.categoryId,

            categoryName:
                serviceForm.categoryName,

            subcategoryId:
                serviceForm.subcategoryId,

            subcategoryName:
                serviceForm.subcategoryName,

            price:
                price,

            durationMinutes:
                duration,
        };


        /*
         * IMPORTANT:
         *
         * Add to the end.
         *
         * Nothing else gets reordered.
         */

        updateData({

            serviceSelections: [
                ...selectedServices,
                newService,
            ],
        });


        setServiceForm(null);
    };


    /* =================================================
       DELETE SERVICE
    ================================================= */

    const deleteService = (
        service: ConfiguredService,
    ) => {

        const name =
            normalizeText(
                service.name,
            ) ||
            'this service';


        Alert.alert(
            'Delete Service',
            `Are you sure you want to delete "${name}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },

                {
                    text: 'Delete',
                    style: 'destructive',

                    onPress: () => {

                        updateData({

                            serviceSelections:
                                selectedServices.filter(
                                    item =>
                                        item.serviceKey !==
                                        service.serviceKey,
                                ),
                        });
                    },
                },
            ],
        );
    };


    /* =================================================
       APPLY DURATION TO ALL
    ================================================= */

    const applyDurationToAll = () => {

        const value =
            normalizeText(
                commonDuration,
            );


        if (!value) {

            Alert.alert(
                'Enter Duration',
                'Please enter a duration in minutes.',
            );

            return;
        }


        const duration =
            Number(value);


        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {

            Alert.alert(
                'Invalid Duration',
                'Please enter a valid duration.',
            );

            return;
        }


        updateData({

            serviceSelections:
                selectedServices.map(
                    service => ({
                        ...service,

                        durationMinutes:
                            duration,
                    }),
                ),
        });
    };


    /* =================================================
       APPLY DURATION TO CATEGORY
    ================================================= */

    const applyDurationToCategory = (
        categoryId: string,
    ) => {

        const value =
            normalizeText(
                categoryDurations[
                categoryId
                ],
            );


        if (!value) {

            Alert.alert(
                'Enter Duration',
                'Please enter a duration in minutes.',
            );

            return;
        }


        const duration =
            Number(value);


        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {

            Alert.alert(
                'Invalid Duration',
                'Please enter a valid duration.',
            );

            return;
        }


        updateData({

            serviceSelections:
                selectedServices.map(
                    service => {

                        if (
                            service.categoryId !==
                            categoryId
                        ) {
                            return service;
                        }


                        return {
                            ...service,

                            durationMinutes:
                                duration,
                        };
                    },
                ),
        });
    };


    /* =================================================
       CONTINUE
    ================================================= */

    const handleContinue = () => {

        /*
         * Only entries with a service name are actual
         * services that need validation.
         *
         * Empty entries are category/subcategory
         * selections waiting for the salon to add a
         * service.
         */

        const actualServices =
            selectedServices.filter(
                service =>
                    normalizeText(
                        service.name,
                    ),
            );


        if (actualServices.length === 0) {

            Alert.alert(
                'Add Services',
                'Please add at least one service before continuing.',
            );

            return;
        }


        const invalidService =
            actualServices.find(
                service => {

                    const validPrice =
                        typeof service.price ===
                        'number' &&
                        service.price > 0;


                    const validDuration =
                        typeof service.durationMinutes ===
                        'number' &&
                        service.durationMinutes >
                        0;


                    return (
                        !validPrice ||
                        !validDuration
                    );
                },
            );


        if (invalidService) {

            Alert.alert(
                'Complete Service Details',
                'Please make sure every service has a name, price and duration.',
            );

            return;
        }


        setIsSaving(true);


        /*
         * IMPORTANT:
         *
         * Remove the empty placeholder entries before
         * proceeding to the next screen.
         *
         * The database should contain actual configured
         * services, not "empty" services.
         */

        updateData({
            serviceSelections:
                actualServices,
        });


        setTimeout(() => {

            setIsSaving(false);

            navigation.navigate(
                'ServiceReview',
            );

        }, 250);
    };


    /* =================================================
       RETRY
    ================================================= */

    const retryLoading = () => {

        refetchCategories();
        refetchSubcategories();
    };


    /* =================================================
       LOADING RETURN

       IMPORTANT:
       All hooks have already executed above.
    ================================================= */

    if (
        categoriesLoading ||
        subcategoriesLoading
    ) {

        return (
            <View
                style={
                    styles.loadingContainer
                }
            >

                <ActivityIndicator
                    size="large"
                    color={
                        COLORS.themeColor
                    }
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading services...
                </Text>

            </View>
        );
    }


    /* =================================================
       ERROR RETURN
    ================================================= */

    if (
        categoriesError ||
        subcategoriesError
    ) {

        return (
            <View
                style={
                    styles.errorContainer
                }
            >

                <Text
                    style={
                        styles.errorTitle
                    }
                >
                    Unable to load services
                </Text>

                <Text
                    style={
                        styles.errorText
                    }
                >
                    Please check your connection
                    and try again.
                </Text>

                <Pressable
                    onPress={
                        retryLoading
                    }
                    style={
                        styles.retryButton
                    }
                >

                    <Text
                        style={
                            styles.retryText
                        }
                    >
                        Try Again
                    </Text>

                </Pressable>

            </View>
        );
    }


    /* =================================================
       FORM RENDERING

       This is just JSX.

       It does NOT contain hooks.
    ================================================= */

    const serviceFormVisible =
        serviceForm !== null;


    const isEditing =
        Boolean(
            serviceForm?.serviceKey,
        );


    /* =================================================
       MAIN RENDER
    ================================================= */

    return (
        <KeyboardAvoidingView
            style={
                styles.container
            }
            behavior={
                Platform.OS === 'ios'
                    ? 'padding'
                    : undefined
            }
        >

            <Header
                headerTitle="Configure Services"
                backBtn={() =>
                    navigation.goBack()
                }
            />


            {/* =================================================
               MAIN LIST
            ================================================= */}

            {!serviceFormVisible && (
                <>
                    <ScrollView
                        style={
                            styles.scrollView
                        }
                        contentContainerStyle={
                            styles.contentContainer
                        }
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={
                            false
                        }
                    >

                        {/* =====================================
                           TITLE
                        ===================================== */}

                        <View
                            style={
                                styles.titleSection
                            }
                        >

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                Configure your services
                            </Text>

                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                Add your services and set
                                the price and duration for
                                each one.
                            </Text>

                        </View>


                        {/* =====================================
                           PROGRESS
                        ===================================== */}

                        <View
                            style={
                                styles.progressCard
                            }
                        >

                            <View
                                style={
                                    styles.progressHeader
                                }
                            >

                                <Text
                                    style={
                                        styles.progressTitle
                                    }
                                >
                                    Service details
                                </Text>

                                <Text
                                    style={
                                        styles.progressCount
                                    }
                                >
                                    {configuredServices}/
                                    {totalServices}
                                </Text>

                            </View>


                            <View
                                style={
                                    styles.progressTrack
                                }
                            >

                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width:
                                                totalServices >
                                                    0
                                                    ? `${(
                                                        configuredServices /
                                                        totalServices
                                                    ) *
                                                    100
                                                    }%`
                                                    : '0%',
                                        },
                                    ]}
                                />

                            </View>

                        </View>


                        {/* =====================================
                           COMMON DURATION
                        ===================================== */}

                        <View
                            style={
                                styles.commonDurationCard
                            }
                        >

                            <Text
                                style={
                                    styles.commonDurationTitle
                                }
                            >
                                Apply duration to all
                                services
                            </Text>

                            <Text
                                style={
                                    styles.commonDurationSubtitle
                                }
                            >
                                Optional. Use this when
                                most services have the same
                                duration.
                            </Text>


                            <View
                                style={
                                    styles.commonDurationRow
                                }
                            >

                                <View
                                    style={
                                        styles.commonDurationInput
                                    }
                                >

                                    <TextInput
                                        value={
                                            commonDuration
                                        }
                                        onChangeText={
                                            value =>
                                                setCommonDuration(
                                                    value.replace(
                                                        /[^0-9]/g,
                                                        '',
                                                    ),
                                                )
                                        }
                                        placeholder="60"
                                        placeholderTextColor={
                                            COLORS.textMuted
                                        }
                                        keyboardType="number-pad"
                                        style={
                                            styles.commonDurationTextInput
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.durationSuffix
                                        }
                                    >
                                        min
                                    </Text>

                                </View>


                                <Pressable
                                    onPress={
                                        applyDurationToAll
                                    }
                                    style={
                                        styles.applyButton
                                    }
                                >

                                    <Text
                                        style={
                                            styles.applyButtonText
                                        }
                                    >
                                        Apply
                                    </Text>

                                </Pressable>

                            </View>

                        </View>


                        {/* =====================================
                           SEARCH
                        ===================================== */}

                        <View
                            style={
                                styles.searchContainer
                            }
                        >

                            <TextInput
                                value={
                                    searchText
                                }
                                onChangeText={
                                    setSearchText
                                }
                                placeholder="Search services"
                                placeholderTextColor={
                                    COLORS.textMuted
                                }
                                style={
                                    styles.searchInput
                                }
                            />


                            {searchText.length >
                                0 && (
                                    <Pressable
                                        onPress={() =>
                                            setSearchText(
                                                '',
                                            )
                                        }
                                        style={
                                            styles.clearSearchButton
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.clearSearchText
                                            }
                                        >
                                            ×
                                        </Text>

                                    </Pressable>
                                )}

                        </View>


                        {/* =====================================
                           EMPTY
                        ===================================== */}

                        {serviceGroups.length ===
                            0 && (
                                <View
                                    style={
                                        styles.emptyCard
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
                                        Go back and select the
                                        services you offer.
                                    </Text>

                                </View>
                            )}


                        {serviceGroups.length >
                            0 &&
                            filteredGroups.length ===
                            0 && (
                                <View
                                    style={
                                        styles.emptyCard
                                    }
                                >

                                    <Text
                                        style={
                                            styles.emptyTitle
                                        }
                                    >
                                        No matching services
                                    </Text>

                                    <Text
                                        style={
                                            styles.emptyText
                                        }
                                    >
                                        Try a different search.
                                    </Text>

                                </View>
                            )}


                        {/* =====================================
                           CATEGORIES
                        ===================================== */}

                        {categoriesForDisplay.map(
                            category => {

                                const expanded =
                                    expandedCategories[
                                    category.id
                                    ] ?? true;


                                const serviceCount =
                                    category.groups.reduce(
                                        (
                                            total,
                                            group,
                                        ) =>
                                            total +
                                            group.services.length,
                                        0,
                                    );


                                return (
                                    <View
                                        key={
                                            category.id
                                        }
                                        style={
                                            styles.categorySection
                                        }
                                    >

                                        {/* =====================
                                           CATEGORY HEADER
                                        ===================== */}

                                        <Pressable
                                            onPress={() =>
                                                toggleCategory(
                                                    category.id,
                                                )
                                            }
                                            style={
                                                styles.categoryHeader
                                            }
                                        >

                                            <View
                                                style={
                                                    styles.categoryHeaderContent
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.categoryName
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.categoryCount
                                                    }
                                                >
                                                    {
                                                        serviceCount
                                                    }{' '}
                                                    {serviceCount ===
                                                        1
                                                        ? 'service'
                                                        : 'services'}
                                                </Text>

                                            </View>


                                            <Text
                                                style={
                                                    styles.categoryChevron
                                                }
                                            >
                                                {expanded
                                                    ? '−'
                                                    : '+'}
                                            </Text>

                                        </Pressable>


                                        {/* =====================
                                           SUBCATEGORIES
                                        ===================== */}

                                        {expanded && (
                                            <View
                                                style={
                                                    styles.subcategoriesContainer
                                                }
                                            >

                                                {category.groups.map(
                                                    (
                                                        group,
                                                        groupIndex,
                                                    ) => {

                                                        /*
                                                         * Number is based
                                                         * on its position
                                                         * inside THIS
                                                         * category.
                                                         *
                                                         * Adding another
                                                         * service does not
                                                         * create a new
                                                         * subcategory.
                                                         */

                                                        const subcategoryNumber =
                                                            groupIndex +
                                                            1;


                                                        return (
                                                            <View
                                                                key={
                                                                    `${group.categoryId}-${group.subcategoryId}-${group.audience}`
                                                                }
                                                                style={
                                                                    styles.subcategorySection
                                                                }
                                                            >

                                                                {/* =================
                                                                   SUBCATEGORY HEADER
                                                                ================= */}

                                                                <View
                                                                    style={
                                                                        styles.subcategoryHeader
                                                                    }
                                                                >

                                                                    <View
                                                                        style={
                                                                            styles.subcategoryTitleRow
                                                                        }
                                                                    >

                                                                        <Text
                                                                            style={
                                                                                styles.subcategoryNumber
                                                                            }
                                                                        >
                                                                            {
                                                                                subcategoryNumber
                                                                            }.
                                                                        </Text>

                                                                        <View
                                                                            style={
                                                                                styles.subcategoryTitleContent
                                                                            }
                                                                        >

                                                                            <Text
                                                                                style={
                                                                                    styles.subcategoryName
                                                                                }
                                                                            >
                                                                                {
                                                                                    group.subcategoryName
                                                                                }
                                                                            </Text>

                                                                            <Text
                                                                                style={
                                                                                    styles.audienceText
                                                                                }
                                                                            >
                                                                                {
                                                                                    getAudienceLabel(
                                                                                        group.audience,
                                                                                    )
                                                                                }
                                                                            </Text>

                                                                        </View>

                                                                    </View>

                                                                </View>


                                                                {/* =================
                                                                   SERVICES
                                                                ================= */}

                                                                <View
                                                                    style={
                                                                        styles.serviceList
                                                                    }
                                                                >

                                                                    {group.services.map(
                                                                        (
                                                                            service,
                                                                            serviceIndex,
                                                                        ) => {

                                                                            const hasName =
                                                                                Boolean(
                                                                                    normalizeText(
                                                                                        service.name,
                                                                                    ),
                                                                                );


                                                                            const hasPrice =
                                                                                typeof service.price ===
                                                                                'number' &&
                                                                                service.price >
                                                                                0;


                                                                            const hasDuration =
                                                                                typeof service.durationMinutes ===
                                                                                'number' &&
                                                                                service.durationMinutes >
                                                                                0;


                                                                            return (
                                                                                <View
                                                                                    key={
                                                                                        service.serviceKey
                                                                                    }
                                                                                    style={
                                                                                        styles.serviceRow
                                                                                    }
                                                                                >

                                                                                    {/* ==============
                                                                                       NUMBER
                                                                                    ============== */}

                                                                                    <Text
                                                                                        style={
                                                                                            styles.serviceNumber
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            serviceIndex +
                                                                                            1
                                                                                        }.
                                                                                    </Text>


                                                                                    {/* ==============
                                                                                       CONTENT
                                                                                    ============== */}

                                                                                    <View
                                                                                        style={
                                                                                            styles.serviceContent
                                                                                        }
                                                                                    >

                                                                                        <Text
                                                                                            style={
                                                                                                styles.serviceName
                                                                                            }
                                                                                        >
                                                                                            {hasName
                                                                                                ? service.name
                                                                                                : 'Unnamed service'}
                                                                                        </Text>


                                                                                        <View
                                                                                            style={
                                                                                                styles.serviceMeta
                                                                                            }
                                                                                        >

                                                                                            <Text
                                                                                                style={
                                                                                                    styles.servicePrice
                                                                                                }
                                                                                            >
                                                                                                {hasPrice
                                                                                                    ? `₹${service.price}`
                                                                                                    : 'Price not set'}
                                                                                            </Text>

                                                                                            <Text
                                                                                                style={
                                                                                                    styles.metaDot
                                                                                                }
                                                                                            >
                                                                                                •
                                                                                            </Text>

                                                                                            <Text
                                                                                                style={
                                                                                                    styles.serviceDuration
                                                                                                }
                                                                                            >
                                                                                                {hasDuration
                                                                                                    ? `${service.durationMinutes} min`
                                                                                                    : 'Duration not set'}
                                                                                            </Text>

                                                                                        </View>


                                                                                        {/* ============
                                                                                           ACTIONS
                                                                                        ============ */}

                                                                                        <View
                                                                                            style={
                                                                                                styles.serviceActions
                                                                                            }
                                                                                        >

                                                                                            <Pressable
                                                                                                onPress={() =>
                                                                                                    openEditService(
                                                                                                        service,
                                                                                                    )
                                                                                                }
                                                                                                style={
                                                                                                    styles.editButton
                                                                                                }
                                                                                            >

                                                                                                <Text
                                                                                                    style={
                                                                                                        styles.editButtonText
                                                                                                    }
                                                                                                >
                                                                                                    Edit
                                                                                                </Text>

                                                                                            </Pressable>


                                                                                            <Pressable
                                                                                                onPress={() =>
                                                                                                    deleteService(
                                                                                                        service,
                                                                                                    )
                                                                                                }
                                                                                                style={
                                                                                                    styles.deleteButton
                                                                                                }
                                                                                            >

                                                                                                <Text
                                                                                                    style={
                                                                                                        styles.deleteButtonText
                                                                                                    }
                                                                                                >
                                                                                                    Delete
                                                                                                </Text>

                                                                                            </Pressable>

                                                                                        </View>

                                                                                    </View>

                                                                                </View>
                                                                            );
                                                                        },
                                                                    )}

                                                                </View>


                                                                {/* =================
                                                                   ADD SERVICE
                                                                ================= */}

                                                                <Pressable
                                                                    onPress={() =>
                                                                        openAddService(
                                                                            group,
                                                                        )
                                                                    }
                                                                    style={
                                                                        styles.addServiceButton
                                                                    }
                                                                >

                                                                    <Text
                                                                        style={
                                                                            styles.addServiceIcon
                                                                        }
                                                                    >
                                                                        +
                                                                    </Text>

                                                                    <Text
                                                                        style={
                                                                            styles.addServiceText
                                                                        }
                                                                    >
                                                                        Add Service
                                                                    </Text>

                                                                </Pressable>


                                                                {/* =================
                                                                   CATEGORY DURATION
                                                                ================= */}

                                                                <View
                                                                    style={
                                                                        styles.categoryDurationSection
                                                                    }
                                                                >

                                                                    <Text
                                                                        style={
                                                                            styles.categoryDurationLabel
                                                                        }
                                                                    >
                                                                        Apply duration to
                                                                        this category
                                                                    </Text>


                                                                    <View
                                                                        style={
                                                                            styles.categoryDurationRow
                                                                        }
                                                                    >

                                                                        <View
                                                                            style={
                                                                                styles.categoryDurationInput
                                                                            }
                                                                        >

                                                                            <TextInput
                                                                                value={
                                                                                    categoryDurations[
                                                                                    category.id
                                                                                    ] ??
                                                                                    ''
                                                                                }
                                                                                onChangeText={
                                                                                    value =>
                                                                                        setCategoryDurations(
                                                                                            previous => ({
                                                                                                ...previous,

                                                                                                [category.id]:
                                                                                                    value.replace(
                                                                                                        /[^0-9]/g,
                                                                                                        '',
                                                                                                    ),
                                                                                            }),
                                                                                        )
                                                                                }
                                                                                placeholder="60"
                                                                                placeholderTextColor={
                                                                                    COLORS.textMuted
                                                                                }
                                                                                keyboardType="number-pad"
                                                                                style={
                                                                                    styles.categoryDurationTextInput
                                                                                }
                                                                            />

                                                                            <Text
                                                                                style={
                                                                                    styles.durationSuffix
                                                                                }
                                                                            >
                                                                                min
                                                                            </Text>

                                                                        </View>


                                                                        <Pressable
                                                                            onPress={() =>
                                                                                applyDurationToCategory(
                                                                                    category.id,
                                                                                )
                                                                            }
                                                                            style={
                                                                                styles.categoryApplyButton
                                                                            }
                                                                        >

                                                                            <Text
                                                                                style={
                                                                                    styles.categoryApplyButtonText
                                                                                }
                                                                            >
                                                                                Apply
                                                                            </Text>

                                                                        </Pressable>

                                                                    </View>

                                                                </View>

                                                            </View>
                                                        );
                                                    },
                                                )}

                                            </View>
                                        )}

                                    </View>
                                );
                            },
                        )}


                        {/* =====================================
                           INFORMATION
                        ===================================== */}

                        {totalServices >
                            0 && (
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
                                        Manage your services
                                    </Text>

                                    <Text
                                        style={
                                            styles.infoText
                                        }
                                    >
                                        You can add multiple
                                        services under the same
                                        subcategory. Use Edit to
                                        update a service or Delete
                                        to remove it.
                                    </Text>

                                </View>
                            )}

                    </ScrollView>


                    {/* =====================================
                       FOOTER
                    ===================================== */}

                    <View
                        style={
                            styles.footer
                        }
                    >

                        <DButton
                            style={{
                                width: '100%',
                                backgroundColor: COLORS.themeColor,
                            }}
                            onPress={
                                handleContinue
                            }
                            disabled={
                                isSaving ||
                                !allServicesConfigured
                            }
                        >
                            {isSaving
                                ? 'Saving...'
                                : 'Continue'}
                        </DButton>

                    </View>
                </>
            )}


            {/* =================================================
               ADD / EDIT FORM

               No hooks here.
            ================================================= */}

            {serviceFormVisible &&
                serviceForm && (
                    <View
                        style={
                            styles.formScreen
                        }
                    >

                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.formScrollContent
                            }
                        >

                            {/* ==============================
                               FORM HEADER
                            ============================== */}

                            <View
                                style={
                                    styles.formHeader
                                }
                            >

                                <View
                                    style={
                                        styles.formHeaderContent
                                    }
                                >

                                    <Text
                                        style={
                                            styles.formTitle
                                        }
                                    >
                                        {isEditing
                                            ? 'Edit Service'
                                            : 'Add Service'}
                                    </Text>

                                    <Text
                                        style={
                                            styles.formSubcategory
                                        }
                                    >
                                        {
                                            serviceForm.subcategoryName
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.formAudience
                                        }
                                    >
                                        {
                                            getAudienceLabel(
                                                serviceForm.audience,
                                            )
                                        }
                                    </Text>

                                </View>


                                <Pressable
                                    onPress={
                                        closeServiceForm
                                    }
                                    style={
                                        styles.closeButton
                                    }
                                >

                                    <Text
                                        style={
                                            styles.closeButtonText
                                        }
                                    >
                                        ×
                                    </Text>

                                </Pressable>

                            </View>


                            {/* ==============================
                               SERVICE NAME
                            ============================== */}

                            <View
                                style={
                                    styles.formField
                                }
                            >

                                <Text
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Service name
                                </Text>

                                <TextInput
                                    value={
                                        serviceForm.name
                                    }
                                    onChangeText={
                                        value =>
                                            setServiceForm(
                                                previous =>
                                                    previous
                                                        ? {
                                                            ...previous,

                                                            name:
                                                                value,
                                                        }
                                                        : previous,
                                            )
                                    }
                                    placeholder="e.g. Layer Hair Cut"
                                    placeholderTextColor={
                                        COLORS.textMuted
                                    }
                                    style={
                                        styles.formInput
                                    }
                                    autoFocus={
                                        !isEditing
                                    }
                                    returnKeyType="next"
                                />

                            </View>


                            {/* ==============================
                               DESCRIPTION
                            ============================== */}

                            <View
                                style={
                                    styles.formField
                                }
                            >

                                <Text
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Description
                                </Text>

                                <TextInput
                                    value={
                                        serviceForm.description
                                    }
                                    onChangeText={
                                        value =>
                                            setServiceForm(
                                                previous =>
                                                    previous
                                                        ? {
                                                            ...previous,

                                                            description:
                                                                value,
                                                        }
                                                        : previous,
                                            )
                                    }
                                    placeholder="Optional"
                                    placeholderTextColor={
                                        COLORS.textMuted
                                    }
                                    multiline
                                    textAlignVertical="top"
                                    style={[
                                        styles.formInput,
                                        styles.descriptionInput,
                                    ]}
                                />

                            </View>


                            {/* ==============================
                               PRICE + DURATION
                            ============================== */}

                            <View
                                style={
                                    styles.formDetailsRow
                                }
                            >

                                {/* PRICE */}

                                <View
                                    style={
                                        styles.formHalfField
                                    }
                                >

                                    <Text
                                        style={
                                            styles.formLabel
                                        }
                                    >
                                        Price
                                    </Text>

                                    <View
                                        style={
                                            styles.numberField
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.currencyText
                                            }
                                        >
                                            ₹
                                        </Text>

                                        <TextInput
                                            value={
                                                serviceForm.price
                                            }
                                            onChangeText={
                                                value =>
                                                    setServiceForm(
                                                        previous =>
                                                            previous
                                                                ? {
                                                                    ...previous,

                                                                    price:
                                                                        value.replace(
                                                                            /[^0-9]/g,
                                                                            '',
                                                                        ),
                                                                }
                                                                : previous,
                                                    )
                                            }
                                            placeholder="300"
                                            placeholderTextColor={
                                                COLORS.textMuted
                                            }
                                            keyboardType="number-pad"
                                            style={
                                                styles.numberInput
                                            }
                                        />

                                    </View>

                                </View>


                                {/* DURATION */}

                                <View
                                    style={
                                        styles.formHalfField
                                    }
                                >

                                    <Text
                                        style={
                                            styles.formLabel
                                        }
                                    >
                                        Duration
                                    </Text>

                                    <View
                                        style={
                                            styles.numberField
                                        }
                                    >

                                        <TextInput
                                            value={
                                                serviceForm.durationMinutes
                                            }
                                            onChangeText={
                                                value =>
                                                    setServiceForm(
                                                        previous =>
                                                            previous
                                                                ? {
                                                                    ...previous,

                                                                    durationMinutes:
                                                                        value.replace(
                                                                            /[^0-9]/g,
                                                                            '',
                                                                        ),
                                                                }
                                                                : previous,
                                                    )
                                            }
                                            placeholder="60"
                                            placeholderTextColor={
                                                COLORS.textMuted
                                            }
                                            keyboardType="number-pad"
                                            style={
                                                styles.numberInput
                                            }
                                        />

                                        <Text
                                            style={
                                                styles.durationSuffix
                                            }
                                        >
                                            min
                                        </Text>

                                    </View>

                                </View>

                            </View>


                            {/* ==============================
                               SAVE
                            ============================== */}

                            <Pressable
                                onPress={
                                    saveService
                                }
                                style={
                                    styles.saveButton
                                }
                            >

                                <Text
                                    style={
                                        styles.saveButtonText
                                    }
                                >
                                    {isEditing
                                        ? 'Save Changes'
                                        : 'Add Service'}
                                </Text>

                            </Pressable>


                            {/* ==============================
                               CANCEL
                            ============================== */}

                            <Pressable
                                onPress={
                                    closeServiceForm
                                }
                                style={
                                    styles.cancelButton
                                }
                            >

                                <Text
                                    style={
                                        styles.cancelButtonText
                                    }
                                >
                                    Cancel
                                </Text>

                            </Pressable>

                        </ScrollView>

                    </View>
                )}

        </KeyboardAvoidingView>
    );
};


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor:
            COLORS.background,
    },


    scrollView: {
        flex: 1,
    },


    contentContainer: {
        paddingHorizontal:
            SPACING.large,

        paddingTop:
            SPACING.large,

        paddingBottom:
            SPACING.large,
    },


    /* =================================================
       TITLE
    ================================================= */

    titleSection: {
        marginBottom:
            SPACING.xl,
    },


    title: {
        fontFamily:
            FONTS.bold,

        fontSize:
            FONT_SIZES.title,

        color:
            COLORS.text,

        marginBottom:
            SPACING.small,
    },


    subtitle: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        lineHeight: 21,

        color:
            COLORS.textSecondary,
    },


    /* =================================================
       PROGRESS
    ================================================= */

    progressCard: {
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


    progressHeader: {
        flexDirection:
            'row',

        alignItems:
            'center',

        justifyContent:
            'space-between',

        marginBottom:
            SPACING.medium,
    },


    progressTitle: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,
    },


    progressCount: {
        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.themeColor,
    },


    progressTrack: {
        height: 6,

        backgroundColor:
            COLORS.border,

        borderRadius:
            RADIUS.round,

        overflow:
            'hidden',
    },


    progressFill: {
        height:
            '100%',

        backgroundColor:
            COLORS.themeColor,

        borderRadius:
            RADIUS.round,
    },


    /* =================================================
       COMMON DURATION
    ================================================= */

    commonDurationCard: {
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


    commonDurationTitle: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,

        marginBottom:
            SPACING.xs,
    },


    commonDurationSubtitle: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.xs,

        lineHeight: 18,

        color:
            COLORS.textSecondary,

        marginBottom:
            SPACING.medium,
    },


    commonDurationRow: {
        flexDirection:
            'row',

        alignItems:
            'center',

        gap:
            SPACING.small,
    },


    commonDurationInput: {
        flex: 1,

        height: 48,

        borderWidth: 1,

        borderColor:
            COLORS.borderStrong,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.surface,

        flexDirection:
            'row',

        alignItems:
            'center',

        paddingHorizontal:
            SPACING.medium,
    },


    commonDurationTextInput: {
        flex: 1,

        height: 46,

        paddingVertical: 0,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,
    },


    durationSuffix: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,
    },


    applyButton: {
        height: 48,

        paddingHorizontal:
            SPACING.large,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.themeColor,

        alignItems:
            'center',

        justifyContent:
            'center',
    },


    applyButtonText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.white,
    },


    /* =================================================
       SEARCH
    ================================================= */

    searchContainer: {
        height: 48,

        borderWidth: 1,

        borderColor:
            COLORS.borderStrong,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.surface,

        flexDirection:
            'row',

        alignItems:
            'center',

        paddingHorizontal:
            SPACING.medium,

        marginBottom:
            SPACING.large,
    },


    searchInput: {
        flex: 1,

        height: 46,

        paddingVertical: 0,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.text,
    },


    clearSearchButton: {
        width: 32,

        height: 32,

        alignItems:
            'center',

        justifyContent:
            'center',
    },


    clearSearchText: {
        fontFamily:
            FONTS.regular,

        fontSize: 24,

        lineHeight: 26,

        color:
            COLORS.textSecondary,
    },


    /* =================================================
       CATEGORY
    ================================================= */

    categorySection: {
        marginBottom:
            SPACING.large,
    },


    categoryHeader: {
        minHeight: 58,

        paddingHorizontal:
            SPACING.large,

        backgroundColor:
            COLORS.surface,

        borderWidth: 1,

        borderColor:
            COLORS.border,

        borderRadius:
            RADIUS.large,

        flexDirection:
            'row',

        alignItems:
            'center',

        justifyContent:
            'space-between',
    },


    categoryHeaderContent: {
        flex: 1,
    },


    categoryName: {
        fontFamily:
            FONTS.bold,

        fontSize:
            FONT_SIZES.medium,

        color:
            COLORS.text,
    },


    categoryCount: {
        marginTop: 2,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.xs,

        color:
            COLORS.textMuted,
    },


    categoryChevron: {
        fontFamily:
            FONTS.medium,

        fontSize: 24,

        color:
            COLORS.textSecondary,

        marginLeft:
            SPACING.medium,
    },


    /* =================================================
       SUBCATEGORIES

       Notice the marginBottom.

       This gives clear visual separation between
       Hair Cut, Hair Color, etc.
    ================================================= */

    subcategoriesContainer: {
        marginTop:
            SPACING.large,
    },


    subcategorySection: {
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


    subcategoryHeader: {
        marginBottom:
            SPACING.medium,
    },


    subcategoryTitleRow: {
        flexDirection:
            'row',

        alignItems:
            'flex-start',
    },


    subcategoryNumber: {
        width: 28,

        fontFamily:
            FONTS.bold,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,
    },


    subcategoryTitleContent: {
        flex: 1,
    },


    subcategoryName: {
        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,
    },


    audienceText: {
        marginTop: 2,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.xs,

        color:
            COLORS.textMuted,
    },


    /* =================================================
       SERVICE LIST
    ================================================= */

    serviceList: {
        borderTopWidth: 1,

        borderTopColor:
            COLORS.border,
    },


    serviceRow: {
        flexDirection:
            'row',

        paddingVertical:
            SPACING.medium,

        borderBottomWidth: 1,

        borderBottomColor:
            COLORS.border,
    },


    serviceNumber: {
        width: 30,

        paddingTop: 2,

        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,
    },


    serviceContent: {
        flex: 1,

        minWidth: 0,
    },


    serviceName: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,

        marginBottom:
            SPACING.xs,
    },


    serviceMeta: {
        flexDirection:
            'row',

        alignItems:
            'center',
    },


    servicePrice: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,
    },


    metaDot: {
        marginHorizontal:
            SPACING.small,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textMuted,
    },


    serviceDuration: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,
    },


    /* =================================================
       SERVICE ACTIONS
    ================================================= */

    serviceActions: {
        flexDirection:
            'row',

        alignItems:
            'center',

        marginTop:
            SPACING.small,
    },


    editButton: {
        marginRight:
            SPACING.large,
    },


    editButtonText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.themeColor,
    },


    deleteButton: {
        paddingHorizontal:
            SPACING.xs,
    },


    deleteButtonText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            '#B42318',
    },


    /* =================================================
       ADD SERVICE
    ================================================= */

    addServiceButton: {
        minHeight: 44,

        flexDirection:
            'row',

        alignItems:
            'center',

        marginTop:
            SPACING.small,
    },


    addServiceIcon: {
        fontFamily:
            FONTS.medium,

        fontSize: 22,

        lineHeight: 24,

        color:
            COLORS.themeColor,

        marginRight:
            SPACING.xs,
    },


    addServiceText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.themeColor,
    },


    /* =================================================
       CATEGORY DURATION
    ================================================= */

    categoryDurationSection: {
        marginTop:
            SPACING.medium,

        paddingTop:
            SPACING.medium,

        borderTopWidth: 1,

        borderTopColor:
            COLORS.border,
    },


    categoryDurationLabel: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.xs,

        color:
            COLORS.textMuted,

        marginBottom:
            SPACING.small,
    },


    categoryDurationRow: {
        flexDirection:
            'row',

        gap:
            SPACING.small,
    },


    categoryDurationInput: {
        flex: 1,

        height: 44,

        borderWidth: 1,

        borderColor:
            COLORS.border,

        borderRadius:
            RADIUS.medium,

        flexDirection:
            'row',

        alignItems:
            'center',

        paddingHorizontal:
            SPACING.medium,
    },


    categoryDurationTextInput: {
        flex: 1,

        height: 42,

        paddingVertical: 0,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.text,
    },


    categoryApplyButton: {
        height: 44,

        paddingHorizontal:
            SPACING.large,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.surface,

        borderWidth: 1,

        borderColor:
            COLORS.borderStrong,

        alignItems:
            'center',

        justifyContent:
            'center',
    },


    categoryApplyButtonText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.text,
    },


    /* =================================================
       INFO
    ================================================= */

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
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.text,

        marginBottom:
            SPACING.xs,
    },


    infoText: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.xs,

        lineHeight: 18,

        color:
            COLORS.textSecondary,
    },


    /* =================================================
       EMPTY
    ================================================= */

    emptyCard: {
        backgroundColor:
            COLORS.surface,

        borderWidth: 1,

        borderColor:
            COLORS.border,

        borderRadius:
            RADIUS.large,

        padding:
            SPACING.xxl,

        alignItems:
            'center',

        marginBottom:
            SPACING.large,
    },


    emptyTitle: {
        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,

        marginBottom:
            SPACING.xs,
    },


    emptyText: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,

        textAlign:
            'center',
    },


    /* =================================================
       FOOTER
    ================================================= */

    footer: {
        paddingHorizontal:
            SPACING.large,

        paddingTop:
            SPACING.medium,

        paddingBottom:
            Platform.OS === 'ios'
                ? SPACING.xxl
                : SPACING.large,

        backgroundColor:
            COLORS.surface,

        borderTopWidth: 1,

        borderTopColor:
            COLORS.border,
    },


    /* =================================================
       FORM SCREEN
    ================================================= */

    formScreen: {
        flex: 1,

        backgroundColor:
            COLORS.background,
    },


    formScrollContent: {
        padding:
            SPACING.large,

        paddingBottom:
            SPACING.huge,
    },


    formHeader: {
        flexDirection:
            'row',

        alignItems:
            'flex-start',

        marginBottom:
            SPACING.xl,
    },


    formHeaderContent: {
        flex: 1,
    },


    formTitle: {
        fontFamily:
            FONTS.bold,

        fontSize:
            FONT_SIZES.title,

        color:
            COLORS.text,

        marginBottom:
            SPACING.xs,
    },


    formSubcategory: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,
    },


    formAudience: {
        marginTop: 3,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.xs,

        color:
            COLORS.textMuted,
    },


    closeButton: {
        width: 38,

        height: 38,

        alignItems:
            'center',

        justifyContent:
            'center',

        marginLeft:
            SPACING.small,
    },


    closeButtonText: {
        fontFamily:
            FONTS.regular,

        fontSize: 28,

        lineHeight: 30,

        color:
            COLORS.textSecondary,
    },


    /* =================================================
       FORM
    ================================================= */

    formField: {
        marginBottom:
            SPACING.large,
    },


    formLabel: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.text,

        marginBottom:
            SPACING.small,
    },


    formInput: {
        minHeight: 48,

        borderWidth: 1,

        borderColor:
            COLORS.borderStrong,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.surface,

        paddingHorizontal:
            SPACING.medium,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,
    },


    descriptionInput: {
        minHeight: 90,

        paddingTop:
            SPACING.medium,

        paddingBottom:
            SPACING.medium,
    },


    formDetailsRow: {
        flexDirection:
            'row',

        gap:
            SPACING.medium,

        marginBottom:
            SPACING.large,
    },


    formHalfField: {
        flex: 1,
    },


    numberField: {
        minHeight: 48,

        borderWidth: 1,

        borderColor:
            COLORS.borderStrong,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.surface,

        flexDirection:
            'row',

        alignItems:
            'center',

        paddingHorizontal:
            SPACING.medium,
    },


    currencyText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.textSecondary,

        marginRight:
            SPACING.xs,
    },


    numberInput: {
        flex: 1,

        height: 46,

        paddingVertical: 0,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.text,
    },


    saveButton: {
        minHeight: 50,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.themeColor,

        alignItems:
            'center',

        justifyContent:
            'center',

        marginTop:
            SPACING.small,
    },


    saveButtonText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.body,

        color:
            COLORS.white,
    },


    cancelButton: {
        minHeight: 48,

        alignItems:
            'center',

        justifyContent:
            'center',

        marginTop:
            SPACING.small,
    },


    cancelButtonText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,
    },


    /* =================================================
       LOADING
    ================================================= */

    loadingContainer: {
        flex: 1,

        alignItems:
            'center',

        justifyContent:
            'center',

        backgroundColor:
            COLORS.background,
    },


    loadingText: {
        marginTop:
            SPACING.medium,

        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,
    },


    /* =================================================
       ERROR
    ================================================= */

    errorContainer: {
        flex: 1,

        alignItems:
            'center',

        justifyContent:
            'center',

        padding:
            SPACING.xxl,

        backgroundColor:
            COLORS.background,
    },


    errorTitle: {
        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.title,

        color:
            COLORS.text,

        textAlign:
            'center',

        marginBottom:
            SPACING.small,
    },


    errorText: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.textSecondary,

        textAlign:
            'center',

        marginBottom:
            SPACING.large,
    },


    retryButton: {
        minHeight: 48,

        paddingHorizontal:
            SPACING.xxl,

        borderRadius:
            RADIUS.medium,

        backgroundColor:
            COLORS.themeColor,

        alignItems:
            'center',

        justifyContent:
            'center',
    },


    retryText: {
        fontFamily:
            FONTS.medium,

        fontSize:
            FONT_SIZES.small,

        color:
            COLORS.white,
    },
});


export default ConfigureSalonServices;