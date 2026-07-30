import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';

const PRIMARY = '#008060';

const dates = [
    { id: '1', day: 'Mon', date: '10' },
    { id: '2', day: 'Tue', date: '11' },
    { id: '3', day: 'Wed', date: '12' },
    { id: '4', day: 'Thu', date: '13' },
    { id: '5', day: 'Fri', date: '14' },
    { id: '6', day: 'Sat', date: '15' },
    { id: '7', day: 'Sun', date: '16' },
];

const slots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
];

export default function BookingDateTimeScreen({
    navigation,
    route,
}: any) {
    const { services } = route.params;

    const [selectedDate, setSelectedDate] = useState(dates[0]);

    const [selectedSlot, setSelectedSlot] =
        useState<string | null>(null);

    const total = useMemo(() => {
        return services.reduce(
            (sum: number, item: any) => sum + item.price,
            0,
        );
    }, [services]);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>
                Select Date
            </Text>

            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={dates}
                keyExtractor={item => item.id}
                contentContainerStyle={{
                    paddingHorizontal: 15,
                }}
                renderItem={({ item }) => {
                    const active =
                        selectedDate.id === item.id;

                    return (
                        <TouchableOpacity
                            onPress={() =>
                                setSelectedDate(item)
                            }
                            style={[
                                styles.dateCard,
                                active &&
                                styles.dateCardActive,
                            ]}>
                            <Text
                                style={[
                                    styles.day,
                                    active &&
                                    styles.activeText,
                                ]}>
                                {item.day}
                            </Text>

                            <Text
                                style={[
                                    styles.date,
                                    active &&
                                    styles.activeText,
                                ]}>
                                {item.date}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            <Text style={styles.heading}>
                Available Time Slots
            </Text>

            <FlatList
                data={slots}
                numColumns={3}
                keyExtractor={item => item}
                contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingBottom: 120,
                }}
                renderItem={({ item }) => {
                    const active =
                        selectedSlot === item;

                    return (
                        <TouchableOpacity
                            onPress={() =>
                                setSelectedSlot(item)
                            }
                            style={[
                                styles.slot,
                                active &&
                                styles.slotActive,
                            ]}>
                            <Text
                                style={[
                                    styles.slotText,
                                    active &&
                                    styles.activeText,
                                ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {selectedSlot && (
                <View style={styles.bottom}>
                    <View>
                        <Text
                            style={styles.total}>
                            ₹{total}
                        </Text>

                        <Text>
                            {services.length} services
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                            navigation.navigate(
                                'BookingSummary',
                                {
                                    services,
                                    date: selectedDate,
                                    time: selectedSlot,
                                },
                            )
                        }>
                        <Text
                            style={
                                styles.buttonText
                            }>
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

    heading: {
        fontSize: 22,
        fontWeight: '700',
        margin: 20,
    },

    dateCard: {
        width: 70,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#FFF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    dateCardActive: {
        backgroundColor: PRIMARY,
    },

    day: {
        fontSize: 14,
    },

    date: {
        fontSize: 24,
        fontWeight: '700',
    },

    activeText: {
        color: '#FFF',
    },

    slot: {
        flex: 1,
        margin: 6,
        backgroundColor: '#FFF',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },

    slotActive: {
        backgroundColor: PRIMARY,
    },

    slotText: {
        fontWeight: '600',
    },

    bottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#EEE',
    },

    total: {
        fontSize: 22,
        color: PRIMARY,
        fontWeight: '700',
    },

    button: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 35,
        paddingVertical: 15,
        borderRadius: 30,
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});