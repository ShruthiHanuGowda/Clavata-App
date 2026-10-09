import React, { useEffect, useMemo, useState } from 'react';

import {
    AppState,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
    StyleProp,
} from 'react-native';

interface CalendarPickerProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    markedDates?: string[];
    primaryColor?: string;
    style?: StyleProp<ViewStyle>;
    minDate?: string;
    maxDate?: string;
    disablePastDates?: boolean;
}

const MONTHS = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
];

const WEEK_DAYS = [
    'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT',
];

const DEFAULT_PRIMARY = '#009D94';

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${pad(
        date.getMonth() + 1,
    )}-${pad(date.getDate())}`;
}

function parseDateKey(dateKey: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        dateKey,
    );

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function isBeforeDate(
    dateKey: string,
    otherDateKey: string,
): boolean {
    return dateKey < otherDateKey;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
    selectedDate,
    onDateSelect,
    markedDates = [],
    primaryColor = DEFAULT_PRIMARY,
    style,
    minDate,
    maxDate,
    disablePastDates = false,
}) => {
    const [todayKey, setTodayKey] = useState(() =>
        toDateKey(new Date()),
    );

    const initialSelectedDate =
        parseDateKey(selectedDate) || new Date();

    const [currentMonth, setCurrentMonth] = useState(
        () => new Date(
            initialSelectedDate.getFullYear(),
            initialSelectedDate.getMonth(),
            1,
        ),
    );

    // Refresh today's date when the app returns to this
    // component through a normal React render cycle.
    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            state => {
                if (state === 'active') {
                    setTodayKey(toDateKey(new Date()));
                }
            },
        );

        return () => subscription.remove();
    }, []);

    // If the parent selects a date outside the displayed
    // month, show that date's month.
    useEffect(() => {
        const selected = parseDateKey(selectedDate);

        if (!selected) {
            return;
        }

        setCurrentMonth(previous => {
            if (
                previous.getFullYear() === selected.getFullYear() &&
                previous.getMonth() === selected.getMonth()
            ) {
                return previous;
            }

            return new Date(
                selected.getFullYear(),
                selected.getMonth(),
                1,
            );
        });
    }, [selectedDate]);

    const effectiveMinDate =
        minDate || (disablePastDates ? todayKey : undefined);

    const markedDateSet = useMemo(
        () => new Set(markedDates),
        [markedDates],
    );

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(
            year,
            month + 1,
            0,
        ).getDate();

        const days: Array<Date | null> = [];

        for (let index = 0; index < firstDay; index++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    }, [currentMonth]);

    const previousMonth = () => {
        setCurrentMonth(previous => new Date(
            previous.getFullYear(),
            previous.getMonth() - 1,
            1,
        ));
    };

    const nextMonth = () => {
        setCurrentMonth(previous => new Date(
            previous.getFullYear(),
            previous.getMonth() + 1,
            1,
        ));
    };

    const goToToday = () => {
        const now = new Date();
        const nowKey = toDateKey(now);

        setTodayKey(nowKey);
        setCurrentMonth(new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
        ));

        if (
            (!effectiveMinDate || nowKey >= effectiveMinDate) &&
            (!maxDate || nowKey <= maxDate)
        ) {
            onDateSelect(nowKey);
        }
    };

    const isDateDisabled = (dateKey: string) => {
        if (effectiveMinDate && isBeforeDate(
            dateKey,
            effectiveMinDate,
        )) {
            return true;
        }

        if (maxDate && isBeforeDate(maxDate, dateKey)) {
            return true;
        }

        return false;
    };

    return (
        <View style={[styles.calendarCard, style]}>
            {/* MONTH HEADER */}

            <View style={styles.monthHeader}>
                <TouchableOpacity
                    style={styles.monthArrow}
                    onPress={previousMonth}
                    accessibilityRole="button"
                    accessibilityLabel="Previous month"
                >
                    <Text
                        style={[
                            styles.arrowText,
                            { color: primaryColor },
                        ]}
                    >
                        ‹
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.monthTitleContainer}
                    onPress={goToToday}
                    accessibilityRole="button"
                    accessibilityLabel="Go to today"
                >
                    <Text
                        style={styles.monthTitle}
                        numberOfLines={1}
                    >
                        {MONTHS[currentMonth.getMonth()]}{' '}
                        {currentMonth.getFullYear()}
                    </Text>

                    <Text style={styles.todayHint}>
                        Tap to go to today
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.monthArrow}
                    onPress={nextMonth}
                    accessibilityRole="button"
                    accessibilityLabel="Next month"
                >
                    <Text
                        style={[
                            styles.arrowText,
                            { color: primaryColor },
                        ]}
                    >
                        ›
                    </Text>
                </TouchableOpacity>
            </View>

            {/* WEEK DAYS */}

            <View style={styles.weekRow}>
                {WEEK_DAYS.map(day => (
                    <View
                        key={day}
                        style={styles.weekDay}
                    >
                        <Text style={styles.weekDayText}>
                            {day}
                        </Text>
                    </View>
                ))}
            </View>

            {/* CALENDAR GRID */}

            <View style={styles.calendarGrid}>
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return (
                            <View
                                key={`empty-${index}`}
                                style={styles.calendarDay}
                            />
                        );
                    }

                    const dateKey = toDateKey(date);
                    const isSelected =
                        selectedDate === dateKey;
                    const isToday =
                        todayKey === dateKey;
                    const hasBookings =
                        markedDateSet.has(dateKey);
                    const disabled =
                        isDateDisabled(dateKey);

                    return (
                        <TouchableOpacity
                            key={dateKey}
                            style={styles.calendarDay}
                            onPress={() => {
                                if (!disabled) {
                                    onDateSelect(dateKey);
                                }
                            }}
                            disabled={disabled}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={
                                `${date.getDate()} ` +
                                `${MONTHS[date.getMonth()]} ` +
                                `${date.getFullYear()}` +
                                (hasBookings
                                    ? ', has bookings'
                                    : '')
                            }
                            accessibilityState={{
                                selected: isSelected,
                                disabled,
                            }}
                        >
                            <View
                                style={[
                                    styles.dateCircle,
                                    isSelected && {
                                        backgroundColor: primaryColor,
                                    },
                                    isToday &&
                                    !isSelected && {
                                        borderColor: primaryColor,
                                        borderWidth: 1,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dateText,
                                        isSelected &&
                                        styles.selectedDateText,
                                        isToday &&
                                        !isSelected && {
                                            color: primaryColor,
                                        },
                                        disabled && styles.disabledDateText,
                                    ]}
                                >
                                    {date.getDate()}
                                </Text>
                            </View>

                            {hasBookings ? (
                                <View
                                    style={[
                                        styles.bookingDot,
                                        {
                                            backgroundColor:
                                                primaryColor,
                                        },
                                    ]}
                                />
                            ) : null}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* BOOKING DOT LEGEND */}

            {markedDateSet.size > 0 ? (
                <View style={styles.legend}>
                    <View
                        style={[
                            styles.legendDot,
                            { backgroundColor: primaryColor },
                        ]}
                    />
                    <Text style={styles.legendText}>
                        Dates with bookings
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    calendarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
        gap: 6,
    },

    monthArrow: {
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: 20,
        backgroundColor: '#F3F8F7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowText: {
        fontSize: 28,
        lineHeight: 30,
    },

    monthTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },

    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },

    todayHint: {
        fontSize: 10,
        color: '#8A8A8A',
        marginTop: 3,
        textAlign: 'center',
    },

    weekRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },

    weekDay: {
        width: '14.2857%',
        alignItems: 'center',
    },

    weekDayText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
    },

    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    calendarDay: {
        width: '14.2857%',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },

    selectedDateText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    disabledDateText: {
        color: '#D1D5DB',
    },

    bookingDot: {
        position: 'absolute',
        bottom: 1,
        width: 5,
        height: 5,
        borderRadius: 3,
    },

    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 6,
    },

    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    legendText: {
        fontSize: 11,
        color: '#6B7280',
    },
});

export default CalendarPicker;

