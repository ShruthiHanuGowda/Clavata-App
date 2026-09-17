import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import {
    gql,
    useLazyQuery,
    useMutation,
    useQuery
} from '@apollo/client';

import { useUser } from '../../../../context/UserContext';

/* ============================================================
 * GRAPHQL
 * ============================================================ */

const GET_SALON = gql`
    query GetSalon(
        $salonId: ID!
    ) {
        getSalon(
            salonId: $salonId
        ) {
            salonId
            ownerUserId
            salonName
            ownerName
            businessType
            ownerPhoneNumber
            alternatePhone
            email

            address {
                addressLine
                city
                state
                pincode
            }

            logoUrl
            coverImageUrl
            galleryImages

            serviceSelections {
                categoryId
                categoryName
                subcategoryId
                subcategoryName
            }

            kycStatus
            salonStatus
            isActive
            isVisible
            isDeleted
            averageRating
            totalReviews
            totalAppointments
            totalCompletedAppointments
            totalCancelledAppointments
            totalRevenue
            createdAt
            updatedAt
        }
    }
`;

const GET_CATEGORIES = gql`
    query Categories(
        $search: String
        $status: CategoryStatus
    ) {
        categories(
            search: $search
            status: $status
        ) {
            success
            message

            categories {
                categoryId
                name
                description
                servicesCount
                status
                createdAt
                updatedAt
            }

            totalCount
        }
    }
`;

const GET_SUBCATEGORIES = gql`
    query Subcategories(
        $categoryId: ID
        $search: String
        $status: SubcategoryStatus
    ) {
        subcategories(
            categoryId: $categoryId
            search: $search
            status: $status
        ) {
            success
            message

            subcategories {
                subcategoryId
                categoryId
                name
                description
                servicesCount
                status
                createdAt
                updatedAt
            }

            totalCount
        }
    }
`;

const GET_PENDING_SALON_PROFILE_CHANGE = gql`
    query GetPendingSalonProfileChange(
        $salonId: ID!
    ) {
        getPendingSalonProfileChange(
            salonId: $salonId
        ) {
            changeId
            salonId
            status
            submittedAt
            rejectionReason
        }
    }
`;

const UPDATE_SALON_PROFILE = gql`
    mutation UpdateSalonProfile(
        $input: UpdateSalonProfileInput!
    ) {
        updateSalonProfile(
            input: $input
        ) {
            success
            message

            salon {
                salonId
                ownerUserId
                salonName
                ownerName
                businessType
                ownerPhoneNumber
                alternatePhone
                email

                address {
                    addressLine
                    city
                    state
                    pincode
                }

                logoUrl
                coverImageUrl
                galleryImages

                serviceSelections {
                    categoryId
                    categoryName
                    subcategoryId
                    subcategoryName
                }

                kycStatus
                salonStatus
                isActive
                isVisible
                isDeleted
                averageRating
                totalReviews
                totalAppointments
                totalCompletedAppointments
                totalCancelledAppointments
                totalRevenue
                createdAt
                updatedAt
            }
        }
    }
`;

/* ============================================================
 * TYPES
 * ============================================================ */

type SalonAddress = {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
};

type SalonServiceSelection = {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
};

type Salon = {
    salonId: string;

    ownerUserId?: string | null;

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

    serviceSelections: SalonServiceSelection[];

    kycStatus?: string | null;
    salonStatus?: string | null;

    isActive?: boolean | null;
    isVisible?: boolean | null;
    isDeleted?: boolean | null;

    averageRating?: number | null;
    totalReviews?: number | null;
    totalAppointments?: number | null;
    totalCompletedAppointments?: number | null;
    totalCancelledAppointments?: number | null;
    totalRevenue?: number | null;

    createdAt?: string | null;
    updatedAt?: string | null;
};

type Category = {
    categoryId: string;
    name: string;

    description?: string | null;
    servicesCount?: number | null;
    status?: string | null;

    createdAt?: string | null;
    updatedAt?: string | null;
};

type Subcategory = {
    subcategoryId: string;
    categoryId: string;
    name: string;

    description?: string | null;
    servicesCount?: number | null;
    status?: string | null;

    createdAt?: string | null;
    updatedAt?: string | null;
};

type PendingChange = {
    changeId: string;
    salonId: string;
    status: string;

    submittedAt?: string | null;
    updatedAt?: string | null;

    rejectionReason?: string | null;
};

/* ============================================================
 * HELPERS
 * ============================================================ */

const selectionKey = (
    categoryId: string,
    subcategoryId: string
) => {
    return `${categoryId}:${subcategoryId}`;
};

const normalizeSelections = (
    selections: SalonServiceSelection[]
): SalonServiceSelection[] => {
    const map = new Map<
        string,
        SalonServiceSelection
    >();

    if (!Array.isArray(selections)) {
        return [];
    }

    selections.forEach((item) => {
        if (
            !item ||
            !item.categoryId ||
            !item.subcategoryId
        ) {
            return;
        }

        map.set(
            selectionKey(
                item.categoryId,
                item.subcategoryId
            ),
            {
                categoryId:
                    item.categoryId,

                categoryName:
                    item.categoryName ||
                    'Category',

                subcategoryId:
                    item.subcategoryId,

                subcategoryName:
                    item.subcategoryName ||
                    'Subcategory'
            }
        );
    });

    return Array.from(
        map.values()
    );
};

const getSelectionKeys = (
    selections: SalonServiceSelection[]
) => {
    return normalizeSelections(
        selections
    )
        .map((item) =>
            selectionKey(
                item.categoryId,
                item.subcategoryId
            )
        )
        .sort();
};

const selectionsAreEqual = (
    first: SalonServiceSelection[],
    second: SalonServiceSelection[]
) => {
    return (
        JSON.stringify(
            getSelectionKeys(first)
        ) ===
        JSON.stringify(
            getSelectionKeys(second)
        )
    );
};

/* ============================================================
 * COMPONENT
 * ============================================================ */

