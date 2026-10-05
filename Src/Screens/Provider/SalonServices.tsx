import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../../components';
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
import { useQuery } from '@apollo/client';
import {
  GET_CLAVATA_CATEGORIES,
  GET_CLAVATA_SUBCATEGORIES,
} from '../../graphql/queries';
type Category = {
  categoryId: string;
  name: string;
};
type Subcategory = {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  audiences?: ServiceAudience[];
};
type ConfiguredService = SalonServiceSelection & {
  serviceKey: string;
  audience: ServiceAudience;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  name: string;
  price?: number;
  durationMinutes?: number;
  description?: string;
};
type ServiceForm = {
  serviceKey?: string;
  audience: ServiceAudience;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  name: string;
  price: string;
  durationMinutes: string;
  description: string;
};
const AUDIENCES: {
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
const normalize = (value: unknown): string =>
  String(value ?? '').trim();
const isAudience = (
  value: unknown,
): value is ServiceAudience =>
  value === 'FEMALE' ||
  value === 'MALE' ||
  value === 'KIDS';
const audienceLabel = (
  value: ServiceAudience,
): string =>
  AUDIENCES.find(
    item => item.key === value,
  )?.label ?? value;
const makeKey = (): string =>
  `SERVICE-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)
    .toUpperCase()}`;
const positiveNumber = (
  value: string,
): number | undefined => {
  const normalized = value
    .replace(/,/g, '')
    .trim();
  if (!normalized) {
    return undefined;
  }
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0
    ? number
    : undefined;
};
const priceLabel = (
  value?: number,
): string => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 'Price not set';
  }
  return `₹${value.toLocaleString('en-IN')}`;
};
export default function SalonServices({
  navigation,
}: any) {
  const {
    data,
    updateData,
  } = useSalonRegistration();
  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);
  const [
    activeAudience,
    setActiveAudience,
  ] = useState<ServiceAudience | null>(null);
  const [
    search,
    setSearch,
  ] = useState('');
  const [
    expandedCategories,
    setExpandedCategories,
  ] = useState<Record<string, boolean>>({});
  const [
    form,
    setForm,
  ] = useState<ServiceForm | null>(null);
  const [
    saving,
    setSaving,
  ] = useState(false);
  const [
    submitting,
    setSubmitting,
  ] = useState(false);
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
  const categories = useMemo<Category[]>(
    () => {
      const raw =
        categoryResponse
          ?.categories
          ?.categories;
      if (!Array.isArray(raw)) {
        return [];
      }
      const unique =
        new Map<string, Category>();
      raw.forEach((item: any) => {
        const categoryId =
          normalize(
            item?.categoryId,
          );
        const name =
          normalize(
            item?.name,
          );
        if (
          !categoryId ||
          !name
        ) {
          return;
        }
        if (
          !unique.has(categoryId)
        ) {
          unique.set(
            categoryId,
            {
              categoryId,
              name,
            },
          );
        }
      });
      return Array.from(
        unique.values(),
      ).sort((a, b) =>
        a.name.localeCompare(
          b.name,
          undefined,
          {
            sensitivity: 'base',
          },
        ),
      );
    },
    [categoryResponse],
  );
  const subcategories =
    useMemo<Subcategory[]>(
      () => {
        const raw =
          subcategoryResponse
            ?.subcategories
            ?.subcategories;
        if (!Array.isArray(raw)) {
          return [];
        }
        const unique =
          new Map<
            string,
            Subcategory
          >();
        raw.forEach(
          (item: any) => {
            const categoryId =
              normalize(
                item?.categoryId,
              );
            const subcategoryId =
              normalize(
                item?.subcategoryId,
              );
            const name =
              normalize(
                item?.name,
              );
            if (
              !categoryId ||
              !subcategoryId ||
              !name
            ) {
              return;
            }
            const key =
              `${categoryId}-${subcategoryId}`;
            if (
              unique.has(key)
            ) {
              return;
            }
            unique.set(
              key,
              {
                categoryId,
                subcategoryId,
                name,
                description:
                  item?.description ??
                  null,
                audiences:
                  Array.isArray(
                    item?.audiences,
                  )
                    ? item.audiences.filter(
                        isAudience,
                      )
                    : [],
              },
            );
          },
        );
        return Array.from(
          unique.values(),
        ).sort((a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              sensitivity: 'base',
            },
          ),
        );
      },
      [subcategoryResponse],
    );
  const availableAudiences =
    useMemo<ServiceAudience[]>(
      () => {
        const selected =
          Array.isArray(
            data?.targetAudiences,
          )
            ? data.targetAudiences
            : [];
        return AUDIENCES
          .map(item => item.key)
          .filter(
            audience =>
              selected.includes(
                audience,
              ),
          );
      },
      [data?.targetAudiences],
    );
  const selectedServices =
    useMemo<ConfiguredService[]>(
      () => {
        const list =
          Array.isArray(
            data?.serviceSelections,
          )
            ? data.serviceSelections
            : [];
        return (
          list as any[]
        ).map(
          (service, index) => {
            const rawPrice =
              Number(
                service?.price,
              );
            const rawDuration =
              Number(
                service?.durationMinutes,
              );
            return {
              ...service,
              serviceKey:
                normalize(
                  service?.serviceKey,
                ) ||
                `LEGACY-${index}`,
              audience:
                service?.audience,
              categoryId:
                normalize(
                  service?.categoryId,
                ),
              categoryName:
                normalize(
                  service?.categoryName,
                ),
              subcategoryId:
                normalize(
                  service?.subcategoryId,
                ),
              subcategoryName:
                normalize(
                  service?.subcategoryName,
                ),
              name:
                normalize(
                  service?.name,
                ),
              price:
                Number.isFinite(
                  rawPrice,
                ) &&
                rawPrice > 0
                  ? rawPrice
                  : undefined,
              durationMinutes:
                Number.isFinite(
                  rawDuration,
                ) &&
                rawDuration > 0
                  ? rawDuration
                  : undefined,
              description:
                normalize(
                  service?.description,
                ),
            };
          },
        );
      },
      [data?.serviceSelections],
    );
  const saveServices = (
    services: ConfiguredService[],
  ) => {
    updateData({
      serviceSelections:
        services as SalonServiceSelection[],
    });
  };
  const getAudienceCount = (
    audience: ServiceAudience,
  ) =>
    selectedServices.filter(
      service =>
        service.audience ===
          audience &&
        !!service.name,
    ).length;
  const filteredCategories =
    useMemo(() => {
      if (!activeAudience) {
        return [];
      }
      const term =
        search
          .trim()
          .toLowerCase();
      return categories
        .map(category => {
          const items =
            subcategories.filter(
              subcategory => {
                const matchesCategory =
                  subcategory.categoryId ===
                  category.categoryId;
                const matchesAudience =
                  subcategory.audiences?.includes(
                    activeAudience,
                  ) ?? false;
                const matchesSearch =
                  !term ||
                  category.name
                    .toLowerCase()
                    .includes(term) ||
                  subcategory.name
                    .toLowerCase()
                    .includes(term);
                return (
                  matchesCategory &&
                  matchesAudience &&
                  matchesSearch
                );
              },
            );
          return {
            ...category,
            subcategories: items,
          };
        })
        .filter(
          category =>
            category
              .subcategories
              .length > 0,
        );
    }, [
      categories,
      subcategories,
      activeAudience,
      search,
    ]);
  const openCatalog = () => {
    if (
      !availableAudiences.length
    ) {
      Alert.alert(
        'Audience required',
        'Please select at least one target audience before adding services.',
      );
      return;
    }
    const audience =
      activeAudience &&
      availableAudiences.includes(
        activeAudience,
      )
        ? activeAudience
        : availableAudiences[0];
    setActiveAudience(
      audience,
    );
    setSearch('');
    setExpandedCategories(
      {},
    );
    setForm(null);
    setModalVisible(true);
  };
  const closeModal = () => {
    if (
      saving ||
      submitting
    ) {
      return;
    }
    setForm(null);
    setModalVisible(false);
  };
  const openAddForm = (
    category: Category,
    subcategory: Subcategory,
  ) => {
    if (!activeAudience) {
      return;
    }
    setForm({
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
      name: '',
      price: '',
      durationMinutes: '',
      description: '',
    });
  };
  const openEditForm = (
    service: ConfiguredService,
  ) => {
    setForm({
      serviceKey:
        service.serviceKey,
      audience:
        service.audience,
      categoryId:
        service.categoryId,
      categoryName:
        service.categoryName,
      subcategoryId:
        service.subcategoryId,
      subcategoryName:
        service.subcategoryName,
      name:
        service.name,
      price:
        typeof service.price ===
        'number'
          ? String(
              service.price,
            )
          : '',
      durationMinutes:
        typeof service.durationMinutes ===
        'number'
          ? String(
              service.durationMinutes,
            )
          : '',
      description:
        service.description ||
        '',
    });
  };
  const updateForm = (
    field: keyof ServiceForm,
    value: string,
  ) => {
    setForm(
      previous =>
        previous
          ? {
              ...previous,
              [field]: value,
            }
          : previous,
    );
  };
  const isDuplicateServiceName = (
    name: string,
  ): boolean => {
    if (!form) {
      return false;
    }
    const normalizedName =
      name.toLowerCase();
    return selectedServices.some(
      service =>
        service.serviceKey !==
          form.serviceKey &&
        service.audience ===
          form.audience &&
        service.categoryId ===
          form.categoryId &&
        service.subcategoryId ===
          form.subcategoryId &&
        service.name
          .trim()
          .toLowerCase() ===
          normalizedName,
    );
  };
  const handleSaveService = () => {
    if (
      !form ||
      saving
    ) {
      return;
    }
    const name =
      normalize(form.name);
    const price =
      positiveNumber(
        form.price,
      );
    const durationMinutes =
      positiveNumber(
        form.durationMinutes,
      );
    if (
      !form.categoryId ||
      !form.categoryName
    ) {
      Alert.alert(
        'Category required',
        'Please select a valid category.',
      );
      return;
    }
    if (
      !form.subcategoryId ||
      !form.subcategoryName
    ) {
      Alert.alert(
        'Subcategory required',
        'Please select a valid subcategory.',
      );
      return;
    }
    if (!name) {
      Alert.alert(
        'Service name required',
        'Enter the service name.',
      );
      return;
    }
    if (
      name.length > 100
    ) {
      Alert.alert(
        'Name too long',
        'Keep the service name under 100 characters.',
      );
      return;
    }
    if (
      isDuplicateServiceName(
        name,
      )
    ) {
      Alert.alert(
        'Service already added',
        `"${name}" has already been added for ${audienceLabel(
          form.audience,
        )} under ${form.subcategoryName}.`,
      );
      return;
    }
    if (!price) {
      Alert.alert(
        'Invalid price',
        'Enter a price greater than ₹0.',
      );
      return;
    }
    if (
      !durationMinutes ||
      !Number.isInteger(
        durationMinutes,
      )
    ) {
      Alert.alert(
        'Invalid duration',
        'Enter a whole number of minutes.',
      );
      return;
    }
    setSaving(true);
    try {
      const newService: ConfiguredService =
        {
          serviceKey:
            form.serviceKey ||
            makeKey(),
          audience:
            form.audience,
          categoryId:
            form.categoryId,
          categoryName:
            form.categoryName,
          subcategoryId:
            form.subcategoryId,
          subcategoryName:
            form.subcategoryName,
          name,
          description:
            normalize(
              form.description,
            ),
          price,
          durationMinutes,
        };
      const updated =
        form.serviceKey
          ? selectedServices.map(
              service =>
                service.serviceKey ===
                form.serviceKey
                  ? {
                      ...service,
                      ...newService,
                    }
                  : service,
            )
          : [
              ...selectedServices,
              newService,
            ];
      saveServices(
        updated,
      );
      setForm(null);
    } catch (error) {
      console.error(
        'SAVE SERVICE ERROR:',
        error,
      );
      Alert.alert(
        'Unable to save',
        'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteService = (
    service: ConfiguredService,
  ) => {
    Alert.alert(
      'Remove service',
      `Remove "${service.name}" from your salon services?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            saveServices(
              selectedServices.filter(
                item =>
                  item.serviceKey !==
                  service.serviceKey,
              ),
            );
          },
        },
      ],
    );
  };
  const handleContinue = () => {
    if (
      !availableAudiences.length
    ) {
      Alert.alert(
        'Audience required',
        'Select at least one audience.',
      );
      return;
    }
    const incomplete =
      availableAudiences.filter(
        audience =>
          getAudienceCount(
            audience,
          ) === 0,
      );
    if (
      incomplete.length
    ) {
      Alert.alert(
        'Add services',
        `Please add at least one service for: ${incomplete
          .map(audienceLabel)
          .join(', ')}.`,
      );
      return;
    }
    const invalid =
      selectedServices.some(
        service =>
          !isAudience(
            service.audience,
          ) ||
          !service.categoryId ||
          !service.categoryName ||
          !service.subcategoryId ||
          !service.subcategoryName ||
          !service.name ||
          !Number.isFinite(
            service.price,
          ) ||
          (service.price ?? 0) <=
            0 ||
          !Number.isInteger(
            service.durationMinutes,
          ) ||
          (service.durationMinutes ??
            0) <= 0,
      );
    if (invalid) {
      Alert.alert(
        'Incomplete services',
        'Please edit any incomplete service before continuing.',
      );
      return;
    }
    setSubmitting(true);
    try {
      saveServices(
        selectedServices,
      );
      setForm(null);
      setModalVisible(
        false,
      );
      navigation.navigate(
        'SalonKYC',
      );
    } catch (error) {
      console.error(
        'CONTINUE SERVICES ERROR:',
        error,
      );
      Alert.alert(
        'Unable to continue',
        'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };
  const toggleCategory = (
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
  };
  const loading =
    categoriesLoading ||
    subcategoriesLoading;
  const catalogError =
    categoriesError ||
    subcategoriesError;
  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Business Services"
      />
      <ScrollView
        contentContainerStyle={
          styles.page
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {
}
        <View
          style={
            styles.pageHeader
          }
        >
          <Text
            style={styles.heading}
          >
            Your salon services
          </Text>
          <Text
            style={styles.subtitle}
          >
            Tell customers what your
            salon offers. Add your
            services, set prices and
            estimated durations.
          </Text>
        </View>
        {
}
        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryText
            }
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {
                selectedServices.length
              }
            </Text>
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.summaryTitle
                }
              >
                Services added
              </Text>
              <Text
                style={
                  styles.summaryHint
                }
              >
                Across{' '}
                {
                  availableAudiences.length
                }{' '}
                selected audience
                {availableAudiences.length ===
                1
                  ? ''
                  : 's'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={
              styles.primarySmall
            }
            onPress={
              openCatalog
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.primarySmallText
              }
            >
              + Add services
            </Text>
          </TouchableOpacity>
        </View>
        {
}
        <Text
          style={styles.sectionTitle}
        >
          Service coverage
        </Text>
        {availableAudiences.map(
          audience => {
            const count =
              getAudienceCount(
                audience,
              );
            return (
              <View
                style={
                  styles.audienceCard
                }
                key={audience}
              >
                <View
                  style={
                    styles.audienceAvatar
                  }
                >
                  <Text
                    style={
                      styles.audienceAvatarText
                    }
                  >
                    {audienceLabel(
                      audience,
                    ).charAt(0)}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.audienceName
                    }
                  >
                    {audienceLabel(
                      audience,
                    )}
                  </Text>
                  <Text
                    style={
                      styles.audienceMeta
                    }
                  >
                    {count} service
                    {count === 1
                      ? ''
                      : 's'}{' '}
                    added
                  </Text>
                </View>
                <Text
                  style={[
                    styles.status,
                    count > 0
                      ? styles.statusDone
                      : styles.statusPending,
                  ]}
                >
                  {count > 0
                    ? 'Added'
                    : 'Required'}
                </Text>
              </View>
            );
          },
        )}
        {
}
        <View
          style={
            styles.listHeader
          }
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Added services
            </Text>
            <Text
              style={
                styles.subtitle
              }
            >
              Review prices and
              durations before
              continuing.
            </Text>
          </View>
          <TouchableOpacity
            onPress={
              openCatalog
            }
          >
            <Text
              style={
                styles.textAction
              }
            >
              + Add
            </Text>
          </TouchableOpacity>
        </View>
        {
}
        {selectedServices.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptySymbol
              }
            >
              <Text
                style={
                  styles.emptySymbolText
                }
              >
                +
              </Text>
            </View>
            <Text
              style={
                styles.emptyTitle
              }
            >
              No services yet
            </Text>
            <Text
              style={
                styles.emptyText
              }
            >
              Select the services
              your salon provides
              to get started.
            </Text>
            <TouchableOpacity
              style={
                styles.emptyButton
              }
              onPress={
                openCatalog
              }
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Choose services
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          availableAudiences.map(
            audience => {
              const services =
                selectedServices
                  .filter(
                    item =>
                      item.audience ===
                      audience,
                  )
                  .sort((a, b) =>
                    a.name.localeCompare(
                      b.name,
                    ),
                  );
              if (
                !services.length
              ) {
                return null;
              }
              return (
                <View
                  key={audience}
                  style={
                    styles.audienceGroup
                  }
                >
                  <View
                    style={
                      styles.audienceHeader
                    }
                  >
                    <Text
                      style={
                        styles.groupTitle
                      }
                    >
                      {audienceLabel(
                        audience,
                      )}
                      <Text
                        style={
                          styles.groupCount
                        }
                      >
                        {' '}
                        ·{' '}
                        {
                          services.length
                        }
                      </Text>
                    </Text>
                  </View>
                  {services.map(
                    service => (
                      <View
                        key={
                          service.serviceKey
                        }
                        style={
                          styles.serviceCard
                        }
                      >
                        <View
                          style={
                            styles.serviceDetails
                          }
                        >
                          <Text
                            style={
                              styles.servicePath
                            }
                          >
                            {
                              service.categoryName
                            }{' '}
                            ›{' '}
                            {
                              service.subcategoryName
                            }
                          </Text>
                          <Text
                            style={
                              styles.serviceName
                            }
                          >
                            {
                              service.name
                            }
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
                              {priceLabel(
                                service.price,
                              )}
                            </Text>
                            <View
                              style={
                                styles.metaDot
                              }
                            />
                            <Text
                              style={
                                styles.serviceDuration
                              }
                            >
                              {
                                service.durationMinutes
                              }{' '}
                              min
                            </Text>
                          </View>
                        </View>
                        <View
                          style={
                            styles.actions
                          }
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setActiveAudience(
                                audience,
                              );
                              setModalVisible(
                                true,
                              );
                              openEditForm(
                                service,
                              );
                            }}
                            style={
                              styles.editButton
                            }
                          >
                            <Text
                              style={
                                styles.editText
                              }
                            >
                              Edit
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              handleDeleteService(
                                service,
                              )
                            }
                            style={
                              styles.removeButton
                            }
                          >
                            <Text
                              style={
                                styles.removeText
                              }
                            >
                              Remove
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ),
                  )}
                </View>
              );
            },
          )
        )}
        {
}
        <View
          style={
            styles.noteCard
          }
        >
          <Text
            style={
              styles.noteTitle
            }
          >
            Before you continue
          </Text>
          <Text
            style={
              styles.noteText
            }
          >
            Add at least one service
            for each selected
            audience. You can add
            multiple services under
            the same category and
            subcategory.
          </Text>
        </View>
        {
}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedServices.length ||
              submitting) &&
              styles.disabledButton,
          ]}
          onPress={
            handleContinue
          }
          disabled={
            !selectedServices.length ||
            submitting
          }
        >
          {submitting ? (
            <ActivityIndicator
              color={COLORS.white}
            />
          ) : (
            <Text
              style={
                styles.continueText
              }
            >
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      {
}
      <Modal
        visible={
          modalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeModal
        }
      >
        <KeyboardAvoidingView
          style={
            styles.overlay
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
              styles.modal
            }
          >
            {
}
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {form
                    ? form.serviceKey
                      ? 'Edit service'
                      : 'Add a service'
                    : 'Choose services'}
                </Text>
                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {form
                    ? `${form.categoryName} › ${form.subcategoryName}`
                    : 'Select a category and service type'}
                </Text>
              </View>
              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={() => {
                  if (form) {
                    setForm(
                      null,
                    );
                  } else {
                    closeModal();
                  }
                }}
                disabled={
                  saving ||
                  submitting
                }
              >
                <Text
                  style={
                    styles.closeText
                  }
                >
                  {form
                    ? '‹'
                    : '×'}
                </Text>
              </TouchableOpacity>
            </View>
            {
}
            {!form ? (
              <>
                {
}
                <View
                  style={
                    styles.audienceSection
                  }
                >
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    SERVICE FOR
                  </Text>
                  <View
                    style={
                      styles.audienceTabs
                    }
                  >
                    {AUDIENCES.filter(
                      item =>
                        availableAudiences.includes(
                          item.key,
                        ),
                    ).map(item => {
                      const active =
                        activeAudience ===
                        item.key;
                      return (
                        <TouchableOpacity
                          key={
                            item.key
                          }
                          onPress={() => {
                            setActiveAudience(
                              item.key,
                            );
                            setSearch(
                              '',
                            );
                            setExpandedCategories(
                              {},
                            );
                          }}
                          style={[
                            styles.audienceTab,
                            active &&
                              styles.audienceTabActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.audienceTabText,
                              active &&
                                styles.audienceTabTextActive,
                            ]}
                          >
                            {
                              item.label
                            }
                          </Text>
                          <Text
                            style={[
                              styles.audienceTabCount,
                              active &&
                                styles.audienceTabCountActive,
                            ]}
                          >
                            {getAudienceCount(
                              item.key,
                            )}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                {
}
                <View
                  style={
                    styles.searchBox
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
                    placeholder="Search categories or service types"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    style={
                      styles.searchInput
                    }
                    returnKeyType="search"
                  />
                  {search.length >
                    0 && (
                    <TouchableOpacity
                      onPress={() =>
                        setSearch(
                          '',
                        )
                      }
                    >
                      <Text
                        style={
                          styles.clearSearch
                        }
                      >
                        Clear
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {
}
                <ScrollView
                  style={
                    styles.catalogBody
                  }
                  contentContainerStyle={
                    styles.catalogContent
                  }
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={
                    false
                  }
                >
                  {loading ? (
                    <View
                      style={
                        styles.loading
                      }
                    >
                      <ActivityIndicator
                        color={
                          COLORS.themeColor
                        }
                      />
                      <Text
                        style={
                          styles.loadingText
                        }
                      >
                        Loading service
                        catalog...
                      </Text>
                    </View>
                  ) : catalogError ? (
                    <View
                      style={
                        styles.emptyCatalog
                      }
                    >
                      <Text
                        style={
                          styles.emptyTitle
                        }
                      >
                        Unable to load
                        services
                      </Text>
                      <Text
                        style={
                          styles.emptyText
                        }
                      >
                        Check your
                        connection and
                        try again.
                      </Text>
                      <TouchableOpacity
                        style={
                          styles.emptyButton
                        }
                        onPress={async () => {
                          try {
                            await Promise.all(
                              [
                                refetchCategories(),
                                refetchSubcategories(),
                              ],
                            );
                          } catch (
                            error
                          ) {
                            console.error(
                              'CATALOG RETRY ERROR:',
                              error,
                            );
                          }
                        }}
                      >
                        <Text
                          style={
                            styles.emptyButtonText
                          }
                        >
                          Try again
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : filteredCategories.length ===
                    0 ? (
                    <View
                      style={
                        styles.emptyCatalog
                      }
                    >
                      <Text
                        style={
                          styles.emptyTitle
                        }
                      >
                        No matching
                        service types
                      </Text>
                      <Text
                        style={
                          styles.emptyText
                        }
                      >
                        Try another
                        search or
                        choose a
                        different
                        audience.
                      </Text>
                    </View>
                  ) : (
                    filteredCategories.map(
                      category => {
                        const isOpen =
                          !!expandedCategories[
                            category
                              .categoryId
                          ] ||
                          !!search.trim();
                        return (
                          <View
                            key={
                              category.categoryId
                            }
                            style={
                              styles.categoryCard
                            }
                          >
                            {
}
                            <TouchableOpacity
                              style={
                                styles.categoryHeader
                              }
                              onPress={() =>
                                toggleCategory(
                                  category.categoryId,
                                )
                              }
                              activeOpacity={
                                0.8
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
                                style={{
                                  flex: 1,
                                }}
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
                                    category
                                      .subcategories
                                      .length
                                  }{' '}
                                  service type
                                  {category
                                    .subcategories
                                    .length ===
                                  1
                                    ? ''
                                    : 's'}
                                </Text>
                              </View>
                              <Text
                                style={
                                  styles.chevron
                                }
                              >
                                {isOpen
                                  ? '−'
                                  : '+'}
                              </Text>
                            </TouchableOpacity>
                            {
}
                            {isOpen &&
                              category.subcategories.map(
                                subcategory => {
                                  const alreadyAdded =
                                    selectedServices.filter(
                                      service =>
                                        service.audience ===
                                          activeAudience &&
                                        service.categoryId ===
                                          category.categoryId &&
                                        service.subcategoryId ===
                                          subcategory.subcategoryId,
                                    ).length;
                                  return (
                                    <TouchableOpacity
                                      key={
                                        subcategory.subcategoryId
                                      }
                                      style={
                                        styles.subcategoryRow
                                      }
                                      onPress={() =>
                                        openAddForm(
                                          category,
                                          subcategory,
                                        )
                                      }
                                      activeOpacity={
                                        0.75
                                      }
                                    >
                                      <View
                                        style={{
                                          flex: 1,
                                        }}
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
                                        {subcategory.description ? (
                                          <Text
                                            style={
                                              styles.subcategoryDescription
                                            }
                                          >
                                            {
                                              subcategory.description
                                            }
                                          </Text>
                                        ) : null}
                                        {alreadyAdded >
                                          0 && (
                                          <Text
                                            style={
                                              styles.alreadyAdded
                                            }
                                          >
                                            {
                                              alreadyAdded
                                            }{' '}
                                            added ·
                                            Add
                                            another
                                            service
                                          </Text>
                                        )}
                                      </View>
                                      <View
                                        style={
                                          styles.addCircle
                                        }
                                      >
                                        <Text
                                          style={
                                            styles.addCircleText
                                          }
                                        >
                                          +
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  );
                                },
                              )}
                          </View>
                        );
                      },
                    )
                  )}
                </ScrollView>
                {
}
                <View
                  style={
                    styles.modalFooter
                  }
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.footerCount
                      }
                    >
                      {
                        selectedServices.length
                      }{' '}
                      services added
                    </Text>
                    <Text
                      style={
                        styles.footerHint
                      }
                    >
                      You can edit them
                      later.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={
                      styles.footerButton
                    }
                    onPress={
                      closeModal
                    }
                  >
                    <Text
                      style={
                        styles.footerButtonText
                      }
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <ScrollView
                  style={
                    styles.formScroll
                  }
                  contentContainerStyle={
                    styles.formContent
                  }
                  keyboardShouldPersistTaps="handled"
                >
                  {
}
                  <View
                    style={
                      styles.pathCard
                    }
                  >
                    <Text
                      style={
                        styles.fieldLabel
                      }
                    >
                      SERVICE CATEGORY
                    </Text>
                    <Text
                      style={
                        styles.pathText
                      }
                    >
                      {
                        form.categoryName
                      }{' '}
                      ›{' '}
                      {
                        form.subcategoryName
                      }
                    </Text>
                    <Text
                      style={
                        styles.pathAudience
                      }
                    >
                      For{' '}
                      {audienceLabel(
                        form.audience,
                      )}
                    </Text>
                  </View>
                  {
}
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    SERVICE NAME *
                  </Text>
                  <TextInput
                    value={
                      form.name
                    }
                    onChangeText={value =>
                      updateForm(
                        'name',
                        value,
                      )
                    }
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
                      !saving
                    }
                    autoCapitalize="words"
                  />
                  {
}
                  <View
                    style={
                      styles.inputRow
                    }
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={
                          styles.fieldLabel
                        }
                      >
                        PRICE (₹) *
                      </Text>
                      <TextInput
                        value={
                          form.price
                        }
                        onChangeText={value =>
                          updateForm(
                            'price',
                            value,
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
                          !saving
                        }
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={
                          styles.fieldLabel
                        }
                      >
                        DURATION (MIN) *
                      </Text>
                      <TextInput
                        value={
                          form.durationMinutes
                        }
                        onChangeText={value =>
                          updateForm(
                            'durationMinutes',
                            value,
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
                          !saving
                        }
                      />
                    </View>
                  </View>
                  {
}
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    DESCRIPTION
                  </Text>
                  <TextInput
                    value={
                      form.description
                    }
                    onChangeText={value =>
                      updateForm(
                        'description',
                        value,
                      )
                    }
                    placeholder="Optional service description"
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
                      500
                    }
                    editable={
                      !saving
                    }
                  />
                  <Text
                    style={
                      styles.helperText
                    }
                  >
                    Use the price and
                    approximate time
                    customers should
                    expect for this
                    service.
                  </Text>
                </ScrollView>
                {
}
                <View
                  style={
                    styles.formFooter
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.cancelButton
                    }
                    onPress={() =>
                      setForm(
                        null,
                      )
                    }
                    disabled={
                      saving
                    }
                  >
                    <Text
                      style={
                        styles.cancelText
                      }
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={
                      styles.saveButton
                    }
                    onPress={
                      handleSaveService
                    }
                    disabled={
                      saving
                    }
                  >
                    {saving ? (
                      <ActivityIndicator
                        color={
                          COLORS.white
                        }
                      />
                    ) : (
                      <Text
                        style={
                          styles.saveText
                        }
                      >
                        {form.serviceKey
                          ? 'Save changes'
                          : 'Add service'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },
    page: {
      padding:
        SPACING.large,
      paddingBottom:
        SPACING.huge,
    },
    pageHeader: {
      marginBottom:
        SPACING.large,
    },
    heading: {
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
    },
    summaryCard: {
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
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },
    summaryText: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
    },
    summaryNumber: {
      fontFamily:
        FONTS.bold,
      fontSize: 32,
      color:
        COLORS.themeColor,
      marginRight:
        SPACING.medium,
    },
    summaryTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
    },
    summaryHint: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },
    primarySmall: {
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
      marginLeft:
        SPACING.small,
    },
    primarySmallText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.white,
    },
    sectionTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
      marginBottom:
        SPACING.small,
    },
    audienceCard: {
      flexDirection:
        'row',
      alignItems:
        'center',
      padding:
        SPACING.medium,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.surface,
      marginBottom:
        SPACING.small,
    },
    audienceAvatar: {
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
    audienceAvatarText: {
      fontFamily:
        FONTS.bold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.themeColor,
    },
    audienceName: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },
    audienceMeta: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },
    status: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 10,
      paddingHorizontal:
        SPACING.small,
      paddingVertical: 5,
      borderRadius:
        RADIUS.medium,
    },
    statusDone: {
      color:
        COLORS.themeColor,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
    },
    statusPending: {
      color:
        COLORS.textSecondary,
      backgroundColor:
        COLORS.background,
    },
    listHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop:
        SPACING.large,
      marginBottom:
        SPACING.medium,
    },
    textAction: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.themeColor,
      marginLeft:
        SPACING.small,
    },
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
    },
    emptySymbol: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom:
        SPACING.medium,
    },
    emptySymbolText: {
      color:
        COLORS.themeColor,
      fontSize: 28,
      fontFamily:
        FONTS.regular,
    },
    emptyTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.text,
      textAlign:
        'center',
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
      lineHeight: 19,
      marginTop:
        SPACING.small,
    },
    emptyButton: {
      backgroundColor:
        COLORS.themeColor,
      paddingHorizontal:
        SPACING.large,
      paddingVertical:
        SPACING.small,
      borderRadius:
        RADIUS.medium,
      marginTop:
        SPACING.large,
    },
    emptyButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.white,
    },
    audienceGroup: {
      marginBottom:
        SPACING.large,
    },
    audienceHeader: {
        width: '100%',
      alignSelf: 'flex-start',
      backgroundColor:
        COLORS.themeColor,
      borderRadius:
        RADIUS.medium,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.small,
      marginBottom:
        SPACING.small,
    },
    groupTitle: {
      fontFamily:
        FONTS.bold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.white,
    },
    groupCount: {
      fontFamily:
        FONTS.regular,
      color:
        COLORS.white,
    },
    serviceCard: {
      flexDirection:
        'row',
      alignItems:
        'center',
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      padding:
        SPACING.medium,
      marginBottom:
        SPACING.small,
    },
    serviceDetails: {
      flex: 1,
      paddingRight:
        SPACING.small,
    },
    serviceName: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },
    servicePath: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },
    serviceMeta: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop:
        SPACING.small,
    },
    servicePrice: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.themeColor,
    },
    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        COLORS.textMuted,
      marginHorizontal:
        SPACING.small,
    },
    serviceDuration: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
    },
    actions: {
      alignItems:
        'flex-end',
      gap: 8,
    },
    editButton: {
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.small,
      paddingHorizontal:
        SPACING.medium,
      paddingVertical: 6,
    },
    editText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.text,
    },
    removeButton: {
      paddingHorizontal:
        SPACING.medium,
      paddingVertical: 4,
    },
    removeText: {
      fontFamily:
        FONTS.medium,
      fontSize: 10,
      color:
        COLORS.textSecondary,
    },
    noteCard: {
      padding:
        SPACING.medium,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      marginTop:
        SPACING.medium,
    },
    noteTitle: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
      marginBottom: 4,
    },
    noteText: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },
    continueButton: {
      height: 52,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginTop:
        SPACING.large,
    },
    disabledButton: {
      opacity: 0.5,
    },
    continueText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.body,
      color:
        COLORS.white,
    },
    overlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.45)',
      justifyContent:
        'flex-end',
    },
    modal: {
      height: '92%',
      width: '100%',
      backgroundColor:
        COLORS.surface,
      borderTopLeftRadius:
        RADIUS.large,
      borderTopRightRadius:
        RADIUS.large,
      overflow:
        'hidden',
    },
    modalHeader: {
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
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },
    closeButton: {
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
      marginLeft:
        SPACING.small,
    },
    closeText: {
      fontSize: 25,
      color:
        COLORS.textSecondary,
      lineHeight: 28,
    },
    audienceSection: {
      paddingHorizontal:
        SPACING.large,
      paddingTop:
        SPACING.medium,
      paddingBottom:
        SPACING.small,
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },
    fieldLabel: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 10,
      color:
        COLORS.textSecondary,
      marginBottom:
        SPACING.small,
    },
    audienceTabs: {
      flexDirection:
        'row',
      gap:
        SPACING.small,
    },
    audienceTab: {
      flex: 1,
      minHeight: 42,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      borderRadius:
        RADIUS.medium,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      paddingHorizontal: 4,
      gap: 5,
    },
    audienceTabActive: {
      backgroundColor:
        COLORS.themeColor,
      borderColor:
        COLORS.themeColor,
    },
    audienceTabText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.textSecondary,
    },
    audienceTabTextActive: {
      color:
        COLORS.white,
    },
    audienceTabCount: {
      fontFamily:
        FONTS.medium,
      fontSize: 10,
      color:
        COLORS.textSecondary,
    },
    audienceTabCountActive: {
      color:
        COLORS.white,
    },
    searchBox: {
      flexDirection:
        'row',
      alignItems:
        'center',
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      marginHorizontal:
        SPACING.large,
      marginVertical:
        SPACING.medium,
      paddingHorizontal:
        SPACING.medium,
      minHeight: 46,
      backgroundColor:
        COLORS.background,
    },
    searchIcon: {
      fontSize: 22,
      color:
        COLORS.textSecondary,
      marginRight:
        SPACING.small,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 8,
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },
    clearSearch: {
      fontFamily:
        FONTS.medium,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.themeColor,
      padding: 4,
    },
    catalogBody: {
      flex: 1,
    },
    catalogContent: {
      paddingHorizontal:
        SPACING.large,
      paddingBottom:
        SPACING.large,
    },
    loading: {
      padding:
        SPACING.xxl,
      alignItems:
        'center',
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
    emptyCatalog: {
      padding:
        SPACING.xxl,
      alignItems:
        'center',
    },
    categoryCard: {
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
      marginBottom:
        SPACING.small,
      overflow:
        'hidden',
      backgroundColor:
        COLORS.surface,
    },
    categoryHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      padding:
        SPACING.medium,
      minHeight: 68,
      backgroundColor:
        COLORS.surface,
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
    categoryName: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },
    categoryMeta: {
      fontFamily:
        FONTS.regular,
      fontSize: 10,
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },
    chevron: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 22,
      color:
        COLORS.themeColor,
      paddingHorizontal:
        SPACING.small,
    },
    subcategoryRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal:
        SPACING.medium,
      paddingVertical:
        SPACING.medium,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
      backgroundColor:
        COLORS.background,
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
      fontSize: 10,
      color:
        COLORS.textSecondary,
      marginTop: 3,
    },
    alreadyAdded: {
      fontFamily:
        FONTS.medium,
      fontSize: 10,
      color:
        COLORS.themeColor,
      marginTop: 4,
    },
    addCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginLeft:
        SPACING.small,
    },
    addCircleText: {
      fontFamily:
        FONTS.semiBold,
      fontSize: 21,
      color:
        COLORS.themeColor,
      lineHeight: 24,
    },
    modalFooter: {
      flexDirection:
        'row',
      alignItems:
        'center',
      padding:
        SPACING.medium,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
      backgroundColor:
        COLORS.surface,
    },
    footerCount: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.text,
    },
    footerHint: {
      fontFamily:
        FONTS.regular,
      fontSize: 10,
      color:
        COLORS.textSecondary,
      marginTop: 2,
    },
    footerButton: {
      minWidth: 100,
      height: 44,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal:
        SPACING.large,
    },
    footerButtonText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.white,
    },
    formScroll: {
      flex: 1,
    },
    formContent: {
      padding:
        SPACING.large,
      paddingBottom:
        SPACING.xxl,
    },
    pathCard: {
      padding:
        SPACING.medium,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.background,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      marginBottom:
        SPACING.large,
    },
    pathText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },
    pathAudience: {
      fontFamily:
        FONTS.medium,
      fontSize:
        FONT_SIZES.xs,
      color:
        COLORS.themeColor,
      marginTop: 4,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.medium,
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
      backgroundColor:
        COLORS.surface,
      marginBottom:
        SPACING.large,
    },
    descriptionInput: {
      minHeight: 100,
      paddingTop:
        SPACING.medium,
    },
    inputRow: {
      flexDirection:
        'row',
      gap:
        SPACING.medium,
    },
    helperText: {
      fontFamily:
        FONTS.regular,
      fontSize:
        FONT_SIZES.xs,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },
    formFooter: {
      flexDirection:
        'row',
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
      height: 50,
      borderRadius:
        RADIUS.medium,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight:
        SPACING.small,
    },
    cancelText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.text,
    },
    saveButton: {
      flex: 1.5,
      height: 50,
      borderRadius:
        RADIUS.medium,
      backgroundColor:
        COLORS.themeColor,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginLeft:
        SPACING.small,
    },
    saveText: {
      fontFamily:
        FONTS.semiBold,
      fontSize:
        FONT_SIZES.small,
      color:
        COLORS.white,
    },
  });
