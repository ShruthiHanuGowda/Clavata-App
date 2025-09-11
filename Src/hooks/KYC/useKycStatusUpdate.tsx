import {useMutation, gql} from '@apollo/client';
import {useAuth} from '../../../screens/Provider/authProvider';
import {getKYCDetails} from './KYCQuery';
import {ExtractedKycInfo} from '../../utils/type';
import {parseDataAndReturnFixedInfo} from '../../Screens/AuthScreens/loginScreen';
import {useApolloClientContext} from '../../../screens/Provider/GraphQLProvider'; // Added missing import

// GraphQL mutation for updating KYC verification status

export const UPDATE_KYC_STATUS = gql`
  mutation updateIsVerified(
    $emailAddress: String!
    $is_verified: Boolean!
    $applicantId: String
    $accessToken: String
    $kycDetails: String
  ) {
    updateIsVerified(
      input: {
        emailAddress: $emailAddress
        is_verified: $is_verified
        applicantId: $applicantId
        accessToken: $accessToken
        kycDetails: $kycDetails
      }
    ) {
      emailAddress
      is_verified
      applicantId
      accessToken
      kycDetails
    }
  }
`;

interface UpdateKycStatusData {
  UpdateIsVerified: {
    emailAddress: string;
    is_verified: boolean;
  };
}

interface UpdateKycStatusVars {
  emailAddress: string;
  is_verified: boolean;
  applicantId: string;
  accessToken: string;
  kycDetails: string;
}

export const useKycStatusUpdate = () => {
  const {userDetails, updateUserDetails} = useAuth();
  const {client} = useApolloClientContext(); // Get Apollo client from context

  // Initialize the mutation hook
  const [updateKycStatus, {loading, error, data}] = useMutation<
    UpdateKycStatusData,
    UpdateKycStatusVars
  >(UPDATE_KYC_STATUS, {
    onCompleted: () => {
      console.info('KYC status updated successfully:');
    },
    onError: mutationError => {
      console.error('Error updating KYC status:', mutationError);
    },
  });

  // Function to call the mutation with the user's wallet address
  const updateUserKycStatus = async (
    isVerified: boolean = true,
    applicantId: string | null,
    accessToken: string | null,
  ): Promise<any> => {
    try {
      const userEmail = userDetails?.emailAddress;
      if (!userEmail) {
        throw new Error('No wallet address available');
      }

      // Fixed: Pass the Apollo client to getKYCDetails
      const res = await getKYCDetails(applicantId || '', client);
      const kycDetails = res; // Fixed: Updated path to match query

      const result = await updateKycStatus({
        variables: {
          emailAddress: userEmail.toLowerCase(),
          is_verified: isVerified,
          applicantId: applicantId || '',
          accessToken: accessToken || '',
          kycDetails: JSON.stringify(kycDetails),
        },
      });

      const kycDetailsParsed = JSON.parse(JSON.stringify(kycDetails));
      const extractedKycInfo: ExtractedKycInfo | null =
        parseDataAndReturnFixedInfo(kycDetailsParsed);

      if (extractedKycInfo) {
        updateUserDetails({
          kycDetails: extractedKycInfo,
          is_verified: isVerified,
          applicantId: applicantId || '',
          accessToken: accessToken || '',
        });
      }

      return result;
    } catch (updateError) {
      console.error('Failed to update KYC status:', updateError);
      throw updateError;
    }
  };

  return {
    updateUserKycStatus,
    loading,
    error,
    data,
  };
};
