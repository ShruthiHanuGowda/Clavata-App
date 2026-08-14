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
import { SERVICE_CATEGORIES } from '../../../constants/constants';
import {
  LIST_SERVICES,
  DELETE_SERVICE,
} from '../../../graphql/queries';
import styles from './styles';
import CategoryFilter from './CategoryFilter';
import ServiceCard from './ServiceCard';
import AddServiceModal from './AddServiceModal';

type Service = {
  serviceId: string;
  salonId: string;
  name: string;
  category: string;
  description?: string;
  duration: number;
  price: number;
  gender: 'MEN' | 'WOMEN' | 'UNISEX';
  popular: boolean;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
};


const categories = ['All', ...SERVICE_CATEGORIES];

export default function SalonServicesScreen() {
  const { currentUser } = useUser();
  const [selectedCategory, setSelectedCategory] =
    useState('All');
  const [search, setSearch] =
    useState('');
  const [modalVisible, setModalVisible] =
    useState(false);
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);
  const {
    data,
    loading,
    refetch,
  } = useQuery(LIST_SERVICES, {
    variables: {
      salonId: currentUser?.salonId,
    },
    skip: !currentUser?.salonId,
    fetchPolicy: 'network-only',
  });
  const [deleteService] =
    useMutation(DELETE_SERVICE);

  const services: Service[] =
    data?.listServices ?? [];

  const categories = useMemo(() => {
    const values = new Set<string>();
    services.forEach(service =>
      values.add(service.category),
    );
    return [
      'All',
      ...Array.from(values),
    ];
  }, [services]);

  const filteredServices =
    useMemo(() => {
      return services.filter(service => {
        const categoryMatch =
          selectedCategory ===
          'All' ||
          service.category ===
          selectedCategory;
        const searchMatch =
          service.name
            .toLowerCase()
            .includes(
              search.toLowerCase(),
            );
        return (
          categoryMatch &&
          searchMatch
        );
      });
    }, [
      services,
      search,
      selectedCategory,
    ]);

  const openAddModal = () => {
    setSelectedService(null);
    setModalVisible(true);
  };

  const openEditModal = (
    service: Service,
  ) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const refreshServices =
    useCallback(async () => {
      await refetch();
    }, [refetch]);

  const confirmDelete = (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Delete "${service.name} ${service.serviceId}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data } = await deleteService({
                variables: {
                  input: {
                    serviceId: service.serviceId,
                    salonId: service.salonId,
                  },
                },
              });

              if (data?.deleteService?.success) {
                Alert.alert('Success', 'Service deleted');
                await refreshServices();
              } else {
                Alert.alert(
                  'Error',
                  data?.deleteService?.message ?? 'Unable to delete',
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Something went wrong');
            }
          },
        },
      ],
    );
  };

  if (loading) {
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredServices}
        keyExtractor={item => item.serviceId}
        onRefresh={refreshServices}
        refreshing={loading}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>
                Services
              </Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search service..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#9CA3AF"
                style={{
                  fontSize: 15,
                  color: '#111827',
                }}
              />
            </View>

            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </>
        }
        ListEmptyComponent={
          <View
            style={{
              paddingVertical: 60,
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#6B7280',
              }}>
              No services found
            </Text>

            <Text
              style={{
                marginTop: 8,
                color: '#9CA3AF',
              }}>
              Tap + to add your first service
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ServiceCard
            serviceId={item.serviceId}
            salonId={item.salonId}
            name={item.name}
            category={item.category}
            description={item.description}
            duration={item.duration}
            price={item.price}
            gender={item.gender}
            active={item.active}
            popular={item.popular}
            createdAt={item.createdAt}
            updatedAt={item.updatedAt}
            onEdit={() =>
              openEditModal(item)
            }
            onDelete={() =>
              confirmDelete(item)
            }
          />
        )}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={openAddModal}>
        <Text style={styles.fabText}>
          +
        </Text>
      </TouchableOpacity>

      <AddServiceModal
        visible={modalVisible}
        categories={SERVICE_CATEGORIES}
        initialData={selectedService}
        onClose={() => {
          setModalVisible(false);
          setSelectedService(null);
        }}
        onSave={async () => {
          setModalVisible(false);
          setSelectedService(null);
          await refreshServices();
        }}
      />
    </SafeAreaView>
  );
}