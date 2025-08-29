// secureStorage.ts

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_SERVICE = 'app_secure_storage';
const INIT_FLAG = 'app_already_initialized';

const secureStorage = {
  /**
   * Stores a key-value pair securely.
   * @param key The unique key.
   * @param value The string value to store securely.
   */
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: `${DEFAULT_SERVICE}_${key}`,
        // accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return true;
    } catch (error) {
      console.error(`SecureStorage: Failed to set item [${key}]`, error);
      return false;
    }
  },

  /**
   * Retrieves a value by key.
   * @param key The unique key.
   * @returns The stored value or null if not found.
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${DEFAULT_SERVICE}_${key}`,
      });

      if (credentials) {
        return credentials.password;
      }

      return null;
    } catch (error) {
      console.error(`SecureStorage: Failed to get item [${key}]`, error);
      return null;
    }
  },

  /**
   * Removes a stored key-value pair.
   * @param key The unique key.
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      const result = await Keychain.resetGenericPassword({
        service: `${DEFAULT_SERVICE}_${key}`,
      });
      return result;
    } catch (error) {
      console.error(`SecureStorage: Failed to remove item [${key}]`, error);
      return false;
    }
  },

  /**
   * Clears all stored items for this app.
   * Use this during app initialization to ensure clean state after reinstall.
   */
  async clearAll(): Promise<boolean> {
    try {
      const allServices = await Keychain.getAllGenericPasswordServices();
      const appServices = allServices.filter(service =>
        service.startsWith(DEFAULT_SERVICE),
      );

      const clearPromises = appServices.map(service =>
        Keychain.resetGenericPassword({service}),
      );

      await Promise.all(clearPromises);
      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to clear all items', error);
      return false;
    }
  },
};

export const initializeAppStorage = async () => {
  const alreadyInitialized = await AsyncStorage.getItem(INIT_FLAG);

  if (!alreadyInitialized) {
    // Fresh install, or data wiped
    await secureStorage.clearAll();
    await AsyncStorage.setItem(INIT_FLAG, 'true');
  }
};

export default secureStorage;
