import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = 'selected_location';

export const saveLocation = async (location: any) => {
    try {
        await AsyncStorage.setItem(
            LOCATION_KEY,
            JSON.stringify(location),
        );
    } catch (error) {
        console.log('Save Location Error:', error);
    }
};

export const getSavedLocation = async () => {
    try {
        const value = await AsyncStorage.getItem(LOCATION_KEY);

        if (value) {
            return JSON.parse(value);
        }

        return null;
    } catch (error) {
        console.log('Get Location Error:', error);
        return null;
    }
};

export const clearSavedLocation = async () => {
    try {
        await AsyncStorage.removeItem(LOCATION_KEY);
    } catch (error) {
        console.log(error);
    }
};