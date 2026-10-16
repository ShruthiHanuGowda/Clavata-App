import React, { ReactNode } from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GraphQLProvider } from './GraphQLProvider';

import {
    UserProvider,
    useUser,
} from '../context/UserContext';

import {
    SalonRegistrationProvider,
} from '../context/SalonRegistrationContext';

import FCMRegistration from '../components/FCMRegistration';

// ============================================================
// APP PROVIDER CONTENT
// This component is inside UserProvider, so useUser() works.
// ============================================================

const AppProviderContent = ({
    children,
}: {
    children: ReactNode;
}) => {
    const { currentUser } = useUser();

    const registrationUserId =
        typeof currentUser?.userId === 'string'
            ? currentUser.userId.trim() || undefined
            : undefined;

    return (
        <SalonRegistrationProvider
            userId={registrationUserId}
        >
            <FCMRegistration />

            {children}
        </SalonRegistrationProvider>
    );
};

// ============================================================
// ROOT APP PROVIDER
// ============================================================

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({
    children,
}) => {
    return (
        <SafeAreaProvider>
            <GraphQLProvider>
                <UserProvider>
                    <AppProviderContent>
                        {children}
                    </AppProviderContent>
                </UserProvider>
            </GraphQLProvider>
        </SafeAreaProvider>
    );
};

export default AppProvider;
