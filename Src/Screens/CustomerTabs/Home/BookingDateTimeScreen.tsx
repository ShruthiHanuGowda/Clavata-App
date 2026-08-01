import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
const PRIMARY = '#008060';

type DateItem = {
    id: string;
    date: Date;
    label: string;
    day: string;
    dayNumber: string;
    month: string;
};

type Slot = {
    id: string;
    time: string;
    available: boolean;
};

const generateDates = () => {
    const today = new Date();

    return Array.from({ length: 30 }).map((_, index) => {
        const d = new Date(today);
        d.setDate(today.getDate() + index);

        const weekday = d.toLocaleDateString('en-US', {
            weekday: 'short',
        });

        const month = d.toLocaleDateString('en-US', {
            month: 'short',
        });

        return {
            id: index.toString(),
            date: d,
            label:
                index === 0
                    ? 'Today'
                    : index === 1
                        ? 'Tomorrow'
                        : weekday,
            day: weekday,
            dayNumber: d.getDate().toString(),
            month,
        };
    });
};

const allSlots: Slot[] = [
    { id: '1', time: '09:00 AM', available: true },
    { id: '2', time: '09:30 AM', available: false },
    { id: '3', time: '10:00 AM', available: true },
    { id: '4', time: '10:30 AM', available: true },
    { id: '5', time: '11:00 AM', available: true },
    { id: '6', time: '11:30 AM', available: false },
    { id: '7', time: '12:00 PM', available: true },
    { id: '8', time: '12:30 PM', available: true },
    { id: '9', time: '01:00 PM', available: true },
    { id: '10', time: '01:30 PM', available: true },
    { id: '11', time: '02:00 PM', available: true },
    { id: '12', time: '02:30 PM', available: false },
    { id: '13', time: '03:00 PM', available: true },
    { id: '14', time: '03:30 PM', available: true },
    { id: '15', time: '04:00 PM', available: true },
    { id: '16', time: '04:30 PM', available: true },
    { id: '17', time: '05:00 PM', available: true },
    { id: '18', time: '05:30 PM', available: true },
    { id: '19', time: '06:00 PM', available: true },
    { id: '20', time: '06:30 PM', available: true },
    { id: '21', time: '07:00 PM', available: true },
];

