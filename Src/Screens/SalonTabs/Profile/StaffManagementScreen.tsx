import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@apollo/client';
import styles from './styles';
import { useUser } from '../../../context/UserContext';
import { LIST_STAFF, UPDATE_STAFF } from '../../../graphql/queries';

type Staff = {
    staffId: string;
    salonId: string;
    name: string;
    phoneNumber: string;
    email?: string | null;
    gender?: string | null;
    profileImageUrl?: string | null;
    specializations: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type ListStaffResponse = {
    listStaff: Staff[];
};

type ListStaffVariables = {
    salonId: string;
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
        isActive: boolean;
    };
};

export default function StaffManagementScreen() {
    const navigation = useNavigation<any>();
    const { currentUser } = useUser();
    const salonId = currentUser?.salonId;
    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<ListStaffResponse, ListStaffVariables>(
        LIST_STAFF,
        {
            variables: {
                salonId: salonId as string,
            },
            skip: !salonId,
            fetchPolicy: 'cache-and-network',
        },
    );

    const [updateStaff, { loading: updating }] = useMutation<
        UpdateStaffResponse,
        UpdateStaffVariables
    >(UPDATE_STAFF);

    const staff = data?.listStaff ?? [];

    const handleDisableStaff = (member: Staff) => {
        const newStatus = !member.isActive;

        Alert.alert(
            newStatus ? 'Enable Staff' : 'Disable Staff',
            newStatus
                ? `Enable ${member.name}?`
                : `Disable ${member.name}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: newStatus ? 'Enable' : 'Disable',
                    style: newStatus ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            const result = await updateStaff({
                                variables: {
                                    input: {
                                        salonId: salonId!,
                                        staffId: member.staffId,
                                        isActive: newStatus,
                                    },
                                },
                            });

                            if (
                                result.data?.updateStaff.success
                            ) {
                                await refetch();
                            } else {
                                Alert.alert(
                                    'Error',
                                    result.data?.updateStaff.message ||
                                    'Unable to update staff',
                                );
                            }
                        } catch (err) {
                            console.error(
                                'Update staff error:',
                                err,
                            );

                            Alert.alert(
                                'Error',
                                'Unable to update staff',
                            );
                        }
                    },
                },
            ],
        );
    };

    const handleAddStaff = () => {
        navigation.navigate('AddStaff');
    };

    const handleEditStaff = (member: Staff) => {
        navigation.navigate(
            'EditStaff' as never,
            {
                staff: member,
            } as never,
        );
    };

    if (!salonId) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyTitle}>
                        Salon not found
                    </Text>

                    <Text style={styles.emptyDescription}>
                        Your account is not linked to a salon yet.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loading && !data) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" />

                    <Text style={styles.loadingText}>
                        Loading staff...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyTitle}>
                        Unable to load staff
                    </Text>

                    <Text style={styles.emptyDescription}>
                        {error.message}
                    </Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => refetch()}>
                        <Text style={styles.primaryButtonText}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>

                {/* Header */}

                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>
                            Staff Management
                        </Text>

                        <Text style={styles.subtitle}>
                            Manage your salon team
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddStaff}
                        activeOpacity={0.8}>

                        <Text style={styles.addButtonText}>
                            + Add Staff
                        </Text>

                    </TouchableOpacity>
                </View>

                {/* Staff count */}

                <View style={styles.summaryCard}>
                    <View>
                        <Text style={styles.summaryLabel}>
                            Total Staff
                        </Text>

                        <Text style={styles.summaryValue}>
                            {staff.length}
                        </Text>
                    </View>

                    <View>
                        <Text style={styles.summaryLabel}>
                            Active
                        </Text>

                        <Text style={styles.summaryValue}>
                            {
                                staff.filter(
                                    item => item.isActive,
                                ).length
                            }
                        </Text>
                    </View>

                    <View>
                        <Text style={styles.summaryLabel}>
                            Inactive
                        </Text>

                        <Text style={styles.summaryValue}>
                            {
                                staff.filter(
                                    item => !item.isActive,
                                ).length
                            }
                        </Text>
                    </View>
                </View>

                {/* Staff list */}

                {staff.length === 0 ? (
                    <View style={styles.emptyContainer}>

                        <Text style={styles.emptyIcon}>
                            👥
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No staff added yet
                        </Text>

                        <Text style={styles.emptyDescription}>
                            Add your salon staff to manage their
                            availability and bookings.
                        </Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleAddStaff}>

                            <Text style={styles.primaryButtonText}>
                                + Add Staff
                            </Text>

                        </TouchableOpacity>

                    </View>
                ) : (
                    <View style={styles.staffList}>

                        {staff.map(member => (
                            <View
                                key={member.staffId}
                                style={styles.staffCard}>

                                <View style={styles.staffTopRow}>

                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {member.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Text>
                                    </View>

                                    <View style={styles.staffInfo}>

                                        <Text style={styles.staffName}>
                                            {member.name}
                                        </Text>

                                        <Text style={styles.staffPhone}>
                                            {member.phoneNumber}
                                        </Text>

                                        {member.email ? (
                                            <Text style={styles.staffEmail}>
                                                {member.email}
                                            </Text>
                                        ) : null}

                                    </View>

                                    <View
                                        style={[
                                            styles.statusBadge,
                                            member.isActive
                                                ? styles.activeBadge
                                                : styles.inactiveBadge,
                                        ]}>

                                        <View
                                            style={[
                                                styles.statusDot,
                                                member.isActive
                                                    ? styles.activeDot
                                                    : styles.inactiveDot,
                                            ]}
                                        />

                                        <Text
                                            style={[
                                                styles.statusText,
                                                member.isActive
                                                    ? styles.activeText
                                                    : styles.inactiveText,
                                            ]}>
                                            {member.isActive
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Text>

                                    </View>

                                </View>

                                {/* Specializations */}

                                {member.specializations?.length > 0 && (
                                    <View style={styles.specializationContainer}>

                                        {member.specializations.map(
                                            specialization => (
                                                <View
                                                    key={specialization}
                                                    style={styles.specializationTag}>

                                                    <Text
                                                        style={
                                                            styles.specializationText
                                                        }>
                                                        {specialization}
                                                    </Text>

                                                </View>
                                            ),
                                        )}

                                    </View>
                                )}

                                {/* Actions */}

                                <View style={styles.actionRow}>

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() =>
                                            handleEditStaff(member)
                                        }>

                                        <Text style={styles.editButtonText}>
                                            Edit
                                        </Text>

                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.disableButton,
                                            !member.isActive &&
                                            styles.enableButton,
                                        ]}
                                        disabled={updating}
                                        onPress={() =>
                                            handleDisableStaff(member)
                                        }>

                                        <Text
                                            style={[
                                                styles.disableButtonText,
                                                !member.isActive &&
                                                styles.enableButtonText,
                                            ]}>
                                            {member.isActive
                                                ? 'Disable'
                                                : 'Enable'}
                                        </Text>

                                    </TouchableOpacity>

                                </View>

                            </View>
                        ))}

                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}