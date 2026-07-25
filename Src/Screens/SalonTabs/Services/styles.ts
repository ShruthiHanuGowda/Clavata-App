import { StyleSheet } from 'react-native';

const PRIMARY = '#009D94';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    header: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },

    searchContainer: {
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
        paddingHorizontal: 16,
        elevation: 2,
    },

    searchText: {
        color: '#9CA3AF',
    },

    categoryContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },

    categoryButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: '#ECEFF1',
        borderRadius: 22,
        marginRight: 10,
    },

    categoryActive: {
        backgroundColor: PRIMARY,
    },

    categoryText: {
        color: '#555',
        fontWeight: '600',
    },

    categoryTextActive: {
        color: '#FFF',
    },

    card: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 18,
        padding: 18,
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    duration: {
        marginTop: 6,
        color: '#6B7280',
    },

    price: {
        fontSize: 20,
        fontWeight: '700',
        color: PRIMARY,
    },

    badge: {
        marginTop: 10,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        backgroundColor: '#E8F8F6',
    },

    badgeText: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 12,
    },

    switchRow: {
        marginTop: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    actionRow: {
        flexDirection: 'row',
        marginTop: 18,
    },

    editButton: {
        flex: 1,
        backgroundColor: PRIMARY,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 10,
    },

    deleteButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '700',
    },

    fab: {
        position: 'absolute',
        right: 25,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },

    fabText: {
        color: '#FFF',
        fontSize: 34,
        marginTop: -2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },

    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },

    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 20,
    },

    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 48,
        marginBottom: 15,
        backgroundColor: '#FFF',
    },

    modalSwitchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
    },

    modalLabel: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },

    modalButtonRow: {
        flexDirection: 'row',
        marginTop: 30,
    },

    cancelButton: {
        flex: 1,
        backgroundColor: '#9CA3AF',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 10,
    },

    saveButton: {
        flex: 1,
        backgroundColor: PRIMARY,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },

    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});