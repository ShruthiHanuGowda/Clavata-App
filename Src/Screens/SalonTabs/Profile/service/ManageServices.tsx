import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { useUser } from '../../../../context/UserContext';
import {
    LIST_SERVICES,
    CREATE_SERVICE,
    UPDATE_SERVICE,
    DELETE_SERVICE
} from '../../../../graphql/queries';

type ServiceGender = 'MEN' | 'WOMEN' | 'UNISEX';

type Service = {
    serviceId: string;
    salonId: string;
    name: string;
    category: string;
    description?: string | null;
    duration: number;
    price: number;
    gender: ServiceGender;
    popular: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    updatedBy?: string | null;
};

type FormState = {
    name: string;
    category: string;
    description: string;
    duration: string;
    price: string;
    gender: ServiceGender;
    popular: boolean;
    active: boolean;
};

const EMPTY_FORM: FormState = {
    name: '',
    category: '',
    description: '',
    duration: '',
    price: '',
    gender: 'UNISEX',
    popular: false,
    active: true
};

const CATEGORIES = [
    'All',
    'Hair',
    'Hair Color',
    'Facial',
    'Skin',
    'Makeup',
    'Nails',
    'Massage',
    'Waxing',
    'Threading',
    'Spa',
    'Bridal',
    'Other'
];

const FILTERS = ['All', 'Active', 'Inactive'];

