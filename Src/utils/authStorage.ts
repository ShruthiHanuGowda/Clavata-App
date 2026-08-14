import AsyncStorage from '@react-native-async-storage/async-storage';

export const ACCOUNT_CREATED_KEY =
    '@clavata_account_created';

export const markAccountCreated =
    async (): Promise<void> => {
        try {
            await AsyncStorage.setItem(
                ACCOUNT_CREATED_KEY,
                'true',
            );
        } catch (error) {
            console.error(
                'Unable to save account-created flag:',
                error,
            );
        }
    };

export const hasRegisteredAccount =
    async (): Promise<boolean> => {
        try {
            const value =
                await AsyncStorage.getItem(
                    ACCOUNT_CREATED_KEY,
                );

            return value === 'true';
        } catch (error) {
            console.error(
                'Unable to read account-created flag:',
                error,
            );

            return false;
        }
    };

export const clearAccountCreated =
    async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(
                ACCOUNT_CREATED_KEY,
            );
        } catch (error) {
            console.error(
                'Unable to clear account-created flag:',
                error,
            );
        }
    };