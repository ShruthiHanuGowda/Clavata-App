import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
} from 'react-native';

type Props = {
    isVisible?: boolean;
    children?: React.ReactNode;
    onBackdropPress?: () => void;
    onBackButtonPress?: () => void;
    style?: any;
    [key: string]: any;
};

export default function AppModal({
    isVisible,
    children,
    onBackdropPress,
    onBackButtonPress,
    style,
    ...props
}: Props) {
    if (!isVisible) {
        return null;
    }

    return (
        <Modal
            visible={!!isVisible}
            transparent
            animationType="fade"
            onRequestClose={
                onBackButtonPress
            }
            {...props}
        >
            <View style={styles.container}>

                {onBackdropPress && (
                    <View
                        style={styles.backdrop}
                        onTouchEnd={
                            onBackdropPress
                        }
                    />
                )}

                <View
                    style={[
                        styles.content,
                        style,
                    ]}
                >
                    {children}
                </View>

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor:
            'rgba(0,0,0,0.35)',
    },

    content: {
        flex: 1,
    },
});