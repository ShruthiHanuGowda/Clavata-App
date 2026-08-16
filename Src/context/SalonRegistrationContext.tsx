import React, {
    createContext,
    useContext,
    useState,
} from 'react';

// =====================================================
// BUSINESS HOURS
// =====================================================

export type DayKey =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

export type BusinessDay = {
    open: string;
    close: string;
    isOpen: boolean;
};

export type BusinessHours = Record<DayKey, BusinessDay>;

// =====================================================
// DEFAULT BUSINESS HOURS
// =====================================================

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
    MONDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    TUESDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    WEDNESDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    THURSDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    FRIDAY: {
        open: '09:00',
        close: '19:00',
        isOpen: true,
    },

    SATURDAY: {
        open: '10:00',
        close: '18:00',
        isOpen: true,
    },

    SUNDAY: {
        open: '10:00',
        close: '18:00',
        isOpen: false,
    },
};

// =====================================================
// CREATE DEFAULT HOURS
// =====================================================

const createDefaultBusinessHours = (): BusinessHours => ({
    MONDAY: { ...DEFAULT_BUSINESS_HOURS.MONDAY },
    TUESDAY: { ...DEFAULT_BUSINESS_HOURS.TUESDAY },
    WEDNESDAY: { ...DEFAULT_BUSINESS_HOURS.WEDNESDAY },
    THURSDAY: { ...DEFAULT_BUSINESS_HOURS.THURSDAY },
    FRIDAY: { ...DEFAULT_BUSINESS_HOURS.FRIDAY },
    SATURDAY: { ...DEFAULT_BUSINESS_HOURS.SATURDAY },
    SUNDAY: { ...DEFAULT_BUSINESS_HOURS.SUNDAY },
});

// =====================================================
// REGISTRATION DATA
// =====================================================

export type SalonRegistrationData = {
    userId: string;
    phoneNumber: string;

    salonName: string;
    ownerName: string;
    email: string;
    businessType: string;

    addressLine: string;
    city: string;
    state: string;
    pincode: string;

    gstNumber: string;
    panNumber: string;
    aadhaarNumber: string;

    bankAccount: string;
    ifsc: string;

    businessHours: BusinessHours;

    latitude?: number;
    longitude?: number;
};

// =====================================================
// EMPTY DATA
// =====================================================

const createInitialData = (): SalonRegistrationData => ({
    userId: '',
    phoneNumber: '',

    salonName: '',
    ownerName: '',
    email: '',
    businessType: '',

    addressLine: '',
    city: '',
    state: '',
    pincode: '',

    gstNumber: '',
    panNumber: '',
    aadhaarNumber: '',

    bankAccount: '',
    ifsc: '',

    businessHours: createDefaultBusinessHours(),
});

// =====================================================
// CONTEXT
// =====================================================

type SalonRegistrationContextType = {
    data: SalonRegistrationData;

    updateData: (
        values: Partial<SalonRegistrationData>,
    ) => void;

    reset: () => void;
};

const SalonRegistrationContext =
    createContext<SalonRegistrationContextType | null>(null);

// =====================================================
// PROVIDER
// =====================================================

export const SalonRegistrationProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [data, setData] =
        useState<SalonRegistrationData>(
            createInitialData(),
        );

    const updateData = (
        values: Partial<SalonRegistrationData>,
    ) => {
        console.log(
            'SALON REGISTRATION UPDATE:',
            values,
        );

        setData(prev => ({
            ...prev,
            ...values,
        }));
    };

    const reset = () => {
        console.log(
            'SALON REGISTRATION RESET',
        );

        setData(createInitialData());
    };

    return (
        <SalonRegistrationContext.Provider
            value={{
                data,
                updateData,
                reset,
            }}
        >
            {children}
        </SalonRegistrationContext.Provider>
    );
};

// =====================================================
// HOOK
// =====================================================

export const useSalonRegistration = () => {
    const context =
        useContext(SalonRegistrationContext);

    if (!context) {
        throw new Error(
            'useSalonRegistration must be used inside SalonRegistrationProvider',
        );
    }

    return context;
};