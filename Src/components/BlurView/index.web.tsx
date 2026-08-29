import React from 'react';
import { View } from 'react-native';

type BlurViewProps = {
    style?: any;
    blurType?: string;
    blurAmount?: number;
    reducedTransparencyFallbackColor?: string;
};

export default function BlurView({
    style,
    blurType = 'light',
    blurAmount = 16,
    reducedTransparencyFallbackColor = 'rgba(255,255,255,0.94)',
}: BlurViewProps) {
    const webStyle: any = {
        ...(style || {}),
        backgroundColor: reducedTransparencyFallbackColor,
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
    };

    return <View style={webStyle} />;
}