const ManageServices = () => {
    const { currentUser } = useUser();

    /*
     * If your useAuth() exposes salonId differently, change this line.
     *
     * Supported examples:
     * user.salonId
     * user?.attributes?.['custom:salonId']
     */
    const salonId = currentUser?.salonId;

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(LIST_SERVICES, {
        variables: {
            salonId
        },
        skip: !salonId,
        fetchPolicy: 'network-only'
    });

    console.log('LIST_SERVICES DATA:', JSON.stringify(data, null, 2));
    console.log('LIST_SERVICES ERROR:', error);
    console.log('SALON ID:', salonId);
    const [createService, { loading: creating }] = useMutation(CREATE_SERVICE);
    const [updateService, { loading: updating }] = useMutation(UPDATE_SERVICE);
    const [deleteService, { loading: deleting }] = useMutation(DELETE_SERVICE);

    const services: Service[] = useMemo(() => {
        if (!Array.isArray(data?.listServices)) {
            return [];
        }
        return data.listServices;
    }, [data?.listServices]);
    console.log('SERVICES COUNT:', services.length);
    console.log('SERVICES:', JSON.stringify(services, null, 2));

    const filteredServices = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return services.filter((service) => {
            const matchesSearch =
                !normalizedSearch ||
                service.name.toLowerCase().includes(normalizedSearch) ||
                service.category.toLowerCase().includes(normalizedSearch) ||
                (service.description ?? '').toLowerCase().includes(normalizedSearch);

            const matchesCategory =
                categoryFilter === 'All' ||
                service.category.toLowerCase() === categoryFilter.toLowerCase();

            const matchesStatus =
                statusFilter === 'All' ||
                (statusFilter === 'Active' && service.active) ||
                (statusFilter === 'Inactive' && !service.active);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [services, search, categoryFilter, statusFilter]);

    console.log('FILTERED SERVICES COUNT:', filteredServices.length);
    console.log(
        'FILTERS:',
        JSON.stringify({
            search,
            categoryFilter,
            statusFilter
        })
    );

    const activeCount = services.filter((service) => service.active).length;
    const inactiveCount = services.filter((service) => !service.active).length;
    const popularCount = services.filter((service) => service.popular).length;

    const openCreateModal = () => {
        setEditingService(null);
        setForm(EMPTY_FORM);
        setModalVisible(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);

        setForm({
            name: service.name,
            category: service.category,
            description: service.description ?? '',
            duration: String(service.duration),
            price: String(service.price),
            gender: service.gender,
            popular: service.popular,
            active: service.active
        });

        setModalVisible(true);
    };

    const closeModal = () => {
        if (creating || updating) {
            return;
        }

        setModalVisible(false);
        setEditingService(null);
        setForm(EMPTY_FORM);
    };

    const updateForm = <K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) => {
        setForm((previous) => ({
            ...previous,
            [key]: value
        }));
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            Alert.alert('Service name required', 'Please enter a service name.');
            return false;
        }

        if (!form.category.trim()) {
            Alert.alert('Category required', 'Please select or enter a category.');
            return false;
        }

        const duration = Number(form.duration);

        if (!form.duration.trim() || !Number.isFinite(duration) || duration <= 0) {
            Alert.alert(
                'Invalid duration',
                'Please enter a valid duration in minutes.'
            );
            return false;
        }

        const price = Number(form.price);

        if (!form.price.trim() || !Number.isFinite(price) || price < 0) {
            Alert.alert('Invalid price', 'Please enter a valid service price.');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!salonId) {
            Alert.alert(
                'Salon unavailable',
                'Your salon information could not be found. Please sign in again.'
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const input = {
            salonId,
            name: form.name.trim(),
            category: form.category.trim(),
            description: form.description.trim() || null,
            duration: Number(form.duration),
            price: Number(form.price),
            gender: form.gender,
            popular: form.popular,
            active: form.active
        };

        try {
            if (editingService) {
                const response = await updateService({
                    variables: {
                        input: {
                            ...input,
                            serviceId: editingService.serviceId
                        }
                    }
                });

                const result = response.data?.updateService;

                if (!result?.success) {
                    Alert.alert(
                        'Unable to update service',
                        result?.message || 'Something went wrong.'
                    );
                    return;
                }

                Alert.alert('Success', 'Service updated successfully.');
            } else {
                const response = await createService({
                    variables: {
                        input
                    }
                });

                const result = response.data?.createService;

                if (!result?.success) {
                    Alert.alert(
                        'Unable to add service',
                        result?.message || 'Something went wrong.'
                    );
                    return;
                }

                Alert.alert('Success', 'Service added successfully.');
            }

            closeModal();
            await refetch();
        } catch (mutationError: any) {
            Alert.alert(
                'Something went wrong',
                mutationError?.message || 'Unable to save service.'
            );
        }
    };

    const handleToggleActive = async (service: Service) => {
        if (!salonId) {
            return;
        }

        try {
            const response = await updateService({
                variables: {
                    input: {
                        salonId,
                        serviceId: service.serviceId,
                        active: !service.active
                    }
                }
            });

            const result = response.data?.updateService;

            if (!result?.success) {
                Alert.alert(
                    'Unable to update service',
                    result?.message || 'Something went wrong.'
                );
                return;
            }

            await refetch();
        } catch (mutationError: any) {
            Alert.alert(
                'Something went wrong',
                mutationError?.message || 'Unable to update service.'
            );
        }
    };

    const handleDelete = (service: Service) => {
        Alert.alert(
            'Delete service?',
            `Are you sure you want to delete "${service.name}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!salonId) {
                            return;
                        }

                        try {
                            const response = await deleteService({
                                variables: {
                                    input: {
                                        salonId,
                                        serviceId: service.serviceId
                                    }
                                }
                            });

                            const result = response.data?.deleteService;

                            if (!result?.success) {
                                Alert.alert(
                                    'Unable to delete service',
                                    result?.message || 'Something went wrong.'
                                );
                                return;
                            }

                            await refetch();
                        } catch (mutationError: any) {
                            Alert.alert(
                                'Something went wrong',
                                mutationError?.message || 'Unable to delete service.'
                            );
                        }
                    }
                }
            ]
        );
    };

    const renderService = ({ item }: { item: Service }) => {
        return (
            <View style={styles.serviceCard}>
                <View style={styles.serviceTopRow}>
                    <View style={styles.serviceTitleContainer}>
                        <View style={styles.titleRow}>
                            <Text style={styles.serviceName} numberOfLines={1}>
                                {item.name}
                            </Text>

                            {item.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularBadgeText}>★ Popular</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.categoryText}>
                            {item.category} • {item.gender}
                        </Text>
                    </View>

                    <Pressable
                        style={styles.moreButton}
                        onPress={() => openEditModal(item)}
                    >
                        <Text style={styles.moreButtonText}>•••</Text>
                    </Pressable>
                </View>

                {item.description ? (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}

                <View style={styles.serviceInfoRow}>
                    <View>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>{item.duration} min</Text>
                    </View>

                    <View>
                        <Text style={styles.infoLabel}>Price</Text>
                        <Text style={styles.priceValue}>
                            ₹{Number(item.price).toLocaleString('en-IN')}
                        </Text>
                    </View>

                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusDot,
                                item.active
                                    ? styles.statusDotActive
                                    : styles.statusDotInactive
                            ]}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                item.active
                                    ? styles.statusTextActive
                                    : styles.statusTextInactive
                            ]}
                        >
                            {item.active ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardActions}>
                    <Pressable
                        style={styles.editButton}
                        onPress={() => openEditModal(item)}
                    >
                        <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>

                    <Pressable
                        style={styles.toggleButton}
                        onPress={() => handleToggleActive(item)}
                    >
                        <Text style={styles.toggleButtonText}>
                            {item.active ? 'Deactivate' : 'Activate'}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item)}
                        disabled={deleting}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    if (!salonId) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerState}>
                    <Text style={styles.errorTitle}>Salon information unavailable</Text>
                    <Text style={styles.errorMessage}>
                        We could not find the salon associated with your account.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Services</Text>
                        <Text style={styles.headerSubtitle}>
                            Manage the services your salon offers
                        </Text>
                    </View>

                    <Pressable style={styles.addButton} onPress={openCreateModal}>
                        <Text style={styles.addButtonPlus}>+</Text>
                        <Text style={styles.addButtonText}>Add Service</Text>
                    </Pressable>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{services.length}</Text>
                        <Text style={styles.statLabel}>Total Services</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{activeCount}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{popularCount}</Text>
                        <Text style={styles.statLabel}>Popular</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{inactiveCount}</Text>
                        <Text style={styles.statLabel}>Inactive</Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>⌕</Text>

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search services..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.searchInput}
                    />

                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')}>
                            <Text style={styles.clearSearch}>×</Text>
                        </Pressable>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContent}
                >
                    {CATEGORIES.map((category) => {
                        const selected = categoryFilter === category;

                        return (
                            <Pressable
                                key={category}
                                onPress={() => setCategoryFilter(category)}
                                style={[
                                    styles.filterChip,
                                    selected && styles.filterChipSelected
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        selected && styles.filterChipTextSelected
                                    ]}
                                >
                                    {category}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <View style={styles.statusFilterRow}>
                    {FILTERS.map((filter) => {
                        const selected = statusFilter === filter;

                        return (
                            <Pressable
                                key={filter}
                                onPress={() => setStatusFilter(filter)}
                                style={[
                                    styles.statusFilter,
                                    selected && styles.statusFilterSelected
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusFilterText,
                                        selected && styles.statusFilterTextSelected
                                    ]}
                                >
                                    {filter}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {loading ? (
                    <View style={styles.centerState}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loadingText}>Loading services...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerState}>
                        <Text style={styles.errorTitle}>Unable to load services</Text>
                        <Text style={styles.errorMessage}>{error.message}</Text>

                        <Pressable
                            style={styles.retryButton}
                            onPress={() => refetch()}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </Pressable>
                    </View>
                ) : filteredServices.length === 0 ? (
                    <View style={styles.centerState}>
                        <View style={styles.emptyIcon}>
                            <Text style={styles.emptyIconText}>✦</Text>
                        </View>

                        <Text style={styles.emptyTitle}>
                            {services.length === 0
                                ? 'No services yet'
                                : 'No services found'}
                        </Text>

                        <Text style={styles.emptyMessage}>
                            {services.length === 0
                                ? 'Add your first service to start building your salon menu.'
                                : 'Try changing your search or filters.'}
                        </Text>

                        {services.length === 0 && (
                            <Pressable
                                style={styles.emptyAddButton}
                                onPress={openCreateModal}
                            >
                                <Text style={styles.emptyAddButtonText}>
                                    + Add Your First Service
                                </Text>
                            </Pressable>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={filteredServices}
                        keyExtractor={(item) => item.serviceId}
                        renderItem={renderService}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={() => refetch()}
                            />
                        }
                    />
                )}
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </Text>

                                <Text style={styles.modalSubtitle}>
                                    {editingService
                                        ? 'Update your service details'
                                        : 'Add a service to your salon menu'}
                                </Text>
                            </View>

                            <Pressable
                                style={styles.modalCloseButton}
                                onPress={closeModal}
                                disabled={creating || updating}
                            >
                                <Text style={styles.modalCloseText}>×</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.formContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.inputLabel}>Service Name *</Text>

                            <TextInput
                                value={form.name}
                                onChangeText={(value) => updateForm('name', value)}
                                placeholder="e.g. Haircut"
                                placeholderTextColor="#9CA3AF"
                                style={styles.input}
                                autoCapitalize="words"
                            />

                            <Text style={styles.inputLabel}>Category *</Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryOptions}
                            >
                                {CATEGORIES.filter((item) => item !== 'All').map(
                                    (category) => {
                                        const selected =
                                            form.category.toLowerCase() === category.toLowerCase();

                                        return (
                                            <Pressable
                                                key={category}
                                                onPress={() => updateForm('category', category)}
                                                style={[
                                                    styles.categoryOption,
                                                    selected && styles.categoryOptionSelected
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.categoryOptionText,
                                                        selected &&
                                                        styles.categoryOptionTextSelected
                                                    ]}
                                                >
                                                    {category}
                                                </Text>
                                            </Pressable>
                                        );
                                    }
                                )}
                            </ScrollView>

                            <TextInput
                                value={form.category}
                                onChangeText={(value) => updateForm('category', value)}
                                placeholder="Or enter your own category"
                                placeholderTextColor="#9CA3AF"
                                style={styles.input}
                                autoCapitalize="words"
                            />

                            <Text style={styles.inputLabel}>Description</Text>

                            <TextInput
                                value={form.description}
                                onChangeText={(value) =>
                                    updateForm('description', value)
                                }
                                placeholder="Describe this service..."
                                placeholderTextColor="#9CA3AF"
                                style={[styles.input, styles.descriptionInput]}
                                multiline
                                textAlignVertical="top"
                            />

                            <View style={styles.twoColumn}>
                                <View style={styles.column}>
                                    <Text style={styles.inputLabel}>Duration *</Text>

                                    <View style={styles.inputWithSuffix}>
                                        <TextInput
                                            value={form.duration}
                                            onChangeText={(value) =>
                                                updateForm(
                                                    'duration',
                                                    value.replace(/[^0-9]/g, '')
                                                )
                                            }
                                            placeholder="30"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                            style={styles.inputWithoutBorder}
                                        />

                                        <Text style={styles.inputSuffix}>min</Text>
                                    </View>
                                </View>

                                <View style={styles.column}>
                                    <Text style={styles.inputLabel}>Price *</Text>

                                    <View style={styles.inputWithPrefix}>
                                        <Text style={styles.inputPrefix}>₹</Text>

                                        <TextInput
                                            value={form.price}
                                            onChangeText={(value) =>
                                                updateForm(
                                                    'price',
                                                    value.replace(/[^0-9.]/g, '')
                                                )
                                            }
                                            placeholder="300"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="decimal-pad"
                                            style={styles.inputWithoutBorder}
                                        />
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Available For</Text>

                            <View style={styles.genderRow}>
                                {(['MEN', 'WOMEN', 'UNISEX'] as ServiceGender[]).map(
                                    (gender) => {
                                        const selected = form.gender === gender;

                                        return (
                                            <Pressable
                                                key={gender}
                                                onPress={() => updateForm('gender', gender)}
                                                style={[
                                                    styles.genderOption,
                                                    selected && styles.genderOptionSelected
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.genderText,
                                                        selected && styles.genderTextSelected
                                                    ]}
                                                >
                                                    {gender === 'UNISEX'
                                                        ? 'Unisex'
                                                        : gender === 'MEN'
                                                            ? 'Men'
                                                            : 'Women'}
                                                </Text>
                                            </Pressable>
                                        );
                                    }
                                )}
                            </View>

                            <View style={styles.settingRow}>
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Popular Service</Text>
                                    <Text style={styles.settingDescription}>
                                        Highlight this service to customers
                                    </Text>
                                </View>

                                <Switch
                                    value={form.popular}
                                    onValueChange={(value) =>
                                        updateForm('popular', value)
                                    }
                                />
                            </View>

                            <View style={styles.settingRow}>
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Service Active</Text>
                                    <Text style={styles.settingDescription}>
                                        Customers can book this service
                                    </Text>
                                </View>

                                <Switch
                                    value={form.active}
                                    onValueChange={(value) =>
                                        updateForm('active', value)
                                    }
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <Pressable
                                    style={styles.cancelButton}
                                    onPress={closeModal}
                                    disabled={creating || updating}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.saveButton,
                                        (creating || updating) && styles.saveButtonDisabled
                                    ]}
                                    onPress={handleSave}
                                    disabled={creating || updating}
                                >
                                    {creating || updating ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingService ? 'Save Changes' : 'Add Service'}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

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
        paddingBottom: 18
    },

    headerTextContainer: {
        flex: 1,
        marginRight: 12
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827'
    },

    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4
    },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 15,
        paddingVertical: 11,
        borderRadius: 10
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

    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16
    },

    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 8,
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
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14
    },

    searchIcon: {
        fontSize: 25,
        color: '#6B7280',
        marginRight: 8,
        transform: [{ rotate: '-20deg' }]
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
        marginTop: 13,
        flexGrow: 0
    },

    filterContent: {
        gap: 8,
        paddingBottom: 2
    },

    filterChip: {
        paddingHorizontal: 14,
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
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '600'
    },

    filterChipTextSelected: {
        color: '#FFFFFF'
    },

    statusFilterRow: {
        flexDirection: 'row',
        marginTop: 13,
        marginBottom: 10,
        gap: 8
    },

    statusFilter: {
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 8
    },

    statusFilterSelected: {
        backgroundColor: '#E5E7EB'
    },

    statusFilterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280'
    },

    statusFilterTextSelected: {
        color: '#111827'
    },

    listContent: {
        paddingTop: 2,
        paddingBottom: 30
    },

    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },

    serviceTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    serviceTitleContainer: {
        flex: 1,
        marginRight: 10
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 7
    },

    serviceName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#111827',
        maxWidth: '75%'
    },

    popularBadge: {
        backgroundColor: '#FFF7E6',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 5
    },

    popularBadgeText: {
        color: '#B7791F',
        fontSize: 9,
        fontWeight: '700'
    },

    categoryText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 5,
        textTransform: 'capitalize'
    },

    moreButton: {
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#F3F4F6'
    },

    moreButtonText: {
        color: '#4B5563',
        fontSize: 13,
        letterSpacing: 1
    },

    description: {
        color: '#6B7280',
        fontSize: 13,
        lineHeight: 19,
        marginTop: 13
    },

    serviceInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 35
    },

    infoLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        fontWeight: '700'
    },

    infoValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '700',
        marginTop: 3
    },

    priceValue: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '800',
        marginTop: 2
    },

    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto'
    },

    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 5
    },

    statusDotActive: {
        backgroundColor: '#16A34A'
    },

    statusDotInactive: {
        backgroundColor: '#9CA3AF'
    },

    statusText: {
        fontSize: 11,
        fontWeight: '700'
    },

    statusTextActive: {
        color: '#15803D'
    },

    statusTextInactive: {
        color: '#6B7280'
    },

    cardDivider: {
        height: 1,
        backgroundColor: '#F0F1F3',
        marginTop: 15,
        marginBottom: 12
    },

    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },

    editButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6'
    },

    editButtonText: {
        color: '#111827',
        fontSize: 12,
        fontWeight: '700'
    },

    toggleButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6'
    },

    toggleButtonText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '600'
    },

    deleteButton: {
        marginLeft: 'auto',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },

    deleteButtonText: {
        color: '#DC2626',
        fontSize: 12,
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
        maxWidth: 300
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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end'
    },

    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '94%'
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F1F3'
    },

    modalTitle: {
        fontSize: 21,
        color: '#111827',
        fontWeight: '800'
    },

    modalSubtitle: {
        fontSize: 12,
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

    formContent: {
        padding: 20,
        paddingBottom: 35
    },

    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 7,
        marginTop: 4
    },

    input: {
        height: 47,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 13,
        color: '#111827',
        fontSize: 14,
        backgroundColor: '#FFFFFF',
        marginBottom: 15
    },

    descriptionInput: {
        height: 90,
        paddingTop: 12
    },

    categoryOptions: {
        gap: 7,
        paddingBottom: 9
    },

    categoryOption: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 11,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF'
    },

    categoryOptionSelected: {
        backgroundColor: '#111827',
        borderColor: '#111827'
    },

    categoryOptionText: {
        color: '#4B5563',
        fontSize: 11,
        fontWeight: '600'
    },

    categoryOptionTextSelected: {
        color: '#FFFFFF'
    },

    twoColumn: {
        flexDirection: 'row',
        gap: 12
    },

    column: {
        flex: 1
    },

    inputWithSuffix: {
        height: 47,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        marginBottom: 15
    },

    inputWithPrefix: {
        height: 47,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        marginBottom: 15
    },

    inputWithoutBorder: {
        flex: 1,
        height: 45,
        paddingHorizontal: 10,
        color: '#111827',
        fontSize: 14
    },

    inputSuffix: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '600'
    },

    inputPrefix: {
        color: '#374151',
        fontSize: 15,
        fontWeight: '700'
    },

    genderRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20
    },

    genderOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 11,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#D1D5DB'
    },

    genderOptionSelected: {
        backgroundColor: '#111827',
        borderColor: '#111827'
    },

    genderText: {
        color: '#4B5563',
        fontSize: 12,
        fontWeight: '700'
    },

    genderTextSelected: {
        color: '#FFFFFF'
    },

    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        borderTopWidth: 1,
        borderTopColor: '#F0F1F3'
    },

    settingTextContainer: {
        flex: 1,
        paddingRight: 20
    },

    settingTitle: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '700'
    },

    settingDescription: {
        color: '#6B7280',
        fontSize: 11,
        marginTop: 3
    },

    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 22
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

    saveButton: {
        flex: 1.5,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center'
    },

    saveButtonDisabled: {
        opacity: 0.6
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700'
    }
});

export default ManageServices;