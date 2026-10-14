
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { gql, useMutation, useQuery } from '@apollo/client';

import { useUser } from '../../../context/UserContext';
import AppGradient from '../../../common/AppGradient';
import { GRADIENTS } from '../../../constants/constants';

/* ============================================================
   TYPES
============================================================ */

type Audience = 'FEMALE' | 'MALE' | 'KIDS';

type ServiceSelection = {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    serviceName: string;
    audience: Audience;
    price: number;
    duration: number;
};

type DisplayService = ServiceSelection & {
    _index: number;
};

type CategorySelection = {
    categoryId: string;
    categoryName: string;
    audiences: Audience[];
};

type SubcategorySelection = {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    audiences: Audience[];
};

type CategoryOption = {
    id: string;
    name: string;
};

type SubcategoryOption = {
    subcategoryId: string;
    categoryId: string;
    name: string;
    audiences: Audience[];
};

type SubcategoryGroup = {
    subcategoryId: string;
    subcategoryName: string;
    services: DisplayService[];
};

type CategoryGroup = {
    categoryId: string;
    categoryName: string;
    subcategories: SubcategoryGroup[];
    serviceCount: number;
};

type SalonProfile = {
    salonId: string;
    salonName: string;
    ownerName: string;
    targetAudiences: Audience[];
    email: string;
    ownerPhoneNumber: string;
    alternatePhone?: string | null;
    address: {
        addressLine: string;
        city: string;
        state: string;
        pincode: string;
    };
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    galleryImages: string[];
    categorySelections: CategorySelection[];
    subcategorySelections: SubcategorySelection[];
    serviceSelections: ServiceSelection[];
};

type ServiceDraft = {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    serviceName: string;
    audience: Audience;
    price: string;
    duration: string;
};

/* ============================================================
   THEME
============================================================ */

const PURPLE = '#8B5CF6';
const PURPLE_DARK = '#6741A5';
const PURPLE_LIGHT = '#F2EDFF';
const TEXT = '#242033';
const MUTED = '#777386';
const BORDER = '#E9E5F1';
const WHITE = '#FFFFFF';
const DANGER = '#C7465C';

const AUDIENCES: Audience[] = ['FEMALE', 'MALE', 'KIDS'];

const AUDIENCE_LABELS: Record<Audience, string> = {
    FEMALE: 'Female',
    MALE: 'Male',
    KIDS: 'Kids',
};

/* ============================================================
   GRAPHQL
============================================================ */

const GET_SALON_FOR_SERVICES = gql`
  query GetSalonForServiceManagement($salonId: ID!) {
    getSalon(salonId: $salonId) {
      salonId
      salonName
      ownerName
      targetAudiences
      email
      ownerPhoneNumber
      alternatePhone
      address {
        addressLine
        city
        state
        pincode
      }
      logoUrl
      coverImageUrl
      galleryImages
      categorySelections {
        categoryId
        categoryName
        audiences
      }
      subcategorySelections {
        categoryId
        categoryName
        subcategoryId
        subcategoryName
        audiences
      }
      serviceSelections {
        categoryId
        categoryName
        subcategoryId
        subcategoryName
        serviceName
        audience
        price
        duration
      }
    }
  }
`;

const GET_PENDING_PROFILE_CHANGE = gql`
  query GetPendingSalonProfileChange($salonId: ID!) {
    getPendingSalonProfileChange(salonId: $salonId) {
      changeId
      status
      submittedAt
      rejectionReason
    }
  }
`;

const GET_ACTIVE_CATEGORIES = gql`
  query GetActiveServiceCategories {
    categories(status: ACTIVE) {
      success
      categories {
        categoryId
        name
        status
      }
    }
  }
`;

const GET_ACTIVE_SUBCATEGORIES = gql`
  query GetActiveServiceSubcategories(
    $categoryId: ID!
    $status: SubcategoryStatus
  ) {
    subcategories(
      categoryId: $categoryId
      status: $status
    ) {
      success
      subcategories {
        subcategoryId
        categoryId
        name
        audiences
        status
      }
    }
  }
`;

const SUBMIT_SALON_PROFILE_CHANGE = gql`
  mutation SubmitSalonProfileChange(
    $input: SubmitSalonProfileChangeInput!
  ) {
    submitSalonProfileChange(input: $input) {
      success
      message
      change {
        changeId
        status
        submittedAt
      }
    }
  }
`;

/* ============================================================
   HELPERS
============================================================ */

const blankService = (
    audience: Audience = 'FEMALE',
): ServiceDraft => ({
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',
    serviceName: '',
    audience,
    price: '',
    duration: '',
});

const normalize = (value?: string | null) =>
    String(value ?? '').trim().replace(/\s+/g, ' ');

const normalizedKey = (value?: string | null) =>
    normalize(value).toLocaleLowerCase();

const money = (value: number) =>
    `₹${Number(value).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
    })}`;

const isAudience = (value: unknown): value is Audience =>
    value === 'FEMALE' || value === 'MALE' || value === 'KIDS';

const uniqueStrings = (values: string[]) =>
    Array.from(new Set(values.filter(Boolean)));


const normaliseAudiences = (values: unknown): Audience[] => {
    if (!Array.isArray(values)) {
        return [];
    }

    const validAudiences = values.filter(
        (value): value is Audience =>
            value === 'FEMALE' ||
            value === 'MALE' ||
            value === 'KIDS',
    );

    return Array.from(new Set<Audience>(validAudiences));
};


const getErrorMessage = (error: unknown) =>
    error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.';

/* ============================================================
   SCREEN
============================================================ */

