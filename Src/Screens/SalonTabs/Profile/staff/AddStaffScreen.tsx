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
import { useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { useUser } from '../../../../context/UserContext';
import { CREATE_STAFF } from '../../../../graphql/queries';


type CreateStaffResponse = {
    createStaff: {
        success: boolean;
        message: string;
        staff?: {
            staffId: string;
            salonId: string;
            name: string;
            phoneNumber: string;
            email?: string | null;
            gender?: string | null;
            specializations: string[];
            isActive: boolean;
        } | null;
    };
};

type CreateStaffVariables = {
    input: {
        salonId: string;
        name: string;
        phoneNumber: string;
        email?: string;
        gender?: string;
        specializations: string[];
        workingHours: {
            MONDAY: {
                open: string;
                close: string;
                isWorking: boolean;
            };
            TUESDAY: {
                open: string;
                close: string;
                isWorking: boolean;
            };
            WEDNESDAY: {
                open: string;
                close: string;
                isWorking: boolean;
            };
            THURSDAY: {
                open: string;
                close: string;
                isWorking: boolean;
            };
            FRIDAY: {
                open: string;
                close: string;
                isWorking: boolean;
            };
            SATURDAY: {
                open: string;
                close: string;
                isWorking: boolean;
            };
            SUNDAY: {
                open: string;
                close: string;
                isWorking: boolean;
            };
        };
    };
};

const defaultWorkingHours = {
    MONDAY: {
        open: '10:00',
        close: '20:00',
        isWorking: true,
    },

    TUESDAY: {
        open: '10:00',
        close: '20:00',
        isWorking: true,
    },

    WEDNESDAY: {
        open: '10:00',
        close: '20:00',
        isWorking: true,
    },

    THURSDAY: {
        open: '10:00',
        close: '20:00',
        isWorking: true,
    },

    FRIDAY: {
        open: '10:00',
        close: '20:00',
        isWorking: true,
    },

    SATURDAY: {
        open: '10:00',
        close: '20:00',
        isWorking: true,
    },

    SUNDAY: {
        open: '10:00',
        close: '20:00',
        isWorking: false,
    },
};

const SPECIALIZATIONS = [
    'Haircut',
    'Hair Styling',
    'Beard',
    'Facial',
    'Hair Spa',
    'Makeup',
    'Manicure',
    'Pedicure',
    'Waxing',
    'Massage',
];

export default function AddStaffScreen() {
    const navigation = useNavigation();

    const { currentUser } = useUser();

    const salonId = currentUser?.salonId;

    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');

    const [gender, setGender] = useState<
        'MEN' | 'WOMEN' | 'UNISEX'
    >('UNISEX');

    const [specializations, setSpecializations] =
        useState<string[]>([]);

    const [workingHours] = useState(
        defaultWorkingHours,
    );

    const [createStaff, { loading }] = useMutation<
        CreateStaffResponse,
        CreateStaffVariables
    >(CREATE_STAFF);

    const toggleSpecialization = (
        value: string,
    ) => {
        setSpecializations(previous => {
            if (previous.includes(value)) {
                return previous.filter(
                    item => item !== value,
                );
            }

            return [...previous, value];
        });
    };

    const validate = () => {
        if (!salonId) {
            Alert.alert(
                'Error',
                'Your account is not linked to a salon.',
            );

            return false;
        }

        if (!name.trim()) {
            Alert.alert(
                'Missing Information',
                'Please enter staff name.',
            );

            return false;
        }

        if (!phoneNumber.trim()) {
            Alert.alert(
                'Missing Information',
                'Please enter phone number.',
            );

            return false;
        }

        if (phoneNumber.trim().length < 10) {
            Alert.alert(
                'Invalid Phone',
                'Please enter a valid phone number.',
            );

            return false;
        }

        if (specializations.length === 0) {
            Alert.alert(
                'Specialization Required',
                'Please select at least one specialization.',
            );

            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        try {
            const result = await createStaff({
                variables: {
                    input: {
                        salonId: salonId!,
                        name: name.trim(),
                        phoneNumber: phoneNumber.trim(),
                        email: email.trim()
                            ? email.trim()
                            : undefined,
                        gender,
                        specializations,
                        workingHours,
                    },
                },
            });

            const response =
                result.data?.createStaff;

            if (!response?.success) {
                Alert.alert(
                    'Unable to Add Staff',
                    response?.message ||
                    'Something went wrong.',
                );

                return;
            }

            Alert.alert(
                'Staff Added',
                `${name} has been added successfully.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.goBack();
                        },
                    },
                ],
            );
        } catch (error: any) {
            console.error(
                'Create staff error:',
                error,
            );

            Alert.alert(
                'Error',
                error?.message ||
                'Unable to create staff.',
            );
        }
    };

    if (!salonId) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorTitle}>
                        Salon not found
                    </Text>

                    <Text style={styles.errorText}>
                        Your account is not linked to a salon.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>

                <Text style={styles.title}>
                    Add Staff
                </Text>

                <Text style={styles.subtitle}>
                    Add a team member to your salon
                </Text>

                {/* Name */}

                <Text style={styles.label}>
                    Staff Name *
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter staff name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                />

                {/* Phone */}

                <Text style={styles.label}>
                    Phone Number *
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                />

                {/* Email */}

                <Text style={styles.label}>
                    Email
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Gender */}

                <Text style={styles.label}>
                    Gender
                </Text>

                <View style={styles.optionRow}>

                    {[
                        {
                            label: 'Men',
                            value: 'MEN',
                        },
                        {
                            label: 'Women',
                            value: 'WOMEN',
                        },
                        {
                            label: 'Unisex',
                            value: 'UNISEX',
                        },
                    ].map(option => {
                        const selected =
                            gender === option.value;

                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionButton,
                                    selected &&
                                    styles.selectedOption,
                                ]}
                                onPress={() =>
                                    setGender(
                                        option.value as
                                        | 'MEN'
                                        | 'WOMEN'
                                        | 'UNISEX',
                                    )
                                }>

                                <Text
                                    style={[
                                        styles.optionText,
                                        selected &&
                                        styles.selectedOptionText,
                                    ]}>
                                    {option.label}
                                </Text>

                            </TouchableOpacity>
                        );
                    })}

                </View>

                {/* Specializations */}

                <Text style={styles.label}>
                    Specializations *
                </Text>

                <View style={styles.specializationGrid}>

                    {SPECIALIZATIONS.map(item => {
                        const selected =
                            specializations.includes(item);

                        return (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.specializationButton,
                                    selected &&
                                    styles.selectedSpecialization,
                                ]}
                                onPress={() =>
                                    toggleSpecialization(item)
                                }>

                                <Text
                                    style={[
                                        styles.specializationText,
                                        selected &&
                                        styles.selectedSpecializationText,
                                    ]}>
                                    {selected
                                        ? '✓ '
                                        : ''}
                                    {item}
                                </Text>

                            </TouchableOpacity>
                        );
                    })}

                </View>

                {/* Working Hours */}

                <Text style={styles.label}>
                    Working Hours
                </Text>

                <View style={styles.hoursCard}>

                    {Object.entries(workingHours).map(
                        ([day, hours]) => (
                            <View
                                key={day}
                                style={styles.dayRow}>

                                <Text style={styles.dayText}>
                                    {day.substring(0, 3)}
                                </Text>

                                <Text
                                    style={[
                                        styles.hoursText,
                                        !hours.isWorking &&
                                        styles.closedText,
                                    ]}>

                                    {hours.isWorking
                                        ? `${hours.open} - ${hours.close}`
                                        : 'Closed'}

                                </Text>

                            </View>
                        ),
                    )}

                </View>

                {/* Save */}

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        loading &&
                        styles.disabledButton,
                    ]}
                    disabled={loading}
                    onPress={handleSave}>

                    {loading ? (
                        <ActivityIndicator
                            color="#FFF"
                        />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            Save Staff
                        </Text>
                    )}

                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}