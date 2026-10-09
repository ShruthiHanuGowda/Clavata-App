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

import Ionicons from 'react-native-vector-icons/Ionicons';

interface CalendarPickerProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    markedDates?: string[];
    primaryColor?: string;
    style?: StyleProp<ViewStyle>;
    minDate?: string;
    maxDate?: string;
    disablePastDates?: boolean;
    defaultExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
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

function formatSelectedDate(dateKey: string): string {
    const date = parseDateKey(dateKey);

    if (!date) {
        return dateKey;
    }

    return `${date.getDate()} ${
        MONTHS[date.getMonth()].substring(0, 3)
    } ${date.getFullYear()}`;
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
    defaultExpanded = false,
    onExpandedChange,
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const [todayKey, setTodayKey] = useState(
        () => toDateKey(new Date()),
    );

    const initialDate =
        parseDateKey(selectedDate) || new Date();

    const [currentMonth, setCurrentMonth] = useState(
        () => new Date(
            initialDate.getFullYear(),
            initialDate.getMonth(),
            1,
        ),
    );

    const markedDateSet = useMemo(
        () => new Set(markedDates),
        [markedDates],
    );

    // Refresh today's date when the app becomes active.
    useEffect(() => {
        const refreshToday = () => {
            setTodayKey(toDateKey(new Date()));
        };

        refreshToday();

        const subscription = AppState.addEventListener(
            'change',
            state => {
                if (state === 'active') {
                    refreshToday();
                }
            },
        );

        return () => subscription.remove();
    }, []);

    // Keep the calendar month synchronized with a date
    // selected externally by the parent screen.
    useEffect(() => {
        const selected = parseDateKey(selectedDate);

        if (!selected) {
            return;
        }

        setCurrentMonth(previous => {
            if (
                previous.getFullYear() ===
                    selected.getFullYear() &&
                previous.getMonth() ===
                    selected.getMonth()
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

    const selectedDateHasBookings =
        markedDateSet.has(selectedDate);

    const setCalendarExpanded = (value: boolean) => {
        setExpanded(value);
        onExpandedChange?.(value);
    };

    const toggleCalendar = () => {
        setCalendarExpanded(!expanded);
    };

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(
            year,
            month,
            1,
        ).getDay();

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

    const isDateDisabled = (dateKey: string) => {
        if (
            effectiveMinDate &&
            isBeforeDate(dateKey, effectiveMinDate)
        ) {
            return true;
        }

        if (maxDate && isBeforeDate(maxDate, dateKey)) {
            return true;
        }

        return false;
    };

    const handleDateSelect = (dateKey: string) => {
        if (isDateDisabled(dateKey)) {
            return;
        }

        onDateSelect(dateKey);

        // Collapse after selecting a date so the bookings
        // list becomes visible immediately.
        setCalendarExpanded(false);
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
            setCalendarExpanded(false);
        }
    };

    return (
        <View style={[styles.container, style]}>
            {/* COLLAPSED HEADER / TOGGLE */}

            <TouchableOpacity
                style={styles.toggleHeader}
                onPress={toggleCalendar}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={
                    expanded
                        ? 'Collapse calendar'
                        : 'Expand calendar'
                }
                accessibilityState={{
                    expanded,
                }}
            >
                <View
                    style={[
                        styles.calendarIconContainer,
                        { backgroundColor: `${primaryColor}15` },
                    ]}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={21}
                        color={primaryColor}
                    />
                </View>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.selectedDateLabel}>
                        Selected date
                    </Text>

                    <View style={styles.selectedDateRow}>
                        <Text
                            style={styles.selectedDateText}
                            numberOfLines={1}
                        >
                            {formatSelectedDate(selectedDate)}
                        </Text>

                        {selectedDateHasBookings ? (
                            <View
                                style={[
                                    styles.bookingIndicator,
                                    { backgroundColor: primaryColor },
                                ]}
                            />
                        ) : null}
                    </View>

                    <Text style={styles.toggleHint}>
                        {expanded
                            ? 'Hide calendar'
                            : 'Tap to choose another date'}
                    </Text>
                </View>

                <View style={styles.toggleAction}>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={21}
                        color="#6B7280"
                    />
                </View>
            </TouchableOpacity>

            {/* EXPANDABLE CALENDAR */}

            {expanded ? (
                <View style={styles.calendarContent}>
                    <View style={styles.separator} />

                    {/* MONTH NAVIGATION */}

                    <View style={styles.monthHeader}>
                        <TouchableOpacity
                            style={styles.monthArrow}
                            onPress={previousMonth}
                            accessibilityRole="button"
                            accessibilityLabel="Previous month"
                        >
                            <Ionicons
                                name="chevron-back"
                                size={20}
                                color={primaryColor}
                            />
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
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={primaryColor}
                            />
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
                                    onPress={() =>
                                        handleDateSelect(dateKey)
                                    }
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
                                                backgroundColor:
                                                    primaryColor,
                                            },
                                            isToday &&
                                                !isSelected && {
                                                    borderColor:
                                                        primaryColor,
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
                                                disabled &&
                                                    styles.disabledDateText,
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

                    {/* LEGEND */}

                    {markedDateSet.size > 0 ? (
                        <View style={styles.legend}>
                            <View
                                style={[
                                    styles.legendDot,
                                    {
                                        backgroundColor: primaryColor,
                                    },
                                ]}
                            />

                            <Text style={styles.legendText}>
                                Dates with bookings
                            </Text>
                        </View>
                    ) : null}

                    {/* COLLAPSE ACTION */}

                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setCalendarExpanded(false)}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.doneButtonText,
                                { color: primaryColor },
                            ]}
                        >
                            Done
                        </Text>

                        <Ionicons
                            name="checkmark"
                            size={17}
                            color={primaryColor}
                        />
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
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
        overflow: 'hidden',
    },

    toggleHeader: {
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    calendarIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTextContainer: {
        flex: 1,
        marginLeft: 12,
        minWidth: 0,
    },

    selectedDateLabel: {
        fontSize: 11,
        color: '#8A8A8A',
        fontWeight: '500',
    },

    selectedDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        gap: 7,
    },

    selectedDateText: {
        flexShrink: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    bookingIndicator: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },

    toggleHint: {
        marginTop: 3,
        fontSize: 11,
        color: '#6B7280',
    },

    toggleAction: {
        width: 34,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },

    calendarContent: {
        paddingHorizontal: 14,
        paddingBottom: 12,
    },

    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E5E7EB',
        marginBottom: 12,
    },

    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 6,
    },

    monthArrow: {
        width: 38,
        height: 38,
        flexShrink: 0,
        borderRadius: 19,
        backgroundColor: '#F3F8F7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    monthTitleContainer: {
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },

    monthTitle: {
        fontSize: 17,
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
        marginBottom: 5,
    },

    weekDay: {
        width: '14.2857%',
        alignItems: 'center',
    },

    weekDayText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
    },

    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    calendarDay: {
        width: '14.2857%',
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },

    // selectedDateText: {
    //     color: '#FFFFFF',
    //     fontWeight: '700',
    // },

    disabledDateText: {
        color: '#D1D5DB',
    },

    bookingDot: {
        position: 'absolute',
        bottom: 0,
        width: 5,
        height: 5,
        borderRadius: 3,
    },

    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
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

    doneButton: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 5,
    },

    doneButtonText: {
        fontSize: 13,
        fontWeight: '700',
    },
});

export default CalendarPicker;

