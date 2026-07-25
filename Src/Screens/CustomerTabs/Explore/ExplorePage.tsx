import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const filters = [
    'Nearby',
    'Top Rated',
    'Offers',
    'Luxury',
    'Budget',
    'Open Now',
];

const salons = [
    {
        id: '1',
        name: 'Glow Studio',
        rating: '4.9',
        distance: '1.2 km',
    },
    {
        id: '2',
        name: 'Urban Style',
        rating: '4.8',
        distance: '2.5 km',
    },
];

export default function ExplorePage() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <Text style={styles.title}>
                    Explore
                </Text>

                <View style={styles.search}>
                    <TextInput
                        placeholder="Search salons or services"
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}>

                    {filters.map(item => (
                        <TouchableOpacity
                            key={item}
                            style={styles.filter}>

                            <Text>{item}</Text>

                        </TouchableOpacity>
                    ))}

                </ScrollView>

                <Text style={styles.heading}>
                    Top Rated
                </Text>

                {salons.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.card}>

                        <View style={styles.image} />

                        <View style={{ flex: 1 }}>

                            <Text style={styles.name}>
                                {item.name}
                            </Text>

                            <Text>
                                ⭐ {item.rating}
                            </Text>

                            <Text>
                                📍 {item.distance}
                            </Text>

                        </View>

                    </TouchableOpacity>
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F8FA'
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        margin: 20
    },

    search: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        justifyContent: 'center'
    },

    filterContainer: {
        marginTop: 20,
        paddingLeft: 20
    },

    filter: {
        backgroundColor: '#fff',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10
    },

    heading: {
        fontSize: 20,
        fontWeight: '700',
        margin: 20
    },

    card: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15
    },

    image: {
        height: 80,
        width: 80,
        backgroundColor: '#ddd',
        borderRadius: 10,
        marginRight: 15
    },

    name: {
        fontSize: 17,
        fontWeight: '700'
    }

});