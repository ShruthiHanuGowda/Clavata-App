// secureStorage.web.ts
//
// Web implementation of secureStorage.
//
// Android/iOS:
//   secureStorage.ts -> react-native-keychain
//
// Web:
//   secureStorage.web.ts -> localStorage

import { errorService, ErrorCode } from '../services/errorService';

const DEFAULT_SERVICE = 'app_secure_storage';
const INIT_FLAG = 'app_already_initialized';

const getStorageKey = (key: string): string => {
  return `${DEFAULT_SERVICE}_${key}`;
};

const secureStorage = {
  /**
   * Stores a key-value pair.
   */
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      localStorage.setItem(getStorageKey(key), value);
      return true;
    } catch (error) {
      const appError = errorService.createError(
        ErrorCode.UNKNOWN_ERROR,
        `Failed to set web storage item: ${key}`,
        error,
        'secureStorage.web.setItem',
      );

      errorService.logError(appError);

      return false;
    }
  },

  /**
   * Retrieves a value by key.
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(getStorageKey(key));
    } catch (error) {
      const appError = errorService.createError(
        ErrorCode.UNKNOWN_ERROR,
        `Failed to get web storage item: ${key}`,
        error,
        'secureStorage.web.getItem',
      );

      errorService.logError(appError);

      return null;
    }
  },

  /**
   * Removes a stored key-value pair.
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(getStorageKey(key));
      return true;
    } catch (error) {
      const appError = errorService.createError(
        ErrorCode.UNKNOWN_ERROR,
        `Failed to remove web storage item: ${key}`,
        error,
        'secureStorage.web.removeItem',
      );

      errorService.logError(appError);

      return false;
    }
  },

  /**
   * Clears all secure-storage keys belonging to this app.
   */
  async clearAll(): Promise<boolean> {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(DEFAULT_SERVICE)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      const appError = errorService.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Failed to clear all web storage items',
        error,
        'secureStorage.web.clearAll',
      );

      errorService.logError(appError);

      return false;
    }
  },
};

/**
 * Initializes application storage.
 *
 * Web version uses localStorage instead of AsyncStorage.
 */
export const initializeAppStorage = async (): Promise<void> => {
  try {
    const alreadyInitialized = localStorage.getItem(
      getStorageKey(INIT_FLAG),
    );

    if (!alreadyInitialized) {
      await secureStorage.clearAll();

      localStorage.setItem(
        getStorageKey(INIT_FLAG),
        'true',
      );
    }
  } catch (error) {
    const appError = errorService.createError(
      ErrorCode.UNKNOWN_ERROR,
      'Failed to initialize web app storage',
      error,
      'secureStorage.web.initializeAppStorage',
    );

    errorService.logError(appError);
  }
};

export default secureStorage;