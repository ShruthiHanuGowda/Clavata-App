import {useState} from 'react';
import axios from 'axios';

interface Validator {
  validatorId: string;
  validatorName: string;
  description: string;
  publicKey: string;
  commissionRate: number;
  totalStakeAmount: number;
  totalStakedNFT: number;
  totalStakedWatt: number;
  validatorAge: number;
  status: string;
  uptime: number;
  slashes: number;
  missedBlocks: number;
  powerConsumption: number;
}

interface ValidatorsResponse {
  validators: Validator[];
  // Add other response properties as needed
}

interface Delegator {
  delegatorAddress: string;
  stakedAmount: number;
  stakedNFT: number;
  stakedWatt: number;
  rewardsEarned: number;
}

interface ValidatorResponse {
  validator: {
    validatorId: string;
    validatorName: string;
    description: string;
    publicKey: string;
    commissionRate: number;
    totalStakeAmount: number;
    totalStakedNFT: number;
    totalStakedWatt: number;
    validatorAge: number;
    status: string;
    uptime: number;
    slashes: number;
    missedBlocks: number;
    powerConsumption: number;
  };
  delegators: Delegator[];
}

/**
 * Custom hook to fetch validators data
 */
const useValidators = () => {
  // Define axios config - won't change between renders
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // State for validator list
  const [validatorListData, setValidatorListData] =
    useState<ValidatorsResponse | null>(null);
  const [validatorListLoading, setValidatorListLoading] =
    useState<boolean>(false);
  const [validatorListError, setValidatorListError] = useState<Error | null>(
    null,
  );

  // State for single validator
  const [singleValidator, setSingleValidator] =
    useState<ValidatorResponse | null>(null);
  const [singleValidatorLoading, setSingleValidatorLoading] =
    useState<boolean>(false);
  const [singleValidatorError, setSingleValidatorError] =
    useState<Error | null>(null);

  // Function to fetch validator list
  const fetchValidatorList = async (url: string) => {
    setValidatorListLoading(true);
    setValidatorListError(null);

    try {
      const response = await axios.get<ValidatorsResponse>(url, axiosConfig);
      setValidatorListData(response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error
          : new Error('Unknown error occurred fetching validator list');
      setValidatorListError(errorMessage);
      throw errorMessage;
    } finally {
      setValidatorListLoading(false);
    }
  };

  // Function to fetch a specific validator by ID
  const getValidatorById = async (url: string) => {
    setSingleValidatorLoading(true);
    setSingleValidatorError(null);

    try {
      const response = await axios.get<ValidatorResponse>(url, axiosConfig);
      console.log('🚀 ~ getValidatorById ~ response:', response);
      setSingleValidator(response.data);
      return response.data;
    } catch (error) {
      console.log('🚀 ~ getValidatorById ~ error:', error);
      const errorMessage =
        error instanceof Error
          ? error
          : new Error('Unknown error occurred fetching validator details');
      setSingleValidatorError(errorMessage);
      throw errorMessage;
    } finally {
      setSingleValidatorLoading(false);
    }
  };

  return {
    // Validators list
    validatorList: {
      data: validatorListData,
      loading: validatorListLoading,
      error: validatorListError,
      fetch: fetchValidatorList,
    },

    // Single validator
    singleValidator: {
      data: singleValidator,
      loading: singleValidatorLoading,
      error: singleValidatorError,
      fetch: getValidatorById,
    },
  };
};

export default useValidators;
