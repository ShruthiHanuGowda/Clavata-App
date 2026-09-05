
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onTokenRefresh,
  getInitialNotification,
  onNotificationOpenedApp,
  AuthorizationStatus,
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

export interface FCMNotificationData {
  type?: string;
  bookingId?: string;
  salonId?: string;
  paymentId?: string;
  [key: string]: string | undefined;
}

export interface FCMMessage {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    [key: string]: string;
  };
  messageId?: string;
}

/**
 * IMPORTANT:
 * Do NOT initialize Firebase Messaging at module load time.
 *
 * This was causing:
 * "Cannot read property 'getConfig' of null"
 *
 * because getMessaging() was being called before the
 * React Native Firebase native module was ready.
 */
function getMessagingInstance() {
  return getMessaging();
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Android
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        const granted =
          result === PermissionsAndroid.RESULTS.GRANTED;

        console.log(
          '🔔 Android notification permission:',
          granted ? 'GRANTED' : 'DENIED',
        );

        return granted;
      }

      return true;
    }

    // iOS
    if (Platform.OS === 'ios') {
      const messagingInstance = getMessagingInstance();

      const authStatus =
        await requestPermission(messagingInstance);

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      console.log(
        '🔔 iOS notification permission:',
        enabled ? 'GRANTED' : 'DENIED',
      );

      return enabled;
    }

    return false;
  } catch (error) {
    console.error(
      '❌ Notification permission error:',
      error,
    );

    return false;
  }
}

/**
 * Get FCM token
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    console.log('🔥 Getting FCM token...');

    const permissionGranted =
      await requestNotificationPermission();

    if (!permissionGranted) {
      console.log(
        '❌ Notification permission denied',
      );

      return null;
    }

    const messagingInstance = getMessagingInstance();

    const token = await getToken(
      messagingInstance,
    );

    if (!token) {
      console.log(
        '❌ FCM token is empty',
      );

      return null;
    }

    console.log(
      '====================================',
    );
    console.log(
      '🔥 FCM TOKEN:',
    );
    console.log(token);
    console.log(
      '====================================',
    );

    return token;
  } catch (error) {
    console.error(
      '❌ Failed to get FCM token:',
      error,
    );

    return null;
  }
}

/**
 * FCM token refresh listener
 */
export function subscribeToFCMTokenRefresh(
  callback: (token: string) => void,
): () => void {
  const messagingInstance = getMessagingInstance();

  return onTokenRefresh(
    messagingInstance,
    token => {
      console.log(
        '🔄 FCM TOKEN REFRESHED:',
        token,
      );

      callback(token);
    },
  );
}

/**
 * Foreground messages
 */
export function subscribeToForegroundMessages(
  callback: (message: FCMMessage) => void,
): () => void {
  const messagingInstance = getMessagingInstance();

  return onMessage(
    messagingInstance,
    async remoteMessage => {
      console.log(
        '🔔 FOREGROUND FCM MESSAGE:',
        JSON.stringify(
          remoteMessage,
          null,
          2,
        ),
      );

      callback(
        remoteMessage as FCMMessage,
      );
    },
  );
}

/**
 * Notification opened from background
 */
export function subscribeToNotificationOpenedApp(
  callback: (
    data: FCMNotificationData,
  ) => void,
): () => void {
  const messagingInstance = getMessagingInstance();

  return onNotificationOpenedApp(
    messagingInstance,
    remoteMessage => {
      console.log(
        '🔔 NOTIFICATION OPENED FROM BACKGROUND:',
        JSON.stringify(
          remoteMessage,
          null,
          2,
        ),
      );

      const data =
        (remoteMessage.data || {}) as FCMNotificationData;

      callback(data);
    },
  );
}

/**
 * Notification opened from completely
 * closed application
 */
export async function handleInitialNotification(
  callback: (
    data: FCMNotificationData,
  ) => void,
): Promise<void> {
  try {
    const messagingInstance = getMessagingInstance();

    const remoteMessage =
      await getInitialNotification(
        messagingInstance,
      );

    if (!remoteMessage) {
      return;
    }

    console.log(
      '🚀 APP OPENED FROM NOTIFICATION:',
      JSON.stringify(
        remoteMessage,
        null,
        2,
      ),
    );

    const data =
      (remoteMessage.data || {}) as FCMNotificationData;

    callback(data);
  } catch (error) {
    console.error(
      '❌ Initial notification error:',
      error,
    );
  }
}

/**
 * Initialize FCM
 */
export async function initializeFCM(): Promise<string | null> {
  try {
    console.log(
      '====================================',
    );
    console.log(
      '🔥 INITIALIZING FCM',
    );
    console.log(
      '====================================',
    );

    // Firebase Messaging is initialized only when this
    // function is actually called.
    const token = await getFCMToken();

    if (!token) {
      console.log(
        '⚠️ FCM initialization failed',
      );

      return null;
    }

    console.log(
      '✅ FCM INITIALIZED SUCCESSFULLY',
    );

    return token;
  } catch (error) {
    console.error(
      '❌ FCM INITIALIZATION ERROR:',
      error,
    );

    return null;
  }
}

