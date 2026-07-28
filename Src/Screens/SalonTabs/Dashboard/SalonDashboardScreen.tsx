import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    Alert,
} from 'react-native';

import styles from './styles';

import DashboardHeader from './Header';
import SummaryCard from './SummaryCard';
import QuickActions from './QuickActions';
import AppointmentCard from './AppointmentCard';
import ReviewCard from './ReviewCard';
import {
    summaryData,
    appointments,
    reviews,
} from './dummyData';
import { useNavigation } from '@react-navigation/native';

export default function SalonDashboardScreen() {
    const navigation = useNavigation<any>();
    const onQuickAction = (action: string) => {
        switch (action) {
            case 'Add Booking':
                Alert.alert('Add Booking');
                break;

            case 'Add Staff':
                Alert.alert('Add Staff');
                break;

            case 'Add Service':
                navigation.navigate('Services');
                break;

            case 'Block Time':
                Alert.alert('Block Time');
                break;

            default:
                break;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}>

                {/* Header */}
                <DashboardHeader salonName="Nex Salon" />

                {/* Summary */}
                <Text style={styles.sectionTitle}>
                    Today's Summary
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: 10,
                    }}>

                    {summaryData.map(item => (
                        <SummaryCard
                            key={item.id}
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                        />
                    ))}

                </ScrollView>

                {/* Quick Actions */}

                <Text style={styles.sectionTitle}>
                    Quick Actions
                </Text>

                <QuickActions
                    onPress={onQuickAction}
                />

                {/* Today's Appointments */}

                <Text style={styles.sectionTitle}>
                    Today's Appointments
                </Text>

                {appointments.map(item => (
                    <AppointmentCard
                        key={item.id}
                        customer={item.customer}
                        service={item.service}
                        staff={item.staff}
                        amount={item.amount}
                        time={item.time}
                        status={item.status}
                        onPress={() =>
                            Alert.alert(item.customer)
                        }
                    />
                ))}

                {/* Reviews */}

                <Text style={styles.sectionTitle}>
                    Recent Reviews
                </Text>

                {reviews.map(item => (
                    <ReviewCard
                        key={item.id}
                        customer={item.customer}
                        rating={item.rating}
                        review={item.review}
                        onReply={() =>
                            Alert.alert(
                                'Reply',
                                `Reply to ${item.customer}`,
                            )
                        }
                    />
                ))}

                <Text
                    style={{
                        textAlign: 'center',
                        color: '#999',
                        marginVertical: 25,
                    }}>
                    Version 1.0
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
}