import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity
} from 'react-native';


const salons = [
    {
        name: 'Shruthi Salon',
        location: 'Bangalore',
        rating: '4.8 ⭐'
    },
    {
        name: 'Glow Beauty',
        location: 'Whitefield',
        rating: '4.6 ⭐'
    }
];


export default function FavouriteSalons() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
                Favourite Salons
            </Text>
            <FlatList

                data={salons}

                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <View style={styles.image} />


                        <View>

                            <Text style={styles.name}>
                                {item.name}
                            </Text>


                            <Text>
                                {item.location}
                            </Text>


                            <Text>
                                {item.rating}
                            </Text>


                        </View>

                    </View>

                )}

            />

        </View>

    )

}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        padding: 20
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20
    },

    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        marginBottom: 15
    },

    image: {
        height: 70,
        width: 70,
        backgroundColor: '#ddd',
        borderRadius: 12,
        marginRight: 15
    },
    back: {
        fontSize: 28,
        fontWeight: '700',
    },

    name: {
        fontSize: 18,
        fontWeight: '700'
    }

});