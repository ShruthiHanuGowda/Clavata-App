import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserAuth, NetworkCheckResult, NetworkAuthResult} from '../utils/type';
import {Magic} from '@magic-sdk/react-native-bare';

export interface AuthSession {
  isAuthenticated: boolean;
  userEmail: string | null;
  publicAddress: string | null;
  userData: UserAuth | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface LoginCredentials {
  email: string;
}

export class AuthError extends Error {
  public code: string;
  public details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Authentication Service
 * Handles user authentication, session management, and Magic SDK integration
 * Uses AsyncStorage for reliable session persistence
 */
class AuthenticationService {
  private static instance: AuthenticationService;
  private magic: Magic | null = null;
  private sessionKey = 'auth_session';

  private constructor() {}

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  public setMagicInstance(magic: Magic): void {
    this.magic = magic;
  }

  // ============ SESSION MANAGEMENT ============

  public async saveSession(session: AuthSession): Promise<void> {
    try {
      await AsyncStorage.setItem(this.sessionKey, JSON.stringify(session));
      console.log('✅ Session saved to AsyncStorage');
    } catch (error: any) {
      console.error('❌ Failed to save session:', error);
      throw new AuthError(
        'SESSION_SAVE_FAILED',
        'Failed to save authentication session',
        error,
      );
    }
  }

  public async getSession(): Promise<AuthSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.sessionKey);
      if (!sessionData) {
        console.log('📄 No session data found');
        return null;
      }

      const session: AuthSession = JSON.parse(sessionData);

      // Check if session is expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        console.log('⏰ Session expired, clearing it');
        await this.clearSession();
        return null;
      }

      console.log('✅ Session retrieved successfully');
      return session;
    } catch (error: any) {
      console.error('❌ Failed to retrieve session:', error);
      return null;
    }
  }

  public async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.sessionKey);
      console.log('🗑️ Session cleared');
    } catch (error: any) {
      console.error('❌ Failed to clear session:', error);
    }
  }

  // ============ AUTHENTICATION OPERATIONS ============

  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (!this.magic) {
      throw new AuthError('MAGIC_NOT_INITIALIZED', 'Magic SDK not initialized');
    }

    try {
      console.log('🔐 Starting login process...');

      // Perform Magic authentication
      await this.magic.auth.loginWithEmailOTP({email: credentials.email});

      // Check if user is logged in
      const isLoggedIn = await this.magic.user.isLoggedIn();
      if (!isLoggedIn) {
        throw new AuthError('LOGIN_FAILED', 'Authentication failed');
      }

      // Get user info and token
      const userInfo = await this.magic.user.getInfo();
      const idToken = await this.magic.user.getIdToken({lifespan: 86400}); // 24 hours

      // Create session
      const session: AuthSession = {
        isAuthenticated: true,
        userEmail: credentials.email,
        publicAddress: userInfo?.publicAddress || null,
        userData: null, // Will be populated by AuthProvider
        accessToken: idToken,
        refreshToken: null, // Magic handles refresh internally
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      };

      // Save session
      await this.saveSession(session);

      console.log('✅ Login successful');
      return session;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new AuthError(
        'LOGIN_FAILED',
        error.message || 'Authentication failed',
        error,
      );
    }
  }

  public async logout(): Promise<void> {
    if (!this.magic) {
      throw new AuthError('MAGIC_NOT_INITIALIZED', 'Magic SDK not initialized');
    }

    try {
      console.log('🚪 Starting logout process...');

      // Logout from Magic
      await this.magic.user.logout();

      // Clear local session
      await this.clearSession();

      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      // Clear local session even if Magic logout fails
      await this.clearSession();
      throw new AuthError(
        'LOGOUT_FAILED',
        error.message || 'Logout failed',
        error,
      );
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      if (!session?.isAuthenticated) {return false;}

      // Double-check with Magic SDK
      if (this.magic) {
        const magicLoggedIn = await this.magic.user.isLoggedIn();
        if (!magicLoggedIn) {
          await this.clearSession();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  public async checkAllNetworksStatus(): Promise<NetworkCheckResult> {
    if (!this.magic) {
      throw new AuthError('MAGIC_NOT_INITIALIZED', 'Magic SDK not initialized');
    }

    try {
      const isLoggedIn = await this.magic.user.isLoggedIn();

      if (!isLoggedIn) {
        return {isLoggedIn: false, addresses: {}};
      }

      const userInfo = await this.magic.user.getInfo();
      const publicAddress = userInfo?.publicAddress || null;

      // For simplicity, using same address for all networks
      const addresses = {
        primary: publicAddress,
        sepolia: publicAddress,
        denergy: publicAddress,
      };

      const networkAuthResult: NetworkAuthResult = {
        isLoggedIn,
        publicAddress,
        userData: userInfo,
      };

      return {
        isLoggedIn: true,
        addresses,
        networkData: {
          primary: networkAuthResult,
          sepolia: networkAuthResult,
          denergy: networkAuthResult,
        },
      };
    } catch (error: any) {
      console.error('❌ Network check failed:', error);
      return {isLoggedIn: false, addresses: {}, error};
    }
  }

  public async refreshToken(): Promise<string | null> {
    if (!this.magic) {
      throw new AuthError('MAGIC_NOT_INITIALIZED', 'Magic SDK not initialized');
    }

    try {
      const isLoggedIn = await this.magic.user.isLoggedIn();
      if (!isLoggedIn) {
        await this.clearSession();
        return null;
      }

      const idToken = await this.magic.user.getIdToken({lifespan: 86400});

      // Update session with new token
      const currentSession = await this.getSession();
      if (currentSession) {
        const updatedSession: AuthSession = {
          ...currentSession,
          accessToken: idToken,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };
        await this.saveSession(updatedSession);
      }

      return idToken;
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      throw new AuthError(
        'TOKEN_REFRESH_FAILED',
        error.message || 'Token refresh failed',
        error,
      );
    }
  }

  public async getUserInfo(): Promise<any> {
    if (!this.magic) {
      throw new AuthError('MAGIC_NOT_INITIALIZED', 'Magic SDK not initialized');
    }

    try {
      const isLoggedIn = await this.magic.user.isLoggedIn();
      if (!isLoggedIn) {return null;}

      return await this.magic.user.getInfo();
    } catch (error: any) {
      console.error('❌ Failed to get user info:', error);
      throw new AuthError(
        'USER_INFO_FAILED',
        error.message || 'Failed to get user info',
        error,
      );
    }
  }
}

export default AuthenticationService.getInstance();
