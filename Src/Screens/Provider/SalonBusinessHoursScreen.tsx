import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Switch,
    Alert,
    StyleSheet,
} from 'react-native';

import DatePicker from 'react-native-date-picker';

import { Header, DButton } from '../../components';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';

type DayKey =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

type BusinessDay = {
    open: string;
    close: string;
    isOpen: boolean;
};

type BusinessHours = Record<DayKey, BusinessDay>;

const DAYS: {
    key: DayKey;
    label: string;
}[] = [
        { key: 'MONDAY', label: 'Monday' },
        { key: 'TUESDAY', label: 'Tuesday' },
        { key: 'WEDNESDAY', label: 'Wednesday' },
        { key: 'THURSDAY', label: 'Thursday' },
        { key: 'FRIDAY', label: 'Friday' },
        { key: 'SATURDAY', label: 'Saturday' },
        { key: 'SUNDAY', label: 'Sunday' },
    ];

/**
 * Default salon timings
 *
 * Monday-Friday: 9:00 AM - 7:00 PM
 * Saturday:      10:00 AM - 6:00 PM
 * Sunday:        Closed
 */
const DEFAULT_HOURS: BusinessHours = {
    MONDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    TUESDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    WEDNESDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    THURSDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    FRIDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    SATURDAY: {
        open: '10:00',
        close: '18:00',
        isOpen: true,
    },

    SUNDAY: {
        open: '10:00',
        close: '18:00',
        isOpen: false,
    },
};

/**
 * Convert HH:mm -> Date
 *
 * Important:
 * We explicitly set hours/minutes so
 * the picker doesn't open at 12:00 AM.
 */
function parseTime(time: string): Date {
    const [hoursString, minutesString] = time.split(':');

    const hours = Number(hoursString);
    const minutes = Number(minutesString);

    const date = new Date();

    date.setHours(
        Number.isFinite(hours) ? hours : 9,
        Number.isFinite(minutes) ? minutes : 0,
        0,
        0
    );

    return date;
}

/**
 * Convert Date -> HH:mm
 */
function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');

    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

/**
 * Convert HH:mm -> 12-hour display
 *
 * 09:00 -> 09:00 AM
 * 13:30 -> 01:30 PM
 * 19:00 -> 07:00 PM
 */
