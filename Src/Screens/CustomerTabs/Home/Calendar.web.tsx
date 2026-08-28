import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

type CalendarProps = {
    current?: string;
    minDate?: string;
    maxDate?: string;
    markedDates?: Record<string, any>;
    onDayPress?: (day: {
        dateString: string;
        day: number;
        month: number;
        year: number;
    }) => void;
};

export default function Calendar({
    current,
    minDate,
    maxDate,
    markedDates,
    onDayPress,
}: CalendarProps) {
    const date = current
        ? new Date(current)
        : new Date();

    const year = date.getFullYear();
    const month = date.getMonth();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0,
        ).getDate();

    const monthName =
        date.toLocaleString(
            'default',
            {
                month: 'long',
            },
        );

    const handleDayPress = (
        day: number,
    ) => {
        const dateString =
            `${year}-${String(
                month + 1,
            ).padStart(2, '0')}-${String(
                day,
            ).padStart(2, '0')}`;

        onDayPress?.({
            dateString,
            day,
            month: month + 1,
            year,
        });
    };

    return (
        <View style={styles.container}>

            <Text style={styles.header}>
                {monthName} {year}
            </Text>

            <View style={styles.days}>

                {Array.from(
                    {
                        length: daysInMonth,
                    },
                    (_, index) => {

                        const day =
                            index + 1;

                        const dateString =
                            `${year}-${String(
                                month + 1,
                            ).padStart(
                                2,
                                '0',
                            )}-${String(
                                day,
                            ).padStart(
                                2,
                                '0',
                            )}`;

                        const marked =
                            markedDates?.[
                            dateString
                            ];

                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.day,
                                    marked?.selected &&
                                    styles.selected,
                                ]}
                                onPress={() =>
                                    handleDayPress(
                                        day,
                                    )
                                }
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        marked?.selected &&
                                        styles.selectedText,
                                    ]}
                                >
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        );
                    },
                )}

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },

    header: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
        color: '#111827',
    },

    days: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    day: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },

    selected: {
        backgroundColor: '#009D94',
    },

    dayText: {
        fontSize: 14,
        color: '#111827',
    },

    selectedText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});