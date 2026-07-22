import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const bookings = [
    {
        id: '1',
        salon: 'Style Studio',
        service: 'Haircut + Beard',
        date: 'Today',
        time: '4:30 PM',
        staff: 'Raj',
        price: '₹599',
        status: 'Upcoming',
    },
    {
        id: '2',
        salon: 'Urban Glow',
        service: 'Hair Spa',
        date: 'Tomorrow',
        time: '10:00 AM',
        staff: 'Priya',
        price: '₹899',
        status: 'Upcoming',
    },
    {
        id: '3',
        salon: 'Royal Salon',
        service: 'Facial',
        date: '15 Jul',
        time: '11:30 AM',
        staff: 'Anita',
        price: '₹1299',
        status: 'Completed',
    },
];

export default function BookingPage() {

    const [tab, setTab] =
        useState('Upcoming');

    return (

        <SafeAreaView style={styles.container}>

            <ScrollView>

                <Text style={styles.title}>
                    Bookings
                </Text>

                <View style={styles.tabs}>

                    {['Upcoming', 'Completed', 'Cancelled'].map(item => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.tab,
                                tab === item && styles.activeTab
                            ]}
                            onPress={() => setTab(item)}
                        >

                            <Text
                                style={[
                                    styles.tabText,
                                    tab === item && styles.activeText
                                ]}>
                                {item}
                            </Text>

                        </TouchableOpacity>
                    ))}

                </View>

                {bookings
                    .filter(i => i.status === tab)
                    .map(item => (

                        <TouchableOpacity
                            key={item.id}
                            style={styles.card}>

                            <View style={styles.image} />

                            <View style={{ flex: 1 }}>

                                <Text style={styles.name}>
                                    {item.salon}
                                </Text>

                                <Text>
                                    {item.service}
                                </Text>

                                <Text>
                                    {item.date} • {item.time}
                                </Text>

                                <Text>
                                    Stylist: {item.staff}
                                </Text>

                                <Text style={styles.price}>
                                    {item.price}
                                </Text>

                                {tab === "Upcoming" ? (

                                    <View style={styles.buttons}>

                                        <TouchableOpacity
                                            style={styles.primaryButton}>

                                            <Text style={styles.primaryText}>
                                                View Booking
                                            </Text>

                                        </TouchableOpacity>

                                    </View>

                                ) : (

                                    <View style={styles.buttons}>

                                        <TouchableOpacity
                                            style={styles.secondaryButton}>

                                            <Text>
                                                Book Again
                                            </Text>

                                        </TouchableOpacity>

                                    </View>

                                )}

                            </View>

                        </TouchableOpacity>

                    ))}

            </ScrollView>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F8FA'
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        margin: 20
    },

    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20
    },

    tab: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 25,
        backgroundColor: '#fff'
    },

    activeTab: {
        backgroundColor: '#008060'
    },

    tabText: {
        color: '#666'
    },

    activeText: {
        color: '#fff',
        fontWeight: '700'
    },

    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 18,
        padding: 15,
        flexDirection: 'row'
    },

    image: {
        height: 80,
        width: 80,
        backgroundColor: '#ddd',
        borderRadius: 12,
        marginRight: 15
    },

    name: {
        fontSize: 18,
        fontWeight: '700'
    },

    price: {
        marginTop: 8,
        fontWeight: '700',
        color: '#008060'
    },

    buttons: {
        marginTop: 12
    },

    primaryButton: {
        backgroundColor: '#008060',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center'
    },

    primaryText: {
        color: '#fff',
        fontWeight: '700'
    },

    secondaryButton: {
        borderWidth: 1,
        borderColor: '#008060',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center'
    }

});