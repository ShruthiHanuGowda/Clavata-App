import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useMutation } from '@apollo/client';

import { useUser } from '../context/UserContext';
import {
  initializeFCM,
  subscribeToFCMTokenRefresh,
} from '../services/notificationService';

import { REGISTER_DEVICE_TOKEN } from '../graphql/queries';

const FCMRegistration = () => {
  const { currentUser } = useUser();

  const [registerDeviceToken] = useMutation(
    REGISTER_DEVICE_TOKEN,
  );

  const registeredUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser?.userId) {
      console.log('⏳ FCM waiting for authenticated user...');
      return;
    }

    if (registeredUserId.current === currentUser.userId) {
      return;
    }

    let mounted = true;

    const registerToken = async () => {
      try {
        console.log(
          '🔔 Registering FCM for user:',
          currentUser.userId,
        );

        const token = await initializeFCM();

        if (!token || !mounted) {
          console.log(
            '⚠️ No FCM token available',
          );
          return;
        }

        await registerDeviceToken({
          variables: {
            userId: currentUser.userId,
            token,
            platform: Platform.OS,
          },
        });

        registeredUserId.current =
          currentUser.userId;

        console.log(
          '✅ FCM TOKEN REGISTERED WITH BACKEND',
        );
      } catch (error) {
        console.error(
          '❌ FCM registration failed:',
          error,
        );
      }
    };

    registerToken();

    return () => {
      mounted = false;
    };
  }, [
    currentUser?.userId,
    registerDeviceToken,
  ]);

  /*
   * Listen for Firebase token changes.
   */
  useEffect(() => {
    if (!currentUser?.userId) {
      return;
    }

    const unsubscribe =
      subscribeToFCMTokenRefresh(
        async newToken => {
          try {
            console.log(
              '🔄 Registering refreshed FCM token...',
            );

            await registerDeviceToken({
              variables: {
                userId: currentUser.userId,
                token: newToken,
                platform: Platform.OS,
              },
            });

            console.log(
              '✅ REFRESHED FCM TOKEN REGISTERED',
            );
          } catch (error) {
            console.error(
              '❌ Failed to register refreshed FCM token:',
              error,
            );
          }
        },
      );

    return unsubscribe;
  }, [
    currentUser?.userId,
    registerDeviceToken,
  ]);

  return null;
};

export default FCMRegistration;