import React, {
    useMemo,
    useState,
    useCallback,
    useEffect,
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
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

import { useQuery } from '@apollo/client';

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
// EXTENDED SERVICE TYPE
// ============================================================

type ConfiguredSalonService =
    SalonServiceSelection & {
        uniqueId?: string;
        businessTypeId?: string;
        name: string;
        description?: string;
    };


// ============================================================
// SERVICE ROW
// ============================================================
//
// Keeping the original index is important.
//
// We do NOT identify a service only by name/category/audience.
// Two services can legitimately have the same name.
//
// The index is used only for updating the current registration
// array safely.
//

type ServiceRow = {
    service: ConfiguredSalonService;
    originalIndex: number;
};


// ============================================================
// HELPERS
// ============================================================

const getRawServiceName = (
    service: ConfiguredSalonService,
): string => {

    return String(
        service.name ?? '',
    );

};


const getCleanServiceName = (
    service: ConfiguredSalonService,
): string => {

    return getRawServiceName(
        service,
    )
        .trim()
        .replace(/\s+/g, ' ');

};


const normalizeServiceName = (
    value: string,
): string => {

    return String(
        value ?? '',
    )
        .replace(/\s+/g, ' ')
        .trim();

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
    // LOCAL SERVICE NAME DRAFTS
    // ========================================================
    //
    // IMPORTANT:
    //
    // Text inputs are NOT bound directly to the global
    // registration context while typing.
    //
    // This prevents the entire screen from re-rendering on
    // every keystroke.
    //
    // Example:
    //
    // draftNames["0"] = "Hair Cut"
    //
    // The value is committed to context when the field blurs.
    //

    const [
        draftNames,
        setDraftNames,
    ] = useState<Record<string, string>>({});


    // ========================================================
    // GRAPHQL
    // ========================================================

    const {
        data: categoryResponse,
        loading: categoriesLoading,
        error: categoriesError,
    } = useQuery(
        GET_CLAVATA_CATEGORIES,
        {
            fetchPolicy: 'network-only',
        },
    );


    const {
        data: subcategoryResponse,
        loading: subcategoriesLoading,
        error: subcategoriesError,
    } = useQuery(
        GET_CLAVATA_SUBCATEGORIES,
        {
            fetchPolicy: 'network-only',
        },
    );


    // ========================================================
    // CATEGORIES
    // ========================================================

    const categories: Category[] =
        useMemo(
            () => {

                const rawCategories =
                    categoryResponse
                        ?.categories
                        ?.categories ||
                    [];


                const unique =
                    new Map<string, Category>();


                rawCategories.forEach(
                    (category: Category) => {

                        if (
                            category?.categoryId &&
                            !unique.has(
                                String(
                                    category.categoryId,
                                ),
                            )
                        ) {

                            unique.set(
                                String(
                                    category.categoryId,
                                ),
                                category,
                            );

                        }

                    },
                );


                return Array.from(
                    unique.values(),
                ).sort(
                    (
                        a,
                        b,
                    ) =>
                        a.name.localeCompare(
                            b.name,
                            undefined,
                            {
                                sensitivity:
                                    'base',
                            },
                        ),
                );

            },
            [
                categoryResponse,
            ],
        );


    // ========================================================
    // SUBCATEGORIES
    // ========================================================

    const subcategories: Subcategory[] =
        useMemo(
            () => {

                const rawSubcategories =
                    subcategoryResponse
                        ?.subcategories
                        ?.subcategories ||
                    [];


                const unique =
                    new Map<
                        string,
                        Subcategory
                    >();


                rawSubcategories.forEach(
                    (
                        subcategory: Subcategory,
                    ) => {

                        if (
                            !subcategory?.subcategoryId
                        ) {

                            return;

                        }


                        const key =
                            `${subcategory.categoryId}::${subcategory.subcategoryId}`;


                        if (
                            !unique.has(
                                key,
                            )
                        ) {

                            unique.set(
                                key,
                                subcategory,
                            );

                        }

                    },
                );


                return Array.from(
                    unique.values(),
                ).sort(
                    (
                        a,
                        b,
                    ) =>
                        a.name.localeCompare(
                            b.name,
                            undefined,
                            {
                                sensitivity:
                                    'base',
                            },
                        ),
                );

            },
            [
                subcategoryResponse,
            ],
        );


    // ========================================================
    // SELECTED SERVICES
    // ========================================================

    const selectedServices:
        ConfiguredSalonService[] =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        data?.serviceSelections,
                    )
                ) {

                    return [];

                }


                return (
                    data.serviceSelections as ConfiguredSalonService[]
                );

            },
            [
                data?.serviceSelections,
            ],
        );


    // ========================================================
    // INITIALIZE LOCAL NAME DRAFTS
    // ========================================================
    //
    // When the screen opens, copy existing saved names into
    // local state.
    //
    // This also preserves names when coming back to this page.
    //

    useEffect(
        () => {

            setDraftNames(
                previous => {

                    const next = {
                        ...previous,
                    };


                    selectedServices.forEach(
                        (
                            service,
                            index,
                        ) => {

                            if (
                                next[
                                    String(index)
                                ] ===
                                undefined
                            ) {

                                next[
                                    String(index)
                                ] =
                                    getRawServiceName(
                                        service,
                                    );

                            }

                        },
                    );


                    const validKeys =
                        new Set(
                            selectedServices.map(
                                (
                                    _,
                                    index,
                                ) =>
                                    String(
                                        index,
                                    ),
                            ),
                        );


                    Object.keys(
                        next,
                    ).forEach(
                        key => {

                            if (
                                !validKeys.has(
                                    key,
                                )
                            ) {

                                delete next[
                                    key
                                ];

                            }

                        },
                    );


                    return next;

                },
            );

        },
        [
            selectedServices.length,
        ],
    );


    // ========================================================
    // SERVICE LOOKUP
    // ========================================================

    const getSubcategory =
        useCallback(
            (
                subcategoryId: string,
            ) => {

                return subcategories.find(
                    subcategory =>
                        String(
                            subcategory.subcategoryId,
                        ) ===
                        String(
                            subcategoryId,
                        ),
                );

            },
            [
                subcategories,
            ],
        );


    // ========================================================
    // SERVICE NAME FOR INPUT
    // ========================================================

    const getServiceName =
        useCallback(
            (
                service: ConfiguredSalonService,
                originalIndex: number,
            ) => {

                const localValue =
                    draftNames[
                        String(
                            originalIndex,
                        )
                    ];


                if (
                    localValue !==
                    undefined
                ) {

                    return localValue;

                }


                return getRawServiceName(
                    service,
                );

            },
            [
                draftNames,
            ],
        );


    // ========================================================
    // SERVICE KEY
    // ========================================================
    //
    // Only used for React rendering.
    //
    // We deliberately do NOT use this key to decide which
    // service gets updated.
    //

    const getRenderKey =
        useCallback(
            (
                service: ConfiguredSalonService,
                index: number,
            ) => {

                if (
                    service.uniqueId
                ) {

                    return String(
                        service.uniqueId,
                    );

                }


                if (
                    (service as any).serviceKey
                ) {

                    return String(
                        (service as any).serviceKey,
                    ) + `::${index}`;

                }


                if (
                    (service as any).id
                ) {

                    return String(
                        (service as any).id,
                    ) + `::${index}`;

                }


                return [
                    service.categoryId,
                    service.subcategoryId,
                    service.audience,
                    index,
                ].join('::');

            },
            [],
        );


    // ========================================================
    // GROUP SERVICES BY CATEGORY
    // ========================================================

    const servicesByCategory =
        useMemo(
            () => {

                const grouped:
                    Record<
                        string,
                        ServiceRow[]
                    > = {};


                selectedServices.forEach(
                    (
                        service,
                        originalIndex,
                    ) => {

                        const categoryId =
                            String(
                                service.categoryId ?? '',
                            );


                        if (
                            !categoryId
                        ) {

                            return;

                        }


                        if (
                            !grouped[
                                categoryId
                            ]
                        ) {

                            grouped[
                                categoryId
                            ] = [];

                        }


                        grouped[
                            categoryId
                        ].push({
                            service,
                            originalIndex,
                        });

                    },
                );


                Object.keys(
                    grouped,
                ).forEach(
                    categoryId => {

                        grouped[
                            categoryId
                        ].sort(
                            (
                                a,
                                b,
                            ) => {

                                const aName =
                                    getCleanServiceName(
                                        a.service,
                                    );


                                const bName =
                                    getCleanServiceName(
                                        b.service,
                                    );


                                /*
                                 * Keep incomplete services first.
                                 *
                                 * This is more useful during setup because
                                 * the user immediately sees what still needs
                                 * to be completed.
                                 */

                                if (
                                    !aName &&
                                    bName
                                ) {

                                    return -1;

                                }


                                if (
                                    aName &&
                                    !bName
                                ) {

                                    return 1;

                                }


                                if (
                                    aName &&
                                    bName
                                ) {

                                    return aName.localeCompare(
                                        bName,
                                        undefined,
                                        {
                                            sensitivity:
                                                'base',
                                        },
                                    );

                                }


                                return (
                                    a.originalIndex -
                                    b.originalIndex
                                );

                            },
                        );

                    },
                );


                return grouped;

            },
            [
                selectedServices,
            ],
        );


    // ========================================================
    // FILTER CATEGORIES
    // ========================================================

    const filteredCategories =
        useMemo(
            () => {

                const search =
                    searchText
                        .trim()
                        .toLowerCase();


                return categories.filter(
                    category => {

                        const rows =
                            servicesByCategory[
                                category.categoryId
                            ] ||
                            [];


                        if (
                            rows.length ===
                            0
                        ) {

                            return false;

                        }


                        if (
                            !search
                        ) {

                            return true;

                        }


                        const categoryMatches =
                            category.name
                                .toLowerCase()
                                .includes(
                                    search,
                                );


                        const serviceMatches =
                            rows.some(
                                row => {

                                    const name =
                                        getCleanServiceName(
                                            row.service,
                                        );


                                    const subcategory =
                                        getSubcategory(
                                            row.service.subcategoryId,
                                        );


                                    const subcategoryName =
                                        String(
                                            subcategory?.name ||
                                            row.service.subcategoryName ||
                                            '',
                                        )
                                            .toLowerCase();


                                    return (
                                        (
                                            !!name &&
                                            name
                                                .toLowerCase()
                                                .includes(
                                                    search,
                                                )
                                        ) ||
                                        subcategoryName.includes(
                                            search,
                                        )
                                    );

                                },
                            );


                        return (
                            categoryMatches ||
                            serviceMatches
                        );

                    },
                );

            },
            [
                categories,
                searchText,
                servicesByCategory,
                getSubcategory,
            ],
        );


    // ========================================================
    // SERVICE CONFIGURATION STATUS
    // ========================================================

    const isServiceConfigured =
        useCallback(
            (
                service:
                    ConfiguredSalonService,
            ) => {

                const serviceName =
                    getCleanServiceName(
                        service,
                    );


                const validName =
                    !!serviceName;


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
                    validName &&
                    validPrice &&
                    validDuration
                );

            },
            [],
        );


    // ========================================================
    // COUNTS
    // ========================================================

    const configuredCount =
        useMemo(
            () => {

                return selectedServices.filter(
                    isServiceConfigured,
                ).length;

            },
            [
                selectedServices,
                isServiceConfigured,
            ],
        );


    const totalCount =
        selectedServices.length;


    const remainingCount =
        totalCount -
        configuredCount;


    const allConfigured =
        totalCount > 0 &&
        configuredCount ===
        totalCount;


    // ========================================================
    // PROGRESS
    // ========================================================

    const progressPercentage =
        totalCount > 0
            ? Math.round(
                (
                    configuredCount /
                    totalCount
                ) * 100,
            )
            : 0;


    // ========================================================
    // UPDATE SERVICE BY INDEX
    // ========================================================
    //
    // IMPORTANT:
    //
    // The update is now performed by the service's original
    // array index.
    //
    // We do NOT use serviceKey matching here.
    //
    // This prevents duplicate/legacy service keys from causing
    // multiple inputs to change at the same time.
    //

    const updateServiceByIndex =
        useCallback(
            (
                serviceIndex: number,
                field:
                    | 'name'
                    | 'price'
                    | 'durationMinutes',
                value: string,
            ) => {

                const updatedSelections =
                    selectedServices.map(
                        (
                            currentService,
                            currentIndex,
                        ) => {

                            if (
                                currentIndex !==
                                serviceIndex
                            ) {

                                return currentService;

                            }


                            if (
                                field ===
                                'name'
                            ) {

                                return {
                                    ...currentService,
                                    name:
                                        value,
                                };

                            }


                            const cleanedValue =
                                value.replace(
                                    /[^0-9]/g,
                                    '',
                                );


                            return {
                                ...currentService,

                                [field]:
                                    cleanedValue ===
                                        ''
                                        ? undefined
                                        : Number(
                                            cleanedValue,
                                        ),
                            };

                        },
                    );


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
    // HANDLE SERVICE NAME CHANGE
    // ========================================================
    //
    // This only updates local state.
    //
    // The global registration data does NOT update on every
    // keystroke.
    //

    const handleServiceNameChange =
        useCallback(
            (
                serviceIndex: number,
                value: string,
            ) => {

                setDraftNames(
                    previous => ({
                        ...previous,
                        [String(
                            serviceIndex,
                        )]:
                            value,
                    }),
                );

            },
            [],
        );


    // ========================================================
    // HANDLE SERVICE NAME BLUR
    // ========================================================

    const handleServiceNameBlur =
        useCallback(
            (
                serviceIndex: number,
            ) => {

                const rawName =
                    draftNames[
                        String(
                            serviceIndex,
                        )
                    ] ??
                    '';


                const normalizedName =
                    normalizeServiceName(
                        rawName,
                    );


                setDraftNames(
                    previous => ({
                        ...previous,
                        [String(
                            serviceIndex,
                        )]:
                            normalizedName,
                    }),
                );


                /*
                 * Commit only after the user has finished editing.
                 */

                updateServiceByIndex(
                    serviceIndex,
                    'name',
                    normalizedName,
                );

            },
            [
                draftNames,
                updateServiceByIndex,
            ],
        );


    // ========================================================
    // ADD ANOTHER SERVICE
    // ========================================================
    //
    // A new service may only be added after the current service
    // has a valid price AND duration.
    //

    const addAnotherService =
        useCallback(
            (
                service:
                    ConfiguredSalonService,
                serviceIndex: number,
            ) => {

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


                if (
                    !validPrice ||
                    !validDuration
                ) {

                    Alert.alert(
                        'Complete this service first',
                        'Please enter the price and duration before adding another service.',
                    );

                    return;

                }


                const newService:
                    ConfiguredSalonService = {

                    ...service,

                    uniqueId:
                        `LOCAL-${Date.now()}-${Math.random()
                            .toString(36)
                            .substring(2, 9)}`,

                    name: '',

                    description: '',

                    price:
                        undefined,

                    durationMinutes:
                        undefined,

                };


                const updatedSelections =
                    [
                        ...selectedServices,
                    ];


                updatedSelections.splice(
                    serviceIndex + 1,
                    0,
                    newService,
                );


                updateData({
                    serviceSelections:
                        updatedSelections,
                });


                setExpandedCategories(
                    previous => ({
                        ...previous,
                        [
                            service.categoryId
                        ]:
                            true,
                    }),
                );

            },
            [
                selectedServices,
                updateData,
            ],
        );


    // ========================================================
    // REMOVE SERVICE
    // ========================================================

    const removeService =
        useCallback(
            (
                service:
                    ConfiguredSalonService,
                serviceIndex: number,
            ) => {

                if (
                    selectedServices.length <=
                    1
                ) {

                    Alert.alert(
                        'Cannot remove service',
                        'At least one service is required.',
                    );

                    return;

                }


                const serviceName =
                    getCleanServiceName(
                        service,
                    );


                const displayName =
                    serviceName ||
                    getSubcategory(
                        service.subcategoryId,
                    )?.name ||
                    'this service';


                Alert.alert(
                    'Remove service',
                    `Remove "${displayName}"?`,
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => {

                                const updatedSelections =
                                    selectedServices.filter(
                                        (
                                            _,
                                            index,
                                        ) =>
                                            index !==
                                            serviceIndex,
                                    );


                                updateData({
                                    serviceSelections:
                                        updatedSelections,
                                });


                                setDraftNames(
                                    previous => {

                                        const next = {
                                            ...previous,
                                        };


                                        delete next[
                                            String(
                                                serviceIndex,
                                            )
                                        ];


                                        /*
                                         * Re-index drafts after removal.
                                         */

                                        const reindexed:
                                            Record<
                                                string,
                                                string
                                            > = {};


                                        Object.keys(
                                            next,
                                        ).forEach(
                                            key => {

                                                const oldIndex =
                                                    Number(
                                                        key,
                                                    );


                                                if (
                                                    oldIndex <
                                                    serviceIndex
                                                ) {

                                                    reindexed[
                                                        String(
                                                            oldIndex,
                                                        )
                                                    ] =
                                                        next[
                                                            key
                                                        ];

                                                } else if (
                                                    oldIndex >
                                                    serviceIndex
                                                ) {

                                                    reindexed[
                                                        String(
                                                            oldIndex -
                                                            1,
                                                        )
                                                    ] =
                                                        next[
                                                            key
                                                        ];

                                                }

                                            },
                                        );


                                        return reindexed;

                                    },
                                );

                            },
                        },
                    ],
                );

            },
            [
                selectedServices,
                updateData,
                getSubcategory,
            ],
        );


    // ========================================================
    // TOGGLE CATEGORY
    // ========================================================

    const toggleCategory =
        useCallback(
            (
                categoryId: string,
            ) => {

                setExpandedCategories(
                    previous => ({
                        ...previous,
                        [categoryId]:
                            !previous[
                                categoryId
                            ],
                    }),
                );

            },
            [],
        );


    // ========================================================
    // APPLY DURATION TO ALL SERVICES
    // ========================================================

    const applyDurationToAll =
        useCallback(
            () => {

                Keyboard.dismiss();


                const cleaned =
                    defaultDuration.replace(
                        /[^0-9]/g,
                        '',
                    );


                const duration =
                    Number(
                        cleaned,
                    );


                if (
                    !cleaned ||
                    !Number.isFinite(
                        duration,
                    ) ||
                    duration <= 0
                ) {

                    Alert.alert(
                        'Invalid duration',
                        'Please enter a valid duration in minutes.',
                    );

                    return;

                }


                const updatedSelections =
                    selectedServices.map(
                        service => ({
                            ...service,
                            durationMinutes:
                                duration,
                        }),
                    );


                updateData({
                    serviceSelections:
                        updatedSelections,
                });


                Alert.alert(
                    'Duration applied',
                    `${duration} minutes has been applied to all selected services.`,
                );

            },
            [
                defaultDuration,
                selectedServices,
                updateData,
            ],
        );


    // ========================================================
    // APPLY DURATION TO CATEGORY
    // ========================================================

    const applyDurationToCategory =
        useCallback(
            (
                categoryId: string,
                durationText: string,
            ) => {

                Keyboard.dismiss();


                const cleaned =
                    durationText.replace(
                        /[^0-9]/g,
                        '',
                    );


                const duration =
                    Number(
                        cleaned,
                    );


                if (
                    !cleaned ||
                    !Number.isFinite(
                        duration,
                    ) ||
                    duration <= 0
                ) {

                    Alert.alert(
                        'Invalid duration',
                        'Please enter a valid duration in minutes.',
                    );

                    return;

                }


                const updatedSelections =
                    selectedServices.map(
                        service => {

                            if (
                                String(
                                    service.categoryId,
                                ) !==
                                String(
                                    categoryId,
                                )
                            ) {

                                return service;

                            }


                            return {
                                ...service,
                                durationMinutes:
                                    duration,
                            };

                        },
                    );


                const matchedCount =
                    selectedServices.filter(
                        service =>
                            String(
                                service.categoryId,
                            ) ===
                            String(
                                categoryId,
                            ),
                    ).length;


                if (
                    matchedCount ===
                    0
                ) {

                    Alert.alert(
                        'Unable to apply duration',
                        'No selected services were found in this category.',
                    );

                    return;

                }


                updateData({
                    serviceSelections:
                        updatedSelections,
                });


                Alert.alert(
                    'Duration applied',
                    `${duration} minutes has been applied to ${matchedCount} selected ${
                        matchedCount === 1
                            ? 'service'
                            : 'services'
                    } in this category.`,
                );

            },
            [
                selectedServices,
                updateData,
            ],
        );


    // ========================================================
    // CONTINUE
    // ========================================================

    const handleContinue =
        useCallback(
            () => {

                Keyboard.dismiss();


                /*
                 * Commit any local name drafts before validation.
                 *
                 * This protects against a user typing a name and
                 * immediately pressing Continue without manually
                 * leaving the field first.
                 */

                const committedSelections =
                    selectedServices.map(
                        (
                            service,
                            index,
                        ) => {

                            const draft =
                                draftNames[
                                    String(
                                        index,
                                    )
                                ];


                            if (
                                draft ===
                                undefined
                            ) {

                                return service;

                            }


                            return {
                                ...service,
                                name:
                                    normalizeServiceName(
                                        draft,
                                    ),
                            };

                        },
                    );


                updateData({
                    serviceSelections:
                        committedSelections,
                });


                if (
                    committedSelections.length ===
                    0
                ) {

                    Alert.alert(
                        'Services required',
                        'Please select at least one service.',
                    );

                    return;

                }


                const incompleteServices =
                    committedSelections.filter(
                        service =>
                            !isServiceConfigured(
                                service,
                            ),
                    );


                if (
                    incompleteServices.length >
                    0
                ) {

                    const serviceWord =
                        incompleteServices.length ===
                            1
                            ? 'service'
                            : 'services';


                    Alert.alert(
                        'Complete service details',
                        `Please enter a service name, valid price and duration for all selected services. ${incompleteServices.length} ${serviceWord} still need to be completed.`,
                    );

                    return;

                }


                setSaving(true);


                setTimeout(
                    () => {

                        setSaving(false);


                        navigation.navigate(
                            'ServiceReview',
                        );

                    },
                    250,
                );

            },
            [
                selectedServices,
                draftNames,
                updateData,
                isServiceConfigured,
                navigation,
            ],
        );


    // ========================================================
    // LOADING
    // ========================================================

    const loading =
        categoriesLoading ||
        subcategoriesLoading;


    if (
        loading
    ) {

        return (
            <SafeAreaView
                style={
                    styles.container
                }
            >

                <Header
                    headerTitle="Configure Services"
                    backBtn={() =>
                        navigation.goBack()
                    }
                />

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
                style={
                    styles.container
                }
            >

                <Header
                    headerTitle="Configure Services"
                    backBtn={() =>
                        navigation.goBack()
                    }
                />

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
                        Please go back and try again.
                    </Text>


                    <TouchableOpacity
                        style={
                            styles.errorButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >

                        <Text
                            style={
                                styles.errorButtonText
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
    // RENDER
    // ========================================================

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >

            <Header
                headerTitle="Configure Services"
                backBtn={() =>
                    navigation.goBack()
                }
            />


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

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.content
                    }
                >

                    {/* ================================================= */}
                    {/* TITLE */}
                    {/* ================================================= */}

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Set up your services
                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Enter the actual services you offer,
                        along with their price and typical
                        duration.
                    </Text>


                    {/* ================================================= */}
                    {/* PROGRESS */}
                    {/* ================================================= */}

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

                            <View
                                style={
                                    styles.progressHeaderLeft
                                }
                            >

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
                                {remainingCount ===
                                1
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

                    {totalCount > 1 && (

                        <View
                            style={
                                styles.bulkCard
                            }
                        >

                            <Text
                                style={
                                    styles.bulkTitle
                                }
                            >
                                Apply a common duration
                            </Text>


                            <Text
                                style={
                                    styles.bulkSubtitle
                                }
                            >
                                Useful when most of your services
                                take a similar amount of time.
                            </Text>


                            <View
                                style={
                                    styles.bulkRow
                                }
                            >

                                <TextInput
                                    value={
                                        defaultDuration
                                    }
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
                                    maxLength={
                                        3
                                    }
                                />


                                <Text
                                    style={
                                        styles.minutesText
                                    }
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
                                    activeOpacity={
                                        0.8
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
                    )}


                    {/* ================================================= */}
                    {/* SEARCH */}
                    {/* ================================================= */}

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
                            placeholder="Search category or service"
                            placeholderTextColor={
                                COLORS.textSecondary
                            }
                            style={
                                styles.searchInput
                            }
                            returnKeyType="search"
                            autoCorrect={
                                false
                            }
                            autoCapitalize="none"
                        />

                    </View>


                    {/* ================================================= */}
                    {/* EMPTY */}
                    {/* ================================================= */}

                    {totalCount ===
                        0 && (

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
                                Go back and select the service
                                categories your business provides.
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
                        (
                            category,
                        ) => {

                            const categoryRows =
                                servicesByCategory[
                                    category.categoryId
                                ] ||
                                [];


                            const search =
                                searchText
                                    .trim()
                                    .toLowerCase();


                            const visibleRows =
                                search
                                    ? categoryRows.filter(
                                        row => {

                                            const serviceName =
                                                getCleanServiceName(
                                                    row.service,
                                                );


                                            const subcategory =
                                                getSubcategory(
                                                    row.service.subcategoryId,
                                                );


                                            const subcategoryName =
                                                String(
                                                    subcategory?.name ||
                                                    row.service.subcategoryName ||
                                                    '',
                                                )
                                                    .toLowerCase();


                                            const categoryMatches =
                                                category.name
                                                    .toLowerCase()
                                                    .includes(
                                                        search,
                                                    );


                                            const serviceMatches =
                                                !!serviceName &&
                                                serviceName
                                                    .toLowerCase()
                                                    .includes(
                                                        search,
                                                    );


                                            const subcategoryMatches =
                                                subcategoryName.includes(
                                                    search,
                                                );


                                            return (
                                                categoryMatches ||
                                                serviceMatches ||
                                                subcategoryMatches
                                            );

                                        },
                                    )
                                    : categoryRows;


                            if (
                                visibleRows.length ===
                                0
                            ) {

                                return null;

                            }


                            const isOpen =
                                expandedCategories[
                                    category.categoryId
                                ] ??
                                true;


                            const categoryCompleted =
                                categoryRows.filter(
                                    row =>
                                        isServiceConfigured(
                                            row.service,
                                        ),
                                ).length;


                            return (
                                <View
                                    key={
                                        String(
                                            category.categoryId,
                                        )
                                    }
                                    style={
                                        styles.categoryCard
                                    }
                                >

                                    {/* CATEGORY HEADER */}

                                    <TouchableOpacity
                                        activeOpacity={
                                            0.75
                                        }
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
                                                    categoryCompleted
                                                }
                                                {' / '}
                                                {
                                                    categoryRows.length
                                                }
                                                {' completed'}
                                            </Text>

                                        </View>


                                        <View
                                            style={
                                                styles.categoryHeaderRight
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.categoryArrow
                                                }
                                            >
                                                {isOpen
                                                    ? '−'
                                                    : '+'}
                                            </Text>

                                        </View>

                                    </TouchableOpacity>


                                    {/* CATEGORY CONTENT */}

                                    {isOpen && (

                                        <View
                                            style={
                                                styles.servicesContainer
                                            }
                                        >

                                            {visibleRows.map(
                                                (
                                                    row,
                                                    visibleIndex,
                                                ) => {

                                                    const {
                                                        service,
                                                        originalIndex,
                                                    } = row;


                                                    const subcategory =
                                                        getSubcategory(
                                                            service.subcategoryId,
                                                        );


                                                    const configured =
                                                        isServiceConfigured(
                                                            service,
                                                        );


                                                    const serviceName =
                                                        getServiceName(
                                                            service,
                                                            originalIndex,
                                                        );


                                                    const renderKey =
                                                        getRenderKey(
                                                            service,
                                                            originalIndex,
                                                        );


                                                    const subcategoryName =
                                                        subcategory?.name ||
                                                        service.subcategoryName ||
                                                        'Service';


                                                    const audienceLabel =
                                                        service.audience ===
                                                            'FEMALE'
                                                            ? 'Women'
                                                            : service.audience ===
                                                                'MALE'
                                                                ? 'Men'
                                                                : 'Kids';


                                                    return (
                                                        <View
                                                            key={
                                                                renderKey
                                                            }
                                                            style={[
                                                                styles.serviceCard,
                                                                !configured &&
                                                                styles.serviceCardIncomplete,
                                                            ]}
                                                        >

                                                            {/* SERVICE CONTEXT */}

                                                            <View
                                                                style={
                                                                    styles.serviceContext
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
                                                                            visibleIndex +
                                                                            1
                                                                        }
                                                                    </Text>

                                                                </View>


                                                                <View
                                                                    style={
                                                                        styles.serviceContextText
                                                                    }
                                                                >

                                                                    <Text
                                                                        style={
                                                                            styles.subcategoryText
                                                                        }
                                                                    >
                                                                        {
                                                                            subcategoryName
                                                                        }
                                                                    </Text>


                                                                    <View
                                                                        style={
                                                                            styles.contextBottomRow
                                                                        }
                                                                    >

                                                                        <View
                                                                            style={
                                                                                styles.audienceBadge
                                                                            }
                                                                        >

                                                                            <Text
                                                                                style={
                                                                                    styles.audienceBadgeText
                                                                                }
                                                                            >
                                                                                {
                                                                                    audienceLabel
                                                                                }
                                                                            </Text>

                                                                        </View>

                                                                    </View>

                                                                </View>

                                                            </View>


                                                            {/* SERVICE NAME */}

                                                            <View
                                                                style={
                                                                    styles.nameFieldContainer
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.fieldLabel
                                                                    }
                                                                >
                                                                    Service name
                                                                    <Text
                                                                        style={
                                                                            styles.requiredAsterisk
                                                                        }
                                                                    >
                                                                        {' '}
                                                                        *
                                                                    </Text>
                                                                </Text>


                                                                <TextInput
                                                                    value={
                                                                        serviceName
                                                                    }
                                                                    onChangeText={
                                                                        value =>
                                                                            handleServiceNameChange(
                                                                                originalIndex,
                                                                                value,
                                                                            )
                                                                    }
                                                                    onBlur={() =>
                                                                        handleServiceNameBlur(
                                                                            originalIndex,
                                                                        )
                                                                    }
                                                                    placeholder="e.g. Hair Cut, Hair Color, Facial"
                                                                    placeholderTextColor={
                                                                        COLORS.textSecondary
                                                                    }
                                                                    style={[
                                                                        styles.nameInput,
                                                                        !serviceName.trim() &&
                                                                        styles.nameInputIncomplete,
                                                                    ]}
                                                                    maxLength={
                                                                        100
                                                                    }
                                                                    returnKeyType="done"
                                                                    autoCorrect={
                                                                        true
                                                                    }
                                                                    autoCapitalize="words"
                                                                    blurOnSubmit={
                                                                        false
                                                                    }
                                                                    textContentType="name"
                                                                    importantForAutofill="no"
                                                                    multiline={
                                                                        false
                                                                    }
                                                                />

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
                                                                        Price
                                                                        <Text
                                                                            style={
                                                                                styles.requiredAsterisk
                                                                            }
                                                                        >
                                                                            {' '}
                                                                            *
                                                                        </Text>
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
                                                                                    updateServiceByIndex(
                                                                                        originalIndex,
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
                                                                            maxLength={
                                                                                6
                                                                            }
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
                                                                        Duration
                                                                        <Text
                                                                            style={
                                                                                styles.requiredAsterisk
                                                                            }
                                                                        >
                                                                            {' '}
                                                                            *
                                                                        </Text>
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
                                                                                    updateServiceByIndex(
                                                                                        originalIndex,
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
                                                                            maxLength={
                                                                                3
                                                                            }
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


                                                            {/* STATUS */}

                                                            <View
                                                                style={
                                                                    styles.statusRow
                                                                }
                                                            >

                                                                {!configured ? (

                                                                    <Text
                                                                        style={
                                                                            styles.requiredLabel
                                                                        }
                                                                    >
                                                                        Complete name, price and duration
                                                                    </Text>

                                                                ) : (

                                                                    <Text
                                                                        style={
                                                                            styles.completedLabel
                                                                        }
                                                                    >
                                                                        ✓ Service ready
                                                                    </Text>

                                                                )}

                                                            </View>


                                                            {/* SERVICE ACTIONS */}

                                                            <View
                                                                style={
                                                                    styles.serviceActions
                                                                }
                                                            >

                                                                {(() => {

                                                                    const canAddAnother =
                                                                        typeof service.price ===
                                                                            'number' &&
                                                                        Number.isFinite(
                                                                            service.price,
                                                                        ) &&
                                                                        service.price > 0 &&
                                                                        typeof service.durationMinutes ===
                                                                            'number' &&
                                                                        Number.isFinite(
                                                                            service.durationMinutes,
                                                                        ) &&
                                                                        service.durationMinutes > 0;


                                                                    return (
                                                                        <TouchableOpacity
                                                                            activeOpacity={
                                                                                canAddAnother
                                                                                    ? 0.75
                                                                                    : 1
                                                                            }
                                                                            disabled={
                                                                                !canAddAnother
                                                                            }
                                                                            style={[
                                                                                styles.addServiceButton,
                                                                                !canAddAnother &&
                                                                                    styles.addServiceButtonDisabled,
                                                                            ]}
                                                                            onPress={() =>
                                                                                addAnotherService(
                                                                                    service,
                                                                                    originalIndex,
                                                                                )
                                                                            }
                                                                        >

                                                                            <Text
                                                                                style={[
                                                                                    styles.addServiceIcon,
                                                                                    !canAddAnother &&
                                                                                        styles.addServiceTextDisabled,
                                                                                ]}
                                                                            >
                                                                                +
                                                                            </Text>


                                                                            <Text
                                                                                style={[
                                                                                    styles.addServiceText,
                                                                                    !canAddAnother &&
                                                                                        styles.addServiceTextDisabled,
                                                                                ]}
                                                                            >
                                                                                Add another
                                                                            </Text>

                                                                        </TouchableOpacity>
                                                                    );

                                                                })()}


                                                                {selectedServices.length >
                                                                    1 && (

                                                                    <TouchableOpacity
                                                                        activeOpacity={
                                                                            0.75
                                                                        }
                                                                        style={
                                                                            styles.removeServiceButton
                                                                        }
                                                                        onPress={() =>
                                                                            removeService(
                                                                                service,
                                                                                originalIndex,
                                                                            )
                                                                        }
                                                                    >

                                                                        <Text
                                                                            style={
                                                                                styles.removeServiceText
                                                                            }
                                                                        >
                                                                            Remove
                                                                        </Text>

                                                                    </TouchableOpacity>

                                                                )}

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
                        style={
                            styles.infoCard
                        }
                    >

                        <Text
                            style={
                                styles.infoTitle
                            }
                        >
                            Service setup
                        </Text>


                        <Text
                            style={
                                styles.infoText
                            }
                        >
                            Enter the name customers will see when
                            booking this service. For example, use
                            “Hair Cut” or “Keratin Treatment” rather
                            than the category name.
                        </Text>


                        <Text
                            style={
                                styles.infoText
                            }
                        >
                            You can add multiple services under the
                            same subcategory and update your pricing
                            or duration later.
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


                    <TouchableOpacity
                        onPress={
                            handleContinue
                        }
                        disabled={
                            !allConfigured ||
                            saving
                        }
                        activeOpacity={
                            0.8
                        }
                        style={[
                            styles.continueButton,
                            (
                                !allConfigured ||
                                saving
                            ) &&
                            styles.continueButtonDisabled,
                        ]}
                    >

                        {saving ? (

                            <ActivityIndicator
                                size="small"
                                color={
                                    COLORS.white
                                }
                            />

                        ) : (

                            <Text
                                style={
                                    styles.continueButtonText
                                }
                            >
                                Continue
                            </Text>

                        )}

                    </TouchableOpacity>

                </View>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};


// ============================================================
// CATEGORY DURATION INPUT
// ============================================================

const CategoryDurationInput = ({
    onApply,
}: {
    onApply: (
        duration: string,
    ) => void;
}) => {

    const [
        duration,
        setDuration,
    ] = useState('');


    const handleApply =
        useCallback(
            () => {

                Keyboard.dismiss();

                onApply(
                    duration,
                );

            },
            [
                duration,
                onApply,
            ],
        );


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
                    value={
                        duration
                    }
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
                    maxLength={
                        3
                    }
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
                    onPress={
                        handleApply
                    }
                    activeOpacity={
                        0.75
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

const styles =
    StyleSheet.create({

        container: {
            flex: 1,
            backgroundColor:
                COLORS.background,
        },

        keyboardContainer: {
            flex: 1,
        },

        content: {
            paddingHorizontal:
                SPACING.large,
            paddingTop:
                SPACING.large,
            paddingBottom:
                SPACING.xl,
        },

        title: {
            fontFamily:
                FONTS.bold,
            fontSize: 23,
            color:
                COLORS.text,
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
            marginBottom:
                SPACING.large,
        },

        // ====================================================
        // PROGRESS
        // ====================================================

        progressCard: {
            backgroundColor:
                COLORS.white,
            borderRadius:
                RADIUS.large,
            padding:
                SPACING.medium,
            marginBottom:
                SPACING.medium,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
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

        progressHeaderLeft: {
            flex: 1,
        },

        progressTitle: {
            fontFamily:
                FONTS.bold,
            fontSize: 15,
            color:
                COLORS.text,
        },

        progressSubtitle: {
            fontFamily:
                FONTS.regular,
            fontSize: 12,
            color:
                COLORS.textSecondary,
            marginTop:
                3,
        },

        progressPercentage: {
            fontFamily:
                FONTS.bold,
            fontSize: 19,
            color:
                COLORS.themeColor,
        },

        progressTrack: {
            height: 7,
            backgroundColor:
                '#E8E8E8',
            borderRadius:
                10,
            overflow:
                'hidden',
        },

        progressFill: {
            height:
                '100%',
            backgroundColor:
                COLORS.themeColor,
            borderRadius:
                10,
        },

        remainingText: {
            fontFamily:
                FONTS.medium,
            fontSize: 11,
            color:
                '#C77700',
            marginTop:
                SPACING.small,
        },

        completedText: {
            fontFamily:
                FONTS.medium,
            fontSize: 11,
            color:
                COLORS.themeColor,
            marginTop:
                SPACING.small,
        },

        // ====================================================
        // BULK
        // ====================================================

        bulkCard: {
            backgroundColor:
                COLORS.white,
            borderRadius:
                RADIUS.large,
            padding:
                SPACING.medium,
            marginBottom:
                SPACING.medium,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
        },

        bulkTitle: {
            fontFamily:
                FONTS.bold,
            fontSize: 14,
            color:
                COLORS.text,
            marginBottom:
                4,
        },

        bulkSubtitle: {
            fontFamily:
                FONTS.regular,
            fontSize: 12,
            lineHeight: 17,
            color:
                COLORS.textSecondary,
            marginBottom:
                SPACING.medium,
        },

        bulkRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        bulkInput: {
            width:
                70,
            height:
                44,
            backgroundColor:
                COLORS.white,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
            borderRadius:
                RADIUS.medium,
            paddingHorizontal:
                10,
            fontFamily:
                FONTS.medium,
            fontSize:
                14,
            color:
                COLORS.text,
            textAlign:
                'center',
        },

        minutesText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                12,
            color:
                COLORS.textSecondary,
            marginHorizontal:
                8,
        },

        applyButton: {
            height:
                44,
            paddingHorizontal:
                15,
            borderRadius:
                RADIUS.medium,
            backgroundColor:
                COLORS.themeColor,
            justifyContent:
                'center',
            alignItems:
                'center',
            marginLeft:
                'auto',
        },

        applyButtonText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                12,
            color:
                COLORS.white,
        },

        // ====================================================
        // SEARCH
        // ====================================================

        searchContainer: {
            marginBottom:
                SPACING.medium,
        },

        searchInput: {
            height:
                48,
            backgroundColor:
                COLORS.white,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
            borderRadius:
                RADIUS.medium,
            paddingHorizontal:
                15,
            fontFamily:
                FONTS.regular,
            fontSize:
                14,
            color:
                COLORS.text,
        },

        // ====================================================
        // CATEGORY
        // ====================================================

        categoryCard: {
            backgroundColor:
                COLORS.white,
            borderRadius:
                RADIUS.large,
            marginBottom:
                SPACING.medium,
            overflow:
                'hidden',
            borderWidth:
                1,
            borderColor:
                COLORS.border,
        },

        categoryHeader: {
            minHeight:
                66,
            paddingHorizontal:
                SPACING.medium,
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
        },

        categoryHeaderLeft: {
            flex: 1,
        },

        categoryHeaderRight: {
            marginLeft:
                SPACING.medium,
        },

        categoryName: {
            fontFamily:
                FONTS.bold,
            fontSize:
                16,
            color:
                COLORS.text,
        },

        categoryCount: {
            fontFamily:
                FONTS.regular,
            fontSize:
                11,
            color:
                COLORS.textSecondary,
            marginTop:
                4,
        },

        categoryArrow: {
            fontFamily:
                FONTS.bold,
            fontSize:
                24,
            color:
                COLORS.themeColor,
        },

        servicesContainer: {
            paddingHorizontal:
                SPACING.medium,
            paddingBottom:
                SPACING.medium,
        },

        // ====================================================
        // SERVICE CARD
        // ====================================================

        serviceCard: {
            borderTopWidth:
                1,
            borderTopColor:
                '#EEEEEE',
            paddingVertical:
                SPACING.medium,
        },

        serviceCardIncomplete: {
            backgroundColor:
                '#FFFDF8',
            marginHorizontal:
                -SPACING.small,
            paddingHorizontal:
                SPACING.small,
            borderRadius:
                RADIUS.medium,
        },

        // ====================================================
        // SERVICE CONTEXT
        // ====================================================

        serviceContext: {
            flexDirection:
                'row',
            alignItems:
                'center',
            marginBottom:
                SPACING.medium,
        },

        serviceNumber: {
            width:
                28,
            height:
                28,
            borderRadius:
                14,
            backgroundColor:
                COLORS.background,
            borderWidth:
                1,
            borderColor:
                COLORS.themeColor,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight:
                SPACING.small,
        },

        serviceNumberText: {
            fontFamily:
                FONTS.bold,
            fontSize:
                11,
            color:
                COLORS.themeColor,
        },

        serviceContextText: {
            flex: 1,
        },

        subcategoryText: {
            fontFamily:
                FONTS.semiBold,
            fontSize:
                13,
            color:
                COLORS.text,
        },

        contextBottomRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
            marginTop:
                5,
        },

        audienceBadge: {
            alignSelf:
                'flex-start',
            paddingHorizontal:
                8,
            paddingVertical:
                3,
            borderRadius:
                10,
            backgroundColor:
                COLORS.background,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
        },

        audienceBadgeText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                9,
            color:
                COLORS.textSecondary,
        },

        // ====================================================
        // NAME
        // ====================================================

        nameFieldContainer: {
            marginBottom:
                SPACING.medium,
        },

        fieldLabel: {
            fontFamily:
                FONTS.medium,
            fontSize:
                12,
            color:
                COLORS.textSecondary,
            marginBottom:
                6,
        },

        requiredAsterisk: {
            color:
                COLORS.themeColor,
        },

        nameInput: {
            width:
                '100%',
            height:
                48,
            backgroundColor:
                COLORS.white,
            borderWidth:
                1,
            borderColor:
                '#D7D7D7',
            borderRadius:
                RADIUS.medium,
            paddingHorizontal:
                13,
            fontFamily:
                FONTS.medium,
            fontSize:
                14,
            color:
                COLORS.text,
        },

        nameInputIncomplete: {
            borderColor:
                '#D8C9A6',
        },

        // ====================================================
        // PRICE / DURATION
        // ====================================================

        fieldsRow: {
            flexDirection:
                'row',
            gap:
                10,
        },

        fieldContainer: {
            flex: 1,
        },

        inputWithPrefix: {
            height:
                46,
            flexDirection:
                'row',
            alignItems:
                'center',
            backgroundColor:
                COLORS.white,
            borderWidth:
                1,
            borderColor:
                '#D7D7D7',
            borderRadius:
                RADIUS.medium,
        },

        inputWithSuffix: {
            height:
                46,
            flexDirection:
                'row',
            alignItems:
                'center',
            backgroundColor:
                COLORS.white,
            borderWidth:
                1,
            borderColor:
                '#D7D7D7',
            borderRadius:
                RADIUS.medium,
        },

        prefix: {
            fontFamily:
                FONTS.medium,
            fontSize:
                14,
            color:
                COLORS.textSecondary,
            marginLeft:
                12,
        },

        suffix: {
            fontFamily:
                FONTS.medium,
            fontSize:
                11,
            color:
                COLORS.textSecondary,
            marginRight:
                10,
        },

        serviceInput: {
            flex: 1,
            height:
                44,
            paddingHorizontal:
                8,
            fontFamily:
                FONTS.medium,
            fontSize:
                14,
            color:
                COLORS.text,
        },

        // ====================================================
        // STATUS
        // ====================================================

        statusRow: {
            minHeight:
                18,
            marginTop:
                4,
        },

        requiredLabel: {
            fontFamily:
                FONTS.regular,
            fontSize:
                10,
            color:
                '#C77700',
        },

        completedLabel: {
            fontFamily:
                FONTS.medium,
            fontSize:
                10,
            color:
                COLORS.themeColor,
        },

        // ====================================================
        // ACTIONS
        // ====================================================

        serviceActions: {
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
            marginTop:
                SPACING.small,
        },

        addServiceButton: {
            flexDirection:
                'row',
            alignItems:
                'center',
            paddingVertical:
                8,
            paddingRight:
                10,
        },

        addServiceButtonDisabled: {
            opacity:
                0.45,
        },

        addServiceIcon: {
            fontFamily:
                FONTS.bold,
            fontSize:
                19,
            lineHeight:
                19,
            color:
                COLORS.themeColor,
            marginRight:
                6,
        },

        addServiceText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                12,
            color:
                COLORS.themeColor,
        },

        addServiceTextDisabled: {
            color:
                COLORS.textSecondary,
        },

        removeServiceButton: {
            paddingVertical:
                8,
            paddingHorizontal:
                8,
        },

        removeServiceText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                11,
            color:
                '#C77700',
        },

        // ====================================================
        // CATEGORY DURATION
        // ====================================================

        categoryBulkContainer: {
            borderTopWidth:
                1,
            borderTopColor:
                '#EEEEEE',
            paddingTop:
                SPACING.medium,
            marginTop:
                4,
        },

        categoryBulkLabel: {
            fontFamily:
                FONTS.medium,
            fontSize:
                11,
            color:
                COLORS.textSecondary,
            marginBottom:
                7,
        },

        categoryBulkRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        categoryDurationInput: {
            width:
                65,
            height:
                40,
            backgroundColor:
                COLORS.white,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
            borderRadius:
                RADIUS.medium,
            textAlign:
                'center',
            fontFamily:
                FONTS.medium,
            fontSize:
                13,
            color:
                COLORS.text,
        },

        categoryMinutes: {
            fontFamily:
                FONTS.regular,
            fontSize:
                11,
            color:
                COLORS.textSecondary,
            marginHorizontal:
                7,
        },

        categoryApplyButton: {
            height:
                40,
            paddingHorizontal:
                15,
            borderRadius:
                RADIUS.medium,
            backgroundColor:
                COLORS.background,
            borderWidth:
                1,
            borderColor:
                COLORS.themeColor,
            justifyContent:
                'center',
            alignItems:
                'center',
        },

        categoryApplyText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                11,
            color:
                COLORS.themeColor,
        },

        // ====================================================
        // INFORMATION
        // ====================================================

        infoCard: {
            backgroundColor:
                COLORS.white,
            borderRadius:
                RADIUS.large,
            padding:
                SPACING.medium,
            marginTop:
                SPACING.small,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
        },

        infoTitle: {
            fontFamily:
                FONTS.bold,
            fontSize:
                14,
            color:
                COLORS.text,
            marginBottom:
                7,
        },

        infoText: {
            fontFamily:
                FONTS.regular,
            fontSize:
                12,
            lineHeight:
                18,
            color:
                COLORS.textSecondary,
            marginBottom:
                6,
        },

        // ====================================================
        // EMPTY
        // ====================================================

        emptyContainer: {
            backgroundColor:
                COLORS.white,
            borderRadius:
                RADIUS.large,
            padding:
                SPACING.large,
            alignItems:
                'center',
            marginBottom:
                SPACING.medium,
            borderWidth:
                1,
            borderColor:
                COLORS.border,
        },

        emptyTitle: {
            fontFamily:
                FONTS.bold,
            fontSize:
                16,
            color:
                COLORS.text,
        },

        emptyText: {
            fontFamily:
                FONTS.regular,
            fontSize:
                13,
            lineHeight:
                18,
            color:
                COLORS.textSecondary,
            textAlign:
                'center',
            marginTop:
                6,
        },

        goBackButton: {
            marginTop:
                SPACING.medium,
            paddingHorizontal:
                18,
            paddingVertical:
                10,
            borderRadius:
                RADIUS.medium,
            backgroundColor:
                COLORS.themeColor,
        },

        goBackButtonText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                13,
            color:
                COLORS.white,
        },

        // ====================================================
        // FOOTER
        // ====================================================

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

        footerWarning: {
            fontFamily:
                FONTS.regular,
            fontSize:
                11,
            color:
                '#C77700',
            textAlign:
                'center',
            marginBottom:
                8,
        },

        continueButton: {
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

        continueButtonDisabled: {
            opacity:
                0.5,
        },

        continueButtonText: {
            fontFamily:
                FONTS.bold,
            fontSize:
                15,
            color:
                COLORS.white,
        },

        // ====================================================
        // LOADING
        // ====================================================

        loadingContainer: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                SPACING.large,
        },

        loadingText: {
            fontFamily:
                FONTS.regular,
            fontSize:
                14,
            color:
                COLORS.textSecondary,
            marginTop:
                SPACING.medium,
        },

        // ====================================================
        // ERROR
        // ====================================================

        errorContainer: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                SPACING.large,
        },

        errorTitle: {
            fontFamily:
                FONTS.bold,
            fontSize:
                18,
            color:
                COLORS.text,
            textAlign:
                'center',
        },

        errorText: {
            fontFamily:
                FONTS.regular,
            fontSize:
                14,
            color:
                COLORS.textSecondary,
            textAlign:
                'center',
            marginTop:
                8,
        },

        errorButton: {
            marginTop:
                SPACING.large,
            paddingHorizontal:
                20,
            paddingVertical:
                12,
            borderRadius:
                RADIUS.medium,
            backgroundColor:
                COLORS.themeColor,
        },

        errorButtonText: {
            fontFamily:
                FONTS.medium,
            fontSize:
                14,
            color:
                COLORS.white,
        },

        bottomSpace: {
            height:
                20,
        },

    });


export default ConfigureSalonServices;