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
    user: User | null,
  ) => void;

  clearCurrentUser: () => void;
};


// ============================================================
// CONTEXT
// ============================================================

const UserContext =
  createContext<UserContextType | null>(
    null,
  );


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
  // SET CURRENT USER
  // ==========================================================

  const setCurrentUser = useCallback(
    (
      user: User | null,
    ) => {

      console.log(
        '====================================================',
      );

      console.log(
        '[UserContext] SET CURRENT USER',
      );

      if (!user) {

        console.log(
          '[UserContext] Clearing current user.',
        );

        setCurrentUserState(null);

        console.log(
          '====================================================',
        );

        return;
      }


      console.log(
        '[UserContext] User ID:',
        user.userId,
      );

      console.log(
        '[UserContext] Phone:',
        user.phoneNumber,
      );

      console.log(
        '[UserContext] Full Name:',
        user.fullName,
      );

      console.log(
        '[UserContext] Role:',
        user.role,
      );

      console.log(
        '[UserContext] Provider Status:',
        user.providerStatus,
      );

      console.log(
        '[UserContext] Salon ID:',
        user.salonId,
      );

      console.log(
        '[UserContext] Salon Name:',
        user.salonName,
      );

      console.log(
        '[UserContext] Complete User:',
        JSON.stringify(
          user,
          null,
          2,
        ),
      );

      console.log(
        '====================================================',
      );


      // --------------------------------------------------------
      // BASIC VALIDATION
      // --------------------------------------------------------

      if (!user.userId) {

        console.error(
          '[UserContext] Cannot store user without userId.',
        );

        return;
      }


      if (!user.phoneNumber) {

        console.error(
          '[UserContext] Cannot store user without phoneNumber.',
        );

        return;
      }


      if (
        user.role !== 'CUSTOMER' &&
        user.role !== 'PROVIDER'
      ) {

        console.error(
          '[UserContext] Invalid user role:',
          user.role,
        );

        return;
      }


      // --------------------------------------------------------
      // NORMALIZE PROVIDER STATUS
      // --------------------------------------------------------

      let normalizedProviderStatus:
        ProviderStatus | null = null;


      if (
        user.role === 'PROVIDER'
      ) {

        const status =
          String(
            user.providerStatus ||
              'NOT_REGISTERED',
          )
            .trim()
            .toUpperCase();


        if (
          status ===
            'NOT_REGISTERED' ||
          status ===
            'PENDING' ||
          status ===
            'APPROVED' ||
          status ===
            'REJECTED'
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

      } else {

        // Customers do not have provider status.
        normalizedProviderStatus =
          null;
      }


      // --------------------------------------------------------
      // STORE NORMALIZED USER
      // --------------------------------------------------------

      const normalizedUser:
        User = {

        userId:
          user.userId,

        phoneNumber:
          user.phoneNumber,

        fullName:
          user.fullName,

        role:
          user.role,

        providerStatus:
          normalizedProviderStatus,

        salonId:
          user.salonId ??
          null,

        salonName:
          user.salonName ??
          null,

        profileImageUrl:
          user.profileImageUrl ??
          null,

        createdAt:
          user.createdAt,

        updatedAt:
          user.updatedAt,

        preferredPaymentMethod:
          user.preferredPaymentMethod ??
          null,
      };


      setCurrentUserState(
        normalizedUser,
      );

    },
    [],
  );


  // ==========================================================
  // CLEAR CURRENT USER
  // ==========================================================

  const clearCurrentUser =
    useCallback(
      () => {

        console.log(
          '====================================================',
        );

        console.log(
          '[UserContext] CLEAR CURRENT USER',
        );

        console.log(
          '====================================================',
        );

        setCurrentUserState(null);

      },
      [],
    );


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

  const context =
    useContext(
      UserContext,
    );


  if (!context) {

    throw new Error(
      'useUser must be used inside UserProvider',
    );

  }


  return context;
};