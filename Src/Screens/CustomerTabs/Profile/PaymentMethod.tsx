
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
} from 'react-native';

import { useMutation } from '@apollo/client';
import { RouteProp, useRoute } from '@react-navigation/native';

import {
    UPDATE_PREFERRED_PAYMENT_METHOD,
} from '../../../graphql/queries';

/* ============================================================
   TYPES
============================================================ */

type PreferredPaymentMethod =
    | 'UPI'
    | 'CARD'
    | 'NETBANKING';

type PaymentMethodOption = {
    id: PreferredPaymentMethod;
    title: string;
    subtitle: string;
    icon: string;
};

/*
 * Change this import/type if StakeStackParamList is located
 * in a different file in your project.
 */
type StakeStackParamList = {
    PaymentMethod: {
        userId: string;
    };
};

type PaymentMethodRouteProp = RouteProp<
    StakeStackParamList,
    'PaymentMethod'
>;

/* ============================================================
   PAYMENT OPTIONS
============================================================ */

const PAYMENT_METHODS: PaymentMethodOption[] = [
    {
        id: 'UPI',
        title: 'UPI',
        subtitle: 'Pay using your preferred UPI app',
        icon: '📱',
    },
    {
        id: 'CARD',
        title: 'Credit / Debit Card',
        subtitle: 'Visa, Mastercard, RuPay & more',
        icon: '💳',
    },
    {
        id: 'NETBANKING',
        title: 'Net Banking',
        subtitle: 'Pay directly from your bank account',
        icon: '🏦',
    },
];

/* ============================================================
   COMPONENT
============================================================ */

