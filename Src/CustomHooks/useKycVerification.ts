import {useMutation, gql} from '@apollo/client';
import {CREATE_KYC_VERIFICATION} from '../graphql/queries';

// Define types for the mutation
interface CreateKycVerificationVariables {
  email: string;
  levelName: string;
}

interface CreateKycVerificationResponse {
  createKYCVerification: {
    response: string | any;
  };
}

interface KycTokenData {
  token: string | null;
  userId: string | null;
  expiryTime: number | null;
}

// Custom hook for KYC verification
export const useKycVerification = () => {
  const [createKycVerification, {data, loading, error}] = useMutation<
    CreateKycVerificationResponse,
    CreateKycVerificationVariables
  >(CREATE_KYC_VERIFICATION);

  // Function to initiate KYC verification and parse the token
  const initiateKycToken = async (
    email: string,
    levelName: string,
  ): Promise<KycTokenData> => {
    try {
      const result = await createKycVerification({
        variables: {
          email,
          levelName,
        },
      });

      let responseData = result.data?.createKYCVerification?.response;
      if (!responseData) {
        return {token: null, userId: null, expiryTime: null};
      }

      // Parse the response data
      let parsedData;
      if (typeof responseData === 'string') {
        try {
          parsedData = JSON.parse(responseData);
        } catch (parseError) {
          console.error('Error parsing response string:', parseError);
          return {token: null, userId: null, expiryTime: null};
        }
      } else {
        parsedData = responseData;
      }

      // Parse body if needed
      let bodyData;
      if (typeof parsedData.body === 'string') {
        try {
          bodyData = JSON.parse(parsedData.body);
        } catch (bodyParseError) {
          console.error('Error parsing body string:', bodyParseError);
          return {token: null, userId: null, expiryTime: null};
        }
      } else {
        bodyData = parsedData.body || parsedData;
      }
      console.log('🚀 ~ useKycVerification ~ parsedData:', parsedData);

      console.log(
        '🚀 ~ useKycVerification ~ bodyData:',
        JSON.stringify(bodyData),
      );
      // Extract token data
      const token = bodyData?.accessTokenData?.token || null;
      const userId = bodyData?.accessTokenData?.userId || null;
      const expiryTime = bodyData?.accessTokenData?.expiryTime || null;

      return {
        token,
        userId,
        expiryTime,
      };
    } catch (err) {
      console.error('KYC verification failed:', err);
      return {token: null, userId: null, expiryTime: null};
    }
  };

  // Extract raw token from response data for consumers that don't want to call initiateKycToken
  const extractTokenFromResponse = (responseData: any): KycTokenData => {
    if (!responseData) {
      return {token: null, userId: null, expiryTime: null};
    }

    try {
      // Handle string or object
      const parsedData =
        typeof responseData === 'string'
          ? JSON.parse(responseData)
          : responseData;
      console.log(
        '🚀 ~ extractTokenFromResponse ~ parsedData:',
        JSON.stringify(parsedData),
      );

      // Handle body as string or object
      const bodyData =
        typeof parsedData.body === 'string'
          ? JSON.parse(parsedData.body)
          : parsedData.body || parsedData;

      return {
        token: bodyData?.accessTokenData?.token || null,
        userId: bodyData?.accessTokenData?.userId || null,
        expiryTime: bodyData?.accessTokenData?.expiryTime || null,
      };
    } catch (err) {
      console.error('Error extracting token:', err);
      return {token: null, userId: null, expiryTime: null};
    }
  };

  return {
    initiateKycToken,
    extractTokenFromResponse,
    rawResponse: data?.createKYCVerification?.response,
    KYCTokenLoading: loading,
    KYCTokenError: error,
  };
};
