import {ApolloClient, gql} from '@apollo/client';
export const GET_COMPANY_DETAILS = gql`
  query getKycUserDetails($applicantId: String!) {
    getKycUserDetails(applicantId: $applicantId) {
      response
    }
  }
`;
export const getKYCDetails = async (
  applicantId: string,
  client: ApolloClient<any>,
): Promise<any> => {
  // Validation checks
  if (!applicantId) {
    throw new Error('Applicant ID is required');
  }

  if (!client) {
    throw new Error('Apollo client is required');
  }

  try {
    const {data} = await client.query({
      query: GET_COMPANY_DETAILS, // This is your GraphQL query
      variables: {
        applicantId: applicantId,
      },
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    });

    return data?.getKycUserDetails?.response || [];
  } catch (error) {
    // Enhanced error handling
    console.error('❌ Failed to fetch KYC data:', error);
    throw error;
  }
};
