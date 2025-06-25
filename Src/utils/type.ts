//REVIEW - AUTH USER TYPE

export interface Address {
  street: string;
  streetEn: string;
  state: string;
  stateEn: string;
  buildingNumber: string;
  town: string;
  townEn: string;
  postCode: string;
  country: string;
  formattedAddress: string;
}

export interface ExtractedKycInfo {
  firstName: string;
  firstNameEn: string;
  lastName: string;
  lastNameEn: string;
  country: string;
  nationality: string;
  addresses: Address[];
}

export interface UserWalletAddress {
  __typename?: string;
  kycDetails?: string | ExtractedKycInfo;
  is_verified?: boolean | string;
  date?: string;
  userWallet?: string;
  emailAddress?: string;
  accessToken?: string;
  applicantId?: string;
  [key: string]: any;
}

export interface UserAuth {
  date: string;
  is_verified: boolean | string;
  userWallet: string | null;
  emailAddress: string | null;
  kycDetails?: string | ExtractedKycInfo; // Can be JSON string or parsed object
  accessToken?: string;
  applicantId?: string;
  [key: string]: any; // For any additional properties
}

export interface UserData {
  getUserWalletAddress?: UserWalletAddress;
  [key: string]: any;
}

// Network check result types
export interface NetworkAuthResult {
  isLoggedIn: boolean;
  publicAddress: string | null;
  userData: any;
  error?: any;
}

export interface NetworkCheckResult {
  isLoggedIn: boolean;
  addresses: {
    primary?: string | null;
    sepolia?: string | null;
    denergy?: string | null;
  };
  networkData?: {
    primary: NetworkAuthResult;
    sepolia: NetworkAuthResult;
    denergy: NetworkAuthResult;
  };
  error?: any;
}
