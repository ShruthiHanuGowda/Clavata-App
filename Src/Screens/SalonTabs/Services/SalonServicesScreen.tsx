import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import styles from './styles';
import CategoryFilter from './CategoryFilter';
import ServiceCard from './ServiceCard';
import {
  categories,
  services,
} from './dummyData';

export default function SalonServicesScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [search, setSearch] = useState('');

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const categoryMatch =
        selectedCategory === 'All' ||
        service.category === selectedCategory;

      const searchMatch =
        service.name
          .toLowerCase()
          .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredServices}
        keyExtractor={item => item.id}
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
              />
            </View>

            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </>
        }
        renderItem={({ item }) => (
          <ServiceCard
            {...item}
            onEdit={() =>
              Alert.alert(
                'Edit',
                item.name,
              )
            }
            onDelete={() =>
              Alert.alert(
                'Delete',
                item.name,
              )
            }
          />
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          Alert.alert(
            'Add Service',
          )
        }>
        <Text style={styles.fabText}>
          +
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}