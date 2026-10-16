
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { useApolloClient } from '@apollo/client';

import {
    GET_SALON_REGISTRATION_DRAFT,
    SAVE_SALON_REGISTRATION_DRAFT,
} from '../graphql/queries';

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

export type BusinessHours = Record<DayKey, BusinessDay>;

// =====================================================
// DEFAULT BUSINESS HOURS
// =====================================================

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
    MONDAY: { open: '09:00', close: '19:00', isOpen: true },
    TUESDAY: { open: '09:00', close: '19:00', isOpen: true },
    WEDNESDAY: { open: '09:00', close: '19:00', isOpen: true },
    THURSDAY: { open: '09:00', close: '19:00', isOpen: true },
    FRIDAY: { open: '09:00', close: '19:00', isOpen: true },
    SATURDAY: { open: '10:00', close: '18:00', isOpen: true },
    SUNDAY: { open: '10:00', close: '18:00', isOpen: false },
};

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
    serviceKey: string;
    name: string;
    description?: string;
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

export type ServiceSpecificModes = Record<string, ServiceMode>;

// =====================================================
// REGISTRATION DATA
// =====================================================

export type SalonRegistrationData = {
    userId: string;
    phoneNumber: string;

    salonName: string;
    ownerName: string;
    email: string;

    targetAudiences: ServiceAudience[];

    serviceMode: ServiceMode;
    serviceSpecificModes: ServiceSpecificModes;

    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;

    panNumber: string;
    aadhaarNumber: string;

    gstNumber: string;
    shopEstablishmentNumber: string;
    udyamNumber: string;
    cinNumber: string;
    llpinNumber: string;

    bankAccount: string;
    ifsc: string;
    accountHolderName: string;

    businessDocuments: BusinessDocument[];

    panDocument?: KycDocument | null;
    aadhaarDocument?: KycDocument | null;
    shopEstablishmentDocument?: KycDocument | null;
    gstDocument?: KycDocument | null;
    udyamDocument?: KycDocument | null;

    kycUploadId: string;

    serviceSelections: SalonServiceSelection[];

    kycStatus: KYCStatus;
    kycReferenceId: string;
    kycSubmittedAt: string;
    kycReviewedAt: string;
    kycRejectionReason: string;

    providerStatus:
    | 'NOT_REGISTERED'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';

    businessHours: BusinessHours;
};

// =====================================================
// INITIAL REGISTRATION DATA
// =====================================================

const createInitialData = (): SalonRegistrationData => ({
    userId: '',
    phoneNumber: '',

    salonName: '',
    ownerName: '',
    email: '',

    targetAudiences: [],

    serviceMode: 'SALON_ONLY',
    serviceSpecificModes: {},

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

    panDocument: null,
    aadhaarDocument: null,
    shopEstablishmentDocument: null,
    gstDocument: null,
    udyamDocument: null,

    kycUploadId: '',

    serviceSelections: [],

    kycStatus: 'NOT_STARTED',
    kycReferenceId: '',
    kycSubmittedAt: '',
    kycReviewedAt: '',
    kycRejectionReason: '',

    providerStatus: 'NOT_REGISTERED',

    businessHours: createDefaultBusinessHours(),
});

// =====================================================
// DRAFT TYPES
// =====================================================

export type SalonRegistrationDraftStatus =
    | 'DRAFT'
    | 'COMPLETED';

type SalonRegistrationDraftRecord = {
    userId: string;
    currentStep: number;
    completedSteps: number[];
    draftData: unknown;
    status: SalonRegistrationDraftStatus;
    createdAt?: string;
    updatedAt?: string;
};

type SalonRegistrationDraftResponse = {
    success: boolean;
    message?: string | null;
    draft?: SalonRegistrationDraftRecord | null;
};

export type DraftLoadResult = {
    hasDraft: boolean;
    currentStep: number;
    completedSteps: number[];
};

// Only non-sensitive registration fields are persisted.
type SafeKycDocument = {
    name: string;
    type?: string | null;
    size?: number | null;
    uploadId?: string;
    s3Key: string;
    documentType?: KycDocumentType;
};

