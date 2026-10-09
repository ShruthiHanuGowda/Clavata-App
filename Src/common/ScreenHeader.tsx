import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';

import BackButton from './BackButton';

interface ScreenHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    titleColor?: string;
    backButtonColor?: string;
    titleSize?: number;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    rightComponent?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    showBackButton = true,
    onBackPress,
    titleColor = '#222222',
    backButtonColor = '#222222',
    titleSize = 18,
    style,
    titleStyle,
    rightComponent,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.left}>
                {showBackButton ? (
                    <BackButton
                        color={backButtonColor}
                        onPress={onBackPress}
                    />
                ) : (
                    <View style={styles.placeholder} />
                )}
            </View>

            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                    styles.title,
                    {
                        color: titleColor,
                        fontSize: titleSize,
                    },
                    titleStyle,
                ]}>
                {title}
            </Text>

            <View style={styles.right}>
                {rightComponent || null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        position: 'relative',
    },

    left: {
        width: 44,
        height: 44,
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1,
    },

    title: {
        position: 'absolute',
        left: 60,
        right: 60,
        textAlign: 'center',
        fontWeight: '600',
        includeFontPadding: false,
    },

    right: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    placeholder: {
        width: 44,
        height: 44,
    },
});

export default ScreenHeader;

