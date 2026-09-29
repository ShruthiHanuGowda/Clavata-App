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
// SERVICE MODE
// =====================================================
//
// SALON_ONLY
//     Service is provided only at the salon.
//
// HOME_ONLY
//     Service is provided only at customer's home.
//
// SALON_AND_HOME
//     Service is provided both at the salon and
//     at customer's home.
//
// =====================================================

export type ServiceMode =
    | 'SALON_ONLY'
    | 'HOME_ONLY'
    | 'SALON_AND_HOME';

// =====================================================
// SERVICE AUDIENCE
// =====================================================
//
// Defines WHO the salon/business provides services to.
//
// FEMALE
//     Services for women.
//
// MALE
//     Services for men.
//
// KIDS
//     Services for children.
//
// Multiple values can be selected.
//
// Example:
//
// [
//     'FEMALE',
//     'MALE'
// ]
//
// =====================================================

export type ServiceAudience =
    | 'FEMALE'
    | 'MALE'
    | 'KIDS';

// =====================================================
// SALON SERVICE SELECTION
// =====================================================
//
// These are the services selected from Clavata's
// master service catalog.
//
// IMPORTANT:
//
// Price and duration belong to the SALON's offering.
//
// =====================================================

export type SalonServiceSelection = {
    audience: ServiceAudience;

    categoryId: string;

    categoryName: string;

    subcategoryId: string;

    subcategoryName: string;

    price?: number;

    durationMinutes?: number;
};

// =====================================================
// SERVICE-SPECIFIC MODE
// =====================================================
//
// The key is the subcategory/service ID.
//
// Example:
//
// {
//     "service-id-1": "SALON_AND_HOME",
//     "service-id-2": "SALON_ONLY",
//     "service-id-3": "HOME_ONLY"
// }
//
// =====================================================

export type ServiceSpecificModes = Record<
    string,
    ServiceMode
>;

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

    // ===================================================
    // BUSINESS TYPE
    // ===================================================
    //
    // businessTypeId
    //     Primary/first selected business type.
    //
    // Kept for backward compatibility with the existing
    // backend/register flow that currently expects a
    // single businessTypeId.
    //
    // Example:
    //
    // businessTypeId: "beauty-salon-id"
    //
    // ===================================================

    businessTypeId: string;

    // ===================================================
    // MULTIPLE BUSINESS TYPES
    // ===================================================
    //
    // Contains ALL business types selected by the salon.
    //
    // Example:
    //
    // [
    //     "beauty-salon-id",
    //     "barber-id",
    //     "spa-wellness-id"
    // ]
    //
    // This is used later by SalonServices to determine
    // which categories/subcategories are available for
    // the salon.
    //
    // ===================================================

    businessTypeIds: string[];

    // ===================================================
    // BUSINESS TYPE NAMES
    // ===================================================
    //
    // Contains the selected business type names as a
    // comma-separated string.
    //
    // Example:
    //
    // "Beauty Salon, Barber"
    //
    // ===================================================

    businessType: string;

    // ===================================================
    // SERVICE AUDIENCE
    // ===================================================
    //
    // Defines whether the business provides services for:
    //
    // FEMALE
    // MALE
    // KIDS
    //
    // Multiple selections are allowed.
    //
    // Example:
    //
    // ['FEMALE', 'MALE']
    //
    // ===================================================

    targetAudiences: ServiceAudience[];

    // ===================================================
    // SERVICE AVAILABILITY
    // ===================================================
    //
    // General/default service availability.
    //
    // The salon can later customize availability
    // individually using serviceSpecificModes.
    //
    // ===================================================

    serviceMode: ServiceMode;

    serviceSpecificModes: ServiceSpecificModes;

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
    // CLAVATA SERVICE SELECTIONS
    // ===================================================
    //
    // Contains:
    //
    // audience
    // categoryId
    // categoryName
    // subcategoryId
    // subcategoryName
    // price
    // durationMinutes
    //
    // ===================================================

    serviceSelections: SalonServiceSelection[];

    // ===================================================
    // VERIFICATION
    // ===================================================

    kycStatus: KYCStatus;

    kycReferenceId: string;

    kycSubmittedAt: string;

    kycReviewedAt: string;

    kycRejectionReason: string;

    // ===================================================
    // PROVIDER STATUS
    // ===================================================

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

        // =================================================
        // USER
        // =================================================

        userId: '',

        phoneNumber: '',

        // =================================================
        // BUSINESS
        // =================================================

        salonName: '',

        ownerName: '',

        email: '',

        // =================================================
        // PRIMARY BUSINESS TYPE
        // =================================================

        businessTypeId: '',

        // =================================================
        // ALL SELECTED BUSINESS TYPES
        // =================================================

        businessTypeIds: [],

        // =================================================
        // BUSINESS TYPE NAMES
        // =================================================

        businessType: '',

        // =================================================
        // SERVICE AUDIENCE
        // =================================================
        //
        // Initially empty.
        //
        // SalonRegistrationScreen will set this.
        //
        // =================================================

        targetAudiences: [],

        // =================================================
        // SERVICE AVAILABILITY
        // =================================================

        serviceMode: 'SALON_ONLY',

        // =================================================
        // SERVICE-SPECIFIC MODES
        // =================================================

        serviceSpecificModes: {},

        // =================================================
        // ADDRESS
        // =================================================

        addressLine: '',

        city: '',

        state: '',

        pincode: '',

        latitude: undefined,

        longitude: undefined,

        // =================================================
        // KYC - OWNER
        // =================================================

        panNumber: '',

        aadhaarNumber: '',

        // =================================================
        // KYB - BUSINESS
        // =================================================

        gstNumber: '',

        shopEstablishmentNumber: '',

        udyamNumber: '',

        cinNumber: '',

        llpinNumber: '',

        // =================================================
        // BANK
        // =================================================

        bankAccount: '',

        ifsc: '',

        accountHolderName: '',

        // =================================================
        // DOCUMENTS
        // =================================================

        businessDocuments: [],

        // =================================================
        // CLAVATA SERVICE SELECTIONS
        // =================================================
        //
        // Initially empty.
        //
        // SalonServices.tsx will add:
        //
        // {
        //     audience,
        //     categoryId,
        //     categoryName,
        //     subcategoryId,
        //     subcategoryName
        // }
        //
        // ConfigureSalonServices.tsx will then add:
        //
        // {
        //     audience,
        //     categoryId,
        //     categoryName,
        //     subcategoryId,
        //     subcategoryName,
        //     price,
        //     durationMinutes
        // }
        //
        // =================================================

        serviceSelections: [],

        // =================================================
        // VERIFICATION
        // =================================================

        kycStatus: 'NOT_STARTED',

        kycReferenceId: '',

        kycSubmittedAt: '',

        kycReviewedAt: '',

        kycRejectionReason: '',

        // =================================================
        // PROVIDER STATUS
        // =================================================

        providerStatus: 'NOT_REGISTERED',

        // =================================================
        // BUSINESS HOURS
        // =================================================

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

    // ===================================================
    // UPDATE DATA
    // ===================================================

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

    // ===================================================
    // RESET
    // ===================================================

    const reset = () => {

        console.log(
            'SALON REGISTRATION RESET',
        );

        setData(
            createInitialData(),
        );
    };

    // ===================================================
    // PROVIDER
    // ===================================================

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