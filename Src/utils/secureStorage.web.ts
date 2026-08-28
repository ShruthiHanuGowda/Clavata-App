// ============================================================
// secureStorage.web.ts
// ============================================================
//
// Web implementation of secureStorage.
//
// Android / iOS:
//   secureStorage.ts
//   ├── react-native-keychain
//   └── AsyncStorage
//
// Web:
//   secureStorage.web.ts
//   └── localStorage
//
// The exported API is intentionally the same so existing
// application code does not need to change.
// ============================================================


// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_SERVICE =
  'app_secure_storage';

const INIT_FLAG =
  'app_already_initialized';


// ============================================================
// STORAGE PREFIX
// ============================================================
//
// Native Keychain uses:
//
//   app_secure_storage_<key>
//
// We use the same naming convention in localStorage.
//

const getStorageKey =
  (key: string): string => {

    return `${DEFAULT_SERVICE}_${key}`;

  };


// ============================================================
// SECURE STORAGE
// ============================================================

const secureStorage = {

  // ==========================================================
  // SET ITEM
  // ==========================================================

  async setItem(
    key: string,
    value: string,
  ): Promise<boolean> {

    try {

      localStorage.setItem(
        getStorageKey(key),
        value,
      );

      return true;

    } catch (error) {

      console.error(
        `Failed to set secure storage item: ${key}`,
        error,
      );

      return false;
    }
  },


  // ==========================================================
  // GET ITEM
  // ==========================================================

  async getItem(
    key: string,
  ): Promise<string | null> {

    try {

      return localStorage.getItem(
        getStorageKey(key),
      );

    } catch (error) {

      console.error(
        `Failed to get secure storage item: ${key}`,
        error,
      );

      return null;
    }
  },


  // ==========================================================
  // REMOVE ITEM
  // ==========================================================

  async removeItem(
    key: string,
  ): Promise<boolean> {

    try {

      localStorage.removeItem(
        getStorageKey(key),
      );

      return true;

    } catch (error) {

      console.error(
        `Failed to remove secure storage item: ${key}`,
        error,
      );

      return false;
    }
  },


  // ==========================================================
  // CLEAR ALL
  // ==========================================================

  async clearAll(): Promise<boolean> {

    try {

      const keysToRemove: string[] = [];

      for (
        let index = 0;
        index < localStorage.length;
        index++
      ) {

        const key =
          localStorage.key(index);

        if (
          key &&
          key.startsWith(
            DEFAULT_SERVICE,
          )
        ) {

          keysToRemove.push(key);

        }
      }


      keysToRemove.forEach(key => {

        localStorage.removeItem(key);

      });


      return true;

    } catch (error) {

      console.error(
        'Failed to clear all secure storage items',
        error,
      );

      return false;
    }
  },
};


// ============================================================
// INITIALIZE APP STORAGE
// ============================================================

export const initializeAppStorage =
  async (): Promise<void> => {

    try {

      const alreadyInitialized =
        localStorage.getItem(
          INIT_FLAG,
        );


      if (!alreadyInitialized) {

        // Fresh web storage or data was wiped.

        await secureStorage.clearAll();

        localStorage.setItem(
          INIT_FLAG,
          'true',
        );

      }

    } catch (error) {

      console.error(
        'Failed to initialize app storage:',
        error,
      );

    }
  };


// ============================================================
// EXPORT
// ============================================================

export default secureStorage;
