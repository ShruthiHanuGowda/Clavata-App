// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
//   useRef,
//   ReactNode,
// } from 'react';
// import secureStorage from '../utils/secureStorage';
// import {useMutation, gql, TypedDocumentNode} from '@apollo/client';
// import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
// // import {useAuth} from './AuthProvider';
// import {useApolloClientContext} from './GraphQLProvider';
// import {parseDataAndReturnFixedInfo} from '../Screens/AuthScreens/loginScreen';
// import {CREATE_KYC_VERIFICATION} from '../graphql/queries';

// export const KYC_STATUS = {
//   NOT_STARTED: 'not_started',
//   IN_PROGRESS: 'in_progress',
//   COMPLETED: 'completed',
//   SKIPPED: 'skipped',
//   FAILED: 'failed',
// } as const;

// export const KYC_RESULT = {
//   SUCCESS: 'success',
//   SKIP: 'skip',
//   ERROR: 'error',
//   CANCELLED: 'cancelled',
// } as const;

// export type KycStatusType = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];
// export type KycResultType = (typeof KYC_RESULT)[keyof typeof KYC_RESULT];

// const KYC_STARTED_KEY = 'kyc_started';

// interface SumSubResult {
//   status: string;
//   message?: string;
// }

// interface SumSubEvent {
//   newStatus: string;
//   message?: string;
// }

// interface SumSubLogEvent {
//   message: string;
// }

// interface CreateKycVerificationVariables {
//   email: string;
//   levelName: string;
// }

// interface CreateKycVerificationResponse {
//   createKYCVerification: {
//     response: string | any;
//   };
// }

// interface UpdateKycStatusVariables {
//   emailAddress: string;
//   is_verified: boolean;
//   applicantId?: string;
//   accessToken?: string;
//   kycDetails?: string;
// }

// interface UpdateKycStatusResponse {
//   updateIsVerified: {
//     emailAddress: string;
//     is_verified: boolean;
//     applicantId?: string;
//     accessToken?: string;
//     kycDetails?: string;
//   };
// }

// interface GetKycDetailsVariables {
//   applicantId: string;
// }

// interface GetKycDetailsResponse {
//   getKycUserSumsubDetails: {
//     response: any;
//   };
// }

// interface KycStatus {
//   status: KycStatusType;
//   isCompleted: boolean;
//   isInProgress: boolean;
//   isNotStarted: boolean;
//   isSkipped: boolean;
//   isFailed: boolean;
//   isProcessing: boolean;
//   error: string | null;
// }

// interface CheckKycOptions {
//   onSuccess?: (result?: any) => void;
//   onSkip?: () => void;
//   onError?: (error: any) => void;
//   onCancel?: () => void;
//   forceShow?: boolean;
//   showAlerts?: boolean;
// }

// interface VerificationResult {
//   result: KycResultType;
//   message: string;
//   data?: any;
//   error?: string;
// }

// interface PendingCallbacks {
//   onSuccess?: (result?: any) => void;
//   onSkip?: () => void;
//   onError?: (error: any) => void;
//   onCancel?: () => void;
// }

// export interface KycContextType {
//   kycStatus: KycStatus;
//   isKycBottomSheetVisible: boolean;
//   showKycBottomSheet: () => void;
//   hideKycBottomSheet: () => void;
//   checkKYC: (options?: CheckKycOptions) => Promise<VerificationResult>;
//   startKycVerification: () => Promise<VerificationResult>;
//   skipKycVerification: () => Promise<VerificationResult>;
//   isKycRequired: () => boolean;
//   resetKycState: () => Promise<void>;
//   KYC_STATUS: typeof KYC_STATUS;
//   KYC_RESULT: typeof KYC_RESULT;
// }

// interface KycProviderProps {
//   children: ReactNode;
// }

// const UPDATE_KYC_STATUS = gql`
//   mutation updateIsVerified(
//     $emailAddress: String!
//     $is_verified: Boolean!
//     $applicantId: String
//     $accessToken: String
//     $kycDetails: String
//   ) {
//     updateIsVerified(
//       input: {
//         emailAddress: $emailAddress
//         is_verified: $is_verified
//         applicantId: $applicantId
//         accessToken: $accessToken
//         kycDetails: $kycDetails
//       }
//     ) {
//       emailAddress
//       is_verified
//       applicantId
//       accessToken
//       kycDetails
//     }
//   }
// `;

// const GET_COMPANY_DETAILS = gql`
//   query getKycUserSumsubDetails($applicantId: String!) {
//     getKycUserSumsubDetails(applicantId: $applicantId) {
//       response
//     }
//   }
// `;

