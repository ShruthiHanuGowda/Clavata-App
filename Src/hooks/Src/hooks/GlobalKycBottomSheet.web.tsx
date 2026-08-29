import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
} from 'react-native';

const GlobalKycBottomSheet: React.FC = () => {
    const [visible, setVisible] = useState(false);

    const handleStartKyc = useCallback(async (): Promise<void> => {
        setVisible(false);

        setTimeout(async () => {
            try {
                // Start KYC verification here
                console.log('Starting KYC verification...');
            } catch (error) {
                console.error('Error starting KYC:', error);
            }
        }, 300);
    }, []);

    const handleSkipKyc = useCallback((): void => {
        setVisible(false);

        setTimeout(async () => {
            try {
                // Skip KYC logic here
                console.log('KYC skipped for now...');
            } catch (error) {
                console.error('Error skipping KYC:', error);
            }
        }, 300);
    }, []);

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={() => setVisible(false)}
                    />

                    <View style={styles.bottomSheet}>
                        <View style={styles.handle} />

                        <Text style={styles.title}>KYC Verification</Text>

                        <Text style={styles.description}>
                            To unlock full functionality of our platform, we need to verify
                            your identity. This process is quick and secure.
                        </Text>

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.optionButton}
                                activeOpacity={0.7}
                                onPress={handleStartKyc}>
                                <View style={styles.optionIconContainer}>
                                    <Text style={styles.optionIcon}>✓</Text>
                                </View>

                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>Complete KYC</Text>

                                    <Text style={styles.optionDescription}>
                                        Verify your identity now to unlock all features
                                    </Text>
                                </View>

                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionButton, styles.skipButton]}
                                activeOpacity={0.7}
                                onPress={handleSkipKyc}>
                                <View
                                    style={[
                                        styles.optionIconContainer,
                                        styles.skipIconContainer,
                                    ]}>
                                    <Text style={styles.skipIcon}>×</Text>
                                </View>

                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>Skip for Now</Text>

                                    <Text style={styles.optionDescription}>
                                        You can complete verification later
                                    </Text>
                                </View>

                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.note}>
                            Note: Some features may be limited until KYC verification is
                            completed.
                        </Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            activeOpacity={0.7}
                            onPress={() => setVisible(false)}>
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },

    bottomSheet: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 28,

        ...(Platform.OS === 'web'
            ? {
                boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.15)',
            }
            : {
                elevation: 10,
            }),
    },

    handle: {
        width: 48,
        height: 5,
        borderRadius: 5,
        backgroundColor: '#D8D8D8',
        alignSelf: 'center',
        marginBottom: 22,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222222',
        textAlign: 'center',
        marginBottom: 10,
    },

    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#666666',
        textAlign: 'center',
        maxWidth: 500,
        alignSelf: 'center',
        marginBottom: 20,
    },

    optionsContainer: {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
        marginTop: 4,
    },

    optionButton: {
        width: '100%',
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F9FF',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#D7E5FF',
    },

    skipButton: {
        backgroundColor: '#F8F8F8',
        borderColor: '#E1E1E1',
    },

    optionIconContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#E5F7EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    skipIconContainer: {
        backgroundColor: '#EEEEEE',
    },

    optionIcon: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A7F37',
    },

    skipIcon: {
        fontSize: 24,
        fontWeight: '500',
        color: '#777777',
    },

    optionTextContainer: {
        flex: 1,
    },

    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 4,
    },

    optionDescription: {
        fontSize: 13,
        lineHeight: 19,
        color: '#777777',
    },

    arrow: {
        fontSize: 28,
        color: '#999999',
        marginLeft: 10,
    },

    note: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        fontSize: 12,
        lineHeight: 18,
        color: '#999999',
        textAlign: 'center',
        marginTop: 4,
    },

    closeButton: {
        width: '100%',
        maxWidth: 520,
        height: 48,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
        borderRadius: 12,
        backgroundColor: '#F1F1F1',
    },

    closeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#555555',
    },
});

export default GlobalKycBottomSheet;