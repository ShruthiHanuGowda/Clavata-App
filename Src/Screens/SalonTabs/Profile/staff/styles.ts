import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9F9',
    },

    content: {
        padding: 20,
        paddingBottom: 50,
    },

    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#222',
    },

    subtitle: {
        fontSize: 14,
        color: '#777',
        marginTop: 5,
        marginBottom: 25,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },

    input: {
        height: 50,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E1E6E5',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#222',
    },

    optionRow: {
        flexDirection: 'row',
        gap: 8,
    },

    optionButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D8E3E2',
        backgroundColor: '#FFF',
        borderRadius: 9,
        paddingVertical: 12,
        alignItems: 'center',
    },

    selectedOption: {
        backgroundColor: '#009D94',
        borderColor: '#009D94',
    },

    optionText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '600',
    },

    selectedOptionText: {
        color: '#FFF',
    },

    specializationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    specializationButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#D8E3E2',
        borderRadius: 9,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    selectedSpecialization: {
        backgroundColor: '#E2F4F2',
        borderColor: '#009D94',
    },

    specializationText: {
        color: '#555',
        fontSize: 13,
    },

    selectedSpecializationText: {
        color: '#007F78',
        fontWeight: '600',
    },

    hoursCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 5,
    },

    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    dayText: {
        width: 50,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },

    hoursText: {
        fontSize: 13,
        color: '#555',
    },

    closedText: {
        color: '#999',
    },

    saveButton: {
        backgroundColor: '#009D94',
        borderRadius: 11,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },

    disabledButton: {
        opacity: 0.6,
    },

    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },

    errorText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginTop: 8,
    },
});