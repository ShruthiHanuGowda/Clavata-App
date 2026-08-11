import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../context/UserContext';

const PRIMARY = '#009D94';

export default function EditProfile() {
    const navigation = useNavigation<any>();
    const { currentUser, setCurrentUser } = useUser();

    const [fullName, setFullName] = useState(currentUser?.fullName || '');

    const handleSave = () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Please enter your name.');
            return;
        }

        // Temporary local update.
        // Later we will replace this with updateUser GraphQL API.
        if (currentUser) {
            setCurrentUser({
                ...currentUser,
                fullName: fullName.trim(),
            });
        }

        Alert.alert('Success', 'Profile updated successfully.', [
            {
                text: 'OK',
                onPress: () => navigation.goBack(),
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <View style={styles.headerRight} />
            </View>

            <View style={styles.content}>
                {/* Profile Photo */}
                <View style={styles.photoSection}>
                    <View style={styles.avatar}>
                        {currentUser?.profileImageUrl ? (
                            <Image
                                source={{ uri: currentUser.profileImageUrl }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity style={styles.changePhotoButton}>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Full Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Full Name</Text>

                    <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        autoCapitalize="words"
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.field}>
                    <Text style={styles.label}>Phone Number</Text>

                    <TextInput
                        value={currentUser?.phoneNumber || ''}
                        editable={false}
                        style={[styles.input, styles.disabledInput]}
                    />

                    <Text style={styles.helperText}>
                        Phone number cannot be changed.
                    </Text>
                </View>

                {/* Save */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    activeOpacity={0.8}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    header: {
        height: 60,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },

    backText: {
        fontSize: 38,
        color: '#111827',
        lineHeight: 40,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    headerRight: {
        width: 40,
    },

    content: {
        padding: 20,
    },

    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },

    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    avatarImage: {
        width: '100%',
        height: '100%',
    },

    avatarText: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: '700',
    },

    changePhotoButton: {
        marginTop: 12,
    },

    changePhotoText: {
        color: PRIMARY,
        fontSize: 15,
        fontWeight: '600',
    },

    field: {
        marginBottom: 22,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },

    input: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#111827',
    },

    disabledInput: {
        backgroundColor: '#F0F1F3',
        color: '#6B7280',
    },

    helperText: {
        marginTop: 6,
        fontSize: 12,
        color: '#9CA3AF',
    },

    saveButton: {
        height: 52,
        backgroundColor: PRIMARY,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

