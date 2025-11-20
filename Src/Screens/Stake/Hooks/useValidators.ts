import {useState} from 'react';
import axios from 'axios';
import {getStakedPoolData} from './stakedGraphql';
import {NftDelegation} from '../../../types/types';

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
}

// Cosmos SDK API response interfaces
interface CosmosValidator {
  operator_address: string;
  consensus_pubkey: {
    '@type': string;
    key: string;
  };
  jailed: boolean;
  status: string;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    commission_rates: {
      rate: string;
      max_rate: string;
      max_change_rate: string;
    };
    update_time: string;
  };
  min_self_delegation: string;
  total_nft_delegation?: string;
  country?: string;
}

interface CosmosValidatorsResponse {
  validators: CosmosValidator[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

// Helper function to map Cosmos SDK status to app status
const mapValidatorStatus = (status: string): string => {
  switch (status) {
    case 'BOND_STATUS_BONDED':
    case 'ACTIVE':
      return 'ACTIVE';
    case 'BOND_STATUS_UNBONDING':
      return 'UNBONDING';
    case 'BOND_STATUS_UNBONDED':
    case 'BOND_STATUS_UNSPECIFIED':
    case 'INACTIVE':
    default:
      return 'INACTIVE';
  }
};

// Helper function to transform Cosmos SDK validator to app format
const transformCosmosValidator = (cosmosValidator: CosmosValidator): Validator => {
  // Convert tokens from wei string to number (18 decimals)
  let totalStake = 0;
  if (cosmosValidator.tokens) {
    // Handle decimal strings by removing the decimal part before BigInt conversion
    const tokensStr = cosmosValidator.tokens.split('.')[0];
    try {
      const tokensInWei = BigInt(tokensStr);
      totalStake = Number(tokensInWei / BigInt(10 ** 18));
    } catch {
      totalStake = 0;
    }
  }

  // Convert commission rate from decimal string to percentage
  let commissionRate = 0;
  if (cosmosValidator.commission?.commission_rates?.rate) {
    commissionRate = parseFloat(cosmosValidator.commission.commission_rates.rate) * 100;
  }

  // Calculate validator age from commission update time
  let ageInDays = 0;
  if (cosmosValidator.commission?.update_time) {
    const updateTime = new Date(cosmosValidator.commission.update_time);
    const now = new Date();
    ageInDays = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Convert NFT delegation
  const totalNftDelegation = Number(cosmosValidator.total_nft_delegation || '0');

  return {
    validatorId: cosmosValidator.operator_address || '',
    validatorName: cosmosValidator.description?.moniker || 'Unknown',
    description: cosmosValidator.description?.details || '',
    publicKey: cosmosValidator.consensus_pubkey?.key || '',
    commissionRate: commissionRate,
    totalStakeAmount: totalStake,
    totalStakedNFT: totalNftDelegation,
    totalStakedWatt: totalStake,
    validatorAge: ageInDays,
    status: mapValidatorStatus(cosmosValidator.status),
    uptime: 100,
    slashes: 0,
    missedBlocks: 0,
    powerConsumption: 0,
  };
};

// Transform Cosmos SDK response to app format
const transformCosmosResponse = (cosmosResponse: CosmosValidatorsResponse): ValidatorsResponse => {
  return {
    validators: cosmosResponse.validators.map(transformCosmosValidator),
  };
};

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

interface StakedPoolParams {
  delegatorAddress: string;
  first?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  skip?: number;
}

/**
 * Custom hook to fetch validators data and staked pool data
 */
const useValidators = () => {
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

  // State for staked pool data
  const [stakedPoolData, setStakedPoolData] = useState<NftDelegation[]>([]);
  const [stakedPoolLoading, setStakedPoolLoading] = useState<boolean>(false);
  const [stakedPoolError, setStakedPoolError] = useState<Error | null>(null);

  // Function to fetch validator list
  const fetchValidatorList = async (url: string) => {
    setValidatorListLoading(true);
    setValidatorListError(null);

    try {
      const response = await axios.get<CosmosValidatorsResponse>(url, axiosConfig);
      console.log('Raw API response:', JSON.stringify(response.data, null, 2));
      // Transform Cosmos SDK response to app format
      const transformedData = transformCosmosResponse(response.data);
      console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
      setValidatorListData(transformedData);
      return transformedData;
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
      // Cosmos SDK returns a single validator response
      const response = await axios.get<{validator: CosmosValidator}>(url, axiosConfig);

      // Transform the Cosmos SDK validator to app format
      const transformedValidator = transformCosmosValidator(response.data.validator);

      // Create the response in the expected format
      const validatorResponse: ValidatorResponse = {
        validator: transformedValidator,
        delegators: [], // Delegators need to be fetched separately
      };

      setSingleValidator(validatorResponse);
      return validatorResponse;
    } catch (error) {
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

  // Function to fetch staked pool data
  const fetchStakedPoolData = async (params: StakedPoolParams) => {
    setStakedPoolLoading(true);
    setStakedPoolError(null);

    try {
      const {
        delegatorAddress,
        first = 10,
        orderBy = 'id',
        orderDirection = 'desc',
        skip = 0,
      } = params;

      const data = await getStakedPoolData(
        delegatorAddress,
        first,
        orderBy,
        orderDirection,
        skip,
      );

      setStakedPoolData(data);
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error
          : new Error('Unknown error occurred fetching staked pool data');
      setStakedPoolError(errorMessage);
      throw errorMessage;
    } finally {
      setStakedPoolLoading(false);
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

    // Staked pool data
    stakedPool: {
      data: stakedPoolData,
      loading: stakedPoolLoading,
      error: stakedPoolError,
      fetch: fetchStakedPoolData,
    },
  };
};

export default useValidators;
