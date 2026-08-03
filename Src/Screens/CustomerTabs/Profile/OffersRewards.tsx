import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';


export default function OffersRewards() {
    const navigation = useNavigation();
    return (

        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                Offers & Rewards
            </Text>



            <View style={styles.offer}>


                <Text style={styles.icon}>
                    🎁
                </Text>


                <View>

                    <Text style={styles.heading}>
                        20% OFF Hair Services
                    </Text>


                    <Text>
                        Valid till 31 August
                    </Text>


                </View>


            </View>



            <View style={styles.offer}>


                <Text style={styles.icon}>
                    ⭐
                </Text>


                <View>

                    <Text style={styles.heading}>
                        Earn Reward Points
                    </Text>


                    <Text>
                        Book salons and collect points
                    </Text>


                </View>


            </View>



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
        fontWeight: '700'
    },


    offer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 18,
        marginTop: 20,
        flexDirection: 'row'
    },

    icon: {
        fontSize: 35,
        marginRight: 15
    },

    heading: {
        fontSize: 18,
        fontWeight: '700'
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
    },

});