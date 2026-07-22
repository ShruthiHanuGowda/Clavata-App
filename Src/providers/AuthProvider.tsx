// import React, {
//   createContext,
//   useState,
//   ReactNode,
//   useContext,
//   useEffect,
//   useCallback,
// } from 'react';
// import {useMutation} from '@apollo/client';
// import {CREATE_USER_WALLETS} from '../graphql/queries';
// import {UserAuth, NetworkCheckResult} from '../utils/type';
// import AuthenticationService, {
//   AuthSession,
//   LoginCredentials,
//   AuthError,
// } from '../services/authenticationService';
// // import {useMagic} from './MagicProvider';

// interface CreateUserWalletsResult {
//   createUserWalletAddress: {
//     emailAddress: string;
//     userWallet: string;
//     date: string;
//     applicantId: string;
//     accessToken: string;
//   };
// }

// export enum AuthState {
//   LOADING = 'loading',
//   AUTHENTICATED = 'authenticated',
//   UNAUTHENTICATED = 'unauthenticated',
//   ERROR = 'error',
// }

// interface AuthContextType {
//   // Authentication state
//   authState: AuthState;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   session: AuthSession | null;
//   error: AuthError | null;

//   // Authentication actions
//   login: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => Promise<void>;
//   refreshSession: () => Promise<void>;
//   checkAuthStatus: () => Promise<boolean>;
//   checkAllNetworksStatus: () => Promise<NetworkCheckResult>;

//   // User data management (legacy compatibility)
//   updateUserData: (
//     userData: UserAuth,
//     isExist: boolean,
//   ) => Promise<boolean | CreateUserWalletsResult>;
//   updateUserDetails: (partialUserData: Partial<UserAuth>) => void;
//   userDetails: UserAuth | null;

//   // Clear error
//   clearError: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({children}: {children: ReactNode}) => {
//   const [createUserWallets] = useMutation(CREATE_USER_WALLETS);
//   const magic = useMagic();

//   // Core authentication state
//   const [authState, setAuthState] = useState<AuthState>(AuthState.LOADING);
//   const [session, setSession] = useState<AuthSession | null>(null);
//   const [error, setError] = useState<AuthError | null>(null);

//   // Legacy user data state (for backward compatibility)
//   const [userDetails, setUserDetails] = useState<UserAuth | null>(null);

//   // Computed values
//   const isAuthenticated = authState === AuthState.AUTHENTICATED;
//   const isLoading = authState === AuthState.LOADING;

//   // Initialize AuthenticationService with Magic instance
//   useEffect(() => {
//     if (magic?.magic) {
//       AuthenticationService.setMagicInstance(magic.magic);
//     }
//   }, [magic]);

//   useEffect(() => {
//     initializeAuth();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const initializeAuth = useCallback(async () => {
//     try {
//       setAuthState(AuthState.LOADING);
//       setError(null);

//       const savedSession = await AuthenticationService.getSession();

//       if (savedSession && savedSession.isAuthenticated) {
//         // Verify session is still valid
//         const isStillAuthenticated =
//           await AuthenticationService.isAuthenticated();

//         if (isStillAuthenticated) {
//           setSession(savedSession);
//           setAuthState(AuthState.AUTHENTICATED);

//           // Sync user details with session
//           if (savedSession.userData) {
//             setUserDetails(savedSession.userData);
//           }
//         } else {
//           // Session expired, clear it
//           await AuthenticationService.clearSession();
//           setSession(null);
//           setAuthState(AuthState.UNAUTHENTICATED);
//         }
//       } else {
//         setAuthState(AuthState.UNAUTHENTICATED);
//       }
//     } catch (err: any) {
//       console.error('Failed to initialize auth:', err);
//       setError(
//         new AuthError('INIT_FAILED', 'Failed to initialize authentication'),
//       );
//       setAuthState(AuthState.ERROR);
//     }
//   }, []);

//   const login = useCallback(async (credentials: LoginCredentials) => {
//     try {
//       setAuthState(AuthState.LOADING);
//       setError(null);

//       const newSession = await AuthenticationService.login(credentials);

//       setSession(newSession);
//       setAuthState(AuthState.AUTHENTICATED);

//       // If we have user data in session, sync it
//       if (newSession.userData) {
//         setUserDetails(newSession.userData);
//       }
//     } catch (err: any) {
//       console.error('Login failed:', err);
//       const authError =
//         err instanceof AuthError
//           ? err
//           : new AuthError('LOGIN_FAILED', err.message || 'Login failed');
//       setError(authError);
//       setAuthState(AuthState.ERROR);
//       throw authError;
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       setAuthState(AuthState.LOADING);
//       setError(null);

//       await AuthenticationService.logout();

//       setSession(null);
//       setUserDetails(null);
//       setAuthState(AuthState.UNAUTHENTICATED);
//     } catch (err: any) {
//       console.error('Logout failed:', err);
//       const authError =
//         err instanceof AuthError
//           ? err
//           : new AuthError('LOGOUT_FAILED', err.message || 'Logout failed');
//       setError(authError);

