import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type Props = {
    children?: React.ReactNode;
};

export default function BlurBackground({
    children,
}: Props) {
    return (
        <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={8}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.4)"
        >
            {children}
        </BlurView>
    );
}