const ManageServices = () => {
    const { currentUser } = useUser();

    const salonId =
        currentUser?.salonId;

    /* ========================================================
     * UI STATE
     * ======================================================== */

    const [
        search,
        setSearch
    ] = useState('');

    const [
        categoryFilter,
        setCategoryFilter
    ] = useState('All');

    const [
        addModalVisible,
        setAddModalVisible
    ] = useState(false);

    const [
        selectedCategoryId,
        setSelectedCategoryId
    ] = useState<string | null>(null);

    const [
        subcategorySearch,
        setSubcategorySearch
    ] = useState('');

    const [
        draftSelections,
        setDraftSelections
    ] = useState<
        SalonServiceSelection[]
    >([]);

    const [
        submitting,
        setSubmitting
    ] = useState(false);

    /* ========================================================
     * GET SALON
     * ======================================================== */

    const {
        data: salonData,
        loading: salonLoading,
        error: salonError,
        refetch: refetchSalon
    } = useQuery(
        GET_SALON,
        {
            variables: {
                salonId
            },

            skip: !salonId,

            fetchPolicy:
                'network-only'
        }
    );

    const salon: Salon | null =
        salonData?.getSalon ||
        null;

    /* ========================================================
     * GET LIVE SELECTIONS
     * ======================================================== */

    const liveSelections =
        useMemo(() => {
            const selections =
                salon?.serviceSelections;

            if (
                !Array.isArray(
                    selections
                )
            ) {
                return [];
            }

            return normalizeSelections(
                selections
            );
        }, [
            salon?.serviceSelections
        ]);

    /* ========================================================
     * PENDING PROFILE CHANGE
     * ======================================================== */

    const {
        data: pendingData,
        loading: pendingLoading,
        error: pendingError,
        refetch: refetchPending
    } = useQuery(
        GET_PENDING_SALON_PROFILE_CHANGE,
        {
            variables: {
                salonId
            },

            skip: !salonId,

            fetchPolicy:
                'network-only'
        }
    );

    const pendingChange:
        | PendingChange
        | null =
        pendingData
            ?.getPendingSalonProfileChange ||
        null;

    const isPending =
        String(
            pendingChange?.status ||
            ''
        ).toUpperCase() ===
        'PENDING';

    /* ========================================================
     * GET CATEGORIES
     * ======================================================== */

    const {
        data: categoriesData,
        loading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories
    } = useQuery(
        GET_CATEGORIES,
        {
            variables: {
                status: 'ACTIVE'
            },

            fetchPolicy:
                'network-only'
        }
    );

    const categories: Category[] =
        useMemo(() => {
            const result =
                categoriesData
                    ?.categories
                    ?.categories;

            if (
                !Array.isArray(
                    result
                )
            ) {
                return [];
            }

            return result;
        }, [
            categoriesData
                ?.categories
                ?.categories
        ]);

    /* ========================================================
     * GET SUBCATEGORIES
     * ======================================================== */

    const [
        fetchSubcategories,
        {
            data:
                subcategoriesData,
            loading:
                subcategoriesLoading,
            error:
                subcategoriesError
        }
    ] = useLazyQuery(
        GET_SUBCATEGORIES,
        {
            fetchPolicy:
                'network-only'
        }
    );

    const subcategories:
        Subcategory[] =
        useMemo(() => {
            const result =
                subcategoriesData
                    ?.subcategories
                    ?.subcategories;

            if (
                !Array.isArray(
                    result
                )
            ) {
                return [];
            }

            return result;
        }, [
            subcategoriesData
                ?.subcategories
                ?.subcategories
        ]);

    /* ========================================================
     * UPDATE PROFILE
     * ======================================================== */

    const [
        updateSalonProfile,
        {
            loading:
                updateMutationLoading
        }
    ] = useMutation(
        UPDATE_SALON_PROFILE
    );

    /* ========================================================
     * DEBUG LOG - SALON
     *
     * IMPORTANT:
     * These logs run whenever Apollo's response changes.
     * This prevents the initial "SALON: null" from being
     * mistaken for the final backend result.
     * ======================================================== */

    useEffect(() => {
        console.log(
            '================================================'
        );

        console.log(
            '========== MANAGE SERVICES / GET SALON =========='
        );

        console.log(
            'SALON ID:',
            salonId
        );

        console.log(
            'GET SALON LOADING:',
            salonLoading
        );

        console.log(
            'GET SALON ERROR:',
            salonError
                ? salonError.message
                : null
        );

        console.log(
            'GET SALON RAW DATA:',
            JSON.stringify(
                salonData,
                null,
                2
            )
        );

        console.log(
            'SALON OBJECT:',
            JSON.stringify(
                salonData?.getSalon ||
                    null,
                null,
                2
            )
        );

        console.log(
            'LIVE SERVICE SELECTIONS FROM API:',
            JSON.stringify(
                salonData?.getSalon
                    ?.serviceSelections ||
                    [],
                null,
                2
            )
        );

        console.log(
            'NORMALIZED LIVE SERVICE SELECTIONS:',
            JSON.stringify(
                liveSelections,
                null,
                2
            )
        );

        console.log(
            '================================================'
        );
    }, [
        salonId,
        salonLoading,
        salonError,
        salonData,
        liveSelections
    ]);

    /* ========================================================
     * DEBUG LOG - PENDING CHANGE
     * ======================================================== */

    useEffect(() => {
        console.log(
            '========== MANAGE SERVICES / PENDING CHANGE =========='
        );

        console.log(
            'SALON ID:',
            salonId
        );

        console.log(
            'PENDING LOADING:',
            pendingLoading
        );

        console.log(
            'PENDING ERROR:',
            pendingError
                ? pendingError.message
                : null
        );

        console.log(
            'PENDING RAW DATA:',
            JSON.stringify(
                pendingData,
                null,
                2
            )
        );

        console.log(
            'PENDING CHANGE:',
            JSON.stringify(
                pendingChange,
                null,
                2
            )
        );

        console.log(
            'IS PENDING:',
            isPending
        );
    }, [
        salonId,
        pendingLoading,
        pendingError,
        pendingData,
        pendingChange,
        isPending
    ]);

    /* ========================================================
     * DEBUG LOG - CATEGORIES
     * ======================================================== */

    useEffect(() => {
        console.log(
            '========== MANAGE SERVICES / CATEGORIES =========='
        );

        console.log(
            'CATEGORIES LOADING:',
            categoriesLoading
        );

        console.log(
            'CATEGORIES ERROR:',
            categoriesError
                ? categoriesError.message
                : null
        );

        console.log(
            'CATEGORIES RAW DATA:',
            JSON.stringify(
                categoriesData,
                null,
                2
            )
        );

        console.log(
            'ACTIVE CATEGORIES:',
            JSON.stringify(
                categories,
                null,
                2
            )
        );

        console.log(
            'ACTIVE CATEGORY COUNT:',
            categories.length
        );
    }, [
        categoriesLoading,
        categoriesError,
        categoriesData,
        categories
    ]);

    /* ========================================================
     * DEBUG LOG - SUBCATEGORIES
     * ======================================================== */

    useEffect(() => {
        console.log(
            '========== MANAGE SERVICES / SUBCATEGORIES =========='
        );

        console.log(
            'SELECTED CATEGORY ID:',
            selectedCategoryId
        );

        console.log(
            'SUBCATEGORY LOADING:',
            subcategoriesLoading
        );

        console.log(
            'SUBCATEGORY ERROR:',
            subcategoriesError
                ? subcategoriesError.message
                : null
        );

        console.log(
            'SUBCATEGORY RAW DATA:',
            JSON.stringify(
                subcategoriesData,
                null,
                2
            )
        );

        console.log(
            'ACTIVE SUBCATEGORIES:',
            JSON.stringify(
                subcategories,
                null,
                2
            )
        );

        console.log(
            'SUBCATEGORY COUNT:',
            subcategories.length
        );
    }, [
        selectedCategoryId,
        subcategoriesLoading,
        subcategoriesError,
        subcategoriesData,
        subcategories
    ]);

    /* ========================================================
     * DRAFT DEBUG LOG
     * ======================================================== */

    useEffect(() => {
        console.log(
            '========== MANAGE SERVICES / DRAFT =========='
        );

        console.log(
            'LIVE SELECTIONS:',
            JSON.stringify(
                liveSelections,
                null,
                2
            )
        );

        console.log(
            'DRAFT SELECTIONS:',
            JSON.stringify(
                draftSelections,
                null,
                2
            )
        );

        console.log(
            'LIVE COUNT:',
            liveSelections.length
        );

        console.log(
            'DRAFT COUNT:',
            draftSelections.length
        );

        console.log(
            'HAS CHANGES:',
            !selectionsAreEqual(
                liveSelections,
                draftSelections
            )
        );
    }, [
        liveSelections,
        draftSelections
    ]);

    /* ========================================================
     * FILTER CATEGORIES
     * ======================================================== */

    const filteredCategories =
        useMemo(() => {
            const normalized =
                search
                    .trim()
                    .toLowerCase();

            if (!normalized) {
                return categories;
            }

            return categories.filter(
                (category) =>
                    String(
                        category.name ||
                            ''
                    )
                        .toLowerCase()
                        .includes(
                            normalized
                        )
            );
        }, [
            categories,
            search
        ]);

    /* ========================================================
     * DISPLAYED LIVE SELECTIONS
     * ======================================================== */

    const displayedSelections =
        useMemo(() => {
            const normalized =
                search
                    .trim()
                    .toLowerCase();

            return liveSelections.filter(
                (item) => {
                    const categoryName =
                        String(
                            item.categoryName ||
                                ''
                        ).toLowerCase();

                    const subcategoryName =
                        String(
                            item.subcategoryName ||
                                ''
                        ).toLowerCase();

                    const matchesSearch =
                        !normalized ||
                        categoryName.includes(
                            normalized
                        ) ||
                        subcategoryName.includes(
                            normalized
                        );

                    const matchesCategory =
                        categoryFilter ===
                            'All' ||
                        item.categoryId ===
                            categoryFilter;

                    return (
                        matchesSearch &&
                        matchesCategory
                    );
                }
            );
        }, [
            liveSelections,
            search,
            categoryFilter
        ]);

    /* ========================================================
     * GROUP SELECTIONS
     * ======================================================== */

    const groupedSelections =
        useMemo(() => {
            const groups =
                new Map<
                    string,
                    {
                        categoryId: string;
                        categoryName: string;
                        items: SalonServiceSelection[];
                    }
                >();

            displayedSelections.forEach(
                (item) => {
                    const existing =
                        groups.get(
                            item.categoryId
                        );

                    if (existing) {
                        existing.items.push(
                            item
                        );
                    } else {
                        groups.set(
                            item.categoryId,
                            {
                                categoryId:
                                    item.categoryId,

                                categoryName:
                                    item.categoryName ||
                                    'Category',

                                items: [
                                    item
                                ]
                            }
                        );
                    }
                }
            );

            return Array.from(
                groups.values()
            );
        }, [
            displayedSelections
        ]);

    /* ========================================================
     * STATS
     * ======================================================== */

    const totalSelections =
        liveSelections.length;

    const categoryCount =
        new Set(
            liveSelections.map(
                (item) =>
                    item.categoryId
            )
        ).size;

    /* ========================================================
     * CHANGE COUNTS
     * ======================================================== */

    const addedSelections =
        useMemo(() => {
            const liveKeys =
                new Set(
                    getSelectionKeys(
                        liveSelections
                    )
                );

            return draftSelections.filter(
                (item) =>
                    !liveKeys.has(
                        selectionKey(
                            item.categoryId,
                            item.subcategoryId
                        )
                    )
            );
        }, [
            liveSelections,
            draftSelections
        ]);

    const removedSelections =
        useMemo(() => {
            const draftKeys =
                new Set(
                    getSelectionKeys(
                        draftSelections
                    )
                );

            return liveSelections.filter(
                (item) =>
                    !draftKeys.has(
                        selectionKey(
                            item.categoryId,
                            item.subcategoryId
                        )
                    )
            );
        }, [
            liveSelections,
            draftSelections
        ]);

    const hasDraftChanges =
        !selectionsAreEqual(
            liveSelections,
            draftSelections
        );

    /* ========================================================
     * OPEN ADD MODAL
     * ======================================================== */

    const openAddModal = () => {
        console.log(
            '========== OPEN ADD SERVICES MODAL =========='
        );

        console.log(
            'IS PENDING:',
            isPending
        );

        console.log(
            'LIVE SELECTIONS:',
            JSON.stringify(
                liveSelections,
                null,
                2
            )
        );

        if (isPending) {
            console.log(
                'ADD MODAL BLOCKED - PENDING CHANGE EXISTS'
            );

            Alert.alert(
                'Changes under review',
                'Your salon service changes are already under review by Clavata Admin. You can make another change after the current request is approved or rejected.'
            );

            return;
        }

        setDraftSelections(
            liveSelections
        );

        setSelectedCategoryId(
            null
        );

        setSubcategorySearch('');

        setAddModalVisible(true);
    };

    /* ========================================================
     * CLOSE MODAL
     * ======================================================== */

    const closeAddModal = () => {
        console.log(
            '========== CLOSE ADD SERVICES MODAL =========='
        );

        console.log(
            'SUBMITTING:',
            submitting
        );

        if (submitting) {
            console.log(
                'MODAL CLOSE BLOCKED - SUBMISSION IN PROGRESS'
            );

            return;
        }

        setAddModalVisible(false);
        setSelectedCategoryId(null);
        setSubcategorySearch('');

        setDraftSelections(
            liveSelections
        );
    };

    /* ========================================================
     * SELECT CATEGORY
     * ======================================================== */

    const handleSelectCategory = (
        category: Category
    ) => {
        console.log(
            '========== SELECT CATEGORY =========='
        );

        console.log(
            'CATEGORY:',
            JSON.stringify(
                category,
                null,
                2
            )
        );

        console.log(
            'CATEGORY ID:',
            category.categoryId
        );

        if (isPending) {
            console.log(
                'CATEGORY SELECTION BLOCKED - PENDING'
            );

            return;
        }

        setSelectedCategoryId(
            category.categoryId
        );

        setSubcategorySearch('');

        console.log(
            'FETCHING ACTIVE SUBCATEGORIES FOR CATEGORY:',
            category.categoryId
        );

        fetchSubcategories({
            variables: {
                categoryId:
                    category.categoryId,

                status: 'ACTIVE'
            }
        })
            .then((result) => {
                console.log(
                    '========== SUBCATEGORY FETCH RESPONSE =========='
                );

                console.log(
                    'CATEGORY ID:',
                    category.categoryId
                );

                console.log(
                    'SUBCATEGORY RESPONSE:',
                    JSON.stringify(
                        result.data,
                        null,
                        2
                    )
                );
            })
            .catch((error) => {
                console.error(
                    'SUBCATEGORY FETCH ERROR:',
                    error
                );
            });
    };

    /* ========================================================
     * CHECK SUBCATEGORY SELECTED
     * ======================================================== */

    const isSubcategorySelected = (
        subcategory: Subcategory
    ) => {
        return draftSelections.some(
            (item) =>
                item.categoryId ===
                    subcategory.categoryId &&
                item.subcategoryId ===
                    subcategory.subcategoryId
        );
    };

    /* ========================================================
     * TOGGLE SUBCATEGORY
     * ======================================================== */

    const toggleSubcategory = (
        subcategory: Subcategory
    ) => {
        console.log(
            '========== TOGGLE SUBCATEGORY =========='
        );

        console.log(
            'SUBCATEGORY:',
            JSON.stringify(
                subcategory,
                null,
                2
            )
        );

        if (isPending) {
            console.log(
                'TOGGLE BLOCKED - PENDING CHANGE EXISTS'
            );

            return;
        }

        const exists =
            isSubcategorySelected(
                subcategory
            );

        console.log(
            'ALREADY SELECTED:',
            exists
        );

        if (exists) {
            console.log(
                'REMOVING FROM DRAFT:',
                selectionKey(
                    subcategory.categoryId,
                    subcategory.subcategoryId
                )
            );

            setDraftSelections(
                (previous) => {
                    const updated =
                        previous.filter(
                            (item) =>
                                !(
                                    item.categoryId ===
                                        subcategory.categoryId &&
                                    item.subcategoryId ===
                                        subcategory.subcategoryId
                                )
                        );

                    console.log(
                        'DRAFT AFTER TOGGLE REMOVE:',
                        JSON.stringify(
                            updated,
                            null,
                            2
                        )
                    );

                    return updated;
                }
            );

            return;
        }

        const category =
            categories.find(
                (item) =>
                    item.categoryId ===
                    subcategory.categoryId
            );

        if (!category) {
            console.error(
                'CATEGORY NOT FOUND FOR SUBCATEGORY:',
                subcategory
            );

            Alert.alert(
                'Category unavailable',
                'The selected category could not be found.'
            );

            return;
        }

        const newSelection: SalonServiceSelection =
            {
                categoryId:
                    subcategory.categoryId,

                categoryName:
                    category.name ||
                    'Category',

                subcategoryId:
                    subcategory.subcategoryId,

                subcategoryName:
                    subcategory.name ||
                    'Subcategory'
            };

        console.log(
            'ADDING TO DRAFT:',
            JSON.stringify(
                newSelection,
                null,
                2
            )
        );

        setDraftSelections(
            (previous) => {
                const updated = [
                    ...previous,
                    newSelection
                ];

                console.log(
                    'DRAFT AFTER TOGGLE ADD:',
                    JSON.stringify(
                        updated,
                        null,
                        2
                    )
                );

                return updated;
            }
        );
    };

    /* ========================================================
     * REMOVE SELECTION
     * ======================================================== */

    const handleRemove = (
        selection: SalonServiceSelection
    ) => {
        console.log(
            '========== REMOVE SERVICE REQUEST =========='
        );

        console.log(
            'SELECTION TO REMOVE:',
            JSON.stringify(
                selection,
                null,
                2
            )
        );

        if (isPending) {
            console.log(
                'REMOVE BLOCKED - PENDING CHANGE EXISTS'
            );

            Alert.alert(
                'Changes under review',
                'You cannot remove another service while your current service changes are awaiting administrator approval.'
            );

            return;
        }

        Alert.alert(
            'Remove service selection?',
            `Are you sure you want to remove "${selection.subcategoryName}" from your salon? This change will be sent to Clavata Admin for approval.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',

                    onPress: () => {
                        console.log(
                            'REMOVE CANCELLED'
                        );
                    }
                },

                {
                    text: 'Remove',
                    style: 'destructive',

                    onPress: () => {
                        console.log(
                            'REMOVE CONFIRMED'
                        );

                        setDraftSelections(
                            (
                                previous
                            ) => {
                                const updated =
                                    previous.filter(
                                        (
                                            item
                                        ) =>
                                            !(
                                                item.categoryId ===
                                                    selection.categoryId &&
                                                item.subcategoryId ===
                                                    selection.subcategoryId
                                            )
                                    );

                                console.log(
                                    'DRAFT AFTER REMOVE:',
                                    JSON.stringify(
                                        updated,
                                        null,
                                        2
                                    )
                                );

                                return updated;
                            }
                        );
                    }
                }
            ]
        );
    };

    /* ========================================================
     * SUBMIT SELECTIONS
     * ======================================================== */

    const submitSelections =
        async (
            selections: SalonServiceSelection[]
        ) => {
            console.log(
                '================================================'
            );

            console.log(
                '========== SUBMIT SALON SERVICE CHANGES =========='
            );

            console.log(
                'SALON ID:',
                salonId
            );

            console.log(
                'SALON AVAILABLE:',
                !!salon
            );

            console.log(
                'IS PENDING:',
                isPending
            );

            console.log(
                'INPUT SELECTIONS BEFORE NORMALIZATION:',
                JSON.stringify(
                    selections,
                    null,
                    2
                )
            );

            if (!salonId) {
                console.error(
                    'SUBMIT FAILED - SALON ID MISSING'
                );

                Alert.alert(
                    'Salon unavailable',
                    'Your salon information could not be found. Please sign in again.'
                );

                return;
            }

            if (!salon) {
                console.error(
                    'SUBMIT FAILED - SALON OBJECT MISSING'
                );

                Alert.alert(
                    'Salon unavailable',
                    'Salon information could not be loaded. Please try again.'
                );

                return;
            }

            if (isPending) {
                console.error(
                    'SUBMIT FAILED - PENDING REQUEST EXISTS'
                );

                Alert.alert(
                    'Changes under review',
                    'Your previous salon profile changes are still awaiting administrator approval.'
                );

                return;
            }

            const normalized =
                normalizeSelections(
                    selections
                );

            console.log(
                'NORMALIZED SELECTIONS:',
                JSON.stringify(
                    normalized,
                    null,
                    2
                )
            );

            console.log(
                'NORMALIZED SELECTION COUNT:',
                normalized.length
            );

            console.log(
                'ADDED SELECTIONS:',
                JSON.stringify(
                    addedSelections,
                    null,
                    2
                )
            );

            console.log(
                'REMOVED SELECTIONS:',
                JSON.stringify(
                    removedSelections,
                    null,
                    2
                )
            );

            /*
             * Required profile fields.
             */

            const salonName =
                String(
                    salon.salonName ||
                        ''
                ).trim();

            const ownerName =
                String(
                    salon.ownerName ||
                        ''
                ).trim();

            const businessType =
                String(
                    salon.businessType ||
                        ''
                ).trim();

            const email =
                String(
                    salon.email ||
                        ''
                ).trim();

            const ownerPhoneNumber =
                String(
                    salon.ownerPhoneNumber ||
                        ''
                ).trim();

            const address =
                salon.address;

            console.log(
                'PROFILE FIELD VALIDATION:',
                {
                    salonName:
                        !!salonName,

                    ownerName:
                        !!ownerName,

                    businessType:
                        !!businessType,

                    email:
                        !!email,

                    ownerPhoneNumber:
                        !!ownerPhoneNumber,

                    address:
                        !!address,

                    addressLine:
                        !!address
                            ?.addressLine,

                    city:
                        !!address?.city,

                    state:
                        !!address?.state,

                    pincode:
                        !!address?.pincode
                }
            );

            if (
                !salonName ||
                !ownerName ||
                !businessType ||
                !email ||
                !ownerPhoneNumber ||
                !address?.addressLine ||
                !address?.city ||
                !address?.state ||
                !address?.pincode
            ) {
                console.error(
                    'SUBMIT FAILED - INCOMPLETE SALON PROFILE'
                );

                Alert.alert(
                    'Incomplete salon profile',
                    'Your salon profile is incomplete. Please update Salon Information first and then manage your services.'
                );

                return;
            }

            const serviceSelectionInput =
                normalized.map(
                    (item) => ({
                        categoryId:
                            item.categoryId,

                        subcategoryId:
                            item.subcategoryId
                    })
                );

            console.log(
                'SERVICE SELECTION GRAPHQL INPUT:',
                JSON.stringify(
                    serviceSelectionInput,
                    null,
                    2
                )
            );

            const input = {
                salonId,

                salonName,

                ownerName,

                businessType,

                email,

                ownerPhoneNumber,

                alternatePhone:
                    salon.alternatePhone ||
                    null,

                address: {
                    addressLine:
                        address.addressLine,

                    city:
                        address.city,

                    state:
                        address.state,

                    pincode:
                        address.pincode
                },

                logoUrl:
                    salon.logoUrl ||
                    null,

                coverImageUrl:
                    salon.coverImageUrl ||
                    null,

                galleryImages:
                    Array.isArray(
                        salon.galleryImages
                    )
                        ? salon.galleryImages
                        : [],

                serviceSelections:
                    serviceSelectionInput
            };

            console.log(
                '================================================'
            );

            console.log(
                'FINAL UPDATE SALON PROFILE INPUT:'
            );

            console.log(
                JSON.stringify(
                    input,
                    null,
                    2
                )
            );

            console.log(
                '================================================'
            );

            setSubmitting(true);

            try {
                console.log(
                    'CALLING updateSalonProfile...'
                );

                const response =
                    await updateSalonProfile({
                        variables: {
                            input
                        }
                    });

                console.log(
                    '========== UPDATE SALON PROFILE RESPONSE =========='
                );

                console.log(
                    'FULL APOLLO RESPONSE:',
                    JSON.stringify(
                        response,
                        null,
                        2
                    )
                );

                console.log(
                    'RESPONSE DATA:',
                    JSON.stringify(
                        response.data,
                        null,
                        2
                    )
                );

                const result =
                    response.data
                        ?.updateSalonProfile;

                console.log(
                    'UPDATE RESULT:',
                    JSON.stringify(
                        result,
                        null,
                        2
                    )
                );

                if (
                    !result?.success
                ) {
                    console.error(
                        'UPDATE RETURNED SUCCESS FALSE'
                    );

                    Alert.alert(
                        'Unable to submit changes',
                        result?.message ||
                            'Something went wrong while submitting your service changes.'
                    );

                    return;
                }

                console.log(
                    'UPDATE SUCCESS = TRUE'
                );

                console.log(
                    'REFETCHING SALON + PENDING CHANGE...'
                );

                const [
                    salonRefresh,
                    pendingRefresh
                ] =
                    await Promise.all([
                        refetchSalon(),
                        refetchPending()
                    ]);

                console.log(
                    '========== POST-SUBMISSION SALON REFRESH =========='
                );

                console.log(
                    'REFRESHED SALON:',
                    JSON.stringify(
                        salonRefresh.data,
                        null,
                        2
                    )
                );

                console.log(
                    'REFRESHED LIVE SELECTIONS:',
                    JSON.stringify(
                        salonRefresh
                            .data
                            ?.getSalon
                            ?.serviceSelections ||
                            [],
                        null,
                        2
                    )
                );

                console.log(
                    '========== POST-SUBMISSION PENDING REFRESH =========='
                );

                console.log(
                    'REFRESHED PENDING:',
                    JSON.stringify(
                        pendingRefresh.data,
                        null,
                        2
                    )
                );

                setDraftSelections(
                    normalizeSelections(
                        salonRefresh
                            .data
                            ?.getSalon
                            ?.serviceSelections ||
                            []
                    )
                );

                setAddModalVisible(
                    false
                );

                setSelectedCategoryId(
                    null
                );

                setSubcategorySearch('');

                Alert.alert(
                    'Changes submitted',
                    result?.message ||
                        'Your service changes have been submitted successfully and are awaiting Clavata Admin approval.'
                );
            } catch (
                mutationError: any
            ) {
                console.error(
                    '================================================'
                );

                console.error(
                    'UPDATE SALON PROFILE ERROR'
                );

                console.error(
                    'ERROR OBJECT:',
                    mutationError
                );

                console.error(
                    'ERROR MESSAGE:',
                    mutationError?.message
                );

                console.error(
                    'GRAPHQL ERRORS:',
                    JSON.stringify(
                        mutationError?.graphQLErrors ||
                            [],
                        null,
                        2
                    )
                );

                console.error(
                    'NETWORK ERROR:',
                    mutationError?.networkError
                );

                console.error(
                    '================================================'
                );

                Alert.alert(
                    'Something went wrong',
                    mutationError?.message ||
                        'Unable to submit your service changes.'
                );
            } finally {
                console.log(
                    'SUBMISSION FINISHED'
                );

                setSubmitting(false);
            }
        };

    /* ========================================================
     * SUBMIT DRAFT
     * ======================================================== */

    const handleSubmitDraft =
        async () => {
            console.log(
                '========== SUBMIT DRAFT PRESSED =========='
            );

            console.log(
                'IS PENDING:',
                isPending
            );

            console.log(
                'LIVE:',
                JSON.stringify(
                    liveSelections,
                    null,
                    2
                )
            );

            console.log(
                'DRAFT:',
                JSON.stringify(
                    draftSelections,
                    null,
                    2
                )
            );

            console.log(
                'ADDED:',
                JSON.stringify(
                    addedSelections,
                    null,
                    2
                )
            );

            console.log(
                'REMOVED:',
                JSON.stringify(
                    removedSelections,
                    null,
                    2
                )
            );

            if (isPending) {
                console.log(
                    'SUBMIT DRAFT BLOCKED - PENDING'
                );

                return;
            }

            if (
                !hasDraftChanges
            ) {
                console.log(
                    'NO CHANGES DETECTED'
                );

                Alert.alert(
                    'No changes',
                    'You have not added or removed any service selections.'
                );

                return;
            }

            await submitSelections(
                draftSelections
            );
        };

    /* ========================================================
     * DISCARD DRAFT
     * ======================================================== */

    const handleDiscardChanges =
        () => {
            console.log(
                '========== DISCARD DRAFT =========='
            );

            console.log(
                'CURRENT DRAFT:',
                JSON.stringify(
                    draftSelections,
                    null,
                    2
                )
            );

            Alert.alert(
                'Discard changes?',
                'All unsaved service changes will be removed from this screen.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => {
                            console.log(
                                'DRAFT DISCARDED'
                            );

                            setDraftSelections(
                                liveSelections
                            );

                            setAddModalVisible(
                                false
                            );

                            setSelectedCategoryId(
                                null
                            );

                            setSubcategorySearch('');
                        }
                    }
                ]
            );
        };

    /* ========================================================
     * REFRESH
     * ======================================================== */

    const handleRefresh =
        async () => {
            console.log(
                '================================================'
            );

            console.log(
                '========== MANAGE SERVICES REFRESH =========='
            );

            console.log(
                'SALON ID:',
                salonId
            );

            try {
                const [
                    salonResult,
                    pendingResult,
                    categoriesResult
                ] =
                    await Promise.all([
                        refetchSalon(),
                        refetchPending(),
                        refetchCategories()
                    ]);

                console.log(
                    '========== REFRESH SALON RESULT =========='
                );

                console.log(
                    JSON.stringify(
                        salonResult.data,
                        null,
                        2
                    )
                );

                console.log(
                    '========== REFRESH PENDING RESULT =========='
                );

                console.log(
                    JSON.stringify(
                        pendingResult.data,
                        null,
                        2
                    )
                );

                console.log(
                    '========== REFRESH CATEGORIES RESULT =========='
                );

                console.log(
                    JSON.stringify(
                        categoriesResult.data,
                        null,
                        2
                    )
                );
            } catch (
                refreshError
            ) {
                console.error(
                    'MANAGE SERVICES REFRESH ERROR:',
                    refreshError
                );
            }
        };

    /* ========================================================
     * SUBCATEGORY FILTER
     * ======================================================== */

    const filteredSubcategories =
        useMemo(() => {
            const normalized =
                subcategorySearch
                    .trim()
                    .toLowerCase();

            if (!normalized) {
                return subcategories;
            }

            return subcategories.filter(
                (item) =>
                    String(
                        item.name ||
                            ''
                    )
                        .toLowerCase()
                        .includes(
                            normalized
                        )
            );
        }, [
            subcategories,
            subcategorySearch
        ]);

    /* ========================================================
     * CATEGORY FILTER
     * ======================================================== */

    const categoryFilterOptions =
        useMemo(() => {
            const selectedCategoryIds =
                new Set(
                    liveSelections.map(
                        (item) =>
                            item.categoryId
                    )
                );

            const selectedCategories =
                categories.filter(
                    (category) =>
                        selectedCategoryIds.has(
                            category.categoryId
                        )
                );

            return [
                {
                    categoryId:
                        'All',

                    name:
                        'All'
                },

                ...selectedCategories
            ];
        }, [
            categories,
            liveSelections
        ]);

    /* ========================================================
     * MAIN RENDER
     * ======================================================== */

    if (!salonId) {
        return (
            <SafeAreaView
                style={
                    styles.safeArea
                }
            >
                <StatusBar
                    barStyle="dark-content"
                />

                <View
                    style={
                        styles.centerState
                    }
                >
                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Salon information unavailable
                    </Text>

                    <Text
                        style={
                            styles.errorMessage
                        }
                    >
                        We could not find the salon associated with your account.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={
                styles.safeArea
            }
        >
            <StatusBar
                barStyle="dark-content"
            />

            <View
                style={
                    styles.container
                }
            >
                {/* ==================================================
                 * HEADER
                 * ================================================== */}

                <View
                    style={
                        styles.header
                    }
                >
                    <View
                        style={
                            styles.headerTextContainer
                        }
                    >
                        <Text
                            style={
                                styles.headerTitle
                            }
                        >
                            Manage Services
                        </Text>

                        <Text
                            style={
                                styles.headerSubtitle
                            }
                        >
                            Choose the services your salon offers
                        </Text>
                    </View>

                    <Pressable
                        style={[
                            styles.addButton,

                            isPending &&
                                styles.disabledButton
                        ]}
                        onPress={
                            openAddModal
                        }
                        disabled={
                            isPending ||
                            submitting
                        }
                    >
                        <Text
                            style={
                                styles.addButtonPlus
                            }
                        >
                            +
                        </Text>

                        <Text
                            style={
                                styles.addButtonText
                            }
                        >
                            Add
                        </Text>
                    </Pressable>
                </View>

                {/* ==================================================
                 * PENDING NOTICE
                 * ================================================== */}

                {isPending && (
                    <View
                        style={
                            styles.pendingBanner
                        }
                    >
                        <View
                            style={
                                styles.pendingIcon
                            }
                        >
                            <Text
                                style={
                                    styles.pendingIconText
                                }
                            >
                                !
                            </Text>
                        </View>

                        <View
                            style={
                                styles.pendingTextContainer
                            }
                        >
                            <Text
                                style={
                                    styles.pendingTitle
                                }
                            >
                                Changes awaiting approval
                            </Text>

                            <Text
                                style={
                                    styles.pendingMessage
                                }
                            >
                                Your service changes have been submitted to Clavata Admin. Your currently approved services remain active until the request is approved or rejected.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ==================================================
                 * UNSAVED CHANGE NOTICE
                 * ================================================== */}

                {hasDraftChanges &&
                    !isPending && (
                        <View
                            style={
                                styles.draftBanner
                            }
                        >
                            <View
                                style={
                                    styles.draftBannerTextContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.draftBannerTitle
                                    }
                                >
                                    Unsaved service changes
                                </Text>

                                <Text
                                    style={
                                        styles.draftBannerMessage
                                    }
                                >
                                    {addedSelections.length}{' '}
                                    added ·{' '}
                                    {
                                        removedSelections.length
                                    }{' '}
                                    removed
                                </Text>
                            </View>

                            <Pressable
                                style={
                                    styles.discardButton
                                }
                                onPress={
                                    handleDiscardChanges
                                }
                            >
                                <Text
                                    style={
                                        styles.discardButtonText
                                    }
                                >
                                    Discard
                                </Text>
                            </Pressable>
                        </View>
                    )}

                {/* ==================================================
                 * STATS
                 * ================================================== */}

                <View
                    style={
                        styles.statsRow
                    }
                >
                    <View
                        style={
                            styles.statCard
                        }
                    >
                        <Text
                            style={
                                styles.statValue
                            }
                        >
                            {
                                totalSelections
                            }
                        </Text>

                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Selected
                        </Text>
                    </View>

                    <View
                        style={
                            styles.statCard
                        }
                    >
                        <Text
                            style={
                                styles.statValue
                            }
                        >
                            {
                                categoryCount
                            }
                        </Text>

                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Categories
                        </Text>
                    </View>

                    <View
                        style={
                            styles.statCard
                        }
                    >
                        <Text
                            style={
                                styles.statValue
                            }
                        >
                            {
                                categories.length
                            }
                        </Text>

                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Available
                        </Text>
                    </View>
                </View>

                {/* ==================================================
                 * SEARCH
                 * ================================================== */}

                <View
                    style={
                        styles.searchContainer
                    }
                >
                    <Text
                        style={
                            styles.searchIcon
                        }
                    >
                        ⌕
                    </Text>

                    <TextInput
                        value={
                            search
                        }
                        onChangeText={
                            setSearch
                        }
                        placeholder="Search selected services..."
                        placeholderTextColor="#9CA3AF"
                        style={
                            styles.searchInput
                        }
                    />

                    {search.length >
                        0 && (
                        <Pressable
                            onPress={() =>
                                setSearch(
                                    ''
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.clearSearch
                                }
                            >
                                ×
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* ==================================================
                 * CATEGORY FILTER
                 * ================================================== */}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    style={
                        styles.filterScroll
                    }
                    contentContainerStyle={
                        styles.filterContent
                    }
                >
                    {categoryFilterOptions.map(
                        (
                            category
                        ) => {
                            const selected =
                                categoryFilter ===
                                category.categoryId;

                            return (
                                <Pressable
                                    key={
                                        category.categoryId
                                    }
                                    onPress={() =>
                                        setCategoryFilter(
                                            category.categoryId
                                        )
                                    }
                                    style={[
                                        styles.filterChip,
                                        selected &&
                                            styles.filterChipSelected
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            selected &&
                                                styles.filterChipTextSelected
                                        ]}
                                    >
                                        {
                                            category.name
                                        }
                                    </Text>
                                </Pressable>
                            );
                        }
                    )}
                </ScrollView>

                {/* ==================================================
                 * CONTENT
                 * ================================================== */}

                {salonLoading ||
                pendingLoading ? (
                    <View
                        style={
                            styles.centerState
                        }
                    >
                        <ActivityIndicator
                            size="large"
                        />

                        <Text
                            style={
                                styles.loadingText
                            }
                        >
                            Loading services...
                        </Text>
                    </View>
                ) : salonError ? (
                    <View
                        style={
                            styles.centerState
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
                                styles.errorMessage
                            }
                        >
                            {
                                salonError.message
                            }
                        </Text>

                        <Pressable
                            style={
                                styles.retryButton
                            }
                            onPress={
                                handleRefresh
                            }
                        >
                            <Text
                                style={
                                    styles.retryButtonText
                                }
                            >
                                Try Again
                            </Text>
                        </Pressable>
                    </View>
                ) : !salon ? (
                    <View
                        style={
                            styles.centerState
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
                            The salon could not be found for this salon ID.
                        </Text>

                        <Pressable
                            style={
                                styles.retryButton
                            }
                            onPress={
                                handleRefresh
                            }
                        >
                            <Text
                                style={
                                    styles.retryButtonText
                                }
                            >
                                Try Again
                            </Text>
                        </Pressable>
                    </View>
                ) : liveSelections.length ===
                  0 ? (
                    <View
                        style={
                            styles.centerState
                        }
                    >
                        <View
                            style={
                                styles.emptyIcon
                            }
                        >
                            <Text
                                style={
                                    styles.emptyIconText
                                }
                            >
                                ✦
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No services selected
                        </Text>

                        <Text
                            style={
                                styles.emptyMessage
                            }
                        >
                            Choose services from the Clavata catalogue to build your salon service list.
                        </Text>

                        <Pressable
                            style={[
                                styles.emptyAddButton,
                                isPending &&
                                    styles.disabledButton
                            ]}
                            onPress={
                                openAddModal
                            }
                            disabled={
                                isPending
                            }
                        >
                            <Text
                                style={
                                    styles.emptyAddButtonText
                                }
                            >
                                + Add Services
                            </Text>
                        </Pressable>
                    </View>
                ) : displayedSelections.length ===
                  0 ? (
                    <View
                        style={
                            styles.centerState
                        }
                    >
                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No services found
                        </Text>

                        <Text
                            style={
                                styles.emptyMessage
                            }
                        >
                            Try changing your search or category filter.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={
                            groupedSelections
                        }
                        keyExtractor={(
                            item
                        ) =>
                            item.categoryId
                        }
                        showsVerticalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.listContent
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={
                                    salonLoading ||
                                    pendingLoading
                                }
                                onRefresh={
                                    handleRefresh
                                }
                            />
                        }
                        renderItem={({
                            item
                        }) => (
                            <View
                                style={
                                    styles.categoryCard
                                }
                            >
                                <View
                                    style={
                                        styles.categoryHeader
                                    }
                                >
                                    <View
                                        style={
                                            styles.categoryIcon
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.categoryIconText
                                            }
                                        >
                                            {(
                                                item.categoryName ||
                                                'C'
                                            )
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </Text>
                                    </View>

                                    <View
                                        style={
                                            styles.categoryHeaderText
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.categoryTitle
                                            }
                                        >
                                            {
                                                item.categoryName
                                            }
                                        </Text>

                                        <Text
                                            style={
                                                styles.categoryCount
                                            }
                                        >
                                            {
                                                item.items
                                                    .length
                                            }{' '}
                                            {item
                                                .items
                                                .length ===
                                            1
                                                ? 'service'
                                                : 'services'}{' '}
                                            selected
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={
                                        styles.subcategoryList
                                    }
                                >
                                    {item.items.map(
                                        (
                                            selection
                                        ) => (
                                            <View
                                                key={selectionKey(
                                                    selection.categoryId,
                                                    selection.subcategoryId
                                                )}
                                                style={
                                                    styles.selectionRow
                                                }
                                            >
                                                <View
                                                    style={
                                                        styles.selectionCheck
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.selectionCheckText
                                                        }
                                                    >
                                                        ✓
                                                    </Text>
                                                </View>

                                                <View
                                                    style={
                                                        styles.selectionNameContainer
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.selectionName
                                                        }
                                                    >
                                                        {
                                                            selection.subcategoryName
                                                        }
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.selectionCategoryName
                                                        }
                                                    >
                                                        {
                                                            selection.categoryName
                                                        }
                                                    </Text>
                                                </View>

                                                <Pressable
                                                    style={[
                                                        styles.removeButton,
                                                        isPending &&
                                                            styles.removeButtonDisabled
                                                    ]}
                                                    onPress={() =>
                                                        handleRemove(
                                                            selection
                                                        )
                                                    }
                                                    disabled={
                                                        isPending ||
                                                        submitting
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.removeButtonText
                                                        }
                                                    >
                                                        Remove
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        )
                                    )}
                                </View>
                            </View>
                        )}
                    />
                )}

                {/* ==================================================
                 * SUBMIT CHANGES BAR
                 * ================================================== */}

                {hasDraftChanges &&
                    !isPending && (
                        <View
                            style={
                                styles.bottomSubmitBar
                            }
                        >
                            <View
                                style={
                                    styles.bottomSubmitInfo
                                }
                            >
                                <Text
                                    style={
                                        styles.bottomSubmitTitle
                                    }
                                >
                                    Review your changes
                                </Text>

                                <Text
                                    style={
                                        styles.bottomSubmitText
                                    }
                                >
                                    {addedSelections.length}{' '}
                                    added ·{' '}
                                    {
                                        removedSelections.length
                                    }{' '}
                                    removed
                                </Text>
                            </View>

                            <Pressable
                                style={[
                                    styles.bottomSubmitButton,
                                    submitting &&
                                        styles.submitButtonDisabled
                                ]}
                                onPress={
                                    handleSubmitDraft
                                }
                                disabled={
                                    submitting
                                }
                            >
                                {submitting ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                        size="small"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.bottomSubmitButtonText
                                        }
                                    >
                                        Submit
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    )}
            </View>

            {/* ======================================================
             * ADD SERVICES MODAL
             * ====================================================== */}

            <Modal
                visible={
                    addModalVisible
                }
                transparent
                animationType="slide"
                onRequestClose={
                    closeAddModal
                }
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={
                            styles.modalContainer
                        }
                    >
                        {/* ==========================================
                         * MODAL HEADER
                         * ========================================== */}

                        <View
                            style={
                                styles.modalHeader
                            }
                        >
                            <View
                                style={
                                    styles.modalHeaderTextContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.modalTitle
                                    }
                                >
                                    Add Services
                                </Text>

                                <Text
                                    style={
                                        styles.modalSubtitle
                                    }
                                >
                                    Select from Clavata's approved service catalogue
                                </Text>
                            </View>

                            <Pressable
                                style={
                                    styles.modalCloseButton
                                }
                                onPress={
                                    closeAddModal
                                }
                                disabled={
                                    submitting
                                }
                            >
                                <Text
                                    style={
                                        styles.modalCloseText
                                    }
                                >
                                    ×
                                </Text>
                            </Pressable>
                        </View>

                        {/* ==========================================
                         * SELECTION SUMMARY
                         * ========================================== */}

                        <View
                            style={
                                styles.selectionSummary
                            }
                        >
                            <View
                                style={
                                    styles.selectionSummaryTextContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.selectionSummaryTitle
                                    }
                                >
                                    {
                                        draftSelections.length
                                    }{' '}
                                    selected
                                </Text>

                                <Text
                                    style={
                                        styles.selectionSummaryText
                                    }
                                >
                                    {addedSelections.length}{' '}
                                    added ·{' '}
                                    {
                                        removedSelections.length
                                    }{' '}
                                    removed
                                </Text>

                                <Text
                                    style={
                                        styles.selectionSummaryHint
                                    }
                                >
                                    Changes will be sent to Clavata Admin for approval.
                                </Text>
                            </View>
                        </View>

                        {/* ==========================================
                         * CATEGORY + SUBCATEGORY
                         * ========================================== */}

                        <View
                            style={
                                styles.addContent
                            }
                        >
                            {/* ======================================
                             * CATEGORY COLUMN
                             * ====================================== */}

                            <View
                                style={
                                    styles.categoryColumn
                                }
                            >
                                <Text
                                    style={
                                        styles.sectionLabel
                                    }
                                >
                                    Categories
                                </Text>

                                {categoriesLoading ? (
                                    <View
                                        style={
                                            styles.smallLoading
                                        }
                                    >
                                        <ActivityIndicator />
                                    </View>
                                ) : categoriesError ? (
                                    <View
                                        style={
                                            styles.inlineError
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.inlineErrorText
                                            }
                                        >
                                            {
                                                categoriesError.message
                                            }
                                        </Text>
                                    </View>
                                ) : filteredCategories.length ===
                                  0 ? (
                                    <View
                                        style={
                                            styles.inlineEmpty
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.inlineEmptyText
                                            }
                                        >
                                            No active categories found.
                                        </Text>
                                    </View>
                                ) : (
                                    <ScrollView
                                        showsVerticalScrollIndicator={
                                            false
                                        }
                                        style={
                                            styles.categoryList
                                        }
                                    >
                                        {filteredCategories.map(
                                            (
                                                category
                                            ) => {
                                                const selected =
                                                    selectedCategoryId ===
                                                    category.categoryId;

                                                const selectedCount =
                                                    draftSelections.filter(
                                                        (
                                                            item
                                                        ) =>
                                                            item.categoryId ===
                                                            category.categoryId
                                                    ).length;

                                                return (
                                                    <Pressable
                                                        key={
                                                            category.categoryId
                                                        }
                                                        style={[
                                                            styles.modalCategory,
                                                            selected &&
                                                                styles.modalCategorySelected
                                                        ]}
                                                        onPress={() =>
                                                            handleSelectCategory(
                                                                category
                                                            )
                                                        }
                                                        disabled={
                                                            submitting
                                                        }
                                                    >
                                                        <View
                                                            style={
                                                                styles.modalCategoryTextContainer
                                                            }
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.modalCategoryText,
                                                                    selected &&
                                                                        styles.modalCategoryTextSelected
                                                                ]}
                                                                numberOfLines={
                                                                    2
                                                                }
                                                            >
                                                                {
                                                                    category.name
                                                                }
                                                            </Text>

                                                            {selectedCount >
                                                                0 && (
                                                                <Text
                                                                    style={[
                                                                        styles.selectedCountText,
                                                                        selected &&
                                                                            styles.selectedCountTextSelected
                                                                    ]}
                                                                >
                                                                    {
                                                                        selectedCount
                                                                    }{' '}
                                                                    selected
                                                                </Text>
                                                            )}
                                                        </View>

                                                        {selected && (
                                                            <Text
                                                                style={
                                                                    styles.categoryArrow
                                                                }
                                                            >
                                                                ›
                                                            </Text>
                                                        )}
                                                    </Pressable>
                                                );
                                            }
                                        )}
                                    </ScrollView>
                                )}
                            </View>

                            {/* ======================================
                             * SUBCATEGORY COLUMN
                             * ====================================== */}

                            <View
                                style={
                                    styles.subcategoryColumn
                                }
                            >
                                <Text
                                    style={
                                        styles.sectionLabel
                                    }
                                >
                                    Subcategories
                                </Text>

                                {!selectedCategoryId ? (
                                    <View
                                        style={
                                            styles.selectCategoryState
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.selectCategoryIcon
                                            }
                                        >
                                            ←
                                        </Text>

                                        <Text
                                            style={
                                                styles.selectCategoryTitle
                                            }
                                        >
                                            Select a category
                                        </Text>

                                        <Text
                                            style={
                                                styles.selectCategoryMessage
                                            }
                                        >
                                            Choose a category to see its active subcategories.
                                        </Text>
                                    </View>
                                ) : (
                                    <>
                                        <View
                                            style={
                                                styles.subcategorySearchContainer
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.subcategorySearchIcon
                                                }
                                            >
                                                ⌕
                                            </Text>

                                            <TextInput
                                                value={
                                                    subcategorySearch
                                                }
                                                onChangeText={
                                                    setSubcategorySearch
                                                }
                                                placeholder="Search subcategories..."
                                                placeholderTextColor="#9CA3AF"
                                                style={
                                                    styles.subcategorySearchInput
                                                }
                                            />

                                            {subcategorySearch.length >
                                                0 && (
                                                <Pressable
                                                    onPress={() =>
                                                        setSubcategorySearch(
                                                            ''
                                                        )
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.clearSearch
                                                        }
                                                    >
                                                        ×
                                                    </Text>
                                                </Pressable>
                                            )}
                                        </View>

                                        {subcategoriesLoading ? (
                                            <View
                                                style={
                                                    styles.smallLoading
                                                }
                                            >
                                                <ActivityIndicator />

                                                <Text
                                                    style={
                                                        styles.smallLoadingText
                                                    }
                                                >
                                                    Loading subcategories...
                                                </Text>
                                            </View>
                                        ) : subcategoriesError ? (
                                            <View
                                                style={
                                                    styles.inlineError
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.inlineErrorText
                                                    }
                                                >
                                                    {
                                                        subcategoriesError.message
                                                    }
                                                </Text>
                                            </View>
                                        ) : filteredSubcategories.length ===
                                          0 ? (
                                            <View
                                                style={
                                                    styles.noSubcategoryState
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.noSubcategoryTitle
                                                    }
                                                >
                                                    No active subcategories
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.noSubcategoryMessage
                                                    }
                                                >
                                                    There are no active subcategories available in this category.
                                                </Text>
                                            </View>
                                        ) : (
                                            <ScrollView
                                                showsVerticalScrollIndicator={
                                                    false
                                                }
                                                style={
                                                    styles.subcategoryListModal
                                                }
                                                contentContainerStyle={
                                                    styles.subcategoryListContent
                                                }
                                            >
                                                {filteredSubcategories.map(
                                                    (
                                                        subcategory
                                                    ) => {
                                                        const selected =
                                                            isSubcategorySelected(
                                                                subcategory
                                                            );

                                                        return (
                                                            <Pressable
                                                                key={
                                                                    subcategory.subcategoryId
                                                                }
                                                                style={[
                                                                    styles.subcategoryOption,
                                                                    selected &&
                                                                        styles.subcategoryOptionSelected
                                                                ]}
                                                                onPress={() =>
                                                                    toggleSubcategory(
                                                                        subcategory
                                                                    )
                                                                }
                                                                disabled={
                                                                    submitting
                                                                }
                                                            >
                                                                <View
                                                                    style={[
                                                                        styles.checkbox,
                                                                        selected &&
                                                                            styles.checkboxSelected
                                                                    ]}
                                                                >
                                                                    {selected && (
                                                                        <Text
                                                                            style={
                                                                                styles.checkboxText
                                                                            }
                                                                        >
                                                                            ✓
                                                                        </Text>
                                                                    )}
                                                                </View>

                                                                <View
                                                                    style={
                                                                        styles.subcategoryTextContainer
                                                                    }
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.subcategoryName,
                                                                            selected &&
                                                                                styles.subcategoryNameSelected
                                                                        ]}
                                                                    >
                                                                        {
                                                                            subcategory.name
                                                                        }
                                                                    </Text>

                                                                    {subcategory.description ? (
                                                                        <Text
                                                                            style={
                                                                                styles.subcategoryDescription
                                                                            }
                                                                            numberOfLines={
                                                                                2
                                                                            }
                                                                        >
                                                                            {
                                                                                subcategory.description
                                                                            }
                                                                        </Text>
                                                                    ) : null}
                                                                </View>
                                                            </Pressable>
                                                        );
                                                    }
                                                )}
                                            </ScrollView>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        {/* ==========================================
                         * MODAL ACTIONS
                         * ========================================== */}

                        <View
                            style={
                                styles.modalActions
                            }
                        >
                            <Pressable
                                style={
                                    styles.cancelButton
                                }
                                onPress={
                                    closeAddModal
                                }
                                disabled={
                                    submitting
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

                            <Pressable
                                style={[
                                    styles.submitButton,
                                    (!hasDraftChanges ||
                                        submitting) &&
                                        styles.submitButtonDisabled
                                ]}
                                onPress={
                                    handleSubmitDraft
                                }
                                disabled={
                                    !hasDraftChanges ||
                                    submitting
                                }
                            >
                                {submitting ||
                                updateMutationLoading ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.submitButtonText
                                        }
                                    >
                                        Submit for Approval
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

/* ============================================================
 * STYLES
 * ============================================================ */

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F8FA'
    },

    container: {
        flex: 1,
        paddingHorizontal: 20
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 16
    },

    headerTextContainer: {
        flex: 1,
        marginRight: 12
    },

    headerTitle: {
        fontSize: 27,
        fontWeight: '800',
        color: '#111827'
    },

    headerSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4
    },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 10
    },

    disabledButton: {
        opacity: 0.5
    },

    addButtonPlus: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '500',
        marginRight: 5,
        lineHeight: 20
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700'
    },

    pendingBanner: {
        flexDirection: 'row',
        backgroundColor: '#FFF8E7',
        borderWidth: 1,
        borderColor: '#F4D98B',
        borderRadius: 12,
        padding: 13,
        marginBottom: 10
    },

    pendingIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F59E0B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },

    pendingIconText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800'
    },

    pendingTextContainer: {
        flex: 1
    },

    pendingTitle: {
        color: '#92400E',
        fontSize: 13,
        fontWeight: '800'
    },

    pendingMessage: {
        color: '#92400E',
        fontSize: 11,
        lineHeight: 17,
        marginTop: 3
    },

    draftBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        borderRadius: 12,
        padding: 11,
        marginBottom: 10
    },

    draftBannerTextContainer: {
        flex: 1
    },

    draftBannerTitle: {
        color: '#3730A3',
        fontSize: 12,
        fontWeight: '800'
    },

    draftBannerMessage: {
        color: '#4F46E5',
        fontSize: 10,
        marginTop: 3
    },

    discardButton: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C7D2FE'
    },

    discardButtonText: {
        color: '#4338CA',
        fontSize: 10,
        fontWeight: '700'
    },

    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14
    },

    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },

    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827'
    },

    statLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 3
    },

    searchContainer: {
        height: 47,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13
    },

    searchIcon: {
        fontSize: 24,
        color: '#6B7280',
        marginRight: 8,
        transform: [
            {
                rotate: '-20deg'
            }
        ]
    },

    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        paddingVertical: 0
    },

    clearSearch: {
        fontSize: 25,
        color: '#9CA3AF',
        paddingLeft: 10
    },

    filterScroll: {
        marginTop: 12,
        flexGrow: 0
    },

    filterContent: {
        gap: 7,
        paddingBottom: 4
    },

    filterChip: {
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },

    filterChipSelected: {
        backgroundColor: '#111827',
        borderColor: '#111827'
    },

    filterChipText: {
        fontSize: 11,
        color: '#4B5563',
        fontWeight: '600'
    },

    filterChipTextSelected: {
        color: '#FFFFFF'
    },

    listContent: {
        paddingTop: 13,
        paddingBottom: 100
    },

    categoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 15,
        marginBottom: 12
    },

    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },

    categoryIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11
    },

    categoryIconText: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '800'
    },

    categoryHeaderText: {
        flex: 1
    },

    categoryTitle: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '800'
    },

    categoryCount: {
        color: '#9CA3AF',
        fontSize: 11,
        marginTop: 3
    },

    subcategoryList: {
        borderTopWidth: 1,
        borderTopColor: '#F0F1F3',
        paddingTop: 4
    },

    selectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 54,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },

    selectionCheck: {
        width: 25,
        height: 25,
        borderRadius: 7,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },

    selectionCheckText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800'
    },

    selectionNameContainer: {
        flex: 1
    },

    selectionName: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '700'
    },

    selectionCategoryName: {
        color: '#9CA3AF',
        fontSize: 9,
        marginTop: 2
    },

    removeButton: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 7,
        backgroundColor: '#FEF2F2'
    },

    removeButtonDisabled: {
        opacity: 0.45
    },

    removeButtonText: {
        color: '#DC2626',
        fontSize: 10,
        fontWeight: '700'
    },

    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30
    },

    loadingText: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 12
    },

    errorTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center'
    },

    errorMessage: {
        color: '#6B7280',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 19
    },

    retryButton: {
        marginTop: 18,
        backgroundColor: '#111827',
        paddingHorizontal: 20,
        paddingVertical: 11,
        borderRadius: 9
    },

    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13
    },

    emptyIcon: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center'
    },

    emptyIconText: {
        fontSize: 28,
        color: '#4F46E5'
    },

    emptyTitle: {
        color: '#111827',
        fontSize: 19,
        fontWeight: '800',
        marginTop: 16
    },

    emptyMessage: {
        color: '#6B7280',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 19,
        marginTop: 7,
        maxWidth: 310
    },

    emptyAddButton: {
        backgroundColor: '#111827',
        paddingHorizontal: 18,
        paddingVertical: 11,
        borderRadius: 9,
        marginTop: 18
    },

    emptyAddButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700'
    },

    bottomSubmitBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },

    bottomSubmitInfo: {
        flex: 1
    },

    bottomSubmitTitle: {
        color: '#111827',
        fontSize: 12,
        fontWeight: '800'
    },

    bottomSubmitText: {
        color: '#6B7280',
        fontSize: 10,
        marginTop: 3
    },

    bottomSubmitButton: {
        backgroundColor: '#111827',
        borderRadius: 9,
        paddingHorizontal: 20,
        paddingVertical: 11,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center'
    },

    bottomSubmitButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800'
    },

    /* ========================================================
     * MODAL
     * ======================================================== */

    modalOverlay: {
        flex: 1,
        backgroundColor:
            'rgba(0,0,0,0.48)',
        justifyContent: 'flex-end'
    },

    modalContainer: {
        height: '90%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden'
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 19,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F1F3'
    },

    modalHeaderTextContainer: {
        flex: 1,
        marginRight: 12
    },

    modalTitle: {
        fontSize: 21,
        color: '#111827',
        fontWeight: '800'
    },

    modalSubtitle: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4
    },

    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center'
    },

    modalCloseText: {
        color: '#374151',
        fontSize: 25,
        lineHeight: 27
    },

    selectionSummary: {
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },

    selectionSummaryTextContainer: {
        flex: 1
    },

    selectionSummaryTitle: {
        color: '#111827',
        fontSize: 13,
        fontWeight: '800'
    },

    selectionSummaryText: {
        color: '#4B5563',
        fontSize: 10,
        marginTop: 3
    },

    selectionSummaryHint: {
        color: '#6B7280',
        fontSize: 9,
        marginTop: 3
    },

    addContent: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 10
    },

    categoryColumn: {
        width: '38%',
        paddingRight: 9
    },

    subcategoryColumn: {
        flex: 1,
        paddingLeft: 9
    },

    sectionLabel: {
        color: '#374151',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 8
    },

    categoryList: {
        flex: 1
    },

    modalCategory: {
        minHeight: 48,
        borderRadius: 9,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 6,
        backgroundColor: '#F9FAFB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },

    modalCategorySelected: {
        backgroundColor: '#111827',
        borderColor: '#111827'
    },

    modalCategoryTextContainer: {
        flex: 1
    },

    modalCategoryText: {
        color: '#374151',
        fontSize: 11,
        fontWeight: '700'
    },

    modalCategoryTextSelected: {
        color: '#FFFFFF'
    },

    selectedCountText: {
        color: '#6B7280',
        fontSize: 8,
        marginTop: 2
    },

    selectedCountTextSelected: {
        color: '#D1D5DB'
    },

    categoryArrow: {
        color: '#FFFFFF',
        fontSize: 21,
        marginLeft: 4
    },

    subcategorySearchContainer: {
        height: 40,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        marginBottom: 8
    },

    subcategorySearchIcon: {
        fontSize: 19,
        color: '#9CA3AF',
        marginRight: 5
    },

    subcategorySearchInput: {
        flex: 1,
        fontSize: 11,
        color: '#111827',
        paddingVertical: 0
    },

    subcategoryListModal: {
        flex: 1
    },

    subcategoryListContent: {
        paddingBottom: 15
    },

    subcategoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 10,
        marginBottom: 7,
        backgroundColor: '#FFFFFF'
    },

    subcategoryOptionSelected: {
        backgroundColor: '#F9FAFB',
        borderColor: '#111827'
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9
    },

    checkboxSelected: {
        backgroundColor: '#111827',
        borderColor: '#111827'
    },

    checkboxText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800'
    },

    subcategoryTextContainer: {
        flex: 1
    },

    subcategoryName: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '700'
    },

    subcategoryNameSelected: {
        color: '#111827'
    },

    subcategoryDescription: {
        color: '#9CA3AF',
        fontSize: 9,
        lineHeight: 13,
        marginTop: 3
    },

    selectCategoryState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15
    },

    selectCategoryIcon: {
        color: '#9CA3AF',
        fontSize: 25,
        marginBottom: 8
    },

    selectCategoryTitle: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center'
    },

    selectCategoryMessage: {
        color: '#9CA3AF',
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 15,
        marginTop: 5
    },

    noSubcategoryState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15
    },

    noSubcategoryTitle: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center'
    },

    noSubcategoryMessage: {
        color: '#9CA3AF',
        fontSize: 10,
        lineHeight: 15,
        textAlign: 'center',
        marginTop: 5
    },

    smallLoading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },

    smallLoadingText: {
        color: '#6B7280',
        fontSize: 10,
        marginTop: 7
    },

    inlineError: {
        padding: 10,
        backgroundColor: '#FEF2F2',
        borderRadius: 8
    },

    inlineErrorText: {
        color: '#B91C1C',
        fontSize: 10,
        lineHeight: 15
    },

    inlineEmpty: {
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8
    },

    inlineEmptyText: {
        color: '#6B7280',
        fontSize: 10,
        lineHeight: 15
    },

    modalActions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F1F3',
        backgroundColor: '#FFFFFF'
    },

    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center'
    },

    cancelButtonText: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '700'
    },

    submitButton: {
        flex: 1.6,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center'
    },

    submitButtonDisabled: {
        opacity: 0.55
    },

    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700'
    }
});

export default ManageServices;