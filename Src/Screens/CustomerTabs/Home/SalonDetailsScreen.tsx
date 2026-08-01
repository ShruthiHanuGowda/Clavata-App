import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useUser } from '../../../context/UserContext';
import { useQuery } from '@apollo/client';
import { LIST_SERVICES } from '../../../graphql/queries';

const PRIMARY = '#008060';

// const servicesData = [
//     {
//         id: '1',
//         name: 'Haircut',
//         price: 299,
//         duration: 45,
//     },
//     {
//         id: '2',
//         name: 'Hair Spa',
//         price: 799,
//         duration: 60,
//     },
//     {
//         id: '3',
//         name: 'Facial',
//         price: 999,
//         duration: 90,
//     },
//     {
//         id: '4',
//         name: 'Hair Coloring',
//         price: 1499,
//         duration: 120,
//     },
// ];

export default function SalonDetailsScreen({
    navigation,
    route,
}: any) {
    const { currentUser } = useUser();
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const { salon } = route.params;
    console.log('SalonDetails route.params:', route.params);
    console.log('SalonDetails salon:', salon);
    const salonId = salon.id;
    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery(LIST_SERVICES, {
        variables: {
            salonId,
        },
        fetchPolicy: 'network-only',
    });
    const servicesData = data?.listServices ?? [];
    console.log('SalonDetails salonId:', salonId);
    console.log('servicesData', servicesData);
    console.log('Salon object:', route.params?.salon);
    console.log('Current User:', currentUser);

    const toggleService = (service: any) => {
        const exists = selectedServices.find(
            x => x.id === service.id,
        );

        if (exists) {
            setSelectedServices(prev =>
                prev.filter(x => x.id !== service.id),
            );
        } else {
            setSelectedServices(prev => [...prev, service]);
        }
    };

    const totalPrice = useMemo(() => {
        return selectedServices.reduce(
            (sum, item) => sum + item.price,
            0,
        );
    }, [selectedServices]);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={servicesData}
                keyExtractor={item => item.id}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}>
                                <Text style={styles.back}>←</Text>
                            </TouchableOpacity>

                            <Text style={styles.title}>
                                {salon.name}
                            </Text>

                            <TouchableOpacity>
                                <Text style={styles.favorite}>♡</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Cover */}
                        <Image
                            source={{
                                uri: 'https://picsum.photos/800/500',
                            }}
                            style={styles.cover}
                        />

                        {/* Rating */}
                        <View style={styles.info}>
                            <Text style={styles.rating}>
                                {/* ⭐ 4.8 (235 reviews) */}
                                ⭐ {(salon.rating ?? 0).toFixed(1)}
                                {salon.reviews != null && ` (${salon.reviews})`}
                            </Text>

                            <Text style={styles.distance}>
                                📍{salon.distance}
                            </Text>

                            <Text style={styles.status}>
                                🟢 Open • Closes 9 PM
                            </Text>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabs}>
                            <Text style={styles.activeTab}>
                                Services
                            </Text>

                            <Text style={styles.tab}>
                                About
                            </Text>

                            <Text style={styles.tab}>
                                Reviews
                            </Text>

                            <Text style={styles.tab}>
                                Gallery
                            </Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => {
                    const selected = selectedServices.some(
                        x => x.id === item.id,
                    );

                    return (
                        <View style={styles.serviceCard}>
                            <View>
                                <Text style={styles.serviceName}>
                                    {item.name}
                                </Text>

                                <Text style={styles.price}>
                                    ₹{item.price}
                                </Text>

                                <Text style={styles.duration}>
                                    {item.duration} mins
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    selected && styles.removeButton,
                                ]}
                                onPress={() =>
                                    toggleService(item)
                                }>
                                <Text style={styles.buttonText}>
                                    {selected
                                        ? 'Remove'
                                        : '+ Add'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                contentContainerStyle={{
                    paddingBottom: 120,
                }}
            />

            {selectedServices.length > 0 && (
                <View style={styles.bottomBar}>
                    <View>
                        <Text style={styles.selected}>
                            Selected {selectedServices.length}{' '}
                            Service
                            {selectedServices.length > 1
                                ? 's'
                                : ''}
                        </Text>
                        <Text style={styles.total}>
                            ₹{totalPrice}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => {
                            const params = {
                                salonId: salon.id,
                                salon,
                                customerUserId: currentUser?.userId,
                                services: selectedServices,
                            };
                            console.log('Sending to BookingDateTime:', params);
                            navigation.navigate('BookingDateTime', params);
                        }}>
                        <Text
                            style={styles.continueText}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        backgroundColor: '#FFF',
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
    },

    favorite: {
        fontSize: 28,
    },

    cover: {
        width: '100%',
        height: 230,
    },

    info: {
        backgroundColor: '#FFF',
        padding: 18,
    },

    rating: {
        fontSize: 16,
        fontWeight: '700',
    },

    distance: {
        marginTop: 8,
        color: '#666',
    },

    status: {
        marginTop: 8,
        color: PRIMARY,
        fontWeight: '700',
    },

    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFF',
        paddingVertical: 15,
        marginBottom: 8,
    },

    activeTab: {
        color: PRIMARY,
        fontWeight: '700',
        borderBottomWidth: 2,
        borderBottomColor: PRIMARY,
        paddingBottom: 6,
    },

    tab: {
        color: '#777',
    },

    serviceCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginVertical: 7,
        borderRadius: 15,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    serviceName: {
        fontSize: 17,
        fontWeight: '700',
    },

    price: {
        marginTop: 8,
        fontSize: 18,
        color: PRIMARY,
        fontWeight: '700',
    },

    duration: {
        marginTop: 5,
        color: '#666',
    },

    addButton: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
    },

    removeButton: {
        backgroundColor: '#D32F2F',
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '700',
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderTopWidth: 1,
        borderColor: '#EEE',
    },

    selected: {
        fontWeight: '700',
        fontSize: 15,
    },

    total: {
        marginTop: 5,
        color: PRIMARY,
        fontSize: 22,
        fontWeight: '700',
    },

    continueButton: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 30,
    },

    continueText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});