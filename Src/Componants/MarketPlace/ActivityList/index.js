import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';

const ITEMS_PER_PAGE = 5;

const ActivityList = ({ activities = [] }) => {
    const [page, setPage] = useState(1);

    const paginatedData = activities.slice(0, page * ITEMS_PER_PAGE);

    const handleLoadMore = () => {
        if (page * ITEMS_PER_PAGE < activities.length) {
            setPage(prev => prev + 1);
        }
    };

    const openExplorer = (url) => Linking.openURL(url);

    return (
        <View style={styles.container}>
            {paginatedData.map((item) => (
                <View key={item.id} style={styles.activityCard}>
                    <View style={styles.activityCardHeader}>
                        <Text style={styles.activityEvent}>{item.event}</Text>
                        <TouchableOpacity onPress={() => openExplorer(item.explorer)}>
                            <Text style={styles.activityExplorer}>🌐 Explorer</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityRow}>
                        <Text style={styles.activityLabel}>Price:</Text>
                        <Text style={styles.activityValue}>{item.price}</Text>
                    </View>
                    <View style={styles.activityRow}>
                        <Text style={styles.activityLabel}>Quantity:</Text>
                        <Text style={styles.activityValue}>{item.qty}</Text>
                    </View>
                    <View style={styles.activityRow}>
                        <Text style={styles.activityLabel}>From:</Text>
                        <Text style={styles.activityValue}>{item.from}</Text>
                    </View>
                    <View style={styles.activityRow}>
                        <Text style={styles.activityLabel}>To:</Text>
                        <Text style={styles.activityValue}>{item.to}</Text>
                    </View>
                    <View style={styles.activityRow}>
                        <Text style={styles.activityLabel}>Date:</Text>
                        <Text style={styles.activityValue}>{item.date}</Text>
                    </View>
                </View>
            ))}

            {page * ITEMS_PER_PAGE < activities.length && (
                <TouchableOpacity
                    style={styles.loadMoreBtn}
                    onPress={handleLoadMore}
                    activeOpacity={0.8}
                >
                    <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    activityCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    activityEvent: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34495e',
    },
    activityExplorer: {
        fontSize: 12,
        color: '#3498db',
        textDecorationLine: 'underline',
    },
    activityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    activityLabel: {
        fontSize: 14,
        color: '#777',
        fontWeight: '600',
        width: '30%',
    },
    activityValue: {
        fontSize: 14,
        color: '#2c3e50',
        width: '70%',
        textAlign: 'right',
    },
    loadMoreBtn: {
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 30,
        zIndex: 5,
        elevation: 3,
    },
    loadMoreText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default ActivityList;