// const KycContext = createContext<KycContextType | null>(null);

// export const KycProvider: React.FC<KycProviderProps> = ({children}) => {
//   // const {userDetails, updateUserData} = useAuth();
//   const {client} = useApolloClientContext();

//   const [kycInternalStatus, setKycInternalStatus] = useState<KycStatusType>(
//     KYC_STATUS.NOT_STARTED,
//   );
//   const [isKycProcessing, setIsKycProcessing] = useState<boolean>(false);
//   const [kycError, setKycError] = useState<string | null>(null);
//   const [isKycBottomSheetVisible, setIsKycBottomSheetVisible] =
//     useState<boolean>(false);
//   const [_isKycStarted, setIsKycStarted] = useState<boolean>(false);

//   const pendingCallbacks = useRef<PendingCallbacks>({});

//   const [createKycVerification] = useMutation<
//     CreateKycVerificationResponse,
//     CreateKycVerificationVariables
//   >(CREATE_KYC_VERIFICATION);

//   const [updateKycStatusMutation] = useMutation<
//     UpdateKycStatusResponse,
//     UpdateKycStatusVariables
//   >(UPDATE_KYC_STATUS);

//   const getKYCDetails = useCallback(
//     async (applicantId: string): Promise<any> => {
//       if (!applicantId || !client) {
//         throw new Error('Applicant ID and Apollo client are required');
//       }

//       try {
//         const {data} = await client.query({
//           query: GET_COMPANY_DETAILS as TypedDocumentNode<
//             GetKycDetailsResponse,
//             GetKycDetailsVariables
//           >,
//           variables: {applicantId},
//           errorPolicy: 'all',
//           fetchPolicy: 'network-only',
//         });

//         return data?.getKycUserSumsubDetails?.response || [];
//       } catch (error) {
//         throw error;
//       }
//     },
//     [client],
//   );

//   const initializeKycStatus = useCallback((): void => {
//     if (userDetails) {
//       const isVerified =
//         userDetails?.is_verified === true ||
//         userDetails?.is_verified === 'true';

//       if (isVerified) {
//         setKycInternalStatus(KYC_STATUS.COMPLETED);
//       } else if (userDetails?.kycDetails) {
//         setKycInternalStatus(KYC_STATUS.IN_PROGRESS);
//       } else {
//         setKycInternalStatus(KYC_STATUS.NOT_STARTED);
//       }
//     }
//   }, [userDetails]);

//   useEffect(() => {
//     const loadKycStartedStatus = async (): Promise<void> => {
//       try {
//         const kycStartedValue = await secureStorage.getItem(KYC_STARTED_KEY);
//         if (kycStartedValue !== null) {
//           setIsKycStarted(JSON.parse(kycStartedValue));
//         }
//       } catch (error) {
//         // Silent fail for storage errors
//       }
//     };

//     loadKycStartedStatus();
//     initializeKycStatus();
//   }, [initializeKycStatus]);

//   useEffect(() => {
//     initializeKycStatus();
//   }, [userDetails, initializeKycStatus]);

//   const kycStatus: KycStatus = {
//     status: kycInternalStatus,
//     isCompleted: kycInternalStatus === KYC_STATUS.COMPLETED,
//     isInProgress: kycInternalStatus === KYC_STATUS.IN_PROGRESS,
//     isNotStarted: kycInternalStatus === KYC_STATUS.NOT_STARTED,
//     isSkipped: kycInternalStatus === KYC_STATUS.SKIPPED,
//     isFailed: kycInternalStatus === KYC_STATUS.FAILED,
//     isProcessing: isKycProcessing,
//     error: kycError,
//   };

//   const handleKYCToken = useCallback(async (): Promise<{
//     accessToken: string;
//     userId: string | null;
//   } | null> => {
//     const userEmail = userDetails?.emailAddress;

//     if (!userEmail) {
//       return null;
//     }

//     try {
//       const result = await createKycVerification({
//         variables: {
//           email: userEmail,
//           levelName: 'basic-kyc-level',
//         },
//       });

//       let responseData = result.data?.createKYCVerification?.response;

//       if (!responseData) {
//         return null;
//       }

//       let parsedData: any;
//       if (typeof responseData === 'string') {
//         parsedData = JSON.parse(responseData);
//       } else {
//         parsedData = responseData;
//       }

//       let bodyData: any;
//       if (typeof parsedData.body === 'string') {
//         bodyData = JSON.parse(parsedData.body);
//       } else {
//         bodyData = parsedData.body || parsedData;
//       }

