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

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },

    back: {
        fontSize: 28,
        color: '#333',
        marginRight: 15,
    },

    inputContainer: {
        marginBottom: 4,
    },

    genderRow: {
        flexDirection: 'row',
        gap: 8,
    },

    genderButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D8E3E2',
        backgroundColor: '#FFF',
        borderRadius: 9,
        paddingVertical: 12,
        alignItems: 'center',
    },

    genderButtonSelected: {
        backgroundColor: '#009D94',
        borderColor: '#009D94',
    },

    genderText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '600',
    },

    genderTextSelected: {
        color: '#FFF',
    },

    helperText: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
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
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },

    section: {
        marginTop: 24,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 12,
    },

    dayCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E1E6E5',
    },

    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    dayName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },

    workingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#009D94',
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },

    timeInput: {
        flex: 1,
        height: 45,
        backgroundColor: '#F7F9F9',
        borderWidth: 1,
        borderColor: '#D8E3E2',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#222',
    },

    toText: {
        marginHorizontal: 10,
        fontSize: 14,
        color: '#777',
    },

    primaryButton: {
        backgroundColor: '#009D94',
        borderRadius: 11,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
    },

    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },

    statusTextContainer: {
        flex: 1,
    },

    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },

    statusDescription: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },

    switch: {
        marginLeft: 10,
    },

    cancelButton: {
        height: 50,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#009D94',
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },

    cancelButtonText: {
        color: '#009D94',
        fontSize: 16,
        fontWeight: '600',
    },

    // sectionTitle: {
    //     fontSize: 16,
    //     fontWeight: '700',
    //     color: '#333',
    //     marginTop: 20,
    //     marginBottom: 10,
    // },

    // timeRow: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     gap: 8,
    // },

    // timeInput: {
    //     flex: 1,
    //     height: 44,
    //     backgroundColor: '#FFF',
    //     borderWidth: 1,
    //     borderColor: '#E1E6E5',
    //     borderRadius: 9,
    //     paddingHorizontal: 10,
    //     fontSize: 13,
    //     color: '#222',
    // },

    timeSeparator: {
        fontSize: 14,
        color: '#777',
    },

    inactiveTimeInput: {
        backgroundColor: '#F1F3F3',
        color: '#999',
    },

    workingToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    workingToggleText: {
        fontSize: 13,
        color: '#555',
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E1E6E5',
    },

    backButtonText: {
        fontSize: 22,
        color: '#333',
    },
});