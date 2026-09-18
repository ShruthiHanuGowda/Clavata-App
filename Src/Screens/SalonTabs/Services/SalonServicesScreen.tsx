import React, {
    useMemo,
    useState,
    useCallback,
} from 'react';

import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';

import {
    useQuery,
    useMutation,
} from '@apollo/client';

import { useUser } from '../../../context/UserContext';

import {
    GET_SALON_SERVICE_SELECTIONS,
    LIST_SERVICES,
    DELETE_SERVICE,
} from '../../../graphql/queries';

import styles from './styles';

import CategoryFilter from './CategoryFilter';
import ServiceCard from './ServiceCard';
import AddServiceModal, {
    Service,
    ServiceSelection,
} from './AddServiceModal';

export default function SalonServicesScreen() {
    const { currentUser } = useUser();

    const salonId =
        currentUser?.salonId;

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState('All');

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        modalVisible,
        setModalVisible,
    ] = useState(false);

    const [
        selectedService,
        setSelectedService,
    ] = useState<Service | null>(null);

    /*
     * ------------------------------------------------
     * GET REGISTRATION SERVICE SELECTIONS
     * ------------------------------------------------
     */

    const {
        data: salonData,
        loading: salonLoading,
        refetch: refetchSalon,
    } = useQuery(
        GET_SALON_SERVICE_SELECTIONS,
        {
            variables: {
                salonId,
            },
            skip: !salonId,
            fetchPolicy:
                'network-only',
        },
    );

    /*
     * These are the category/subcategory pairs
     * selected during salon registration.
     */

    const serviceSelections: ServiceSelection[] =
        salonData?.getSalon
            ?.serviceSelections ?? [];

    /*
     * ------------------------------------------------
     * GET ACTUAL SERVICES
     * ------------------------------------------------
     */

    const {
        data,
        loading: servicesLoading,
        refetch,
    } = useQuery(LIST_SERVICES, {
        variables: {
            salonId,
        },
        skip: !salonId,
        fetchPolicy:
            'network-only',
    });

    const [
        deleteService,
    ] = useMutation(
        DELETE_SERVICE,
    );

    const services: Service[] =
        data?.listServices ?? [];

    /*
     * ------------------------------------------------
     * CATEGORY FILTER
     * ------------------------------------------------
     *
     * Use actual service categories first.
     * If there are no services yet, show the
     * registration-selected categories.
     */

    const categories = useMemo(() => {
        const values =
            new Map<
                string,
                string
            >();

        services.forEach(
            service => {
                if (
                    service.categoryId &&
                    service.categoryName
                ) {
                    values.set(
                        service.categoryId,
                        service.categoryName,
                    );
                }
            },
        );

        /*
         * Also add registration categories.
         */
        serviceSelections.forEach(
            selection => {
                if (
                    selection.categoryId &&
                    selection.categoryName
                ) {
                    values.set(
                        selection.categoryId,
                        selection.categoryName,
                    );
                }
            },
        );

        return [
            'All',
            ...Array.from(
                values.values(),
            ),
        ];
    }, [
        services,
        serviceSelections,
    ]);

    /*
     * ------------------------------------------------
     * FILTER SERVICES
     * ------------------------------------------------
     */

    const filteredServices =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return services.filter(
                service => {
                    const categoryMatch =
                        selectedCategory ===
                            'All' ||
                        service.categoryName ===
                            selectedCategory;

                    const searchMatch =
                        !searchValue ||
                        service.name
                            .toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        service.categoryName
                            ?.toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        service.subcategoryName
                            ?.toLowerCase()
                            .includes(
                                searchValue,
                            );

                    return (
                        categoryMatch &&
                        searchMatch
                    );
                },
            );
        }, [
            services,
            search,
            selectedCategory,
        ]);

    /*
     * ------------------------------------------------
     * REFRESH
     * ------------------------------------------------
     */

    const refreshServices =
        useCallback(async () => {
            await Promise.all([
                refetch(),
                refetchSalon(),
            ]);
        }, [
            refetch,
            refetchSalon,
        ]);

    /*
     * ------------------------------------------------
     * ADD
     * ------------------------------------------------
     */

    const openAddModal = () => {
        setSelectedService(null);
        setModalVisible(true);
    };

    /*
     * ------------------------------------------------
     * EDIT
     * ------------------------------------------------
     */

    const openEditModal = (
        service: Service,
    ) => {
        setSelectedService(
            service,
        );

        setModalVisible(true);
    };

    /*
     * ------------------------------------------------
     * DELETE
     * ------------------------------------------------
     */

    const confirmDelete = (
        service: Service,
    ) => {
        Alert.alert(
            'Delete Service',
            `Delete "${service.name}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',

                    onPress:
                        async () => {
                            try {
                                const {
                                    data,
                                } =
                                    await deleteService(
                                        {
                                            variables:
                                                {
                                                    input:
                                                        {
                                                            serviceId:
                                                                service.serviceId,
                                                            salonId:
                                                                service.salonId,
                                                        },
                                                },
                                        },
                                    );

                                if (
                                    data
                                        ?.deleteService
                                        ?.success
                                ) {
                                    Alert.alert(
                                        'Success',
                                        'Service deleted successfully.',
                                    );

                                    await refreshServices();
                                } else {
                                    Alert.alert(
                                        'Error',
                                        data
                                            ?.deleteService
                                            ?.message ??
                                            'Unable to delete service',
                                    );
                                }
                            } catch (
                                error
                            ) {
                                console.log(
                                    'DELETE SERVICE ERROR:',
                                    error,
                                );

                                Alert.alert(
                                    'Error',
                                    'Something went wrong while deleting the service.',
                                );
                            }
                        },
                },
            ],
        );
    };

    /*
     * ------------------------------------------------
     * LOADING
     * ------------------------------------------------
     */

    if (
        salonLoading &&
        servicesLoading
    ) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    {
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                    },
                ]}>
                <ActivityIndicator
                    size="large"
                    color="#009D94"
                />
            </SafeAreaView>
        );
    }

    /*
     * ------------------------------------------------
     * RENDER
     * ------------------------------------------------
     */

    return (
        <SafeAreaView
            style={styles.container}>
            <FlatList
                data={
                    filteredServices
                }
                keyExtractor={item =>
                    item.serviceId ??
                    `${item.categoryId}-${item.subcategoryId}`
                }
                onRefresh={
                    refreshServices
                }
                refreshing={
                    servicesLoading
                }
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <>
                        <View
                            style={
                                styles.header
                            }>
                            <Text
                                style={
                                    styles.title
                                }>
                                Services
                            </Text>

                            <Text
                                style={{
                                    marginTop: 4,
                                    fontSize: 13,
                                    color: '#6B7280',
                                }}>
                                {
                                    serviceSelections.length
                                }{' '}
                                service options
                                available
                            </Text>
                        </View>

                        <View
                            style={
                                styles.searchContainer
                            }>
                            <TextInput
                                placeholder="Search service..."
                                value={
                                    search
                                }
                                onChangeText={
                                    setSearch
                                }
                                placeholderTextColor="#9CA3AF"
                                style={{
                                    fontSize: 15,
                                    color: '#111827',
                                }}
                            />
                        </View>

                        {categories.length >
                            1 && (
                            <CategoryFilter
                                categories={
                                    categories
                                }
                                selected={
                                    selectedCategory
                                }
                                onSelect={
                                    setSelectedCategory
                                }
                            />
                        )}

                        {serviceSelections.length >
                            0 && (
                            <View
                                style={{
                                    marginHorizontal: 16,
                                    marginBottom: 16,
                                    padding: 14,
                                    borderRadius: 12,
                                    backgroundColor:
                                        '#F8FAFC',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight:
                                            '700',
                                        color:
                                            '#111827',
                                        marginBottom: 8,
                                    }}>
                                    Your selected
                                    service categories
                                </Text>

                                <View
                                    style={{
                                        flexDirection:
                                            'row',
                                        flexWrap:
                                            'wrap',
                                    }}>
                                    {serviceSelections.map(
                                        (
                                            selection,
                                        ) => (
                                            <View
                                                key={`${selection.categoryId}-${selection.subcategoryId}`}
                                                style={{
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 7,
                                                    borderRadius: 16,
                                                    backgroundColor:
                                                        '#E6F7F5',
                                                    marginRight: 6,
                                                    marginBottom: 6,
                                                }}>
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        color:
                                                            '#007F78',
                                                        fontWeight:
                                                            '600',
                                                    }}>
                                                    {
                                                        selection.categoryName
                                                    }{' '}
                                                    •{' '}
                                                    {
                                                        selection.subcategoryName
                                                    }
                                                </Text>
                                            </View>
                                        ),
                                    )}
                                </View>
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    <View
                        style={{
                            paddingVertical: 60,
                            paddingHorizontal: 20,
                            alignItems:
                                'center',
                        }}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight:
                                    '600',
                                color:
                                    '#6B7280',
                                textAlign:
                                    'center',
                            }}>
                            No services added yet
                        </Text>

                        {serviceSelections.length >
                        0 ? (
                            <Text
                                style={{
                                    marginTop: 8,
                                    color:
                                        '#9CA3AF',
                                    textAlign:
                                        'center',
                                    lineHeight: 20,
                                }}>
                                You can add services
                                using the categories
                                and subcategories
                                selected during
                                registration.
                            </Text>
                        ) : (
                            <Text
                                style={{
                                    marginTop: 8,
                                    color:
                                        '#9CA3AF',
                                    textAlign:
                                        'center',
                                }}>
                                No service categories
                                were selected during
                                registration.
                            </Text>
                        )}
                    </View>
                }
                renderItem={({
                    item,
                }) => (
                    <ServiceCard
                        serviceId={
                            item.serviceId
                        }
                        salonId={
                            item.salonId
                        }
                        name={
                            item.name
                        }
                        category={
                            item.categoryName
                        }
                        categoryId={
                            item.categoryId
                        }
                        subcategoryId={
                            item.subcategoryId
                        }
                        subcategoryName={
                            item.subcategoryName
                        }
                        description={
                            item.description
                        }
                        duration={
                            item.duration
                        }
                        price={
                            item.price
                        }
                        gender={
                            item.gender
                        }
                        active={
                            item.active
                        }
                        popular={
                            item.popular
                        }
                        createdAt={
                            item.createdAt
                        }
                        updatedAt={
                            item.updatedAt
                        }
                        onEdit={() =>
                            openEditModal(
                                item,
                            )
                        }
                        onDelete={() =>
                            confirmDelete(
                                item,
                            )
                        }
                    />
                )}
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
            />

            <TouchableOpacity
                style={
                    styles.fab
                }
                activeOpacity={0.8}
                onPress={
                    openAddModal
                }>
                <Text
                    style={
                        styles.fabText
                    }>
                    +
                </Text>
            </TouchableOpacity>

            <AddServiceModal
                visible={
                    modalVisible
                }
                serviceSelections={
                    serviceSelections
                }
                initialData={
                    selectedService
                }
                onClose={() => {
                    setModalVisible(
                        false,
                    );
                    setSelectedService(
                        null,
                    );
                }}
                onSave={async () => {
                    setModalVisible(
                        false,
                    );

                    setSelectedService(
                        null,
                    );

                    await refreshServices();
                }}
            />
        </SafeAreaView>
    );
}