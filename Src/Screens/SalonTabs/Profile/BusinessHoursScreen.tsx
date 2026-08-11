import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';

import DatePicker from 'react-native-date-picker';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import {
    UPDATE_BUSINESS_HOURS,
    GET_SALON_BUSINESS_HOURS,
} from '../../../graphql/queries';

import { useUser } from '../../../context/UserContext';

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
 * Convert HH:mm to Date
 *
 * IMPORTANT:
 * We explicitly set the hours/minutes.
 * This prevents the picker from opening at 12:00 AM.
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
 * Example:
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

export default function BusinessHoursScreen() {
    const navigation = useNavigation();

    const { currentUser } = useUser();

    const [hours, setHours] = useState<BusinessHours>(
        DEFAULT_HOURS
    );

    const [loading, setLoading] = useState(false);

    /**
     * Which picker is currently open?
     */
    const [picker, setPicker] = useState<{
        day: DayKey;
        type: 'open' | 'close';
    } | null>(null);

    /**
     * GraphQL mutation
     */
    const [updateBusinessHours] = useMutation(
        UPDATE_BUSINESS_HOURS
    );

    /**
     * Load salon business hours
     */
    const {
        data,
        loading: loadingSalon,
    } = useQuery(GET_SALON_BUSINESS_HOURS, {
        variables: {
            salonId: currentUser?.salonId,
        },

        skip: !currentUser?.salonId,

        fetchPolicy: 'network-only',
    });

    /**
     * Load business hours from backend
     */
    useEffect(() => {
        if (data?.getSalon?.businessHours) {
            const backendHours =
                data.getSalon.businessHours;

            setHours({
                ...DEFAULT_HOURS,

                ...backendHours,

                MONDAY: {
                    ...DEFAULT_HOURS.MONDAY,
                    ...(backendHours.MONDAY || {}),
                },

                TUESDAY: {
                    ...DEFAULT_HOURS.TUESDAY,
                    ...(backendHours.TUESDAY || {}),
                },

                WEDNESDAY: {
                    ...DEFAULT_HOURS.WEDNESDAY,
                    ...(backendHours.WEDNESDAY || {}),
                },

                THURSDAY: {
                    ...DEFAULT_HOURS.THURSDAY,
                    ...(backendHours.THURSDAY || {}),
                },

                FRIDAY: {
                    ...DEFAULT_HOURS.FRIDAY,
                    ...(backendHours.FRIDAY || {}),
                },

                SATURDAY: {
                    ...DEFAULT_HOURS.SATURDAY,
                    ...(backendHours.SATURDAY || {}),
                },

                SUNDAY: {
                    ...DEFAULT_HOURS.SUNDAY,
                    ...(backendHours.SUNDAY || {}),
                },
            });
        }
    }, [data]);

    /**
     * Optional fallback from currentUser
     */
    useEffect(() => {
        const existingHours =
            (currentUser as any)?.businessHours;

        if (!data?.getSalon?.businessHours && existingHours) {
            setHours({
                ...DEFAULT_HOURS,

                ...existingHours,

                MONDAY: {
                    ...DEFAULT_HOURS.MONDAY,
                    ...(existingHours.MONDAY || {}),
                },

                TUESDAY: {
                    ...DEFAULT_HOURS.TUESDAY,
                    ...(existingHours.TUESDAY || {}),
                },

                WEDNESDAY: {
                    ...DEFAULT_HOURS.WEDNESDAY,
                    ...(existingHours.WEDNESDAY || {}),
                },

                THURSDAY: {
                    ...DEFAULT_HOURS.THURSDAY,
                    ...(existingHours.THURSDAY || {}),
                },

                FRIDAY: {
                    ...DEFAULT_HOURS.FRIDAY,
                    ...(existingHours.FRIDAY || {}),
                },

                SATURDAY: {
                    ...DEFAULT_HOURS.SATURDAY,
                    ...(existingHours.SATURDAY || {}),
                },

                SUNDAY: {
                    ...DEFAULT_HOURS.SUNDAY,
                    ...(existingHours.SUNDAY || {}),
                },
            });
        }
    }, [currentUser, data]);

    /**
     * Toggle day open/closed
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
     * User selected time
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
     * Close picker
     */
    const handleTimeCancel = () => {
        setPicker(null);
    };

    /**
     * Validate hours
     */
    const validateHours = (): boolean => {
        for (const day of DAYS) {
            const value = hours[day.key];

            /**
             * Closed day doesn't need validation
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
     * Save business hours
     */
    const handleSave = async () => {
        if (!currentUser?.salonId) {
            Alert.alert(
                'Error',
                'Salon ID not found.'
            );

            return;
        }

        if (!validateHours()) {
            return;
        }

        try {
            setLoading(true);

            console.log(
                '======================================'
            );

            console.log(
                'SAVING BUSINESS HOURS'
            );

            console.log(
                JSON.stringify(
                    hours,
                    null,
                    2
                )
            );

            console.log(
                'Salon ID:',
                currentUser.salonId
            );

            console.log(
                '======================================'
            );

            const result =
                await updateBusinessHours({
                    variables: {
                        input: {
                            salonId:
                                currentUser.salonId,

                            businessHours: hours,
                        },
                    },
                });

            console.log(
                'Business hours response:',
                result.data
            );

            const response =
                result.data?.updateBusinessHours;

            if (!response?.success) {
                Alert.alert(
                    'Unable to Save',
                    response?.message ||
                    'Could not update business hours.'
                );

                return;
            }

            Alert.alert(
                'Saved',
                'Business hours updated successfully.',
                [
                    {
                        text: 'OK',

                        onPress: () =>
                            navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error(
                'SAVE BUSINESS HOURS ERROR:',
                error
            );

            Alert.alert(
                'Error',
                error?.message ||
                'Something went wrong while saving.'
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Currently selected picker value
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
                contentContainerStyle={
                    styles.content
                }
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.goBack()
                        }
                        style={styles.backButton}
                    >
                        <Text
                            style={styles.back}
                        >
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <View
                        style={styles.headerText}
                    >
                        <Text
                            style={styles.title}
                        >
                            Business Hours
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Set your salon's weekly
                            operating hours
                        </Text>
                    </View>
                </View>

                {/* LOADING */}

                {loadingSalon ? (
                    <View
                        style={
                            styles.loadingContainer
                        }
                    >
                        <ActivityIndicator
                            size="small"
                            color="#008060"
                        />

                        <Text
                            style={
                                styles.loadingText
                            }
                        >
                            Loading business hours...
                        </Text>
                    </View>
                ) : null}

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
                                    DAYS.length -
                                    1 &&
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

                                {/* OPEN */}

                                {value.isOpen ? (
                                    <View
                                        style={
                                            styles.timeRow
                                        }
                                    >
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

                                        {/* CLOSE */}

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

                {/* SAVE */}

                <TouchableOpacity
                    style={[
                        styles.saveButton,

                        loading &&
                        styles.saveButtonDisabled,
                    ]}
                    disabled={loading}
                    onPress={handleSave}
                >
                    {loading ? (
                        <ActivityIndicator
                            color="#FFFFFF"
                        />
                    ) : (
                        <Text
                            style={
                                styles.saveText
                            }
                        >
                            Save Changes
                        </Text>
                    )}
                </TouchableOpacity>

                <View
                    style={{
                        height: 30,
                    }}
                />
            </ScrollView>

            {/* ================================================= */}
            {/* TIME PICKER                                      */}
            {/* ================================================= */}

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
                onConfirm={
                    handleTimeConfirm
                }
                onCancel={
                    handleTimeCancel
                }
            />
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F6F8F8',
    },

    content: {
        padding: 16,
    },

    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: 20,
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },

    back: {
        fontSize: 38,
        color: '#111',
        lineHeight: 40,
    },

    headerText: {
        flex: 1,
        marginLeft: 4,
    },

    title: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: '#111',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 13,
        color: '#777',
    },

    loadingContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginBottom: 12,
    },

    loadingText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#777',
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
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent:
            'space-between' as const,
    },

    dayName: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: '#222',
    },

    timeRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
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
        fontWeight: '700' as const,
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
        fontWeight: '600' as const,
    },

    saveButton: {
        marginTop: 20,

        height: 52,

        borderRadius: 14,

        backgroundColor: '#008060',

        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },

    saveButtonDisabled: {
        opacity: 0.6,
    },

    saveText: {
        color: '#FFFFFF',

        fontSize: 16,

        fontWeight: '700' as const,
    },
};

