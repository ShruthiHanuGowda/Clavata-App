import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';

const services=[
    'Hair Cut',
    'Facial',
    'Hair Spa',
    'Beard',
    'Makeup',
];

export default function ServiceChips({onSelect}:any){

    return(

        <View style={styles.container}>

            {services.map(item=>(

                <TouchableOpacity

                    key={item}

                    style={styles.chip}

                    onPress={()=>onSelect(item)}

                >

                    <Text style={styles.text}>
                        {item}
                    </Text>

                </TouchableOpacity>

            ))}

        </View>

    );

}

const styles=StyleSheet.create({

    container:{
        flexDirection:'row',
        flexWrap:'wrap',
        paddingHorizontal:20,
        marginBottom:25,
    },

    chip:{
        backgroundColor:'#FFF',
        borderRadius:25,
        paddingHorizontal:18,
        paddingVertical:10,
        marginRight:10,
        marginBottom:10,
    },

    text:{
        fontWeight:'600',
    }

});