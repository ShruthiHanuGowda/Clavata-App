import {useMutation, gql} from '@apollo/client';
import {useAuth} from '../../../screens/Provider/authProvider';

// GraphQL mutation for updating KYC verification status

export const UPDATE_KYC_STATUS = gql`
  mutation updateIsVerified(
    $walletAddress: String!
    $is_verified: Boolean!
    $applicantId: String
    $accessToken: String
    $kycDetails: String
  ) {
    updateIsVerified(
      input: {
        walletAddress: $walletAddress
        is_verified: $is_verified
        applicantId: $applicantId
        accessToken: $accessToken
        kycDetails: $kycDetails
      }
    ) {
      walletAddress
      is_verified
      applicantId
      accessToken
      kycDetails
    }
  }
`;

interface UpdateKycStatusData {
  UpdateIsVerified: {
    walletAddress: string;
    is_verified: boolean;
  };
}

interface UpdateKycStatusVars {
  walletAddress: string;
  is_verified: boolean;
  applicantId: string;
  accessToken: string;
}

export const useKycStatusUpdate = () => {
  const {userDetails} = useAuth();
  //   console.log('🚀 ~ useKycStatusUpdate ~ userDetails:', userDetails);

  // Initialize the mutation hook
  const [updateKycStatus, {loading, error, data}] = useMutation<
    UpdateKycStatusData,
    UpdateKycStatusVars
  >(UPDATE_KYC_STATUS, {
    onCompleted: data => {
      console.log('KYC status updated successfully:', data);
    },
    onError: error => {
      console.error('Error updating KYC status:', error);
    },
  });

  // Function to call the mutation with the user's wallet address
  const updateUserKycStatus = async (
    isVerified: boolean = true,
    applicantId: string | null,
    accessToken: string | null,
  ): Promise<any> => {
    try {
      const userEmail = userDetails?.walletAddress;
      if (!userEmail) {
        throw new Error('No wallet address available');
      }

      const result = await updateKycStatus({
        variables: {
          walletAddress: userEmail.toLowerCase(),
          is_verified: isVerified,
          applicantId: applicantId || '',
          accessToken: accessToken || '',
        },
      });
      console.log('🚀 ~ useKycStatusUpdate ~ result:', result);

      return result;
    } catch (error) {
      console.error('Failed to update KYC status:', error);
      throw error;
    }
  };

  return {
    updateUserKycStatus,
    loading,
    error,
    data,
  };
};
