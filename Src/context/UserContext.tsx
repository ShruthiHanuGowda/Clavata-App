import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

// ============================================================
// TYPES
// ============================================================

export type UserRole =
  | 'CUSTOMER'
  | 'PROVIDER';

export type ProviderStatus =
  | 'NOT_REGISTERED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export type PreferredPaymentMethod =
  | string
  | null;

export type User = {
  userId: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;

  providerStatus?: ProviderStatus | null;
  salonId?: string | null;
  salonName?: string | null;
  profileImageUrl?: string | null;

  createdAt?: string;
  updatedAt?: string;

  preferredPaymentMethod?: PreferredPaymentMethod;
};

// ============================================================
// CONTEXT TYPE
// ============================================================

type UserContextType = {
  currentUser: User | null;

  setCurrentUser: (
    user: User | null |
      ((previousUser: User | null) => User | null),
  ) => void;

  clearCurrentUser: () => void;
};

// ============================================================
// CONTEXT
// ============================================================

const UserContext =
  createContext<UserContextType | null>(null);

// ============================================================
// PROVIDER
// ============================================================

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [
    currentUser,
    setCurrentUserState,
  ] = useState<User | null>(null);

  // ==========================================================
  // NORMALIZE USER
  // ==========================================================

  const normalizeUser = useCallback(
    (user: User | null): User | null => {
      if (!user) {
        console.log(
          '[UserContext] Clearing current user.',
        );

        return null;
      }

      if (!user.userId) {
        console.error(
          '[UserContext] Cannot store user without userId.',
        );

        return null;
      }

      if (!user.phoneNumber) {
        console.error(
          '[UserContext] Cannot store user without phoneNumber.',
        );

        return null;
      }

      if (
        user.role !== 'CUSTOMER' &&
        user.role !== 'PROVIDER'
      ) {
        console.error(
          '[UserContext] Invalid user role:',
          user.role,
        );

        return null;
      }

      let normalizedProviderStatus:
        ProviderStatus | null = null;

      if (user.role === 'PROVIDER') {
        const status = String(
          user.providerStatus || 'NOT_REGISTERED',
        )
          .trim()
          .toUpperCase();

        if (
          status === 'NOT_REGISTERED' ||
          status === 'PENDING' ||
          status === 'APPROVED' ||
          status === 'REJECTED'
        ) {
          normalizedProviderStatus =
            status as ProviderStatus;
        } else {
          console.warn(
            '[UserContext] Unknown provider status:',
            status,
          );

          normalizedProviderStatus =
            'NOT_REGISTERED';
        }
      }

      const normalizedUser: User = {
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,

        providerStatus:
          user.role === 'PROVIDER'
            ? normalizedProviderStatus
            : null,

        salonId: user.salonId ?? null,
        salonName: user.salonName ?? null,
        profileImageUrl:
          user.profileImageUrl ?? null,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        preferredPaymentMethod:
          user.preferredPaymentMethod ?? null,
      };

      console.log(
        '[UserContext] Normalized user:',
        JSON.stringify(normalizedUser, null, 2),
      );

      return normalizedUser;
    },
    [],
  );

  // ==========================================================
  // SET CURRENT USER
  // ==========================================================

  const setCurrentUser = useCallback(
    (
      userOrUpdater:
        | User
        | null
        | ((
            previousUser: User | null,
          ) => User | null),
    ) => {
      console.log(
        '[UserContext] SET CURRENT USER',
      );

      setCurrentUserState(previousUser => {
        const nextUser =
          typeof userOrUpdater === 'function'
            ? userOrUpdater(previousUser)
            : userOrUpdater;

        return normalizeUser(nextUser);
      });
    },
    [normalizeUser],
  );

  // ==========================================================
  // CLEAR CURRENT USER
  // ==========================================================

  const clearCurrentUser = useCallback(() => {
    console.log(
      '[UserContext] CLEAR CURRENT USER',
    );

    setCurrentUserState(null);
  }, []);

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        clearCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      'useUser must be used inside UserProvider',
    );
  }

  return context;
};

