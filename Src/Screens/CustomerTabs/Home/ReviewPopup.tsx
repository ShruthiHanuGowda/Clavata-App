import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

type Props = {
    visible: boolean;
    salonName?: string;
    onRate: () => void;
    onLater: () => void;
};

export default function ReviewPopup({
    visible,
    salonName,
    onRate,
    onLater,
}: Props) {

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >

            <View style={styles.overlay}>

                <View style={styles.card}>

                    <Text style={styles.title}>
                        How was your experience?
                    </Text>


                    <Text style={styles.salonName}>
                        {salonName || 'Salon'}
                    </Text>


                    <Text style={styles.message}>
                        Your feedback helps others choose the best salon.
                    </Text>


                    <Text style={styles.stars}>
                        ⭐⭐⭐⭐⭐
                    </Text>


                    <TouchableOpacity
                        style={styles.rateButton}
                        onPress={onRate}
                    >

                        <Text style={styles.rateText}>
                            Rate Now
                        </Text>

                    </TouchableOpacity>



                    <TouchableOpacity
                        onPress={onLater}
                    >

                        <Text style={styles.laterText}>
                            Maybe Later
                        </Text>

                    </TouchableOpacity>


                </View>

            </View>

        </Modal>
    );
}


const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },


    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
    },


    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },


    salonName: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#009D94',
    },


    message: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },


    stars: {
        fontSize: 34,
        marginVertical: 20,
    },


    rateButton: {
        width: '100%',
        height: 52,
        backgroundColor: '#009D94',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },


    rateText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },


    laterText: {
        marginTop: 18,
        color: '#6B7280',
        fontSize: 15,
    },

});