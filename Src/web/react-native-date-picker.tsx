import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

type DatePickerProps = {
    modal?: boolean;
    open: boolean;
    date: Date;
    mode?: 'date' | 'time' | 'datetime';
    locale?: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
};

const DatePicker: React.FC<DatePickerProps> = ({
    open,
    date,
    title,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}) => {
    const [selectedHour, setSelectedHour] = React.useState(
        date.getHours(),
    );

    const [selectedMinute, setSelectedMinute] = React.useState(
        date.getMinutes(),
    );

    React.useEffect(() => {
        if (open) {
            setSelectedHour(date.getHours());
            setSelectedMinute(date.getMinutes());
        }
    }, [open, date]);

    const increaseHour = () => {
        setSelectedHour(prev => (prev + 1) % 24);
    };

    const decreaseHour = () => {
        setSelectedHour(prev => (prev - 1 + 24) % 24);
    };

    const increaseMinute = () => {
        setSelectedMinute(prev => (prev + 5) % 60);
    };

    const decreaseMinute = () => {
        setSelectedMinute(prev => (prev - 5 + 60) % 60);
    };

    const handleConfirm = () => {
        const result = new Date(date);

        result.setHours(
            selectedHour,
            selectedMinute,
            0,
            0,
        );

        onConfirm(result);
    };

    const formatHour = (hour: number) => {
        const displayHour = hour % 12 || 12;
        return String(displayHour).padStart(2, '0');
    };

    const formatMinute = (minute: number) => {
        return String(minute).padStart(2, '0');
    };

    const period = selectedHour >= 12 ? 'PM' : 'AM';

    const togglePeriod = () => {
        setSelectedHour(prev => {
            if (prev >= 12) {
                return prev - 12;
            }

            return prev + 12;
        });
    };

    if (!open) {
        return null;
    }

    return (
        <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>
                        {title || 'Select Time'}
                    </Text>

                    <View style={styles.timeContainer}>
                        <View style={styles.column}>
                            <TouchableOpacity
                                style={styles.arrowButton}
                                onPress={increaseHour}>
                                <Text style={styles.arrow}>
                                    ▲
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.timeValue}>
                                {formatHour(selectedHour)}
                            </Text>

                            <TouchableOpacity
                                style={styles.arrowButton}
                                onPress={decreaseHour}>
                                <Text style={styles.arrow}>
                                    ▼
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.colon}>
                            :
                        </Text>

                        <View style={styles.column}>
                            <TouchableOpacity
                                style={styles.arrowButton}
                                onPress={increaseMinute}>
                                <Text style={styles.arrow}>
                                    ▲
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.timeValue}>
                                {formatMinute(selectedMinute)}
                            </Text>

                            <TouchableOpacity
                                style={styles.arrowButton}
                                onPress={decreaseMinute}>
                                <Text style={styles.arrow}>
                                    ▼
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.periodButton}
                            onPress={togglePeriod}>
                            <Text style={styles.periodText}>
                                {period}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}>
                            <Text style={styles.cancelText}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}>
                            <Text style={styles.confirmText}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    container: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
    },

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222222',
        textAlign: 'center',
        marginBottom: 25,
    },

    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },

    column: {
        alignItems: 'center',
    },

    arrowButton: {
        width: 50,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrow: {
        fontSize: 16,
        color: '#008060',
    },

    timeValue: {
        fontSize: 40,
        fontWeight: '700',
        color: '#222222',
        minWidth: 75,
        textAlign: 'center',
    },

    colon: {
        fontSize: 40,
        fontWeight: '700',
        color: '#222222',
        marginHorizontal: 5,
    },

    periodButton: {
        marginLeft: 15,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#E8F5F2',
    },

    periodText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#008060',
    },

    buttons: {
        flexDirection: 'row',
        gap: 12,
    },

    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F1F1',
        alignItems: 'center',
        justifyContent: 'center',
    },

    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#008060',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#555555',
    },

    confirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default DatePicker;
