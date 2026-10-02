import React, {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  useSalonRegistration,
  ServiceAudience,
} from '../../context/SalonRegistrationContext';

import {
  useQuery,
} from '@apollo/client';

import {
  GET_BUSINESS_TYPES,
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
  servicesCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Subcategory = {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  servicesCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;

  audiences?: ServiceAudience[];
  businessTypeIds?: string[];
};

type BusinessType = {
  businessTypeId: string;
  name: string;
};

type ConfiguredService =
  SalonServiceSelection & {
    serviceKey: string;
    businessTypeId?: string;
    name: string;
    description?: string;
    price?: number;
    durationMinutes?: number;
  };

type ServiceFormState = {
  serviceKey?: string;

  businessTypeId: string;
  audience: ServiceAudience;

  categoryId: string;
  categoryName: string;

  subcategoryId: string;
  subcategoryName: string;

  name: string;
  description: string;
  price: string;
  durationMinutes: string;
};

// ============================================================
// CONSTANTS
// ============================================================

const AUDIENCE_TABS: {
  key: ServiceAudience;
  label: string;
}[] = [
    {
      key: 'FEMALE',
      label: 'Female',
    },
    {
      key: 'MALE',
      label: 'Male',
    },
    {
      key: 'KIDS',
      label: 'Kids',
    },
  ];

// ============================================================
// HELPERS
// ============================================================

const normalizeText = (
  value?: unknown,
): string => {
  return String(value ?? '').trim();
};

const createServiceKey = (
  businessTypeId: string,
  audience: ServiceAudience,
  categoryId: string,
  subcategoryId: string,
): string => {
  return [
    'SERVICE',
    businessTypeId,
    audience,
    categoryId,
    subcategoryId,
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2, 8),
  ].join('-');
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

const getBusinessTypeId = (
  item: any,
): string => {
  return normalizeText(
    item?.businessTypeId ??
    item?.id ??
    item?.businessTypeID,
  );
};

const getBusinessTypeName = (
  item: any,
): string => {
  return normalizeText(
    item?.name ??
    item?.businessType ??
    item?.label ??
    item?.businessTypeName,
  );
};

const parsePositiveNumber = (
  value: string,
): number | undefined => {
  const normalized = value
    .replace(/,/g, '')
    .trim();

  if (!normalized) {
    return undefined;
  }

  const numberValue =
    Number(normalized);

  if (
    !Number.isFinite(numberValue) ||
    numberValue <= 0
  ) {
    return undefined;
  }

  return numberValue;
};

// ============================================================
// SCREEN
// ============================================================

export default function SalonServices({
  navigation,
}: any) {
  const {
    data,
    updateData,
  } = useSalonRegistration();

  // ==========================================================
  // MODAL
  // ==========================================================

  const [
    servicesModalVisible,
    setServicesModalVisible,
  ] = useState(false);

  // ==========================================================
  // ACTIVE BUSINESS TYPE
  // ==========================================================

  const [
    activeBusinessTypeId,
    setActiveBusinessTypeId,
  ] = useState<string | null>(null);

  // ==========================================================
  // ACTIVE AUDIENCE
  // ==========================================================

  const [
    activeAudience,
    setActiveAudience,
  ] = useState<ServiceAudience | null>(
    null,
  );

  // ==========================================================
  // OPEN CATEGORIES
  // ==========================================================

  const [
    openCategories,
    setOpenCategories,
  ] = useState<
    Record<string, boolean>
  >({});

  // ==========================================================
  // SERVICE FORM
  // ==========================================================

  const [
    serviceForm,
    setServiceForm,
  ] = useState<ServiceFormState | null>(
    null,
  );

  const [
    savingService,
    setSavingService,
  ] = useState(false);

  // ==========================================================
  // SUBMITTING
  // ==========================================================

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ==========================================================
  // CATEGORY QUERY
  // ==========================================================

  const {
    data: categoryResponse,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(
    GET_CLAVATA_CATEGORIES,
    {
      fetchPolicy: 'network-only',
    },
  );

  // ==========================================================
  // SUBCATEGORY QUERY
  // ==========================================================

  const {
    data: subcategoryResponse,
    loading: subcategoriesLoading,
    error: subcategoriesError,
    refetch: refetchSubcategories,
  } = useQuery(
    GET_CLAVATA_SUBCATEGORIES,
    {
      fetchPolicy: 'network-only',
    },
  );

  // ==========================================================
  // BUSINESS TYPE QUERY
  // ==========================================================

  const {
    data: businessTypesResponse,
    loading: businessTypesLoading,
    error: businessTypesError,
    refetch: refetchBusinessTypes,
  } = useQuery(
    GET_BUSINESS_TYPES,
    {
      variables: {
        status: 'ACTIVE',
      },
      fetchPolicy: 'cache-first',
    },
  );

  // ==========================================================
  // SELECTED BUSINESS TYPE IDS
  // ==========================================================

  const selectedBusinessTypeIds =
    useMemo(() => {
      const ids = Array.isArray(
        (data as any)?.businessTypeIds,
      )
        ? (data as any).businessTypeIds
        : (
          data as any
        )?.businessTypeId
          ? [
            (
              data as any
            ).businessTypeId,
          ]
          : [];

      return ids
        .map((id: unknown) =>
          normalizeText(id),
        )
        .filter(Boolean);
    }, [
      (data as any)?.businessTypeIds,
      (data as any)?.businessTypeId,
    ]);

  // ==========================================================
  // BUSINESS TYPES
  // ==========================================================

  const businessTypes =
    useMemo<BusinessType[]>(() => {
      const raw =
        Array.isArray(
          businessTypesResponse
            ?.businessTypes
            ?.businessTypes,
        )
          ? businessTypesResponse
            .businessTypes
            .businessTypes
          : [];

      const masterMap =
        new Map<
          string,
          BusinessType
        >();

      raw.forEach(
        (item: any) => {
          const id =
            getBusinessTypeId(item);

          const name =
            getBusinessTypeName(item);

          if (
            !id ||
            !name
          ) {
            return;
          }

          masterMap.set(
            id,
            {
              businessTypeId: id,
              name,
            },
          );
        },
      );

      /*
       * IMPORTANT:
       * Preserve the exact business-type order selected
       * during registration.
       */
      return selectedBusinessTypeIds.map(
        (id: string) => {
          const master =
            masterMap.get(id);

          return (
            master || {
              businessTypeId: id,
              name:
                id.replace(
                  /^BT#/,
                  '',
                ),
            }
          );
        },
      );
    }, [
      businessTypesResponse,
      selectedBusinessTypeIds,
    ]);

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories =
    useMemo<Category[]>(() => {
      const raw =
        Array.isArray(
          categoryResponse
            ?.categories
            ?.categories,
        )
          ? categoryResponse
            .categories
            .categories
          : [];

      const unique =
        new Map<
          string,
          Category
        >();

      raw.forEach(
        (category: Category) => {
          const id =
            normalizeText(
              category?.categoryId,
            );

          if (
            id &&
            !unique.has(id)
          ) {
            unique.set(
              id,
              {
                ...category,
                categoryId: id,
                name:
                  normalizeText(
                    category.name,
                  ),
              },
            );
          }
        },
      );

      return Array.from(
        unique.values(),
      );
    }, [
      categoryResponse,
    ]);

  // ==========================================================
  // SUBCATEGORIES
  // ==========================================================

  const subcategories =
    useMemo<Subcategory[]>(() => {
      const raw =
        Array.isArray(
          subcategoryResponse
            ?.subcategories
            ?.subcategories,
        )
          ? subcategoryResponse
            .subcategories
            .subcategories
          : [];

      const unique =
        new Map<
          string,
          Subcategory
        >();

      raw.forEach(
        (subcategory: Subcategory) => {
          const categoryId =
            normalizeText(
              subcategory?.categoryId,
            );

          const subcategoryId =
            normalizeText(
              subcategory?.subcategoryId,
            );

          if (
            !categoryId ||
            !subcategoryId
          ) {
            return;
          }

          const key =
            `${categoryId}-${subcategoryId}`;

          if (
            !unique.has(key)
          ) {
            unique.set(
              key,
              {
                ...subcategory,

                categoryId,

                subcategoryId,

                name:
                  normalizeText(
                    subcategory.name,
                  ),

                businessTypeIds:
                  Array.isArray(
                    subcategory.businessTypeIds,
                  )
                    ? subcategory
                      .businessTypeIds
                      .map(id =>
                        normalizeText(
                          id,
                        ),
                      )
                      .filter(Boolean)
                    : [],

                audiences:
                  Array.isArray(
                    subcategory.audiences,
                  )
                    ? subcategory.audiences
                    : [],
              },
            );
          }
        },
      );

      return Array.from(
        unique.values(),
      );
    }, [
      subcategoryResponse,
    ]);

  // ==========================================================
  // TARGET AUDIENCES
  // ==========================================================

  const availableAudiences =
    useMemo<ServiceAudience[]>(() => {
      const audiences =
        Array.isArray(
          data?.targetAudiences,
        )
          ? data.targetAudiences
          : [];

      return audiences.filter(
        (
          audience: any,
        ): audience is ServiceAudience =>
          audience === 'FEMALE' ||
          audience === 'MALE' ||
          audience === 'KIDS',
      );
    }, [
      data?.targetAudiences,
    ]);

  // ==========================================================
  // CURRENT SERVICES
  // ==========================================================

  const selectedServices =
    useMemo<ConfiguredService[]>(() => {
      if (
        !Array.isArray(
          data?.serviceSelections,
        )
      ) {
        return [];
      }

      return (
        data.serviceSelections as ConfiguredService[]
      )
        .map(
          (
            service,
            index,
          ) => ({
            ...service,

            serviceKey:
              normalizeText(
                service.serviceKey,
              ) ||
              `LEGACY-${index}-${Date.now()}`,

            businessTypeId:
              normalizeText(
                service.businessTypeId,
              ) ||
              undefined,

            name:
              normalizeText(
                service.name,
              ),

            description:
              normalizeText(
                service.description,
              ),

            price:
              typeof service.price ===
                'number'
                ? service.price
                : undefined,

            durationMinutes:
              typeof service.durationMinutes ===
                'number'
                ? service.durationMinutes
                : undefined,
          }),
        );
    }, [
      data?.serviceSelections,
    ]);

  // ==========================================================
  // CURRENT BUSINESS TYPE
  // ==========================================================

  const activeBusinessType =
    useMemo(() => {
      if (
        !activeBusinessTypeId
      ) {
        return null;
      }

      return (
        businessTypes.find(
          businessType =>
            businessType.businessTypeId ===
            activeBusinessTypeId,
        ) || null
      );
    }, [
      businessTypes,
      activeBusinessTypeId,
    ]);

  // ==========================================================
  // SERVICES FOR ACTIVE BUSINESS TYPE
  // ==========================================================

  const activeBusinessTypeServices =
    useMemo(() => {
      if (
        !activeBusinessTypeId
      ) {
        return [];
      }

      return selectedServices.filter(
        service =>
          normalizeText(
            service.businessTypeId,
          ) ===
          activeBusinessTypeId,
      );
    }, [
      selectedServices,
      activeBusinessTypeId,
    ]);

  // ==========================================================
  // BUSINESS TYPE COMPLETION
  // ==========================================================

  const getBusinessTypeServiceCount =
    (
      businessTypeId: string,
    ): number => {
      return selectedServices.filter(
        service =>
          normalizeText(
            service.businessTypeId,
          ) === businessTypeId &&
          normalizeText(
            service.name,
          ),
      ).length;
    };

  const isBusinessTypeComplete =
    (
      businessTypeId: string,
    ): boolean => {
      return (
        getBusinessTypeServiceCount(
          businessTypeId,
        ) > 0
      );
    };

  // ==========================================================
  // APPLICABLE SUBCATEGORIES
  // ==========================================================

  const activeAudienceSubcategories =
    useMemo(() => {
      if (
        !activeBusinessTypeId ||
        !activeAudience
      ) {
        return [];
      }

      return subcategories.filter(
        subcategory => {
          const businessTypeIds =
            Array.isArray(
              subcategory.businessTypeIds,
            )
              ? subcategory.businessTypeIds
              : [];

          const audiences =
            Array.isArray(
              subcategory.audiences,
            )
              ? subcategory.audiences
              : [];

          const matchesBusinessType =
            businessTypeIds.includes(
              activeBusinessTypeId,
            );

          const matchesAudience =
            audiences.includes(
              activeAudience,
            );

          return (
            matchesBusinessType &&
            matchesAudience
          );
        },
      );
    }, [
      subcategories,
      activeBusinessTypeId,
      activeAudience,
    ]);

  // ==========================================================
  // APPLICABLE CATEGORIES
  // ==========================================================

  const activeCategories =
    useMemo(() => {
      const categoryIds =
        new Set(
          activeAudienceSubcategories.map(
            subcategory =>
              subcategory.categoryId,
          ),
        );

      return categories.filter(
        category =>
          categoryIds.has(
            category.categoryId,
          ),
      );
    }, [
      categories,
      activeAudienceSubcategories,
    ]);

  // ==========================================================
  // SAVE CONTEXT SERVICES
  // ==========================================================

  const saveServices = (
    services: ConfiguredService[],
  ) => {
    updateData({
      serviceSelections:
        services as any,
    });
  };

  // ==========================================================
  // OPEN SERVICES
  // ==========================================================

  const openServicesModal =
    () => {
      if (
        businessTypes.length ===
        0
      ) {
        Alert.alert(
          'Business type required',
          'Please select at least one business type before configuring services.',
        );

        return;
      }

      if (
        availableAudiences.length ===
        0
      ) {
        Alert.alert(
          'Audience required',
          'Please select at least one service audience before configuring services.',
        );

        return;
      }

      /*
       * Start with the first selected business type.
       * If the provider previously opened this screen,
       * restore the last active business type.
       */
      setActiveBusinessTypeId(
        previous =>
          previous &&
            businessTypes.some(
              item =>
                item.businessTypeId ===
                previous,
            )
            ? previous
            : businessTypes[0]
              .businessTypeId,
      );

      setActiveAudience(
        previous =>
          previous &&
            availableAudiences.includes(
              previous,
            )
            ? previous
            : availableAudiences[0],
      );

      setOpenCategories({});

      setServicesModalVisible(
        true,
      );
    };

  // ==========================================================
  // CLOSE SERVICES
  // ==========================================================

  const closeServicesModal =
    () => {
      setServiceForm(null);
      setServicesModalVisible(
        false,
      );
    };

  // ==========================================================
  // CHANGE BUSINESS TYPE
  // ==========================================================

  const handleBusinessTypeChange =
    (
      businessTypeId: string,
    ) => {
      if (
        businessTypeId ===
        activeBusinessTypeId
      ) {
        return;
      }

      /*
       * DO NOT allow the provider to leave an unfinished
       * business type.
       */
      if (
        activeBusinessTypeId &&
        !isBusinessTypeComplete(
          activeBusinessTypeId,
        )
      ) {
        const current =
          businessTypes.find(
            item =>
              item.businessTypeId ===
              activeBusinessTypeId,
          );

        Alert.alert(
          'Complete this business type first',
          `Please add at least one service for ${current?.name || 'this business type'} before moving to another business type.`,
        );

        return;
      }

      setActiveBusinessTypeId(
        businessTypeId,
      );

      setActiveAudience(
        previous =>
          previous &&
            availableAudiences.includes(
              previous,
            )
            ? previous
            : availableAudiences[0] ||
            null,
      );

      setOpenCategories({});
      setServiceForm(null);
    };

  // ==========================================================
  // CHANGE AUDIENCE
  // ==========================================================

  const handleAudienceChange =
    (
      audience: ServiceAudience,
    ) => {
      setActiveAudience(
        audience,
      );

      setOpenCategories({});
    };

  // ==========================================================
  // CATEGORY OPEN / CLOSE
  // ==========================================================

  const toggleCategory =
    (
      categoryId: string,
    ) => {
      if (
        !activeBusinessTypeId ||
        !activeAudience
      ) {
        return;
      }

      const key =
        `${activeBusinessTypeId}-${activeAudience}-${categoryId}`;

      setOpenCategories(
        previous => ({
          ...previous,

          [key]:
            !previous[key],
        }),
      );
    };

  // ==========================================================
  // GET CATEGORY SUBCATEGORIES
  // ==========================================================

  const getCategorySubcategories =
    (
      categoryId: string,
    ) => {
      return activeAudienceSubcategories
        .filter(
          subcategory =>
            subcategory.categoryId ===
            categoryId,
        )
        .sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
              undefined,
              {
                sensitivity:
                  'base',
              },
            ),
        );
    };

  // ==========================================================
  // FIND EXISTING SERVICE
  // ==========================================================

  const getExistingService =
    (
      businessTypeId: string,
      audience: ServiceAudience,
      categoryId: string,
      subcategoryId: string,
    ) => {
      return selectedServices.find(
        service =>
          normalizeText(
            service.businessTypeId,
          ) === businessTypeId &&
          service.audience ===
          audience &&
          service.categoryId ===
          categoryId &&
          service.subcategoryId ===
          subcategoryId,
      );
    };

  // ==========================================================
  // OPEN ADD SERVICE
  // ==========================================================

  const openAddService = (
    category: Category,
    subcategory: Subcategory,
  ) => {
    if (
      !activeBusinessTypeId ||
      !activeAudience
    ) {
      return;
    }

    const existing =
      getExistingService(
        activeBusinessTypeId,
        activeAudience,
        category.categoryId,
        subcategory.subcategoryId,
      );

    setServiceForm({
      serviceKey:
        existing?.serviceKey,

      businessTypeId:
        activeBusinessTypeId,

      audience:
        activeAudience,

      categoryId:
        category.categoryId,

      categoryName:
        category.name,

      subcategoryId:
        subcategory.subcategoryId,

      subcategoryName:
        subcategory.name,

      name:
        existing?.name || '',

      description:
        existing?.description ||
        '',

      price:
        typeof existing?.price ===
          'number'
          ? String(
            existing.price,
          )
          : '',

      durationMinutes:
        typeof existing?.durationMinutes ===
          'number'
          ? String(
            existing.durationMinutes,
          )
          : '',
    });
  };

  // ==========================================================
  // CLOSE SERVICE FORM
  // ==========================================================

  const closeServiceForm =
    () => {
      if (savingService) {
        return;
      }

      setServiceForm(null);
    };

  // ==========================================================
  // SAVE SERVICE
  // ==========================================================

  const handleSaveService =
    async () => {
      if (
        !serviceForm
      ) {
        return;
      }

      const name =
        normalizeText(
          serviceForm.name,
        );

      const description =
        normalizeText(
          serviceForm.description,
        );

      const price =
        parsePositiveNumber(
          serviceForm.price,
        );

      const durationMinutes =
        parsePositiveNumber(
          serviceForm.durationMinutes,
        );

      if (!name) {
        Alert.alert(
          'Service name required',
          'Please enter a service name.',
        );

        return;
      }

      if (
        price === undefined
      ) {
        Alert.alert(
          'Invalid price',
          'Please enter a valid price greater than 0.',
        );

        return;
      }

      if (
        durationMinutes ===
        undefined
      ) {
        Alert.alert(
          'Invalid duration',
          'Please enter a valid duration in minutes.',
        );

        return;
      }

      /*
       * businessTypeId is intentionally mandatory.
       *
       * We never derive it from the subcategory because
       * the same subcategory can belong to multiple business
       * types.
       */
      if (
        !normalizeText(
          serviceForm.businessTypeId,
        )
      ) {
        Alert.alert(
          'Business type missing',
          'The business type for this service is missing. Please select the business type again.',
        );

        return;
      }

      try {
        setSavingService(
          true,
        );

        const serviceKey =
          serviceForm.serviceKey ||
          createServiceKey(
            serviceForm.businessTypeId,
            serviceForm.audience,
            serviceForm.categoryId,
            serviceForm.subcategoryId,
          );

        const newService: ConfiguredService =
        {
          serviceKey,

          businessTypeId:
            serviceForm.businessTypeId,

          name,

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

          price,

          durationMinutes,
        };

        const existingIndex =
          selectedServices.findIndex(
            service =>
              normalizeText(
                service.businessTypeId,
              ) ===
              serviceForm.businessTypeId &&
              service.audience ===
              serviceForm.audience &&
              service.categoryId ===
              serviceForm.categoryId &&
              service.subcategoryId ===
              serviceForm.subcategoryId,
          );

        let updatedServices: ConfiguredService[];

        if (
          existingIndex >=
          0
        ) {
          updatedServices =
            selectedServices.map(
              (
                service,
                index,
              ) =>
                index ===
                  existingIndex
                  ? {
                    ...service,
                    ...newService,

                    /*
                     * Always preserve the explicit
                     * business type.
                     */
                    businessTypeId:
                      serviceForm.businessTypeId,
                  }
                  : service,
            );
        } else {
          updatedServices = [
            ...selectedServices,
            newService,
          ];
        }

        saveServices(
          updatedServices,
        );

        setServiceForm(null);
      } catch (error) {
        console.error(
          'SAVE SERVICE ERROR:',
          error,
        );

        Alert.alert(
          'Unable to save service',
          'Something went wrong while saving this service. Please try again.',
        );
      } finally {
        setSavingService(
          false,
        );
      }
    };

  // ==========================================================
  // DELETE SERVICE
  // ==========================================================

  const handleDeleteService =
    (
      service: ConfiguredService,
    ) => {
      Alert.alert(
        'Remove service',
        `Remove "${service.name}" from your services?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },

          {
            text: 'Remove',
            style: 'destructive',

            onPress: () => {
              const updated =
                selectedServices.filter(
                  item =>
                    item.serviceKey !==
                    service.serviceKey,
                );

              saveServices(
                updated,
              );
            },
          },
        ],
      );
    };

  // ==========================================================
  // CATEGORY SERVICE COUNT
  // ==========================================================

  const getCategoryConfiguredCount =
    (
      categoryId: string,
    ) => {
      if (
        !activeBusinessTypeId
      ) {
        return 0;
      }

      return activeBusinessTypeServices.filter(
        service =>
          service.categoryId ===
          categoryId &&
          normalizeText(
            service.name,
          ),
      ).length;
    };

  // ==========================================================
  // SUBCATEGORY CONFIGURED
  // ==========================================================

  const isSubcategoryConfigured =
    (
      categoryId: string,
      subcategoryId: string,
    ) => {
      if (
        !activeBusinessTypeId ||
        !activeAudience
      ) {
        return false;
      }

      return Boolean(
        getExistingService(
          activeBusinessTypeId,
          activeAudience,
          categoryId,
          subcategoryId,
        )?.name,
      );
    };

  // ==========================================================
  // CURRENT BUSINESS TYPE INDEX
  // ==========================================================

  const activeBusinessTypeIndex =
    useMemo(() => {
      if (
        !activeBusinessTypeId
      ) {
        return -1;
      }

      return businessTypes.findIndex(
        businessType =>
          businessType.businessTypeId ===
          activeBusinessTypeId,
      );
    }, [
      businessTypes,
      activeBusinessTypeId,
    ]);

  const isLastBusinessType =
    activeBusinessTypeIndex ===
    businessTypes.length - 1;

  // ==========================================================
  // NEXT BUSINESS TYPE
  // ==========================================================

  const handleNextBusinessType =
    () => {
      if (
        !activeBusinessTypeId
      ) {
        return;
      }

      const current =
        businessTypes[
        activeBusinessTypeIndex
        ];

      if (
        !isBusinessTypeComplete(
          activeBusinessTypeId,
        )
      ) {
        Alert.alert(
          'Complete this business type first',
          `Please add at least one service for ${current?.name || 'this business type'} before continuing.`,
        );

        return;
      }

      if (
        isLastBusinessType
      ) {
        handleFinishServices();

        return;
      }

      const nextIndex =
        activeBusinessTypeIndex +
        1;

      const nextBusinessType =
        businessTypes[
        nextIndex
        ];

      if (
        !nextBusinessType
      ) {
        return;
      }

      setActiveBusinessTypeId(
        nextBusinessType.businessTypeId,
      );

      setActiveAudience(
        availableAudiences[0] ||
        null,
      );

      setOpenCategories({});
    };

  // ==========================================================
  // FINISH ALL SERVICES
  // ==========================================================

  const handleFinishServices =
    async () => {
      /*
       * Every selected business type must be completed.
       */
      const incompleteBusinessTypes =
        businessTypes.filter(
          businessType =>
            !isBusinessTypeComplete(
              businessType.businessTypeId,
            ),
        );

      if (
        incompleteBusinessTypes.length >
        0
      ) {
        const names =
          incompleteBusinessTypes
            .map(
              item =>
                item.name,
            )
            .join(', ');

        Alert.alert(
          'Complete all business types',
          `Please finish configuring services for: ${names}.`,
        );

        return;
      }

      /*
       * Never allow a malformed service to move forward.
       */
      const invalidService =
        selectedServices.find(
          service =>
            !normalizeText(
              service.businessTypeId,
            ) ||
            !normalizeText(
              service.name,
            ) ||
            typeof service.price !==
            'number' ||
            service.price <= 0 ||
            typeof service.durationMinutes !==
            'number' ||
            service.durationMinutes <=
            0,
        );

      if (
        invalidService
      ) {
        Alert.alert(
          'Incomplete service',
          'Please complete every configured service before continuing.',
        );

        return;
      }

      try {
        setSubmitting(true);

        saveServices(
          selectedServices,
        );

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              100,
            ),
        );

        /*
         * Keep the existing navigation contract.
         *
         * ConfigureSalonServices can now act as the final
         * service review/edit screen before SalonKYC.
         */
        navigation.navigate(
          'ConfigureSalonServices',
        );
      } catch (error) {
        console.error(
          'FINISH SERVICES ERROR:',
          error,
        );

        Alert.alert(
          'Unable to continue',
          'Something went wrong while saving your services.',
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry =
    async () => {
      try {
        await Promise.all([
          refetchCategories(),
          refetchSubcategories(),
          refetchBusinessTypes(),
        ]);
      } catch (error) {
        console.error(
          'SERVICE CATALOG RETRY ERROR:',
          error,
        );
      }
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  const catalogLoading =
    categoriesLoading ||
    subcategoriesLoading ||
    businessTypesLoading;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Business Services"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={styles.title}
        >
          Services provided by your business
        </Text>

        <Text
          style={styles.subtitle}
        >
          Configure services separately for each
          business type you selected.
        </Text>

        {catalogLoading ? (
          <View
            style={
              styles.loadingCard
            }
          >
            <ActivityIndicator
              size="small"
              color={
                COLORS.themeColor
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading service catalog...
            </Text>
          </View>
        ) : null}

        {!catalogLoading &&
          (
            categoriesError ||
            subcategoriesError ||
            businessTypesError
          ) ? (
          <View
            style={
              styles.errorCard
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
              Please check your connection and
              try again.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                handleRetry
              }
              style={
                styles.retryButton
              }
            >
              <Text
                style={
                  styles.retryButtonText
                }
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!catalogLoading &&
          !categoriesError &&
          !subcategoriesError &&
          !businessTypesError ? (
          <>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={
                openServicesModal
              }
              style={
                styles.serviceSelector
              }
            >
              <View
                style={
                  styles.serviceSelectorLeft
                }
              >
                <Text
                  style={
                    styles.serviceSelectorTitle
                  }
                >
                  Select Services
                </Text>

                <Text
                  style={
                    styles.serviceSelectorSubtitle
                  }
                >
                  {selectedServices.length >
                    0
                    ? `${selectedServices.length} configured service${selectedServices.length ===
                      1
                      ? ''
                      : 's'
                    }`
                    : 'Required • Configure your services'}
                </Text>
              </View>

              <Text
                style={
                  styles.serviceSelectorArrow
                }
              >
                ›
              </Text>
            </TouchableOpacity>

            {businessTypes.map(
              (
                businessType,
                index,
              ) => {
                const count =
                  getBusinessTypeServiceCount(
                    businessType.businessTypeId,
                  );

                const complete =
                  count > 0;

                return (
                  <View
                    key={
                      businessType.businessTypeId
                    }
                    style={[
                      styles.businessSummaryCard,
                      index >
                      0 &&
                      styles.businessSummarySpacing,
                    ]}
                  >
                    <View
                      style={
                        styles.businessSummaryTop
                      }
                    >
                      <View
                        style={
                          styles.businessSummaryNumber
                        }
                      >
                        <Text
                          style={
                            styles.businessSummaryNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.businessSummaryContent
                        }
                      >
                        <Text
                          style={
                            styles.businessSummaryName
                          }
                        >
                          {
                            businessType.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.businessSummaryMeta
                          }
                        >
                          {count}{' '}
                          configured
                          service
                          {count ===
                            1
                            ? ''
                            : 's'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          complete &&
                          styles.statusBadgeComplete,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            complete &&
                            styles.statusBadgeTextComplete,
                          ]}
                        >
                          {complete
                            ? 'Complete'
                            : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    {complete
                      ? activeBusinessTypeId ===
                        businessType.businessTypeId &&
                        servicesModalVisible
                        ? null
                        : null
                      : null}
                  </View>
                );
              },
            )}

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
                How service setup works
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                • Business Type is selected first.
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                • Only categories and subcategories
                belonging to that business type are shown.
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                • Female, Male and Kids are shown
                according to the audiences you selected.
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                • Every service keeps its exact
                business type, audience, category and
                subcategory.
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                • You must complete every selected
                business type before continuing.
              </Text>
            </View>

            <DButton
              style={
                styles.button
              }
              onPress={
                openServicesModal
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                {selectedServices.length >
                  0
                  ? 'Edit Services'
                  : 'Select Services'}
              </Text>
            </DButton>
          </>
        ) : null}
      </ScrollView>

      {/* ======================================================
          SERVICES MODAL
          ====================================================== */}

      <Modal
        visible={
          servicesModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeServicesModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.servicesModal
            }
          >
            {/* ==================================================
                STICKY HEADER
                ================================================== */}

            <View
              style={
                styles.stickyHeader
              }
            >
              <View
                style={
                  styles.modalTitleRow
                }
              >
                <View
                  style={
                    styles.modalTitleContent
                  }
                >
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    Select Services
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Complete each business type
                    before moving to the next one.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    closeServicesModal
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
                </TouchableOpacity>
              </View>

              {/* ==================================================
                  BUSINESS TYPE TABS
                  ================================================== */}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.businessTypeTabsContent
                }
              >
                {businessTypes.map(
                  (
                    businessType,
                  ) => {
                    const isActive =
                      activeBusinessTypeId ===
                      businessType.businessTypeId;

                    const complete =
                      isBusinessTypeComplete(
                        businessType.businessTypeId,
                      );

                    return (
                      <TouchableOpacity
                        key={
                          businessType.businessTypeId
                        }
                        activeOpacity={0.8}
                        onPress={() =>
                          handleBusinessTypeChange(
                            businessType.businessTypeId,
                          )
                        }
                        style={[
                          styles.businessTypeTab,
                          isActive &&
                          styles.businessTypeTabActive,
                        ]}
                      >
                        <View
                          style={
                            styles.businessTypeTabTop
                          }
                        >
                          <Text
                            style={[
                              styles.businessTypeTabText,
                              isActive &&
                              styles.businessTypeTabTextActive,
                            ]}
                            numberOfLines={
                              1
                            }
                          >
                            {
                              businessType.name
                            }
                          </Text>

                          {complete ? (
                            <View
                              style={
                                styles.completeDot
                              }
                            >
                              <Text
                                style={
                                  styles.completeDotText
                                }
                              >
                                ✓
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text
                          style={[
                            styles.businessTypeTabCount,
                            isActive &&
                            styles.businessTypeTabCountActive,
                          ]}
                        >
                          {
                            getBusinessTypeServiceCount(
                              businessType.businessTypeId,
                            )
                          }{' '}
                          service
                          {getBusinessTypeServiceCount(
                            businessType.businessTypeId,
                          ) ===
                            1
                            ? ''
                            : 's'}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>

              {/* ==================================================
                  ACTIVE BUSINESS TYPE
                  ================================================== */}

              {activeBusinessType ? (
                <View
                  style={
                    styles.activeBusinessTypeBar
                  }
                >
                  <View
                    style={
                      styles.activeBusinessTypeIndicator
                    }
                  />

                  <View
                    style={
                      styles.activeBusinessTypeContent
                    }
                  >
                    <Text
                      style={
                        styles.activeBusinessTypeLabel
                      }
                    >
                      BUSINESS TYPE
                    </Text>

                    <Text
                      style={
                        styles.activeBusinessTypeName
                      }
                    >
                      {
                        activeBusinessType.name
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.activeBusinessTypeProgress
                    }
                  >
                    <Text
                      style={
                        styles.activeBusinessTypeProgressText
                      }
                    >
                      {activeBusinessTypeIndex +
                        1}{' '}
                      /{' '}
                      {
                        businessTypes.length
                      }
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* ==================================================
                  AUDIENCE TABS
                  ================================================== */}

              <View
                style={
                  styles.audienceSection
                }
              >
                <Text
                  style={
                    styles.audienceSectionTitle
                  }
                >
                  Service for
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.audienceTabsContent
                  }
                >
                  {AUDIENCE_TABS.filter(
                    tab =>
                      availableAudiences.includes(
                        tab.key,
                      ),
                  ).map(
                    tab => {
                      const isActive =
                        activeAudience ===
                        tab.key;

                      return (
                        <TouchableOpacity
                          key={
                            tab.key
                          }
                          activeOpacity={
                            0.8
                          }
                          onPress={() =>
                            handleAudienceChange(
                              tab.key,
                            )
                          }
                          style={[
                            styles.audienceTab,
                            isActive &&
                            styles.audienceTabActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.audienceTabText,
                              isActive &&
                              styles.audienceTabTextActive,
                            ]}
                          >
                            {
                              tab.label
                            }
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </ScrollView>
              </View>
            </View>

            {/* ==================================================
                BODY
                ================================================== */}

            <ScrollView
              style={
                styles.modalBody
              }
              contentContainerStyle={
                styles.modalBodyContent
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              {activeBusinessType &&
                activeAudience ? (
                <>
                  <View
                    style={
                      styles.selectionContextCard
                    }
                  >
                    <View
                      style={
                        styles.contextItem
                      }
                    >
                      <Text
                        style={
                          styles.contextLabel
                        }
                      >
                        BUSINESS TYPE
                      </Text>

                      <Text
                        style={
                          styles.contextValue
                        }
                      >
                        {
                          activeBusinessType.name
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.contextDivider
                      }
                    />

                    <View
                      style={
                        styles.contextItem
                      }
                    >
                      <Text
                        style={
                          styles.contextLabel
                        }
                      >
                        SERVICE FOR
                      </Text>

                      <Text
                        style={
                          styles.contextValue
                        }
                      >
                        {getAudienceLabel(
                          activeAudience,
                        )}
                      </Text>
                    </View>
                  </View>

                  {activeCategories.length ===
                    0 ? (
                    <View
                      style={
                        styles.emptyState
                      }
                    >
                      <Text
                        style={
                          styles.emptyStateTitle
                        }
                      >
                        No services available
                      </Text>

                      <Text
                        style={
                          styles.emptyStateText
                        }
                      >
                        There are no categories configured
                        for {activeBusinessType.name}
                        and{' '}
                        {getAudienceLabel(
                          activeAudience,
                        )}
                        .
                      </Text>
                    </View>
                  ) : (
                    activeCategories.map(
                      category => {
                        const categorySubcategories =
                          getCategorySubcategories(
                            category.categoryId,
                          );

                        const categoryKey =
                          `${activeBusinessTypeId}-${activeAudience}-${category.categoryId}`;

                        const isOpen =
                          Boolean(
                            openCategories[
                            categoryKey
                            ],
                          );

                        const configuredCount =
                          getCategoryConfiguredCount(
                            category.categoryId,
                          );

                        return (
                          <View
                            key={
                              category.categoryId
                            }
                            style={
                              styles.categoryCard
                            }
                          >
                            <TouchableOpacity
                              activeOpacity={
                                0.8
                              }
                              onPress={() =>
                                toggleCategory(
                                  category.categoryId,
                                )
                              }
                              style={[
                                styles.categoryHeader,
                                isOpen &&
                                styles.categoryHeaderOpen,
                              ]}
                            >
                              <View
                                style={
                                  styles.categoryHeaderLeft
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
                                    {category.name
                                      .charAt(
                                        0,
                                      )
                                      .toUpperCase()}
                                  </Text>
                                </View>

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
                                      styles.categoryMeta
                                    }
                                  >
                                    {
                                      categorySubcategories.length
                                    }{' '}
                                    subcategor
                                    {categorySubcategories.length ===
                                      1
                                      ? 'y'
                                      : 'ies'}

                                    {configuredCount >
                                      0
                                      ? ` • ${configuredCount} configured`
                                      : ''}
                                  </Text>
                                </View>
                              </View>

                              <View
                                style={
                                  styles.categoryChevron
                                }
                              >
                                <Text
                                  style={
                                    styles.categoryChevronText
                                  }
                                >
                                  {isOpen
                                    ? '−'
                                    : '+'}
                                </Text>
                              </View>
                            </TouchableOpacity>

                            {isOpen ? (
                              <View
                                style={
                                  styles.subcategoryList
                                }
                              >
                                {categorySubcategories.map(
                                  subcategory => {
                                    const configured =
                                      isSubcategoryConfigured(
                                        category.categoryId,
                                        subcategory.subcategoryId,
                                      );

                                    return (
                                      <TouchableOpacity
                                        key={`${activeBusinessTypeId}-${activeAudience}-${category.categoryId}-${subcategory.subcategoryId}`}
                                        activeOpacity={
                                          0.8
                                        }
                                        onPress={() =>
                                          openAddService(
                                            category,
                                            subcategory,
                                          )
                                        }
                                        style={[
                                          styles.subcategoryRow,
                                          configured &&
                                          styles.subcategoryRowConfigured,
                                        ]}
                                      >
                                        <View
                                          style={[
                                            styles.subcategoryIndicator,
                                            configured &&
                                            styles.subcategoryIndicatorConfigured,
                                          ]}
                                        />

                                        <View
                                          style={
                                            styles.subcategoryContent
                                          }
                                        >
                                          <Text
                                            style={
                                              styles.subcategoryName
                                            }
                                          >
                                            {
                                              subcategory.name
                                            }
                                          </Text>

                                          {!!subcategory.description && (
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
                                          )}

                                          {configured ? (
                                            <Text
                                              style={
                                                styles.configuredLabel
                                              }
                                            >
                                              Service configured
                                            </Text>
                                          ) : null}
                                        </View>

                                        <Text
                                          style={
                                            styles.addServiceArrow
                                          }
                                        >
                                          {configured
                                            ? 'Edit'
                                            : 'Add'}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  },
                                )}
                              </View>
                            ) : null}
                          </View>
                        );
                      },
                    )
                  )}
                </>
              ) : null}
            </ScrollView>

            {/* ==================================================
                FOOTER
                ================================================== */}

            <View
              style={
                styles.modalFooter
              }
            >
              <View
                style={
                  styles.footerProgress
                }
              >
                <Text
                  style={
                    styles.footerProgressText
                  }
                >
                  {activeBusinessType
                    ? `${getBusinessTypeServiceCount(
                      activeBusinessType.businessTypeId,
                    )
                    } service${getBusinessTypeServiceCount(
                      activeBusinessType.businessTypeId,
                    ) ===
                      1
                      ? ''
                      : 's'
                    } configured`
                    : ''}
                </Text>

                <Text
                  style={
                    styles.footerBusinessTypeText
                  }
                >
                  {isLastBusinessType
                    ? 'Last business type'
                    : 'Complete this business type to continue'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={
                  handleNextBusinessType
                }
                style={[
                  styles.nextButton,
                  activeBusinessTypeId &&
                    isBusinessTypeComplete(
                      activeBusinessTypeId,
                    )
                    ? styles.nextButtonActive
                    : styles.nextButtonDisabled,
                ]}
              >
                <Text
                  style={
                    styles.nextButtonText
                  }
                >
                  {isLastBusinessType
                    ? 'Finish Services'
                    : 'Next Business Type'}
                </Text>

                <Text
                  style={
                    styles.nextButtonArrow
                  }
                >
                  ›
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          ADD / EDIT SERVICE MODAL
          ====================================================== */}

      <Modal
        visible={
          Boolean(serviceForm)
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeServiceForm
        }
      >
        <KeyboardAvoidingView
          style={
            styles.serviceFormOverlay
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
              styles.serviceFormModal
            }
          >
            <View
              style={
                styles.serviceFormHeader
              }
            >
              <View
                style={
                  styles.serviceFormHeaderContent
                }
              >
                <Text
                  style={
                    styles.serviceFormTitle
                  }
                >
                  {serviceForm?.serviceKey
                    ? 'Edit Service'
                    : 'Add Service'}
                </Text>

                <Text
                  style={
                    styles.serviceFormSubtitle
                  }
                >
                  {serviceForm?.businessTypeId &&
                    businessTypes.find(
                      item =>
                        item.businessTypeId ===
                        serviceForm.businessTypeId,
                    )?.name}{' '}
                  •{' '}
                  {serviceForm?.audience &&
                    getAudienceLabel(
                      serviceForm.audience,
                    )}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  closeServiceForm
                }
                disabled={
                  savingService
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
              </TouchableOpacity>
            </View>

            <ScrollView
              style={
                styles.serviceFormScroll
              }
              contentContainerStyle={
                styles.serviceFormContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={
                  styles.servicePathCard
                }
              >
                <Text
                  style={
                    styles.servicePathLabel
                  }
                >
                  SERVICE PATH
                </Text>

                <Text
                  style={
                    styles.servicePathText
                  }
                >
                  {serviceForm?.categoryName}
                  {'  ›  '}
                  {
                    serviceForm?.subcategoryName
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Service Name *
              </Text>

              <TextInput
                value={
                  serviceForm?.name ||
                  ''
                }
                onChangeText={value =>
                  setServiceForm(
                    previous =>
                      previous
                        ? {
                          ...previous,
                          name: value,
                        }
                        : previous,
                  )
                }
                placeholder="e.g. Basic Hair Cut"
                placeholderTextColor={
                  COLORS.textMuted
                }
                style={
                  styles.input
                }
                maxLength={
                  100
                }
                editable={
                  !savingService
                }
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                Description
              </Text>

              <TextInput
                value={
                  serviceForm?.description ||
                  ''
                }
                onChangeText={value =>
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
                placeholder="Briefly describe this service"
                placeholderTextColor={
                  COLORS.textMuted
                }
                style={[
                  styles.input,
                  styles.descriptionInput,
                ]}
                multiline
                textAlignVertical="top"
                maxLength={
                  300
                }
                editable={
                  !savingService
                }
              />

              <View
                style={
                  styles.formRow
                }
              >
                <View
                  style={
                    styles.formColumn
                  }
                >
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    Price (₹) *
                  </Text>

                  <TextInput
                    value={
                      serviceForm?.price ||
                      ''
                    }
                    onChangeText={value =>
                      setServiceForm(
                        previous =>
                          previous
                            ? {
                              ...previous,
                              price: value,
                            }
                            : previous,
                      )
                    }
                    placeholder="500"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    style={
                      styles.input
                    }
                    keyboardType="decimal-pad"
                    editable={
                      !savingService
                    }
                  />
                </View>

                <View
                  style={
                    styles.formColumn
                  }
                >
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    Duration (min) *
                  </Text>

                  <TextInput
                    value={
                      serviceForm?.durationMinutes ||
                      ''
                    }
                    onChangeText={value =>
                      setServiceForm(
                        previous =>
                          previous
                            ? {
                              ...previous,
                              durationMinutes:
                                value,
                            }
                            : previous,
                      )
                    }
                    placeholder="60"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    style={
                      styles.input
                    }
                    keyboardType="number-pad"
                    editable={
                      !savingService
                    }
                  />
                </View>
              </View>

              <View
                style={
                  styles.lockedContextCard
                }
              >
                <Text
                  style={
                    styles.lockedContextTitle
                  }
                >
                  This service belongs to
                </Text>

                <Text
                  style={
                    styles.lockedContextText
                  }
                >
                  {
                    serviceForm?.categoryName
                  }{' '}
                  ›{' '}
                  {
                    serviceForm?.subcategoryName
                  }
                </Text>

                <Text
                  style={
                    styles.lockedContextMeta
                  }
                >
                  {
                    activeBusinessType?.name
                  }{' '}
                  •{' '}
                  {serviceForm?.audience &&
                    getAudienceLabel(
                      serviceForm.audience,
                    )}
                </Text>
              </View>
            </ScrollView>

            <View
              style={
                styles.serviceFormFooter
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  closeServiceForm
                }
                disabled={
                  savingService
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
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={
                  handleSaveService
                }
                disabled={
                  savingService
                }
                style={
                  styles.saveButton
                }
              >
                {savingService ? (
                  <ActivityIndicator
                    color={
                      COLORS.white
                    }
                  />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save Service
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

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

    content: {
      padding:
        SPACING.large,
      paddingBottom:
        SPACING.huge,
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
      lineHeight: 20,
      color:
        COLORS.textSecondary,
      marginBottom:
        SPACING.large,
    },

    loadingCard: {
      backgroundColor:
        COLORS.surface,
      borderRadius:
        RADIUS.large,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding:
        SPACING.large,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom:
        SPACING.large,
    },

    loadingText: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.textSecondary,
      marginTop:
        SPACING.small,
    },

    errorCard: {
      backgroundColor:
        COLORS.surface,
      borderRadius:
        RADIUS.large,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding:
        SPACING.large,
      marginBottom:
        SPACING.large,
    },

    errorTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },

    errorText: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.small,
      lineHeight: 19,
      color:
        COLORS.textSecondary,
    },

    retryButton: {
      alignSelf:
        'flex-start',
      marginTop:
        SPACING.medium,
      paddingHorizontal:
        SPACING.large,
      paddingVertical:
        SPACING.small,
      borderRadius:
        RADIUS.medium,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
    },

    retryButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.themeColor,
    },

    serviceSelector: {
      minHeight: 72,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      borderRadius:
        RADIUS.large,
      paddingHorizontal:
        SPACING.large,
      paddingVertical:
        SPACING.medium,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom:
        SPACING.large,
    },

    serviceSelectorLeft: {
      flex: 1,
    },

    serviceSelectorTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
    },

    serviceSelectorSubtitle: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.textSecondary,
      marginTop:
        3,
    },

    serviceSelectorArrow: {
      fontFamily:
        FONTS.regular,
      fontSize: 30,
      lineHeight: 30,
      color:
        COLORS.themeColor,
      marginLeft:
        SPACING.medium,
    },

    businessSummaryCard: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.large,
      padding:
        SPACING.large,
    },

    businessSummarySpacing: {
      marginTop:
        SPACING.small,
    },

    businessSummaryTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    businessSummaryNumber: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        SPACING.medium,
    },

    businessSummaryNumberText: {
      fontFamily:
        FONTS.bold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.themeColor,
    },

    businessSummaryContent: {
      flex: 1,
    },

    businessSummaryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
    },

    businessSummaryMeta: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },

    statusBadge: {
      paddingHorizontal:
        SPACING.small,
      paddingVertical: 5,
      borderRadius:
        RADIUS.round,
      backgroundColor:
        COLORS.background,
    },

    statusBadgeComplete: {
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      backgroundColor:
        COLORS.surface,
    },

    statusBadgeText: {
      fontFamily:
        FONTS.medium,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textMuted,
    },

    statusBadgeTextComplete: {
      color:
        COLORS.themeColor,
    },

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
      marginTop:
        SPACING.large,
      marginBottom:
        SPACING.large,
    },

    infoTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },

    infoText: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.small,
      lineHeight: 19,
      color:
        COLORS.textSecondary,
      marginBottom:
        SPACING.small,
    },

    button: {
      width:
        '100%',
      height: 54,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    buttonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.white,
    },

    // ========================================================
    // MAIN MODAL
    // ========================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.45)',
      justifyContent:
        'flex-end',
    },

    servicesModal: {
      width:
        '100%',
      height:
        '94%',
      backgroundColor:
        COLORS.surface,
      borderTopLeftRadius:
        RADIUS.large,
      borderTopRightRadius:
        RADIUS.large,
      overflow:
        'hidden',
    },

    stickyHeader: {
      backgroundColor:
        COLORS.surface,
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
      zIndex: 10,
    },

    modalTitleRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal:
        SPACING.large,
      paddingTop:
        SPACING.large,
      paddingBottom:
        SPACING.medium,
    },

    modalTitleContent: {
      flex: 1,
    },

    modalTitle: {
      fontFamily:
        FONTS.bold,
      fontSize:
        FONT_SIZES.title,
      color:
        COLORS.text,
    },

    modalSubtitle: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      lineHeight: 17,
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginLeft:
        SPACING.medium,
    },

    closeButtonText: {
      fontFamily:
        FONTS.regular,
      fontSize: 25,
      lineHeight: 27,
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // BUSINESS TYPE TABS
    // ========================================================

    businessTypeTabsContent: {
      paddingHorizontal:
        SPACING.large,
      paddingBottom:
        SPACING.medium,
    },

    businessTypeTab: {
      minWidth: 120,
      maxWidth: 190,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
      marginRight:
        SPACING.small,
      borderRadius:
        RADIUS.medium,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      backgroundColor:
        COLORS.surface,
    },

    businessTypeTabActive: {
      borderColor:
        COLORS.themeColor,
      backgroundColor:
        COLORS.surface,
    },

    businessTypeTabTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    businessTypeTabText: {
      flex: 1,
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.textSecondary,
    },

    businessTypeTabTextActive: {
      color:
        COLORS.themeColor,
    },

    businessTypeTabCount: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textMuted,
      marginTop: 3,
    },

    businessTypeTabCountActive: {
      color:
        COLORS.themeColor,
    },

    completeDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginLeft:
        SPACING.small,
    },

    completeDotText: {
      fontFamily:
        FONTS.bold,
      fontSize: 11,
      color:
        COLORS.white,
    },

    // ========================================================
    // ACTIVE BUSINESS TYPE
    // ========================================================

    activeBusinessTypeBar: {
      marginHorizontal:
        SPACING.large,
      marginBottom:
        SPACING.medium,
      padding:
        SPACING.medium,
      borderRadius:
        RADIUS.medium,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    activeBusinessTypeIndicator: {
      width: 4,
      height: 34,
      borderRadius: 2,
      backgroundColor:
        COLORS.themeColor,
      marginRight:
        SPACING.medium,
    },

    activeBusinessTypeContent: {
      flex: 1,
    },

    activeBusinessTypeLabel: {
      fontFamily:
        FONTS.medium,
      fontSize: 9,
      letterSpacing: 0.6,
      color:
        COLORS.textMuted,
    },

    activeBusinessTypeName: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
      marginTop: 1,
    },

    activeBusinessTypeProgress: {
      paddingHorizontal:
        SPACING.small,
      paddingVertical: 5,
      borderRadius:
        RADIUS.round,
      backgroundColor:
        COLORS.background,
    },

    activeBusinessTypeProgressText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.themeColor,
    },

    // ========================================================
    // AUDIENCE
    // ========================================================

    audienceSection: {
      paddingHorizontal:
        SPACING.large,
      paddingBottom:
        SPACING.medium,
    },

    audienceSectionTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },

    audienceTabsContent: {
      flexDirection:
        'row',
    },

    audienceTab: {
      minWidth: 88,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
      borderRadius:
        RADIUS.round,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      marginRight:
        SPACING.small,
      backgroundColor:
        COLORS.surface,
    },

    audienceTabActive: {
      borderColor:
        COLORS.themeColor,
      backgroundColor:
        COLORS.themeColor,
    },

    audienceTabText: {
      fontFamily:
        FONTS.medium,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.textSecondary,
    },

    audienceTabTextActive: {
      color:
        COLORS.white,
    },

    // ========================================================
    // MODAL BODY
    // ========================================================

    modalBody: {
      flex: 1,
    },

    modalBodyContent: {
      padding:
        SPACING.large,
      paddingBottom:
        SPACING.large,
    },

    selectionContextCard: {
      backgroundColor:
        COLORS.background,
      borderRadius:
        RADIUS.medium,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding:
        SPACING.medium,
      flexDirection:
        'row',
      marginBottom:
        SPACING.large,
    },

    contextItem: {
      flex: 1,
    },

    contextDivider: {
      width: 1,
      backgroundColor:
        COLORS.border,
      marginHorizontal:
        SPACING.medium,
    },

    contextLabel: {
      fontFamily:
        FONTS.medium,
      fontSize: 9,
      letterSpacing: 0.5,
      color:
        COLORS.textMuted,
      marginBottom: 3,
    },

    contextValue: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },

    categoryCard: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      marginBottom:
        SPACING.small,
      overflow:
        'hidden',
    },

    categoryHeader: {
      minHeight: 66,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    categoryHeaderOpen: {
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    categoryHeaderLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    categoryIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        SPACING.medium,
    },

    categoryIconText: {
      fontFamily:
        FONTS.bold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.themeColor,
    },

    categoryHeaderContent: {
      flex: 1,
    },

    categoryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
    },

    categoryMeta: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },

    categoryChevron: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginLeft:
        SPACING.small,
    },

    categoryChevronText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 19,
      lineHeight: 21,
      color:
        COLORS.themeColor,
    },

    subcategoryList: {
      padding:
        SPACING.small,
      backgroundColor:
        COLORS.background,
    },

    subcategoryRow: {
      minHeight: 60,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
      flexDirection:
        'row',
      alignItems:
        'center',
      marginBottom:
        SPACING.small,
    },

    subcategoryRowConfigured: {
      borderColor:
        COLORS.themeColor,
    },

    subcategoryIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1,
      borderColor:
        COLORS.borderStrong,
      marginRight:
        SPACING.medium,
    },

    subcategoryIndicatorConfigured: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },

    subcategoryContent: {
      flex: 1,
    },

    subcategoryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },

    subcategoryDescription: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      lineHeight: 15,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },

    configuredLabel: {
      fontFamily:
        FONTS.medium,
      fontSize:
        10,
      color:
        COLORS.themeColor,
      marginTop: 3,
    },

    addServiceArrow: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.themeColor,
      marginLeft:
        SPACING.small,
    },

    emptyState: {
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
    },

    emptyStateTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
      textAlign:
        'center',
    },

    emptyStateText: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.small,
      lineHeight: 19,
      color:
        COLORS.textSecondary,
      textAlign:
        'center',
      marginTop:
        SPACING.small,
    },

    // ========================================================
    // FOOTER
    // ========================================================

    modalFooter: {
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
      backgroundColor:
        COLORS.surface,
      padding:
        SPACING.large,
    },

    footerProgress: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom:
        SPACING.small,
    },

    footerProgressText: {
      fontFamily:
        FONTS.medium,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
    },

    footerBusinessTypeText: {
      flex: 1,
      textAlign:
        'right',
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textMuted,
      marginLeft:
        SPACING.small,
    },

    nextButton: {
      height: 52,
      borderRadius:
        RADIUS.medium,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal:
        SPACING.large,
    },

    nextButtonActive: {
      backgroundColor:
        COLORS.themeColor,
    },

    nextButtonDisabled: {
      backgroundColor:
        COLORS.borderStrong,
    },

    nextButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.white,
    },

    nextButtonArrow: {
      fontFamily:
        FONTS.regular,
      fontSize: 27,
      lineHeight: 27,
      color:
        COLORS.white,
      marginLeft:
        SPACING.small,
    },

    // ========================================================
    // SERVICE FORM
    // ========================================================

    serviceFormOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.45)',
      justifyContent:
        'flex-end',
    },

    serviceFormModal: {
      width:
        '100%',
      maxHeight:
        '92%',
      backgroundColor:
        COLORS.surface,
      borderTopLeftRadius:
        RADIUS.large,
      borderTopRightRadius:
        RADIUS.large,
      overflow:
        'hidden',
    },

    serviceFormHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      padding:
        SPACING.large,
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    serviceFormHeaderContent: {
      flex: 1,
    },

    serviceFormTitle: {
      fontFamily:
        FONTS.bold,
      fontSize:
        FONT_SIZES.title,
      color:
        COLORS.text,
    },

    serviceFormSubtitle: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },

    serviceFormScroll: {
      flexGrow: 0,
    },

    serviceFormContent: {
      padding:
        SPACING.large,
      paddingBottom:
        SPACING.xxl,
    },

    servicePathCard: {
      backgroundColor:
        COLORS.background,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      padding:
        SPACING.medium,
      marginBottom:
        SPACING.large,
    },

    servicePathLabel: {
      fontFamily:
        FONTS.medium,
      fontSize: 9,
      letterSpacing: 0.5,
      color:
        COLORS.textMuted,
      marginBottom: 3,
    },

    servicePathText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },

    inputLabel: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },

    input: {
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
      paddingVertical:
        SPACING.small,
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
      marginBottom:
        SPACING.large,
    },

    descriptionInput: {
      minHeight: 100,
      paddingTop:
        SPACING.medium,
    },

    formRow: {
      flexDirection:
        'row',
      gap:
        SPACING.medium,
    },

    formColumn: {
      flex: 1,
    },

    lockedContextCard: {
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.background,
      padding:
        SPACING.medium,
      marginTop:
        SPACING.small,
    },

    lockedContextTitle: {
      fontFamily:
        FONTS.medium,
      fontSize: 10,
      color:
        COLORS.textMuted,
      marginBottom: 4,
    },

    lockedContextText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },

    lockedContextMeta: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },

    serviceFormFooter: {
      flexDirection:
        'row',
      gap:
        SPACING.medium,
      padding:
        SPACING.large,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
      backgroundColor:
        COLORS.surface,
    },

    cancelButton: {
      flex: 1,
      height: 52,
      borderRadius:
        RADIUS.medium,
      borderWidth: 1,
      borderColor:
        COLORS.borderStrong,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    cancelButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
    },

    saveButton: {
      flex: 1.5,
      height: 52,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    saveButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.white,
    },
  });