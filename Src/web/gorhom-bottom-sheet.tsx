
import React, {
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';

export type BottomSheetBackdropProps = {
    animatedIndex?: unknown;
    animatedPosition?: unknown;
};

export type BottomSheetProps = {
    children?: React.ReactNode;
    index?: number;
    snapPoints?: Array<string | number>;
    backdropComponent?: (
        props: BottomSheetBackdropProps,
    ) => React.ReactNode;
    handleIndicatorStyle?: any;
    backgroundStyle?: any;
    enablePanDownToClose?: boolean;
    onChange?: (index: number) => void;
};

export type BottomSheetRef = {
    expand: () => void;
    close: () => void;
    snapToIndex: (index: number) => void;
};

const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
    (
        {
            children,
            index = -1,
            snapPoints = ['50%'],
            backdropComponent,
            handleIndicatorStyle,
            backgroundStyle,
            enablePanDownToClose = true,
            onChange,
        },
        ref,
    ) => {
        const [visible, setVisible] = useState(index >= 0);

        useImperativeHandle(ref, () => ({
            expand: () => {
                setVisible(true);
                onChange?.(0);
            },

            close: () => {
                setVisible(false);
                onChange?.(-1);
            },

            snapToIndex: (newIndex: number) => {
                if (newIndex < 0) {
                    setVisible(false);
                    onChange?.(-1);
                } else {
                    setVisible(true);
                    onChange?.(newIndex);
                }
            },
        }));

        const handleBackdropPress = () => {
            if (enablePanDownToClose) {
                setVisible(false);
                onChange?.(-1);
            }
        };

        if (!visible) {
            return null;
        }

        const backdrop = backdropComponent
            ? backdropComponent({
                animatedIndex: undefined,
                animatedPosition: undefined,
            })
            : (
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.defaultBackdrop}
                    onPress={handleBackdropPress}
                />
            );

        return (
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={handleBackdropPress}
            >
                <View style={styles.modalContainer}>
                    {backdrop}

                    <View
                        style={[
                            styles.bottomSheet,
                            backgroundStyle,
                        ]}
                    >
                        <View
                            style={[
                                styles.handleIndicator,
                                handleIndicatorStyle,
                            ]}
                        />

                        {children}
                    </View>
                </View>
            </Modal>
        );
    },
);

BottomSheet.displayName = 'BottomSheet';

export const BottomSheetBackdrop = ({
    opacity = 0.5,
    pressBehavior = 'close',
}: {
    animatedIndex?: unknown;
    animatedPosition?: unknown;
    disappearsOnIndex?: number;
    appearsOnIndex?: number;
    opacity?: number;
    pressBehavior?: 'none' | 'close';
}) => {
    return (
        <TouchableOpacity
            activeOpacity={1}
            style={[
                styles.defaultBackdrop,
                {
                    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
                },
            ]}
            onPress={() => {
                // The parent Modal handles closing.
            }}
        />
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    defaultBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    bottomSheet: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        minHeight: 250,
        maxHeight: '85%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'web' ? 20 : 28,

        ...(Platform.OS === 'web'
            ? {
                boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.15)',
            }
            : {
                elevation: 10,
            }),
    },

    handleIndicator: {
        width: 50,
        height: 5,
        borderRadius: 5,
        backgroundColor: '#DDDDDD',
        alignSelf: 'center',
        marginBottom: 10,
    },
});

export default BottomSheet;

