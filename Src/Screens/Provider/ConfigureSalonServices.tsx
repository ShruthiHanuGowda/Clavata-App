import React, {
    useMemo,
    useState,
    useCallback,
} from 'react';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';

import { useQuery } from '@apollo/client';

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
    SalonServiceSelection,
    useSalonRegistration,
} from '../../context/SalonRegistrationContext';

import {
    GET_CLAVATA_CATEGORIES,
    GET_CLAVATA_SUBCATEGORIES,
} from '../../graphql/queries';


// ============================================================
// TYPES
// ============================================================

type Category = {
    categoryId: string;
    name: string;
    description?: string | null;
    servicesCount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
};

type Subcategory = {
    subcategoryId: string;
    categoryId: string;
    name: string;
    description?: string | null;
    servicesCount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
};


// ============================================================
// COMPONENT
// ============================================================

const ConfigureSalonServices = ({
    navigation,
}: any) => {

    const {
        data,
        updateData,
    } = useSalonRegistration();


    // ========================================================
    // LOCAL STATE
    // ========================================================

    const [
        searchText,
        setSearchText,
    ] = useState('');

    const [
        defaultDuration,
        setDefaultDuration,
    ] = useState('');

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        expandedCategories,
        setExpandedCategories,
    ] = useState<Record<string, boolean>>({});


    // ========================================================
    // GRAPHQL
    // ========================================================

    const {
        data: categoryResponse,
        loading: categoriesLoading,
        error: categoriesError,
    } = useQuery(GET_CLAVATA_CATEGORIES);


    const {
        data: subcategoryResponse,
        loading: subcategoriesLoading,
        error: subcategoriesError,
    } = useQuery(GET_CLAVATA_SUBCATEGORIES);


    // ========================================================
    // CATEGORIES
    // ========================================================

    const categories: Category[] = useMemo(() => {

        const rawCategories =
            categoryResponse?.categories?.categories || [];

        return [...rawCategories].sort(
            (a: Category, b: Category) =>
                a.name.localeCompare(b.name),
        );

    }, [categoryResponse]);


    // ========================================================
    // SUBCATEGORIES
    // ========================================================

    const subcategories: Subcategory[] = useMemo(() => {

        const rawSubcategories =
            subcategoryResponse?.subcategories?.subcategories || [];

        return [...rawSubcategories].sort(
            (a: Subcategory, b: Subcategory) =>
                a.name.localeCompare(b.name),
        );

    }, [subcategoryResponse]);


    // ========================================================
    // SELECTED SERVICES
    // ========================================================

    const selectedServices: SalonServiceSelection[] =
        Array.isArray(data.serviceSelections)
            ? data.serviceSelections
            : [];


    // ========================================================
    // SERVICE LOOKUPS
    // ========================================================

    const getCategory = useCallback(
        (categoryId: string) => {

            return categories.find(
                category =>
                    category.categoryId === categoryId,
            );

        },
        [categories],
    );


    const getSubcategory = useCallback(
        (subcategoryId: string) => {

            return subcategories.find(
                subcategory =>
                    subcategory.subcategoryId === subcategoryId,
            );

        },
        [subcategories],
    );


    // ========================================================
    // GROUP SERVICES BY CATEGORY
    // ========================================================

    const servicesByCategory = useMemo(() => {

        const grouped: Record<
            string,
            SalonServiceSelection[]
        > = {};

        selectedServices.forEach(service => {

            if (!grouped[service.categoryId]) {
                grouped[service.categoryId] = [];
            }

            grouped[service.categoryId].push(service);
        });


        Object.keys(grouped).forEach(categoryId => {

            grouped[categoryId].sort((a, b) => {

                const aName =
                    getSubcategory(a.subcategoryId)?.name || '';

                const bName =
                    getSubcategory(b.subcategoryId)?.name || '';

                return aName.localeCompare(bName);
            });

        });


        return grouped;

    }, [
        selectedServices,
        getSubcategory,
    ]);


    // ========================================================
    // FILTER CATEGORIES BY SEARCH
    // ========================================================

    const filteredCategories = useMemo(() => {

        const search =
            searchText.trim().toLowerCase();


        return categories.filter(category => {

            const categoryServices =
                servicesByCategory[category.categoryId] || [];


            if (!search) {
                return categoryServices.length > 0;
            }


            const categoryMatches =
                category.name
                    .toLowerCase()
                    .includes(search);


            const serviceMatches =
                categoryServices.some(service => {

                    const name =
                        getSubcategory(
                            service.subcategoryId,
                        )?.name || '';

                    return name
                        .toLowerCase()
                        .includes(search);
                });


            return (
                categoryMatches ||
                serviceMatches
            );

        });

    }, [
        categories,
        searchText,
        servicesByCategory,
        getSubcategory,
    ]);


    // ========================================================
    // CONFIGURATION STATUS
    // ========================================================

    const isServiceConfigured = useCallback(
        (service: SalonServiceSelection) => {

            const validPrice =
                typeof service.price === 'number' &&
                service.price > 0;

            const validDuration =
                typeof service.durationMinutes === 'number' &&
                service.durationMinutes > 0;

            return (
                validPrice &&
                validDuration
            );
        },
        [],
    );


    const configuredCount = useMemo(() => {

        return selectedServices.filter(
            isServiceConfigured,
        ).length;

    }, [
        selectedServices,
        isServiceConfigured,
    ]);


    const totalCount =
        selectedServices.length;


    const remainingCount =
        totalCount - configuredCount;


    const allConfigured =
        totalCount > 0 &&
        configuredCount === totalCount;


    // ========================================================
    // PROGRESS
    // ========================================================

    const progressPercentage =
        totalCount > 0
            ? Math.round(
                (configuredCount / totalCount) * 100,
            )
            : 0;


    // ========================================================
    // UPDATE SERVICE
    // ========================================================

    const updateService = useCallback(
        (
            subcategoryId: string,
            field:
                | 'price'
                | 'durationMinutes',
            value: string,
        ) => {

            const cleanedValue =
                value.replace(/[^0-9]/g, '');


            const numericValue =
                cleanedValue === ''
                    ? undefined
                    : Number(cleanedValue);


            const updatedSelections =
                selectedServices.map(service => {

                    if (
                        service.subcategoryId !==
                        subcategoryId
                    ) {
                        return service;
                    }


                    return {
                        ...service,
                        [field]: numericValue,
                    };
                });


            updateData({
                serviceSelections:
                    updatedSelections,
            });

        },
        [
            selectedServices,
            updateData,
        ],
    );


    // ========================================================
    // TOGGLE CATEGORY
    // ========================================================

    const toggleCategory = useCallback(
        (categoryId: string) => {

            setExpandedCategories(
                previous => ({
                    ...previous,
                    [categoryId]:
                        !previous[categoryId],
                }),
            );

        },
        [],
    );


    // ========================================================
    // APPLY DURATION TO ALL
    // ========================================================

    const applyDurationToAll = useCallback(() => {

        const cleaned =
            defaultDuration.replace(
                /[^0-9]/g,
                '',
            );

        const duration =
            cleaned === ''
                ? 0
                : Number(cleaned);


        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {

            Alert.alert(
                'Invalid duration',
                'Please enter a valid duration in minutes.',
            );

            return;
        }


        const updatedSelections =
            selectedServices.map(service => ({
                ...service,
                durationMinutes: duration,
            }));


        updateData({
            serviceSelections:
                updatedSelections,
        });


        Alert.alert(
            'Duration applied',
            `${duration} minutes has been applied to all selected services.`,
        );

    }, [
        defaultDuration,
        selectedServices,
        updateData,
    ]);


    // ========================================================
    // APPLY DURATION TO CATEGORY
    // ========================================================

    const applyDurationToCategory = useCallback(
        (
            categoryId: string,
            durationText: string,
        ) => {

            const cleaned =
                durationText.replace(
                    /[^0-9]/g,
                    '',
                );

            const duration =
                cleaned === ''
                    ? 0
                    : Number(cleaned);


            if (
                !Number.isFinite(duration) ||
                duration <= 0
            ) {

                Alert.alert(
                    'Invalid duration',
                    'Please enter a valid duration in minutes.',
                );

                return;
            }


            const updatedSelections =
                selectedServices.map(service => {

                    if (
                        service.categoryId !==
                        categoryId
                    ) {
                        return service;
                    }


                    return {
                        ...service,
                        durationMinutes: duration,
                    };
                });


            updateData({
                serviceSelections:
                    updatedSelections,
            });

        },
        [
            selectedServices,
            updateData,
        ],
    );


    // ========================================================
    // CONTINUE
    // ========================================================

    const handleContinue = useCallback(() => {

        if (totalCount === 0) {

            Alert.alert(
                'Services required',
                'Please select at least one service.',
            );

            return;
        }


        const incompleteServices =
            selectedServices.filter(
                service =>
                    !isServiceConfigured(service),
            );


        if (incompleteServices.length > 0) {

            const serviceWord =
                incompleteServices.length === 1
                    ? 'service'
                    : 'services';

            const verb =
                incompleteServices.length === 1
                    ? 'needs'
                    : 'need';


            Alert.alert(
                'Complete service details',
                `Please enter a valid price and duration for all selected services. ${incompleteServices.length} ${serviceWord} ${verb} to be completed.`,
            );

            return;
        }


        setSaving(true);


        setTimeout(() => {

            setSaving(false);

            navigation.navigate(
                'SalonKYC',
            );

        }, 300);

    }, [
        totalCount,
        selectedServices,
        isServiceConfigured,
        navigation,
    ]);


    // ========================================================
    // LOADING
    // ========================================================

    const loading =
        categoriesLoading ||
        subcategoriesLoading;


    if (loading) {

        return (
            <SafeAreaView
                style={styles.container}
            >

                <Header
                    headerTitle="Configure Services"
                    backBtn={() =>
                        navigation.goBack()
                    }
                />

                <View
                    style={styles.loadingContainer}
                >

                    <ActivityIndicator
                        size="large"
                        color={COLORS.primary}
                    />

                    <Text
                        style={styles.loadingText}
                    >
                        Loading selected services...
                    </Text>

                </View>

            </SafeAreaView>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (
        categoriesError ||
        subcategoriesError
    ) {

        return (
            <SafeAreaView
                style={styles.container}
            >

                <Header
                    headerTitle="Configure Services"
                    backBtn={() =>
                        navigation.goBack()
                    }
                />

                <View
                    style={styles.errorContainer}
                >

                    <Text
                        style={styles.errorTitle}
                    >
                        Unable to load services
                    </Text>

                    <Text
                        style={styles.errorText}
                    >
                        Please go back and try again.
                    </Text>

                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() =>
                            navigation.goBack()
                        }
                    >

                        <Text
                            style={styles.errorButtonText}
                        >
                            Go Back
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
            style={styles.container}
        >

            <Header
                headerTitle="Configure Services"
                backBtn={() =>
                    navigation.goBack()
                }
            />


            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.content
                }
            >

                {/* ================================================= */}
                {/* TITLE */}
                {/* ================================================= */}

                <Text
                    style={styles.title}
                >
                    Set your service prices
                </Text>

                <Text
                    style={styles.subtitle}
                >
                    Enter the price and duration for every
                    service you offer. Customers will see
                    these details when booking.
                </Text>


                {/* ================================================= */}
                {/* PROGRESS */}
                {/* ================================================= */}

                <View
                    style={styles.progressCard}
                >

                    <View
                        style={styles.progressHeader}
                    >

                        <View>

                            <Text
                                style={
                                    styles.progressTitle
                                }
                            >
                                Service setup
                            </Text>

                            <Text
                                style={
                                    styles.progressSubtitle
                                }
                            >
                                {configuredCount} of {totalCount}{' '}
                                completed
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.progressPercentage
                            }
                        >
                            {progressPercentage}%
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
                                        `${progressPercentage}%`,
                                },
                            ]}
                        />

                    </View>


                    {remainingCount > 0 ? (

                        <Text
                            style={
                                styles.remainingText
                            }
                        >
                            {remainingCount}{' '}
                            {remainingCount === 1
                                ? 'service'
                                : 'services'}{' '}
                            remaining
                        </Text>

                    ) : (

                        <Text
                            style={
                                styles.completedText
                            }
                        >
                            ✓ All services completed
                        </Text>

                    )}

                </View>


                {/* ================================================= */}
                {/* BULK DURATION */}
                {/* ================================================= */}

                <View
                    style={styles.bulkCard}
                >

                    <Text
                        style={styles.bulkTitle}
                    >
                        Save time
                    </Text>

                    <Text
                        style={styles.bulkSubtitle}
                    >
                        If most of your services have the same
                        duration, apply it to all services at once.
                    </Text>


                    <View
                        style={styles.bulkRow}
                    >

                        <TextInput
                            value={defaultDuration}
                            onChangeText={
                                value =>
                                    setDefaultDuration(
                                        value.replace(
                                            /[^0-9]/g,
                                            '',
                                        ),
                                    )
                            }
                            placeholder="30"
                            placeholderTextColor={
                                COLORS.textSecondary
                            }
                            keyboardType="number-pad"
                            style={
                                styles.bulkInput
                            }
                            maxLength={3}
                        />

                        <Text
                            style={styles.minutesText}
                        >
                            min
                        </Text>


                        <TouchableOpacity
                            style={
                                styles.applyButton
                            }
                            onPress={
                                applyDurationToAll
                            }
                        >

                            <Text
                                style={
                                    styles.applyButtonText
                                }
                            >
                                Apply to all
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>


                {/* ================================================= */}
                {/* SEARCH */}
                {/* ================================================= */}

                <View
                    style={styles.searchContainer}
                >

                    <TextInput
                        value={searchText}
                        onChangeText={
                            setSearchText
                        }
                        placeholder="Search selected services"
                        placeholderTextColor={
                            COLORS.textSecondary
                        }
                        style={
                            styles.searchInput
                        }
                    />

                </View>


                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {totalCount === 0 && (

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
                            Go back and select the services
                            your salon provides.
                        </Text>


                        <TouchableOpacity
                            style={
                                styles.goBackButton
                            }
                            onPress={() =>
                                navigation.goBack()
                            }
                        >

                            <Text
                                style={
                                    styles.goBackButtonText
                                }
                            >
                                Select Services
                            </Text>

                        </TouchableOpacity>

                    </View>

                )}


                {/* ================================================= */}
                {/* CATEGORY LIST */}
                {/* ================================================= */}

                {filteredCategories.map(
                    category => {

                        const categoryServices =
                            servicesByCategory[
                                category.categoryId
                            ] || [];


                        const search =
                            searchText
                                .trim()
                                .toLowerCase();


                        const visibleServices =
                            search
                                ? categoryServices.filter(
                                    service => {

                                        const serviceName =
                                            getSubcategory(
                                                service.subcategoryId,
                                            )?.name || '';


                                        const categoryMatches =
                                            category.name
                                                .toLowerCase()
                                                .includes(search);


                                        const serviceMatches =
                                            serviceName
                                                .toLowerCase()
                                                .includes(search);


                                        return (
                                            categoryMatches ||
                                            serviceMatches
                                        );
                                    },
                                )
                                : categoryServices;


                        if (
                            visibleServices.length === 0
                        ) {
                            return null;
                        }


                        const isOpen =
                            expandedCategories[
                                category.categoryId
                            ] ?? true;


                        const categoryCompleted =
                            categoryServices.filter(
                                isServiceConfigured,
                            ).length;


                        return (
                            <View
                                key={
                                    category.categoryId
                                }
                                style={
                                    styles.categoryCard
                                }
                            >

                                {/* CATEGORY HEADER */}

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={
                                        styles.categoryHeader
                                    }
                                    onPress={() =>
                                        toggleCategory(
                                            category.categoryId,
                                        )
                                    }
                                >

                                    <View
                                        style={
                                            styles.categoryHeaderLeft
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.categoryName
                                            }
                                        >
                                            {category.name}
                                        </Text>

                                        <Text
                                            style={
                                                styles.categoryCount
                                            }
                                        >
                                            {categoryCompleted}
                                            {' / '}
                                            {categoryServices.length}
                                            {' completed'}
                                        </Text>

                                    </View>


                                    <Text
                                        style={
                                            styles.categoryArrow
                                        }
                                    >
                                        {isOpen ? '−' : '+'}
                                    </Text>

                                </TouchableOpacity>


                                {/* CATEGORY SERVICES */}

                                {isOpen && (

                                    <View
                                        style={
                                            styles.servicesContainer
                                        }
                                    >

                                        {visibleServices.map(
                                            service => {

                                                const subcategory =
                                                    getSubcategory(
                                                        service.subcategoryId,
                                                    );


                                                const configured =
                                                    isServiceConfigured(
                                                        service,
                                                    );


                                                return (
                                                    <View
                                                        key={
                                                            service.subcategoryId
                                                        }
                                                        style={[
                                                            styles.serviceCard,
                                                            !configured &&
                                                            styles.serviceCardIncomplete,
                                                        ]}
                                                    >

                                                        <View
                                                            style={
                                                                styles.serviceHeader
                                                            }
                                                        >

                                                            <View
                                                                style={
                                                                    styles.serviceTitleContainer
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.serviceName
                                                                    }
                                                                >
                                                                    {subcategory?.name ||
                                                                        'Selected service'}
                                                                </Text>


                                                                {!configured ? (

                                                                    <Text
                                                                        style={
                                                                            styles.requiredLabel
                                                                        }
                                                                    >
                                                                        Price & duration required
                                                                    </Text>

                                                                ) : (

                                                                    <Text
                                                                        style={
                                                                            styles.completedLabel
                                                                        }
                                                                    >
                                                                        ✓ Completed
                                                                    </Text>

                                                                )}

                                                            </View>

                                                        </View>


                                                        {/* PRICE + DURATION */}

                                                        <View
                                                            style={
                                                                styles.fieldsRow
                                                            }
                                                        >

                                                            {/* PRICE */}

                                                            <View
                                                                style={
                                                                    styles.fieldContainer
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.fieldLabel
                                                                    }
                                                                >
                                                                    Price *
                                                                </Text>


                                                                <View
                                                                    style={
                                                                        styles.inputWithPrefix
                                                                    }
                                                                >

                                                                    <Text
                                                                        style={
                                                                            styles.prefix
                                                                        }
                                                                    >
                                                                        ₹
                                                                    </Text>


                                                                    <TextInput
                                                                        value={
                                                                            service.price !==
                                                                                undefined
                                                                                ? String(
                                                                                    service.price,
                                                                                )
                                                                                : ''
                                                                        }
                                                                        onChangeText={
                                                                            value =>
                                                                                updateService(
                                                                                    service.subcategoryId,
                                                                                    'price',
                                                                                    value,
                                                                                )
                                                                        }
                                                                        placeholder="0"
                                                                        placeholderTextColor={
                                                                            COLORS.textSecondary
                                                                        }
                                                                        keyboardType="number-pad"
                                                                        style={
                                                                            styles.serviceInput
                                                                        }
                                                                        maxLength={6}
                                                                    />

                                                                </View>

                                                            </View>


                                                            {/* DURATION */}

                                                            <View
                                                                style={
                                                                    styles.fieldContainer
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.fieldLabel
                                                                    }
                                                                >
                                                                    Duration *
                                                                </Text>


                                                                <View
                                                                    style={
                                                                        styles.inputWithSuffix
                                                                    }
                                                                >

                                                                    <TextInput
                                                                        value={
                                                                            service.durationMinutes !==
                                                                                undefined
                                                                                ? String(
                                                                                    service.durationMinutes,
                                                                                )
                                                                                : ''
                                                                        }
                                                                        onChangeText={
                                                                            value =>
                                                                                updateService(
                                                                                    service.subcategoryId,
                                                                                    'durationMinutes',
                                                                                    value,
                                                                                )
                                                                        }
                                                                        placeholder="30"
                                                                        placeholderTextColor={
                                                                            COLORS.textSecondary
                                                                        }
                                                                        keyboardType="number-pad"
                                                                        style={
                                                                            styles.serviceInput
                                                                        }
                                                                        maxLength={3}
                                                                    />


                                                                    <Text
                                                                        style={
                                                                            styles.suffix
                                                                        }
                                                                    >
                                                                        min
                                                                    </Text>

                                                                </View>

                                                            </View>

                                                        </View>

                                                    </View>
                                                );
                                            },
                                        )}


                                        {/* CATEGORY BULK DURATION */}

                                        <CategoryDurationInput
                                            onApply={
                                                duration =>
                                                    applyDurationToCategory(
                                                        category.categoryId,
                                                        duration,
                                                    )
                                            }
                                        />

                                    </View>

                                )}

                            </View>
                        );
                    },
                )}


                {/* ================================================= */}
                {/* INFORMATION */}
                {/* ================================================= */}

                <View
                    style={styles.infoCard}
                >

                    <Text
                        style={styles.infoTitle}
                    >
                        💡 You can edit these later
                    </Text>

                    <Text
                        style={styles.infoText}
                    >
                        Your service prices and durations can
                        be changed later from your salon profile.
                        You can also configure whether each
                        service is available at your salon,
                        at the customer's home, or both.
                    </Text>

                </View>


                <View
                    style={styles.bottomSpace}
                />

            </ScrollView>


            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <View
                style={styles.footer}
            >

                {!allConfigured && (

                    <Text
                        style={
                            styles.footerWarning
                        }
                    >
                        Complete all {remainingCount}{' '}
                        remaining{' '}
                        {remainingCount === 1
                            ? 'service'
                            : 'services'}{' '}
                        before continuing.
                    </Text>

                )}


                <DButton
                    onPress={handleContinue}
                    disabled={
                        !allConfigured ||
                        saving
                    }
                    loading={saving}
                >
                    Continue
                </DButton>

            </View>

        </SafeAreaView>
    );
};


