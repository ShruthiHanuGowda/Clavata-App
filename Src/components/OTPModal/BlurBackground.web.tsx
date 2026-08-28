import React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';

type Props = {
    children?: React.ReactNode;
};

export default function BlurBackground({
    children,
}: Props) {
    return (
        <View style={styles.container}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,

        backgroundColor:
            'rgba(0, 0, 0, 0.4)',
    },
});