import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    StyleProp,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    useNavigation,
    NavigationProp,
    ParamListBase,
} from '@react-navigation/native';

interface BackButtonProps {
    onPress?: () => void;
    color?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    hitSlop?: number;
}

const BackButton: React.FC<BackButtonProps> = ({
    onPress,
    color = '#222222',
    size = 24,
    style,
    disabled = false,
    hitSlop = 8,
}) => {
    const navigation =
        useNavigation<NavigationProp<ParamListBase>>();

    const handlePress = () => {
        if (disabled) {
            return;
        }

        if (onPress) {
            onPress();
            return;
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
            hitSlop={{
                top: hitSlop,
                bottom: hitSlop,
                left: hitSlop,
                right: hitSlop,
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[
                styles.container,
                style,
            ]}>
            <Ionicons
                name="arrow-back"
                size={size}
                color={color}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default BackButton;

