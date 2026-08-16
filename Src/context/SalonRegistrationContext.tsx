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

export type BusinessHours = Record<
    DayKey,
    BusinessDay
>;

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

const createDefaultBusinessHours =
    (): BusinessHours => ({
        MONDAY: {
            ...DEFAULT_BUSINESS_HOURS.MONDAY,
        },

        TUESDAY: {
            ...DEFAULT_BUSINESS_HOURS.TUESDAY,
        },

        WEDNESDAY: {
            ...DEFAULT_BUSINESS_HOURS.WEDNESDAY,
        },

        THURSDAY: {
            ...DEFAULT_BUSINESS_HOURS.THURSDAY,
        },

        FRIDAY: {
            ...DEFAULT_BUSINESS_HOURS.FRIDAY,
        },

        SATURDAY: {
            ...DEFAULT_BUSINESS_HOURS.SATURDAY,
        },

        SUNDAY: {
            ...DEFAULT_BUSINESS_HOURS.SUNDAY,
        },
    });

// =====================================================
// KYC STATUS
// =====================================================

export type KYCStatus =
    | 'NOT_STARTED'
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED';

// =====================================================
// BUSINESS DOCUMENT
// =====================================================

export type BusinessDocument = {
    type:
    | 'GST_CERTIFICATE'
    | 'SHOP_ESTABLISHMENT'
    | 'UDYAM'
    | 'PARTNERSHIP_DEED'
    | 'INCORPORATION_CERTIFICATE'
    | 'RENTAL_AGREEMENT'
    | 'UTILITY_BILL'
    | 'OTHER';

    uri: string;

    fileName: string;

    uploadedAt: string;
};

// =====================================================
// REGISTRATION DATA
// =====================================================

export type SalonRegistrationData = {
    // ===================================================
    // USER
    // ===================================================

    userId: string;

    phoneNumber: string;

    // ===================================================
    // BUSINESS
    // ===================================================

    salonName: string;

    ownerName: string;

    email: string;

    businessType: string;

    // ===================================================
    // ADDRESS
    // ===================================================

    addressLine: string;

    city: string;

    state: string;

    pincode: string;

    latitude?: number;

    longitude?: number;

    // ===================================================
    // KYC - OWNER
    // ===================================================

    panNumber: string;

    aadhaarNumber: string;

    // ===================================================
    // KYB - BUSINESS
    // ===================================================

    gstNumber: string;

    shopEstablishmentNumber: string;

    udyamNumber: string;

    cinNumber: string;

    llpinNumber: string;

    // ===================================================
    // BANK
    // ===================================================

    bankAccount: string;

    ifsc: string;

    accountHolderName: string;

    // ===================================================
    // DOCUMENTS
    // ===================================================

    businessDocuments: BusinessDocument[];

    // ===================================================
    // VERIFICATION
    // ===================================================

    kycStatus: KYCStatus;

    kycReferenceId: string;

    kycSubmittedAt: string;

    kycReviewedAt: string;

    kycRejectionReason: string;

    // ==========================================
    // PROVIDER STATUS
    // ==========================================

    providerStatus:
    | 'NOT_REGISTERED'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';

    // ===================================================
    // BUSINESS HOURS
    // ===================================================

    businessHours: BusinessHours;
};

// =====================================================
// INITIAL DATA
// =====================================================

const createInitialData =
    (): SalonRegistrationData => ({
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

        latitude: undefined,

        longitude: undefined,

        panNumber: '',

        aadhaarNumber: '',

        gstNumber: '',

        shopEstablishmentNumber: '',

        udyamNumber: '',

        cinNumber: '',

        llpinNumber: '',

        bankAccount: '',

        ifsc: '',

        accountHolderName: '',

        businessDocuments: [],

        kycStatus: 'NOT_STARTED',

        kycReferenceId: '',

        kycSubmittedAt: '',

        kycReviewedAt: '',

        kycRejectionReason: '',

        providerStatus: 'NOT_REGISTERED',

        businessHours:
            createDefaultBusinessHours(),
    });

// =====================================================
// CONTEXT TYPE
// =====================================================

type SalonRegistrationContextType = {
    data: SalonRegistrationData;

    updateData: (
        values: Partial<SalonRegistrationData>,
    ) => void;

    reset: () => void;
};

// =====================================================
// CONTEXT
// =====================================================

const SalonRegistrationContext =
    createContext<SalonRegistrationContextType | null>(
        null,
    );

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
            '======================================',
        );

        console.log(
            'SALON REGISTRATION UPDATE',
        );

        console.log(values);

        console.log(
            '======================================',
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
        useContext(
            SalonRegistrationContext,
        );

    if (!context) {
        throw new Error(
            'useSalonRegistration must be used inside SalonRegistrationProvider',
        );
    }

    return context;
};