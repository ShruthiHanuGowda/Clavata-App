import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    blur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    overlay: {
        flex: 1,

        backgroundColor:
            'rgba(20, 15, 30, 0.20)',

        justifyContent: 'flex-end',
    },

    outside: {
        position: 'absolute',

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    keyboard: {
        width: '100%',
    },

    /*
     * Bottom sheet
     */

    card: {
        width: '100%',

        backgroundColor: '#FFFFFF',

        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

        paddingHorizontal: 26,
        paddingTop: 30,
        paddingBottom: 35,

        shadowColor: '#000',

        shadowOffset: {
            width: 0,
            height: -5,
        },

        shadowOpacity: 0.15,
        shadowRadius: 20,

        elevation: 20,
    },

    /*
     * Close
     */

    closeButton: {
        position: 'absolute',

        right: 20,
        top: 18,

        width: 38,
        height: 38,

        borderRadius: 19,

        backgroundColor: '#F5F4F7',

        justifyContent: 'center',
        alignItems: 'center',

        zIndex: 10,
    },

    closeText: {
        fontSize: 28,
        fontWeight: '300',

        color: '#555963',

        lineHeight: 30,
    },

    /*
     * Icon
     */

    iconContainer: {
        width: 58,
        height: 58,

        borderRadius: 29,

        backgroundColor: '#F5EFFF',

        justifyContent: 'center',
        alignItems: 'center',

        alignSelf: 'center',

        marginBottom: 17,
    },

    icon: {
        fontSize: 25,
        fontWeight: '800',

        color: '#8B3DFF',
    },

    /*
     * Heading
     */

    title: {
        fontSize: 25,

        fontWeight: '800',

        color: '#171D2D',

        textAlign: 'center',

        marginBottom: 7,
    },

    subtitle: {
        fontSize: 15,

        color: '#777F90',

        textAlign: 'center',
    },

    phone: {
        fontSize: 16,

        fontWeight: '700',

        color: '#252B3A',

        textAlign: 'center',

        marginTop: 5,
        marginBottom: 22,
    },

    /*
     * OTP
     */

    otpInput: {
        width: '100%',
        height: 60,

        borderWidth: 1.5,

        borderColor: '#E1E3E8',

        borderRadius: 15,

        backgroundColor: '#FAFAFB',

        fontSize: 24,

        fontWeight: '700',

        color: '#171D2D',

        textAlign: 'center',

        letterSpacing: 10,

        paddingLeft: 10,

        marginBottom: 10,
    },

    otpInputError: {
        borderColor: '#E05260',
    },

    error: {
        fontSize: 13,

        color: '#D64555',

        textAlign: 'center',

        marginBottom: 10,
    },

    /*
     * Verify
     */

    verifyButton: {
        width: '100%',
        height: 56,

        borderRadius: 15,

        justifyContent: 'center',
        alignItems: 'center',

        marginTop: 4,
    },

    buttonText: {
        color: '#FFFFFF',

        fontSize: 16,

        fontWeight: '700',

        textAlign: 'center',
    },

    /*
     * Resend
     */

    resendContainer: {
        flexDirection: 'row',

        justifyContent: 'center',
        alignItems: 'center',

        marginTop: 20,
    },

    resendText: {
        fontSize: 14,

        color: '#7B8290',
    },

    resendLink: {
        fontSize: 14,

        color: '#8B3DFF',

        fontWeight: '700',

        marginLeft: 5,
    },
});