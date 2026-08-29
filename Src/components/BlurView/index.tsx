import React from 'react';
import { BlurView as NativeBlurView } from '@react-native-community/blur';

type BlurViewProps = {
    style?: any;
    blurType?: 'light' | 'dark' | 'xlight' | 'regular' | 'prominent';
    blurAmount?: number;
    reducedTransparencyFallbackColor?: string;
};

export default function BlurView({
    style,
    blurType = 'light',
    blurAmount = 16,
    reducedTransparencyFallbackColor = 'rgba(255,255,255,0.94)',
}: BlurViewProps) {
    return (
        <NativeBlurView
            style={style}
            blurType={blurType}
            blurAmount={blurAmount}
            reducedTransparencyFallbackColor={
                reducedTransparencyFallbackColor
            }
        />
    );
}
