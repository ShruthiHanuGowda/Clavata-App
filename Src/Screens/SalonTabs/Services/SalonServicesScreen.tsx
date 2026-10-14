
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

const PURPLE = '#8B5CF6';
const PURPLE_DARK = '#6741A5';
const PURPLE_LIGHT = '#F2EDFF';
const TEXT = '#242033';
const MUTED = '#777386';
const BORDER = '#E9E5F1';
const WHITE = '#FFFFFF';
const DANGER = '#C7465C';

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

const blankService = (): ServiceDraft => ({
  categoryId: '',
  categoryName: '',
  subcategoryId: '',
  subcategoryName: '',
  serviceName: '',
  audience: 'FEMALE',
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

export default function SalonServicesScreen() {
  const { currentUser } = useUser();
  const salonId = currentUser?.salonId;

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<ServiceSelection[]>([]);
  const [draftReady, setDraftReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [serviceDraft, setServiceDraft] =
    useState<ServiceDraft>(blankService());

  const [categoryEditorVisible, setCategoryEditorVisible] =
    useState(false);
  const [categoryToRename, setCategoryToRename] =
    useState<string | null>(null);
  const [categoryNameDraft, setCategoryNameDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    data: salonResult,
    loading: salonLoading,
    error: salonError,
    refetch: refetchSalon,
  } = useQuery(GET_SALON_FOR_SERVICES, {
    variables: { salonId },
    skip: !salonId,
    fetchPolicy: 'network-only',
  });

  const {
    data: pendingResult,
    loading: pendingLoading,
    refetch: refetchPending,
  } = useQuery(GET_PENDING_PROFILE_CHANGE, {
    variables: { salonId },
    skip: !salonId,
    fetchPolicy: 'network-only',
  });

  const {
    data: categoryResult,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(GET_ACTIVE_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
  });

  // Fetch subcategories only after a category has been selected.
  // The query refreshes when the selected category changes.
  const {
    data: subcategoryResult,
    loading: subcategoriesLoading,
    error: subcategoriesError,
    refetch: refetchSubcategories,
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

  const salon: SalonProfile | undefined = salonResult?.getSalon;

  const pendingChange =
    pendingResult?.getPendingSalonProfileChange;

  const isPending = pendingChange?.status === 'PENDING';
  const isLocked = isPending || submitting;

  const categories: CategoryOption[] = useMemo(() => {
    const result = categoryResult?.categories?.categories ?? [];

    return result
      .filter((item: any) => item?.status === 'ACTIVE')
      .map((item: any) => ({
        id: String(item.categoryId),
        name: String(item.name),
      }));
  }, [categoryResult]);

  const subcategories: SubcategoryOption[] = useMemo(() => {
    const result = subcategoryResult?.subcategories?.subcategories ?? [];

    return result
      .filter((item: any) => item?.status === 'ACTIVE')
      .map((item: any) => ({
        subcategoryId: String(item.subcategoryId),
        categoryId: String(item.categoryId),
        name: String(item.name),
        audiences: Array.isArray(item.audiences)
          ? item.audiences
          : [],
      }));
  }, [subcategoryResult]);

  // Defensively filter by category and audience on the client as well.
  const visibleSubcategories = useMemo(() => {
    if (!serviceDraft.categoryId) {
      return [];
    }

    return subcategories.filter(item => {
      const sameCategory =
        String(item.categoryId) ===
        String(serviceDraft.categoryId);

      const supportsAudience =
        item.audiences.length === 0 ||
        item.audiences.includes(serviceDraft.audience);

      return sameCategory && supportsAudience;
    });
  }, [
    subcategories,
    serviceDraft.categoryId,
    serviceDraft.audience,
  ]);

  useEffect(() => {
    if (!salon || draftReady) {
      return;
    }

    setDraft(
      (salon.serviceSelections ?? []).map(item => ({
        ...item,
        categoryId: String(item.categoryId ?? ''),
        categoryName: String(item.categoryName ?? ''),
        subcategoryId: String(item.subcategoryId ?? ''),
        subcategoryName: String(item.subcategoryName ?? ''),
        serviceName: String(item.serviceName ?? ''),
        price: Number(item.price),
        duration: Number(item.duration),
      })),
    );

    setDraftReady(true);
  }, [salon, draftReady]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();

    draft.forEach(item => {
      if (item.categoryId && item.categoryName) {
        map.set(item.categoryId, item.categoryName);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [draft]);

  const filteredServices = useMemo(() => {
    const query = normalizedKey(search);

    return draft
      .map((item, index) => ({ ...item, _index: index }))
      .filter(item => {
        const matchesCategory =
          selectedCategory === 'ALL' ||
          item.categoryId === selectedCategory;

        const matchesSearch =
          !query ||
          normalizedKey(item.serviceName).includes(query) ||
          normalizedKey(item.categoryName).includes(query) ||
          normalizedKey(item.subcategoryName).includes(query);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const categoryCompare =
          a.categoryName.localeCompare(b.categoryName);

        if (categoryCompare !== 0) {
          return categoryCompare;
        }

        return a.serviceName.localeCompare(b.serviceName);
      });
  }, [draft, search, selectedCategory]);

  const closeServiceModal = useCallback(() => {
    setModalVisible(false);
    setEditingIndex(null);
    setServiceDraft(blankService());
  }, []);

  const openAddService = useCallback(() => {
    if (isLocked) {
      return;
    }

    setEditingIndex(null);
    setServiceDraft(blankService());
    setModalVisible(true);
  }, [isLocked]);

  const openEditService = useCallback(
    (item: ServiceSelection, index: number) => {
      if (isLocked) {
        return;
      }

      setEditingIndex(index);

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

  const chooseCategory = (category: CategoryOption) => {
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

  const chooseSubcategory = (subcategory: SubcategoryOption) => {
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
  };

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

    // Verify the chosen subcategory belongs to the selected category
    // and is compatible with the selected audience.
    const selectedSubcategory = subcategories.find(
      item =>
        item.subcategoryId === serviceDraft.subcategoryId &&
        item.categoryId === serviceDraft.categoryId,
    );

    if (!selectedSubcategory) {
      Alert.alert(
        'Select a valid subcategory',
        'This subcategory is no longer available for the selected category. Please select a category and subcategory again.',
      );
      return;
    }

    const audienceSupported =
      selectedSubcategory.audiences.length === 0 ||
      selectedSubcategory.audiences.includes(serviceDraft.audience);

    if (!audienceSupported) {
      Alert.alert(
        'Audience not supported',
        'The selected subcategory is not available for this audience. Please choose another subcategory.',
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

    // Ignore the current item when editing, but reject duplicates
    // across the rest of the draft.
    const duplicateExists = draft.some((item, index) => {
      if (editingIndex !== null && index === editingIndex) {
        return false;
      }

      return (
        normalizedKey(item.categoryId) ===
          normalizedKey(serviceDraft.categoryId) &&
        normalizedKey(item.subcategoryId) ===
          normalizedKey(serviceDraft.subcategoryId) &&
        item.audience === serviceDraft.audience &&
        normalizedKey(item.serviceName) === normalizedKey(name)
      );
    });

    if (duplicateExists) {
      Alert.alert(
        'Service already added',
        `"${name}" already exists under this category, subcategory, and audience. Edit the existing service instead, or use a different service name.`,
      );
      return;
    }

    const newItem: ServiceSelection = {
      categoryId: serviceDraft.categoryId,
      categoryName: serviceDraft.categoryName,
      subcategoryId: serviceDraft.subcategoryId,
      subcategoryName: selectedSubcategory.name,
      serviceName: name,
      audience: serviceDraft.audience,
      price,
      duration,
    };

    setDraft(previous => {
      if (editingIndex === null) {
        return [...previous, newItem];
      }

      return previous.map((item, index) =>
        index === editingIndex ? newItem : item,
      );
    });

    closeServiceModal();
  };

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
      `Remove "${item.serviceName}" from your proposed catalogue?`,
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

  const renameCategory = () => {
    if (isLocked || !categoryToRename) {
      return;
    }

    const name = normalize(categoryNameDraft);

    if (!name) {
      Alert.alert(
        'Category name required',
        'Enter a category name.',
      );
      return;
    }

    setDraft(previous =>
      previous.map(item =>
        item.categoryId === categoryToRename
          ? { ...item, categoryName: name }
          : item,
      ),
    );

    setCategoryEditorVisible(false);
    setCategoryToRename(null);
    setCategoryNameDraft('');
  };

  const removeCategory = (categoryId: string, name: string) => {
    if (isLocked) {
      return;
    }

    const count = draft.filter(
      item => item.categoryId === categoryId,
    ).length;

    Alert.alert(
      'Remove category?',
      `This removes "${name}" and all ${count} service(s) under it from your proposed catalogue. You must submit the changes for admin review.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove category',
          style: 'destructive',
          onPress: () => {
            setDraft(previous =>
              previous.filter(
                item => item.categoryId !== categoryId,
              ),
            );

            if (selectedCategory === categoryId) {
              setSelectedCategory('ALL');
            }
          },
        },
      ],
    );
  };

  const validateDraft = (): string | null => {
    if (!salon) {
      return 'Salon profile could not be loaded.';
    }

    if (draft.length === 0) {
      return 'Add at least one service before submitting.';
    }

    const keys = new Set<string>();

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

      if (
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) < 0 ||
        !Number.isInteger(Number(item.duration)) ||
        Number(item.duration) <= 0
      ) {
        return `Check the price and duration for "${item.serviceName}".`;
      }

      const key = [
        item.categoryId,
        item.subcategoryId,
        item.audience,
        normalizedKey(item.serviceName),
      ].join('|');

      if (keys.has(key)) {
        return `Duplicate service found: "${item.serviceName}".`;
      }

      keys.add(key);
    }

    return null;
  };

  const submitForReview = () => {
    if (isLocked || !salon) {
      return;
    }

    const validationError = validateDraft();

    if (validationError) {
      Alert.alert('Review your catalogue', validationError);
      return;
    }

    Alert.alert(
      'Confirm service catalogue',
      [
        `Services: ${draft.length}`,
        `Categories: ${
          new Set(draft.map(item => item.categoryId)).size
        }`,
        `Total listed service prices: ${money(
          draft.reduce(
            (sum, item) => sum + Number(item.price),
            0,
          ),
        )}`,
        '',
        'After submission, you will not be able to edit this catalogue while admin review is pending.',
        '',
        'Do you confirm that all service names, prices, durations, and categories are correct?',
      ].join('\n'),
      [
        {
          text: 'Go back and check',
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
                targetAudiences: salon.targetAudiences,
                email: salon.email,
                ownerPhoneNumber: salon.ownerPhoneNumber,
                alternatePhone: salon.alternatePhone ?? null,
                address: salon.address,
                logoUrl: salon.logoUrl ?? null,
                coverImageUrl: salon.coverImageUrl ?? null,
                galleryImages: salon.galleryImages ?? [],
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
                  'Your proposed catalogue has been submitted for admin review.',
              );
            } catch (error: any) {
              Alert.alert(
                'Submission failed',
                error?.message ||
                  'Could not submit your catalogue. Please try again.',
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

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
            <Text style={styles.primaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </AppGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={filteredServices}
        keyExtractor={(item, index) =>
          `${item.categoryId}-${item.subcategoryId}-${item.audience}-${item.serviceName}-${index}`
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        refreshing={salonLoading}
        onRefresh={() => {
          refetchSalon();
          refetchPending();
          refetchCategories();
        }}
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
                    Manage your proposed services before sending
                    them for admin review.
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
                  Your catalogue is locked while admin review is
                  pending. You can view your submission, but cannot
                  edit or delete services.
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
                    'Review the catalogue, make corrections, and resubmit.'}
                </Text>
              </View>
            )}

            <View style={styles.toolbar}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search services or categories"
                placeholderTextColor="#9993A8"
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
                >
                  <Text style={styles.addButtonText}>
                    + Add service
                  </Text>
                </TouchableOpacity>
              </AppGradient>
            </View>

            <Text style={styles.sectionLabel}>
              FILTER BY CATEGORY
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory('ALL')}
                style={[
                  styles.chip,
                  selectedCategory === 'ALL' &&
                    styles.chipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === 'ALL' &&
                      styles.chipTextSelected,
                  ]}
                >
                  All categories
                </Text>
              </TouchableOpacity>

              {categoryOptions.map(category => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.chip,
                    selectedCategory === category.id &&
                      styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === category.id &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.categoryManagement}>
              <Text style={styles.categoryManagementTitle}>
                Manage categories
              </Text>

              <Text style={styles.categoryManagementHint}>
                Renaming here changes the proposed catalogue label.
                Removing a category also removes its services.
              </Text>

              {categoryOptions.map(category => (
                <View
                  key={`manage-${category.id}`}
                  style={styles.categoryRow}
                >
                  <View style={styles.categoryRowText}>
                    <Text style={styles.categoryName}>
                      {category.name}
                    </Text>

                    <Text style={styles.categoryCount}>
                      {
                        draft.filter(
                          item =>
                            item.categoryId === category.id,
                        ).length
                      }{' '}
                      services
                    </Text>
                  </View>

                  <TouchableOpacity
                    disabled={isLocked}
                    onPress={() => {
                      setCategoryToRename(category.id);
                      setCategoryNameDraft(category.name);
                      setCategoryEditorVisible(true);
                    }}
                    style={styles.smallAction}
                  >
                    <Text
                      style={[
                        styles.editText,
                        isLocked && styles.disabledText,
                      ]}
                    >
                      Rename
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={isLocked}
                    onPress={() =>
                      removeCategory(category.id, category.name)
                    }
                    style={styles.smallAction}
                  >
                    <Text
                      style={[
                        styles.deleteText,
                        isLocked && styles.disabledText,
                      ]}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                disabled={isLocked}
                onPress={openAddService}
                style={[
                  styles.outlineButton,
                  isLocked && styles.disabledButton,
                ]}
              >
                <Text style={styles.outlineButtonText}>
                  + Add a category through a service
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Your services</Text>
              <Text style={styles.resultsCount}>
                {filteredServices.length} shown
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardTop}>
              <View style={styles.serviceIdentity}>
                <Text style={styles.serviceName}>
                  {item.serviceName}
                </Text>

                <Text style={styles.serviceCategory}>
                  {item.categoryName} · {item.subcategoryName}
                </Text>

                <View style={styles.audienceBadge}>
                  <Text style={styles.audienceText}>
                    {item.audience}
                  </Text>
                </View>
              </View>

              <View style={styles.priceBlock}>
                <Text style={styles.price}>
                  {money(Number(item.price))}
                </Text>

                <Text style={styles.duration}>
                  {Number(item.duration)} min
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.serviceActions}>
              <TouchableOpacity
                disabled={isLocked}
                onPress={() => openEditService(item, item._index)}
                style={[
                  styles.secondaryAction,
                  isLocked && styles.actionDisabled,
                ]}
              >
                <Text style={styles.secondaryActionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isLocked}
                onPress={() => deleteService(item._index)}
                style={[
                  styles.secondaryAction,
                  isLocked && styles.actionDisabled,
                ]}
              >
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {draft.length === 0
                ? 'No services in your catalogue'
                : 'No matching services'}
            </Text>

            <Text style={styles.emptyDescription}>
              {draft.length === 0
                ? 'Add a service with its category, price, and duration to get started.'
                : 'Try another search term or select a different category.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.reviewSummary}>
              <Text style={styles.reviewSummaryTitle}>
                Before submitting
              </Text>

              <Text style={styles.reviewSummaryText}>
                Check every service name, category, audience, price,
                and duration. Your changes will be sent to the admin
                panel for review.
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
                disabled={isLocked}
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

      {/* Add / edit service modal */}
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
              <Text style={styles.modalTitle}>
                {editingIndex === null ? 'Add service' : 'Edit service'}
              </Text>

              <Text style={styles.modalSubtitle}>
                Choose an admin-defined category and subcategory,
                then enter the service details.
              </Text>

              <Text style={styles.inputLabel}>Category</Text>

              {categoriesLoading ? (
                <View style={styles.subcategoryLoading}>
                  <ActivityIndicator color={PURPLE} />
                  <Text style={styles.muted}>
                    Loading categories…
                  </Text>
                </View>
              ) : categoriesError ? (
                <View style={styles.inlineErrorContainer}>
                  <Text style={styles.subcategoryError}>
                    Could not load categories. Please try again.
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
                  No active categories are available. Please ask the
                  admin to activate a category.
                </Text>
              ) : (
                <View style={styles.optionWrap}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => chooseCategory(category)}
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

              <Text style={styles.inputLabel}>Subcategory</Text>

              {!serviceDraft.categoryId ? (
                <Text style={styles.emptyOptionText}>
                  Select a category first to view its subcategories.
                </Text>
              ) : subcategoriesLoading ? (
                <View style={styles.subcategoryLoading}>
                  <ActivityIndicator color={PURPLE} />
                  <Text style={styles.muted}>
                    Loading subcategories…
                  </Text>
                </View>
              ) : subcategoriesError ? (
                <View style={styles.inlineErrorContainer}>
                  <Text style={styles.subcategoryError}>
                    Could not load subcategories. Check your
                    connection and try again.
                  </Text>

                  <TouchableOpacity
                    onPress={() => refetchSubcategories()}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryText}>
                      Retry subcategories
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.errorDetail}>
                    {subcategoriesError.message}
                  </Text>
                </View>
              ) : visibleSubcategories.length === 0 ? (
                <Text style={styles.emptyOptionText}>
                  No active subcategories are available for this
                  category and audience. Check that the subcategory
                  is active in the admin panel and supports{' '}
                  {serviceDraft.audience}.
                </Text>
              ) : (
                <View style={styles.optionWrap}>
                  {visibleSubcategories.map(subcategory => (
                    <TouchableOpacity
                      key={subcategory.subcategoryId}
                      onPress={() =>
                        chooseSubcategory(subcategory)
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

              <Text style={styles.inputLabel}>Audience</Text>

              <View style={styles.optionWrap}>
                {(['FEMALE', 'MALE', 'KIDS'] as Audience[]).map(
                  audience => (
                    <TouchableOpacity
                      key={audience}
                      onPress={() => {
                        setServiceDraft(current => ({
                          ...current,
                          audience,
                          // Force a fresh selection because audience
                          // support can differ by subcategory.
                          subcategoryId: '',
                          subcategoryName: '',
                        }));
                      }}
                      style={[
                        styles.optionChip,
                        serviceDraft.audience === audience &&
                          styles.optionChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          serviceDraft.audience === audience &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {audience}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

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
                  style={styles.modalPrimaryGradient}
                >
                  <TouchableOpacity
                    style={styles.modalPrimaryInner}
                    onPress={saveService}
                    disabled={isLocked}
                  >
                    <Text style={styles.primaryButtonText}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </AppGradient>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rename category modal */}
      <Modal
        visible={categoryEditorVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCategoryEditorVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.renameDialog}>
            <Text style={styles.modalTitle}>Rename category</Text>

            <Text style={styles.modalSubtitle}>
              This changes the category label in the proposed
              catalogue. It does not rename the global admin
              category.
            </Text>

            <TextInput
              style={styles.input}
              value={categoryNameDraft}
              onChangeText={setCategoryNameDraft}
              placeholder="Category name"
              placeholderTextColor="#9993A8"
              maxLength={100}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCategoryEditorVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <AppGradient
                colors={[...GRADIENTS.SOFT_PURPLE]}
                style={styles.modalPrimaryGradient}
              >
                <TouchableOpacity
                  style={styles.modalPrimaryInner}
                  onPress={renameCategory}
                  disabled={isLocked}
                >
                  <Text style={styles.primaryButtonText}>
                    Save draft
                  </Text>
                </TouchableOpacity>
              </AppGradient>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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

  toolbar: {
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

  sectionLabel: {
    marginTop: 20,
    marginHorizontal: 20,
    color: MUTED,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  chipRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  chipSelected: {
    borderColor: PURPLE,
    backgroundColor: PURPLE_LIGHT,
  },

  chipText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },

  chipTextSelected: {
    color: PURPLE_DARK,
    fontWeight: '800',
  },

  categoryManagement: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  categoryManagementTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
  },

  categoryManagementHint: {
    marginTop: 5,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F1EEF6',
    gap: 8,
  },

  categoryRowText: {
    flex: 1,
  },

  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
  },

  categoryCount: {
    marginTop: 3,
    fontSize: 11,
    color: MUTED,
  },

  smallAction: {
    paddingHorizontal: 7,
    paddingVertical: 7,
  },

  editText: {
    color: PURPLE_DARK,
    fontSize: 12,
    fontWeight: '700',
  },

  deleteText: {
    color: DANGER,
    fontSize: 12,
    fontWeight: '700',
  },

  disabledText: {
    opacity: 0.4,
  },

  outlineButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9CEFA',
    alignItems: 'center',
    backgroundColor: '#FBF9FF',
  },

  outlineButtonText: {
    color: PURPLE_DARK,
    fontWeight: '700',
    fontSize: 12,
  },

  resultsHeader: {
    marginHorizontal: 20,
    marginTop: 23,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
  },

  resultsCount: {
    fontSize: 12,
    color: MUTED,
  },

  serviceCard: {
    marginHorizontal: 16,
    marginBottom: 11,
    padding: 15,
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#49337C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  serviceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  serviceIdentity: {
    flex: 1,
    paddingRight: 10,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
  },

  serviceCategory: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },

  audienceBadge: {
    alignSelf: 'flex-start',
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: PURPLE_LIGHT,
  },

  audienceText: {
    color: PURPLE_DARK,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  priceBlock: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },

  price: {
    fontSize: 18,
    fontWeight: '800',
    color: PURPLE_DARK,
  },

  duration: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F0EDF5',
    marginTop: 14,
  },

  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    paddingTop: 11,
  },

  secondaryAction: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F1FF',
  },

  secondaryActionText: {
    color: PURPLE_DARK,
    fontSize: 12,
    fontWeight: '700',
  },

  actionDisabled: {
    opacity: 0.35,
  },

  emptyState: {
    paddingHorizontal: 28,
    paddingVertical: 40,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
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

  renameDialog: {
    marginHorizontal: 22,
    marginBottom: 40,
    padding: 20,
    borderRadius: 22,
    backgroundColor: WHITE,
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
    marginTop: 13,
    marginBottom: 7,
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

  errorDetail: {
    marginTop: 5,
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
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
