import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Modal from 'react-native-modal';
import {
    check,
    request,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';
import { reverseGeocode } from '../../../services/locationService';

const PRIMARY = '#008060';

type Props = {
    visible: boolean;
    onClose: () => void;
    onLocationSelected: (location: any) => void;
};

const recentLocations = [
    'Whitefield',
    'Marathahalli',
    'Indiranagar',
    'Koramangala',
];

const savedLocations = [
    {
        title: 'Home',
        address: 'Whitefield, Bangalore',
    },
    {
        title: 'Office',
        address: 'ITPL Main Road',
    },
];

export default function LocationBottomSheet({
    visible,
    onClose,
    onLocationSelected,
}: Props) {
    const [search, setSearch] = useState('');
    const [detectedLocation, setDetectedLocation] = useState<any>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const getCurrentLocation = () => {
        setLoadingLocation(true);

        Geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const result = await reverseGeocode(
                        position.coords.latitude,
                        position.coords.longitude,
                    );

                    console.log(result);

                    setDetectedLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: result?.display_name,
                    });
                } finally {
                    setLoadingLocation(false);
                }
            },
            (error) => {
                setLoadingLocation(false);
                Alert.alert('Location Error', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
            },
        );
    };
    const requestLocationPermission = async () => {
        const permission =
            Platform.OS === 'android'
                ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        let status = await check(permission);

        if (status !== RESULTS.GRANTED) {
            status = await request(permission);
        }

        if (status === RESULTS.GRANTED) {
            getCurrentLocation();
        } else {
            Alert.alert(
                'Permission Required',
                'Please allow location access.',
            );
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            swipeDirection="down"
            onSwipeComplete={onClose}
            style={styles.modal}
        >
            <View style={styles.sheet}>
                <View style={styles.handle} />

                <Text style={styles.title}>
                    Choose your location
                </Text>

                <TextInput
                    placeholder="Search area, street or pincode"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.search}
                />

                <TouchableOpacity
                    style={styles.currentLocation}
                    onPress={requestLocationPermission}
                >
                    <Text style={styles.currentTitle}>
                        📍 Use Current Location
                    </Text>

                    <Text style={styles.subtitle}>
                        Find salons near you
                    </Text>
                </TouchableOpacity>

                {loadingLocation && (
                    <Text
                        style={{
                            marginTop: 15,
                            textAlign: 'center',
                            color: '#666',
                        }}
                    >
                        Detecting your location...
                    </Text>
                )}

                {detectedLocation && (
                    <View
                        style={{
                            marginTop: 20,
                            padding: 15,
                            borderRadius: 12,
                            backgroundColor: '#F5FCF8',
                            borderWidth: 1,
                            borderColor: '#D8F3E5',
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: '700',
                                fontSize: 16,
                                color: PRIMARY,
                            }}
                        >
                            📍 Detected Location
                        </Text>

                        <Text
                            style={{
                                marginTop: 8,
                                color: '#444',
                                lineHeight: 22,
                            }}
                        >
                            {detectedLocation.address}
                        </Text>

                        <TouchableOpacity
                            style={{
                                marginTop: 15,
                                backgroundColor: PRIMARY,
                                paddingVertical: 14,
                                borderRadius: 12,
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                console.log('Selected Location', detectedLocation);
                                 onLocationSelected(detectedLocation);
                                // Later:
                                // 1. Update Home Header
                                // 2. Save to AsyncStorage
                                // 3. Call getNearbySalons()
                                onClose();
                            }}
                        >
                            <Text
                                style={{
                                    color: '#FFF',
                                    fontWeight: '700',
                                    fontSize: 16,
                                }}
                            >
                                Use this location
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.section}>
                    Saved Locations
                </Text>

                {savedLocations.map(item => (
                    <TouchableOpacity
                        key={item.title}
                        style={styles.row}
                    >
                        <Text style={styles.rowTitle}>
                            {item.title}
                        </Text>

                        <Text style={styles.rowSub}>
                            {item.address}
                        </Text>
                    </TouchableOpacity>
                ))}

                <Text style={styles.section}>
                    Recent Searches
                </Text>

                {recentLocations.map(item => (
                    <TouchableOpacity
                        key={item}
                        style={styles.row}
                    >
                        <Text style={styles.rowTitle}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },

    sheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
    },

    handle: {
        width: 50,
        height: 5,
        backgroundColor: '#DDD',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
    },

    search: {
        marginTop: 20,
        backgroundColor: '#F4F4F4',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
    },

    currentLocation: {
        marginTop: 20,
        backgroundColor: '#F5FCF8',
        padding: 18,
        borderRadius: 14,
    },

    currentTitle: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 16,
    },

    subtitle: {
        color: '#666',
        marginTop: 5,
    },

    section: {
        marginTop: 25,
        marginBottom: 10,
        fontWeight: '700',
        fontSize: 18,
    },

    row: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },

    rowTitle: {
        fontWeight: '600',
        fontSize: 16,
    },

    rowSub: {
        color: '#777',
        marginTop: 4,
    },
});