import { Platform } from 'react-native';
import JailMonkey from 'jail-monkey';

export const checkDeviceSecurity = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
        return true;
    }

    const jailBroken = JailMonkey.isJailBroken();
    const canMockLocation = JailMonkey.canMockLocation();

    return !jailBroken && !canMockLocation;
};