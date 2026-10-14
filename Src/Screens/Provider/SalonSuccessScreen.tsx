import React from 'react';

import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';

import {
    Header,
    DButton,
} from '../../components';

import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    RADIUS,
    GRADIENTS,
} from '../../constants/constants';
import AppGradient from '../../common/AppGradient';
const { width, height } = Dimensions.get('window');
export default function SalonSuccessScreen({
    navigation,
    route,
}: any) {
    const {
        salonId,
        salonName,
    } = route?.params || {};

    console.log(
        '======================================',
    );

    console.log(
        'SALON SUCCESS SCREEN',
    );

    console.log(
        'SALON ID:',
        salonId,
    );

    console.log(
        'SALON NAME:',
        salonName,
    );

    console.log(
        '======================================',
    );

    return (
        <SafeAreaView
            style={styles.container}
        >
            <Header
                headerTitle="Success"
                hideBackIcon
            />

            <View
                style={styles.content}
            >
                {/* SUCCESS ICON */}
                <View style={styles.brandContainer}>
                    <Text style={styles.brandText}>
                        Clavata
                    </Text>
                </View>

                {/* TITLE */}
                <Text
                    style={styles.title}
                >
                    Registration Submitted!
                </Text>

                {/* SALON NAME */}
                {/* <Text
                    style={styles.salonName}
                >
                    {salonName || 'Your salon'}
                </Text> */}

                {/* MESSAGE */}
                <Text
                    style={styles.message}
                >
                    Your business registration has been submitted successfully
                </Text>

                <Text
                    style={styles.pendingMessage}
                >
                    Our team will review your KYC details. You will be notified once your business has been verified
                </Text>
            </View>


            {/* HOME BUTTON */}
<TouchableOpacity
    activeOpacity={0.85}
    style={styles.button}
    onPress={() => {
        navigation.replace('LoginScreen', {
            mode: 'SIGN_IN',
            phoneNumber: '',
            hideBackButton: true,
        });
    }}
>
    <AppGradient
        colors={[...GRADIENTS.SOFT_PURPLE]}
        style={styles.buttonGradient}
    >
        <Text style={styles.buttonText}>
            Back to Login
        </Text>
    </AppGradient>
</TouchableOpacity>
        </SafeAreaView>
    );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,

        backgroundColor:
            COLORS.background,
    },

    content: {
        flex: 1,

        justifyContent:
            'center',

        alignItems:
            'center',

        paddingHorizontal:
            SPACING.xxl,
    },

    iconCircle: {
        width: 82,

        height: 82,

        borderRadius: 41,

        backgroundColor:
            '#E8F8F5',

        borderWidth: 1,

        borderColor:
            '#C8EDE6',

        alignItems:
            'center',

        justifyContent:
            'center',

        marginBottom:
            SPACING.xl,
    },

    check: {
        fontSize: 46,

        fontWeight:
            '700',

        color:
            COLORS.primary,
    },

    title: {
        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.title,

        color:
            COLORS.text,

        textAlign:
            'center',

        marginBottom:
            SPACING.small,
    },
   brandContainer: {
        alignItems: 'center',
        marginBottom: Math.min(height * 0.055, 42),
    },

    brandText: {
        fontFamily: FONTS.bold,
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: COLORS.primary,
        includeFontPadding: false,
    },
    salonName: {
        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.medium,

        color:
            COLORS.primary,

        textAlign:
            'center',

        marginBottom:
            SPACING.large,
    },

    message: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.body,

        lineHeight:
            FONT_SIZES.body + 7,

        color:
            COLORS.text,

        textAlign:
            'center',

        marginBottom:
            SPACING.medium,
    },

    pendingMessage: {
        fontFamily:
            FONTS.regular,

        fontSize:
            FONT_SIZES.small,

        lineHeight:
            FONT_SIZES.small + 7,

        color:
            COLORS.textSecondary,

        textAlign:
            'center',

        maxWidth:
            340,
    },

    button: {
        width:
            220,

        alignSelf:
            'center',

        marginBottom:
            SPACING.xxl,

        height:
            54,

        borderRadius:
            RADIUS.medium,
    },

    buttonText: {
        color:
            COLORS.white,

        fontFamily:
            FONTS.semiBold,

        fontSize:
            FONT_SIZES.body,

        textAlign:
            'center',
    },
    buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.medium,
},
});