export default function SalonServicesScreen() {
    const { currentUser } = useUser();
    const salonId = currentUser?.salonId;

    const [selectedAudience, setSelectedAudience] =
        useState<Audience>('FEMALE');

    const [search, setSearch] = useState('');
    const [draft, setDraft] = useState<ServiceSelection[]>([]);
    const [draftReady, setDraftReady] = useState(false);

    // Independent catalogue selections.
    const [selectedCategoryIds, setSelectedCategoryIds] =
        useState<string[]>([]);

    // Store full subcategory records, not only IDs. This preserves
    // newly selected subcategories when switching between categories.
    const [selectedSubcategories, setSelectedSubcategories] =
        useState<SubcategorySelection[]>([]);

    const [selectionCategoryId, setSelectionCategoryId] =
        useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] =
        useState<number | null>(null);

    const [serviceDraft, setServiceDraft] =
        useState<ServiceDraft>(blankService());

    const [expandedCategories, setExpandedCategories] =
        useState<Record<string, boolean>>({});

    const [expandedSubcategories, setExpandedSubcategories] =
        useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);

    /* ------------------------------------------------------------
       QUERIES
    ------------------------------------------------------------ */

    const {
        data: salonResult,
        loading: salonLoading,
        error: salonError,
        refetch: refetchSalon,
    } = useQuery(GET_SALON_FOR_SERVICES, {
        variables: { salonId },
        skip: !salonId,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const {
        data: pendingResult,
        loading: pendingLoading,
        error: pendingError,
        refetch: refetchPending,
    } = useQuery(GET_PENDING_PROFILE_CHANGE, {
        variables: { salonId },
        skip: !salonId,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const {
        data: categoryResult,
        loading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories,
    } = useQuery(GET_ACTIVE_CATEGORIES, {
        fetchPolicy: 'cache-and-network',
    });

    // Query the catalogue selector independently from the service
    // modal. Opening the modal cannot overwrite its selected category.
    const {
        data: catalogueSubcategoryResult,
        loading: catalogueSubcategoriesLoading,
        error: catalogueSubcategoriesError,
        refetch: refetchCatalogueSubcategories,
    } = useQuery(GET_ACTIVE_SUBCATEGORIES, {
        variables: {
            categoryId: selectionCategoryId,
            status: 'ACTIVE',
        },
        skip: !selectionCategoryId,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const {
        data: modalSubcategoryResult,
        loading: modalSubcategoriesLoading,
        error: modalSubcategoriesError,
        refetch: refetchModalSubcategories,
    } = useQuery(GET_ACTIVE_SUBCATEGORIES, {
        variables: {
            categoryId: serviceDraft.categoryId,
            status: 'ACTIVE',
        },
        skip: !modalVisible || !serviceDraft.categoryId,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const [submitProfileChange] = useMutation(
        SUBMIT_SALON_PROFILE_CHANGE,
    );

    const salon: SalonProfile | undefined =
        salonResult?.getSalon;

    const pendingChange =
        pendingResult?.getPendingSalonProfileChange;

    const isPending = pendingChange?.status === 'PENDING';
    const isLocked = isPending || submitting;

    /* ------------------------------------------------------------
       ACTIVE CATALOGUE
    ------------------------------------------------------------ */

    const categories = useMemo<CategoryOption[]>(() => {
        const result =
            categoryResult?.categories?.categories ?? [];

        return result
            .filter((item: any) => item?.status === 'ACTIVE')
            .map((item: any) => ({
                id: String(item.categoryId),
                name: String(item.name),
            }))
            .filter((item: CategoryOption) => item.id && item.name)
            .sort((a: CategoryOption, b: CategoryOption) =>
                a.name.localeCompare(b.name),
            );
    }, [categoryResult]);

    const catalogueSubcategories =
        useMemo<SubcategoryOption[]>(() => {
            const result =
                catalogueSubcategoryResult?.subcategories?.subcategories ??
                [];

            return result
                .filter((item: any) => item?.status === 'ACTIVE')
                .map((item: any) => ({
                    subcategoryId: String(item.subcategoryId),
                    categoryId: String(item.categoryId),
                    name: String(item.name),
                    audiences: normaliseAudiences(item.audiences),
                }));
        }, [catalogueSubcategoryResult]);

    const modalSubcategories = useMemo<SubcategoryOption[]>(() => {
        const result =
            modalSubcategoryResult?.subcategories?.subcategories ?? [];

        return result
            .filter((item: any) => item?.status === 'ACTIVE')
            .map((item: any) => ({
                subcategoryId: String(item.subcategoryId),
                categoryId: String(item.categoryId),
                name: String(item.name),
                audiences: normaliseAudiences(item.audiences),
            }));
    }, [modalSubcategoryResult]);

    const visibleModalSubcategories = useMemo(() => {
        return modalSubcategories.filter(item => {
            const sameCategory =
                item.categoryId === serviceDraft.categoryId;

            const supportsAudience =
                item.audiences.length === 0 ||
                item.audiences.includes(serviceDraft.audience);

            return sameCategory && supportsAudience;
        });
    }, [
        modalSubcategories,
        serviceDraft.categoryId,
        serviceDraft.audience,
    ]);

    const selectedSubcategoryIds = useMemo(
        () =>
            selectedSubcategories.map(item => item.subcategoryId),
        [selectedSubcategories],
    );

    /* ------------------------------------------------------------
       INITIALISE FROM LIVE SALON PROFILE
    ------------------------------------------------------------ */

    useEffect(() => {
        if (!salon || draftReady) {
            return;
        }

        const initialServices = (salon.serviceSelections ?? []).map(
            item => ({
                ...item,
                categoryId: String(item.categoryId ?? ''),
                categoryName: String(item.categoryName ?? ''),
                subcategoryId: String(item.subcategoryId ?? ''),
                subcategoryName: String(item.subcategoryName ?? ''),
                serviceName: String(item.serviceName ?? ''),
                audience: isAudience(item.audience)
                    ? item.audience
                    : 'FEMALE',
                price: Number(item.price),
                duration: Number(item.duration),
            }),
        );

        const savedCategories =
            (salon.categorySelections ?? []).map(item => ({
                categoryId: String(item.categoryId ?? ''),
                categoryName: String(item.categoryName ?? ''),
                audiences: normaliseAudiences(item.audiences),
            }));

        const savedSubcategories =
            (salon.subcategorySelections ?? []).map(item => ({
                categoryId: String(item.categoryId ?? ''),
                categoryName: String(item.categoryName ?? ''),
                subcategoryId: String(item.subcategoryId ?? ''),
                subcategoryName: String(item.subcategoryName ?? ''),
                audiences: normaliseAudiences(item.audiences),
            }));

        // Backward compatibility for salon records created before
        // independent category/subcategory selections existed.
        const categoryIdsFromServices = initialServices.map(
            item => item.categoryId,
        );

        const categoryIdsFromSubcategories =
            savedSubcategories.map(item => item.categoryId);

        setDraft(initialServices);

        setSelectedCategoryIds(
            uniqueStrings([
                ...savedCategories.map(item => item.categoryId),
                ...categoryIdsFromServices,
                ...categoryIdsFromSubcategories,
            ]),
        );

        setSelectedSubcategories(previous => {
            const savedById = new Map<string, SubcategorySelection>();

            savedSubcategories.forEach(item => {
                if (item.subcategoryId) {
                    savedById.set(item.subcategoryId, item);
                }
            });

            initialServices.forEach(item => {
                if (
                    item.subcategoryId &&
                    !savedById.has(item.subcategoryId)
                ) {
                    savedById.set(item.subcategoryId, {
                        categoryId: item.categoryId,
                        categoryName: item.categoryName,
                        subcategoryId: item.subcategoryId,
                        subcategoryName: item.subcategoryName,
                        audiences: [item.audience],
                    });
                }
            });

            previous.forEach(item => {
                if (!savedById.has(item.subcategoryId)) {
                    savedById.set(item.subcategoryId, item);
                }
            });

            return Array.from(savedById.values());
        });

        setDraftReady(true);
    }, [salon, draftReady]);

    /* ------------------------------------------------------------
       FILTER SERVICES
    ------------------------------------------------------------ */

    const filteredServices = useMemo<DisplayService[]>(() => {
        const query = normalizedKey(search);

        return draft
            .map((item, index) => ({
                ...item,
                _index: index,
            }))
            .filter(item => {
                if (item.audience !== selectedAudience) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                return (
                    normalizedKey(item.serviceName).includes(query) ||
                    normalizedKey(item.categoryName).includes(query) ||
                    normalizedKey(item.subcategoryName).includes(query)
                );
            })
            .sort((a, b) => {
                const categoryCompare =
                    a.categoryName.localeCompare(b.categoryName);

                if (categoryCompare !== 0) {
                    return categoryCompare;
                }

                const subcategoryCompare =
                    a.subcategoryName.localeCompare(b.subcategoryName);

                if (subcategoryCompare !== 0) {
                    return subcategoryCompare;
                }

                return a.serviceName.localeCompare(b.serviceName);
            });
    }, [draft, search, selectedAudience]);

    /* ------------------------------------------------------------
       HIERARCHICAL SERVICE GROUPING
       Audience -> Category -> Subcategory -> Services
    ------------------------------------------------------------ */

    const categoryGroups = useMemo<CategoryGroup[]>(() => {
        const categoryMap = new Map<
            string,
            {
                categoryId: string;
                categoryName: string;
                subcategoryMap: Map<string, SubcategoryGroup>;
            }
        >();

        filteredServices.forEach(item => {
            let category = categoryMap.get(item.categoryId);

            if (!category) {
                category = {
                    categoryId: item.categoryId,
                    categoryName: item.categoryName,
                    subcategoryMap: new Map(),
                };

                categoryMap.set(item.categoryId, category);
            }

            let subcategory = category.subcategoryMap.get(
                item.subcategoryId,
            );

            if (!subcategory) {
                subcategory = {
                    subcategoryId: item.subcategoryId,
                    subcategoryName: item.subcategoryName,
                    services: [],
                };

                category.subcategoryMap.set(
                    item.subcategoryId,
                    subcategory,
                );
            }

            subcategory.services.push(item);
        });

        return Array.from(categoryMap.values())
            .map(category => {
                const subcategoriesForCategory = Array.from(
                    category.subcategoryMap.values(),
                ).sort((a, b) =>
                    a.subcategoryName.localeCompare(b.subcategoryName),
                );

                return {
                    categoryId: category.categoryId,
                    categoryName: category.categoryName,
                    subcategories: subcategoriesForCategory,
                    serviceCount: subcategoriesForCategory.reduce(
                        (total, subcategory) =>
                            total + subcategory.services.length,
                        0,
                    ),
                };
            })
            .sort((a, b) =>
                a.categoryName.localeCompare(b.categoryName),
            );
    }, [filteredServices]);

    /* ------------------------------------------------------------
       EXPAND / COLLAPSE
    ------------------------------------------------------------ */

    const toggleCategory = useCallback((categoryId: string) => {
        setExpandedCategories(previous => ({
            ...previous,
            [categoryId]: !previous[categoryId],
        }));
    }, []);

    const toggleSubcategory = useCallback(
        (subcategoryId: string) => {
            setExpandedSubcategories(previous => ({
                ...previous,
                [subcategoryId]: !previous[subcategoryId],
            }));
        },
        [],
    );

    /* ------------------------------------------------------------
       CATEGORY / SUBCATEGORY SELECTIONS
    ------------------------------------------------------------ */

    const toggleCatalogueCategory = useCallback(
        (category: CategoryOption) => {
            if (isLocked) {
                return;
            }

            const isSelected = selectedCategoryIds.includes(category.id);

            if (isSelected) {
                const hasServices = draft.some(
                    item => item.categoryId === category.id,
                );

                if (hasServices) {
                    Alert.alert(
                        'Category has services',
                        'Remove or move the services in this category before deselecting it.',
                    );
                    return;
                }

                setSelectedCategoryIds(previous =>
                    previous.filter(id => id !== category.id),
                );

                setSelectedSubcategories(previous =>
                    previous.filter(
                        item => item.categoryId !== category.id,
                    ),
                );

                if (selectionCategoryId === category.id) {
                    setSelectionCategoryId('');
                }

                return;
            }

            setSelectedCategoryIds(previous =>
                uniqueStrings([...previous, category.id]),
            );

            setSelectionCategoryId(category.id);
        },
        [
            isLocked,
            selectedCategoryIds,
            draft,
            selectionCategoryId,
        ],
    );

    const toggleCatalogueSubcategory = useCallback(
        (subcategory: SubcategoryOption) => {
            if (isLocked) {
                return;
            }

            if (
                !selectedCategoryIds.includes(subcategory.categoryId)
            ) {
                Alert.alert(
                    'Select the category first',
                    'Choose this subcategory’s category before selecting the subcategory.',
                );
                return;
            }

            const isSelected = selectedSubcategoryIds.includes(
                subcategory.subcategoryId,
            );

            if (isSelected) {
                const hasServices = draft.some(
                    item =>
                        item.subcategoryId === subcategory.subcategoryId,
                );

                if (hasServices) {
                    Alert.alert(
                        'Subcategory has services',
                        'Remove or move its services before deselecting this subcategory.',
                    );
                    return;
                }

                setSelectedSubcategories(previous =>
                    previous.filter(
                        item =>
                            item.subcategoryId !== subcategory.subcategoryId,
                    ),
                );

                return;
            }

            const category = categories.find(
                item => item.id === subcategory.categoryId,
            );

            const selection: SubcategorySelection = {
                categoryId: subcategory.categoryId,
                categoryName: category?.name ?? '',
                subcategoryId: subcategory.subcategoryId,
                subcategoryName: subcategory.name,
                audiences: subcategory.audiences,
            };

            setSelectedSubcategories(previous => [
                ...previous.filter(
                    item =>
                        item.subcategoryId !== subcategory.subcategoryId,
                ),
                selection,
            ]);
        },
        [
            isLocked,
            selectedCategoryIds,
            selectedSubcategoryIds,
            draft,
            categories,
        ],
    );

    /* ------------------------------------------------------------
       SERVICE MODAL
    ------------------------------------------------------------ */

    const closeServiceModal = useCallback(() => {
        setModalVisible(false);
        setEditingIndex(null);
        setServiceDraft(blankService(selectedAudience));
    }, [selectedAudience]);

    const openAddService = useCallback(() => {
        if (isLocked) {
            return;
        }

        setEditingIndex(null);
        setServiceDraft(blankService(selectedAudience));
        setModalVisible(true);
    }, [isLocked, selectedAudience]);

    const openEditService = useCallback(
        (item: DisplayService) => {
            if (isLocked) {
                return;
            }

            setSelectedAudience(item.audience);
            setEditingIndex(item._index);

            setServiceDraft({
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                subcategoryId: item.subcategoryId,
                subcategoryName: item.subcategoryName,
                serviceName: item.serviceName,
                audience: item.audience,
                price: String(item.price),
                duration: String(item.duration),
            });

            setModalVisible(true);
        },
        [isLocked],
    );

    const chooseServiceCategory = (category: CategoryOption) => {
        setServiceDraft(current => {
            if (current.categoryId === category.id) {
                return {
                    ...current,
                    categoryName: category.name,
                };
            }

            return {
                ...current,
                categoryId: category.id,
                categoryName: category.name,
                subcategoryId: '',
                subcategoryName: '',
            };
        });
    };

    const chooseServiceSubcategory = (
        subcategory: SubcategoryOption,
    ) => {
        const category = categories.find(
            item => item.id === subcategory.categoryId,
        );

        setServiceDraft(current => ({
            ...current,
            categoryId: subcategory.categoryId,
            categoryName: category?.name ?? current.categoryName,
            subcategoryId: subcategory.subcategoryId,
            subcategoryName: subcategory.name,
        }));

        // A service's subcategory is also a salon catalogue selection.
        setSelectedCategoryIds(previous =>
            uniqueStrings([...previous, subcategory.categoryId]),
        );

        setSelectedSubcategories(previous => {
            const selection: SubcategorySelection = {
                categoryId: subcategory.categoryId,
                categoryName: category?.name ?? '',
                subcategoryId: subcategory.subcategoryId,
                subcategoryName: subcategory.name,
                audiences: subcategory.audiences,
            };

            return [
                ...previous.filter(
                    item =>
                        item.subcategoryId !== subcategory.subcategoryId,
                ),
                selection,
            ];
        });
    };

    const changeDraftAudience = (audience: Audience) => {
        setServiceDraft(current => ({
            ...current,
            audience,
            subcategoryId: '',
            subcategoryName: '',
        }));
    };

    /* ------------------------------------------------------------
       SAVE SERVICE
    ------------------------------------------------------------ */

    const saveService = () => {
        if (isLocked) {
            return;
        }

        const name = normalize(serviceDraft.serviceName);
        const price = Number(serviceDraft.price);
        const duration = Number(serviceDraft.duration);

        if (
            !serviceDraft.categoryId ||
            !serviceDraft.subcategoryId ||
            !name
        ) {
            Alert.alert(
                'Required details',
                'Select a category and subcategory, and enter a service name.',
            );
            return;
        }

        const selectedCategory = categories.find(
            item => item.id === serviceDraft.categoryId,
        );

        if (!selectedCategory) {
            Alert.alert(
                'Category unavailable',
                'This category is no longer active. Select an active category.',
            );
            return;
        }

        const selectedSubcategory = modalSubcategories.find(
            item =>
                item.subcategoryId === serviceDraft.subcategoryId &&
                item.categoryId === serviceDraft.categoryId,
        );

        if (!selectedSubcategory) {
            Alert.alert(
                'Select a valid subcategory',
                'Select an active subcategory for the chosen category.',
            );
            return;
        }

        const audienceSupported =
            selectedSubcategory.audiences.length === 0 ||
            selectedSubcategory.audiences.includes(
                serviceDraft.audience,
            );

        if (!audienceSupported) {
            Alert.alert(
                'Audience not supported',
                'This subcategory is not available for the selected audience.',
            );
            return;
        }

        if (
            serviceDraft.price.trim() === '' ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            Alert.alert('Invalid price', 'Enter a valid service price.');
            return;
        }

        if (
            serviceDraft.duration.trim() === '' ||
            !Number.isInteger(duration) ||
            duration <= 0
        ) {
            Alert.alert(
                'Invalid duration',
                'Enter the duration in whole minutes.',
            );
            return;
        }

        const duplicateExists = draft.some((item, index) => {
            if (editingIndex !== null && index === editingIndex) {
                return false;
            }

            return (
                item.categoryId === serviceDraft.categoryId &&
                item.subcategoryId === serviceDraft.subcategoryId &&
                item.audience === serviceDraft.audience &&
                normalizedKey(item.serviceName) ===
                normalizedKey(name)
            );
        });

        if (duplicateExists) {
            Alert.alert(
                'Service already added',
                `"${name}" already exists under this category, subcategory, and audience.`,
            );
            return;
        }

        const newItem: ServiceSelection = {
            categoryId: selectedCategory.id,
            categoryName: selectedCategory.name,
            subcategoryId: selectedSubcategory.subcategoryId,
            subcategoryName: selectedSubcategory.name,
            serviceName: name,
            audience: serviceDraft.audience,
            price,
            duration,
        };

        setDraft(previous =>
            editingIndex === null
                ? [...previous, newItem]
                : previous.map((item, index) =>
                    index === editingIndex ? newItem : item,
                ),
        );

        setSelectedCategoryIds(previous =>
            uniqueStrings([...previous, newItem.categoryId]),
        );

        setSelectedSubcategories(previous => {
            const selection: SubcategorySelection = {
                categoryId: newItem.categoryId,
                categoryName: newItem.categoryName,
                subcategoryId: newItem.subcategoryId,
                subcategoryName: newItem.subcategoryName,
                audiences: selectedSubcategory.audiences.length
                    ? selectedSubcategory.audiences
                    : [newItem.audience],
            };

            return [
                ...previous.filter(
                    item => item.subcategoryId !== newItem.subcategoryId,
                ),
                selection,
            ];
        });

        setSelectedAudience(serviceDraft.audience);

        setExpandedCategories(previous => ({
            ...previous,
            [newItem.categoryId]: true,
        }));

        setExpandedSubcategories(previous => ({
            ...previous,
            [newItem.subcategoryId]: true,
        }));

        setModalVisible(false);
        setEditingIndex(null);
        setServiceDraft(blankService(serviceDraft.audience));
    };

    /* ------------------------------------------------------------
       REMOVE SERVICE
    ------------------------------------------------------------ */

    const deleteService = (index: number) => {
        if (isLocked) {
            return;
        }

        const item = draft[index];

        if (!item) {
            return;
        }

        Alert.alert(
            'Remove service?',
            `Remove "${item.serviceName}" from your proposed catalogue? Its category and subcategory selection will remain selected.`,
            [
                { text: 'Keep service', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setDraft(previous =>
                            previous.filter((_, i) => i !== index),
                        );
                    },
                },
            ],
        );
    };

    /* ------------------------------------------------------------
       VALIDATION
    ------------------------------------------------------------ */

    const validateDraft = (): string | null => {
        if (!salon) {
            return 'Salon profile could not be loaded.';
        }

        if (selectedCategoryIds.length === 0) {
            return 'Select at least one category.';
        }

        const selectedCategorySet = new Set(selectedCategoryIds);
        const selectedSubcategorySet = new Set(
            selectedSubcategoryIds,
        );

        for (const subcategory of selectedSubcategories) {
            if (!selectedCategorySet.has(subcategory.categoryId)) {
                return `Select the category for "${subcategory.subcategoryName}" or remove that subcategory selection.`;
            }
        }

        const serviceKeys = new Set<string>();

        for (const item of draft) {
            if (
                !item.categoryId ||
                !item.categoryName.trim() ||
                !item.subcategoryId ||
                !item.subcategoryName.trim() ||
                !item.serviceName.trim()
            ) {
                return 'Every service must have a category, subcategory, and service name.';
            }

            if (!selectedCategorySet.has(item.categoryId)) {
                return `Select the category for "${item.serviceName}".`;
            }

            if (!selectedSubcategorySet.has(item.subcategoryId)) {
                return `Select the subcategory for "${item.serviceName}".`;
            }

            if (
                !Number.isFinite(Number(item.price)) ||
                Number(item.price) < 0 ||
                !Number.isInteger(Number(item.duration)) ||
                Number(item.duration) <= 0
            ) {
                return `Check the price and duration for "${item.serviceName}".`;
            }

            if (!isAudience(item.audience)) {
                return `Select a valid audience for "${item.serviceName}".`;
            }

            const key = [
                item.categoryId,
                item.subcategoryId,
                item.audience,
                normalizedKey(item.serviceName),
            ].join('|');

            if (serviceKeys.has(key)) {
                return `Duplicate service found: "${item.serviceName}".`;
            }

            serviceKeys.add(key);
        }

        return null;
    };

    /* ------------------------------------------------------------
       BUILD AND SUBMIT PROFILE CHANGE
    ------------------------------------------------------------ */

    const submitForReview = () => {
        if (isLocked || !salon) {
            return;
        }

        const validationError = validateDraft();

        if (validationError) {
            Alert.alert('Review your catalogue', validationError);
            return;
        }

        const selectedCategorySet = new Set(selectedCategoryIds);

        const selectedCategories: CategorySelection[] = categories
            .filter(category =>
                selectedCategorySet.has(category.id),
            )
            .map(category => ({
                categoryId: category.id,
                categoryName: category.name,
                audiences: normaliseAudiences(salon.targetAudiences),
            }));

        if (
            selectedCategories.length !== selectedCategoryIds.length
        ) {
            Alert.alert(
                'Category unavailable',
                'One or more selected categories are no longer active. Refresh the catalogue and review your selections.',
            );
            return;
        }

        // Preserve full selected subcategory objects, including selections
        // newly made during this session.
        const selectedSubcategoryPayload =
            selectedSubcategories.map(item => ({
                categoryId: item.categoryId,
                categoryName:
                    categories.find(category => category.id === item.categoryId)
                        ?.name ?? item.categoryName,
                subcategoryId: item.subcategoryId,
                subcategoryName: item.subcategoryName,
                audiences: normaliseAudiences(item.audiences),
            }));

        Alert.alert(
            'Confirm catalogue changes',
            [
                `Services: ${draft.length}`,
                `Categories: ${selectedCategories.length}`,
                `Subcategories: ${selectedSubcategoryPayload.length}`,
                '',
                'Your proposed salon profile and catalogue selections will be sent for admin review.',
                '',
                'Your live profile will remain unchanged until admin approval.',
                '',
                'You cannot submit another profile change while this request is pending.',
            ].join('\n'),
            [
                {
                    text: 'Go back',
                    style: 'cancel',
                },
                {
                    text: 'Confirm and submit',
                    onPress: async () => {
                        try {
                            setSubmitting(true);

                            const input = {
                                salonId: salon.salonId,

                                salonName: salon.salonName,
                                ownerName: salon.ownerName,
                                targetAudiences: salon.targetAudiences ?? [],
                                email: salon.email,
                                ownerPhoneNumber: salon.ownerPhoneNumber,
                                alternatePhone: salon.alternatePhone ?? null,

                                address: {
                                    addressLine: salon.address.addressLine,
                                    city: salon.address.city,
                                    state: salon.address.state,
                                    pincode: salon.address.pincode,
                                },


                                logoUrl: salon.logoUrl ?? null,
                                coverImageUrl: salon.coverImageUrl ?? null,
                                galleryImages: salon.galleryImages ?? [],

                                categorySelections: selectedCategories,
                                subcategorySelections:
                                    selectedSubcategoryPayload,

                                serviceSelections: draft.map(item => ({
                                    categoryId: item.categoryId,
                                    categoryName: item.categoryName.trim(),
                                    subcategoryId: item.subcategoryId,
                                    subcategoryName: item.subcategoryName.trim(),
                                    serviceName: item.serviceName.trim(),
                                    audience: item.audience,
                                    price: Number(item.price),
                                    duration: Number(item.duration),
                                })),
                            };

                            const result = await submitProfileChange({
                                variables: { input },
                            });

                            const response =
                                result.data?.submitSalonProfileChange;

                            if (!response?.success) {
                                throw new Error(
                                    response?.message || 'Submission failed.',
                                );
                            }

                            await Promise.all([
                                refetchSalon(),
                                refetchPending(),
                            ]);

                            Alert.alert(
                                'Submitted for review',
                                response.message ||
                                'Your profile and catalogue changes have been submitted for admin review.',
                            );
                        } catch (error: unknown) {
                            Alert.alert(
                                'Submission failed',
                                getErrorMessage(error),
                            );
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ],
        );
    };

    /* ------------------------------------------------------------
       REFRESH
    ------------------------------------------------------------ */

    const refreshScreen = useCallback(async () => {
        try {
            await Promise.all([
                refetchSalon(),
                refetchPending(),
                refetchCategories(),
                selectionCategoryId
                    ? refetchCatalogueSubcategories()
                    : Promise.resolve(),
            ]);
        } catch {
            // Apollo exposes refresh errors through the relevant query.
        }
    }, [
        refetchSalon,
        refetchPending,
        refetchCategories,
        selectionCategoryId,
        refetchCatalogueSubcategories,
    ]);

    /* ------------------------------------------------------------
       LOADING / ERROR STATES
    ------------------------------------------------------------ */

    if (!salonId) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.errorTitle}>Salon not linked</Text>
                <Text style={styles.muted}>
                    Your account does not have a salon ID.
                </Text>
            </SafeAreaView>
        );
    }

    if (salonLoading || pendingLoading || !draftReady) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={PURPLE} />
                <Text style={styles.loadingText}>
                    Loading your service catalogue…
                </Text>
            </SafeAreaView>
        );
    }

    if (salonError || !salon) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.errorTitle}>
                    Could not load services
                </Text>
                <Text style={styles.muted}>
                    {salonError?.message ??
                        'Salon details are unavailable.'}
                </Text>

                <AppGradient
                    colors={[...GRADIENTS.SOFT_PURPLE]}
                    style={styles.gradientButton}
                >
                    <TouchableOpacity
                        onPress={() => refetchSalon()}
                        style={styles.primaryButtonInner}
                    >
                        <Text style={styles.primaryButtonText}>
                            Try again
                        </Text>
                    </TouchableOpacity>
                </AppGradient>
            </SafeAreaView>
        );
    }

    /* ============================================================
       MAIN SCREEN
    ============================================================ */

    return (
        <SafeAreaView style={styles.screen}>
            <FlatList<CategoryGroup>
                data={categoryGroups}
                keyExtractor={item => item.categoryId}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                refreshing={salonLoading}
                onRefresh={refreshScreen}
                ListHeaderComponent={
                    <View>
                        <AppGradient
                            colors={[...GRADIENTS.SOFT_PURPLE]}
                            style={styles.headerGradient}
                        >
                            <View style={styles.header}>
                                <View style={styles.headerText}>
                                    <Text style={styles.eyebrow}>
                                        SALON CATALOGUE
                                    </Text>

                                    <Text style={styles.title}>
                                        Services & pricing
                                    </Text>

                                    <Text style={styles.subtitle}>
                                        Manage your service offerings and select
                                        Clavata categories for your salon.
                                    </Text>
                                </View>

                                <View style={styles.countBadge}>
                                    <Text style={styles.countNumber}>
                                        {draft.length}
                                    </Text>
                                    <Text style={styles.countLabel}>services</Text>
                                </View>
                            </View>
                        </AppGradient>

                        {isPending && (
                            <View style={styles.pendingBanner}>
                                <Text style={styles.pendingTitle}>
                                    Review in progress
                                </Text>

                                <Text style={styles.pendingDescription}>
                                    Your proposed profile changes are awaiting
                                    admin review. Editing and additional submissions
                                    are disabled until the request is resolved.
                                </Text>

                                {pendingChange?.submittedAt ? (
                                    <Text style={styles.pendingDate}>
                                        Submitted:{' '}
                                        {new Date(
                                            pendingChange.submittedAt,
                                        ).toLocaleDateString('en-IN')}
                                    </Text>
                                ) : null}
                            </View>
                        )}

                        {pendingChange?.status === 'REJECTED' && (
                            <View style={styles.rejectedBanner}>
                                <Text style={styles.pendingTitle}>
                                    Changes require correction
                                </Text>

                                <Text style={styles.pendingDescription}>
                                    {pendingChange.rejectionReason ||
                                        'Review the feedback, make corrections, and submit again.'}
                                </Text>
                            </View>
                        )}

                        {pendingError && (
                            <View style={styles.inlineWarning}>
                                <Text style={styles.inlineWarningText}>
                                    Could not verify the profile-review status.
                                    Refresh before submitting changes.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => refetchPending()}
                                    style={styles.retryButton}
                                >
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.audienceSection}>
                            <Text style={styles.sectionLabel}>
                                SERVICE AUDIENCE
                            </Text>

                            <View style={styles.audienceTabs}>
                                {AUDIENCES.map(audience => {
                                    const active =
                                        selectedAudience === audience;

                                    const count = draft.filter(
                                        item => item.audience === audience,
                                    ).length;

                                    return (
                                        <TouchableOpacity
                                            key={audience}
                                            onPress={() => setSelectedAudience(audience)}
                                            style={[
                                                styles.audienceTab,
                                                active && styles.audienceTabActive,
                                            ]}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.audienceTabText,
                                                    active && styles.audienceTabTextActive,
                                                ]}
                                            >
                                                {AUDIENCE_LABELS[audience]}
                                            </Text>

                                            <View
                                                style={[
                                                    styles.audienceCountBadge,
                                                    active &&
                                                    styles.audienceCountBadgeActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.audienceCountText,
                                                        active &&
                                                        styles.audienceCountTextActive,
                                                    ]}
                                                >
                                                    {count}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* INDEPENDENT CATEGORY / SUBCATEGORY SELECTIONS */}

                        <View style={styles.catalogueSelectionSection}>
                            <Text style={styles.catalogueSelectionTitle}>
                                Catalogue categories
                            </Text>

                            <Text style={styles.catalogueSelectionDescription}>
                                Select the categories your salon offers. These
                                selections are saved independently of individual
                                services.
                            </Text>

                            {categoriesLoading && categories.length === 0 ? (
                                <ActivityIndicator color={PURPLE} />
                            ) : categoriesError ? (
                                <View style={styles.inlineErrorContainer}>
                                    <Text style={styles.subcategoryError}>
                                        Could not load categories.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => refetchCategories()}
                                        style={styles.retryButton}
                                    >
                                        <Text style={styles.retryText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : categories.length === 0 ? (
                                <Text style={styles.emptyOptionText}>
                                    No active categories are available.
                                </Text>
                            ) : (
                                <View style={styles.optionWrap}>
                                    {categories.map(category => {
                                        const selected = selectedCategoryIds.includes(
                                            category.id,
                                        );

                                        return (
                                            <TouchableOpacity
                                                key={category.id}
                                                disabled={isLocked}
                                                onPress={() =>
                                                    toggleCatalogueCategory(category)
                                                }
                                                style={[
                                                    styles.optionChip,
                                                    selected && styles.optionChipSelected,
                                                    isLocked && styles.actionDisabled,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        selected && styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {selected ? '✓ ' : ''}
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            <Text style={styles.catalogueSelectionTitle}>
                                Subcategories
                            </Text>

                            <Text style={styles.catalogueSelectionDescription}>
                                Choose a selected category, then select its
                                subcategories. You do not need to add a service
                                under every selection.
                            </Text>

                            {selectedCategoryIds.length === 0 ? (
                                <Text style={styles.emptyOptionText}>
                                    Select at least one category to view its
                                    subcategories.
                                </Text>
                            ) : (
                                <View style={styles.optionWrap}>
                                    {categories
                                        .filter(category =>
                                            selectedCategoryIds.includes(category.id),
                                        )
                                        .map(category => (
                                            <TouchableOpacity
                                                key={category.id}
                                                disabled={isLocked}
                                                onPress={() =>
                                                    setSelectionCategoryId(category.id)
                                                }
                                                style={[
                                                    styles.optionChip,
                                                    selectionCategoryId === category.id &&
                                                    styles.optionChipSelected,
                                                    isLocked && styles.actionDisabled,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        selectionCategoryId === category.id &&
                                                        styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                </View>
                            )}

                            {selectionCategoryId ? (
                                <>
                                    <Text style={styles.selectedCategoryLabel}>
                                        {categories.find(
                                            category =>
                                                category.id === selectionCategoryId,
                                        )?.name ?? 'Selected category'}
                                    </Text>

                                    {catalogueSubcategoriesLoading ? (
                                        <View style={styles.subcategoryLoading}>
                                            <ActivityIndicator color={PURPLE} />
                                            <Text style={styles.muted}>
                                                Loading subcategories…
                                            </Text>
                                        </View>
                                    ) : catalogueSubcategoriesError ? (
                                        <View style={styles.inlineErrorContainer}>
                                            <Text style={styles.subcategoryError}>
                                                Could not load subcategories.
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    refetchCatalogueSubcategories()
                                                }
                                                style={styles.retryButton}
                                            >
                                                <Text style={styles.retryText}>
                                                    Retry subcategories
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : catalogueSubcategories.length === 0 ? (
                                        <Text style={styles.emptyOptionText}>
                                            No active subcategories are available for
                                            this category.
                                        </Text>
                                    ) : (
                                        <View style={styles.optionWrap}>
                                            {catalogueSubcategories.map(subcategory => {
                                                const selected =
                                                    selectedSubcategoryIds.includes(
                                                        subcategory.subcategoryId,
                                                    );

                                                return (
                                                    <TouchableOpacity
                                                        key={subcategory.subcategoryId}
                                                        disabled={isLocked}
                                                        onPress={() =>
                                                            toggleCatalogueSubcategory(
                                                                subcategory,
                                                            )
                                                        }
                                                        style={[
                                                            styles.optionChip,
                                                            selected &&
                                                            styles.optionChipSelected,
                                                            isLocked && styles.actionDisabled,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.optionText,
                                                                selected &&
                                                                styles.optionTextSelected,
                                                            ]}
                                                        >
                                                            {selected ? '✓ ' : ''}
                                                            {subcategory.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </>
                            ) : null}

                            <Text style={styles.selectionCountText}>
                                {selectedCategoryIds.length} categories ·{' '}
                                {selectedSubcategories.length} subcategories
                                selected
                            </Text>
                        </View>

                        {/* SERVICE SEARCH AND ADD */}

                        <View style={styles.toolbar}>
                            <TextInput
                                style={styles.searchInput}
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Search services, categories..."
                                placeholderTextColor="#9993A8"
                                returnKeyType="search"
                            />

                            <AppGradient
                                colors={[...GRADIENTS.SOFT_PURPLE]}
                                style={[
                                    styles.addButtonGradient,
                                    isLocked && styles.disabledButton,
                                ]}
                            >
                                <TouchableOpacity
                                    disabled={isLocked}
                                    style={styles.addButtonInner}
                                    onPress={openAddService}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.addButtonText}>
                                        + Add service
                                    </Text>
                                </TouchableOpacity>
                            </AppGradient>
                        </View>

                        <View style={styles.resultsHeader}>
                            <View style={styles.resultsHeadingBlock}>
                                <Text style={styles.resultsTitle}>
                                    {AUDIENCE_LABELS[selectedAudience]} services
                                </Text>
                                <Text style={styles.resultsSubtitle}>
                                    Category {'›'} Subcategory {'›'} Service
                                </Text>
                            </View>

                            <Text style={styles.resultsCount}>
                                {filteredServices.length}{' '}
                                {filteredServices.length === 1
                                    ? 'service'
                                    : 'services'}
                            </Text>
                        </View>
                    </View>
                }
                renderItem={({ item: category }) => {
                    const categoryExpanded =
                        !!expandedCategories[category.categoryId];

                    return (
                        <View style={styles.categoryCard}>
                            <TouchableOpacity
                                style={styles.categoryAccordion}
                                onPress={() =>
                                    toggleCategory(category.categoryId)
                                }
                                activeOpacity={0.75}
                            >
                                <View style={styles.categoryIcon}>
                                    <Text style={styles.categoryIconText}>
                                        {category.categoryName
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.categoryHeading}>
                                    <Text style={styles.categoryName}>
                                        {category.categoryName}
                                    </Text>

                                    <Text style={styles.categoryMeta}>
                                        {category.subcategories.length}{' '}
                                        {category.subcategories.length === 1
                                            ? 'subcategory'
                                            : 'subcategories'}
                                        {' · '}
                                        {category.serviceCount}{' '}
                                        {category.serviceCount === 1
                                            ? 'service'
                                            : 'services'}
                                    </Text>
                                </View>

                                <Text style={styles.accordionChevron}>
                                    {categoryExpanded ? '−' : '+'}
                                </Text>
                            </TouchableOpacity>

                            {categoryExpanded && (
                                <View style={styles.subcategoryList}>
                                    {category.subcategories.map(subcategory => {
                                        const subcategoryExpanded =
                                            !!expandedSubcategories[
                                            subcategory.subcategoryId
                                            ];

                                        return (
                                            <View
                                                key={subcategory.subcategoryId}
                                                style={styles.subcategoryCard}
                                            >
                                                <TouchableOpacity
                                                    style={styles.subcategoryAccordion}
                                                    onPress={() =>
                                                        toggleSubcategory(
                                                            subcategory.subcategoryId,
                                                        )
                                                    }
                                                    activeOpacity={0.75}
                                                >
                                                    <View
                                                        style={styles.subcategoryMarker}
                                                    />

                                                    <View
                                                        style={styles.subcategoryHeading}
                                                    >
                                                        <Text
                                                            style={styles.subcategoryName}
                                                        >
                                                            {subcategory.subcategoryName}
                                                        </Text>
                                                        <Text style={styles.subcategoryMeta}>
                                                            {subcategory.services.length}{' '}
                                                            {subcategory.services.length === 1
                                                                ? 'service'
                                                                : 'services'}
                                                        </Text>
                                                    </View>

                                                    <Text
                                                        style={styles.subcategoryChevron}
                                                    >
                                                        {subcategoryExpanded ? '−' : '+'}
                                                    </Text>
                                                </TouchableOpacity>

                                                {subcategoryExpanded && (
                                                    <View
                                                        style={styles.servicesUnderSubcategory}
                                                    >
                                                        {subcategory.services.map(service => (
                                                            <View
                                                                key={`${service._index}-${service.serviceName}`}
                                                                style={styles.serviceRow}
                                                            >
                                                                <View
                                                                    style={styles.serviceRowContent}
                                                                >
                                                                    <Text style={styles.serviceName}>
                                                                        {service.serviceName}
                                                                    </Text>
                                                                    <Text
                                                                        style={styles.serviceDetails}
                                                                    >
                                                                        {money(Number(service.price))}
                                                                        {' · '}
                                                                        {Number(service.duration)} min
                                                                    </Text>
                                                                </View>

                                                                <View
                                                                    style={styles.serviceRowActions}
                                                                >
                                                                    <TouchableOpacity
                                                                        disabled={isLocked}
                                                                        onPress={() =>
                                                                            openEditService(service)
                                                                        }
                                                                        style={[
                                                                            styles.iconAction,
                                                                            isLocked &&
                                                                            styles.actionDisabled,
                                                                        ]}
                                                                        accessibilityLabel={`Edit ${service.serviceName}`}
                                                                    >
                                                                        <Text
                                                                            style={styles.editActionText}
                                                                        >
                                                                            Edit
                                                                        </Text>
                                                                    </TouchableOpacity>

                                                                    <TouchableOpacity
                                                                        disabled={isLocked}
                                                                        onPress={() =>
                                                                            deleteService(service._index)
                                                                        }
                                                                        style={[
                                                                            styles.iconAction,
                                                                            isLocked &&
                                                                            styles.actionDisabled,
                                                                        ]}
                                                                        accessibilityLabel={`Remove ${service.serviceName}`}
                                                                    >
                                                                        <Text
                                                                            style={styles.removeActionText}
                                                                        >
                                                                            Remove
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Text style={styles.emptyIconText}>＋</Text>
                        </View>

                        <Text style={styles.emptyTitle}>
                            {draft.length === 0
                                ? `No ${AUDIENCE_LABELS[
                                    selectedAudience
                                ].toLowerCase()} services yet`
                                : 'No matching services'}
                        </Text>

                        <Text style={styles.emptyDescription}>
                            {draft.length === 0
                                ? 'You can select categories and subcategories above without adding a service. Add services whenever you are ready.'
                                : 'Try another search term or switch to another audience.'}
                        </Text>

                        {draft.length === 0 && (
                            <TouchableOpacity
                                disabled={isLocked}
                                onPress={openAddService}
                                style={[
                                    styles.emptyAddButton,
                                    isLocked && styles.actionDisabled,
                                ]}
                            >
                                <Text style={styles.emptyAddButtonText}>
                                    + Add{' '}
                                    {AUDIENCE_LABELS[
                                        selectedAudience
                                    ].toLowerCase()}{' '}
                                    service
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
                ListFooterComponent={
                    <View style={styles.footer}>
                        <View style={styles.reviewSummary}>
                            <Text style={styles.reviewSummaryTitle}>
                                Before submitting
                            </Text>
                            <Text style={styles.reviewSummaryText}>
                                Review your salon details, target audiences,
                                categories, subcategories, service names, prices,
                                and durations. Your live profile will not change
                                until admin approval.
                            </Text>
                        </View>

                        <AppGradient
                            colors={[...GRADIENTS.SOFT_PURPLE]}
                            style={[
                                styles.submitButton,
                                isLocked && styles.disabledButton,
                            ]}
                        >
                            <TouchableOpacity
                                disabled={isLocked || !!pendingError}
                                onPress={submitForReview}
                                style={styles.submitButtonInner}
                                activeOpacity={0.85}
                            >
                                {submitting ? (
                                    <ActivityIndicator color={WHITE} />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {isPending
                                            ? 'Review pending'
                                            : 'Confirm & submit for review'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </AppGradient>

                        {isPending && (
                            <Text style={styles.lockHint}>
                                Editing will be available after the review status
                                changes.
                            </Text>
                        )}
                    </View>
                }
            />

            {/* ========================================================
          ADD / EDIT SERVICE MODAL
      ======================================================== */}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeServiceModal}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalSheet}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalHeaderRow}>
                                <View style={styles.modalHeadingContent}>
                                    <Text style={styles.modalTitle}>
                                        {editingIndex === null
                                            ? 'Add service'
                                            : 'Edit service'}
                                    </Text>
                                    <Text style={styles.modalSubtitle}>
                                        Select a Clavata category and subcategory,
                                        then enter your service details.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={closeServiceModal}
                                    style={styles.modalCloseButton}
                                    accessibilityLabel="Close service modal"
                                >
                                    <Text style={styles.modalCloseText}>×</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Audience</Text>

                            <View style={styles.modalAudienceTabs}>
                                {AUDIENCES.map(audience => {
                                    const active =
                                        serviceDraft.audience === audience;

                                    return (
                                        <TouchableOpacity
                                            key={audience}
                                            onPress={() =>
                                                changeDraftAudience(audience)
                                            }
                                            style={[
                                                styles.modalAudienceTab,
                                                active &&
                                                styles.modalAudienceTabSelected,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.modalAudienceText,
                                                    active &&
                                                    styles.modalAudienceTextSelected,
                                                ]}
                                            >
                                                {AUDIENCE_LABELS[audience]}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={styles.inputLabel}>
                                Clavata category
                            </Text>

                            {categoriesLoading && categories.length === 0 ? (
                                <View style={styles.subcategoryLoading}>
                                    <ActivityIndicator color={PURPLE} />
                                    <Text style={styles.muted}>
                                        Loading categories…
                                    </Text>
                                </View>
                            ) : categoriesError ? (
                                <View style={styles.inlineErrorContainer}>
                                    <Text style={styles.subcategoryError}>
                                        Could not load categories.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => refetchCategories()}
                                        style={styles.retryButton}
                                    >
                                        <Text style={styles.retryText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : categories.length === 0 ? (
                                <Text style={styles.emptyOptionText}>
                                    No active categories are available. Contact
                                    Clavata support if this continues.
                                </Text>
                            ) : (
                                <View style={styles.optionWrap}>
                                    {categories.map(category => (
                                        <TouchableOpacity
                                            key={category.id}
                                            onPress={() =>
                                                chooseServiceCategory(category)
                                            }
                                            style={[
                                                styles.optionChip,
                                                serviceDraft.categoryId === category.id &&
                                                styles.optionChipSelected,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    serviceDraft.categoryId === category.id &&
                                                    styles.optionTextSelected,
                                                ]}
                                            >
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.inputLabel}>
                                Clavata subcategory
                            </Text>

                            {!serviceDraft.categoryId ? (
                                <Text style={styles.emptyOptionText}>
                                    Select a category first.
                                </Text>
                            ) : modalSubcategoriesLoading ? (
                                <View style={styles.subcategoryLoading}>
                                    <ActivityIndicator color={PURPLE} />
                                    <Text style={styles.muted}>
                                        Loading subcategories…
                                    </Text>
                                </View>
                            ) : modalSubcategoriesError ? (
                                <View style={styles.inlineErrorContainer}>
                                    <Text style={styles.subcategoryError}>
                                        Could not load subcategories.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => refetchModalSubcategories()}
                                        style={styles.retryButton}
                                    >
                                        <Text style={styles.retryText}>
                                            Retry subcategories
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : visibleModalSubcategories.length === 0 ? (
                                <Text style={styles.emptyOptionText}>
                                    No active subcategories support this audience
                                    under the selected category.
                                </Text>
                            ) : (
                                <View style={styles.optionWrap}>
                                    {visibleModalSubcategories.map(subcategory => (
                                        <TouchableOpacity
                                            key={subcategory.subcategoryId}
                                            onPress={() =>
                                                chooseServiceSubcategory(subcategory)
                                            }
                                            style={[
                                                styles.optionChip,
                                                serviceDraft.subcategoryId ===
                                                subcategory.subcategoryId &&
                                                styles.optionChipSelected,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    serviceDraft.subcategoryId ===
                                                    subcategory.subcategoryId &&
                                                    styles.optionTextSelected,
                                                ]}
                                            >
                                                {subcategory.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.inputLabel}>Service name</Text>
                            <TextInput
                                style={styles.input}
                                value={serviceDraft.serviceName}
                                onChangeText={value =>
                                    setServiceDraft(current => ({
                                        ...current,
                                        serviceName: value,
                                    }))
                                }
                                placeholder="e.g. Haircut"
                                placeholderTextColor="#9993A8"
                                autoCapitalize="words"
                                maxLength={100}
                            />

                            <Text style={styles.inputLabel}>Price (₹)</Text>
                            <TextInput
                                style={styles.input}
                                value={serviceDraft.price}
                                onChangeText={value =>
                                    setServiceDraft(current => ({
                                        ...current,
                                        price: value,
                                    }))
                                }
                                keyboardType="decimal-pad"
                                placeholder="e.g. 499"
                                placeholderTextColor="#9993A8"
                            />

                            <Text style={styles.inputLabel}>
                                Duration (minutes)
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={serviceDraft.duration}
                                onChangeText={value =>
                                    setServiceDraft(current => ({
                                        ...current,
                                        duration: value,
                                    }))
                                }
                                keyboardType="number-pad"
                                placeholder="e.g. 45"
                                placeholderTextColor="#9993A8"
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={closeServiceModal}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <AppGradient
                                    colors={[...GRADIENTS.SOFT_PURPLE]}
                                    style={[
                                        styles.modalPrimaryGradient,
                                        isLocked && styles.disabledButton,
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.modalPrimaryInner}
                                        onPress={saveService}
                                        disabled={isLocked}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            {editingIndex === null
                                                ? 'Add service'
                                                : 'Save changes'}
                                        </Text>
                                    </TouchableOpacity>
                                </AppGradient>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FAF9FD',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FAF9FD',
    },
    loadingText: {
        marginTop: 12,
        color: MUTED,
        fontSize: 14,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: TEXT,
        textAlign: 'center',
    },
    muted: {
        marginTop: 8,
        color: MUTED,
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        paddingBottom: 32,
    },
    headerGradient: {
        marginBottom: 16,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 24,
    },
    headerText: {
        flex: 1,
        paddingRight: 12,
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.6,
        color: WHITE,
        opacity: 0.9,
    },
    title: {
        marginTop: 5,
        fontSize: 25,
        fontWeight: '800',
        color: WHITE,
    },
    subtitle: {
        marginTop: 7,
        fontSize: 13,
        lineHeight: 19,
        color: WHITE,
        opacity: 0.92,
    },
    countBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 68,
        height: 68,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    countNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: WHITE,
    },
    countLabel: {
        fontSize: 10,
        color: WHITE,
        fontWeight: '600',
    },
    pendingBanner: {
        marginHorizontal: 16,
        marginBottom: 14,
        padding: 15,
        borderRadius: 16,
        backgroundColor: '#F1ECFF',
        borderWidth: 1,
        borderColor: '#DDD2FF',
    },
    rejectedBanner: {
        marginHorizontal: 16,
        marginBottom: 14,
        padding: 15,
        borderRadius: 16,
        backgroundColor: '#FFF0F2',
        borderWidth: 1,
        borderColor: '#F2C9D0',
    },
    pendingTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: TEXT,
    },
    pendingDescription: {
        marginTop: 5,
        color: MUTED,
        fontSize: 13,
        lineHeight: 19,
    },
    pendingDate: {
        marginTop: 8,
        color: PURPLE_DARK,
        fontSize: 12,
        fontWeight: '700',
    },
    inlineWarning: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#FFF7E8',
        borderWidth: 1,
        borderColor: '#F0DDB8',
    },
    inlineWarningText: {
        color: '#805D1C',
        fontSize: 12,
        lineHeight: 18,
    },
    audienceSection: {
        marginTop: 3,
    },
    sectionLabel: {
        marginHorizontal: 20,
        marginBottom: 10,
        color: MUTED,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.1,
    },
    audienceTabs: {
        flexDirection: 'row',
        marginHorizontal: 16,
        padding: 4,
        gap: 5,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: '#F1EEF7',
    },
    audienceTab: {
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 12,
        paddingHorizontal: 4,
    },
    audienceTabActive: {
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: '#DED2FF',
        shadowColor: '#49337C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 1,
    },
    audienceTabText: {
        fontSize: 12,
        fontWeight: '700',
        color: MUTED,
    },
    audienceTabTextActive: {
        color: PURPLE_DARK,
        fontWeight: '800',
    },
    audienceCountBadge: {
        minWidth: 19,
        height: 19,
        paddingHorizontal: 4,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E5E1ED',
    },
    audienceCountBadgeActive: {
        backgroundColor: PURPLE_LIGHT,
    },
    audienceCountText: {
        color: MUTED,
        fontSize: 10,
        fontWeight: '800',
    },
    audienceCountTextActive: {
        color: PURPLE_DARK,
    },
    catalogueSelectionSection: {
        marginHorizontal: 16,
        marginTop: 18,
        padding: 15,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
        gap: 10,
    },
    catalogueSelectionTitle: {
        marginTop: 4,
        color: TEXT,
        fontSize: 14,
        fontWeight: '800',
    },
    catalogueSelectionDescription: {
        color: MUTED,
        fontSize: 12,
        lineHeight: 18,
    },
    selectedCategoryLabel: {
        marginTop: 5,
        color: PURPLE_DARK,
        fontSize: 12,
        fontWeight: '800',
    },
    selectionCountText: {
        marginTop: 4,
        color: MUTED,
        fontSize: 11,
        fontWeight: '600',
    },
    toolbar: {
        marginTop: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    searchInput: {
        flex: 1,
        minHeight: 46,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 14,
        backgroundColor: WHITE,
        paddingHorizontal: 13,
        color: TEXT,
        fontSize: 13,
    },
    addButtonGradient: {
        minHeight: 46,
        borderRadius: 14,
        overflow: 'hidden',
    },
    addButtonInner: {
        minHeight: 46,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 13,
    },
    addButtonText: {
        color: WHITE,
        fontWeight: '700',
        fontSize: 12,
    },
    disabledButton: {
        opacity: 0.45,
    },
    resultsHeader: {
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultsHeadingBlock: {
        flex: 1,
        paddingRight: 8,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: TEXT,
    },
    resultsSubtitle: {
        marginTop: 5,
        color: MUTED,
        fontSize: 11,
    },
    resultsCount: {
        fontSize: 11,
        color: PURPLE_DARK,
        fontWeight: '700',
    },
    categoryCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
        overflow: 'hidden',
    },
    categoryAccordion: {
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    categoryIcon: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: PURPLE_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIconText: {
        color: PURPLE_DARK,
        fontSize: 18,
        fontWeight: '800',
    },
    categoryHeading: {
        flex: 1,
        paddingHorizontal: 11,
    },
    categoryName: {
        color: TEXT,
        fontSize: 15,
        fontWeight: '800',
    },
    categoryMeta: {
        marginTop: 5,
        color: MUTED,
        fontSize: 11,
    },
    accordionChevron: {
        width: 30,
        textAlign: 'center',
        color: PURPLE_DARK,
        fontSize: 25,
        fontWeight: '400',
    },
    subcategoryList: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0EDF5',
        backgroundColor: '#FCFBFE',
    },
    subcategoryCard: {
        marginTop: 9,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#ECE6F7',
        backgroundColor: WHITE,
        overflow: 'hidden',
    },
    subcategoryAccordion: {
        minHeight: 57,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    subcategoryMarker: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: PURPLE,
        marginRight: 10,
    },
    subcategoryHeading: {
        flex: 1,
    },
    subcategoryName: {
        color: TEXT,
        fontSize: 13,
        fontWeight: '700',
    },
    subcategoryMeta: {
        marginTop: 4,
        color: MUTED,
        fontSize: 10,
    },
    subcategoryChevron: {
        width: 25,
        textAlign: 'center',
        color: PURPLE_DARK,
        fontSize: 21,
    },
    servicesUnderSubcategory: {
        paddingHorizontal: 11,
        paddingBottom: 5,
        borderTopWidth: 1,
        borderTopColor: '#F0EDF5',
        backgroundColor: '#FFFEFF',
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F0F7',
    },
    serviceRowContent: {
        flex: 1,
        paddingRight: 7,
    },
    serviceName: {
        color: TEXT,
        fontSize: 13,
        fontWeight: '700',
    },
    serviceDetails: {
        marginTop: 5,
        color: PURPLE_DARK,
        fontSize: 12,
        fontWeight: '700',
    },
    serviceRowActions: {
        alignItems: 'flex-end',
        gap: 5,
    },
    iconAction: {
        minWidth: 54,
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#F5F1FF',
    },
    editActionText: {
        color: PURPLE_DARK,
        fontSize: 11,
        fontWeight: '800',
    },
    removeActionText: {
        color: DANGER,
        fontSize: 11,
        fontWeight: '700',
    },
    actionDisabled: {
        opacity: 0.35,
    },
    emptyState: {
        marginHorizontal: 16,
        paddingHorizontal: 22,
        paddingVertical: 35,
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: BORDER,
        borderStyle: 'dashed',
        backgroundColor: WHITE,
    },
    emptyIcon: {
        width: 50,
        height: 50,
        borderRadius: 17,
        backgroundColor: PURPLE_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconText: {
        color: PURPLE_DARK,
        fontSize: 29,
        fontWeight: '400',
    },
    emptyTitle: {
        marginTop: 13,
        fontSize: 16,
        fontWeight: '800',
        color: TEXT,
        textAlign: 'center',
    },
    emptyDescription: {
        marginTop: 7,
        fontSize: 12,
        lineHeight: 19,
        color: MUTED,
        textAlign: 'center',
    },
    emptyAddButton: {
        marginTop: 17,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 12,
        backgroundColor: PURPLE_LIGHT,
    },
    emptyAddButtonText: {
        color: PURPLE_DARK,
        fontSize: 12,
        fontWeight: '800',
    },
    footer: {
        paddingHorizontal: 16,
        paddingTop: 15,
    },
    reviewSummary: {
        padding: 15,
        borderRadius: 16,
        backgroundColor: '#F3EEFF',
        borderWidth: 1,
        borderColor: '#E4D9FF',
    },
    reviewSummaryTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: TEXT,
    },
    reviewSummaryText: {
        marginTop: 6,
        fontSize: 12,
        lineHeight: 18,
        color: MUTED,
    },
    submitButton: {
        marginTop: 13,
        minHeight: 52,
        borderRadius: 15,
        overflow: 'hidden',
    },
    submitButtonInner: {
        minHeight: 52,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    submitButtonText: {
        color: WHITE,
        fontSize: 14,
        fontWeight: '800',
    },
    lockHint: {
        marginTop: 8,
        marginBottom: 12,
        textAlign: 'center',
        fontSize: 11,
        lineHeight: 16,
        color: MUTED,
    },
    gradientButton: {
        minWidth: 140,
        marginTop: 18,
        borderRadius: 13,
        overflow: 'hidden',
    },
    primaryButtonInner: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        color: WHITE,
        fontSize: 13,
        fontWeight: '800',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(25, 18, 43, 0.45)',
    },
    modalSheet: {
        maxHeight: '92%',
        paddingHorizontal: 20,
        paddingTop: 23,
        paddingBottom: 28,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        backgroundColor: WHITE,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    modalHeadingContent: {
        flex: 1,
        paddingRight: 10,
    },
    modalCloseButton: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: '#F3F0F8',
    },
    modalCloseText: {
        color: TEXT,
        fontSize: 25,
        lineHeight: 28,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: TEXT,
    },
    modalSubtitle: {
        marginTop: 7,
        marginBottom: 15,
        fontSize: 12,
        lineHeight: 18,
        color: MUTED,
    },
    inputLabel: {
        marginTop: 15,
        marginBottom: 8,
        fontSize: 12,
        fontWeight: '800',
        color: TEXT,
    },
    input: {
        minHeight: 47,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        paddingHorizontal: 13,
        color: TEXT,
        backgroundColor: '#FEFDFF',
        fontSize: 14,
    },
    modalAudienceTabs: {
        flexDirection: 'row',
        gap: 7,
    },
    modalAudienceTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 42,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
    },
    modalAudienceTabSelected: {
        borderColor: PURPLE,
        backgroundColor: PURPLE_LIGHT,
    },
    modalAudienceText: {
        color: MUTED,
        fontSize: 12,
        fontWeight: '700',
    },
    modalAudienceTextSelected: {
        color: PURPLE_DARK,
        fontWeight: '800',
    },
    optionWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        paddingHorizontal: 11,
        paddingVertical: 9,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
    },
    optionChipSelected: {
        borderColor: PURPLE,
        backgroundColor: PURPLE_LIGHT,
    },
    optionText: {
        color: MUTED,
        fontSize: 12,
        fontWeight: '600',
    },
    optionTextSelected: {
        color: PURPLE_DARK,
        fontWeight: '800',
    },
    subcategoryLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    emptyOptionText: {
        paddingVertical: 9,
        paddingHorizontal: 11,
        borderRadius: 11,
        backgroundColor: '#F8F6FC',
        color: MUTED,
        fontSize: 12,
        lineHeight: 18,
    },
    inlineErrorContainer: {
        padding: 11,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F2C9D0',
        backgroundColor: '#FFF7F8',
    },
    subcategoryError: {
        color: DANGER,
        fontSize: 12,
        lineHeight: 18,
    },
    retryButton: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 2,
    },
    retryText: {
        color: PURPLE_DARK,
        fontSize: 12,
        fontWeight: '800',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 23,
    },
    cancelButton: {
        flex: 1,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 13,
        backgroundColor: '#F2F0F6',
    },
    cancelButtonText: {
        color: TEXT,
        fontSize: 13,
        fontWeight: '700',
    },
    modalPrimaryGradient: {
        flex: 1,
        minHeight: 48,
        borderRadius: 13,
        overflow: 'hidden',
    },
    modalPrimaryInner: {
        flex: 1,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
});