type SafeSalonDraftData = {
    salonName: string;
    ownerName: string;
    email: string;
    targetAudiences: ServiceAudience[];

    serviceMode: ServiceMode;
    serviceSpecificModes: ServiceSpecificModes;

    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;

    businessHours: BusinessHours;
    serviceSelections: SalonServiceSelection[];

    // KYC form values
    panNumber: string;
    aadhaarNumber: string;
    gstNumber: string;
    shopEstablishmentNumber: string;
    udyamNumber: string;
    kycUploadId: string;

    // Persist only documents already uploaded to S3.
    panDocument?: SafeKycDocument | null;
    aadhaarDocument?: SafeKycDocument | null;
    shopEstablishmentDocument?: SafeKycDocument | null;
    gstDocument?: SafeKycDocument | null;
    udyamDocument?: SafeKycDocument | null;
};

// =====================================================
// SAFE DRAFT SERIALIZATION
// =====================================================

const getSafeKycDocument = (
    document?: KycDocument | null,
): SafeKycDocument | null => {
    // A temporary local selection cannot be restored reliably
    // after the app is closed. Persist only uploaded documents.
    if (!document?.s3Key) {
        return null;
    }

    return {
        name: document.name,
        type: document.type,
        size: document.size,
        uploadId: document.uploadId,
        s3Key: document.s3Key,
        documentType: document.documentType,
    };
};

const getSafeDraftData = (
    data: SalonRegistrationData,
): SafeSalonDraftData => ({
    salonName: data.salonName,
    ownerName: data.ownerName,
    email: data.email,

    targetAudiences: data.targetAudiences,
    serviceMode: data.serviceMode,
    serviceSpecificModes: data.serviceSpecificModes,

    addressLine: data.addressLine,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    latitude: data.latitude,
    longitude: data.longitude,

    businessHours: data.businessHours,

    serviceSelections: data.serviceSelections.map(service => ({
        serviceKey: service.serviceKey,
        name: service.name,
        description: service.description,
        audience: service.audience,
        categoryId: service.categoryId,
        categoryName: service.categoryName,
        subcategoryId: service.subcategoryId,
        subcategoryName: service.subcategoryName,
        price: service.price,
        durationMinutes: service.durationMinutes,
    })),

    panNumber: data.panNumber,
    aadhaarNumber: data.aadhaarNumber,
    gstNumber: data.gstNumber,
    shopEstablishmentNumber: data.shopEstablishmentNumber,
    udyamNumber: data.udyamNumber,
    kycUploadId: data.kycUploadId,

    panDocument: getSafeKycDocument(data.panDocument),
    aadhaarDocument: getSafeKycDocument(data.aadhaarDocument),
    shopEstablishmentDocument: getSafeKycDocument(
        data.shopEstablishmentDocument,
    ),
    gstDocument: getSafeKycDocument(data.gstDocument),
    udyamDocument: getSafeKycDocument(data.udyamDocument),
});

// =====================================================
// DRAFT PARSING
// =====================================================

const parseDraftData = (
    value: unknown,
): Partial<SafeSalonDraftData> => {
    try {
        const parsed: unknown =
            typeof value === 'string' ? JSON.parse(value) : value;

        if (
            !parsed ||
            typeof parsed !== 'object' ||
            Array.isArray(parsed)
        ) {
            return {};
        }

        return parsed as Partial<SafeSalonDraftData>;
    } catch {
        return {};
    }
};

const parseCompletedSteps = (value: unknown): number[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value.filter(
                (item: unknown): item is number =>
                    typeof item === 'number' &&
                    Number.isInteger(item) &&
                    item >= 1 &&
                    item <= 6,
            ),
        ),
    ].sort((a, b) => a - b);
};

const normalizeStep = (step: unknown): number => {
    if (
        typeof step !== 'number' ||
        !Number.isInteger(step) ||
        step < 1 ||
        step > 6
    ) {
        return 1;
    }

    return step;
};

// =====================================================
// CONTEXT TYPE
// =====================================================

type SalonRegistrationContextType = {
    data: SalonRegistrationData;

    updateData: (
        values: Partial<SalonRegistrationData>,
    ) => void;

    reset: () => void;

    currentStep: number;
    completedSteps: number[];

    isDraftLoading: boolean;
    isDraftSaving: boolean;
    draftError: string | null;

    setCurrentStep: (step: number) => void;
    markStepCompleted: (step: number) => void;

    saveDraft: (
        step?: number,
        completed?: number[],
        latestData?: Partial<SalonRegistrationData>,
    ) => Promise<boolean>;

    loadDraft: () => Promise<DraftLoadResult>;
    resetDraftState: () => void;
};