export default function PaymentMethod() {
    const route =
        useRoute<PaymentMethodRouteProp>();

    const { userId } = route.params;

    const [selectedMethod, setSelectedMethod] =
        useState<PreferredPaymentMethod>('UPI');

    const [
        updatePreferredPaymentMethod,
        { loading },
    ] = useMutation(
        UPDATE_PREFERRED_PAYMENT_METHOD,
    );

    /* ========================================================
       SELECT METHOD
    ======================================================== */

    const handleSelectMethod = (
        method: PreferredPaymentMethod,
    ) => {
        setSelectedMethod(method);
    };

    /* ========================================================
       SAVE PREFERENCE
    ======================================================== */

    const handleSave = async () => {
        if (!userId) {
            Alert.alert(
                'Unable to save',
                'Customer information is missing.',
            );

            return;
        }

        try {
            const { data } =
                await updatePreferredPaymentMethod({
                    variables: {
                        input: {
                            userId,
                            preferredPaymentMethod:
                                selectedMethod,
                        },
                    },
                });

            const response =
                data?.updatePreferredPaymentMethod;

            if (!response?.success) {
                Alert.alert(
                    'Unable to save',
                    response?.message ||
                        'Unable to save your preferred payment method.',
                );

                return;
            }

            Alert.alert(
                'Preference Saved',
                `Your preferred payment method is now ${getMethodTitle(
                    selectedMethod,
                )}.`,
            );
        } catch (error: any) {
            console.error(
                'UPDATE PREFERRED PAYMENT METHOD ERROR:',
                error,
            );

            Alert.alert(
                'Something went wrong',
                error?.message ||
                    'Unable to save your payment preference.',
            );
        }
    };

    /* ========================================================
       UI
    ======================================================== */

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <Text style={styles.title}>
                        Preferred Payment Method
                    </Text>

                    <Text style={styles.subtitle}>
                        Choose your preferred method for
                        paying the booking fee through
                        Razorpay.
                    </Text>
                </View>

                {/* SECURITY CARD */}

                <View style={styles.securityCard}>
                    <View style={styles.securityIcon}>
                        <Text
                            style={
                                styles.securityIconText
                            }
                        >
                            🔒
                        </Text>
                    </View>

                    <View style={styles.securityContent}>
                        <Text
                            style={
                                styles.securityTitle
                            }
                        >
                            Secure payments
                        </Text>

                        <Text
                            style={styles.securityText}
                        >
                            Your payment details are securely
                            handled by Razorpay. Nex does not
                            store your card number, CVV or UPI
                            credentials.
                        </Text>
                    </View>
                </View>

                {/* SECTION */}

                <Text style={styles.sectionTitle}>
                    Select your preferred method
                </Text>

                {/* PAYMENT METHODS */}

                <View style={styles.methodsCard}>
                    {PAYMENT_METHODS.map(
                        (method, index) => {
                            const selected =
                                selectedMethod ===
                                method.id;

                            return (
                                <TouchableOpacity
                                    key={method.id}
                                    activeOpacity={0.75}
                                    onPress={() =>
                                        handleSelectMethod(
                                            method.id,
                                        )
                                    }
                                    style={[
                                        styles.methodRow,
                                        index !==
                                            PAYMENT_METHODS.length -
                                                1 &&
                                            styles.methodBorder,
                                    ]}
                                >
                                    {/* ICON */}

                                    <View
                                        style={[
                                            styles.methodIcon,
                                            selected &&
                                                styles.methodIconSelected,
                                        ]}
                                    >
                                        <Text
                                            style={
                                                styles.methodIconText
                                            }
                                        >
                                            {method.icon}
                                        </Text>
                                    </View>

                                    {/* CONTENT */}

                                    <View
                                        style={
                                            styles.methodContent
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.methodTitle
                                            }
                                        >
                                            {method.title}
                                        </Text>

                                        <Text
                                            style={
                                                styles.methodSubtitle
                                            }
                                        >
                                            {
                                                method.subtitle
                                            }
                                        </Text>
                                    </View>

                                    {/* RADIO */}

                                    <View
                                        style={[
                                            styles.radio,
                                            selected &&
                                                styles.radioSelected,
                                        ]}
                                    >
                                        {selected && (
                                            <View
                                                style={
                                                    styles.radioInner
                                                }
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        },
                    )}
                </View>

                {/* RAZORPAY */}

                <View style={styles.razorpayInfoCard}>
                    <View style={styles.razorpayLogo}>
                        <Text
                            style={
                                styles.razorpayLogoText
                            }
                        >
                            R
                        </Text>
                    </View>

                    <View
                        style={
                            styles.razorpayInfoContent
                        }
                    >
                        <Text
                            style={
                                styles.razorpayInfoTitle
                            }
                        >
                            Payments powered by Razorpay
                        </Text>

                        <Text
                            style={
                                styles.razorpayInfoText
                            }
                        >
                            Your selected method will be
                            used as the preferred payment
                            method when Razorpay Checkout
                            opens during booking.
                        </Text>
                    </View>
                </View>

                {/* HOW PAYMENT WORKS */}

                <View style={styles.bookingInfoCard}>
                    <View style={styles.bookingInfoIcon}>
                        <Text
                            style={
                                styles.bookingInfoIconText
                            }
                        >
                            ℹ️
                        </Text>
                    </View>

                    <View
                        style={
                            styles.bookingInfoContent
                        }
                    >
                        <Text
                            style={
                                styles.bookingInfoTitle
                            }
                        >
                            How payments work
                        </Text>

                        <Text
                            style={
                                styles.bookingInfoText
                            }
                        >
                            Only the booking fee is paid
                            online through Razorpay. The
                            remaining amount is paid directly
                            at the salon.
                        </Text>
                    </View>
                </View>

                {/* SAVE */}

                <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={loading}
                    onPress={handleSave}
                    style={[
                        styles.saveButton,
                        loading &&
                            styles.saveButtonDisabled,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator
                            color="#FFFFFF"
                        />
                    ) : (
                        <Text
                            style={
                                styles.saveButtonText
                            }
                        >
                            Save Preference
                        </Text>
                    )}
                </TouchableOpacity>

                {/* FOOTER */}

                <Text style={styles.footerText}>
                    You can change your preferred payment
                    method anytime from Settings.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ============================================================
   HELPERS
============================================================ */

function getMethodTitle(
    method: PreferredPaymentMethod,
): string {
    switch (method) {
        case 'UPI':
            return 'UPI';

        case 'CARD':
            return 'Credit / Debit Card';

        case 'NETBANKING':
            return 'Net Banking';

        default:
            return method;
    }
}

/* ============================================================
   STYLES
============================================================ */

const PRIMARY = '#009D94';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    content: {
        padding: 18,
        paddingBottom: 40,
    },

    header: {
        marginBottom: 22,
    },

    title: {
        fontSize: 27,
        fontWeight: '800',
        color: '#111827',
    },

    subtitle: {
        marginTop: 7,
        fontSize: 14,
        lineHeight: 21,
        color: '#6B7280',
    },

    /* SECURITY */

    securityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#D1FAE5',
        marginBottom: 25,
    },

    securityIcon: {
        width: 44,
        height: 44,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    securityIconText: {
        fontSize: 20,
    },

    securityContent: {
        flex: 1,
        marginLeft: 12,
    },

    securityTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#065F46',
    },

    securityText: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 18,
        color: '#047857',
    },

    /* SECTION */

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
    },

    /* METHODS */

    methodsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 82,
    },

    methodBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    methodIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },

    methodIconSelected: {
        backgroundColor: '#E8F8F6',
    },

    methodIconText: {
        fontSize: 21,
    },

    methodContent: {
        flex: 1,
        marginLeft: 13,
        marginRight: 10,
    },

    methodTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

    methodSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 17,
    },

    /* RADIO */

    radio: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioSelected: {
        borderColor: PRIMARY,
    },

    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: PRIMARY,
    },

    /* RAZORPAY */

    razorpayInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    razorpayLogo: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F8F6',
    },

    razorpayLogoText: {
        fontSize: 20,
        fontWeight: '800',
        color: PRIMARY,
    },

    razorpayInfoContent: {
        flex: 1,
        marginLeft: 12,
    },

    razorpayInfoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },

    razorpayInfoText: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 18,
        color: '#6B7280',
    },

    /* BOOKING INFO */

    bookingInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        padding: 15,
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },

    bookingInfoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    bookingInfoIconText: {
        fontSize: 18,
    },

    bookingInfoContent: {
        flex: 1,
        marginLeft: 12,
    },

    bookingInfoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#075985',
    },

    bookingInfoText: {
        marginTop: 3,
        fontSize: 12,
        lineHeight: 18,
        color: '#0369A1',
    },

    /* BUTTON */

    saveButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 22,
        elevation: 2,
    },

    saveButtonDisabled: {
        opacity: 0.7,
    },

    saveButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    /* FOOTER */

    footerText: {
        marginTop: 14,
        paddingHorizontal: 15,
        fontSize: 11,
        lineHeight: 17,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