export default function BookingDateTimeScreen({
    navigation,
    route,
}: any) {
    const {
        salonId,
        salon,
        customerUserId,
        services,
    } = route.params;
    console.log("BookingDateTime params:", route?.params);
    const today = new Date().toISOString().split('T')[0];
    const dates = useMemo(() => generateDates(), []);
    const [selectedDate, setSelectedDate] =
        useState<DateItem>(dates[0]);
    const [selectedSlot, setSelectedSlot] =
        useState<string | null>(null);
    const totalPrice = useMemo(() => {
        return services.reduce(
            (sum: number, item: any) => sum + item.price,
            0,
        );
    }, [services]);

    const totalDuration = useMemo(() => {
        return services.reduce(
            (sum: number, item: any) =>
                sum + item.duration,
            0,
        );
    }, [services]);

    const morning = allSlots.filter(slot => {
        const hour = Number(slot.time.split(':')[0]);
        return slot.time.includes('AM');
    });

    const afternoon = allSlots.filter(slot => {
        const hour = Number(slot.time.split(':')[0]);
        return (
            slot.time.includes('PM') &&
            (hour === 12 ||
                hour === 1 ||
                hour === 2 ||
                hour === 3 ||
                hour === 4)
        );
    });

    const evening = allSlots.filter(slot => {
        const hour = Number(slot.time.split(':')[0]);
        return slot.time.includes('PM') && hour >= 5;
    });

    const renderSlot = ({
        item,
    }: {
        item: Slot;
    }) => {
        const selected =
            selectedSlot === item.time;

        return (
            <TouchableOpacity
                disabled={!item.available}
                onPress={() =>
                    setSelectedSlot(item.time)
                }
                style={[
                    styles.slotCard,
                    selected &&
                    styles.slotCardSelected,
                    !item.available &&
                    styles.slotDisabled,
                ]}>
                <Text
                    style={[
                        styles.slotText,
                        selected &&
                        styles.slotTextSelected,
                        !item.available &&
                        styles.slotDisabledText,
                    ]}>
                    {item.time}
                </Text>

                {!item.available && (
                    <Text style={styles.bookedText}>
                        Booked
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    const onDayPress = (day: any) => {
        const selected = new Date(day.dateString);

        setSelectedDate({
            id: day.dateString,
            date: selected,
            label: day.dateString === today ? 'Today' : selected.toLocaleDateString('en-US', {
                weekday: 'short',
            }),
            day: selected.toLocaleDateString('en-US', {
                weekday: 'short',
            }),
            dayNumber: selected.getDate().toString(),
            month: selected.toLocaleDateString('en-US', {
                month: 'short',
            }),
        });

        setSelectedSlot(null);
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Select Appointment
                </Text>

                <Text style={styles.subtitle}>
                    Choose your preferred date & time
                </Text>

                <Text style={styles.month}>
                    {selectedDate.month}{' '}
                    {selectedDate.date.getFullYear()}
                </Text>
            </View>
            <Calendar
                minDate={today}
                enableSwipeMonths
                hideExtraDays={false}
                firstDay={1}
                onDayPress={onDayPress}
                markedDates={{
                    [selectedDate.date.toISOString().split('T')[0]]: {
                        selected: true,
                        selectedColor: '#008060',
                    },
                }}
                theme={{
                    backgroundColor: '#fff',
                    calendarBackground: '#fff',

                    monthTextColor: '#111',
                    textMonthFontSize: 22,
                    textMonthFontWeight: '700',

                    dayTextColor: '#222',
                    textDayFontWeight: '600',

                    textDayHeaderFontWeight: '700',
                    textDayHeaderFontSize: 13,

                    selectedDayBackgroundColor: '#008060',
                    selectedDayTextColor: '#fff',

                    todayTextColor: '#008060',

                    arrowColor: '#008060',

                    textDisabledColor: '#d2d2d2',
                }}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 140,
                }}>

                <Text style={styles.sectionTitle}>
                    Morning
                </Text>
                <FlatList
                    data={morning}
                    renderItem={renderSlot}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    scrollEnabled={false}
                />
                <Text style={styles.sectionTitle}>
                    Afternoon
                </Text>
                <FlatList
                    data={afternoon}
                    renderItem={renderSlot}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    scrollEnabled={false}
                />
                <Text style={styles.sectionTitle}>
                    Evening
                </Text>
                <FlatList
                    data={evening}
                    renderItem={renderSlot}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    scrollEnabled={false}
                />
                <View style={styles.summaryCard}>
                    <View>
                        <Text style={styles.summaryTitle}>
                            Booking Summary
                        </Text>

                        <Text style={styles.summarySub}>
                            {services.length} Services
                        </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.summaryPrice}>
                            ₹{totalPrice}
                        </Text>

                        <Text style={styles.summarySub}>
                            {totalDuration} mins
                        </Text>
                    </View>
                </View>

            </ScrollView>
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.bottomPrice}>
                        ₹{totalPrice}
                    </Text>

                    <Text style={styles.bottomServices}>
                        {services.length} services
                    </Text>
                </View>

                <TouchableOpacity
                    disabled={!selectedSlot}
                    style={[
                        styles.continueButton,
                        !selectedSlot && {
                            opacity: 0.5,
                        },
                    ]}
                    onPress={() =>
                        navigation.navigate(
                            'BookingSummary',
                            {
                                salonId,
                                salon,
                                customerUserId,
                                services,
                                date: selectedDate,
                                time: selectedSlot,
                            },
                        )
                    }>
                    <Text style={styles.continueText}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F7FB',
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 15,
        color: '#777',
    },

    month: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },

    calendarContainer: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },

    dateCard: {
        width: 78,
        height: 100,
        backgroundColor: '#FFF',
        borderRadius: 18,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ECECEC',
        elevation: 2,
    },

    dateCardSelected: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },

    dateLabel: {
        fontSize: 12,
        color: '#777',
        fontWeight: '600',
    },

    dateLabelSelected: {
        color: '#FFF',
    },

    dateNumber: {
        marginTop: 6,
        fontSize: 28,
        fontWeight: '700',
        color: '#111',
    },

    dateNumberSelected: {
        color: '#FFF',
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },
    favorite: {
        fontSize: 28,
    },

    dateMonth: {
        marginTop: 4,
        fontSize: 12,
        color: '#777',
    },

    dateMonthSelected: {
        color: '#FFF',
    },

    summaryCard: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },

    summaryTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111',
    },

    summarySub: {
        marginTop: 5,
        color: '#777',
        fontSize: 14,
    },

    summaryPrice: {
        fontSize: 22,
        fontWeight: '700',
        color: PRIMARY,
    },

    sectionTitle: {
        marginHorizontal: 18,
        marginTop: 20,
        marginBottom: 12,
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },

    slotCard: {
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 14,
        backgroundColor: '#FFF',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        elevation: 1,
    },

    slotCardSelected: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },

    slotDisabled: {
        backgroundColor: '#F2F2F2',
        borderColor: '#F2F2F2',
    },

    slotText: {
        fontWeight: '700',
        fontSize: 15,
        color: '#111',
    },

    slotTextSelected: {
        color: '#FFF',
    },

    slotDisabledText: {
        color: '#AAA',
    },

    bookedText: {
        marginTop: 5,
        color: '#E53935',
        fontSize: 11,
        fontWeight: '600',
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    bottomPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: PRIMARY,
    },

    bottomServices: {
        marginTop: 4,
        color: '#666',
        fontSize: 14,
    },

    continueButton: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 34,
        paddingVertical: 15,
        borderRadius: 30,
    },

    continueText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },

    calendarWrapper: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 18,
        elevation: 2,
        paddingVertical: 8,
    },
});