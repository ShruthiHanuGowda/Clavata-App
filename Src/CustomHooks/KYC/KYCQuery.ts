// import {ApolloClient, createHttpLink, gql, InMemoryCache} from '@apollo/client';
// import {KYC_API_KEY, KYC_API_URL} from '../../constants';

// export const GET_COMPANY_DETAILS = gql`
//   query GetCompanyDetails($applicantId: String!) {
//     getCompanyDetails(applicantId: $applicantId) {
//       response
//     }
//   }
// `;

// const httpLink = createHttpLink({
//   uri: KYC_API_URL,
//   includeExtensions: true,
// });

// const client = new ApolloClient({
//   link: httpLink,
//   cache: new InMemoryCache(),
//   headers: {
//     'x-api-key': KYC_API_KEY,
//   },
// });

// export const getKYCDetails = async (applicantId: string): Promise<any> => {
//   try {
//     console.log('applicantId', applicantId);

//     const {data} = await client.query({
//       query: GET_COMPANY_DETAILS,
//       variables: {applicantId},
//     });

//     return data || [];
//   } catch (error) {
//     console.error('Failed to fetch KYC data', error);
//     return [];
//   }
// };

import {ApolloClient, createHttpLink, gql, InMemoryCache} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {KYC_API_KEY, KYC_API_URL} from '../../constants';

export const GET_COMPANY_DETAILS = gql`
  query GetCompanyDetails($applicantId: String!) {
    getCompanyDetails(applicantId: $applicantId) {
      response
    }
  }
`;

// Solution 1: Fix headers configuration (most common issue)
const httpLink = createHttpLink({
  uri: KYC_API_URL,
  includeExtensions: true,
});

// Create auth link to set headers properly
const authLink = setContext((_, {headers}) => {
  // Check if API key exists
  if (!KYC_API_KEY) {
    console.error('❌ KYC_API_KEY is missing');
    throw new Error('KYC API key is not configured');
  }

  return {
    headers: {
      ...headers,
      'x-api-key': KYC_API_KEY,
      'Content-Type': 'application/json',
      // Try these alternative header names if 'x-api-key' doesn't work:
      // 'Authorization': `Bearer ${KYC_API_KEY}`,
      // 'API-Key': KYC_API_KEY,
      // 'X-API-KEY': KYC_API_KEY,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine auth and http links
  cache: new InMemoryCache(),
});

// Solution 2: Enhanced getKYCDetails with better error handling
export const getKYCDetails = async (applicantId: string): Promise<any> => {
  // Validation checks
  if (!applicantId) {
    throw new Error('Applicant ID is required');
  }

  if (!KYC_API_KEY) {
    throw new Error('KYC API key is not configured');
  }

  try {
    console.log('🔍 Fetching KYC details for applicantId:', applicantId);
    console.log('🔑 Using API URL:', KYC_API_URL);

    const {data} = await client.query({
      query: GET_COMPANY_DETAILS,
      variables: {applicantId},
      fetchPolicy: 'network-only', // Always fetch fresh data
      errorPolicy: 'all', // Return partial data even if there are errors
    });

    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch KYC data:', error);

    // Enhanced error handling for different scenarios
    if (error.networkError?.statusCode === 401) {
      console.error('🔐 Authentication failed - check your API key');
      throw new Error('Authentication failed: Invalid or expired API key');
    } else if (error.networkError?.statusCode === 403) {
      console.error('🚫 Access forbidden - insufficient permissions');
      throw new Error(
        'Access denied: Insufficient permissions for this resource',
      );
    } else if (error.networkError?.statusCode === 404) {
      console.error('🔍 Resource not found');
      throw new Error('Applicant not found');
    } else if (error.networkError) {
      console.error('🌐 Network error:', error.networkError);
      throw new Error(`Network error: ${error.networkError.message}`);
    }

    throw error;
  }
};