// =====================================================
// CONTEXT
// =====================================================

const SalonRegistrationContext =
    createContext<SalonRegistrationContextType | null>(null);

// =====================================================
// PROVIDER
// =====================================================

type SalonRegistrationProviderProps = {
    children: React.ReactNode;
    userId?: string;
};

export const SalonRegistrationProvider = ({
    children,
    userId: authenticatedUserId,
}: SalonRegistrationProviderProps) => {
    const client = useApolloClient();

    const [data, setData] =
        useState<SalonRegistrationData>(createInitialData);

    const [currentStep, setCurrentStepState] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const [isDraftLoading, setIsDraftLoading] = useState(false);
    const [isDraftSaving, setIsDraftSaving] = useState(false);
    const [draftError, setDraftError] = useState<string | null>(null);

    const dataRef = useRef(data);
    const stepRef = useRef(1);
    const completedRef = useRef<number[]>([]);

    const hydratedUserRef = useRef<string | null>(null);
    const loadRequestRef = useRef(0);

    const saveTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    // All draft mutations are serialized through this promise chain.
    const saveQueueRef = useRef<Promise<boolean>>(Promise.resolve(true));

    const savingCountRef = useRef(0);
    const dirtyRef = useRef(false);

    const userId =
        authenticatedUserId?.trim() ||
        data.userId.trim();

    // -----------------------------------------------------
    // SET CURRENT STEP
    // -----------------------------------------------------

    const setCurrentStep = useCallback((step: number) => {
        if (!Number.isInteger(step) || step < 1 || step > 6) {
            return;
        }

        stepRef.current = step;
        dirtyRef.current = true;
        setCurrentStepState(step);
    }, []);

    // -----------------------------------------------------
    // MARK STEP COMPLETED
    // -----------------------------------------------------

    const markStepCompleted = useCallback((step: number) => {
        if (!Number.isInteger(step) || step < 1 || step > 6) {
            return;
        }

        const next = [
            ...new Set([...completedRef.current, step]),
        ].sort((a, b) => a - b);

        completedRef.current = next;
        dirtyRef.current = true;
        setCompletedSteps(next);
    }, []);

    // -----------------------------------------------------
    // UPDATE DATA
    // -----------------------------------------------------

    const updateData = useCallback(
        (values: Partial<SalonRegistrationData>) => {
            dirtyRef.current = true;

            // Update the ref synchronously so an immediate save
            // sees the latest values.
            const next = {
                ...dataRef.current,
                ...values,
            };

            dataRef.current = next;
            setData(next);
        },
        [],
    );

    // -----------------------------------------------------
    // SAVE DRAFT
    // -----------------------------------------------------

    const saveDraft = useCallback(
        (
            requestedStep?: number,
            requestedCompleted?: number[],
            latestData?: Partial<SalonRegistrationData>,
        ): Promise<boolean> => {
            const step = normalizeStep(
                requestedStep ?? stepRef.current,
            );

            const completed = parseCompletedSteps(
                requestedCompleted ?? completedRef.current,
            );

            const ownerId =
                authenticatedUserId?.trim() ||
                latestData?.userId?.trim() ||
                dataRef.current.userId.trim();

            if (!ownerId) {
                const message =
                    'Unable to save progress: user ID is missing.';

                setDraftError(message);
                return Promise.resolve(false);
            }

            // Capture the intended values at the time of this
            // request, rather than reading a later render.
            const snapshot: SalonRegistrationData = {
                ...dataRef.current,
                ...latestData,
                userId: ownerId,
            };

            const safeData = getSafeDraftData(snapshot);

            // Capture each request's values, then run requests in
            // order. A newer save cannot overlap an older mutation.
            const performSave = async (): Promise<boolean> => {
                savingCountRef.current += 1;
                setIsDraftSaving(true);
                setDraftError(null);

                try {
                    const result = await client.mutate<{
                        saveSalonRegistrationDraft:
                        SalonRegistrationDraftResponse;
                    }>({
                        mutation: SAVE_SALON_REGISTRATION_DRAFT,
                        variables: {
                            input: {
                                userId: ownerId,
                                currentStep: step,
                                completedSteps: completed,
                                draftData: JSON.stringify(safeData),
                            },
                        },
                    });

                    const response =
                        result.data?.saveSalonRegistrationDraft;

                    if (!response?.success) {
                        throw new Error(
                            response?.message ||
                            'Could not save registration progress.',
                        );
                    }

                    // Do not clear dirty state if a newer update
                    // happened while this request was in flight.
                    const snapshotStillCurrent =
                        dataRef.current === snapshot ||
                        (
                            JSON.stringify(
                                getSafeDraftData(dataRef.current),
                            ) === JSON.stringify(safeData) &&
                            stepRef.current === step &&
                            JSON.stringify(completedRef.current) ===
                            JSON.stringify(completed)
                        );

                    if (snapshotStillCurrent) {
                        dirtyRef.current = false;
                    }

                    return true;
                } catch (error) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : 'Could not save registration progress.';

                    setDraftError(message);

                    console.error(
                        'SALON DRAFT SAVE ERROR:',
                        message,
                    );

                    return false;
                } finally {
                    savingCountRef.current = Math.max(
                        0,
                        savingCountRef.current - 1,
                    );

                    setIsDraftSaving(
                        savingCountRef.current > 0,
                    );
                }
            };

            const queuedSave = saveQueueRef.current
                .catch(() => false)
                .then(performSave);

            saveQueueRef.current = queuedSave;

            return queuedSave;
        },
        [client, authenticatedUserId],
    );

    // -----------------------------------------------------
    // LOAD DRAFT
    // -----------------------------------------------------

    const loadDraft = useCallback(
        async (): Promise<DraftLoadResult> => {
            const ownerId =
                authenticatedUserId?.trim() ||
                dataRef.current.userId.trim();

            if (!ownerId) {
                return {
                    hasDraft: false,
                    currentStep: 1,
                    completedSteps: [],
                };
            }

            const requestId = ++loadRequestRef.current;

            setIsDraftLoading(true);
            setDraftError(null);

            try {
                const result = await client.query<{
                    getSalonRegistrationDraft:
                    SalonRegistrationDraftResponse;
                }>({
                    query: GET_SALON_REGISTRATION_DRAFT,
                    variables: { userId: ownerId },
                    fetchPolicy: 'network-only',
                });

                if (requestId !== loadRequestRef.current) {
                    return {
                        hasDraft: false,
                        currentStep: 1,
                        completedSteps: [],
                    };
                }

                const response =
                    result.data?.getSalonRegistrationDraft;

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                        'Unable to load registration progress.',
                    );
                }

                const draft = response.draft;

                if (!draft || draft.status === 'COMPLETED') {
                    const initial: SalonRegistrationData = {
                        ...createInitialData(),
                        userId: ownerId,
                        phoneNumber: dataRef.current.phoneNumber,
                    };

                    dataRef.current = initial;
                    setData(initial);

                    stepRef.current = 1;
                    setCurrentStepState(1);

                    completedRef.current = [];
                    setCompletedSteps([]);

                    dirtyRef.current = false;
                    hydratedUserRef.current = ownerId;

                    return {
                        hasDraft: false,
                        currentStep: 1,
                        completedSteps: [],
                    };
                }

                const savedData = parseDraftData(draft.draftData);
                const initial = createInitialData();

                const restoredData: SalonRegistrationData = {
                    ...initial,

                    salonName: savedData.salonName ?? '',
                    ownerName: savedData.ownerName ?? '',
                    email: savedData.email ?? '',

                    targetAudiences:
                        savedData.targetAudiences ?? [],

                    serviceMode:
                        savedData.serviceMode ??
                        initial.serviceMode,

                    serviceSpecificModes:
                        savedData.serviceSpecificModes ?? {},

                    addressLine: savedData.addressLine ?? '',
                    city: savedData.city ?? '',
                    state: savedData.state ?? '',
                    pincode: savedData.pincode ?? '',

                    latitude: savedData.latitude,
                    longitude: savedData.longitude,

                    businessHours:
                        savedData.businessHours ??
                        createDefaultBusinessHours(),

                    serviceSelections:
                        savedData.serviceSelections ?? [],
                    panNumber: savedData.panNumber ?? '',
                    aadhaarNumber: savedData.aadhaarNumber ?? '',
                    gstNumber: savedData.gstNumber ?? '',
                    shopEstablishmentNumber:
                        savedData.shopEstablishmentNumber ?? '',
                    udyamNumber: savedData.udyamNumber ?? '',
                    kycUploadId: savedData.kycUploadId ?? '',

                    panDocument: savedData.panDocument
                        ? { ...savedData.panDocument, uri: '' }
                        : null,

                    aadhaarDocument: savedData.aadhaarDocument
                        ? { ...savedData.aadhaarDocument, uri: '' }
                        : null,

                    shopEstablishmentDocument:
                        savedData.shopEstablishmentDocument
                            ? { ...savedData.shopEstablishmentDocument, uri: '' }
                            : null,

                    gstDocument: savedData.gstDocument
                        ? { ...savedData.gstDocument, uri: '' }
                        : null,

                    udyamDocument: savedData.udyamDocument
                        ? { ...savedData.udyamDocument, uri: '' }
                        : null,
                    userId: ownerId,
                    phoneNumber: dataRef.current.phoneNumber,

                    // Sensitive KYC values, bank details, and local
                    // document URIs are not restored from the draft.
                };

                const restoredStep = normalizeStep(
                    draft.currentStep,
                );

                const restoredCompleted = parseCompletedSteps(
                    draft.completedSteps,
                );

                dataRef.current = restoredData;
                setData(restoredData);

                stepRef.current = restoredStep;
                setCurrentStepState(restoredStep);

                completedRef.current = restoredCompleted;
                setCompletedSteps(restoredCompleted);

                dirtyRef.current = false;
                hydratedUserRef.current = ownerId;

                return {
                    hasDraft: true,
                    currentStep: restoredStep,
                    completedSteps: restoredCompleted,
                };
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Unable to load registration progress.';

                setDraftError(message);

                console.error(
                    'SALON DRAFT LOAD ERROR:',
                    message,
                );

                throw error;
            } finally {
                if (requestId === loadRequestRef.current) {
                    setIsDraftLoading(false);
                }
            }
        },
        [client, authenticatedUserId],
    );

    // -----------------------------------------------------
    // AUTO-LOAD FOR THE LOGGED-IN USER
    // -----------------------------------------------------

    useEffect(() => {
        if (!userId) {
            return;
        }

        if (hydratedUserRef.current === userId) {
            return;
        }

        void loadDraft().catch(() => {
            // The failure is exposed through draftError.
        });
    }, [userId, loadDraft]);

    // -----------------------------------------------------
    // DEBOUNCED AUTO-SAVE
    // -----------------------------------------------------

    useEffect(() => {
        if (!userId) {
            return;
        }

        if (hydratedUserRef.current !== userId) {
            return;
        }

        if (isDraftLoading || !dirtyRef.current) {
            return;
        }

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = setTimeout(() => {
            void saveDraft();
        }, 1000);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
        };
    }, [
        data,
        currentStep,
        completedSteps,
        userId,
        isDraftLoading,
        saveDraft,
    ]);

    // -----------------------------------------------------
    // RESET DRAFT STATE
    // -----------------------------------------------------

    const resetDraftState = useCallback(() => {
        loadRequestRef.current += 1;

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }

        hydratedUserRef.current = null;

        const initial = createInitialData();

        dataRef.current = initial;
        setData(initial);

        stepRef.current = 1;
        setCurrentStepState(1);

        completedRef.current = [];
        setCompletedSteps([]);

        dirtyRef.current = false;
        setDraftError(null);
        setIsDraftLoading(false);
    }, []);

    // -----------------------------------------------------
    // RESET
    // -----------------------------------------------------

    const reset = useCallback(() => {
        resetDraftState();
    }, [resetDraftState]);

    // -----------------------------------------------------
    // PROVIDER VALUE
    // -----------------------------------------------------

    return (
        <SalonRegistrationContext.Provider
            value={{
                data,
                updateData,
                reset,

                currentStep,
                completedSteps,

                isDraftLoading,
                isDraftSaving,
                draftError,

                setCurrentStep,
                markStepCompleted,

                saveDraft,
                loadDraft,
                resetDraftState,
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
    const context = useContext(SalonRegistrationContext);

    if (!context) {
        throw new Error(
            'useSalonRegistration must be used inside SalonRegistrationProvider',
        );
    }

    return context;
};
