import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@apollo/client';
import { UPDATE_STAFF } from '../../../../graphql/queries';
import styles from './styles';
type StaffBusinessDay = {
    open: string;
    close: string;
    isWorking: boolean;
};
type StaffWorkingHours = {
    MONDAY: StaffBusinessDay;
    TUESDAY: StaffBusinessDay;
    WEDNESDAY: StaffBusinessDay;
    THURSDAY: StaffBusinessDay;
    FRIDAY: StaffBusinessDay;
    SATURDAY: StaffBusinessDay;
    SUNDAY: StaffBusinessDay;
};
type Staff = {
    staffId: string;
    salonId: string;
    name: string;
    phoneNumber: string;
    email?: string | null;
    gender?: string | null;
    profileImageUrl?: string | null;
    specializations: string[];
    workingHours: StaffWorkingHours;
    isActive: boolean;
};
type UpdateStaffResponse = {
    updateStaff: {
        success: boolean;
        message: string;
        staff?: Staff | null;
    };
};
type UpdateStaffVariables = {
    input: {
        salonId: string;
        staffId: string;
        name?: string;
        phoneNumber?: string;
        email?: string;
        gender?: string;
        profileImageUrl?: string;
        specializations?: string[];
        workingHours?: StaffWorkingHours;
        isActive?: boolean;
    };
};
type RouteParams = {
    staff: Staff;
};
const DAYS = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
] as const;
export default function EditStaffScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { staff } = route.params as RouteParams;
    const [name, setName] = useState(staff.name);
    const [phoneNumber, setPhoneNumber] = useState(
        staff.phoneNumber,
    );
    const [email, setEmail] = useState(
        staff.email ?? '',
    );
    const [gender, setGender] = useState(
        staff.gender ?? '',
    );
    const [specializations, setSpecializations] = useState(
        staff.specializations?.join(', ') ?? '',
    );
    const [workingHours, setWorkingHours] =
        useState<StaffWorkingHours>(
            staff.workingHours,
        );
    const [updateStaff, { loading }] =
        useMutation<
            UpdateStaffResponse,
            UpdateStaffVariables
        >(UPDATE_STAFF);
    const updateWorkingDay = (
        day: keyof StaffWorkingHours,
        field: keyof StaffBusinessDay,
        value: string | boolean,
    ) => {
        setWorkingHours(previous => ({
            ...previous,
            [day]: {
                ...previous[day],
                [field]: value,
            },
        }));
    };
    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(
                'Validation',
                'Please enter staff name.',
            );
            return;
        }

        if (!phoneNumber.trim()) {
            Alert.alert(
                'Validation',
                'Please enter phone number.',
            );
            return;
        }

        try {
            const cleanWorkingHours = {
                MONDAY: {
                    open: workingHours.MONDAY.open,
                    close: workingHours.MONDAY.close,
                    isWorking: workingHours.MONDAY.isWorking,
                },
                TUESDAY: {
                    open: workingHours.TUESDAY.open,
                    close: workingHours.TUESDAY.close,
                    isWorking: workingHours.TUESDAY.isWorking,
                },
                WEDNESDAY: {
                    open: workingHours.WEDNESDAY.open,
                    close: workingHours.WEDNESDAY.close,
                    isWorking: workingHours.WEDNESDAY.isWorking,
                },
                THURSDAY: {
                    open: workingHours.THURSDAY.open,
                    close: workingHours.THURSDAY.close,
                    isWorking: workingHours.THURSDAY.isWorking,
                },
                FRIDAY: {
                    open: workingHours.FRIDAY.open,
                    close: workingHours.FRIDAY.close,
                    isWorking: workingHours.FRIDAY.isWorking,
                },
                SATURDAY: {
                    open: workingHours.SATURDAY.open,
                    close: workingHours.SATURDAY.close,
                    isWorking: workingHours.SATURDAY.isWorking,
                },
                SUNDAY: {
                    open: workingHours.SUNDAY.open,
                    close: workingHours.SUNDAY.close,
                    isWorking: workingHours.SUNDAY.isWorking,
                },
            };

            const input = {
                salonId: staff.salonId,
                staffId: staff.staffId,
                name: name.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim() || undefined,
                gender: gender || undefined,

                specializations: specializations
                    .split(',')
                    .map(item => item.trim())
                    .filter(Boolean),

                workingHours: cleanWorkingHours,
            };

            console.log(
                '========== UPDATE STAFF INPUTS =========='
            );

            console.log(
                JSON.stringify(input, null, 2)
            );

            console.log(
                '========================================='
            );

            const result = await updateStaff({
                variables: {
                    input,
                },
            });

            if (result.data?.updateStaff.success) {
                Alert.alert(
                    'Success',
                    'Staff updated successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ],
                );
            } else {
                Alert.alert(
                    'Error',
                    result.data?.updateStaff.message ||
                    'Unable to update staff.',
                );
            }
        } catch (error) {
            console.error(
                'Update staff error:',
                error,
            );

            Alert.alert(
                'Error',
                'Unable to update staff.',
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.content
                }>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.goBack()
                        }>
                        <Text style={styles.back}>
                            ←
                        </Text>
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>
                            Edit Staff
                        </Text>
                        <Text style={styles.subtitle}>
                            Update staff information
                        </Text>
                    </View>
                </View>
                {/* Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Name
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Staff name"
                        style={styles.input}
                    />
                </View>
                {/* Phone */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Phone Number
                    </Text>
                    <TextInput
                        value={phoneNumber}
                        onChangeText={
                            setPhoneNumber
                        }
                        placeholder="Phone number"
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                </View>
                {/* Email */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Email
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                    />
                </View>
                {/* Gender */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Gender
                    </Text>
                    <View style={styles.genderRow}>
                        {[
                            'MALE',
                            'FEMALE',
                            'OTHER',
                        ].map(item => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.genderButton,
                                    gender === item &&
                                    styles.genderButtonSelected,
                                ]}
                                onPress={() =>
                                    setGender(item)
                                }>
                                <Text
                                    style={[
                                        styles.genderText,
                                        gender === item &&
                                        styles.genderTextSelected,
                                    ]}>
                                    {item}
                                </Text>

                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                {/* Specializations */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Specializations
                    </Text>
                    <TextInput
                        value={
                            specializations
                        }
                        onChangeText={
                            setSpecializations
                        }
                        placeholder="Hair Styling, Hair Coloring"
                        style={styles.input}
                    />
                    <Text
                        style={
                            styles.helperText
                        }>
                        Separate multiple
                        specializations with commas.
                    </Text>
                </View>
                {/* Working Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Working Hours
                    </Text>
                    {DAYS.map(day => {
                        const hours =
                            workingHours[day];
                        return (
                            <View
                                key={day}
                                style={
                                    styles.dayCard
                                }>
                                <View
                                    style={
                                        styles.dayHeader
                                    }>
                                    <Text
                                        style={
                                            styles.dayName
                                        }>
                                        {day}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            updateWorkingDay(
                                                day,
                                                'isWorking',
                                                !hours.isWorking,
                                            )
                                        }>
                                        <Text
                                            style={
                                                styles.workingText
                                            }>
                                            {hours.isWorking
                                                ? 'Working'
                                                : 'Off'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {hours.isWorking && (
                                    <View
                                        style={
                                            styles.timeRow
                                        }>
                                        <TextInput
                                            value={
                                                hours.open
                                            }
                                            onChangeText={value =>
                                                updateWorkingDay(
                                                    day,
                                                    'open',
                                                    value,
                                                )
                                            }
                                            placeholder="09:00"
                                            style={
                                                styles.timeInput
                                            }
                                        />
                                        <Text
                                            style={
                                                styles.toText
                                            }>
                                            to
                                        </Text>
                                        <TextInput
                                            value={
                                                hours.close
                                            }
                                            onChangeText={value =>
                                                updateWorkingDay(
                                                    day,
                                                    'close',
                                                    value,
                                                )
                                            }
                                            placeholder="18:00"
                                            style={
                                                styles.timeInput
                                            }
                                        />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
                {/* Save */}
                <TouchableOpacity
                    style={
                        styles.primaryButton
                    }
                    onPress={handleSave}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator
                            color="#fff"
                        />
                    ) : (
                        <Text
                            style={
                                styles.primaryButtonText
                            }>
                            Save Changes
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}