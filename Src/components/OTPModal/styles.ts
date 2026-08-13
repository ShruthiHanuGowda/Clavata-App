import {
    StyleSheet,
} from 'react-native';

const PRIMARY = '#009D94';

export default StyleSheet.create({

    blur: {
        ...StyleSheet.absoluteFillObject,
    },

    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:
            'rgba(0,0,0,0.12)',
    },

    outside: {
        ...StyleSheet.absoluteFillObject,
    },

    keyboard: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    card: {
        width: '100%',
        maxWidth: 390,

        backgroundColor: '#FFFFFF',

        borderRadius: 26,

        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 25,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 25,

        elevation: 10,
    },

    closeButton: {
        position: 'absolute',

        right: 15,
        top: 15,

        width: 34,
        height: 34,

        borderRadius: 17,

        backgroundColor: '#F3F5F5',

        alignItems: 'center',
        justifyContent: 'center',

        zIndex: 10,
    },

    closeText: {
        fontSize: 25,
        lineHeight: 28,
        color: '#667070',
        fontWeight: '300',
    },

    iconContainer: {
        width: 62,
        height: 62,

        borderRadius: 31,

        backgroundColor: '#E7F7F5',

        alignItems: 'center',
        justifyContent: 'center',

        alignSelf: 'center',

        marginBottom: 18,
    },

    icon: {
        color: PRIMARY,
        fontSize: 28,
        fontWeight: '800',
    },

    title: {
        fontSize: 23,
        fontWeight: '700',
        color: '#172525',
        textAlign: 'center',

        marginBottom: 8,
    },

    subtitle: {
        fontSize: 14,
        color: '#718080',
        textAlign: 'center',
    },

    phone: {
        fontSize: 16,
        fontWeight: '700',
        color: '#172525',
        textAlign: 'center',

        marginTop: 6,
        marginBottom: 22,
    },

    otpInput: {
        height: 58,

        borderWidth: 1,
        borderColor: '#DDE5E5',

        borderRadius: 14,

        backgroundColor: '#FAFCFC',

        paddingHorizontal: 16,

        fontSize: 24,
        fontWeight: '700',

        letterSpacing: 9,

        textAlign: 'center',

        color: '#172525',
    },

    otpInputError: {
        borderColor: '#E53935',
    },

    error: {
        color: '#E53935',

        fontSize: 13,

        textAlign: 'center',

        marginTop: 9,
    },

    verifyButton: {
        width: '100%',

        minHeight: 52,

        borderRadius: 13,

        marginTop: 20,
    },

    buttonText: {
        color: '#FFFFFF',

        fontSize: 16,

        fontWeight: '700',

        textAlign: 'center',
    },

    resendContainer: {
        flexDirection: 'row',

        justifyContent: 'center',

        alignItems: 'center',

        marginTop: 20,
    },

    resendText: {
        color: '#718080',

        fontSize: 13,
    },

    resendLink: {
        color: PRIMARY,

        fontSize: 13,

        fontWeight: '700',
    },

});