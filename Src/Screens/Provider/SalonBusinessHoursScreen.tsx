
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

const CURRENT_STEP = 3;
const NEXT_STEP = 4;

const DAYS: { key: DayKey; label: string }[] = [
    { key: 'MONDAY', label: 'Monday' },
    { key: 'TUESDAY', label: 'Tuesday' },
    { key: 'WEDNESDAY', label: 'Wednesday' },
    { key: 'THURSDAY', label: 'Thursday' },
    { key: 'FRIDAY', label: 'Friday' },
    { key: 'SATURDAY', label: 'Saturday' },
    { key: 'SUNDAY', label: 'Sunday' },
];

function parseTime(time: string): Date {
    const [hoursString, minutesString] = (time || '09:00').split(':');

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
    const [hourString, minuteString] = (time || '09:00').split(':');

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
    const {
        data,
        updateData,
        completedSteps,
        saveDraft,
        setCurrentStep,
        markStepCompleted,
    } = useSalonRegistration();

    const [hours, setHours] = useState<BusinessHours>(
        data.businessHours,
    );

    const [picker, setPicker] = useState<{
        day: DayKey;
        type: 'open' | 'close';
    } | null>(null);

    const [isSaving, setIsSaving] = useState(false);

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

    const handleNext = async () => {
        if (isSaving) {
            return;
        }

        const latestData = {
            businessHours: hours,
        };

        const nextCompletedSteps = Array.from(
            new Set([...(completedSteps || []), 1, 2, CURRENT_STEP]),
        ).sort((a, b) => a - b);

        setIsSaving(true);

        try {
            // Update the in-memory registration data first.
            updateData(latestData);

            // Mark business hours as completed and set the next step.
            markStepCompleted(CURRENT_STEP);
            setCurrentStep(NEXT_STEP);

            // Persist the latest hours with the next step so registration
            // can resume at Salon Services after the user logs in again.
            const saved = await saveDraft(
                NEXT_STEP,
                nextCompletedSteps,
                latestData,
            );

            if (saved === false) {
                setCurrentStep(CURRENT_STEP);

                Alert.alert(
                    'Unable to save progress',
                    'Your business hours could not be saved. Please check your connection and try again.',
                );

                return;
            }

            navigation.navigate('SalonServices', {
                initialStep: NEXT_STEP,
                completedSteps: nextCompletedSteps,
                registrationData: {
                    ...data,
                    ...latestData,
                },
            });
        } catch (error) {
            console.error(
                'Failed to save salon business hours draft:',
                error,
            );

            setCurrentStep(CURRENT_STEP);

            Alert.alert(
                'Unable to continue',
                'We could not save your registration progress. Please try again.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    const pickerDate = picker
        ? parseTime(hours[picker.day][picker.type])
        : new Date();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Text style={styles.back}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <Text style={styles.stepLabel}>
                            STEP 3 OF 6
                        </Text>

                        <Text style={styles.title}>
                            Business Hours
                        </Text>

                        <Text style={styles.subtitle}>
                            Set your weekly operating hours.
                        </Text>
                    </View>
                </View>

                {/* Progress */}
                <View
                    style={styles.progressTrack}
                    accessibilityLabel="Registration progress: step 3 of 6"
                >
                    <AppGradient
                        colors={[...GRADIENTS.SOFT_PURPLE]}
                        style={styles.progressFill}
                    >
                        <View style={styles.progressFillInner} />
                    </AppGradient>
                </View>

                {/* Intro */}
                <View style={styles.intro}>
                    <Text style={styles.introTitle}>
                        Your weekly schedule
                    </Text>

                    <Text style={styles.introDescription}>
                        Turn a day on or off and choose when your salon
                        opens and closes.
                    </Text>
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
                                    <View style={styles.dayTitleContainer}>
                                        <Text style={styles.dayName}>
                                            {day.label}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.dayStatus,
                                                value.isOpen
                                                    ? styles.dayStatusOpen
                                                    : styles.dayStatusClosed,
                                            ]}
                                        >
                                            {value.isOpen
                                                ? 'Open'
                                                : 'Closed'}
                                        </Text>
                                    </View>

                                    {/* Day toggle */}
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => toggleDay(day.key)}
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
                                                style={styles.switchGradient}
                                            >
                                                <View
                                                    style={
                                                        styles.switchGradientInner
                                                    }
                                                />
                                            </AppGradient>
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
                                            disabled={isSaving}
                                            activeOpacity={0.75}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Set ${day.label} opening time`}
                                        >
                                            <Text style={styles.timeLabel}>
                                                OPENS
                                            </Text>

                                            <Text style={styles.timeValue}>
                                                {displayTime(value.open)}
                                            </Text>

                                            <Text style={styles.editHint}>
                                                Change time
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={styles.timeSeparator}>
                                            <View
                                                style={styles.separatorLine}
                                            />
                                            <Text style={styles.separatorText}>
                                                TO
                                            </Text>
                                            <View
                                                style={styles.separatorLine}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.timeButton}
                                            onPress={() =>
                                                openTimePicker(
                                                    day.key,
                                                    'close',
                                                )
                                            }
                                            disabled={isSaving}
                                            activeOpacity={0.75}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Set ${day.label} closing time`}
                                        >
                                            <Text style={styles.timeLabel}>
                                                CLOSES
                                            </Text>

                                            <Text style={styles.timeValue}>
                                                {displayTime(value.close)}
                                            </Text>

                                            <Text style={styles.editHint}>
                                                Change time
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.closedLabel}>
                                        This day is marked as a day off.
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>ⓘ</Text>

                    <Text style={styles.infoText}>
                        You can update your operating hours later.
                        Your changes are saved with your registration
                        progress when you continue.
                    </Text>
                </View>

                {/* Continue */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="Save business hours and continue to salon services"
                    style={styles.continueTouchable}
                >
                    <AppGradient
                        colors={[...GRADIENTS.SOFT_PURPLE]}
                        style={[
                            styles.button,
                            isSaving && styles.buttonDisabled,
                        ]}
                    >
                        {isSaving ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator
                                    size="small"
                                    color={COLORS.white}
                                />

                                <Text style={styles.buttonText}>
                                    Saving progress...
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>
                                    Save & Continue
                                </Text>

                                <Text style={styles.buttonArrow}>
                                    →
                                </Text>
                            </View>
                        )}
                    </AppGradient>
                </TouchableOpacity>

                <Text style={styles.footerNote}>
                    Your registration progress will be saved before
                    moving to the next step.
                </Text>
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
        marginBottom: SPACING.medium,
        paddingVertical: SPACING.small,
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: SPACING.small,
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

    stepLabel: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary || '#8B5CF6',
        letterSpacing: 1.2,
        marginBottom: 4,
        fontWeight: '700' as const,
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

    progressTrack: {
        height: 5,
        width: '100%' as const,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden' as const,
        marginBottom: SPACING.xl,
    },

    progressFill: {
        height: '100%' as const,
        width: '50%' as const,
        borderRadius: 4,
        overflow: 'hidden' as const,
    },

    progressFillInner: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    intro: {
        marginBottom: SPACING.large,
    },

    introTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.body,
        color: COLORS.text,
        fontWeight: '700' as const,
        marginBottom: 5,
    },

    introDescription: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.small,
        lineHeight: FONT_SIZES.small + 6,
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

    dayTitleContainer: {
        flex: 1,
    },

    dayName: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.body,
        color: COLORS.text,
        fontWeight: '600' as const,
    },

    dayStatus: {
        marginTop: 3,
        fontFamily: FONTS.medium || FONTS.regular,
        fontSize: FONT_SIZES.xs,
    },

    dayStatusOpen: {
        color: '#7C3AED',
    },

    dayStatusClosed: {
        color: COLORS.textMuted,
    },

    timeRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginTop: SPACING.medium,
    },

    timeButton: {
        flex: 1,
        minWidth: 0,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.medium,
        padding: SPACING.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    timeLabel: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginBottom: 7,
        letterSpacing: 0.7,
    },

    timeValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.small,
        fontWeight: '700' as const,
        color: COLORS.text,
    },

    editHint: {
        marginTop: 5,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },

    timeSeparator: {
        width: 30,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingHorizontal: 3,
    },

    separatorLine: {
        width: 8,
        height: 1,
        backgroundColor: COLORS.borderStrong,
    },

    separatorText: {
        fontFamily: FONTS.semiBold,
        fontSize: 8,
        color: COLORS.textMuted,
        marginVertical: 3,
    },

    closedLabel: {
        marginTop: SPACING.small,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.small,
        lineHeight: FONT_SIZES.small + 5,
        color: COLORS.textMuted,
    },

    customSwitch: {
        width: 44,
        height: 26,
        borderRadius: 13,
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
        borderRadius: 13,
    },

    switchGradientInner: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        position: 'absolute' as const,
        top: 3,
        elevation: 2,
    },

    switchThumbOn: {
        right: 3,
    },

    switchThumbOff: {
        left: 3,
    },

    infoRow: {
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        marginTop: SPACING.large,
        paddingHorizontal: 2,
    },

    infoIcon: {
        fontSize: FONT_SIZES.body,
        color: '#8B5CF6',
        marginRight: SPACING.small,
    },

    infoText: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        lineHeight: FONT_SIZES.xs + 6,
        color: COLORS.textSecondary,
    },

    continueTouchable: {
        marginTop: SPACING.xl,
    },

    button: {
        minHeight: 54,
        borderRadius: RADIUS.medium,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        overflow: 'hidden' as const,
        paddingHorizontal: SPACING.large,
    },

    buttonDisabled: {
        opacity: 0.8,
    },

    buttonContent: {
        width: '100%' as const,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },

    buttonText: {
        color: COLORS.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.body,
        fontWeight: '700' as const,
    },

    buttonArrow: {
        position: 'absolute' as const,
        right: 2,
        color: COLORS.white,
        fontSize: 24,
        lineHeight: 28,
    },

    loadingRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: SPACING.small,
    },

    footerNote: {
        marginTop: SPACING.medium,
        textAlign: 'center' as const,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        lineHeight: FONT_SIZES.xs + 5,
        color: COLORS.textMuted,
    },
};
