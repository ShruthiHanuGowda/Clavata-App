import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Alert,
} from 'react-native';

import styles from './styles';
import { appointments } from './dummyData';
import AppointmentCard from './AppointmentCard';
import AppointmentFilter from './AppointmentFilter';

export default function SalonAppointmentsScreen() {
  const [selectedFilter, setSelectedFilter] =
    useState('Today');

  const filteredAppointments = appointments.filter(item => {
    switch (selectedFilter) {
      case 'Today':
        return (
          item.status === 'CONFIRMED' ||
          item.status === 'IN_PROGRESS'
        );

      case 'Upcoming':
        return item.status === 'CONFIRMED';

      case 'Completed':
        return item.status === 'COMPLETED';

      case 'Cancelled':
        return item.status === 'CANCELLED';

      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Appointments
        </Text>
      </View>

      {/* Search */}

      <View style={styles.search}>
        <Text style={styles.searchText}>
          🔍 Search customer...
        </Text>
      </View>

      {/* Filter */}

      <AppointmentFilter
        selected={selectedFilter}
        onSelect={setSelectedFilter}
      />

      {/* Appointment List */}

      <FlatList
        data={filteredAppointments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 25,
        }}
        renderItem={({ item }) => (
          <AppointmentCard
            customer={item.customer}
            service={item.service}
            staff={item.staff}
            amount={item.amount}
            time={item.time}
            status={item.status}
            phone={item.phone}
            onPress={() =>
              Alert.alert(
                item.customer,
                `${item.service}\n₹${item.amount}`,
              )
            }
          />
        )}
      />

    </SafeAreaView>
  );
}