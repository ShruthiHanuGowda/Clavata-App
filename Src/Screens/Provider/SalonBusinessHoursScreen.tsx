import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';

import DatePicker from 'react-native-date-picker';

import AppGradient from '../../common/AppGradient';

import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    RADIUS,
    GRADIENTS,
} from '../../constants/constants';

import {
    useSalonRegistration,
    BusinessHours,
    DayKey,
} from '../../context/SalonRegistrationContext';

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

function parseTime(time: string): Date {
    const [hoursString, minutesString] = time.split(':');

    const hours = Number(hoursString);
    const minutes = Number(minutesString);

    const date = new Date();

    date.setHours(
        Number.isFinite(hours) ? hours : 9,
        Number.isFinite(minutes) ? minutes : 0,
        0,
        0,
    );

    return date;
}

function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

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

    const [hours, setHours] = useState<BusinessHours>(
        data.businessHours,
    );

    const [picker, setPicker] = useState<{
        day: DayKey;
        type: 'open' | 'close';
    } | null>(null);

    const toggleDay = (day: DayKey) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                isOpen: !prev[day].isOpen,
            },
        }));
    };

    const openTimePicker = (
        day: DayKey,
        type: 'open' | 'close',
    ) => {
        setPicker({ day, type });
    };

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

    const handleNext = () => {
        updateData({
            businessHours: hours,
        });

        navigation.navigate('SalonServices');
    };

    const pickerDate = picker
        ? parseTime(hours[picker.day][picker.type])
        : new Date();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Text style={styles.back}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            Business Hours
                        </Text>

                        <Text style={styles.subtitle}>
                            Set your weekly operating hours
                        </Text>
                    </View>
                </View>

                {/* Weekly schedule */}
                <View style={styles.card}>
                    {DAYS.map((day, index) => {
                        const value = hours[day.key];

                        return (
                            <View
                                key={day.key}
                                style={[
                                    styles.dayContainer,
                                    index === DAYS.length - 1 &&
                                        styles.lastDay,
                                ]}
                            >
                                <View style={styles.dayHeader}>
                                    <Text style={styles.dayName}>
                                        {day.label}
                                    </Text>

                                    {/* Linear-gradient day toggle */}
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            toggleDay(day.key)
                                        }
                                        style={[
                                            styles.customSwitch,
                                            !value.isOpen &&
                                                styles.customSwitchOff,
                                        ]}
                                        accessibilityRole="switch"
                                        accessibilityState={{
                                            checked: value.isOpen,
                                        }}
                                        accessibilityLabel={`${day.label} business hours`}
                                    >
                                        {value.isOpen && (
                                            <AppGradient
                                                colors={[
                                                    ...GRADIENTS.SOFT_PURPLE,
                                                ]}
                                                style={styles.switchGradient} children={undefined}                                            />
                                        )}

                                        <View
                                            style={[
                                                styles.switchThumb,
                                                value.isOpen
                                                    ? styles.switchThumbOn
                                                    : styles.switchThumbOff,
                                            ]}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {value.isOpen ? (
                                    <View style={styles.timeRow}>
                                        <TouchableOpacity
                                            style={styles.timeButton}
                                            onPress={() =>
                                                openTimePicker(
                                                    day.key,
                                                    'open',
                                                )
                                            }
                                            accessibilityRole="button"
                                            accessibilityLabel={`Set ${day.label} opening time`}
                                        >
                                            <Text style={styles.timeLabel}>
                                                Opens
                                            </Text>

                                            <Text style={styles.timeValue}>
                                                {displayTime(value.open)}
                                            </Text>
                                        </TouchableOpacity>

                                        <Text style={styles.separator}>
                                            —
                                        </Text>

                                        <TouchableOpacity
                                            style={styles.timeButton}
                                            onPress={() =>
                                                openTimePicker(
                                                    day.key,
                                                    'close',
                                                )
                                            }
                                            accessibilityRole="button"
                                            accessibilityLabel={`Set ${day.label} closing time`}
                                        >
                                            <Text style={styles.timeLabel}>
                                                Closes
                                            </Text>

                                            <Text style={styles.timeValue}>
                                                {displayTime(value.close)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.closedLabel}>
                                        Closed
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Gradient Continue button */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Continue to salon services"
                >
                    <AppGradient
                        colors={[...GRADIENTS.SOFT_PURPLE]}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            Continue
                        </Text>
                    </AppGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* Time picker */}
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
                onCancel={() => setPicker(null)}
            />
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        padding: SPACING.large,
        paddingBottom: SPACING.huge,
    },

    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: SPACING.xl,
        paddingVertical: SPACING.small,
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },

    back: {
        fontSize: 38,
        color: COLORS.text,
        lineHeight: 40,
    },

    headerText: {
        flex: 1,
        marginLeft: 4,
    },

    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.title,
        lineHeight: FONT_SIZES.title + 5,
        color: COLORS.text,
        fontWeight: '700' as const,
    },

    subtitle: {
        marginTop: 4,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.small,
        color: COLORS.textSecondary,
    },

    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.large,
        paddingHorizontal: SPACING.large,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    dayContainer: {
        paddingVertical: SPACING.large,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    lastDay: {
        borderBottomWidth: 0,
    },

    dayHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },

    dayName: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.body,
        color: COLORS.text,
        fontWeight: '600' as const,
    },

    timeRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginTop: SPACING.medium,
    },

    timeButton: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.medium,
        padding: SPACING.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    timeLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginBottom: 3,
    },

    timeValue: {
        fontSize: FONT_SIZES.small,
        fontWeight: '700' as const,
        color: COLORS.text,
    },

    separator: {
        marginHorizontal: SPACING.small,
        color: COLORS.textMuted,
    },

    closedLabel: {
        marginTop: SPACING.small,
        fontSize: FONT_SIZES.small,
        color: COLORS.textMuted,
        fontWeight: '600' as const,
    },

    button: {
        height: 52,
        marginTop: SPACING.xl,
        borderRadius: RADIUS.medium,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        overflow: 'hidden' as const,
    },

    buttonText: {
        color: COLORS.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.body,
        fontWeight: '700' as const,
    },
    customSwitch: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    backgroundColor: COLORS.borderStrong,
},

customSwitchOff: {
    backgroundColor: COLORS.borderStrong,
},

switchGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
},

switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    position: 'absolute' as const,
    top: 3,
},

switchThumbOn: {
    right: 3,
},

switchThumbOff: {
    left: 3,
},
};