function displayTime(time: string): string {
    const [hourString, minuteString] = time.split(':');

    let hour = Number(hourString);

    const minute = minuteString || '00';

    const period = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${String(hour).padStart(2, '0')}:${minute} ${period}`;
}

export default function SalonBusinessHoursScreen({
    navigation,
}: any) {
    const { data, updateData } = useSalonRegistration();

    /**
     * If business hours already exist in context,
     * use them. Otherwise use our default hours.
     */
    const [hours, setHours] = useState<BusinessHours>(
        data.businessHours || DEFAULT_HOURS
    );

    /**
     * Which time picker is open?
     */
    const [picker, setPicker] = useState<{
        day: DayKey;
        type: 'open' | 'close';
    } | null>(null);

    /**
     * Toggle day open / closed
     */
    const toggleDay = (day: DayKey) => {
        setHours(prev => ({
            ...prev,

            [day]: {
                ...prev[day],

                isOpen: !prev[day].isOpen,
            },
        }));
    };

    /**
     * Open time picker
     */
    const openTimePicker = (
        day: DayKey,
        type: 'open' | 'close'
    ) => {
        setPicker({
            day,
            type,
        });
    };

    /**
     * Time picker confirmed
     */
    const handleTimeConfirm = (selectedDate: Date) => {
        if (!picker) {
            return;
        }

        const value = formatTime(selectedDate);

        setHours(prev => ({
            ...prev,

            [picker.day]: {
                ...prev[picker.day],

                [picker.type]: value,
            },
        }));

        setPicker(null);
    };

    /**
     * Time picker cancelled
     */
    const handleTimeCancel = () => {
        setPicker(null);
    };

    /**
     * Validate business hours
     */
    const validateHours = (): boolean => {
        for (const day of DAYS) {
            const value = hours[day.key];

            /**
             * Closed day doesn't need validation.
             */
            if (!value.isOpen) {
                continue;
            }

            if (!value.open || !value.close) {
                Alert.alert(
                    'Invalid Hours',
                    `Please select opening and closing time for ${day.label}.`
                );

                return false;
            }

            const openParts = value.open.split(':');
            const closeParts = value.close.split(':');

            const openMinutes =
                Number(openParts[0]) * 60 +
                Number(openParts[1]);

            const closeMinutes =
                Number(closeParts[0]) * 60 +
                Number(closeParts[1]);

            if (closeMinutes <= openMinutes) {
                Alert.alert(
                    'Invalid Hours',
                    `${day.label}: closing time must be after opening time.`
                );

                return false;
            }
        }

        return true;
    };

    /**
     * Continue registration
     */
    const handleContinue = () => {
        if (!validateHours()) {
            return;
        }

        console.log(
            '======================================'
        );

        console.log(
            'SALON REGISTRATION BUSINESS HOURS'
        );

        console.log(
            JSON.stringify(hours, null, 2)
        );

        console.log(
            '======================================'
        );

        /**
         * Save business hours into
         * SalonRegistrationContext.
         */
        updateData({
            businessHours: hours,
        });

        /**
         * Continue to KYC.
         */
        navigation.navigate('SalonKYC');
    };

    /**
     * Currently selected picker value.
     */
    const pickerDate = picker
        ? parseTime(
            hours[picker.day][picker.type]
        )
        : new Date();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* HEADER */}

                <Header headerTitle="Business Hours" />

                <View style={styles.headerSection}>
                    <Text style={styles.title}>
                        Business Hours
                    </Text>

                    <Text style={styles.subtitle}>
                        Set your salon's weekly
                        operating hours
                    </Text>
                </View>

                {/* INFO */}

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>
                        Set your usual timings
                    </Text>

                    <Text style={styles.infoText}>
                        These timings will be shown to
                        customers when they view your
                        salon. You can change them later
                        from your salon profile.
                    </Text>
                </View>

                {/* DAYS */}

                <View style={styles.card}>
                    {DAYS.map((day, index) => {
                        const value =
                            hours[day.key];

                        return (
                            <View
                                key={day.key}
                                style={[
                                    styles.dayContainer,

                                    index ===
                                    DAYS.length - 1 &&
                                    styles.lastDay,
                                ]}
                            >
                                {/* DAY HEADER */}

                                <View
                                    style={
                                        styles.dayHeader
                                    }
                                >
                                    <Text
                                        style={
                                            styles.dayName
                                        }
                                    >
                                        {day.label}
                                    </Text>

                                    <Switch
                                        value={
                                            value.isOpen
                                        }
                                        onValueChange={() =>
                                            toggleDay(
                                                day.key
                                            )
                                        }
                                        trackColor={{
                                            false:
                                                '#D1D5DB',
                                            true:
                                                '#009D94',
                                        }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>

                                {/* OPEN DAY */}

                                {value.isOpen ? (
                                    <View
                                        style={
                                            styles.timeRow
                                        }
                                    >
                                        {/* OPENING TIME */}

                                        <TouchableOpacity
                                            style={
                                                styles.timeButton
                                            }
                                            onPress={() =>
                                                openTimePicker(
                                                    day.key,
                                                    'open'
                                                )
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.timeLabel
                                                }
                                            >
                                                Opens
                                            </Text>

                                            <Text
                                                style={
                                                    styles.timeValue
                                                }
                                            >
                                                {displayTime(
                                                    value.open
                                                )}
                                            </Text>
                                        </TouchableOpacity>

                                        <Text
                                            style={
                                                styles.separator
                                            }
                                        >
                                            —
                                        </Text>

                                        {/* CLOSING TIME */}

                                        <TouchableOpacity
                                            style={
                                                styles.timeButton
                                            }
                                            onPress={() =>
                                                openTimePicker(
                                                    day.key,
                                                    'close'
                                                )
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.timeLabel
                                                }
                                            >
                                                Closes
                                            </Text>

                                            <Text
                                                style={
                                                    styles.timeValue
                                                }
                                            >
                                                {displayTime(
                                                    value.close
                                                )}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={
                                            styles.closedRow
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.closedLabel
                                            }
                                        >
                                            Closed
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* CONTINUE BUTTON */}

                <DButton
                    type="primary"
                    style={styles.button}
                    onPress={handleContinue}
                >
                    <Text style={styles.buttonText}>
                        Continue
                    </Text>
                </DButton>

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* TIME PICKER */}

            <DatePicker
                modal
                open={picker !== null}
                date={pickerDate}
                mode="time"
                locale="en"
                title={
                    picker?.type === 'open'
                        ? 'Opening Time'
                        : 'Closing Time'
                }
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={handleTimeConfirm}
                onCancel={handleTimeCancel}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8F8',
    },

    content: {
        padding: 16,
        paddingBottom: 40,
    },

    headerSection: {
        marginTop: 8,
        marginBottom: 16,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111',
    },

    subtitle: {
        marginTop: 5,
        fontSize: 13,
        color: '#777',
    },

    infoCard: {
        backgroundColor: '#EAF7F5',
        borderRadius: 14,
        padding: 15,
        marginBottom: 16,
    },

    infoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#006F66',
        marginBottom: 5,
    },

    infoText: {
        fontSize: 13,
        lineHeight: 19,
        color: '#4F6664',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,

        elevation: 2,

        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,

        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    dayContainer: {
        paddingVertical: 18,

        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    lastDay: {
        borderBottomWidth: 0,
    },

    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dayName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },

    timeButton: {
        flex: 1,

        backgroundColor: '#F3F8F7',

        borderRadius: 12,

        padding: 12,
    },

    timeLabel: {
        fontSize: 11,
        color: '#777',

        marginBottom: 3,
    },

    timeValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#008060',
    },

    separator: {
        marginHorizontal: 10,
        color: '#999',
    },

    closedRow: {
        marginTop: 10,
    },

    closedLabel: {
        fontSize: 13,
        color: '#999',
        fontWeight: '600',
    },

    button: {
        width: '100%',
        alignSelf: 'center',
        marginTop: 20,
    },

    buttonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
    },
});