//       const token = bodyData?.accessTokenData?.token || null;
//       const userId = bodyData?.applicantId || null;

//       if (token) {
//         return {accessToken: token, userId};
//       } else {
//         return null;
//       }
//     } catch (err) {
//       return null;
//     }
//   }, [userDetails, createKycVerification]);

//   const updateUserKycStatus = useCallback(
//     async (
//       isVerified: boolean = true,
//       applicantId: string | null,
//       accessToken: string | null,
//     ): Promise<any> => {
//       try {
//         const userEmail = userDetails?.emailAddress;
//         if (!userEmail) {
//           throw new Error('No email address available');
//         }

//         const res = await getKYCDetails(applicantId || '');
//         const kycDetails = res;

//         const result = await updateKycStatusMutation({
//           variables: {
//             emailAddress: userEmail.toLowerCase(),
//             is_verified: isVerified,
//             applicantId: applicantId || '',
//             accessToken: accessToken || '',
//             kycDetails: JSON.stringify(kycDetails),
//           },
//         });

//         const kycDetailsParsed = JSON.parse(JSON.stringify(kycDetails));
//         const extractedKycInfo = parseDataAndReturnFixedInfo(kycDetailsParsed);

//         if (extractedKycInfo) {
//           updateUserData(
//             {
//               ...userDetails,
//               kycDetails: extractedKycInfo,
//               is_verified: isVerified,
//               applicantId: applicantId || '',
//               accessToken: accessToken || '',
//             },
//             true,
//           );
//         }

//         return result;
//       } catch (error) {
//         throw error;
//       }
//     },
//     [userDetails, getKYCDetails, updateKycStatusMutation, updateUserData],
//   );

//   const handleVerificationCompleted = useCallback(
//     async (
//       applicantId: string | null,
//       accessToken: string | null,
//     ): Promise<void> => {
//       setTimeout(async () => {
//         try {
//           await updateUserKycStatus(true, applicantId, accessToken);
//           setKycInternalStatus(KYC_STATUS.COMPLETED);
//         } catch (error) {
//           setKycInternalStatus(KYC_STATUS.FAILED);
//         }
//       }, 2000);
//     },
//     [updateUserKycStatus],
//   );

//   const showKycBottomSheet = useCallback((): void => {
//     setIsKycBottomSheetVisible(true);
//   }, []);

//   const hideKycBottomSheet = useCallback((): void => {
//     setIsKycBottomSheetVisible(false);
//     setTimeout(() => {
//       pendingCallbacks.current = {};
//     }, 300);
//   }, []);

//   const startKycVerification =
//     useCallback(async (): Promise<VerificationResult> => {
//       if (isKycProcessing) {
//         return {result: KYC_RESULT.ERROR, message: 'KYC already in progress'};
//       }

//       try {
//         setIsKycProcessing(true);
//         setKycError(null);
//         setKycInternalStatus(KYC_STATUS.IN_PROGRESS);

//         await secureStorage.setItem(KYC_STARTED_KEY, JSON.stringify(true));
//         setIsKycStarted(true);

//         const tokenResult = await handleKYCToken();

//         if (!tokenResult) {
//           throw new Error('Could not obtain verification token');
//         }

//         const {accessToken, userId} = tokenResult;

//         let snsMobileSDK = SNSMobileSDK.init(accessToken, async () => {
//           const newToken = await handleKYCToken();
//           return newToken?.accessToken || '';
//         })
//           .withHandlers({
//             onStatusChanged: async (event: SumSubEvent) => {
//               if (
//                 event.newStatus.toLowerCase() === 'approved' ||
//                 event.newStatus.toLowerCase() === 'pending'
//               ) {
//                 // Handle status change
//               }
//               if (event.newStatus.toLowerCase() === 'approved') {
//                 handleVerificationCompleted(userId, accessToken);
//               }
//             },
//             onLog: (_event: SumSubLogEvent) => {
//               // Handle logging if needed
//             },
//           })
//           .withDebug(true)
//           .withLocale('en')
//           .build();

//         const result: SumSubResult = await snsMobileSDK.launch();

//         if (
//           result.status.toLowerCase() === 'approved' ||
//           result.status.toLowerCase() === 'pending'
//         ) {
//           setKycInternalStatus(KYC_STATUS.COMPLETED);
//           hideKycBottomSheet();

//           if (pendingCallbacks.current.onSuccess) {
//             pendingCallbacks.current.onSuccess(result);
//           }

