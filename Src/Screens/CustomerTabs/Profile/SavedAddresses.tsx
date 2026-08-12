import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';

import {
    getSavedLocations,
    SavedLocation,
} from '../../../services/locationStorage';

const PRIMARY = '#009D94';

export default function SavedAddresses() {
    const navigation = useNavigation();

    const [savedLocations, setSavedLocations] =
        useState<SavedLocation[]>([]);

    const [loading, setLoading] =
        useState(true);

    // ============================================================
    // LOAD SAVED LOCATIONS
    // ============================================================

    const loadSavedLocations = useCallback(async () => {
        try {
            console.log('');
            console.log(
                '========================================',
            );
            console.log(
                '📍 SAVED ADDRESSES - LOAD',
            );
            console.log(
                '========================================',
            );

            setLoading(true);

            const locations =
                await getSavedLocations();

            console.log(
                '📦 Saved locations:',
                locations,
            );

            console.log(
                '📦 Saved locations count:',
                locations.length,
            );

            setSavedLocations(
                locations,
            );
        } catch (error) {
            console.log(
                '❌ Failed to load saved locations:',
                error,
            );

            Alert.alert(
                'Error',
                'Unable to load saved addresses.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================================
    // LOAD WHEN SCREEN COMES INTO FOCUS
    // ============================================================

    React.useEffect(() => {
        const unsubscribe =
            navigation.addListener(
                'focus',
                () => {
                    loadSavedLocations();
                },
            );

        return unsubscribe;
    }, [
        navigation,
        loadSavedLocations,
    ]);

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <View style={styles.container}>

            {/* HEADER */}

            <View style={styles.header}>

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                    style={styles.backButton}
                >
                    <Text style={styles.back}>
                        ←
                    </Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Saved Addresses
                </Text>

            </View>

            {/* CONTENT */}

            {loading ? (

                <View style={styles.loadingContainer}>

                    <ActivityIndicator
                        size="large"
                        color={PRIMARY}
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Loading saved addresses...
                    </Text>

                </View>

            ) : (

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.scrollContent
                    }
                >

                    {/* ================================================= */}
                    {/* SAVED ADDRESSES */}
                    {/* ================================================= */}

                    {savedLocations.length === 0 ? (

                        <View
                            style={
                                styles.emptyContainer
                            }
                        >

                            <Text
                                style={
                                    styles.emptyIcon
                                }
                            >
                                📍
                            </Text>

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No saved addresses
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Your saved locations
                                will appear here.
                            </Text>

                        </View>

                    ) : (

                        savedLocations.map(
                            (
                                location,
                                index,
                            ) => (

                                <TouchableOpacity
                                    key={
                                        location.id ||
                                        `${location.latitude}-${location.longitude}-${index}`
                                    }
                                    style={
                                        styles.card
                                    }
                                    activeOpacity={
                                        0.8
                                    }
                                    onPress={() => {

                                        console.log(
                                            '📍 Selected saved address:',
                                            location,
                                        );

                                    }}
                                >

                                    {/* ICON */}

                                    <View
                                        style={
                                            styles.iconCircle
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.icon
                                            }
                                        >
                                            🏠
                                        </Text>
                                    </View>

                                    {/* DETAILS */}

                                    <View
                                        style={
                                            styles.cardContent
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.home
                                            }
                                        >
                                            {
                                                location.title ||
                                                'Saved Address'
                                            }
                                        </Text>

                                        <Text
                                            style={
                                                styles.address
                                            }
                                            numberOfLines={
                                                3
                                            }
                                        >
                                            {
                                                location.address
                                            }
                                        </Text>

                                        <Text
                                            style={
                                                styles.coordinates
                                            }
                                        >
                                            {
                                                location.latitude
                                            }
                                            ,{' '}
                                            {
                                                location.longitude
                                            }
                                        </Text>

                                    </View>

                                </TouchableOpacity>

                            ),
                        )

                    )}

                    {/* ================================================= */}
                    {/* ADD NEW ADDRESS */}
                    {/* ================================================= */}

                    {/* <TouchableOpacity
                        style={
                            styles.button
                        }
                        onPress={() => {
                            console.log(
                                'Add new address pressed',
                            );

                        }}
                    >
                        <Text
                            style={
                                styles.buttonText
                            }
                        >
                            + Add New Address
                        </Text>
                    </TouchableOpacity> */}

                    <View
                        style={
                            styles.bottomSpace
                        }
                    />

                </ScrollView>

            )}

        </View>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({

        container: {
            flex: 1,
            backgroundColor: '#F7F8FA',
            padding: 20,
        },

        header: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        backButton: {
            marginRight: 12,
        },

        back: {
            fontSize: 30,
            fontWeight: '700',
            color: '#111',
        },

        title: {
            fontSize: 28,
            fontWeight: '700',
            color: '#111',
        },

        scrollContent: {
            paddingTop: 20,
        },

        // ========================================================
        // SAVED ADDRESS CARD
        // ========================================================

        card: {
            backgroundColor: '#FFF',
            padding: 18,
            borderRadius: 15,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',

            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 5,

            elevation: 2,
        },

        iconCircle: {
            width: 45,
            height: 45,
            borderRadius: 23,
            backgroundColor: '#F0FAF8',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        },

        icon: {
            fontSize: 21,
        },

        cardContent: {
            flex: 1,
        },

        home: {
            fontSize: 18,
            fontWeight: '700',
            color: '#111',
        },

        address: {
            marginTop: 6,
            fontSize: 14,
            lineHeight: 20,
            color: '#555',
        },

        coordinates: {
            marginTop: 6,
            fontSize: 11,
            color: '#999',
        },

        // ========================================================
        // ADD BUTTON
        // ========================================================

        button: {
            marginTop: 8,
            backgroundColor: PRIMARY,
            padding: 15,
            borderRadius: 12,
            alignItems: 'center',
        },

        buttonText: {
            color: '#FFF',
            fontWeight: '700',
            fontSize: 15,
        },

        // ========================================================
        // LOADING
        // ========================================================

        loadingContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },

        loadingText: {
            marginTop: 12,
            color: '#777',
            fontSize: 14,
        },

        // ========================================================
        // EMPTY
        // ========================================================

        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 80,
        },

        emptyIcon: {
            fontSize: 45,
        },

        emptyTitle: {
            marginTop: 15,
            fontSize: 18,
            fontWeight: '700',
            color: '#222',
        },

        emptyText: {
            marginTop: 6,
            fontSize: 14,
            color: '#888',
            textAlign: 'center',
        },

        bottomSpace: {
            height: 30,
        },
    });