//       // Even if logout fails, clear local state
//       setSession(null);
//       setUserDetails(null);
//       setAuthState(AuthState.UNAUTHENTICATED);

//       throw authError;
//     }
//   }, []);

//   const refreshSession = useCallback(async () => {
//     try {
//       const newToken = await AuthenticationService.refreshToken();

//       if (newToken && session) {
//         const updatedSession: AuthSession = {
//           ...session,
//           accessToken: newToken,
//           expiresAt: Date.now() + 24 * 60 * 60 * 1000,
//         };

//         setSession(updatedSession);
//       }
//     } catch (err: any) {
//       console.error('Session refresh failed:', err);
//       const authError =
//         err instanceof AuthError
//           ? err
//           : new AuthError(
//               'REFRESH_FAILED',
//               err.message || 'Session refresh failed',
//             );
//       setError(authError);

//       // If refresh fails, user needs to re-login
//       await logout();
//     }
//   }, [session, logout]);

//   const checkAuthStatus = useCallback(async (): Promise<boolean> => {
//     try {
//       const authenticated = await AuthenticationService.isAuthenticated();

//       if (!authenticated && isAuthenticated) {
//         // User is no longer authenticated, update state
//         setSession(null);
//         setUserDetails(null);
//         setAuthState(AuthState.UNAUTHENTICATED);
//       }

//       return authenticated;
//     } catch (err: any) {
//       console.error('Auth status check failed:', err);
//       return false;
//     }
//   }, [isAuthenticated]);

//   const checkAllNetworksStatus =
//     useCallback(async (): Promise<NetworkCheckResult> => {
//       try {
//         return await AuthenticationService.checkAllNetworksStatus();
//       } catch (err: any) {
//         console.error('Network status check failed:', err);
//         throw err instanceof AuthError
//           ? err
//           : new AuthError(
//               'NETWORK_CHECK_FAILED',
//               err.message || 'Network check failed',
//             );
//       }
//     }, []);

//   const clearError = useCallback(() => {
//     setError(null);
//     if (authState === AuthState.ERROR) {
//       setAuthState(AuthState.UNAUTHENTICATED);
//     }
//   }, [authState]);

//   // ============ LEGACY FUNCTIONS (for backward compatibility) ============

//   const handleSaveWalletToDB = async (
//     user: UserAuth,
//   ): Promise<CreateUserWalletsResult> => {
//     const walletData = {
//       emailAddress: user.emailAddress,
//       userWallet: user.userWallet,
//       date: user.date,
//       accessToken: '',
//       applicantId: '',
//     };

//     try {
//       const {data} = await createUserWallets({
//         variables: {
//           createuserwalletaddressinput: walletData,
//         },
//       });
//       return data as CreateUserWalletsResult;
//     } catch (err: unknown) {
//       throw new Error(err instanceof Error ? err.message : String(err));
//     }
//   };

//   const updateUserData = async (
//     userData: UserAuth,
//     isExist: boolean,
//   ): Promise<boolean | CreateUserWalletsResult> => {
//     try {
//       updateUserDetails(userData);

//       // Also update session if authenticated
//       if (session && isAuthenticated) {
//         const updatedSession: AuthSession = {
//           ...session,
//           userData,
//         };
//         setSession(updatedSession);
//         await AuthenticationService.saveSession(updatedSession);
//       }

//       if (!isExist) {
//         return await handleSaveWalletToDB(userData);
//       } else {
//         return true;
//       }
//     } catch (err) {
//       throw new Error(err instanceof Error ? err.message : String(err));
//     }
//   };

//   const updateUserDetails = (partialUserData: Partial<UserAuth>) => {
//     try {
//       setUserDetails(prevUserDetails => {
//         const newUserDetails = prevUserDetails
//           ? {...prevUserDetails, ...partialUserData}
//           : (partialUserData as UserAuth);

//         // Also update session if authenticated
//         if (session && isAuthenticated) {
//           const updatedSession: AuthSession = {
//             ...session,
//             userData: newUserDetails,
//           };
//           setSession(updatedSession);
//           // Save session asynchronously
//           AuthenticationService.saveSession(updatedSession).catch(
//             console.error,
//           );
//         }

//         return newUserDetails;
//       });
//     } catch (err) {
//       throw new Error(err instanceof Error ? err.message : String(err));
//     }
//   };

//   const contextValue: AuthContextType = {
//     // Authentication state
//     authState,
//     isAuthenticated,
//     isLoading,
//     session,
//     error,

//     // Authentication actions
//     login,
//     logout,
//     refreshSession,
//     checkAuthStatus,
//     checkAllNetworksStatus,

//     // Legacy functions (for backward compatibility)
//     updateUserData,
//     updateUserDetails,
//     userDetails,

//     // Error management
//     clearError,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