// ============================================================
// CATEGORY DURATION INPUT
// ============================================================

const CategoryDurationInput = ({
    onApply,
}: {
    onApply: (duration: string) => void;
}) => {

    const [
        duration,
        setDuration,
    ] = useState('');


    return (
        <View
            style={
                styles.categoryBulkContainer
            }
        >

            <Text
                style={
                    styles.categoryBulkLabel
                }
            >
                Apply same duration to this category
            </Text>


            <View
                style={
                    styles.categoryBulkRow
                }
            >

                <TextInput
                    value={duration}
                    onChangeText={
                        value =>
                            setDuration(
                                value.replace(
                                    /[^0-9]/g,
                                    '',
                                ),
                            )
                    }
                    placeholder="30"
                    placeholderTextColor={
                        COLORS.textSecondary
                    }
                    keyboardType="number-pad"
                    style={
                        styles.categoryDurationInput
                    }
                    maxLength={3}
                />


                <Text
                    style={
                        styles.categoryMinutes
                    }
                >
                    min
                </Text>


                <TouchableOpacity
                    style={
                        styles.categoryApplyButton
                    }
                    onPress={() =>
                        onApply(duration)
                    }
                >

                    <Text
                        style={
                            styles.categoryApplyText
                        }
                    >
                        Apply
                    </Text>

                </TouchableOpacity>

            </View>

        </View>
    );
};


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        paddingHorizontal: SPACING.large,
        paddingTop: SPACING.large,
        paddingBottom: SPACING.xl,
    },

    title: {
        fontFamily: FONTS.bold,
        fontSize: 24,
        color: COLORS.black,
        marginBottom: SPACING.small,
    },

    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: 14,
        lineHeight: 21,
        color: COLORS.textSecondary,
        marginBottom: SPACING.large,
    },

    progressCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.large,
        padding: SPACING.medium,
        marginBottom: SPACING.medium,
    },

    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.medium,
    },

    progressTitle: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.black,
    },

    progressSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 3,
    },

    progressPercentage: {
        fontFamily: FONTS.bold,
        fontSize: 20,
        color: COLORS.primary,
    },

    progressTrack: {
        height: 8,
        backgroundColor: '#E8E8E8',
        borderRadius: 10,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 10,
    },

    remainingText: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        color: '#C77700',
        marginTop: SPACING.small,
    },

    completedText: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        color: COLORS.primary,
        marginTop: SPACING.small,
    },

    bulkCard: {
        backgroundColor: '#F3FAF9',
        borderRadius: RADIUS.large,
        padding: SPACING.medium,
        marginBottom: SPACING.medium,
        borderWidth: 1,
        borderColor: '#D8EFEC',
    },

    bulkTitle: {
        fontFamily: FONTS.bold,
        fontSize: 15,
        color: COLORS.black,
        marginBottom: 4,
    },

    bulkSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.textSecondary,
        marginBottom: SPACING.medium,
    },

    bulkRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    bulkInput: {
        width: 75,
        height: 44,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#D5D5D5',
        borderRadius: RADIUS.medium,
        paddingHorizontal: 12,
        fontFamily: FONTS.medium,
        fontSize: 15,
        color: COLORS.black,
        textAlign: 'center',
    },

    minutesText: {
        fontFamily: FONTS.medium,
        fontSize: 13,
        color: COLORS.textSecondary,
        marginHorizontal: 8,
    },

    applyButton: {
        height: 44,
        paddingHorizontal: 16,
        borderRadius: RADIUS.medium,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },

    applyButtonText: {
        fontFamily: FONTS.medium,
        fontSize: 13,
        color: COLORS.white,
    },

    searchContainer: {
        marginBottom: SPACING.medium,
    },

    searchInput: {
        height: 48,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: RADIUS.medium,
        paddingHorizontal: 15,
        fontFamily: FONTS.regular,
        fontSize: 14,
        color: COLORS.black,
    },

    categoryCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.large,
        marginBottom: SPACING.medium,
        overflow: 'hidden',
    },

    categoryHeader: {
        minHeight: 66,
        paddingHorizontal: SPACING.medium,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    categoryHeaderLeft: {
        flex: 1,
    },

    categoryName: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.black,
    },

    categoryCount: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },

    categoryArrow: {
        fontFamily: FONTS.bold,
        fontSize: 25,
        color: COLORS.primary,
        marginLeft: 12,
    },

    servicesContainer: {
        paddingHorizontal: SPACING.medium,
        paddingBottom: SPACING.medium,
    },

    serviceCard: {
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingVertical: SPACING.medium,
    },

    serviceCardIncomplete: {
        backgroundColor: '#FFFDF8',
        marginHorizontal: -SPACING.small,
        paddingHorizontal: SPACING.small,
        borderRadius: RADIUS.medium,
    },

    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.small,
    },

    serviceTitleContainer: {
        flex: 1,
    },

    serviceName: {
        fontFamily: FONTS.medium,
        fontSize: 15,
        color: COLORS.black,
    },

    requiredLabel: {
        fontFamily: FONTS.regular,
        fontSize: 11,
        color: '#C77700',
        marginTop: 3,
    },

    completedLabel: {
        fontFamily: FONTS.regular,
        fontSize: 11,
        color: COLORS.primary,
        marginTop: 3,
    },

    fieldsRow: {
        flexDirection: 'row',
        gap: 10,
    },

    fieldContainer: {
        flex: 1,
    },

    fieldLabel: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 5,
    },

    inputWithPrefix: {
        height: 46,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#D7D7D7',
        borderRadius: RADIUS.medium,
    },

    inputWithSuffix: {
        height: 46,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#D7D7D7',
        borderRadius: RADIUS.medium,
    },

    prefix: {
        fontFamily: FONTS.medium,
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 12,
    },

    suffix: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginRight: 10,
    },

    serviceInput: {
        flex: 1,
        height: 44,
        paddingHorizontal: 8,
        fontFamily: FONTS.medium,
        fontSize: 14,
        color: COLORS.black,
    },

    categoryBulkContainer: {
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: SPACING.medium,
        marginTop: 4,
    },

    categoryBulkLabel: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 7,
    },

    categoryBulkRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    categoryDurationInput: {
        width: 65,
        height: 40,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#D5D5D5',
        borderRadius: RADIUS.medium,
        textAlign: 'center',
        fontFamily: FONTS.medium,
        fontSize: 13,
        color: COLORS.black,
    },

    categoryMinutes: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginHorizontal: 7,
    },

    categoryApplyButton: {
        height: 40,
        paddingHorizontal: 15,
        borderRadius: RADIUS.medium,
        backgroundColor: '#E8F6F4',
        justifyContent: 'center',
        alignItems: 'center',
    },

    categoryApplyText: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        color: COLORS.primary,
    },

    infoCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.large,
        padding: SPACING.medium,
        marginTop: SPACING.small,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },

    infoTitle: {
        fontFamily: FONTS.bold,
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 6,
    },

    infoText: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.textSecondary,
    },

    footer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.large,
        paddingTop: SPACING.small,
        paddingBottom: SPACING.medium,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },

    footerWarning: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: '#C77700',
        textAlign: 'center',
        marginBottom: 8,
    },

    bottomSpace: {
        height: 20,
    },

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.large,
    },

    loadingText: {
        fontFamily: FONTS.regular,
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: SPACING.medium,
    },

    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.large,
    },

    errorTitle: {
        fontFamily: FONTS.bold,
        fontSize: 18,
        color: COLORS.black,
        textAlign: 'center',
    },

    errorText: {
        fontFamily: FONTS.regular,
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },

    errorButton: {
        marginTop: SPACING.large,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: RADIUS.medium,
        backgroundColor: COLORS.primary,
    },

    errorButtonText: {
        fontFamily: FONTS.medium,
        fontSize: 14,
        color: COLORS.white,
    },

    emptyContainer: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.large,
        padding: SPACING.large,
        alignItems: 'center',
        marginBottom: SPACING.medium,
    },

    emptyTitle: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.black,
    },

    emptyText: {
        fontFamily: FONTS.regular,
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 6,
    },

    goBackButton: {
        marginTop: SPACING.medium,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: RADIUS.medium,
        backgroundColor: COLORS.primary,
    },

    goBackButtonText: {
        fontFamily: FONTS.medium,
        fontSize: 13,
        color: COLORS.white,
    },
});


export default ConfigureSalonServices;

