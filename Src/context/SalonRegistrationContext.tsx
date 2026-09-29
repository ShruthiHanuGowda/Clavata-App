import React, {
    createContext,
    useContext,
    useState,
} from 'react';

// =====================================================
// KYC DOCUMENT TYPE
// =====================================================

export type KycDocumentType =
    | 'PAN'
    | 'AADHAAR'
    | 'SHOP_ESTABLISHMENT'
    | 'GST'
    | 'UDYAM';

// =====================================================
// KYC DOCUMENT
// =====================================================

export type KycDocument = {
    uri: string;

    name: string;

    type?: string | null;

    size?: number | null;

    // ===================================================
    // KYC S3 UPLOAD INFORMATION
    // ===================================================

    uploadId?: string;

    s3Key?: string;

    documentType?: KycDocumentType;
};

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

export type ServiceMode =
    | 'SALON_ONLY'
    | 'HOME_ONLY'
    | 'SALON_AND_HOME';

// =====================================================
// SERVICE AUDIENCE
// =====================================================

export type ServiceAudience =
    | 'FEMALE'
    | 'MALE'
    | 'KIDS';

// =====================================================
// SALON SERVICE SELECTION
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

    businessTypeId: string;

    businessTypeIds: string[];

    businessType: string;

    // ===================================================
    // SERVICE AUDIENCE
    // ===================================================

    targetAudiences: ServiceAudience[];

    // ===================================================
    // SERVICE AVAILABILITY
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
    // GENERAL BUSINESS DOCUMENTS
    // ===================================================

    businessDocuments: BusinessDocument[];

    // ===================================================
    // KYC DOCUMENTS
    // ===================================================

    panDocument?: KycDocument | null;

    aadhaarDocument?: KycDocument | null;

    shopEstablishmentDocument?: KycDocument | null;

    gstDocument?: KycDocument | null;

    udyamDocument?: KycDocument | null;

    // ===================================================
    // KYC S3 UPLOAD ID
    //
    // One uploadId is used for all documents belonging
    // to this salon registration.
    // ===================================================

    kycUploadId: string;

    // ===================================================
    // CLAVATA SERVICE SELECTIONS
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
        // BUSINESS TYPE
        // =================================================

        businessTypeId: '',

        businessTypeIds: [],

        businessType: '',

        // =================================================
        // SERVICE AUDIENCE
        // =================================================

        targetAudiences: [],

        // =================================================
        // SERVICE AVAILABILITY
        // =================================================

        serviceMode: 'SALON_ONLY',

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
        // KYC
        // =================================================

        panNumber: '',

        aadhaarNumber: '',

        // =================================================
        // KYB
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
        // GENERAL DOCUMENTS
        // =================================================

        businessDocuments: [],

        // =================================================
        // KYC DOCUMENTS
        // =================================================

        panDocument: null,

        aadhaarDocument: null,

        shopEstablishmentDocument: null,

        gstDocument: null,

        udyamDocument: null,

        // =================================================
        // KYC S3 UPLOAD
        // =================================================

        kycUploadId: '',

        // =================================================
        // SERVICE SELECTIONS
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
    createContext<
        SalonRegistrationContextType | null
    >(null);

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
