import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
} from 'react-native';

interface DInputProps {
    value: string;
    placeholder?: string;
    setValue: (text: string) => void;
    setValid: (isValid: boolean) => void;
    inputAccessoryViewID?: string;
}

interface DTextInputProps {
    value: string;
    placeholder: string;
    setValue: (text: string) => void;
    setValid: (isValid: boolean) => void;
    style?: object;
    containerStyle?: object;
    keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'decimal-pad'
    | 'url';
    multiline?: boolean;
    numberOfLines?: number;
    editable?: boolean;
}

/**
 * Mobile number input
 */
export function DMobileInput({
    value,
    placeholder = 'Enter Mobile number',
    setValue,
    setValid,
    inputAccessoryViewID,
}: DInputProps) {
    console.log('[Dinputs.web] DMobileInput RENDER:', {
        value,
        valueLength: value?.length ?? 0,
    });

    const handleOnChange = (text: string) => {
        console.log('====================================');
        console.log('🔥 [Dinputs.web] onChangeText FIRED');
        console.log('🔥 Raw text:', text);
        console.log('🔥 Raw length:', text.length);

        // Remove spaces and unwanted characters.
        let mobile = text.replace(/[^\d+]/g, '');

        // Keep + only at the beginning.
        if (mobile.includes('+')) {
            mobile =
                '+' +
                mobile.replace(/\+/g, '');
        }

        console.log('🔥 Normalized mobile:', mobile);

        // Indian mobile number:
        // 9876543210
        // +919876543210
        const regex = /^(?:\+91)?[6-9]\d{9}$/;

        const valid = regex.test(mobile);

        console.log('🔥 Validation:', valid);
        console.log('🔥 Calling setValue:', mobile);
        console.log('🔥 Calling setValid:', valid);

        setValue(mobile);
        setValid(valid);

        console.log('🔥 State setters completed');
        console.log('====================================');
    };

    const handleFocus = () => {
        console.log('====================================');
        console.log('🔥 [Dinputs.web] INPUT FOCUSED');
        console.log('🔥 Current value:', value);
        console.log('====================================');
    };

    const handleBlur = () => {
        console.log('====================================');
        console.log('🔥 [Dinputs.web] INPUT BLURRED');
        console.log('🔥 Current value:', value);
        console.log('====================================');
    };

    const handlePressIn = () => {
        console.log('🔥 [Dinputs.web] INPUT PRESS IN');
    };

    return (
        <View
            style={styles.mobileInputWrapper}
            onStartShouldSetResponder={() => {
                console.log(
                    '🔥 [Dinputs.web] WRAPPER RECEIVED TOUCH',
                );

                return false;
            }}
        >
            <TextInput
                value={value}
                placeholder={placeholder}
                onChangeText={handleOnChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onPressIn={handlePressIn}
                keyboardType="phone-pad"
                inputAccessoryViewID={inputAccessoryViewID}
                autoCorrect={false}
                autoCapitalize="none"
                editable={true}
                placeholderTextColor="#9CA3AF"
                style={styles.mobileInput}
            />
        </View>
    );
}

/**
 * Email / phone input
 */
export function DEmailInput({
    value,
    placeholder = 'example@email.com',
    setValue,
    setValid,
    inputAccessoryViewID,
}: DInputProps) {
    const handleOnChange = (text: string) => {
        const trimmed = text.trim();

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const phoneRegex =
            /^(?:\+91)?[6-9]\d{9}$/;

        const valid =
            emailRegex.test(trimmed) ||
            phoneRegex.test(trimmed);

        console.log('[Dinputs.web] DEmailInput:', {
            value: trimmed,
            valid,
        });

        setValue(trimmed);
        setValid(valid);
    };

    return (
        <View style={styles.wrapperInput}>
            <TextInput
                value={value}
                placeholder={placeholder}
                onChangeText={handleOnChange}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                placeholderTextColor="#BCBCBC"
                style={styles.input}
            />
        </View>
    );
}

/**
 * Generic text input
 */
export function DTextInput({
    value,
    placeholder,
    setValue,
    setValid,
    style,
    containerStyle,
    keyboardType = 'default',
    multiline,
    numberOfLines,
    editable = true,
}: DTextInputProps) {
    const handleOnChange = (text: string) => {
        console.log('[Dinputs.web] DTextInput:', text);

        setValue(text);
        setValid(text.trim().length > 0);
    };

    return (
        <View
            style={[
                styles.wrapperInput,
                containerStyle,
            ]}
        >
            <TextInput
                value={value}
                placeholder={placeholder}
                onChangeText={handleOnChange}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={numberOfLines}
                editable={editable}
                autoCorrect={false}
                placeholderTextColor="#BCBCBC"
                style={[
                    styles.input,
                    style,
                    multiline && styles.multilineInput,
                ]}
            />
        </View>
    );
}

/**
 * Search input
 */
interface DSearchInputProps {
    value: string;
    placeholder?: string;
    setValue: (text: string) => void;
    onEndEditing?: () => void;
}

export function DSearchInput({
    value,
    placeholder = 'Search...',
    setValue,
    onEndEditing,
}: DSearchInputProps) {
    return (
        <View style={styles.wrapperInput}>
            <TextInput
                value={value}
                placeholder={placeholder}
                onChangeText={(text) => {
                    console.log(
                        '[Dinputs.web] DSearchInput:',
                        text,
                    );

                    setValue(text);
                }}
                onBlur={onEndEditing}
                onSubmitEditing={onEndEditing}
                autoCorrect={false}
                placeholderTextColor="#BCBCBC"
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mobileInputWrapper: {
        width: '100%',
        height: 52,

        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,

        justifyContent: 'center',

        backgroundColor: '#FFFFFF',

        // IMPORTANT FOR WEB DEBUGGING
        position: 'relative',
        zIndex: 9999,
    },

    mobileInput: {
        width: '100%',
        height: 52,

        paddingHorizontal: 15,

        fontSize: 16,
        color: '#111827',

        backgroundColor: '#FFFFFF',

        // React Native Web
        outlineStyle: 'none',

        // IMPORTANT FOR WEB DEBUGGING
        position: 'relative',
        zIndex: 10000,

        // @ts-ignore
        cursor: 'text',
    } as any,

    wrapperInput: {
        width: '100%',

        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,

        marginTop: 10,

        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#FFFFFF',
    },

    input: {
        width: '100%',
        height: 50,

        paddingHorizontal: 12,

        fontSize: 14,
        color: '#111827',

        backgroundColor: '#FFFFFF',

        outlineStyle: 'none',
    } as any,

    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
});