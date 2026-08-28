// ============================================================
// WEB AUTH STORAGE
// ============================================================
//
// Web uses browser localStorage instead of
// @react-native-async-storage/async-storage.
//
// Android / iOS:
//   authStorage.ts
//
// Web:
//   authStorage.web.ts
//
// React Native Web automatically resolves the .web.ts
// version when building for the browser.
// ============================================================


// ============================================================
// STORAGE KEY
// ============================================================

export const ACCOUNT_CREATED_KEY =
  '@clavata_account_created';


// ============================================================
// MARK ACCOUNT AS CREATED
// ============================================================

export const markAccountCreated =
  async (): Promise<void> => {

    try {

      localStorage.setItem(
        ACCOUNT_CREATED_KEY,
        'true',
      );

      console.log(
        '✅ Account-created flag saved',
      );

    } catch (error) {

      console.error(
        'Unable to save account-created flag:',
        error,
      );

    }
  };


// ============================================================
// CHECK REGISTERED ACCOUNT
// ============================================================

export const hasRegisteredAccount =
  async (): Promise<boolean> => {

    try {

      const value =
        localStorage.getItem(
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


// ============================================================
// CLEAR ACCOUNT CREATED
// ============================================================

export const clearAccountCreated =
  async (): Promise<void> => {

    try {

      localStorage.removeItem(
        ACCOUNT_CREATED_KEY,
      );

      console.log(
        '✅ Account-created flag cleared',
      );

    } catch (error) {

      console.error(
        'Unable to clear account-created flag:',
        error,
      );

    }
  };
