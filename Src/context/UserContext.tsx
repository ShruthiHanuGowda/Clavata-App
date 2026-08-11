import React, { createContext, useContext, useState } from 'react';

type User = {
    userId: string;
    phoneNumber: string;
    fullName: string;
    profileImageUrl?: string;
    roles: {
        customer: boolean;
        businessPartner: boolean;
    };

    activeRole: string;
    providerStatus: string;
    salonId?: string | null;
};

type UserContextType = {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [currentUser, setCurrentUser] =
        useState<User | null>(null);

    return (
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser,
            }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error(
            'useUser must be used inside UserProvider'
        );
    }

    return context;
};