//           return {
//             result: KYC_RESULT.SUCCESS,
//             message: 'Verification completed successfully!',
//             data: result,
//           };
//         } else if (result.status.toLowerCase() === 'cancelled') {
//           setKycInternalStatus(KYC_STATUS.NOT_STARTED);

//           if (pendingCallbacks.current.onCancel) {
//             pendingCallbacks.current.onCancel();
//           }

//           return {
//             result: KYC_RESULT.CANCELLED,
//             message: 'Verification was cancelled',
//           };
//         } else {
//           setKycInternalStatus(KYC_STATUS.FAILED);

//           if (pendingCallbacks.current.onError) {
//             pendingCallbacks.current.onError(result);
//           }

//           return {
//             result: KYC_RESULT.ERROR,
//             message: `Verification ended with status: ${result.status}`,
//           };
//         }
//       } catch (error: any) {
//         setKycError(error.message);
//         setKycInternalStatus(KYC_STATUS.FAILED);

//         if (pendingCallbacks.current.onError) {
//           pendingCallbacks.current.onError(error);
//         }

//         return {
//           result: KYC_RESULT.ERROR,
//           message: 'An error occurred during verification',
//           error: error.message,
//         };
//       } finally {
//         setIsKycProcessing(false);
//       }
//     }, [
//       isKycProcessing,
//       handleKYCToken,
//       handleVerificationCompleted,
//       hideKycBottomSheet,
//     ]);

//   const skipKycVerification =
//     useCallback(async (): Promise<VerificationResult> => {
//       try {
//         setKycInternalStatus(KYC_STATUS.SKIPPED);
//         hideKycBottomSheet();

//         if (pendingCallbacks.current.onSkip) {
//           pendingCallbacks.current.onSkip();
//         }

//         return {
//           result: KYC_RESULT.SKIP,
//           message: 'KYC verification skipped',
//         };
//       } catch (error: any) {
//         return {
//           result: KYC_RESULT.ERROR,
//           message: 'Error occurred while skipping KYC',
//           error: error.message,
//         };
//       }
//     }, [hideKycBottomSheet]);

//   const checkKYC = useCallback(
//     async (options: CheckKycOptions = {}): Promise<VerificationResult> => {
//       const {onSuccess, onSkip, onError, onCancel, forceShow = false} = options;

//       pendingCallbacks.current = {onSuccess, onSkip, onError, onCancel};

//       if (kycStatus.isCompleted && !forceShow) {
//         if (onSuccess) {
//           onSuccess();
//         }
//         return {result: KYC_RESULT.SUCCESS, message: 'KYC already completed'};
//       }

//       showKycBottomSheet();

//       return {result: KYC_RESULT.SUCCESS, message: 'KYC modal opened'};
//     },
//     [kycStatus.isCompleted, showKycBottomSheet],
//   );

//   const isKycRequired = useCallback((): boolean => {
//     return !kycStatus.isCompleted && !kycStatus.isSkipped;
//   }, [kycStatus.isCompleted, kycStatus.isSkipped]);

//   const resetKycState = useCallback(async (): Promise<void> => {
//     try {
//       await secureStorage.removeItem(KYC_STARTED_KEY);
//       setIsKycStarted(false);
//       setKycInternalStatus(KYC_STATUS.NOT_STARTED);
//       setKycError(null);
//       setIsKycProcessing(false);
//     } catch (error) {
//       // Silent fail for reset errors
//     }
//   }, []);

//   const contextValue: KycContextType = {
//     kycStatus,
//     isKycBottomSheetVisible,
//     showKycBottomSheet,
//     hideKycBottomSheet,
//     checkKYC,
//     startKycVerification,
//     skipKycVerification,
//     isKycRequired,
//     resetKycState,
//     KYC_STATUS,
//     KYC_RESULT,
//   };

//   return (
//     <KycContext.Provider value={contextValue}>
//       {children}
//     </KycContext.Provider>
//   );
// };

// export const useKyc = (): KycContextType => {
//   const context = useContext(KycContext);
//   if (!context) {
//     throw new Error('useKyc must be used within a KycProvider');
//   }
//   return context;
// };

// export const useKycCheck = () => {
//   const {checkKYC, kycStatus, isKycRequired} = useKyc();

//   return {
//     checkKYC,
//     kycStatus,
//     isKycRequired,
//     isKycCompleted: kycStatus.isCompleted,
//     isKycSkipped: kycStatus.isSkipped,
//     isKycProcessing: kycStatus.isProcessing,
//   };
// };
